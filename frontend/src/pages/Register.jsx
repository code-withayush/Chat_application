import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiUserPlus, FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi";

const AVATAR_COLORS = [
  "#7C3AED", "#DB2777", "#0891B2", "#059669",
  "#D97706", "#DC2626", "#0284C7", "#BE185D",
];

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", bio: "" });
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Password match check
  const passwordMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password)
      return toast.error("Name, email and password are required");
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters");
    // ✅ Confirm password check
    if (form.password !== form.confirmPassword)
      return toast.error("Passwords do not match! ❌");

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.bio);
      toast.success("Account created! Welcome 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-300 flex items-start justify-center p-4" style={{ position: "fixed", inset: 0, overflowY: "auto" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-primary-600/30">
            💬
          </div>
          <h1 className="text-3xl font-bold text-white">ChatApp</h1>
          <p className="text-white/50 mt-1">Create a new account 🚀</p>
        </div>

        <div className="glass-card p-5 sm:p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Register</h2>

          {/* Avatar preview */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-xl">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ backgroundColor: selectedColor }}
            >
              {form.name ? form.name[0].toUpperCase() : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-sm mb-2">Choose avatar color:</p>
              {/* ✅ FIX: Single row, horizontal scroll — wrap nahi hoga */}
              <div
                className="flex gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none", flexWrap: "nowrap" }}
              >
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="shrink-0 w-7 h-7 rounded-full transition-all duration-200 hover:scale-110"
                    style={{
                      backgroundColor: color,
                      outline: selectedColor === color ? `3px solid ${color}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
              <input
                name="name"
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                className="input-field pl-11"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
              <input
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                className="input-field pl-11"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={handleChange}
                className="input-field pl-11 pr-11"
              />
              {/* Show/Hide toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>

            {/* ✅ Confirm Password — NAYA FIELD */}
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
              <input
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="input-field pl-11 pr-11"
                style={{
                  borderColor: passwordMatch
                    ? "#059669"
                    : passwordMismatch
                    ? "#DC2626"
                    : undefined,
                }}
              />
              {/* Show/Hide toggle */}
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
              {/* Match / Mismatch icon */}
              {passwordMatch && (
                <FiCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
              {passwordMismatch && (
                <FiX className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              )}
            </div>

            {/* ✅ Match / Mismatch message */}
            {passwordMatch && (
              <p className="text-green-400 text-xs flex items-center gap-1 -mt-2">
                <FiCheck className="w-3 h-3" /> Passwords match!
              </p>
            )}
            {passwordMismatch && (
              <p className="text-red-400 text-xs flex items-center gap-1 -mt-2">
                <FiX className="w-3 h-3" /> Passwords do not match
              </p>
            )}

            {/* Bio */}
            <textarea
              name="bio"
              placeholder="Tell us a little about yourself (optional)"
              value={form.bio}
              onChange={handleChange}
              rows={2}
              className="input-field resize-none"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || passwordMismatch}
              className="btn-primary w-full flex items-center justify-center gap-2"
              style={{
                opacity: passwordMismatch ? 0.5 : 1,
                cursor: passwordMismatch ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiUserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}