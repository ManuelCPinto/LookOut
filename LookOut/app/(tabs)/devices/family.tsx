// app/(tabs)/devices/family.tsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  RefreshControl,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { useLocalSearchParams, useRouter } from "expo-router";
import RNModal from "react-native-modal";

import DeviceDetailModalFam from "./DeviceDetailModalFam";
import {
  useFamilyDevices,
  useMirrorOnOpen,
  useUserDevices,
} from "@/hooks/devices";
import { addDeviceToFamily } from "@/lib/family";
import { auth } from "@/lib/firebase";

export default function FamilyDevicesScreen() {
  const router = useRouter();
  const uid = auth.currentUser!.uid;
  const { familyId } = useLocalSearchParams<{ familyId: string }>();

  useEffect(() => {
    if (!familyId) {
      router.back();
    }
  }, [familyId, router]);

  if (!familyId) {
    return null;
  }

  const familyDevices = useFamilyDevices(familyId);
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
  const [selected, setSelected] = useState<(typeof familyDevices)[0] | null>(
    null
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());

  useMirrorOnOpen(filterVisible, statusFilter, setTempStatus);
  useMirrorOnOpen(filterVisible, sortOption, setTempSort);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  // ─── Sort + filter family devices ───
  const raw = familyDevices
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

  const fmtTime = (ts: { toMillis(): number }) =>
    new Date(ts.toMillis()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  // ─── Compute list of devices *not* already in family ───
  const familyIdsSet = new Set(familyDevices.map((d) => d.id));
  const availableToAdd = personalDevices
    .filter((d) => !familyIdsSet.has(d.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const toggleSelectToAdd = (deviceId: string) => {
    setSelectedToAdd((prev) => {
      const next = new Set(prev);
      if (next.has(deviceId)) next.delete(deviceId);
      else next.add(deviceId);
      return next;
    });
  };

  const confirmAddDevices = async () => {
    const toAdd = Array.from(selectedToAdd);
    for (const devId of toAdd) {
      await addDeviceToFamily(familyId, devId);
    }
    setSelectedToAdd(new Set());
    setShowAddModal(false);
  };

  // ─── Floating “+” Button ───
  const addBtnRef = useRef<any>(null);
  const handleAddPress = () => {
    addBtnRef.current?.bounce(300);
    setShowAddModal(true);
  };

  // ─── “Mine” button: go back to personal devices ───
  const goBackToPersonal = useCallback(() => {
    router.back();
  }, [router]);

  // Dimensions for modal sizing
  const screenW = Dimensions.get("window").width;
  const screenH = Dimensions.get("window").height;

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
        {/* ── Toggle “Mine” / “Family” ── */}
        <Animatable.View animation="fadeIn" className="flex-row mb-4">
          <Pressable
            onPress={goBackToPersonal}
            className="flex-1 px-4 py-2 mx-1 bg-gray-200 rounded-full"
          >
            <Text className="font-medium text-center text-gray-600">Mine</Text>
          </Pressable>
          <Pressable className="flex-1 mx-1 px-4 py-2 rounded-full bg-[#4F46E5]">
            <Text className="font-medium text-center text-white">Family</Text>
          </Pressable>
        </Animatable.View>

        {/* ── Search + Filter ── */}
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

        {/* ── If no devices in this family, show a placeholder ── */}
        {filtered.length === 0 ? (
          <View className="items-center flex-1 mt-20">
            <Ionicons name="home-outline" size={48} color="#CBD5E1" />
            <Text className="mt-4 text-lg text-gray-400">
              No devices in this family.
            </Text>
          </View>
        ) : (
          /* ── Otherwise, render the family devices ── */
          filtered.map((d, i) => (
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
          ))
        )}
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

      {/* ── “Add to Family” Modal ── */}
      <RNModal
        isVisible={showAddModal}
        onBackdropPress={() => setShowAddModal(false)}
        onBackButtonPress={() => setShowAddModal(false)}
        backdropOpacity={0.5}
        animationIn="fadeInDown"
        animationOut="fadeOutUp"
        style={{ margin: 0, justifyContent: "center", alignItems: "center" }}
      >
        {/* Outer container is bg-gray-100 now */}
        <Animatable.View
          animation="fadeInUp"
          duration={300}
          className="bg-gray-100 rounded-3xl"
          style={{
            width: screenW * 0.9,
            maxHeight: screenH * 0.8,
          }}
        >
          {/* Title */}
          <View className="px-6 pt-6 pb-2">
            <Text className="text-2xl font-bold text-gray-800">
              Select Devices to Add
            </Text>
          </View>

          {/* Scrollable List of “Pills” */}
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 6, paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {availableToAdd.length === 0 ? (
              <View className="items-center my-12">
                <Text className="text-gray-500">
                  No available devices to add.
                </Text>
              </View>
            ) : (
              availableToAdd.map((d, idx) => {
                const isSelected = selectedToAdd.has(d.id);

                return (
                  <View key={d.id} className="px-4 py-1">
                    {/* 
                      Wrap each Pressable in a rounded container to force the ripple to stay rounded.
                      We give the container `rounded-2xl overflow-hidden` so the ripple cannot exceed the shape.
                    */}
                    <View
                      className={`rounded-2xl overflow-hidden ${
                        isSelected
                          ? "border-2 border-indigo-500"
                          : "border border-gray-300"
                      }`}
                    >
                      <Pressable
                        onPress={() => toggleSelectToAdd(d.id)}
                        android_ripple={{
                          color: isSelected ? "#E0E7FF" : "#F3F4F6",
                        }}
                        className={`flex-row items-center px-5 py-4 bg-white`}
                      >
                        {/* Left: Large circular thumbnail */}
                        <View className="w-10 h-10 overflow-hidden rounded-full">
                          <Image
                            source={require("@/assets/camera.png")}
                            className="w-full h-full"
                            resizeMode="contain"
                          />
                        </View>

                        {/* Middle: Device Name */}
                        <Text
                          className={`ml-4 flex-1 text-lg font-medium ${
                            isSelected ? "text-indigo-700" : "text-gray-800"
                          }`}
                        >
                          {d.name}
                        </Text>

                        {/* Right: Check or Empty Circle */}
                        {isSelected ? (
                          <View className="items-center justify-center bg-indigo-500 rounded-full w-7 h-7">
                            <Ionicons
                              name="checkmark"
                              size={20}
                              color="white"
                            />
                          </View>
                        ) : (
                          <View className="border-2 border-gray-300 rounded-full w-7 h-7" />
                        )}
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Cancel / Add Buttons */}
          <View className="flex-row justify-end px-6 py-4 space-x-3 bg-gray-100 border-t border-gray-200 rounded-b-3xl">
            <Pressable
              onPress={() => {
                setShowAddModal(false);
                setSelectedToAdd(new Set());
              }}
              className="px-5 py-2 bg-gray-300 rounded-lg"
            >
              <Text className="font-medium text-gray-700">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={confirmAddDevices}
              disabled={selectedToAdd.size === 0}
              className={`px-5 py-2 rounded-lg ${
                selectedToAdd.size === 0 ? "bg-gray-300" : "bg-[#4F46E5]"
              }`}
            >
              <Text
                className={`font-medium ${
                  selectedToAdd.size === 0 ? "text-gray-400" : "text-white"
                }`}
              >
                Add ({selectedToAdd.size})
              </Text>
            </Pressable>
          </View>
        </Animatable.View>
      </RNModal>
       {/* ── Device Detail Modal ── */}
       {selected && (
        <DeviceDetailModalFam
          familyId = {familyId}
          device={selected}
          visible
          onClose={() => setSelected(null)}
        />
      )}
    </SafeAreaView>
  );
}
