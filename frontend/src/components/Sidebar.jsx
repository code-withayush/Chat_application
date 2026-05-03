import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import API from "../utils/api";
import toast from "react-hot-toast";
import {
  FiPlus, FiHash, FiUsers, FiMessageCircle, FiSearch, FiX,
  FiMoreVertical, FiLogOut, FiEdit2, FiCheck, FiCamera,
  FiTrash2, FiCircle, FiSettings, FiChevronRight, FiUserPlus,
} from "react-icons/fi";
import { MdOutlineGroups, MdOutlineWifiTethering } from "react-icons/md";
import { useTheme } from "../context/ThemeContext";

function Avatar({ name, color, size = "md", online = false, img = null }) {
  const sizes = { xs: "w-7 h-7 text-xs", sm: "w-9 h-9 text-sm", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-xl", xl: "w-20 h-20 text-3xl" };
  return (
    <div className="relative shrink-0">
      <div className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white overflow-hidden`}
        style={{ backgroundColor: color || "#7C3AED" }}>
        {img ? <img src={img} alt={name} className="w-full h-full object-cover" /> : name?.[0]?.toUpperCase() || "?"}
      </div>
      {online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-dark-200" />}
    </div>
  );
}

function MyProfileModal({ user, onClose, onUpdate }) {
  const [name,      setName]      = useState(user?.name || "");
  const [bio,       setBio]       = useState(user?.bio || "");
  const [editName,  setEditName]  = useState(false);
  const [editBio,   setEditBio]   = useState(false);
  const [saving,    setSaving]    = useState(false);

  const COLORS = ["#7C3AED","#2563EB","#059669","#DC2626","#D97706","#DB2777","#0891B2","#4F46E5","#7C3AED","#374151"];

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:w-96 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: "#111827" }} onClick={e => e.stopPropagation()}>

        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-white font-bold text-lg">My Profile</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-xl"><FiX className="w-5 h-5 text-white/50" /></button>
        </div>

        <div className="flex flex-col items-center py-6 px-5 border-b border-white/5">
          <div className="relative mb-4">
            <Avatar name={user?.name} color={user?.avatarColor} size="xl" online={true} />
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
              <FiCamera className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-white font-bold text-xl">{user?.name}</p>
          <p className="text-green-400 text-xs mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online</p>
        </div>

        <div className="px-5 py-4 space-y-3 border-b border-white/5">
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1 flex items-center gap-1"><FiEdit2 className="w-3 h-3" /> Name</p>
            {editName ? (
              <div className="flex gap-2 items-center">
                <input autoFocus value={name} onChange={e => setName(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm outline-none border-b border-primary-500 pb-0.5"
                  onKeyDown={e => { if (e.key === "Enter") { save("name", name); setEditName(false); } if (e.key === "Escape") setEditName(false); }} />
                <button onClick={() => { save("name", name); setEditName(false); }} className="p-1.5 bg-primary-600 rounded-lg"><FiCheck className="w-3.5 h-3.5 text-white" /></button>
                <button onClick={() => setEditName(false)} className="p-1.5 bg-white/10 rounded-lg"><FiX className="w-3.5 h-3.5 text-white/60" /></button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-white text-sm">{user?.name}</p>
                <button onClick={() => setEditName(true)} className="p-1 hover:bg-white/10 rounded-lg"><FiEdit2 className="w-3.5 h-3.5 text-white/40" /></button>
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1">Bio</p>
            {editBio ? (
              <div className="flex gap-2 items-start">
                <textarea autoFocus value={bio} onChange={e => setBio(e.target.value)} rows={2}
                  className="flex-1 bg-transparent text-white text-sm outline-none border-b border-primary-500 pb-0.5 resize-none"
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save("bio", bio); setEditBio(false); } }} />
                <div className="flex flex-col gap-1">
                  <button onClick={() => { save("bio", bio); setEditBio(false); }} className="p-1.5 bg-primary-600 rounded-lg"><FiCheck className="w-3.5 h-3.5 text-white" /></button>
                  <button onClick={() => setEditBio(false)} className="p-1.5 bg-white/10 rounded-lg"><FiX className="w-3.5 h-3.5 text-white/60" /></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-white/70 text-sm">{user?.bio || "No bio..."}</p>
                <button onClick={() => setEditBio(true)} className="p-1 hover:bg-white/10 rounded-lg ml-2 shrink-0"><FiEdit2 className="w-3.5 h-3.5 text-white/40" /></button>
              </div>
            )}
          </div>

          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-2">Avatar Color</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => save("avatarColor", c)}
                  className="w-8 h-8 rounded-full border-2 transition-all active:scale-90"
                  style={{ backgroundColor: c, borderColor: user?.avatarColor === c ? "#fff" : "transparent" }} />
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1">Email</p>
            <p className="text-white/60 text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="px-5 py-4">
          <button onClick={async () => { onClose(); await API.post("/auth/logout").catch(() => {}); window.location.reload(); }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors font-medium">
            <FiLogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusModal({ onClose, currentUser }) {
  const [statuses, setStatuses] = useState([]);
  const [myStatus, setMyStatus] = useState(null);
  const [newText,  setNewText]  = useState("");
  const [posting,  setPosting]  = useState(false);
  const [viewing,  setViewing]  = useState(null);

  useEffect(() => { fetchStatuses(); }, []);

  const fetchStatuses = async () => {
    try {
      const { data } = await API.get("/status");
      const mine   = data.find(s => s.user?._id === currentUser?._id);
      const others = data.filter(s => s.user?._id !== currentUser?._id);
      setMyStatus(mine || null);
      setStatuses(others);
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:w-96 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col"
        style={{ background: "#111827" }} onClick={e => e.stopPropagation()}>

        <div className="flex justify-center pt-3 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
          <h2 className="text-white font-bold text-lg">Status</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-xl"><FiX className="w-5 h-5 text-white/50" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
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
                  <input value={newText} onChange={e => setNewText(e.target.value)}
                    placeholder="What's on your mind? ✨"
                    onKeyDown={e => e.key === "Enter" && postStatus()}
                    className="flex-1 bg-dark-300 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-primary-500/50" />
                  <button onClick={postStatus} disabled={posting || !newText.trim()}
                    className="px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 rounded-xl text-white text-sm font-medium transition-colors">
                    {posting ? "..." : "Post"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {statuses.length > 0 && (
            <div>
              <p className="text-xs text-white/30 font-semibold uppercase tracking-wider mb-2">Recent Updates</p>
              <div className="space-y-1">
                {statuses.map((s) => (
                  <button key={s._id} onClick={() => setViewing({ status: s, mine: false })}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-colors text-left">
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

          {statuses.length === 0 && !myStatus && (
            <div className="text-center py-8">
              <MdOutlineWifiTethering className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No status updates yet</p>
              <p className="text-white/15 text-xs mt-1">Be the first to post one! 👆</p>
            </div>
          )}
        </div>
      </div>

      {viewing && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/95" onClick={() => setViewing(null)}>
          <div className="w-full max-w-sm mx-4 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-2 h-1 bg-white/30 rounded-full mx-auto mb-6 w-48" />
            <Avatar name={viewing.status.user?.name || "Me"} color={viewing.status.user?.avatarColor || currentUser?.avatarColor} size="xl" />
            <p className="text-white font-bold text-lg mt-4">{viewing.mine ? "My Status" : viewing.status.user?.name}</p>
            <div className="mt-6 p-6 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-white text-base leading-relaxed">{viewing.status.text}</p>
            </div>
            <p className="text-white/30 text-xs mt-3">{timeAgo(viewing.status.createdAt)}</p>
            <button onClick={() => setViewing(null)} className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/60 text-sm transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ SettingsModal - Theme toggle with proper useTheme hook
function SettingsModal({ onClose }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:w-96 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#111827" }} onClick={e => e.stopPropagation()}>

        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <FiSettings className="w-5 h-5" /> Settings
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-xl">
            <FiX className="w-5 h-5 text-white/50" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Theme Toggle */}
          <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{theme === "dark" ? "🌙" : "☀️"}</span>
              <div>
                <p className="text-white text-sm font-medium">Theme</p>
                <p className="text-white/40 text-xs">{theme === "dark" ? "Dark Mode" : "Light Mode"}</p>
              </div>
            </div>
            <button onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${theme === "dark" ? "bg-primary-600" : "bg-white/20"}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${theme === "dark" ? "left-6" : "left-0.5"}`} />
            </button>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between opacity-40">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="text-white text-sm font-medium">Notifications</p>
                <p className="text-white/40 text-xs">Coming soon...</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 flex items-center justify-between opacity-40">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="text-white text-sm font-medium">Privacy</p>
                <p className="text-white/40 text-xs">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewGroupModal({ users, onClose, onCreated, currentUserId }) {
  const [step,       setStep]      = useState(1);
  const [selected,   setSelected]  = useState([]);
  const [groupName,  setGroupName] = useState("");
  const [groupIcon,  setGroupIcon] = useState("👥");
  const [creating,   setCreating]  = useState(false);
  const ICONS = ["👥","🏠","🎉","💼","📚","🎮","🎵","🌟","❤️","🔥","✨","🏆"];

  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const create = async () => {
    if (!groupName.trim()) return toast.error("Please enter a group name");
    if (selected.length < 1) return toast.error("Select at least 1 member");
    setCreating(true);
    try {
      const { data } = await API.post("/rooms", { name: groupName, icon: groupIcon, members: selected });
      toast.success("Group created! 🎉");
      onCreated(data);
      onClose();
    } catch { toast.error("Could not create group"); }
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full sm:w-96 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col"
        style={{ background: "#111827" }} onClick={e => e.stopPropagation()}>

        <div className="flex justify-center pt-3 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 shrink-0">
          {step === 2 && <button onClick={() => setStep(1)} className="p-1 hover:bg-white/10 rounded-lg"><FiChevronRight className="w-4 h-4 text-white/50 rotate-180" /></button>}
          <h2 className="text-white font-bold text-lg flex-1">{step === 1 ? "Select Members" : "Group Setup"}</h2>
          <span className="text-xs text-white/30">{step}/2</span>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-xl"><FiX className="w-5 h-5 text-white/50" /></button>
        </div>

        {step === 1 ? (
          <>
            {selected.length > 0 && (
              <div className="px-5 pt-3 flex flex-wrap gap-2 shrink-0">
                {selected.map(id => {
                  const u = users.find(u => u._id === id);
                  return (
                    <div key={id} className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-600/20 border border-primary-500/30 rounded-full">
                      <span className="text-white text-xs">{u?.name}</span>
                      <button onClick={() => toggle(id)}><FiX className="w-3 h-3 text-primary-400" /></button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1">
              {users.filter(u => u._id !== currentUserId).map(u => (
                <button key={u._id} onClick={() => toggle(u._id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-colors">
                  <Avatar name={u.name} color={u.avatarColor} size="sm" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-white text-sm font-medium">{u.name}</p>
                    <p className="text-white/30 text-xs truncate">{u.bio || u.email}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected.includes(u._id) ? "bg-primary-600 border-primary-600" : "border-white/20"}`}>
                    {selected.includes(u._id) && <FiCheck className="w-3 h-3 text-white" />}
                  </div>
                </button>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-white/5 shrink-0">
              <button onClick={() => selected.length > 0 && setStep(2)} disabled={selected.length === 0}
                className="w-full py-3.5 rounded-2xl text-white font-semibold bg-primary-600 hover:bg-primary-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2">
                Next <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setGroupIcon(ic)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${groupIcon === ic ? "bg-primary-600 scale-110" : "bg-white/5 hover:bg-white/10"}`}>
                  {ic}
                </button>
              ))}
            </div>
            <input autoFocus value={groupName} onChange={e => setGroupName(e.target.value)}
              placeholder="Group name..."
              onKeyDown={e => e.key === "Enter" && create()}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/25 outline-none focus:border-primary-500/50 text-sm" />
            <div className="bg-white/5 rounded-2xl p-3">
              <p className="text-xs text-white/30 mb-2">{selected.length} members</p>
              <div className="flex flex-wrap gap-2">
                {selected.map(id => {
                  const u = users.find(u => u._id === id);
                  return <span key={id} className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-full">{u?.name}</span>;
                })}
              </div>
            </div>
            <button onClick={create} disabled={creating || !groupName.trim()}
              className="w-full py-3.5 rounded-2xl text-white font-semibold bg-primary-600 hover:bg-primary-700 disabled:opacity-40 transition-colors">
              {creating ? "Creating..." : "Create Group 🎉"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ activeRoom, setActiveRoom }) {
  const { user, logout, setUser } = useAuth();
  const { onlineUsers }           = useSocket();

  const [rooms,        setRooms]       = useState([]);
  const [users,        setUsers]       = useState([]);
  const [dmRooms,      setDmRooms]     = useState([]);
  const [tab,          setTab]         = useState("dms");
  const [search,       setSearch]      = useState("");
  const [showProfile,  setShowProfile] = useState(false);
  const [showStatus,   setShowStatus]  = useState(false);
  const [showNewGroup, setShowNewGroup]= useState(false);
  const [showDotMenu,  setShowDotMenu] = useState(false);
  const [showNewRoom,  setShowNewRoom] = useState(false);
  const [newRoomName,  setNewRoomName] = useState("");
  const [newRoomIcon,  setNewRoomIcon] = useState("💬");
  const [showSettings, setShowSettings] = useState(false); // ✅ FIX 1: Sahi jagah pe

  const dotRef = useRef(null);

  useEffect(() => { fetchRooms(); fetchUsers(); fetchDMs(); }, []);

  useEffect(() => {
    const handler = (e) => { if (dotRef.current && !dotRef.current.contains(e.target)) setShowDotMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchRooms = async () => { try { const { data } = await API.get("/rooms"); setRooms(data); } catch {} };
  const fetchDMs   = async () => { try { const { data } = await API.get("/rooms/direct"); setDmRooms(data); } catch {} };
  const fetchUsers = async () => { try { const { data } = await API.get("/auth/users"); setUsers(data); } catch {} };

  const openDM = async (userId) => {
    try {
      const { data } = await API.post(`/rooms/direct/${userId}`);
      setActiveRoom(data);
      setTab("dms");
      await fetchDMs();
    } catch { toast.error("Could not open DM"); }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return toast.error("Please enter a room name");
    try {
      const { data } = await API.post("/rooms", { name: newRoomName, icon: newRoomIcon });
      setRooms(prev => [...prev, data]);
      setActiveRoom(data);
      setNewRoomName(""); setShowNewRoom(false);
      toast.success("Room created! 🎉");
    } catch { toast.error("Could not create room"); }
  };

  const ROOM_ICONS = ["💬","🏠","👨‍👩‍👧‍👦","🎉","💼","📚","🎮","🎵","🌟","❤️"];

  const TABS = [
    { key: "dms",    icon: <FiMessageCircle className="w-4 h-4" />,        label: "Chats"  },
    { key: "status", icon: <MdOutlineWifiTethering className="w-4 h-4" />, label: "Status" },
    { key: "rooms",  icon: <MdOutlineGroups className="w-4 h-4" />,        label: "Groups" },
    { key: "users",  icon: <FiUsers className="w-4 h-4" />,                label: "Users"  },
  ];

  return (
    <div className="h-full bg-dark-200 flex flex-col border-r border-white/5 select-none">

      {/* ══ HEADER ══ */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-white/5 shrink-0">
        <button onClick={() => setShowProfile(true)} className="shrink-0 active:scale-95 transition-transform">
          <Avatar name={user?.name} color={user?.avatarColor} size="md" online={true} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-base leading-tight truncate">ChatApp</p>
          <p className="text-green-400 text-xs">● {user?.name}</p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => setShowNewGroup(true)} title="New Group" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <MdOutlineGroups className="w-5 h-5 text-white/50 hover:text-white" />
          </button>
          <button onClick={() => setShowStatus(true)} title="Status" className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <MdOutlineWifiTethering className="w-5 h-5 text-white/50 hover:text-white" />
          </button>
          <div className="relative" ref={dotRef}>
            <button onClick={() => setShowDotMenu(!showDotMenu)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <FiMoreVertical className="w-5 h-5 text-white/50 hover:text-white" />
            </button>
            {showDotMenu && (
              <div className="absolute right-0 top-10 bg-dark-100 border border-white/10 rounded-2xl shadow-2xl z-50 w-52 py-1.5 overflow-hidden">
                {[
                  { icon: <FiEdit2 />,                label: "Edit Profile", fn: () => { setShowProfile(true);  setShowDotMenu(false); } },
                  { icon: <MdOutlineWifiTethering />, label: "Status",       fn: () => { setShowStatus(true);   setShowDotMenu(false); } },
                  { icon: <MdOutlineGroups />,        label: "New Group",    fn: () => { setShowNewGroup(true); setShowDotMenu(false); } },
                  // ✅ FIX 2: toast hataya, setShowSettings(true) add kiya
                  { icon: <FiSettings />,             label: "Settings",     fn: () => { setShowSettings(true); setShowDotMenu(false); } },
                  { icon: <FiLogOut />,               label: "Log Out",      fn: async () => { setShowDotMenu(false); await logout(); toast.success("Goodbye! 👋"); }, red: true },
                ].map(({ icon, label, fn, red }) => (
                  <button key={label} onClick={fn}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${red ? "text-red-400" : "text-white/70"}`}>
                    <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ SEARCH ══ */}
      <div className="px-3 py-2 shrink-0">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 w-3.5 h-3.5" />
          <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/8 rounded-xl pl-9 pr-3 py-2 text-white/80 placeholder-white/20 text-sm outline-none focus:border-primary-500/40 transition-colors" />
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="flex px-2 gap-0.5 mb-1 shrink-0">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
              tab === t.key ? "bg-primary-600/20 text-primary-400" : "text-white/35 hover:text-white/60 hover:bg-white/5"
            }`}>
            {t.icon}
            <span className="text-[10px]">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ══ CONTENT ══ */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">

        {/* ── CHATS ── */}
        {tab === "dms" && (
          <div className="space-y-0.5">
            {dmRooms.length === 0 && (
              <div className="text-center py-10">
                <FiMessageCircle className="w-10 h-10 text-white/10 mx-auto mb-2" />
                <p className="text-white/25 text-sm">No chats yet</p>
                <p className="text-white/15 text-xs">Message someone from the Users tab</p>
              </div>
            )}
            {dmRooms
              .filter(r => { const o = r.members?.find(m => m._id !== user?._id); return o?.name?.toLowerCase().includes(search.toLowerCase()); })
              .map(room => {
                const other    = room.members?.find(m => m._id !== user?._id);
                const isOnline = onlineUsers.includes(other?._id);
                const active   = activeRoom?._id === room._id;
                return (
                  <button key={room._id} onClick={() => setActiveRoom(room)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-left ${active ? "bg-primary-600/20 border border-primary-500/20" : "hover:bg-white/5"}`}>
                    <Avatar name={other?.name} color={other?.avatarColor} size="sm" online={isOnline} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${active ? "text-white" : "text-white/80"}`}>{other?.name || room.name}</p>
                      <p className={`text-xs truncate ${isOnline ? "text-green-400" : "text-white/30"}`}>
                        {isOnline ? "● Online" : "○ Offline"}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>
        )}

        {/* ── STATUS ── */}
        {tab === "status" && (
          <div className="space-y-3 pt-1">
            <button onClick={() => setShowStatus(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/5 transition-colors text-left">
              <div className="relative">
                <Avatar name={user?.name} color={user?.avatarColor} size="sm" />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                  <FiPlus className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-white text-sm font-medium">My Status</p>
                <p className="text-white/30 text-xs">Tap to add a status</p>
              </div>
            </button>

            <div className="h-px bg-white/5" />
            <p className="text-xs text-white/25 px-2 font-medium uppercase tracking-wider">Recent Updates</p>

            {users
              .filter(u => u._id !== user?._id && u.name.toLowerCase().includes(search.toLowerCase()))
              .map(u => (
                <button key={u._id} onClick={() => setShowStatus(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/5 transition-colors text-left">
                  <div className="relative">
                    <Avatar name={u.name} color={u.avatarColor} size="sm" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary-500/50" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{u.name}</p>
                    <p className="text-white/30 text-xs">Tap to view status</p>
                  </div>
                </button>
              ))}
          </div>
        )}

        {/* ── GROUPS ── */}
        {tab === "rooms" && (
          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-xs font-semibold text-white/25 uppercase tracking-wider">Groups</p>
              <div className="flex gap-1">
                <button onClick={() => setShowNewGroup(true)} title="New Group" className="p-1 hover:bg-white/10 rounded-lg">
                  <FiUserPlus className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                </button>
                <button onClick={() => setShowNewRoom(!showNewRoom)} title="New Room" className="p-1 hover:bg-white/10 rounded-lg">
                  <FiPlus className="w-3.5 h-3.5 text-white/40 hover:text-white" />
                </button>
              </div>
            </div>

            {showNewRoom && (
              <div className="mb-3 p-3 bg-white/5 rounded-2xl space-y-2 border border-white/10">
                <div className="flex flex-wrap gap-1.5">
                  {ROOM_ICONS.map(ic => (
                    <button key={ic} onClick={() => setNewRoomIcon(ic)}
                      className={`w-7 h-7 rounded-lg text-sm ${newRoomIcon === ic ? "bg-primary-600" : "hover:bg-white/10"}`}>{ic}</button>
                  ))}
                </div>
                <input type="text" placeholder="Room name..." value={newRoomName}
                  onChange={e => setNewRoomName(e.target.value)} onKeyDown={e => e.key === "Enter" && createRoom()}
                  className="w-full bg-dark-300 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary-500/50" autoFocus />
                <div className="flex gap-2">
                  <button onClick={createRoom} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium py-1.5 rounded-xl">Create</button>
                  <button onClick={() => setShowNewRoom(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium py-1.5 rounded-xl">Cancel</button>
                </div>
              </div>
            )}

            {rooms.filter(r => r.name.toLowerCase().includes(search.toLowerCase())).map(room => {
              const active = activeRoom?._id === room._id;
              return (
                <button key={room._id} onClick={() => setActiveRoom(room)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-left ${active ? "bg-primary-600/20 border border-primary-500/20" : "hover:bg-white/5"}`}>
                  <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0">
                    {room.icon || "💬"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${active ? "text-white" : "text-white/80"}`}>{room.name}</p>
                    <p className="text-xs text-white/30">{room.members?.length || 0} members</p>
                  </div>
                </button>
              );
            })}

            {rooms.length === 0 && (
              <div className="text-center py-10">
                <MdOutlineGroups className="w-10 h-10 text-white/10 mx-auto mb-2" />
                <p className="text-white/25 text-sm">No groups yet</p>
                <p className="text-white/15 text-xs">Press + to create a new room</p>
              </div>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-white/25 uppercase tracking-wider px-2 py-1.5">
              All Users ({users.length})
            </p>
            {users
              .filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
              .map(u => {
                const isOnline = onlineUsers.includes(u._id);
                const isMe     = u._id === user?._id;
                return (
                  <button key={u._id} onClick={() => !isMe && openDM(u._id)} disabled={isMe}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all text-left ${isMe ? "opacity-60 cursor-default" : "hover:bg-white/5 cursor-pointer"}`}>
                    <Avatar name={u.name} color={u.avatarColor} size="sm" online={isOnline} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {u.name}{isMe && <span className="text-white/30 font-normal"> (You)</span>}
                      </p>
                      <p className="text-xs text-white/30 truncate">{u.bio || u.email}</p>
                    </div>
                    {!isMe && <FiMessageCircle className="w-4 h-4 text-white/20 shrink-0" />}
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {/* ══ MODALS ══ */}
      {showProfile && (
        <MyProfileModal user={user} onClose={() => setShowProfile(false)} onUpdate={(updated) => { if (setUser) setUser(updated); }} />
      )}
      {showStatus && (
        <StatusModal onClose={() => setShowStatus(false)} currentUser={user} />
      )}
      {showNewGroup && (
        <NewGroupModal
          users={users}
          currentUserId={user?._id}
          onClose={() => setShowNewGroup(false)}
          onCreated={(room) => { setRooms(prev => [...prev, room]); setActiveRoom(room); setTab("rooms"); }}
        />
      )}
      {/* ✅ FIX 3: SettingsModal render ho raha hai ab */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}