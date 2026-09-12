// authMiddleware.js — verifies Keycloak JWT, with disk-cached JWKS fallback for offline mode,
// plus audit logging on every request.

const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const fs = require("fs");
const path = require("path");
const { logAccess } = require("../audit");

const KEYCLOAK_BASE = "http://localhost:8080";
const REALM = "drdo-internship";
const JWKS_URL = `${KEYCLOAK_BASE}/realms/${REALM}/protocol/openid-connect/certs`;
const CACHE_FILE = path.join(__dirname, "..", "jwks-cache.json");

let memoryCache = null; // { keys: [...] }

// Try live fetch; on success, update memory + disk cache. On failure, fall back to disk.
async function getJWKS() {
  try {
    const res = await fetch(JWKS_URL, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error("Bad response from Keycloak");
    const data = await res.json();
    memoryCache = data;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data));
    return data;
  } catch (err) {
    if (memoryCache) return memoryCache;
    if (fs.existsSync(CACHE_FILE)) {
      const cached = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      memoryCache = cached;
      return cached;
    }
    throw new Error("Keycloak unreachable and no cached keys available");
  }
}

function requireRole(requiredRole) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      await logAccess({ username: null, method: req.method, path: req.path, status: 401, role: requiredRole });
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];

    let decodedHeader;
    try {
      decodedHeader = jwt.decode(token, { complete: true });
      if (!decodedHeader) throw new Error("Malformed token");
    } catch {
      await logAccess({ username: null, method: req.method, path: req.path, status: 401, role: requiredRole });
      return res.status(401).json({ error: "Invalid token format" });
    }

    let jwks;
    try {
      jwks = await getJWKS();
    } catch (err) {
      await logAccess({ username: null, method: req.method, path: req.path, status: 503, role: requiredRole });
      return res.status(503).json({ error: "Keycloak unreachable and no cached keys available. Try again once Keycloak is back online." });
    }

    const key = jwks.keys.find((k) => k.kid === decodedHeader.header.kid);
    if (!key) {
      await logAccess({ username: null, method: req.method, path: req.path, status: 401, role: requiredRole });
      return res.status(401).json({ error: "Signing key not found" });
    }

    const pem = jwkToPem(key);

    jwt.verify(token, pem, { algorithms: ["RS256"] }, async (err, decoded) => {
      if (err) {
        await logAccess({ username: null, method: req.method, path: req.path, status: 401, role: requiredRole });
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      const roles = (decoded.realm_access && decoded.realm_access.roles) || [];

      if (!roles.includes(requiredRole)) {
        await logAccess({ username: decoded.preferred_username, method: req.method, path: req.path, status: 403, role: requiredRole });
        return res.status(403).json({ error: `Forbidden: missing required role '${requiredRole}'` });
      }

      await logAccess({ username: decoded.preferred_username, method: req.method, path: req.path, status: 200, role: requiredRole });
      req.user = { username: decoded.preferred_username, roles };
      next();
    });
  };
}

module.exports = { requireRole };