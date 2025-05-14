import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  serverTimestamp,
  DocumentData,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Fetches a user profile document by UID.
 *
 * @param uid – the user’s UID
 * @returns a Promise resolving to { username, email } or null if not found
 */
export async function fetchUserProfile(
  uid: string
): Promise<{ username: string; email: string } | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data() as DocumentData;
  return { username: data.username, email: data.email };
}

/**
 * Looks up a username in Firestore and returns the
 * associated email address, or throws if not found.
 *
 * @param username – The username to resolve
 * @returns        The email string for that user
 */
export async function getEmailByUsername(
  username: string
): Promise<string> {
  const usersCol = collection(db, "users");
  const q        = query(usersCol, where("username", "==", username));
  const snap     = await getDocs(q);
  if (snap.empty) throw new Error("No account found for that username.");
  const data = snap.docs[0].data() as DocumentData;
  return data.email;
}

/**
 * Creates a user profile document in Firestore.
 *
 * @param uid      – the newly created user’s UID
 * @param username – chosen username
 * @param email    – user’s email address
 */
export function createUserProfileApi(
  uid: string,
  username: string,
  email: string
): Promise<void> {
  return setDoc(doc(db, "users", uid), {
    username,
    email,
    createdAt: serverTimestamp(),
  });
}
