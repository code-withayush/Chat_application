import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import API from "../utils/api";
import toast from "react-hot-toast";
import {
  FiPlus, FiLogOut, FiHash, FiUsers, FiMessageCircle, FiSettings, FiSearch,
} from "react-icons/fi";

function Avatar({ name, color, size = "md", online = false }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div className="relative shrink-0">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold text-white`}
        style={{ backgroundColor: color || "#7C3AED" }}
      >
        {name?.[0]?.toUpperCase() || "?"}
      </div>
      {online && (
        <div className="absolute bottom-0 right-0 online-dot" />
      )}
    </div>
  );
}

export default function Sidebar({ activeRoom, setActiveRoom }) {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("rooms"); // "rooms" | "dms" | "users"
  const [search, setSearch] = useState("");
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomIcon, setNewRoomIcon] = useState("💬");
  const [dmRooms, setDmRooms] = useState([]);

  useEffect(() => {
    fetchRooms();
    fetchUsers();
    fetchDMs();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await API.get("/rooms");
      setRooms(data);
    } catch {}
  };

  const fetchDMs = async () => {
    try {
      const { data } = await API.get("/rooms/direct");
      setDmRooms(data);
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const { data } = await API.get("/auth/users");
      setUsers(data);
    } catch {}
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return toast.error("Room ka naam likho");
    try {
      const { data } = await API.post("/rooms", {
        name: newRoomName,
        icon: newRoomIcon,
      });
      setRooms([...rooms, data]);
      setActiveRoom(data);
      setNewRoomName("");
      setShowNewRoom(false);
      toast.success("Room ban gaya! 🎉");
    } catch {
      toast.error("Room nahi bana");
    }
  };

  const openDM = async (userId) => {
    try {
      const { data } = await API.post(`/rooms/direct/${userId}`);
      setActiveRoom(data);
      setTab("dms");
      await fetchDMs();
    } catch {
      toast.error("DM nahi khula");
    }
  };

  const joinPublicRoom = async (roomId) => {
    try {
      const { data } = await API.post(`/rooms/${roomId}/join`);
      setRooms((prev) => {
        if (prev.find((r) => r._id === data._id)) return prev;
        return [...prev, data];
      });
      setActiveRoom(data);
      toast.success("Room join ho gaye!");
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logout ho gaye");
  };

  const ROOM_ICONS = ["💬", "🏠", "👨‍👩‍👧‍👦", "🎉", "💼", "📚", "🎮", "🎵", "🌟", "❤️"];

  return (
    <div className="h-full bg-dark-200 flex flex-col border-r border-white/5">
      {/* User profile at top */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} color={user?.avatarColor} online={true} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
            <p className="text-xs text-green-400">● Online</p>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-xl transition-colors" title="Logout">
            <FiLogOut className="w-4 h-4 text-white/50 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-white/80 placeholder-white/20 text-sm outline-none focus:border-primary-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-3 gap-1 mb-2">
        {[
          { key: "rooms", icon: <FiHash />, label: "Rooms" },
          { key: "dms", icon: <FiMessageCircle />, label: "Messages" },
          { key: "users", icon: <FiUsers />, label: "Users" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
              tab === t.key
                ? "bg-primary-600/30 text-primary-400 border border-primary-500/30"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {/* Rooms Tab */}
        {tab === "rooms" && (
          <div className="space-y-0.5">
            <div className="flex items-center justify-between px-2 py-1.5 mb-1">
              <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Channels</p>
              <button
                onClick={() => setShowNewRoom(!showNewRoom)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiPlus className="w-3.5 h-3.5 text-white/40 hover:text-white" />
              </button>
            </div>

            {showNewRoom && (
              <div className="mb-3 p-3 bg-white/5 rounded-xl space-y-2 border border-white/10 animate-fade-in">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ROOM_ICONS.map((ic) => (
                    <button
                      key={ic}
                      onClick={() => setNewRoomIcon(ic)}
                      className={`w-7 h-7 rounded-lg text-sm transition-all ${newRoomIcon === ic ? "bg-primary-600" : "hover:bg-white/10"}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Room ka naam..."
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createRoom()}
                  className="w-full bg-dark-300 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-primary-500/50"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={createRoom} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium py-1.5 rounded-lg transition-colors">
                    Banao
                  </button>
                  <button onClick={() => setShowNewRoom(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium py-1.5 rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {rooms
              .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
              .map((room) => (
                <button
                  key={room._id}
                  onClick={() => setActiveRoom(room)}
                  className={`sidebar-item w-full text-left ${activeRoom?._id === room._id ? "sidebar-item-active" : "text-white/60 hover:text-white"}`}
                >
                  <span className="text-lg shrink-0">{room.icon || "💬"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{room.name}</p>
                    <p className="text-xs text-white/30 truncate">{room.members?.length || 0} members</p>
                  </div>
                </button>
              ))}

            {rooms.length === 0 && (
              <p className="text-center text-white/20 text-xs py-6">
                Koi room nahi hai.<br />Naya room banao! ☝️
              </p>
            )}
          </div>
        )}

        {/* DMs Tab */}
        {tab === "dms" && (
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-2 py-1.5 mb-1">Direct Messages</p>
            {dmRooms
              .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
              .map((room) => {
                const other = room.members?.find((m) => m._id !== user?._id);
                const isOnline = onlineUsers.includes(other?._id);
                return (
                  <button
                    key={room._id}
                    onClick={() => setActiveRoom(room)}
                    className={`sidebar-item w-full text-left ${activeRoom?._id === room._id ? "sidebar-item-active" : "text-white/60 hover:text-white"}`}
                  >
                    <Avatar name={other?.name} color={other?.avatarColor} size="sm" online={isOnline} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{other?.name || room.name}</p>
                      <p className={`text-xs ${isOnline ? "text-green-400" : "text-white/30"}`}>
                        {isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </button>
                );
              })}
            {dmRooms.length === 0 && (
              <p className="text-center text-white/20 text-xs py-6">
                Koi DM nahi.<br />Users tab se kisi ko message karo!
              </p>
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-2 py-1.5 mb-1">Sab Users</p>
            {users
              .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
              .map((u) => {
                const isOnline = onlineUsers.includes(u._id);
                return (
                  <button
                    key={u._id}
                    onClick={() => openDM(u._id)}
                    className="sidebar-item w-full text-left text-white/60 hover:text-white"
                  >
                    <Avatar name={u.name} color={u.avatarColor} size="sm" online={isOnline} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{u.name}</p>
                      <p className="text-xs text-white/30 truncate">{u.bio || "Koi bio nahi"}</p>
                    </div>
                    <FiMessageCircle className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                  </button>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
