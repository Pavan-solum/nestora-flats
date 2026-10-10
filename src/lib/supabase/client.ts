import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BUCKET, EXTRAS_PATH } from "./map";
import { supabaseAnonKey, supabaseUrl } from "./env";

let browserClient: SupabaseClient | null = null;

export { supabaseUrl };

export function getSupabaseBrowser() {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient(supabaseUrl(), supabaseAnonKey());
  return browserClient;
}

export function extrasPublicUrl() {
  return `${supabaseUrl()}/storage/v1/object/public/${BUCKET}/${EXTRAS_PATH}`;
}
