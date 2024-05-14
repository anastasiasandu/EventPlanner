// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Get the token from the request headers
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, 'secretkey');
        // Add the userId to the request object
        req.userId = decoded.userId;
        // Proceed to the next middleware
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
