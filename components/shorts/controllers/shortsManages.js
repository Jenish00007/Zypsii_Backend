const { shorts } = require('../../../models/');

class shortsManage {
    static async createShorts(req, res) {
        try {
            const { title, description, videoUrl, thumbnailUrl, tags = [] } = req.body;

            // validate the tags name not the logged in user.
            if (Array.isArray(tags) && tags.length > 0 && tags.includes(req.user.userName)) {
                return res.status(400).json({
                    status: false,
                    message: 'Tags should not contain the logged-in user name.'
                });
            }

            const newShorts = new shorts({
                title,
                description,
                videoUrl,
                thumbnailUrl,
                createdBy: req?.user?.id,
                tags: tags.length > 0 ? tags : null
            });

            const saveNewShorts = await newShorts.save();

            if (!saveNewShorts) {
                return res.status(400).json({
                    status: false,
                    message: 'New shorts has not saved.',
                })
            };

            return res.status(200).json({
                status: true,
                message: 'Successfully added the shorts',
                data: saveNewShorts
            });

        } catch (error) {
            console.log('Error In shorts:', error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    }
};

module.exports = shortsManage;