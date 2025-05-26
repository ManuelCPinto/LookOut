// app/(tabs)/family/[id].tsx

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
import * as Animatable from "react-native-animatable";
import RNModal from "react-native-modal";
import { Share } from "react-native";

import { auth } from "@/lib/firebase";
import { ROLE_COLORS, Role } from "@/lib/family";
import {
  useGetFamily,
  useMembers,
  useLeaveFamily,
  useInvite,
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
    <View className="flex-row items-center p-4 border-t border-gray-100">
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
  const leaveFamily = useLeaveFamily(familyId, isOwner);
  const { inviteCode, show, create, hide } = useInvite(familyId);

  const allMembers = useMembers(familyId);
  const {
    term,
    setTerm,
    filtered: members,
  } = useSearchFilter(allMembers, (m, t) => m.uid.includes(t));
  const memberCount = members.length;

  const { setRole, transfer, loading: managing } = useManageMembers(familyId);

  const [selected, setSelected] = useState<{ uid: string; role: Role } | null>(
    null
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmMemberModal, setConfirmMemberModal] = useState(false);
  const [confirmFamilyModal, setConfirmFamilyModal] = useState(false);
  const { username: selName } = useGetUsername(selected?.uid ?? "");

  if (!family) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-gray-100">
        <Text className="text-gray-500">Loading family…</Text>
      </SafeAreaView>
    );
  }

  return (
    <Animatable.View animation="fadeIn" duration={300} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-gray-100">
        {/* Top Bar */}
        <View className="flex-row items-center px-4 pt-6 pb-4 bg-[#4F46E5]">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-center text-white">
            {family.name}
          </Text>
          {isOwner && (
            <TouchableOpacity
              onPress={() => create()}
              className="flex-row items-center px-3 py-1 bg-white rounded-full"
            >
              <Ionicons name="qr-code-outline" size={18} color="#4F46E5" />
              <Text className="ml-2 font-medium text-[#4F46E5]">Invite</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search + Members Container */}
        <View className="mx-4 mt-4 overflow-hidden bg-white shadow rounded-2xl">
          {/* Search Bar */}
          <View className="px-4 py-2 border-b border-gray-100">
            <View className="flex-row items-center px-4 py-2 rounded-full bg-gray-50">
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

          {/* Members Header */}
          <View className="flex-row items-center justify-between px-4 py-3">
            <Text className="text-xl font-semibold text-gray-800">
              Members: {memberCount}
            </Text>
            <TouchableOpacity
              onPress={() => setConfirmFamilyModal(true)}
              className={`px-4 py-1 rounded-full ${
                isOwner ? "bg-red-100" : "bg-yellow-100"
              }`}
            >
              <Text
                className={`font-medium ${
                  isOwner ? "text-red-500" : "text-yellow-600"
                }`}
              >
                {isOwner ? "Delete" : "Leave"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Member Rows */}
          {members.map((m, idx) => (
            <MemberItem
              key={m.uid}
              uid={m.uid}
              role={m.role}
              currentUid={user.uid}
              canManage={isOwner && m.uid !== user.uid}
              onManage={() => {
                setSelected(m);
                setMenuVisible(true);
              }}
            />
          ))}

          {memberCount === 0 && (
            <Text className="p-4 text-center text-gray-500">
              No members found.
            </Text>
          )}
        </View>

        {/* Invite QR Modal */}
        <Modal
          visible={show}
          transparent
          animationType="fade"
          onRequestClose={hide}
        >
          <View className="items-center justify-center flex-1 bg-black bg-opacity-60">
            <View className="w-11/12 p-6 bg-white rounded-2xl">
              <Text className="mb-2 text-2xl font-bold text-center text-gray-800">
                Invite Guest
              </Text>
              <Text className="mb-4 text-center text-gray-600">
                Share this QR code to add a{" "}
                <Text className="font-semibold">guest</Text>.
              </Text>
              <View className="items-center mb-4">
                <QRCode value={inviteCode} size={180} />
              </View>
              <View className="px-4 py-2 mb-4 bg-gray-100 rounded-lg">
                <Text
                  selectable
                  className="font-mono text-center text-gray-800"
                >
                  {inviteCode}
                </Text>
              </View>
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={async () =>
                    await Share.share({ message: `Join: ${inviteCode}` })
                  }
                  className="flex-1 py-3 bg-[#4F46E5] rounded-full items-center"
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

        {/* Manage Member Menu */}
        <RNModal
          isVisible={menuVisible}
          onBackdropPress={() => setMenuVisible(false)}
          animationIn="zoomIn"
          animationOut="zoomOut"
          backdropOpacity={0.5}
          style={{ justifyContent: "center", alignItems: "center", margin: 0 }}
        >
          <View className="w-11/12 max-w-md p-6 bg-white rounded-xl">
            <Text className="mb-4 text-lg font-semibold text-center">
              Manage {selName ?? selected?.uid}
            </Text>
            {selected?.role === "Guest" && (
              <TouchableOpacity
                onPress={async () => {
                  setMenuVisible(false);
                  await setRole(selected!.uid, "Member");
                }}
                disabled={managing}
                className="py-3 border-b border-gray-200"
              >
                <Text className="text-center text-gray-800">
                  Promote to Member
                </Text>
              </TouchableOpacity>
            )}
            {selected?.role === "Member" && (
              <TouchableOpacity
                onPress={async () => {
                  setMenuVisible(false);
                  await setRole(selected!.uid, "Guest");
                }}
                disabled={managing}
                className="py-3 border-b border-gray-200"
              >
                <Text className="text-center text-gray-800">
                  Demote to Guest
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                setConfirmMemberModal(true);
              }}
              className="py-3 border-b border-gray-200"
            >
              <Text className="font-semibold text-center text-red-600">
                Transfer Ownership
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMenuVisible(false)}
              className="py-3 mt-2"
            >
              <Text className="text-center text-gray-500">Cancel</Text>
            </TouchableOpacity>
          </View>
        </RNModal>

        {/* Confirm Transfer Modal */}
        <RNModal
          isVisible={confirmMemberModal}
          onBackdropPress={() => setConfirmMemberModal(false)}
          animationIn="fadeIn"
          animationOut="fadeOut"
          backdropOpacity={0.5}
          style={{ justifyContent: "center", alignItems: "center", margin: 0 }}
        >
          <View className="w-11/12 max-w-md p-6 bg-white rounded-xl">
            <Text className="mb-4 text-lg font-semibold text-center">
              Transfer Ownership?
            </Text>
            <Text className="mb-6 text-center">
              This will make <Text className="font-semibold">{selName}</Text>{" "}
              the owner.
            </Text>
            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity
                onPress={() => setConfirmMemberModal(false)}
              >
                <Text className="text-gray-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await transfer(selected!.uid);
                  setConfirmMemberModal(false);
                  router.replace("/profile");
                }}
              >
                <Text className="font-semibold text-red-600">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </RNModal>

        {/* Confirm Leave/Delete Family Modal */}
        <RNModal
          isVisible={confirmFamilyModal}
          onBackdropPress={() => setConfirmFamilyModal(false)}
          animationIn="fadeIn"
          animationOut="fadeOut"
          backdropOpacity={0.5}
          style={{ justifyContent: "center", alignItems: "center", margin: 0 }}
        >
          <View className="w-11/12 max-w-md p-6 bg-white rounded-xl">
            <Text className="mb-4 text-lg font-semibold text-center">
              {isOwner ? "Delete Family?" : "Leave Family?"}
            </Text>
            <Text className="mb-6 text-center">
              {isOwner
                ? "This will permanently delete your family and all data."
                : "Are you sure you want to leave this family?"}
            </Text>
            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity
                onPress={() => setConfirmFamilyModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                <Text className="text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  leaveFamily();
                  setConfirmFamilyModal(false);
                  router.back();
                }}
                className={`px-4 py-2 rounded-lg ${
                  isOwner ? "bg-red-100" : "bg-yellow-100"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    isOwner ? "text-red-500" : "text-yellow-600"
                  }`}
                >
                  {isOwner ? "Delete" : "Leave"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </RNModal>
      </SafeAreaView>
    </Animatable.View>
  );
}
