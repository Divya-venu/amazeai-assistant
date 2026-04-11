import React, { useState } from 'react';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle, X, Settings } from 'lucide-react';

const INITIAL_ALERTS = [
    { id: 1, type: 'high',   title: 'Revenue Drop Detected',      message: 'Revenue fell 18% below threshold in January 2026.', time: '2h ago',  read: false },
    { id: 2, type: 'medium', title: 'Unusual Expense Spike',       message: 'Operating expenses 35% above monthly average.',      time: '5h ago',  read: false },
    { id: 3, type: 'low',    title: 'New Customer Milestone',      message: '1,000 unique customers reached this month!',         time: '1d ago',  read: true  },
    { id: 4, type: 'high',   title: 'Inventory Alert',             message: 'Electronics category stock below reorder level.',    time: '2d ago',  read: false },
    { id: 5, type: 'medium', title: 'Margin Compression Warning',  message: 'Profit margin dropped from 47% to 39% in Q1.',      time: '3d ago',  read: true  },
    { id: 6, type: 'low',    title: 'Forecast Accuracy Update',    message: 'AI model retrained on latest 90-day data.',          time: '4d ago',  read: true  },
];

const SEV = {
    high:   { icon: AlertTriangle, color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    label: 'Critical' },
    medium: { icon: AlertCircle,   color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  label: 'Warning' },
    low:    { icon: Info,          color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', label: 'Info' },
};

export default function Alerts() {
    const [alerts, setAlerts] = useState(INITIAL_ALERTS);
    const [filter, setFilter] = useState('all');

    const dismiss = (id) => setAlerts(prev => prev.filter(a => a.id !== id));
    const markRead = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
    const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, read: true })));

    const filtered = filter === 'all' ? alerts : filter === 'unread' ? alerts.filter(a => !a.read) : alerts.filter(a => a.type === filter);
    const unreadCount = alerts.filter(a => !a.read).length;

    return (
        <div className="p-6 flex flex-col gap-6 max-w-screen-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-white flex items-center gap-2">
                        <Bell size={20} className="text-yellow-400" /> Smart Alerts
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">AI-powered threshold monitoring and anomaly alerts</p>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'unread', 'high', 'medium', 'low'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                            filter === f
                                ? 'bg-indigo-600 text-white'
                                : 'bg-[#0d1526] border border-[#1a2540] text-gray-400 hover:text-white'
                        }`}
                    >
                        {f}
                    </button>
                ))}
                <span className="ml-auto text-xs text-gray-600 self-center">{filtered.length} alerts</span>
            </div>

            {/* Alert list */}
            <div className="flex flex-col gap-3">
                {filtered.length === 0 && (
                    <div className="rounded-2xl bg-[#0d1526] border border-[#1a2540] p-12 text-center">
                        <CheckCircle size={32} className="text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No alerts match this filter</p>
                    </div>
                )}
                {filtered.map(alert => {
                    const s = SEV[alert.type];
                    const Icon = s.icon;
                    return (
                        <div
                            key={alert.id}
                            onClick={() => markRead(alert.id)}
                            className={`rounded-2xl border p-4 flex items-start gap-4 cursor-pointer transition-all
                                ${alert.read
                                    ? 'bg-[#0d1526] border-[#1a2540] opacity-60'
                                    : `bg-[#0d1526] ${s.border} shadow-md`
                                }`}
                        >
                            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                                <Icon size={16} className={s.color} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-bold text-white truncate">{alert.title}</h3>
                                    {!alert.read && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0" />}
                                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>
                                        {s.label}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">{alert.message}</p>
                                <p className="text-[10px] text-gray-600 mt-1">{alert.time}</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); dismiss(alert.id); }}
                                className="text-gray-600 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
