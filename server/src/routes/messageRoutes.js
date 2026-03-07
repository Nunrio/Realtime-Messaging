const express = require('express');
const router = express.Router();
const { getMessages, getRecentMessages, getMessageReactions } = require('../controllers/messageController');
const { verifyToken } = require('../config/auth');

// All routes require authentication
router.use(verifyToken);

// @route   GET /api/groups/:groupId/messages
// @desc    Get messages for a group (paginated)
// @access  Private
router.get('/:groupId/messages', getMessages);

// @route   GET /api/groups/:groupId/messages/recent
// @desc    Get recent messages for a group
// @access  Private
router.get('/:groupId/messages/recent', getRecentMessages);

// @route   GET /api/messages/:messageId/reactions
// @desc    Get reactions for a message
// @access  Private
router.get('/:messageId/reactions', getMessageReactions);

module.exports = router;

