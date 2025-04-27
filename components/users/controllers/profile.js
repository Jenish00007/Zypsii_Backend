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


    // Get Profile details
    static getProfileDetails = async (req, res) => {
        try {
            const { search, filter, page = 1, limit = 10 } = req.query;

            const query = { isDeleted: false };

            if (filter === 'users' && search) {
                query.$or = [
                    { fullName: { $regex: search, $options: 'i' } },
                    { userName: { $regex: search, $options: 'i' } }
                ];
            }

            if (filter === 'place' && search) {
                query.$or = [
                    { 'placeDetails.name': { $regex: search, $options: 'i' } },
                    { 'placeDetails.address': { $regex: search, $options: 'i' } }
                ];
            }

            if (!filter && !search) {
                query._id = req.user.id;
            }

            const skip = (parseInt(page) - 1) * parseInt(limit);

            let userProfileQuery = users.find(query)
                .select('fullName userName email website bio location profilePicture placeDetails');

            // Apply pagination only if filter is users or place
            if (filter === 'users' || filter === 'place') {
                userProfileQuery = userProfileQuery.skip(skip).limit(parseInt(limit));
            }

            // Execute queries
            const [userProfile, totalCount] = await Promise.all([
                userProfileQuery,
                users.countDocuments(query)
            ]);

            if (!userProfile || (Array.isArray(userProfile) && userProfile.length === 0)) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const totalPages = Math.ceil(totalCount / parseInt(limit));

            return res.status(200).json({
                success: true,
                message: "Profile details retrieved successfully",
                data: userProfile,
                pagination: {
                    totalCount,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });

        } catch (errors) {
            console.error("Error listing profile details:", errors.message);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: errors.message
            });
        }
    };


}

module.exports = Profile;