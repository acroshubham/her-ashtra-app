import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Share, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions,
} from "expo-camera";
import { useSosStore } from "@/stores/useSosStore";
import { useContactStore } from "@/stores/useContactStore";
import { uploadVideo } from "@/lib/cloudinary";
import colors from "@/lib/theme";

const COUNTDOWN_SECONDS = 7;
const VIDEO_MAX_SECONDS = 20;

type Step = "countdown" | "dispatching" | "live";

export default function ActiveSos() {
  const router = useRouter();
  const createEvent = useSosStore((s) => s.createEvent);
  const attachMedia = useSosStore((s) => s.attachMedia);
  const resolve = useSosStore((s) => s.resolve);
  const reset = useSosStore((s) => s.reset);
  const activeEvent = useSosStore((s) => s.activeEvent);
  const contacts = useContactStore((s) => s.contacts);

  const [step, setStep] = useState<Step>("countdown");
  const [count, setCount] = useState(COUNTDOWN_SECONDS);
  const [recording, setRecording] = useState(false);
  const [mediaAttached, setMediaAttached] = useState(false);

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

  const cancel = useCallback(() => {
    reset();
    router.back();
  }, [reset, router]);

  // --- Dispatch: capture GPS, create event, then record video -----------
  const dispatch = useCallback(async () => {
    setStep("dispatching");

    // Best-effort GPS; a denied/failed fix still sends the SOS with no coords.
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
    // Fire the recording flow without blocking the UI transition.
    void recordAndUpload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createEvent, cancel]);

  // --- Video capture (best-effort; alert already sent) -------------------
  const recordAndUpload = useCallback(async () => {
    try {
      const cam = camPerm?.granted ? camPerm : await requestCamPerm();
      const mic = micPerm?.granted ? micPerm : await requestMicPerm();
      if (!cam?.granted || !mic?.granted) {
        return; // stay location-only
      }

      // Wait briefly for the camera to mount + report ready.
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
    router.back();
  }, [resolve, stopRecording, router]);

  const shareLink = useCallback(() => {
    if (!activeEvent) return;
    Share.share({
      message: `I've triggered an SOS. Follow my live location: ${activeEvent.trackUrl}`,
    }).catch(() => {});
  }, [activeEvent]);

  // ======================================================================
  if (step === "countdown") {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.sos[600] }}>
        <StatusBar style="light" />
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-white/90 text-lg font-semibold tracking-wide">
            SENDING SOS IN
          </Text>
          <Text className="text-white font-extrabold" style={{ fontSize: 120, lineHeight: 130 }}>
            {count}
          </Text>
          <Text className="text-white/80 text-center mb-10">
            Your trusted circle will be alerted with your live location.
          </Text>
          <TouchableOpacity
            onPress={cancel}
            activeOpacity={0.85}
            className="bg-white rounded-full px-12 py-5"
          >
            <Text className="text-lg font-extrabold" style={{ color: colors.sos[600] }}>
              CANCEL
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={dispatch} className="mt-6">
            <Text className="text-white/90 font-semibold underline">Send now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === "dispatching") {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.sos[600] }}>
        <StatusBar style="light" />
        <View className="flex-1 items-center justify-center px-8">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white text-lg font-semibold mt-6">Sending your SOS…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // step === "live"
  return (
    <SafeAreaView className="flex-1 bg-[#1c0a10]" edges={["top", "bottom"]}>
      <StatusBar style="light" />
      {/* Hidden-ish camera used to record evidence; kept small on screen. */}
      {camPerm?.granted && micPerm?.granted && (
        <CameraView
          ref={cameraRef}
          style={{ position: "absolute", width: 110, height: 150, top: 60, right: 16, borderRadius: 12 }}
          mode="video"
          facing="back"
          onCameraReady={() => {
            cameraReadyRef.current = true;
          }}
        />
      )}

      <View className="flex-1 px-6 pt-10">
        <View className="items-center mt-4">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.sos[500] }}
          >
            <Ionicons name="alert" size={40} color="#ffffff" />
          </View>
          <Text className="text-white text-2xl font-extrabold">SOS ACTIVE</Text>
          <Text className="text-white/70 text-center mt-2">
            {contacts.length > 0
              ? `${contacts.length} contact${contacts.length > 1 ? "s" : ""} notified by email.`
              : "No contacts yet — add trusted contacts so they get alerted next time."}
          </Text>
        </View>

        <View className="bg-white/10 rounded-2xl p-4 mt-8">
          <View className="flex-row items-center">
            <Ionicons name="location" size={18} color={colors.brand[300]} />
            <Text className="text-white/90 font-semibold ml-2">Sharing live location</Text>
          </View>
          <Text className="text-white/60 text-xs mt-1">
            Updates every 20s while this app stays open. It pauses if the app is closed.
          </Text>
        </View>

        <View className="bg-white/10 rounded-2xl p-4 mt-3">
          <View className="flex-row items-center">
            <Ionicons
              name={recording ? "videocam" : mediaAttached ? "checkmark-circle" : "videocam-off"}
              size={18}
              color={recording ? colors.sos[500] : colors.brand[300]}
            />
            <Text className="text-white/90 font-semibold ml-2">
              {recording
                ? "Recording video evidence…"
                : mediaAttached
                  ? "Video evidence attached"
                  : "Video evidence (camera off / skipped)"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={shareLink}
          activeOpacity={0.85}
          className="flex-row items-center justify-center bg-white/10 rounded-2xl py-4 mt-3"
        >
          <Ionicons name="share-outline" size={18} color="#ffffff" />
          <Text className="text-white font-semibold ml-2">Share live-location link</Text>
        </TouchableOpacity>
      </View>

      <View className="px-6 pb-6">
        <TouchableOpacity
          onPress={onSafe}
          activeOpacity={0.85}
          className="rounded-2xl py-5 items-center"
          style={{ backgroundColor: colors.success[500] }}
        >
          <Text className="text-white text-lg font-extrabold">{"I'M SAFE — RESOLVE"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
