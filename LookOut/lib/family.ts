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
} from "firebase/firestore";
import { db } from "./firebase";

export type Role = "Owner" | "Member" | "Guest";

export interface Family {
  id:        string;               // Document ID
  name:      string;               // Family display name
  ownerId:   string;               // UID of the owner user
  createdAt: Timestamp;            // When the family was created
  roles:     Record<string, Role>; // Map from UID → role
}

export interface Invite {
  code:      string;    // Document ID (invite code)
  familyId:  string;    // Family this invite belongs to
  createdAt: Timestamp; // When the invite was created
  expiresAt: Timestamp; // When the invite expires
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
const invitesCol  = collection(db, "invites");

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
  };
}

/**
 * Creates a time‐limited invite code for the given family.
 *
 * @param familyId  ID of the family to invite into
 * @param ttlHours  How many hours until the invite auto‐expires (default: 1)
 * @returns         A Promise resolving to the new Invite object
 */
export async function createInvite(
  familyId: string,
  ttlHours = 1
): Promise<Invite> {
  const now       = Date.now();
  const expiresAt = Timestamp.fromDate(new Date(now + ttlHours * 3600e3));
  const ref       = await addDoc(invitesCol, {
    familyId,
    createdAt: serverTimestamp(),
    expiresAt,
  });
  const snap = await getDoc(ref);
  return {
    code:      ref.id,
    familyId,
    createdAt: snap.data()?.createdAt  as Timestamp,
    expiresAt: snap.data()?.expiresAt   as Timestamp,
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
 * @returns       A Promise resolving to an object with the familyId
 * @throws        If the code is invalid or expired
 */
export async function redeemInvite(
  code: string,
  userId: string
): Promise<{ familyId: string }> {
  const invRef  = doc(invitesCol, code);
  const invSnap = await getDoc(invRef);
  if (!invSnap.exists()) {
    throw new Error("Invalid invite code.");
  }

  const data = invSnap.data() as { familyId: string; expiresAt: Timestamp };
  if (data.expiresAt.toMillis() < Date.now()) {
    await deleteDoc(invRef);
    throw new Error("This invite has expired.");
  }

  const batch = writeBatch(db);
  batch.update(doc(familiesCol, data.familyId), {
    [`roles.${userId}`]: "Guest",
  });
  batch.delete(invRef);
  await batch.commit();

  return { familyId: data.familyId };
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
 * @param familyId  Document ID of the family
 * @returns         A Promise resolving to the Family or null if not found
 */
export async function fetchFamily(
  familyId: string
): Promise<Family | null> {
  const snap = await getDoc(doc(familiesCol, familyId));
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
 * @param familyId  Document ID of the family to watch
 * @param cb        Callback invoked with the Family (or null) on each update
 * @returns         An Unsubscribe function to stop listening
 */
export function subscribeFamily(
  familyId: string,
  cb: (family: Family | null) => void
): Unsubscribe {
  const ref = doc(familiesCol, familyId);
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
 * @param familyId – ID of the family to delete
 */
export function deleteFamily(familyId: string): Promise<void> {
  return deleteDoc(doc(db, "families", familyId));
}

/**
 * Removes a single user from a family's roles map.
 *
 * @param familyId – ID of the family
 * @param userId   – UID of the user to remove
 */
export function removeUserFromFamily(
  familyId: string,
  userId: string
): Promise<void> {
  return updateDoc(doc(db, "families", familyId), {
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
 * @param familyId 
 * @param userId 
 * @param role 
 */
export async function updateMemberRole(
  familyId: string,
  userId: string,
  role: Role
): Promise<void> {
  const famRef = doc(familiesCol, familyId);
  await updateDoc(famRef, {
    [`roles.${userId}`]: role,
  });
}

/**
 * Transfer ownership of a family
 * @param familyId 
 * @param newOwnerId 
 * @param previousOwnerId 
 */
export async function transferOwnership(
  familyId: string,
  newOwnerId: string,
  previousOwnerId: string
): Promise<void> {
  const batch = writeBatch(db);
  const famRef = doc(familiesCol, familyId);

  batch.update(famRef, {
    ownerId: newOwnerId,
    [`roles.${newOwnerId}`]: "Owner",
    [`roles.${previousOwnerId}`]: "Member",
  });

  await batch.commit();
}