
"use client";

import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import type { PersonalizedDestinationInput, PersonalizedDestinationOutput } from "@/ai/flows/personalized-destination-recommendation";

export interface SearchHistoryEntry {
  id: string;
  input: PersonalizedDestinationInput;
  destinations: PersonalizedDestinationOutput["destinations"];
  searchedAt: Timestamp;
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

  // We need to clean up the destinations to remove imageUrl before saving
  const destinationsToSave = destinations.map(({ imageUrl, ...rest }) => rest);

  try {
    await setDoc(newHistoryRef, {
      input,
      destinations: destinationsToSave,
      searchedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving search history to Firestore:", error);
    throw new Error("Gagal terhubung ke basis data untuk menyimpan riwayat.");
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
        // Here we need to simulate the imageUrl for display purposes in history
        const destinationsWithPlaceholderImages = data.destinations.map((dest: any) => ({
            ...dest,
            // Since imageUrl is not saved, we can provide a placeholder or leave it undefined.
            // Let's leave it undefined so the DestinationCard can handle it.
            imageUrl: undefined 
        }));

        return {
            id: doc.id,
            ...data,
            destinations: destinationsWithPlaceholderImages,
        } as SearchHistoryEntry;
    });
    return historyEntries;
  } catch (error) {
    console.error("Error fetching search history from Firestore:", error);
    throw new Error("Gagal mengambil riwayat pencarian dari basis data.");
  }
}
