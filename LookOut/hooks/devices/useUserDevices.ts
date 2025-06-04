import { useState, useEffect } from "react";
import { subscribeUserDevices, Device } from "@/lib/devices";
import { auth } from "@/lib/firebase";

export function useUserDevices(): Device[] {
  const [devices, setDevices] = useState<Device[]>([]);
  const uid = auth.currentUser!.uid;

  useEffect(() => {
    const unsubscribe = subscribeUserDevices(uid, setDevices);
    return () => unsubscribe();
  }, [uid]);

  return devices;
}
