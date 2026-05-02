import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { FiMenu, FiX } from "react-icons/fi";

export default function Chat() {
  const [activeRoom, setActiveRoom] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-dark-300 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:relative z-40 lg:z-auto h-full
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-72 shrink-0
        `}
      >
        <Sidebar
          activeRoom={activeRoom}
          setActiveRoom={(room) => {
            setActiveRoom(room);
            setSidebarOpen(false);
          }}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-dark-200 border-b border-white/5 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <FiMenu className="w-5 h-5 text-white" />
          </button>
          <p className="text-white font-semibold">
            {activeRoom ? activeRoom.name : "ChatApp 💬"}
          </p>
        </div>

        <ChatWindow room={activeRoom} />
      </div>
    </div>
  );
}
