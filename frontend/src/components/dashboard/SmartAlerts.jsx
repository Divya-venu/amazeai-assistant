import React from 'react';
import { Bell, ShieldAlert } from 'lucide-react';

const SmartAlerts = ({ alerts }) => {
    const hasAlerts = alerts && alerts.length > 0;

    return (
        <div className="glass-card rounded-[2.5rem] p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white tracking-tight">Smart Alerts</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Real-time Risk Monitoring</p>
                    </div>
                </div>
                {hasAlerts && (
                    <span className="px-3 py-1 bg-rose-500 text-white text-[10px] font-black rounded-full animate-pulse uppercase">
                        {alerts.length} Critical
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                {hasAlerts ? (
                    alerts.map((alert, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-start gap-4 group">
                            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0 group-hover:scale-110 transition-transform">
                                <ShieldAlert size={20} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white mb-1">Anomaly Detected</h4>
                                <p className="text-[10px] text-gray-500 leading-relaxed">
                                    Revenue of <span className="text-rose-400">${alert.revenue.toLocaleString()}</span> on {new Date(alert.date).toLocaleDateString()} deviates significantly from the norm.
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 h-full">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <ShieldAlert size={40} className="text-gray-500" strokeWidth={1} />
                        </div>
                        <h4 className="text-white font-bold mb-2">No active alerts</h4>
                        <p className="text-xs text-gray-500 max-w-[180px]">Your business operations are running smoothly without any critical anomalies.</p>
                    </div>
                )}
            </div>

            <div className="mt-8">
                <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-gray-400 text-xs font-black hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest">
                    View Alert History
                </button>
            </div>
        </div>
    );
};

export default SmartAlerts;
