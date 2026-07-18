// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import type { Database } from "./database.types";

WebBrowser.maybeCompleteAuthSession(); // Required for web redirect handling

// Use configuration from app.json/Constants if available, otherwise fallback to process.env
const supabaseUrl: string | undefined =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey: string | undefined =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// Lazy initialization - only create client when accessed on client-side
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabaseClient = () => {
  // Check if we're in a client environment
  if (typeof window === "undefined" && typeof navigator === "undefined") {
    console.warn(
      "[Supabase] Attempting to access Supabase client in server environment"
    );
    return null;
  }

  // Create client only once
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      });
      console.log("[Supabase] Client initialized successfully");
    } catch (err) {
      console.error("[Supabase] Failed to initialize client:", err);
      return null;
    }
  }

  return supabaseInstance;
};

// Export a getter for backward compatibility
export const supabase = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      console.warn("[Supabase] Client not available, returning null");
      return null;
    }
    return (client as any)[prop];
  },
});

/**
 * Generate the redirect URL for magic link authentication
 * Uses deep linking scheme to return to the app on mobile
 * Uses actual web URL on web platform
 */
export const getEmailRedirectUrl = () => {
  // On web, use the current window location
  if (Platform.OS === "web") {
    const webUrl = typeof window !== "undefined" 
      ? `${window.location.origin}/auth-callback`
      : "http://localhost:8081/auth-callback";
    console.log("[Supabase] Generated redirect URL (web):", webUrl);
    return webUrl;
  }
  
  // On mobile, use deep linking
  const deepLinkUrl = Linking.createURL("auth-callback");
  console.log("[Supabase] Generated redirect URL (mobile):", deepLinkUrl);
  return deepLinkUrl;
};

/**
 * Sign in user with email OTP (magic link)
 */
export const signInWithEmail = async (email: string) => {
  try {
    const emailRedirectTo = getEmailRedirectUrl();
    console.log("[Supabase] Signing in with email:", email);
    console.log("[Supabase] Redirect URL:", emailRedirectTo);

    const result = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
      },
    });

    if (result.error) {
      console.error("[Supabase] Sign in error:", result.error);
      return result;
    }

    console.log("[Supabase] OTP sent successfully");
    return result;
  } catch (err) {
    console.error("[Supabase] Unexpected sign in error:", err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
};

/**
 * Sign in with Google OAuth (for TENANT role)
 * Uses WebBrowser for a stable authentication flow on mobile
 * Uses native browser redirect on web
 */
export const signInWithGoogle = async (): Promise<{
  data: any;
  error: any;
}> => {
  try {
    // Determine the redirect URL based on platform
    let redirectTo: string;
    
    if (Platform.OS === "web") {
      // On web, use the current window location
      redirectTo = typeof window !== "undefined"
        ? `${window.location.origin}/auth-callback`
        : "http://localhost:8081/auth-callback";
    } else {
      // On mobile, use deep linking
      redirectTo = makeRedirectUri({
        scheme: "womensafetyai",
        path: "auth-callback",
      });
    }

    console.log("🚀 Google Sign-in Redirect URL:", redirectTo);

    // On web, let Supabase handle the redirect natively
    if (Platform.OS === "web") {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          // Don't skip browser redirect on web - let Supabase handle it
        },
      });

      if (error) {
        console.error("[Supabase] Google OAuth init error:", error);
        return { data: null, error };
      }

      // On web, Supabase will redirect the browser automatically
      // The redirect will be handled by the URL detection in _layout.tsx
      return { data, error: null };
    }

    // On mobile, use WebBrowser for authentication
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true, // We will open the browser manually
      },
    });

    if (error) {
      console.error("[Supabase] Google OAuth init error:", error);
      return { data: null, error };
    }

    if (data?.url) {
      // Open the browser for authentication
      console.log("[Supabase] Opening auth session...");
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      console.log("[Supabase] Auth session result:", result.type);

      if (result.type === "success" && result.url) {
        // Handle the redirect URL containing the tokens
        // This is a backup in case the deep link listener in _layout.tsx didn't catch it
        // (common on Android depending on launch mode)
        console.log("[Supabase] Auth session success, processing URL...");
        return await handleSupabaseUrl(result.url);
      } else if (result.type === "dismiss") {
        return { data: null, error: "User cancelled authentication" };
      }
    }

    return { data, error: null };
  } catch (err) {
    console.error("[Supabase] Google Sign-up Exception:", err);
    return { data: null, error: err };
  }
};

/**
 * Verify OTP code
 */
export const verifyOtp = async (
  email: string,
  token: string
): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  return { data, error };
};

/**
 * Handle Supabase authentication URLs from deep links
 * This is called when the user taps the magic link from email
 */
export const handleSupabaseUrl = async (
  url: string
): Promise<{ data: any; error: any }> => {
  console.log("[Supabase] handleSupabaseUrl called with:", url);

  try {
    // 1. Unwrap Google's proxy URL if present
    let cleanUrl = url;
    if (url.includes("google.com/url")) {
      const params = new URLSearchParams(url.split("?")[1]);
      const decodedUrl = decodeURIComponent(params.get("q") || "");
      if (decodedUrl) {
        cleanUrl = decodedUrl;
        console.log("[Supabase] Unwrapped Google URL:", cleanUrl);
      }
    }

    // 2. Parse the URL object
    let urlObj: URL;
    try {
      urlObj = new URL(cleanUrl);
    } catch {
      console.error("[Supabase] Failed to parse URL:", cleanUrl);
      return { data: null, error: "Invalid URL format" };
    }

    // 3. Extract tokens
    // Supabase can return tokens in the hash (#) OR query params (?), especially with PKCE flow
    // Prioritize hash, then query
    let accessToken = null;
    let refreshToken = null;
    let code = null;

    // Check hash first
    if (urlObj.hash) {
      const hashParams = new URLSearchParams(urlObj.hash.substring(1));
      accessToken = hashParams.get("access_token");
      refreshToken = hashParams.get("refresh_token");
      code = hashParams.get("code");
    }

    // Fallback to search params if not found in hash
    if (!accessToken && !refreshToken && !code) {
      const searchParams = urlObj.searchParams;
      accessToken = searchParams.get("access_token");
      refreshToken = searchParams.get("refresh_token");
      code = searchParams.get("code");
    }

    console.log("[Supabase] Extracted auth data:", {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasCode: !!code,
    });

    // 4. Handle OAuth Code Exchange (PKCE flow)
    if (code) {
      console.log("[Supabase] Exchanging auth code for session...");
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("[Supabase] Failed to exchange code:", error.message);
        return { data: null, error: error.message };
      }
      if (data?.user) {
        console.log(
          "[Supabase] Session successfully set via code exchange:",
          data.user.id
        );
        return { data, error: null };
      }
    }

    // 5. Handle Implicit/Magic Link Tokens
    if (accessToken && refreshToken) {
      console.log("[Supabase] Setting session with tokens...");
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        console.error("[Supabase] Failed to set session:", error.message);
        return { data: null, error: error.message };
      }
      console.log("[Supabase] Session successfully set from tokens");
      return { data, error: null };
    }

    console.log("[Supabase] No actionable auth tokens found in URL.");
    return { data: null, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Supabase] Unexpected error in handleSupabaseUrl:", message);
    return { data: null, error: message };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  console.log("[Supabase] Signing out...");
  return await supabase.auth.signOut();
};

/**
 * Get the current session
 */
export const getSession = async () => {
  return await supabase.auth.getSession();
};

export const getCurrentUserProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null, error: "Not authenticated" };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone")
    .eq("id", user.id)
    .single();

  if (error) {
    return { profile: null, error };
  }

  return { profile: profile, error: null };
};
