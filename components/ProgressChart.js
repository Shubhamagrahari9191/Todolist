'use client';
import './ProgressChart.css';

export default function ProgressChart({ tasks }) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    return (
        <div className="glass-panel progress-card">
            <div className="progress-header">
                <h3 className="progress-title">Your Progress</h3>
                <span className="progress-percent">{percentage}%</span>
            </div>

            <div className="progress-bar-bg">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            <div className="progress-stats">
                <div className="stat-item">
                    <span className="stat-val">{completed}</span> Completed
                </div>
                <div className="stat-item">
                    <span className="stat-val">{total - completed}</span> Pending
                </div>
            </div>
        </div>
    );
}
