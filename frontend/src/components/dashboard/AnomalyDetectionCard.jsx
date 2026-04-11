import React from 'react';
import { AlertTriangle, Clock, ChevronRight, AlertCircle } from 'lucide-react';

const AnomalyDetectionCard = ({ date, type, message, severity }) => {
    const isHighSeverity = severity === 'high';

    return (
        <div className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
            isHighSeverity 
            ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40 shadow-lg shadow-red-500/5' 
            : 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40 shadow-lg shadow-orange-500/5'
        } p-5 mb-4`}>
            {/* Glow effect */}
            <div className={`absolute -right-12 -top-12 w-24 h-24 blur-3xl rounded-full opacity-20 transition-opacity group-hover:opacity-40 ${
                isHighSeverity ? 'bg-red-500' : 'bg-orange-500'
            }`} />

            <div className="flex items-start gap-4">
                <div className={`shrink-0 p-3 rounded-xl ${
                    isHighSeverity ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                }`}>
                    {isHighSeverity ? <AlertCircle size={20} /> : <AlertTriangle size={20} />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                            isHighSeverity ? 'text-red-400' : 'text-orange-400'
                        }`}>
                            {type}
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-500 text-[10px] font-medium bg-gray-800/50 px-2 py-0.5 rounded-full border border-gray-700/50">
                            <Clock size={10} />
                            {date}
                        </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 group-hover:text-white transition-colors">
                        {message}
                    </p>

                    <button className={`flex items-center gap-2 text-xs font-bold transition-all px-4 py-2 rounded-lg border w-full justify-center ${
                        isHighSeverity 
                        ? 'text-red-400 border-red-500/20 hover:bg-red-500/10' 
                        : 'text-orange-400 border-orange-500/20 hover:bg-orange-500/10'
                    }`}>
                        View Details
                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnomalyDetectionCard;
