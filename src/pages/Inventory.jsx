import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const COMMON_ITEMS = [
  { name: 'Onion', category: 'vegetables', unit: 'kg', icon: '🧅' },
  { name: 'Tomato', category: 'vegetables', unit: 'kg', icon: '🍅' },
  { name: 'Potato', category: 'vegetables', unit: 'kg', icon: '🥔' },
  { name: 'Spinach', category: 'vegetables', unit: 'kg', icon: '🥬' },
  { name: 'Carrot', category: 'vegetables', unit: 'kg', icon: '🥕' },
  { name: 'Broccoli', category: 'vegetables', unit: 'kg', icon: '🥦' },
  { name: 'Garlic', category: 'vegetables', unit: 'g', icon: '🧄' },
  { name: 'Ginger', category: 'vegetables', unit: 'g', icon: '🫚' },
  { name: 'Apple', category: 'fruits', unit: 'kg', icon: '🍎' },
  { name: 'Banana', category: 'fruits', unit: 'kg', icon: '🍌' },
  { name: 'Orange', category: 'fruits', unit: 'kg', icon: '🍊' },
  { name: 'Lemon', category: 'fruits', unit: 'pieces', icon: '🍋' },
  { name: 'Rice', category: 'grains', unit: 'kg', icon: '🍚' },
  { name: 'Wheat Flour', category: 'grains', unit: 'kg', icon: '🌾' },
  { name: 'Lentils (Dal)', category: 'grains', unit: 'kg', icon: '🫘' },
  { name: 'Bread', category: 'grains', unit: 'pieces', icon: '🍞' },
  { name: 'Pasta', category: 'grains', unit: 'g', icon: '🍝' },
  { name: 'Milk', category: 'dairy', unit: 'liters', icon: '🥛' },
  { name: 'Eggs', category: 'protein', unit: 'pieces', icon: '🥚' },
  { name: 'Chicken', category: 'protein', unit: 'kg', icon: '🍗' },
  { name: 'Fish', category: 'protein', unit: 'kg', icon: '🐟' },
  { name: 'Paneer', category: 'dairy', unit: 'g', icon: '🧈' },
  { name: 'Yogurt', category: 'dairy', unit: 'g', icon: '🥛' },
  { name: 'Butter', category: 'dairy', unit: 'g', icon: '🧈' },
  { name: 'Cheese', category: 'dairy', unit: 'g', icon: '🧀' },
  { name: 'Vegetable Oil', category: 'oil', unit: 'liters', icon: '🫗' },
  { name: 'Olive Oil', category: 'oil', unit: 'ml', icon: '🫒' },
  { name: 'Turmeric', category: 'spices', unit: 'g', icon: '🟡' },
  { name: 'Cumin', category: 'spices', unit: 'g', icon: '🟤' },
  { name: 'Salt', category: 'spices', unit: 'g', icon: '🧂' },
  { name: 'Pepper', category: 'spices', unit: 'g', icon: '⚫' },
  { name: 'Chili Powder', category: 'spices', unit: 'g', icon: '🌶️' }
];

const CATEGORIES = ['vegetables', 'fruits', 'grains', 'dairy', 'protein', 'oil', 'spices', 'other'];
const UNITS = ['kg', 'g', 'lbs', 'oz', 'liters', 'ml', 'pieces', 'cups'];

function Inventory() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    quantity: '',
    unit: 'pieces',
    expiryDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingItem
        ? `http://localhost:5001/api/inventory/${editingItem._id}`
        : 'http://localhost:5001/api/inventory';

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchInventory();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/inventory/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchInventory();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      notes: item.notes || ''
    });
    setShowModal(true);
  };

  const handleQuickAdd = (commonItem) => {
    setFormData({
      name: commonItem.name,
      category: commonItem.category,
      quantity: '',
      unit: commonItem.unit,
      expiryDate: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'other',
      quantity: '',
      unit: 'pieces',
      expiryDate: '',
      notes: ''
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      vegetables: 'bg-lime-100 text-lime-800',
      fruits: 'bg-pink-100 text-pink-800',
      grains: 'bg-yellow-100 text-yellow-800',
      dairy: 'bg-blue-100 text-blue-800',
      protein: 'bg-red-100 text-red-800',
      oil: 'bg-amber-100 text-amber-800',
      spices: 'bg-orange-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const getItemIcon = (itemName) => {
    const commonItem = COMMON_ITEMS.find(
      item => item.name.toLowerCase() === itemName.toLowerCase()
    );
    return commonItem?.icon || '📦';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading inventory...</div>
      </div>
    );
  }

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
                <p className="text-sm text-gray-600">Pantry Inventory</p>
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Pantry</h2>
            <p className="text-gray-600 mt-1">Manage your grocery items</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
          >
            + Add Custom Item
          </button>
        </div>

        {/* Common Items Quick Add */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Add Common Items</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
            {COMMON_ITEMS.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickAdd(item)}
                className="flex flex-col items-center gap-1 p-2 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:shadow-md transition duration-200 hover:border-purple-400 hover:scale-105"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inventory List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Inventory ({items.length} items)</h2>

          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-600 text-lg">No items in your inventory yet.</p>
              <p className="text-gray-500 mt-2">Click on a common item above or add a custom item to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {CATEGORIES.map((category) => {
                const categoryItems = items.filter(item => item.category === category);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-800 capitalize">{category}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full ${getCategoryColor(category)}`}>
                        {categoryItems.length} {categoryItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {categoryItems.map((item) => (
                        <div
                          key={item._id}
                          className="relative p-3 border border-gray-200 rounded-lg hover:shadow-md transition duration-200 bg-white group"
                        >
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                              title="Edit"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                              title="Delete"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{getItemIcon(item.name)}</span>
                            <h3 className="text-sm font-semibold text-gray-800 pr-12 truncate" title={item.name}>
                              {item.name}
                            </h3>
                          </div>

                          <p className="text-lg font-bold text-purple-600 mb-1">
                            {item.quantity} {item.unit}
                          </p>

                          {item.expiryDate && (
                            <p className="text-xs text-gray-500 mb-1">
                              Exp: {new Date(item.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          )}

                          {item.notes && (
                            <p className="text-xs text-gray-400 truncate" title={item.notes}>
                              {item.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="e.g., Onion"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    {UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  rows="2"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
