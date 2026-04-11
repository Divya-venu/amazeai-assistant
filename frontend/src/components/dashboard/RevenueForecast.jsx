import React from 'react';
import { 
    ResponsiveContainer, LineChart, Line, 
    XAxis, YAxis, Tooltip, Area, AreaChart,
    CartesianGrid 
} from 'recharts';
import { Target, TrendingUp } from 'lucide-react';

const mockData = [
    { name: 'Jan', value: 100000 },
    { name: 'Feb', value: 120000 },
    { name: 'Mar', value: 150000 },
    { name: 'Apr', value: 380000 },
    { name: 'May', value: 340000 },
    { name: 'Jun', value: 180000 },
    { name: 'Jul', value: 450000 },
    { name: 'Aug', value: 520000 },
];

const RevenueForecast = ({ data: aiForecastData }) => {
    const chartData = aiForecastData ? aiForecastData.map(d => ({ name: d.ds, value: d.revenue })) : mockData;
    const predictedValue = aiForecastData && aiForecastData.length > 0 ? aiForecastData[aiForecastData.length - 1].revenue : 9853582.46;

    return (
        <div className="glass-card rounded-[2.5rem] p-8 h-[500px] flex flex-col relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3 text-sky-400">
                    <Target size={24} />
                    <div>
                        <h3 className="text-lg font-black text-white tracking-tight">AI Revenue Forecast</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">ML Regression Analysis</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span className="text-xs font-black text-emerald-400">{aiForecastData ? "+Prophet" : "+258.76%"}</span>
                </div>
            </div>

            {/* Big Number */}
            <div className="mb-8">
                <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1">Predicted Revenue</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white tracking-tighter">${predictedValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    <span className="text-gray-500 text-sm font-medium">Expected Revenue based on ML</span>
                </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <defs>
                            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                            dy={10}
                        />
                        <YAxis hide />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#0f172a', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'
                            }}
                            itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#3b82f6" 
                            strokeWidth={4} 
                            dot={{ fill: '#3b82f6', stroke: '#fff', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 8, fill: '#3b82f6', stroke: '#fff', strokeWidth: 3 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueForecast;
