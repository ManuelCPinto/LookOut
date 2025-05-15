import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  updateMemberRole,
  transferOwnership,
} from "@/lib/family";
import type { Role } from "@/lib/family";

/**
 * Hook for managing roles within a family.
 *
 * Provides functions to set any member’s role (owner/member/guest)
 * and to transfer ownership of the family to another user.
 *
 * @param familyId - The Firestore ID of the family document
 * @returns An object containing:
 *   - `setRole(userId: string, role: Role): Promise<void>`  
 *       Change a user’s role in the family.  
 *   - `transfer(userId: string): Promise<void>`  
 *       Transfer family ownership to `userId` (you’ll be demoted to member).  
 *   - `loading: boolean`  
 *       True while any operation is in progress.  
 *   - `error: string \| null`  
 *       Error message if the last operation failed.
 */
export function useManageMembers(familyId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function setRole(userId: string, role: Role) {
    setLoading(true);
    setError(null);
    try {
      await updateMemberRole(familyId, userId, role);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }
  
  async function transfer(userId: string) {
    const me = auth.currentUser!.uid;
    setLoading(true);
    setError(null);
    try {
      await transferOwnership(familyId, userId, me);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return { setRole, transfer, loading, error };
}
