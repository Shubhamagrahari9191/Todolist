'use client';
import { useState } from 'react';
import './TaskForm.css';

export default function TaskForm({ userId, onTaskAdded, closeForm, viewMode }) {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [dateType, setDateType] = useState('today');
    const [customDate, setCustomDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isEvent, setIsEvent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title) {
            alert('Please enter a title');
            return;
        }

        // Validation: Conditional logic based on View Mode
        // Time is now optional even in Planner mode
        if (viewMode === 'planner') {
            if (!startTime || !endTime) {
                alert("⚠️ Planner Mode Requirement:\nPlease set a Start and End time to place this task on the schedule.");
                return;
            }
        }

        // Logic: If endTime is provided but startTime isn't, alert.
        if (endTime && !startTime) {
            alert("Please set a Start Time if you have an End Time");
            return;
        }

        // Validation: End Time < Start Time
        if (startTime && endTime && endTime <= startTime) {
            alert("End Time must be after Start Time.");
            return;
        }

        // Calculate Date
        let selectedDate = '';
        if (dateType === 'today') {
            selectedDate = new Date().toISOString().split('T')[0];
        } else if (dateType === 'tomorrow') {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            selectedDate = d.toISOString().split('T')[0];
        } else {
            selectedDate = customDate;
        }

        // Real-Time Validation: Prevent past times for today
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (selectedDate === todayStr && startTime) {
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const [selectedHours, selectedMinutes] = startTime.split(':').map(Number);

            if (selectedHours < currentHours || (selectedHours === currentHours && selectedMinutes < currentMinutes)) {
                alert("⚠️ You cannot schedule a task in the past! Please choose a future time.");
                return;
            }
        }

        const payload = {
            userId,
            title,
            subject,
            date: selectedDate,
            startTime,
            endTime,
            isEvent
        };

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                onTaskAdded();
                closeForm();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="glass-panel modal-content">
                <h2 className="modal-title">Schedule {isEvent ? 'Event' : 'Task'}</h2>

                <form onSubmit={handleSubmit}>
                    {/* Type Toggle */}
                    <div className="form-row mb-4">
                        <div className="toggle-type">
                            <button
                                type="button"
                                className={`type-btn ${!isEvent ? 'active' : ''}`}
                                onClick={() => setIsEvent(false)}
                            >
                                Task
                            </button>
                            <button
                                type="button"
                                className={`type-btn ${isEvent ? 'active' : ''}`}
                                onClick={() => setIsEvent(true)}
                            >
                                Event
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Title</label>
                        <input
                            className="input-field"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            placeholder={isEvent ? "Meeting..." : "Do Homework..."}
                        />
                    </div>

                    {!isEvent && (
                        <div className="form-group">
                            <label>Subject</label>
                            <input
                                className="input-field"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="Math, Coding, Physics..."
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label>Date</label>
                        <div className="date-options">
                            <button type="button" className={`date-btn ${dateType === 'today' ? 'active' : ''}`} onClick={() => setDateType('today')}>Today</button>
                            <button type="button" className={`date-btn ${dateType === 'tomorrow' ? 'active' : ''}`} onClick={() => setDateType('tomorrow')}>Tomorrow</button>
                            <button type="button" className={`date-btn ${dateType === 'custom' ? 'active' : ''}`} onClick={() => setDateType('custom')}>Pick Date</button>
                        </div>
                        {dateType === 'custom' && (
                            <input
                                type="date"
                                className="input-field mt-2"
                                value={customDate}
                                onChange={e => setCustomDate(e.target.value)}
                                required
                            />
                        )}
                    </div>

                    <div className="time-row">
                        <div className="form-group half">
                            <label>From {viewMode === 'planner' ? '(Required)' : '(Optional)'}</label>
                            <input
                                type="time"
                                className="input-field"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                required={viewMode === 'planner'}
                            />
                        </div>
                        {viewMode === 'planner' && (
                            <div className="form-group half">
                                <label>Till (Required)</label>
                                <input
                                    type="time"
                                    className="input-field"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={closeForm}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Schedule Task</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
