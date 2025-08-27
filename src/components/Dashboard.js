// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthProvider"; // adjust path if needed

const APPSMITH_URL =
  "https://recoverly.appsmith.com/app/recoverly-dashboard/page1-68a08c385a6a5a7e1f74ec17?embed=true";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [src, setSrc] = useState("");

  useEffect(() => {
    async function fetchClientId() {
      if (!user) return; // no logged-in user yet

      // 1) fetch client_id for this auth user
      const { data: profile, error } = await supabase
        .from("users")
        .select("client_id")
        .eq("auth_user_id", user.id)
        .single();

      if (error || !profile?.client_id) {
        console.error("Could not fetch client_id", error);
        return;
      }

      // 2) build iframe URL with client_id
      const url = `${APPSMITH_URL}&client_id=${encodeURIComponent(
        profile.client_id
      )}&t=${Date.now()}`;
      setSrc(url);
    }

    fetchClientId();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please log in to see your dashboard.</div>;

  return (
    <div style={{ height: "100vh" }}>
      {src ? (
        <iframe
          src={src}
          title="Recoverly Dashboard"
          style={{ width: "100%", height: "100%", border: "0" }}
          allow="fullscreen"
        />
      ) : (
        <div>Loading dashboard…</div>
      )}
    </div>
  );
}
