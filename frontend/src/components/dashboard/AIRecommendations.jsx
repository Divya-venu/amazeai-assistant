import React from 'react';
import { Lightbulb, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

const AIRecommendations = ({ recommendations, loading }) => {
    if (loading) {
        return (
            <div className="dashboard-card p-8 rounded-[2rem] bg-amber-600/5 border border-amber-500/20 flex flex-col gap-4 animate-pulse h-full min-h-[400px]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-800 rounded-xl" />
                    <div className="h-6 w-40 bg-gray-800 rounded-lg" />
                </div>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-800/40 rounded-2xl border border-gray-700/30" />
                ))}
            </div>
        );
    }

    if (!recommendations || recommendations.length === 0) {
        return (
            <div className="dashboard-card p-8 rounded-[2rem] bg-gray-800/20 border border-gray-700/30 flex flex-col items-center justify-center min-h-[400px] text-center h-full">
                <Lightbulb className="text-gray-600 mb-4" size={40} />
                <h3 className="text-white font-bold text-lg mb-2">AI Strategy Suggestions</h3>
                <p className="text-gray-500 text-sm max-w-[250px]">Upload data and generate insights to unlock personalized AI strategy recommendations.</p>
            </div>
        );
    }

    return (
        <div className="dashboard-card p-8 rounded-[2rem] bg-gray-800/20 border border-gray-700/30 shadow-xl h-full flex flex-col">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-xl">
                        <Zap className="text-amber-400 w-6 h-6 fill-amber-400/20" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">AI Strategy Recommendations</h3>
                </div>
                <span className="bg-gray-700/50 text-gray-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    Next Steps
                </span>
            </div>

            <div className="space-y-4">
                {recommendations.map((rec, index) => (
                    <div key={index} className="group relative flex items-start gap-5 p-5 bg-gray-900/40 border border-gray-700/30 rounded-2xl hover:border-amber-500/30 hover:bg-gray-800 transition-all cursor-default">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-amber-500 font-black border border-gray-700/30 group-hover:bg-amber-500 group-hover:text-black transition-all">
                            {index + 1}
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-200 text-sm leading-relaxed pr-4">
                                {rec}
                            </p>
                        </div>
                        <button className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight className="text-amber-500 w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex items-center justify-center">
                <button className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] hover:text-amber-400 transition-colors">
                    View Full Strategy Plan
                    <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default AIRecommendations;
