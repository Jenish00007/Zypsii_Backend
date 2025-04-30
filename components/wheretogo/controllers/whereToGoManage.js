
const { favoritePlaces } = require('../../../models'); // adjust path if needed

class wereToGoController {
    static async saveFavoritePlace(req, res) {
        try {
            const { name, image, latitude, longitude, address, rating } = req.body;

            // Validate required fields
            if (!name || !latitude || !longitude) {
                return res.status(400).json({
                    status: false,
                    message: "name, latitude, and longitude are required.",
                });
            }

            // Create a new favorite place
            const newFavorite = new favoritePlaces({
                createdBy: req.user.id,
                name,
                image,
                location: {
                    latitude,
                    longitude
                },
                address,
                rating
            });

            await newFavorite.save();

            return res.status(201).json({
                status: true,
                message: "Favorite place saved successfully.",
                data: newFavorite
            });

        } catch (error) {
            return res.status(500).json({
                status: false,
                message: "Internal Server Error",
                error: error.message
            })
        };
    };
};

module.exports = wereToGoController;
