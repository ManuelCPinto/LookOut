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
import { useLogin } from "@/hooks/auth/useLogin";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const { login, loading, error } = useLogin();

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fade]);
  
  const handleLogin = async () => {
    setAttemptedSubmit(true);

    if (!identifier.trim() || !password) {
      setShowErrorModal(true);
      return;
    }
    
    try {
      await login(identifier.trim(), password);
      router.replace("/(tabs)/home");
    } catch {
      setShowErrorModal(true);
    }
  };

  const canSubmit = !!identifier.trim() && !!password;

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

      {/* Animated Card */}
      <Animated.View style={{ opacity: fade }}>
        <View className="p-6 bg-white shadow-lg rounded-2xl">
          <Text className="mb-6 text-2xl font-bold text-center text-blue-900">
            Welcome Back
          </Text>

          {/* Username or Email */}
          <TextInput
            className={`rounded-lg p-3 mb-4 border ${
              attemptedSubmit && !identifier.trim()
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Username or Email"
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
          />

          {/* Password */}
          <TextInput
            className={`rounded-lg p-3 mb-4 border ${
              attemptedSubmit && !password
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Submit */}
          <TouchableOpacity
            className={`py-3 rounded-lg items-center mb-4 ${
              canSubmit ? "bg-blue-600" : "bg-blue-300"
            } ${loading ? "opacity-60" : ""}`}
            onPress={handleLogin}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-lg font-semibold text-white">Log In</Text>
            )}
          </TouchableOpacity>

          {/* Switch to Sign Up */}
          <View className="flex-row justify-center">
            <Text className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text className="font-semibold text-blue-600">Sign Up</Text>
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
          <View className="w-4/5 p-6 bg-white shadow-lg rounded-xl">
            <Text className="mb-4 text-xl font-bold text-red-600">
              {error?.toLowerCase().includes("password")
                ? "Login Failed"
                : "Oops!"}
            </Text>
            <Text className="mb-6 text-gray-700">
              {error || "Please try again."}
            </Text>
            <Pressable
              className="items-center py-2 bg-red-600 rounded-lg"
              onPress={() => setShowErrorModal(false)}
            >
              <Text className="font-semibold text-white">Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
