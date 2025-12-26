'use client';

// A simple reusable SVG Line Chart for "Stocks" style visualization
export default function LineChart({ data, title, color = '#34d399' }) {
    // data: [{ label: 'Day 1', value: 50 }, ...]
    if (!data || data.length === 0) return null;

    const width = 300;
    const height = 150;
    const padding = 20;

    const maxValue = Math.max(...data.map(d => d.value), 100);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - ((d.value / maxValue) * (height - padding * 2)) - padding;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="glass-panel p-4" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase' }}>{title}</h4>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', background: 'rgba(0,0,0,0.2)' }}>
                {/* Grid Lines */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" strokeWidth="1" />

                {/* The Line */}
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    points={points}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animated-line"
                />

                {/* Dots */}
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
                    const y = height - ((d.value / maxValue) * (height - padding * 2)) - padding;
                    return (
                        <circle key={i} cx={x} cy={y} r="3" fill="#fff" />
                    );
                })}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: '#64748b' }}>
                <span>{data[0]?.label}</span>
                <span>{data[data.length - 1]?.label}</span>
            </div>
        </div>
    );
}
