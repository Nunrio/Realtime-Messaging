# Implementation Plan

## [Overview]

Create a collapsible sidenav component that occupies the entire left side of the screen for the Realtime-Messaging application. The sidenav will appear on all authenticated pages (excluding login/register), with a modular structure containing header, navigation items, and user profile footer. The sidenav will be collapsed by default with icons only, and expand to show text labels when toggled.

## [Types]

### Component State Types

**SidebarState**
```typescript
{
  isExpanded: boolean;        // true = expanded, false = collapsed
  activeItem: string;         // currently active navigation item
  showProfileMenu: boolean;   // profile dropdown visibility
}
```

**SidebarItem**
```typescript
{
  id: string;           // unique identifier
  label: string;        // display text
  icon: LucideIcon;     // icon component from lucide-react
  path: string;         // navigation path (optional for future)
}
```

**UserProfile**
```typescript
{
  displayName: string | null;   // user's display name (can be null)
  username: string;             // @username
  avatar: string;               // profile picture URL
}
```

### Color Theme Reference

| Element | Color |
|---------|-------|
| Primary (Button/Active) | #1E90FF |
| Sidenav Background | #f9fafb (bg-gray-50) |
| Icon Color (Active) | #1E90FF |
| Text Color | Black (#000000) |
| Hover Background | rgba(30, 144, 255, 0.1) |

### Dimensions

| State | Width |
|-------|-------|
| Collapsed | 70px |
| Expanded | 240px |

## [Files]

### New Files to be Created

**Sidebar Components**
- `client/src/components/layout/Sidebar/Sidebar.jsx` - Main sidebar container with state management
- `client/src/components/layout/Sidebar/SidebarHeader.jsx` - Header with toggle button and logo
- `client/src/components/layout/Sidebar/SidebarItems.jsx` - Navigation items list
- `client/src/components/layout/Sidebar/SidebarFooter.jsx` - User profile section
- `client/src/components/layout/Sidebar/Sidebar.css` - Component-specific styles and animations
- `client/src/components/layout/Sidebar/icons/sidebarIcons.js` - Centralized icon exports

**Layout Wrapper**
- `client/src/components/layout/SidebarLayout.jsx` - Layout wrapper that includes sidebar on authenticated pages

### Files to be Modified

**App.jsx**
- Wrap authenticated routes with SidebarLayout component
- Import SidebarLayout and apply conditional rendering based on auth state

**AuthContext.jsx**
- No changes needed (logout function already exists)

**Chat.jsx**
- Wrap content with sidebar layout structure (remove if using SidebarLayout)

**Room.jsx**
- Wrap content with sidebar layout structure (remove if using SidebarLayout)

## [Functions]

### New Functions

**sidebarIcons.js**
```javascript
// Centralized icon exports for easy modification
export { MessageCircle, Users, Archive, Menu, X } from 'lucide-react';
```

**Sidebar.jsx**
- `toggleSidebar()` - Toggle between expanded/collapsed states
- `handleItemClick(id)` - Set active navigation item
- `handleProfileClick()` - Toggle profile dropdown menu
- `handleLogout()` - Call logout from AuthContext and navigate to login

**SidebarHeader.jsx**
- `handleToggle()` - Callback to toggle sidebar

**SidebarItems.jsx**
- No new functions, receives props from parent

**SidebarFooter.jsx**
- `handleProfileClick()` - Callback to toggle profile menu
- `handleLogout()` - Callback for logout action

**SidebarLayout.jsx**
- Component that wraps content with sidebar

### Modified Functions

**App.jsx**
- Add SidebarLayout wrapper for authenticated routes
- Conditionally render SidebarLayout based on authentication status

## [Classes]

### New Components (React Functional Components)

**Sidebar (Main Container)**
- Manages sidebar state (expanded/collapsed, active item, profile menu)
- Provides context to child components via props
- Handles click outside to close profile menu

**SidebarHeader**
- Props: `isExpanded`, `onToggle`
- Contains toggle button and website title

**SidebarItems**
- Props: `items`, `activeItem`, `isExpanded`, `onItemClick`
- Renders navigation list with icons and labels

**SidebarFooter**
- Props: `user`, `isExpanded`, `showMenu`, `onProfileClick`, `onLogout`
- Renders user profile picture and info with dropdown menu

**SidebarLayout**
- Props: `children`
- Wraps page content with sidebar
- Checks authentication status

## [Dependencies]

### Already Installed (No Changes Needed)
- `react` ^18.2.0
- `react-dom` ^18.2.0
- `react-router-dom` ^6.16.0
- `lucide-react` ^0.577.0 - Icons library (already in use)
- `tailwindcss` ^3.3.3

### No New Dependencies Required
All required functionality can be achieved with existing dependencies.

## [Testing]

### Visual Validation Checklist
- [ ] Sidebar appears on /chat and /room/:roomId pages
- [ ] Sidebar does NOT appear on /login and /register pages
- [ ] Sidebar is collapsed (70px) by default
- [ ] Clicking toggle expands sidebar to 240px
- [ ] Only icons visible when collapsed
- [ ] Icons and text visible when expanded
- [ ] Navigation items show active state styling
- [ ] Hover effects work on navigation items
- [ ] Profile dropdown opens upward (drop-up)
- [ ] Profile shows display name or username
- [ ] Logout button works and redirects to login
- [ ] Smooth transition animation on expand/collapse

### Manual Test Steps
1. Login with valid credentials
2. Verify sidebar appears on /chat page
3. Verify sidebar shows only icons initially
4. Click toggle button - sidebar should expand
5. Click on "Chats" - should remain on /chat
6. Navigate to a room - sidebar should still appear
7. Click profile picture - dropdown should open upward
8. Click logout - should redirect to login page

## [Implementation Order]

1. **Create icon library** - Create `sidebarIcons.js` with centralized icon exports
2. **Create SidebarHeader** - Build header with toggle button and title
3. **Create SidebarItems** - Build navigation items list with styling
4. **Create SidebarFooter** - Build user profile section with dropdown
5. **Create main Sidebar component** - Assemble all parts with state management
6. **Create SidebarLayout** - Create layout wrapper component
7. **Update App.jsx** - Integrate SidebarLayout with routing
8. **Add animations** - Add CSS transitions for smooth expand/collapse
9. **Test and verify** - Test all interactions and visual states

---

*This implementation plan was created for the Sidenav Component. All features will be implemented following this document as the single source of truth.*

