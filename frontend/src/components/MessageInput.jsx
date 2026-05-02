import { useState, useRef, useEffect } from "react";
import { FiSend, FiX, FiSmile } from "react-icons/fi";

const EMOJIS = ["😀","😂","😍","🥺","😎","🤔","👍","❤️","🔥","🎉","😭","🙏","💯","😊","🤣","😅","👏","🥳","✨","💬"];

export default function MessageInput({ onSend, onTyping, replyTo, onCancelReply, roomName }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef(null);
  const inputRef = useRef(null);

  const handleChange = (e) => {
    setText(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1500);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
    setIsTyping(false);
    onTyping(false);
    clearTimeout(typingTimer.current);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    return () => clearTimeout(typingTimer.current);
  }, []);

  return (
    <div className="px-4 py-3 bg-dark-200/80 border-t border-white/5 shrink-0">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-white/5 border-l-2 border-primary-500 rounded-r-xl animate-fade-in">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary-400 font-medium">{replyTo.sender?.name}</p>
            <p className="text-xs text-white/40 truncate">{replyTo.text}</p>
          </div>
          <button onClick={onCancelReply} className="p-1 hover:bg-white/10 rounded-lg transition-colors shrink-0">
            <FiX className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2.5 relative">
        {/* Emoji picker */}
        {showEmoji && (
          <div className="absolute bottom-full left-0 mb-2 bg-dark-100 border border-white/10 rounded-2xl p-3 z-20 shadow-2xl w-72">
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => insertEmoji(e)}
                  className="text-xl hover:scale-125 transition-transform hover:bg-white/10 rounded-lg p-1"
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Emoji button */}
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="p-2.5 text-white/40 hover:text-white/70 hover:bg-white/10 rounded-xl transition-all shrink-0"
        >
          <FiSmile className="w-5 h-5" />
        </button>

        {/* Text input */}
        <div className="flex-1 bg-dark-100 border border-white/10 rounded-2xl flex items-end">
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`${roomName || "Room"} mein message bhejo...`}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-white/25 text-sm px-4 py-3 outline-none resize-none max-h-32 leading-relaxed"
            style={{ scrollbarWidth: "none" }}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className={`p-2.5 rounded-xl transition-all shrink-0 ${
            text.trim()
              ? "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20 active:scale-95"
              : "bg-white/5 text-white/20 cursor-not-allowed"
          }`}
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>

      <p className="text-center text-white/15 text-xs mt-2">
        Enter bhejo • Shift+Enter naya line
      </p>
    </div>
  );
}
