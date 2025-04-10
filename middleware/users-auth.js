const jwt = require("jsonwebtoken")

const AuthenticateUserToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        //token is invalid
        if (err) return res.sendStatus(401)
        req.user = user
        next()
    })
};

const verifyUserToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Extract token after "Bearer"

    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }

        req.user = user; // Attach user details to request
        next(); // Proceed to the next middleware/controller
    });
};

module.exports = {
    AuthenticateUserToken,
    verifyUserToken
}