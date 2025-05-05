import React, { useEffect } from "react";
import { Tabs, useSegments } from "expo-router";
import {
  Entypo,
  MaterialIcons,
  AntDesign,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { Text, useColorScheme, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export default function Navbar() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);

  const tabRoutes = ["index", "devices", "profile", "activity", "settings"];
  const currentTab = segments[1] ?? "index";
  const currentIndex = tabRoutes.findIndex((r) => r === currentTab);

  useEffect(() => {
    if (currentIndex >= 0) {
      const tabWidth = width / tabRoutes.length;
      translateX.value = withTiming(
        currentIndex * tabWidth + (tabWidth - 32) / 2,
        { duration: 150 }
      );
    }
  }, [currentIndex, width]);

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <>
      <Tabs
        screenOptions={({ route }) => {
          const icons = {
            index:    <Entypo       name="home"            />,
            devices:  <MaterialIcons name="camera"         />,
            profile:  <AntDesign     name="user"           />,
            activity: <FontAwesome5  name="clipboard"      />,
            settings: <Ionicons      name="settings-sharp" />,
          };
          const routeKey = route.name.split("/")[0] as keyof typeof icons;
          return {
            headerShown:      false,
            tabBarStyle:      {
              backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFF",
              height:          80,
              elevation:       12,
              shadowColor:     "#000",
              shadowOpacity:   0.05,
              shadowOffset:    { width: 0, height: -4 },
              shadowRadius:    8,
              borderTopWidth:  0,
            },
            tabBarActiveTintColor:   "#1A1A1A",
            tabBarInactiveTintColor: "#A0A0A0",
            tabBarIcon: ({ color, focused }) => {
              const icon = React.cloneElement(
                icons[routeKey],
                { size: 24, color }
              );
              return icon;
            },
            tabBarLabel: ({ focused }) => {
              const labels = {
                index:    "Home",
                devices:  "Devices",
                profile:  "Profile",
                activity: "Activity",
                settings:"Settings",
              };
              return (
                <Text
                  className={`text-[13px] mt-1 ${
                    focused ? "text-[#1A1A1A] font-bold" : "text-[#A0A0A0]"
                  }`}
                >
                  {labels[routeKey]}
                </Text>
              );
            },
          };
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="devices/index" />
        <Tabs.Screen name="profile/index" />
        <Tabs.Screen name="activity/index" />
        <Tabs.Screen name="settings/index" />
      </Tabs>

      <Animated.View
        className="absolute bottom-[78px] h-[3px] w-[32px] rounded-full bg-blue-600"
        style={underlineStyle}
      />
    </>
  );
}
