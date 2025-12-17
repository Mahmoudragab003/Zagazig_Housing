/**
 * مسارات الإحصائيات (Stats Routes)
 * للمدير فقط
 */

const express = require('express');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Message = require('../models/Message');
const Review = require('../models/Review');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/stats/dashboard
 * @desc    Get dashboard statistics
 * @access  Admin only
 */
router.get('/dashboard', protect, adminOnly, async (req, res) => {
    try {
        // إحصائيات المستخدمين
        const totalUsers = await User.countDocuments();
        const students = await User.countDocuments({ role: 'student' });
        const vendors = await User.countDocuments({ role: 'vendor' });
        const admins = await User.countDocuments({ role: 'admin' });

        // إحصائيات الإعلانات
        const totalListings = await Listing.countDocuments();
        const activeListings = await Listing.countDocuments({ status: 'active' });
        const pendingListings = await Listing.countDocuments({ status: 'pending' });
        const rentListings = await Listing.countDocuments({ type: 'rent' });
        const sellListings = await Listing.countDocuments({ type: 'sell' });

        // إحصائيات الرسائل
        const totalMessages = await Message.countDocuments();
        const unreadMessages = await Message.countDocuments({ isRead: false });

        // إحصائيات التقييمات
        const totalReviews = await Review.countDocuments();
        const pendingReviews = await Review.countDocuments({ isApproved: false });
        const approvedReviews = await Review.countDocuments({ isApproved: true });

        // المستخدمين الجدد (آخر 7 أيام)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });
        const newListingsThisWeek = await Listing.countDocuments({ createdAt: { $gte: weekAgo } });

        // أحدث المستخدمين
        const recentUsers = await User.find()
            .select('firstName lastName email role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // أحدث الإعلانات
        const recentListings = await Listing.find()
            .select('title price type status createdAt')
            .populate('vendor', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    students,
                    vendors,
                    admins,
                    newThisWeek: newUsersThisWeek
                },
                listings: {
                    total: totalListings,
                    active: activeListings,
                    pending: pendingListings,
                    rent: rentListings,
                    sell: sellListings,
                    newThisWeek: newListingsThisWeek
                },
                messages: {
                    total: totalMessages,
                    unread: unreadMessages
                },
                reviews: {
                    total: totalReviews,
                    pending: pendingReviews,
                    approved: approvedReviews
                },
                recent: {
                    users: recentUsers,
                    listings: recentListings
                }
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

module.exports = router;
