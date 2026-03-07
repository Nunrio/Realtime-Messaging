const db = require('../config/db');

const Reaction = {
    // Add a reaction to a message
    async add(messageId, userId, reactionType) {
        const sql = `
            INSERT INTO reactions (message_id, user_id, reaction_type) 
            VALUES (?, ?, ?)
        `;
        return await db.query(sql, [messageId, userId, reactionType]);
    },

    // Remove a reaction from a message
    async remove(messageId, userId, reactionType) {
        const sql = `
            DELETE FROM reactions 
            WHERE message_id = ? AND user_id = ? AND reaction_type = ?
        `;
        return await db.query(sql, [messageId, userId, reactionType]);
    },

    // Get all reactions for a message
    async getByMessageId(messageId) {
        const sql = `
            SELECT r.*, u.username 
            FROM reactions r
            JOIN users u ON r.user_id = u.id
            WHERE r.message_id = ?
        `;
        return await db.query(sql, [messageId]);
    },

    // Get reactions grouped by type for a message
    async getGroupedByMessageId(messageId) {
        const sql = `
            SELECT 
                reaction_type as type,
                COUNT(*) as count,
                GROUP_CONCAT(user_id) as user_ids
            FROM reactions
            WHERE message_id = ?
            GROUP BY reaction_type
        `;
        const rows = await db.query(sql, [messageId]);
        return rows.map(row => ({
            type: row.type,
            count: row.count,
            users: row.user_ids ? row.user_ids.split(',').map(id => parseInt(id)) : []
        }));
    }
};

module.exports = Reaction;

