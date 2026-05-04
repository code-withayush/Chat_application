const express = require("express");
const multer  = require("multer");
const path    = require("path");
const { protect } = require("../middleware/authMiddleware"); // your existing auth middleware
const {
  uploadStatus,
  getStatuses,
  markViewed,
  deleteStatus,
} = require("../controllers/status");

const router = express.Router();

// ── Multer config (same folder your chat images use) ───────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename:    (req, file, cb) =>
    cb(null, `status-${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|webm/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
               allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Only images/videos allowed"));
  },
});

router.get   ("/",          protect, getStatuses);
router.post  ("/upload",    protect, upload.single("media"), uploadStatus);
router.post  ("/:id/view",  protect, markViewed);
router.delete("/:id",       protect, deleteStatus);

module.exports = router;