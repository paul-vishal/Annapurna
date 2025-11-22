import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const COMMON_ITEMS = [
  { name: 'Onion', category: 'vegetables', unit: 'kg' },
  { name: 'Tomato', category: 'vegetables', unit: 'kg' },
  { name: 'Potato', category: 'vegetables', unit: 'kg' },
  { name: 'Spinach', category: 'vegetables', unit: 'kg' },
  { name: 'Carrot', category: 'vegetables', unit: 'kg' },
  { name: 'Rice', category: 'grains', unit: 'kg' },
  { name: 'Wheat Flour', category: 'grains', unit: 'kg' },
  { name: 'Lentils (Dal)', category: 'grains', unit: 'kg' },
  { name: 'Milk', category: 'dairy', unit: 'liters' },
  { name: 'Eggs', category: 'protein', unit: 'pieces' },
  { name: 'Chicken', category: 'protein', unit: 'kg' },
  { name: 'Paneer', category: 'dairy', unit: 'g' },
  { name: 'Yogurt', category: 'dairy', unit: 'g' },
  { name: 'Vegetable Oil', category: 'oil', unit: 'liters' },
  { name: 'Olive Oil', category: 'oil', unit: 'ml' },
  { name: 'Turmeric', category: 'spices', unit: 'g' },
  { name: 'Cumin', category: 'spices', unit: 'g' },
  { name: 'Salt', category: 'spices', unit: 'g' }
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
      vegetables: 'bg-green-100 text-green-800',
      fruits: 'bg-pink-100 text-pink-800',
      grains: 'bg-yellow-100 text-yellow-800',
      dairy: 'bg-blue-100 text-blue-800',
      protein: 'bg-red-100 text-red-800',
      oil: 'bg-amber-100 text-amber-800',
      spices: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-2 transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pantry Inventory</h1>
            <p className="text-gray-600 mt-1">Manage your grocery items</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
          >
            + Add Custom Item
          </button>
        </div>

        {/* Common Items Quick Add */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Add Common Items</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {COMMON_ITEMS.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickAdd(item)}
                className="p-3 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg hover:shadow-md transition duration-200 text-sm font-medium text-gray-700 hover:border-emerald-400"
              >
                {item.name}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:shadow-lg transition duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>

                  <p className="text-2xl font-bold text-emerald-600 mb-2">
                    {item.quantity} {item.unit}
                  </p>

                  {item.expiryDate && (
                    <p className="text-sm text-gray-600 mb-2">
                      Expires: {new Date(item.expiryDate).toLocaleDateString()}
                    </p>
                  )}

                  {item.notes && (
                    <p className="text-sm text-gray-500 mb-3">{item.notes}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    placeholder="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:shadow-lg transition font-medium"
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
