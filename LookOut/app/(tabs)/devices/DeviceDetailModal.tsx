// app/(tabs)/devices/DeviceDetailModal.tsx

import React, { useEffect, useState, useCallback, memo } from "react";
import {
  Pressable,
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import RNModal from "react-native-modal";
import { Device } from "@/lib/devices";
import {
  useDeviceStats,
  useDeviceModal,
  useRenameDevice,
  useRegistrationFlow,
} from "@/hooks/devices";
import { useRouter } from "expo-router";
import { auth } from "@/lib/firebase";
import { useMqttPublish } from "@/hooks/common";
import { useAllLogs } from "@/hooks/logs/useAllLogs";
import { getLogIconAndLabel, LogType } from "@/lib/logs";

type Props = {
  device: Device;
  visible: boolean;
  onClose: () => void;
};

export default function DeviceDetailModal({ device, visible, onClose }: Props) {
  const { sheetRef, slideIn, slideOut } = useDeviceModal();

  useEffect(() => {
    if (visible) slideIn();
  }, [visible, slideIn]);

  const handleClose = useCallback(() => slideOut(onClose), [onClose, slideOut]);

  return (
    <RNModal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      backdropOpacity={0.3}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: "flex-end" }}
      presentationStyle="overFullScreen"
    >
      <Animatable.View
        ref={sheetRef}
        className="bg-white shadow-lg rounded-t-3xl"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 32,
          bottom: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <SheetContent device={device} onClose={handleClose} />
      </Animatable.View>
    </RNModal>
  );
}

const SheetContent = memo(function SheetContent({
  device,
  onClose,
}: {
  device: Device;
  onClose(): void;
}) {
  const router = useRouter();

  // ── LIVE LOGS HOOK ──
  const allLogs = useAllLogs(device.id);
  const recent = allLogs.slice(0, 3);

  // ── STATS + RENAME + REGISTRATION HOOKS ──
  const { uptime, latency, signalQuality } = useDeviceStats(device.id);
  const { rename, loading: renaming } = useRenameDevice();
  const uid = auth.currentUser!.uid;
  const { publish } = useMqttPublish();
  const { checkOnce, startPolling, stopPolling, isRegistered, loading } =
    useRegistrationFlow(device.id, uid);

  // ── LOCAL UI STATE ──
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(device.name);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  // initialize draft when device changes
  useEffect(() => {
    setDraftName(device.name);
  }, [device.name]);

  // auto‐hide success toast
  useEffect(() => {
    if (!successVisible) return;
    const t = setTimeout(() => setSuccessVisible(false), 2000);
    return () => clearTimeout(t);
  }, [successVisible]);

  const handleSave = useCallback(async () => {
    await rename(device.id, draftName);
    setEditing(false);
  }, [device.id, draftName, rename]);

  const handleHistory = useCallback(() => {
    router.push({ pathname: "/logs", params: { deviceId: device.id } });
  }, [device.id, router]);

  const onPressFingerprint = useCallback(() => setConfirmVisible(true), []);
  const handleRegisterFingerprint = useCallback(() => {
    if (!uid) return;
    publish(`${device.id}/sensor/fingerprint`, {
      type: "FINGERPRINT_REGISTRATION",
      userId: uid,
      isNew: false,
    });
  }, [device.id, publish, uid]);

  const onConfirm = useCallback(async () => {
    setConfirmVisible(false);
    handleRegisterFingerprint();
    const already = await checkOnce();
    if (already) setErrorVisible(true);
    else startPolling();
  }, [checkOnce, handleRegisterFingerprint, startPolling]);

  useEffect(() => {
    if (isRegistered) setSuccessVisible(true);
  }, [isRegistered]);

  const handleRequestSnapshot = useCallback(() => {
    publish(`${device.id}/sensor/camera/take_photo`, {
      type: "TAKE_PHOTO",
      userId: uid,
    });
  }, [device.id, publish, uid]);

  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);

  return (
    <>
      {/* ── DRAG HANDLE ── */}
      <Pressable onPress={onClose} className="items-center pt-2 pb-1">
        <View className="w-12 h-1 bg-gray-300 rounded-full" />
      </Pressable>

      {/* ── FINGERPRINT / RENAME / HEADER ── */}
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable onPress={onPressFingerprint} className="p-2 border border-gray-300 rounded">
            <Ionicons name="finger-print-outline" size={20} color="#4B5563" />
          </Pressable>

          {editing ? (
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              className="flex-1 px-3 py-1 mx-4 text-xl font-semibold text-center bg-gray-100 rounded-full"
            />
          ) : (
            <Text className="flex-1 mx-4 text-2xl font-bold text-center text-gray-800">
              {device.name}
            </Text>
          )}

          {editing ? (
            <View className="flex-row items-center">
              {renaming ? (
                <ActivityIndicator color="#4F46E5" />
              ) : (
                <Pressable onPress={handleSave} className="px-2">
                  <Ionicons name="checkmark" size={24} color="#10B981" />
                </Pressable>
              )}
              <Pressable onPress={() => setEditing(false)} className="px-2">
                <Ionicons name="close" size={24} color="#EF4444" />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={20} color="#4B5563" />
            </Pressable>
          )}
        </View>

        {/* ── DEVICE IMAGE ── */}
        <Animatable.View animation="fadeIn" className="items-center mt-2">
          <Image
            source={require("@/assets/camera.png")}
            style={{
              width: Dimensions.get("window").width * 0.4,
              height: Dimensions.get("window").width * 0.4,
            }}
            resizeMode="contain"
          />
          <View className="absolute p-1 bg-white rounded-full shadow bottom-2 right-2">
            <Ionicons
              name={device.status === "online" ? "ellipse" : "remove-circle-outline"}
              size={12}
              color={device.status === "online" ? "#10B981" : "#EF4444"}
            />
          </View>
        </Animatable.View>

        {/* ── ACTION BUTTON ── */}
        <View className="flex-row justify-around px-4 mt-6">
          <Pressable
            onPress={handleRequestSnapshot}
            className="flex-1 mx-2 bg-[#4F46E5] py-3 rounded-xl items-center shadow"
          >
            <Text className="font-semibold text-white">Request Snapshot</Text>
          </Pressable>
        </View>

        {/* ── QUICK STATS ── */}
        <View className="flex-row justify-between px-4 mt-8">
          {[
            {
              icon: "time-outline",
              sub: "Uptime",
              value: `${h}h ${m}m`,
            },
            {
              icon: "speedometer-outline",
              sub: "Latency",
              value: `${latency} ms`,
            },
            {
              icon: "wifi-outline",
              sub: "Signal",
              value: `${signalQuality}%`,
            },
          ].map((s, i) => (
            <Animatable.View
              key={i}
              animation="fadeInUp"
              delay={200 + i * 100}
              className="items-center flex-1 p-4 mx-1 bg-gray-50 rounded-2xl"
            >
              <Ionicons name={s.icon as any} size={28} color="#4F46E5" />
              <Text className="mt-2 text-lg font-semibold text-gray-800">{s.value}</Text>
              <Text className="mt-1 text-xs text-gray-500">{s.sub}</Text>
            </Animatable.View>
          ))}
        </View>

        {/* ── EVENT HISTORY LINK ── */}
        {(
          <Animatable.View animation="fadeInLeft" delay={200}>
            <Pressable
              onPress={handleHistory}
              className="flex-row items-center px-4 py-2"
            >
              <Text className="flex-1 text-lg font-semibold text-gray-800 underline">
                Event History
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
            </Pressable>
          </Animatable.View>
        )}

    
         {/* ── LAST THREE LOGS or PLACEHOLDER ── */}
         {(recent.length > 0 ? (
            recent.map((e, idx) => {
              const { iconName, label } = getLogIconAndLabel(e.type as LogType);
              const date = e.createdAt.toDate(); // <-- convert to JS Date
              return (
                <Animatable.View
                  key={e.id}
                  animation="fadeInLeft"
                  delay={300 + idx * 100}
                  className="flex-row items-center p-4 mb-3 shadow-sm bg-gray-50 rounded-2xl"
                >
                  <View className="p-2 rounded-full bg-indigo-50">
                    <Ionicons name={iconName} size={24} color="#4F46E5" />
                  </View>
                  <View className="flex-1 ml-4">
                    <Text className="font-medium text-gray-800">
                      {label}
                    </Text>
                    <Text className="mt-1 text-xs text-gray-500">
                      {date.toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                </Animatable.View>
              );
            })
          ) : (
            <View className="items-center py-12">
              <Text className="mt-4 text-gray-400">
                No events yet.
              </Text>
            </View>
          )
        )}
      </ScrollView>
      
      {/* fingerprint confirm */}
      <RNModal isVisible={confirmVisible}>
        <View className="p-6 bg-white rounded-lg">
          <Pressable onPress={() => setConfirmVisible(false)} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text className="mb-4 text-lg font-semibold">
            Register fingerprint for this device?
          </Text>
          <View className="flex-row justify-end">
            <Pressable onPress={() => setConfirmVisible(false)} className="px-4 py-2 mr-2">
              <Text>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} className="px-4 py-2 bg-blue-600 rounded">
              <Text className="text-white">Yes</Text>
            </Pressable>
          </View>
        </View>
      </RNModal>

      {/* already registered */}
      <RNModal isVisible={errorVisible}>
        <View className="p-6 bg-white rounded-lg">
          <Pressable onPress={() => setErrorVisible(false)} className="mb-4">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text className="font-semibold text-red-600">
            You are already registered on this device.
          </Text>
        </View>
      </RNModal>

      {/* waiting for fingerprint */}
      <RNModal isVisible={loading}>
        <View className="items-center p-6 bg-white rounded-lg">
          <Pressable onPress={stopPolling} className="self-start mb-4">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-4">Waiting for fingerprint enrollment…</Text>
        </View>
      </RNModal>

      {/* success toast */}
      <RNModal isVisible={successVisible}>
        <View className="items-center p-6 bg-white rounded-lg">
          <Pressable onPress={() => setSuccessVisible(false)} className="self-start mb-4">
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Ionicons name="checkmark-circle-outline" size={80} color="#10B981" />
          <Text className="mt-4 font-semibold">Enrollment successful!</Text>
        </View>
      </RNModal>
    </>
  );
});
