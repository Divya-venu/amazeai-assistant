import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, BarChart } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const ChatBox = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI Business Assistant. Try asking, "Analyze my shop sales performance" or ask a general question.', chartData: null }
    ]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage, chartData: null }]);
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5002/api/chat', { message: userMessage });
            const data = response.data;
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: data.reply,
                chartData: data.chartData 
            }]);
        } catch (error) {
            console.error('[ChatBox] Error sending message:', error);
            const errorMessage = error.response?.data?.error || 'Could not connect to the OpenClaw backend.';
            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage, chartData: null }]);
        } finally {
            setLoading(false);
        }
    };

    const renderChart = (chartConfig) => {
        if (!chartConfig) return null;
        
        const data = {
            labels: chartConfig.labels || [],
            datasets: [
                {
                    label: chartConfig.datasetLabel || 'Data',
                    data: chartConfig.data || [],
                    backgroundColor: 'rgba(56, 189, 248, 0.5)',
                    borderColor: 'rgba(56, 189, 248, 1)',
                    borderWidth: 1,
                }
            ]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: '#9ca3af' } },
            },
            scales: {
                x: { ticks: { color: '#9ca3af' }, grid: { display: false } },
                y: { ticks: { color: '#9ca3af' }, grid: { color: '#334155' } }
            }
        };

        return (
            <div className="mt-4 p-4 bg-slate-800 rounded-xl border border-slate-700 h-[250px] w-full">
                <div className="flex items-center gap-2 mb-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                    <BarChart size={14} /> AI Visualization
                </div>
                <div className="w-full h-[85%]">
                    {chartConfig.type === 'line' ? (
                        <Line data={data} options={options} />
                    ) : (
                        <Bar data={data} options={options} />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto my-8 flex flex-col h-[80vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* Header */}
            <div className="bg-slate-800/80 backdrop-blur border-b border-slate-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-500/20 rounded-lg">
                        <Bot className="text-sky-400 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg">OpenClaw Business Agent</h2>
                        <p className="text-sky-400 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-900/50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 md:px-6 relative shadow-lg
                            ${msg.role === 'user' 
                                ? 'bg-sky-600 text-white rounded-br-sm' 
                                : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'}`}>
                            
                            <div className="flex items-center mb-2 opacity-70 text-xs uppercase font-bold tracking-wider">
                                {msg.role === 'user' ? (
                                    <><User size={12} className="mr-1" /> You</>
                                ) : (
                                    <><Bot size={12} className="mr-1" /> AI Agent</>
                                )}
                            </div>
                            
                            <div className="whitespace-pre-line leading-relaxed text-sm">
                                {msg.content}
                            </div>
                            
                            {/* Render Chart if AI returned chart JSON */}
                            {msg.chartData && renderChart(msg.chartData)}
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-sm p-4 text-slate-400 flex items-center gap-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                            <span className="text-sm">Agent analyzing data...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 bg-slate-800 border-t border-slate-700">
                <div className="relative flex items-center">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about sales, products, or general knowledge..."
                        className="w-full bg-slate-900 text-white placeholder-slate-500 border border-slate-700 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl py-4 pl-4 pr-16 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 p-2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
                    >
                        <Send size={20} className={loading ? 'opacity-50' : ''} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatBox;
