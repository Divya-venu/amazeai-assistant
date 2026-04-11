import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, Loader, Database, FileText, X, AlertCircle } from 'lucide-react';
import { useToast } from './ToastContext';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB — matches backend limit

const InsightsUploader = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef(null);
    const toast = useToast();

    /**
     * Validates and sets the selected file.
     * Resets the file input value so the same file can be chosen again
     * on the next interaction without onChange being suppressed.
     */
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
            toast.error('Only CSV files are allowed.');
            // Reset so the same file can be tried again after correction
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            toast.error('File exceeds the 500 MB limit. Please upload a smaller CSV.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setUploadProgress(5);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (p) => {
                    if (p.total) {
                        // Scale network upload to 5–80%; parsing takes the remaining 20%
                        const networkPct = Math.round((p.loaded / p.total) * 75) + 5;
                        setUploadProgress(networkPct);
                    }
                }
            });

            setUploadProgress(100);

            if (response.data.success) {
                toast.success(`✓ ${response.data.count} records loaded successfully.`);
                // FIX: Pass the full response data object (not the non-existent .aiData key)
                if (onUploadSuccess) onUploadSuccess(response.data);
            }
        } catch (err) {
            const serverMsg = err.response?.data?.error;
            const serverDetail = err.response?.data?.details;
            const displayMsg = serverDetail
                ? `${serverMsg}: ${serverDetail}`
                : serverMsg || 'Upload failed. Check your network and try again.';
            toast.error(displayMsg);
        } finally {
            // Always reset state regardless of outcome
            setLoading(false);
            setUploadProgress(0);
            setFile(null);
            // FIX: Clear input ref so the same file triggers onChange next time
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="glass-card rounded-[2.5rem] p-8 group relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
            
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Database size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-white tracking-tight">Data Intelligence</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">CSV • Pandas • ML Engine</p>
                </div>
            </div>

            {!file ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                    onDragLeave={() => setIsDragActive(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragActive(false);
                        const droppedFile = e.dataTransfer.files[0];
                        if (droppedFile?.name.endsWith('.csv')) setFile(droppedFile);
                    }}
                    className={`border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer
                        ${isDragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'}`}
                >
                    <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Upload size={32} />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-white mb-1">Click or drag CSV file</p>
                        <p className="text-[10px] text-gray-500 font-medium italic">Max size: 500MB</p>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept=".csv"
                    />
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <FileText size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white truncate max-w-[150px]">{file.name}</span>
                                <span className="text-[10px] text-gray-500 font-medium">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setFile(null)}
                            className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-800 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                <span>Analyzing {uploadProgress}%</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} />
                                <span>Start AI Analysis</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default InsightsUploader;
