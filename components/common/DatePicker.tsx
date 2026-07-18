import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

interface DatePickerProps {
  value: string; // ISO date string (YYYY-MM-DD)
  onDateChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onDateChange,
  label,
  placeholder = "Select date...",
  required = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  // Parse ISO string to Date object
  const getDateFromString = (dateString: string): Date => {
    if (!dateString) return new Date();
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (selectedDate) {
      // Convert to ISO format (YYYY-MM-DD)
      const isoString = selectedDate.toISOString().split("T")[0];
      onDateChange(isoString);
    }
  };

  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return placeholder;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return placeholder;

    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const currentDate = getDateFromString(value);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          {label}
          {required && <Text className="text-red-500"> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 flex-row items-center justify-between"
        activeOpacity={0.7}
      >
        <View className="flex-1 flex-row items-center">
          <Ionicons
            name="calendar-outline"
            size={20}
            color="#71717a"
            style={{ marginRight: 12 }}
          />
          <Text
            className={`text-base ${
              value
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {formatDisplayDate(value)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#71717a" />
      </TouchableOpacity>

      {showPicker && (
        <>
          <DateTimePicker
            value={currentDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
          />
          {Platform.OS === "ios" && (
            <View className="bg-zinc-100 dark:bg-zinc-800 flex-row justify-between p-4 rounded-b-xl">
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                className="px-6 py-2"
              >
                <Text className="text-blue-600 dark:text-blue-400 font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                className="px-6 py-2"
              >
                <Text className="text-blue-600 dark:text-blue-400 font-medium">
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};
