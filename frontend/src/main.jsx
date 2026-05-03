import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx"; // ✅ IMPORT ADD KARO
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ThemeProvider> {/* ✅ WRAP KARO */}
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#1e1e2e",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                },
              }}
            />
          </ThemeProvider> {/* ✅ CLOSE KARO */}
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);