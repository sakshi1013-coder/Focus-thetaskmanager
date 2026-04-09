const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const dataFile = path.join(__dirname, 'tasks.json');

// Ensure data file exists
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify([]));
}

// Helper to read tasks
const readTasks = () => {
  try {
    const data = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Helper to write tasks
const writeTasks = (tasks) => {
  fs.writeFileSync(dataFile, JSON.stringify(tasks, null, 2));
};

// GET /tasks
app.get('/api/tasks', (req, res) => {
  const tasks = readTasks();
  res.json(tasks);
});

// POST /tasks
app.post('/api/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }

  const tasks = readTasks();
  const newTask = {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  writeTasks(tasks);

  res.status(201).json(newTask);
});

// PATCH /tasks/:id
app.patch('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { completed, title } = req.body;

  const tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  // Update properties if provided
  if (typeof completed === 'boolean') {
    tasks[taskIndex].completed = completed;
  }
  if (title && typeof title === 'string' && title.trim() !== '') {
    tasks[taskIndex].title = title.trim();
  }

  writeTasks(tasks);
  res.json(tasks[taskIndex]);
});

// DELETE /tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;

  let tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks = tasks.filter(t => t.id !== id);
  writeTasks(tasks);

  res.json({ message: 'Task deleted successfully' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
