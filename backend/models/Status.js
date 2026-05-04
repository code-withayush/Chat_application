const mongoose = require("mongoose");

// Each viewer entry stores who viewed + when
const viewerSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const statusSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mediaUrl:  { type: String, required: true },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    caption:   { type: String, default: "", maxlength: 200 },
    viewers:   [viewerSchema],   // ← now stores { user, viewedAt } instead of plain ObjectId
    expiresAt: {
      type:    Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h from now
    },
  },
  { timestamps: true }
);

// MongoDB TTL index — auto-deletes documents after expiresAt
statusSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Status", statusSchema);