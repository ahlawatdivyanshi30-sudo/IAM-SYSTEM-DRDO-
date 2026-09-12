const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { requireRole } = require("./middleware/authMiddleware");
const { getDb } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4003;

app.get("/api/assets", requireRole("asset-access"), async (req, res) => {
  const db = await getDb();
  const assets = await db.all("SELECT * FROM assets ORDER BY id");
  res.json(assets);
});

app.post("/api/assets", requireRole("asset-access"), async (req, res) => {
  const { name, asset_tag, category, location, condition, assigned_to } = req.body;
  if (!name || !asset_tag || !category || !location || !condition) {
    return res.status(400).json({ error: "All fields except 'assigned to' are required" });
  }
  try {
    const db = await getDb();
    await db.run(
      "INSERT INTO assets (name, asset_tag, category, location, condition, assigned_to) VALUES (?, ?, ?, ?, ?, ?)",
      [name, asset_tag, category, location, condition, assigned_to || ""]
    );
    res.json({ message: "Asset registered" });
  } catch (err) {
    res.status(400).json({ error: "Asset tag must be unique" });
  }
});

app.put("/api/assets/:id", requireRole("asset-access"), async (req, res) => {
  const { name, asset_tag, category, location, condition, assigned_to } = req.body;
  const db = await getDb();
  await db.run(
    "UPDATE assets SET name=?, asset_tag=?, category=?, location=?, condition=?, assigned_to=? WHERE id=?",
    [name, asset_tag, category, location, condition, assigned_to || "", req.params.id]
  );
  res.json({ message: "Asset updated" });
});

app.delete("/api/assets/:id", requireRole("asset-access"), async (req, res) => {
  const db = await getDb();
  await db.run("DELETE FROM assets WHERE id = ?", [req.params.id]);
  res.json({ message: "Asset deleted" });
});

app.listen(PORT, () => {
  console.log(`Asset backend running on http://localhost:${PORT}`);
});