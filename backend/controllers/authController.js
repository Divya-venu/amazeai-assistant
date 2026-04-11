const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Token = require('../models/Token');
const logger = require('../utils/logger');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

// Generate Access Token
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, shopId: user.shopId, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' } // Increased from 15m to 1d to prevent expiry issues
    );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    );
};

// Generate Access and Refresh Tokens (This function is now deprecated/refactored)
// Keeping it for now as the instruction only modifies register/login
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = jwt.sign(
            { id: user._id, shopId: user.shopId, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: '7d' }
        );

        // Store refresh token in DB
        await Token.create({
            user: userId,
            refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new Error("Error generating tokens");
    }
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
    const { name, email, password, role, shopId } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        logger.warn(`Registration attempt with existing email: ${email}`);
        return res.status(400).json({ success: false, error: 'User already exists' });
    }

    try {
        const user = await User.create({
            name,
            email,
            password,
            role: (role && role !== '') ? role : 'admin',
            shopId
        });

        logger.info('[Auth] New user registered:', { id: user._id, email: user.email, role: user.role, shopId: user.shopId });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store refresh token in DB
        await Token.create({
            user: user._id,
            refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        // Set cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 mins
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        logger.info(`User registered successfully: ${email}`);
        res.status(201).json({
            success: true,
            token: accessToken, // User requested token in response
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    shopId: user.shopId,
                    role: user.role
                }
            }
        });
    } catch (error) {
        logger.error(`Registration error: ${error.message}`);
        res.status(400).json({ success: false, error: error.message });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
        logger.warn(`Failed login attempt for email: ${email}`);
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in DB
    await Token.create({
        user: user._id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Set cookies
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000 // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    logger.info(`User logged in successfully: ${email}`);
    res.json(new ApiResponse(200, {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, shopId: user.shopId },
        token: accessToken // Explicitly return token for localStorage storage
    }, "Logged in successfully"));
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
exports.refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ success: false, error: "Refresh token is required" });
    }

    const storedToken = await Token.findOne({ refreshToken });
    if (!storedToken) {
        return res.status(401).json({ success: false, error: "Invalid refresh token" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, error: "User not found" });
        }

        const accessToken = jwt.sign(
            { id: user._id, shopId: user.shopId, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.json(new ApiResponse(200, { accessToken }, "Token refreshed"));
    } catch (err) {
        return res.status(401).json({ success: false, error: "Invalid refresh token" });
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
exports.logout = asyncHandler(async (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    // Optional: Delete refresh token from DB if you want to invalidate it
    if (req.cookies.refreshToken) {
        await Token.findOneAndDelete({ refreshToken: req.cookies.refreshToken });
    }

    logger.info(`User logged out`);
    res.json(new ApiResponse(200, {}, "Logged out successfully"));
});
