const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { authMiddleware } = require('../middleware/authMiddleware');

// @route   GET /api/wishlists
// @desc    Get all wishlisted items for the current user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.user.id })
      .populate({
        path: 'targetId',
        strictPopulate: false,
        populate: {
          path: 'brandId', // In case targetModel is Campaign, populate brandId
          model: 'BrandProfile',
          strictPopulate: false
        }
      });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/wishlists/toggle
// @desc    Toggle wishlist status for a specific item
// @access  Private
router.post('/toggle', authMiddleware, async (req, res) => {
  try {
    const { targetId, targetModel } = req.body;

    if (!targetId || !targetModel) {
      return res.status(400).json({ message: 'Please provide targetId and targetModel' });
    }

    const existingItem = await Wishlist.findOne({ userId: req.user.id, targetId });

    if (existingItem) {
      // Remove from wishlist
      await Wishlist.findByIdAndDelete(existingItem._id);
      return res.json({ message: 'Removed from wishlist', isWishlisted: false, targetId });
    } else {
      // Add to wishlist
      const newItem = new Wishlist({
        userId: req.user.id,
        targetId,
        targetModel
      });
      await newItem.save();
      return res.json({ message: 'Added to wishlist', isWishlisted: true, targetId, item: newItem });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/wishlists/:id
// @desc    Update folder and/or note for a wishlist item
// @access  Private
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { folder, note } = req.body;
    const item = await Wishlist.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { folder, note },
      { new: true }
    );
    
    if (!item) {
      return res.status(404).json({ message: 'Wishlist item not found' });
    }
    
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/wishlists/check/:targetId
// @desc    Check if a specific item is wishlisted by the user
// @access  Private
router.get('/check/:targetId', authMiddleware, async (req, res) => {
  try {
    const item = await Wishlist.findOne({ userId: req.user.id, targetId: req.params.targetId });
    if (item) {
      return res.json({ isWishlisted: true });
    }
    return res.json({ isWishlisted: false });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/wishlists/count
// @desc    Get count of wishlisted items for the current user
// @access  Private
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const count = await Wishlist.countDocuments({ userId: req.user.id });
    res.json({ count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
