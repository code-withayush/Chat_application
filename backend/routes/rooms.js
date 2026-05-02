const express = require("express");
const router = express.Router();
const Room = require("../models/Room");
const User = require("../models/User");
const Message = require("../models/Message");
const { protect } = require("../middleware/authMiddleware");

// GET /api/rooms - user ke sab rooms
router.get("/", protect, async (req, res) => {
  try {
    const rooms = await Room.find({
      members: req.user._id,
      isDirect: false,
    })
      .populate("members", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/rooms/direct - direct messages
router.get("/direct", protect, async (req, res) => {
  try {
    const rooms = await Room.find({
      members: req.user._id,
      isDirect: true,
    })
      .populate("members", "-password")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/rooms - naya room banao
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, icon, isPrivate } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Room ka naam zaroori hai" });
    }

    const room = await Room.create({
      name,
      description: description || "",
      icon: icon || "💬",
      isPrivate: isPrivate || false,
      members: [req.user._id],
      admin: req.user._id,
    });

    const populatedRoom = await Room.findById(room._id).populate(
      "members",
      "-password"
    );

    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// POST /api/rooms/direct/:userId - direct message room
router.post("/direct/:userId", protect, async (req, res) => {
  try {
    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) {
      return res.status(404).json({ message: "User nahi mila" });
    }

    // Pehle check karo agar room pehle se hai
    const existingRoom = await Room.findOne({
      isDirect: true,
      members: { $all: [req.user._id, otherUser._id], $size: 2 },
    }).populate("members", "-password");

    if (existingRoom) return res.json(existingRoom);

    // Naya DM room banao
    const room = await Room.create({
      name: `${req.user.name} & ${otherUser.name}`,
      isDirect: true,
      members: [req.user._id, otherUser._id],
      admin: req.user._id,
    });

    const populatedRoom = await Room.findById(room._id).populate(
      "members",
      "-password"
    );
    res.status(201).json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// POST /api/rooms/:id/join - room join karo
router.post("/:id/join", protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room nahi mila" });

    if (!room.members.includes(req.user._id)) {
      room.members.push(req.user._id);
      await room.save();
    }

    const populatedRoom = await Room.findById(room._id).populate(
      "members",
      "-password"
    );
    res.json(populatedRoom);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/rooms/public - sab public rooms
router.get("/public", protect, async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false, isDirect: false })
      .populate("members", "-password")
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
