import { useState, useEffect } from "react";
import { listUserFamilies, type Family } from "@/lib/family";

/**
 * Hook to fetch and manage the list of families a user belongs to.
 *
 * @param uid - The user ID whose families should be fetched.
 * @returns An object containing:
 *   - families: Family[] (always an array, never undefined)
 *   - loading: boolean
 *   - error: string | null
 *   - refresh(): re-fetch on demand
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
