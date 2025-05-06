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
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-lg">
          <Text className="text-xl font-bold text-blue-900 mb-1">
            Welcome back 👋
          </Text>
          <Text className="text-gray-500 mb-4">
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
          <Text className="text-lg font-semibold text-blue-900 mb-2">
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
            className="self-center bg-blue-600 px-5 py-2 rounded-full"
            onPress={() => router.push("/devices")}
          >
            <Text className="text-white font-semibold">
              View All Devices
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card 2: Recent Alerts */}
        <View className="bg-white rounded-2xl p-4 shadow-lg">
          <Text className="text-lg font-semibold text-blue-900 mb-3">
            Recent Alerts
          </Text>

          <View className="space-y-3 mb-4">
            {alerts.map((a, i) => (
              <View
                key={i}
                className="flex-row items-center bg-gray-50 p-3 rounded-lg border-l-4 border-yellow-300"
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
                  <Text className="text-xs text-gray-500 mt-1">
                    {a.time}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            className="w-full bg-blue-600 py-3 rounded-full items-center"
            onPress={() => router.push("/activity")}
          >
            <Text className="text-white font-semibold">
              View All Alerts
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
