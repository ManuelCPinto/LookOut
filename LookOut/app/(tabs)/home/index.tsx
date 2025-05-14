import React from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, Image} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import cameraIcon from "@/assets/camera.png";

export default function HomeScreen() {
  const stats = [
    { value: 12, label: "Events Today" },
    { value: 3,  label: "Alerts" },
    { value: 5,  label: "Cameras Online" },
  ];

  const devices = [
    { name: "Front Doorbell", icon: cameraIcon },
    { name: "Backyard",         icon: cameraIcon },
  ];

  const alerts = [
    {
      type: "doorbell",
      cameraName: "Front Doorbell",
      time:       "Today, 11:02 AM",
    },
    {
      type: "motion",
      cameraName: "Backyard",
      time:       "Today, 10:21 AM",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="px-4 py-4">

        {/* Card 1: Welcome + Stats + Devices */}
        <View className="p-4 mb-4 bg-white shadow-lg rounded-2xl">
          <Text className="mb-1 text-xl font-bold text-blue-900">
            Welcome back 👋
          </Text>
          <Text className="mb-4 text-gray-500">
            Monitor your spaces in real time with LookOut.
          </Text>

          {/* Stats row */}
          <View className="flex-row justify-between mb-4">
            {stats.map((s, i) => (
              <View key={i} className="items-center flex-1">
                <Text className="text-2xl font-bold text-blue-600">
                  {s.value}
                </Text>
                <Text className="text-xs text-gray-500">
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Devices grid */}
          <Text className="mb-2 text-lg font-semibold text-blue-900">
            Your Devices
          </Text>
          <View className="flex-row flex-wrap justify-between mb-4">
            {devices.map((d, i) => (
              <View
                key={i}
                className="w-[48%] bg-gray-100 rounded-xl p-3 mb-4 items-center"
              >
                <Image
                  source={d.icon}
                  className="w-20 h-20 mb-2 rounded-lg"
                  resizeMode="contain"
                />
                <Text className="text-sm font-medium text-gray-700">
                  {d.name}
                </Text>
              </View>
            ))}
          </View>

          {/* View All Devices*/}
          <TouchableOpacity
            className="self-center px-5 py-2 bg-blue-600 rounded-full"
            onPress={() => router.push("/devices")}
          >
            <Text className="font-semibold text-white">
              View All Devices
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card 2: Recent Alerts */}
        <View className="p-4 bg-white shadow-lg rounded-2xl">
          <Text className="mb-3 text-lg font-semibold text-blue-900">
            Recent Alerts
          </Text>

          <View className="mb-4 space-y-3">
            {alerts.map((a, i) => (
              <View
                key={i}
                className="flex-row items-center p-3 border-l-4 border-yellow-300 rounded-lg bg-gray-50"
              >
                <Ionicons
                  name={a.type === "doorbell" ? "notifications-outline" : "walk-outline"}
                  size={20}
                  color="#F59E0B"
                  style={{ marginRight: 12 }}
                />

                <View className="flex-1">
                  <Text className="font-medium text-gray-800">
                    {a.type === "doorbell"
                      ? `Doorbell rang – ${a.cameraName}`
                      : `Motion detected – ${a.cameraName}`}
                  </Text>
                  <Text className="mt-1 text-xs text-gray-500">
                    {a.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            className="items-center w-full py-3 bg-blue-600 rounded-full"
            onPress={() => router.push("/logs")}
          >
            <Text className="font-semibold text-white">
              View All Alerts
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
