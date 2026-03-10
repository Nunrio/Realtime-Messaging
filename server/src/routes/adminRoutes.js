const express = require('express');
const router = express.Router();
const { verifyToken } = require('../config/auth');
const {
    getAllUsers,
    getUserById,
    muteUser,
    unmuteUser,
    banUser,
    unbanUser,
    changeUserRole,
    archiveUser,
    unarchiveUser
} = require('../controllers/adminController');

// Middleware to check if user is admin or above
const requireAdmin = (req, res, next) => {
    const allowedRoles = ['moderator', 'admin', 'founder'];
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
};

// All routes require authentication and admin role
router.use(verifyToken);
router.use(requireAdmin);

// @route   GET /api/admin/users
// @desc    Get all users with optional filters
// @access  Admin+
router.get('/users', getAllUsers);

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Admin+
router.get('/users/:id', getUserById);

// @route   PATCH /api/admin/users/:userId/mute
// @desc    Mute user
// @access  Moderator+
router.patch('/users/:userId/mute', muteUser);

// @route   PATCH /api/admin/users/:userId/unmute
// @desc    Unmute user
// @access  Moderator+
router.patch('/users/:userId/unmute', unmuteUser);

// @route   PATCH /api/admin/users/:userId/ban
// @desc    Ban user
// @access  Admin+
router.patch('/users/:userId/ban', banUser);

// @route   PATCH /api/admin/users/:userId/unban
// @desc    Unban user
// @access  Admin+
router.patch('/users/:userId/unban', unbanUser);

// @route   PATCH /api/admin/users/:userId/role
// @desc    Change user role
// @access  Founder only
router.patch('/users/:userId/role', changeUserRole);

// @route   PATCH /api/admin/users/:userId/archive
// @desc    Archive user (soft delete)
// @access  Founder only
router.patch('/users/:userId/archive', archiveUser);

// @route   PATCH /api/admin/users/:userId/unarchive
// @desc    Unarchive user
// @access  Founder only
router.patch('/users/:userId/unarchive', unarchiveUser);

module.exports = router;

