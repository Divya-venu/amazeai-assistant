import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, TrendingUp, BarChart3, BrainCircuit, Loader2 } from 'lucide-react';
import axios from 'axios';
import KPISection from '../components/dashboard/KPISection';
import MonthlyProfitChart from '../components/dashboard/MonthlyProfitChart';
import RevenueExpenseChart from '../components/dashboard/RevenueExpenseChart';
import AIInsightsCard from '../components/dashboard/AIInsightsCard';
import GregAI from '../components/dashboard/GregAI';
import AdvancedPredictions from '../components/dashboard/AdvancedPredictions';

const Dashboard = () => {
    const [aiData, setAiData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/analytics');
            console.log('✅ Dashboard Data Fetched:', response.data);
            setAiData({
                stats: response.data.kpis,
                insights: response.data.insights,
                monthlyData: response.data.monthlyData,
                categoryData: response.data.categoryData
            });
        } catch (err) {
            console.error('❌ Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleUploadSuccess = async () => {
        console.log('📊 Upload Success Triggered - Refreshing Dashboard...');
        await fetchDashboardData();
        setSuccessMsg('Data successfully synced with dashboard');
        setTimeout(() => setSuccessMsg(''), 5000);
    };

    const handleGenerateInsights = () => {
        console.log('Generating insights for existing data...');
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Business Dashboard</h1>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live System</span>
                </div>
            </div>

            {/* Upload Section / AI Assistant */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-1 h-full">
                    <GregAI onUploadSuccess={handleUploadSuccess} />
                </div>
                <div className="lg:col-span-2">
                    <KPISection key={aiData?.stats?.lastUpdated || 'loaded'} summary={aiData?.stats} insights={aiData?.insights} loading={loading} />
                </div>
            </div>

            {/* Charts & Predictions Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                <div className="lg:col-span-1 glass-card rounded-[2.5rem] bg-white/5 border border-white/10 p-2 relative overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 bg-[#030712]/60 backdrop-blur-md z-10 flex items-center justify-center rounded-[2.5rem]">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                        </div>
                    )}
                    <MonthlyProfitChart 
                        data={aiData?.monthlyData || []} 
                        schemaMeta={aiData?.schemaMeta}
                    />
                </div>
                <div className="lg:col-span-1 glass-card rounded-[2.5rem] bg-white/5 border border-white/10 p-2 relative overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 bg-[#030712]/60 backdrop-blur-md z-10 flex items-center justify-center rounded-[2.5rem]">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                        </div>
                    )}
                    <RevenueExpenseChart 
                        data={aiData?.monthlyData || []} 
                        schemaMeta={aiData?.schemaMeta}
                    />
                </div>
                {/* Advanced Predictions Component */}
                <div className="lg:col-span-1">
                    {/* <AdvancedPredictions /> */}
                    <div className="text-white p-10">Testing Dashboard Rendering...</div>
                </div>
            </div>

            {/* AI Insights Section */}
            <div className="grid grid-cols-1 gap-6">
                <AIInsightsCard 
                    insights={aiData?.insights} 
                    loading={loading} 
                    onGenerate={handleGenerateInsights} 
                />
            </div>

            {successMsg && (
                <div className="fixed bottom-6 right-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-10 fade-in duration-500 z-50 flex items-center gap-3 font-medium">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {successMsg}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
