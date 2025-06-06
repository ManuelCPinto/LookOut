import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  DocumentData,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Ionicons } from "@expo/vector-icons";

export enum LogType {
  RING_DOORBELL   = 0,
  USER_REQUEST    = 1,
  PROXIMITY       = 2,
  NEW_FINGERPRINT = 3,
}

export type Log = {
  id: string;
  deviceId: string;
  deviceName: string;
  photoURL: string;
  type: LogType;       
  createdAt: Timestamp;
  userId: string;
};

/**
 * Subscribe in real-time to logs for any of the given device IDs in the date range.
 * 
 * Firestore requires that you create a composite index on (deviceId, createdAt) for this to work.
 */
export function subscribeLogsByDeviceIDsInRange(
  deviceIds: string[],
  start: Date,
  end: Date,
  cb: (logs: Log[]) => void
): Unsubscribe {
  if (!deviceIds || deviceIds.length === 0) {
    cb([]);
    return () => {};
  }

  const logsCol = collection(db, "logs");
  const startTs = Timestamp.fromDate(start);
  const endTs   = Timestamp.fromDate(end);
  const q = query(
    logsCol,
    where("deviceId", "in", deviceIds),
    where("createdAt", ">=", startTs),
    where("createdAt", "<=", endTs),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const results: Log[] = snap.docs.map((docSnap) => {
      const d = docSnap.data() as DocumentData;
      return {
        id:        docSnap.id,
        deviceName: d.deviceName,
        deviceId:  d.deviceId,
        photoURL:  d.photoURL,
        type:      d.type as LogType,
        createdAt: d.createdAt,
        userId:    d.userId,
      };
    });
    cb(results);
  });
}


/**
 * Delete one log by ID.
 */
export async function deleteLog(logId: string): Promise<void> {
  await deleteDoc(doc(db, "logs", logId));
}


/**
 * Given a LogType enum, return an Ionicons name + a short label.
 */
export function getLogIconAndLabel(
  logType: LogType
): { iconName: React.ComponentProps<typeof Ionicons>["name"]; label: string } {
  switch (logType) {
    case LogType.RING_DOORBELL:
      return {
        iconName: "notifications-outline",
        label: "Doorbell rang",
      };
    case LogType.USER_REQUEST:
      return {
        iconName: "camera-outline",
        label: "Snapshot taken",
      };
    case LogType.PROXIMITY:
      return {
        iconName: "walk-outline",
        label: "Motion detected",
      };
    case LogType.NEW_FINGERPRINT:
      return {
        iconName: "finger-print-outline",
        label: "Fingerprint scanned",
      };
    default:
      return {
        iconName: "help-circle-outline",
        label: "Unknown event",
      };
  }
}
