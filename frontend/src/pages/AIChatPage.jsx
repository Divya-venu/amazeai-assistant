import React, { useState } from 'react';
import axios from 'axios';
import {
    Send,
    Bot,
    User,
    Sparkles,
    Loader2
} from 'lucide-react';

const AIChatPage = () => {
    const [messages, setMessages] = useState([
        {
            role: 'ai',
            content:
                "Hello! I'm your AI Business Assistant. Ask me about your revenue, expenses, products, profit, or sales data."
        }
    ]);

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async (messageText = input) => {
        const message = messageText.trim();

        if (!message || loading) {
            return;
        }

        // Add user message
        setMessages(prev => [
            ...prev,
            {
                role: 'user',
                content: message
            }
        ]);

        setInput('');
        setLoading(true);

        try {
            const response = await axios.post(
                'http://localhost:5000/api/ai-chat',
                {
                    message
                }
            );

            setMessages(prev => [
                ...prev,
                {
                    role: 'ai',
                    content:
                        response.data.reply ||
                        'I could not generate a response.'
                }
            ]);
        } catch (error) {
            console.error('AI Chat Error:', error);

            setMessages(prev => [
                ...prev,
                {
                    role: 'ai',
                    content:
                        'Sorry, I could not connect to the AI Business Assistant. Please make sure the backend is running.'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const suggestions = [
        'What is my total revenue?',
        'Which product has the highest profit?',
        'What is my profit margin?',
        'Which category generates the most revenue?'
    ];

    return (
        <div className="p-6 max-w-screen-2xl mx-auto h-[calc(100vh-100px)]">

            <div className="h-full flex flex-col bg-[#030712]/60 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">

                    <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Sparkles
                                size={24}
                                className="text-white"
                            />
                        </div>

                        <div>
                            <h1 className="text-xl font-black text-white">
                                AI Business Assistant
                            </h1>

                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-400" />

                                <span className="text-xs text-emerald-400 font-semibold">
                                    Live Business Data Connected
                                </span>
                            </div>
                        </div>

                    </div>

                </div>


                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">

                    {messages.map((message, index) => (

                        <div
                            key={index}
                            className={`flex ${
                                message.role === 'user'
                                    ? 'justify-end'
                                    : 'justify-start'
                            }`}
                        >

                            <div
                                className={`flex gap-3 max-w-[80%] ${
                                    message.role === 'user'
                                        ? 'flex-row-reverse'
                                        : ''
                                }`}
                            >

                                {/* Avatar */}
                                <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        message.role === 'user'
                                            ? 'bg-indigo-600'
                                            : 'bg-purple-600/30 border border-purple-500/30'
                                    }`}
                                >
                                    {message.role === 'user' ? (
                                        <User
                                            size={17}
                                            className="text-white"
                                        />
                                    ) : (
                                        <Bot
                                            size={17}
                                            className="text-purple-300"
                                        />
                                    )}
                                </div>


                                {/* Message */}
                                <div
                                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                        message.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                                    }`}
                                >
                                    {message.content}
                                </div>

                            </div>

                        </div>

                    ))}


                    {/* Loading */}
                    {loading && (

                        <div className="flex justify-start">

                            <div className="flex gap-3">

                                <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center">
                                    <Bot
                                        size={17}
                                        className="text-purple-300"
                                    />
                                </div>

                                <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white/5 border border-white/10">

                                    <div className="flex items-center gap-2 text-gray-400 text-sm">

                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />

                                        Analyzing your business data...

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}

                </div>


                {/* Suggestions */}
                <div className="px-6 pb-3">

                    <p className="text-xs text-gray-500 mb-2">
                        Quick questions
                    </p>

                    <div className="flex flex-wrap gap-2">

                        {suggestions.map((suggestion, index) => (

                            <button
                                key={index}
                                onClick={() => sendMessage(suggestion)}
                                disabled={loading}
                                className="px-3 py-2 text-xs text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-white transition-all disabled:opacity-50"
                            >
                                {suggestion}
                            </button>

                        ))}

                    </div>

                </div>


                {/* Input */}
                <div className="p-6 border-t border-white/10">

                    <div className="flex items-center gap-3">

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    sendMessage();
                                }
                            }}
                            placeholder="Ask about your business..."
                            disabled={loading}
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 transition-all disabled:opacity-50"
                        />

                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                        >
                            <Send
                                size={18}
                                className="text-white"
                            />
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default AIChatPage;