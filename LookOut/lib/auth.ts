import {
  signInWithEmailAndPassword,
  UserCredential,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  User,
} from "firebase/auth";

import { auth } from "./firebase";
import { getEmailByUsername } from "./user";

/**
 * Signs up a new user in Firebase Auth with email/password.
 *
 * @param email    – the user's email
 * @param password – the user's password
 * @returns        A UserCredential for the newly created user
 */
export async function signUpApi(
  email: string,
  password: string
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sends an email-verification link to the given user.
 *
 * @param user – the Firebase User object
 */
export function sendVerificationApi(user: User): Promise<void> {
  return sendEmailVerification(user);
}

/**
 * Reloads the user's token/data from the server.
 *
 * @param user – the Firebase User object
 */
export function reloadUserApi(user: User): Promise<void> {
  return user.reload();
}

/**
 * Signs out the current user.
 */
export function signOutApi(): Promise<void> {
  return signOut(auth);
}

/**
 * Signs in a user by either email or username + password.
 *
 * If `identifier` contains "@", it's treated as email;
 * otherwise we first resolve it to an email via getEmailByUsername().
 *
 * @param identifier – email or username
 * @param password   – the user's password
 * @returns          A UserCredential on success
 * @throws           Any Firebase/Auth error, or from username lookup
 */
export async function loginApi(
  identifier: string,
  password: string
): Promise<UserCredential> {
  let email = identifier.trim();
  if (!email.includes("@")) {
    email = await getEmailByUsername(email);
  }
  return signInWithEmailAndPassword(auth, email, password);
}
