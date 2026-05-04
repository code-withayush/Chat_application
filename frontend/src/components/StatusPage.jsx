import { useState, useEffect, useRef } from "react";
import { FiPlus, FiX, FiCamera, FiVideo, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import API from "../utils/api";
import { useAuth } from "../context/AuthContext";
import StatusViewer from "./StatusViewer";

export default function StatusPage() {
  const { user }                        = useAuth();
  const [groups,       setGroups]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [uploading,    setUploading]    = useState(false);
  const [preview,      setPreview]      = useState(null);
  const [caption,      setCaption]      = useState("");
  const [viewerGroup,  setViewerGroup]  = useState(null);
  const [viewerIndex,  setViewerIndex]  = useState(0);
  const fileRef = useRef(null);

  // ── Fetch all statuses ───────────────────────────────────────
  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/status");
      setGroups(data);
    } catch {
      toast.error("Could not load statuses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatuses(); }, []);

  // ── File picked ──────────────────────────────────────────────
  const onFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = file.type.startsWith("video") ? "video" : "image";
    const url  = URL.createObjectURL(file);
    setPreview({ url, type, file });
    setCaption("");
    e.target.value = "";
  };

  // ── Upload ───────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!preview?.file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("media", preview.file);
      fd.append("caption", caption.trim());
      await API.post("/status/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Status posted! 🎉");
      setPreview(null);
      setCaption("");
      fetchStatuses();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ── Delete a single status item ──────────────────────────────
  const handleDeleteStatus = async (statusId) => {
    try {
      await API.delete(`/status/${statusId}`);
      toast.success("Status deleted");
      // Update groups locally — remove the deleted item
      setGroups((prev) =>
        prev
          .map((g) => ({
            ...g,
            items: g.items.filter((s) => s._id !== statusId),
          }))
          .filter((g) => g.items.length > 0) // remove group if empty
      );
      // Also update the active viewerGroup so viewer reflects change
      setViewerGroup((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          items: prev.items.filter((s) => s._id !== statusId),
        };
        return updated.items.length > 0 ? updated : null;
      });
    } catch {
      toast.error("Could not delete status");
    }
  };

  // ── Open viewer ──────────────────────────────────────────────
  const openViewer = (groupIdx) => {
    setViewerIndex(groupIdx);
    setViewerGroup(groups[groupIdx]);
  };
  const closeViewer = () => setViewerGroup(null);
  const nextGroup   = () => {
    const ni = viewerIndex + 1;
    if (ni < groups.length) { setViewerIndex(ni); setViewerGroup(groups[ni]); }
    else closeViewer();
  };
  const prevGroup = () => {
    const pi = viewerIndex - 1;
    if (pi >= 0) { setViewerIndex(pi); setViewerGroup(groups[pi]); }
  };

  // ── Helpers ──────────────────────────────────────────────────
  const myGroup    = groups.find((g) => g.user._id === user?._id);
  const othersGrps = groups.filter((g) => g.user._id !== user?._id);

  const timeAgo = (dateStr) => {
    const m = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
  };

  const allViewed = (grp) =>
    grp.items.every((s) => s.viewers?.some?.((v) => {
      const vid = v.user?._id || v;
      return vid?.toString() === user?._id?.toString();
    }));

  // ── Status ring ──────────────────────────────────────────────
  const Ring = ({ group, onClick, size = 56, isOwn = false }) => {
    const viewed = isOwn ? false : allViewed(group);
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1.5 flex-shrink-0"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <div
          className="rounded-full"
          style={{
            background: viewed
              ? "rgba(255,255,255,0.15)"
              : "linear-gradient(135deg, #7b2ff7, #f72ff7, #f7a92f)",
            padding: "2.5px",
          }}
        >
          <div
            className="rounded-full flex items-center justify-center text-white font-bold"
            style={{
              width: size,
              height: size,
              backgroundColor: group.user?.avatarColor || "#7C3AED",
              fontSize: size * 0.32,
              border: "2.5px solid #1a1a2e",
            }}
          >
            {group?.user?.name?.[0]?.toUpperCase() || "?"}
          </div>
        </div>
        <span className="text-xs text-white/60 truncate max-w-[60px]">
          {isOwn ? "My Status" : group.user?.name?.split(" ")[0]}
        </span>
        {isOwn && group && (
          <span className="text-[10px] text-white/30 -mt-1">
            {timeAgo(group.items[0]?.createdAt)}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full bg-dark-300 overflow-hidden">

      {/* ── Hidden file input ── */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={onFilePick}
      />

      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-2 bg-dark-200 border-b border-white/5 shrink-0">
        <h2 className="text-white font-bold text-lg mb-3">Status</h2>

        <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-none">

          {/* My status */}
          {myGroup ? (
            <div className="relative">
              <Ring group={myGroup} isOwn onClick={() => openViewer(groups.indexOf(myGroup))} />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                style={{ background: "linear-gradient(135deg,#7b2ff7,#9b59f5)", border: "2px solid #1a1a2e" }}
              >
                <FiPlus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#7b2ff7,#9b59f5)" }}>
                <FiPlus className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-white/60">Add</span>
            </button>
          )}

          {/* Others */}
          {othersGrps.map((grp) => (
            <Ring
              key={grp.user._id}
              group={grp}
              onClick={() => openViewer(groups.indexOf(grp))}
            />
          ))}

          {!loading && groups.length === 0 && (
            <p className="text-white/30 text-sm self-center pl-2">No statuses yet</p>
          )}
          {loading && (
            <div className="flex items-center gap-2 self-center pl-2">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-white/30 text-xs">Loading...</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent updates list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {othersGrps.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-48 text-center gap-3">
            <span className="text-5xl">🌅</span>
            <p className="text-white/30 text-sm">No updates from your contacts yet</p>
            <button
              onClick={() => fileRef.current?.click()}
              className="mt-1 px-5 py-2.5 rounded-2xl text-white text-sm font-semibold"
              style={{ background: "linear-gradient(135deg,#7b2ff7,#9b59f5)" }}
            >
              Post your first status
            </button>
          </div>
        )}

        {othersGrps.map((grp) => {
          const latest = grp.items[0];
          const viewed = allViewed(grp);
          const gIdx   = groups.indexOf(grp);
          return (
            <button
              key={grp.user._id}
              onClick={() => openViewer(gIdx)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors"
            >
              <div className="rounded-full flex-shrink-0" style={{ padding: "2px",
                background: viewed ? "rgba(255,255,255,0.12)" : "linear-gradient(135deg,#7b2ff7,#f72ff7,#f7a92f)" }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base"
                  style={{ backgroundColor: grp.user?.avatarColor || "#7C3AED", border: "2px solid #1a1a2e" }}>
                  {grp.user?.name?.[0]?.toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-white text-sm font-semibold truncate">{grp.user?.name}</p>
                <p className="text-white/40 text-xs">
                  {timeAgo(latest?.createdAt)} · {grp.items.length} update{grp.items.length > 1 ? "s" : ""}
                </p>
              </div>
              {latest?.mediaType === "image" && (
                <img
                  src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${latest.mediaUrl}`}
                  alt=""
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0 opacity-80"
                />
              )}
              {latest?.mediaType === "video" && (
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <FiVideo className="w-4 h-4 text-white/50" />
                </div>
              )}
              {!viewed && (
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#7b2ff7" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Upload preview modal ── */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center px-4">
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 text-white/60 hover:text-white"
          >
            <FiX className="w-6 h-6" />
          </button>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden mb-4 max-h-[55vh] bg-dark-200 flex items-center justify-center">
            {preview.type === "video" ? (
              <video src={preview.url} controls className="max-h-[55vh] max-w-full object-contain" />
            ) : (
              <img src={preview.url} alt="preview" className="max-h-[55vh] max-w-full object-contain" />
            )}
          </div>
          <div className="w-full max-w-sm mb-4">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              maxLength={200}
              className="w-full bg-white/10 text-white placeholder-white/30 rounded-2xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-primary-500 transition-colors"
            />
          </div>
          <div className="flex gap-3 w-full max-w-sm">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 py-3 rounded-2xl text-white/60 text-sm font-semibold bg-white/10 hover:bg-white/15 transition-colors flex items-center justify-center gap-2"
            >
              <FiCamera className="w-4 h-4" /> Change
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#7b2ff7,#9b59f5)" }}
            >
              {uploading
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : "Post Status 🚀"}
            </button>
          </div>
        </div>
      )}

      {/* ── Viewer ── */}
      {viewerGroup && (
        <StatusViewer
          group={viewerGroup}
          onClose={closeViewer}
          onNext={nextGroup}
          onPrev={prevGroup}
          hasNext={viewerIndex < groups.length - 1}
          hasPrev={viewerIndex > 0}
          isOwn={viewerGroup.user._id === user?._id}
          onDelete={handleDeleteStatus}
        />
      )}
    </div>
  );
}