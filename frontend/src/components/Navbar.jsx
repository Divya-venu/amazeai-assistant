import React, { useState } from 'react';
import { Search, Bell, User, Activity, Command } from 'lucide-react';

const Navbar = () => {
    const [activeFilter, setActiveFilter] = useState('All');

    const suggestions = [
        "Revenue last 30 days",
        "Top selling products",
        "Profit trends",
        "Sales by country"
    ];

    return (
        <nav className="glass-nav sticky top-0 z-50 px-8 py-3">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex items-center justify-between gap-12">
                    {/* Brand Section */}
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <div className="relative bg-[#030712] p-2.5 rounded-xl border border-white/10 shadow-2xl">
                                <Activity className="text-white" size={22} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-white tracking-tighter leading-none">AI BIZ</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Enterprise</span>
                        </div>
                    </div>

                    {/* Search & Suggestions Center */}
                    <div className="hidden lg:flex flex-col flex-1 max-w-3xl pt-1">
                        <div className="relative group w-full">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Search className="text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search insights, revenue, products, forecasts..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-full py-3.5 pl-13 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.06] transition-all focus:ring-4 focus:ring-indigo-500/10"
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                <span className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                                    <Command size={10} /> K
                                </span>
                            </div>
                        </div>
                        
                        {/* Shortcut Suggestions */}
                        <div className="flex items-center gap-5 mt-2.5 px-6">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest whitespace-nowrap">Popular:</span>
                            <div className="flex items-center gap-4 overflow-hidden">
                                {suggestions.map((text, i) => (
                                    <button 
                                        key={text} 
                                        className="text-[11px] font-bold text-gray-500 hover:text-indigo-400 transition-colors whitespace-nowrap"
                                    >
                                        {text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Action Area */}
                    <div className="flex items-center gap-8">
                        {/* Time Period Toggles */}
                        <div className="hidden md:flex bg-white/[0.03] rounded-full p-1 border border-white/10">
                            {['7d', '30d', '90d', 'All'].map((v) => (
                                <button 
                                    key={v} 
                                    onClick={() => setActiveFilter(v)}
                                    className={`px-5 py-2 rounded-full text-xs font-black transition-all uppercase tracking-widest
                                        ${activeFilter === v 
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {v}
                                </button>
                            ))}
                        </div>

                        {/* Status Indicator */}
                        <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-emerald-500/[0.03] rounded-full border border-emerald-500/20 group hover:border-emerald-500/40 transition-colors">
                            <div className="relative">
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                                <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full blur-[2px] animate-ping opacity-75" />
                            </div>
                            <span className="text-[11px] font-black text-emerald-500/80 uppercase tracking-widest leading-none whitespace-nowrap">Live Data Connected</span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <button className="relative p-2.5 bg-white/[0.03] border border-white/10 rounded-xl hover:bg-white/[0.08] hover:border-white/20 transition-all group">
                                <Bell size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#030712] shadow-sm"></span>
                            </button>
                            
                            <button className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-white/20 transition-all group">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/20">
                                    <div className="w-full h-full rounded-[11px] bg-[#030712] flex items-center justify-center">
                                        <User size={16} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                                    </div>
                                </div>
                                <div className="hidden flex-col items-start leading-none gap-1">
                                    <span className="text-[11px] font-black text-white uppercase tracking-tighter">Admin</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
