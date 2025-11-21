import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lazy initialization to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // During build, if env vars are missing, use placeholder
  if (!supabaseUrl || !supabaseAnonKey) {
    // Check if we're in build phase
    const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build" || 
                        process.env.NEXT_PHASE === "phase-development-build" ||
                        !process.env.VERCEL;
    
    if (isBuildPhase) {
      // Create a dummy client for build - it won't work but won't fail build
      // Use a valid Supabase URL format
      supabaseInstance = createClient(
        "https://xxxxx.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDEwMDAwMDAsImV4cCI6MTk1NjU3NjAwMH0.placeholder"
      );
      return supabaseInstance;
    }
    
    // Runtime - throw error if missing
    throw new Error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required");
  }

  // Normal case - use real env vars
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Export a getter function instead of the client directly
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  }
});

// Server-side Supabase client
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(url, key);
}

