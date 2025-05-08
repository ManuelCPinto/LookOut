// components/Navbar.tsx
import React, { useEffect } from "react"
import {
  View,
  Text,
  Pressable,
  useColorScheme,
  useWindowDimensions
} from "react-native"
import { useRouter, useSegments } from "expo-router"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from "react-native-reanimated"
import {
  Entypo,
  MaterialIcons,
  AntDesign,
  Ionicons,
  FontAwesome5
} from "@expo/vector-icons"

export default function Navbar() {
  const router = useRouter()
  const segments = useSegments()
  const colorScheme = useColorScheme()
  const { width } = useWindowDimensions()
  const translateX = useSharedValue(0)

  // our five tab routes
  const tabs = [
    { name: "home",     label: "Home",     icon: <Entypo name="home" /> },
    { name: "devices",   label: "Devices",  icon: <MaterialIcons name="camera" /> },
    { name: "profile",   label: "Profile",  icon: <AntDesign name="user" /> },
    { name: "activity",  label: "Activity", icon: <FontAwesome5 name="clipboard" /> },
    { name: "settings",  label: "Settings", icon: <Ionicons name="settings-sharp" /> },
  ]

  // find which segment we’re on
  const active = segments[1] ?? "index"
  const activeIndex = tabs.findIndex(t => t.name === active)

  // slide the little underline under the active tab
  useEffect(() => {
    if (activeIndex >= 0) {
      const tabW = width / tabs.length
      translateX.value = withTiming(activeIndex * tabW + (tabW - 32) / 2, {
        duration: 150
      })
    }
  }, [activeIndex, width])

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }))

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFF",
        borderTopWidth: 0,
        elevation: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 8,
        height: 80,
      }}
    >
      {tabs.map((tab, i) => {
        const focused = tab.name === active
        const color = focused ? "#1A1A1A" : "#A0A0A0"

        return (
          <Pressable
            key={tab.name}
            onPress={() => router.replace(`/(tabs)/${tab.name}`)}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {React.cloneElement(tab.icon, { size: 24, color })}
            <Text
              style={{
                marginTop: 4,
                fontSize: 13,
                color,
                fontWeight: focused ? "700" : "400",
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        )
      })}

      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 12,
            width: 32,
            height: 3,
            borderRadius: 1.5,
            backgroundColor: "#2563EB",
          },
          underlineStyle,
        ]}
      />
    </View>
  )
}
