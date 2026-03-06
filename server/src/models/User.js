const bcrypt = require('bcryptjs');
const db = require('../config/db');

class User {
    // Find user by ID
    static async findById(id) {
        const sql = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
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

    // Create new user
    static async create(username, email, password) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        const result = await db.query(sql, [username, email, hashedPassword]);
        
        return {
            id: result.insertId,
            username,
            email
        };
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Get all users
    static async getAll() {
        const sql = 'SELECT id, username, email, created_at FROM users';
        return await db.query(sql);
    }
}

module.exports = User;

