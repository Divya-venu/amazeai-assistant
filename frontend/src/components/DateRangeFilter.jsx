import React from 'react';
import { Calendar } from 'lucide-react';

const RANGES = [
    { label: '7d',  days: 7 },
    { label: '30d', days: 30 },
    { label: '90d', days: 90 },
    { label: 'All', days: null },
];

const DateRangeFilter = ({ value, onChange }) => {
    const handleSelect = (r) => {
        const to = new Date();
        const from = r.days ? new Date(Date.now() - r.days * 86400000) : null;
        const label = r.days ? `Last ${r.label}` : 'All Time';
        onChange(label, from?.toISOString().split('T')[0] ?? null, to.toISOString().split('T')[0]);
    };

    return (
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full p-1 shadow-inner">
            {RANGES.map(r => {
                const label = r.days ? `Last ${r.label}` : 'All Time';
                const active = value === label;
                return (
                    <button
                        key={r.label}
                        onClick={() => handleSelect(r)}
                        className={`filter-pill ${active ? 'active' : 'text-gray-400'}`}
                    >
                        {r.label}
                    </button>
                );
            })}
        </div>
    );
};

export default DateRangeFilter;
