import { useState, useRef, useEffect } from "react";
import { FiTrash2, FiCornerUpLeft, FiMoreHorizontal } from "react-icons/fi";

const REACTIONS = ["❤️", "😂", "👍", "😮", "😢", "🙏", "🔥", "👏"];

function timeFormat(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" });
}

function dateDivider(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Aaj";
  if (d.toDateString() === yesterday.toDateString()) return "Kal";
  return d.toLocaleDateString("hi-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default function MessageBubble({ message, isOwn, showAvatar, onDelete, onReact, onReply }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowEmoji(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (message.isDeleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-1`}>
        <span className="text-xs text-white/20 italic px-3 py-1.5 bg-white/5 rounded-xl">
          🗑️ {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2.5 group mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"} animate-slide-up`}>
      {/* Avatar */}
      <div className="w-7 shrink-0 mb-1">
        {showAvatar && !isOwn && (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: message.sender?.avatarColor || "#7C3AED" }}
          >
            {message.sender?.name?.[0]?.toUpperCase() || "?"}
          </div>
        )}
      </div>

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-xs lg:max-w-md`}>
        {/* Sender name + time */}
        {showAvatar && !isOwn && (
          <p className="text-xs text-white/40 mb-1 ml-1 font-medium">
            {message.sender?.name}
          </p>
        )}

        {/* Reply preview */}
        {message.replyTo && (
          <div className={`mb-1 px-3 py-1.5 rounded-xl text-xs border-l-2 border-primary-500 bg-white/5 max-w-full ${isOwn ? "text-right" : "text-left"}`}>
            <p className="text-primary-400 font-medium truncate">{message.replyTo.sender?.name || "User"}</p>
            <p className="text-white/40 truncate">{message.replyTo.text}</p>
          </div>
        )}

        {/* Message + actions */}
        <div className="relative flex items-end gap-1">
          {/* Actions (show on hover) */}
          {!isOwn && (
            <div ref={menuRef} className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 order-first">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="text-xs">😊</span>
              </button>
              <button
                onClick={() => { onReply(message); setShowMenu(false); }}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiCornerUpLeft className="w-3 h-3 text-white/50" />
              </button>

              {/* Emoji picker */}
              {showEmoji && (
                <div className="absolute bottom-8 left-0 bg-dark-100 border border-white/10 rounded-xl p-2 flex gap-1 z-20 shadow-xl">
                  {REACTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => { onReact(message._id, e); setShowEmoji(false); }}
                      className="text-lg hover:scale-125 transition-transform"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bubble */}
          <div className={isOwn ? "message-bubble-mine" : "message-bubble-other"}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
            <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? "justify-end" : "justify-start"}`}>
              <span className="text-xs opacity-40">{timeFormat(message.createdAt)}</span>
              {message.isEdited && <span className="text-xs opacity-30">(edited)</span>}
              {isOwn && <span className="text-xs opacity-40">✓✓</span>}
            </div>
          </div>

          {/* Own message actions */}
          {isOwn && (
            <div ref={menuRef} className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="text-xs">😊</span>
              </button>
              <button
                onClick={() => { onReply(message); setShowMenu(false); }}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiCornerUpLeft className="w-3 h-3 text-white/50" />
              </button>
              <button
                onClick={() => { onDelete(message._id); setShowMenu(false); }}
                className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <FiTrash2 className="w-3 h-3 text-white/30 hover:text-red-400" />
              </button>

              {showEmoji && (
                <div className="absolute bottom-8 right-0 bg-dark-100 border border-white/10 rounded-xl p-2 flex gap-1 z-20 shadow-xl">
                  {REACTIONS.map((e) => (
                    <button
                      key={e}
                      onClick={() => { onReact(message._id, e); setShowEmoji(false); }}
                      className="text-lg hover:scale-125 transition-transform"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 ml-1">
            {message.reactions
              .filter((r) => r.users.length > 0)
              .map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => onReact(message._id, r.emoji)}
                  className="flex items-center gap-1 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full px-2 py-0.5 text-xs transition-colors"
                >
                  {r.emoji}
                  <span className="text-white/60">{r.users.length}</span>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
