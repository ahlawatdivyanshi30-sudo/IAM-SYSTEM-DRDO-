const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4999;
const otpStore = new Map(); // username -> { code, expiresAt }

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post("/api/otp/send", async (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) {
    return res.status(400).json({ error: "username and email are required" });
  }

  const code = generateCode();
  otpStore.set(username, { code, expiresAt: Date.now() + 5 * 60 * 1000 });

  try {
    await transporter.sendMail({
      from: `"DRDO IAM Suite" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your DRDO IAM Sign-In Code",
      text: `Your one-time verification code is ${code}. It expires in 5 minutes. Do not share this code with anyone.`,
    });
    res.json({ message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP email" });
  }
});

app.post("/api/otp/verify", (req, res) => {
  const { username, otp } = req.body;
  const record = otpStore.get(username);

  if (!record) return res.status(400).json({ error: "No OTP requested for this user" });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(username);
    return res.status(400).json({ error: "OTP expired. Request a new one." });
  }
  if (record.code !== otp) {
    return res.status(400).json({ error: "Incorrect code" });
  }

  otpStore.delete(username);
  res.json({ verified: true });
});

app.listen(PORT, () => console.log(`OTP service running on http://localhost:${PORT}`));