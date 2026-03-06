const db = require('../config/db');

class Note {
    // Create a new note for a room
    static async create(roomId, content = '') {
        const sql = 'INSERT INTO notes (room_id, content) VALUES (?, ?)';
        const result = await db.query(sql, [roomId, content]);
        
        return {
            id: result.insertId,
            room_id: roomId,
            content
        };
    }

    // Find note by room ID
    static async findByRoom(roomId) {
        const sql = 'SELECT * FROM notes WHERE room_id = ?';
        const rows = await db.query(sql, [roomId]);
        
        if (rows.length === 0) {
            // Create a new note if none exists
            return await Note.create(roomId, '');
        }
        
        return rows[0];
    }

    // Update note content
    static async update(roomId, content) {
        const sql = 'UPDATE notes SET content = ? WHERE room_id = ?';
        await db.query(sql, [content, roomId]);
        
        return await Note.findByRoom(roomId);
    }

    // Delete note
    static async delete(roomId) {
        const sql = 'DELETE FROM notes WHERE room_id = ?';
        const result = await db.query(sql, [roomId]);
        return result.affectedRows > 0;
    }
}

module.exports = Note;

