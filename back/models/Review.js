/**
 * نموذج التقييمات (Review Model)
 * تقييم الطلاب للإعلانات والملاك
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    // المستخدم المقيّم
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // الإعلان
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    // التقييم (1-5)
    rating: {
        type: Number,
        required: [true, 'التقييم مطلوب'],
        min: [1, 'أقل تقييم هو 1'],
        max: [5, 'أعلى تقييم هو 5']
    },
    // التعليق
    comment: {
        type: String,
        maxlength: [500, 'التعليق طويل جداً']
    },
    // موافقة المدير
    isApproved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// منع تكرار التقييم من نفس المستخدم للإعلان
reviewSchema.index({ user: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
