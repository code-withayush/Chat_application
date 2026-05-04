import { useEffect, useRef, useState } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiEye, FiTrash2 } from "react-icons/fi";
import API from "../utils/api";

const DURATION = 5000;

export default function StatusViewer({
  group,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  isOwn,        // ← NEW: true when viewing own status
  onDelete,     // ← NEW: (statusId) => void
}) {
  const [index,        setIndex]        = useState(0);
  const [progress,     setProgress]     = useState(0);
  const [paused,       setPaused]       = useState(false);
  const [showViewers,  setShowViewers]  = useState(false);
  const [showDelConfirm, setShowDelConfirm] = useState(false);

  const timerRef = useRef(null);
  const startRef = useRef(null);
  const elapsed  = useRef(0);

  const current = group?.items?.[index];

  // ── Mark viewed ─────────────────────────────────────────────
  useEffect(() => {
    if (!current) return;
    API.post(`/status/${current._id}/view`).catch(() => {});
  }, [current?._id]);

  // ── Timer ───────────────────────────────────────────────────
  useEffect(() => {
    elapsed.current = 0;
    setProgress(0);
    if (!showViewers && !showDelConfirm) startTimer();
    return () => clearTimer();
  }, [index, group]);

  // Pause timer when sheets are open
  useEffect(() => {
    if (showViewers || showDelConfirm) {
      elapsed.current = Date.now() - startRef.current;
      clearTimer();
    } else {
      startTimer();
    }
  }, [showViewers, showDelConfirm]);

  const startTimer = () => {
    clearTimer();
    startRef.current = Date.now() - elapsed.current;
    timerRef.current = setInterval(() => {
      const spent = Date.now() - startRef.current;
      const pct   = Math.min((spent / DURATION) * 100, 100);
      setProgress(pct);
      if (spent >= DURATION) { clearTimer(); goNext(); }
    }, 50);
  };

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const pause  = () => { elapsed.current = Date.now() - startRef.current; clearTimer(); setPaused(true); };
  const resume = () => { if (!showViewers && !showDelConfirm) { setPaused(false); startTimer(); } };

  const goNext = () => {
    if (index < group.items.length - 1) setIndex((i) => i + 1);
    else onNext ? onNext() : onClose();
  };
  const goPrev = () => {
    if (index > 0) setIndex((i) => i - 1);
    else if (hasPrev) onPrev?.();
  };

  // ── Delete handler ───────────────────────────────────────────
  const handleDelete = async () => {
    setShowDelConfirm(false);
    await onDelete?.(current._id);
    // if more items remain in group, go next; else close
    if (group.items.length > 1) {
      if (index < group.items.length - 1) setIndex(index);
      else setIndex(index - 1);
    } else {
      onClose();
    }
  };

  const timeAgo = (dateStr) => {
    const m = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return h < 24 ? `${h}h ago` : "1d ago";
  };

  const timeLeft = (dateStr) => {
    const expiresAt = new Date(dateStr).getTime() + 24 * 60 * 60 * 1000;
    const diff = expiresAt - Date.now();
    if (diff <= 0) return "Expired";
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
  };

  if (!current) return null;

  const viewers = current.viewers || [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onMouseDown={pause}
      onMouseUp={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      {/* ── Progress bars ── */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-20">
        {group.items.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
            <div
              className="h-full bg-white rounded-full"
              style={{
                width: i < index ? "100%" : i === index ? `${progress}%` : "0%",
                transition: "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* ── Header ── */}
      <div className="absolute top-5 left-0 right-0 flex items-center gap-3 px-4 z-20">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: group.user?.avatarColor || "#7C3AED" }}
        >
          {group.user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm leading-tight">{group.user?.name}</p>
          <p className="text-white/50 text-xs">
            {timeAgo(current.createdAt)}
            {isOwn && (
              <span className="ml-1 text-white/30">· {timeLeft(current.createdAt)}</span>
            )}
          </p>
        </div>

        {/* Delete button — own status only */}
        {isOwn && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowDelConfirm(true); }}
            className="p-2 rounded-full bg-white/10 hover:bg-red-500/30 text-white/70 hover:text-red-400 transition-colors mr-1"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}

        <button onClick={onClose} className="p-1 text-white/70 hover:text-white">
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* ── Media ── */}
      <div className="w-full h-full flex items-center justify-center">
        {current.mediaType === "video" ? (
          <video
            key={current._id}
            src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${current.mediaUrl}`}
            autoPlay
            playsInline
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <img
            key={current._id}
            src={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}${current.mediaUrl}`}
            alt="status"
            className="max-h-full max-w-full object-contain select-none"
            draggable={false}
          />
        )}
      </div>

      {/* ── Caption ── */}
      {current.caption && (
        <div className="absolute px-6 z-20" style={{ bottom: isOwn ? "80px" : "40px" }}>
          <p className="text-white text-sm text-center drop-shadow-lg bg-black/30 rounded-xl px-4 py-2">
            {current.caption}
          </p>
        </div>
      )}

      {/* ── Views bar (own status only) ── */}
      {isOwn && (
        <button
          onClick={(e) => { e.stopPropagation(); setShowViewers(true); }}
          className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-2 px-5 py-4 bg-black/50 hover:bg-black/60 transition-colors"
        >
          <FiEye className="w-4 h-4 text-white/70" />
          <span className="text-white font-semibold text-sm">{viewers.length}</span>
          <span className="text-white/60 text-sm">
            {viewers.length === 1 ? "view" : "views"}
          </span>
          <span className="text-white/30 text-xs ml-1">· Tap to see</span>
          {/* Chevron up hint */}
          <svg className="w-3 h-3 text-white/30 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}

      {/* ── Tap zones / Arrow buttons ── */}
      <button
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
        className="absolute left-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-start pl-3 opacity-0 hover:opacity-100 transition-opacity"
      >
        <div className="bg-black/40 rounded-full p-1">
          <FiChevronLeft className="w-5 h-5 text-white" />
        </div>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); goNext(); }}
        className="absolute right-0 top-0 bottom-0 w-1/3 z-10 flex items-center justify-end pr-3 opacity-0 hover:opacity-100 transition-opacity"
      >
        <div className="bg-black/40 rounded-full p-1">
          <FiChevronRight className="w-5 h-5 text-white" />
        </div>
      </button>

      {/* ══════════════════════════════════════════════════
          VIEWERS BOTTOM SHEET
      ══════════════════════════════════════════════════ */}
      {showViewers && (
        <div
          className="absolute inset-0 z-30 flex flex-col justify-end"
          onClick={() => setShowViewers(false)}
        >
          <div
            className="rounded-t-3xl overflow-hidden"
            style={{ background: "#1a1a2e", maxHeight: "55vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Title row */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
              <div>
                <p className="text-white font-semibold text-base">
                  {viewers.length} {viewers.length === 1 ? "View" : "Views"}
                </p>
                <p className="text-white/40 text-xs mt-0.5">
                  {timeLeft(current.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setShowViewers(false)}
                className="p-1.5 rounded-full bg-white/10 text-white/60 hover:text-white"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Viewer list */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(55vh - 90px)" }}>
              {viewers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <FiEye className="w-8 h-8 text-white/20" />
                  <p className="text-white/30 text-sm">No views yet</p>
                  <p className="text-white/20 text-xs">Share your status to get views</p>
                </div>
              ) : (
                viewers.map((v) => {
                  const viewer = v.user || v; // handle both populated & plain
                  const viewedAt = v.viewedAt
                    ? new Date(v.viewedAt)
                    : null;
                  const viewedStr = viewedAt
                    ? viewedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "";
                  return (
                    <div
                      key={viewer._id || viewer}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors"
                    >
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ backgroundColor: viewer.avatarColor || "#7C3AED" }}
                      >
                        {viewer.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {viewer.name || "Unknown"}
                        </p>
                        {viewedStr && (
                          <p className="text-white/40 text-xs">{viewedStr}</p>
                        )}
                      </div>
                      <FiEye className="w-4 h-4 text-white/20 flex-shrink-0" />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          DELETE CONFIRM SHEET
      ══════════════════════════════════════════════════ */}
      {showDelConfirm && (
        <div
          className="absolute inset-0 z-30 flex flex-col justify-end bg-black/50"
          onClick={() => setShowDelConfirm(false)}
        >
          <div
            className="rounded-t-3xl overflow-hidden"
            style={{ background: "#1a1a2e" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-6 pt-3 pb-2 text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-3">
                <FiTrash2 className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-white font-semibold text-base">Delete this status?</p>
              <p className="text-white/40 text-sm mt-1 mb-4">
                This will be removed for you and all viewers.
              </p>
            </div>

            <div className="border-t border-white/8">
              <button
                onClick={handleDelete}
                className="w-full py-4 text-red-400 font-semibold text-sm hover:bg-red-500/10 transition-colors"
              >
                Delete Status
              </button>
            </div>
            <div className="border-t border-white/8">
              <button
                onClick={() => setShowDelConfirm(false)}
                className="w-full py-4 text-white/50 text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}