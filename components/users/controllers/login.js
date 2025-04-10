const { users } = require("../../../models");
const { getUserDetails } = require('../../../helpers/');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * User login controller
 */
const login = async (req, res) => {
    try {
        const { userNameOrEmail, password } = req.body;

        // Determine whether input is an email or username
        const isEmail = userNameOrEmail.includes('@');

        // Fetch user details using the correct identifier
        const user = await getUserDetails({
            id: undefined,
            email: isEmail ? userNameOrEmail : undefined,
            userName: isEmail ? undefined : userNameOrEmail
        });

        if (!user) {
            return res.status(400).json({
                status: false,
                message: "User not found"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                status: false,
                message: "Incorrect Password"
            });
        }

        // Generate JWT token
        const payload = {
            id: user._id,
            email: user.email,
            userName: user.userName
        };

        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "72h" });

        return res.status(200).json({
            status: true,
            message: "Login successfully",
            token: accessToken,
            userDetails: user
        });

    } catch (errors) {
        console.error('Error in user login:', errors);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = login;
