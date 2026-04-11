import axios from 'axios';

const API_BASE = 'http://localhost:5002/api/ai';

/**
 * AI Service for communicating with the Agent BI Backend
 */
const aiService = {
    /**
     * Triggers Groq-powered business insights
     * @param {string} shopId - Tenant ID
     * @param {Array} businessData - Historical data for analysis
     */
    generateInsights: async (shopId, businessData) => {
        const response = await axios.post(`${API_BASE}/insights`, { shopId, businessData });
        return response.data;
    },

    /**
     * Triggers ML Sales Forecasting (Python)
     * @param {string} shopId - Tenant ID
     * @param {Array} salesData - Historical sales records
     */
    generateForecast: async (shopId, salesData) => {
        const response = await axios.post(`${API_BASE}/forecast`, { shopId, salesData });
        return response.data;
    },

    /**
     * Triggers ML Anomaly Detection (Python)
     * @param {string} shopId - Tenant ID
     * @param {Array} dataset - Data to scan for outliers
     */
    runAnomalyDetection: async (shopId, dataset) => {
        const response = await axios.post(`${API_BASE}/anomaly-detection`, { shopId, dataset });
        return response.data;
    },

    /**
     * Fetches historical AI results from the persistent cache
     * @param {string} type - 'forecast', 'anomaly', 'insights'
     * @param {string} shopId - Tenant ID
     */
    getCachedResults: async (type, shopId) => {
        const response = await axios.get(`${API_BASE}/results/${type}`, {
            params: { shopId }
        });
        return response.data;
    }
};

export default aiService;
