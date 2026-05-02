const Message = require("../models/Message");
const Room = require("../models/Room");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
  // Auth middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Token nahi hai"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User nahi mila"));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Auth failed"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`✅ User connected: ${socket.user.name} (${userId})`);

    // Online mark karo
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    io.emit("user:online", { userId, name: socket.user.name });

    // Room join karo
    socket.on("room:join", async (roomId) => {
      socket.join(roomId);
      socket.emit("room:joined", roomId);
    });

    // Room leave karo
    socket.on("room:leave", (roomId) => {
      socket.leave(roomId);
    });

    // Message bhejo
    socket.on("message:send", async (data) => {
      try {
        const { roomId, text, replyTo, type, fileUrl } = data;

        if (!text && !fileUrl) return;

        const room = await Room.findById(roomId);
        if (!room) return;

        const message = await Message.create({
          room: roomId,
          sender: socket.user._id,
          text: text || "",
          type: type || "text",
          fileUrl: fileUrl || "",
          replyTo: replyTo || null,
          readBy: [socket.user._id],
        });

        room.lastMessage = message._id;
        await room.save();

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "name email avatarColor isOnline")
          .populate("replyTo");

        // Room ke sab members ko bhejo
        io.to(roomId).emit("message:new", populatedMessage);
      } catch (error) {
        console.error("Message send error:", error);
        socket.emit("error", { message: "Message nahi gaya" });
      }
    });

    // Typing indicator
    socket.on("typing:start", ({ roomId }) => {
      socket.to(roomId).emit("typing:start", {
        userId,
        userName: socket.user.name,
        roomId,
      });
    });

    socket.on("typing:stop", ({ roomId }) => {
      socket.to(roomId).emit("typing:stop", { userId, roomId });
    });

    // Message delete
    socket.on("message:delete", async ({ messageId, roomId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;
        if (message.sender.toString() !== userId) return;

        message.isDeleted = true;
        message.text = "Yeh message delete ho gaya";
        await message.save();

        io.to(roomId).emit("message:deleted", { messageId, roomId });
      } catch (err) {
        console.error(err);
      }
    });

    // Reaction
    socket.on("message:react", async ({ messageId, emoji, roomId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        const existingReaction = message.reactions.find((r) => r.emoji === emoji);
        if (existingReaction) {
          const idx = existingReaction.users.map(String).indexOf(userId);
          if (idx > -1) {
            existingReaction.users.splice(idx, 1);
            if (existingReaction.users.length === 0) {
              message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
            }
          } else {
            existingReaction.users.push(socket.user._id);
          }
        } else {
          message.reactions.push({ emoji, users: [socket.user._id] });
        }

        await message.save();
        const updated = await Message.findById(messageId)
          .populate("sender", "name email avatarColor")
          .populate("replyTo");

        io.to(roomId).emit("message:reacted", updated);
      } catch (err) {
        console.error(err);
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      console.log(`❌ User disconnected: ${socket.user.name}`);
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
      io.emit("user:offline", { userId });
    });
  });
};

module.exports = socketHandler;
