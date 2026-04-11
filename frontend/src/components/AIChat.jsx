import React, { useState } from 'react';
import axios from 'axios';
import { Send, Bot, Sparkles } from 'lucide-react';

const AIChat = ({ context }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const suggestions = [
        'Which month had the highest revenue?',
        'What is the top-selling product?',
    ];

    const handleSend = async (text) => {
        const msg = text || input;
        if (!msg.trim()) return;
        
        const newMessages = [...messages, { role: 'user', content: msg }];
        setMessages(newMessages);
        setInput('');
        
        try {
            const response = await axios.post('http://localhost:5000/api/ai-chat', {
                question: msg,
                context: context
            });
            
            setMessages([...newMessages, { 
                role: 'ai', 
                content: response.data.reply
            }]);
        } catch (err) {
            setMessages([...newMessages, { 
                role: 'ai', 
                content: "I'm sorry, I'm having trouble connecting to the brain center right now."
            }]);
        }
    };

    return (
        <div className="glass-card rounded-[2.5rem] p-8 h-[500px] flex flex-col group">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Bot size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-white tracking-tight">AI Business Assistant</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Groq • Llama-3.1-8b-instant</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Sparkles className="text-indigo-400/50" size={32} />
                        </div>
                        <p className="text-gray-400 text-sm font-medium mb-8">Ask anything about your business data</p>
                        
                        <div className="w-full space-y-2">
                            {suggestions.map((s, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleSend(s)}
                                    className="w-full text-left px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-gray-400 text-xs hover:bg-white/10 hover:text-white transition-all flex items-center justify-between group/btn"
                                >
                                    {s}
                                    <Send size={12} className="opacity-0 group-hover/btn:opacity-100 -translate-x-2 group-hover/btn:translate-x-0 transition-all text-indigo-400" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((m, idx) => (
                        <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-3 rounded-[1.5rem] text-sm ${
                                m.role === 'user' 
                                ? 'bg-indigo-600 text-white shadow-lg' 
                                : 'bg-white/5 border border-white/5 text-gray-300'
                            }`}>
                                {m.content}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="relative">
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask AI about your business..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
                />
                <button 
                    onClick={() => handleSend()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center text-white transition-all shadow-lg"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};

export default AIChat;
