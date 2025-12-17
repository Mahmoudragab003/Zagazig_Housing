/**
 * مسارات رفع الصور (Upload Routes)
 */

const express = require('express');
const upload = require('../config/upload');
const { protect, vendorOnly } = require('../middleware/auth');
const path = require('path');

const router = express.Router();

/**
 * @route   POST /api/upload/images
 * @desc    رفع صور للإعلان
 * @access  Private (Vendor)
 */
router.post('/images', protect, vendorOnly, upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع أي صور'
            });
        }

        // إنشاء روابط الصور
        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

        res.json({
            success: true,
            message: `تم رفع ${req.files.length} صورة بنجاح`,
            data: { images: imageUrls }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطأ في رفع الصور'
        });
    }
});

/**
 * @route   POST /api/upload/image
 * @desc    رفع صورة واحدة
 * @access  Private (Vendor)
 */
router.post('/image', protect, vendorOnly, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع صورة'
            });
        }

        res.json({
            success: true,
            message: 'تم رفع الصورة بنجاح',
            data: { image: `/uploads/${req.file.filename}` }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'خطأ في رفع الصورة'
        });
    }
});

module.exports = router;
