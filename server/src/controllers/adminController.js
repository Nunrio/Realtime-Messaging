const User = require('../models/User');

// Helper to check role hierarchy
const canPerformAction = (currentUserRole, targetUserRole, action) => {
    const roleHierarchy = {
        'founder': 4,
        'admin': 3,
        'moderator': 2,
        'user': 1
    };

    const currentLevel = roleHierarchy[currentUserRole] || 0;
    const targetLevel = roleHierarchy[targetUserRole] || 0;

    switch (action) {
        case 'mute':
            // Moderators and above can mute
            return currentLevel >= 2;
        case 'ban':
            // Admins and above can ban (not moderators)
            return currentLevel >= 3;
        case 'changeRole':
            // Only founder can change roles
            return currentLevel === 4;
        case 'archive':
            // Only founder can archive
            return currentLevel === 4;
        default:
            return false;
    }
};

// Get all users with filters
const getAllUsers = async (req, res) => {
    try {
        const { search, role, status } = req.query;
        
        const users = await User.getAllWithFilters(search, role, status);
        
        // Add computed status to each user
        const usersWithStatus = users.map(user => ({
            ...user,
            computedStatus: User.getStatus(user)
        }));

        res.json({
            success: true,
            users: usersWithStatus
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findByIdWithModeration(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                ...user,
                computedStatus: User.getStatus(user)
            }
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Mute user
const muteUser = async (req, res) => {
    try {
        const currentUser = req.user;
        const { userId } = req.params;
        const { mutedUntil } = req.body;

        // Can't mute yourself
        if (currentUser.id === parseInt(userId)) {
            return res.status(400).json({ message: 'You cannot mute yourself' });
        }

        // Get target user
        const targetUser = await User.findByIdWithModeration(userId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check permissions
        if (!canPerformAction(currentUser.role, targetUser.role, 'mute')) {
            return res.status(403).json({ message: 'You do not have permission to mute this user' });
        }

        // Can't mute founder
        if (targetUser.role === 'founder') {
            return res.status(403).json({ message: 'Cannot mute founder' });
        }

        await User.muteUser(userId, mutedUntil || null);

        res.json({
            success: true,
            message: `User ${targetUser.username} has been muted`
        });
    } catch (error) {
        console.error('Mute user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Unmute user
const unmuteUser = async (req, res) => {
    try {
        const currentUser = req.user;
        const { userId } = req.params;

        const targetUser = await User.findByIdWithModeration(userId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check permissions
        if (!canPerformAction(currentUser.role, targetUser.role, 'mute')) {
            return res.status(403).json({ message: 'You do not have permission to unmute this user' });
        }

        await User.unmuteUser(userId);

        res.json({
            success: true,
            message: `User ${targetUser.username} has been unmuted`
        });
    } catch (error) {
        console.error('Unmute user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Ban user
const banUser = async (req, res) => {
    try {
        const currentUser = req.user;
        const { userId } = req.params;
        const { reason } = req.body;

        // Can't ban yourself
        if (currentUser.id === parseInt(userId)) {
            return res.status(400).json({ message: 'You cannot ban yourself' });
        }

        const targetUser = await User.findByIdWithModeration(userId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check permissions - only admin and founder can ban
        if (!canPerformAction(currentUser.role, targetUser.role, 'ban')) {
            return res.status(403).json({ message: 'You do not have permission to ban this user' });
        }

        // Can't ban founder
        if (targetUser.role === 'founder') {
            return res.status(403).json({ message: 'Cannot ban founder' });
        }

        // Can't ban other admins
        if (targetUser.role === 'admin' && currentUser.role !== 'founder') {
            return res.status(403).json({ message: 'Cannot ban admin' });
        }

        await User.banUser(userId, reason || null);

        res.json({
            success: true,
            message: `User ${targetUser.username} has been banned`
        });
    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Unban user
const unbanUser = async (req, res) => {
    try {
        const currentUser = req.user;
        const { userId } = req.params;

        const targetUser = await User.findByIdWithModeration(userId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check permissions
        if (!canPerformAction(currentUser.role, targetUser.role, 'ban')) {
            return res.status(403).json({ message: 'You do not have permission to unban this user' });
        }

        await User.unbanUser(userId);

        res.json({
            success: true,
            message: `User ${targetUser.username} has been unbanned`
        });
    } catch (error) {
        console.error('Unban user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Change user role
const changeUserRole = async (req, res) => {
    try {
        const currentUser = req.user;
        const { userId } = req.params;
        const { role } = req.body;

        // Only founder can change roles
        if (currentUser.role !== 'founder') {
            return res.status(403).json({ message: 'Only founder can change user roles' });
        }

        // Can't change own role
        if (currentUser.id === parseInt(userId)) {
            return res.status(400).json({ message: 'You cannot change your own role' });
        }

        const validRoles = ['user', 'moderator', 'admin', 'founder'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const targetUser = await User.findByIdWithModeration(userId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.changeRole(userId, role);

        res.json({
            success: true,
            message: `User ${targetUser.username}'s role has been changed to ${role}`
        });
    } catch (error) {
        console.error('Change user role error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Archive user (soft delete)
const archiveUser = async (req, res) => {
    try {
        const currentUser = req.user;
        const { userId } = req.params;

        // Only founder can archive
        if (currentUser.role !== 'founder') {
            return res.status(403).json({ message: 'Only founder can archive users' });
        }

        // Can't archive yourself
        if (currentUser.id === parseInt(userId)) {
            return res.status(400).json({ message: 'You cannot archive yourself' });
        }

        const targetUser = await User.findByIdWithModeration(userId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Can't archive founder
        if (targetUser.role === 'founder') {
            return res.status(403).json({ message: 'Cannot archive founder' });
        }

        await User.archiveUser(userId);

        res.json({
            success: true,
            message: `User ${targetUser.username} has been archived`
        });
    } catch (error) {
        console.error('Archive user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Unarchive user
const unarchiveUser = async (req, res) => {
    try {
        const currentUser = req.user;
        const { userId } = req.params;

        // Only founder can unarchive
        if (currentUser.role !== 'founder') {
            return res.status(403).json({ message: 'Only founder can unarchive users' });
        }

        const targetUser = await User.findByIdWithModeration(userId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.unarchiveUser(userId);

        res.json({
            success: true,
            message: `User ${targetUser.username} has been unarchived`
        });
    } catch (error) {
        console.error('Unarchive user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    muteUser,
    unmuteUser,
    banUser,
    unbanUser,
    changeUserRole,
    archiveUser,
    unarchiveUser
};

