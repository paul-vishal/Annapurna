import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl shadow-md">
                <span className="text-2xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  MealVP
                </h1>
                <p className="text-sm text-gray-600">Your Personal Meal Planner</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
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
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200 text-center">
              <div className="flex justify-center mb-4">
                <span className="text-5xl">📦</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Inventory Items</h3>
              <p className="text-4xl font-bold text-emerald-600 mb-3">0</p>
              <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-200 px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 text-center">
              <div className="flex justify-center mb-4">
                <span className="text-5xl">🍽️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Meal Plans</h3>
              <p className="text-4xl font-bold text-green-600 mb-3">0</p>
              <span className="inline-block text-xs font-semibold text-green-700 bg-green-200 px-3 py-1 rounded-full">
                Coming Soon
              </span>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-xl border border-teal-200 text-center">
              <div className="flex justify-center mb-4">
                <span className="text-5xl">⭐</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Preferences</h3>
              <p className="text-4xl font-bold text-teal-600 mb-3">0</p>
              <span className="inline-block text-xs font-semibold text-teal-700 bg-teal-200 px-3 py-1 rounded-full">
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
            <div className="group p-6 rounded-xl border-2 border-gray-200 hover:border-emerald-500 hover:shadow-lg transition duration-200">
              <div className="text-5xl mb-4 text-center">📦</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                Grocery Inventory
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Upload and manage your grocery inventory to keep track of what's in your fridge
              </p>
              <div className="flex justify-center">
                <span className="inline-block px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                  Coming Soon
                </span>
              </div>
            </div>

            <div className="group p-6 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:shadow-lg transition duration-200">
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

            <div className="group p-6 rounded-xl border-2 border-gray-200 hover:border-teal-500 hover:shadow-lg transition duration-200">
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
