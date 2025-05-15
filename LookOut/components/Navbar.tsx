import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { Entypo, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

import { useNavbar } from "@/hooks/common/useNavbar";

export default function Navbar() {
  const {
    TABS,
    activeTab,
    goToTab,
    underlineStyle,
    iconStyles,
    panGesture,
  } = useNavbar();
  
  return (
    <GestureHandlerRootView style={{ width: "100%" }}>
      <GestureDetector gesture={panGesture}>
        <View
          className={`flex-row items-center justify-between h-20 px-4 border-t-2 bg-white border-gray-200 shadow-2xl z-10`}
        >
          {TABS.map((t, i) => {
            const focused = t.name === activeTab;
            const color = focused ? "#444444" : "#A0A0A0";

            return (
              <Pressable
                key={t.name}
                onPress={() => goToTab(t.name)}
                className="items-center justify-center flex-1"
                android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: true }}
              >
                <Animated.View style={iconStyles[i]}>
                  {t.iconLib === "Entypo" && (
                    <Entypo name={t.iconName} size={focused ? 28 : 24} color={color} />
                  )}
                  {t.iconLib === "MaterialIcons" && (
                    <MaterialIcons name={t.iconName} size={focused ? 28 : 24} color={color} />
                  )}
                  {t.iconLib === "FontAwesome5" && (
                    <FontAwesome5 name={t.iconName} size={focused ? 28 : 24} color={color} />
                  )}
                </Animated.View>
                <Text className="mt-2 text-sm font-bold" style={{ color }}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}

          <Animated.View
            className="absolute top-0 w-12 h-px bg-[#2563EB] rounded-full shadow-md"
            style={underlineStyle}
          />
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
