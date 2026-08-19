const multer = require('multer');
const path = require('path');
const fs = require('fs');

let baseUploadDir = '/tmp/uploads';
if (!process.env.VERCEL) {
    try {
        const localDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(localDir)) {
            fs.mkdirSync(localDir, { recursive: true });
        }
        baseUploadDir = localDir;
    } catch (e) {
        baseUploadDir = '/tmp/uploads';
    }
}
try {
    if (!fs.existsSync(baseUploadDir)) {
        fs.mkdirSync(baseUploadDir, { recursive: true });
    }
} catch (e) {}

// Use memoryStorage in serverless or diskStorage locally/tmp
const storage = (process.env.VERCEL || baseUploadDir.startsWith('/tmp'))
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (req, file, cb) => {
            let subFolder = 'profiles';
            if (file.fieldname === 'car_image' || file.fieldname === 'secondary_images') {
                subFolder = 'cars';
            }
            const targetDir = path.join(baseUploadDir, subFolder);
            try {
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }
            } catch (e) {}
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
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit for car high-res images
    fileFilter: fileFilter
});

module.exports = upload;
