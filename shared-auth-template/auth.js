// auth.js — shared Keycloak REST auth utility (no keycloak-js)

const KEYCLOAK_BASE = "http://localhost:8080";
const REALM = "drdo-internship";
const CLIENT_ID = "dashboard";

const TOKEN_ENDPOINT = `${KEYCLOAK_BASE}/realms/${REALM}/protocol/openid-connect/token`;
const LOGOUT_ENDPOINT = `${KEYCLOAK_BASE}/realms/${REALM}/protocol/openid-connect/logout`;

const TOKEN_KEY = "kc_token";
const REFRESH_KEY = "kc_refresh_token";
const USER_KEY = "kc_user";

// --- 1. Pick up an SSO token passed in the URL from the dashboard ---
// Call this once when the app first loads (e.g. in App.js useEffect)
export function captureSsoTokenFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const ssoToken = params.get("sso_token");
  const ssoUser = params.get("sso_user");

  if (ssoToken) {
    sessionStorage.setItem(TOKEN_KEY, ssoToken);
    if (ssoUser) sessionStorage.setItem(USER_KEY, ssoUser);

    // Clean the token out of the visible URL
    params.delete("sso_token");
    params.delete("sso_user");
    const cleanUrl =
      window.location.pathname +
      (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", cleanUrl);
  }
}

// --- 2. Read token: sessionStorage (SSO hop) first, then localStorage ---
export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function isLoggedIn() {
  return !!getToken();
}

// --- 3. Decode JWT payload (to read roles) without any extra library ---
export function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

export function getRoles() {
  const token = getToken();
  if (!token) return [];
  const decoded = decodeToken(token);
  return decoded?.realm_access?.roles || [];
}

export function hasRole(role) {
  return getRoles().includes(role);
}

// --- 4. Login via Direct Access Grant (no Keycloak redirect page) ---
export async function login(username, password) {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "password",
    username,
    password,
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error("Invalid username or password");
  }

  const data = await res.json();
  const decoded = decodeToken(data.access_token);
  const user = { username: decoded?.preferred_username || username };

  // Persistent storage (survives refresh/new tab) — used as fallback
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(REFRESH_KEY, data.refresh_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  // Session storage (used for the immediate SSO hop pattern too)
  sessionStorage.setItem(TOKEN_KEY, data.access_token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));

  return { token: data.access_token, user };
}

// --- 5. Build a URL to open another app, passing the token via query param ---
export function buildSsoUrl(targetOrigin, targetPath = "/") {
  const token = getToken();
  const user = getUser();
  const params = new URLSearchParams({
    sso_token: token || "",
    sso_user: user?.username || "",
  });
  return `${targetOrigin}${targetPath}?${params.toString()}`;
}

// --- 6. Logout: Keycloak endpoint + clear all local state ---
export async function logout() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  try {
    if (refreshToken) {
      await fetch(LOGOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          refresh_token: refreshToken,
        }),
      });
    }
  } catch (e) {
    // Keycloak may be down — that's fine, we still clear local state
    console.warn("Keycloak logout endpoint unreachable, clearing local session anyway.");
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

// --- 7. Offline-mode check: was Keycloak reachable last time we checked? ---
export async function isKeycloakOnline() {
  try {
    const res = await fetch(`${KEYCLOAK_BASE}/realms/${REALM}`, { method: "GET" });
    return res.ok;
  } catch (e) {
    return false;
  }
}