import { FiX, FiMail, FiMessageSquare, FiClock, FiUsers, FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function ProfileModal({ user, isOnline, onClose, onPrev, onNext }) {
  if (!user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleString("en-US", { month: "long", year: "numeric" })
    : "May 2026";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-80 rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1a1a2e" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 text-white/40 hover:text-white transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Purple banner */}
        <div className="h-24" style={{ background: "linear-gradient(135deg, #7b2ff7, #9b59f5)" }} />

        <div className="px-5 pb-5" style={{ marginTop: "-40px" }}>
          {/* Avatar row */}
          <div className="flex items-end justify-between mb-3">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full border-4 flex items-center justify-center text-white text-3xl font-bold"
                style={{
                  backgroundColor: user.avatarColor || "#7b2ff7",
                  borderColor: "#1a1a2e",
                }}
              >
                {user.name?.[0]?.toUpperCase()}
              </div>
              {/* Online dot */}
              <span
                className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2"
                style={{
                  backgroundColor: isOnline ? "#22c55e" : "#6b7280",
                  borderColor: "#1a1a2e",
                }}
              />
            </div>

            {/* Nav buttons */}
            <div className="flex gap-2 mb-1">
              <button
                onClick={onPrev}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
                style={{ background: "#2d2d4a" }}
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNext}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
                style={{ background: "#2d2d4a" }}
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Name & status */}
          <div className="mb-4">
            <h2 className="text-white text-xl font-bold leading-tight">{user.name}</h2>
            <p className="text-sm flex items-center gap-1.5 mt-0.5" style={{ color: "#22c55e" }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: "#22c55e" }} />
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>

          {/* Info rows */}
          <div className="flex flex-col gap-2 mb-4">
            <InfoRow
              icon={<FiMessageSquare />}
              iconBg="#352d6a"
              iconColor="#9b7ff0"
              label="Bio"
              value={user.bio || "No bio"}
            />
            <InfoRow
              icon={<FiMail />}
              iconBg="#2a354a"
              iconColor="#6aadee"
              label="Email"
              value={user.email}
            />
            <InfoRow
              icon={<FiClock />}
              iconBg="#1e3a2a"
              iconColor="#22c55e"
              label="Last seen"
              value="Active now"
              valueColor="#22c55e"
            />
            <InfoRow
              icon={<FiUsers />}
              iconBg="#2a3050"
              iconColor="#7baef0"
              label="Member since"
              value={memberSince}
            />
          </div>

          {/* Message button */}
          <button
            className="w-full py-3.5 rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #7b2ff7, #9b59f5)" }}
          >
            <FiMessageSquare className="w-4 h-4" />
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, iconBg, iconColor, label, value, valueColor = "#e0e0f0" }) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{ background: "#252540" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
        style={{ background: iconBg, color: iconColor }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs mb-0.5" style={{ color: "#888" }}>{label}</p>
        <p className="text-sm truncate" style={{ color: valueColor }}>{value}</p>
      </div>
    </div>
  );
}