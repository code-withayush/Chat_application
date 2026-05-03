import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import API from "../utils/api";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import {
  FiUsers, FiPhone, FiVideo, FiMoreVertical, FiTrash2, FiX,
  FiMessageSquare, FiMail, FiClock, FiUserCheck, FiArrowLeft, FiChevronLeft
} from "react-icons/fi";
import toast from "react-hot-toast";

// ── Profile Modal ──────────────────────────────────────────────
function ProfileModal({ user, isOnline, onClose }) {
  if (!user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleString("en-US", { month: "long", year: "numeric" })
    : "—";

  const lastSeenText = isOnline
    ? "Active now"
    : user.lastSeen
    ? new Date(user.lastSeen).toLocaleString("en-US", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
      })
    : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:w-80 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1a1a2e" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-10 text-white/40 hover:text-white p-1">
          <FiX className="w-5 h-5" />
        </button>

        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="h-24" style={{ background: "linear-gradient(135deg, #7b2ff7, #9b59f5)" }} />

        <div className="px-5 pb-6 max-h-[70vh] overflow-y-auto" style={{ marginTop: "-40px" }}>
          <div className="mb-3 relative inline-block">
            <div
              className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-white text-3xl font-bold"
              style={{ backgroundColor: user.avatarColor || "#7b2ff7", borderColor: "#1a1a2e" }}
            >
              {user.name?.[0]?.toUpperCase()}
            </div>
            <span
              className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2"
              style={{ backgroundColor: isOnline ? "#22c55e" : "#6b7280", borderColor: "#1a1a2e" }}
            />
          </div>

          <div className="mb-4">
            <h2 className="text-white text-xl font-bold">{user.name}</h2>
            <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: isOnline ? "#22c55e" : "#6b7280" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: isOnline ? "#22c55e" : "#6b7280" }} />
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>

          <div className="flex flex-col gap-2 mb-4">
            {[
              { icon: <FiMessageSquare className="w-4 h-4" />, label: "Bio",          value: user.bio || "No bio",         iconBg: "#352d6a", iconColor: "#9b7ff0" },
              { icon: <FiMail className="w-4 h-4" />,          label: "Email",        value: user.email,                   iconBg: "#2a354a", iconColor: "#6aadee" },
              { icon: <FiClock className="w-4 h-4" />,         label: "Last seen",    value: lastSeenText,                 iconBg: "#1e3a2a", iconColor: "#22c55e", valueColor: isOnline ? "#22c55e" : "#e0e0f0" },
              { icon: <FiUserCheck className="w-4 h-4" />,     label: "Member since", value: memberSince,                  iconBg: "#2a3050", iconColor: "#7baef0" },
            ].map(({ icon, label, value, iconBg, iconColor, valueColor }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#252540" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: iconBg, color: iconColor }}>
                  {icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs mb-0.5" style={{ color: "#888" }}>{label}</p>
                  <p className="text-sm truncate" style={{ color: valueColor || "#e0e0f0" }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg, #7b2ff7, #9b59f5)" }}
          >
            <FiMessageSquare className="w-4 h-4" /> Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Call Modal ──────────────────────────────────────────────────
function CallModal({ callType, otherUser, socket, targetUserId, onEnd, isIncoming }) {
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pcRef          = useRef(null);
  const localStreamRef = useRef(null);
  const [muted,    setMuted]    = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [status,   setStatus]   = useState(isIncoming ? "incoming" : "calling");

  useEffect(() => {
    if (!isIncoming) initCall();
    setupSocketListeners();
    return () => cleanup();
  }, []);

  const setupSocketListeners = () => {
    socket.on("webrtc:offer", async ({ offer }) => {
      const pc = await createPC();
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc:answer", { targetUserId, answer });
      setStatus("connected");
    });
    socket.on("webrtc:answer", async ({ answer }) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      setStatus("connected");
    });
    socket.on("webrtc:ice-candidate", ({ candidate }) => {
      pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
    });
    socket.on("call:ended", () => { cleanup(); onEnd(); });
  };

  const createPC = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: callType === "video", audio: true });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pcRef.current = pc;
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.ontrack = (e) => {
      if (callType === "video" && remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      if (callType === "audio" && remoteAudioRef.current) remoteAudioRef.current.srcObject = e.streams[0];
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit("webrtc:ice-candidate", { targetUserId, candidate: e.candidate });
    };
    return pc;
  };

  const initCall = async () => {
    const pc = await createPC();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit("webrtc:offer", { targetUserId, offer });
  };

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    ["webrtc:offer","webrtc:answer","webrtc:ice-candidate","call:ended"].forEach((e) => socket.off(e));
    socket.emit("call:ended", { targetUserId });
  };

  const endCall     = () => { cleanup(); onEnd(); };
  const toggleMute  = () => { const t = localStreamRef.current?.getAudioTracks()[0]; if (t) { t.enabled = !t.enabled; setMuted(!muted); } };
  const toggleVideo = () => { const t = localStreamRef.current?.getVideoTracks()[0]; if (t) { t.enabled = !t.enabled; setVideoOff(!videoOff); } };
  const acceptCall  = () => { setStatus("connecting"); socket.emit("call:accepted", { callerId: targetUserId }); };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center gap-4 px-4">
      {callType === "video" && (
        <div className="relative w-full max-w-2xl h-64 sm:h-96 bg-dark-200 rounded-2xl overflow-hidden">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <video ref={localVideoRef}  autoPlay playsInline muted
            className="absolute bottom-3 right-3 w-24 h-20 sm:w-36 sm:h-28 rounded-xl object-cover border-2 border-white/20 shadow-xl" />
        </div>
      )}
      {callType === "audio" && (
        <div className="flex flex-col items-center gap-4">
          <audio ref={remoteAudioRef} autoPlay />
          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl font-bold ${status === "connected" ? "ring-4 ring-green-400 ring-offset-4 ring-offset-black" : ""}`}
            style={{ backgroundColor: otherUser?.avatarColor || "#7C3AED" }}>
            {otherUser?.name?.[0]?.toUpperCase()}
          </div>
          <h2 className="text-white text-xl font-bold">{otherUser?.name}</h2>
          <p className="text-white/50 text-sm animate-pulse">
            {status === "incoming" ? "📞 Incoming call..." : status === "calling" ? "📞 Calling..." : status === "connecting" ? "Connecting..." : "🟢 Connected"}
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 mt-2">
        {status === "incoming" ? (
          <>
            <div className="flex flex-col items-center gap-1">
              <button onClick={acceptCall} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 active:scale-95 transition-all">
                <span className="text-xl sm:text-2xl">📞</span>
              </button>
              <span className="text-white/40 text-xs">Accept</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <button onClick={endCall} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-all">
                <span className="text-xl sm:text-2xl">📵</span>
              </button>
              <span className="text-white/40 text-xs">Reject</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-1">
              <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${muted ? "bg-red-500" : "bg-white/10 hover:bg-white/20"}`}>
                <span className="text-xl">{muted ? "🔇" : "🎤"}</span>
              </button>
              <span className="text-white/40 text-xs">{muted ? "Unmute" : "Mute"}</span>
            </div>
            {callType === "video" && (
              <div className="flex flex-col items-center gap-1">
                <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${videoOff ? "bg-red-500" : "bg-white/10 hover:bg-white/20"}`}>
                  <span className="text-xl">{videoOff ? "📷" : "📹"}</span>
                </button>
                <span className="text-white/40 text-xs">{videoOff ? "Cam On" : "Cam Off"}</span>
              </div>
            )}
            <div className="flex flex-col items-center gap-1">
              <button onClick={endCall} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition-all">
                <span className="text-xl sm:text-2xl">📵</span>
              </button>
              <span className="text-white/40 text-xs">End</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Message Renderer ────────────────────────────────────────────
function renderMessageContent(text) {
  if (!text) return null;
  if (text.startsWith("[IMAGE]") && text.endsWith("[/IMAGE]")) {
    const url = text.slice(7, -8);
    return (
      <img src={url} alt="Shared" className="max-w-[200px] sm:max-w-xs max-h-64 rounded-xl object-cover cursor-pointer hover:opacity-90"
        onClick={() => window.open(url, "_blank")} />
    );
  }
  if (text.startsWith("[AUDIO]") && text.endsWith("[/AUDIO]")) {
    const url = text.slice(7, -8);
    return (
      <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
        <span>🎙️</span>
        <audio controls src={url} className="h-8 max-w-[180px] sm:max-w-xs" style={{ filter: "invert(0.8)" }} />
      </div>
    );
  }
  if (text.startsWith("[FILE]") && text.endsWith("[/FILE]")) {
    const [name, url] = text.slice(6, -6).split("|");
    return (
      <a href={url} target="_blank" rel="noreferrer"
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 transition-colors group">
        <span className="text-2xl">📄</span>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate max-w-[130px] sm:max-w-[200px] group-hover:underline">{name}</p>
          <p className="text-white/40 text-xs">Click to download</p>
        </div>
      </a>
    );
  }
  return <span>{text}</span>;
}

// ── Main ChatWindow ─────────────────────────────────────────────
export default function ChatWindow({ room, onBack }) {
  const { user }                = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages,    setMessages]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [replyTo,     setReplyTo]     = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [showMenu,    setShowMenu]    = useState(false);
  const [callState,   setCallState]   = useState(null);
  const bottomRef = useRef(null);

  const isDM          = room?.isDirect;
  const otherMember   = isDM ? room?.members?.find((m) => m._id !== user?._id) : null;
  const otherIsOnline = otherMember ? onlineUsers.includes(otherMember._id) : false;

  const fetchMessages = useCallback(async () => {
    if (!room) return;
    setLoading(true);
    try { const { data } = await API.get(`/messages/${room._id}`); setMessages(data); } catch {}
    setLoading(false);
  }, [room?._id]);

  useEffect(() => {
    fetchMessages();
    setTypingUsers([]);
    setReplyTo(null);
    setShowMenu(false);
  }, [room?._id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (!socket || !room) return;
    socket.emit("room:join", room._id);
    socket.off("message:new");
    socket.off("message:deleted");
    socket.off("message:reacted");
    socket.off("typing:start");
    socket.off("typing:stop");
    socket.off("call:incoming");
    socket.off("call:rejected");

    socket.on("message:new", (msg) => {
      if (msg.room === room._id || msg.room?.toString() === room._id?.toString()) {
        setMessages((prev) => prev.find((m) => m._id === msg._id) ? prev : [...prev, msg]);
      }
    });
    socket.on("message:deleted", ({ messageId }) => {
      setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, isDeleted: true, text: "This message was deleted" } : m));
    });
    socket.on("message:reacted", (updated) => {
      setMessages((prev) => prev.map((m) => m._id === updated._id ? updated : m));
    });
    socket.on("typing:start", ({ userId, userName, roomId }) => {
      if (roomId === room._id && userId !== user?._id)
        setTypingUsers((prev) => prev.find((u) => u.userId === userId) ? prev : [...prev, { userId, userName }]);
    });
    socket.on("typing:stop", ({ userId, roomId }) => {
      if (roomId === room._id) setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    });
    socket.on("call:incoming", ({ callerId, callerName, callType }) => {
      toast(`📞 ${callerName} is calling you!`, { duration: 5000 });
      setCallState({ type: callType, targetUserId: callerId, otherUser: { name: callerName }, isIncoming: true });
    });
    socket.on("call:rejected", () => { toast.error("Call was rejected"); setCallState(null); });

    return () => {
      ["message:new","message:deleted","message:reacted","typing:start","typing:stop","call:incoming","call:rejected"]
        .forEach((e) => socket.off(e));
    };
  }, [socket, room?._id]);

  const openProfile = async () => {
    if (!isDM || !otherMember) return;
    try {
      const { data } = await API.get("/auth/users");
      setProfileUser(data.find((u) => u._id === otherMember._id) || otherMember);
    } catch { setProfileUser(otherMember); }
    setShowProfile(true);
  };

  const sendMessage  = (text) => { if (!socket || !room || !text.trim()) return; socket.emit("message:send", { roomId: room._id, text, replyTo: replyTo?._id || null }); setReplyTo(null); };
  const handleDelete = (id)   => socket?.emit("message:delete", { messageId: id, roomId: room._id });
  const handleReact  = (id, e) => socket?.emit("message:react",  { messageId: id, emoji: e, roomId: room._id });
  const handleTyping = (isTyping) => socket?.emit(isTyping ? "typing:start" : "typing:stop", { roomId: room._id });

  const handleClearChat = async () => {
    if (!window.confirm("Are you sure you want to delete all messages? This cannot be undone!")) return;
    try {
      await API.delete(`/messages/clear/${room._id}`);
      setMessages([]);
      setShowMenu(false);
      toast.success("Chat cleared! 🗑️");
    } catch { toast.error("Could not clear chat"); }
  };

  const startCall = (type) => {
    if (!isDM || !otherMember) return toast.error("You can only call in DMs");
    setCallState({ type, targetUserId: otherMember._id, otherUser: otherMember, isIncoming: false });
    socket?.emit("call:initiate", { targetUserId: otherMember._id, callType: type, roomId: room._id, callerName: user?.name });
  };

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-300 h-full">
        <div className="text-center px-6">
          <div className="text-6xl sm:text-7xl mb-5">💬</div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome to ChatApp!</h2>
          <p className="text-white/40 text-sm sm:text-base">Select a room or friend to start chatting 🚀</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-300 min-w-0" onClick={() => setShowMenu(false)}>

      {/* ══ HEADER ══ */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-3 bg-dark-200 border-b border-white/5 shrink-0">
        {onBack && (
          <button onClick={onBack} className="lg:hidden p-2 -ml-1 rounded-xl hover:bg-white/10 transition-colors shrink-0">
            <FiChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        <button onClick={openProfile} className="shrink-0" disabled={!isDM}>
          {isDM ? (
            <div className="relative">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: otherMember?.avatarColor || "#7C3AED" }}>
                {otherMember?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-dark-200 ${otherIsOnline ? "bg-green-400" : "bg-gray-500"}`} />
            </div>
          ) : (
            <span className="text-xl">{room.icon || "💬"}</span>
          )}
        </button>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={openProfile}>
          <p className="font-semibold text-white text-sm truncate leading-tight">
            {isDM ? otherMember?.name || "User" : room.name}
          </p>
          <p className="text-xs text-white/40 truncate">
            {isDM
              ? (typingUsers.length > 0 ? "✍️ typing..." : otherIsOnline ? "🟢 Online" : "⚫ Offline")
              : `${room.members?.length || 0} members`}
          </p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {isDM && (
            <>
              <button onClick={() => startCall("audio")} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <FiPhone className="w-4 h-4 text-white/60 hover:text-white" />
              </button>
              <button onClick={() => startCall("video")} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                <FiVideo className="w-4 h-4 text-white/60 hover:text-white" />
              </button>
            </>
          )}
          {!isDM && (
            <div className="hidden sm:flex items-center gap-1 px-2">
              <FiUsers className="w-3.5 h-3.5 text-white/30" />
              <span className="text-xs text-white/30">{room.members?.length || 0}</span>
            </div>
          )}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <FiMoreVertical className="w-4 h-4 text-white/60 hover:text-white" />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-10 bg-dark-100 border border-white/10 rounded-xl shadow-2xl z-40 min-w-44 py-1"
                onClick={(e) => e.stopPropagation()}
              >
                {!isDM && (
                  <div className="sm:hidden flex items-center gap-2 px-4 py-2.5 text-xs text-white/30 border-b border-white/5">
                    <FiUsers className="w-3.5 h-3.5" />
                    {room.members?.length || 0} members
                  </div>
                )}
                <button onClick={handleClearChat}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors">
                  <FiTrash2 className="w-4 h-4" /> Clear Chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ MESSAGES ══ */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-4 space-y-1">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
            <span className="text-4xl sm:text-5xl mb-4">{room.icon || "👋"}</span>
            <p className="text-white/40 text-sm sm:text-base">
              {isDM ? `Send your first message to ${otherMember?.name}!` : `Send the first message in #${room.name}!`}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const prev = messages[i - 1];
            const showAvatar = !prev || prev.sender?._id !== msg.sender?._id ||
              new Date(msg.createdAt) - new Date(prev.createdAt) > 300000;
            return (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={msg.sender?._id === user?._id}
                showAvatar={showAvatar}
                onDelete={handleDelete}
                onReact={handleReact}
                onReply={setReplyTo}
                renderContent={renderMessageContent}
              />
            );
          })
        )}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex items-center gap-1 bg-dark-100 rounded-2xl rounded-bl-sm px-3 py-2.5">
              {[0, 150, 300].map((d) => (
                <div key={d} className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
            <span className="text-xs text-white/30 truncate">
              {typingUsers.map((u) => u.userName).join(", ")} is typing...
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ══ INPUT ══ */}
      <MessageInput
        onSend={sendMessage}
        onTyping={handleTyping}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        roomName={isDM ? otherMember?.name : room.name}
      />

      {/* ══ MODALS ══ */}
      {showProfile && isDM && (
        <ProfileModal user={profileUser} isOnline={otherIsOnline} onClose={() => { setShowProfile(false); setProfileUser(null); }} />
      )}
      {callState && (
        <CallModal callType={callState.type} otherUser={callState.otherUser} socket={socket}
          targetUserId={callState.targetUserId} isIncoming={callState.isIncoming} onEnd={() => setCallState(null)} />
      )}
    </div>
  );
}