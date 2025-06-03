import { useState, useRef, useEffect, useCallback } from "react";
import { doc, getDoc, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useRegistrationFlow(deviceId: string, userId: string) {
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  const checkOnce = useCallback(async () => {
    const snap = await getDoc(doc(db, "devices", deviceId));
    const data = snap.data() as any;
    const arr = data.registeredUsers;
    return Array.isArray(arr) && arr.includes(userId);
  }, [deviceId, userId]);

  const startPolling = useCallback(() => {
    setLoading(true);
    unsubscribeRef.current = onSnapshot(
      doc(db, "devices", deviceId),
      (snap) => {
        const data = snap.data() as any;
        const arr = data.registeredUsers;
        if (Array.isArray(arr) && arr.includes(userId)) {
          setIsRegistered(true);
          setLoading(false);
          unsubscribeRef.current?.();
        }
      }
    );
  }, [deviceId, userId]);

  const stopPolling = useCallback(() => {
    unsubscribeRef.current?.();
    setLoading(false);
  }, []);

  useEffect(() => () => unsubscribeRef.current?.(), []);

  return { isRegistered, loading, checkOnce, startPolling, stopPolling };
}
