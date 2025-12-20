/**
 * مسارات رفع الصور (Upload Routes)
 * رفع الصور إلى Cloudinary
 */

const express = require('express');
const upload = require('../config/upload');
const cloudinary = require('../config/cloudinary');
const { protect, vendorOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * Helper function to upload buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, folder = 'zagazig_housing') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'image',
                transformation: [
                    { width: 1200, height: 800, crop: 'limit' },
                    { quality: 'auto' }
                ]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

/**
 * @route   POST /api/upload/images
 * @desc    رفع صور للإعلان إلى Cloudinary
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

        // رفع كل صورة إلى Cloudinary
        const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer));
        const results = await Promise.all(uploadPromises);

        // استخراج روابط الصور
        const imageUrls = results.map(result => result.secure_url);

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
 * @desc    رفع صورة واحدة إلى Cloudinary
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

        // رفع الصورة إلى Cloudinary
        const result = await uploadToCloudinary(req.file.buffer);

        res.json({
            success: true,
            message: 'تم رفع الصورة بنجاح',
            data: { image: result.secure_url }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'خطأ في رفع الصورة'
        });
    }
});

module.exports = router;

