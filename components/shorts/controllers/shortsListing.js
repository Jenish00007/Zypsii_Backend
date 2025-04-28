const { shorts } = require('../../../models/');

class listingSchedule {

    static async listShorts(req, res) {
        try {
            let { limit, offset } = req.query;

            // Default pagination values if not provided
            limit = parseInt(limit) || 10;
            offset = parseInt(offset) || 0;

            const filter = { isDeleted: false };

            const shortsList = await shorts.find(filter)
                .sort({ createdAt: -1 }) // latest shorts first
                .skip(offset)
                .limit(limit)
                .select('-isDeleted') // Exclude isDeleted field from results
                .lean();

            const totalShorts = await shorts.countDocuments(filter);

            return res.status(200).json({
                status: true,
                message: 'Shorts fetched successfully',
                data: shortsList,
                pagination: {
                    total: totalShorts,
                    limit,
                    offset,
                    totalPages: Math.ceil(totalShorts / limit)
                }
            });
        } catch (error) {
            console.log('Error In listing shorts:', error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    };

};

module.exports = listingSchedule;