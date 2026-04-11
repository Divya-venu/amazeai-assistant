import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Info, ShieldCheck } from 'lucide-react';

const AIBusinessReport = ({ report, loading, summary }) => {
    if (loading) {
        return (
            <div className="dashboard-card p-8 rounded-[2rem] bg-indigo-600/5 border border-indigo-500/20 flex flex-col items-center justify-center min-h-[300px] animate-pulse">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                    <PieChart className="text-indigo-400 animate-spin" size={24} />
                </div>
                <p className="text-indigo-300 font-medium tracking-wide">AI Analyzing Trends...</p>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="dashboard-card p-8 rounded-[2rem] bg-gray-800/20 border border-gray-700/30 flex flex-col items-center justify-center min-h-[300px] text-center">
                <ShieldCheck className="text-gray-600 mb-4" size={40} />
                <h3 className="text-white font-bold text-lg mb-2">Detailed Business Report</h3>
                <p className="text-gray-500 text-sm max-w-[200px]">Upload your datasets to generate a full financial breakdown.</p>
            </div>
        );
    }

    const metrics = [
        { label: 'Total Revenue', value: report.totalRevenue, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Total Expenses', value: report.totalExpenses, icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        { label: 'Net Profit', value: report.netProfit, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Profit Margin', value: report.profitMargin, icon: PieChart, color: 'text-amber-400', bg: 'bg-amber-500/10' }
    ];

    return (
        <div className="dashboard-card p-8 rounded-[2rem] bg-gray-800/20 border border-gray-700/30 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                    <PieChart className="text-indigo-500" />
                    AI Business Report
                </h3>
                <div className="px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest border border-indigo-500/20">
                    Live Analysis
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {metrics.map((m, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-gray-900/40 border border-gray-700/30 hover:border-indigo-500/30 transition-all group">
                        <div className={`w-8 h-8 ${m.bg} ${m.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <m.icon size={16} />
                        </div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{m.label}</div>
                        <div className="text-xl font-black text-white">{m.value}</div>
                    </div>
                ))}
            </div>

            <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Info className="text-indigo-400" size={18} />
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed italic">
                        "{summary}"
                    </p>
                </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2">
                <span>Top Category:</span>
                <span className="text-indigo-400">{report.topCategory}</span>
            </div>
        </div>
    );
};

export default AIBusinessReport;
