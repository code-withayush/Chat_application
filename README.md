Link of our wesbite -- https://chat-application-frontend11.onrender.com


# 💬 MERN Chat App — Apno Se Baat Karo!

Real-time chat application built with **MongoDB + Express + React + Node.js + Socket.io + Tailwind CSS**.

## ✨ Features

- ✅ Register / Login with JWT authentication
- ✅ Real-time messaging with Socket.io
- ✅ Group rooms (channels) create karo
- ✅ Direct messages (1-on-1 DM)
- ✅ Typing indicators (dekho kaun likh raha hai)
- ✅ Message reactions (❤️ 😂 👍 etc.)
- ✅ Reply to messages
- ✅ Delete messages
- ✅ Online/Offline status
- ✅ Beautiful dark UI with Tailwind CSS
- ✅ Mobile responsive

---

## 🚀 Setup Kaise Karo

### Prerequisites (Pehle ye install karo)
- [Node.js](https://nodejs.org/) v18 ya usse zyada
- [MongoDB](https://www.mongodb.com/) (local ya MongoDB Atlas)

---

### Step 1: Backend Setup

```bash
cd backend
npm install
```

`.env` file banao (`.env.example` ki copy):
```bash
cp .env.example .env
```

`.env` file mein apni values likho:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern-chat
JWT_SECRET=koi_bhi_strong_secret_yahan_likho_123456
CLIENT_URL=http://localhost:5173
```

Backend start karo:
```bash
npm run dev
```

---

### Step 2: Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

### Step 3: Browser mein kholo

```
http://localhost:5173
```

---

## 📁 Folder Structure

```
mern-chat-app/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verify
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Room.js            # Room/Channel schema
│   │   └── Message.js         # Message schema
│   ├── routes/
│   │   ├── auth.js            # Login/Register routes
│   │   ├── rooms.js           # Room routes
│   │   └── messages.js        # Message routes
│   ├── socket/
│   │   └── socketHandler.js   # Socket.io events
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Main entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatWindow.jsx     # Main chat area
    │   │   ├── MessageBubble.jsx  # Single message
    │   │   ├── MessageInput.jsx   # Text input
    │   │   └── Sidebar.jsx        # Rooms & Users list
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Login state
    │   │   └── SocketContext.jsx  # Socket connection
    │   ├── pages/
    │   │   ├── Login.jsx          # Login page
    │   │   ├── Register.jsx       # Register page
    │   │   └── Chat.jsx           # Main chat page
    │   ├── utils/
    │   │   └── api.js             # Axios instance
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css              # Tailwind + custom CSS
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🔧 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register` | Naya account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Apni profile |
| GET | `/api/auth/users` | Sab users |
| GET | `/api/rooms` | Apne rooms |
| POST | `/api/rooms` | Naya room |
| POST | `/api/rooms/direct/:userId` | DM room |
| GET | `/api/messages/:roomId` | Room messages |
| POST | `/api/messages/:roomId` | Message bhejo |
| DELETE | `/api/messages/:messageId` | Message delete |

---

## 🌐 Production Deploy

### Backend (Railway/Render par):
1. `MONGO_URI` = MongoDB Atlas URI
2. `JWT_SECRET` = strong random string
3. `CLIENT_URL` = frontend ka URL

### Frontend (Vercel/Netlify par):
1. `vite.config.js` mein proxy ki jagah backend URL set karo
2. `npm run build` karo
3. `dist` folder deploy karo

---

Made with ❤️ — MERN Stack + Socket.io + Tailwind CSS
