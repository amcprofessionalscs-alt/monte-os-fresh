import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// In native runtimes we handle the auth callback ourselves via deep link,
// so we disable automatic session detection from the URL.
const isNativeRuntime =
  typeof window !== 'undefined' &&
  (window.location.protocol === 'capacitor:' ||
    (typeof navigator !== 'undefined' && navigator.userAgent.includes('Electron')));

export const supabase = createClient(url, key, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: !isNativeRuntime,
  },
});
