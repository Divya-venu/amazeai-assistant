import React, { useState } from 'react';
import { Sparkles, Brain, Zap, TrendingUp, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const SAMPLE_INSIGHTS = [
    { title: 'Revenue surge detected', desc: 'March 2026 shows a 21% spike vs February. Electronics and Clothing categories driving growth.', type: 'positive' },
    { title: 'Expense ratio improving', desc: 'Cost-to-revenue ratio dropped from 62% to 53% — efficiency gains across supply chain.', type: 'positive' },
    { title: 'Customer retention risk', desc: 'Repeat purchase rate declined 8% in Feb–Mar. Consider a loyalty program campaign.', type: 'warning' },
    { title: 'Seasonal pattern identified', desc: 'Q4 consistently outperforms Q1 by ~40%. Stock up on Electronics in Oct–Nov.', type: 'info' },
];

const Badge = ({ type }) => {
    const map = {
        positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning:  'bg-amber-500/10  text-amber-400  border-amber-500/20',
        info:     'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    };
    const label = { positive: 'Opportunity', warning: 'Risk', info: 'Insight' };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[type]}`}>
            {label[type]}
        </span>
    );
};

export default function AIInsights() {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer]     = useState('');
    const [loading, setLoading]   = useState(false);

    const ask = async (e) => {
        e.preventDefault();
        if (!question.trim() || loading) return;
        setLoading(true);
        setAnswer('');
        try {
            const response = await sendAIChatMessage(question);
            setAnswer(response.reply || 'No response received.');
        } catch (error) {
            setAnswer('Unable to reach the AI backend. Make sure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 flex flex-col gap-6 max-w-screen-2xl mx-auto">
            <div>
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-indigo-400" /> AI Insights
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">LLM-powered analysis of your business data</p>
            </div>

            {/* Ask AI */}
            <div className="rounded-2xl bg-[#0d1526] border border-indigo-500/20 p-5">
                <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Brain size={14} /> Ask the AI
                </h2>
                <form onSubmit={ask} className="flex gap-2">
                    <input
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        placeholder="e.g. Why did revenue drop in January?"
                        className="flex-1 bg-[#070c18] border border-[#1a2540] focus:border-indigo-500/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading || !question.trim()}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                        {loading ? 'Thinking...' : 'Ask'}
                    </button>
                </form>
                {answer && (
                    <div className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                        {answer}
                    </div>
                )}
            </div>

            {/* Pre-computed insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {SAMPLE_INSIGHTS.map((insight, i) => (
                    <div key={i} className="rounded-2xl bg-[#0d1526] border border-[#1a2540] p-5 hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-white">{insight.title}</h3>
                            <Badge type={insight.type} />
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{insight.desc}</p>
                    </div>
                ))}
            </div>

            {/* Tip */}
            <div className="rounded-2xl bg-indigo-600/5 border border-indigo-500/20 p-4 flex items-start gap-3">
                <CheckCircle size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-300">
                    Upload a CSV on the <strong>Dashboard</strong> page to generate live AI insights from your actual business data.
                </p>
            </div>
        </div>
    );
}
