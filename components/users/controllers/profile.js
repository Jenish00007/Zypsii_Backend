const { users } = require('../../../models/');
const { uploadCloudInAry } = require('../../../helpers/cloudinary')

class Profile {

    // Controller for editing profile
    static editProfile = async (req, res) => {
        try {
            const { fullName, website, bio, location } = req.body;
            let profilePic;

            // Handle profile picture upload if a new file is provided
            if (req.file) {
                const uploadedUrls = await uploadCloudInAry([req.file]);
                profilePic = uploadedUrls[0];
            }

            // Create an update object with only provided fields
            const updateData = {};
            if (fullName) updateData.fullName = fullName;
            if (website) updateData.website = website;
            if (bio) updateData.bio = bio;
            if (location) updateData.location = location;
            if (profilePic) updateData.profilePicture = profilePic;

            // Update profile while keeping other fields unchanged
            const updatedUser = await users.findByIdAndUpdate(
                req.user.id,
                { $set: updateData }, // Only update provided fields
                { new: true, runValidators: true } // Return updated document & validate input
            );

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: updatedUser
            });

        } catch (errors) {
            console.error("Error updating profile:", errors.message);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: errors.message
            });
        }
    };


    //get Profile details
    static getProfileDetails = async (req, res) => {
        try {

            const userProfile = await users.findOne(
                { 
                    _id: req.user.id,
                    isDeleted: false
                }
            ).select('fullName userName email website bio location profilePicture');

            // Check if user exists
            if (!userProfile) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            };

            // Send successful response
            return res.status(200).json({
                success: true,
                message: "Profile details retrieved successfully",
                data: userProfile
            });

        } catch (errors) {
            console.error("Error listing profile details:", errors.message);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: errors.message
            });
        };
    };
}

module.exports = Profile;