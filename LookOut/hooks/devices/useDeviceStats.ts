import { useEffect, useState } from "react";
import { DeviceHealth, subscribeDeviceHealth } from "@/lib/devices";

/**
 * Subscribes to the “health” document for this device,
 * returning uptime (s), latency (ms), and signalQuality (%).
 */
export function useDeviceStats(deviceId: string): DeviceHealth {
  const [health, setHealth] = useState<DeviceHealth>({
    uptime: 0,
    latency: 0,
    signalQuality: 0,
  });

  useEffect(() => {
    const unsub = subscribeDeviceHealth(deviceId, setHealth);
    return () => unsub();
  }, [deviceId]);

  return health;
}
