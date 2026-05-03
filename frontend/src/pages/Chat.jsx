import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function Chat() {
  const [activeRoom, setActiveRoom] = useState(null);

  return (
    <div className="flex h-screen bg-dark-300 overflow-hidden">

      {/* ── SIDEBAR ──
          Mobile : no room selected = full screen | room selected = hide
          Desktop: always on the side
      */}
      <div className={`h-full w-full lg:w-72 shrink-0 flex flex-col ${activeRoom ? "hidden lg:flex" : "flex"}`}>
        <Sidebar
          activeRoom={activeRoom}
          setActiveRoom={(room) => setActiveRoom(room)}
        />
      </div>

      {/* ── CHAT WINDOW ──
          Mobile : only when a room is selected
          Desktop: always visible
      */}
      <div className={`flex-1 flex flex-col min-w-0 h-full ${activeRoom ? "flex" : "hidden lg:flex"}`}>
        <ChatWindow
          room={activeRoom}
          onBack={() => setActiveRoom(null)}
        />
      </div>

    </div>
  );
}