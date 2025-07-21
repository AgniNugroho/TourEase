
"use client";

import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import type { PersonalizedDestinationInput, PersonalizedDestinationOutput } from "@/ai/flows/personalized-destination-recommendation";
import { Destination } from "@/components/destinations/destination-card";
import { MapLocation } from "@/components/map/interactive-map";

export interface SearchHistoryEntry {
  id: string;
  input: PersonalizedDestinationInput;
  destinations: Destination[];
  searchedAt: Timestamp;
}

function isValidImageUrl(url?: string): boolean {
  return !!(url && (url.startsWith('http://') || url.startsWith('https://')));
}

/**
 * Saves a search history entry to the user's 'searchHistory' subcollection in Firestore.
 * @param userId The UID of the user.
 * @param input The search preferences used.
 * @param destinations The resulting destinations from the search.
 */
export async function saveSearchHistory(
  userId: string,
  input: PersonalizedDestinationInput,
  destinations: PersonalizedDestinationOutput["destinations"]
): Promise<void> {
  if (!db) {
    throw new Error("Penyimpanan gagal: basis data tidak dikonfigurasi.");
  }
  if (!userId) {
    throw new Error("Anda harus masuk untuk menyimpan riwayat pencarian.");
  }
  
  // Create a new document with a generated ID
  const historyCollectionRef = collection(db, "users", userId, "searchHistory");
  const newHistoryRef = doc(historyCollectionRef);

  const destinationsToSave = destinations?.map(dest => ({
    ...dest,
    imageUrl: isValidImageUrl(dest.imageUrl) ? dest.imageUrl : null,
  }));

  try {
    await setDoc(newHistoryRef, {
      input,
      destinations: destinationsToSave,
      searchedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving search history to Firestore:", error);
    // Ignore history saving errors in production to not block user flow.
  }
}

/**
 * Fetches the search history for a given user from Firestore.
 * @param userId The UID of the user.
 * @returns A promise that resolves to an array of search history entries.
 */
export async function getSearchHistory(userId: string): Promise<SearchHistoryEntry[]> {
  if (!db) {
    throw new Error("Pengambilan data gagal: basis data tidak dikonfigurasi.");
  }
  if (!userId) {
    throw new Error("Pengguna tidak terautentikasi.");
  }

  const historyCollectionRef = collection(db, "users", userId, "searchHistory");
  const q = query(historyCollectionRef, orderBy("searchedAt", "desc"));
  
  try {
    const querySnapshot = await getDocs(q);
    const historyEntries = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            input: data.input,
            destinations: data.destinations || [],
            searchedAt: data.searchedAt,
        } as SearchHistoryEntry;
    });
    return historyEntries;
  } catch (error) {
    console.error("Error fetching search history from Firestore:", error);
    throw new Error("Gagal mengambil riwayat pencarian dari basis data.");
  }
}

/**
 * Fetches all search history entries from all users. For admin use only.
 * @returns A promise that resolves to an array of all search history entries.
 */
export async function getAllSearchHistories(): Promise<SearchHistoryEntry[]> {
  if (!db) {
    throw new Error("Pengambilan data gagal: basis data tidak dikonfigurasi.");
  }

  const allHistories: SearchHistoryEntry[] = [];
  const usersSnapshot = await getDocs(collection(db, "users"));

  for (const userDoc of usersSnapshot.docs) {
    const historyCollectionRef = collection(db, "users", userDoc.id, "searchHistory");
    const historySnapshot = await getDocs(historyCollectionRef);
    historySnapshot.forEach(doc => {
      const data = doc.data();
      const destinations = (data.destinations || []).map((dest: any) => ({
          ...dest,
          latitude: dest.latitude,
          longitude: dest.longitude
      }));

      allHistories.push({ 
        id: doc.id, 
        input: data.input,
        destinations: destinations,
        searchedAt: data.searchedAt
      } as SearchHistoryEntry);
    });
  }
  
  return allHistories;
}

/**
 * Aggregates all search histories to find the top 5 most recommended destinations.
 * @returns A promise that resolves to an array of top 5 map locations.
 */
export async function getTopRecommendedDestinations(): Promise<MapLocation[]> {
  const allHistories = await getAllSearchHistories();
  
  const destinationCounts: Record<string, { count: number; destination: Destination }> = {};

  allHistories.forEach(history => {
    history.destinations.forEach(dest => {
      // Only consider destinations with valid coordinates for the map
      if (dest.name && dest.latitude && dest.longitude) {
        if (destinationCounts[dest.name]) {
          destinationCounts[dest.name].count++;
        } else {
          destinationCounts[dest.name] = {
            count: 1,
            destination: dest,
          };
        }
      }
    });
  });

  const sortedDestinations = Object.values(destinationCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return sortedDestinations.map(item => ({
    id: item.destination.name.replace(/\s+/g, '-').toLowerCase(),
    name: item.destination.name,
    position: {
      lat: item.destination.latitude!,
      lng: item.destination.longitude!,
    },
    description: item.destination.description,
  }));
}
