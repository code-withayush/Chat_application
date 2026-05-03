import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.token) {
      if (socket) { socket.disconnect(); setSocket(null); }
      return;
    }

    // ✅ Fix: env variable use karo, replace() fragile tha
    const s = io(import.meta.env.VITE_API_URL, {
      auth: { token: user.token },
      transports: ["websocket", "polling"],
    });

    s.on("connect", () => console.log("🔌 Socket connected"));
    s.on("disconnect", () => console.log("🔌 Socket disconnected"));

    s.on("user:online", ({ userId }) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });

    s.on("user:offline", ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, [user?.token]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);