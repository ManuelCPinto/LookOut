import React, { useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import RNModal from "react-native-modal";
import * as Animatable from "react-native-animatable";

import { auth } from "@/lib/firebase";
import { useProfile } from "@/hooks/user/useProfile";
import { useUserFamilies } from "@/hooks/family/useUserFamilies";
import { useJoinFamily } from "@/hooks/family/useJoinFamily";
import { useSignOut } from "@/hooks/auth/useSignOut";
import type { Family } from "@/lib/family";

type JoinStatus = "loading" | "success" | "error";

export default function ProfileScreen() {
  const uid = auth.currentUser!.uid;
  const router = useRouter();

  const { profile, loading: loadingProfile } = useProfile(uid);
  const {
    families,
    loading: loadingFamilies,
    refresh: refreshFamilies,
  } = useUserFamilies(uid);

  const { join, joining, error: joinError } = useJoinFamily(uid);

  const { signOutUser, loading: signingOut } = useSignOut();

  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [joinMode, setJoinMode] = useState<"choose" | "manual" | "scan">(
    "choose"
  );
  const [inviteCode, setInviteCode] = useState("");

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<JoinStatus>("loading");

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const handleJoin = async (code: string) => {
    if (!code.trim()) {
      Alert.alert("Please enter a code.");
      return;
    }
    setJoinModalVisible(false);
    setFeedbackStatus("loading");
    setFeedbackVisible(true);

    try {
      await join(code);
      await refreshFamilies();
      setFeedbackStatus("success");
    } catch {
      setFeedbackStatus("error");
    }
    setTimeout(() => setFeedbackVisible(false), 2000);
  };

  let familyPreview: React.ReactNode;
  if (loadingFamilies) {
    familyPreview = <ActivityIndicator color="#4F46E5" style={{ margin: 24 }} />;
  } else if (families.length) {
    const fam = families[0] as Family;
    const memberCount = Object.keys(fam.roles || {}).length;

    familyPreview = (
      <Animatable.View
        animation="fadeInUp"
        className="flex-row items-center p-4 mb-6 bg-white shadow rounded-2xl"
      >
        <View className="items-center justify-center w-12 h-12 mr-4 bg-purple-100 rounded-xl">
          <Ionicons name="people-outline" size={24} color="#4F46E5" />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">{fam.name}</Text>
          <Text className="mt-1 text-sm text-gray-500">
            {memberCount} Member{memberCount > 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push(`/family/${fam.id}`)}
          className="flex-row items-center px-4 py-2 bg-[#4F46E5] rounded-full"
        >
          <Text className="mr-2 font-semibold text-white">Manage</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </Animatable.View>
    );
  } else {
    familyPreview = (
      <Animatable.View
        animation="fadeInUp"
        className="p-6 mb-6 bg-white shadow rounded-2xl"
      >
        <Text className="mb-4 text-lg font-semibold text-center text-gray-800">
          You’re not in a family yet
        </Text>
        <View className="flex-row justify-center space-x-4">
          <TouchableOpacity
            onPress={() => router.push("/family/create")}
            className="flex-1 px-4 py-3 bg-[#4F46E5] rounded-full items-center"
          >
            <Text className="font-semibold text-white">Create Family</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setJoinModalVisible(true);
              setJoinMode("choose");
            }}
            className="items-center flex-1 px-4 py-3 bg-gray-200 rounded-full"
          >
            <Text className="font-semibold text-gray-700">Join Family</Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="px-4 py-6" showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <Animatable.View animation="fadeIn" className="items-center mb-6">
          <View className="items-center justify-center w-24 h-24 mb-4 bg-gray-200 rounded-full">
            <Ionicons name="person" size={48} color="#bbb" />
          </View>
          <Text className="text-xl font-bold text-gray-900">
            {loadingProfile ? "Loading…" : profile?.username ?? "Anonymous"}
          </Text>
          <Text className="text-gray-500">{profile?.email}</Text>
        </Animatable.View>

        {/* Stats card */}
        <Animatable.View
          animation="fadeInUp"
          delay={100}
          className="p-4 mb-6 bg-white shadow-lg rounded-2xl"
        >
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            Your Stats
          </Text>
          <View className="flex-row justify-between">
            {[
              { value: 0, label: "Events Today" },
              { value: 0, label: "Alerts" },
              { value: 0, label: "Cameras Online" },
            ].map((s, i) => (
              <View key={i} className="items-center flex-1">
                <Text className="text-2xl font-bold text-[#4F46E5]">
                  {s.value}
                </Text>
                <Text className="text-xs text-gray-500">{s.label}</Text>
              </View>
            ))}
          </View>
        </Animatable.View>

        {/* Family preview */}
        {familyPreview}

        {/* Account actions */}
        <Animatable.View
          animation="fadeInUp"
          delay={200}
          className="p-4 bg-white shadow-lg rounded-2xl"
        >
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Account
          </Text>
          <TouchableOpacity
            className="flex-row items-center mb-3"
            onPress={() =>
              Alert.alert("Not implemented", "Edit profile coming soon!")
            }
          >
            <Ionicons name="create-outline" size={20} color="#4F46E5" />
            <Text className="ml-3 text-[#4F46E5]">Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center mb-3"
            onPress={() =>
              Alert.alert("Not implemented", "Change password coming soon!")
            }
          >
            <Ionicons name="lock-closed-outline" size={20} color="#4F46E5" />
            <Text className="ml-3 text-[#4F46E5]">Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setConfirmSignOut(true)}
            disabled={signingOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="ml-3 text-red-600">
              {signingOut ? "Signing out…" : "Sign Out"}
            </Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>

      {/* Join‐Family Modal */}
      <RNModal
        isVisible={joinModalVisible}
        onBackdropPress={() => {
          setJoinModalVisible(false);
          setInviteCode("");
          setJoinMode("choose");
        }}
        onBackButtonPress={() => {
          setJoinModalVisible(false);
          setInviteCode("");
          setJoinMode("choose");
        }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        style={{ margin: 0, justifyContent: "flex-end" }}
        propagateSwipe
      >
        <View className="p-6 bg-white rounded-t-3xl">
          {joinMode === "choose" && (
            <>
              <Animatable.Text
                animation="fadeIn"
                className="mb-4 text-lg font-semibold text-center text-gray-800"
              >
                Join a Family
              </Animatable.Text>
              <TouchableOpacity
                onPress={() => setJoinMode("scan")}
                className="flex-row items-center px-4 py-3 mb-3 bg-gray-100 rounded-full"
              >
                <Ionicons name="qr-code-outline" size={20} color="#64748B" />
                <Text className="ml-3 text-gray-700">Scan QR Code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setJoinMode("manual")}
                className="flex-row items-center px-4 py-3 bg-gray-100 rounded-full"
              >
                <Ionicons name="key-outline" size={20} color="#64748B" />
                <Text className="ml-3 text-gray-700">Enter Invite Code</Text>
              </TouchableOpacity>
            </>
          )}

          {joinMode === "scan" && permission?.granted && (
            <>
              <CameraView
                style={StyleSheet.absoluteFill}
                ref={cameraRef}
                mode="picture"
                facing="back"
                mute
                responsiveOrientationWhenOrientationLocked
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={({ data }) => {
                  if (!joining) handleJoin(data);
                }}
              />
              <TouchableOpacity
                onPress={() => setJoinMode("choose")}
                className="absolute p-2 bg-white rounded-full shadow top-12 left-4"
              >
                <Ionicons name="arrow-back" size={24} color="#334155" />
              </TouchableOpacity>
            </>
          )}

          {joinMode === "manual" && (
            <>
              <Animatable.View animation="fadeInDown" className="mb-4">
                <Text className="text-lg font-semibold text-center text-gray-800">
                  Enter Invite Code
                </Text>
              </Animatable.View>
              <TextInput
                value={inviteCode}
                onChangeText={setInviteCode}
                placeholder="ABC123XYZ"
                className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-full"
              />
              {joining ? (
                <ActivityIndicator size="large" color="#4F46E5" />
              ) : (
                <TouchableOpacity
                  onPress={() => handleJoin(inviteCode)}
                  className="items-center w-full py-3 bg-[#4F46E5] rounded-full"
                >
                  <Text className="font-semibold text-white">Join</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </RNModal>

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
              <Text className="mt-4 text-gray-700">Joining…</Text>
            </>
          )}
          {feedbackStatus === "success" && (
            <>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <Text className="mt-4 text-gray-700">Joined!</Text>
            </>
          )}
          {feedbackStatus === "error" && (
            <>
              <Ionicons name="alert-circle" size={64} color="#EF4444" />
              <Text className="mt-4 text-center text-gray-700">
                {joinError ?? "Failed to join"}
              </Text>
            </>
          )}
        </View>
      </RNModal>

      {/* Confirm Sign‐Out */}
      <Modal
        visible={confirmSignOut}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmSignOut(false)}
      >
        <View className="items-center justify-center flex-1 p-6 bg-black bg-opacity-50">
          <Animatable.View
            animation="fadeInUp"
            className="w-full p-6 bg-white rounded-2xl"
          >
            <Text className="mb-4 text-lg font-semibold">Confirm Sign Out</Text>
            <Text className="mb-6 text-gray-700">
              Are you sure you want to sign out?
            </Text>
            {signingOut ? (
              <View className="items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-2 text-[#4F46E5]">Signing out…</Text>
              </View>
            ) : (
              <View className="flex-row justify-end space-x-4">
                <TouchableOpacity
                  onPress={() => setConfirmSignOut(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  <Text className="text-gray-700">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={signOutUser}
                  className="px-4 py-2 bg-red-600 rounded-lg"
                >
                  <Text className="font-semibold text-white">Sign Out</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animatable.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
