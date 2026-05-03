const Message = require("../models/Message");
const Room = require("../models/Room");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const onlineUsers = new Map();

const socketHandler = (io) => {
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

    // ✅ User apna personal room join kare (calls ke liye)
    socket.join(`user:${userId}`);

    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
    io.emit("user:online", { userId, name: socket.user.name });

    // Auto-join all rooms
    try {
      const userRooms = await Room.find({ members: socket.user._id });
      userRooms.forEach((room) => socket.join(room._id.toString()));
      console.log(`📦 ${socket.user.name} ne ${userRooms.length} rooms auto-join kiye`);
    } catch (err) {
      console.error("Auto-join error:", err);
    }

    // ── Room Events ────────────────────────────────────
    socket.on("room:join", async (roomId) => {
      socket.join(roomId);
      socket.emit("room:joined", roomId);
    });

    socket.on("room:leave", (roomId) => socket.leave(roomId));

    // ── Message Events ─────────────────────────────────
    socket.on("message:send", async (data) => {
      try {
        const { roomId, text, replyTo, type, fileUrl } = data;
        if (!text && !fileUrl) return;

        const room = await Room.findById(roomId);
        if (!room) return;

        // Online members ko forcefully join karo
        room.members
          .map((m) => onlineUsers.get(m.toString()))
          .filter(Boolean)
          .forEach((socketId) => {
            const memberSocket = io.sockets.sockets.get(socketId);
            if (memberSocket) memberSocket.join(roomId);
          });

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

        io.to(roomId).emit("message:new", populatedMessage);
      } catch (error) {
        console.error("Message send error:", error);
        socket.emit("error", { message: "Message nahi gaya" });
      }
    });

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

    // ── Typing Events ──────────────────────────────────
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

    // ── Call Signaling ─────────────────────────────────
    socket.on("call:initiate", ({ targetUserId, callType, callerName }) => {
      io.to(`user:${targetUserId}`).emit("call:incoming", {
        callerId: userId,
        callerName,
        callType,
      });
    });

    socket.on("call:accepted", ({ callerId }) => {
      io.to(`user:${callerId}`).emit("call:accepted");
    });

    socket.on("call:rejected", ({ callerId }) => {
      io.to(`user:${callerId}`).emit("call:rejected");
    });

    socket.on("call:ended", ({ targetUserId }) => {
      io.to(`user:${targetUserId}`).emit("call:ended");
    });

    // ── WebRTC Signaling ───────────────────────────────
    socket.on("webrtc:offer", ({ targetUserId, offer }) => {
      io.to(`user:${targetUserId}`).emit("webrtc:offer", {
        callerId: userId,
        offer,
      });
    });

    socket.on("webrtc:answer", ({ targetUserId, answer }) => {
      io.to(`user:${targetUserId}`).emit("webrtc:answer", { answer });
    });

    socket.on("webrtc:ice-candidate", ({ targetUserId, candidate }) => {
      io.to(`user:${targetUserId}`).emit("webrtc:ice-candidate", { candidate });
    });

    // ── Disconnect ─────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log(`❌ User disconnected: ${socket.user.name}`);
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit("user:offline", { userId });
    });
  });
};

module.exports = socketHandler;