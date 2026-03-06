const User = require('../models/User');
const { generateToken } = require('../config/auth');

// Register new user
const register = async (req, res) => {
    try {
        const { username, email, password, display_name, gender, birthday, age, bio, profile_picture } = req.body;

        // Validation - only require username, email, password
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Create user - other fields handled by database defaults
        const user = await User.create({
            username,
            display_name: display_name || username,
            email,
            password
        });
        
        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login user (supports username or email)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        // Find user by username or email
        const user = await User.findByUsernameOrEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await User.verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                email: user.email,
                role: user.role,
                gender: user.gender,
                birthday: user.birthday,
                age: user.age,
                bio: user.bio,
                profile_picture: user.profile_picture,
                status: user.status,
                last_seen: user.last_seen
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                display_name: user.display_name,
                email: user.email,
                role: user.role,
                gender: user.gender,
                birthday: user.birthday,
                age: user.age,
                bio: user.bio,
                profile_picture: user.profile_picture,
                status: user.status,
                last_seen: user.last_seen,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser
};

