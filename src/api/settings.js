// src/api/settings.js
import { supabase } from "../supabaseClient";

// Get the current user's client_id
async function getMyClientId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const { data, error } = await supabase
    .from("users")
    .select("client_id")
    .eq("auth_user_id", user.id)
    .single();
  if (error) throw error;
  return data.client_id;
}

// Ensure a settings row exists for this client; if not, create with defaults
async function ensureSettingsRow(clientId) {
  const { data, error } = await supabase
    .from("client_settings")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const defaults = {
      client_id: clientId,
      abandonment_timeout_minutes: 45,
      attribution_window_days: 7,

      // new columns (see Section 2 below)
      report_frequency: "monthly",
      include_charts: true,
      report_email: "",
      sender_email: "",
      sender_name: "",
      reply_to_email: "",
    };
    const { error: insErr } = await supabase
      .from("client_settings")
      .insert(defaults);
    if (insErr) throw insErr;
    return defaults;
  }

  return data;
}

export async function readSettings() {
  const clientId = await getMyClientId();
  const row = await ensureSettingsRow(clientId);
  return {
    reportFrequency: row.report_frequency ?? "monthly",
    includeCharts: row.include_charts ?? true,
    reportEmail: row.report_email ?? "",
    senderEmail: row.sender_email ?? "",
    senderName: row.sender_name ?? "",
    replyToEmail: row.reply_to_email ?? "",
  };
}

export async function updateSettings(patch) {
  const clientId = await getMyClientId();
  // Map React field names → DB column names
  const mapped = {
    ...(patch.reportFrequency !== undefined && {
      report_frequency: patch.reportFrequency,
    }),
    ...(patch.includeCharts !== undefined && {
      include_charts: patch.includeCharts,
    }),
    ...(patch.reportEmail !== undefined && { report_email: patch.reportEmail }),
    ...(patch.senderEmail !== undefined && { sender_email: patch.senderEmail }),
    ...(patch.senderName !== undefined && { sender_name: patch.senderName }),
    ...(patch.replyToEmail !== undefined && {
      reply_to_email: patch.replyToEmail,
    }),
  };
  const { error } = await supabase
    .from("client_settings")
    .update(mapped)
    .eq("client_id", clientId);
  if (error) throw error;
}
