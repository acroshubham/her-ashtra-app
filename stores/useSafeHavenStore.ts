// stores/useSafeHavenStore.ts
// AI Safe Haven Finder — fetches nearby safe destinations from the
// Her-Ashtra-API /api/safe-haven endpoint, ranked safest-first with an
// AI/template explanation for the top pick.
import { create } from "zustand";
import { apiFetch } from "@/lib/api";

export type PlaceCategory =
  | "police"
  | "hospital"
  | "fire_station"
  | "petrol_pump"
  | "metro"
  | "hotel"
  | "mall"
  | "pharmacy"
  | "government";

export interface SafePlace {
  id: string;
  name: string;
  category: PlaceCategory;
  categoryLabel: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  score: number;
  reasons: string[];
  openingHours: string | null;
}

export interface Recommendation extends SafePlace {
  reason: string;
}

interface SafeHavenResponse {
  recommendation: Recommendation | null;
  places: SafePlace[];
  message?: string;
}

interface SafeHavenStore {
  recommendation: Recommendation | null;
  places: SafePlace[];
  message: string | null;
  loading: boolean;
  error: string | null;
  findNearby: (coords: { lat: number; lng: number }) => Promise<void>;
  reset: () => void;
}

export const useSafeHavenStore = create<SafeHavenStore>((set) => ({
  recommendation: null,
  places: [],
  message: null,
  loading: false,
  error: null,

  findNearby: async ({ lat, lng }) => {
    set({ loading: true, error: null, message: null });
    try {
      const data = await apiFetch<SafeHavenResponse>("/api/safe-haven", {
        method: "POST",
        body: JSON.stringify({ lat, lng }),
      });
      set({
        recommendation: data.recommendation,
        places: data.places,
        message: data.message ?? null,
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: (err as Error).message });
    }
  },

  reset: () => set({ recommendation: null, places: [], message: null, error: null }),
}));
