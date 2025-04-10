const { follows } = require('../../../models/');

class FollowsManage { // Typo fixed: 'FollowsMange' ➜ 'FollowsManage'

    //controller for create follow a user
    static async createFollows(req, res) {
        try {
            const { userId, loggedInUserId } = req.params;

            const validateFollow = await follows.findOne({
                followedBy: loggedInUserId,
                following: userId
            })

            if(validateFollow){
                return res.status(400).json({ message: 'You already follow this user' });
            };
            
            // Create and save follow document
            const newFollow = new follows({
                followedBy: loggedInUserId,
                following: userId
            });

            const savedFollow = await newFollow.save();

            if (!savedFollow) {
                return res.status(400).json({ message: 'Follow unsuccessful' });
            }

            return res.status(201).json({
                status: true,
                message: 'Followed Successfully',
                follow: savedFollow
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: error.message
            });
        }
    };

    //controller for delete follow a user
    static async unFollow(req, res) {
        try{
            const { userId, loggedInUserId } = req.params;

            const deleteFollow = await follows.findOneAndDelete({ followedBy: loggedInUserId, following: userId });

            if(!deleteFollow){
                return res.status(404).json({ message: 'Not Found' });
            };

            return res.status(200).json({
                status: true,
                message: 'unFollowed Successfully'
            });

        }catch(error){
            console.log(error);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: error.message
            });
        };
    };

}

module.exports = FollowsManage;
