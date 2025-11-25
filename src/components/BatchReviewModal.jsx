import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function BatchReviewModal({ items, onClose, onSuccess }) {
  const { token } = useAuth();
  const [editedItems, setEditedItems] = useState(items.map(item => ({ ...item, selected: true })));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = ['vegetables', 'fruits', 'grains', 'dairy', 'protein', 'oil', 'spices', 'nuts', 'other'];
  const units = ['kg', 'g', 'lbs', 'oz', 'liters', 'ml', 'pieces', 'cups'];

  const handleItemChange = (index, field, value) => {
    const updated = [...editedItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditedItems(updated);
  };

  const handleToggleItem = (index) => {
    const updated = [...editedItems];
    updated[index] = { ...updated[index], selected: !updated[index].selected };
    setEditedItems(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = editedItems.filter((_, i) => i !== index);
    setEditedItems(updated);
  };

  const handleAddToInventory = async () => {
    const selectedItems = editedItems.filter(item => item.selected);

    if (selectedItems.length === 0) {
      setError('Please select at least one item to add');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/inventory/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: selectedItems.map(({ selected, ...item }) => item)
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess(data);
      } else {
        setError(data.message || 'Failed to add items');
      }
    } catch (err) {
      console.error('Batch import error:', err);
      setError('Failed to add items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedCount = editedItems.filter(item => item.selected).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-3xl">✅</span>
                Review Items
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Review and edit items before adding to inventory ({selectedCount} selected)
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {editedItems.map((item, index) => (
              <div
                key={index}
                className={`border-2 rounded-xl p-4 transition ${
                  item.selected
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => handleToggleItem(index)}
                    className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />

                  {/* Item Fields */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Item Name
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={item.category}
                        onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700 text-xl mt-1"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editedItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg">No items to review</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToInventory}
              disabled={loading || selectedCount === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding to Inventory...
                </span>
              ) : (
                `Add ${selectedCount} Item${selectedCount !== 1 ? 's' : ''} to Inventory`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BatchReviewModal;
