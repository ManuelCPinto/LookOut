// app/(tabs)/devices/add.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import RNModal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function AddDeviceScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [showHelp, setShowHelp] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Delay the help popup by 1s on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowHelp(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleAdd = async (code: string) => {
    setScanning(true);
    try {
      console.log("Scanned QR:", code);
      router.back();
    } catch (err: any) {
      alert("Failed to add device: " + err.message);
    } finally {
      setScanning(false);
    }
  };

  // Show loading while we check/request permission
  if (!permission) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-black">
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  // Prompt for camera permission
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
      {/* Instructional overlay */}
      <RNModal
        isVisible={showHelp}
        backdropOpacity={0.5}
        animationIn="fadeIn"
        animationOut="fadeOut"
        // user must press Got it
        onBackdropPress={() => {}}
        onBackButtonPress={() => {}}
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

      {/* Live camera preview */}
      <CameraView
        style={StyleSheet.absoluteFill}
        ref={cameraRef}
        mode="picture"
        facing="back"
        mute
        responsiveOrientationWhenOrientationLocked
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={({ data }) => {
          if (!scanning) handleAdd(data);
        }}
      />

      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute p-2 bg-white rounded-full top-12 left-4"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {/* Scanning indicator */}
      {scanning && (
        <View className="absolute inset-0 items-center justify-center bg-black bg-opacity-50">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="mt-2 text-white">Registering device…</Text>
        </View>
      )}
    </View>
  );
}
