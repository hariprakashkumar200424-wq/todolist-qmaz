const express = require("express");
const router = express.Router();
const { promisePool } = require("../db");
const verifyToken = require("../middleware/auth");

// All task routes are protected — must be logged in

/**
 * GET /api/tasks
 * Returns all tasks ordered by creation time
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      "SELECT * FROM tasks ORDER BY created_at ASC"
    );
    res.json({ tasks: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch tasks." });
  }
});

/**
 * POST /api/tasks
 * Body: { text }
 * Creates a new task
 */
router.post("/", verifyToken, async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Task text cannot be empty." });
  }

  try {
    const [result] = await promisePool.query(
      "INSERT INTO tasks (text, checked) VALUES (?, FALSE)",
      [text.trim()]
    );

    const [rows] = await promisePool.query(
      "SELECT * FROM tasks WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ message: "Task created", task: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create task." });
  }
});

/**
 * PUT /api/tasks/:id
 * Toggles the checked status of a task
 */
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Get current state
    const [rows] = await promisePool.query(
      "SELECT * FROM tasks WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Task not found." });
    }

    const newChecked = !rows[0].checked;

    await promisePool.query(
      "UPDATE tasks SET checked = ? WHERE id = ?",
      [newChecked, id]
    );

    res.json({ message: "Task updated", id: parseInt(id), checked: newChecked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update task." });
  }
});

/**
 * DELETE /api/tasks/:id
 * Deletes a task by ID
 */
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await promisePool.query(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found." });
    }

    res.json({ message: "Task deleted", id: parseInt(id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete task." });
  }
});

/**
 * DELETE /api/tasks/completed/clear
 * Deletes all completed tasks
 */
router.delete("/completed/clear", verifyToken, async (req, res) => {
  try {
    const [result] = await promisePool.query(
      "DELETE FROM tasks WHERE checked = TRUE"
    );
    res.json({ message: "Cleared completed tasks", count: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to clear completed tasks." });
  }
});

module.exports = router;
