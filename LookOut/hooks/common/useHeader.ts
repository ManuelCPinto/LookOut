import { useContext, useEffect } from "react";
import { Dimensions } from "react-native";
import { usePathname } from "expo-router";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { DrawerContext, getTitleFromPath } from "@/lib/components";
import { auth } from "@/lib/firebase";
import { useProfile } from "@/hooks/user/useProfile";
import { useUserFamilies } from "@/hooks/family/useUserFamilies";
import { useSignOut } from "@/hooks/auth/useSignOut";

const HEADER_BLUE = "#2563EB";

/**
 * Encapsulates all header‐related logic:
 * - derives the screen title from the current path
 * - reads drawer open/close state and animates the panel & divider
 * - fetches the current user’s profile and family name
 * - provides a sign-out action
 *
 * @returns An object containing:
 *   - `title`: the uppercase header title (e.g. "HOME", "PROFILE")
 *   - `user`: the Firebase `User` object
 *   - `profile`: `{ username, email }` from your `useProfile` hook
 *   - `familyName`: name of the first family or empty string
 *   - `open`: boolean, whether the drawer is open
 *   - `signingOut`: boolean, true while sign-out is in progress
 *   - `toggle()`: callback to open/close the drawer
 *   - `signOutUser()`: callback to sign the user out
 *   - `drawerStyle`: animated style for the sliding drawer panel
 *   - `dividerStyle`: animated style for the little divider line
 */
export function useHeader() {
  const pathname = usePathname();
  const title = (getTitleFromPath(pathname) || "Home").toUpperCase();

  const { open, toggle, translateX } = useContext(DrawerContext);
  const drawerWidth = Dimensions.get("window").width * 0.75;
  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value - drawerWidth }],
  }));

  const dividerWidth = useSharedValue(0);
  useEffect(() => {
    dividerWidth.value = withTiming(open ? drawerWidth * 0.6 : 0, {
      duration: open ? 400 : 200,
    });
  }, [open, drawerWidth]);
  const dividerStyle = useAnimatedStyle(() => ({
    width: dividerWidth.value,
    backgroundColor: HEADER_BLUE,
  }));

  const user = auth.currentUser!;
  const { profile } = useProfile(user.uid);
  const { families } = useUserFamilies(user.uid);
  const familyName = families[0]?.name ?? "";

  const { signOutUser, loading: signingOut } = useSignOut();

  return {
    title,
    user,
    profile,
    familyName,
    open,
    signingOut,
    toggle,
    signOutUser,
    drawerStyle,
    dividerStyle,
  };
}
