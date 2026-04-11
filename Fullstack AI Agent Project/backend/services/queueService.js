const Queue = require('bull');
const { getAIResult } = require('./aiService');

// Initialize Bull Queue (requires Redis running locally or via Docker)
const aiQueue = new Queue('ai-jobs', process.env.REDIS_URI || 'redis://127.0.0.1:6379');

// Producer: Add a heavy async job to the queue
const addAIJob = async (type, shopId, source, inputData) => {
    const job = await aiQueue.add({
        type,
        shopId,
        source,
        inputData
    }, {
        attempts: 3,             // Retry up to 3 times on failure
        backoff: 5000,           // Wait 5s between retries
        removeOnComplete: true, // Keep Redis clean
        removeOnFail: false      // Keep failed jobs for debugging
    });

    console.log(`[QueueService] Added Job ${job.id} for ${type}`);
    return job.id;
};

// Consumer: Process jobs in the background
aiQueue.process(async (job) => {
    const { type, shopId, source, inputData } = job.data;
    console.log(`[QueueService] Processing Job ${job.id} for ${type}`);

    try {
        // Execute the heavy AI logic
        const result = await getAIResult(type, shopId, source, inputData);
        console.log(`[QueueService] Completed Job ${job.id}`);
        
        // Push Real-Time Update to Frontend
        if (global.io) {
            global.io.to(shopId).emit('ai_job_completed', {
                type,
                jobId: job.id,
                data: result
            });
            console.log(`[QueueService] Emitted live update to shop room: ${shopId}`);
        }

        return result; 
    } catch (error) {
        console.error(`[QueueService] Job ${job.id} Failed:`, error);
        
        if (global.io) {
            global.io.to(shopId).emit('ai_job_failed', {
                type,
                jobId: job.id,
                error: error.message
            });
        }
        
        throw error; // Triggers Bull's retry mechanism
    }
});

// Helper: Check job status
const getJobStatus = async (jobId) => {
    const job = await aiQueue.getJob(jobId);
    
    if (!job) return { status: 'not_found' };

    const state = await job.getState();
    const progress = job._progress;
    const reason = job.failedReason;
    const result = job.returnvalue;

    return {
        id: job.id,
        status: state, // 'waiting', 'active', 'completed', 'failed', 'delayed'
        progress,
        reason,
        result
    };
};

module.exports = {
    addAIJob,
    getJobStatus
};
