// app/(tabs)/home/index.tsx
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
import { LogType } from "@/lib/logs";
import { useLogsForDeviceIDs } from "@/hooks/logs/useLogsForDeviceIDs";

export default function HomeScreen() {
  // ── Welcome Stats ──
  const stats = [
    { value: 12, label: "Events Today" },
    { value: 3,  label: "Alerts" },
    { value: 5,  label: "Cameras Online" },
  ];

  // ── Figure out family / personal devices ──
  const uid = auth.currentUser!.uid;
  const { families } = useUserFamilies(uid);
  const familyId     = families[0]?.id;
  const isMember     = useHasRole(familyId, uid, "Member");
  const personal     = useUserDevices();
  const familyAll    = useFamilyDevices(familyId);
  const family       = isMember ? familyAll : [];

  // ── Merge without duplicates ──
  const allDevs = useMemo(() => {
    const map = new Map<string, typeof personal[0]>();
    personal.forEach(d => map.set(d.id, d));
    family.forEach(d => map.set(d.id, d));
    return Array.from(map.values());
  }, [personal, family]);

  // ── Build a lookup from deviceId → name ──
  const deviceNameMap = useMemo(() => {
    const m = new Map<string, string>();
    allDevs.forEach(d => m.set(d.id, d.name));
    return m;
  }, [allDevs]);

  // ── Today's range ──
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const now = new Date();

  // ── Get all logs for these devices in today’s range ──
  const deviceIds = allDevs.map(d => d.id);
  const logs      = useLogsForDeviceIDs(deviceIds, startOfToday, now);

  // ── Only take the first two for homepage ──
  const recent = logs.slice(0, 2);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        className="p-4 space-y-6"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Welcome + Stats + Devices ── */}
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

          {/* Your Devices */}
          <Text className="mt-6 mb-2 text-lg font-medium text-gray-800">
            Your Devices
          </Text>
          {allDevs.length === 0 ? (
            <View className="items-center py-8">
              <Ionicons name="phone-portrait-outline" size={48} color="#CBD5E1" />
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
            <Text className="font-semibold text-white">View All Devices</Text>
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
              <Ionicons name="notifications-off-outline" size={48} color="#CBD5E1" />
              <Text className="mt-4 text-gray-500">No alerts today.</Text>
            </View>
          ) : (
            <View className="mt-4 space-y-3">
              {recent.map((e) => {
                // fallback to our map if e.deviceName is undefined
                const humanName = e.deviceName || deviceNameMap.get(e.deviceId) || "Unknown";
                const icon = e.type === LogType.RING_DOORBELL
                  ? "notifications-outline"
                  : "walk-outline";

                return (
                  <View
                    key={e.id}
                    className="flex-row items-center px-3 py-3 border-l-4 border-indigo-600 rounded-lg bg-gray-50"
                  >
                    <Ionicons
                      name={icon}
                      size={20}
                      color="#4F46E5"
                      className="mr-3"
                    />
                    <View className="flex-1">
                      <Text className="font-medium text-gray-800">
                        {e.type === LogType.RING_DOORBELL
                          ? `Doorbell rang – ${humanName}`
                          : `Motion detected – ${humanName}`}
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
                );
              })}
            </View>
          )}

          <TouchableOpacity
            className="items-center py-3 mt-4 bg-indigo-600 rounded-full"
            onPress={() => router.push("/logs")}
          >
            <Text className="font-semibold text-white">View All Alerts</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
}
