
'use server';

import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import type { User } from "firebase/auth";

/**
 * Creates a new user document in Firestore if one doesn't already exist.
 * This is useful for both new registrations and first-time social logins.
 * @param user The Firebase Auth User object from a successful sign-in or registration.
 */
export async function createUserDocument(user: User): Promise<void> {
  // Ensure Firestore is initialized
  if (!db) {
    console.error("Firestore is not initialized. Skipping user document creation.");
    // We can return instead of throwing, as the app can function without this
    // in case of a configuration issue. The login/registration itself already succeeded.
    return;
  }
  
  const userRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userRef);

  // Only create the document if it doesn't already exist
  if (!userSnapshot.exists()) {
    const { uid, email, displayName, photoURL, providerData } = user;
    const providerId = providerData[0]?.providerId || 'password';
    
    const newUserProfile = {
      uid,
      email,
      displayName,
      photoURL,
      providerId,
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(userRef, newUserProfile);
    } catch (error) {
      console.error("Error creating user document in Firestore:", error);
      // We throw here to let the calling function know that the DB operation failed.
      throw new Error("Could not create user profile in database.");
    }
  }
}
