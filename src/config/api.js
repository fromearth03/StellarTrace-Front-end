// =============================================================
// API Configuration
// =============================================================
// Update the NGROK_URL below whenever you get a new ngrok link.
// The app auto-detects whether to use ngrok or localhost:
//   - If accessed from another device (via ngrok), uses NGROK_URL
//   - If accessed locally (localhost/127.0.0.1), uses LOCAL_URL
// =============================================================

const NGROK_URL = "https://296a-111-119-167-128.ngrok-free.app";
const LOCAL_URL = "http://localhost:8080";

/**
 * Auto-detect: if the frontend is being accessed via ngrok or
 * any non-localhost domain, the backend must also be via ngrok.
 * Only use localhost when the page itself is on localhost.
 */
function detectApiBase() {
    const host = window.location.hostname;
    const isLocal = host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0";
    return isLocal ? LOCAL_URL : NGROK_URL;
}

/**
 * Returns the API base URL.
 */
export function getApiBase() {
    return Promise.resolve(detectApiBase());
}

/**
 * Synchronous getter.
 */
export function getApiBaseSync() {
    return detectApiBase();
}

/**
 * Use this wrapper for all fetch calls to the backend.
 * It automatically adds the ngrok-skip-browser-warning header
 * when calling ngrok URLs (required to bypass ngrok interstitial).
 */
export async function apiFetch(path, options = {}) {
    const base = detectApiBase();
    const url = `${base}${path}`;

    const isNgrok = base.includes("ngrok");

    const headers = {
        ...(options.headers || {}),
        ...(isNgrok ? { "ngrok-skip-browser-warning": "true" } : {}),
    };

    return fetch(url, { ...options, headers });
}

export { NGROK_URL, LOCAL_URL };
