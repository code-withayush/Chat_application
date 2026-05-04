import { useState, useRef, useEffect } from "react";
import { FiSend, FiX, FiSmile, FiImage, FiFile, FiMic, FiSquare, FiPlus, FiChevronDown } from "react-icons/fi";
import { MdOutlinePayment } from "react-icons/md";
import API from "../utils/api";

const EMOJIS = [
  "😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊",
  "😋","😎","😍","😘","🥰","😗","😙","😚","🙂","🤗",
  "🤩","🤔","🤨","😐","😑","😶","🙄","😏","😣","😥",
  "😮","🤐","😯","😪","😫","🥱","😴","😌","😛","😜",
  "😝","🤤","😒","😓","😔","😕","🙃","🫠","🥲","😢",

  "😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱",
  "😨","😰","😥","😓","🤗","🤭","🫢","🫣","🫡","🤫",
  "🫠","🤥","😶‍🌫️","😵","😵‍💫","🤠","🥳","😇","🤓","🧐",
  "😈","👿","👻","💀","☠️","👽","🤖","🎃","😺","😸",
  "😹","😻","😼","😽","🙀","😿","😾","🙈","🙉","🙊"
];

export default function MessageInput({ onSend, onTyping, replyTo, onCancelReply, roomName }) {
  const [text, setText]               = useState("");
  const [showEmoji, setShowEmoji]     = useState(false);
  const [showActions, setShowActions] = useState(false); // mobile extra actions tray
  const [isTyping, setIsTyping]       = useState(false);
  const [recording, setRecording]     = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading]     = useState(false);

  const typingTimer = useRef(null);
  const inputRef    = useRef(null);
  const fileRef     = useRef(null);
  const imageRef    = useRef(null);
  const mediaRef    = useRef(null);
  const chunksRef   = useRef([]);
  const timerRef    = useRef(null);

  useEffect(() => () => {
    clearTimeout(typingTimer.current);
    clearInterval(timerRef.current);
  }, []);

  // close trays when typing starts
  const handleChange = (e) => {
    setText(e.target.value);
    setShowEmoji(false);
    setShowActions(false);
    if (!isTyping) { setIsTyping(true); onTyping(true); }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { setIsTyping(false); onTyping(false); }, 1500);
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
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const insertEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await API.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const msg =
        type === "image" ? `[IMAGE]${data.url}[/IMAGE]` :
        type === "audio" ? `[AUDIO]${data.url}[/AUDIO]` :
        `[FILE]${data.name}|${data.url}[/FILE]`;
      onSend(msg);
    } catch { alert("File upload nahi hua, dobara try karo"); }
    finally { setUploading(false); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await handleFileUpload(new File([blob], `voice_${Date.now()}.webm`, { type: "audio/webm" }), "audio");
      };
      mr.start();
      setRecording(true);
      let t = 0;
      timerRef.current = setInterval(() => setRecordingTime(++t), 1000);
    } catch { alert("Mic permission do browser ko!"); }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
    setRecordingTime(0);
    clearInterval(timerRef.current);
  };

  const handlePayment = () => {
    const amount = prompt("Payment amount (₹) likho:");
    if (amount && !isNaN(amount)) onSend(`💸 Payment Request: ₹${amount}`);
  };

  return (
    <div
      className="px-2 sm:px-4 py-2 sm:py-3 bg-dark-200/80 border-t border-white/5 shrink-0"
      onClick={() => { if (showEmoji) setShowEmoji(false); if (showActions) setShowActions(false); }}
    >

      {/* ── Reply Preview ── */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-white/5 border-l-2 border-primary-500 rounded-r-xl">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary-400 font-medium">{replyTo.sender?.name}</p>
            <p className="text-xs text-white/40 truncate">{replyTo.text}</p>
          </div>
          <button onClick={onCancelReply} className="p-1 hover:bg-white/10 rounded-lg shrink-0">
            <FiX className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>
      )}

      {/* ── Recording Bar ── */}
      {recording && (
        <div className="flex items-center gap-3 mb-2 px-3 py-2 bg-red-500/10 rounded-xl border border-red-500/30">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-sm flex-1">🎙️ {recordingTime}s</span>
          <button onClick={stopRecording} className="p-1.5 bg-red-500 hover:bg-red-600 rounded-lg">
            <FiSquare className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}

      {/* ── Uploading Bar ── */}
      {uploading && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-primary-500/10 rounded-xl border border-primary-500/30">
          <div className="w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-primary-400 text-xs">Upload ho raha hai...</span>
        </div>
      )}

      {/* ── Emoji Picker ── */}
      {showEmoji && (
        <div
          className="mb-2 bg-dark-100 border border-white/10 rounded-2xl p-3 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => insertEmoji(e)}
                className="text-xl hover:scale-125 transition-transform hover:bg-white/10 rounded-lg p-1 w-9 h-9 flex items-center justify-center">
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile Extra Actions Tray ── */}
      {showActions && (
        <div
          className="mb-2 flex items-center gap-2 px-2 py-2 bg-dark-100 border border-white/10 rounded-2xl sm:hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image */}
          <button onClick={() => { imageRef.current.click(); setShowActions(false); }}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-white/10 transition-colors">
            <FiImage className="w-5 h-5 text-blue-400" />
            <span className="text-white/40 text-xs">Photo</span>
          </button>

          {/* File */}
          <button onClick={() => { fileRef.current.click(); setShowActions(false); }}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-white/10 transition-colors">
            <FiFile className="w-5 h-5 text-green-400" />
            <span className="text-white/40 text-xs">File</span>
          </button>

          {/* Payment */}
          <button onClick={() => { handlePayment(); setShowActions(false); }}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-white/10 transition-colors">
            <MdOutlinePayment className="w-5 h-5 text-yellow-400" />
            <span className="text-white/40 text-xs">Pay</span>
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={imageRef} type="file" accept="image/*" hidden
        onChange={(e) => { handleFileUpload(e.target.files[0], "image"); e.target.value = ""; }} />
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt,.zip,.rar,.xlsx,.pptx" hidden
        onChange={(e) => { handleFileUpload(e.target.files[0], "file"); e.target.value = ""; }} />

      {/* ── Main Row ── */}
      <div className="flex items-center gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>

        {/* + button — mobile only (opens action tray) */}
        <button
          onClick={() => { setShowActions(!showActions); setShowEmoji(false); }}
          className={`sm:hidden p-2.5 rounded-xl transition-all shrink-0 ${showActions ? "bg-primary-500/20 text-primary-400" : "bg-white/8 text-white/50 hover:bg-white/15"}`}
        >
          <FiPlus className={`w-5 h-5 transition-transform duration-200 ${showActions ? "rotate-45" : ""}`} />
        </button>

        {/* Desktop action buttons */}
        <div className="hidden sm:flex items-center gap-0.5 shrink-0">
          <button onClick={() => setShowEmoji(!showEmoji)}
            className={`p-2 rounded-xl transition-all ${showEmoji ? "text-primary-400 bg-primary-500/20" : "text-white/40 hover:text-white/70 hover:bg-white/10"}`}>
            <FiSmile className="w-5 h-5" />
          </button>
          <button onClick={() => imageRef.current.click()}
            className="p-2 text-white/40 hover:text-white/70 hover:bg-white/10 rounded-xl transition-all">
            <FiImage className="w-5 h-5" />
          </button>
          <button onClick={() => fileRef.current.click()}
            className="p-2 text-white/40 hover:text-white/70 hover:bg-white/10 rounded-xl transition-all">
            <FiFile className="w-5 h-5" />
          </button>
          <button onClick={handlePayment}
            className="p-2 text-white/40 hover:text-white/70 hover:bg-white/10 rounded-xl transition-all">
            <MdOutlinePayment className="w-5 h-5" />
          </button>
        </div>

        {/* Emoji button — mobile only (inline, not in tray) */}
        <button
          onClick={() => { setShowEmoji(!showEmoji); setShowActions(false); }}
          className={`sm:hidden p-2.5 rounded-xl transition-all shrink-0 ${showEmoji ? "text-primary-400 bg-primary-500/20" : "text-white/50 bg-white/8 hover:bg-white/15"}`}
        >
          <FiSmile className="w-5 h-5" />
        </button>

        {/* Textarea */}
        <div className="flex-1 bg-dark-100 border border-white/10 rounded-2xl flex items-center focus-within:border-primary-500/40 transition-colors min-w-0">
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={`${roomName || "Room"} mein message...`}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-white/25 text-sm px-3 sm:px-4 py-2.5 sm:py-3 outline-none resize-none max-h-28 leading-relaxed min-w-0"
            style={{ scrollbarWidth: "none" }}
          />
        </div>

        {/* Send / Mic */}
        {text.trim() ? (
          <button onClick={handleSend}
            className="p-2.5 bg-primary-600 hover:bg-primary-700 rounded-xl text-white shadow-lg shadow-primary-600/20 active:scale-95 shrink-0 transition-all">
            <FiSend className="w-5 h-5" />
          </button>
        ) : (
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
            className={`p-2.5 rounded-xl shrink-0 transition-all ${recording ? "bg-red-500 text-white animate-pulse" : "bg-white/10 hover:bg-white/20 text-white/60 hover:text-white"}`}
          >
            <FiMic className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Hint — desktop only */}
      <p className="hidden sm:block text-center text-white/15 text-xs mt-2">
        Enter bhejo • Shift+Enter naya line • Mic hold karo voice ke liye
      </p>
    </div>
  );
}