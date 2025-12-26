'use client';

export default function PieChart({ data, title }) {
    // data: [{ label: 'Math', value: 10, color: '...' }]
    const total = data.reduce((acc, cur) => acc + cur.value, 0);
    let cumulativePercent = 0;

    function getCoordinatesForPercent(percent) {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    }

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase' }}>{title}</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ width: '120px', height: '120px', position: 'relative' }}>
                    <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
                        {data.map((slice, i) => {
                            if (slice.value === 0) return null;
                            const startPercent = cumulativePercent;
                            const slicePercent = slice.value / total;
                            cumulativePercent += slicePercent;
                            const endPercent = cumulativePercent;

                            const [startX, startY] = getCoordinatesForPercent(startPercent);
                            const [endX, endY] = getCoordinatesForPercent(endPercent);

                            const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

                            const pathData = [
                                `M 0 0`,
                                `L ${startX} ${startY}`,
                                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                                `L 0 0`,
                            ].join(' ');

                            return (
                                <path key={i} d={pathData} fill={slice.color} />
                            );
                        })}
                        {total === 0 && <circle cx="0" cy="0" r="1" fill="#334155" />}
                    </svg>
                </div>

                <div style={{ flex: 1 }}>
                    {data.map((d, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color, marginRight: '0.5rem' }}></span>
                            <span style={{ color: '#cbd5e1', flex: 1 }}>{d.label}</span>
                            <span style={{ fontWeight: 'bold', color: '#fff' }}>{Math.round((d.value / total) * 100)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
