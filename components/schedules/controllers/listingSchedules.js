const { schedules } = require('../../../models');

class ListingSchedules {

    static async listingMySchedules(req, res) {
        try {
            const getSchedules = await schedules.findAll({
                where: {
                    createdBy: req.user.id,
                    isDeleted: false
                }
            });

            return res.status(200).json({
                success: true,
                message: "Schedules retrieved successfully",
                data: getSchedules
            });

        } catch (error) {
            console.error("Error fetching schedules:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        };
    };

    static async listingSchedulesByUser(req, res) {
        try {

            // Convert `visible` param to a proper boolean
            let visibleValue = req.params.visible;
            if (visibleValue) {
                visibleValue = visibleValue.trim().toLowerCase();
            };

            const query = {
                userId: req.params.userId,
                isDeleted: false
            };

            // Add visible filter if it's provided
            if (req.params.visible) {
                query.visible = visibleValue;
            };

            // Correct Sequelize query structure
            const getSchedules = await schedules.findAll({ where: query });

            return res.status(200).json({
                success: true,
                message: "Schedules retrieved successfully",
                data: getSchedules
            });

        } catch (errors) {
            console.error("Error fetching schedules by user:", errors);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: errors.message
            });
        };
    };

};

module.exports = ListingSchedules;