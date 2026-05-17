import { createClient } from '@supabase/supabase-js';

// Fallback to placeholder values at build time so static prerendering
// doesn't throw "supabaseUrl is required". Real values come from env vars at runtime.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(url, key);
