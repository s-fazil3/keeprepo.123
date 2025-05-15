const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Middleware to handle single file upload
const uploadProfilePhoto = upload.single('photo');

// Middleware to handle file upload and update request body
const handleUpload = (req, res, next) => {
  uploadProfilePhoto(req, res, function (err) {
    if (err) {
      return res.status(400).json({ 
        message: 'File upload failed',
        error: err.message 
      });
    }
    
    // If file was uploaded successfully, update the request body
    if (req.file) {
      // Construct the URL to the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      req.body.photo = fileUrl;
    }
    
    next();
  });
};

module.exports = handleUpload;
