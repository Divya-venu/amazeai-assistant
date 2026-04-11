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
import { Bar, Line, Pie } from 'react-chartjs-2';

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
        { role: 'assistant', content: 'Hello! I am your AI Business Assistant. Ask me a question or request a chart (e.g., "Show me a chart of sales").', chartData: null }
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
            // Using the new explicit API endpoint
            const response = await axios.post('http://localhost:5000/api/chat', { message: userMessage });
            const data = response.data;
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: data.reply,
                chartData: data.chartData 
            }]);
        } catch (error) {
            console.error('[ChatBox] Error sending message:', error);
            const errorMessage = error.response?.data?.error || 'Could not connect to the backend.';
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
                    backgroundColor: 'rgba(99, 102, 241, 0.5)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1,
                }
            ]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: '#9ca3af' } },
                title: { display: false }
            },
            scales: {
                x: { ticks: { color: '#9ca3af' }, grid: { display: false } },
                y: { ticks: { color: '#9ca3af' }, grid: { color: '#374151' } }
            }
        };

        return (
            <div className="mt-4 p-4 bg-gray-900 rounded-xl border border-gray-700 h-[250px] w-full mt-2">
                <div className="flex items-center gap-2 mb-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <BarChart size={14} /> AI Generated Visualization
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
        <div className="max-w-4xl mx-auto my-8 flex flex-col h-[75vh] bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
            {/* Header */}
            <div className="bg-gray-900/80 backdrop-blur border-b border-gray-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Bot className="text-indigo-400 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-white font-bold text-lg">AI Business Assistant</h2>
                        <p className="text-indigo-400 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-800/50">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 md:px-6 relative shadow-lg
                            ${msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-sm' 
                                : 'bg-gray-700 text-gray-100 rounded-bl-sm border border-gray-600'}`}>
                            
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
                        <div className="bg-gray-700 border border-gray-600 rounded-2xl rounded-bl-sm p-4 text-gray-400 flex items-center gap-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                            <span className="text-sm">Agent analyzing data...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-4 bg-gray-900 border-t border-gray-700">
                <div className="relative flex items-center">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about sales, products, or type 'Show me a chart of...' "
                        className="w-full bg-gray-800 text-white placeholder-gray-500 border border-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-4 pl-4 pr-16 outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
                    >
                        <Send size={20} className={loading ? 'opacity-50' : ''} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatBox;
