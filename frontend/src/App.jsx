import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Check, Edit2, LayoutDashboard, 
  CheckSquare, Settings, Search, User, 
  CheckCircle, Clock, ListTodo, Inbox, Bell, Activity, Palette
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import './App.css';

const API_URL = 'http://localhost:3001/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('default');
  
  // Navigation State
  const [activeNav, setActiveNav] = useState('dashboard');
  
  // For inline editing
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Could not load tasks. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle })
      });
      
      if (!response.ok) throw new Error('Failed to add task');
      const newTask = await response.json();
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
    } catch (err) {
      setError('Could not add task.');
    }
  };

  const toggleTask = async (id, completed) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !completed } : t));
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      });
      if (!response.ok) throw new Error('Failed to update task');
    } catch (err) {
      setTasks(tasks.map(t => t.id === id ? { ...t, completed } : t));
      setError('Could not update task.');
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete task');
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      setError('Could not delete task.');
    }
  };

  const startEditing = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle })
      });
      if (!response.ok) throw new Error('Failed to update task title');
      
      setTasks(tasks.map(t => t.id === id ? { ...t, title: editTitle.trim() } : t));
      setEditingId(null);
    } catch (err) {
      setError('Could not update task title.');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  // Derived Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Chart Data
  const pieData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Pending', value: pendingTasks },
  ];
  const COLORS = ['var(--success-color)', 'var(--warning-color)'];
  
  // Fake bar chart data based on tasks
  const barData = [
    { name: 'Mon', tasks: Math.max(0, totalTasks - 2) },
    { name: 'Tue', tasks: Math.max(0, totalTasks - 1) },
    { name: 'Wed', tasks: totalTasks },
  ];

  return (
    <div className={`dashboard`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-section">
          <CheckSquare size={32} />
          <span>Focus</span>
        </div>
        
        <nav className="nav-menu">
          <div className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveNav('dashboard')}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
          <div className={`nav-item ${activeNav === 'tasks' ? 'active' : ''}`} onClick={() => setActiveNav('tasks')}>
            <ListTodo size={20} />
            <span>My Tasks</span>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div className="theme-selector" style={{ padding: '1rem', background: 'var(--panel-bg-glass)', borderRadius: '12px', marginBottom: '1rem', boxShadow: 'var(--shadow-inset-dark)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: 'var(--text-main)', fontWeight: '600', fontSize: '0.9rem' }}>
              <Palette size={16} /> Theme
            </div>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: 'none', background: 'var(--bg-color)', color: 'var(--text-main)', outline: 'none' }}
            >
              <option value="default">Light (Default)</option>
              <option value="earthy">Matcha & Linen (Pic 1)</option>
              <option value="candy">Candy Brights (Pic 2)</option>
              <option value="celtic">So Matcha (Pic 3)</option>
            </select>
          </div>
          
          <div className="nav-item">
            <User size={20} />
            <span>Account</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="top-header">
          <div className="greeting">
            <h1>Hello, Alex 👋</h1>
            <p>Let's make today productive and focused.</p>
          </div>
          
          <div className="header-actions">
            <div className="search-bar">
              <Search size={18} color="var(--text-muted)" />
              <input type="text" placeholder="Search tasks..." />
            </div>
            <button className="profile-btn">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon primary">
              <ListTodo size={24} />
            </div>
            <div className="stat-details">
              <h3>{totalTasks}</h3>
              <p>Total Tasks</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success">
              <CheckCircle size={24} />
            </div>
            <div className="stat-details">
              <h3>{completedTasks}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning">
              <Clock size={24} />
            </div>
            <div className="stat-details">
              <h3>{pendingTasks}</h3>
              <p>Pending</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Main Task List Panel */}
          <div className="panel" style={{ flex: 1.5 }}>
            <div className="panel-header">
              <h2>Task Management</h2>
              
              <div className="filters">
                <button 
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                  onClick={() => setFilter('active')}
                >
                  Active
                </button>
                <button 
                  className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </button>
              </div>
            </div>

            <form onSubmit={addTask} className="task-form">
              <input 
                type="text" 
                className="input-soft" 
                placeholder="What needs to be done?" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <button type="submit" className="btn-soft" disabled={!newTaskTitle.trim() || loading}>
                <Plus size={20} style={{ marginRight: '6px' }} />
                Add
              </button>
            </form>

            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                {filteredTasks.length === 0 ? (
                  <div className="empty-state">
                    <Inbox size={48} strokeWidth={1.5} />
                    <p>No tasks found. Time to relax!</p>
                  </div>
                ) : (
                  <ul className="task-list">
                    {filteredTasks.map(task => (
                      <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                        <div 
                          className={`task-checkbox-container ${task.completed ? 'checked' : ''}`}
                          onClick={() => toggleTask(task.id, task.completed)}
                        >
                          {task.completed && <Check size={16} strokeWidth={4} />}
                        </div>
                        
                        {editingId === task.id ? (
                          <input 
                            type="text"
                            className="task-title editing"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => saveEdit(task.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(task.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                          />
                        ) : (
                          <span 
                            className="task-title"
                            onDoubleClick={() => startEditing(task)}
                          >
                            {task.title}
                          </span>
                        )}

                        <div className="task-actions">
                          <button 
                            className="action-btn"
                            onClick={() => editingId === task.id ? saveEdit(task.id) : startEditing(task)}
                            title="Edit"
                          >
                            {editingId === task.id ? <Check size={16} /> : <Edit2 size={16} />}
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => deleteTask(task.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          {/* Side Panel (Charts & Stats) */}
          <div className="panel secondary-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Pie Chart Section */}
            <div>
              <div className="panel-header" style={{ marginBottom: '0.5rem' }}>
                <h2>Analytics</h2>
                <Activity size={20} color="var(--text-muted)" />
              </div>
              <div style={{ width: '100%', height: 200, display: 'flex', justifyContent: 'center' }}>
                 {totalTasks > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', background: 'var(--panel-bg)', color: 'var(--text-main)', boxShadow: 'var(--shadow-dark)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                 ) : (
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                      No data to visualize.
                   </div>
                 )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                   <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success-color)' }}></div> Completed
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                   <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--warning-color)' }}></div> Pending
                </div>
              </div>
            </div>

            {/* Bar Chart Section */}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Task Evolution</h3>
              <div style={{ width: '100%', height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ borderRadius: '8px', border: 'none', background: 'var(--panel-bg)', color: 'var(--text-main)' }} 
                    />
                    <Bar dataKey="tasks" fill="var(--accent-color)" radius={[6, 6, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
