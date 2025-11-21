import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only validate during runtime (browser or server runtime), not build time
const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" || 
                   process.env.NEXT_PHASE === "phase-development-build" ||
                   (!process.env.VERCEL && !process.env.NEXT_PUBLIC_SUPABASE_URL);

// Create Supabase client with fallback only if env vars are missing during build
let supabase: SupabaseClient;

if (isBuildTime && (!supabaseUrl || !supabaseAnonKey)) {
  // During build, create a minimal client with a valid-looking URL to pass validation
  // This won't work at runtime, but allows the build to complete
  supabase = createClient(
    "https://placeholder-project-id.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyLXByb2plY3QtaWQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTAwMDAwMCwiZXhwIjoxOTU2NTc2MDAwfQ.placeholder"
  );
} else if (!supabaseUrl || !supabaseAnonKey) {
  // Runtime validation - throw error if missing
  if (typeof window !== "undefined" || process.env.VERCEL) {
    throw new Error("Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required");
  }
  // Fallback for local development
  supabase = createClient(
    "https://placeholder-project-id.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyLXByb2plY3QtaWQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTAwMDAwMCwiZXhwIjoxOTU2NTc2MDAwfQ.placeholder"
  );
} else {
  // Normal case - use real env vars
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

// Server-side Supabase client
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error("Missing Supabase environment variables");
  }
  
  return createClient(url, key);
}

