const mongoose = require("mongoose");
const axios = require('axios');

//function for make the format proper
const formatPlaceApiDetails = async (places, coordinates = undefined) => {
    // Map through places to get required fields
    const formattedPlaces = places.map(place => {
        const photoReference = place.photos?.[0]?.photo_reference;
        const imageUrl = photoReference
            ? `${process.env.GOOGLE_PLACE_API}/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.GOOGLE_API_KEY}`
            : null;

        // function call and get the distance value in kilometer or meters
        const distanceData = calculateDistanceInKm(coordinates?.fromLatitude, coordinates?.fromLongitude, place?.geometry?.location?.lat, place?.geometry?.location?.lng);

        return {
            _id: new mongoose.Types.ObjectId(),
            name: place.name,
            image: imageUrl,
            location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
            },
            address: place.vicinity || "Address not available",
            rating: place.rating || "No rating",
            distanceInKilometer: distanceData
        };
    });

    return formattedPlaces;
};

//function for calculate the distance in based on the km
const calculateDistanceInKm = (fromLatitude, fromLongitude, toLatitude, toLongitude) => {

    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(toLatitude - fromLatitude);
    const dLon = toRadians(toLongitude - fromLongitude);

    const lat1 = toRadians(fromLatitude);
    const lat2 = toRadians(toLatitude);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    //make the value in proper kilometer or in meters
    const distanceData = parseFloat(distance);

    if (distanceData >= 1) {
        // Round to 2 decimal places for kilometers
        return `${distanceData.toFixed(2)} km`;
    } else {
        // Convert to meters and round to nearest whole number
        const meters = Math.round(distanceData * 1000);
        return `${meters} m`;
    }

};

//function return the place details fdr schedule latitude and longitude.
const getPlaceDetail = async (userLatitude, userLongitude, fromLatitude = undefined, fromLongitude = undefined, toLatitude = undefined, toLongitude = undefined) => {
    try {
        let places = [];
        let scheduleDetails = [];
        //for get only one place details
        if (fromLatitude && fromLongitude && !fromLatitude && !fromLongitude) {
            const googleURL = `${process.env.GOOGLE_GEO_LOCATION_API}?latlng=${fromLatitude},${fromLongitude}&key=${process.env.GOOGLE_API_KEY}`;
            const res = await axios.get(googleURL);
            places.push(...res?.data?.results[0]);
        };

        //for get the two pair place details
        if (fromLatitude && fromLongitude && toLatitude && toLongitude) {
            const coords = [
                [fromLatitude, fromLongitude],
                [toLatitude, toLongitude]
            ];

            for (let i = 0; i < coords.length; i++) {
                const [lat, lng] = coords[i];
                const url = `${process.env.GOOGLE_GEO_LOCATION_API}?latlng=${lat},${lng}&key=${process.env.GOOGLE_API_KEY}`
                const res = await axios.get(url);
                // console.log('what is the data in the :res :', res.data.results)
                places.push(res?.data?.results[0]);
            };
        };

        // Map through places to get required fields
        places.map(place => {
            // function call and get the distance value in kilometer or meters
            const distanceData = calculateDistanceInKm(userLatitude, userLongitude, place.geometry.location.lat, place.geometry.location.lng);
            // Extract a meaningful place name
            const addressComponents = place.address_components || [];

            const localityComponent = addressComponents.find(comp => comp.types.includes("locality"));
            const fallbackComponent = addressComponents.find(comp => comp.types.includes("administrative_area_level_3")) ||
                addressComponents.find(comp => comp.types.includes("administrative_area_level_1"));

            const placeName = localityComponent?.long_name || fallbackComponent?.long_name || place.formatted_address;

            const formattedPlace = {
                _id: new mongoose.Types.ObjectId(),
                name: placeName,
                address: place.formatted_address || "Address not available",
                // image: imageUrl,
                location: {
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng,
                },
                address: place.formatted_address || "Address not available",
                distanceInKilometer: distanceData
            };

            scheduleDetails.push(formattedPlace);
        });

        return scheduleDetails;

    } catch (error) {
        console.error("Error in getPlaceDetail:", error.message);
        throw error
    };
};

module.exports = { formatPlaceApiDetails, getPlaceDetail };