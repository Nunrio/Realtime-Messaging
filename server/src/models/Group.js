
const db = require('../config/db');

class Group {
    // Create a new group
    static async create(groupName, createdBy) {
        const sql = 'INSERT INTO groups (group_name, created_by) VALUES (?, ?)';
        const result = await db.query(sql, [groupName, createdBy]);
        
        // Add creator as a member
        const memberSql = 'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)';
        await db.query(memberSql, [result.insertId, createdBy]);
        
        return {
            id: result.insertId,
            group_name: groupName,
            created_by: createdBy
        };
    }

    // Find group by ID
    static async findById(id) {
        const sql = `
            SELECT g.*, u.username as creator_name,
            (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as members_count
            FROM groups g
            JOIN users u ON g.created_by = u.id
            WHERE g.id = ?
        `;
        const rows = await db.query(sql, [id]);
        return rows[0] || null;
    }

    // Get all groups
    static async getAll() {
        const sql = `
            SELECT g.*, u.username as creator_name,
            (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as members_count
            FROM groups g
            JOIN users u ON g.created_by = u.id
            ORDER BY g.created_at DESC
        `;
        return await db.query(sql);
    }

    // Get groups by user
    static async getByUserId(userId) {
        const sql = `
            SELECT g.*, u.username as creator_name,
            (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as members_count
            FROM groups g
            JOIN users u ON g.created_by = u.id
            JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = ?
            ORDER BY g.created_at DESC
        `;
        return await db.query(sql, [userId]);
    }

    // Add user to group
    static async addMember(groupId, userId) {
        const sql = 'INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)';
        await db.query(sql, [groupId, userId]);
    }

    // Remove user from group
    static async removeMember(groupId, userId) {
        const sql = 'DELETE FROM group_members WHERE group_id = ? AND user_id = ?';
        await db.query(sql, [groupId, userId]);
    }

    // Check if user is member
    static async isMember(groupId, userId) {
        const sql = 'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?';
        const rows = await db.query(sql, [groupId, userId]);
        return rows.length > 0;
    }

    // Get group members
    static async getMembers(groupId) {
        const sql = `
            SELECT u.id, u.username, u.email
            FROM users u
            JOIN group_members gm ON u.id = gm.user_id
            WHERE gm.group_id = ?
        `;
        return await db.query(sql, [groupId]);
    }

    // Delete group
    static async delete(groupId, userId) {
        const sql = 'DELETE FROM groups WHERE id = ? AND created_by = ?';
        const result = await db.query(sql, [groupId, userId]);
        return result.affectedRows > 0;
    }
}

module.exports = Group;

