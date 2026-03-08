const User = require('../models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { display_name, gender, birthday, bio } = req.body;

    // Build update object
    const updateData = {};
    if (display_name !== undefined) updateData.display_name = display_name || null;
    if (gender !== undefined) updateData.gender = gender;
    if (birthday !== undefined) updateData.birthday = birthday || null;
    if (bio !== undefined) {
      // Limit bio to 300 characters
      const bioText = bio.substring(0, 300);
      updateData.bio = bioText || null;
    }

    // Calculate age if birthday is provided
    if (birthday) {
      const birthDate = new Date(birthday);
      const today = new Date();
      if (!isNaN(birthDate.getTime()) && birthDate <= today) {
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        updateData.age = age >= 0 ? age : null;
      }
    } else {
      updateData.age = null;
    }

    const updatedUser = await User.update(userId, updateData);

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        display_name: updatedUser.display_name,
        email: updatedUser.email,
        gender: updatedUser.gender,
        birthday: updatedUser.birthday,
        age: updatedUser.age,
        bio: updatedUser.bio,
        profile_picture: updatedUser.profile_picture
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user password
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all password fields' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Get current user to verify current password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await User.verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.updatePassword(userId, hashedPassword);

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate file type
    const allowedExtensions = /jpeg|jpg|png|webp|gif$/;
    const extname = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    
    if (!allowedExtensions.test(extname)) {
      // Remove uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Only image files (JPEG, JPG, PNG, WEBP, GIF) are allowed' });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'File size must be less than 5MB' });
    }

    // Get old profile picture to delete (if not default)
    const user = await User.findById(userId);
    const oldPicture = user.profile_picture;

    // Construct the URL path for the uploaded file
    // The file is saved in /uploads directory
    const profilePictureUrl = `/uploads/${req.file.filename}`;

    // Update user profile picture
    await User.update(userId, { profile_picture: profilePictureUrl });

    // Delete old profile picture if it's not the default
    if (oldPicture && oldPicture !== '/images/default-avatar.webp') {
      const oldPath = path.join(__dirname, '../../..', oldPicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    res.json({
      success: true,
      profile_picture: profilePictureUrl,
      message: 'Profile picture updated successfully'
    });
  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  updateProfile,
  updatePassword,
  uploadProfilePicture
};

