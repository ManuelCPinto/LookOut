import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
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
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="p-4 space-y-4">
        
        {/* ── Welcome + Stats + Devices ── */}
        <View className="px-4 py-5 bg-white shadow rounded-2xl">
          {/* Greeting */}
          <Text className="text-xl font-semibold text-gray-800">
            Welcome back 👋
          </Text>
          <Text className="mt-1 text-gray-500">
            Monitor your spaces in real time with LookOut.
          </Text>

          {/* Stats */}
          <View className="flex-row justify-between mt-4">
            {stats.map((s, i) => (
              <View key={i} className="items-center flex-1">
                <Text className="text-2xl font-bold text-[#4F46E5]">
                  {s.value}
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Your Devices */}
          <Text className="mt-6 mb-2 text-lg font-medium text-gray-800">
            Your Devices
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {devices.map((d, i) => (
              <View
                key={i}
                className="w-[48%] bg-white rounded-xl p-3 mb-4 items-center border border-gray-200"
              >
                <Image
                  source={d.icon}
                  className="w-20 h-20 mb-2"
                  resizeMode="contain"
                />
                <Text className="text-base font-medium text-gray-700">
                  {d.name}
                </Text>
              </View>
            ))}
          </View>

          {/* View All */}
          <TouchableOpacity
            className="mt-2 py-3 bg-[#4F46E5] rounded-full items-center"
            onPress={() => router.push("/devices")}
          >
            <Text className="font-semibold text-white">View All Devices</Text>
          </TouchableOpacity>
        </View>

        {/* ── Recent Alerts ── */}
        <View className="px-4 py-5 bg-white shadow rounded-2xl">
          <Text className="text-lg font-medium text-gray-800">
            Recent Alerts
          </Text>

          <View className="mt-4 space-y-3">
            {alerts.map((a, i) => (
              <View
                key={i}
                className="flex-row items-center bg-gray-50 px-3 py-3 rounded-lg border-l-4 border-[#4F46E5]"
              >
                <Ionicons
                  name={a.type === "doorbell" ? "notifications-outline" : "walk-outline"}
                  size={20}
                  color="#4F46E5"
                  className="mr-3"
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
            className="mt-4 py-3 bg-[#4F46E5] rounded-full items-center"
            onPress={() => router.push("/logs")}
          >
            <Text className="font-semibold text-white">View All Alerts</Text>
          </TouchableOpacity>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}
