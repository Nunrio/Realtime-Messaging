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
            display_name: display_name || null,
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
                profile_picture: user.profile_picture,
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

        // Restore previous status
        await User.restoreStatus(user.id);

        // Reload user to get updated status
        const updatedUser = await User.findById(user.id);

        // Generate token
        const token = generateToken(updatedUser);

        res.json({
            success: true,
            token,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                display_name: updatedUser.display_name,
                email: updatedUser.email,
                role: updatedUser.role,
                gender: updatedUser.gender,
                birthday: updatedUser.birthday,
                age: updatedUser.age,
                bio: updatedUser.bio,
                profile_picture: updatedUser.profile_picture,
                status: updatedUser.status,
                last_seen: updatedUser.last_seen
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

        // Force logout if status is Offline (timeout reached)
        if (user.status === 'Offline') {
            return res.status(401).json({ message: 'Session expired, please login again' });
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

