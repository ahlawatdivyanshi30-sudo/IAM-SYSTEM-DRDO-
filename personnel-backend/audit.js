const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

let dbInstance = null;

async function getAuditDb() {
  if (dbInstance) return dbInstance;
  dbInstance = await open({
    filename: path.join(__dirname, "audit.db"),
    driver: sqlite3.Database,
  });
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT,
      method TEXT,
      path TEXT,
      status TEXT,
      role_required TEXT,
      timestamp TEXT
    )
  `);
  return dbInstance;
}

async function logAccess({ username, method, path: reqPath, status, role }) {
  try {
    const db = await getAuditDb();
    await db.run(
      "INSERT INTO audit_log (username, method, path, status, role_required, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
      [username || "unknown", method, reqPath, status, role, new Date().toISOString()]
    );
  } catch (err) {
    console.error("Audit log write failed:", err.message);
  }
}

module.exports = { logAccess };