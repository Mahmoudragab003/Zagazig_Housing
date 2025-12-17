const fs = require('fs');
const path = require('path');

/**
 * Delete file from uploads directory
 * @param {string} filePath - Relative path to file (e.g., '/uploads/image.jpg')
 */
const deleteFile = (filePath) => {
    if (!filePath) return;

    // Remove leading slash if present
    const relativePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;

    // Construct absolute path
    const absolutePath = path.join(__dirname, '../', relativePath);

    // Check if file exists and delete it
    if (fs.existsSync(absolutePath)) {
        try {
            fs.unlinkSync(absolutePath);
            console.log(`Deleted file: ${absolutePath}`);
        } catch (err) {
            console.error(`Error deleting file ${absolutePath}:`, err);
        }
    }
};

module.exports = deleteFile;
