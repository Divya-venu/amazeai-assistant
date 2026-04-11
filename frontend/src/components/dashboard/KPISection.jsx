import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, ShoppingCart, Percent, BrainCircuit, Activity, ShieldCheck, Zap } from 'lucide-react';
import Sparkline from './Sparkline';

const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(val);
};

const DEFAULT_COLOR = '#8b5cf6';
const COLOR_PALETTE = ['#10b981', '#f43f5e', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ec4899'];

const METRIC_ICONS = {
    revenue: DollarSign,
    price: DollarSign,
    cost: ShoppingCart,
    expenses: ShoppingCart,
    profit: TrendingUp,
    margin: Percent,
    quantity: Zap,
    count: Zap,
    orders: Activity
};

const getIconForMetric = (name) => {
    const lower = name.toLowerCase();
    for (const [key, icon] of Object.entries(METRIC_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return Activity;
};

// Metric Details are now computed dynamically inside the component based on the API payload

const KPISection = ({ summary, insights, loading }) => {
    const [pulse, setPulse] = useState(false);
    const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setPulse(p => !p), 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (summary?.lastUpdated) {
            const updateTimer = setInterval(() => {
                const diff = Math.floor((new Date() - new Date(summary.lastUpdated)) / 1000);
                setSecondsSinceUpdate(Math.max(0, diff));
            }, 1000);
            return () => clearInterval(updateTimer);
        }
    }, [summary?.lastUpdated]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-3xl bg-white bg-opacity-5 border border-white border-opacity-5 p-6 h-48 flex flex-col justify-center items-center">
                        <Activity className="text-white opacity-10 animate-spin" size={24} />
                    </div>
                ))}
            </div>
        );
    }

    // Dynamic metrics from backend
    const metrics = summary ? Object.keys(summary).filter(k => k !== 'lastUpdated' && k !== 'recordCount') : [];
    const hasData = metrics.length > 0;

    const displayMetrics = hasData ? metrics : ['revenue', 'expenses', 'profit', 'margin'];
    const kpiData = summary || {};

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {displayMetrics.map((key, index) => {
                const value = kpiData[key] || 0;
                const Icon = getIconForMetric(key);
                const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
                const trend = insights?.[`${key}Trend`] || "--";
                const insightText = hasData ? (insights?.[`${key}Insight`] || insights?.marginInsight) : "Upload CSV to activate dashboard";
                const isGrowth = !trend.startsWith("-");

                return (
                    <div
                        key={key}
                        className="group relative overflow-hidden rounded-[2.5rem] bg-[#030712] bg-opacity-40 backdrop-blur-xl border border-white border-opacity-5 p-6
                            hover:bg-white hover:bg-opacity-5 hover:border-white hover:border-opacity-10 transition-all duration-500 cursor-default shadow-2xl"
                    >
                        {/* Glow Accent */}
                        <div 
                            className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"
                            style={{ backgroundColor: color }}
                        />

                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="relative">
                                <div className="absolute -inset-2 rounded-xl blur-lg opacity-20" style={{ backgroundColor: color }}></div>
                                <div className="relative w-11 h-11 rounded-xl bg-white bg-opacity-5 border border-white border-opacity-10 flex items-center justify-center">
                                    <Icon size={20} style={{ color: color }} />
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg">
                                    <BrainCircuit size={10} className="text-gray-500" />
                                    <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">AI Sync</span>
                                </div>
                                <span className="text-[7px] font-bold text-gray-600 uppercase tracking-tighter">
                                    {hasData ? `Verified ${secondsSinceUpdate}s ago` : (loading ? 'Processing data...' : 'Waiting for Data')}
                                </span>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="space-y-1 mb-6">
                            <h3 className="text-xl font-black text-white tracking-tighter leading-none capitalize">
                                {typeof value === 'number' && !key.toLowerCase().includes('margin') && !key.toLowerCase().includes('percent') 
                                    ? formatCurrency(value) 
                                    : (typeof value === 'number' ? `${value.toFixed(1)}%` : value)}
                            </h3>
                            <div className="flex items-center gap-2 pt-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md
                                    ${isGrowth ? 'text-emerald-400 bg-emerald-400 bg-opacity-10' : 'text-rose-400 bg-rose-400 bg-opacity-10'}`}>
                                    {trend}
                                </span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide capitalize">{key.replace(/[A-Z]/g, ' $1')}</span>
                            </div>
                        </div>

                        {/* Footer / Confidence */}
                        <div className="mt-auto space-y-4">
                            <div className="h-8 w-full opacity-40 group-hover:opacity-70 transition-opacity">
                                <Sparkline 
                                    data={[20, 25, 30, 28, 35, 40, 45]} 
                                    color={color} 
                                    width={200} 
                                    height={32} 
                                />
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-white border-opacity-5">
                                <div className="flex items-center gap-1.5 text-indigo-400">
                                    <ShieldCheck size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-wider">{insightText}</span>
                                </div>
                                <Activity size={12} className={`text-gray-600 ${pulse ? 'scale-110' : 'scale-100'} transition-transform`} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KPISection;
