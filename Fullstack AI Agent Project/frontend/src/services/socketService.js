import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5002'; // Point to the Express backend

class SocketService {
    constructor() {
        this.socket = null;
    }

    connect(shopId) {
        if (!this.socket) {
            this.socket = io(SOCKET_URL);
            
            this.socket.on('connect', () => {
                console.log('[SocketService] Connected to AI WebSocket server.');
                // Join the tenant-specific room immediately upon connecting
                if (shopId) {
                    this.socket.emit('join_shop', shopId);
                }
            });

            this.socket.on('disconnect', () => {
                console.log('[SocketService] Disconnected from AI WebSocket server.');
            });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Listen for AI job completions (Forecast, Anomalies, Insights)
     * @param {function} callback - Function to run when data arrives
     */
    onJobCompleted(callback) {
        if (this.socket) {
            // Remove previous listeners to prevent memory leaks in React
            this.socket.off('ai_job_completed'); 
            this.socket.on('ai_job_completed', callback);
        }
    }

    /**
     * Listen for AI job failures
     */
    onJobFailed(callback) {
        if (this.socket) {
            this.socket.off('ai_job_failed');
            this.socket.on('ai_job_failed', callback);
        }
    }
}

// Export a singleton instance
export const socketService = new SocketService();
