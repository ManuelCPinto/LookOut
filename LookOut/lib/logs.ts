import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  getDoc,
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
  photoURL: string;
  type: LogType;       
  createdAt: Timestamp;
  userId: string;      
};

/**
 * Subscribe in real‐time to all logs whose `deviceId` is one of the user's owned device IDs,
 * and whose `createdAt` is between `start` and `end`.
 *
 * @param deviceIds  – an array of device IDs that this user owns (max length 10 for Firestore “in” queries)
 * @param start      – start date (inclusive)
 * @param end        – end date (inclusive)
 * @param cb         – callback(logs: Log[]) whenever they change
 * @returns          – a Firestore unsubscribe function
 */
export function subscribeLogsForDevicesInRange(
  deviceIds: string[],
  start: Date,
  end: Date,
  cb: (logs: Log[]) => void
): Unsubscribe {
  const logsCol = collection(db, "logs");
  const startTs = Timestamp.fromDate(start);
  const endTs   = Timestamp.fromDate(end);
  if (deviceIds.length === 0) {
    cb([]);
    return () => {};
  }

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
 * Fetch a single device’s name by ID.
 */
export async function fetchDeviceById(deviceId: string): Promise<{ name: string } | null> {
  const ref = doc(db, "devices", deviceId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as DocumentData;
  return {
    name: data.name || "Unknown Device",
  };
}

/**
 * Given a LogType enum, return an Ionicons name + a short human label.
 */
export function getLogIconAndLabel(logType: LogType): {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  label:    string;
} {
  switch (logType) {
    case LogType.RING_DOORBELL:
      return {
        iconName: "notifications-outline",
        label:    "Doorbell rang",
      };
    case LogType.USER_REQUEST:
      return {
        iconName: "camera-outline",
        label:    "Snapshot taken",
      };
    case LogType.PROXIMITY:
      return {
        iconName: "walk-outline",
        label:    "Motion detected",
      };
    case LogType.NEW_FINGERPRINT:
      return {
        iconName: "finger-print-outline",
        label:    "Fingerprint scanned",
      };
    default:
      return {
        iconName: "help-circle-outline",
        label:    "Unknown event",
      };
  }
}

export async function deleteLog(logId: string): Promise<void> {
  await deleteDoc(doc(db, "logs", logId));
}
