const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is missing' });
    }

    try {
        console.log("jwt.verify(token, JWT_SECRET)", jwt.verify(token, JWT_SECRET));
        const { userId } = jwt.verify(token, JWT_SECRET);
        req.user = userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token. User not authenticated.' });
    }
};

module.exports = authenticateToken;
