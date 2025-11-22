import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [inventoryCount, setInventoryCount] = useState(0);

  useEffect(() => {
    fetchInventoryCount();
  }, []);

  const fetchInventoryCount = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInventoryCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching inventory count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img
                src="/Annapurna.png"
                alt="Annapurna Logo"
                className="w-20 h-20 drop-shadow-lg mix-blend-multiply"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Annapurna
                </h1>
                <p className="text-sm text-gray-600">Your Personal Meal Planner</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome back, {user?.name}! 👋
            </h2>
            <p className="text-gray-600">
              Ready to plan some delicious meals?
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/inventory')}
              className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-xl border border-purple-200 text-center hover:shadow-lg hover:border-purple-400 transition duration-200 cursor-pointer"
            >
              <div className="flex justify-center mb-4">
                <span className="text-5xl">📦</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">My Pantry</h3>
              <p className="text-4xl font-bold text-purple-600 mb-3">{inventoryCount}</p>
              <span className="inline-block text-xs font-semibold text-purple-700 bg-purple-200 px-3 py-1 rounded-full">
                Click to Manage
              </span>
            </button>

            <div className="bg-gradient-to-br from-amber-50 to-pink-100 p-6 rounded-xl border border-amber-200 text-center">
              <div className="flex justify-center mb-4">
                <span className="text-5xl">🍽️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Meals Cooked</h3>
              <p className="text-4xl font-bold text-amber-600 mb-3">0</p>
              <span className="inline-block text-xs font-semibold text-amber-700 bg-amber-200 px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-xl border border-rose-200 text-center">
              <div className="flex justify-center mb-4">
                <span className="text-5xl">⭐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Preferences</h3>
              <p className="text-4xl font-bold text-rose-600 mb-3">0</p>
              <span className="inline-block text-xs font-semibold text-rose-700 bg-rose-200 px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            What You Can Do
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Explore the features that will help you plan your meals efficiently
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => navigate('/inventory')}
              className="group p-6 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition duration-200 text-left"
            >
              <div className="text-5xl mb-4 text-center">📦</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                Grocery Inventory
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Upload and manage your grocery inventory to keep track of what's in your fridge
              </p>
              <div className="flex justify-center">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium group-hover:shadow-md transition">
                  Manage Inventory →
                </span>
              </div>
            </button>

            <div className="group p-6 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition duration-200">
              <div className="text-5xl mb-4 text-center">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                Meal Recommendations
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Get personalized meal suggestions based on your inventory and preferences
              </p>
              <div className="flex justify-center">
                <span className="inline-block px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                  Coming Soon
                </span>
              </div>
            </div>

            <div className="group p-6 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition duration-200">
              <div className="text-5xl mb-4 text-center">⭐</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                Dietary Preferences
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Set your dietary preferences and restrictions for tailored recommendations
              </p>
              <div className="flex justify-center">
                <span className="inline-block px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
