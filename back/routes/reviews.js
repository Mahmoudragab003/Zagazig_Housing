/**
 * مسارات التقييمات (Reviews Routes)
 */

const express = require('express');
const Review = require('../models/Review');
const Listing = require('../models/Listing');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/reviews
 * @desc    إضافة تقييم
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    try {
        const { listing, rating, comment } = req.body;

        // التحقق من وجود الإعلان
        const listingExists = await Listing.findById(listing);
        if (!listingExists) {
            return res.status(404).json({
                success: false,
                message: 'الإعلان غير موجود'
            });
        }

        // التحقق من عدم وجود تقييم سابق
        const existingReview = await Review.findOne({
            user: req.user._id,
            listing
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'لقد قمت بتقييم هذا الإعلان من قبل'
            });
        }

        const review = await Review.create({
            user: req.user._id,
            listing,
            rating,
            comment
        });

        res.status(201).json({
            success: true,
            message: 'تم إضافة التقييم بنجاح',
            data: { review }
        });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في إضافة التقييم'
        });
    }
});

/**
 * @route   GET /api/reviews/listing/:listingId
 * @desc    الحصول على تقييمات إعلان معين
 * @access  Public
 */
router.get('/listing/:listingId', async (req, res) => {
    try {
        const reviews = await Review.find({
            listing: req.params.listingId,
            isApproved: true
        })
            .populate('user', 'firstName lastName')
            .sort({ createdAt: -1 });

        // حساب المتوسط
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        res.json({
            success: true,
            data: {
                reviews,
                avgRating: Math.round(avgRating * 10) / 10,
                totalReviews: reviews.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب التقييمات'
        });
    }
});

/**
 * @route   PUT /api/reviews/:id/approve
 * @desc    الموافقة على تقييم (للمدير)
 * @access  Private/Admin
 */
router.put('/:id/approve', protect, adminOnly, async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'التقييم غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم الموافقة على التقييم',
            data: { review }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ' });
    }
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    حذف تقييم
 * @access  Private/Admin
 */
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'تم حذف التقييم' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ' });
    }
});

module.exports = router;
