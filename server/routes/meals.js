const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { protect } = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const InventoryItem = require('../models/Inventory');
const UserPreferences = require('../models/UserPreferences');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
});

// Extracts the next complete JSON object from a string buffer.
// Returns { object, remaining } — object is null if none found yet.
function extractNextObject(str) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  let start = -1;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (escaped) { escaped = false; continue; }
    if (ch === '\\' && inString) { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        try {
          const obj = JSON.parse(str.substring(start, i + 1));
          return { object: obj, remaining: str.substring(i + 1) };
        } catch {
          start = -1;
        }
      }
    }
  }

  return { object: null, remaining: str };
}

// @route   POST /api/meals/recommendations
// @desc    Stream meal recommendations via SSE
// @access  Private
// Rate limit: 3 requests per minute
router.post('/recommendations', protect, rateLimiter({ windowMs: 60 * 1000, maxRequests: 3 }), async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      message: 'AI service not configured. Please add ANTHROPIC_API_KEY to .env file'
    });
  }

  const inventory = await InventoryItem.find({ user: req.user._id });
  if (inventory.length === 0) {
    return res.status(400).json({
      message: 'No items in inventory. Please add items first.'
    });
  }

  let preferences = await UserPreferences.findOne({ user: req.user._id });
  if (req.body.preferences) {
    preferences = { ...preferences?._doc, ...req.body.preferences };
  }
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

  const inventoryList = inventory.map(item => {
    const expiryInfo = item.expiryDate ? {
      expiryDate: item.expiryDate,
      daysUntilExpiry: Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    } : null;
    return { name: item.name, quantity: item.quantity, unit: item.unit, category: item.category, ...expiryInfo };
  });

  inventoryList.sort((a, b) => {
    if (!a.daysUntilExpiry) return 1;
    if (!b.daysUntilExpiry) return -1;
    return a.daysUntilExpiry - b.daysUntilExpiry;
  });

  // All validation passed — switch to SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const systemInstructions = `You are a creative chef. Suggest 3 meals based on the user's pantry and preferences.

Rules:
- Start your response immediately with [ — no preamble or explanation
- Output each complete recipe object before starting the next
- Prioritize ingredients expiring soon (marked ⚠️)
- Use as many available ingredients as possible
- Strictly respect dietary restrictions and allergies
- Set expiryNote to null if no expiring ingredients are used

Output ONLY a raw JSON array — no markdown, no code fences. Schema:
[
  {
    "name": "string",
    "description": "one sentence",
    "cuisine": "string",
    "prepTime": "X min",
    "cookTime": "X min",
    "totalTime": "X min",
    "difficulty": "easy|medium|hard",
    "servings": 2,
    "ingredientsAvailable": [{"name": "string", "quantity": "string", "have": "string"}],
    "ingredientsNeeded": [{"name": "string", "quantity": "string"}],
    "expiryNote": "string or null",
    "instructions": ["Step 1", "Step 2"],
    "nutrition": {"calories": 0, "protein": "0g", "carbs": "0g", "fat": "0g", "fiber": "0g"},
    "tags": ["string"]
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

  console.log('Streaming meal recommendations...');

  try {
    const controller = new AbortController();
    req.on('close', () => controller.abort());

    const stream = await anthropic.messages.stream(
      {
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: [{ type: 'text', text: systemInstructions, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userContent }]
      },
      { signal: controller.signal }
    );

    let buffer = '';

    stream.on('text', (text) => {
      buffer += text;
      let result;
      do {
        result = extractNextObject(buffer);
        if (result.object) {
          send({ type: 'recipe', recipe: result.object });
          buffer = result.remaining;
        }
      } while (result.object);
    });

    stream.on('finalMessage', () => {
      send({ type: 'done', inventory: inventoryList });
      res.end();
    });

    stream.on('error', (err) => {
      if (err.name !== 'APIUserAbortError') {
        console.error('Stream error:', err);
        send({ type: 'error', message: err.message });
      }
      res.end();
    });
  } catch (error) {
    console.error('Meal recommendation error:', error);
    send({ type: 'error', message: error.status === 401 ? 'Invalid AI API key' : error.message });
    res.end();
  }
});

module.exports = router;
