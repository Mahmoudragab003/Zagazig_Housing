/**
 * إعداد رفع الملفات (Upload Configuration)
 * استخدام Multer مع Cloudinary لرفع صور الشقق
 */

const multer = require('multer');

// استخدام memory storage بدلاً من disk storage للـ Cloudinary
const storage = multer.memoryStorage();

// فلترة الملفات - صور فقط
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('نوع الملف غير مدعوم. الأنواع المسموحة: JPG, PNG, WEBP'), false);
    }
};

// إعداد Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB كحد أقصى
        files: 10 // 10 صور كحد أقصى
    }
});

module.exports = upload;

