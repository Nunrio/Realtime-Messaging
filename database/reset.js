const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'server/.env' });

async function resetDatabase() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Clear all tables in correct order (respecting foreign keys)
        await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
        await conn.execute('TRUNCATE TABLE reactions');
        await conn.execute('TRUNCATE TABLE messages');
        await conn.execute('TRUNCATE TABLE notes');
        await conn.execute('TRUNCATE TABLE room_members');
        await conn.execute('TRUNCATE TABLE rooms');
        await conn.execute('TRUNCATE TABLE users');
        await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

        // Insert admin user with all new fields
        await conn.execute(
            'INSERT INTO users (username, display_name, email, password, role, gender, birthday, age, bio, profile_picture, status, last_seen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
            ['Alias', 'Admin User', 'admin@nunrio.dev', '$2b$10$OOfnlTPoghbL913pdDgYa.soCy2LyW6OUZPv7Y9QKV7Hnt/tzMlwC', 'founder', 'Prefer not to say', '2001-05-08', 24, 'Platform administrator with full access', '/images/default-avatar.png', 'Online']
        );

        // Insert sample room
        await conn.execute(
            'INSERT INTO rooms (room_name, created_by) VALUES (?, ?)',
            ['General Chat', 1]
        );

        // Insert sample message
        await conn.execute(
            'INSERT INTO messages (room_id, user_id, message) VALUES (?, ?, ?)',
            [1, 1, 'Welcome to General Chat!']
        );

        // Insert room member
        await conn.execute(
            'INSERT INTO room_members (room_id, user_id) VALUES (?, ?)',
            [1, 1]
        );

        // Insert sample note
        await conn.execute(
            'INSERT INTO notes (room_id, content) VALUES (?, ?)',
            [1, '# General Chat Notes\n\nWelcome to the general chat room! Feel free to discuss anything.']
        );

        console.log('Database seeded successfully!');
        console.log('Admin credentials:');
        console.log('  Username: Alias');
        console.log('  Email: admin@nunrio.dev');
        console.log('  Password: rmadmin@2026');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        conn.end();
    }
}

resetDatabase();

