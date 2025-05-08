// app/(tabs)/profile.tsx
import React, { useEffect, useState } from "react"
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { auth, db } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { listUserFamilies, Family } from "@/lib/family"

export default function ProfileScreen() {
  const fbUser = auth.currentUser!
  const uid = fbUser.uid

  const [profile, setProfile] = useState<{ username: string; email: string } | null>(null)
  const [families, setFamilies] = useState<Family[]>([])
  const [loadingFamily, setLoadingFamily] = useState(true)

  // sign-out modal & loading
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, "users", uid))
        if (snap.exists()) {
          const data = snap.data()!
          setProfile({ username: data.username, email: data.email })
        }
      } catch (e: any) {
        Alert.alert("Error loading profile", e.message)
      }
    })()

    listUserFamilies(uid)
      .then(setFamilies)
      .catch((e) => Alert.alert("Error loading families", e.message))
      .finally(() => setLoadingFamily(false))
  }, [uid])

  const handleConfirmSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut(auth)
      // redirect into the auth flow
      router.replace("/(auth)/login")
    } catch (e: any) {
      Alert.alert("Sign-out Error", e.message)
      setSigningOut(false)
      setConfirmModalVisible(false)
    }
  }

  // placeholder stats
  const stats = [
    { value: 0, label: "Events Today" },
    { value: 0, label: "Alerts" },
    { value: 0, label: "Cameras Online" },
  ]

  // family card preview
  let familyPreview: React.ReactNode = null
  if (!loadingFamily && families.length > 0) {
    const fam = families[0]
    const memberCount = Object.keys(fam.roles || {}).length

    familyPreview = (
      <View className="flex-row items-center p-4 mb-6 bg-white shadow-md rounded-2xl">
        {/* icon */}
        <View className="items-center justify-center w-12 h-12 mr-4 bg-blue-100 rounded-xl">
          <Ionicons name="people-outline" size={24} color="#2563EB" />
        </View>
        {/* text */}
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">{fam.name}</Text>
          <Text className="mt-1 text-sm text-gray-500">
            {memberCount} Member{memberCount > 1 ? "s" : ""}
          </Text>
        </View>
        {/* manage */}
        <TouchableOpacity
          onPress={() => router.push(`/family/${fam.id}`)}
          className="flex-row items-center px-4 py-2 bg-blue-600 rounded-full"
        >
          <Text className="mr-2 font-semibold text-white">Manage</Text>
          <Ionicons name="chevron-forward" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="px-4 py-6">
        {/* header */}
        <View className="items-center mb-6">
          <View className="items-center justify-center w-24 h-24 mb-4 bg-gray-200 rounded-full">
            <Ionicons name="person" size={48} color="#bbb" />
          </View>
          <Text className="text-xl font-bold text-blue-900">
            {profile?.username || "Anonymous"}
          </Text>
          <Text className="text-gray-500">{profile?.email}</Text>
        </View>

        {/* stats */}
        <View className="p-4 mb-6 bg-white shadow-lg rounded-2xl">
          <Text className="mb-3 text-lg font-semibold text-blue-900">
            Your Stats
          </Text>
          <View className="flex-row justify-between">
            {stats.map((s, i) => (
              <View key={i} className="items-center flex-1">
                <Text className="text-2xl font-bold text-blue-600">
                  {s.value}
                </Text>
                <Text className="text-xs text-gray-500">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* family preview */}
        {familyPreview}

        {/* account actions */}
        <View className="p-4 bg-white shadow-lg rounded-2xl">
          <Text className="mb-4 text-lg font-semibold text-blue-900">
            Account
          </Text>
          <TouchableOpacity
            className="flex-row items-center mb-3"
            onPress={() => Alert.alert("Not implemented", "Edit profile coming soon!")}
          >
            <Ionicons name="create-outline" size={20} color="#1A73E8" />
            <Text className="ml-3 text-blue-600">Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center mb-3"
            onPress={() =>
              Alert.alert("Not implemented", "Change password coming soon!")
            }
          >
            <Ionicons name="lock-closed-outline" size={20} color="#1A73E8" />
            <Text className="ml-3 text-blue-600">Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => setConfirmModalVisible(true)}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="ml-3 text-red-600">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ─── Sign-Out Confirmation Modal ─── */}
      <Modal transparent visible={confirmModalVisible} animationType="fade">
        <View className="items-center justify-center flex-1 px-6 bg-black bg-opacity-50">
          <View className="w-full p-6 bg-white rounded-2xl">
            <Text className="mb-4 text-lg font-semibold">
              Confirm Sign Out
            </Text>
            <Text className="mb-6 text-gray-700">
              Are you sure you want to sign out?
            </Text>

            {signingOut ? (
              <View className="items-center">
                <ActivityIndicator size="large" color="#2563EB" />
                <Text className="mt-2 text-blue-600">Signing out…</Text>
              </View>
            ) : (
              <View className="flex-row justify-end space-x-4">
                <Pressable
                  onPress={() => setConfirmModalVisible(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  <Text className="text-gray-700">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleConfirmSignOut}
                  className="px-4 py-2 bg-red-600 rounded-lg"
                >
                  <Text className="font-semibold text-white">Sign Out</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
