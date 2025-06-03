import React, { useState, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
  Dimensions,
} from "react-native";
import { Calendar, DateData, MarkingProps } from "react-native-calendars";
import RNModal from "react-native-modal";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const toYMD = (d: Date) => d.toISOString().split("T")[0];

interface CalendarScreenProps {
  initialStart: Date;
  initialEnd: Date;
  onConfirm: (start: Date, end: Date) => void;
  onCancel: () => void;
}

export default function CalendarScreen({
  initialStart,
  initialEnd,
  onConfirm,
  onCancel,
}: CalendarScreenProps) {
  const ymdInitialStart = toYMD(initialStart);
  const ymdInitialEnd = toYMD(initialEnd);

  const [selectingStart, setSelectingStart] = useState(true);
  const [range, setRange] = useState<{ start?: string; end?: string }>({});

  useEffect(() => {
    setRange({ start: ymdInitialStart, end: ymdInitialEnd });
    setSelectingStart(true);
  }, [ymdInitialStart, ymdInitialEnd]);

  const marks: Record<string, MarkingProps> = {};
  if (range.start) {
    marks[range.start] = {
      startingDay: true,
      color: "#4F46E5",
      textColor: "white",
    };
  }
  if (range.start && range.end) {
    let cur = new Date(range.start);
    const end = new Date(range.end);
    while (cur < end) {
      const ymd = toYMD(cur);
      if (ymd !== range.start && ymd !== range.end) {
        marks[ymd] = {
          color: "#Dbeafe",       
          textColor: "#1e40af",   
        };
      }
      cur.setDate(cur.getDate() + 1);
    }
    marks[range.end] = {
      endingDay: true,
      color: "#4F46E5",
      textColor: "white",
    };
  }

  const onDayPress = useCallback(
    (day: DateData) => {
      const d = day.dateString;
      if (selectingStart || !range.start) {
        setRange({ start: d });
        setSelectingStart(false);
      } else {
        if (d < range.start!) {
          setRange({ start: d, end: range.start });
        } else {
          setRange({ start: range.start, end: d });
        }
        setSelectingStart(true);
      }
    },
    [range, selectingStart]
  );

  const jumpToday = () => {
    const today = toYMD(new Date());
    setRange({ start: today, end: today });
    setSelectingStart(true);
  };

  const confirm = () => {
    if (range.start && range.end) {
      onConfirm(new Date(range.start), new Date(range.end));
    } else if (range.start) {
      const d = new Date(range.start);
      onConfirm(d, d);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <RNModal
        isVisible={true}
        style={{ margin: 0, justifyContent: "flex-end" }}
        backdropOpacity={0.5}
        onBackdropPress={onCancel}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        propagateSwipe
      >
        <Animatable.View
          animation="fadeInUp"
          duration={300}
          className="px-4 pb-6 bg-white rounded-t-3xl"
          style={{ height: "80%" }}
        >
          {/* handle */}
          <View className="self-center w-12 h-1 my-2 bg-gray-300 rounded-full" />

          {/* header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-800">
              Select Date Range
            </Text>
            <TouchableOpacity onPress={onCancel}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* toggle */}
          <View className="flex-row items-center mb-2">
            {["Start", "End"].map((label, i) => (
              <TouchableOpacity
                key={label}
                onPress={() => setSelectingStart(i === 0)}
                className={`flex-1 py-2 mx-1 rounded-full items-center ${
                  selectingStart ? (i === 0 ? "bg-indigo-600" : "bg-gray-200") : (i === 1 ? "bg-indigo-600" : "bg-gray-200")
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectingStart
                      ? i === 0
                        ? "text-white"
                        : "text-gray-700"
                      : i === 1
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={jumpToday}
              className="items-center px-3 py-2 ml-2 bg-gray-100 rounded-full"
            >
              <Text className="font-medium text-indigo-600">Today</Text>
            </TouchableOpacity>
          </View>

          {/* calendar */}
          <Calendar
            markingType="period"
            markedDates={marks as any}
            onDayPress={onDayPress}
            theme={{
              arrowColor: "#4F46E5",
              todayTextColor: "#4F46E5",
              monthTextColor: "#111827",
            }}
            style={{
              borderTopWidth: 1,
              borderColor: "#E5E7EB",
              paddingBottom: 8,
            }}
            enableSwipeMonths
          />

          {/* footer */}
          <View className="flex-row justify-between px-2 pt-3 mt-4 border-t border-gray-200">
            <Text className="text-gray-700">
              From:{" "}
              <Text className="font-semibold text-gray-900">
                {range.start ?? "—"}
              </Text>
            </Text>
            <Text className="text-gray-700">
              To:{" "}
              <Text className="font-semibold text-gray-900">
                {range.end ?? "—"}
              </Text>
            </Text>
          </View>

          {/* confirm */}
          <TouchableOpacity
            onPress={confirm}
            className="items-center py-3 mt-6 bg-indigo-600 rounded-full"
          >
            <Text className="font-semibold text-white">Confirm</Text>
          </TouchableOpacity>
        </Animatable.View>
      </RNModal>
    </SafeAreaView>
  );
}
