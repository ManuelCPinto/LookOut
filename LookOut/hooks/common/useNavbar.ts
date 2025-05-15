import { useEffect } from "react";
import { useSegments, useRouter } from "expo-router";
import { useWindowDimensions, useColorScheme } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";

export const TABS = [
  { name: "home",    label: "Home",    iconName: "home",          iconLib: "Entypo"        },
  { name: "devices", label: "Devices", iconName: "camera-alt",    iconLib: "MaterialIcons" },
  { name: "logs",    label: "Logs",    iconName: "clipboard-list",iconLib: "FontAwesome5"  },
] as const;

type TabName = typeof TABS[number]["name"];

/**
 * Encapsulates all bottom-tab bar logic:
 * - determines the active tab from the URL
 * - provides a navigation function to switch tabs
 * - animates the underline position
 * - animates the icon scales
 * - provides a pan gesture to swipe between tabs
 * - exposes whether the device is in dark mode
 *
 * @returns An object containing:
 *   - `TABS`: array of tab definitions
 *   - `activeTab`: the current tab key
 *   - `goToTab(tab)`: function to navigate to a tab
 *   - `underlineStyle`: animated style for the underline
 *   - `iconStyles`: array of animated styles for each icon
 *   - `panGesture`: Gesture object for swipe navigation
 */

export function useNavbar() {
  const segments = useSegments();
  const activeTab = (segments[1] as TabName) || "home";

  const router = useRouter();
  const goToTab = (tab: TabName) => router.replace(`/(tabs)/${tab}`);

  const { width } = useWindowDimensions();
  const underlineX = useSharedValue(0);
  useEffect(() => {
    const horizPad = 16 * 2;
    const contentW = width - horizPad;
    const tabW = contentW / TABS.length;
    const idx = TABS.findIndex((t) => t.name === activeTab);
    const underlineW = 50;
    const x = 16 + idx * tabW + tabW / 2 - underlineW / 2;
    underlineX.value = withTiming(x, { duration: 300 });
  }, [activeTab, width]);
  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: underlineX.value }],
  }));

  const scales = TABS.map((t) =>
    useSharedValue(t.name === activeTab ? 1.3 : 1)
  );
  useEffect(() => {
    scales.forEach((sv, i) => {
      const to = TABS[i].name === activeTab ? 1.3 : 1;
      sv.value = withSpring(to, { damping: 8, stiffness: 150 });
    });
  }, [activeTab]);
  const iconStyles = scales.map((sv) =>
    useAnimatedStyle(() => ({ transform: [{ scale: sv.value }] }))
  );

  const panGesture = Gesture.Pan().onEnd(({ translationX, velocityX }) => {
    if (Math.abs(translationX) > 40 || Math.abs(velocityX) > 400) {
      let idx = TABS.findIndex((t) => t.name === activeTab);
      idx = translationX < 0 ? idx + 1 : idx - 1;
      if (idx < 0) idx = TABS.length - 1;
      if (idx >= TABS.length) idx = 0;
      goToTab(TABS[idx].name);
    }
  });
  return {
    TABS,
    activeTab,
    goToTab,
    underlineStyle,
    iconStyles,
    panGesture,
  };
}
