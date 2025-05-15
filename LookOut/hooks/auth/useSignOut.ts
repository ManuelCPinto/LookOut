import { useState } from "react";
import { useRouter } from "expo-router";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * Hook to sign the current user out of Firebase Auth and
 * redirect them to the login screen.
 *
 * Manages a loading state during the sign-out operation.
 *
 * @returns An object containing:
 *   - `signOutUser()`: async function to perform sign-out and navigation.
 *   - `loading`: boolean indicating whether sign-out is in progress.
 */

export function useSignOut() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const signOutUser = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  return { signOutUser, loading };
}
