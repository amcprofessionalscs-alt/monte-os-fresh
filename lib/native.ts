// Runtime detection — evaluated only in the browser
const _proto = typeof window !== 'undefined' ? window.location.protocol : '';
const _ua    = typeof navigator !== 'undefined' ? navigator.userAgent : '';

export const isCapacitor = _proto === 'capacitor:';
export const isElectron  = _ua.includes('Electron');
export const isNative    = isCapacitor || isElectron;

export const VERCEL_URL = 'https://monte-os-fresh.vercel.app';

// Auth redirect URL sent to Supabase in signInWithOtp
export const AUTH_REDIRECT = (() => {
  if (typeof window === 'undefined') return `${VERCEL_URL}/auth/callback`;
  if (isCapacitor) return 'com.nextstep.os://auth/callback';
  if (isElectron)  return 'nextstep://auth/callback';
  return `${window.location.origin}/auth/callback`;
})();
