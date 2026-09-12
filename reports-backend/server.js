const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const { requireRole } = require("./middleware/authMiddleware");
const { getDb } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 4001;

// Multer setup — 10MB max, PDFs only
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + file.originalname;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

// GET all reports
app.get("/api/reports", requireRole("reports-access"), async (req, res) => {
  const db = await getDb();
  const reports = await db.all("SELECT * FROM reports ORDER BY uploaded_at DESC");
  res.json(reports);
});

// POST upload a new report
app.post(
  "/api/reports",
  requireRole("reports-access"),
  upload.single("file"),
  async (req, res) => {
    try {
      const { title } = req.body;
      if (!title || !req.file) {
        return res.status(400).json({ error: "Title and PDF file are required" });
      }
      const db = await getDb();
      await db.run(
        "INSERT INTO reports (title, filename, uploaded_by, uploaded_at) VALUES (?, ?, ?, ?)",
        [title, req.file.filename, req.user.username, new Date().toISOString()]
      );
      res.json({ message: "Report uploaded successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// DELETE a report
app.delete("/api/reports/:id", requireRole("reports-access"), async (req, res) => {
  const db = await getDb();
  await db.run("DELETE FROM reports WHERE id = ?", [req.params.id]);
  res.json({ message: "Report deleted" });
});

app.listen(PORT, () => {
  console.log(`Reports backend running on http://localhost:${PORT}`);
});