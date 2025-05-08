// app/(tabs)/family/create.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useRouter } from "expo-router";
import { auth, db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export default function CreateFamilyScreen() {
  const { back } = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser!;

  const handleCreate = async () => {
    setLoading(true);
    try {
      const ref = await addDoc(collection(db, "families"), {
        name: name.trim(),
        description: description.trim(),
        ownerId: user.uid,
        roles: { [user.uid]: "owner" },
        createdAt: serverTimestamp(),
      });
      // redirect to the families listing page
      router.replace("./[id]/index");
    } catch (e: any) {
      // you can add error UI here if you like
      console.error("Create family failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const canCreate = !!name.trim();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={back} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-bold text-gray-800 text-center">
          Create a Family
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Family Name */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Family Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. The Smiths"
          className="bg-white border border-gray-300 rounded-xl p-4 mb-6 text-gray-800"
        />

        {/* Description */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Description (optional)
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="A short note about your family"
          multiline
          numberOfLines={3}
          className="bg-white border border-gray-300 rounded-xl p-4 mb-6 text-gray-800 h-24"
        />

        {/* Info */}
        <View className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-6">
          <Text className="text-blue-800">
            You’ll be the “owner” of this family and can invite others via QR
            code or invite link once it’s created.
          </Text>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!canCreate || loading}
          className={`rounded-xl py-4 items-center ${
            canCreate
              ? "bg-blue-600"
              : "bg-blue-200"
          } ${loading ? "opacity-60" : ""}`}
        >
          <Text
            className={`text-white font-semibold text-lg ${
              !canCreate ? "opacity-70" : ""
            }`}
          >
            {loading ? "Creating…" : "Create Family"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
