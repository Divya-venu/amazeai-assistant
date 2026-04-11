const logger = require('../utils/logger');

const cache = new Map();

/**
 * Simple in-memory cache middleware
 * @param {number} ttl - Time to live in seconds
 */
const cacheMiddleware = (ttl = 300) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = `${req.shopId || 'global'}_${req.originalUrl}`;
        const cachedResponse = cache.get(key);

        if (cachedResponse && cachedResponse.expires > Date.now()) {
            logger.debug(`[Cache Hit] ${key}`);
            return res.json(cachedResponse.data);
        }

        // Store the original send
        const originalSend = res.json;

        res.json = function (body) {
            // Only cache successful status codes
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cache.set(key, {
                    data: body,
                    expires: Date.now() + (ttl * 1000)
                });
                logger.debug(`[Cache Set] ${key} (TTL: ${ttl}s)`);
            }
            return originalSend.call(this, body);
        };

        next();
    };
};

module.exports = cacheMiddleware;
