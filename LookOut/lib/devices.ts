import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

export type OwnerType = "user" | "family";

export type DeviceStatus = "online" | "offline" | "warning";

export interface DeviceHealth {
  uptime: number;        // seconds
  latency: number;       // ms
  signalQuality: number; // percent 0–100
}

export interface Device {
  id:                string;
  name:              string;
  ownerId:           string;
  ownerType:         OwnerType;
  createdAt:         Timestamp;
  lastActivityType:  string;
  lastActivityAt:    Timestamp;
  status:            DeviceStatus;
}

const devicesCol = collection(db, "devices");

/**
 * Create a new device under a given owner (user or family).
 * @param device 
 * @returns 
 */
export async function createDevice(
  device: Omit<Device, "id" | "createdAt" | "lastActivityAt">
): Promise<Device> {
  const ref = await addDoc(devicesCol, {
    ...device,
    createdAt: serverTimestamp(),
    lastActivityAt: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  const data = snap.data() as DocumentData;
  return {
    id:               ref.id,
    name:             data.name,
    ownerId:          data.ownerId,
    ownerType:        data.ownerType,
    status:           data.status,
    lastActivityType: data.lastActivityType,
    createdAt:        data.createdAt,
    lastActivityAt:   data.lastActivityAt,
  };
}

/**
 * Update fields on an existing device.
 * @param deviceId 
 * @param updates 
 * @returns 
 */
export function updateDevice(
  deviceId: string,
  updates: Partial<Omit<Device, "id" | "ownerId" | "ownerType" | "createdAt">>
): Promise<void> {
  const ref = doc(devicesCol, deviceId);
  return updateDoc(ref, {
    ...updates,
    lastActivityAt: serverTimestamp(),
  });
}

/**
 * Delete a device document.
 * @param deviceId 
 * @returns 
 */
export function deleteDevice(deviceId: string): Promise<void> {
  return deleteDoc(doc(devicesCol, deviceId));
}

/**
 * Fetch a single device once.
 * @param deviceId 
 * @returns 
 */
export async function fetchDevice(deviceId: string): Promise<Device | null> {
  const snap = await getDoc(doc(devicesCol, deviceId));
  if (!snap.exists()) return null;
  const d = snap.data() as DocumentData;
  return { id: snap.id, ...d } as Device;
}

/**
 * Listen in real time to devices owned by a given user.
 * @param userId 
 * @param cb 
 * @returns 
 */
export function subscribeUserDevices(
  userId: string,
  cb: (devices: Device[]) => void
): Unsubscribe {
  const q = query(devicesCol, where("ownerType", "==", "user"), where("ownerId", "==", userId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) } as Device));
    cb(list);
  });
}

/**
 * Listen in real time to devices owned by a given family.
 * @param familyId 
 * @param cb 
 * @returns 
 */
export function subscribeFamilyDevices(
  familyId: string,
  cb: (devices: Device[]) => void
): Unsubscribe {
  const q = query(devicesCol, where("ownerType", "==", "family"), where("ownerId", "==", familyId));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) } as Device));
    cb(list);
  });
}

/**
 * Renames a device
 * @param deviceId 
 * @param newName 
 */
export async function renameDevice(deviceId: string, newName: string): Promise<void> {
  const ref = doc(devicesCol, deviceId);
  await updateDoc(ref, { name: newName.trim() });
}

/**
 * Subscribe to real‐time health updates for a device.
 * @param deviceId 
 * @param cb 
 * @returns 
 */
export function subscribeDeviceHealth(
  deviceId: string,
  cb: (h: DeviceHealth) => void
): Unsubscribe {
  const ref = doc(db, "devices", deviceId);
  return onSnapshot(ref, (snap) => {
    const data = snap.data() as DocumentData;
    const map = data.health || {};
    cb({
      uptime:       typeof map.uptime   === "number" ? map.uptime   : 0,
      latency:      typeof map.latency  === "number" ? map.latency  : 0,
      signalQuality:
        typeof map.signal   === "number" ? map.signal   : 0,
    });
  });
}