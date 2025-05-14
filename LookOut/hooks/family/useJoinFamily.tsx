import { useState } from "react";
import { redeemInvite } from "@/lib/family";

/**
 * Hook for joining a family via an invite code.
 * Manages the loading and error states of the join operation.
 * @param uid – currently authenticated user’s ID
 */
export function useJoinFamily(uid: string) {
  const [joining, setJoining] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const join = async (code: string) => {
    setError(null);
    setJoining(true);
    try {
      await redeemInvite(code.trim(), uid);
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setJoining(false);
    }
  };

  return { join, joining, error };
}
