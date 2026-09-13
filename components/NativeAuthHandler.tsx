'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

declare global {
  interface Window {
    electronAPI?: { onDeepLink: (cb: (url: string) => void) => void };
  }
}

// Handles auth deep links from Electron (nextstep://) and Capacitor (com.nextstep.os://)
export function NativeAuthHandler() {
  const router = useRouter();

  useEffect(() => {
    async function handle(url: string) {
      try {
        const { searchParams } = new URL(url);
        const code = searchParams.get('code');
        if (!code) return;
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) router.push('/');
      } catch {
        // malformed URL — ignore
      }
    }

    // Electron
    window.electronAPI?.onDeepLink(handle);

    // Capacitor — dynamic import so it doesn't break the web bundle
    if (window.location.protocol === 'capacitor:') {
      import('@capacitor/app')
        .then(({ App }) => App.addListener('appUrlOpen', ({ url }) => handle(url)))
        .catch(() => {});
    }
  }, [router]);

  return null;
}
