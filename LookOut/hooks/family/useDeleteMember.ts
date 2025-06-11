// hooks/family/useDeleteMember.ts
import { useCallback, useState } from "react";
import { removeUserFromFamily } from "@/lib/family";

export function useDeleteMember(familyId: string) {
  const [loading, setLoading] = useState(false);
  const deleteMember = useCallback(
    async (userId: string) => {
      setLoading(true);
      try {
        await removeUserFromFamily(familyId, userId);
      } finally {
        setLoading(false);
      }
    },
    [familyId]
  );
  return { deleteMember, loading };
}
