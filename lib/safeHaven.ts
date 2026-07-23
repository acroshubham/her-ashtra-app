// lib/safeHaven.ts
// Shared presentation helpers for the AI Safe Haven Finder: category → icon +
// color, distance formatting, and a "Directions" deep link. Used by both the
// AI Safety tab and the active-SOS "nearest safe place" card.
import { Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PlaceCategory, SafePlace } from "@/stores/useSafeHavenStore";
import colors from "@/lib/theme";

type IonIcon = keyof typeof Ionicons.glyphMap;

export const CATEGORY_ICON: Record<PlaceCategory, IonIcon> = {
  police: "shield-checkmark",
  hospital: "medkit",
  fire_station: "flame",
  petrol_pump: "car",
  metro: "train",
  hotel: "bed",
  mall: "storefront",
  pharmacy: "medical",
  government: "business",
};

export const CATEGORY_COLOR: Record<PlaceCategory, string> = {
  police: "#1d4ed8",
  hospital: colors.sos[600],
  fire_station: "#ea580c",
  petrol_pump: "#0891b2",
  metro: "#7c3aed",
  hotel: "#0d9488",
  mall: "#c026d3",
  pharmacy: "#059669",
  government: "#57534e",
};

export function formatDistance(meters: number): string {
  return meters < 1000 ? `${meters} m` : `${(meters / 1000).toFixed(1)} km`;
}

// Opens the platform maps app with a walking route to the destination. Matches
// the existing Google Maps deep-link approach used elsewhere in the app.
export function openDirections(place: Pick<SafePlace, "lat" | "lng">): void {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}&travelmode=walking`;
  Linking.openURL(url).catch(() => {});
}
