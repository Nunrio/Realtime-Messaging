<h1 align="center">Realtime-Messaging</h1>

<p align="center">
  A real-time web application where users can create rooms and interact instantly through chat, live reactions, and collaborative notes. Think of it like a mix of Discord + Slack + Google Docs live collaboration.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-in%20development-blue" alt="Project Status">
</p>
<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
</p>

---

<h2 align="center">✨ Features</h2>

<div align="center">
  <table align="center" style="width: 60%;">
    <tr>
      <td align="left"><b>🔐 Authentication System</b></td>
      <td align="left">Secure user registration and login with JWT tokens and bcrypt password hashing</td>
    </tr>
    <tr>
      <td align="left"><b>💬 Real-Time Chat Rooms</b></td>
      <td align="left">Create and join rooms with instant messaging, typing indicators, and message timestamps</td>
    </tr>
    <tr>
      <td align="left"><b>👥 Live Online Users</b></td>
      <td align="left">Real-time presence tracking showing who's currently online in each room</td>
    </tr>
    <tr>
      <td align="left"><b>😊 Live Reactions</b></td>
      <td align="left">React to messages with emojis and see reactions update instantly for everyone</td>
    </tr>
    <tr>
      <td align="left"><b>📝 Collaborative Notes</b></td>
      <td align="left">Real-time shared document editing with instant sync across all users in the room</td>
    </tr>
  </table>
</div>

---

<h2 align="center">🛠️ Tech Stack</h2>

<div align="center">
  <table align="center">
    <tr>
      <td align="center"><h4>Frontend</h4></td>
      <td align="center"><h4>Backend</h4></td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB" alt="React"></td>
      <td align="center"><img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS"></td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></td>
      <td align="center"><img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express.js"></td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS"></td>
      <td align="center"><img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.io"></td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios"></td>
      <td align="center"><img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT"></td>
    </tr>
    <tr>
      <td align="center"><img src="https://img.shields.io/badge/Socket.io%20Client-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io Client"></td>
      <td align="center"><img src="https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL"></td>
    </tr>
  </table>
</div>

---

## 📁 Project Structure

```
realtime-messaging/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API calls
│   │   ├── components/    # React components
│   │   ├── context/       # React contexts
│   │   ├── pages/         # Page components
│   │   └── socket/        # Socket client
│   └── ...
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   └── sockets/       # Socket handlers
│   └── ...
├── database/              # Database files
│   ├── schema.sql         # Database schema
│   └── seed.sql           # Sample data
├── package.json           # Root package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd realtime-messaging
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

3. Setup database:
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE realtime_messaging;

# Run schema
SOURCE /path/to/database/schema.sql;

# (Optional) Run seed data
SOURCE /path/to/database/seed.sql;
```

4. Configure environment variables:
```bash
# Edit server/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=realtime_messaging
JWT_SECRET=your_secret_key
```

### Running the Application

```bash
# Run both server and client
npm run dev

# Or run separately:
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms` | Get all rooms |
| POST | `/api/rooms` | Create new room |
| GET | `/api/rooms/:id` | Get room by ID |
| POST | `/api/rooms/:id/join` | Join a room |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms/:id/messages` | Get room messages |

---

## 🔌 Socket Events

### Client → Server

| Event | Description |
|-------|-------------|
| `join_room` | Join a chat room |
| `leave_room` | Leave a chat room |
| `send_message` | Send a chat message |
| `typing` | Typing indicator |
| `add_reaction` | Add reaction to message |
| `remove_reaction` | Remove reaction from message |
| `update_note` | Update collaborative note |

### Server → Client

| Event | Description |
|-------|-------------|
| `user_joined` | User joined room |
| `user_left` | User left room |
| `new_message` | New message received |
| `message_history` | Chat history on join |
| `typing_indicator` | User typing status |
| `reaction_update` | Reaction count changed |
| `note_updated` | Collaborative note changed |
| `online_users` | List of online users |

---

## 🗄️ Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts |
| `rooms` | Chat rooms |
| `messages` | Chat messages |
| `reactions` | Message reactions |
| `room_members` | Room membership |
| `notes` | Collaborative notes |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

