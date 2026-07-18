// components/common/Dropdown.tsx
// Generic native dropdown: pass any item list + a zustand-backed selection
// setter and it renders a tap-to-open selector with an inline list overlay.
import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DropdownProps<T> {
  items: T[];
  selected: T | null;
  onSelect: (item: T) => void;
  getLabel: (item: T) => string;
  getSubLabel?: (item: T) => string | undefined;
  getKey?: (item: T) => string;
  placeholder?: string;
}

export default function Dropdown<T>({
  items,
  selected,
  onSelect,
  getLabel,
  getSubLabel,
  getKey,
  placeholder = "Select an option",
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const isSame = (a: T, b: T) => (getKey ? getKey(a) === getKey(b) : a === b);

  return (
    <View className="relative z-50">
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
        className="flex-row items-center bg-brand-50 px-4 py-3 rounded-xl border border-brand-100 mt-1"
      >
        <View className="flex-1">
          <Text className="text-[#28131a] text-sm font-semibold" numberOfLines={1}>
            {selected ? getLabel(selected) : placeholder}
          </Text>
          {selected && getSubLabel?.(selected) ? (
            <Text className="text-[#8a6b73] text-xs mt-0.5">{getSubLabel(selected)}</Text>
          ) : null}
        </View>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color="#c98d9a" />
      </TouchableOpacity>

      {open && (
        <View
          className="absolute top-[62px] left-0 right-0 bg-white rounded-xl border border-brand-100 shadow-lg z-50"
          style={{ maxHeight: 220, overflow: "hidden" }}
        >
          {items.length === 0 ? (
            <View className="p-4 items-center">
              <Text className="text-[#8a6b73]">No options yet</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item, index) => (getKey ? getKey(item) : String(index))}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const isActive = selected != null && isSame(item, selected);
                return (
                  <TouchableOpacity
                    className={`px-4 py-3 border-b border-brand-50 flex-row items-center justify-between ${isActive ? "bg-brand-50" : ""}`}
                    onPress={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                  >
                    <View className="flex-1">
                      <Text className={`font-medium ${isActive ? "text-brand-600" : "text-[#28131a]"}`}>
                        {getLabel(item)}
                      </Text>
                      {getSubLabel?.(item) ? (
                        <Text className="text-xs text-[#8a6b73]" numberOfLines={1}>
                          {getSubLabel(item)}
                        </Text>
                      ) : null}
                    </View>
                    {isActive && <Ionicons name="checkmark" size={16} color="#e11d48" />}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}
