'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';
const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';

const STYLES = `
  @keyframes drift1 {
    0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-52%) scale(1.06)}
  }
  @keyframes nsPulse {
    0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)}
  }
  @keyframes fadeUp {
    from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)}
  }
  @keyframes shimmer {
    0%{background-position:-200% center} 100%{background-position:200% center}
  }
  .grain {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 256px 256px;
  }
  .card-glass {
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }
  .login-wrap { opacity: 0; animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s forwards; }
  .login-input { transition: border-color 0.2s ease; }
  .login-input:focus { outline: none; border-color: rgba(251,191,36,0.5) !important; }
  .send-btn {
    background: linear-gradient(90deg,#d97706,#fbbf24,#fef9ec,#fbbf24,#d97706);
    background-size: 300% auto;
    animation: shimmer 3.2s linear infinite;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .send-btn:hover  { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(251,191,36,0.45); }
  .send-btn:active { transform: scale(0.98); }
  .send-btn:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'https://monte-os-fresh.vercel.app/auth/callback' },
    });
    if (error) { alert('Error: ' + error.message); } else { setSent(true); }
    setLoading(false);
  };

  /* ── Sent confirmation ──────────────────────────────────────── */
  if (sent) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0d0a18 40%,#0a0d1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px' }}>
        <style>{`@keyframes nsPulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ textAlign: 'center', maxWidth: '360px', opacity: 0, animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s forwards' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'nsPulse 2s ease-in-out infinite', boxShadow: '0 0 40px rgba(251,191,36,0.4)', fontSize: '24px' }}>
            ⚡
          </div>
          <h2 style={{ fontFamily: FONT_SYNE, fontSize: '24px', fontWeight: 800, margin: '0 0 10px', color: '#fff' }}>Check your inbox</h2>
          <p style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.7, margin: 0 }}>
            Secure link sent to<br />
            <span style={{ color: 'rgba(255,255,255,0.65)' }}>{email}</span>
          </p>
        </div>
      </div>
    );
  }

  /* ── Login form ─────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0d0a18 40%,#0a0d1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <style>{STYLES}</style>

      {/* Grain */}
      <div className="grain" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.045, pointerEvents: 'none', zIndex: 0 }} />

      {/* Center gold orb */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,0.07) 0%,transparent 70%)', animation: 'drift1 10s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      <div className="login-wrap" style={{ maxWidth: '390px', width: '100%', position: 'relative', zIndex: 1 }}>

        {/* NS logo + wordmark */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '68px', height: '68px', borderRadius: '20px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 50px rgba(251,191,36,0.35)' }}>
            <span style={{ fontFamily: 'serif', fontSize: '26px', fontWeight: 900, color: '#000' }}>NS</span>
          </div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: '30px', fontWeight: 800, margin: '0 0 6px', background: 'linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.55) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Next Step OS</h1>
          <p style={{ fontFamily: FONT_MONO, fontSize: '11px', color: 'rgba(255,255,255,0.2)', margin: 0, letterSpacing: '0.12em', textTransform: 'uppercase' }}>your personal operating system</p>
        </div>

        {/* Glass card */}
        <div
          className="card-glass"
          style={{
            background: 'linear-gradient(135deg,rgba(255,255,255,0.048) 0%,rgba(255,255,255,0.018) 100%)',
            borderRadius: '22px',
            padding: '28px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.055), inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 48px rgba(0,0,0,0.4)',
          }}
        >
          {/* Top border */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent 0%,rgba(251,191,36,0.7) 30%,rgba(251,191,36,0.95) 50%,rgba(251,191,36,0.7) 70%,transparent 100%)' }} />

          <label style={{ display: 'block', marginBottom: '8px', fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
            Access Email
          </label>
          <input
            className="login-input"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '13px 15px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '13px', color: 'white', fontSize: '14px', fontFamily: FONT_MONO, boxSizing: 'border-box', marginBottom: '14px' }}
          />
          <button
            className="send-btn"
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '15px', color: '#000', border: 'none', borderRadius: '13px', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '13px', letterSpacing: '0.12em', cursor: 'pointer', textTransform: 'uppercase' }}
          >
            {loading ? 'Sending...' : 'Send Access Link'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.12)', letterSpacing: '0.08em' }}>
          Secure magic link — no password required
        </p>
      </div>
    </div>
  );
}
