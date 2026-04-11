import React from 'react';
import { FileDown, FileText, Download, TrendingUp, TrendingDown, DollarSign, Loader2 } from 'lucide-react';
import { downloadBusinessReport } from '../../services/dashboardService';
import { useToast } from '../ToastContext';

const BusinessReport = ({ summary, loading }) => {
    const toast = useToast();
    const handleDownload = async () => {
        try {
            const blob = await downloadBusinessReport();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `AI_Business_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download report. Please try again.');
        }
    };

    if (loading || !summary) {
        return (
            <div className="dashboard-card p-8 rounded-[2.5rem] bg-gray-800/20 border border-gray-700/30 shadow-xl backdrop-blur-md flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Loading Report...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-card p-8 rounded-[2.5rem] bg-gray-800/20 border border-gray-700/30 shadow-xl backdrop-blur-md flex flex-col h-full hover:border-indigo-500/30 transition-all group">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400">
                        <FileText size={22} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">AI Business Report</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Performance Summary</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                    Ready
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-8 flex-1">
                <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-700/20 flex items-center justify-between group-hover:bg-gray-900/60 transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center">
                            <DollarSign size={16} />
                        </div>
                        <span className="text-xs text-gray-400 font-bold">Total Revenue</span>
                    </div>
                    <span className="text-lg font-black text-white">{summary.revenue || '$0'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-900/40 border border-gray-700/20 flex items-center justify-between group-hover:bg-gray-900/60 transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-rose-500/10 text-rose-400 rounded-lg flex items-center justify-center">
                            <TrendingDown size={16} />
                        </div>
                        <span className="text-xs text-gray-400 font-bold">Total Expenses</span>
                    </div>
                    <span className="text-lg font-black text-white">{summary.expenses || '$0'}</span>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center">
                            <TrendingUp size={16} />
                        </div>
                        <span className="text-xs text-indigo-300 font-black">Net Profit</span>
                    </div>
                    <span className="text-lg font-black text-indigo-400">{summary.netProfit || '$0'}</span>
                </div>
            </div>

            <button 
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] group/btn"
            >
                <FileDown size={20} className="group-hover/btn:translate-y-0.5 transition-transform" />
                Download PDF Report
                <Download size={14} className="opacity-50" />
            </button>
        </div>
    );
};

export default BusinessReport;
