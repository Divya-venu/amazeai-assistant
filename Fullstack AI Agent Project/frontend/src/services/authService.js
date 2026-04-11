import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth';

/**
 * Register a new user
 * @param {Object} userData - Contains name, email, password
 * @returns {Promise<Object>} The response data
 */
const signup = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/signup`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { success: false, error: 'Registration failed' };
    }
};

/**
 * Login user (Placeholder for future implementation)
 */
const login = async (userData) => {
    // try {
    //     const response = await axios.post(`${API_URL}/login`, userData);
    //     return response.data;
    // } catch (error) {
    //     throw error.response?.data || { success: false, error: 'Login failed' };
    // }
};

export const authService = {
    signup,
    login
};
