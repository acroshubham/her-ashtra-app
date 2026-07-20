// hooks/useShakeDetector.ts
// Detects a deliberate shake via the accelerometer. Requires several strong
// spikes in a short window (rejects single knocks / normal handling), then
// debounces so one shake fires the callback once.
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { Accelerometer } from "expo-sensors";

interface Options {
  enabled: boolean;
  onShake: () => void;
  // Total acceleration magnitude (in g) that counts as a spike. Gravity ≈ 1g.
  threshold?: number;
  // Spikes required within the window to trigger.
  requiredSpikes?: number;
  windowMs?: number;
  debounceMs?: number;
}

export function useShakeDetector({
  enabled,
  onShake,
  threshold = 1.8,
  requiredSpikes = 3,
  windowMs = 1000,
  debounceMs = 2000,
}: Options) {
  // Keep the latest callback without re-subscribing the sensor.
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  useEffect(() => {
    if (!enabled) return;

    let spikes: number[] = [];
    let lastTrigger = 0;
    let appActive = AppState.currentState === "active";

    Accelerometer.setUpdateInterval(100);

    const sub = Accelerometer.addListener(({ x, y, z }) => {
      if (!appActive) return;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude < threshold) return;

      const now = Date.now();
      spikes = spikes.filter((t) => now - t < windowMs);
      spikes.push(now);

      if (spikes.length >= requiredSpikes && now - lastTrigger > debounceMs) {
        lastTrigger = now;
        spikes = [];
        onShakeRef.current();
      }
    });

    // Don't react to shakes while backgrounded.
    const appStateSub = AppState.addEventListener("change", (next: AppStateStatus) => {
      appActive = next === "active";
      if (!appActive) spikes = [];
    });

    return () => {
      sub.remove();
      appStateSub.remove();
    };
  }, [enabled, threshold, requiredSpikes, windowMs, debounceMs]);
}
