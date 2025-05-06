import React from "react";
import { View, Text, TouchableOpacity, Image, StatusBar } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname } from "expo-router";
import { getTitleFromPath } from "../lib/title-utils";

export default function Header() {
  const pathname = usePathname();
  const title = (getTitleFromPath(pathname) || "Home").toUpperCase();

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient
        colors={["#2563EB", "#1E40AF"]}
        start={[0, 0]}
        end={[1, 0]}
        className="px-4 h-24 shadow-lg"
      >
        <View className="flex-row items-center justify-between pt-8">
          {/* Menu */}
          <TouchableOpacity activeOpacity={0.7}>
            <Feather name="menu" size={28} color="#FFF" />
          </TouchableOpacity>

          {/* Title */}
          <Text className="text-white text-2xl font-bold">
            {title}
          </Text>

          {/* Avatar */}
          <TouchableOpacity activeOpacity={0.7}>
            <Image
              source={{ uri: "https://i.pravatar.cc/40" }}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </>
  );
}
