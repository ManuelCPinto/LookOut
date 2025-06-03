import React, { useState, useMemo, useCallback } from "react";
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

const STATIC_EVENTS: Event[] = [
  { id: "1", type: "doorbell", time: new Date(), deviceName: "Front Door" },
  {
    id: "2",
    type: "motion",
    time: new Date(Date.now() - 3600e3),
    deviceName: "Backyard",
  },
  {
    id: "3",
    type: "motion",
    time: new Date("2025-05-15T14:23:00"),
    deviceName: "Garage",
  },
];

export default function LogsScreen() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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

  const pickToday = useCallback(() => {
    const s = new Date();
    s.setHours(0, 0, 0, 0);
    const e = new Date();
    e.setHours(23, 59, 59, 999);
    setRangeStart(s);
    setRangeEnd(e);
    setActiveTab("today");
    setListKey(`today-${Date.now()}`);
  }, []);

  const pick7Days = useCallback(() => {
    const e = new Date();
    e.setHours(23, 59, 59, 999);
    const s = new Date(Date.now() - 6 * 24 * 3600e3);
    s.setHours(0, 0, 0, 0);
    setRangeStart(s);
    setRangeEnd(e);
    setActiveTab("7days");
    setListKey(`7days-${Date.now()}`);
  }, []);

  const openCustom = useCallback(() => {
    setActiveTab("custom");
    setCalendarOpen(true);
  }, []);

  const onCustomPicked = useCallback((start: Date, end: Date) => {
    setRangeStart(start);
    setRangeEnd(end);
    setListKey(`custom-${Date.now()}`);
    setCalendarOpen(false);
  }, []);

  const filtered = useMemo(() => {
    return STATIC_EVENTS
      .filter((e) => e.time >= rangeStart && e.time <= rangeEnd)
      .sort((a, b) => b.time.getTime() - a.time.getTime());
  }, [rangeStart, rangeEnd]);

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

  const renderItem = ({
    item,
    index,
  }: {
    item: Event;
    index: number;
  }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={100 + index * 50}
      className="mb-3"
    >
      <Pressable
        onPress={() => setSelectedEvent(item)}
        android_ripple={{ color: "#E5E7EB" }}
        className="flex-row items-center p-4 bg-white shadow rounded-2xl"
      >
        <View className="p-3 rounded-full bg-indigo-50">
          <Ionicons
            name={
              item.type === "doorbell"
                ? "notifications-outline"
                : "walk-outline"
            }
            size={24}
            color="#4F46E5"
          />
        </View>
        <View className="flex-1 ml-4">
          <Text className="font-medium text-gray-800">
            {item.type === "doorbell"
              ? "Doorbell rang"
              : "Motion detected"}{" "}
            on {item.deviceName}
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
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </Pressable>
    </Animatable.View>
  );

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

      <View className="px-4 py-2 bg-white">
        <Text className="text-sm text-gray-600">Showing: {rangeLabel}</Text>
      </View>

      <FlatList
        key={listKey}
        data={filtered}
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

      {selectedEvent && (
        <LogDetailModal
          event={selectedEvent}
          visible
          onClose={() => setSelectedEvent(null)}
          onDelete={(id) => {
            console.log("deleted", id);
            setSelectedEvent(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}
