-- Sample data for Realtime Messaging
-- Run this after schema.sql to populate test data

USE realtime_messaging;

-- Insert admin user with password rmadmin@2026 (bcrypt hashed)
INSERT INTO users (username, email, password) VALUES 
('Alias', 'admin@nunrio.dev', '$2b$10$OOfnlTPoghbL913pdDgYa.soCy2LyW6OUZPv7Y9QKV7Hnt/tzMlwC');

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

