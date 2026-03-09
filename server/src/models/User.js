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
}

module.exports = User;

