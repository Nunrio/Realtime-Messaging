-- Sample data for Realtime Messaging
-- Run this after schema.sql to populate test data

USE realtime_messaging;

-- Insert admin user with password rmadmin@2026 (bcrypt hashed)
INSERT INTO users (username, display_name, email, password, role, gender, birthday, age, bio, profile_picture, status, last_seen) VALUES 
('Alias', 'Admin User', 'admin@nunrio.dev', '$2b$10$OOfnlTPoghbL913pdDgYa.soCy2LyW6OUZPv7Y9QKV7Hnt/tzMlwC', 'founder', 'Prefer not to say', '2001-05-08', 24, 'Platform administrator with full access', '/images/logo.webp', 'Online', NOW());

-- Insert sample room
INSERT INTO rooms (room_name, created_by) VALUES 
('General Chat', 1);

-- Insert sample message
INSERT INTO messages (room_id, user_id, message) VALUES 
(1, 1, 'Welcome to General Chat!');

-- Insert room member
INSERT INTO room_members (room_id, user_id) VALUES 
(1, 1);

-- Insert sample note
INSERT INTO notes (room_id, content) VALUES 
(1, '# General Chat Notes\n\nWelcome to the general chat room! Feel free to discuss anything.');

