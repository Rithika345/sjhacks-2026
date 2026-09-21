// Backend API base URL. Vite exposes any VITE_-prefixed env var on
// import.meta.env at build time. Netlify sets VITE_API_BASE_URL to the
// deployed Cloud Run backend URL; local dev falls back to localhost.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
