import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user, token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [preferences, setPreferences] = useState({
    dietaryRestrictions: [],
    allergies: [],
    favoriteCuisines: []
  });

  const [inputValues, setInputValues] = useState({
    dietaryRestriction: '',
    allergy: '',
    cuisine: ''
  });

  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        dietaryRestrictions: user.preferences.dietaryRestrictions || [],
        allergies: user.preferences.allergies || [],
        favoriteCuisines: user.preferences.favoriteCuisines || []
      });
    }
  }, [user]);

  const handleAddItem = (field, value) => {
    if (value.trim() && !preferences[field].includes(value.trim())) {
      setPreferences({
        ...preferences,
        [field]: [...preferences[field], value.trim()]
      });
      setInputValues({
        ...inputValues,
        [field === 'dietaryRestrictions' ? 'dietaryRestriction' : field === 'allergies' ? 'allergy' : 'cuisine']: ''
      });
    }
  };

  const handleRemoveItem = (field, value) => {
    setPreferences({
      ...preferences,
      [field]: preferences[field].filter(item => item !== value)
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:5001/api/auth/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        setMessage({ type: 'success', text: 'Preferences saved successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to save preferences' });
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const commonDietaryRestrictions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Halal', 'Kosher'];
  const commonAllergies = ['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish'];
  const commonCuisines = ['Italian', 'Chinese', 'Mexican', 'Indian', 'Japanese', 'Thai', 'Mediterranean', 'American', 'French', 'Korean'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-3 hover:opacity-80 transition"
              >
                <img
                  src="/Annapurna.png"
                  alt="Annapurna Logo"
                  className="w-20 h-20 drop-shadow-lg mix-blend-multiply"
                />
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent" style={{ fontFamily: "'Dancing Script', cursive" }}>
                    Annapurna
                  </h1>
                  <p className="text-xl text-gray-600 italic" style={{ fontFamily: "'Dancing Script', cursive" }}>Your Divine Kitchen Companion</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Profile & Preferences</h2>
            <p className="text-gray-600">Manage your dietary preferences and restrictions</p>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {/* User Info */}
          <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="flex items-center space-x-4">
              <div className="text-5xl">👤</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{user?.name}</h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🥗</span>
              Dietary Restrictions
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValues.dietaryRestriction}
                  onChange={(e) => setInputValues({ ...inputValues, dietaryRestriction: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddItem('dietaryRestrictions', inputValues.dietaryRestriction);
                    }
                  }}
                  placeholder="Add dietary restriction"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => handleAddItem('dietaryRestrictions', inputValues.dietaryRestriction)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {commonDietaryRestrictions.map(item => (
                  !preferences.dietaryRestrictions.includes(item) && (
                    <button
                      key={item}
                      onClick={() => handleAddItem('dietaryRestrictions', item)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-purple-100 hover:text-purple-700 transition"
                    >
                      + {item}
                    </button>
                  )
                ))}
              </div>
              {preferences.dietaryRestrictions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {preferences.dietaryRestrictions.map(item => (
                    <span
                      key={item}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full flex items-center gap-2"
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveItem('dietaryRestrictions', item)}
                        className="hover:text-purple-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Allergies */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              Allergies
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValues.allergy}
                  onChange={(e) => setInputValues({ ...inputValues, allergy: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddItem('allergies', inputValues.allergy);
                    }
                  }}
                  placeholder="Add allergy"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => handleAddItem('allergies', inputValues.allergy)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {commonAllergies.map(item => (
                  !preferences.allergies.includes(item) && (
                    <button
                      key={item}
                      onClick={() => handleAddItem('allergies', item)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-red-100 hover:text-red-700 transition"
                    >
                      + {item}
                    </button>
                  )
                ))}
              </div>
              {preferences.allergies.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {preferences.allergies.map(item => (
                    <span
                      key={item}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-full flex items-center gap-2"
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveItem('allergies', item)}
                        className="hover:text-red-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Favorite Cuisines */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🍽️</span>
              Favorite Cuisines
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValues.cuisine}
                  onChange={(e) => setInputValues({ ...inputValues, cuisine: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddItem('favoriteCuisines', inputValues.cuisine);
                    }
                  }}
                  placeholder="Add favorite cuisine"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => handleAddItem('favoriteCuisines', inputValues.cuisine)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {commonCuisines.map(item => (
                  !preferences.favoriteCuisines.includes(item) && (
                    <button
                      key={item}
                      onClick={() => handleAddItem('favoriteCuisines', item)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-pink-100 hover:text-pink-700 transition"
                    >
                      + {item}
                    </button>
                  )
                ))}
              </div>
              {preferences.favoriteCuisines.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {preferences.favoriteCuisines.map(item => (
                    <span
                      key={item}
                      className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full flex items-center gap-2"
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveItem('favoriteCuisines', item)}
                        className="hover:text-pink-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
