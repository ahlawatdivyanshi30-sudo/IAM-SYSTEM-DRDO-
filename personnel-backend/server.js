const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { requireRole } = require("./middleware/authMiddleware");
const { getDb } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4005;

app.get("/api/staff", requireRole("personnel-access"), async (req, res) => {
  const db = await getDb();
  const staff = await db.all("SELECT * FROM staff ORDER BY id");
  res.json(staff);
});

app.post("/api/staff", requireRole("personnel-access"), async (req, res) => {
  const { name, designation, department, email, phone, location } = req.body;
  if (!name || !designation || !department || !email || !phone || !location) {
    return res.status(400).json({ error: "All fields are required" });
  }
  const db = await getDb();
  await db.run(
    "INSERT INTO staff (name, designation, department, email, phone, location) VALUES (?, ?, ?, ?, ?, ?)",
    [name, designation, department, email, phone, location]
  );
  res.json({ message: "Staff added" });
});

app.put("/api/staff/:id", requireRole("personnel-access"), async (req, res) => {
  const { name, designation, department, email, phone, location } = req.body;
  const db = await getDb();
  await db.run(
    "UPDATE staff SET name=?, designation=?, department=?, email=?, phone=?, location=? WHERE id=?",
    [name, designation, department, email, phone, location, req.params.id]
  );
  res.json({ message: "Staff updated" });
});

app.delete("/api/staff/:id", requireRole("personnel-access"), async (req, res) => {
  const db = await getDb();
  await db.run("DELETE FROM staff WHERE id = ?", [req.params.id]);
  res.json({ message: "Staff deleted" });
});

app.listen(PORT, () => {
  console.log(`Personnel backend running on http://localhost:${PORT}`);
});