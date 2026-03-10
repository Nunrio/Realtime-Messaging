# User Management System Implementation Plan

## 1. Information Gathered

### Current State Analysis:
- **Database**: Already has `role` field (ENUM: user, moderator, admin, founder) but missing moderation fields (is_banned, is_muted, is_archived, timestamps)
- **Backend**: User model has basic CRUD operations; no admin-specific endpoints; Socket handler doesn't check mute/ban status
- **Frontend**: ManageUsers.jsx is placeholder; SettingsSidebar already has admin section with role check
- **Auth**: JWT-based auth with role stored in token

### Key Dependencies:
- `server/src/models/User.js` - User model
- `server/src/controllers/userController.js` - User controllers  
- `server/src/routes/userRoutes.js` - User routes
- `server/src/config/auth.js` - JWT verification
- `server/src/sockets/chatHandler.js` - Socket handlers for real-time
- `client/src/api/user.js` - Client API calls
- `client/src/components/settings/ManageUsers.jsx` - Main UI component

---

## 2. Implementation Plan

### Phase 1: Database Changes
1. Add migration script for new columns to users table

### Phase 2: Backend - User Model Updates
1. Add new columns to User model queries
2. Add static methods: getAllUsers, getUserById, updateUserRole, muteUser, unmuteUser, banUser, unbanUser, archiveUser

### Phase 3: Backend - Admin Controllers
1. Create adminController.js with functions:
   - getAllUsers (with search/filter)
   - muteUser, unmuteUser
   - banUser, unbanUser  
   - changeUserRole
   - archiveUser

### Phase 4: Backend - Admin Routes
1. Create adminRoutes.js with protected endpoints
2. Add role verification middleware
3. Register routes in index.js

### Phase 5: Backend - Socket Handler Updates
1. Check mute/ban status on message send
2. Emit userMuted/userBanned events for real-time updates

### Phase 6: Frontend - API Layer
1. Add admin API calls to client/src/api/user.js

### Phase 7: Frontend - UI Components
1. Build ManageUsers.jsx with:
   - Search bar
   - Role filter dropdown
   - Status filter dropdown
   - User table with all columns
   - Action dropdown per row (permission-based)
   - Confirmation dialogs for destructive actions
2. Add role-based permission helpers

### Phase 8: Integration & Testing
1. Connect frontend to backend
2. Test RBAC permissions
3. Test real-time mute updates

---

## 3. Files to Edit/Create

### New Files:
- `server/src/controllers/adminController.js` (NEW)
- `server/src/routes/adminRoutes.js` (NEW)
- `database/migrations/add_moderation_fields.sql` (NEW)

### Modified Files:
- `database/schema.sql` - Add moderation columns
- `server/src/models/User.js` - Add admin methods
- `server/src/index.js` - Register admin routes
- `server/src/sockets/chatHandler.js` - Add mute/ban checks
- `server/src/config/auth.js` - Include role in JWT
- `client/src/api/user.js` - Add admin API calls
- `client/src/components/settings/ManageUsers.jsx` - Full implementation

---

## 4. Permission Matrix

| Feature | Moderator | Admin | Founder |
|---------|-----------|-------|---------|
| View All Users | ✅ | ✅ | ✅ |
| Search/Filter | ✅ | ✅ | ✅ |
| Mute Users | ✅ | ✅ | ✅ |
| Ban/Unban | ❌ | ✅ | ✅ |
| Change Roles | ❌ | ❌ | ✅ |
| Archive Users | ❌ | ❌ | ✅ |

---

## 5. Followup Steps

1. Run database migration
2. Start server and test API endpoints
3. Test real-time mute/ban functionality
4. Verify UI permissions match backend

