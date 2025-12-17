/**
 * إعداد رفع الملفات (Upload Configuration)
 * استخدام Multer لرفع صور الشقق
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// إنشاء مجلد الصور إذا لم يكن موجوداً
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// إعدادات التخزين
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // اسم فريد للملف
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

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
