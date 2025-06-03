import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import RNModal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useClaimDevice } from "@/hooks/devices/useClaimDevice";
import { auth } from "@/lib/firebase";

export default function AddDeviceScreen() {
  const router = useRouter();
  const uid = auth.currentUser!.uid;

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [showHelp, setShowHelp] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<"loading"|"success"|"error">("loading");

  const { claim, claiming, error } = useClaimDevice(uid);

  useEffect(() => {
    const timer = setTimeout(() => setShowHelp(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAdd = useCallback(async (code: string) => {
    setFeedbackStatus("loading");
    setFeedbackVisible(true);
    try {
      await claim(code.trim());
      setFeedbackStatus("success");
    } catch {
      setFeedbackStatus("error");
    }
    // auto-close feedback & screen
    setTimeout(() => {
      setFeedbackVisible(false);
      router.back();
    }, 2000);
  }, [claim, router]);

  // permission loading
  if (!permission) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-black">
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  // ask for camera if not granted
  if (!permission.granted) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 px-6 bg-black">
        <Text className="mb-4 text-center text-white">
          We need camera access to scan your device’s QR code.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="px-6 py-3 bg-[#4F46E5] rounded-full"
        >
          <Text className="font-medium text-white">Allow Camera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Help Popup */}
      <RNModal
        isVisible={showHelp}
        backdropOpacity={0.5}
        animationIn="fadeIn"
        animationOut="fadeOut"
        onBackdropPress={() => setShowHelp(false)}
        propagateSwipe
      >
        <View className="items-center p-6 bg-white rounded-2xl">
          <Ionicons name="qr-code-outline" size={48} color="#4F46E5" />
          <Text className="mt-4 text-lg font-semibold text-center text-gray-800">
            Point your camera at the QR code on your device’s OLED screen to
            register it.
          </Text>
          <TouchableOpacity
            onPress={() => setShowHelp(false)}
            className="mt-6 bg-[#4F46E5] px-6 py-2 rounded-full"
          >
            <Text className="font-medium text-white">Got it</Text>
          </TouchableOpacity>
        </View>
      </RNModal>

      {/* Camera Scanner */}
      <CameraView
        style={StyleSheet.absoluteFill}
        ref={cameraRef}
        mode="picture"
        facing="back"
        mute
        responsiveOrientationWhenOrientationLocked
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={({ data }) => {
          if (!claiming) handleAdd(data);
        }}
      />

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute p-2 bg-white rounded-full top-12 left-4"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Feedback Modal */}
      <RNModal
        isVisible={feedbackVisible}
        backdropOpacity={0.5}
        animationIn="zoomIn"
        animationOut="zoomOut"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <View className="items-center p-6 bg-white rounded-2xl">
          {feedbackStatus === "loading" && (
            <>
              <ActivityIndicator size="large" color="#4F46E5" />
              <Text className="mt-4 text-gray-700">Registering…</Text>
            </>
          )}
          {feedbackStatus === "success" && (
            <>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <Text className="mt-4 text-gray-700">Device added!</Text>
            </>
          )}
          {feedbackStatus === "error" && (
            <>
              <Ionicons name="alert-circle" size={64} color="#EF4444" />
              <Text className="mt-4 text-center text-gray-700">
                {error ?? "Failed to add device"}
              </Text>
            </>
          )}
        </View>
      </RNModal>
    </View>
  );
}
