import { useState, useEffect } from "react";
import { listUserFamilies } from "@/lib/family";
import type { Family } from "@/lib/family";

/**
 * Hook to fetch and manage the list of families a user belongs to.
 *
 * @param uid - The user ID whose families should be fetched.
 * @returns An object containing:
 *   - `families`: array of Family objects for this user.  
 *   - `loading`: boolean, true while the initial load or a refresh is in progress.  
 *   - `error`: string|null, the error message if fetching fails.  
 *   - `refresh()`: function to re-fetch the families on demand.
 */
export function useUserFamilies(uid: string) {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  
  const refresh = async () => {
    try {
      const f = await listUserFamilies(uid);
      setFamilies(f);
    } catch (e: any) {
      setError(e.message);
    }
  };

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [uid]);

  return { families, loading, error, refresh };
}
