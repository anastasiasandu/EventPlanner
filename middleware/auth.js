const jwt = require('jsonwebtoken');
const User = require('../models/User');

const SECRET_KEY = "your_secret_key_here"; // Replace with your actual secret key
const ALGORITHM = "HS256";

module.exports = async (req, res, next) => {
    // Get the token from the request headers if it exists
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    // Split the header to get the token
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] });
        // Add the userId to the request object after decoding the token
        req.userId = decoded.userId;
        // Proceed to the next middleware
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
