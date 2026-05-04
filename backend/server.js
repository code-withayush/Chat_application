const express = require("express");
const http = require("http");
const path = require("path"); // ✅ ADD: path module
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const roomRoutes = require("./routes/rooms");
const socketHandler = require("./socket/socketHandler");
const uploadRoute = require("./routes/upload");
const statusRoutes = require("./routes/status");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ PUT & DELETE add kiya
    credentials: true,
  },
});

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());

// ✅ Uploads folder serve karo — absolute path use karo (reliable)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/status", statusRoutes);

app.get("/", (req, res) => {
  res.json({ message: "MERN Chat API chal raha hai ✅" });
});

// Socket.io
socketHandler(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});