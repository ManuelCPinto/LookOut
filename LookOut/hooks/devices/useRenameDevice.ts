import { useState } from "react";
import { renameDevice } from "@/lib/devices";

/**
 * Returns a `rename` function and a `loading` flag.
 * `rename(id, newName)` updates the Firestore document.
 */
export function useRenameDevice() {
  const [loading, setLoading] = useState(false);

  async function rename(id: string, newName: string) {
    setLoading(true);
    try {
      await renameDevice(id, newName);
    } finally {
      setLoading(false);
    }
  }

  return { rename, loading };
}
