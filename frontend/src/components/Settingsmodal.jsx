// src/components/SettingsModal.jsx

import { FiX, FiSettings } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export default function SettingsModal({ onClose }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-96 rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: isDark ? "#111827" : "#ffffff" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)" }}
        >
          <h2
            className="font-bold text-lg flex items-center gap-2"
            style={{ color: isDark ? "#ffffff" : "#111111" }}
          >
            <FiSettings className="w-5 h-5" /> Settings
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-xl">
            <FiX className="w-5 h-5" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#888888" }} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">

          {/* ── Dark Mode Toggle ── */}
          <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{isDark ? "🌙" : "☀️"}</span>
              <div>
                <p className="text-sm font-medium" style={{ color: isDark ? "#ffffff" : "#111111" }}>
                  Dark Mode
                </p>
                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888888" }}>
                  {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                </p>
              </div>
            </div>
            {/* ON (blue, dot-right) = Dark | OFF (gray, dot-left) = Light */}
            <button
              onClick={toggleTheme}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 ${isDark ? "bg-primary-600" : "bg-gray-300"}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${isDark ? "left-6" : "left-0.5"}`}
              />
            </button>
          </div>

          {/* ── Notifications (coming soon) ── */}
          <div
            className="rounded-2xl p-4 flex items-center justify-between opacity-40 cursor-not-allowed"
            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="text-sm font-medium" style={{ color: isDark ? "#ffffff" : "#111111" }}>
                  Notifications
                </p>
                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888888" }}>
                  Coming soon...
                </p>
              </div>
            </div>
          </div>

          {/* ── Privacy (coming soon) ── */}
          <div
            className="rounded-2xl p-4 flex items-center justify-between opacity-40 cursor-not-allowed"
            style={{ background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔒</span>
              <div>
                <p className="text-sm font-medium" style={{ color: isDark ? "#ffffff" : "#111111" }}>
                  Privacy
                </p>
                <p className="text-xs" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#888888" }}>
                  Coming soon...
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}