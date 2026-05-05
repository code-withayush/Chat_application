import { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ App open hone par localStorage se user load karo
  useEffect(() => {
    const stored = localStorage.getItem("chatUser");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("chatUser");
      }
    }
    setLoading(false);
  }, []);

  // ✅ Login
  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    setUser(data);
    localStorage.setItem("chatUser", JSON.stringify(data));
    return data;
  };

  // ✅ Register
  const register = async (name, email, password, bio) => {
    const { data } = await API.post("/auth/register", { name, email, password, bio });
    setUser(data);
    localStorage.setItem("chatUser", JSON.stringify(data));
    return data;
  };

  // ✅ Logout
  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch {}
    setUser(null);
    localStorage.removeItem("chatUser");
  };

  // ✅ Profile update — State + localStorage dono update hote hain
  // Yahi function ProfileModal se call hoga
  const updateUser = (updatedData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem("chatUser", JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, loading, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);