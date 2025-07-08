
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { Destination } from "@/components/destinations/destination-card";

/**
 * Saves a destination to the user's 'savedDestinations' subcollection in Firestore.
 * This function is designed to be called from the client-side.
 * @param userId The UID of the user, which should be available on the client.
 * @param destination The destination object to save.
 */
export async function saveDestination(userId: string, destination: Destination): Promise<void> {
  // Firestore must be initialized to proceed.
  if (!db) {
    console.error("Firestore is not initialized. Cannot save destination.");
    throw new Error("Penyimpanan gagal: basis data tidak dikonfigurasi.");
  }
  
  // A user must be logged in to save a destination.
  if (!userId) {
      console.error("User is not authenticated. Cannot save destination.");
      throw new Error("Anda harus masuk untuk menyimpan destinasi.");
  }

  // Use the destination name as the document ID. This is simple and prevents duplicates.
  // Note: Firestore document IDs cannot contain slashes. If names can have slashes, they must be replaced.
  const docId = destination.name.replace(/\//g, '_');
  const destinationRef = doc(db, "users", userId, "savedDestinations", docId);

  try {
    // Save the destination data along with a timestamp.
    // Using { merge: true } is a good practice. It updates the document if it exists,
    // or creates it if it doesn't.
    await setDoc(destinationRef, {
      ...destination,
      savedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Error saving destination to Firestore:", error);
    // Throw a more user-friendly error to be caught by the UI.
    throw new Error("Gagal terhubung ke basis data untuk menyimpan destinasi.");
  }
}
