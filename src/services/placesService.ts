
"use server";

// IMPORTANT: This service uses the new Places API (v1).
// It's intended to be called from the server-side only (e.g., within a Genkit Flow).
// It uses an API key that should not be exposed on the client.

const API_KEY = process.env.GEMINI_API_KEY;
const PLACES_API_BASE_URL = "https://places.googleapis.com/v1";
const PLACEHOLDER_IMAGE_URL = "https://placehold.co/600x400.png";

export interface PlaceDetails {
  imageUrl: string;
  latitude: number;
  longitude: number;
}

/**
 * Finds a place using the new Google Places API (v1) "Text Search"
 * and returns a photo URL, latitude, and longitude.
 * @param query The search query (e.g., "Candi Borobudur").
 * @returns An object containing the photo URL, latitude, and longitude.
 */
export async function getPlaceDetails(query: string): Promise<PlaceDetails> {
  const defaultResult: PlaceDetails = {
    imageUrl: PLACEHOLDER_IMAGE_URL,
    latitude: -2.5489, // Default to center of Indonesia
    longitude: 118.0149,
  };

  if (!API_KEY) {
    console.warn(
      "Server-side Google API Key (GEMINI_API_KEY) is not configured. Cannot fetch place details. Returning placeholder."
    );
    return defaultResult;
  }

  try {
    const textSearchUrl = `${PLACES_API_BASE_URL}/places:searchText`;

    const response = await fetch(textSearchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        // FieldMask specifying the fields to be returned by the API
        "X-Goog-FieldMask": "places.id,places.location,places.photos",
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: "id" // Request results in Indonesian
      }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[PlacesService] Text Search API error for query "${query}":`, {
            status: response.status,
            body: errorBody,
        });
        return defaultResult;
    }
    
    const data = await response.json();

    if (!data.places || data.places.length === 0) {
      console.log(`[PlacesService] No places found for query: "${query}"`);
      return defaultResult;
    }

    const place = data.places[0];
    const latitude = place.location?.latitude ?? defaultResult.latitude;
    const longitude = place.location?.longitude ?? defaultResult.longitude;

    if (!place.photos || place.photos.length === 0) {
        console.log(`[PlacesService] No photos found for place: "${query}" (Place ID: ${place.id})`);
        return { ...defaultResult, latitude, longitude };
    }

    // The 'name' field from the photo object contains the resource name needed for the media URL.
    // e.g., "places/ChIJN1t_tDeuEmsRUsoyG83frY4/photos/AUac..."
    const photoName = place.photos[0].name;
    
    // Construct the photo URL using the new API format.
    const photoUrl = `${PLACES_API_BASE_URL}/${photoName}/media?key=${API_KEY}&maxHeightPx=800&maxWidthPx=800`;
    
    console.log(`[PlacesService] SUCCESS: Found photo for query "${query}". Returning real image URL.`);
    
    return {
      imageUrl: photoUrl,
      latitude,
      longitude,
    };

  } catch (error) {
    console.error(`[PlacesService] Network or other critical error fetching for query "${query}":`, error);
    return defaultResult;
  }
}
