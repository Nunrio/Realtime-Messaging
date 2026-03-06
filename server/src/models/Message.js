const db = require('../config/db');

class Message {
    // Create a new message
    static async create(roomId, userId, message) {
        const sql = 'INSERT INTO messages (room_id, user_id, message) VALUES (?, ?, ?)';
        const result = await db.query(sql, [roomId, userId, message]);
        
        return {
            id: result.insertId,
            room_id: roomId,
            user_id: userId,
            message
        };
    }

    // Find message by ID
    static async findById(id) {
        const sql = `
            SELECT m.*, u.username
            FROM messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.id = ?
        `;
        const rows = await db.query(sql, [id]);
        return rows[0] || null;
    }

    // Get messages by room with pagination
    static async getByRoom(roomId, limit = 50, offset = 0) {
        const sql = `
            SELECT m.*, u.username
            FROM messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.room_id = ?
            ORDER BY m.timestamp DESC
            LIMIT ? OFFSET ?
        `;
        const rows = await db.query(sql, [roomId, limit, offset]);
        
        // Get reactions for each message
        for (let msg of rows) {
            msg.reactions = await Message.getReactions(msg.id);
        }
        
        return rows.reverse();
    }

    // Get recent messages (simpler version)
    static async getRecent(roomId, limit = 50) {
        const sql = `
            SELECT m.*, u.username
            FROM messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.room_id = ?
            ORDER BY m.timestamp DESC
            LIMIT ?
        `;
        const rows = await db.query(sql, [roomId, limit]);
        
        // Get reactions for each message
        for (let msg of rows) {
            msg.reactions = await Message.getReactions(msg.id);
        }
        
        return rows.reverse();
    }

    // Get reactions for a message
    static async getReactions(messageId) {
        const sql = `
            SELECT reaction_type, COUNT(*) as count, GROUP_CONCAT(user_id) as user_ids
            FROM reactions
            WHERE message_id = ?
            GROUP BY reaction_type
        `;
        const rows = await db.query(sql, [messageId]);
        
        return rows.map(r => ({
            type: r.reaction_type,
            count: parseInt(r.count),
            users: r.user_ids ? r.user_ids.split(',').map(id => parseInt(id)) : []
        }));
    }

    // Add reaction to message
    static async addReaction(messageId, userId, reactionType) {
        const sql = 'INSERT IGNORE INTO reactions (message_id, user_id, reaction_type) VALUES (?, ?, ?)';
        await db.query(sql, [messageId, userId, reactionType]);
        return await Message.getReactions(messageId);
    }

    // Remove reaction from message
    static async removeReaction(messageId, userId, reactionType) {
        const sql = 'DELETE FROM reactions WHERE message_id = ? AND user_id = ? AND reaction_type = ?';
        await db.query(sql, [messageId, userId, reactionType]);
        return await Message.getReactions(messageId);
    }

    // Delete message
    static async delete(messageId, userId) {
        const sql = 'DELETE FROM messages WHERE id = ? AND user_id = ?';
        const result = await db.query(sql, [messageId, userId]);
        return result.affectedRows > 0;
    }

    // Get message count in room
    static async getCount(roomId) {
        const sql = 'SELECT COUNT(*) as count FROM messages WHERE room_id = ?';
        const rows = await db.query(sql, [roomId]);
        return rows[0].count;
    }
}

module.exports = Message;

