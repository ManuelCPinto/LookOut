import React, {useState, useEffect, useMemo } from "react";
import { Dimensions } from "react-native";
import { Slot } from "expo-router";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import { DrawerContext } from "@/lib/components";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const translateX = useSharedValue(0);
  const drawerWidth = Dimensions.get("window").width * 0.75;

  useEffect(() => {
    translateX.value = withTiming(open ? drawerWidth : 0, { duration: 250 });
  }, [open]);

  const drawer = useMemo(
    () => ({
      open,
      toggle: () => setOpen((v) => !v),
      translateX,
    }),
    [open]
  );

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <DrawerContext.Provider value={drawer}>
      <Header />
      <Animated.View style={[{ flex: 1 }, contentStyle]}>
        <Slot />
      </Animated.View>
      <Navbar />
    </DrawerContext.Provider>
  );
}
