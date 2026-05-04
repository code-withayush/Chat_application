const API_BASE =
  process.env.REACT_APP_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "");

// 👉 apna backend URL yaha daalo (IMPORTANT)
const PROD_BASE = "https://chat-application-backend11.onrender.com";

export function getMediaUrl(path) {
  if (!path) return "";

  // blob ya already https url
  if (path.startsWith("blob:")) return path;

  // 👉 FIX 1: localhost URLs ko replace karo
  if (path.startsWith("http://localhost:5000")) {
    return path.replace("http://localhost:5000", PROD_BASE);
  }

  // 👉 FIX 2: agar already https hai (production)
  if (path.startsWith("https://")) return path;

  // 👉 FIX 3: normal case (/uploads/...)
  return `${API_BASE || PROD_BASE}${path}`;
}