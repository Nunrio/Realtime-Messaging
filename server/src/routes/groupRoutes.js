
const express = require('express');
const router = express.Router();
const { 
    createGroup, 
    getGroups, 
    getUserGroups, 
    getGroupById, 
    joinGroup, 
    leaveGroup,
    getGroupMembers 
} = require('../controllers/groupController');
const { verifyToken } = require('../config/auth');

// All routes require authentication
router.use(verifyToken);

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private
router.post('/', createGroup);

// @route   GET /api/groups
// @desc    Get all groups
// @access  Private
router.get('/', getGroups);

// @route   GET /api/groups/my
// @desc    Get user's groups
// @access  Private
router.get('/my', getUserGroups);

// @route   GET /api/groups/:id
// @desc    Get group by ID
// @access  Private
router.get('/:id', getGroupById);

// @route   POST /api/groups/:id/join
// @desc    Join a group
// @access  Private
router.post('/:id/join', joinGroup);

// @route   POST /api/groups/:id/leave
// @desc    Leave a group
// @access  Private
router.post('/:id/leave', leaveGroup);

// @route   GET /api/groups/:id/members
// @desc    Get group members
// @access  Private
router.get('/:id/members', getGroupMembers);

module.exports = router;

