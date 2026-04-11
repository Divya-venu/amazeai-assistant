import apiClient from './apiClient';

export const getMonthlyReport = async () => {
    const response = await apiClient.get('/dashboard/monthly-report');
    return response.data;
};

export const getAIInsights = async () => {
    const response = await apiClient.post('/insights');
    return response.data;
};

export const getAllSales = async () => {
    const response = await apiClient.get('/sales');
    return response.data;
};

export const getSalesSummary = async () => {
    const response = await apiClient.get('/sales/summary');
    return response.data;
};

export const getAnalyticsData = async () => {
    const response = await apiClient.get('/analytics');
    return response.data;
};

export const fetchAIInsightsDirect = async () => {
    const response = await apiClient.get('/dashboard/ai-insights');
    return response.data;
};

export const getSmartAlerts = async () => {
    const response = await apiClient.get('/smart-alerts');
    return response.data;
};

export const getAIRecommendations = async () => {
    const response = await apiClient.post('/ai-recommendations');
    return response.data;
};

export const getAnomalyDetection = async () => {
    const response = await apiClient.post('/anomaly-detection');
    return response.data;
};

export const fetchForecast = async () => {
    const response = await apiClient.post('/forecast');
    return response.data;
};

export const sendAIChatMessage = async (question, context = {}) => {
    const response = await apiClient.post('/ai/chat', { question, context });
    return response.data;
};

export const downloadBusinessReport = async () => {
    const response = await apiClient.get('/reports/generate', {
        responseType: 'blob'
    });
    return response.data;
};

