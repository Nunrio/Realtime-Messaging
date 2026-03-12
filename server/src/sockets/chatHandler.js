
const db = require('../config/db');
const Message = require('../models/Message');
const Group = require('../models/Group');
const Note = require('../models/Note');
const User = require('../models/User');

// Track online users: { groupId: { userId: { id, username, socketId } } }
const onlineUsers = {};
const userTimeouts = new Map();

// Helper to get online users in a group
const getOnlineUsersInGroup = (groupId) => {
    if (!onlineUsers[groupId]) return [];
    return Object.values(onlineUsers[groupId]);
};

// Helper to notify group about online users
const notifyOnlineUsers = (io, groupId) => {
    const users = getOnlineUsersInGroup(groupId);
    io.to(groupId).emit('online_users', users);
};

const setupChatHandlers = (io) => {
    // Authentication middleware for socket
    io.use(async (socket, next) => {
        try {
            const jwt = require('jsonwebtoken');
            const token = socket.handshake.auth.token;
            
            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
            socket.user = decoded;
            next();
        } catch (error) {
            next(new Error('Authentication failed'));
        }
    });

        io.on('connection', (socket) => {
            console.log(`User connected: ${socket.user.username} (${socket.id})`);

            // Cancel pending Offline timeout
            const userId = socket.user.id;
            if (userTimeouts.has(userId)) {
                clearTimeout(userTimeouts.get(userId));
                userTimeouts.delete(userId);
            }

            // Check if user is banned or archived on connect
            (async () => {
                try {
                    const user = await User.findByIdWithModeration(socket.user.id);
                    if (user) {
if (user.is_banned) {
    socket.emit('error', { message: 'Your account has been banned.' });
    socket.disconnect();
    return;
}
if (user.is_archived) {
    socket.emit('error', { message: 'Your account has been archived.' });
    socket.disconnect();
    return;
}
if (user.status === 'Offline') {
    socket.emit('error', { message: 'Session expired' });
    socket.disconnect();
    return;
}
                        // Send current mute status
                        socket.emit('user_status', {
                            is_muted: user.is_muted,
                            muted_until: user.muted_until
                        });
                    }
                } catch (error) {
                    console.error('Error checking user status on connect:', error);
                }
            })();

        // Join a group
        socket.on('join_group', async ({ groupId }) => {
            try {
                const group = await Group.findById(groupId);
                if (!group) {
                    socket.emit('error', { message: 'Group not found' });
                    return;
                }

                // Join socket group
                socket.join(groupId);

                // Track online user
                if (!onlineUsers[groupId]) {
                    onlineUsers[groupId] = {};
                }
                onlineUsers[groupId][socket.user.id] = {
                    id: socket.user.id,
                    username: socket.user.username,
                    socketId: socket.id
                };

                // Add user as member if not already
                await Group.addMember(groupId, socket.user.id);

                // Get message history
                const messages = await Message.getRecent(groupId, 50);

                // Get note
                const note = await Note.findByGroup(groupId);

                // Send history to user
                socket.emit('message_history', messages);
                socket.emit('note_content', note);

                // Notify group about new user
                socket.to(groupId).emit('user_joined', {
                    user: {
                        id: socket.user.id,
                        username: socket.user.username
                    }
                });

                // Notify group about online users
                notifyOnlineUsers(io, groupId);

                console.log(`${socket.user.username} joined group ${groupId}`);
            } catch (error) {
                console.error('Join group error:', error);
                socket.emit('error', { message: 'Failed to join group' });
            }
        });

        // Leave a group
        socket.on('leave_group', async ({ groupId }) => {
            try {
                socket.leave(groupId);

                // Remove from online users
                if (onlineUsers[groupId] && onlineUsers[groupId][socket.user.id]) {
                    delete onlineUsers[groupId][socket.user.id];
                }

                // Notify group about user leaving
                socket.to(groupId).emit('user_left', {
                    user: {
                        id: socket.user.id,
                        username: socket.user.username
                    }
                });

                // Notify group about online users
                notifyOnlineUsers(io, groupId);

                console.log(`${socket.user.username} left group ${groupId}`);
            } catch (error) {
                console.error('Leave group error:', error);
            }
        });

        // Send a message
        socket.on('send_message', async ({ groupId, message }) => {
            try {
                if (!message || message.trim() === '') return;

                // Check if user is muted
                const user = await User.findByIdWithModeration(socket.user.id);
                if (user && user.is_muted) {
                    socket.emit('error', { message: 'You are muted and cannot send messages.' });
                    return;
                }

                const msg = await Message.create(groupId, socket.user.id, message);
                
                // Get full message with username
                const fullMessage = await Message.findById(msg.id);
                fullMessage.reactions = await Message.getReactions(msg.id);

                // Broadcast to group
                io.to(groupId).emit('new_message', fullMessage);
            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing indicator
        socket.on('typing', ({ groupId, isTyping }) => {
            socket.to(groupId).emit('typing_indicator', {
                user: {
                    id: socket.user.id,
                    username: socket.user.username
                },
                isTyping
            });
        });

        // Add reaction
        socket.on('add_reaction', async ({ messageId, reactionType }) => {
            try {
                const reactions = await Message.addReaction(messageId, socket.user.id, reactionType);
                
                // Broadcast reaction update
                io.to(`message_${messageId}`).emit('reaction_update', {
                    messageId,
                    reactions
                });

                // Also send to group for simplicity
                const message = await Message.findById(messageId);
                if (message) {
                    io.to(message.group_id.toString()).emit('reaction_update', {
                        messageId,
                        reactions
                    });
                }
            } catch (error) {
                console.error('Add reaction error:', error);
            }
        });

        // Remove reaction
        socket.on('remove_reaction', async ({ messageId, reactionType }) => {
            try {
                const reactions = await Message.removeReaction(messageId, socket.user.id, reactionType);
                
                const message = await Message.findById(messageId);
                if (message) {
                    io.to(message.group_id.toString()).emit('reaction_update', {
                        messageId,
                        reactions
                    });
                }
            } catch (error) {
                console.error('Remove reaction error:', error);
            }
        });

        // Update collaborative note
        socket.on('update_note', async ({ groupId, content }) => {
            try {
                const note = await Note.update(groupId, content);
                
                // Broadcast note update to group
                io.to(groupId).emit('note_updated', note);
            } catch (error) {
                console.error('Update note error:', error);
            }
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.user.username}`);
            
            // Schedule status to Offline after 30s timeout (cancelled on reconnect)
            const userId = socket.user.id;
            const timeoutId = setTimeout(async () => {
                try {
                    await db.query('UPDATE users SET status = ? WHERE id = ?', ['Offline', userId]);
                    console.log(`User ${userId} set to Offline after timeout`);
                    userTimeouts.delete(userId);
                } catch (error) {
                    console.error('Error setting Offline timeout:', error);
                }
            }, 30000); // 30 seconds
            
            userTimeouts.set(userId, timeoutId);
            console.log(`Offline timeout scheduled for user ${userId}`);
            
            // Remove from all groups
            for (const groupId in onlineUsers) {
                if (onlineUsers[groupId][socket.user.id]) {
                    delete onlineUsers[groupId][socket.user.id];
                    
                    // Notify group
                    io.to(groupId).emit('user_left', {
                        user: {
                            id: socket.user.id,
                            username: socket.user.username
                        }
                    });
                    
                    notifyOnlineUsers(io, groupId);
                }
            }
        });

    });
};

module.exports = setupChatHandlers;

