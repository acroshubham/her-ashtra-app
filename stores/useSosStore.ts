// stores/useSosStore.ts
// Owns the active-SOS state machine and the foreground location loop. The loop
// lifecycle (start/stop on resolve/unmount/background) lives here, not in the
// screen, because that is the most bug-prone part of the feature.
import { create } from "zustand";
import { AppState, type AppStateStatus, type NativeEventSubscription } from "react-native";
import * as Location from "expo-location";
import { apiFetch } from "@/lib/api";

export type SosPhase = "idle" | "countdown" | "creating" | "active" | "resolving";

export interface ActiveEvent {
  id: string;
  trackToken: string;
  trackUrl: string;
  status: string;
}

interface CreateEventInput {
  initialLat?: number;
  initialLng?: number;
}

const LOCATION_INTERVAL_MS = 5*60*1000; // 20 seconds

interface SosStore {
  phase: SosPhase;
  activeEvent: ActiveEvent | null;
  error: string | null;
  // Internal handles (not for UI use).
  _timer: ReturnType<typeof setInterval> | null;
  _appStateSub: NativeEventSubscription | null;

  setPhase: (phase: SosPhase) => void;
  createEvent: (input: CreateEventInput) => Promise<ActiveEvent | null>;
  attachMedia: (mediaUrl: string) => Promise<void>;
  resolve: () => Promise<void>;
  reset: () => void;
  // Loop control (called internally by createEvent/resolve, exposed for AppState).
  _startLocationLoop: () => void;
  _stopLocationLoop: () => void;
}

export const useSosStore = create<SosStore>((set, get) => ({
  phase: "idle",
  activeEvent: null,
  error: null,
  _timer: null,
  _appStateSub: null,

  setPhase: (phase) => set({ phase }),

  createEvent: async ({ initialLat, initialLng }) => {
    set({ phase: "creating", error: null });
    try {
      const event = await apiFetch<ActiveEvent>("/api/sos", {
        method: "POST",
        body: JSON.stringify({ initialLat, initialLng }),
      });
      set({ activeEvent: event, phase: "active" });
      get()._startLocationLoop();
      return event;
    } catch (err) {
      set({ phase: "idle", error: (err as Error).message });
      return null;
    }
  },

  attachMedia: async (mediaUrl) => {
    const event = get().activeEvent;
    if (!event) return;
    try {
      await apiFetch(`/api/sos/${event.id}`, {
        method: "PATCH",
        body: JSON.stringify({ mediaUrl }),
      });
    } catch (err) {
      // Best-effort: the alert already went out; media is a bonus.
      console.warn("[sos] attachMedia failed:", (err as Error).message);
    }
  },

  resolve: async () => {
    const event = get().activeEvent;
    if (!event) {
      get().reset();
      return;
    }
    set({ phase: "resolving" });
    try {
      await apiFetch(`/api/sos/${event.id}/resolve`, { method: "POST" });
    } catch (err) {
      console.warn("[sos] resolve failed:", (err as Error).message);
    } finally {
      get().reset();
    }
  },

  reset: () => {
    get()._stopLocationLoop();
    set({ phase: "idle", activeEvent: null, error: null });
  },

  _startLocationLoop: () => {
    // Guard against double-start.
    if (get()._timer) return;

    const tick = async () => {
      const event = get().activeEvent;
      if (!event || get().phase !== "active") return;
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        await apiFetch(`/api/sos/${event.id}/locations`, {
          method: "POST",
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy ?? undefined,
          }),
        });
      } catch (err) {
        console.warn("[sos] location update failed:", (err as Error).message);
      }
    };

    const timer = setInterval(tick, LOCATION_INTERVAL_MS);
    void tick(); // send one immediately so the trail starts right away

    // Pause the loop in the background (Expo Go can't track when backgrounded
    // anyway), resume on foreground.
    const appStateSub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next === "active") {
        void tick();
      }
    });

    set({ _timer: timer, _appStateSub: appStateSub });
  },

  _stopLocationLoop: () => {
    const { _timer, _appStateSub } = get();
    if (_timer) clearInterval(_timer);
    if (_appStateSub) _appStateSub.remove();
    set({ _timer: null, _appStateSub: null });
  },
}));
