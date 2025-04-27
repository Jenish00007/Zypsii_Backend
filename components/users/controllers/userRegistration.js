const { users } = require("../../../models");
const { generateUserName, hashPassword } = require("../helpers/userAuth");
const { getPlaceDetail } = require('../../schedules/helpers/place');

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

        //get the place details of the latitude and longitude
        const userPlaceDetails = await getPlaceDetail(latitude, longitude);

        // Create new user object
        const newUser = new users({
            fullName,
            userName,
            email,
            password: encryptedPassword,
            website: "",
            bio: "",
            location: { latitude, longitude },
            placeDetails: {
                name: userPlaceDetails[0]?.name || "",
                address: userPlaceDetails[0]?.address || ""
            }
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
