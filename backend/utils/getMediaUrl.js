// utils/getMediaUrl.js
// FIX: Instead of hardcoding localhost:5000, derive the backend base URL
// from an env variable. Set REACT_APP_API_URL in your Render frontend env vars
// to your backend Render URL (e.g. https://your-backend.onrender.com).
// If not set, falls back to same origin (works when frontend & backend are same service).

const API_BASE =
  process.env.REACT_APP_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "");

export function getMediaUrl(path) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob:")) return path;
  return `${API_BASE}${path}`;
}