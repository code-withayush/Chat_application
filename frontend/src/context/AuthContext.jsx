import { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("chatUser");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    setUser(data);
    localStorage.setItem("chatUser", JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password, bio) => {
    const { data } = await API.post("/auth/register", { name, email, password, bio });
    setUser(data);
    localStorage.setItem("chatUser", JSON.stringify(data));
    return data;
  };

  const logout = async () => {
    try { await API.post("/auth/logout"); } catch {}
    setUser(null);
    localStorage.removeItem("chatUser");
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem("chatUser", JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
