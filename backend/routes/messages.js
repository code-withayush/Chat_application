const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Room = require("../models/Room");
const { protect } = require("../middleware/authMiddleware");

// ✅ IMPORTANT: /clear/:roomId pehle hona chahiye — warna Express
// "clear" ko messageId samajh leta hai aur galat route match karta hai

// DELETE /api/messages/clear/:roomId
router.delete("/clear/:roomId", protect, async (req, res) => {
  try {
    await Message.deleteMany({ room: req.params.roomId });
    res.json({ message: "Chat clear ho gaya" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/messages/:roomId
router.get("/:roomId", protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room nahi mila" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      room: req.params.roomId,
      isDeleted: false,
    })
      .populate("sender", "name email avatarColor isOnline")
      .populate("replyTo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    await Message.updateMany(
      { room: req.params.roomId, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// POST /api/messages/:roomId
router.post("/:roomId", protect, async (req, res) => {
  try {
    const { text, replyTo, type, fileUrl } = req.body;
    if (!text && !fileUrl) {
      return res.status(400).json({ message: "Message khali nahi ho sakta" });
    }

    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ message: "Room nahi mila" });

    const message = await Message.create({
      room: req.params.roomId,
      sender: req.user._id,
      text: text || "",
      type: type || "text",
      fileUrl: fileUrl || "",
      replyTo: replyTo || null,
      readBy: [req.user._id],
    });

    room.lastMessage = message._id;
    await room.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email avatarColor isOnline")
      .populate("replyTo");

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// DELETE /api/messages/:messageId
router.delete("/:messageId", protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message nahi mila" });

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Aap ye message delete nahi kar sakte" });
    }

    message.isDeleted = true;
    message.text = "Yeh message delete ho gaya";
    await message.save();

    res.json({ message: "Message delete ho gaya", id: message._id });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/messages/:messageId/react
router.put("/:messageId/react", protect, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: "Message nahi mila" });

    const existingReaction = message.reactions.find((r) => r.emoji === emoji);
    if (existingReaction) {
      const userIndex = existingReaction.users.indexOf(req.user._id);
      if (userIndex > -1) {
        existingReaction.users.splice(userIndex, 1);
        if (existingReaction.users.length === 0) {
          message.reactions = message.reactions.filter((r) => r.emoji !== emoji);
        }
      } else {
        existingReaction.users.push(req.user._id);
      }
    } else {
      message.reactions.push({ emoji, users: [req.user._id] });
    }

    await message.save();
    const updated = await Message.findById(message._id)
      .populate("sender", "name email avatarColor")
      .populate("replyTo");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;