import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Fetches the username for the given user ID from Firestore.
 *
 * @param uid - The user ID whose username to fetch.
 * @returns An object containing:
 *   - `username`: the fetched username string or null if not found
 *   - `loading`: true while the fetch is in progress
 *   - `error`: an Error object if the fetch failed, or null
 */
export function useGetUsername(uid: string) {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) {
      setUsername(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getDoc(doc(db, "users", uid))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as { username?: string };
          setUsername(data.username ?? null);
        } else {
          setUsername(null);
        }
      })
      .catch((e) => setError(e as Error))
      .finally(() => setLoading(false));
  }, [uid]);

  return { username, loading, error };
}
