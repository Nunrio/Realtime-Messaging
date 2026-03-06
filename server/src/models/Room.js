const db = require('../config/db');

class Room {
    // Create a new room
    static async create(roomName, createdBy) {
        const sql = 'INSERT INTO rooms (room_name, created_by) VALUES (?, ?)';
        const result = await db.query(sql, [roomName, createdBy]);
        
        // Add creator as a member
        const memberSql = 'INSERT INTO room_members (room_id, user_id) VALUES (?, ?)';
        await db.query(memberSql, [result.insertId, createdBy]);
        
        return {
            id: result.insertId,
            room_name: roomName,
            created_by: createdBy
        };
    }

    // Find room by ID
    static async findById(id) {
        const sql = `
            SELECT r.*, u.username as creator_name,
            (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) as members_count
            FROM rooms r
            JOIN users u ON r.created_by = u.id
            WHERE r.id = ?
        `;
        const rows = await db.query(sql, [id]);
        return rows[0] || null;
    }

    // Get all rooms
    static async getAll() {
        const sql = `
            SELECT r.*, u.username as creator_name,
            (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) as members_count
            FROM rooms r
            JOIN users u ON r.created_by = u.id
            ORDER BY r.created_at DESC
        `;
        return await db.query(sql);
    }

    // Get rooms by user
    static async getByUserId(userId) {
        const sql = `
            SELECT r.*, u.username as creator_name,
            (SELECT COUNT(*) FROM room_members WHERE room_id = r.id) as members_count
            FROM rooms r
            JOIN users u ON r.created_by = u.id
            JOIN room_members rm ON r.id = rm.room_id
            WHERE rm.user_id = ?
            ORDER BY r.created_at DESC
        `;
        return await db.query(sql, [userId]);
    }

    // Add user to room
    static async addMember(roomId, userId) {
        const sql = 'INSERT IGNORE INTO room_members (room_id, user_id) VALUES (?, ?)';
        await db.query(sql, [roomId, userId]);
    }

    // Remove user from room
    static async removeMember(roomId, userId) {
        const sql = 'DELETE FROM room_members WHERE room_id = ? AND user_id = ?';
        await db.query(sql, [roomId, userId]);
    }

    // Check if user is member
    static async isMember(roomId, userId) {
        const sql = 'SELECT * FROM room_members WHERE room_id = ? AND user_id = ?';
        const rows = await db.query(sql, [roomId, userId]);
        return rows.length > 0;
    }

    // Get room members
    static async getMembers(roomId) {
        const sql = `
            SELECT u.id, u.username, u.email
            FROM users u
            JOIN room_members rm ON u.id = rm.user_id
            WHERE rm.room_id = ?
        `;
        return await db.query(sql, [roomId]);
    }

    // Delete room
    static async delete(roomId, userId) {
        const sql = 'DELETE FROM rooms WHERE id = ? AND created_by = ?';
        const result = await db.query(sql, [roomId, userId]);
        return result.affectedRows > 0;
    }
}

module.exports = Room;

