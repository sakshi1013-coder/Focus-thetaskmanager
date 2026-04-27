import { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Check, Edit2, LayoutDashboard, 
  CheckSquare, Settings, Search, User, 
  CheckCircle, Clock, ListTodo, Inbox, Bell, Activity, Palette, LogOut, ArrowRight,
  ChevronLeft, ChevronRight, Calendar
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import './App.css';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('default');
  
  // Navigation State
  const [activeNav, setActiveNav] = useState('dashboard');
  
  // For inline editing
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Initial Check
  useEffect(() => {
    const savedUser = localStorage.getItem('focusUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchTasks();
    }
  }, [currentUser]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authForm.username || !authForm.password) {
      setAuthError('Please fill in both fields.');
      return;
    }
    setAuthError('');
    setAuthLoading(true);

    try {
      const endpoint = authMode === 'login' ? `${API_URL}/auth/login` : `${API_URL}/auth/register`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setCurrentUser(data.user);
      localStorage.setItem('focusUser', JSON.stringify(data.user));
      setAuthForm({ username: '', password: '' });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setTasks([]);
    localStorage.removeItem('focusUser');
    setActiveNav('dashboard');
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tasks?userId=${currentUser.id}`);
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
    if (!newTaskTitle.trim() || !currentUser) return;

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle, userId: currentUser.id })
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
      const response = await fetch(`${API_URL}/tasks/${id}`, {
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
      const response = await fetch(`${API_URL}/tasks/${id}`, {
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
      const response = await fetch(`${API_URL}/tasks/${id}`, {
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

  if (!currentUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', background: 'var(--bg-color)', color: 'var(--text-main)' }}>
        <div className="panel" style={{ width: '400px', maxWidth: '90%' }}>
          <div className="logo-section" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
            <CheckSquare size={36} color="var(--accent-color)" />
            <span style={{ fontSize: '1.8rem' }}>Focus</span>
          </div>
          
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 600 }}>
            {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>

          {authError && <div className="error-message" style={{ padding: '0.8rem', marginBottom: '1.2rem', borderRadius: '8px' }}>{authError}</div>}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Username" 
              className="input-soft"
              value={authForm.username}
              onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="input-soft"
              value={authForm.password}
              onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            />
            <button type="submit" className="btn-soft" style={{ marginTop: '0.5rem', padding: '1rem' }} disabled={authLoading}>
              {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
              <ArrowRight size={18} style={{ marginLeft: '10px' }} />
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {authMode === 'login' ? (
              <p>Don't have an account? <span style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthMode('register')}>Sign Up</span></p>
            ) : (
              <p>Already have an account? <span style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setAuthMode('login')}>Sign In</span></p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const filteredTasks = tasks.filter(t => {
    let matchesFilter = true;
    if (filter === 'active') matchesFilter = !t.completed;
    else if (filter === 'completed') matchesFilter = t.completed;
    
    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return matchesFilter && matchesSearch;
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

  const renderContent = () => {
    if (activeNav === 'account') {
      return (
        <div className="panel" style={{ flex: 1, maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <div className="panel-header" style={{ marginBottom: '2rem' }}>
            <h2>Account Settings</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--bg-color)', padding: '1.5rem', borderRadius: 'var(--border-radius)' }}>
               <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-light), var(--accent-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 700 }}>
                 {currentUser.username.charAt(0).toUpperCase()}
               </div>
               <div>
                 <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>{currentUser.username}</h3>
                 <p style={{ color: 'var(--text-muted)' }}>Focus User</p>
               </div>
            </div>
            
            <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: 'var(--border-radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '0.4rem', fontSize: '1rem' }}>Session Management</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign out of your account on this device.</p>
              </div>
              <button className="btn-soft" onClick={handleLogout} style={{ background: 'var(--danger-color)', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                <LogOut size={16} color="white" style={{ marginRight: '8px' }} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeNav === 'tasks') {
      const completedTasksList = tasks.filter(t => t.completed);
      
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
      
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      
      const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

      return (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          
          {/* Calendar Section */}
          <div className="panel" style={{ flex: '1 1 300px' }}>
            <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
              <h2>Calendar Overview</h2>
              <Calendar size={20} color="var(--text-muted)" />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <button 
                onClick={prevMonth}
                className="action-btn"
              >
                <ChevronLeft size={18} />
              </button>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button 
                onClick={nextMonth}
                className="action-btn"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {day}
                </div>
              ))}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} style={{ padding: '10px' }} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasCompletedTask = completedTasksList.some(t => t.createdAt.startsWith(dateStr));
                
                return (
                  <div 
                    key={`day-${day}`} 
                    style={{ 
                      padding: '8px 0', 
                      textAlign: 'center', 
                      borderRadius: '8px',
                      background: hasCompletedTask ? 'var(--success-color)' : 'var(--panel-bg)',
                      color: hasCompletedTask ? 'white' : 'var(--text-main)',
                      fontWeight: hasCompletedTask ? 'bold' : 'normal',
                      boxShadow: 'var(--shadow-inset-light), var(--shadow-inset-dark)',
                      fontSize: '0.9rem'
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Completed Tasks List */}
          <div className="panel" style={{ flex: '1 1 400px' }}>
            <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
              <h2>Previous Tasks Completed</h2>
              <CheckCircle size={20} color="var(--success-color)" />
            </div>
            
            {completedTasksList.length === 0 ? (
              <div className="empty-state">
                <CheckSquare size={40} strokeWidth={1.5} color="var(--text-muted)" />
                <p>No completed tasks yet.</p>
              </div>
            ) : (
              <ul className="task-list" style={{ maxHeight: '500px' }}>
                {completedTasksList.map(task => (
                  <li key={task.id} className="task-item completed" style={{ opacity: 0.8 }}>
                    <div className="task-checkbox-container checked">
                      <Check size={16} strokeWidth={4} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span className="task-title" style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                        {task.title}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Completed on {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
        </div>
      );
    }

    // Default: Dashboard / Tasks
    return (
      <>
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
      </>
    );
  };

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
          
          <div className={`nav-item ${activeNav === 'account' ? 'active' : ''}`} onClick={() => setActiveNav('account')}>
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
            <h1>Hello, {currentUser.username} 👋</h1>
            <p>Let's make today productive and focused.</p>
          </div>
          
          <div className="header-actions">
            <div className="search-bar">
              <Search size={18} color="var(--text-muted)" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="profile-btn">
              <Bell size={20} />
            </button>
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        {renderContent()}

      </main>
    </div>
  );
}

export default App;
