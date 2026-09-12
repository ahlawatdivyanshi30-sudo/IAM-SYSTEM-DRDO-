const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

let dbInstance = null;

async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: path.join(__dirname, "inventory.db"),
    driver: sqlite3.Database,
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      category TEXT NOT NULL
    )
  `);

  // Seed sample data only if table is empty
  const row = await dbInstance.get("SELECT COUNT(*) as count FROM items");
  if (row.count === 0) {
    const seed = [
      ["A4 Paper Reams", 45, "Stationery"],
      ["Laptop Chargers", 8, "Electronics"],
      ["Safety Helmets", 3, "Safety Gear"],
      ["Whiteboard Markers", 60, "Stationery"],
      ["Network Cables (Cat6)", 6, "Electronics"],
    ];
    for (const [name, quantity, category] of seed) {
      await dbInstance.run(
        "INSERT INTO items (name, quantity, category) VALUES (?, ?, ?)",
        [name, quantity, category]
      );
    }
  }

  return dbInstance;
}

module.exports = { getDb };