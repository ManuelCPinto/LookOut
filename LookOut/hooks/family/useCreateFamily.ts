import { useState } from "react";
import { useRouter } from "expo-router";
import { createFamilyApi } from "@/lib/family";

/**
 * Manages the creation of a new family.
 *
 * @returns {{
*   createFamily: (name: string, ownerId: string, description?: string) => Promise<void>,
*   loading: boolean,
*   error: Error | null
* }}
*/

export function useCreateFamily() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<Error | null>(null);
  const router                = useRouter();

  const createFamily = async (
    name: string,
    ownerId: string,
    description?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const fam = await createFamilyApi(name, ownerId, description);
      router.replace(`/family/${fam.id}`);
    } catch (e: any) {
      setError(e);
      console.error("Create family failed:", e);
    } finally {
      setLoading(false);
    }
  };

  return { createFamily, loading, error };
}
