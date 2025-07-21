
"use client";

import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, getDocs, query, orderBy, Timestamp } from "firebase/firestore";
import type { PersonalizedDestinationInput, PersonalizedDestinationOutput } from "@/ai/flows/personalized-destination-recommendation";
import { Destination } from "@/components/destinations/destination-card";

export interface SearchHistoryEntry {
  id: string;
  input: PersonalizedDestinationInput;
  destinations: Destination[];
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

  // We are not saving images to history to keep it lightweight.
  // Images will be generated on-demand if a user saves a destination from history.
  const destinationsToSave = destinations?.map(dest => ({
      ...dest,
      imageUrl: null, // Always explicitly save imageUrl as null in history.
  }));

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
  try {
    const usersSnapshot = await getDocs(collection(db, "users"));

    for (const userDoc of usersSnapshot.docs) {
      const historyCollectionRef = collection(db, "users", userDoc.id, "searchHistory");
      const historySnapshot = await getDocs(historyCollectionRef);
      historySnapshot.forEach(doc => {
        const data = doc.data();
        allHistories.push({ 
          id: doc.id, 
          input: data.input,
          destinations: data.destinations || [],
          searchedAt: data.searchedAt
        } as SearchHistoryEntry);
      });
    }
  } catch (error) {
     console.error("Error fetching all search histories:", error);
     throw new Error("Gagal mengambil semua riwayat pencarian dari basis data.");
  }
  
  return allHistories;
}
