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

module.exports = router;
