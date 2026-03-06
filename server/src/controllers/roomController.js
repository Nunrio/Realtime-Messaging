const Room = require('../models/Room');

// Create a new room
const createRoom = async (req, res) => {
    try {
        const { room_name } = req.body;
        const userId = req.user.id;

        if (!room_name) {
            return res.status(400).json({ message: 'Room name is required' });
        }

        const room = await Room.create(room_name, userId);

        res.status(201).json({
            success: true,
            room
        });
    } catch (error) {
        console.error('Create room error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all rooms
const getRooms = async (req, res) => {
    try {
        const rooms = await Room.getAll();

        res.json({
            success: true,
            rooms
        });
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's rooms
const getUserRooms = async (req, res) => {
    try {
        const userId = req.user.id;
        const rooms = await Room.getByUserId(userId);

        res.json({
            success: true,
            rooms
        });
    } catch (error) {
        console.error('Get user rooms error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get room by ID
const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await Room.findById(id);

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if user is a member
        const isMember = await Room.isMember(id, req.user.id);

        res.json({
            success: true,
            room,
            isMember
        });
    } catch (error) {
        console.error('Get room error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Join a room
const joinRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        await Room.addMember(id, userId);

        res.json({
            success: true,
            message: 'Joined room successfully'
        });
    } catch (error) {
        console.error('Join room error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Leave a room
const leaveRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        await Room.removeMember(id, userId);

        res.json({
            success: true,
            message: 'Left room successfully'
        });
    } catch (error) {
        console.error('Leave room error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get room members
const getRoomMembers = async (req, res) => {
    try {
        const { id } = req.params;
        
        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const members = await Room.getMembers(id);

        res.json({
            success: true,
            members
        });
    } catch (error) {
        console.error('Get room members error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createRoom,
    getRooms,
    getUserRooms,
    getRoomById,
    joinRoom,
    leaveRoom,
    getRoomMembers
};

