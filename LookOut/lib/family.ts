// lib/family.ts
import { 
  collection, doc, addDoc, getDoc, getDocs, 
  writeBatch, serverTimestamp, query, where 
} from "firebase/firestore";
import { db } from "./firebase";

export type Role = "owner" | "member" | "guest";

export interface Family {
  id: string;
  name: string;
  ownerId: string;
  createdAt: any;
  roles: Record<string, Role>;
}

export interface Invite {
  code: string;
  familyId: string;
  role: Role;
  createdAt: any;
  expiresAt: any;
}

// — Families Collection Reference —
const familiesCol = collection(db, "families");

// 1️⃣ Create a new family
export async function createFamily(name: string, ownerId: string): Promise<Family> {
  const ref = await addDoc(familiesCol, {
    name,
    ownerId,
    roles: { [ownerId]: "owner" },
    createdAt: serverTimestamp(),
  });
  const snap = await getDoc(ref);
  return { id: ref.id, ...(snap.data() as any) } as Family;
}

// 2️⃣ Fetch a family by ID
export async function fetchFamily(familyId: string): Promise<Family | null> {
  const snap = await getDoc(doc(familiesCol, familyId));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as Family) : null;
}

// 3️⃣ Create Invite under sub-collection
export async function createInvite(
  familyId: string, role: Role, ttlHours = 24
): Promise<Invite> {
  const invitesCol = collection(familiesCol, familyId, "invites");
  // auto-ID as code
  const ref = await addDoc(invitesCol, {
    role,
    createdAt: serverTimestamp(),
    expiresAt: serverTimestamp(), // adjust on server or via Cloud Function
  });
  return { code: ref.id, familyId, role, createdAt: null, expiresAt: null };
}

// 4️⃣ Redeem invite: atomically add member & delete invite
export async function redeemInvite(inviteCode: string, userId: string) {
  // lookup invite
  const q = query(
    collectionGroup(db, "invites"),
    where("__name__", "==", inviteCode)
  );
  const snaps = await getDocs(q);
  if (snaps.empty) throw new Error("Invalid invite code");
  const inviteSnap = snaps.docs[0];
  const { familyId, role } = inviteSnap.data() as any;
  
  // batch write: add role and delete invite
  const batch = writeBatch(db);
  batch.update(doc(familiesCol, familyId), {
    [`roles.${userId}`]: role,
  });
  batch.delete(inviteSnap.ref);
  await batch.commit();
  return { familyId, role } as { familyId: string; role: Role };
}

// 5️⃣ List your families (for profile preview)
export async function listUserFamilies(userId: string): Promise<Family[]> {
  const q = query(familiesCol, where(`roles.${userId}`, "!=", null));
  const snaps = await getDocs(q);
  return snaps.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Family));
}
