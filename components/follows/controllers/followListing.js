const { follows } = require('../../../models/');
const mongoose = require('mongoose');

class FollowListing {

    // Get the followers of the logged-in user
    static async getFollowers(req, res) {
        try {
            
            const userId = new mongoose.Types.ObjectId(req.params.userId);

            const followersList = await follows.find({
                following: userId,
            }).populate('followedBy');

            // Filter out soft-deleted users
            const filteredFollowers = followersList
                .map(follow => follow.followedBy)
                .filter(user => user && user.isDeleted === false)
                .map(user =>{
                    const userObject = user.toObject();
                    delete userObject.password;
                    return userObject;
                });

            if (!filteredFollowers.length) {
                return res.status(404).json({ message: "No followers found" });
            };

            return res.status(200).json({
                status: true,
                message: "List of followers",
                followers: filteredFollowers,
                followersCount: filteredFollowers.length
            });

        } catch (error) {
            console.error("Error fetching followers:", error);
            return res.status(500).json({
                status: false,
                message: "Internal Server Error"
            });
        }
    };


    //Get the followings of logged-in user
    static async getFollowings(req, res) {
        try {
            const userId = new mongoose.Types.ObjectId(req.params.userId);

            const followingList = await follows.find({
                followedBy: userId
            }).populate('following');

            // Filter out soft-deleted users
            const filterFollowingList = followingList
                .map(follow => follow.following)
                .filter(user => user && user.isDeleted === false)
                .map(user => {
                    const userObject = user.toObject();
                    delete userObject.password;
                    return userObject;
                });

            if (!filterFollowingList.length) {
                return res.status(404).json({ message: "No followers found" });
            };

            return res.status(200).json({
                status: true,
                message: "List of following",
                following: filterFollowingList,
                followingCount: filterFollowingList.length
            });

        } catch (error) {
            return res.status(500).json({
                status: false,
                message: "Internal Server Error"
            });
        };
    };

};

module.exports = FollowListing;