import { useState, useEffect } from "react";

/**
 * Fetches or subscribes to the history of motion/doorbell events for a device.
 * Currently returns stub data—replace with real Firestore subscription as needed.
 *
 * @param deviceId  The ID of the device whose events to load.
 * @returns         An array of events: { id, type, time }.
 */
export function useDeviceEvents(deviceId: string) {
  const [events, setEvents] = useState<
    { id: string; type: "motion" | "doorbell"; time: string }[]
  >([]);

  useEffect(() => {
    const stub = [
      { id: "e1", type: "doorbell", time: "11:12 AM" },
      { id: "e2", type: "motion",   time: "10:58 AM" },
      { id: "e3", type: "motion",   time: "10:21 AM" },
    ];
    setEvents(stub);
  }, [deviceId]);

  return events;
}
