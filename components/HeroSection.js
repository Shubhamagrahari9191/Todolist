'use client';
import './HeroSection.css';

export default function HeroSection({ tasks }) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const pending = tasks.filter(t => t.status === 'pending').length;

    const getWidth = (val) => total === 0 ? 0 : (val / total) * 100;

    const quotes = [
        "Great progress, keep it up! 👍",
        "Small steps lead to big results. 🚀",
        "You are doing amazing today! 🌟",
        "Stay focused, stay unstoppable. 💪"
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    return (
        <div className="hero-card">
            <div className="hero-content">
                <div className="hero-top">
                    <h2 className="quote-text">{randomQuote}</h2>
                </div>

                <div className="hero-message glass-overlay">
                    <p>Based on your current progress, there's a 100% chance you'll crush your goals!</p>
                    <p className="sub-msg">You have {pending + inProgress} tasks remaining. Remember to prioritize!</p>
                </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="segmented-container">
                <div className="segmented-bar">
                    {pending > 0 && (
                        <div
                            className="segment red"
                            style={{ width: `${getWidth(pending)}%` }}
                        >{pending}</div>
                    )}
                    {inProgress > 0 && (
                        <div
                            className="segment orange"
                            style={{ width: `${getWidth(inProgress)}%` }}
                        >{inProgress}</div>
                    )}
                    {completed > 0 && (
                        <div
                            className="segment blue"
                            style={{ width: `${getWidth(completed)}%` }}
                        >{completed}</div>
                    )}
                </div>
                <div className="bar-summary">
                    <span>{pending + inProgress} tasks left</span>
                </div>
            </div>
        </div>
    );
}
