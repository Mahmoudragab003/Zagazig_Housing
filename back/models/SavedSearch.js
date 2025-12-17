const mongoose = require('mongoose');

const SavedSearchSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: 'بحث محفوظ'
    },
    criteria: {
        type: Object, // Stores filters like { minPrice: 1000, district: 'Al Qawmia' }
        required: true
    },
    isAlertEnabled: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SavedSearch', SavedSearchSchema);
