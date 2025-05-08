// app/(tabs)/family/[id]/index.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { useFamily } from "@/hooks/useFamily";
import { auth } from "@/lib/firebase";
import { createInvite } from "@/lib/family";
import { Share } from "react-native";

const ROLE_COLORS: Record<string, string> = {
  owner:  "#2563EB",
  member: "#10B981", 
  guest:  "#6B7280", 
};

export default function FamilyDetailScreen() {
  const { id: familyId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const family = useFamily(familyId);
  const user = auth.currentUser!;

  const [search, setSearch] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [inviteRole, setInviteRole] = useState<"owner"|"member"|"guest">("member");

  if (!family) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-gray-500">Loading family…</Text>
      </SafeAreaView>
    );
  }

  const isOwner = family.ownerId === user.uid;
  const members = Object.entries(family.roles)
    .map(([uid, role]) => ({ uid, role }))
    .filter(m => m.uid.includes(search));

  const onInvite = async () => {
    const inv = await createInvite(familyId, "member");
    setInviteCode(inv.code);
    setShowQR(true);
  };

  const handleGenerate = async () => {
    const inv = await createInvite(familyId, inviteRole);
    setInviteCode(inv.code);
    setShowQR(true);
  };

  const renderMember = ({ item }: { item: { uid: string; role: string } }) => {
    const isYou = item.uid === user.uid;
    const label = isYou ? "You" : item.uid.slice(-6);
    const color = ROLE_COLORS[item.role] ?? ROLE_COLORS.guest;
    return (
      <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center shadow">
        <View className="w-12 h-12 rounded-full bg-gray-200 mr-4 items-center justify-center">
          <Ionicons name="person" size={24} color="#94A3B8" />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-800">{label}</Text>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: color + "22" }}
        >
          <Text style={{ color }} className="text-xs font-medium">
            {item.role}
          </Text>
        </View>
      </View>
    );
  };  
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* ─── Blue Header ─── */}
      <View className="bg-blue-600 px-4 pt-6 pb-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="flex-1 text-2xl font-bold text-white text-center">
          {family.name}
        </Text>
        {isOwner && (
          <TouchableOpacity
            onPress={onInvite}
            className="flex-row items-center bg-white px-3 py-1 rounded-full"
          >
            <Ionicons name="qr-code-outline" size={18} color="#2563EB" />
            <Text className="ml-2 text-blue-600 font-medium">Invite</Text>
          </TouchableOpacity>
        )}
      </View>

    {/* ─── Intro Card ─── */}
    <View className="bg-white mx-4 mt-4 rounded-2xl p-5 shadow">
      {/* Card Header */}
      <View className="flex-row items-center mb-3">
        <Ionicons name="home-outline" size={24} color="#2563EB" />
        <Text className="ml-2 text-lg font-semibold text-gray-800">
          Family Overview
        </Text>
      </View>

      {/* Description */}
      <Text className="text-gray-700 mb-4 leading-relaxed">
        Invite new members, assign roles, and keep everyone in sync. Your
        family group is your private space to monitor and share devices.
      </Text>

      {/* Divider */}
      <View className="h-px bg-gray-200 mb-4" />

      {/* Legend */}
      <View className="flex-row justify-between">
        {(["owner","member","guest"] as const).map(role => (
          <View key={role} className="flex-row items-center">
            <View
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: ROLE_COLORS[role] }}
            />
            <Text className="text-gray-600">{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
          </View>
        ))}
      </View>
    </View>

      {/* ─── Search ─── */}
      <View className="px-4 mt-4">
        <View className="flex-row items-center bg-white rounded-full px-4 py-2 shadow">
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            className="ml-3 flex-1 text-gray-700"
            placeholder="Search members..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* ─── Members List ─── */}
      <FlatList
        data={members}
        keyExtractor={m => m.uid}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Members ({members.length})
          </Text>
        }
        renderItem={renderMember}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-8">
            No members found.
          </Text>
        }
      />
      {/* ─── QR + Share Modal ─── */}
      <Modal visible={showQR} transparent animationType="fade">
        <View className="flex-1 bg-black bg-opacity-60 items-center justify-center">
          <View className="bg-white rounded-3xl p-6 mx-6 w-full max-w-sm">
            {/* Title */}
            <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
              Invite Family Member
            </Text>

            {/* Description */}
            <Text className="text-center text-gray-600 mb-4 leading-relaxed">
              Share this QR code or invite code to add a <Text className="font-semibold">{inviteRole}</Text> to your family.
            </Text>

            {/* QR Code */}
            <View className="items-center mb-4">
              <QRCode value={inviteCode} size={180} />
            </View>

            {/* Code fallback */}
            <View className="bg-gray-100 rounded-lg px-4 py-2 mb-4">
              <Text
                selectable
                className="text-center text-gray-800 font-mono"
              >
                {inviteCode}
              </Text>
            </View>

            {/* Buttons */}
            <View className="flex-row space-x-3">
              {/* Share */}
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await Share.share({
                      message: `Join my LookOut family as a ${inviteRole}! Use code:\n\n${inviteCode}`,
                    });
                  } catch (err) {
                    console.warn(err);
                  }
                }}
                className="flex-1 bg-blue-600 rounded-full py-3 items-center"
              >
                <Text className="text-white font-semibold">Share Invite</Text>
              </TouchableOpacity>

              {/* Close */}
              <TouchableOpacity
                onPress={() => setShowQR(false)}
                className="flex-1 bg-gray-300 rounded-full py-3 items-center"
              >
                <Text className="text-gray-800 font-semibold">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
