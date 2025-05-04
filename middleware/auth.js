const jwt = require('jsonwebtoken');
const { users } = require('../models');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(decoded,"decoded");
        const user = await users.findOne({ id: decoded.Id });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = auth; 