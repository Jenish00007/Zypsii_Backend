const { users } = require("../../../models");
const { getPlaceDetail } = require('../../schedules/helpers/place');

class userLocationController {
    static async updateLiveLocation(req, res) {
        try {
            const { latitude, longitude } = req.body;

            //get the place details of the latitude and longitude
            const userPlaceDetails = await getPlaceDetail(latitude, longitude);
            if (!userPlaceDetails[0]) {
                return res.status(400).json({
                    status: false,
                    message: 'Not able to fetch the place details.'
                })
            };

            //update the location details
            const updateUser = await users.findOneAndUpdate(
                { _id: req.user.id },
                {
                    $set: {
                        location: {
                            latitude: latitude,
                            longitude: longitude
                        },
                        placeDetails: {
                            name: userPlaceDetails[0]?.name || "",
                            address: userPlaceDetails[0]?.address || ""
                        }
                    }
                }, { new: true }
            );
            if (!updateUser) {
                return res.status(400).json({
                    status: false,
                    message: 'Location not updated'
                })
            };

            return res.status(200).json({
                status: true,
                message: 'Location details updated successfully',
            });

        } catch (error) {
            console.error("Error updating live location:", error.message);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    };

};

module.exports = userLocationController;