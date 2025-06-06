// app/(tabs)/devices/index.tsx

import React, { useState, useCallback, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  RefreshControl,
  Pressable,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import RNModal from "react-native-modal";
import DeviceDetailModal from "./DeviceDetailModal";
import { useUserDevices, useMirrorOnOpen } from "@/hooks/devices";
import { useUserFamilies } from "@/hooks/family/useUserFamilies";
import { auth } from "@/lib/firebase";
import { router } from "expo-router";

export default function DevicesScreen() {
  const uid = auth.currentUser!.uid;
  const { families, loading: familiesLoading } = useUserFamilies(uid);
  const familyId = families[0]?.id ?? "";
  const hasFamily = families.length > 0;
  const personalDevices = useUserDevices();

  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "online" | "offline"
  >("all");
  const [sortOption, setSortOption] = useState<"recent" | "name">("recent");
  const [tempStatus, setTempStatus] = useState(statusFilter);
  const [tempSort, setTempSort] = useState(sortOption);
  const [selected, setSelected] = useState<(typeof personalDevices)[0] | null>(
    null
  );

  useMirrorOnOpen(filterVisible, statusFilter, setTempStatus);
  useMirrorOnOpen(filterVisible, sortOption, setTempSort);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  // ─── Sort & filter personal devices ───
  const raw = personalDevices
    .slice()
    .sort((a, b) =>
      sortOption === "recent"
        ? b.lastActivityAt.toMillis() - a.lastActivityAt.toMillis()
        : a.name.localeCompare(b.name)
    );

  const filtered = raw.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "all" ? true : d.status === statusFilter)
  );

  // ─── Floating “+” Button (navigates to add device) ───
  const addBtnRef = useRef<any>(null);
  const handleAddPress = () => {
    addBtnRef.current?.bounce(300);
    router.push("/devices/add");
  };

  // ─── “Go to Family” (pass `familyId` as param) ───
  const goToFamily = useCallback(() => {
    if (hasFamily) {
      // push to the new family route, attaching ?familyId=<id>
      router.push({
        pathname: "/devices/family",
        params: { familyId },
      });
    }
  }, [hasFamily, familyId, router]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Scope Toggle: “Mine” / “Family” ── */}
        <Animatable.View animation="fadeIn" className="flex-row mb-4">
          {/* “Mine” is always active (we are on the personal screen) */}
          <Pressable className="flex-1 mx-1 px-4 py-2 rounded-full bg-[#4F46E5]">
            <Text className="font-medium text-center text-white">Mine</Text>
          </Pressable>

          {/* “Family” toggles into the family screen; disabled if no family */}
          <Pressable
            onPress={goToFamily}
            disabled={!hasFamily}
            className={`flex-1 mx-1 px-4 py-2 rounded-full ${
              hasFamily ? "bg-gray-200" : "bg-gray-200 opacity-50"
            }`}
          >
            <Text
              className={`text-center font-medium ${
                hasFamily ? "text-gray-600" : "text-gray-400"
              }`}
            >
              Family
            </Text>
          </Pressable>
        </Animatable.View>

        {/* ── Search + Filter Row ── */}
        <View className="flex-row items-center mb-4">
          <TextInput
            className="flex-1 px-4 py-2 bg-white rounded-full shadow"
            placeholder="Search devices..."
            value={search}
            onChangeText={setSearch}
          />
          <Pressable
            onPress={() => setFilterVisible(true)}
            className="p-2 ml-3 bg-white rounded-full shadow"
          >
            <Ionicons name="filter" size={20} color="#4B5563" />
          </Pressable>
        </View>

        {/* ── Personal Device Cards ── */}
        {filtered.map((d, i) => (
          <Animatable.View key={d.id} animation="fadeInUp" delay={i * 80}>
            <Pressable
              onPress={() => setSelected(d)}
              className={`flex-row items-center bg-white rounded-2xl shadow p-6 mb-4 ${
                i === 0 ? "border-l-4 border-[#4F46E5]" : ""
              }`}
            >
              <Image
                source={require("@/assets/camera.png")}
                className="w-12 h-12"
                resizeMode="contain"
              />
              <View className="flex-1 ml-4">
                <Text className="text-xl font-semibold text-gray-800">
                  {d.name}
                </Text>
                <Text className="mt-1 text-xs text-gray-400">
                  {new Date(d.lastActivityAt.toMillis()).toLocaleTimeString(
                    [],
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </Text>
              </View>
              <View
                className={`w-3 h-3 rounded-full ${
                  d.status === "online" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <Ionicons
                name="chevron-forward"
                size={24}
                color="#9CA3AF"
                className="ml-4"
              />
            </Pressable>
          </Animatable.View>
        ))}
      </ScrollView>

      {/* ── Floating “+” Button ── */}
      <Animatable.View ref={addBtnRef}>
        <Pressable
          onPress={handleAddPress}
          className="absolute bottom-6 right-6 bg-[#4F46E5] rounded-full p-4 shadow-lg"
          android_ripple={{ color: "#3B82F6", radius: 28 }}
        >
          <Ionicons name="add" size={28} color="white" />
        </Pressable>
      </Animatable.View>

      {/* ── Filter Modal ── */}
      <RNModal
        isVisible={filterVisible}
        onBackdropPress={() => setFilterVisible(false)}
        onBackButtonPress={() => setFilterVisible(false)}
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropOpacity={0.5}
      >
        <View className="p-6 bg-white rounded-2xl">
          <Text className="mb-4 text-lg font-semibold text-gray-800">
            Filters
          </Text>
          {/* Status */}
          <Text className="mb-2 text-sm font-medium text-gray-700">Status</Text>
          <View className="flex-row mb-4 space-x-2">
            {(["all", "online", "offline"] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setTempStatus(s)}
                className={`px-3 py-1 rounded-full border ${
                  tempStatus === s ? "border-[#4F46E5]" : "border-gray-300"
                }`}
              >
                <Text
                  className={`text-sm ${
                    tempStatus === s ? "text-[#4F46E5]" : "text-gray-600"
                  }`}
                >
                  {s === "all" ? "Any" : s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Sort by */}
          <Text className="mb-2 text-sm font-medium text-gray-700">
            Sort by
          </Text>
          <View className="flex-row mb-6 space-x-2">
            {(
              [
                { key: "recent", label: "Recent" },
                { key: "name", label: "Name" },
              ] as const
            ).map(({ key, label }) => (
              <Pressable
                key={key}
                onPress={() => setTempSort(key)}
                className={`px-3 py-1 rounded-full border ${
                  tempSort === key ? "border-[#4F46E5]" : "border-gray-300"
                }`}
              >
                <Text
                  className={`text-sm ${
                    tempSort === key ? "text-[#4F46E5]" : "text-gray-600"
                  }`}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Cancel / Apply */}
          <View className="flex-row justify-end space-x-3">
            <Pressable
              onPress={() => setFilterVisible(false)}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              <Text className="text-gray-600">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setStatusFilter(tempStatus);
                setSortOption(tempSort);
                setFilterVisible(false);
              }}
              className="px-4 py-2 bg-[#4F46E5] rounded-lg"
            >
              <Text className="font-semibold text-white">Apply</Text>
            </Pressable>
          </View>
        </View>
      </RNModal>

      {/* ── Device Detail Modal ── */}
      {selected && (
        <DeviceDetailModal
          device={selected}
          visible
          onClose={() => setSelected(null)}
        />
      )}
    </SafeAreaView>
  );
}
