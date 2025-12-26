'use client';
import { useState, useEffect } from 'react';
import PieChart from './Charts/PieChart';
import LineChart from './Charts/LineChart';
import './Analytics.css';

export default function Analytics({ tasks }) {
    // 1. Subject Distribution Data (Real)
    const subjectCounts = {};
    tasks.forEach(t => {
        if (!t.isEvent) {
            const sub = t.subject || 'Uncategorized';
            subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;
        }
    });

    const colors = ['#8b5cf6', '#f472b6', '#34d399', '#facc15', '#60a5fa'];
    const pieData = Object.entries(subjectCounts).map(([label, value], i) => ({
        label,
        value,
        color: colors[i % colors.length]
    }));

    // 2. Productivity Trend (Real - Tasks Completed per Day)
    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }
        return days;
    };

    const last7Days = getLast7Days();
    const productivityMap = new Map();
    last7Days.forEach(d => productivityMap.set(d, 0));

    tasks.forEach(t => {
        if (t.status === 'completed') {
            // Use completion date if available, otherwise assume 'date' they were scheduled for
            // For simplicity in this version without a specific 'completedAt' field, use scheduled date
            if (productivityMap.has(t.date)) {
                productivityMap.set(t.date, productivityMap.get(t.date) + 1);
            }
        }
    });

    const productivityData = last7Days.map(date => {
        const dateObj = new Date(date);
        const label = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
        return { label, value: productivityMap.get(date) };
    });

    // 3. Sleep Tracker (Semi-Real with Local Storage)
    const [sleepData, setSleepData] = useState([]);
    const [lastSleep, setLastSleep] = useState('');

    useEffect(() => {
        const savedSleep = localStorage.getItem('sleepData');
        if (savedSleep) {
            setSleepData(JSON.parse(savedSleep));
        } else {
            // Init dummy if empty to show graph structure
            setSleepData([
                { label: 'Mon', value: 7 }, { label: 'Tue', value: 6.5 }, { label: 'Wed', value: 8 }
            ]);
        }
    }, []);

    const addSleepLog = () => {
        if (!lastSleep) return;
        const val = parseFloat(lastSleep);
        const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
        const newData = [...sleepData, { label: today, value: val }].slice(-7); // Keep last 7
        setSleepData(newData);
        localStorage.setItem('sleepData', JSON.stringify(newData));
        setLastSleep('');
    };

    return (
        <div className="analytics-section">
            <h3 className="section-title">Deep Analytics</h3>

            {pieData.length > 0 ? (
                <PieChart data={pieData} title="Subject Focus" />
            ) : (
                <div className="glass-panel p-4 mb-4 text-muted text-sm">Add tasks to see Analytics.</div>
            )}

            <LineChart data={productivityData} title="Productivity (Tasks Done)" color="#8b5cf6" />

            <div className="sleep-section">
                <LineChart data={sleepData} title="Sleep Tracker (Hrs)" color="#f472b6" />
                <div className="sleep-input-row">
                    <input
                        type="number"
                        placeholder="0.0"
                        value={lastSleep}
                        onChange={e => setLastSleep(e.target.value)}
                        className="mini-input"
                    />
                    <button onClick={addSleepLog} className="mini-btn">Log Sleep</button>
                </div>
            </div>
        </div>
    );
}
