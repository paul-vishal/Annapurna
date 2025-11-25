const express = require('express');
const router = express.Router();
const InventoryItem = require('../models/Inventory');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const items = await InventoryItem.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const item = await InventoryItem.findOne({ _id: req.params.id, user: req.user._id });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { name, category, quantity, unit, expiryDate, notes } = req.body;

    const existingItem = await InventoryItem.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      unit
    });

    if (existingItem) {
      existingItem.quantity = Number(existingItem.quantity) + Number(quantity);
      if (expiryDate) existingItem.expiryDate = expiryDate;
      if (notes) existingItem.notes = notes;
      if (category) existingItem.category = category;
      await existingItem.save();
      return res.status(200).json(existingItem);
    }

    const item = await InventoryItem.create({
      user: req.user._id,
      name,
      category,
      quantity,
      unit,
      expiryDate,
      notes
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: 'Error creating item', error: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { name, category, quantity, unit, expiryDate, notes } = req.body;

    const item = await InventoryItem.findOne({ _id: req.params.id, user: req.user._id });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.name = name || item.name;
    item.category = category || item.category;
    item.quantity = quantity !== undefined ? quantity : item.quantity;
    
    item.unit = unit || item.unit;
    item.expiryDate = expiryDate || item.expiryDate;
    item.notes = notes !== undefined ? notes : item.notes;

    await item.save();

    res.json(item);
  } catch (error) {
    res.status(400).json({ message: 'Error updating item', error: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await InventoryItem.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/inventory/batch
// @desc    Add multiple inventory items at once
// @access  Private
router.post('/batch', protect, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of items' });
    }

    const createdItems = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const itemData = items[i];

      try {
        // Check if item already exists for this user
        const existingItem = await InventoryItem.findOne({
          user: req.user._id,
          name: new RegExp(`^${itemData.name}$`, 'i'),
          unit: itemData.unit || 'units'
        });

        if (existingItem) {
          // Merge quantities if item exists
          existingItem.quantity = Number(existingItem.quantity) + Number(itemData.quantity || 1);
          if (itemData.expiryDate) {
            existingItem.expiryDate = itemData.expiryDate;
          }
          if (itemData.notes) {
            existingItem.notes = itemData.notes;
          }
          if (itemData.category) {
            existingItem.category = itemData.category;
          }
          await existingItem.save();
          createdItems.push(existingItem);
        } else {
          // Create new item
          const newItem = await InventoryItem.create({
            user: req.user._id,
            name: itemData.name,
            category: itemData.category || 'Other',
            quantity: itemData.quantity || 1,
            unit: itemData.unit || 'units',
            expiryDate: itemData.expiryDate,
            notes: itemData.notes
          });
          createdItems.push(newItem);
        }
      } catch (itemError) {
        errors.push({
          item: itemData.name,
          error: itemError.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Added ${createdItems.length} items successfully`,
      items: createdItems,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Batch import error:', error);
    res.status(500).json({ message: 'Server error during batch import' });
  }
});

module.exports = router;
