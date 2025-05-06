// app/(auth)/login.tsx
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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import logo from "../../assets/logo.png";

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword]               = useState("");
  const [loading, setLoading]                 = useState(false);
  const [errorMessage, setErrorMessage]       = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal]   = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    setAttemptedSubmit(true);

    if (!emailOrUsername.trim() || !password) {
      setErrorMessage("Please enter both username/email and password.");
      return setShowErrorModal(true);
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      let emailToUse = emailOrUsername.trim();
      if (!emailToUse.includes("@")) {
        const usersCol = collection(db, "users");
        const q = query(usersCol, where("username", "==", emailToUse));
        const snap = await getDocs(q);

        if (snap.empty) {
          throw new Error("No account found for that username.");
        }
        emailToUse = snap.docs[0].data().email;
      }
      await signInWithEmailAndPassword(auth, emailToUse, password);
      console.log("✅ signInWithEmailAndPassword resolved. auth.currentUser:", auth.currentUser);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      setErrorMessage(e.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !!emailOrUsername.trim() && !!password;
  const inputClass = (val: string) =>
    `rounded-lg p-3 mb-4 border ${
      attemptedSubmit && !val ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <View className="flex-1 bg-gray-50 px-4 justify-center">
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
        <View className="bg-white rounded-2xl p-6 shadow-lg">
          <Text className="text-2xl font-bold text-blue-900 mb-6 text-center">
            Welcome Back
          </Text>

          {/* Username or Email */}
          <TextInput
            className={inputClass(emailOrUsername)}
            placeholder="Username or Email"
            autoCapitalize="none"
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
          />

          {/* Password */}
          <TextInput
            className={inputClass(password)}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {/* Submit */}
          <TouchableOpacity
            className={`py-3 rounded-lg items-center mb-4 ${
              canSubmit ? "bg-blue-600" : "bg-blue-300"
            }`}
            onPress={handleLogin}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-white font-semibold text-lg">Log In</Text>
            )}
          </TouchableOpacity>

          {/* Switch to Sign Up */}
          <View className="flex-row justify-center">
            <Text className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text className="text-blue-600 font-semibold">Sign Up</Text>
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
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center">
          <View className="bg-white rounded-xl p-6 w-4/5 shadow-lg">
            <Text className="text-xl font-bold text-red-600 mb-4">
              {errorMessage?.includes("password")
                ? "Login Failed"
                : "Oops!"}
            </Text>
            <Text className="text-gray-700 mb-6">{errorMessage}</Text>
            <Pressable
              className="bg-red-600 py-2 rounded-lg items-center"
              onPress={() => setShowErrorModal(false)}
            >
              <Text className="text-white font-semibold">Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
