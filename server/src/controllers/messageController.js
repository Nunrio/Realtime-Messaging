const Message = require('../models/Message');
const Room = require('../models/Room');

// Get messages for a room
const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const messages = await Message.getByRoom(roomId, parseInt(limit), parseInt(offset));

        res.json({
            success: true,
            messages,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: await Message.getCount(roomId)
            }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get recent messages (simpler)
const getRecentMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { limit = 50 } = req.query;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const messages = await Message.getRecent(roomId, parseInt(limit));

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Get recent messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get reactions for a message
const getMessageReactions = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        const reactions = await Message.getReactions(messageId);

        res.json({
            success: true,
            reactions
        });
    } catch (error) {
        console.error('Get reactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMessages,
    getRecentMessages,
    getMessageReactions
};

