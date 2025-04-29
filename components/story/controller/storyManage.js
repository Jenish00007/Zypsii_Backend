const { story } = require('../../../models/'); // adjust the path as per your structure

class storyManage {
    static async createStory(req, res) {
        try {
            const { title, description, videoUrl, thumbnailUrl, tags = [] } = req.body;

            // Validate tags: Should not contain the logged-in user name
            if (Array.isArray(tags) && tags.length > 0 && tags.includes(req.user.userName)) {
                return res.status(400).json({
                    status: false,
                    message: 'Tags should not contain the logged-in user name.'
                });
            }

            const newStory = new story({
                title,
                description,
                videoUrl,
                thumbnailUrl,
                createdBy: req?.user?.id,
                tags: tags.length > 0 ? tags : []
            });

            const saveNewStory = await newStory.save();

            if (!saveNewStory) {
                return res.status(400).json({
                    status: false,
                    message: 'Failed to create story.',
                });
            }

            return res.status(200).json({
                status: true,
                message: 'Story created successfully!',
                data: saveNewStory
            });

        } catch (error) {
            console.log('Error in createStory:', error);
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
                error: error.message
            });
        }
    }
}

module.exports = storyManage;
