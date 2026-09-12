// auth.js — shared Keycloak auth utility (Direct Access Grants, no keycloak-js)

const KEYCLOAK_BASE = "http://localhost:8080";
const REALM = "drdo-internship";
const CLIENT_ID = "dashboard";
const SESSION_KEY = "drdo_session";

// ---- Login: direct POST to Keycloak token endpoint ----
export async function login(username, password) {
  const url = `${KEYCLOAK_BASE}/realms/${REALM}/protocol/openid-connect/token`;
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "password",
    username,
    password,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error("Invalid username or password");
  }

  const data = await res.json();
  const session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  saveSession(session);
  return session;
}

// ---- Save session to localStorage (persists on this origin/port) ----
export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// ---- Load session: sessionStorage first (SSO handoff), then localStorage ----
export function loadSession() {
  let raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    if (session.expires_at && Date.now() > session.expires_at) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function getToken() {
  const session = loadSession();
  return session ? session.access_token : null;
}

export function isLoggedIn() {
  return !!getToken();
}

// ---- Decode JWT payload to read roles (no verification needed on frontend) ----
export function getUserRoles() {
  const token = getToken();
  if (!token) return [];
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.realm_access ? payload.realm_access.roles : [];
  } catch {
    return [];
  }
}

export function getUsername() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.preferred_username || null;
  } catch {
    return null;
  }
}

// ---- Clear session (both storages) ----
export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

// ---- Logout: call Keycloak end-session, clear storage, redirect ----
export async function logout(redirectUrl = "http://localhost:3000") {
  const session = loadSession();
  clearSession();

  if (session && session.refresh_token) {
    const url = `${KEYCLOAK_BASE}/realms/${REALM}/protocol/openid-connect/logout`;
    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      refresh_token: session.refresh_token,
    });
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
    } catch {
      // Keycloak might be down — ignore, we already cleared local storage
    }
  }
  window.location.href = redirectUrl;
}

// ---- Build a URL to hand off SSO session to a sub-app on another port ----
export function buildSSOUrl(targetOrigin, targetPath = "/") {
  const session = loadSession();
  if (!session) return `${targetOrigin}${targetPath}`;
  const encoded = encodeURIComponent(btoa(JSON.stringify(session)));
  return `${targetOrigin}${targetPath}?sso_token=${encoded}`;
}

// ---- Run this on app load in EVERY frontend (including dashboard) ----
// Picks up ?sso_token= from URL, saves it locally, cleans the URL.
export function initSessionFromURL() {
  const params = new URLSearchParams(window.location.search);
  const ssoToken = params.get("sso_token");
  if (ssoToken) {
    try {
      const session = JSON.parse(atob(decodeURIComponent(ssoToken)));
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      saveSession(session); // also persist to localStorage for reloads
    } catch {
      // malformed token param — ignore
    }
    // Clean the URL so the token isn't sitting in browser history
    params.delete("sso_token");
    const newUrl =
      window.location.pathname +
      (params.toString() ? `?${params.toString()}` : "");
    window.history.replaceState({}, "", newUrl);
  }
}

// ---- Offline fallback check: is Keycloak reachable? ----
export async function isKeycloakOnline() {
  try {
    const res = await fetch(
      `${KEYCLOAK_BASE}/realms/${REALM}/.well-known/openid-configuration`,
      { method: "GET" }
    );
    return res.ok;
  } catch {
    return false;
  }
}