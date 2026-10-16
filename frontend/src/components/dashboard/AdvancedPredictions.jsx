import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Sparkles, Activity, AlertTriangle, BrainCircuit, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const AdvancedPredictions = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPredictions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:5000/api/forecast');

console.log('🔮 FORECAST API RESPONSE:', response.data);
console.log('Historical:', response.data.historical);
console.log('Dates:', response.data.dates);
console.log('Predictions:', response.data.predictions);
console.log('Trend:', response.data.trend);

setData(response.data);
        } catch (err) {
            console.error('❌ Prediction Fetch Error:', err);
            setError(err.response?.data?.error || 'Forecast engine is offline');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPredictions();
    }, []);

    if (loading) {
        return (
            <div className="glass-card rounded-[2.5rem] bg-white/5 border border-white/10 p-8 h-full flex flex-col gap-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="h-6 w-32 bg-white/10 rounded-lg" />
                    <div className="h-4 w-20 bg-white/5 rounded-lg" />
                </div>
                <div className="h-48 w-full bg-white/5 rounded-3xl" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-white/5 rounded-2xl" />
                    <div className="h-20 bg-white/5 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card rounded-[2.5rem] bg-white/5 border border-rose-500/20 p-8 h-full flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <AlertTriangle className="text-rose-400" size={32} />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg mb-1">Prediction Offline</h3>
                    <p className="text-gray-400 text-sm">{error}</p>
                </div>
                <button 
                    onClick={fetchPredictions}
                    className="mt-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
                >
                    Retry Analysis
                </button>
            </div>
        );
    }

    // Defensive check for data structure
    if (!data || !data.historical || !data.dates) {
        return (
            <div className="glass-card rounded-[2.5rem] bg-white/5 border border-amber-500/20 p-8 h-full flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Activity className="text-amber-400" size={32} />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg mb-1">Waiting for Data</h3>
                    <p className="text-gray-400 text-sm">Predictions require at least 2 days of historical sales data to generate a forecast.</p>
                </div>
                <button 
                    onClick={fetchPredictions}
                    className="mt-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
                >
                    Refresh Status
                </button>
            </div>
        );
    }

    // Merge historical and predicted data for the chart
    const historical = (data.historical || []).map(d => ({
        date: d.date,
        revenue: d.revenue,
        isForecast: false
    }));

    const forecast = (data.dates || []).map((d, index) => ({
        date: d,
        revenue: data.predictions ? data.predictions[index] : 0,
        isForecast: true
    }));

    const chartData = [...historical.slice(-7), ...forecast]; // Show last 7 days + forecast

    const isUpward = data.trend === 'upward';

    return (
        <div className="glass-card rounded-[2.5rem] bg-white/5 border border-white/10 p-8 h-full flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[100px] opacity-10 transition-colors duration-1000 ${isUpward ? 'bg-emerald-500' : 'bg-rose-500'}`} />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                        <Sparkles className="text-indigo-400" size={20} />
                    </div>
                    <div>
                        <h2 className="text-white font-black tracking-tight">Market Predictions</h2>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">AI Forecasting Engine</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">{data.confidence} Confidence</span>
                </div>
            </div>

            {/* Prediction Chart */}
            <div className="h-44 w-full relative group/chart z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isUpward ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={isUpward ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                            itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                            labelStyle={{ color: '#64748b', fontSize: '8px', marginBottom: '4px' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke={isUpward ? "#10b981" : "#f43f5e"} 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorRev)" 
                            strokeDasharray={({ payload }) => payload.isForecast ? "5 5" : "0"} 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-colors">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Growth Forecast</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-black ${isUpward ? 'text-emerald-400' : 'text-rose-400'} tracking-tighter`}>{data.growth}</span>
                        {isUpward ? <ArrowUpRight className="text-emerald-500" size={16} /> : <ArrowDownRight className="text-rose-500" size={16} />}
                    </div>
                </div>
                <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-colors">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Trend Signal</p>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white uppercase tracking-tight capitalize">{data.trend}</span>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isUpward ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </div>
                </div>
            </div>

            {/* Insight Box */}
            <div className="mt-auto p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3 relative z-10 transition-all group-hover:bg-indigo-500/10">
                <BrainCircuit className="text-indigo-400 mt-1" size={18} />
                <div className="space-y-1">
                    <p className="text-[11px] font-bold text-gray-300 leading-relaxed uppercase tracking-wider">AI Forecast Insight</p>
                    <p className="text-[10px] font-medium text-gray-500 leading-normal italic italic">
                        "{data.message || 'Waiting for trend signals'}. Growth is expected to peak around {data.dates[3] || 'the next window'} based on {data.historical?.length || 0}-day market regression."
                    </p>
                </div>
            </div>

            {/* Risk Indicator Footer */}
            {!isUpward && (
                <div className="mt-2 flex items-center gap-2 text-[9px] font-black text-rose-400 uppercase tracking-widest animate-pulse px-2">
                    <AlertTriangle size={12} />
                    <span>Downside risk detected in next 7-day window</span>
                </div>
            )}
        </div>
    );
};

export default AdvancedPredictions;
