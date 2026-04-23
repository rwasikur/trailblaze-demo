const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure base upload directory exists
const baseUploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir, { recursive: true });
}

// Storage configuration with dynamic folder selection
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Default to profiles if not specified or for backward compatibility
        let subFolder = 'profiles';
        
        // Determine subfolder based on fieldname or custom header/param if needed
        if (file.fieldname === 'car_image' || file.fieldname === 'secondary_images') {
            subFolder = 'cars';
        }

        const targetDir = path.join(baseUploadDir, subFolder);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        cb(null, targetDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const prefix = file.fieldname === 'car_image' ? 'car' : 
                      file.fieldname === 'secondary_images' ? 'gallery' : 'profile';
        cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
    }
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|avif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, WEBP and AVIF are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for car high-res images
    fileFilter: fileFilter
});

module.exports = upload;
