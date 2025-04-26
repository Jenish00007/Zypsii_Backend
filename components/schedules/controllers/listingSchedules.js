const { schedules, follows, joinSchedule } = require('../../../models');
const { getPlaceDetail } = require('../helpers/place');
const { getUserDetails } = require('../../../helpers/common');

class ListingSchedules {

    static async listingMySchedules(req, res) {
        try {
            const { filter } = req.query;
            const offset = parseInt(req.query.offset) || 0;
            const limit = parseInt(req.query.limit) || 10;

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

            // Get total count for pagination
            const totalCount = await schedules.countDocuments(query);

            //fetch the schedules
            let getSchedules = await schedules
                .find(query)
                .select('-planDescription')
                .skip(offset)
                .limit(limit);

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
                data: scheduleData,
                totalCount: totalCount,
                limit: limit,
                offset: offset
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

    static async scheduleDescription(req, res) {
        try {
            const { scheduleId } = req.params;
            const { limit, offset } = req.query;

            const parsedOffset = parseInt(offset) || 0;
            const parsedLimit = parseInt(limit) || 10;

            const query = {
                _id: scheduleId,
                createdBy: req.user.id
            }

            //user data 
            const fetchUserDetails = await getUserDetails({ id: req.user.id });

            const { latitude, longitude } = fetchUserDetails?.location; //user latitude and longitude

            if (!fetchUserDetails) {
                return res.status(400).json({
                    success: false,
                    message: "User Not exists",
                })
            };

            //validate scheduleId belong to the user
            const checkSchedule = await schedules.findOne(query);

            if (!checkSchedule) {
                return res.status(400).json({
                    success: false,
                    message: "Schedule is not belong to the user logged in",
                })
            };

            //query for get the details of the schedule description.
            const getSchedulesDescription = await schedules.findOne(query)
                .select('planDescription')

            if (!getSchedulesDescription || !Array.isArray(getSchedulesDescription.planDescription)) {
                return res.status(404).json({
                    success: false,
                    message: "No schedule description found",
                });
            }

            // Slice the planDescription array based on offset & limit
            const slicedDescriptions = getSchedulesDescription?.planDescription?.slice(parsedOffset, parsedOffset + parsedLimit);

            let formattedDescriptions = [];

            for (const descriptions of slicedDescriptions) {
                const descriptionLocFromLat = descriptions?.location?.from?.latitude;
                const descriptionLocFromLog = descriptions?.location?.from?.longitude;
                const descriptionLocToLat = descriptions?.location?.to?.latitude;
                const descriptionLocToLog = descriptions?.location?.to?.longitude;

                const getDescriptionLocationDetails = await getPlaceDetail(latitude, longitude,
                    descriptionLocFromLat, descriptionLocFromLog,
                    descriptionLocToLat, descriptionLocToLog
                );

                const formattedDescription = {
                    _id: descriptions._id,
                    Description: descriptions?.Description,
                    date: descriptions?.date,
                    planDescription: getDescriptionLocationDetails,
                }

                formattedDescriptions.push(formattedDescription);
            };

            return res.status(200).json({
                success: true,
                message: "Schedules description retrieved successfully",
                data: formattedDescriptions,
                pagination: {
                    offset: parsedOffset,
                    limit: parsedLimit,
                    totalCount: getSchedulesDescription.planDescription.length,
                }
            })

        } catch (error) {
            console.log('Error in the schedule description listing :', error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: error.message
            });
        }
    };
};

module.exports = ListingSchedules;