const express = require('express');
const SavedSearch = require('../models/SavedSearch');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/saved-searches
 * @desc    Save a new search
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    try {
        const { criteria, title, isAlertEnabled } = req.body;

        const savedSearch = await SavedSearch.create({
            user: req.user._id,
            criteria,
            title: title || 'بحث جديد',
            isAlertEnabled: isAlertEnabled !== undefined ? isAlertEnabled : true
        });

        res.status(201).json({
            success: true,
            data: savedSearch
        });
    } catch (error) {
        console.error('Save search error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   GET /api/saved-searches
 * @desc    Get user's saved searches
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const savedSearches = await SavedSearch.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: savedSearches });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

/**
 * @route   DELETE /api/saved-searches/:id
 * @desc    Delete a saved search
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const search = await SavedSearch.findById(req.params.id);
        if (!search) return res.status(404).json({ success: false, message: 'Not found' });

        if (search.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await search.deleteOne();
        res.json({ success: true, message: 'Removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
