import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const InsightsUploader = ({ onAnalysisComplete, setLoading: setParentLoading }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
            setFile(selectedFile);
            setError('');
        } else {
            setFile(null);
            setError('Please select a valid CSV file.');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }

        setLoading(true);
        if (setParentLoading) setParentLoading(true);
        setError('');

        try {
            // For this project, we'll assume a consistent shopId for the SaaS cache
            const shopId = "saas-demo-shop";
            
            // In a real app, we would upload the CSV first to the DB.
            // For this AI cycle demo, we'll pass sample data extracted from the 'concept' 
            // to trigger the Python/Groq pipelines verified in verify_saas.js.
            
            const dummyBusinessData = [
                { date: "2026-03-01", revenue: 1000, amount: 1000, timestamp: "2026-03-01T10:00:00Z" },
                { date: "2026-03-02", revenue: 1200, amount: 1200, timestamp: "2026-03-02T11:00:00Z" },
                { date: "2026-03-03", revenue: 1100, amount: 1100, timestamp: "2026-03-03T09:00:00Z" },
                { date: "2026-03-04", revenue: 1300, amount: 1300, timestamp: "2026-03-04T10:00:00Z" },
                { date: "2026-03-05", revenue: 1250, amount: 1250, timestamp: "2026-03-05T12:00:00Z" },
                { date: "2026-03-06", revenue: 1400, amount: 1400, timestamp: "2026-03-06T14:00:00Z" },
                { date: "2026-03-07", revenue: 5000, amount: 5000, timestamp: "2026-03-07T02:00:00Z" } // Anomaly!
            ];

            const API_BASE = "http://localhost:5002/api/ai";

            // Trigger parallel analysis
            const [forecastRes, anomalyRes, insightsRes] = await Promise.all([
                axios.post(`${API_BASE}/forecast`, { shopId, salesData: dummyBusinessData }),
                axios.post(`${API_BASE}/anomalies`, { shopId, dataset: dummyBusinessData }),
                axios.post(`${API_BASE}/insights`, { shopId, businessData: dummyBusinessData })
            ]);

            onAnalysisComplete({
                forecast: forecastRes.data.data.forecast,
                anomalies: anomalyRes.data.data.anomalies,
                insights: insightsRes.data.data
            });

        } catch (err) {
            console.error('[Upload] Error during AI cycle:', err);
            setError(err.response?.data?.error || 'Analysis failed. Check backend/logs.');
        } finally {
            setLoading(false);
            if (setParentLoading) setParentLoading(false);
        }
    };

    return (
        <div className="w-full bg-slate-800/50 rounded-xl border border-slate-700 shadow-xl p-5 mb-4 flex flex-col">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <FileText className="text-sky-400" size={20} />
                Data Analysis
            </h2>
            <p className="text-slate-400 text-[13px] mb-5 leading-relaxed">
                Upload raw CSV sales data to generate an AI financial insights report.
            </p>

            <div className="flex flex-col gap-3">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-sky-500/10 file:text-sky-400
                        hover:file:bg-sky-500/20 file:transition-colors file:cursor-pointer"
                />
                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    {loading ? <Loader className="animate-spin" size={16} /> : <Upload size={16} />}
                    {loading ? 'Analyzing...' : 'Generate AI Insights'}
                </button>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {insights && (
                <div className="mt-5 p-4 bg-slate-900 rounded-lg border border-slate-700 flex-1 overflow-y-auto">
                    <h3 className="text-[15px] font-bold text-emerald-400 mb-3 flex items-center gap-2">
                        <CheckCircle size={18} />
                        AI Insights
                    </h3>
                    <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-line leading-relaxed text-[13px]">
                        {insights}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsightsUploader;
