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

        // Default values handled in SQL: role='user', gender='Prefer not to say', status='Online'
        const sql = `INSERT INTO users (username, display_name, email, password, role, gender, birthday, age, bio, profile_picture, status, last_seen) 
                     VALUES (?, ?, ?, ?, 'user', 'Prefer not to say', NULL, NULL, NULL, NULL, 'Online', NOW())`;
        const result = await db.query(sql, [
            username, 
            display_name || username, 
            email, 
            hashedPassword, 
        ]);
        
        return {
            id: result.insertId,
            username,
            display_name: display_name || username,
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
}

module.exports = User;

