// ── ProfileModal.jsx ─────────────────────────────────────────────
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // ✅ path apne hisaab se adjust karo

// ── Base URL — localhost ya deployed dono pe kaam karega ────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Reusable Avatar component ────────────────────────────────────
export function Avatar({ user, size = 40, className = "" }) {
  const style = {
    width:           size,
    height:          size,
    borderRadius:    "50%",
    objectFit:       "cover",
    flexShrink:      0,
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    fontSize:        size * 0.4,
    fontWeight:      700,
    color:           "#fff",
    backgroundColor: user?.avatarColor || "#128C7E",
    overflow:        "hidden",
  };

  if (user?.profilePhoto) {
    return (
      <img
        // ✅ FIX: localhost hardcode nahi — env se URL lega
        src={
          user.profilePhoto.startsWith("http")
            ? user.profilePhoto
            : `${BASE_URL}${user.profilePhoto}`
        }
        alt={user.name}
        style={{ ...style, backgroundColor: "transparent" }}
        className={className}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    );
  }

  return (
    <div style={style} className={className}>
      {(user?.name || "?")[0].toUpperCase()}
    </div>
  );
}

// ── ProfileModal ─────────────────────────────────────────────────
export default function ProfileModal({ onClose, onUpdate }) {
  // ✅ FIX: user prop ki jagah context se lo — hamesha latest data milega
  const { user, updateUser } = useAuth();

  const [name,        setName]        = useState(user?.name        || "");
  const [bio,         setBio]         = useState(user?.bio         || "");
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || "#128C7E");
  const [preview,     setPreview]     = useState(user?.profilePhoto || null);
  const [photoFile,   setPhotoFile]   = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [msg,         setMsg]         = useState("");

  const COLORS = [
    "#8B5CF6","#3B82F6","#10B981","#EF4444",
    "#F97316","#EC4899","#06B6D4","#6366F1",
    "#7C3AED","#374151",
  ];

  // ── File select ─────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file)); // ✅ turant preview dikhao
    e.target.value = "";
  };

  // ── Save ────────────────────────────────────────────────────
  const handleSave = async () => {
    setLoading(true);
    setMsg("");
    try {
      let updatedPhoto = user?.profilePhoto || null;

      // Step 1: Photo upload karo agar naya select hua hai
      if (photoFile) {
        const fd = new FormData();
        fd.append("photo", photoFile);
        const { data } = await axios.post(`${BASE_URL}/api/auth/profile/photo`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        updatedPhoto = data.profilePhoto;
      }

      // Step 2: Name, Bio, Color update karo
      const { data: updated } = await axios.put(`${BASE_URL}/api/auth/profile`, {
        name,
        bio,
        avatarColor,
      });

      const finalUser = { ...updated, profilePhoto: updatedPhoto };

      // ✅ FIX: Context update — screen turant change hogi, logout ki zaroorat nahi
      updateUser(finalUser);

      // ✅ Parent component ko bhi batao (agar zaroorat ho)
      onUpdate?.(finalUser);

      setMsg("✅ Profile save ho gaya!");
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      console.error("Save profile error:", err);
      setMsg("❌ Kuch galat hua, dobara try karo.");
    } finally {
      setLoading(false);
    }
  };

  // ── Photo Remove ────────────────────────────────────────────
  const handleRemovePhoto = async () => {
    if (!window.confirm("Profile photo hatana chahte ho?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/auth/profile/photo`);
      setPreview(null);
      setPhotoFile(null);

      // ✅ FIX: Context update karo photo remove par bhi
      updateUser({ profilePhoto: null });
      onUpdate?.({ ...user, profilePhoto: null });
    } catch (err) {
      console.error("Remove photo error:", err);
      alert("Photo remove nahi ho paayi.");
    }
  };

  // ── Preview URL resolve ─────────────────────────────────────
  const resolvedPreview = preview
    ? preview.startsWith("blob:") || preview.startsWith("http")
      ? preview
      : `${BASE_URL}${preview}`
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:   "fixed",
          inset:      0,
          background: "rgba(0,0,0,0.45)",
          zIndex:     1000,
        }}
      />

      {/* Modal Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position:     "fixed",
          top:          "50%",
          left:         "50%",
          transform:    "translate(-50%,-50%)",
          background:   "#fff",
          borderRadius: 16,
          width:        "min(420px, 95vw)",
          maxHeight:    "90vh",
          overflowY:    "auto",
          zIndex:       1001,
          boxShadow:    "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "18px 20px 0",
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111" }}>
            My Profile
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none",
              cursor: "pointer", fontSize: 22, color: "#666", lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Avatar Section */}
        <div style={{ textAlign: "center", padding: "24px 20px 12px" }}>
          <div style={{ position: "relative", display: "inline-block" }}>

            {resolvedPreview ? (
              <img
                src={resolvedPreview}
                alt="profile"
                style={{
                  width: 90, height: 90, borderRadius: "50%",
                  objectFit: "cover", border: "3px solid #e5e7eb",
                  display: "block",
                }}
              />
            ) : (
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                background: avatarColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, fontWeight: 700, color: "#fff",
                border: "3px solid #e5e7eb",
              }}>
                {name[0]?.toUpperCase() || "?"}
              </div>
            )}

            {/* Camera button — label se file input open hoga */}
            <label
              htmlFor="profile-photo-input"
              style={{
                position:       "absolute",
                bottom:         2,
                right:          2,
                background:     "#25D366",
                borderRadius:   "50%",
                width:          28,
                height:         28,
                cursor:         "pointer",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                boxShadow:      "0 2px 6px rgba(0,0,0,0.25)",
              }}
            >
              <CameraIcon />
            </label>
          </div>

          {/* Hidden file input */}
          <input
            id="profile-photo-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          {/* Name + Status */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#111" }}>
              {name || user?.name}
            </div>
            <div style={{ fontSize: 12, color: "#25D366", marginTop: 2 }}>
              ● Online
            </div>
          </div>

          {resolvedPreview && (
            <div style={{ marginTop: 8 }}>
              <button
                onClick={handleRemovePhoto}
                style={{
                  background: "none", border: "none", color: "#EF4444",
                  cursor: "pointer", fontSize: 12, textDecoration: "underline",
                }}
              >
                Remove Photo
              </button>
            </div>
          )}
        </div>

        {/* Fields */}
        <div style={{ padding: "0 20px 20px" }}>

          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Apna naam daalo"
              style={inputStyle}
            />
          </Field>

          <Field label="Bio">
            <input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Apne baare mein kuch likho..."
              style={inputStyle}
            />
          </Field>

          {!resolvedPreview && (
            <Field label="Avatar Color">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAvatarColor(c)}
                    style={{
                      width:        32,
                      height:       32,
                      borderRadius: "50%",
                      background:   c,
                      border:       avatarColor === c ? "3px solid #111" : "3px solid transparent",
                      cursor:       "pointer",
                      transition:   "transform .15s",
                      transform:    avatarColor === c ? "scale(1.18)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </Field>
          )}

          <Field label="Email">
            <div style={{
              ...inputStyle,
              background: "#f3f4f6",
              color:      "#6b7280",
              cursor:     "not-allowed",
            }}>
              {user?.email}
            </div>
          </Field>

          {/* Status message */}
          {msg && (
            <div style={{
              textAlign:  "center",
              marginTop:  8,
              fontSize:   13,
              color:      msg.startsWith("✅") ? "#10B981" : "#EF4444",
              fontWeight: 600,
            }}>
              {msg}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              width:        "100%",
              marginTop:    16,
              padding:      "12px 0",
              background:   loading ? "#9ca3af" : "#25D366",
              color:        "#fff",
              border:       "none",
              borderRadius: 10,
              fontWeight:   700,
              fontSize:     15,
              cursor:       loading ? "not-allowed" : "pointer",
              transition:   "background .2s",
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          {/* Logout Button */}
          <LogoutButton />
        </div>
      </div>
    </>
  );
}

// ── Logout Button (AuthContext se logout) ───────────────────────
function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button
      onClick={logout}
      style={{
        width:        "100%",
        marginTop:    10,
        padding:      "11px 0",
        background:   "none",
        color:        "#EF4444",
        border:       "1.5px solid #EF4444",
        borderRadius: 10,
        fontWeight:   700,
        fontSize:     15,
        cursor:       "pointer",
        display:      "flex",
        alignItems:   "center",
        justifyContent: "center",
        gap:          6,
      }}
    >
      <span>↪</span> Log Out
    </button>
  );
}

// ── Helper Components ───────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display:    "block",
        fontSize:   12,
        color:      "#6b7280",
        marginBottom: 4,
        fontWeight: 600,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width:        "100%",
  padding:      "10px 12px",
  border:       "1px solid #e5e7eb",
  borderRadius: 8,
  fontSize:     14,
  outline:      "none",
  boxSizing:    "border-box",
  color:        "#111",
};

function CameraIcon() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}