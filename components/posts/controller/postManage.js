const { posts } = require('../../../models/');


class PostManage {
    static async createPost(req, res) {
        try {
            const { postTitle, postType, mediaType, mediaUrl, tags } = req.body;

            //validate the tags name not the logged in user.
            if (tags.length > 0 && tags.includes(req.user.userName)) {
                return res.status(400).json({
                    status: false,
                    message: 'Tags should not contain the logged-in user name.'
                });
            };

            const newPost = new posts({
                postTitle,
                postType,
                mediaType,
                mediaUrl,
                createdBy: req.user.id,
                tags: tags.length > 0 ? tags : null
            });

            const saveNewPost = await newPost.save();

            if (!saveNewPost) {
                return res.status(400).json({
                    status: false,
                    message: 'New post has not saved.',
                })
            };

            return res.status(200).json({
                status: true,
                message: 'New Post saved successfully',
                data: saveNewPost
            });

        } catch (error) {
            console.error("Error creating post:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        };
    };
};

module.exports = PostManage;