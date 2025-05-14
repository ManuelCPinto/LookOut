import { createContext } from "react";
import type Animated from "react-native-reanimated";


export function getTitleFromPath(path: string) {
  if (path === "/") return "Home";
  if (path.includes("devices")) return "Devices";
  if (path.includes("profile")) return "Profile";
  if (path.includes("activity")) return "Activity";
  if (path.includes("settings")) return "Settings";
  return "LookOut";
}

export interface DrawerState {
  open: boolean;
  toggle(): void;
  translateX: Animated.SharedValue<number>;
}

export const DrawerContext = createContext<DrawerState>({
  open: false,
  toggle: () => {},
  translateX: { value: 0 } as any,
});
