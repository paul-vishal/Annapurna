const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dietaryRestrictions: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher', 'keto', 'paleo', 'low-carb', 'none']
  }],
  allergies: [{
    type: String,
    trim: true
  }],
  cuisinePreferences: [{
    type: String,
    enum: ['indian', 'chinese', 'italian', 'mexican', 'thai', 'japanese', 'american', 'mediterranean', 'french', 'korean', 'any']
  }],
  spiceLevel: {
    type: String,
    enum: ['none', 'mild', 'medium', 'hot', 'very-hot'],
    default: 'medium'
  },
  cookingTime: {
    type: String,
    enum: ['quick', 'medium', 'long', 'any'],
    default: 'any'
  },
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'any'],
    default: 'any'
  },
  servings: {
    type: Number,
    min: 1,
    max: 12,
    default: 2
  },
  avoidIngredients: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

userPreferencesSchema.index({ user: 1 });

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

module.exports = UserPreferences;
