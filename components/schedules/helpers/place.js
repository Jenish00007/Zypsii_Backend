const mongoose = require("mongoose");

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

module.exports = { formatPlaceApiDetails };