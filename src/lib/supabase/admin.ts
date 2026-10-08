import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./client";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  adminClient = createClient(supabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}
