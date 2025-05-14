import { useState, useEffect } from "react";
import { fetchUserProfile } from "@/lib/user";

export interface UserProfile {
  username: string;
  email: string;
}

/**
 * Fetches the user's public profile (username & email) from your API.
 *
 * @param uid - The user ID to fetch.
 * @returns An object containing:
 *   - `profile`: { username, email } or null if not found
 *   - `loading`: true while fetching
 *   - `error`: error message string if fetch failed, else null
 */
export function useProfile(uid: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    fetchUserProfile(uid)
      .then((p) => setProfile(p))
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [uid]);

  return { profile, loading, error };
}
