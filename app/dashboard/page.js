'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DonutChart from '@/components/Charts/DonutChart';
import HeroSection from '@/components/HeroSection';
import Analytics from '@/components/Analytics';
import TaskForm from '@/components/TaskForm';
import { generatePDF } from '@/lib/pdf-generator';
import './dashboard.css';

// Helper to calculate duration
const getDuration = (start, end) => {
    if (!start || !end) return '';
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diffMins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diffMins < 0) diffMins += 24 * 60;

    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;

    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    return parts.join(' ');
};

// Helper to format time to AM/PM
const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m < 10 ? '0' + m : m} ${ampm}`;
};

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'planner'
    const [currentTime, setCurrentTime] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Clock tick
        const tick = () => {
            const now = new Date();
            const str = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) +
                ' • ' + now.toLocaleTimeString('en-US', { hour12: false });
            setCurrentTime(str);
        };
        tick(); // initial
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [router]);

    const fetchTasks = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/tasks?userId=${user.id}`);
            const data = await res.json();
            if (data.tasks) {
                // Sort by Date then Time
                const sorted = data.tasks.sort((a, b) => {
                    return new Date(a.date + ' ' + (a.time || '00:00')) - new Date(b.date + ' ' + (b.time || '00:00'));
                });
                setTasks(sorted);
            }
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTasks();
            const interval = setInterval(fetchTasks, 2000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const updateProgress = async (task, newProgress) => {
        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t.id === task.id ? { ...t, progress: newProgress, status: newProgress === 100 ? 'completed' : (newProgress > 0 ? 'in-progress' : 'pending') } : t
        );
        setTasks(updatedTasks);

        await fetch('/api/tasks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId: task.id, progress: newProgress })
        });
        // Background sync will catch up
    };

    const toggleTask = async (task) => {
        const isComplete = task.status === 'completed';
        const newStatus = isComplete ? 'pending' : 'completed';
        const newProgress = isComplete ? 0 : 100;

        // Optimistic update
        const updatedTasks = tasks.map(t =>
            t.id === task.id ? { ...t, status: newStatus, progress: newProgress } : t
        );
        setTasks(updatedTasks);
        await fetch('/api/tasks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId: task.id, status: newStatus, progress: newProgress })
        });
        fetchTasks();
    };

    const deleteTask = async (taskId) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);

        await fetch(`/api/tasks?taskId=${taskId}`, {
            method: 'DELETE'
        });
        fetchTasks();
    };

    // Group tasks by date for Planner View
    const groupedTasks = tasks.reduce((groups, task) => {
        const date = task.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(task);
        return groups;
    }, {});

    if (!user) return null;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-left">
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(true)}
                        aria-label="Open Menu"
                    >
                        ☰
                    </button>
                    <div>
                        <h1 className="welcome-text">Hello, {user.username} 👋</h1>
                        <p className="date-text">{currentTime}</p>
                    </div>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >List</button>
                        <button
                            className={`toggle-btn ${viewMode === 'planner' ? 'active' : ''}`}
                            onClick={() => setViewMode('planner')}
                        >Planner</button>
                    </div>
                    <button onClick={() => generatePDF(tasks, user.username)} className="btn btn-secondary">
                        PDF
                    </button>
                    <button onClick={() => {
                        localStorage.removeItem('user');
                        router.push('/login');
                    }} className="btn btn-danger-outline">
                        Logout
                    </button>
                </div>
            </header>

            <div className="dashboard-grid">
                <div className="full-width-hero">
                    <HeroSection tasks={tasks} />
                </div>

                <div className="stats-row">
                    <DonutChart
                        label="Productivity Score"
                        percent={Math.round((tasks.filter(t => t.status === 'completed').length / (tasks.length || 1)) * 100)}
                        color="#22c55e"
                    />
                    <DonutChart
                        label="Task Completion"
                        percent={Math.round((tasks.filter(t => t.status !== 'pending').length / (tasks.length || 1)) * 100)}
                        color="#3b82f6"
                    />
                </div>

                <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
                    <div className="sidebar-header-mobile">
                        <h3>Menu</h3>
                        <button className="close-menu-btn" onClick={() => setMobileMenuOpen(false)}>×</button>
                    </div>
                    <Analytics tasks={tasks} />
                    <div className="quick-actions glass-panel">
                        <h3 className="section-title">Quick Actions</h3>
                        <button onClick={() => { setShowForm(true); setMobileMenuOpen(false); }} className="btn btn-primary w-full">
                            + Add New Task
                        </button>
                    </div>
                </aside>
                {mobileMenuOpen && <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>}

                <main className="main-content">
                    <h2 className="section-title">
                        {viewMode === 'list' ? 'Your Tasks' : 'Daily Planner'}
                    </h2>

                    {viewMode === 'list' ? (
                        <div className="task-list">
                            {tasks.length === 0 ? (
                                <div className="empty-state">
                                    <p>No tasks found. Add one to get started!</p>
                                </div>
                            ) : (
                                tasks.map(task => (
                                    <TaskCard key={task.id} task={task} updateProgress={updateProgress} toggleTask={toggleTask} deleteTask={deleteTask} />
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="planner-view">
                            {Object.keys(groupedTasks).length === 0 && (
                                <div className="empty-state"><p>No schedule available.</p></div>
                            )}
                            {Object.keys(groupedTasks).map(date => (
                                <div key={date} className="planner-day">
                                    <h3 className="planner-date">{date === new Date().toISOString().split('T')[0] ? 'Today' : date}</h3>
                                    <div className="timeline">
                                        {groupedTasks[date].map(task => (
                                            <div key={task.id} className="timeline-item">
                                                <div className="time-marker">
                                                    <div>{task.startTime || 'All Day'}</div>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.7, marginTop: '2px' }}>
                                                        {getDuration(task.startTime, task.endTime)}
                                                    </div>
                                                </div>
                                                <div className="timeline-content">
                                                    <TaskCard task={task} updateProgress={updateProgress} toggleTask={toggleTask} deleteTask={deleteTask} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {showForm && (
                <TaskForm
                    userId={user.id}
                    onTaskAdded={fetchTasks}
                    closeForm={() => setShowForm(false)}
                    viewMode={viewMode}
                />
            )}
        </div>
    );
}

function TaskCard({ task, updateProgress, toggleTask, deleteTask }) {
    const handleProgressChange = (e) => {
        e.stopPropagation();
        const val = parseInt(e.target.value);
        updateProgress(task, val);
    };

    return (
        <div className={`task-card glass-panel ${task.status} ${task.isEvent ? 'event-card' : ''}`}>
            <div className="task-info">
                <div className="task-header">
                    <div className="flex gap-2 items-center">
                        <span className={`task-tag ${task.isEvent ? 'tag-event' : 'tag-task'}`}>
                            {task.isEvent ? 'Event' : 'Task'}
                        </span>
                        {task.subject && <span className="task-subject">{task.subject}</span>}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="delete-btn" title="Delete Task">
                        🗑️
                    </button>
                </div>

                <h3 className="task-title">{task.title}</h3>
                <div className="task-meta">
                    <span>📅 {task.date}</span>
                    <span>⏰ {task.startTime ? `${formatTime(task.startTime)} - ${task.endTime ? formatTime(task.endTime) : '?'}` : 'All Day'}</span>
                </div>

                <div className="progress-control">
                    <label>Progress: <span style={{ color: 'white', fontWeight: 'bold' }}>{task.progress || 0}%</span></label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={task.progress || 0}
                        onChange={handleProgressChange}
                        className="range-slider"
                        step="10"
                    />
                </div>
            </div>
            <div className="task-action">
                <input
                    type="checkbox"
                    className="custom-checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => toggleTask(task)}
                />
            </div>
        </div>
    );
}
