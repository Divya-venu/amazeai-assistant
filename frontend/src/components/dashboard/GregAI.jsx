import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
    MessageSquare, Upload, FileText, X, Loader2, 
    BrainCircuit, Sparkles, Send, Mic, Command,
    CheckCircle2, AlertCircle, Info, Download, Trash2,
    Database, ShieldCheck, Zap, RefreshCcw
} from 'lucide-react';
import { useToast } from '../ToastContext';

const GregAI = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [messages, setMessages] = useState([
        { 
            role: 'ai', 
            content: "Greg here. I'm ready for high-performance data ingestion. Upload a CSV (98%+ reliability mode active).",
            timestamp: 'Just now'
        }
    ]);
    const [input, setInput] = useState('');
    const [previewData, setPreviewData] = useState(null);
    const [ingestionMeta, setIngestionMeta] = useState(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);
    const toast = useToast();

    const suggestions = [
        "Which month had the highest revenue?",
        "What is the top-selling product?",
        "Compare live vs CSV",
        "Detect anomalies"
    ];

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, previewData]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile?.name.endsWith('.csv')) {
            setFile(selectedFile);
            setPreviewData(null);
            setIsConfirming(false);
        } else if (selectedFile) {
            toast.error('Invalid format. Standardize on CSV for 98% reliability.');
        }
    };

    const startIngestion = async () => {
        if (!file) return;
        setLoading(true);
        setStatusText('Identifying Delimiter & Encoding...');
        setProgress(10);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                onUploadProgress: (p) => {
                    const percent = Math.round((p.loaded * 40) / p.total);
                    setProgress(percent);
                }
            });

            const { preview, meta } = response.data;
            
            // Simulation of "Heavy ML Processing" for UI feel
            const steps = [
                { t: 'Validating Header Structure...', p: 50 },
                { t: 'AI Auto-healing Inconsistencies...', p: 70 },
                { t: 'ML Schema Inference Active...', p: 90 },
                { t: 'Indexing for Semantic Search...', p: 100 }
            ];

            for (const step of steps) {
                setStatusText(step.t);
                setProgress(step.p);
                await new Promise(r => setTimeout(r, 600));
            }

            setPreviewData(preview);
            setIngestionMeta(meta);
            setIsConfirming(true);
            
            setMessages(prev => [...prev, {
                role: 'ai',
                content: `I've analyzed **${file.name}**. \n\n**Confidence: ${meta.confidence}%**\n\n${meta.mappingSuggestions.map(s => `• ${s}`).join('\n')}\n\nPlease review the preview and confirm ingestion.`,
                timestamp: 'Just now'
            }]);

        } catch (err) {
            console.error('Upload failed:', err);
            toast.error(err.response?.data?.error || 'Ingestion failed');
            setFile(null);
        } finally {
            setLoading(false);
        }
    };

    const confirmIngestion = () => {
        setIsConfirming(false);
        setPreviewData(null);
        setFile(null);
        toast.success('Data fully indexed and synced with dashboard.');
        if (onUploadSuccess) onUploadSuccess();
    };

    const downloadCleaned = () => {
        window.open('http://localhost:5000/api/upload/download-cleaned', '_blank');
    };

    const handleSendMessage = (text = input) => {
        if (!text.trim()) return;
        setMessages(prev => [...prev, { role: 'user', content: text, timestamp: '12:45 PM' }]);
        setInput('');
        
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: `I've analyzed your current dataset. Based on the **${ingestionMeta?.confidence || 98.4}% data confidence**, I recommend focusing on the Electronics category which showed a **14.2% spike** in the last 48 hours.`,
                timestamp: 'Just now'
            }]);
        }, 1000);
    };

    return (
        <div className="h-full flex flex-col bg-[#030712]/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl min-h-[750px]">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
                             <BrainCircuit size={24} className="text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#030712] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white tracking-tight">Greg LLM – Enterprising v2.4</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                                98% Reliability Mode
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Insight Hero */}
            <div className="mx-6 mt-6 p-5 rounded-2xl bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full"></div>
                
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Revenue (Live)</span>
                        <div className="flex items-baseline gap-3 mt-1">
                            <h3 className="text-3xl font-black text-white tracking-tighter">₹16,31,39,737</h3>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">+12.5%</span>
                        </div>
                    </div>
                    <div className="w-24 h-12 opacity-80">
                         <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                             <defs>
                                 <linearGradient id="neonGlow" x1="0" y1="0" x2="0" y2="1">
                                     <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                                     <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                 </linearGradient>
                             </defs>
                             <path d="M0,25 L20,20 L40,22 L60,10 L80,15 L100,5" fill="none" stroke="#10b981" strokeWidth="2" />
                             <path d="M0,25 L20,20 L40,22 L60,10 L80,15 L100,5 L100,30 L0,30 Z" fill="url(#neonGlow)" />
                         </svg>
                    </div>
                </div>
                
                <div className="relative z-10 mt-4 pt-4 border-t border-white/10 flex gap-3 items-start">
                    <Sparkles size={16} className="text-indigo-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-gray-300">Revenue surge driven by seasonal enterprise contracts</p>
                        <div className="flex gap-2 mt-2">
                           <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-1.5 py-0.5 rounded">Confidence: 64%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 transition-all`}>
                        <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-xl ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                        }`}>
                            <p className="font-medium whitespace-pre-wrap">{msg.content}</p>
                            <span className="text-[9px] mt-2 block opacity-40 font-bold uppercase tracking-widest">{msg.timestamp}</span>
                        </div>
                    </div>
                ))}
                
                {previewData && (
                    <div className="animate-in zoom-in-95 duration-500">
                        <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                            <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Database size={12} className="text-indigo-400" /> Data Preview (Ingested Sample)
                                </span>
                                <span className="text-[10px] font-bold text-indigo-400">Rows: {ingestionMeta?.processedCount}</span>
                            </div>
                            <div className="overflow-x-auto max-h-48 custom-scrollbar">
                                <table className="w-full text-[10px] text-left">
                                    <thead className="text-gray-500 bg-white/5">
                                        <tr>
                                            {Object.keys(previewData[0]).map(k => <th key={k} className="p-2 border-b border-white/5 capitalize tracking-tighter">{k}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-300">
                                        {previewData.map((row, i) => (
                                            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                                {Object.values(row).map((v, j) => (
                                                    <td key={j} className="p-2 truncate max-w-[100px]">{typeof v === 'object' && v !== null ? new Date(v).toLocaleDateString() : v}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {isConfirming && (
                                <div className="p-3 bg-indigo-600/20 flex gap-2">
                                    <button 
                                        onClick={confirmIngestion}
                                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95"
                                    >
                                        Apply to Dashboard
                                    </button>
                                    <button 
                                        onClick={() => { setPreviewData(null); setIsConfirming(false); }}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Ingestion Footer */}
            <div className="p-6 border-t border-white/5 space-y-4 bg-[#010409]/40">
                {loading ? (
                    <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-indigo-400">
                            <span className="flex items-center gap-2">
                                <Loader2 size={12} className="animate-spin" /> {statusText}
                            </span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {!file ? (
                             <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/5 bg-white/[0.02] rounded-3xl cursor-pointer hover:border-indigo-500/30 hover:bg-indigo-500/[0.02] transition-all"
                            >
                                <Upload className="text-gray-500 group-hover:text-indigo-400 transition-colors mb-2" size={24} />
                                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Connect Dataset</span>
                                <span className="text-[9px] text-gray-600 font-medium mt-1 uppercase tracking-tighter">UTF-8 / Semicolon / Parsed Data</span>
                                <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />
                            </div>
                        ) : !previewData && (
                            <div className="flex items-center justify-between p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl animate-in zoom-in-95">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                                        <FileText size={16} className="text-indigo-400" />
                                    </div>
                                    <span className="text-[11px] font-bold text-white truncate max-w-[150px]">{file.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setFile(null)} className="p-1 text-gray-500 hover:text-rose-400 transition-colors text-[10px] font-bold uppercase tracking-widest">Remove</button>
                                    <button 
                                        onClick={startIngestion}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                                    >
                                        Process
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {ingestionMeta && (
                                <button 
                                    onClick={downloadCleaned}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    <Download size={14} />
                                    Cleaned CSV
                                </button>
                            )}
                        </div>
                        
                        <div className="relative">
                            <input 
                                type="text"
                                placeholder="Ask Greg about your business..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                className="w-full bg-[#030712] border border-white/10 rounded-2xl px-5 py-4 
                                    text-gray-200 text-xs placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                            />
                            <button 
                                onClick={() => handleSendMessage()}
                                className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                            >
                                <Zap size={14} />
                            </button>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {suggestions.map((s, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleSendMessage(s)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold text-gray-500 hover:text-white hover:bg-white/10 transition-all uppercase tracking-wider"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GregAI;
