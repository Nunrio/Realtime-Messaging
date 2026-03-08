# Implementation Plan

## [Overview]

Create a Settings modal overlay component that functions as a full-featured settings interface for user profile management. The modal will display as an 85% viewport overlay with a two-column layout (sidebar navigation + content area), supporting multiple closing methods and smooth animations. The implementation will include the My Account page with all profile fields following the existing database schema, with age auto-calculated from birthday.

## [Types]

### Settings Navigation Item Type
```javascript
{
  id: string,          // 'my-account' | 'socials' | 'notifications'
  label: string,       // Display label
  icon: LucideIcon,    // Icon component from lucide-react
}
```

### User Profile Form Data Type
```javascript
{
  username: string,           // Display only (disabled)
  displayName: string,       // Editable
  email: string,             // Display only (disabled)
  currentPassword: string,  // For password change
  newPassword: string,       // For password change
  confirmPassword: string,  // For password change
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say',
  birthday: string | null,   // ISO date string
  age: number | null,        // Auto-calculated
  bio: string,               // Max 300 characters
  profilePicture: string | null,  // URL
}
```

### Settings Modal Props Type
```javascript
{
  isOpen: boolean,           // Control modal visibility
  onClose: function,         // Close handler
}
```

## [Files]

### New Files to be Created

1. **`client/src/components/settings/SettingsModal.jsx`**
   - Main Settings modal component with overlay, animations, and layout
   - Handles Escape key, click outside to close
   - Contains two-column layout structure

2. **`client/src/components/settings/SettingsSidebar.jsx`**
   - Left sidebar within the modal
   - Reuses design patterns from SidebarHeader
   - Search bar for filtering settings (future)
   - Navigation list for settings sections
   - Logout button at bottom

3. **`client/src/components/settings/SettingsContent.jsx`**
   - Right content area that switches based on active section
   - Renders MyAccount, Socials, or Notifications components

4. **`client/src/components/settings/MyAccount.jsx`**
   - My Account page with all form fields
   - Implements profile picture upload/preview
   - Auto-calculates age from birthday
   - Handles password change
   - Shows unsaved changes warning

5. **`client/src/components/settings/Socials.jsx`**
   - Placeholder component for social links (future expansion)

6. **`client/src/components/settings/Notifications.jsx`**
   - Placeholder component for notification settings (future expansion)

7. **`client/src/components/settings/SettingsHeader.jsx`**
   - Reusable header component matching SidebarHeader style

8. **`client/src/api/user.js`**
   - New API module for user profile operations
   - Functions: updateProfile, updatePassword, uploadProfilePicture

9. **`server/src/controllers/userController.js`**
   - New backend controller for user profile operations
   - Functions: updateProfile, updatePassword

10. **`server/src/routes/userRoutes.js`**
    - New router for user profile endpoints

### Existing Files to be Modified

1. **`client/src/App.jsx`**
   - Add state for settings modal visibility
   - Pass onOpenSettings to SidebarLayout or Sidebar

2. **`client/src/components/layout/Sidebar/SidebarFooter.jsx`**
   - Add onClick handler to Settings button to open SettingsModal

3. **`client/src/components/layout/SidebarLayout.jsx`**
   - Add SettingsModal component that renders conditionally when user is authenticated

4. **`server/src/index.js`**
   - Add new user routes: `app.use('/api/users', userRoutes);`

## [Functions]

### New Frontend Functions

1. **`calculateAge(birthday: string): number | null`**
   - File: `client/src/utils/dateUtils.js` (new file)
   - Purpose: Calculate age from birthday date string
   - Returns null if birthday is invalid or in future

2. **`updateProfile(profileData: object): Promise`**
   - File: `client/src/api/user.js`
   - Purpose: Send profile update to backend

3. **`updatePassword(passwords: object): Promise`**
   - File: `client/src/api/user.js`
   - Purpose: Handle password change request

### New Backend Functions

1. **`updateProfile` (controller function)**
   - File: `server/src/controllers/userController.js`
   - Purpose: Update user profile fields (display_name, gender, birthday, bio)

2. **`updatePassword` (controller function)**
   - File: `server/src/controllers/userController.js`
   - Purpose: Validate current password and update to new password

## [Classes]

No new classes required. Using functional React components with hooks.

## [Dependencies]

### New Dependencies
- None required (using existing lucide-react for icons)

### Existing Dependencies Used
- `lucide-react` - Icons (already installed)
- `axios` - API calls (already installed)
- `react-router-dom` - Navigation (already installed)

## [Testing]

### Frontend Testing Strategy
- Manual testing of modal opening/closing
- Test Escape key handler
- Test click outside to close
- Test age calculation logic
- Test form validation
- Test profile picture upload preview

### Backend Testing Strategy
- Test profile update endpoint
- Test password change with wrong current password
- Test password change with matching new passwords

## [Implementation Order]

### Step 1: Create utility functions
- [ ] Create `client/src/utils/dateUtils.js` with age calculation

### Step 2: Create API layer
- [ ] Create `client/src/api/user.js` with updateProfile and updatePassword
- [ ] Create `server/src/controllers/userController.js`
- [ ] Create `server/src/routes/userRoutes.js`
- [ ] Update `server/src/index.js` to include user routes

### Step 3: Create Settings Modal structure
- [ ] Create `client/src/components/settings/SettingsModal.jsx` with overlay and layout
- [ ] Implement animations (fade-in, scale-up)
- [ ] Implement close handlers (Escape, X button, overlay click)

### Step 4: Create Sidebar components
- [ ] Create `client/src/components/settings/SettingsHeader.jsx`
- [ ] Create `client/src/components/settings/SettingsSidebar.jsx` with navigation

### Step 5: Create Content components
- [ ] Create `client/src/components/settings/MyAccount.jsx` with full form
- [ ] Create `client/src/components/settings/Socials.jsx` (placeholder)
- [ ] Create `client/src/components/settings/Notifications.jsx` (placeholder)
- [ ] Create `client/src/components/settings/SettingsContent.jsx` as content wrapper

### Step 6: Integrate with application
- [ ] Update `client/src/components/layout/SidebarLayout.jsx` to include SettingsModal
- [ ] Update `client/src/components/layout/Sidebar/SidebarFooter.jsx` to open settings

### Step 7: Test and validate
- [ ] Test all closing methods
- [ ] Test age auto-calculation
- [ ] Test form validation
- [ ] Test unsaved changes warning

