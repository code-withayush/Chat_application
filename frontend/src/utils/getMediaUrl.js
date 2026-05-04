const PROD_BASE = "https://chat-application-backend11.onrender.com";

export function getMediaUrl(path) {
  if (!path) return "";

  // localhost fix
  if (path.includes("localhost")) {
    return path.replace("http://localhost:5000", PROD_BASE);
  }

  // already full https
  if (path.startsWith("https://")) return path;

  // blob
  if (path.startsWith("blob:")) return path;

  // normal path
  return `${PROD_BASE}${path}`;
}