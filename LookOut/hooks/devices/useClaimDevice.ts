import { useState } from "react";
import { claimDevice } from "@/lib/devices";

export function useClaimDevice(uid: string) {
  const [claiming, setClaiming] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const claim = async (deviceId: string) => {
    setError(null);
    setClaiming(true);
    try {
      await claimDevice(deviceId, uid);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setClaiming(false);
    }
  };

  return { claim, claiming, error };
}
