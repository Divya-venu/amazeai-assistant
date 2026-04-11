import apiClient from './apiClient';

export const sendMessage = async (userId, message) => {
    try {
        const response = await apiClient.post('/assistant/chat', {
            userId,
            message,
        });

        return response.data;
    } catch (error) {
        console.error('[Frontend] Error calling Assistant API:', error.response?.status, error.response?.data || error.message);
        throw error;
    }
};
