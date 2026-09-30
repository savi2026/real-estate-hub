import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileStatus, setProfileStatus] = useState("idle"); // idle | loading | done | error
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setProfileStatus("idle");
      return;
    }
    setProfileStatus("loading");
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
    fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setProfileStatus("done");
      })
      .catch((err) => {
        console.error("Failed to load profile:", err.message);
        setProfile(null);
        setProfileStatus("error");
      });
  }, [session]);

  async function signUp(email, password, details = {}) {
    return supabase.auth.signUp({ email, password, options: { data: details } });
  }

  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    await supabase.auth.signOut();
    sessionStorage.setItem("guest_continued", "true");
    window.location.href = "/";
  }

  return (
    <AuthContext.Provider value={{ session, profile, profileStatus, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}