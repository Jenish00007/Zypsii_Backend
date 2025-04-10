const jwt = require("jsonwebtoken")
const { users } = require('../models')

const AuthenticateUserToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"]
        const token = authHeader && authHeader.split(" ")[1]

        if (!token) {
            return res.status(401).json({ message: 'No token provided' })
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log('Decoded token:', decoded); // Debug log

        // The token payload contains id, email, and userName
        const user = await users.findById(decoded.id)

        if (!user) {
            return res.status(401).json({ message: 'User not found' })
        }

        req.user = user
        next()
    } catch (error) {
        console.error('Auth middleware error:', error)
        return res.status(401).json({ 
            message: 'Invalid token',
            error: error.message 
        })
    }
}

module.exports = {
    AuthenticateUserToken
}