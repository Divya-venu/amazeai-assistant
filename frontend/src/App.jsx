import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Analytics from './pages/Analytics';
import AIInsights from './pages/AIInsights';
import AIChatPage from './pages/AIChatPage';
import PredictionsPage from './pages/PredictionsPage';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './components/DashboardLayout';
import { ToastProvider } from './components/ToastContext';
import './App.css';

function App() {
    console.log('App Root Rendered — All Routes Active');

    return (
        <ToastProvider>
            <Router>
                <Routes>
    <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/insights" element={<AIInsights />} />
        <Route path="/chat" element={<AIChatPage />} />
        <Route path="/predictions" element={<PredictionsPage />} />
        <Route path="/settings" element={<Settings />} />
    </Route>

    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
</Routes>
            </Router>
        </ToastProvider>
    );
}

export default App;
