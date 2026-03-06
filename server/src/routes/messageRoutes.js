const express = require('express');
const router = express.Router();
const { getMessages, getRecentMessages, getMessageReactions } = require('../controllers/messageController');
const { verifyToken } = require('../config/auth');

// All routes require authentication
router.use(verifyToken);

// @route   GET /api/rooms/:roomId/messages
// @desc    Get messages for a room (paginated)
// @access  Private
router.get('/:roomId/messages', getMessages);

// @route   GET /api/rooms/:roomId/messages/recent
// @desc    Get recent messages for a room
// @access  Private
router.get('/:roomId/messages/recent', getRecentMessages);

// @route   GET /api/messages/:messageId/reactions
// @desc    Get reactions for a message
// @access  Private
router.get('/:messageId/reactions', getMessageReactions);

module.exports = router;

