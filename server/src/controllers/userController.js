const User = require('../models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
const { display_name, gender, birthday, bio, status } = req.body;

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

    if (status !== undefined) {
      const validStatuses = ['Online', 'away', 'do not disturb', 'invisible', 'Offline'];
      if (validStatuses.includes(status)) {
        updateData.status = status;
        updateData.last_status = status;
      }
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

// Verify current password - Step 1 of password change
const verifyCurrentPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ message: 'Please provide your current password' });
    }

    // Get current user with password
    const user = await User.findByIdWithPassword(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await User.verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    res.json({
      success: true,
      message: 'Password verified successfully'
    });
  } catch (error) {
    console.error('Verify password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user password - Step 2 (after current password is verified)
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword, confirmPassword } = req.body;

    // Validation - now only requires new password (current password already verified)
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide new password and confirmation' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
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
  verifyCurrentPassword,
  updatePassword,
  uploadProfilePicture
};

