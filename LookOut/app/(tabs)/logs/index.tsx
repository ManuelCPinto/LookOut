import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  FlatList,
  Pressable,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import CalendarScreen from "./calendar";
import LogDetailModal, { Event } from "./LogDetailModal";
import useLogsInRange from "@/hooks/logs/useLogsInRange";
import { auth } from "@/lib/firebase";
import {
  LogType,
  getLogIconAndLabel,
  deleteLog,
} from "@/lib/logs";
import RNModal from "react-native-modal";

export default function LogsScreen() {
  const ownerId = auth.currentUser!.uid;
  const [rangeStart, setRangeStart] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [rangeEnd, setRangeEnd] = useState(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  });
  const [activeTab, setActiveTab] = useState<"today" | "7days" | "custom">(
    "today"
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [listKey, setListKey] = useState(`today-${Date.now()}`);
  const allEvents: Event[] = useLogsInRange(rangeStart, rangeEnd);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmBulkDeleteVisible, setConfirmBulkDeleteVisible] = useState(false);

  const pickToday = useCallback(() => {
    const s = new Date();
    s.setHours(0, 0, 0, 0);
    const e = new Date();
    e.setHours(23, 59, 59, 999);
    setRangeStart(s);
    setRangeEnd(e);
    setActiveTab("today");
    setListKey(`today-${Date.now()}`);
    setSelectionMode(false);
    setSelectedIds([]);
  }, []);

  const pick7Days = useCallback(() => {
    const e = new Date();
    e.setHours(23, 59, 59, 999);
    const s = new Date(Date.now() - 6 * 24 * 3600_000);
    s.setHours(0, 0, 0, 0);
    setRangeStart(s);
    setRangeEnd(e);
    setActiveTab("7days");
    setListKey(`7days-${Date.now()}`);
    setSelectionMode(false);
    setSelectedIds([]);
  }, []);

  const openCustom = useCallback(() => {
    setActiveTab("custom");
    setCalendarOpen(true);
    setSelectionMode(false);
    setSelectedIds([]);
  }, []);

  const onCustomPicked = useCallback((start: Date, end: Date) => {
    setRangeStart(start);
    setRangeEnd(end);
    setListKey(`custom-${Date.now()}`);
    setCalendarOpen(false);
    setSelectionMode(false);
    setSelectedIds([]);
  }, []);

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  const rangeLabel =
    activeTab === "today"
      ? "Today"
      : activeTab === "7days"
      ? "Last 7 Days"
      : `${fmt(rangeStart)} – ${fmt(rangeEnd)}`;

  const toggleSelectionMode = useCallback(() => {
    if (selectionMode) {
      if (selectedIds.length > 0) {
        setConfirmBulkDeleteVisible(true);
      } else {
        setSelectionMode(false);
      }
    } else {
      setSelectionMode(true);
      setSelectedIds([]);
    }
  }, [selectionMode, selectedIds.length]);

  const handleConfirmBulkDelete = useCallback(async () => {
    setConfirmBulkDeleteVisible(false);
    try {
      await Promise.all(selectedIds.map((id) => deleteLog(id)));
    } catch (err) {
      console.warn("Some deletions failed:", err);
    }
    setSelectionMode(false);
    setSelectedIds([]);
  }, [selectedIds]);

  const handleCancelBulkDelete = useCallback(() => {
    setConfirmBulkDeleteVisible(false);
  }, []);

  const renderItem = ({
    item,
    index,
  }: {
    item: Event;
    index: number;
  }) => {
    const { iconName, label } = getLogIconAndLabel(item.type as LogType);

    const onPressRow = () => {
      if (selectionMode) {
        setSelectedIds((prev) => {
          if (prev.includes(item.id)) {
            return prev.filter((x) => x !== item.id);
          } else {
            return [...prev, item.id];
          }
        });
      } else {
        setSelectedEvent(item);
      }
    };

    const rightIcon = selectionMode ? (
      <Ionicons
        name={
          selectedIds.includes(item.id)
            ? "checkmark-circle"
            : "ellipse-outline"
        }
        size={24}
        color={selectedIds.includes(item.id) ? "#4F46E5" : "#9CA3AF"}
      />
    ) : (
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    );

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={100 + index * 50}
        className="mb-3"
      >
        <Pressable
          onPress={onPressRow}
          android_ripple={{ color: "#E5E7EB" }}
          className={`flex-row items-center p-4 bg-white shadow rounded-2xl ${
            selectionMode && selectedIds.includes(item.id)
              ? "bg-indigo-50"
              : ""
          }`}
        >
          <View className="p-3 rounded-full bg-indigo-50">
            <Ionicons name={iconName} size={24} color="#4F46E5" />
          </View>

          <View className="flex-1 ml-4">
            <Text className="font-medium text-gray-800">
              {label} on {item.deviceName}
            </Text>
            <Text className="mt-1 text-sm text-gray-500">
              {item.time.toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          {rightIcon}
        </Pressable>
      </Animatable.View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Animatable.View
        animation="fadeInDown"
        className="flex-row justify-around px-4 py-3 bg-white shadow"
      >
        <Pressable
          onPress={pickToday}
          className={`px-4 py-2 rounded-full ${
            activeTab === "today" ? "bg-indigo-600" : "bg-indigo-100"
          }`}
        >
          <Text
            className={`font-medium ${
              activeTab === "today" ? "text-white" : "text-indigo-700"
            }`}
          >
            Today
          </Text>
        </Pressable>
        <Pressable
          onPress={pick7Days}
          className={`px-4 py-2 rounded-full ${
            activeTab === "7days" ? "bg-indigo-600" : "bg-indigo-100"
          }`}
        >
          <Text
            className={`font-medium ${
              activeTab === "7days" ? "text-white" : "text-indigo-700"
            }`}
          >
            Last 7 Days
          </Text>
        </Pressable>
        <Pressable
          onPress={openCustom}
          className={`px-4 py-2 rounded-full ${
            activeTab === "custom" ? "bg-indigo-600" : "bg-indigo-100"
          }`}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={activeTab === "custom" ? "#fff" : "#4F46E5"}
          />
        </Pressable>
      </Animatable.View>

      <View className="flex-row items-center justify-between px-4 py-2 bg-white">
        <Text className="text-sm text-gray-600">Showing: {rangeLabel}</Text>
        <Pressable
          onPress={toggleSelectionMode}
          className="p-2 rounded-full"
          android_ripple={{ color: "#ECECEC", radius: 20 }}
        >
          <Ionicons
            name={selectionMode ? "trash-sharp" : "trash-outline"}
            size={20}
            color={selectionMode ? "#EF4444" : "#4B5563"}
          />
        </Pressable>
      </View>
      <FlatList
        key={listKey}
        data={allEvents}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={() => (
          <View className="items-center mt-20">
            <Text className="text-gray-400">No events in this range.</Text>
          </View>
        )}
        renderItem={renderItem}
      />

      {calendarOpen && (
        <CalendarScreen
          initialStart={rangeStart}
          initialEnd={rangeEnd}
          onConfirm={onCustomPicked}
          onCancel={() => setCalendarOpen(false)}
        />
      )}

      {!selectionMode && selectedEvent !== null && (
        <LogDetailModal
          event={selectedEvent}
          visible={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          onDelete={(id) => {
            console.log("deleted", id);
            setSelectedEvent(null);
          }}
        />
      )}

      <RNModal
        isVisible={confirmBulkDeleteVisible}
        backdropOpacity={0.6}
        animationIn="zoomIn"
        animationOut="zoomOut"
        style={{ justifyContent: "center", alignItems: "center" }}
      >
        <View className="p-6 bg-white rounded-2xl">
          <Text className="mb-4 text-lg font-semibold">
            Delete {selectedIds.length} {selectedIds.length === 1 ? "log" : "logs"}?
          </Text>
          <Text className="mb-6 text-gray-700">
            Are you sure you want to delete these {selectedIds.length}{" "}
            {selectedIds.length === 1 ? "item" : "items"}? This cannot be
            undone.
          </Text>
          <View className="flex-row justify-end space-x-4">
            <Pressable
              onPress={handleCancelBulkDelete}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              <Text className="text-gray-700">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirmBulkDelete}
              className="px-4 py-2 bg-red-600 rounded-lg"
            >
              <Text className="font-semibold text-white">Delete</Text>
            </Pressable>
          </View>
        </View>
      </RNModal>
    </SafeAreaView>
  );
}