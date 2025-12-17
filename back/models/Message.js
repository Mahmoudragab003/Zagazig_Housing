/**
 * نموذج الرسائل (Messages Model)
 * للتواصل بين الطلاب والملاك
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // المرسل
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // المستقبل
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // الإعلان المرتبط
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    // محتوى الرسالة
    message: {
        type: String,
        required: [true, 'الرسالة مطلوبة'],
        maxlength: [1000, 'الرسالة طويلة جداً']
    },
    // هل تم قراءتها
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// فهرس للبحث السريع
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ listing: 1 });

module.exports = mongoose.model('Message', messageSchema);
