import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!url) throw new Error("Missing REACT_APP_SUPABASE_URL");
if (!anon) throw new Error("Missing REACT_APP_SUPABASE_ANON_KEY");

export const supabase = createClient(url, anon);
