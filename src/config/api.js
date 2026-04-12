// =============================================================
// API Configuration
// =============================================================
// Update the REMOTE_URL below whenever your deployed backend URL changes.
// The app currently uses REMOTE_URL for all environments.
// =============================================================

const REMOTE_URL = "https://stellartrace.jarviscore.me";
const LOCAL_URL = "http://localhost:8080";

/**
 * Uses deployed backend URL for all requests.
 */
function detectApiBase() {
    return REMOTE_URL;
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

export { REMOTE_URL, LOCAL_URL };
