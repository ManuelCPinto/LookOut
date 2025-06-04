import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import RNModal from "react-native-modal";
import * as Animatable from "react-native-animatable";
import { deleteLog, getLogIconAndLabel, LogType } from "@/lib/logs"; 
import { Ionicons } from "@expo/vector-icons";

export type Event = {
  id: string;
  type: LogType;
  time: Date;
  deviceName: string;
  photoURL: string;
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

  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deleteFeedbackVisible, setDeleteFeedbackVisible] = useState(false);
  const [deleteFeedbackStatus, setDeleteFeedbackStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

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

  const {label: eventLabel } = getLogIconAndLabel(event.type);

  const handleClose = useCallback(() => {
    sheetRef.current?.fadeOutDown(200);
    setTimeout(onClose, 200);
  }, [onClose]);

  const handleDeleteButton = useCallback(() => {
    setConfirmDeleteVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setConfirmDeleteVisible(false);
    setDeleteFeedbackStatus("loading");
    setDeleteFeedbackVisible(true);

    try {
      await deleteLog(event.id);
      setDeleteFeedbackStatus("success");
    } catch (err) {
      console.error("Failed to delete log:", err);
      setDeleteFeedbackStatus("error");
    }
    setTimeout(() => {
      setDeleteFeedbackVisible(false);
      onDelete(event.id);
      handleClose();
    }, 2000);
  }, [event.id, onDelete, handleClose]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDeleteVisible(false);
  }, []);

  const screenW = Dimensions.get("window").width;

  return (
    <>
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
              <Pressable onPress={handleClose} className="mb-3">
                <View className="w-16 h-1 bg-gray-300 rounded-full" />
              </Pressable>

              <Text className="text-xl font-bold text-white">{eventLabel}</Text>
              <Text className="mt-1 text-sm text-indigo-200">
                on {event.deviceName}
              </Text>
              <Text className="mt-2 text-xs text-indigo-100">
                {fmtDate(event.time)}
              </Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
              <Animatable.View
                animation="fadeIn"
                delay={200}
                className="items-center mt-4"
              >
                <Image
                  source={{ uri: event.photoURL }}
                  style={{
                    width: screenW * 0.9,
                    height: screenW * 0.5,
                    borderRadius: 12,
                  }}
                  resizeMode="cover"
                />
              </Animatable.View>
              <View className="px-6 mt-6">
                <Text className="mb-2 text-lg font-semibold text-gray-800">
                  More Info
                </Text>
                <View className="p-4 space-y-2 bg-gray-50 rounded-2xl">
                  <Text className="text-gray-700">
                    • Device Location:{" "}
                    <Text className="font-semibold">{event.deviceName}</Text>
                  </Text>
                  <Text className="text-gray-700">
                    • Alert Type:{" "}
                    <Text className="capitalize">{eventLabel}</Text>
                  </Text>
                  <Text className="text-gray-700">
                    • Recorded At: {fmtDate(event.time)}
                  </Text>
                </View>
              </View>
              <View className="px-6 mt-8 mb-4">
                <Pressable
                  onPress={handleDeleteButton}
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
      <RNModal
        isVisible={confirmDeleteVisible}
        backdropOpacity={0.6}
        animationIn="zoomIn"
        animationOut="zoomOut"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <View className="p-6 bg-white rounded-2xl">
          <Text className="mb-4 text-lg font-semibold">Delete this log?</Text>
          <Text className="mb-6 text-gray-700">
            Are you sure you want to permanently delete this log? This action
            cannot be undone.
          </Text>
          <View className="flex-row justify-end space-x-4">
            <Pressable
              onPress={handleCancelDelete}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              <Text className="text-gray-700">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirmDelete}
              className="px-4 py-2 bg-red-600 rounded-lg"
            >
              <Text className="font-semibold text-white">Delete</Text>
            </Pressable>
          </View>
        </View>
      </RNModal>

      <RNModal
        isVisible={deleteFeedbackVisible}
        backdropOpacity={0.5}
        animationIn="zoomIn"
        animationOut="zoomOut"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <View className="items-center p-6 bg-white rounded-2xl">
          {deleteFeedbackStatus === "loading" && (
            <>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="mt-4 text-gray-700">Deleting…</Text>
            </>
          )}
          {deleteFeedbackStatus === "success" && (
            <>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <Text className="mt-4 text-gray-700">Deleted!</Text>
            </>
          )}
          {deleteFeedbackStatus === "error" && (
            <>
              <Ionicons name="alert-circle" size={64} color="#EF4444" />
              <Text className="mt-4 text-center text-gray-700">
                Failed to delete log
              </Text>
            </>
          )}
        </View>
      </RNModal>
    </>
  );
}
