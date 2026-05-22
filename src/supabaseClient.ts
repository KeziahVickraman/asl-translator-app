import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http");

let client: any = null;

if (isConfigured) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.error("Failed to initialize Supabase client:", err);
  }
}

// Fallback Mock Client to prevent blank screens/crashes in environments where Supabase is not configured
if (!client) {
  console.warn("WARNING: Supabase credentials are missing or invalid inside the current environment. Defaulting to elegant local mock/store fallback client.");

  const createMockStoreQuery = () => {
    const query: any = {
      order: () => query,
      limit: () => Promise.resolve({ data: null, error: new Error("Supabase is not configured") }),
      select: () => Promise.resolve({ data: null, error: new Error("Supabase is not configured") })
    };
    query.then = (onfulfilled: any) => Promise.resolve({ data: null, error: new Error("Supabase is not configured") }).then(onfulfilled);
    return query;
  };

  client = {
    from: () => ({
      select: () => createMockStoreQuery(),
      insert: () => ({
        select: () => Promise.resolve({ data: null, error: new Error("Supabase is not configured") })
      })
    }),
    channel: () => ({
      on: function() { return this; },
      subscribe: function() { return this; }
    }),
    removeChannel: () => {}
  };
}

export const supabase = client;
