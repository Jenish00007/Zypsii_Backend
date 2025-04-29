const { story } = require('../../../models/'); // adjust if needed

class storyManage {
    // Existing createStory...

    static async listStories(req, res) {
        try {
            let { offset = 0, limit = 10 } = req.query;

            offset = parseInt(offset);
            limit = parseInt(limit);

            // Find non-deleted stories, sorted by newest first
            const stories = await story.find({ isDeleted: false })
                .sort({ createdAt: -1 }) // newest first
                .skip(offset)
                .limit(limit)
                .select('title description videoUrl thumbnailUrl createdBy tags viewsCount likesCount commentsCount createdAt') // select only necessary fields
                .populate('createdBy', 'userName') // if you want the user's name instead of just the ID
                .lean();

            // Get total count (for frontend pagination)
            const totalCount = await story.countDocuments({ isDeleted: false });

            return res.status(200).json({
                status: true,
                message: 'Stories fetched successfully',
                data: {
                    stories,
                    pagination: {
                        totalCount,
                        offset,
                        limit,
                        totalPages: Math.ceil(totalCount / limit)
                    }
                }
            });

        } catch (error) {
            console.log('Error in listStories:', error);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
                error: error.message
            });
        }
    };
    
};

module.exports = storyManage;
