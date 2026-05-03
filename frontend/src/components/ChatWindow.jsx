import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import API from "../utils/api";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { FiUsers } from "react-icons/fi";

export default function ChatWindow({ room }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const bottomRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!room) return;
    setLoading(true);
    try {
      const { data } = await API.get(`/messages/${room._id}`);
      setMessages(data);
    } catch {}
    setLoading(false);
  }, [room?._id]);

  useEffect(() => {
    fetchMessages();
    setTypingUsers([]);
    setReplyTo(null);
  }, [room?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ FIXED Socket events
  useEffect(() => {
    if (!socket || !room) return;

    socket.emit("room:join", room._id);

    // Pehle purane listeners hata do
    socket.off("message:new");
    socket.off("message:deleted");
    socket.off("message:reacted");
    socket.off("typing:start");
    socket.off("typing:stop");

    socket.on("message:new", (msg) => {
      if (msg.room === room._id || msg.room?.toString() === room._id?.toString()) {
        setMessages((prev) => {
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });

    socket.on("message:deleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, text: "Yeh message delete ho gaya" }
            : m
        )
      );
    });

    socket.on("message:reacted", (updated) => {
      setMessages((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
    });

    socket.on("typing:start", ({ userId, userName, roomId }) => {
      if (roomId === room._id && userId !== user?._id) {
        setTypingUsers((prev) => {
          if (prev.find((u) => u.userId === userId)) return prev;
          return [...prev, { userId, userName }];
        });
      }
    });

    socket.on("typing:stop", ({ userId, roomId }) => {
      if (roomId === room._id) {
        setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
      }
    });

    return () => {
      socket.off("message:new");
      socket.off("message:deleted");
      socket.off("message:reacted");
      socket.off("typing:start");
      socket.off("typing:stop");
    };
  }, [socket, room?._id]); // ✅ room._id pe depend karo

  const sendMessage = (text) => {
    if (!socket || !room || !text.trim()) return;
    socket.emit("message:send", {
      roomId: room._id,
      text,
      replyTo: replyTo?._id || null,
    });
    setReplyTo(null);
  };

  const handleDelete = (messageId) => {
    if (!socket || !room) return;
    socket.emit("message:delete", { messageId, roomId: room._id });
  };

  const handleReact = (messageId, emoji) => {
    if (!socket || !room) return;
    socket.emit("message:react", { messageId, emoji, roomId: room._id });
  };

  const handleTyping = (isTyping) => {
    if (!socket || !room) return;
    socket.emit(isTyping ? "typing:start" : "typing:stop", { roomId: room._id });
  };

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dark-300">
        <div className="text-center animate-fade-in">
          <div className="text-7xl mb-6">💬</div>
          <h2 className="text-2xl font-bold text-white mb-2">ChatApp mein Swagat Hai!</h2>
          <p className="text-white/40 mb-1">Left sidebar se koi room ya friend chunno</p>
          <p className="text-white/20 text-sm">Baat shuru karo 🚀</p>
        </div>
      </div>
    );
  }

  const isDM = room.isDirect;
  const otherMember = isDM ? room.members?.find((m) => m._id !== user?._id) : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-300 min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-dark-200 border-b border-white/5 shrink-0">
        {isDM ? (
          <>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: otherMember?.avatarColor || "#7C3AED" }}
            >
              {otherMember?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{otherMember?.name || "User"}</p>
              <p className="text-xs text-white/30">{otherMember?.bio || "Direct message"}</p>
            </div>
          </>
        ) : (
          <>
            <span className="text-2xl">{room.icon || "💬"}</span>
            <div>
              <p className="font-semibold text-white text-sm">{room.name}</p>
              <p className="text-xs text-white/30">
                {room.members?.length || 0} members
                {room.description ? ` • ${room.description}` : ""}
              </p>
            </div>
          </>
        )}
        <div className="ml-auto flex items-center gap-1">
          <FiUsers className="w-4 h-4 text-white/30" />
          <span className="text-xs text-white/30">{room.members?.length || 0}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <span className="text-5xl mb-4">{room.icon || "👋"}</span>
            <p className="text-white/40 font-medium">
              {isDM
                ? `${otherMember?.name} ko pehla message bhejo!`
                : `#${room.name} mein pehla message bhejo!`}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const prevMsg = messages[i - 1];
            const showAvatar =
              !prevMsg ||
              prevMsg.sender?._id !== msg.sender?._id ||
              new Date(msg.createdAt) - new Date(prevMsg.createdAt) > 300000;

            return (
              <MessageBubble
                key={msg._id}
                message={msg}
                isOwn={msg.sender?._id === user?._id}
                showAvatar={showAvatar}
                onDelete={handleDelete}
                onReact={handleReact}
                onReply={setReplyTo}
              />
            );
          })
        )}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-3 px-2 py-1 animate-fade-in">
            <div className="flex items-center gap-1 bg-dark-100 rounded-2xl rounded-bl-sm px-4 py-2.5">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white/50 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-white/50 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-white/50 rounded-full typing-dot" />
              </div>
            </div>
            <span className="text-xs text-white/30">
              {typingUsers.map((u) => u.userName).join(", ")} likh raha hai...
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        onTyping={handleTyping}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        roomName={isDM ? otherMember?.name : room.name}
      />
    </div>
  );
}