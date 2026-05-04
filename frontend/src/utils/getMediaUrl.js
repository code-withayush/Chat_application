const PROD_BASE = "https://chat-application-backend11.onrender.com";

export function getMediaUrl(path) {
  if (!path) return "";

  // 👉 trim (kabhi-kabhi space aa jata hai DB se)
  path = path.trim();

  // 👉 FIX 1: localhost replace (MOST IMPORTANT)
  if (path.includes("localhost")) {
    return path.replace("http://localhost:5000", PROD_BASE);
  }

  // 👉 FIX 2: already correct https
  if (path.startsWith("https://")) return path;

  // 👉 FIX 3: blob (preview images)
  if (path.startsWith("blob:")) return path;

  // 👉 FIX 4: ensure slash ho (/uploads...)
  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  // 👉 FINAL
  return `${PROD_BASE}${path}`;
}