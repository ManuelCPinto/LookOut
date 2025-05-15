import { useState } from "react";
import { createInvite as createInviteApi } from "@/lib/family";

/**
 * Manages creation and display state for an invite code.
 *
 * @param familyId - ID of the family to create invites for
 * @returns
 *   - inviteCode: the latest code string
 *   - show: boolean flag for whether the modal should display
 *   - create: fn(ttlHours?) to generate a new code
 *   - hide:   fn() to hide the invite modal
 */

export function useInvite(familyId: string) {
  const [inviteCode, setInviteCode] = useState("");
  const [show, setShow]             = useState(false);

  const create = async (ttlHours = 1) => {
    const inv = await createInviteApi(familyId, ttlHours);
    setInviteCode(inv.code);
    setShow(true);
  };

  const hide = () => setShow(false);

  return { inviteCode, show, create, hide };
}
