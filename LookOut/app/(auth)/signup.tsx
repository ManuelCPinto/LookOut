// app/(auth)/signup.tsx
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
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  User,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import logo from "../../assets/logo.png";

export default function SignUpPage() {
  const router = useRouter();

  // form state
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);

  // error & verify modals
  const [errorMessage, setErrorMessage]       = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal]   = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // hold the auth user until verification
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  // fade-in animation
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1, duration: 500, useNativeDriver: true
    }).start();
  }, []);

  // simple validation
  const canSubmit =
    username.trim() !== "" &&
    email.trim()     !== "" &&
    password         !== "" &&
    confirm          !== "";

  const inputStyle = "rounded-lg p-3 mb-4 border border-gray-300";

  // STEP 1: create Auth user & send verification (but do NOT sign out yet)
  const handleSignUp = async () => {
    if (!canSubmit) {
      setErrorMessage("All fields are required.");
      return setShowErrorModal(true);
    }
    if (password !== confirm) {
      setErrorMessage("Passwords do not match.");
      return setShowErrorModal(true);
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return setShowErrorModal(true);
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // send the verification link
      await sendEmailVerification(cred.user as User);

      // keep them signed in so reload() works
      setPendingUser(cred.user as User);
      setShowVerifyModal(true);

    } catch (e: any) {
      setErrorMessage(e.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: user clicks “I’ve Confirmed”
  const checkVerified = async () => {
    if (!pendingUser) return;
    setLoading(true);

    try {
      // reload the very same user instance
      await pendingUser.reload();

      if (pendingUser.emailVerified) {
        // write Firestore doc
        await setDoc(doc(db, "users", pendingUser.uid), {
          username: username.trim(),
          email:    pendingUser.email,
          createdAt: serverTimestamp(),
        });

        // now you can sign them out if you want a fresh login
        await signOut(auth);

        // finally, enter the app
        router.replace("/");
      } else {
        Alert.alert(
          "Still Not Verified",
          "We don't see your email as verified yet.\nPlease click the link in your inbox and then tap “I’ve Confirmed.”"
        );
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: resend if needed
  const resendEmail = async () => {
    if (!pendingUser) return;
    setLoading(true);
    try {
      await sendEmailVerification(pendingUser);
      Alert.alert("Email Sent", "A new verification link has been sent.");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Sign-Up Form */}
      <Animated.View style={{ opacity: fade }}>
        <View className="bg-white rounded-2xl p-6 shadow-lg">
          <Text className="text-2xl font-bold text-blue-900 mb-6 text-center">
            Create Account
          </Text>

          <TextInput
            className={inputStyle}
            placeholder="Username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />

          <TextInput
            className={inputStyle}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            className={inputStyle}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            className={inputStyle}
            placeholder="Confirm Password"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
          />

          <TouchableOpacity
            className={`py-3 rounded-lg items-center mb-4 ${
              canSubmit ? "bg-blue-600" : "bg-blue-300"
            }`}
            onPress={handleSignUp}
            disabled={!canSubmit || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-white font-semibold text-lg">
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text className="text-blue-600 font-semibold">Log In</Text>
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
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center px-4">
          <View className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
            <Text className="text-xl font-bold text-red-600 mb-4">
              Sign Up Error
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

      {/* Verify-Email Modal */}
      <Modal
        visible={showVerifyModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center px-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
            <Text className="text-2xl font-bold text-green-700 mb-4 text-center">
              Just One More Step!
            </Text>
            <Text className="text-gray-700 mb-6 text-center">
              We’ve sent a verification link to{`\n`}
              <Text className="font-semibold">{email}</Text>
            </Text>

            <Pressable
              className="bg-blue-600 py-3 rounded-lg mb-3 items-center"
              onPress={checkVerified}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="text-white font-semibold">I’ve Confirmed</Text>
              )}
            </Pressable>

            <Pressable
              className="bg-gray-200 py-3 rounded-lg mb-3 items-center"
              onPress={resendEmail}
              disabled={loading}
            >
              <Text className="text-gray-800 font-medium">Resend Email</Text>
            </Pressable>

            <Pressable
              className="items-center mt-2"
              onPress={() => {
                setShowVerifyModal(false);
                router.replace("/login");
              }}
            >
              <Text className="text-blue-600">Back to Log In</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
