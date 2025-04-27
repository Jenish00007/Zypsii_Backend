const { posts, follows } = require('../../../models');

class PostListing {
    static async ListPostByFilter(req, res) {
        try {
            const { filter, limit = 10, offset = 0 } = req.query;

            const query = { isDeleted: false };
            let message = 'Posts fetched successfully';

            const finalPosts = [];
            let totalCount = 0;

            if (filter === "Public") {
                query.postType = "Public";
                message = 'Public posts fetched successfully';

                totalCount = await posts.countDocuments(query);

                const getPosts = await posts.find(query)
                    .skip(Number(offset))
                    .limit(Number(limit))
                    .sort({ createdAt: -1 });

                finalPosts.push(...getPosts);

            } else if (filter === "FollowersOnly") {
                query.postType = "FollowersOnly";
                message = 'Followers-only and public posts fetched successfully';

                // Fetch followers
                const getFollowers = await follows.find({
                    following: req.user.id
                }).select('followedBy');

                const followerIds = getFollowers.map(f => f?.followedBy);

                if (followerIds.length > 0) {
                    query.createdBy = { $in: followerIds };

                    // 1. Fetch FollowersOnly posts
                    const followersOnlyPostsPromise = posts.find(query)
                        .skip(Number(offset))
                        .limit(Number(limit))
                        .sort({ createdAt: -1 });

                    const followersOnlyPostsCountPromise = posts.countDocuments(query);

                    // 2. Fetch Public posts of followers
                    const publicPostQuery = {
                        createdBy: { $in: followerIds },
                        postType: "Public",
                        isDeleted: false
                    };

                    const publicPostsPromise = posts.find(publicPostQuery)
                        .skip(Number(offset))
                        .limit(Number(limit))
                        .sort({ createdAt: -1 });

                    const publicPostsCountPromise = posts.countDocuments(publicPostQuery);

                    // Execute in parallel
                    const [
                        followersOnlyPosts,
                        followersOnlyPostsCount,
                        publicPosts,
                        publicPostsCount
                    ] = await Promise.all([
                        followersOnlyPostsPromise,
                        followersOnlyPostsCountPromise,
                        publicPostsPromise,
                        publicPostsCountPromise
                    ]);

                    // Merge the posts
                    finalPosts.push(...followersOnlyPosts, ...publicPosts);

                    // totalCount = followersOnly + public
                    totalCount = followersOnlyPostsCount + publicPostsCount;
                }
            } else {
                // Default case: no filter
                totalCount = await posts.countDocuments(query);

                const getPosts = await posts.find(query)
                    .skip(Number(offset))
                    .limit(Number(limit))
                    .sort({ createdAt: -1 });

                finalPosts.push(...getPosts);
            }

            return res.status(200).json({
                success: true,
                message,
                data: finalPosts,
                totalCount,
                limit: Number(limit),
                offset: Number(offset)
            });

        } catch (error) {
            console.error("Error in ListPostByFilter:", error);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    }
}

module.exports = PostListing;
