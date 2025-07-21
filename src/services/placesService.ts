
"use server";

// IMPORTANT: This service is intended to be called from the server-side only (e.g., within a Genkit Flow).
// It uses an API key that should not be exposed on the client.

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const PLACES_API_BASE_URL = "https://maps.googleapis.com/maps/api/place";

/**
 * Finds a place using the Google Places "Find Place from Text" API and returns a photo URL.
 * @param query The search query (e.g., "Candi Borobudur").
 * @returns The URL of the first photo found, or an empty string if no photo is available.
 */
export async function getPlacePhotoUrl(query: string): Promise<string> {
  if (!API_KEY) {
    console.warn("Google Maps API Key is not configured. Cannot fetch place photos.");
    return "";
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
      const errorBody = await findPlaceResponse.json();
      console.error(`Places API (findplace) error for query "${query}":`, errorBody);
      return "";
    }
    const findPlaceData = await findPlaceResponse.json();

    if (findPlaceData.status !== "OK" || !findPlaceData.candidates || findPlaceData.candidates.length === 0) {
      console.log(`No candidates found for query: "${query}"`);
      return "";
    }

    const place = findPlaceData.candidates[0];

    if (!place.photos || place.photos.length === 0) {
      console.log(`No photos found for place: "${query}" (Place ID: ${place.place_id})`);
      return "";
    }
    
    // 2. Construct the Photo URL using the photo_reference
    const photoReference = place.photos[0].photo_reference;
    const photoUrl = new URL(`${PLACES_API_BASE_URL}/photo`);
    photoUrl.searchParams.append("maxwidth", "800"); // Request a reasonable size
    photoUrl.searchParams.append("photoreference", photoReference);
    photoUrl.searchParams.append("key", API_KEY);

    return photoUrl.toString();

  } catch (error) {
    console.error("Error fetching from Google Places API:", error);
    return "";
  }
}
