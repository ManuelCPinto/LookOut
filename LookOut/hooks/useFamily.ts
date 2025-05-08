// hooks/useFamily.ts
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Family } from "../lib/family";

export function useFamily(familyId?: string) {
  const [family, setFamily] = useState<Family | null>(null);

  useEffect(() => {
    if (!familyId) return;
    const ref = doc(db, "families", familyId);
    const unsub = onSnapshot(ref, snap => {
      if (snap.exists()) {
        setFamily({ id: snap.id, ...(snap.data() as any) });
      }
    });
    return unsub;
  }, [familyId]);

  return family;
}
