import { supabase } from "../supabaseClient";

export async function getMyClientId() {
  // Get the currently authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If there's no user, we can't find a client ID
  if (!user) throw new Error("Not logged in");

  // Query the 'users' table to get the client_id for the user
  const { data, error } = await supabase
    .from("users")
    .select("client_id")
    .eq("auth_user_id", user.id)
    .single(); // Use .single() to expect just one row

  if (error) {
    console.error("Error fetching client ID:", error);
    throw error;
  }

  // Return the client_id
  return data.client_id;
}
