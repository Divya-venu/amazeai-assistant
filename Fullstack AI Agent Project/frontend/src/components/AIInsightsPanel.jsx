import React from 'react';
import { Sparkles, Trophy, Lightbulb, TrendingUp } from 'lucide-react';

const AIInsightsPanel = ({ data }) => {
  if (!data) {
    return (
      <div className="h-full bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed flex flex-col items-center justify-center text-slate-500 text-center p-6">
        <Sparkles size={32} className="mb-4 opacity-20" />
        <p className="font-medium text-xs">Waiting for insights...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col h-full overflow-y-auto max-h-[450px] custom-scrollbar">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-amber-400" size={20} />
        <h3 className="text-xl font-bold text-white">AI Strategy</h3>
      </div>

      <div className="mb-6 pb-6 border-b border-slate-800">
        <p className="text-slate-300 text-sm italic leading-relaxed">
          "{data.summary}"
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Trophy size={12} className="text-indigo-500" />
            Key Insights
          </h4>
          <ul className="space-y-3">
            {data.insights.map((insight, i) => (
              <li key={i} className="text-sm text-slate-400 flex gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                {insight}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Lightbulb size={12} className="text-amber-500" />
            Recommendations
          </h4>
          <div className="space-y-2">
             {data.recommendations.map((rec, i) => (
              <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400/90 leading-relaxed group hover:border-amber-500/30 transition-colors">
                {rec}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPanel;
