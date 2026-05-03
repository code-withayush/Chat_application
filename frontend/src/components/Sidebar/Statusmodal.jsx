// src/components/StatusModal.jsx

import { useState, useEffect } from "react";
import { FiX, FiPlus, FiTrash2, FiChevronRight } from "react-icons/fi";
import { MdOutlineWifiTethering } from "react-icons/md";
import API from "../utils/api";
import toast from "react-hot-toast";
import Avatar from "./Avatar";

export default function StatusModal({ onClose, currentUser }) {
  const [statuses, setStatuses] = useState([]);
  const [myStatus, setMyStatus] = useState(null);
  const [newText,  setNewText]  = useState("");
  const [posting,  setPosting]  = useState(false);
  const [viewing,  setViewing]  = useState(null);

  useEffect(() => { fetchStatuses(); }, []);

  const fetchStatuses = async () => {
    try {
      const { data } = await API.get("/status");
      setMyStatus(data.find(s => s.user?._id === currentUser?._id) || null);
      setStatuses(data.filter(s => s.user?._id !== currentUser?._id));
    } catch {}
  };

  const postStatus = async () => {
    if (!newText.trim()) return;
    setPosting(true);
    try {
      await API.post("/status", { text: newText });
      setNewText("");
      toast.success("Status posted! 🟢");
      fetchStatuses();
    } catch { toast.error("Could not post status"); }
    setPosting(false);
  };

  const deleteStatus = async () => {
    try {
      await API.delete(`/status/${myStatus._id}`);
      setMyStatus(null);
      toast.success("Status removed");
    } catch {}
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hour${h > 1 ? "s" : ""} ago`;
    return `${Math.floor(h / 24)} day${Math.floor(h / 24) > 1 ? "s" : ""} ago`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-96 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col"
        style={{ background: "#111827" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
          <h2 className="text-white font-bold text-lg">Status</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-xl">
            <FiX className="w-5 h-5 text-white/50" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* My Status */}
          <div>
            <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-2">My Status</p>
            {myStatus ? (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl">
                <div className="relative cursor-pointer" onClick={() => setViewing({ status: myStatus, mine: true })}>
                  <Avatar name={currentUser?.name} color={currentUser?.avatarColor} size="md" />
                  <div className="absolute inset-0 rounded-full border-2 border-green-400" />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setViewing({ status: myStatus, mine: true })}>
                  <p className="text-white text-sm font-medium">My Status</p>
                  <p className="text-white/40 text-xs truncate">{myStatus.text}</p>
                  <p className="text-white/25 text-xs">{timeAgo(myStatus.createdAt)}</p>
                </div>
                <button onClick={deleteStatus} className="p-2 hover:bg-red-500/20 rounded-xl transition-colors">
                  <FiTrash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ) : (
              <div className="p-3 bg-white/5 rounded-2xl space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar name={currentUser?.name} color={currentUser?.avatarColor} size="md" />
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                      <FiPlus className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">Add your status</p>
                </div>
                <div className="flex gap-2">
                  <input
                    value={newText} onChange={e => setNewText(e.target.value)}
                    placeholder="What's on your mind? ✨"
                    onKeyDown={e => e.key === "Enter" && postStatus()}
                    className="flex-1 bg-dark-300 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-primary-500/50"
                  />
                  <button
                    onClick={postStatus} disabled={posting || !newText.trim()}
                    className="px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl text-white text-sm font-medium transition-colors"
                  >
                    {posting ? "..." : "Post"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Updates */}
          {statuses.length > 0 && (
            <div>
              <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-2">Recent Updates</p>
              <div className="space-y-1">
                {statuses.map(s => (
                  <button
                    key={s._id} onClick={() => setViewing({ status: s, mine: false })}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-colors text-left"
                  >
                    <div className="relative">
                      <Avatar name={s.user?.name} color={s.user?.avatarColor} size="md" />
                      <div className="absolute inset-0 rounded-full border-2 border-primary-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{s.user?.name}</p>
                      <p className="text-white/40 text-xs truncate">{s.text}</p>
                      <p className="text-white/25 text-xs">{timeAgo(s.createdAt)}</p>
                    </div>
                    <FiChevronRight className="w-4 h-4 text-white/20 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {statuses.length === 0 && !myStatus && (
            <div className="text-center py-8">
              <MdOutlineWifiTethering className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No status updates yet</p>
              <p className="text-white/15 text-xs mt-1">Be the first to post one! 👆</p>
            </div>
          )}
        </div>
      </div>

      {/* Viewing overlay */}
      {viewing && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/95" onClick={() => setViewing(null)}>
          <div className="w-full max-w-sm mx-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-48 h-1 bg-white/30 rounded-full mx-auto mb-6" />
            <Avatar
              name={viewing.status.user?.name || "Me"}
              color={viewing.status.user?.avatarColor || currentUser?.avatarColor}
              size="xl"
            />
            <p className="text-white font-bold text-lg mt-4">
              {viewing.mine ? "My Status" : viewing.status.user?.name}
            </p>
            <div className="mt-6 p-6 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-white text-base leading-relaxed">{viewing.status.text}</p>
            </div>
            <p className="text-white/30 text-xs mt-3">{timeAgo(viewing.status.createdAt)}</p>
            <button
              onClick={() => setViewing(null)}
              className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/60 text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}