import { useState } from "react";
import { createFamilyInvite as createInviteApi } from "@/lib/family";

/**
 * Manages creation and display of a family‐invite code.
 *
 * @param familyID – ID of the family to create invites for
 */
export function useInvite(familyID: string) {
  const [inviteCode, setInviteCode] = useState("");
  const [show, setShow]             = useState(false);

  const create = async (ttlHours = 1) => {
    const inv = await createInviteApi(familyID, ttlHours);
    setInviteCode(inv.code);
    setShow(true);
  };

  const hide = () => setShow(false);

  return { inviteCode, show, create, hide };
}
