import React from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Zap } from 'lucide-react';

const AnomalyCards = ({ anomalies }) => {
  if (!anomalies || anomalies.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Zap className="text-red-500 fill-red-500/20" size={24} />
        <h3 className="text-2xl font-bold text-white tracking-tight">Active Anomalies</h3>
        <span className="bg-red-500/20 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-500/30">
          ACTION REQUIRED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {anomalies.map((item, idx) => (
          <div key={idx} className="bg-slate-900 p-6 rounded-3xl border border-red-500/20 shadow-xl relative overflow-hidden group hover:border-red-500/50 transition-all">
            {/* Visual background indicator */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[80px] -mr-16 -mt-16 pointer-events-none" />
            
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
                {item.type === 'Spike' ? (
                  <TrendingUp className="text-red-500" size={20} />
                ) : (
                   <AlertTriangle className="text-red-500" size={20} />
                )}
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase">{item.date}</span>
            </div>

            <h4 className="text-white font-bold mb-1">{item.type} Detected</h4>
            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              {item.message}
            </p>

            <div className="flex items-center gap-2 mt-auto">
                <span className="text-xs font-bold text-slate-500">Value:</span>
                <span className="text-sm font-black text-white">${item.value || item.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnomalyCards;
