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
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { useHeader } from "@/hooks/common/useHeader";
import { router } from "expo-router";

// → Import the “useUserFamilies” hook:
import { useUserFamilies } from "@/hooks/family/useUserFamilies";
import { auth } from "@/lib/firebase";

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

  // ─── Fetch current user’s families; we’ll grab the “first” family ID:
  const uid = auth.currentUser!.uid;
  const { families } = useUserFamilies(uid);
  const firstFamilyId = families[0]?.id; // may be undefined if they have no family

  const drawerWidth = Dimensions.get("window").width * 0.75;
  const topPadding =
    Platform.OS === "ios" ? 50 : (StatusBar.currentHeight ?? 0) + 10;

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Top bar (purple) */}
      <View
        style={{
          backgroundColor: "#4F46E5",
          paddingTop: topPadding,
          paddingBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            paddingHorizontal: 16,
          }}
        >
          {/* Avatar button */}
          <TouchableOpacity
            onPress={toggle}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{
              position: "absolute",
              left: 16,
              top: 0,
            }}
          >
            <Image
              source={{
                uri:
                  user.photoURL ||
                  `https://i.pravatar.cc/40?u=${encodeURIComponent(
                    user.email!
                  )}`,
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: "#fff",
              }}
            />
          </TouchableOpacity>

          {/* Title */}
          <Text
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: "700",
            }}
          >
            {title}
          </Text>
        </View>
      </View>

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
                  <Text className="text-lg font-bold ">
                    {profile?.username ?? "You"}
                  </Text>
                  <Text className="text-sm ">
                    @{user.email?.split("@")[0]}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={toggle}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={24} color="#4F46E5" />
              </TouchableOpacity>
            </View>

            {/* Family info */}
            <View className="px-4 py-2">
              <Text>
                <Text> Family: </Text>
                <Text className="font-bold ">
                  {familyName || "–"}
                </Text>
              </Text>
            </View>

            {/* Animated divider */}
            <Animated.View
              className="h-0.5 self-center my-2 rounded-full"
              style={dividerStyle}
            />

            {/* Account section */}
            <View className="px-4 mt-4">
              <Text className="mb-2 text-sm font-semibold ">
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
                <Feather name="user" size={20} color="#4F46E5" />
                <Text className="ml-4 text-base ">
                  Manage Profile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-3"
                activeOpacity={0.7}
                onPress={() => {
                  toggle();
                  if (firstFamilyId) {
                    router.push(`/family/${firstFamilyId}`);
                  } else {
                  }
                }}
              >
                <Feather name="users" size={20} color="#4F46E5" />
                <Text className="ml-4 text-base">
                  Manage Family
                </Text>
              </TouchableOpacity>
            </View>

            {/* Devices section */}
            <View className="px-4 mt-6">
              <Text className="mb-2 text-sm font-semibold ">
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
                <Feather name="smartphone" size={20} color="#4F46E5" />
                <Text className="ml-4 text-base ">
                  Your Devices
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-3"
                activeOpacity={0.7}
                onPress={() => {
                  toggle();                }}
              >
                <Feather name="bell" size={20} color="#4F46E5" />
                <Text className="ml-4 text-base">
                  Notifications
                </Text>
              </TouchableOpacity>
            </View>

            {/* Settings section */}
            <View className="px-4 mt-6">
              <Text className="mb-2 text-sm font-semibold ">
                Settings
              </Text>

              <TouchableOpacity
                className="flex-row items-center py-3"
                activeOpacity={0.7}
                onPress={() => {
                  toggle();                }}
              >
                <Feather name="help-circle" size={20} color="#4F46E5" />
                <Text className="ml-4 text-base ">
                  Help & Support
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-3"
                activeOpacity={0.7}
                onPress={() => {
                  toggle();                }}
              >
                <Feather name="sun" size={20} color="#4F46E5" />
                <Text className="ml-4 text-base ">
                  Theme
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center py-3"
                activeOpacity={0.7}
                onPress={() => {
                  toggle();                }}
              >
                <Feather name="info" size={20} color="#4F46E5" />
                <Text className="ml-4 text-base">
                  About
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Out */}
            <View className="h-px mx-4 my-4 bg-gray-200" />
            <TouchableOpacity
              onPress={signOutUser}
              disabled={signingOut}
              className="flex-row items-center px-4 py-3 rounded-lg"
            >
              <Feather name="log-out" size={20} color="#DC2626" />
              <Text
                className={`ml-4 font-semibold ${
                  signingOut ? "text-red-300" : "text-red-600"
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
