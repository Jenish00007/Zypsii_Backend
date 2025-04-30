const { favoritePlaces } = require('../../../models'); // adjust path if needed
const { calculateDistanceInKm } = require('../../schedules/helpers/place');

class whereToGoListing {
    static async favoritePlaceListing(req, res) {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 10;
            const offset = parseInt(req.query.offset) || 0;

            // Count total favorite places
            const totalCount = await favoritePlaces.countDocuments({ createdBy: userId });

            // Fetch paginated favorite places
            const getFavoritePlaces = await favoritePlaces.find({ createdBy: userId })
                .populate('createdBy')
                .sort({ createdAt: -1 }) // Newest first
                .skip(offset)
                .limit(limit);

            let favoritePlacesData = [];

            for (let placeDetail of getFavoritePlaces) {
                const place = placeDetail.toObject(); // convert to plain object

                const { latitude, longitude } = place.createdBy.location;
                const placeLatitude = place.location.latitude;
                const placeLongitude = place.location.longitude;

                const getDistanceInKilometer = calculateDistanceInKm(latitude, longitude, placeLatitude, placeLongitude);

                delete place.createdBy; // now this works
                place.distanceInKilometer = getDistanceInKilometer;

                favoritePlacesData.push(place);
            };


            return res.status(200).json({
                status: true,
                message: "Favorite places fetched successfully",
                data: favoritePlacesData,
                pagination: {
                    totalCount,
                    limit,
                    offset,
                    totalPages: Math.ceil(totalCount / limit)
                }
            });
            
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: "Internal Server Error",
                error: error.message
            })
        }
    };
};

module.exports = whereToGoListing;