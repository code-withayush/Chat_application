// ── profileRoutes.js (ya authRoutes.js mein add karo) ──────────
// Existing auth routes file mein yeh lines add karo

const express    = require("express");
const router     = express.Router();
const multer     = require("multer");
const path       = require("path");
const { protect } = require("../middleware/authMiddleware"); // apna auth middleware
const {
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
} = require("../controllers/profileController");

// Multer config — status upload se same folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) => cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images allowed"));
  },
});

router.put("/profile",              protect, updateProfile);
router.post("/profile/photo",       protect, upload.single("photo"), uploadProfilePhoto);
router.delete("/profile/photo",     protect, removeProfilePhoto);

module.exports = router;

// ── server.js / app.js mein add karo ───────────────────────────
// app.use("/api/auth", require("./routes/profileRoutes"));