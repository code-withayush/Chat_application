import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function Chat() {
  const [activeRoom, setActiveRoom] = useState(null);

  return (
    // FIX: use 100dvh so mobile browser chrome (address bar) is excluded from height
    <div
      className="flex bg-dark-300 overflow-hidden"
      style={{ height: "100dvh" }}
    >
      {/* ── SIDEBAR ── */}
      <div
        className={`h-full w-full lg:w-72 shrink-0 flex flex-col ${
          activeRoom ? "hidden lg:flex" : "flex"
        }`}
      >
        <Sidebar
          activeRoom={activeRoom}
          setActiveRoom={(room) => setActiveRoom(room)}
        />
      </div>

      {/* ── CHAT WINDOW ── */}
      <div
        className={`flex-1 flex flex-col min-w-0 h-full ${
          activeRoom ? "flex" : "hidden lg:flex"
        }`}
      >
        <ChatWindow
          room={activeRoom}
          onBack={() => setActiveRoom(null)}
        />
      </div>
    </div>
  );
}