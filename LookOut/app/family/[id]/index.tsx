import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { Share } from "react-native";
import RNModal from "react-native-modal";

import { auth } from "@/lib/firebase";
import { ROLE_COLORS, Role } from "@/lib/family";
import {
  useGetFamily,
  useMembers,
  useInvite,
  useLeaveFamily,
} from "@/hooks/family";
import { useManageMembers } from "@/hooks/family/useManageMembers";
import { useGetUsername } from "@/hooks/user";
import { useSearchFilter } from "@/hooks/common";

function MemberItem({
  uid,
  role,
  currentUid,
  canManage,
  onManage,
}: {
  uid: string;
  role: Role;
  currentUid: string;
  canManage: boolean;
  onManage: () => void;
}) {
  const isYou = uid === currentUid;
  const { username } = useGetUsername(uid);
  const label = isYou ? "You" : username ?? uid.slice(-6);
  const color = ROLE_COLORS[role];

  return (
    <View className="relative flex-row items-center p-4 mb-3 bg-white shadow rounded-2xl">
      <View className="items-center justify-center w-12 h-12 mr-4 bg-gray-200 rounded-full">
        <Ionicons name="person" size={24} color="#94A3B8" />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-gray-800">{label}</Text>
      </View>
      <View
        className="px-3 py-1 rounded-full"
        style={{ backgroundColor: color + "22" }}
      >
        <Text className="text-xs font-medium" style={{ color }}>
          {role}
        </Text>
      </View>
      {canManage && (
        <TouchableOpacity
          onPress={onManage}
          className="absolute p-1 right-4 top-4"
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function FamilyDetailScreen() {
  const { id: familyId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const family = useGetFamily(familyId);
  const user = auth.currentUser!;

  const isOwner = family?.ownerId === user.uid;
  const canInvite = isOwner;

  const allMembers = useMembers(familyId);
  const leaveFamily = useLeaveFamily(familyId, isOwner);
  const { inviteCode, show, create, hide } = useInvite(familyId);
  const {
    term,
    setTerm,
    filtered: members,
  } = useSearchFilter(allMembers, (m, t) => m.uid.includes(t));
  const { setRole, transfer, loading: managing } = useManageMembers(familyId);

  const [selected, setSelected] = useState<{ uid: string; role: Role } | null>(
    null
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const { username: selName } = useGetUsername(selected?.uid ?? "");

  if (!family) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-gray-100">
        <Text className="text-gray-500">Loading family…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-6 pb-4 bg-blue-600">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="flex-1 text-2xl font-bold text-center text-white">
          {family.name}
        </Text>
        {canInvite && (
          <TouchableOpacity
            onPress={() => create()}
            className="flex-row items-center px-3 py-1 bg-white rounded-full"
          >
            <Ionicons name="qr-code-outline" size={18} color="#2563EB" />
            <Text className="ml-2 font-medium text-blue-600">Invite</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View className="px-4 mt-4">
        <View className="flex-row items-center px-4 py-2 bg-white rounded-full shadow">
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            className="flex-1 ml-3 text-gray-700"
            placeholder="Search members..."
            placeholderTextColor="#94A3B8"
            value={term}
            onChangeText={setTerm}
          />
        </View>
      </View>

      {/* Members List */}
      <FlatList
        data={members}
        keyExtractor={(m) => m.uid}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View className="flex-row items-center justify-between px-4 mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Members ({members.length})
            </Text>
            <TouchableOpacity
              onPress={leaveFamily}
              className="px-3 py-1 bg-white border border-red-200 rounded-full"
            >
              <Text
                className={"text-sm font-medium text-red-400"}>
                {isOwner ? "Delete Family" : "Leave Family"}
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <MemberItem
            uid={item.uid}
            role={item.role}
            currentUid={user.uid}
            canManage={isOwner && item.uid !== user.uid}
            onManage={() => {
              setSelected(item);
              setMenuVisible(true);
            }}
          />
        )}
        ListEmptyComponent={
          <Text className="mt-8 text-center text-gray-500">
            No members found.
          </Text>
        }
      />

      {/* Invite QR Modal (native Modal) */}
      <Modal
        visible={show}
        transparent
        animationType="fade"
        onRequestClose={hide}
      >
        <View className="items-center justify-center flex-1 bg-black bg-opacity-60">
          <View className="w-full max-w-sm p-6 mx-4 bg-white rounded-3xl">
            <Text className="mb-2 text-2xl font-bold text-center text-gray-800">
              Invite Guest
            </Text>
            <Text className="mb-4 text-center text-gray-600">
              Share this QR code or link to add a{" "}
              <Text className="font-semibold">guest</Text>.
            </Text>
            <View className="items-center mb-4">
              <QRCode value={inviteCode} size={180} />
            </View>
            <View className="px-4 py-2 mb-4 bg-gray-100 rounded-lg">
              <Text selectable className="font-mono text-center text-gray-800">
                {inviteCode}
              </Text>
            </View>
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={async () =>
                  await Share.share({ message: `Join: ${inviteCode}` })
                }
                className="items-center flex-1 py-3 bg-blue-600 rounded-full"
              >
                <Text className="font-semibold text-white">Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={hide}
                className="items-center flex-1 py-3 bg-gray-300 rounded-full"
              >
                <Text className="font-semibold text-gray-800">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* — Manage-Member Dialog — */}
      <RNModal
        isVisible={menuVisible}
        onBackdropPress={() => setMenuVisible(false)}
        animationIn="zoomIn"
        animationOut="zoomOut"
        animationInTiming={300}
        animationOutTiming={200}
        backdropTransitionInTiming={200}
        backdropTransitionOutTiming={200}
        backdropOpacity={0.5}
        style={{
          justifyContent: "center",
          alignItems: "center",
          margin: 0,
        }}
      >
        <View className="w-11/12 max-w-md p-6 bg-white rounded-xl">
          <Text className="mb-4 text-lg font-semibold text-center">
            Manage {selName ?? selected?.uid}
          </Text>

          {selected?.role === "Guest" && (
            <TouchableOpacity
              className="py-3 border-b border-gray-200"
              disabled={managing}
              onPress={async () => {
                setMenuVisible(false);
                await setRole(selected!.uid, "Member");
              }}
            >
              <Text className="text-center text-gray-800">
                Promote to Member
              </Text>
            </TouchableOpacity>
          )}

          {selected?.role === "Member" && (
            <TouchableOpacity
              className="py-3 border-b border-gray-200"
              disabled={managing}
              onPress={async () => {
                setMenuVisible(false);
                await setRole(selected!.uid, "Guest");
              }}
            >
              <Text className="text-center text-gray-800">Demote to Guest</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            className="py-3 border-b border-gray-200"
            disabled={managing}
            onPress={() => {
              setMenuVisible(false);
              setConfirmVisible(true);
            }}
          >
            <Text className="font-semibold text-center text-red-600">
              Transfer Ownership
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 mt-2"
            onPress={() => setMenuVisible(false)}
          >
            <Text className="text-center text-gray-500">Cancel</Text>
          </TouchableOpacity>
        </View>
      </RNModal>

      {/* — Confirm Transfer Ownership — */}
      <RNModal
        isVisible={confirmVisible}
        onBackdropPress={() => setConfirmVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={200}
        animationOutTiming={400}
        backdropTransitionInTiming={200}
        backdropTransitionOutTiming={400}
        backdropOpacity={0.5}
        style={{
          justifyContent: "center",
          alignItems: "center",
          margin: 0,
        }}
      >
        <View className="w-11/12 max-w-md p-6 bg-white rounded-xl">
          <Text className="mb-4 text-lg font-semibold text-center">
            Transfer Ownership?
          </Text>
          <Text className="mb-6 text-center">
            This will make <Text className="font-semibold">{selName}</Text> the
            owner, and demote you to Member. Continue?
          </Text>
          <View className="flex-row justify-end space-x-4">
            <TouchableOpacity onPress={() => setConfirmVisible(false)}>
              <Text className="text-gray-500">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                await transfer(selected!.uid);
                setConfirmVisible(false);
                router.replace("/profile");
              }}
            >
              <Text className="font-semibold text-red-600">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>
    </SafeAreaView>
  );
}
