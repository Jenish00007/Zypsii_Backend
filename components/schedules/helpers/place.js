const formatPlaceApiDetails = async (places) => {

    // Map through places to get required fields
    const formattedPlaces = places.map(place => {
        const photoReference = place.photos?.[0]?.photo_reference;
        const imageUrl = photoReference
            ? `${process.env.GOOGLE_PLACE_API}/photo?maxwidth=400&photoreference=${photoReference}&key=${process.env.GOOGLE_API_KEY}`
            : null;

        return {
            name: place.name,
            image: imageUrl,
            location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
            },
            address: place.vicinity || "Address not available",
            rating: place.rating || "No rating"
        };
    });

    return formattedPlaces;
};

module.exports = { formatPlaceApiDetails };