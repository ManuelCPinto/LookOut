import { useGetFamily } from "@/hooks/family/useGetFamily";
import { hasRequiredRole, Role } from "@/lib/family";

/**
 * Checks whether the given user has at least the required role
 * within the specified family.
 *
 * @param familyId     - ID of the family to inspect
 * @param userId       - ID of the user whose role to check
 * @param requiredRole - The minimum Role required ("guest"|"member"|"owner")
 * @returns true if the user's role level ≥ requiredRole level, else false
 */
export function useHasRole(
  familyId: string | undefined,
  userId: string,
  requiredRole: Role
): boolean {
  const family = useGetFamily(familyId);
  if (!family) return false;
  return hasRequiredRole(family.roles[userId], requiredRole);
}
