
const Group = require('../models/Group');

// Create a new group
const createGroup = async (req, res) => {
    try {
        const { group_name } = req.body;
        const userId = req.user.id;

        if (!group_name) {
            return res.status(400).json({ message: 'Group name is required' });
        }

        const group = await Group.create(group_name, userId);

        res.status(201).json({
            success: true,
            group
        });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all groups
const getGroups = async (req, res) => {
    try {
        const groups = await Group.getAll();

        res.json({
            success: true,
            groups
        });
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user's groups
const getUserGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const groups = await Group.getByUserId(userId);

        res.json({
            success: true,
            groups
        });
    } catch (error) {
        console.error('Get user groups error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get group by ID
const getGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        const group = await Group.findById(id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is a member
        const isMember = await Group.isMember(id, req.user.id);

        res.json({
            success: true,
            group,
            isMember
        });
    } catch (error) {
        console.error('Get group error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Join a group
const joinGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        await Group.addMember(id, userId);

        res.json({
            success: true,
            message: 'Joined group successfully'
        });
    } catch (error) {
        console.error('Join group error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Leave a group
const leaveGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        await Group.removeMember(id, userId);

        res.json({
            success: true,
            message: 'Left group successfully'
        });
    } catch (error) {
        console.error('Leave group error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get group members
const getGroupMembers = async (req, res) => {
    try {
        const { id } = req.params;
        
        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const members = await Group.getMembers(id);

        res.json({
            success: true,
            members
        });
    } catch (error) {
        console.error('Get group members error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createGroup,
    getGroups,
    getUserGroups,
    getGroupById,
    joinGroup,
    leaveGroup,
    getGroupMembers
};

