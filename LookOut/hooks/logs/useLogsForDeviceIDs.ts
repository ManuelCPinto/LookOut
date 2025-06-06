import { useState, useEffect } from "react";
import { subscribeLogsByDeviceIDsInRange, Log } from "@/lib/logs";
export type Event = {
  id: string;
  deviceId: string;
  type: number;
  time: Date;
  deviceName: string;  
  photoURL: string;
};

/**
 * A React hook to subscribe in real time to logs for the given set of device IDs and date range.
 *
 * @param deviceIds  – array of device IDs to watch (Firestore "in" supports ≤10 IDs).
 * @param start      – start of date range
 * @param end        – end of date range
 * @returns an array of Event objects (sorted by createdAt desc).
 */
export function useLogsForDeviceIDs(
  deviceIds: string[],
  start: Date,
  end: Date
): Event[] {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const unsub = subscribeLogsByDeviceIDsInRange(deviceIds, start, end, (logs: Log[]) => {
      const newEvents = logs.map((l) => ({
        id:         l.id,
        deviceId:   l.deviceId,
        type:       l.type,
        time:       l.createdAt.toDate(),
        deviceName: l.deviceName,      
        photoURL:   l.photoURL,
      }));
      setEvents(newEvents);
    });

    return () => {
      unsub();
    };
  }, [JSON.stringify(deviceIds), start.getTime(), end.getTime()]);

  return events;
}
