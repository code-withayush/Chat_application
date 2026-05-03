// src/components/MyProfileModal.jsx

import { useState } from "react";
import { FiX, FiEdit2, FiCheck, FiCamera, FiLogOut } from "react-icons/fi";
import API from "../utils/api";
import toast from "react-hot-toast";
import Avatar from "./Avatar";

export default function MyProfileModal({ user, onClose, onUpdate }) {
  const [name,     setName]     = useState(user?.name || "");
  const [bio,      setBio]      = useState(user?.bio || "");
  const [editName, setEditName] = useState(false);
  const [editBio,  setEditBio]  = useState(false);
  const [saving,   setSaving]   = useState(false);

  const COLORS = [
    "#7C3AED","#2563EB","#059669","#DC2626",
    "#D97706","#DB2777","#0891B2","#4F46E5","#7C3AED","#374151",
  ];

  const save = async (field, value) => {
    setSaving(true);
    try {
      const { data } = await API.put("/auth/profile", { [field]: value });
      onUpdate(data);
      toast.success("Profile updated! ✅");
    } catch { toast.error("Update failed"); }
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-96 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: "#111827" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-white font-bold text-lg">My Profile</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-xl">
            <FiX className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Avatar section */}
        <div className="flex flex-col items-center py-6 px-5 border-b border-white/5">
          <div className="relative mb-4">
            <Avatar name={user?.name} color={user?.avatarColor} size="xl" online={true} />
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <FiCamera className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-white font-bold text-xl">{user?.name}</p>
          <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online
          </p>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-3 border-b border-white/5">

          {/* Name */}
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1 flex items-center gap-1">
              <FiEdit2 className="w-3 h-3" /> Name
            </p>
            {editName ? (
              <div className="flex gap-2 items-center">
                <input
                  autoFocus value={name} onChange={e => setName(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm outline-none border-b border-primary-500 pb-0.5"
                  onKeyDown={e => {
                    if (e.key === "Enter") { save("name", name); setEditName(false); }
                    if (e.key === "Escape") setEditName(false);
                  }}
                />
                <button onClick={() => { save("name", name); setEditName(false); }} className="p-1.5 bg-primary-600 rounded-lg">
                  <FiCheck className="w-3.5 h-3.5 text-white" />
                </button>
                <button onClick={() => setEditName(false)} className="p-1.5 bg-white/10 rounded-lg">
                  <FiX className="w-3.5 h-3.5 text-white/60" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-white text-sm">{user?.name}</p>
                <button onClick={() => setEditName(true)} className="p-1 hover:bg-white/10 rounded-lg">
                  <FiEdit2 className="w-3.5 h-3.5 text-white/40" />
                </button>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1">Bio</p>
            {editBio ? (
              <div className="flex gap-2 items-start">
                <textarea
                  autoFocus value={bio} onChange={e => setBio(e.target.value)} rows={2}
                  className="flex-1 bg-transparent text-white text-sm outline-none border-b border-primary-500 pb-0.5 resize-none"
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save("bio", bio); setEditBio(false); }
                  }}
                />
                <div className="flex flex-col gap-1">
                  <button onClick={() => { save("bio", bio); setEditBio(false); }} className="p-1.5 bg-primary-600 rounded-lg">
                    <FiCheck className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button onClick={() => setEditBio(false)} className="p-1.5 bg-white/10 rounded-lg">
                    <FiX className="w-3.5 h-3.5 text-white/60" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-white/70 text-sm">{user?.bio || "No bio..."}</p>
                <button onClick={() => setEditBio(true)} className="p-1 hover:bg-white/10 rounded-lg ml-2 shrink-0">
                  <FiEdit2 className="w-3.5 h-3.5 text-white/40" />
                </button>
              </div>
            )}
          </div>

          {/* Avatar Color */}
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-2">Avatar Color</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c} onClick={() => save("avatarColor", c)}
                  className="w-8 h-8 rounded-full border-2 transition-all active:scale-90"
                  style={{ backgroundColor: c, borderColor: user?.avatarColor === c ? "#fff" : "transparent" }}
                />
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1">Email</p>
            <p className="text-white/60 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <div className="px-5 py-4">
          <button
            onClick={async () => { onClose(); await API.post("/auth/logout").catch(() => {}); window.location.reload(); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors font-medium"
          >
            <FiLogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}