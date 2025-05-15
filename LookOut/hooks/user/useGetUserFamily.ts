import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Family } from "@/lib/family";

/**
 * Subscribes to the list of families the given user belongs to,
 * and returns the first matching Family (or null if none).
 *
 * @param uid - User ID to look up in families.roles
 * @returns The first Family that contains this uid in its roles,
 *          or null if the user is not in any family.
 */
export function useUserFamily(uid: string): Family | null {
  const [family, setFamily] = useState<Family | null>(null);

  useEffect(() => {
    if (!uid) {
      setFamily(null);
      return;
    }
    const q = query(
      collection(db, "families"),
      where(`roles.${uid}`, "!=", null)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const doc = snap.docs[0];
          setFamily({ id: doc.id, ...(doc.data() as DocumentData) } as Family);
        } else {
          setFamily(null);
        }
      },
      console.error
    );

    return unsub;
  }, [uid]);

  return family;
}
