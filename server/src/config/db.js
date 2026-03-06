const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'realtime_messaging',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully!');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        console.log('Make sure MySQL is running and the database exists.');
    }
};

// Generic query method
const query = async (sql, params) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
};

// Get connection for transactions
const getConnection = async () => {
    return await pool.getConnection();
};

module.exports = {
    pool,
    query,
    getConnection,
    testConnection
};

