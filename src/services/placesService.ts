
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
 * It attempts a secondary, more specific query if the first one fails to find photos.
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

  // List of queries to try. Start with the original, then try a more specific one.
  const queriesToTry = [query, `wisata ${query}`];

  for (const currentQuery of queriesToTry) {
    try {
      console.log(`[PlacesService] Attempting to find place with query: "${currentQuery}"`);
      
      // 1. Find Place from Text to get place_id
      const findPlaceUrl = new URL(`${PLACES_API_BASE_URL}/findplacefromtext/json`);
      findPlaceUrl.searchParams.append("input", currentQuery);
      findPlaceUrl.searchParams.append("inputtype", "textquery");
      findPlaceUrl.searchParams.append("fields", "place_id,geometry"); // Also request geometry here
      findPlaceUrl.searchParams.append("key", API_KEY);

      const findPlaceResponse = await fetch(findPlaceUrl.toString());
      if (!findPlaceResponse.ok) {
        console.error(`[PlacesService] Find Place API error for query "${currentQuery}":`, { status: findPlaceResponse.status });
        continue; // Try the next query
      }

      const findPlaceData = await findPlaceResponse.json();
      if (findPlaceData.status !== "OK" || !findPlaceData.candidates || findPlaceData.candidates.length === 0) {
        console.log(`[PlacesService] No valid candidates found for query: "${currentQuery}". Status: ${findPlaceData.status}`);
        continue; // Try the next query
      }
      
      const { place_id, geometry } = findPlaceData.candidates[0];
      const latitude = geometry?.location?.lat ?? defaultResult.latitude;
      const longitude = geometry?.location?.lng ?? defaultResult.longitude;

      console.log(`[PlacesService] Found Place ID: ${place_id} for query: "${currentQuery}"`);

      // 2. Use place_id to get Place Details (specifically for photos)
      const detailsUrl = new URL(`${PLACES_API_BASE_URL}/details/json`);
      detailsUrl.searchParams.append("place_id", place_id);
      detailsUrl.searchParams.append("fields", "photos");
      detailsUrl.searchParams.append("key", API_KEY);

      const detailsResponse = await fetch(detailsUrl.toString());
      if (!detailsResponse.ok) {
        console.error(`[PlacesService] Place Details API error for placeId "${place_id}":`, { status: detailsResponse.status });
        continue; // Try the next query
      }

      const detailsData = await detailsResponse.json();
      if (detailsData.status !== "OK" || !detailsData.result || !detailsData.result.photos || detailsData.result.photos.length === 0) {
        console.log(`[PlacesService] No photos found in details for place: "${currentQuery}" (Place ID: ${place_id}).`);
        continue; // Try the next query
      }

      // 3. Construct the Photo URL if photos are available
      const photoReference = detailsData.result.photos[0].photo_reference;
      const photoUrl = new URL(`${PLACES_API_BASE_URL}/photo`);
      photoUrl.searchParams.append("maxwidth", "800");
      photoUrl.searchParams.append("photoreference", photoReference);
      photoUrl.searchParams.append("key", API_KEY);
      
      console.log(`[PlacesService] SUCCESS: Found photo for query "${currentQuery}". Returning real image URL.`);
      return {
          imageUrl: photoUrl.toString(), // Return the API URL, not the redirected one
          latitude,
          longitude
      };

    } catch (error) {
      console.error(`[PlacesService] Network or other critical error fetching for query "${currentQuery}":`, error);
      continue; // Try the next query
    }
  }

  // If all queries failed, return the default placeholder.
  console.log(`[PlacesService] All queries failed for original query "${query}". Returning placeholder.`);
  return defaultResult;
}
