import { useState, useEffect } from "react";
import { subscribeFamily, Family } from "@/lib/family";

/**
 * Subscribes to a single family document and returns
 * its real-time data.
 *
 * @param familyId - ID of the family document to watch
 * @returns The Family object or null if not yet loaded / not found
 */

export function useGetFamily(familyId?: string): Family | null {
  const [family, setFamily] = useState<Family | null>(null);

  useEffect(() => {
    if (!familyId) return;
    const unsubscribe = subscribeFamily(familyId, setFamily);
    return () => unsubscribe();
  }, [familyId]);

  return family;
}
