import {
  collection,
  doc,
  getDoc,
  addDoc,
  writeBatch,
  deleteDoc,
  getDocs,
  serverTimestamp,
  Timestamp,
  query,
  where,
  Unsubscribe,
  onSnapshot,
  DocumentData,
  updateDoc,
  deleteField,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";
import { Device } from "./devices";

export type Role = "Owner" | "Member" | "Guest";

export interface Family {
  id:        string;               
  name:      string;               
  ownerId:   string;               
  createdAt: Timestamp;           
  roles:     Record<string, Role>; 
  devices: string[];               
}

export interface Invite {
  code:      string;    
  familyID:  string;    
  createdAt: Timestamp; 
  expireAt: Timestamp;
}

export const ROLE_COLORS: Record<Role, string> = {
  Owner:  "#2563EB",
  Member: "#10B981",
  Guest:  "#6B7280",
};

export const ROLE_LEVELS: Record<Role, number> = {
  Owner:  2,
  Member: 1,
  Guest:  0,
};

const familiesCol = collection(db, "families");
const invitesFamilyCol = collection(db, "invitesFamily");

/**
 * Creates a new family document in Firestore.
 *
 * @param name        – display name of the new family
 * @param ownerId     – UID of the user creating/owning it
 * @param description – optional description text
 * @returns           the newly created Family object (with its ID)
 */
export async function createFamilyApi(
  name: string,
  ownerId: string,
  description?: string
): Promise<Family> {
  const trimmedName = name.trim();
  const trimmedDesc = description?.trim() ?? "";

  const ref = await addDoc(familiesCol, {
    name:        trimmedName,
    description: trimmedDesc,
    ownerId,
    roles:       { [ownerId]: "Owner" },
    devices:   [],
    createdAt:   serverTimestamp(),
  });

  const snap = await getDoc(ref);
  const data = snap.data() as DocumentData;

  return {
    id:        ref.id,
    name:      data.name,
    ownerId:   data.ownerId,
    createdAt: data.createdAt,
    roles:     data.roles,
    devices:   data.devices ?? [],
  };
}

/**
 * Creates a time‐limited invite code for the given family.
 *
 * @param familyID  ID of the family to invite into
 * @param ttlHours  How many hours until the invite auto‐expires (default: 1)
 * @returns         A Promise resolving to the new Invite object
 */
export async function createFamilyInvite(
  familyID: string,
  ttlHours = 1
): Promise<Invite> {
  const now      = Date.now();
  const expireAt = Timestamp.fromDate(new Date(now + ttlHours * 3600e3));

  const ref = await addDoc(invitesFamilyCol, {
    familyID,
    createdAt: serverTimestamp(),
    expireAt,
  });

  const snap = await getDoc(ref);
  const data = snap.data() as DocumentData;

  return {
    code:      ref.id,
    familyID:  data.familyID,
    createdAt: data.createdAt,
    expireAt:  data.expireAt,
  };
}

/**
 * Redeems an invite code by: 
 *  1. Validating it exists and isn’t expired
 *  2. Adding the user as a "guest"
 *  3. Deleting the invite so it can’t be reused
 *
 * @param code    The invite code (document ID)
 * @param userId  UID of the user to add to the family
 * @returns       A Promise resolving to an object with the familyID
 * @throws        If the code is invalid or expired
 */
export async function redeemInvite(
  code: string,
  userId: string
): Promise<{ familyID: string }> {
  const invRef  = doc(invitesFamilyCol, code);
  const invSnap = await getDoc(invRef);
  if (!invSnap.exists()) {
    throw new Error("Invalid invite code.");
  }

  const data = invSnap.data() as { familyID: string; expireAt: Timestamp };
  if (data.expireAt.toMillis() < Date.now()) {
    await deleteDoc(invRef);
    throw new Error("This invite has expired.");
  }

  const batch = writeBatch(db);
  batch.update(doc(familiesCol, data.familyID), {
    [`roles.${userId}`]: "Guest",
  });
  batch.delete(invRef);
  await batch.commit();

  return { familyID: data.familyID };
}

/**
 * Lists all families that a given user belongs to.
 *
 * @param userId  UID of the user whose families to query
 * @returns       A Promise resolving to an array of Family objects
 */
export async function listUserFamilies(
  userId: string
): Promise<Family[]> {
  const q     = query(familiesCol, where(`roles.${userId}`, "!=", null));
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({
    id:    d.id,
    ...(d.data() as Omit<Family, "id">),
  }));
}

/**
 * Fetches a single family document by ID.
 *
 * @param familyID  Document ID of the family
 * @returns         A Promise resolving to the Family or null if not found
 */
export async function fetchFamily(
  familyID: string
): Promise<Family | null> {
  const snap = await getDoc(doc(familiesCol, familyID));
  return snap.exists()
    ? ({ id: snap.id, ...(snap.data() as Omit<Family, "id">) })
    : null;
}

/**
 * Creates a new family document with the given owner.
 *
 * @param name     Display name of the new family
 * @param ownerId  UID of the user who will own this family
 * @returns        A Promise resolving to the newly created Family object
 */
export async function createFamily(
  name: string,
  ownerId: string
): Promise<Family> {
  const ref = await addDoc(familiesCol, {
    name,
    ownerId,
    roles:     { [ownerId]: "Owner" },
    createdAt: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return { id: ref.id, ...(snap.data() as Omit<Family, "id">) };
}

/**
 * Subscribes to real-time updates for a single family document.
 *
 * @param familyID  Document ID of the family to watch
 * @param cb        Callback invoked with the Family (or null) on each update
 * @returns         An Unsubscribe function to stop listening
 */
export function subscribeFamily(
  familyID: string,
  cb: (family: Family | null) => void
): Unsubscribe {
  const ref = doc(familiesCol, familyID);
  return onSnapshot(ref, (snap) => {
    cb(
      snap.exists()
        ? ({ id: snap.id, ...(snap.data() as DocumentData) } as Family)
        : null
    );
  });
}

/**
 * Deletes the entire family document.
 *
 * @param familyID – ID of the family to delete
 */
export function deleteFamily(familyID: string): Promise<void> {
  return deleteDoc(doc(db, "families", familyID));
}

/**
 * Removes a single user from a family's roles map.
 *
 * @param familyID – ID of the family
 * @param userId   – UID of the user to remove
 */
export function removeUserFromFamily(
  familyID: string,
  userId: string
): Promise<void> {
  return updateDoc(doc(db, "families", familyID), {
    [`roles.${userId}`]: deleteField(),
  });
}

/**
 * Checks if user has permission
 * 
 * @param userRole 
 * @param requiredRole 
 */
export function hasRequiredRole(
  userRole: Role,
  requiredRole: Role
): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

/**
 * Update a single member’s role.
 * @param familyID 
 * @param userId 
 * @param role 
 */
export async function updateMemberRole(
  familyID: string,
  userId: string,
  role: Role
): Promise<void> {
  const famRef = doc(familiesCol, familyID);
  await updateDoc(famRef, {
    [`roles.${userId}`]: role,
  });
}

/**
 * Transfer ownership of a family
 * @param familyID 
 * @param newOwnerId 
 * @param previousOwnerId 
 */
export async function transferOwnership(
  familyID: string,
  newOwnerId: string,
  previousOwnerId: string
): Promise<void> {
  const batch = writeBatch(db);
  const famRef = doc(familiesCol, familyID);

  batch.update(famRef, {
    ownerId: newOwnerId,
    [`roles.${newOwnerId}`]: "Owner",
    [`roles.${previousOwnerId}`]: "Member",
  });

  await batch.commit();
}

/**
 * Adds a given device ID to the family's `devices` array.
 *
 * @param familyId  the ID of the family document
 * @param deviceId  the device ID to push into that family's devices
 */
export async function addDeviceToFamily(
  familyId: string,
  deviceId: string
): Promise<void> {
  const famRef = doc(familiesCol, familyId);
  await updateDoc(famRef, {
    devices: arrayUnion(deviceId),
  });
}

/**
 * (Optional) Remove a device ID from a family's array
 *
 * @param familyId 
 * @param deviceId 
 */
export async function removeDeviceFromFamily(
  familyId: string,
  deviceId: string
): Promise<void> {
  const famRef = doc(familiesCol, familyId);
  await updateDoc(famRef, {
    devices: (docData: any) => {
      return arrayRemove(deviceId);
    },
  });
}

/**
 * Listen in real time to devices whose IDs appear in the family's `devices` array.
 *
 * Whenever the family's document changes (e.g. devices added/removed),
 * we tear down the previous listener and re‐subscribe to the new set of IDs.
 *
 * @param familyId 
 * @param cb – callback invoked with an array of Device objects
 * @returns      – an Unsubscribe function that stops all listeners
 */
export function subscribeFamilyDevices(
  familyId: string,
  cb: (devices: Device[]) => void
): Unsubscribe {
  const famRef = doc(familiesCol, familyId);
  let devicesUnsub: Unsubscribe | null = null;
  const cleanupInner = () => {
    if (devicesUnsub) {
      devicesUnsub();
      devicesUnsub = null;
    }
  };
  const familyUnsub = onSnapshot(famRef, (famSnap) => {
    if (!famSnap.exists()) {
      cleanupInner();
      cb([]);
      return;
    }

    const famData = famSnap.data() as DocumentData;
    const devices: string[] = Array.isArray(famData.devices) ? famData.devices : [];
    cleanupInner();

    if (devices.length === 0) {
      cb([]);
      return;
    }
    const q = query(
      collection(db, "devices"),
      where("__name__", "in", devices)
    );

    devicesUnsub = onSnapshot(q, (snap) => {
      const list: Device[] = snap.docs.map((d) => ({
        id:            d.id,
        ...(d.data() as any),
      }));
      cb(list);
    });
  });

  return () => {
    cleanupInner();
    familyUnsub();
  };
}
