/**
 * مسارات الإشعارات (Notifications Routes)
 * جلب وإدارة إشعارات المستخدم
 */

const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    جلب إشعارات المستخدم
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;

        const query = { user: req.user._id };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            isRead: false
        });

        res.json({
            success: true,
            data: {
                notifications,
                unreadCount,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الإشعارات'
        });
    }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    عدد الإشعارات غير المقروءة
 * @access  Private
 */
router.get('/unread-count', protect, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user._id,
            isRead: false
        });

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ' });
    }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    تحديد إشعار كمقروء
 * @access  Private
 */
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'الإشعار غير موجود'
            });
        }

        await notification.markAsRead();

        res.json({
            success: true,
            message: 'تم تحديد الإشعار كمقروء'
        });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الإشعار'
        });
    }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    تحديد جميع الإشعارات كمقروءة
 * @access  Private
 */
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.json({
            success: true,
            message: 'تم تحديد جميع الإشعارات كمقروءة'
        });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في تحديث الإشعارات'
        });
    }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    حذف إشعار
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'الإشعار غير موجود'
            });
        }

        await notification.deleteOne();

        res.json({
            success: true,
            message: 'تم حذف الإشعار'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الإشعار'
        });
    }
});

/**
 * @route   DELETE /api/notifications/clear-all
 * @desc    حذف جميع الإشعارات
 * @access  Private
 */
router.delete('/clear-all', protect, async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user._id });

        res.json({
            success: true,
            message: 'تم حذف جميع الإشعارات'
        });
    } catch (error) {
        console.error('Clear all notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف الإشعارات'
        });
    }
});

module.exports = router;
