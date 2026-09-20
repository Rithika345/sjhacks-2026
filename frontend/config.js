// Backend API base URL. Auto-picks localhost for local dev; otherwise uses the
// deployed Render backend URL. After the backend is deployed on Render, paste
// its URL in place of the placeholder below (no trailing slash).
window.API_BASE_URL =
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:8000"
    : "https://REPLACE-WITH-YOUR-RENDER-BACKEND-URL.onrender.com";
