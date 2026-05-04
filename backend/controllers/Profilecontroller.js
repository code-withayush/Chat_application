// ── Profile Controller — profileController.js ──────────────────
// Routes needed:
//   PUT  /api/auth/profile          → updateProfile (name, bio, avatarColor)
//   POST /api/auth/profile/photo    → uploadProfilePhoto
//   DELETE /api/auth/profile/photo  → removeProfilePhoto

const User = require("../models/User");
const path = require("path");
const fs   = require("fs");

// ── PUT /api/auth/profile ───────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, avatarColor } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...(name && { name }), ...(bio !== undefined && { bio }), ...(avatarColor && { avatarColor }) },
      { new: true, select: "-password" }
    );
    res.json(user);
  } catch (err) {
    console.error("updateProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/auth/profile/photo ────────────────────────────────
// Multer middleware (same as status uploads) pehle laga lo route mein
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user._id);

    // Purani photo delete karo (agar hai aur default nahi)
    if (user.profilePhoto) {
      const oldPath = path.join(__dirname, "..", "uploads", path.basename(user.profilePhoto));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    user.profilePhoto = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ profilePhoto: user.profilePhoto });
  } catch (err) {
    console.error("uploadProfilePhoto:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE /api/auth/profile/photo ──────────────────────────────
exports.removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.profilePhoto) {
      const oldPath = path.join(__dirname, "..", "uploads", path.basename(user.profilePhoto));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      user.profilePhoto = null;
      await user.save();
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("removeProfilePhoto:", err);
    res.status(500).json({ message: "Server error" });
  }
};