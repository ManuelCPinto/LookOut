import { useEffect } from "react";

/**
 * When `openFlag` becomes true, sets a “temp” state to mirror a committed value.
 * Useful for initializing modal form fields to the last‐saved settings.
 * @param openFlag   Boolean flag (e.g. “is modal visible?”)
 * @param committed  The current committed value (e.g. filter or sort option)
 * @param setter     Setter for the temporary copy
 */
export function useMirrorOnOpen<T>(
  openFlag: boolean,
  committed: T,
  setter: (value: T) => void
) {
  useEffect(() => {
    if (openFlag) {
      setter(committed);
    }
  }, [openFlag, committed, setter]);
}
