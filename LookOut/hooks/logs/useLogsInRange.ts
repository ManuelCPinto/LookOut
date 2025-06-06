// app/hooks/logs/useLogsInRange.ts
import { useEffect, useState } from "react";
import { Log, subscribeLogsForDevicesInRange, fetchDeviceById, LogType } from "@/lib/logs";
import { useUserDevices } from "@/hooks/devices";

/**
 * We want to return “Event” exactly as your UI expects:
 *  type      = one of the LogType enums
 *  time      = Date object
 *  deviceName= fetched from the devices collection
 *  photoURL  = string (snapshot URL)
 *  id        = logDoc ID
 */
export type Event = {
  id: string;
  type: LogType;
  time: Date;
  deviceName: string;
  photoURL: string;
};

export default function useLogsInRange(
  start: Date,
  end: Date
): Event[] {
  // 1) get all device docs owned by this user
  //    we assume each device object has { id, name, … }.
  const userDevices = useUserDevices();

  // We only need the array of device IDs for the Firestore “in” query:
  const deviceIds = userDevices.map((d) => d.id);

  // We'll need to look up deviceName for each log’s deviceId.
  // We can cache them in a simple object map:
  const [deviceNameCache, setDeviceNameCache] = useState<Record<string, string>>({});

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    let unsub: ReturnType<typeof subscribeLogsForDevicesInRange> | null = null;

    if (deviceIds.length > 0) {
      unsub = subscribeLogsForDevicesInRange(deviceIds, start, end, async (logs) => {
        // logs: Log[] with fields { id, deviceId, photoURL, type, createdAt, userId }
        // We need to convert each into our “Event” shape

        // 2) For any deviceId we haven’t cached yet, do a fetchDeviceById:
        const missingIds = logs
          .map((l) => l.deviceId)
          .filter((devId) => !(devId in deviceNameCache))
          .filter((v, i, arr) => arr.indexOf(v) === i); // de‐dupe

        if (missingIds.length > 0) {
          // fetch them in parallel
          const lookups = await Promise.all(
            missingIds.map((devId) => fetchDeviceById(devId))
          );
          // build a new partial cache entry
          const newEntries: Record<string, string> = {};
          missingIds.forEach((devId, idx) => {
            newEntries[devId] = lookups[idx]?.name ?? "Unknown Device";
          });
          setDeviceNameCache((old) => ({ ...old, ...newEntries }));
        }

        // 3) Now map each Log into our Event[]
        const newEvents: Event[] = logs.map((l) => ({
          id:         l.id,
          type:       l.type,
          time:       l.createdAt.toDate(),
          deviceName: deviceNameCache[l.deviceId] || "…loading…",
          photoURL:   l.photoURL,
        }));
        setEvents(newEvents);
      });
    }

    return () => {
      unsub?.();
    };
  }, [deviceIds.join(","), start.getTime(), end.getTime(), deviceNameCache]);

  return events;
}
