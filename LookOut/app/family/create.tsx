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
import { useRouter } from "expo-router";
import { auth } from "@/lib/firebase";
import { useCreateFamily } from "@/hooks/family/useCreateFamily";

export default function CreateFamilyScreen() {
  const { back } = useRouter();
  const [name, setName]             = useState("");
  const [description, setDescription] = useState("");
  const { createFamily, loading }   = useCreateFamily();

  const canCreate = !!name.trim();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={back} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-bold text-center text-gray-800">
          Create a Family
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Family Name */}
        <Text className="mb-2 text-sm font-semibold text-gray-700">
          Family Name
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. The Smiths"
          className="p-4 mb-6 text-gray-800 bg-white border border-gray-300 rounded-xl"
        />

        {/* Description */}
        <Text className="mb-2 text-sm font-semibold text-gray-700">
          Description (optional)
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="A short note about your family"
          multiline
          numberOfLines={3}
          className="h-24 p-4 mb-6 text-gray-800 bg-white border border-gray-300 rounded-xl"
        />

        {/* Info */}
        <View className="p-4 mb-6 border-l-4 border-blue-400 rounded-lg bg-blue-50">
          <Text className="text-blue-800">
            You’ll be the “owner” of this family and can invite others via QR
            code or invite link once it’s created.
          </Text>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          onPress={() =>
            createFamily(name, auth.currentUser!.uid, description)
          }
          disabled={!canCreate || loading}
          className={`rounded-xl py-4 items-center ${
            canCreate ? "bg-blue-600" : "bg-blue-200"
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
