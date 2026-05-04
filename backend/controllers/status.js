const Status = require("../models/Status");
const User   = require("../models/User");

// ── POST /api/status/upload ─────────────────────────────────────
exports.uploadStatus = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const mediaUrl  = `/uploads/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";
    const caption   = req.body.caption || "";
    const status    = await Status.create({ user: req.user._id, mediaUrl, mediaType, caption });
    const populated = await status.populate("user", "name avatarColor");
    res.status(201).json(populated);
  } catch (err) {
    console.error("uploadStatus:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/status ─────────────────────────────────────────────
exports.getStatuses = async (req, res) => {
  try {
    const statuses = await Status
      .find({ expiresAt: { $gt: new Date() } })
      .populate("user", "name avatarColor")
      .sort({ createdAt: -1 })
      .lean();

    // Collect all unique viewer IDs — both old (plain ObjectId) and new ({ user, viewedAt })
    const viewerIdSet = new Set();
    statuses.forEach((s) => {
      (s.viewers || []).forEach((v) => {
        const id = v.user ? v.user.toString() : v.toString();
        if (id && id !== "undefined") viewerIdSet.add(id);
      });
    });

    // Single DB call for all viewer user docs
    const viewerUsers = await User.find(
      { _id: { $in: [...viewerIdSet] } },
      "name avatarColor"
    ).lean();

    // userId => user doc lookup map
    const userMap = {};
    viewerUsers.forEach((u) => { userMap[u._id.toString()] = u; });

    // Attach user info + DEDUPLICATE (same user shown only once)
    statuses.forEach((s) => {
      const ownerId = s.user._id.toString(); // ✅ FIX 2: owner ka ID nikalo
      const seen = new Map();

      (s.viewers || []).forEach((v) => {
        const uid      = v.user ? v.user.toString() : v.toString();
        const viewedAt = v.viewedAt || null;
        if (!uid || uid === "undefined") return;

        // ✅ FIX 2: Owner ko viewers list mein mat dikhao
        if (uid === ownerId) return;

        const userData = userMap[uid] || { _id: uid, name: "Unknown", avatarColor: "#555" };
        // Keep entry with viewedAt (prefer new format over old plain ObjectId)
        if (!seen.has(uid) || (!seen.get(uid).viewedAt && viewedAt)) {
          seen.set(uid, { user: userData, viewedAt });
        }
      });

      s.viewers = [...seen.values()];
    });

    // Group by user — own statuses first
    const map = {};
    statuses.forEach((s) => {
      const uid = s.user._id.toString();
      if (!map[uid]) map[uid] = { user: s.user, items: [] };
      map[uid].items.push(s);
    });

    const myId   = req.user._id.toString();
    const groups = Object.values(map).sort((a, b) => {
      if (a.user._id.toString() === myId) return -1;
      if (b.user._id.toString() === myId) return  1;
      return 0;
    });

    res.json(groups);
  } catch (err) {
    console.error("getStatuses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/status/:id/view ───────────────────────────────────
exports.markViewed = async (req, res) => {
  try {
    const status = await Status.findById(req.params.id).lean();
    if (!status) return res.status(404).json({ message: "Not found" });

    // ✅ FIX 1: Atomic update — check + push ek hi MongoDB operation mein
    // Isse race condition fix hoti hai (2 simultaneous requests duplicate nahi bana sakti)
    await Status.collection.updateOne(
      { _id: status._id, "viewers.user": { $ne: req.user._id } },
      { $push: { viewers: { user: req.user._id, viewedAt: new Date() } } }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error("markViewed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE /api/status/:id ──────────────────────────────────────
exports.deleteStatus = async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ message: "Not found" });
    if (status.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Forbidden" });
    await status.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    console.error("deleteStatus:", err);
    res.status(500).json({ message: "Server error" });
  }
};