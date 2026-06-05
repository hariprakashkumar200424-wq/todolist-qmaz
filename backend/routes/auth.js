const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Shared hashed password (generated once from .env APP_PASSWORD)
let sharedHashedPassword = null;

async function getHashedPassword() {
  if (!sharedHashedPassword) {
    sharedHashedPassword = await bcrypt.hash(process.env.APP_PASSWORD, 10);
  }
  return sharedHashedPassword;
}

/**
 * POST /api/auth/login
 * Body: { username, password }
 * Everyone uses the same shared username & password from .env
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  // Check username matches
  if (username !== process.env.APP_USERNAME) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  // Check password matches
  const passwordMatch = password === process.env.APP_PASSWORD;

  if (!passwordMatch) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  // Generate JWT token (valid for 24 hours)
  const token = jwt.sign(
    { username: process.env.APP_USERNAME },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.json({
    message: "Login successful",
    token,
    username: process.env.APP_USERNAME,
  });
});

/**
 * GET /api/auth/verify
 * Verifies if a token is still valid
 */
router.get("/verify", require("../middleware/auth"), (req, res) => {
  res.json({ valid: true, username: req.user.username });
});

module.exports = router;
