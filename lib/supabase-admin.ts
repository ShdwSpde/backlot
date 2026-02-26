import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy-initialized server-side Supabase client
// Uses service role key when available, falls back to anon key
// NEVER import this in client components
let _client: SupabaseClient | null = null;

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_client) {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NODE_ENV === "production") {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is required in production");
      }
      const url =
        (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co").trim();
      const key =
        (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "placeholder").trim();
      _client = createClient(url, key, { auth: { persistSession: false } });
    }
    return (_client as unknown as Record<string, unknown>)[prop as string];
  },
});
