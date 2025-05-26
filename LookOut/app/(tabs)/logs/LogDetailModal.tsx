import React, { useEffect, useRef, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import RNModal from "react-native-modal";
import * as Animatable from "react-native-animatable";

export type Event = {
  id: string;
  type: "doorbell" | "motion";
  time: Date;
  deviceName: string;
};

type Props = {
  event: Event;
  visible: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
};

export default function LogDetailModal({
  event,
  visible,
  onClose,
  onDelete,
}: Props) {
  const sheetRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.fadeInUp(300);
    }
  }, [visible]);

  const fmtDate = (d: Date) =>
    d.toLocaleString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const title =
    event.type === "doorbell" ? "Doorbell Rang" : "Motion Detected";

  const handleClose = useCallback(() => {
    sheetRef.current?.fadeOutDown(200);
    setTimeout(onClose, 200);
  }, [onClose]);

  const handleDelete = useCallback(() => {
    onDelete(event.id);
    handleClose();
  }, [event.id, onDelete, handleClose]);

  const screenW = Dimensions.get("window").width;

  return (
    <RNModal
      isVisible={visible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      backdropOpacity={0.4}
      animationIn="fadeIn"
      animationOut="fadeOut"
      style={{ margin: 0, justifyContent: "flex-end" }}
      propagateSwipe
    >
      <SafeAreaView
        style={{
          backgroundColor: "#fff",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: "90%",
        }}
      >
        <Animatable.View
          ref={sheetRef}
          className="flex-1"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Header + Grabber */}
          <View
            style={{
              backgroundColor: "#4F46E5",
              paddingTop: 12,
              paddingBottom: 16,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              alignItems: "center",
            }}
          >
            {/* tappable grabber */}
            <Pressable onPress={handleClose} className="mb-3">
              <View className="w-16 h-1 bg-gray-300 rounded-full" />
            </Pressable>
            <Text className="text-xl font-bold text-white">{title}</Text>
            <Text className="mt-1 text-sm text-indigo-200">
              on {event.deviceName}
            </Text>
            <Text className="mt-2 text-xs text-indigo-100">
              {fmtDate(event.time)}
            </Text>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
            {/* Preview Image */}
            <Animatable.View
              animation="fadeIn"
              delay={200}
              className="items-center mt-4"
            >
              <Image
                source={require("@/assets/outside.png")}
                style={{
                  width: screenW * 0.9,
                  height: screenW * 0.5,
                  borderRadius: 12,
                }}
                resizeMode="cover"
              />
            </Animatable.View>

            {/* More Info */}
            <View className="px-6 mt-6">
              <Text className="mb-2 text-lg font-semibold text-gray-800">
                More Info
              </Text>
              <View className="p-4 space-y-2 bg-gray-50 rounded-2xl">
                <Text className="text-gray-700">
                  • Event ID: <Text className="font-mono">{event.id}</Text>
                </Text>
                <Text className="text-gray-700">
                  • Device Location:{" "}
                  <Text className="font-semibold">{event.deviceName}</Text>
                </Text>
                <Text className="text-gray-700">
                  • Alert Type:{" "}
                  <Text className="capitalize">{event.type}</Text>
                </Text>
                <Text className="text-gray-700">
                  • Recorded At: {fmtDate(event.time)}
                </Text>
              </View>
            </View>

            {/* Delete Button */}
            <View className="px-6 mt-8 mb-4">
              <Pressable
                onPress={handleDelete}
                className="items-center py-3 bg-red-100 rounded-full"
              >
                <Text className="font-semibold text-red-600">
                  Delete This Log
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animatable.View>
      </SafeAreaView>
    </RNModal>
  );
}
