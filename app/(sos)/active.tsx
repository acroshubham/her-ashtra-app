import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Share, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import {
  ShieldAlert,
  MapPin,
  Video,
  VideoOff,
  CheckCircle2,
  Share2,
  Navigation as NavIcon,
  Bot,
  X,
} from "lucide-react-native";
import { CameraView, useCameraPermissions, useMicrophonePermissions } from "expo-camera";
import { useSosStore } from "@/stores/useSosStore";
import { useContactStore } from "@/stores/useContactStore";
import { useSafeHavenStore } from "@/stores/useSafeHavenStore";
import { uploadVideo } from "@/lib/cloudinary";
import { CATEGORY_TINT, guardian } from "@/lib/theme";
import { formatDistance, openDirections } from "@/lib/safeHaven";

const COUNTDOWN_SECONDS = 7;
const VIDEO_MAX_SECONDS = 20;

type Step = "countdown" | "dispatching" | "live";

function mmss(total: number) {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function ActiveSos() {
  const router = useRouter();
  const createEvent = useSosStore((s) => s.createEvent);
  const attachMedia = useSosStore((s) => s.attachMedia);
  const resolve = useSosStore((s) => s.resolve);
  const reset = useSosStore((s) => s.reset);
  const activeEvent = useSosStore((s) => s.activeEvent);
  const contacts = useContactStore((s) => s.contacts);
  const findSafeHavens = useSafeHavenStore((s) => s.findNearby);
  const safeHaven = useSafeHavenStore((s) => s.recommendation);
  const resetSafeHavens = useSafeHavenStore((s) => s.reset);

  const [step, setStep] = useState<Step>("countdown");
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const [recording, setRecording] = useState(false);
  const [mediaAttached, setMediaAttached] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [micPerm, requestMicPerm] = useMicrophonePermissions();
  const cameraRef = useRef<CameraView>(null);
  const cameraReadyRef = useRef(false);

  // --- Countdown ---------------------------------------------------------
  useEffect(() => {
    if (step !== "countdown") return;
    if (count <= 0) {
      dispatch();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, step]);

  // --- Live timer --------------------------------------------------------
  useEffect(() => {
    if (step !== "live") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [step]);

  const cancel = useCallback(() => {
    reset();
    resetSafeHavens();
    router.back();
  }, [reset, resetSafeHavens, router]);

  // --- Dispatch: capture GPS, create event, then record video -----------
  const dispatch = useCallback(async () => {
    setStep("dispatching");

    let lat: number | undefined;
    let lng: number | undefined;
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.granted) {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
    } catch {
      // ignore — proceed without coords
    }

    const event = await createEvent({ initialLat: lat, initialLng: lng });
    if (!event) {
      Alert.alert("Couldn't send SOS", "Please check your connection and try again.", [
        { text: "OK", onPress: cancel },
      ]);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setStep("live");
    if (lat != null && lng != null) {
      void findSafeHavens({ lat, lng });
    }
    void recordAndUpload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createEvent, cancel]);

  // --- Video capture (best-effort; alert already sent) -------------------
  const recordAndUpload = useCallback(async () => {
    try {
      const cam = camPerm?.granted ? camPerm : await requestCamPerm();
      const mic = micPerm?.granted ? micPerm : await requestMicPerm();
      if (!cam?.granted || !mic?.granted) {
        return;
      }
      for (let i = 0; i < 50 && !cameraReadyRef.current; i++) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (!cameraRef.current || !cameraReadyRef.current) return;

      setRecording(true);
      const video = await cameraRef.current.recordAsync({ maxDuration: VIDEO_MAX_SECONDS });
      setRecording(false);
      if (!video?.uri) return;

      const url = await uploadVideo(video.uri);
      if (url) {
        await attachMedia(url);
        setMediaAttached(true);
      }
    } catch (err) {
      setRecording(false);
      console.warn("[sos] recording/upload failed:", (err as Error).message);
    }
  }, [camPerm, micPerm, requestCamPerm, requestMicPerm, attachMedia]);

  const stopRecording = useCallback(() => {
    cameraRef.current?.stopRecording();
  }, []);

  const onSafe = useCallback(async () => {
    stopRecording();
    await resolve();
    resetSafeHavens();
    router.back();
  }, [resolve, stopRecording, resetSafeHavens, router]);

  const shareLink = useCallback(() => {
    if (!activeEvent) return;
    Share.share({
      message: `I've triggered an SOS. Follow my live location: ${activeEvent.trackUrl}`,
    }).catch(() => {});
  }, [activeEvent]);

  // ======================================================================
  if (step === "countdown") {
    return (
      <View style={{ flex: 1, backgroundColor: guardian.bg }}>
        <StatusBar style="light" />
        <LinearGradient colors={["#7f1d1d", guardian.bg]} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 400, opacity: 0.6 }} />
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: "700", letterSpacing: 2 }}>
            SENDING SOS IN
          </Text>
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              borderWidth: 3,
              borderColor: guardian.primary,
              alignItems: "center",
              justifyContent: "center",
              marginVertical: 32,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 96, fontWeight: "900" }}>{count}</Text>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 36, fontSize: 14 }}>
            Your Guardian Circle will be alerted with your live location.
          </Text>
          <Pressable onPress={cancel} style={{ backgroundColor: "#fff", borderRadius: 999, paddingHorizontal: 48, paddingVertical: 16 }}>
            <Text style={{ color: guardian.bg, fontSize: 17, fontWeight: "900" }}>CANCEL</Text>
          </Pressable>
          <Pressable onPress={dispatch} style={{ marginTop: 22 }}>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontWeight: "700", textDecorationLine: "underline" }}>
              Send now
            </Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  if (step === "dispatching") {
    return (
      <View style={{ flex: 1, backgroundColor: guardian.bg, alignItems: "center", justifyContent: "center" }}>
        <StatusBar style="light" />
        <LinearGradient
          colors={guardian.gradRed}
          style={{ width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" }}
        >
          <ShieldAlert color="#fff" size={44} />
        </LinearGradient>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 24 }}>Sending your SOS…</Text>
      </View>
    );
  }

  // step === "live"
  return (
    <View style={{ flex: 1, backgroundColor: guardian.bg }}>
      <StatusBar style="light" />
      <LinearGradient colors={["#7f1d1d", guardian.bg]} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 360, opacity: 0.5 }} />

      {camPerm?.granted && micPerm?.granted && (
        <CameraView
          ref={cameraRef}
          style={{ position: "absolute", width: 84, height: 116, top: 60, right: 16, borderRadius: 12, opacity: 0.9 }}
          mode="video"
          facing="back"
          onCameraReady={() => {
            cameraReadyRef.current = true;
          }}
        />
      )}

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
          <View style={{ alignItems: "center", marginTop: 8 }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: guardian.primary,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: guardian.primary,
                shadowOpacity: 0.7,
                shadowRadius: 24,
                elevation: 10,
              }}
            >
              <ShieldAlert color="#fff" size={42} />
            </View>
            <Text style={{ color: "#fff", fontSize: 26, fontWeight: "900", marginTop: 14 }}>EMERGENCY ACTIVE</Text>
            <Text style={{ color: guardian.primary, fontSize: 34, fontWeight: "900", marginTop: 4, letterSpacing: 2 }}>
              {mmss(elapsed)}
            </Text>
          </View>

          {/* Status cards */}
          <View style={{ gap: 12, marginTop: 24 }}>
            <StatusCard
              icon={<MapPin color={guardian.secondary} size={18} />}
              title="Sharing live location"
              subtitle="Updates while the app stays open"
            />
            <StatusCard
              icon={recording ? <Video color={guardian.primary} size={18} /> : mediaAttached ? <CheckCircle2 color={guardian.success} size={18} /> : <VideoOff color={guardian.textDim} size={18} />}
              title={recording ? "Recording evidence…" : mediaAttached ? "Video evidence attached" : "Video evidence (skipped)"}
              subtitle={recording ? "Up to 20 seconds" : undefined}
            />

            {safeHaven && (
              <View style={{ backgroundColor: guardian.card, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: guardian.border }}>
                <Text style={{ color: guardian.textDim, fontSize: 11, fontWeight: "700" }}>NEAREST SAFE PLACE</Text>
                <View className="flex-row items-center" style={{ marginTop: 10 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${CATEGORY_TINT[safeHaven.category] ?? guardian.secondary}33`, alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                    <NavIcon color={CATEGORY_TINT[safeHaven.category] ?? guardian.secondary} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#fff", fontWeight: "700" }} numberOfLines={1}>{safeHaven.name}</Text>
                    <Text style={{ color: guardian.textDim, fontSize: 12 }}>{safeHaven.categoryLabel} · {formatDistance(safeHaven.distanceMeters)}</Text>
                  </View>
                  <Pressable onPress={() => openDirections(safeHaven)} style={{ backgroundColor: "#fff", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
                    <Text style={{ color: guardian.primary, fontWeight: "800", fontSize: 12 }}>Directions</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Guardian circle */}
            <View style={{ backgroundColor: guardian.card, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: guardian.border }}>
              <Text style={{ color: guardian.textDim, fontSize: 11, fontWeight: "700" }}>ALERTED GUARDIANS</Text>
              {contacts.length === 0 ? (
                <Text style={{ color: guardian.textDim, fontSize: 13, marginTop: 8 }}>
                  No contacts yet — add trusted guardians for next time.
                </Text>
              ) : (
                <View className="flex-row items-center" style={{ marginTop: 10, flexWrap: "wrap", gap: 8 }}>
                  {contacts.slice(0, 5).map((c) => (
                    <View key={c.id} className="flex-row items-center" style={{ backgroundColor: guardian.cardAlt, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
                      <CheckCircle2 color={guardian.success} size={13} />
                      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600", marginLeft: 5 }}>{c.name}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={{ flex: 1 }} />

          {/* Actions */}
          <View style={{ gap: 10 }}>
            <View className="flex-row" style={{ gap: 10 }}>
              <Pressable onPress={shareLink} style={{ flex: 1, backgroundColor: guardian.card, borderRadius: 16, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", borderWidth: 1, borderColor: guardian.border }}>
                <Share2 color="#fff" size={16} />
                <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 8 }}>Share link</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/(tabs)/assistant" as Href)} style={{ flex: 1, backgroundColor: guardian.card, borderRadius: 16, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", borderWidth: 1, borderColor: guardian.border }}>
                <Bot color={guardian.warning} size={16} />
                <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 8 }}>Assistant</Text>
              </Pressable>
            </View>

            <Pressable onPress={onSafe} style={{ borderRadius: 18, overflow: "hidden" }}>
              <LinearGradient colors={guardian.gradGreen} style={{ paddingVertical: 18, alignItems: "center", flexDirection: "row", justifyContent: "center" }}>
                <X color="#fff" size={18} />
                <Text style={{ color: "#fff", fontSize: 17, fontWeight: "900", marginLeft: 8 }}>{"I'M SAFE — RESOLVE"}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function StatusCard({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <View style={{ backgroundColor: guardian.card, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: guardian.border, flexDirection: "row", alignItems: "center" }}>
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: guardian.cardAlt, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{title}</Text>
        {subtitle ? <Text style={{ color: guardian.textDim, fontSize: 12, marginTop: 1 }}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}
