const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const path = require('path');

const router = express.Router();

let storage;
// Use Cloudinary only if the cloud name is provided and not the default 'demo'
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'demo') {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'stayhub_uploads',
      allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
    },
  });
} else {
  // Use local disk storage fallback
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });
}

const upload = multer({ storage: storage });

// @route POST api/upload
// @desc Upload multiple images
router.post('/', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: 'No files uploaded' });
    }
    
    const urls = req.files.map(file => {
      // Cloudinary file will have a secure_url or path starting with http
      if (file.path && file.path.startsWith('http')) {
        return file.path;
      }
      // Otherwise, it's a local file upload
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      return `${baseUrl}/uploads/${file.filename}`;
    });
    
    res.json({ urls });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ msg: 'Server error during upload' });
  }
});

module.exports = router;
