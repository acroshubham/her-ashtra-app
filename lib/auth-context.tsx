// lib/auth-context.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getSupabaseClient } from "./supabase";
import { User, Session } from "@supabase/supabase-js";
import type { Profile } from "./database.types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  profileLoading: boolean;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const profileFetchSeq = useRef(0);

  const fetchProfileWithRetry = useCallback(
    async (userId: string, userMetadata?: any) => {
      const seq = ++profileFetchSeq.current;
      const supabase = getSupabaseClient();

      if (!supabase) {
        console.error("[AuthContext] Supabase client not available");
        setError("Auth service not available");
        setProfileLoading(false);
        return;
      }

      // Extended retry delays: initial fast retries, then longer waits
      const delaysMs = [0, 250, 500, 1000, 2000, 4000, 8000, 12000, 16000];

      const sleep = (ms: number) =>
        new Promise<void>((resolve) => setTimeout(resolve, ms));

      setProfileLoading(true);
      setError(null); // Clear any previous errors

      try {
        // First, try fetching with retries
        for (let attempt = 0; attempt < delaysMs.length; attempt++) {
          if (profileFetchSeq.current !== seq) return;
          if (attempt > 0) await sleep(delaysMs[attempt]);
          if (profileFetchSeq.current !== seq) return;

          console.log(
            `[AuthContext] Fetching profile (attempt ${attempt + 1}/${
              delaysMs.length
            }) for user:`,
            userId
          );

          const { data, error: fetchError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

          if (profileFetchSeq.current !== seq) return;

          if (fetchError) {
            console.error("[AuthContext] Profile fetch error:", fetchError);
            // Don't return on fetch error - continue retrying
            // Some errors might be transient (e.g., connection issues)
            if (attempt === delaysMs.length - 1) {
              // Only set error on final attempt
              setError(fetchError.message);
            }
            continue;
          }

          if (data) {
            console.log("[AuthContext] Profile loaded:", data.id);
            setProfile(data);
            setError(null);
            return;
          }
        }

        // Profile not found after all retries
        // The trigger should have created it by now, but let's try one more time with a longer delay
        console.warn(
          "[AuthContext] Profile not found after initial retries. Waiting a bit longer..."
        );
        await sleep(2000);

        // Final fetch attempt
        if (profileFetchSeq.current !== seq) return;

        const { data: finalData, error: finalError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (profileFetchSeq.current !== seq) return;

        if (finalError) {
          console.error("[AuthContext] Final profile fetch error:", finalError);
          setError(finalError.message);
          return;
        }

        if (finalData) {
          console.log(
            "[AuthContext] Profile found on final attempt:",
            finalData.id
          );
          setProfile(finalData);
          setError(null);
          return;
        }

        // Still not found - try to create it manually as fallback
        // RLS allows users to create their own profile row
        console.warn(
          "[AuthContext] Profile not found after all retries. Creating profile manually..."
        );

        // Extract full_name from user metadata (works for Google OAuth and Email signups)
        const fullName =
          userMetadata?.full_name ||
          userMetadata?.name ||
          (user?.email ? user.email.split("@")[0] : "User");

        const { data: createdProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            full_name: fullName,
          })
          .select()
          .single();

        if (profileFetchSeq.current !== seq) return;

        if (createError) {
          // If creation fails, try one more fetch in case trigger created it in the meantime
          console.log(
            "[AuthContext] Profile creation failed, trying one more fetch...",
            createError
          );
          await sleep(1000);

          if (profileFetchSeq.current !== seq) return;

          const { data: lastAttempt, error: lastError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

          if (lastError) {
            console.error("[AuthContext] Last profile fetch error:", lastError);
            setError(`Failed to create profile: ${createError.message}`);
            return;
          }

          if (lastAttempt) {
            console.log(
              "[AuthContext] Profile found after creation attempt:",
              lastAttempt.id
            );
            setProfile(lastAttempt);
            setError(null);
            return;
          }

          // If still not found, show error
          console.error(
            "[AuthContext] Profile creation failed and not found:",
            createError
          );
          setError(
            `Failed to create profile: ${createError.message}. Please try refreshing.`
          );
          return;
        }

        if (createdProfile) {
          console.log(
            "[AuthContext] Profile created successfully:",
            createdProfile.id
          );
          setProfile(createdProfile);
          setError(null);
          return;
        }

        console.warn(
          "[AuthContext] Profile creation succeeded but no data returned."
        );
        setError("Profile not available yet");
      } catch (err) {
        console.error("[AuthContext] Error fetching profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch profile"
        );
      } finally {
        if (profileFetchSeq.current === seq) {
          setProfileLoading(false);
        }
      }
      // We use a ref to track the current profile fetch execution sequence
      // This allows us to cancel stale fetches if the user changes or component unmounts
    },
    []
  ); // Empty dependency array - this function should be stable and not recreate

  useEffect(() => {
    let mounted = true;

    // Initialize auth state
    const initAuth = async () => {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          console.error("[AuthContext] Supabase not available during init");
          setError("Auth service unavailable");
          setLoading(false);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSession(session);
          setUser(session?.user || null);

          if (session?.user?.id) {
            void fetchProfileWithRetry(
              session.user.id,
              session.user.user_metadata
            );
          }
        }
      } catch (err) {
        console.error("[AuthContext] Init error:", err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Init failed");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Subscribe to auth state changes - THIS IS CRITICAL FOR MAGIC LINKS
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error("[AuthContext] Supabase not available for subscription");
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("[AuthContext] Auth state change event:", event);

      if (mounted) {
        const previousUser = user;
        const currentUser = currentSession?.user || null;

        setSession(currentSession);
        setUser(currentUser);
        setError(null);

        // Fetch profile on sign-in events
        if (
          (event === "SIGNED_IN" ||
            event === "USER_UPDATED" ||
            event === "INITIAL_SESSION") &&
          currentUser?.id
        ) {
          // Only fetch if user actually changed or it's a fresh sign in
          // This prevents loops if onAuthStateChange fires repeatedly for same session
          console.log(
            "[AuthContext] Fetching profile for user:",
            currentUser.id
          );
          void fetchProfileWithRetry(currentUser.id, currentUser.user_metadata);
        } else if (event === "SIGNED_OUT") {
          profileFetchSeq.current++;
          setProfile(null);
          setProfileLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []); // Remove fetchProfileWithRetry dependency!

  const refreshProfile = async () => {
    if (!user?.id) return;
    await fetchProfileWithRetry(user.id, user.user_metadata);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        profileLoading,
        loading,
        error,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
