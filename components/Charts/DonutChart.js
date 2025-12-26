'use client';

export default function DonutChart({ percent, label, color = "#22c55e" }) {
    const radius = 50;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 'bold', color: '#f8fafc' }}>{label}</span>
                <span style={{ color: '#94a3b8' }}>ℹ️</span>
            </div>

            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <svg
                    height="120"
                    width="120"
                    style={{ transform: 'rotate(-90deg)' }}
                >
                    <circle
                        stroke="#e2e8f0"
                        strokeWidth={stroke}
                        fill="transparent"
                        r={normalizedRadius}
                        cx={60}
                        cy={60}
                    />
                    <circle
                        stroke={color}
                        fill="transparent"
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.1s ease-out' }}
                        strokeLinecap="round"
                        r={normalizedRadius}
                        cx={60}
                        cy={60}
                    />
                </svg>
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#ffffff'
                }}>
                    {percent}
                </div>
            </div>
        </div>
    );
}
