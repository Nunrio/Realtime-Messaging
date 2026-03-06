# Implementation Plan

## [Overview]

Create a real-time collaboration web application called "Realtime-Messaging" with authentication, chat rooms, live online user tracking, message reactions, and collaborative notes. The application will use React for the frontend, Node.js/Express for the backend, Socket.io for real-time communication, and MySQL for data persistence.

## [Types]

### Database Schema

**users**
| Field | Type | Constraints |
|-------|------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT |
| username | VARCHAR(50) | UNIQUE, NOT NULL |
| email | VARCHAR(100) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**rooms**
| Field | Type | Constraints |
|-------|------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT |
| room_name | VARCHAR(100) | NOT NULL |
| created_by | INT | FOREIGN KEY (users.id) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**messages**
| Field | Type | Constraints |
|-------|------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT |
| room_id | INT | FOREIGN KEY (rooms.id) |
| user_id | INT | FOREIGN KEY (users.id) |
| message | TEXT | NOT NULL |
| timestamp | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

**reactions**
| Field | Type | Constraints |
|-------|------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT |
| message_id | INT | FOREIGN KEY (messages.id) |
| user_id | INT | FOREIGN KEY (users.id) |
| reaction_type | VARCHAR(20) | NOT NULL |

**room_members**
| Field | Type | Constraints |
|-------|------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT |
| room_id | INT | FOREIGN KEY (rooms.id) |
| user_id | INT | FOREIGN KEY (users.id) |

**notes**
| Field | Type | Constraints |
|-------|------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT |
| room_id | INT | FOREIGN KEY (rooms.id) |
| content | TEXT | |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

### API Response Types

**AuthResponse**
```typescript
{
  success: boolean;
  token: string;
  user: { id: number; username: string; email: string };
}
```

**RoomResponse**
```typescript
{
  id: number;
  room_name: string;
  created_by: number;
  created_at: string;
  members_count?: number;
}
```

**MessageResponse**
```typescript
{
  id: number;
  room_id: number;
  user_id: number;
  username: string;
  message: string;
  timestamp: string;
  reactions: { type: string; count: number; users: number[] }[];
}
```

**ReactionPayload**
```typescript
{
  message_id: number;
  user_id: number;
  reaction_type: string;
}
```

### Socket Events

**Client → Server**
- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a chat message
- `typing` - Typing indicator
- `add_reaction` - Add reaction to message
- `remove_reaction` - Remove reaction from message
- `edit_note` - Edit collaborative note

**Server → Client**
- `user_joined` - User joined room
- `user_left` - User left room
- `new_message` - New message received
- `message_history` - Chat history on join
- `typing-indicator` - User typing status
- `reaction_update` - Reaction count changed
- `note_updated` - Collaborative note changed
- `online_users` - List of online users

## [Files]

### New Files to be Created

**Root Configuration**
- `package.json` - Root package.json for workspace management
- `README.md` - Project documentation

**Server (Backend)**
- `server/package.json` - Server dependencies
- `server/.env` - Environment variables
- `server/src/index.js` - Express server entry point
- `server/src/config/db.js` - MySQL database connection
- `server/src/config/auth.js` - JWT authentication middleware
- `server/src/models/User.js` - User model
- `server/src/models/Room.js` - Room model
- `server/src/models/Message.js` - Message model
- `server/src/models/Reaction.js` - Reaction model
- `server/src/models/Note.js` - Note model
- `server/src/controllers/authController.js` - Authentication controller
- `server/src/controllers/roomController.js` - Room controller
- `server/src/controllers/messageController.js` - Message controller
- `server/src/routes/authRoutes.js` - Auth routes
- `server/src/routes/roomRoutes.js` - Room routes
- `server/src/routes/messageRoutes.js` - Message routes
- `server/src/sockets/index.js` - Socket.io handler setup
- `server/src/sockets/chatHandler.js` - Chat socket events

**Database**
- `database/schema.sql` - MySQL database schema
- `database/seed.sql` - Sample data

**Client (Frontend)**
- `client/package.json` - Client dependencies
- `client/vite.config.js` - Vite configuration
- `client/tailwind.config.js` - TailwindCSS configuration
- `client/postcss.config.js` - PostCSS configuration
- `client/index.html` - HTML entry point
- `client/src/main.jsx` - React entry point
- `client/src/App.jsx` - Main App component
- `client/src/index.css` - Global styles
- `client/src/api/axios.js` - Axios instance
- `client/src/api/auth.js` - Auth API calls
- `client/src/api/rooms.js` - Room API calls
- `client/src/api/messages.js` - Message API calls
- `client/src/socket/socket.js` - Socket.io client setup
- `client/src/context/AuthContext.jsx` - Auth context
- `client/src/context/SocketContext.jsx` - Socket context
- `client/src/components/Navbar.jsx` - Navigation bar
- `client/src/components/ProtectedRoute.jsx` - Protected route wrapper
- `client/src/components/ChatRoom.jsx` - Chat room component
- `client/src/components/Message.jsx` - Message component
- `client/src/components/ReactionPicker.jsx` - Reaction picker
- `client/src/components/TypingIndicator.jsx` - Typing indicator
- `client/src/components/OnlineUsers.jsx` - Online users list
- `client/src/components/CollaborativeNote.jsx` - Collaborative note editor
- `client/src/pages/Login.jsx` - Login page
- `client/src/pages/Register.jsx` - Register page
- `client/src/pages/Dashboard.jsx` - Dashboard page
- `client/src/pages/Room.jsx` - Room page

### Configuration File Updates

- Create `.gitignore` file with appropriate patterns
- No existing files to modify (new project)

## [Functions]

### New Functions - Server

**authController.js**
- `register(req, res)` - Handle user registration with bcrypt password hashing
- `login(req, res)` - Handle user login and JWT token generation

**roomController.js**
- `createRoom(req, res)` - Create a new chat room
- `getRooms(req, res)` - Get all available rooms
- `getRoomById(req, res)` - Get room details by ID
- `joinRoom(req, res)` - Join a room
- `leaveRoom(req, res)` - Leave a room

**messageController.js**
- `getMessages(req, res)` - Get messages for a room with pagination
- `getMessageReactions(req, res)` - Get reactions for a message

**chatHandler.js (Socket)**
- `handleJoinRoom(socket, roomId, userId)` - Handle room joining
- `handleLeaveRoom(socket, roomId, userId)` - Handle room leaving
- `handleSendMessage(socket, data)` - Handle new message
- `handleTyping(socket, data)` - Handle typing indicator
- `handleReaction(socket, data)` - Handle reaction add/remove
- `handleNoteUpdate(socket, data)` - Handle collaborative note

### New Functions - Client

**auth.js (API)**
- `register(data)` - POST /api/auth/register
- `login(data)` - POST /api/auth/login
- `getCurrentUser()` - GET /api/auth/me

**rooms.js (API)**
- `getRooms()` - GET /api/rooms
- `createRoom(data)` - POST /api/rooms
- `getRoom(id)` - GET /api/rooms/:id
- `joinRoom(roomId)` - POST /api/rooms/:id/join

**messages.js (API)**
- `getMessages(roomId, page)` - GET /api/rooms/:id/messages

**AuthContext.jsx**
- `login(userData)` - Update auth state with user data
- `logout()` - Clear auth state
- `register(userData)` - Register and auto-login

**SocketContext.jsx**
- `joinRoom(roomId)` - Join socket room
- `leaveRoom(roomId)` - Leave socket room
- `sendMessage(message)` - Emit message event
- `sendTyping(isTyping)` - Emit typing event
- `addReaction(messageId, type)` - Emit reaction event
- `updateNote(content)` - Emit note update event

## [Classes]

### New Classes - Server

**db.js (Database)**
- Singleton MySQL connection pool
- Methods: `query()`, `getConnection()`

### New Classes - Client

**Message (Component)**
- Displays individual message with reactions
- Props: `message`, `currentUser`, `onReact`

**ChatRoom (Component)**
- Main chat container with message list, input, and sidebar
- Props: `room`, `currentUser`

**CollaborativeNote (Component)**
- Real-time collaborative text editor
- Props: `roomId`, `initialContent`

## [Dependencies]

### Server Dependencies
- `express` ^4.18.2 - Web framework
- `socket.io` ^4.6.1 - Real-time communication
- `mysql2` ^3.6.0 - MySQL driver
- `bcryptjs` ^2.4.3 - Password hashing
- `jsonwebtoken` ^9.0.2 - JWT tokens
- `cors` ^2.8.5 - CORS middleware
- `dotenv` ^16.3.1 - Environment variables
- `nodemon` ^3.0.1 - Development server

### Client Dependencies
- `react` ^18.2.0 - UI library
- `react-dom` ^18.2.0 - React DOM
- `react-router-dom` ^6.16.0 - Routing
- `axios` ^1.5.0 - HTTP client
- `socket.io-client` ^4.6.1 - Socket.io client
- `tailwindcss` ^3.3.3 - Styling
- `postcss` ^8.4.31 - CSS processing
- `autoprefixer` ^10.4.16 - CSS prefixes
- `vite` ^4.4.9 - Build tool

## [Testing]

### Test Strategy
- Manual testing via Postman for API endpoints
- Browser testing for frontend functionality
- Socket.io testing with socket client

### Test Files to Create
- `database/test_data.sql` - Test queries
- No automated test files (manual verification)

### Validation Strategies
- Verify JWT token generation and validation
- Test real-time message delivery
- Confirm typing indicators work
- Test reaction counts update in real-time
- Verify collaborative note syncing
- Test online users presence tracking

## [Implementation Order]

1. **Setup project structure** - Create root package.json, client/, server/, database/ directories
2. **Create database schema** - Write schema.sql with all tables
3. **Setup server** - Create Express server with basic configuration
4. **Implement database layer** - Create db.js connection and models
5. **Implement authentication** - Create auth routes, controller, JWT middleware
6. **Implement room management** - Create room routes and controller
7. **Implement message system** - Create message routes and controller
8. **Setup Socket.io** - Create socket handlers for real-time features
9. **Setup client** - Create React app with Vite and TailwindCSS
10. **Implement auth pages** - Create Login and Register pages
11. **Implement Dashboard** - Create room listing and creation
12. **Implement Chat Room** - Create chat interface with messages
13. **Implement Reactions** - Add reaction picker and display
14. **Implement Online Users** - Add presence tracking
15. **Implement Collaborative Notes** - Add shared note editor
16. **Test and verify** - Test all features end-to-end

---

*This implementation plan was created for the Realtime-Messaging project. All features will be implemented following this document as the single source of truth.*

