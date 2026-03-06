const Message = require('../models/Message');
const Room = require('../models/Room');
const Note = require('../models/Note');
const User = require('../models/User');

// Track online users: { roomId: { userId: { id, username, socketId } } }
const onlineUsers = {};

// Helper to get online users in a room
const getOnlineUsersInRoom = (roomId) => {
    if (!onlineUsers[roomId]) return [];
    return Object.values(onlineUsers[roomId]);
};

// Helper to notify room about online users
const notifyOnlineUsers = (io, roomId) => {
    const users = getOnlineUsersInRoom(roomId);
    io.to(roomId).emit('online_users', users);
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

        // Join a room
        socket.on('join_room', async ({ roomId }) => {
            try {
                const room = await Room.findById(roomId);
                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                // Join socket room
                socket.join(roomId);

                // Track online user
                if (!onlineUsers[roomId]) {
                    onlineUsers[roomId] = {};
                }
                onlineUsers[roomId][socket.user.id] = {
                    id: socket.user.id,
                    username: socket.user.username,
                    socketId: socket.id
                };

                // Add user as member if not already
                await Room.addMember(roomId, socket.user.id);

                // Get message history
                const messages = await Message.getRecent(roomId, 50);

                // Get note
                const note = await Note.findByRoom(roomId);

                // Send history to user
                socket.emit('message_history', messages);
                socket.emit('note_content', note);

                // Notify room about new user
                socket.to(roomId).emit('user_joined', {
                    user: {
                        id: socket.user.id,
                        username: socket.user.username
                    }
                });

                // Notify room about online users
                notifyOnlineUsers(io, roomId);

                console.log(`${socket.user.username} joined room ${roomId}`);
            } catch (error) {
                console.error('Join room error:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Leave a room
        socket.on('leave_room', async ({ roomId }) => {
            try {
                socket.leave(roomId);

                // Remove from online users
                if (onlineUsers[roomId] && onlineUsers[roomId][socket.user.id]) {
                    delete onlineUsers[roomId][socket.user.id];
                }

                // Notify room about user leaving
                socket.to(roomId).emit('user_left', {
                    user: {
                        id: socket.user.id,
                        username: socket.user.username
                    }
                });

                // Notify room about online users
                notifyOnlineUsers(io, roomId);

                console.log(`${socket.user.username} left room ${roomId}`);
            } catch (error) {
                console.error('Leave room error:', error);
            }
        });

        // Send a message
        socket.on('send_message', async ({ roomId, message }) => {
            try {
                if (!message || message.trim() === '') return;

                const msg = await Message.create(roomId, socket.user.id, message);
                
                // Get full message with username
                const fullMessage = await Message.findById(msg.id);
                fullMessage.reactions = await Message.getReactions(msg.id);

                // Broadcast to room
                io.to(roomId).emit('new_message', fullMessage);
            } catch (error) {
                console.error('Send message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Typing indicator
        socket.on('typing', ({ roomId, isTyping }) => {
            socket.to(roomId).emit('typing_indicator', {
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

                // Also send to room for simplicity
                const message = await Message.findById(messageId);
                if (message) {
                    io.to(message.room_id.toString()).emit('reaction_update', {
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
                    io.to(message.room_id.toString()).emit('reaction_update', {
                        messageId,
                        reactions
                    });
                }
            } catch (error) {
                console.error('Remove reaction error:', error);
            }
        });

        // Update collaborative note
        socket.on('update_note', async ({ roomId, content }) => {
            try {
                const note = await Note.update(roomId, content);
                
                // Broadcast note update to room
                io.to(roomId).emit('note_updated', note);
            } catch (error) {
                console.error('Update note error:', error);
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.username}`);
            
            // Remove from all rooms
            for (const roomId in onlineUsers) {
                if (onlineUsers[roomId][socket.user.id]) {
                    delete onlineUsers[roomId][socket.user.id];
                    
                    // Notify room
                    io.to(roomId).emit('user_left', {
                        user: {
                            id: socket.user.id,
                            username: socket.user.username
                        }
                    });
                    
                    notifyOnlineUsers(io, roomId);
                }
            }
        });
    });
};

module.exports = setupChatHandlers;

