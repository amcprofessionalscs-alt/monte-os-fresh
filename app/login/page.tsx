'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'https://monte-os-fresh.vercel.app' }
    });
    if (error) { alert('Error: ' + error.message); } else { setSent(true); }
    setLoading(false);
  };

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px' }}>
        <link href='https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400;500&display=swap' rel='stylesheet' />
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#fbbf24' }}>Check your inbox</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>A secure access link was sent to<br /><span style={{ color: '#e5e7eb' }}>{email}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <link href='https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400;500&display=swap' rel='stylesheet' />
      <style>{'.login-btn { transition: all 0.2s ease; } .login-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(251,191,36,0.3); } .login-input:focus { outline: none; border-color: #fbbf24 !important; }'}</style>
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: '420px', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', boxShadow: '0 0 40px rgba(251,191,36,0.4)' }}>NS</div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '32px', fontWeight: '800', margin: '0 0 8px', background: 'linear-gradient(135deg, #fff 0%, #9ca3af 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Next Step OS</h1>
          <p style={{ color: '#4b5563', fontSize: '14px', fontFamily: 'DM Mono, monospace', margin: 0 }}>Your personal operating system</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', backdropFilter: 'blur(20px)' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontFamily: 'DM Mono, monospace', color: '#6b7280', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Access Email</label>
          <input className='login-input' type='email' placeholder='you@email.com' value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'white', fontSize: '15px', fontFamily: 'DM Mono, monospace', boxSizing: 'border-box', marginBottom: '16px' }} />
          <button className='login-btn' onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '14px', background: '#fbbf24', color: '#000', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '14px', fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em' }}>
            {loading ? 'SENDING...' : 'SEND ACCESS LINK'}
          </button>
        </div>
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', fontFamily: 'DM Mono, monospace', color: '#374151' }}>Secure magic link - no password required</p>
      </div>
    </div>
  );
}