const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { protect } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const InventoryItem = require('../models/Inventory');
const UserPreferences = require('../models/UserPreferences');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// @route   POST /api/meals/recommendations
// @desc    Get meal recommendations based on inventory and preferences
// @access  Private
// Rate limit: 3 requests per minute to reduce API costs
router.post('/recommendations', protect, rateLimiter({ windowMs: 60 * 1000, maxRequests: 3 }), async (req, res) => {
  try {
    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        message: 'AI service not configured. Please add ANTHROPIC_API_KEY to .env file'
      });
    }

    // Get user's inventory
    const inventory = await InventoryItem.find({ user: req.user._id });

    if (inventory.length === 0) {
      return res.status(400).json({
        message: 'No items in inventory. Please add items first.'
      });
    }

    // Get user preferences (from database or request body override)
    let preferences = await UserPreferences.findOne({ user: req.user._id });

    // Allow override from request body
    if (req.body.preferences) {
      preferences = { ...preferences?._doc, ...req.body.preferences };
    }

    // Set defaults if no preferences
    if (!preferences) {
      preferences = {
        dietaryRestrictions: [],
        allergies: [],
        cuisinePreferences: ['any'],
        spiceLevel: 'medium',
        cookingTime: 'any',
        skillLevel: 'any',
        servings: 2,
        avoidIngredients: []
      };
    }

    // Format inventory for AI
    const inventoryList = inventory.map(item => {
      const expiryInfo = item.expiryDate ? {
        expiryDate: item.expiryDate,
        daysUntilExpiry: Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      } : null;

      return {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        ...expiryInfo
      };
    });

    // Sort by expiry date (items expiring soon first)
    inventoryList.sort((a, b) => {
      if (!a.daysUntilExpiry) return 1;
      if (!b.daysUntilExpiry) return -1;
      return a.daysUntilExpiry - b.daysUntilExpiry;
    });

    console.log('Requesting meal recommendations...');

    // Build system prompt (cacheable) and user content (dynamic)
    // Using prompt caching to reduce costs on repeated requests
    const systemInstructions = `You are a creative chef and meal planning expert. Based on the user's available ingredients and preferences, suggest 3-5 delicious meals they can prepare.

**IMPORTANT INSTRUCTIONS:**
1. Prioritize using ingredients that are expiring soon (marked with ⚠️)
2. Suggest meals that use as many available ingredients as possible
3. Respect all dietary restrictions and allergies
4. For each meal, clearly indicate which ingredients the user HAS vs which they NEED to buy
5. Include step-by-step cooking instructions
6. Provide estimated nutritional information (calories, protein, carbs, fat)
7. Include cooking time and difficulty level
8. If using an expiring ingredient, add a note about it

Return ONLY a valid JSON array with no additional text or markdown formatting. Format:
[
  {
    "name": "Recipe Name",
    "description": "Brief appetizing description",
    "cuisine": "Cuisine type",
    "prepTime": "15 min",
    "cookTime": "30 min",
    "totalTime": "45 min",
    "difficulty": "easy|medium|hard",
    "servings": 2,
    "ingredientsAvailable": [
      {"name": "Ingredient name", "quantity": "amount needed", "have": "amount you have"}
    ],
    "ingredientsNeeded": [
      {"name": "Ingredient to buy", "quantity": "amount needed", "estimated": true}
    ],
    "expiryNote": "Using tomatoes that expire in 2 days" or null,
    "instructions": [
      "Step 1...",
      "Step 2..."
    ],
    "nutrition": {
      "calories": 450,
      "protein": "25g",
      "carbs": "40g",
      "fat": "15g",
      "fiber": "8g"
    },
    "tags": ["quick", "healthy", "vegetarian"]
  }
]`;

    const userContent = `**AVAILABLE INGREDIENTS:**
${inventoryList.map(item => {
  let line = `- ${item.name}: ${item.quantity} ${item.unit}`;
  if (item.daysUntilExpiry !== undefined && item.daysUntilExpiry <= 7) {
    line += ` (⚠️ Expires in ${item.daysUntilExpiry} days)`;
  }
  return line;
}).join('\n')}

**USER PREFERENCES:**
- Dietary Restrictions: ${preferences.dietaryRestrictions?.length > 0 ? preferences.dietaryRestrictions.join(', ') : 'None'}
- Allergies: ${preferences.allergies?.length > 0 ? preferences.allergies.join(', ') : 'None'}
- Cuisine Preferences: ${preferences.cuisinePreferences?.join(', ') || 'Any'}
- Spice Level: ${preferences.spiceLevel || 'Medium'}
- Cooking Time: ${preferences.cookingTime === 'quick' ? 'Under 30 min' : preferences.cookingTime === 'medium' ? '30-60 min' : preferences.cookingTime === 'long' ? 'Over 60 min' : 'Any'}
- Skill Level: ${preferences.skillLevel || 'Any'}
- Servings Needed: ${preferences.servings || 2}
- Ingredients to Avoid: ${preferences.avoidIngredients?.length > 0 ? preferences.avoidIngredients.join(', ') : 'None'}`;

    // Call Claude API with prompt caching
    // System instructions are cached, reducing costs on repeated requests
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3500,
      system: [
        {
          type: 'text',
          text: systemInstructions,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [
        {
          role: 'user',
          content: userContent
        }
      ]
    });

    // Extract the response text
    const responseText = message.content[0].text;
    console.log('AI Response received');

    // Parse the JSON response
    let recommendations;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({
        message: 'Failed to parse meal recommendations',
        debug: responseText
      });
    }

    // Validate the response
    if (!Array.isArray(recommendations)) {
      return res.status(500).json({
        message: 'Invalid response format from AI',
        debug: recommendations
      });
    }

    res.json({
      success: true,
      message: `Generated ${recommendations.length} meal recommendations`,
      recommendations,
      inventory: inventoryList
    });

  } catch (error) {
    console.error('Meal recommendation error:', error);

    if (error.status === 401) {
      return res.status(500).json({
        message: 'Invalid AI API key. Please check your ANTHROPIC_API_KEY in .env file'
      });
    }

    res.status(500).json({
      message: 'Error generating meal recommendations',
      error: error.message
    });
  }
});

module.exports = router;
