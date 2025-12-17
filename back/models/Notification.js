/**
 * نموذج الإشعارات (Notification Model)
 * للإشعارات الفورية وتنبيهات البحث الذكي
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // المستخدم المستلم
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // نوع الإشعار
    type: {
        type: String,
        enum: ['message', 'review', 'listing_match', 'listing_approved', 'listing_rejected', 'system'],
        required: true
    },
    // عنوان الإشعار
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    // محتوى الإشعار
    message: {
        type: String,
        required: true,
        maxlength: 500
    },
    // بيانات إضافية للتنقل
    data: {
        listingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Listing'
        },
        messageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        },
        savedSearchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SavedSearch'
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        // رابط مخصص للتنقل
        link: String
    },
    // هل تم قراءته
    isRead: {
        type: Boolean,
        default: false
    },
    // تاريخ القراءة
    readAt: {
        type: Date
    }
}, {
    timestamps: true
});

// فهارس للبحث السريع
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

// تحديد كمقروء
notificationSchema.methods.markAsRead = async function () {
    if (!this.isRead) {
        this.isRead = true;
        this.readAt = new Date();
        await this.save();
    }
    return this;
};

// حذف الإشعارات القديمة (أكثر من 30 يوم)
notificationSchema.statics.cleanOldNotifications = async function () {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await this.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        isRead: true
    });
};

module.exports = mongoose.model('Notification', notificationSchema);
