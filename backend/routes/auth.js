const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Room = require("../models/Room");
const { protect } = require("../middleware/authMiddleware");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const AVATAR_COLORS = [
  "#7C3AED", "#DB2777", "#0891B2", "#059669",
  "#D97706", "#DC2626", "#0284C7", "#7C3AED",
];

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Naam, email aur password chahiye" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Yeh email pehle se registered hai" });
    }

    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const user = await User.create({
      name,
      email,
      password,
      bio: bio || "Hey! Main yahan hoon 👋",
      avatarColor: randomColor,
    });

    // Default General room mein add karo
    let generalRoom = await Room.findOne({ name: "General", isDirect: false });
    if (!generalRoom) {
      generalRoom = await Room.create({
        name: "General",
        description: "Sabke liye general chat",
        icon: "🏠",
        members: [user._id],
        admin: user._id,
      });
    } else {
      if (!generalRoom.members.includes(user._id)) {
        generalRoom.members.push(user._id);
        await generalRoom.save();
      }
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatarColor: user.avatarColor,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Email ya password galat hai" });
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatarColor: user.avatarColor,
      isOnline: user.isOnline,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/auth/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User nahi mila" });

    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    if (req.body.avatarColor) user.avatarColor = req.body.avatarColor;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      avatarColor: updatedUser.avatarColor,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/users - sab users
router.get("/users", protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/logout
router.post("/logout", protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isOnline: false,
      lastSeen: new Date(),
    });
    res.json({ message: "Logout ho gaye" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
