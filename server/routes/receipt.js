const express = require('express');
const router = express.Router();
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const { protect } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const fs = require('fs').promises;
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// @route   POST /api/receipt/parse
// @desc    Parse receipt image and extract grocery items
// @access  Private
// Rate limit: 5 requests per minute to reduce API costs
router.post('/parse', protect, rateLimiter({ windowMs: 60 * 1000, maxRequests: 5 }), upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a receipt image' });
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        message: 'AI service not configured. Please add ANTHROPIC_API_KEY to .env file'
      });
    }

    // Convert image buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype;

    console.log('Processing receipt image...');

    // Call Claude API with vision to parse the receipt
    // Using Haiku for cost optimization - receipt parsing is a simple task
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `Analyze this grocery receipt and extract all food/grocery items. For each item, provide:
- name: The product name (standardized, without brand if possible)
- quantity: The quantity purchased (default to 1 if not clear)
- unit: The unit of measurement - MUST be one of: "kg", "g", "lbs", "oz", "liters", "ml", "pieces", "cups"
- category: Food category - MUST be one of: "vegetables", "fruits", "grains", "dairy", "protein", "oil", "spices", "nuts", "other" (lowercase only)

CATEGORY MAPPING GUIDE:
- vegetables: Onions, tomatoes, lettuce, carrots, broccoli, peppers, etc.
- fruits: Apples, bananas, oranges, berries, etc.
- grains: Rice, bread, pasta, flour, cereal, oats, etc.
- dairy: Milk, cheese, yogurt, butter, cream, etc.
- protein: Meat, chicken, fish, eggs, beans, tofu, etc.
- oil: Cooking oil, olive oil, vegetable oil, etc.
- spices: Salt, pepper, herbs, spices, seasonings, etc.
- nuts: Almonds, cashews, peanuts, walnuts, pistachios, etc.
- other: Everything else that doesn't fit above categories

IMPORTANT RULES:
1. Only include actual food and grocery items (exclude non-food items like bags, household products, etc.)
2. Standardize item names (e.g., "Bananas" not "DOLE BANANAS")
3. If quantity is by weight (like 2.5 lb), keep it as is
4. If no quantity is visible, assume 1 and use "pieces" as unit
5. Categories MUST be lowercase and match exactly: vegetables, fruits, grains, dairy, protein, oil, spices, nuts, or other
6. Units MUST match exactly: kg, g, lbs, oz, liters, ml, pieces, or cups

Return ONLY a valid JSON array with no additional text or markdown formatting. Format:
[
  {
    "name": "Item name",
    "quantity": 2,
    "unit": "pieces",
    "category": "vegetables"
  }
]`
            }
          ]
        }
      ]
    });

    // Extract the response text
    const responseText = message.content[0].text;
    console.log('AI Response:', responseText);

    // Parse the JSON response
    let items;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      items = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({
        message: 'Failed to parse receipt data',
        debug: responseText
      });
    }

    // Validate the response
    if (!Array.isArray(items)) {
      return res.status(500).json({
        message: 'Invalid response format from AI',
        debug: items
      });
    }

    res.json({
      success: true,
      message: `Found ${items.length} items in receipt`,
      items: items
    });

  } catch (error) {
    console.error('Receipt parsing error:', error);

    if (error.status === 401) {
      return res.status(500).json({
        message: 'Invalid AI API key. Please check your ANTHROPIC_API_KEY in .env file'
      });
    }

    res.status(500).json({
      message: 'Error processing receipt',
      error: error.message
    });
  }
});

module.exports = router;
