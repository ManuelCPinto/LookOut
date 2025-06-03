import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import logo from "../../assets/logo.png";
import { useSignUp } from "@/hooks/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showErrorModal, setShowErrorModal]     = useState(false);
  const [showVerifyModal, setShowVerifyModal]   = useState(false);
  const [attemptedSubmit, setAttemptedSubmit]   = useState(false);

  const {
    pendingUser,
    loading,
    error,
    signUp,
    checkVerified,
    resendVerification,
  } = useSignUp();

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fade]);

  const canSubmit =
    username.trim() &&
    email.trim() &&
    password &&
    confirm &&
    password === confirm;

  const handleSignUp = async () => {
    setAttemptedSubmit(true);
    if (!canSubmit) {
      setShowErrorModal(true);
      return;
    }
    const ok = await signUp(email.trim(), password);
    if (ok) setShowVerifyModal(true);
    else setShowErrorModal(true);
  };

  return (
    <View className="justify-center flex-1 px-4 bg-gray-50">
      {/* Logo */}
      <View className="items-center mb-6">
        <Image
          source={logo}
          className="w-24 h-24"
          style={{ resizeMode: "contain" }}
        />
      </View>

      {/* Form */}
      <Animated.View style={{ opacity: fade }}>
        <View className="p-6 bg-white shadow-lg rounded-2xl">
          <Text className="mb-6 text-2xl font-bold text-center text-blue-900">
            Create Account
          </Text>

          {/** Username */}
          <TextInput
            className={`rounded-lg p-3 mb-4 border ${
              attemptedSubmit && !username ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          {/** Email */}
          <TextInput
            className={`rounded-lg p-3 mb-4 border ${
              attemptedSubmit && !email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/** Password */}
          <TextInput
            className={`rounded-lg p-3 mb-4 border ${
              attemptedSubmit && (!password || password !== confirm)
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/** Confirm */}
          <TextInput
            className={`rounded-lg p-3 mb-6 border ${
              attemptedSubmit && password !== confirm
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />

          {/* Submit */}
          <TouchableOpacity
            className={`py-3 rounded-lg items-center mb-4 ${
              canSubmit ? "bg-[#4F46E5]" : "bg-gray-400"
            } ${loading ? "opacity-60" : ""}`}
            onPress={handleSignUp}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-lg font-semibold text-white">Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Back to Login */}
          <View className="flex-row justify-center">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text className="font-semibold text-blue-600">Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View className="items-center justify-center flex-1 bg-black bg-opacity-50">
          <View className="w-full max-w-sm p-6 bg-white shadow-lg rounded-xl">
            <Text className="mb-4 text-xl font-bold text-red-600">
              Sign Up Error
            </Text>
            <Text className="mb-6 text-gray-700">{error || "Invalid input."}</Text>
            <Pressable
              className="items-center py-2 bg-red-600 rounded-lg"
              onPress={() => setShowErrorModal(false)}
            >
              <Text className="font-semibold text-white">Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Verify Email Modal */}
      <Modal
        visible={showVerifyModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View className="items-center justify-center flex-1 px-4 bg-black bg-opacity-50">
          <View className="w-full max-w-sm p-6 bg-white shadow-lg rounded-2xl">
            <Text className="mb-4 text-2xl font-bold text-center text-green-700">
              Just One More Step!
            </Text>
            <Text className="mb-6 text-center text-gray-700">
              We’ve sent a verification link to{"\n"}
              <Text className="font-semibold">{email}</Text>
            </Text>
            <Pressable
              className="items-center py-3 mb-3 bg-blue-600 rounded-lg"
              onPress={() => checkVerified(username, email)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="font-semibold text-white">I’ve Confirmed</Text>
              )}
            </Pressable>
            <Pressable
              className="items-center py-3 mb-3 bg-gray-200 rounded-lg"
              onPress={resendVerification}
              disabled={loading}
            >
              <Text className="font-medium text-gray-800">Resend Email</Text>
            </Pressable>
            <Pressable
              className="items-center"
              onPress={() => router.replace("/login")}
            >
              <Text className="text-blue-600">Back to Log In</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
