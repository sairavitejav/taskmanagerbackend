const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const dbPath = path.join(__dirname, "db", "todoApplication.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS task (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        dueDate TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    app.listen(3001, () => {
      console.log("Backend server running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Get all tasks
app.get("/tasks", async (req, res) => {
  const tasks = await db.all("SELECT * FROM task");
  res.json(tasks);
});

// Get a specific task by ID
app.get("/tasks/:id", async (req, res) => {
  const {id} = req.params
  const task = await db.get("SELECT * FROM task WHERE id = ?", [id])
  res.json(task);
})

// Create a new task
app.post("/tasks", async (req, res) => {
  const { id, title, description, status, dueDate } = req.body;
  const now = new Date().toISOString();
  await db.run(
    `INSERT INTO task (id, title, description, status, dueDate, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, title, description, status, dueDate, now, now]
  );
  res.json({message: "Task Added Successfully"});
});

// Update a task
app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, status, dueDate } = req.body;
  const now = new Date().toISOString();
  await db.run(
    `UPDATE task SET title = ?, description = ?, status = ?, dueDate = ?, updatedAt = ? WHERE id = ?`,
    [title, description, status, dueDate, now, id]
  );
  res.json({message: "Task Updated"});
});

// Delete a task
app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  await db.run(`DELETE FROM task WHERE id = ?`, id);
  res.json({message: "Task Deleted"});
});
