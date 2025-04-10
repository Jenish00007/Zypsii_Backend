import axios from 'axios';

const getPlaceDetailsByLatLng = async (lat, lng) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    try {
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'nirmal/1.0 (nirmalchan6@gmail.com)' } // Required
        });

        if (response.data && response.data.display_name) {
            return response.data; // Full location data
        } else {
            throw new Error("No data found for the given coordinates.");
        }
    } catch (error) {
        console.error("Error fetching place details:", error.message);
        return null;
    }
};

// Example Usage
getPlaceDetailsByLatLng(8.0844, 77.5495).then(data => console.log(data));
