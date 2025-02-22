const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

interface Coordinates {
    lat: number;
    lng: number;
}

interface GeocodeResponse {
    results: {
        geometry: {
            location: Coordinates;
        };
    }[];
}

const getCoordinates = async (street: string, city: string): Promise<Coordinates | null> => {
    const address = `${street}, ${city}`;
    const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;

    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data: GeocodeResponse = await response.json();
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        return null;
    }
};

export default getCoordinates;