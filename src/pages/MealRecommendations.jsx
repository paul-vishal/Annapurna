import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PreferencesModal from '../components/PreferencesModal';

function MealRecommendations() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);

  // Client-side caching to prevent redundant API calls
  const [cachedData, setCachedData] = useState(null);
  const [cacheTimestamp, setCacheTimestamp] = useState(null);
  const lastRequestRef = useRef(null);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  const DEBOUNCE_TIME = 2000; // 2 seconds

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const getMealRecommendations = async (overridePrefs = null, forceRefresh = false) => {
    const now = Date.now();
    if (lastRequestRef.current && (now - lastRequestRef.current) < DEBOUNCE_TIME) {
      return;
    }

    if (!forceRefresh && cachedData && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('Using cached recommendations (age: ' + Math.round((now - cacheTimestamp) / 1000) + 's)');
      setRecommendations(cachedData);
      setError('');
      return;
    }

    lastRequestRef.current = now;
    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const body = overridePrefs ? { preferences: overridePrefs } : {};

      const response = await fetch('http://localhost:5001/api/meals/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      // Non-SSE error (validation failed before streaming started)
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Failed to get recommendations');
        return;
      }

      // Read SSE stream and render recipes as they arrive
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = '';
      const received = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const messages = sseBuffer.split('\n\n');
        sseBuffer = messages.pop();

        for (const message of messages) {
          const line = message.trim();
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'recipe') {
              received.push(data.recipe);
              setRecommendations([...received]);
            } else if (data.type === 'done') {
              setCachedData([...received]);
              setCacheTimestamp(Date.now());
            } else if (data.type === 'error') {
              setError(data.message || 'Failed to get recommendations');
            }
          } catch (e) {
            console.error('Failed to parse SSE message', e);
          }
        }
      }
    } catch (err) {
      console.error('Error getting recommendations:', err);
      setError('Failed to get meal recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSaved = (newPreferences) => {
    setPreferences(newPreferences);
    setShowPreferences(false);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || colors.medium;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-purple-100 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img
                src="/Annapurna.png"
                alt="Annapurna Logo"
                className="w-20 h-20 drop-shadow-lg mix-blend-multiply"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent" style={{ fontFamily: "'Dancing Script', cursive" }}>
                  Annapurna
                </h1>
                <p className="text-sm text-gray-600">Meal Recommendations</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-gray-200 transition duration-200"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">What Should I Cook?</h2>
            <p className="text-gray-600 mt-1">AI-powered meal suggestions based on your pantry</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowPreferences(true)}
              className="px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-purple-50 transition duration-200 flex items-center gap-2"
            >
              <span>⚙️</span>
              Preferences
            </button>
            {recommendations.length > 0 && (
              <button
                onClick={() => getMealRecommendations(null, true)}
                disabled={loading}
                className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 font-semibold rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Force refresh recommendations"
              >
                <span>🔄</span>
                Refresh
              </button>
            )}
            <button
              onClick={() => getMealRecommendations()}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {recommendations.length > 0 ? `${recommendations.length} ready...` : 'Generating...'}
                </>
              ) : (
                <>
                  <span>✨</span>
                  Get Recommendations
                </>
              )}
            </button>
          </div>
          {cacheTimestamp && recommendations.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              💾 Cached {Math.round((Date.now() - cacheTimestamp) / 1000)}s ago (saves on API costs)
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((meal, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition duration-200">
                {/* Meal Header */}
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-gray-800">{meal.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(meal.difficulty)}`}>
                      {meal.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{meal.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      🍽️ {meal.cuisine}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      ⏱️ {meal.totalTime}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      👥 {meal.servings} servings
                    </span>
                  </div>

                  {/* Expiry Warning */}
                  {meal.expiryNote && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm mb-3">
                      ⚠️ {meal.expiryNote}
                    </div>
                  )}
                </div>

                {/* Ingredients */}
                <div className="mb-4">
                  <h4 className="font-bold text-gray-800 mb-2">Ingredients:</h4>

                  {/* Available ingredients */}
                  {meal.ingredientsAvailable && meal.ingredientsAvailable.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-green-700 font-semibold mb-1">✓ You have:</p>
                      <ul className="space-y-1">
                        {meal.ingredientsAvailable.map((ing, idx) => (
                          <li key={idx} className="text-sm text-gray-700 pl-4">
                            • {ing.quantity} {ing.name}
                            {ing.have && <span className="text-xs text-gray-500"> (have: {ing.have})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Needed ingredients */}
                  {meal.ingredientsNeeded && meal.ingredientsNeeded.length > 0 && (
                    <div>
                      <p className="text-xs text-orange-700 font-semibold mb-1">🛒 Need to buy:</p>
                      <ul className="space-y-1">
                        {meal.ingredientsNeeded.map((ing, idx) => (
                          <li key={idx} className="text-sm text-gray-700 pl-4">
                            • {ing.quantity} {ing.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Nutrition */}
                {meal.nutrition && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-2 text-sm">Nutrition (per serving):</h4>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Calories</p>
                        <p className="text-sm font-semibold text-gray-800">{meal.nutrition.calories}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Protein</p>
                        <p className="text-sm font-semibold text-gray-800">{meal.nutrition.protein}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Carbs</p>
                        <p className="text-sm font-semibold text-gray-800">{meal.nutrition.carbs}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fat</p>
                        <p className="text-sm font-semibold text-gray-800">{meal.nutrition.fat}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Fiber</p>
                        <p className="text-sm font-semibold text-gray-800">{meal.nutrition.fiber}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Recipe Button */}
                <button
                  onClick={() => setSelectedMeal(meal)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  View Recipe Instructions
                </button>
              </div>
            ))}
            {loading && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-purple-100 flex flex-col items-center justify-center gap-3 min-h-[120px]">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <p className="text-sm text-gray-500 font-medium">Finding more recipes for you...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">🍳</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Ready to Cook Something Delicious?</h3>
            <p className="text-gray-600 mb-6">
              Click "Get Recommendations" to see personalized meal suggestions based on your pantry items.
            </p>
            <button
              onClick={() => getMealRecommendations()}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Get Meal Recommendations'}
            </button>
          </div>
        )}
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <PreferencesModal
          currentPreferences={preferences}
          onSave={handlePreferencesSaved}
          onClose={() => setShowPreferences(false)}
        />
      )}

      {/* Recipe Details Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedMeal.name}</h2>
                  <p className="text-gray-600">{selectedMeal.description}</p>
                </div>
                <button
                  onClick={() => setSelectedMeal(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Cooking Instructions */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-3">Instructions:</h3>
                <ol className="space-y-3">
                  {selectedMeal.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 pt-0.5">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tags */}
              {selectedMeal.tags && selectedMeal.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedMeal.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MealRecommendations;
