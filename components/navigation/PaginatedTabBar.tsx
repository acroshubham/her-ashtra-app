// components/navigation/PaginatedTabBar.tsx
// Bottom tab bar that shows 4 tabs per page. When there are more than 4
// routes, a chevron appears after the 4th slot to page forward; once paged,
// a chevron on the left pages back. Scales to any number of tabs.
import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Text, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const PAGE_SIZE = 4;

export default function PaginatedTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const totalPages = Math.ceil(state.routes.length / PAGE_SIZE);
  const [page, setPage] = useState(Math.floor(state.index / PAGE_SIZE));
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const activePage = Math.floor(state.index / PAGE_SIZE);
    setPage((current) => (current === activePage ? current : activePage));
  }, [state.index]);

  const goToPage = (next: number) => {
    if (next < 0 || next >= totalPages) return;
    const direction = next > page ? -14 : 14;
    Animated.sequence([
      Animated.timing(slide, { toValue: direction, duration: 90, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();
    setPage(next);
  };

  const visibleRoutes = state.routes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#ffe4e6",
        paddingBottom: Math.max(insets.bottom, 12),
        paddingTop: 10,
        paddingHorizontal: 6,
      }}
    >
      {hasPrev && (
        <TouchableOpacity
          onPress={() => goToPage(page - 1)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ width: 32, height: 44, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="chevron-back" size={20} color="#e11d48" />
        </TouchableOpacity>
      )}

      <Animated.View
        style={{ flex: 1, flexDirection: "row", transform: [{ translateX: slide }] }}
      >
        {visibleRoutes.map((route) => {
          const index = state.routes.findIndex((r) => r.key === route.key);
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const label = typeof options.title === "string" ? options.title : route.name;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 4 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isFocused ? "#fecdd3" : "transparent",
                }}
              >
                {options.tabBarIcon?.({
                  focused: isFocused,
                  color: isFocused ? "#e11d48" : "#b98a92",
                  size: 22,
                })}
              </View>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 10,
                  marginTop: 2,
                  fontWeight: isFocused ? "700" : "500",
                  color: isFocused ? "#e11d48" : "#b98a92",
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>

      {hasNext && (
        <TouchableOpacity
          onPress={() => goToPage(page + 1)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ width: 32, height: 44, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="chevron-forward" size={20} color="#e11d48" />
        </TouchableOpacity>
      )}
    </View>
  );
}
