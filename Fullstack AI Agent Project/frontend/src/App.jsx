import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ChatBox from './components/ChatBox';
import InsightsUploader from './components/InsightsUploader';
import AIControls from './components/AIControls';
import ForecastChart from './components/ForecastChart';
import AnomalyCards from './components/AnomalyCards';
import AIInsightsPanel from './components/AIInsightsPanel';
import Signup from './pages/Signup';
import Login from './pages/Login';
import { socketService } from './services/socketService';
import './index.css';

function Dashboard() {
  const [aiData, setAiData] = useState({
    forecast: null,
    anomalies: [],
    insights: null,
    loading: false
  });
  
  // Real-world scenario: shopId would come from user session
  const shopId = "saas-demo-shop";

  const [dataset, setDataset] = useState([
     { date: "2026-03-01", revenue: 1000, amount: 1000, timestamp: "2026-03-01T10:00:00Z" },
     { date: "2026-03-02", revenue: 1200, amount: 1200, timestamp: "2026-03-02T11:00:00Z" },
     { date: "2026-03-03", revenue: 1100, amount: 1100, timestamp: "2026-03-03T09:00:00Z" },
     { date: "2026-03-04", revenue: 1300, amount: 1300, timestamp: "2026-03-04T10:00:00Z" },
     { date: "2026-03-05", revenue: 1250, amount: 1250, timestamp: "2026-03-05T12:00:00Z" },
     { date: "2026-03-06", revenue: 1400, amount: 1400, timestamp: "2026-03-06T14:00:00Z" },
     { date: "2026-03-07", revenue: 5000, amount: 5000, timestamp: "2026-03-07T02:00:00Z" } // Anomaly!
  ]);

  // Handle Real-Time WebSocket Connections
  useEffect(() => {
    socketService.connect(shopId);

    // When the Redis queue completes a job, auto-refresh the dashboard
    socketService.onJobCompleted((payload) => {
      console.log(`[Dashboard] Real-time AI Job Completed: ${payload.type}`, payload);
      
      // The payload structure matches the 'type' (forecast, anomaly, insights)
      setAiData(prev => ({
        ...prev,
        [payload.type]: payload.type === 'anomaly' ? payload.data.anomalies : (payload.type === 'forecast' ? payload.data.forecast : payload.data),
        loading: false
      }));
    });

    socketService.onJobFailed((payload) => {
      console.error(`[Dashboard] Real-time AI Job Failed: ${payload.type}`, payload.error);
    });

    // Cleanup on unmount
    return () => socketService.disconnect();
  }, [shopId]);

  const handleAnalysisComplete = (newData) => {
    setAiData(prev => ({
      ...prev,
      ...newData,
      loading: false
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col xl:flex-row text-slate-200">
      {/* Sidebar: Control & Chat */}
      <div className="w-full xl:w-80 p-6 bg-slate-900 border-r border-slate-800 flex flex-col h-screen overflow-y-auto shrink-0 custom-scrollbar">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight text-white mb-1">
            AGENT <span className="text-indigo-500">BI</span>
          </h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            SaaS Intelligence Platform
          </p>
        </div>

        <div className="mb-4">
          <AIControls onUpdate={handleAnalysisComplete} dataset={dataset} />
        </div>

        {/* Keeping uploader below controls just in case file upload is still needed for future */}
        <div className="mb-8 opacity-50 hover:opacity-100 transition-opacity">
          <InsightsUploader 
            onAnalysisComplete={handleAnalysisComplete} 
            setLoading={(val) => setAiData(p => ({...p, loading: val}))}
          />
        </div>

        <div className="flex-1 mt-auto">
          <ChatBox />
        </div>
      </div>

      {/* Main Dashboard Area */}
      <div className="flex-1 p-6 md:p-10 h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-bold text-white tracking-tight">Executive Dashboard</h2>
              <p className="text-slate-400 mt-1">Real-time AI analysis of historical business performance.</p>
            </div>
            {aiData.loading && (
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20 animate-pulse">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                AI IS ANALYZING...
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Top Row: Forecast & Key Insights */}
            <div className="lg:col-span-8">
              <ForecastChart data={aiData.forecast} />
            </div>
            <div className="lg:col-span-4">
              <AIInsightsPanel data={aiData.insights} />
            </div>

            {/* Bottom Row: Anomalies & Future Components */}
            <div className="lg:col-span-12">
              <AnomalyCards anomalies={aiData.anomalies} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/signup" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
