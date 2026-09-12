const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

let dbInstance = null;

async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: path.join(__dirname, "personnel.db"),
    driver: sqlite3.Database,
  });

  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      designation TEXT NOT NULL,
      department TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      location TEXT NOT NULL
    )
  `);

  const row = await dbInstance.get("SELECT COUNT(*) as count FROM staff");
  if (row.count === 0) {
    const seed = [
      ["Dr. Anil Kapoor", "Senior Scientist", "Materials Research", "anil.kapoor@drdo.gov.in", "9876500001", "Block A, Room 210"],
      ["Priya Nair", "Systems Engineer", "IT & Security", "priya.nair@drdo.gov.in", "9876500002", "Block B, Room 104"],
      ["Rajeev Menon", "Project Director", "Aeronautics", "rajeev.menon@drdo.gov.in", "9876500003", "Block A, Room 301"],
      ["Sunita Rao", "HR Manager", "Human Resources", "sunita.rao@drdo.gov.in", "9876500004", "Admin Building"],
      ["Vikram Singh", "Lab Technician", "Materials Research", "vikram.singh@drdo.gov.in", "9876500005", "Block A, Room 108"],
    ];
    for (const row of seed) {
      await dbInstance.run(
        "INSERT INTO staff (name, designation, department, email, phone, location) VALUES (?, ?, ?, ?, ?, ?)",
        row
      );
    }
  }

  return dbInstance;
}

module.exports = { getDb };