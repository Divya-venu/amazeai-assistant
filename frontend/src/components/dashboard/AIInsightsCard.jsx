import React from 'react';
import { Sparkles, BrainCircuit, Loader2 } from 'lucide-react';

const AIInsightsCard = ({ insights, loading, onGenerate }) => {
    return (
        <div className="dashboard-card glass-indigo p-8 rounded-3xl h-full flex flex-col">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="p-3 bg-indigo-500/20 rounded-2xl mb-4">
                    <BrainCircuit className="text-indigo-400 w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">AI Financial Insights</h3>
                <p className="text-gray-400 text-sm max-w-xs">
                    Smart analysis of your business performance powered by Advanced AI models.
                </p>
            </div>

            <div className="flex-1 overflow-y-auto mb-8 min-h-[200px]">
                {insights ? (
                    <div className="flex flex-col gap-3 bg-gray-900/40 border border-gray-700/50 p-6 rounded-2xl text-gray-200 text-sm">
                        {typeof insights === 'string' ? (
                            <div className="whitespace-pre-line leading-relaxed">{insights}</div>
                        ) : (
                            <>
                                {insights.revenueInsight && <p>📈 <strong>Revenue:</strong> {insights.revenueInsight}</p>}
                                {insights.expenseInsight && <p>📉 <strong>Expenses:</strong> {insights.expenseInsight}</p>}
                                {insights.profitInsight && <p>💰 <strong>Profit:</strong> {insights.profitInsight}</p>}
                                {insights.marginInsight && <p>🤖 <strong>AI:</strong> {insights.marginInsight}</p>}
                                {Object.values(insights).length === 0 && <p>No specific insights available.</p>}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-gray-700/50 rounded-2xl">
                        <Sparkles className="w-8 h-8 text-gray-600 mb-3" />
                        <p className="text-gray-500 text-sm italic">
                            Click the button below to generate deep financial analysis.
                        </p>
                    </div>
                )}
            </div>

            <button
                onClick={onGenerate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-indigo-800 disabled:to-indigo-800 text-white px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-widest shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-[0.98]"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Data...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        Generate AI Insights
                    </>
                )}
            </button>
        </div>
    );
};

export default AIInsightsCard;
