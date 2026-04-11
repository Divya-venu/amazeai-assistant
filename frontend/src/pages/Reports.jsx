import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Download, Filter, Calendar, Loader2 } from 'lucide-react';
import { getReports } from '../services/dashboardService';
import { io } from 'socket.io-client';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllReports = useCallback(async () => {
        setLoading(true);
        try {
            console.log('[Reports] Fetching reports from backend...');
            const data = await getReports();
            console.log(`[Reports] Received ${data.length} reports.`);
            setReports(data);
            setError(null);
        } catch (err) {
            console.error('[Reports] Error fetching reports:', err);
            setError('Failed to load reports.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllReports();

        const socket = io('http://localhost:5000', { withCredentials: true });
        socket.on('reportsUpdated', () => {
            console.log('[Reports] Real-time update received');
            fetchAllReports();
        });
        
        // Also listen to general sales update just in case
        socket.on('salesUpdated', () => {
            console.log('[Reports] Sales update received');
            fetchAllReports();
        });

        return () => socket.disconnect();
    }, [fetchAllReports]);

    const handleDownload = (report) => {
        console.log(`[Reports] Downloading report ${report._id}`);
        // Point browser directly to the download endpoint
        window.location.href = `http://localhost:5000/api/reports/${report._id}/download`;
    };

    // Calculate dynamic stats
    const totalReports = reports.length;
    // Just mock "this month" logic for the sub-text, or calculate it based on dates
    const thisMonthCount = reports.filter(r => new Date(r.date) > new Date(new Date().setDate(1))).length;

    if (loading && reports.length === 0) {
        return (
            <div className="p-6 flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        Reports & Export
                        {loading && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Manage and download your generated business intelligence reports</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#0d1526] border border-[#1a2540] rounded-xl text-sm text-gray-300 hover:text-white transition-all">
                        <Filter size={16} />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm text-white font-semibold transition-all shadow-lg shadow-indigo-500/20">
                        <FileText size={16} />
                        New Report
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/40 p-3 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Reports', value: totalReports.toString(), sub: `+${thisMonthCount} this month`, icon: FileText, color: 'text-indigo-400' },
                    { label: 'Downloads', value: 'Dynamic', sub: 'Driven by user actions', icon: Download, color: 'text-emerald-400' },
                    { label: 'Scheduled', value: '0', sub: 'Feature coming soon', icon: Calendar, color: 'text-amber-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--bg-card)] border border-[#1a2540] p-5 rounded-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2.5 rounded-xl bg-[#0d1526] ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                        <div className="flex items-end gap-2 mt-1">
                            <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                            <span className="text-[10px] text-gray-500 mb-1.5 font-medium">{stat.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-[var(--bg-card)] border border-[#1a2540] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#1a2540] flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Recent Reports</h3>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-[#0d1526]/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Report Name</th>
                                <th className="px-6 py-4">Date generated</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a2540]">
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No reports found. Upload a CSV on the Dashboard to generate one.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report._id} className="group hover:bg-white/2 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[#0d1526] border border-[#1a2540] flex items-center justify-center text-gray-400 group-hover:text-indigo-400 transition-colors">
                                                    <FileText size={14} />
                                                </div>
                                                <span className="text-sm font-semibold text-white">{report.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {new Date(report.date).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md bg-[#0d1526] border border-[#1a2540] text-[10px] text-gray-400">
                                                {report.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full ${['Ready', 'Generated'].includes(report.status) ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                                                <span className="text-xs text-gray-300">{report.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleDownload(report)}
                                                title="Download CSV"
                                                className="p-1.5 hover:bg-indigo-600/20 hover:text-indigo-400 rounded-lg text-gray-500 transition-all">
                                                <Download size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;
