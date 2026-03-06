const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });

async function setupDatabase() {
    // First connect without database to create it
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('Connected to MySQL server');

        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'realtime_messaging'}`);
        console.log('Database created or already exists');

        // Use the database
        await connection.query(`USE ${process.env.DB_NAME || 'realtime_messaging'}`);

        // Drop existing tables to get fresh schema
        await connection.query('DROP TABLE IF EXISTS reactions');
        await connection.query('DROP TABLE IF EXISTS messages');
        await connection.query('DROP TABLE IF EXISTS notes');
        await connection.query('DROP TABLE IF EXISTS room_members');
        await connection.query('DROP TABLE IF EXISTS rooms');
        await connection.query('DROP TABLE IF EXISTS users');
        console.log('Old tables dropped');

        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await connection.query(schema);
        console.log('Tables created successfully');

        // Try to execute seed data (will fail if tables already have data, that's ok)
        try {
            const seedPath = path.join(__dirname, 'seed.sql');
            const seed = fs.readFileSync(seedPath, 'utf8');
            await connection.query(seed);
            console.log('Sample data added');
        } catch (e) {
            console.log('Sample data already exists or skipped');
        }

        console.log('\nDatabase setup complete!');
        console.log('You can now start the application with: npm run dev');

    } catch (error) {
        console.error('Error setting up database:', error.message);
        console.log('\nMake sure:');
        console.log('1. MySQL is running');
        console.log('2. Your credentials in server/.env are correct');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();
