/**
 * مسارات الرسائل (Messages Routes)
 * إرسال واستقبال الرسائل بين المستخدمين
 */

const express = require('express');
const User = require('../models/User');
const Message = require('../models/Message');
const sendEmail = require('../utils/sendEmail');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/messages
 * @desc    إرسال رسالة جديدة
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    try {
        const { receiver, listing, message } = req.body;

        // التحقق من البيانات المطلوبة
        if (!receiver || !listing || !message) {
            return res.status(400).json({
                success: false,
                message: 'جميع الحقول مطلوبة (المستلم، الإعلان، الرسالة)'
            });
        }

        // منع المستخدم من إرسال رسالة لنفسه
        if (receiver.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'لا يمكنك إرسال رسالة لنفسك'
            });
        }

        const newMessage = await Message.create({
            sender: req.user._id,
            receiver,
            listing,
            message
        });

        await newMessage.populate('sender', 'firstName lastName');
        await newMessage.populate('receiver', 'firstName lastName email'); // Populate email to send notification

        // Send Email Notification
        try {
            const receiverUser = newMessage.receiver;
            if (receiverUser && receiverUser.email) {
                await sendEmail({
                    email: receiverUser.email,
                    subject: 'New Message - Zagazig Housing',
                    message: `You have received a new message from ${newMessage.sender.firstName} regarding your listing. Login to view it.`
                });
            }
        } catch (emailErr) {
            console.error('Email notification failed:', emailErr);
            // Continue without failing the request
        }

        // Emit Socket.io event to both receiver and sender
        const io = req.app.get('io');
        if (io) {
            // إرسال للمستقبل
            io.to(receiver.toString()).emit('new_message', newMessage);
            // إرسال للمرسل أيضاً (للتزامن في حالة فتح من أجهزة متعددة)
            io.to(req.user._id.toString()).emit('message_sent', newMessage);
        }

        res.status(201).json({
            success: true,
            message: 'تم إرسال الرسالة بنجاح',
            data: { message: newMessage }
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطأ في إرسال الرسالة'
        });
    }
});

/**
 * @route   GET /api/messages
 * @desc    الحصول على رسائل المستخدم
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        })
            .populate('sender', 'firstName lastName')
            .populate('receiver', 'firstName lastName')
            .populate('listing', 'title')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: { messages }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب الرسائل'
        });
    }
});

/**
 * @route   GET /api/messages/conversation/:userId
 * @desc    الحصول على محادثة مع مستخدم معين
 * @access  Private
 */
router.get('/conversation/:userId', protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { sender: req.user._id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user._id }
            ]
        })
            .populate('sender', 'firstName lastName')
            .populate('listing', 'title')
            .sort({ createdAt: 1 });

        // تحديث حالة القراءة
        await Message.updateMany(
            { sender: req.params.userId, receiver: req.user._id, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            data: { messages }
        });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المحادثة'
        });
    }
});

/**
 * @route   GET /api/messages/unread-count
 * @desc    عدد الرسائل غير المقروءة
 * @access  Private
 */
router.get('/unread-count', protect, async (req, res) => {
    try {
        const count = await Message.countDocuments({
            receiver: req.user._id,
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
 * @route   DELETE /api/messages/conversation/:userId
 * @desc    حذف جميع الرسائل مع مستخدم معين
 * @access  Private
 */
router.delete('/conversation/:userId', protect, async (req, res) => {
    try {
        const result = await Message.deleteMany({
            $or: [
                { sender: req.user._id, receiver: req.params.userId },
                { sender: req.params.userId, receiver: req.user._id }
            ]
        });

        res.json({
            success: true,
            message: `تم حذف ${result.deletedCount} رسالة بنجاح`,
            data: { deletedCount: result.deletedCount }
        });
    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في حذف المحادثة'
        });
    }
});

module.exports = router;
