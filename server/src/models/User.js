const bcrypt = require('bcryptjs');
const db = require('../config/db');

class User {
    // Find user by ID
    static async findById(id) {
        const sql = `SELECT id, username, display_name, email, role, gender, birthday, age, bio, profile_picture, status, last_seen, created_at 
                     FROM users WHERE id = ?`;
        const rows = await db.query(sql, [id]);
        return rows[0] || null;
    }

    // Find user by ID with password (for password verification)
    static async findByIdWithPassword(id) {
        const sql = `SELECT id, username, display_name, email, password, role, gender, birthday, age, bio, profile_picture, status, last_seen, created_at 
                     FROM users WHERE id = ?`;
        const rows = await db.query(sql, [id]);
        return rows[0] || null;
    }

    // Find user by email
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const rows = await db.query(sql, [email]);
        return rows[0] || null;
    }

    // Find user by username
    static async findByUsername(username) {
        const sql = 'SELECT * FROM users WHERE username = ?';
        const rows = await db.query(sql, [username]);
        return rows[0] || null;
    }

    // Find user by username or email (for login) - case sensitive using BINARY
    static async findByUsernameOrEmail(identifier) {
        const sql = 'SELECT * FROM users WHERE BINARY username = ? OR BINARY email = ?';
        const rows = await db.query(sql, [identifier, identifier]);
        return rows[0] || null;
    }

    // Create new user
    static async create(userData) {
        const { username, display_name, email, password } = userData;
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Default values handled in SQL: role='user', gender='Prefer not to say', status='Online', profile_picture='/images/default-avatar.webp'
        const sql = `INSERT INTO users (username, display_name, email, password, role, gender, birthday, age, bio, profile_picture, status, last_seen) 
                     VALUES (?, ?, ?, ?, 'user', 'Prefer not to say', NULL, NULL, NULL, '/images/default-avatar.webp', 'Online', NOW())`;
        const result = await db.query(sql, [
            username, 
            display_name || null, 
            email, 
            hashedPassword, 
        ]);
        
        return {
            id: result.insertId,
            username,
            display_name: display_name || null,
            profile_picture: '/images/default-avatar.webp',
            email
        };
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Get all users
    static async getAll() {
        const sql = 'SELECT id, username, display_name, email, role, gender, birthday, age, bio, profile_picture, status, last_seen, created_at FROM users';
        return await db.query(sql);
    }

    // Update user status
    static async updateStatus(userId, status) {
        const sql = 'UPDATE users SET status = ?, last_seen = NOW() WHERE id = ?';
        return await db.query(sql, [status, userId]);
    }

    // Update user profile
    static async update(userId, updateData) {
        const fields = [];
        const values = [];

        // Build dynamic update query
        Object.keys(updateData).forEach((key) => {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
        });

        if (fields.length === 0) {
            return await User.findById(userId);
        }

        values.push(userId);
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        await db.query(sql, values);

        return await User.findById(userId);
    }

    // Update user password
    static async updatePassword(userId, hashedPassword) {
        const sql = 'UPDATE users SET password = ? WHERE id = ?';
        return await db.query(sql, [hashedPassword, userId]);
    }

    // Get all users with optional filters (for admin)
    static async getAllWithFilters(search = '', role = '', status = '') {
        let sql = `SELECT id, username, display_name, email, role, gender, profile_picture, status, 
                   is_banned, banned_at, banned_reason, is_muted, muted_until, is_archived, archived_at, 
                   last_seen, created_at FROM users WHERE 1=1`;
        const params = [];

        // Exclude archived users by default (they can't login)
        // We'll handle this in the status filter

        if (search) {
            sql += ` AND (username LIKE ? OR display_name LIKE ? OR email LIKE ?)`;
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (role && role !== 'all') {
            sql += ` AND role = ?`;
            params.push(role);
        }

        // Status is determined by is_banned, is_muted, is_archived
        if (status && status !== 'all') {
            switch (status) {
                case 'banned':
                    sql += ` AND is_banned = TRUE`;
                    break;
                case 'muted':
                    sql += ` AND is_muted = TRUE`;
                    break;
                case 'archived':
                    sql += ` AND is_archived = TRUE`;
                    break;
                case 'active':
                    sql += ` AND is_banned = FALSE AND is_muted = FALSE AND is_archived = FALSE`;
                    break;
            }
        }

        sql += ` ORDER BY created_at DESC`;

        return await db.query(sql, params);
    }

    // Get user by ID (including moderation fields)
    static async findByIdWithModeration(id) {
        const sql = `SELECT id, username, display_name, email, role, gender, birthday, age, bio, 
                     profile_picture, status, is_banned, banned_at, banned_reason, is_muted, 
                     muted_until, is_archived, archived_at, last_seen, created_at 
                     FROM users WHERE id = ?`;
        const rows = await db.query(sql, [id]);
        return rows[0] || null;
    }

    // Determine user status based on moderation fields
    static getStatus(user) {
        if (user.is_archived) return 'Archived';
        if (user.is_banned) return 'Banned';
        if (user.is_muted) return 'Muted';
        return 'Active';
    }

    // Mute user
    static async muteUser(userId, mutedUntil = null) {
        const sql = `UPDATE users SET is_muted = TRUE, muted_until = ? WHERE id = ?`;
        return await db.query(sql, [mutedUntil, userId]);
    }

    // Unmute user
    static async unmuteUser(userId) {
        const sql = `UPDATE users SET is_muted = FALSE, muted_until = NULL WHERE id = ?`;
        return await db.query(sql, [userId]);
    }

    // Ban user
    static async banUser(userId, reason = null) {
        const sql = `UPDATE users SET is_banned = TRUE, banned_at = NOW(), banned_reason = ? WHERE id = ?`;
        return await db.query(sql, [reason, userId]);
    }

    // Unban user
    static async unbanUser(userId) {
        const sql = `UPDATE users SET is_banned = FALSE, banned_at = NULL, banned_reason = NULL WHERE id = ?`;
        return await db.query(sql, [userId]);
    }

    // Archive user (soft delete)
    static async archiveUser(userId) {
        const sql = `UPDATE users SET is_archived = TRUE, archived_at = NOW() WHERE id = ?`;
        return await db.query(sql, [userId]);
    }

    // Unarchive user
    static async unarchiveUser(userId) {
        const sql = `UPDATE users SET is_archived = FALSE, archived_at = NULL WHERE id = ?`;
        return await db.query(sql, [userId]);
    }

    // Change user role
    static async changeRole(userId, newRole) {
        const validRoles = ['user', 'moderator', 'admin', 'founder'];
        if (!validRoles.includes(newRole)) {
            throw new Error('Invalid role');
        }
        const sql = `UPDATE users SET role = ? WHERE id = ?`;
        return await db.query(sql, [newRole, userId]);
    }

    // Check if user can login (not banned, not archived)
    static async canLogin(userId) {
        const user = await User.findByIdWithModeration(userId);
        if (!user) return { canLogin: false, reason: 'User not found' };
        if (user.is_banned) return { canLogin: false, reason: 'Your account has been banned', banned_at: user.banned_at, banned_reason: user.banned_reason };
        if (user.is_archived) return { canLogin: false, reason: 'Your account has been archived' };
        return { canLogin: true };
    }
}

module.exports = User;

