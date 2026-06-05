const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { initDB } = require("./db");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

// ─── API Routes ───────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "QMAX SYSTEMS To-Do API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── Catch-all: serve frontend ────────────────────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ─── Start server after DB is ready ──────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 QMAX To-Do Server running at http://localhost:${PORT}`);
    console.log(`📦 API available at http://localhost:${PORT}/api`);
    console.log(`🔐 Login with username: "${process.env.APP_USERNAME}" / password: "${process.env.APP_PASSWORD}"\n`);
  });
});
