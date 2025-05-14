// components/Header.tsx
import React from "react";
import {
  StatusBar,
  Image,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated from "react-native-reanimated";
import { useHeader } from "@/hooks/common/useHeader";
import { router } from "expo-router";

export default function Header() {
  const {
    title,
    user,
    profile,
    familyName,
    toggle,
    signOutUser,
    signingOut,
    drawerStyle,
    dividerStyle,
  } = useHeader();

  const drawerWidth = Dimensions.get("window").width * 0.75;

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Top gradient bar */}
      <LinearGradient
        colors={["#2563EB", "#1E40AF"]}
        start={[0, 0]}
        end={[1, 0]}
        className="relative h-24 px-4 shadow-md"
      >
        <View className="flex-row items-center justify-center pt-8">
          <TouchableOpacity
            onPress={toggle}
            className="absolute p-2 left-4 top-8"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Image
              source={{
                uri:
                  user.photoURL ||
                  `https://i.pravatar.cc/40?u=${encodeURIComponent(
                    user.email!
                  )}`,
              }}
              className="w-10 h-10 border-2 border-white rounded-full"
            />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">{title}</Text>
        </View>
      </LinearGradient>

      {/* Drawer panel */}
      <Animated.View
        className="absolute top-0 bottom-0 left-0 bg-white shadow-lg rounded-tr-3xl rounded-br-3xl"
        style={[{ width: drawerWidth }, drawerStyle]}
      >
        <SafeAreaView className="flex-1">
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
            {/* Drawer header */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
              <View className="flex-row items-center">
                <Image
                  source={{
                    uri:
                      user.photoURL ||
                      `https://i.pravatar.cc/80?u=${encodeURIComponent(
                        user.email!
                      )}`,
                  }}
                  className="w-12 h-12 rounded-full"
                />
                <View className="ml-3">
                  <Text className="text-lg font-bold text-gray-900">
                    {profile?.username ?? "You"}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    @{user.email?.split("@")[0]}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={toggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Family info */}
            <View className="px-4 py-2">
              <Text>
                <Text className="text-gray-500">Family: </Text>
                <Text className="font-bold text-gray-900">{familyName || "–"}</Text>
              </Text>
            </View>

            {/* Animated divider */}
            <Animated.View
              className="h-0.5 self-center my-2 rounded-full"
              style={dividerStyle}
            />

            {/* Account section */}
            <View className="px-4 mt-4">
              <Text className="mb-2 text-sm font-semibold text-gray-500">
                Account
              </Text>
              <TouchableOpacity
                className="flex-row items-center py-3"
                activeOpacity={0.7}
                onPress={() => {
                  toggle();
                  router.push("/profile");
                }}
              >
                <Feather name="user" size={20} color="#333" />
                <Text className="ml-4 text-base text-gray-900">
                  Manage Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center py-3"
                activeOpacity={0.7}
                onPress={() => {
                  toggle();
                  router.push("/family");
                }}
              >
                <Feather name="users" size={20} color="#333" />
                <Text className="ml-4 text-base text-gray-900">
                  Manage Family
                </Text>
              </TouchableOpacity>
            </View>

            {/* Devices section */}
            <View className="px-4 mt-6">
              <Text className="mb-2 text-sm font-semibold text-gray-500">
                Devices
              </Text>
              <TouchableOpacity
                className="flex-row items-center py-3"
                activeOpacity={0.7}
                onPress={() => {
                  toggle();
                  router.push("/devices");
                }}
              >
                <Feather name="smartphone" size={20} color="#333" />
                <Text className="ml-4 text-base text-gray-900">
                  Your Devices
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center py-3"
                activeOpacity={0.7}
                onPress={() => {
                  toggle();
                  router.push("/notifications");
                }}
              >
                <Feather name="bell" size={20} color="#333" />
                <Text className="ml-4 text-base text-gray-900">
                  Notifications
                </Text>
              </TouchableOpacity>
            </View>

            {/* Settings section */}
            <View className="px-4 mt-6">
              <Text className="mb-2 text-sm font-semibold text-gray-500">
                Settings
              </Text>
              <TouchableOpacity
                className="flex-row items-center py-3"
                activeOpacity={0.7}
                onPress={() => {
                  toggle();
                  router.push("/help");
                }}
              >
                <Feather name="help-circle" size={20} color="#333" />
                <Text className="ml-4 text-base text-gray-900">
                  Help & Support
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center py-3"
                activeOpacity={0.7}
                onPress={() => {
                  toggle();
                  router.push("/settings/theme");
                }}
              >
                <Feather name="sun" size={20} color="#333" />
                <Text className="ml-4 text-base text-gray-900">Theme</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center py-3"
                activeOpacity={0.7}
                onPress={() => {
                  toggle();
                  router.push("/about");
                }}
              >
                <Feather name="info" size={20} color="#333" />
                <Text className="ml-4 text-base text-gray-900">About</Text>
              </TouchableOpacity>
            </View>

            {/* Sign Out (last item) */}
            <View className="h-px mx-4 my-4 bg-gray-200" />
              <TouchableOpacity
                onPress={signOutUser}
                disabled={signingOut}
                className="flex-row items-center px-4 py-3 rounded-lg"
              >
                <Feather name="log-out" size={20} color="#DC2626" />
                <Text
                  className={`ml-4 font-semibold ${
                    signingOut ? "text-red-400" : "text-red-400"
                  }`}
                >
                  {signingOut ? "Signing out…" : "Sign Out"}
                </Text>
              </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </>
  );
}
