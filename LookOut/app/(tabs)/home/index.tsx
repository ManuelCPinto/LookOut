import React, { useMemo } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { router } from "expo-router";

import cameraIcon from "@/assets/camera.png";
import { auth } from "@/lib/firebase";

import { useUserDevices } from "@/hooks/devices/useUserDevices";
import { useFamilyDevices } from "@/hooks/devices/useFamilyDevices";
import { useUserFamilies } from "@/hooks/family/useUserFamilies";
import { useHasRole } from "@/hooks/user/useHasRole";
import {LogType } from "@/lib/logs";
import { useLogsForDeviceIDs } from "@/hooks/logs/useLogsForDeviceIDs";

export default function HomeScreen() {
  const stats = [
    { value: 12, label: "Events Today" },
    { value: 3,  label: "Alerts" },
    { value: 5,  label: "Cameras Online" },
  ];

  const uid = auth.currentUser!.uid;
  const { families } = useUserFamilies(uid);
  const familyId     = families[0]?.id;
  const isMember     = useHasRole(familyId, uid, "Member");
  const personal        = useUserDevices();
  const allFamilyDevices = useFamilyDevices(familyId);
  const family = isMember ? allFamilyDevices : [];

  function mergeUniqueById<T extends { id: string }>(
    a: T[],
    b: T[]
  ): T[] {
    const map = new Map<string, T>()
    for (const d of a) map.set(d.id, d)
    for (const d of b) map.set(d.id, d)
    return Array.from(map.values())
  }

  const allDevs = mergeUniqueById(personal, family);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0,0,0,0);
    return d;
  }, []);
  const now = new Date();

  const deviceIds = allDevs.map((d) => d.id);
  const logs      = useLogsForDeviceIDs(deviceIds, todayStart, now);
  const recent    = logs.slice(0,3);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        className="p-4 space-y-6"
        showsVerticalScrollIndicator={false}
      >
        <Animatable.View
          animation="fadeInUp"
          delay={100}
          className="p-5 bg-white shadow rounded-2xl"
        >
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
                <Text className="text-2xl font-bold text-indigo-600">
                  {s.value}
                </Text>
                <Text className="mt-1 text-xs text-gray-500">{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Devices */}
          <Text className="mt-6 mb-2 text-lg font-medium text-gray-800">
            Your Devices
          </Text>
          {allDevs.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons
                name="phone-portrait-outline"
                size={48}
                color="#CBD5E1"
              />
              <Text className="mt-4 text-gray-500">No devices yet.</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {allDevs.map((d) => (
                <View
                  key={d.id}
                  className="w-[48%] bg-white rounded-xl p-3 mb-4 items-center border border-gray-200"
                >
                  <Image
                    source={cameraIcon}
                    className="w-20 h-20 mb-2"
                    resizeMode="contain"
                  />
                  <Text className="text-base font-medium text-gray-700">
                    {d.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Animatable.View>

        {/* View All Devices */}
        <Animatable.View animation="fadeInUp" delay={300}>
          <TouchableOpacity
            className="items-center py-3 bg-indigo-600 rounded-full"
            onPress={() => router.push("/devices")}
          >
            <Text className="font-semibold text-white">
              View All Devices
            </Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Recent Alerts */}
        <Animatable.View
          animation="fadeInUp"
          delay={500}
          className="p-5 bg-white shadow rounded-2xl"
        >
          <Text className="text-lg font-medium text-gray-800">
            Recent Alerts
          </Text>

          {recent.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color="#CBD5E1"
              />
              <Text className="mt-4 text-gray-500">
                No alerts today.
              </Text>
            </View>
          ) : (
            <View className="mt-4 space-y-3">
              {recent.map((e, i) => (
                <View
                  key={e.id}
                  className="flex-row items-center px-3 py-3 border-l-4 border-indigo-600 rounded-lg bg-gray-50"
                >
                  <Ionicons
                    name={
                      e.type === LogType.RING_DOORBELL
                        ? "notifications-outline"
                        : "walk-outline"
                    }
                    size={20}
                    color="#4F46E5"
                    className="mr-3"
                  />
                  <View className="flex-1">
                    <Text className="font-medium text-gray-800">
                      {e.type === LogType.RING_DOORBELL
                        ? `Doorbell rang – ${e.deviceName}`
                        : `Motion detected – ${e.deviceName}`}
                    </Text>
                    <Text className="mt-1 text-xs text-gray-500">
                      {e.time.toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            className="items-center py-3 mt-4 bg-indigo-600 rounded-full"
            onPress={() => router.push("/logs")}
          >
            <Text className="font-semibold text-white">
              View All Alerts
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
}
