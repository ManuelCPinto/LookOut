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
  useDeviceEvents,
  useDeviceStats,
  useDeviceModal,
  useRenameDevice,
} from "@/hooks/devices";
import { useRouter } from "expo-router";

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
  const events = useDeviceEvents(device.id);
  const { uptime, latency, signalQuality } = useDeviceStats(device.id);
  const { rename, loading: renaming } = useRenameDevice();

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(device.name);

  useEffect(() => {
    setDraftName(device.name);
  }, [device.name]);

  const handleSave = useCallback(async () => {
    await rename(device.id, draftName);
    setEditing(false);
  }, [device.id, draftName, rename]);

  const handleHistory = useCallback(() => {
    router.push({ pathname: "/logs", params: { deviceId: device.id } });
  }, [device.id, router]);

  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);

  return (
    <>
      {/* Grabber */}
      <Pressable onPress={onClose} className="items-center pt-2 pb-1">
        <View className="w-12 h-1 bg-gray-300 rounded-full" />
      </Pressable>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center justify-center px-4 py-3">
          {editing ? (
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              className="flex-1 px-3 py-1 text-xl font-semibold text-center bg-gray-100 rounded-full"
            />
          ) : (
            <Text className="mx-4 text-2xl font-bold text-gray-800">
              {device.name}
            </Text>
          )}
          {editing ? (
            <View className="absolute flex-row items-center right-4">
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
            <Pressable
              onPress={() => setEditing(true)}
              className="absolute p-2 right-4"
            >
              <Ionicons name="create-outline" size={20} color="#4B5563" />
            </Pressable>
          )}
        </View>

        {/* Image */}
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
              name={
                device.status === "online" ? "ellipse" : "remove-circle-outline"
              }
              size={12}
              color={device.status === "online" ? "#10B981" : "#EF4444"}
            />
          </View>
        </Animatable.View>

        {/* Actions */}
        <View className="flex-row justify-around px-4 mt-6">
          <Pressable className="flex-1 mx-2 bg-[#4F46E5] py-3 rounded-xl items-center shadow">
            <Text className="font-semibold text-white">Request Snapshot</Text>
          </Pressable>
          <Pressable className="flex-1 mx-2 bg-[#4F46E5] py-3 rounded-xl items-center shadow">
            <Text className="font-semibold text-white">Go Live</Text>
          </Pressable>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between px-4 mt-8">
          {[
            {
              icon: "time-outline",
              sub: "Uptime",
              render: () => (
                <Text className="text-lg font-semibold text-gray-800">
                  {h}h {m}m
                </Text>
              ),
            },
            {
              icon: "speedometer-outline",
              sub: "Latency",
              render: () => (
                <Text className="text-lg font-semibold text-gray-800">
                  {latency} ms
                </Text>
              ),
            },
            {
              icon: "wifi-outline",
              sub: "Signal",
              render: () => (
                <Text className="text-lg font-semibold text-gray-800">
                  {signalQuality}%
                </Text>
              ),
            },
          ].map((s, i) => (
            <Animatable.View
              key={i}
              animation="fadeInUp"
              delay={200 + i * 100}
              className="items-center flex-1 p-4 mx-1 bg-gray-50 rounded-2xl"
            >
              <Ionicons name={s.icon as any} size={28} color="#4F46E5" />
              {s.render()}
              <Text className="mt-1 text-xs text-gray-500">{s.sub}</Text>
            </Animatable.View>
          ))}
        </View>

        {/* Event History */}
        <Animatable.View
          animation="fadeInLeft"
          delay={200 + events.length * 100}
        >
          <Pressable
            onPress={handleHistory}
            className="flex-row items-center px-4 mt-8 mb-2"
          >
            <Text className="text-lg font-semibold text-gray-800 underline">
              Event History
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="#4F46E5"
              className="ml-1"
            />
          </Pressable>
        </Animatable.View>

        {/* Events */}
        {events.map((e, idx) => (
          <Animatable.View
            key={e.id}
            animation="fadeInLeft"
            delay={300 + idx * 100}
            className="flex-row items-center p-4 mx-4 mb-3 bg-gray-50 rounded-2xl"
          >
            <Ionicons
              name={
                e.type === "doorbell" ? "notifications-outline" : "walk-outline"
              }
              size={24}
              color="#4F46E5"
              className="mr-4"
            />
            <View className="flex-1">
              <Text className="font-medium text-gray-800">
                {e.type === "doorbell" ? "Doorbell rang" : "Motion detected"}
              </Text>
              <Text className="mt-1 text-xs text-gray-500">{e.time}</Text>
            </View>
          </Animatable.View>
        ))}
      </ScrollView>
    </>
  );
});
