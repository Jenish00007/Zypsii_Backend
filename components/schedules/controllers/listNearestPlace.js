const axios = require('axios');
const { users } = require('../../../models');
const { formatPlaceApiDetails } = require('../helpers/place');

class ListPlaces {
    static async nearest(req, res) {
        try {
            const { nextPageToken, searchPlaceName, bestDestination, ...filters } = req.query;
            const userId = req.user.id; //logged in user id

            const userDetails = await users.findById(userId); // fetch user details

            const { latitude, longitude } = userDetails.location; //latitude and longitude of user

            let nearbySearchUrl;
            let textMessage;

            // Build filter query string dynamically (e.g., &type=restaurant&keyword=pizza)
            const filterQuery = Object.entries(filters)
                .filter(([key, value]) => key !== 'nextPageToken' && key !== 'searchPlaceName' && value)
                .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
                .join('&');

            const nearbySearchUrls = {
                underTenKiloMeter: `${process.env.GOOGLE_PLACE_API}/nearbysearch/json?location=${latitude},${longitude}&radius=10000${filterQuery ? `&${filterQuery}` : ''}&key=${process.env.GOOGLE_API_KEY}`,
                nextPageToken: `${process.env.GOOGLE_PLACE_API}/nearbysearch/json?pagetoken=${nextPageToken}&key=${process.env.GOOGLE_API_KEY}`,
                searchPlaceName: `${process.env.GOOGLE_PLACE_API}/textsearch/json?query=${encodeURIComponent(searchPlaceName)}
                                    &location=${latitude},${longitude}&radius=10000&key=${process.env.GOOGLE_API_KEY}`,
            };

            if (nextPageToken) {
                nearbySearchUrl = nearbySearchUrls.nextPageToken;
                textMessage = 'Place details with the nextPageToken';
            } else if (searchPlaceName) {
                nearbySearchUrl = nearbySearchUrls.searchPlaceName;
                textMessage = 'Place details based on the search';
            } else {
                nearbySearchUrl = nearbySearchUrls.underTenKiloMeter;
                textMessage = 'Nearest place details fetched successfully';
            };

            const coordinates = {
                fromLatitude: latitude,
                fromLongitude: longitude
            };

            let placeDetails;
            const nearbyRes = await axios.get(nearbySearchUrl);
            const places = nearbyRes.data.results;

            if (bestDestination) {
                // Filter only places above 3.5 rating
                const filteredPlaces = places.filter(place => place.rating >= 3.5);
                // Sort by rating (highest first)
                const sortedPlaces = filteredPlaces.sort((a, b) => b.rating - a.rating);
                placeDetails = await formatPlaceApiDetails(sortedPlaces, coordinates);
            } else {
                placeDetails = await formatPlaceApiDetails(places, coordinates);
            };


            return res.status(200).json({
                success: true,
                message: textMessage,
                nextPageToken: nearbyRes?.data?.next_page_token || null,
                data: placeDetails
            });

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