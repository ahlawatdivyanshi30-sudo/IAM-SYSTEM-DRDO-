const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { requireRole } = require("./middleware/authMiddleware");
const { getDb } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4004;

app.get("/api/notices", requireRole("notice-access"), async (req, res) => {
  const db = await getDb();
  const notices = await db.all("SELECT * FROM notices ORDER BY posted_at DESC");
  res.json(notices);
});

app.post("/api/notices", requireRole("notice-access"), async (req, res) => {
  const { title, content, priority } = req.body;
  if (!title || !content || !priority) {
    return res.status(400).json({ error: "Title, content, and priority are required" });
  }
  const db = await getDb();
  await db.run(
    "INSERT INTO notices (title, content, priority, posted_at) VALUES (?, ?, ?, ?)",
    [title, content, priority, new Date().toISOString()]
  );
  res.json({ message: "Notice posted" });
});

app.delete("/api/notices/:id", requireRole("notice-access"), async (req, res) => {
  const db = await getDb();
  await db.run("DELETE FROM notices WHERE id = ?", [req.params.id]);
  res.json({ message: "Notice deleted" });
});

app.listen(PORT, () => {
  console.log(`Notice backend running on http://localhost:${PORT}`);
});