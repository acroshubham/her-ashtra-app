// components/ShakeArmer.tsx
// Headless component: arms shake-to-SOS whenever a user is signed in. Mounted
// once inside the tabs layout. On a detected shake it navigates to the SOS
// screen (no-op if already there or if an SOS is already active).
import { useSegments, useRouter, type Href } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/lib/auth-context";
import { useShakeDetector } from "@/hooks/useShakeDetector";
import { useSosStore } from "@/stores/useSosStore";

export default function ShakeArmer() {
  const { user } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const phase = useSosStore((s) => s.phase);

  const onSosScreen = (segments as string[]).includes("(sos)");

  useShakeDetector({
    enabled: Boolean(user) && !onSosScreen && phase === "idle",
    onShake: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      router.push("/(sos)/active" as Href);
    },
  });

  return null;
}
