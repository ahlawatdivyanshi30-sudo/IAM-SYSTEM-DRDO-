const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

let dbInstance = null;

async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: path.join(__dirname, "assets.db"),
    driver: sqlite3.Database,
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      asset_tag TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      condition TEXT NOT NULL,
      assigned_to TEXT
    )
  `);

  const row = await dbInstance.get("SELECT COUNT(*) as count FROM assets");
  if (row.count === 0) {
    const seed = [
      ["Dell Latitude Laptop", "DRDO-AST-001", "Electronics", "Lab 3, Block A", "Good", "R. Sharma"],
      ["HP LaserJet Printer", "DRDO-AST-002", "Electronics", "Admin Office", "Fair", "Front Desk"],
      ["Office Desk (Steel)", "DRDO-AST-003", "Furniture", "Block B, Room 12", "Good", "K. Iyer"],
      ["Projector - Epson", "DRDO-AST-004", "Electronics", "Conference Hall", "Under Repair", "Facilities"],
      ["Fire Extinguisher", "DRDO-AST-005", "Safety Equipment", "Corridor, Block A", "Poor", "Facilities"],
    ];
    for (const row of seed) {
      await dbInstance.run(
        "INSERT INTO assets (name, asset_tag, category, location, condition, assigned_to) VALUES (?, ?, ?, ?, ?, ?)",
        row
      );
    }
  }

  return dbInstance;
}

module.exports = { getDb };