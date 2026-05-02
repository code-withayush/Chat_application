import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiUserPlus } from "react-icons/fi";

const AVATAR_COLORS = [
  "#7C3AED", "#DB2777", "#0891B2", "#059669",
  "#D97706", "#DC2626", "#0284C7", "#BE185D",
];

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", bio: "" });
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password)
      return toast.error("Naam, email aur password zaroori hai");
    if (form.password.length < 6)
      return toast.error("Password kam se kam 6 characters ka hona chahiye");

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.bio);
      toast.success("Account ban gaya! Welcome 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Register nahi hua");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-primary-600/30">
            💬
          </div>
          <h1 className="text-3xl font-bold text-white">ChatApp</h1>
          <p className="text-white/50 mt-1">Naya account banao 🚀</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Register Karo</h2>

          {/* Avatar preview */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-xl">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ backgroundColor: selectedColor }}
            >
              {form.name ? form.name[0].toUpperCase() : "?"}
            </div>
            <div className="flex-1">
              <p className="text-white/70 text-sm mb-2">Avatar color chunno:</p>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className="w-7 h-7 rounded-full transition-all duration-200 hover:scale-110"
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
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
              <input
                name="name"
                type="text"
                placeholder="Apna naam"
                value={form.name}
                onChange={handleChange}
                className="input-field pl-11"
              />
            </div>

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

            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
              <input
                name="password"
                type="password"
                placeholder="Password (min 6 characters)"
                value={form.password}
                onChange={handleChange}
                className="input-field pl-11"
              />
            </div>

            <textarea
              name="bio"
              placeholder="Apne baare mein kuch likho (optional)"
              value={form.bio}
              onChange={handleChange}
              rows={2}
              className="input-field resize-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiUserPlus className="w-4 h-4" />
                  Account Banao
                </>
              )}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Pehle se account hai?{" "}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Login Karo
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
