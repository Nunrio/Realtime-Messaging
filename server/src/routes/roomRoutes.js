const express = require('express');
const router = express.Router();
const { 
    createRoom, 
    getRooms, 
    getUserRooms, 
    getRoomById, 
    joinRoom, 
    leaveRoom,
    getRoomMembers 
} = require('../controllers/roomController');
const { verifyToken } = require('../config/auth');

// All routes require authentication
router.use(verifyToken);

// @route   POST /api/rooms
// @desc    Create a new room
// @access  Private
router.post('/', createRoom);

// @route   GET /api/rooms
// @desc    Get all rooms
// @access  Private
router.get('/', getRooms);

// @route   GET /api/rooms/my
// @desc    Get user's rooms
// @access  Private
router.get('/my', getUserRooms);

// @route   GET /api/rooms/:id
// @desc    Get room by ID
// @access  Private
router.get('/:id', getRoomById);

// @route   POST /api/rooms/:id/join
// @desc    Join a room
// @access  Private
router.post('/:id/join', joinRoom);

// @route   POST /api/rooms/:id/leave
// @desc    Leave a room
// @access  Private
router.post('/:id/leave', leaveRoom);

// @route   GET /api/rooms/:id/members
// @desc    Get room members
// @access  Private
router.get('/:id/members', getRoomMembers);

module.exports = router;

