
"use server";

// IMPORTANT: This service is intended to be called from the server-side only (e.g., within a Genkit Flow).
// It uses an API key that should not be exposed on the client.

const API_KEY = process.env.GEMINI_API_KEY; // Use a server-side environment variable
const PLACES_API_BASE_URL = "https://maps.googleapis.com/maps/api/place";
const PLACEHOLDER_IMAGE_URL = "https://placehold.co/600x400.png";

/**
 * Finds a place using the Google Places "Find Place from Text" API and returns a photo URL.
 * @param query The search query (e.g., "Candi Borobudur").
 * @returns The URL of the first photo found, or a placeholder URL if no photo is available or an error occurs.
 */
export async function getPlacePhotoUrl(query: string): Promise<string> {
  if (!API_KEY) {
    console.warn("Server-side Google Maps API Key (GEMINI_API_KEY) is not configured. Cannot fetch place photos. Returning placeholder.");
    return PLACEHOLDER_IMAGE_URL;
  }

  // 1. Find Place from Text to get place_id
  const findPlaceUrl = new URL(`${PLACES_API_BASE_URL}/findplacefromtext/json`);
  findPlaceUrl.searchParams.append("input", query);
  findPlaceUrl.searchParams.append("inputtype", "textquery");
  findPlaceUrl.searchParams.append("fields", "place_id,photos");
  findPlaceUrl.searchParams.append("key", API_KEY);

  try {
    const findPlaceResponse = await fetch(findPlaceUrl.toString());

    if (!findPlaceResponse.ok) {
      const errorBody = await findPlaceResponse.json().catch(() => ({}));
      console.error(`Places API (findplace) HTTP error for query "${query}":`, {
        status: findPlaceResponse.status,
        statusText: findPlaceResponse.statusText,
        body: errorBody,
      });
      return PLACEHOLDER_IMAGE_URL;
    }

    const findPlaceData = await findPlaceResponse.json();

    if (findPlaceData.status !== "OK" || !findPlaceData.candidates || findPlaceData.candidates.length === 0) {
      console.log(`No valid candidates found for query: "${query}". Status: ${findPlaceData.status}`);
      return PLACEHOLDER_IMAGE_URL;
    }

    const place = findPlaceData.candidates[0];

    if (!place.photos || place.photos.length === 0) {
      console.log(`No photos found for place: "${query}" (Place ID: ${place.place_id})`);
      return PLACEHOLDER_IMAGE_URL;
    }
    
    // 2. Construct the Photo URL using the photo_reference
    const photoReference = place.photos[0].photo_reference;
    const photoUrl = new URL(`${PLACES_API_BASE_URL}/photo`);
    photoUrl.searchParams.append("maxwidth", "800");
    photoUrl.searchParams.append("photoreference", photoReference);
    photoUrl.searchParams.append("key", API_KEY); // The key is also required for the photo request

    return photoUrl.toString();

  } catch (error) {
    console.error(`Network or other critical error fetching from Google Places API for query "${query}":`, error);
    return PLACEHOLDER_IMAGE_URL;
  }
}
