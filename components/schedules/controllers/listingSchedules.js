const { schedules, follows, joinSchedule } = require('../../../models');
const { getPlaceDetail } = require('../helpers/place');
const { getUserDetails } = require('../../../helpers/common');

class ListingSchedules {

    static async listingMySchedules(req, res) {
        try {

            const filter = req.query.filter;

            const query = { isDeleted: false };
            const userDetails = await getUserDetails({ id: req.user.id });
            //set the query for private
            if (filter === "private") {
                query.createdBy = req.user.id
                query.visible = "Private"
            };

            //set the query for followers 
            if (filter === "followers") {
                const getFollowers = await follows.find({
                    following: req.user.id
                }).select('followedBy');

                const followerIds = getFollowers?.map(f => f?.followedBy);

                query.createdBy = { $in: followerIds };
                query.visible = "FriendOnly"
            };

            //set the query for public
            if (filter === "public") {
                query.visible = "Public"
                query.createdBy = { $ne: req.user.id }
            };

            //set the query for joined (schedules that user has joined).
            if (filter === "joined") {
                const getJoinedSchedules = await joinSchedule.find({
                    joinUserId: req.user.id,
                    isDeleted: false
                }).select('scheduleId')

                const joinedScheduleId = getJoinedSchedules?.map(schedules => schedules?.scheduleId);

                query._id = { $in: joinedScheduleId };
            };

            let getSchedules = await schedules.find(query).select('-planDescription');
            const scheduleData = [];

            //loop every schedule and get the location details of the latitude and longitude.
            for (const schedule of getSchedules) {
                const scheduleLocFromLatitude = schedule.location.from.latitude;
                const scheduleLocFromLongitude = schedule.location.from.longitude;
                const scheduleLocToLongitude = schedule.location.to.latitude;
                const scheduleLocToLatitude = schedule.location.to.longitude;
                const scheduleLocationDetails = await getPlaceDetail(userDetails.location.latitude, userDetails.location.longitude,
                    scheduleLocFromLatitude, scheduleLocFromLongitude, scheduleLocToLongitude, scheduleLocToLatitude);
            
                scheduleData.push({
                    ...schedule.toObject(),
                    locationDetails: scheduleLocationDetails
                });
            };

            return res.status(200).json({
                success: true,
                message: "Schedules retrieved successfully",
                data: scheduleData
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
};

module.exports = ListingSchedules;