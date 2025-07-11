import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp, collection, getDocs, query, orderBy } from "firebase/firestore";

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string;
  createdAt?: any;
}


/**
 * Creates a new user document in Firestore if one doesn't already exist.
 * This is useful for both new registrations and first-time social logins.
 * @param user The plain user profile data object.
 */
export async function createUserDocument(user: UserProfileData): Promise<void> {
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
    const newUserProfile = {
      ...user,
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

/**
 * Fetches all user profiles from Firestore.
 * This function should only be called from a secured context (e.g., an admin page).
 * @returns A promise that resolves to an array of user profiles.
 */
export async function getAllUsers(): Promise<UserProfileData[]> {
    if (!db) {
        throw new Error("Pengambilan data gagal: basis data tidak dikonfigurasi.");
    }

    const usersCollectionRef = collection(db, "users");
    const q = query(usersCollectionRef, orderBy("createdAt", "desc"));

    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            uid: doc.id,
            ...data,
          } as UserProfileData;
        });
    } catch (error) {
        console.error("Error fetching all users from Firestore:", error);
        throw new Error("Gagal mengambil data pengguna dari basis data.");
    }
}
