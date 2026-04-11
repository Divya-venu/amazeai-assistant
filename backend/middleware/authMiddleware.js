const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');

// Protect Routes (Verify JWT & Extract shopId)
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.accessToken) {
        // Set token from cookie
        token = req.cookies.accessToken;
    }

    if (!token || token === 'null' || token === 'undefined') {
        logger.warn(`Unauthorized access attempt to ${req.originalUrl} - No token provided`);
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logger.debug(`Token decoded successfully for user ID: ${decoded.id}`);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            logger.warn(`User not found for ID: ${decoded.id}`);
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        // Attach shopId for tenant isolation
        req.shopId = req.user.shopId;
        next();
    } catch (error) {
        logger.error(`Auth Middleware Error: ${error.message}`);
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

// Role Authorization
exports.authorize = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;
        console.log('[Auth] Checking authorization:', {
            required: roles,
            actual: userRole,
            userId: req.user?._id
        });

        if (!userRole || !roles.includes(userRole)) {
            console.log('[Auth] Authorization failed: Role mismatch or role missing');
            return res.status(403).json({
                success: false,
                error: `User role ${userRole || 'undefined'} is not authorized to access this route`
            });
        }
        next();
    };
};

// Tenant verification middleware (Strict match)
exports.verifyTenant = (req, res, next) => {
    const queryShopId = req.query.shopId || req.body.shopId;

    if (queryShopId && queryShopId !== req.shopId) {
        return res.status(403).json({ success: false, error: "Access denied: Tenant mismatch" });
    }

    // Force shopId into body for all creations
    if (req.method === 'POST') {
        req.body.shopId = req.shopId;
    }

    next();
};
