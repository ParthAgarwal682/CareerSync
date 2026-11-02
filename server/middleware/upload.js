const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Resume Upload (PDF only, 5MB)
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'placement-cell/resumes',
    format: async (req, file) => 'pdf',
    public_id: (req, file) => `resume_${req.user.student_id}_${Date.now()}`,
  },
});

const uploadResume = multer({ 
    storage: resumeStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed for resumes!'), false);
        }
    }
});

// Profile Picture Upload (Image only, 2MB)
const profilePicStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'placement-cell/profile-pics',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    public_id: (req, file) => `profile_${req.user.student_id}_${Date.now()}`,
  },
});

const uploadProfilePic = multer({
    storage: profilePicStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Company Logo Upload (Image only, 2MB)
const companyLogoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'placement-cell/company-logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    transformation: [{ width: 256, height: 256, crop: 'pad', background: 'white' }],
    public_id: (req, file) => `logo_${Date.now()}`,
  },
});

const uploadCompanyLogo = multer({
    storage: companyLogoStorage,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'image/svg+xml') {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

module.exports = { uploadResume, uploadProfilePic, uploadCompanyLogo };
