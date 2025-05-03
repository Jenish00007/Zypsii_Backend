const axios = require('axios');
const { users } = require('../../../models');
const { formatPlaceApiDetails, getDistanceAndTime } = require('../helpers/place');

class ListPlaces {
    static async nearest(req, res) {
        try {
            const { nextPageToken, recommendSchedules, searchPlaceName, bestDestination, ...filters } = req.query;
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


            if (recommendSchedules) {
                const generatedRecommendedSchedules = []
                for (const place of placeDetails) {
                    const origin = `${userDetails.location.latitude},${userDetails.location.longitude}`;
                    const destination = `${place.location.lat},${place.location.lng}`;
                    const travelTimeAndDistance = await getDistanceAndTime(origin, destination);

                    const durationValue = travelTimeAndDistance.rows[0].elements[0].duration.value; // in seconds
                    const now = new Date();

                    let fromDate = now;
                    let endDate = new Date(now.getTime() + durationValue * 1000);

                    const durationInHours = durationValue / 3600;

                    if (durationInHours > 24) {
                        fromDate = new Date(now.setHours(0, 0, 0, 0));
                        const days = Math.ceil(durationInHours / 24);
                        endDate = new Date(fromDate);
                        endDate.setDate(fromDate.getDate() + days);
                    }

                    const scheduleCreateStructure = {
                        createdBy: req.user.id,
                        bannerImage: place?.image,
                        tripName: `Travel to ${place.name}`,
                        travelMode: 'Bike',
                        location: {
                            from: {
                                latitude: userDetails.location.latitude,
                                longitude: userDetails.location.longitude
                            },
                            to: {
                                latitude: place.location.lat,
                                longitude: place.location.lng
                            }
                        },
                        placeDetails: {
                            from: {
                                name: userDetails.placeDetails.name,
                                address: userDetails.placeDetails.address,
                            },
                            to: {
                                name: place.name,
                                address: place.address,
                                rating: place.rating,
                                distanceInKilometer: place.distanceInKilometer
                            }
                        },
                        travelDurationAndDetails: travelTimeAndDistance.rows[0].elements[0],
                        Dates: {
                            from: fromDate,
                            end: endDate
                        },
                    };

                    generatedRecommendedSchedules.push(scheduleCreateStructure);
                }

                return res.status(200).json({
                    success: true,
                    message: 'Schedule recommendation data',
                    nextPageToken: nearbyRes?.data?.next_page_token || null,
                    data: generatedRecommendedSchedules
                });

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