import { useState, useEffect } from "react";
import { Device } from "@/lib/devices";
import {subscribeFamilyDevices} from "@/lib/family"

/**
 * Subscribes in real-time to all devices owned by the given familyId.
 * If familyId is undefined/null, returns empty array.
 *
 * @param familyId  Firestore family document ID to subscribe to
 */
export function useFamilyDevices(familyId: string | undefined): Device[] {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    if (!familyId) return;
    const unsubscribe = subscribeFamilyDevices(familyId, setDevices);
    return () => unsubscribe();
  }, [familyId]);

  return devices;
}
