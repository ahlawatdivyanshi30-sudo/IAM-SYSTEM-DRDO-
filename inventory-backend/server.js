const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { requireRole } = require("./middleware/authMiddleware");
const { getDb } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4002;

// GET all items
app.get("/api/items", requireRole("inventory-access"), async (req, res) => {
  const db = await getDb();
  const items = await db.all("SELECT * FROM items ORDER BY id");
  res.json(items);
});

// POST new item
app.post("/api/items", requireRole("inventory-access"), async (req, res) => {
  const { name, quantity, category } = req.body;
  if (!name || quantity === undefined || !category) {
    return res.status(400).json({ error: "Name, quantity, and category are required" });
  }
  const db = await getDb();
  await db.run(
    "INSERT INTO items (name, quantity, category) VALUES (?, ?, ?)",
    [name, quantity, category]
  );
  res.json({ message: "Item added" });
});

// PATCH update quantity (inline edit)
app.patch("/api/items/:id", requireRole("inventory-access"), async (req, res) => {
  const { quantity } = req.body;
  if (quantity === undefined) {
    return res.status(400).json({ error: "Quantity is required" });
  }
  const db = await getDb();
  await db.run("UPDATE items SET quantity = ? WHERE id = ?", [quantity, req.params.id]);
  res.json({ message: "Quantity updated" });
});

// DELETE item
app.delete("/api/items/:id", requireRole("inventory-access"), async (req, res) => {
  const db = await getDb();
  await db.run("DELETE FROM items WHERE id = ?", [req.params.id]);
  res.json({ message: "Item deleted" });
});

app.listen(PORT, () => {
  console.log(`Inventory backend running on http://localhost:${PORT}`);
});