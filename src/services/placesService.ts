
"use server";

// IMPORTANT: This service is intended to be called from the server-side only (e.g., within a Genkit Flow).
// It uses an API key that should not be exposed on the client.

const API_KEY = process.env.GEMINI_API_KEY; // Use a server-side environment variable
const PLACES_API_BASE_URL = "https://maps.googleapis.com/maps/api/place";
const PLACEHOLDER_IMAGE_URL = "https://placehold.co/600x400.png";

export interface PlaceDetails {
    imageUrl: string;
    latitude: number;
    longitude: number;
}


/**
 * Finds a place using the Google Places "Find Place from Text" and "Place Details" APIs 
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
    console.warn("Server-side Google Maps API Key (GEMINI_API_KEY) is not configured. Cannot fetch place photos. Returning placeholder.");
    return defaultResult;
  }

  try {
    // 1. Find Place from Text to get place_id
    const findPlaceUrl = new URL(`${PLACES_API_BASE_URL}/findplacefromtext/json`);
    findPlaceUrl.searchParams.append("input", query);
    findPlaceUrl.searchParams.append("inputtype", "textquery");
    findPlaceUrl.searchParams.append("fields", "place_id");
    findPlaceUrl.searchParams.append("key", API_KEY);

    console.log(`[PlacesService] Finding place for query: "${query}"`);
    const findPlaceResponse = await fetch(findPlaceUrl.toString());

    if (!findPlaceResponse.ok) {
      const errorBody = await findPlaceResponse.json().catch(() => ({}));
      console.error(`[PlacesService] Find Place API error for query "${query}":`, { status: findPlaceResponse.status, statusText: findPlaceResponse.statusText, body: errorBody });
      return defaultResult;
    }

    const findPlaceData = await findPlaceResponse.json();

    if (findPlaceData.status !== "OK" || !findPlaceData.candidates || findPlaceData.candidates.length === 0) {
      console.log(`[PlacesService] No valid candidates found for query: "${query}". Status: ${findPlaceData.status}`);
      return defaultResult;
    }

    const placeId = findPlaceData.candidates[0].place_id;
    console.log(`[PlacesService] Found Place ID: ${placeId} for query: "${query}"`);

    // 2. Use place_id to get Place Details (photos and geometry)
    const detailsUrl = new URL(`${PLACES_API_BASE_URL}/details/json`);
    detailsUrl.searchParams.append("place_id", placeId);
    detailsUrl.searchParams.append("fields", "photos,geometry");
    detailsUrl.searchParams.append("key", API_KEY);

    console.log(`[PlacesService] Fetching details for Place ID: ${placeId}`);
    const detailsResponse = await fetch(detailsUrl.toString());

    if (!detailsResponse.ok) {
      const errorBody = await detailsResponse.json().catch(() => ({}));
      console.error(`[PlacesService] Place Details API error for placeId "${placeId}":`, { status: detailsResponse.status, statusText: detailsResponse.statusText, body: errorBody });
      return defaultResult;
    }

    const detailsData = await detailsResponse.json();

    if (detailsData.status !== "OK" || !detailsData.result) {
        console.log(`[PlacesService] No details found for place: "${query}" (Place ID: ${placeId}). Status: ${detailsData.status}`);
        return defaultResult;
    }

    const { photos, geometry } = detailsData.result;
    let finalImageUrl = PLACEHOLDER_IMAGE_URL;

    // 3. Construct the Photo URL if photos are available
    if (photos && photos.length > 0) {
        const photoReference = photos[0].photo_reference;
        console.log(`[PlacesService] Found photo reference: ${photoReference}`);
        const photoUrl = new URL(`${PLACES_API_BASE_URL}/photo`);
        photoUrl.searchParams.append("maxwidth", "800");
        photoUrl.searchParams.append("photoreference", photoReference);
        photoUrl.searchParams.append("key", API_KEY);
        // DO NOT follow the redirect. Return the API URL directly.
        // next/image will handle the request and receive the redirected image.
        finalImageUrl = photoUrl.toString();
        console.log(`[PlacesService] Successfully generated photo API URL for "${query}"`);
    } else {
        console.log(`[PlacesService] No photos found in details for place: "${query}" (Place ID: ${placeId}).`);
    }

    // 4. Extract coordinates
    const latitude = geometry?.location?.lat ?? defaultResult.latitude;
    const longitude = geometry?.location?.lng ?? defaultResult.longitude;

    return {
        imageUrl: finalImageUrl,
        latitude,
        longitude
    };

  } catch (error) {
    console.error(`[PlacesService] Network or other critical error fetching from Google Places API for query "${query}":`, error);
    return defaultResult;
  }
}
