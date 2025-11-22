const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'grains', 'dairy', 'protein', 'oil', 'spices', 'other'],
    default: 'other'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'lbs', 'oz', 'liters', 'ml', 'pieces', 'cups'],
    default: 'pieces'
  },
  expiryDate: {
    type: Date
  },
  addedDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

inventoryItemSchema.index({ user: 1, name: 1 });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;
