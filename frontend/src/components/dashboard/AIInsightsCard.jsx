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
    <div className="whitespace-pre-line leading-relaxed">
        {insights}
    </div>
) : (
    <>
        {insights.report && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">

                <div>
                    <p className="text-gray-500 text-xs">Revenue</p>
                    <p className="text-white font-bold text-lg">
                        ₹{Number(String(insights.report.totalRevenue).replace(/[^0-9.-]/g, '')).toLocaleString('en-IN')}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500 text-xs">Expenses</p>
                    <p className="text-white font-bold text-lg">
                        ₹{Number(String(insights.report.totalExpenses).replace(/[^0-9.-]/g, '')).toLocaleString('en-IN')}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500 text-xs">Net Profit</p>
                    <p className="text-emerald-400 font-bold text-lg">
                        ₹{Number(String(insights.report.netProfit).replace(/[^0-9.-]/g, '')).toLocaleString('en-IN')}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500 text-xs">Profit Margin</p>
                    <p className="text-white font-bold text-lg">
                        {insights.report.profitMargin}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500 text-xs">Top Category</p>
                    <p className="text-indigo-400 font-bold text-lg">
                        {insights.report.topCategory}
                    </p>
                </div>

            </div>
        )}

        {insights.summary && (
            <div className="mb-6">
                <h4 className="text-indigo-300 font-bold mb-2">
                    Executive Summary
                </h4>

                <p className="text-gray-300 leading-relaxed">
                    {insights.summary}
                </p>
            </div>
        )}

        {insights.recommendations?.length > 0 && (
            <div>
                <h4 className="text-indigo-300 font-bold mb-3">
                    AI Recommendations
                </h4>

                <ul className="space-y-3">
                    {insights.recommendations.map((recommendation, index) => (
                        <li
                            key={index}
                            className="text-gray-300 flex gap-2"
                        >
                            <span className="text-purple-400">•</span>
                            <span>{recommendation}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}
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
