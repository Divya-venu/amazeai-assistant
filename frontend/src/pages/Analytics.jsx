import React, { useState, useEffect, useCallback } from 'react';
import {
    TrendingUp, DollarSign, ShoppingBag, Users,
    ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getAnalyticsData } from '../services/dashboardService';
import { io } from 'socket.io-client';

const KPI = ({ label, value, trend, up, icon: Icon, color }) => (
    <div className={`rounded-2xl bg-[#0d1526] border border-[${color}]/20 p-5 kpi-card`}>
        <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-xl bg-[${color}]/10 flex items-center justify-center`}>
                <Icon size={18} className={`text-[${color}]`} />
            </div>
            {trend && (
                <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full
                    ${up ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                    {trend}
                </span>
            )}
        </div>
        <p className="text-2xl font-black text-white mb-0.5">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
    </div>
);

const TT = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-[#0d1526] border border-[#1a2540] rounded-xl p-3 text-xs shadow-xl">
            <p className="text-gray-400 mb-2 font-semibold">{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color }} className="font-bold">
                    {p.name}: ${Number(p.value).toLocaleString()}
                </p>
            ))}
        </div>
    );
};

export default function Analytics() {
    const [data, setData] = useState({
        kpis: { totalRevenue: 0, totalOrders: 0, uniqueCustomers: 0, avgOrderValue: 0 },
        monthlyData: [],
        categoryData: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            console.log('[Analytics] Fetching dynamic data...');
            const result = await getAnalyticsData();
            console.log('[Analytics] Data received:', result);
            setData({
                kpis: result.kpis || { totalRevenue: 0, totalOrders: 0, uniqueCustomers: 0, avgOrderValue: 0 },
                monthlyData: result.monthlyData || [],
                categoryData: result.categoryData || []
            });
            setError(null);
        } catch (err) {
            console.error('[Analytics] Error fetching data:', err);
            setError('Failed to load analytics data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();

        // Real-time updates when new CSV is uploaded
        const socket = io('http://localhost:5000', { withCredentials: true });
        socket.on('salesUpdated', () => {
            console.log('[Analytics] Real-time update received');
            fetchAnalytics();
        });

        return () => socket.disconnect();
    }, [fetchAnalytics]);

    const formatCurr = (val) => `$${Number(val || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    const formatNum = (val) => Number(val || 0).toLocaleString();

    if (loading && !data.monthlyData.length) {
        return (
            <div className="p-6 flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 flex flex-col gap-6 max-w-screen-2xl mx-auto">
            <div>
                <h1 className="text-xl font-black text-white flex items-center gap-3">
                    Analytics Overview
                    {loading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">Detailed financial and sales performance metrics</p>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/40 p-3 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPI label="Total Revenue"    value={formatCurr(data.kpis.totalRevenue)} trend="" up={true} icon={DollarSign}  color="#6366f1" />
                <KPI label="Total Records"    value={formatNum(data.kpis.totalOrders)}   trend="" up={true} icon={ShoppingBag} color="#10b981" />
                <KPI label="Unique Customers" value={formatNum(data.kpis.uniqueCustomers)} trend="" up={true} icon={Users}        color="#8b5cf6" />
                <KPI label="Avg Order Value"  value={formatCurr(data.kpis.avgOrderValue)} trend="" up={true} icon={TrendingUp}     color="#f59e0b" />
            </div>

            {/* Revenue + Expenses area chart */}
            <div className="rounded-2xl bg-[#0d1526] border border-[#1a2540] p-5 relative min-h-[350px]">
                <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">
                    Revenue vs Expenses Trend
                </h2>
                {data.monthlyData.length === 0 && !loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">No data available</div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={data.monthlyData}>
                            <defs>
                                <linearGradient id="rev_analytics" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="exp_analytics" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
                            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={60} />
                            <Tooltip content={<TT />} />
                            <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 11 }} />
                            <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#6366f1" fill="url(#rev_analytics)" strokeWidth={2} />
                            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" fill="url(#exp_analytics)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Profit bar chart + category breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#0d1526] border border-[#1a2540] p-5 relative min-h-[300px]">
                    <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">Monthly Net Profit</h2>
                    {data.monthlyData.length === 0 && !loading ? (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">No data available</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={230}>
                            <BarChart data={data.monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1a2540" />
                                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} width={60} />
                                <Tooltip content={<TT />} />
                                <Bar dataKey="profit" name="Net Profit" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="rounded-2xl bg-[#0d1526] border border-[#1a2540] p-5 relative min-h-[300px]">
                    <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">Top Category Revenue Share</h2>
                    {data.categoryData.length === 0 && !loading ? (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">No data available</div>
                    ) : (
                        <div className="space-y-3 mt-2 pr-2 overflow-y-auto max-h-[230px] custom-scrollbar">
                            {data.categoryData.map(c => (
                                <div key={c.name}>
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span className="font-semibold">{c.name}</span>
                                        <span>{c.value}% ({formatCurr(c.revenue)})</span>
                                    </div>
                                    <div className="w-full bg-[#1a2540] rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full bg-indigo-500 transition-all duration-700"
                                            style={{ width: `${Math.min(c.value, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
