# TODO: Update Users Table with Profile and Presence Fields

## Task Summary
Update the users table by adding new fields required for profile information and realtime presence. Also modify login to accept username or email.

## Files to Modify

### 1. database/schema.sql
- [x] Add display_name VARCHAR NOT NULL
- [x] Add role ENUM('user', 'moderator', 'admin', 'founder') DEFAULT 'user'
- [x] Add gender ENUM('Male', 'Female', 'Other', 'Prefer not to say') DEFAULT 'Prefer not to say'
- [x] Add birthday DATE NOT NULL
- [x] Add age INT NOT NULL
- [x] Add bio TEXT NOT NULL
- [x] Add profile_picture VARCHAR NOT NULL
- [x] Add status ENUM('Online', 'away', 'do not disturb', 'invisible') DEFAULT 'Online'
- [x] Add last_seen TIMESTAMP NULL

### 2. database/seed.sql
- [x] Update seed data with new fields

### 3. server/src/models/User.js
- [x] Update findById to include new fields
- [x] Update findByEmail to include new fields
- [x] Update findByUsername to include new fields
- [x] Update create method with new fields
- [x] Update getAll to include new fields

### 4. server/src/controllers/authController.js
- [x] Update register to accept new fields
- [x] Update login to accept username OR email
- [x] Update getCurrentUser to return new fields

### 5. client/src/pages/Login.jsx
- [x] Change email input to accept username OR email
- [x] Update label and placeholder text

## Completed ✓
All tasks have been completed successfully!

