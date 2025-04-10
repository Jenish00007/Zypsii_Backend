const { users } = require("../../../models");
const { generateUserName, hashPassword } = require("../helpers/userAuth");

const userRegistration = async (req, res) => {
    try {
        const { fullName, email, password, latitude, longitude } = req.body;

        // Generate username and hash password
        const userName = generateUserName(fullName);
        const encryptedPassword = await hashPassword(password);

        // Check if email or username already exists
        const existingUser = await users.findOne({ $or: [{ email }, { userName }] });
        if (existingUser) {
            return res.status(400).json({ message: "Email or Username already exists" });
        }

        // Create new user object
        const newUser = new users({
            fullName,
            userName,
            email,
            password: encryptedPassword,
            website: "",
            bio: "",
            location: { latitude, longitude },
        });

        // Save user to database
        const userDetails = await newUser.save();

        return res.status(201).json({
            status: true,
            message: "User registered successfully",
            user: userDetails
        });
        
    } catch (error) {
        console.error("User registration error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = userRegistration;
