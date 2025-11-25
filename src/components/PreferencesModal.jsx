import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function PreferencesModal({ currentPreferences, onSave, onClose }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    dietaryRestrictions: [],
    allergies: [],
    cuisinePreferences: [],
    spiceLevel: 'medium',
    cookingTime: 'any',
    skillLevel: 'any',
    servings: 2,
    avoidIngredients: []
  });

  useEffect(() => {
    if (currentPreferences) {
      setFormData({
        dietaryRestrictions: currentPreferences.dietaryRestrictions || [],
        allergies: currentPreferences.allergies || [],
        cuisinePreferences: currentPreferences.cuisinePreferences || [],
        spiceLevel: currentPreferences.spiceLevel || 'medium',
        cookingTime: currentPreferences.cookingTime || 'any',
        skillLevel: currentPreferences.skillLevel || 'any',
        servings: currentPreferences.servings || 2,
        avoidIngredients: currentPreferences.avoidIngredients || []
      });
    }
  }, [currentPreferences]);

  const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher', 'keto', 'paleo', 'low-carb', 'none'];
  const cuisineOptions = ['indian', 'chinese', 'italian', 'mexican', 'thai', 'japanese', 'american', 'mediterranean', 'french', 'korean', 'any'];
  const spiceLevels = ['none', 'mild', 'medium', 'hot', 'very-hot'];
  const cookingTimes = [
    { value: 'quick', label: 'Quick (< 30 min)' },
    { value: 'medium', label: 'Medium (30-60 min)' },
    { value: 'long', label: 'Long (> 60 min)' },
    { value: 'any', label: 'Any' }
  ];
  const skillLevels = ['beginner', 'intermediate', 'advanced', 'any'];

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleArrayInputChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        onSave(data);
      } else {
        setError(data.message || 'Failed to save preferences');
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>⚙️</span>
                Meal Preferences
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Customize your meal recommendations
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Dietary Restrictions */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Dietary Restrictions
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {dietaryOptions.map(option => (
                  <label key={option} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dietaryRestrictions.includes(option)}
                      onChange={() => handleCheckboxChange('dietaryRestrictions', option)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Allergies (comma-separated)
              </label>
              <input
                type="text"
                value={formData.allergies.join(', ')}
                onChange={(e) => handleArrayInputChange('allergies', e.target.value)}
                placeholder="e.g., peanuts, shellfish, eggs"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Cuisine Preferences */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Cuisine Preferences
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {cuisineOptions.map(option => (
                  <label key={option} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cuisinePreferences.includes(option)}
                      onChange={() => handleCheckboxChange('cuisinePreferences', option)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Spice Level */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Spice Level
              </label>
              <div className="flex gap-2">
                {spiceLevels.map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, spiceLevel: level }))}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                      formData.spiceLevel === level
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Cooking Time & Skill Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cooking Time */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Cooking Time
                </label>
                <select
                  value={formData.cookingTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, cookingTime: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  {cookingTimes.map(time => (
                    <option key={time.value} value={time.value}>{time.label}</option>
                  ))}
                </select>
              </div>

              {/* Skill Level */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Skill Level
                </label>
                <select
                  value={formData.skillLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  {skillLevels.map(level => (
                    <option key={level} value={level} className="capitalize">{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Servings */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Default Servings
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) || 2 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Avoid Ingredients */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Ingredients to Avoid (comma-separated)
              </label>
              <input
                type="text"
                value={formData.avoidIngredients.join(', ')}
                onChange={(e) => handleArrayInputChange('avoidIngredients', e.target.value)}
                placeholder="e.g., cilantro, mushrooms, olives"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreferencesModal;
