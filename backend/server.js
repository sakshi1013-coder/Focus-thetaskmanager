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
const usersFile = path.join(__dirname, 'users.json');

// Ensure data files exist
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify([]));
}
if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([]));
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

const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const users = readUsers();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  const newUser = { id: crypto.randomUUID(), username, password };
  users.push(newUser);
  writeUsers(users);
  res.json({ message: 'Registered successfully', user: { id: newUser.id, username: newUser.username } });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ message: 'Login successful', user: { id: user.id, username: user.username } });
});

// GET /tasks
app.get('/api/tasks', (req, res) => {
  const { userId } = req.query;
  const tasks = readTasks();
  if (userId) {
    res.json(tasks.filter(t => t.userId === userId));
  } else {
    res.json(tasks);
  }
});

// POST /tasks
app.post('/api/tasks', (req, res) => {
  const { title, userId } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }

  const tasks = readTasks();
  const newTask = {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
    userId: userId || 'anonymous',
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
