const express = require('express');
const router = express.Router();
const UserPreferences = require('../models/UserPreferences');
const { protect } = require('../middleware/auth');

// @route   GET /api/preferences
// @desc    Get user preferences
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let preferences = await UserPreferences.findOne({ user: req.user._id });

    // If no preferences exist, return default preferences
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

    res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/preferences
// @desc    Create or update user preferences
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      dietaryRestrictions,
      allergies,
      cuisinePreferences,
      spiceLevel,
      cookingTime,
      skillLevel,
      servings,
      avoidIngredients
    } = req.body;

    let preferences = await UserPreferences.findOne({ user: req.user._id });

    if (preferences) {
      // Update existing preferences
      preferences.dietaryRestrictions = dietaryRestrictions || preferences.dietaryRestrictions;
      preferences.allergies = allergies || preferences.allergies;
      preferences.cuisinePreferences = cuisinePreferences || preferences.cuisinePreferences;
      preferences.spiceLevel = spiceLevel || preferences.spiceLevel;
      preferences.cookingTime = cookingTime || preferences.cookingTime;
      preferences.skillLevel = skillLevel || preferences.skillLevel;
      preferences.servings = servings || preferences.servings;
      preferences.avoidIngredients = avoidIngredients || preferences.avoidIngredients;

      await preferences.save();
    } else {
      // Create new preferences
      preferences = await UserPreferences.create({
        user: req.user._id,
        dietaryRestrictions,
        allergies,
        cuisinePreferences,
        spiceLevel,
        cookingTime,
        skillLevel,
        servings,
        avoidIngredients
      });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(400).json({ message: 'Error saving preferences', error: error.message });
  }
});

// @route   DELETE /api/preferences
// @desc    Delete user preferences (reset to defaults)
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    await UserPreferences.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Preferences reset to defaults' });
  } catch (error) {
    console.error('Error deleting preferences:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
