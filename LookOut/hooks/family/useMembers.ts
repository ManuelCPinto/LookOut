import { useMemo } from "react";
import { useGetFamily } from "./useGetFamily";

/**
 * Derives a flat list of members from a Family object.
 *
 * @param familyId - ID of the family whose members you want
 * @returns An array of `{ uid, role }` for each member
 */

export function useMembers(familyId?: string) {
  const family = useGetFamily(familyId);
  return useMemo(() => {
    if (!family?.roles) return [];
    return Object.entries(family.roles).map(([uid, role]) => ({ uid, role }));
  }, [family]);
}
