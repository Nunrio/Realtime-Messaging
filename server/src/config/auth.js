const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
    const token = req.header('x-auth-token');

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        req.user = decoded;
    } catch (error) {
        req.user = null;
    }
    next();
};

module.exports = {
    generateToken,
    verifyToken,
    optionalAuth
};

