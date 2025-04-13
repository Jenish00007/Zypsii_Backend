const axios = require('axios');
const { users } = require('../../../models');
const { formatPlaceApiDetails } = require('../helpers/place');

class ListPlaces {
    static async nearest(req, res) {
        try {
            const { nextPageToken } = req.query;
            const userId = req.user.id; //logged in user id

            const userDetails = await users.findById(userId); // fetch user details

            const { latitude, longitude } = userDetails.location; //latitude and longitude of user

            if (!nextPageToken) {
                const nearbySearchUrl = `${process.env.GOOGLE_PLACE_API}/nearbysearch/json?location=${latitude},${longitude}&radius=10000&key=${process.env.GOOGLE_API_KEY}`;
                const nearbyRes = await axios.get(nearbySearchUrl);
                const places = nearbyRes.data.results;

                const placeDetails = await formatPlaceApiDetails(places);

                return res.status(200).json({
                    success: true,
                    message: "Nearest place details fetched successfully",
                    nextPageToken: nearbyRes?.data?.next_page_token || null,
                    data: placeDetails
                });
            };

            if (nextPageToken) {
                console.log('how this data:', nextPageToken);
                const nearbySearchUrl = `${process.env.GOOGLE_PLACE_API}/nearbysearch/json?pagetoken=${nextPageToken}&key=${process.env.GOOGLE_API_KEY}`;

                const nearbyRes = await axios.get(nearbySearchUrl);
                const places = nearbyRes.data.results;

                const placeDetails = await formatPlaceApiDetails(places);

                return res.status(200).json({
                    success: true,
                    message: "Nearest place details with nextPageToken fetched successfully",
                    nextPageToken: nearbyRes?.data?.next_page_token || null,
                    data: placeDetails
                });
            };

        } catch (error) {
            console.error("Error fetching near by places:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        };


    };
};

module.exports = ListPlaces;