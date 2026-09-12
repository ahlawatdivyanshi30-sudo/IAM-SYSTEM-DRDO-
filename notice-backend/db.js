const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

let dbInstance = null;

async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: path.join(__dirname, "notices.db"),
    driver: sqlite3.Database,
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT NOT NULL,
      posted_at TEXT NOT NULL
    )
  `);

  const row = await dbInstance.get("SELECT COUNT(*) as count FROM notices");
  if (row.count === 0) {
    const seed = [
      ["Annual Security Audit", "All departments must complete the security compliance checklist by end of month.", "High"],
      ["Office Maintenance", "Water supply will be interrupted in Block B on Saturday from 10 AM to 2 PM.", "Normal"],
      ["Server Migration Alert", "Internal systems will be down for scheduled migration this weekend. Save your work.", "Urgent"],
    ];
    for (const [title, content, priority] of seed) {
      await dbInstance.run(
        "INSERT INTO notices (title, content, priority, posted_at) VALUES (?, ?, ?, ?)",
        [title, content, priority, new Date().toISOString()]
      );
    }
  }

  return dbInstance;
}

module.exports = { getDb };