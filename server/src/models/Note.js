
const db = require('../config/db');

class Note {
    // Create a new note for a group
    static async create(groupId, content = '') {
        const sql = 'INSERT INTO notes (group_id, content) VALUES (?, ?)';
        const result = await db.query(sql, [groupId, content]);
        
        return {
            id: result.insertId,
            group_id: groupId,
            content
        };
    }

    // Find note by group ID
    static async findByGroup(groupId) {
        const sql = 'SELECT * FROM notes WHERE group_id = ?';
        const rows = await db.query(sql, [groupId]);
        
        if (rows.length === 0) {
            // Create a new note if none exists
            return await Note.create(groupId, '');
        }
        
        return rows[0];
    }

    // Update note content
    static async update(groupId, content) {
        const sql = 'UPDATE notes SET content = ? WHERE group_id = ?';
        await db.query(sql, [content, groupId]);
        
        return await Note.findByGroup(groupId);
    }

    // Delete note
    static async delete(groupId) {
        const sql = 'DELETE FROM notes WHERE group_id = ?';
        const result = await db.query(sql, [groupId]);
        return result.affectedRows > 0;
    }
}

module.exports = Note;

