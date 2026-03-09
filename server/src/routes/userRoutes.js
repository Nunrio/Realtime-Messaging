const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../config/auth');
const { updateProfile, updatePassword, verifyCurrentPassword, uploadProfilePicture } = require('../controllers/userController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// All routes require authentication
router.use(verifyToken);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateProfile);

// @route   POST /api/users/verify-password
// @desc    Verify current password
// @access  Private
router.post('/verify-password', verifyCurrentPassword);

// @route   PUT /api/users/password
// @desc    Update user password
// @access  Private
router.put('/password', updatePassword);

// @route   POST /api/users/profile-picture
// @desc    Upload profile picture
// @access  Private
router.post('/profile-picture', upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;

