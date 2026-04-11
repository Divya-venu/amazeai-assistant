import React from 'react';
import { DollarSign, ShoppingCart, TrendingUp, PieChart } from 'lucide-react';

const StatsCard = ({ title, value, percentage, icon: Icon, color }) => {
    const colors = {
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
        purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    };

    return (
        <div className="glass-card p-6 rounded-3xl group">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl border ${colors[color]} group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase
                    ${percentage.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {percentage}
                </div>
            </div>
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-2xl font-black text-white tracking-tight">{value}</h3>
                <p className="text-[10px] text-gray-600 mt-2 font-medium">vs last period</p>
            </div>
        </div>
    );
};

const StatsCards = ({ data }) => {
    const stats = [
        { 
            title: 'Total Revenue', 
            value: data ? `$${Number(data.totalRevenue || 0).toLocaleString()}` : '$0', 
            percentage: '+12.5%', 
            icon: DollarSign, 
            color: 'emerald' 
        },
        { 
            title: 'Total Expenses', 
            value: data ? `$${Number(data.totalExpenses || 0).toLocaleString()}` : '$0', 
            percentage: '+2.4%', 
            icon: ShoppingCart, 
            color: 'rose' 
        },
        { 
            title: 'Net Profit', 
            value: data ? `$${Number(data.netProfit || 0).toLocaleString()}` : '$0', 
            percentage: '+18.2%', 
            icon: TrendingUp, 
            color: 'indigo' 
        },
        { 
            title: 'Profit Margin', 
            value: data ? (typeof data.profitMargin === 'string' ? data.profitMargin : `${(data.profitMargin || 0).toFixed(2)}%`) : '0%', 
            percentage: '+3.1%', 
            icon: PieChart, 
            color: 'purple' 
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, idx) => <StatsCard key={idx} {...s} />)}
        </div>
    );
};


export default StatsCards;
