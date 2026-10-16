import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    Brain,
    Zap,
    CheckCircle,
    Loader2
} from 'lucide-react';
import axios from 'axios';

const Badge = ({ type }) => {
    const map = {
        positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        info: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    };

    const label = {
        positive: 'Opportunity',
        warning: 'Attention',
        info: 'Insight',
    };

    return (
        <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[type]}`}
        >
            {label[type]}
        </span>
    );
};

export default function AIInsights() {

    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    // Dynamic business insights
    const [insights, setInsights] = useState(null);
    const [insightsLoading, setInsightsLoading] = useState(true);

    // -----------------------------------------
    // Load AI business insights
    // -----------------------------------------
    useEffect(() => {
        const loadInsights = async () => {
            try {
                setInsightsLoading(true);

                const response = await axios.post(
                    'http://localhost:5000/api/insights',
                    {}
                );

                console.log('✅ AI Insights:', response.data);

                setInsights(response.data);

            } catch (error) {
                console.error('❌ Failed to load AI insights:', error);
            } finally {
                setInsightsLoading(false);
            }
        };

        loadInsights();
    }, []);

    // -----------------------------------------
    // Ask AI
    // -----------------------------------------
    const sendAIChatMessage = async (message) => {

        const response = await axios.post(
            'http://localhost:5000/api/ai-chat',
            { message }
        );

        return response.data;
    };

    const ask = async (e) => {

        e.preventDefault();

        if (!question.trim() || loading) return;

        setLoading(true);
        setAnswer('');

        try {

            const response = await sendAIChatMessage(question);

            setAnswer(
                response.reply || 'No response received.'
            );

        } catch (error) {

            console.error('AI Chat Error:', error);

            setAnswer(
                'Unable to reach the AI backend. Make sure the server is running.'
            );

        } finally {

            setLoading(false);

        }
    };

    // -----------------------------------------
    // Format currency
    // -----------------------------------------
    const formatCurrency = (value) => {

        if (value === undefined || value === null) {
            return '₹0';
        }

        const numericValue = Number(
            String(value).replace(/[^0-9.-]+/g, '')
        );

        return `₹${numericValue.toLocaleString('en-IN')}`;
    };

    // -----------------------------------------
    // Dynamic cards
    // -----------------------------------------
    const dynamicCards = insights?.report
    ? [
        {
            title: 'Revenue Trend',
            desc: `${insights.report.revenueTrend === 'upward'
            ? 'Revenue increased'
            : insights.report.revenueTrend === 'downward'
                ? 'Revenue decreased'
                : 'Revenue remained stable'
        } by ${Math.abs(
            parseFloat(insights.report.revenueGrowth || '0')
        )}% across the available months.`,
            type: insights.report.revenueTrend === 'downward'
                ? 'warning'
                : 'positive'
        },

        {
            title: 'Most Profitable Product',
            desc: `${insights.report.mostProfitableProduct || 'No product available'} generated ${insights.report.mostProfitableProductProfit || '₹0'} in profit.`,
            type: 'positive'
        },

        {
            title: 'Top Revenue Category',
            desc: `${insights.report.topCategory || 'No category available'} is currently the highest-revenue category.`,
            type: 'info'
        },

        {
            title: 'Profit Margin',
            desc: `The business generated ${formatCurrency(insights.report.netProfit)} net profit from ${formatCurrency(insights.report.totalRevenue)} revenue, giving a ${insights.report.profitMargin} margin.`,
            type: 'positive'
        }
    ]
    : [];

    return (
        <div className="p-6 flex flex-col gap-6 max-w-screen-2xl mx-auto">

            {/* Header */}
            <div>
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                    <Sparkles size={20} className="text-indigo-400" />
                    AI Insights
                </h1>

                <p className="text-xs text-gray-500 mt-0.5">
                    LLM-powered analysis of your business data
                </p>
            </div>

            {/* Ask AI */}
            <div className="rounded-2xl bg-[#0d1526] border border-indigo-500/20 p-5">

                <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Brain size={14} />
                    Ask the AI
                </h2>

                <form onSubmit={ask} className="flex gap-2">

                    <input
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        placeholder="e.g. What is my total revenue?"
                        className="flex-1 bg-[#070c18] border border-[#1a2540] focus:border-indigo-500/60 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none transition-all"
                    />

                    <button
                        type="submit"
                        disabled={loading || !question.trim()}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                    >

                        {loading
                            ? <Loader2 size={16} className="animate-spin" />
                            : <Zap size={16} />
                        }

                        {loading ? 'Thinking...' : 'Ask'}

                    </button>

                </form>

                {answer && (
                    <div className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                        {answer}
                    </div>
                )}

            </div>

            {/* Dynamic Business Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {insightsLoading ? (

                    <div className="lg:col-span-2 rounded-2xl bg-[#0d1526] border border-[#1a2540] p-6 flex items-center justify-center gap-3 text-gray-400">

                        <Loader2
                            size={18}
                            className="animate-spin text-indigo-400"
                        />

                        Loading business insights...

                    </div>

                ) : dynamicCards.length > 0 ? (

                    dynamicCards.map((insight, i) => (

                        <div
                            key={i}
                            className="rounded-2xl bg-[#0d1526] border border-[#1a2540] p-5 hover:border-indigo-500/30 transition-all"
                        >

                            <div className="flex items-center justify-between mb-2">

                                <h3 className="text-sm font-bold text-white">
                                    {insight.title}
                                </h3>

                                <Badge type={insight.type} />

                            </div>

                            <p className="text-xs text-gray-400 leading-relaxed">
                                {insight.desc}
                            </p>

                        </div>

                    ))

                ) : (

                    <div className="lg:col-span-2 rounded-2xl bg-[#0d1526] border border-[#1a2540] p-5 text-sm text-gray-400">
                        No business insights are available yet.
                    </div>

                )}

            </div>

            {/* AI Recommendations */}
            {insights?.recommendations?.length > 0 && (

                <div className="rounded-2xl bg-[#0d1526] border border-[#1a2540] p-5">

                    <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">

                        <Sparkles
                            size={15}
                            className="text-indigo-400"
                        />

                        AI Recommendations

                    </h2>

                    <div className="space-y-3">

                        {insights.recommendations.map(
                            (recommendation, index) => (

                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10"
                                >

                                    <CheckCircle
                                        size={15}
                                        className="text-indigo-400 mt-0.5 shrink-0"
                                    />

                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        {recommendation}
                                    </p>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}

            {/* Summary */}
            {insights?.summary && (

                <div className="rounded-2xl bg-indigo-600/5 border border-indigo-500/20 p-4 flex items-start gap-3">

                    <CheckCircle
                        size={16}
                        className="text-indigo-400 mt-0.5 shrink-0"
                    />

                    <p className="text-xs text-indigo-300">
                        {insights.summary}
                    </p>

                </div>

            )}

        </div>
    );
}