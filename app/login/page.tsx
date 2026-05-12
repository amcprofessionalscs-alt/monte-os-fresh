'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) return alert('Enter your email.');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://monte-os-fresh-3mx85i65s-amcprofessionalscs-alts-projects.vercel.app'
      }
    });
    if (error) {
      alert('Error: ' + error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1e293b, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>?? Check Your Email</h1>
          <p style={{ fontSize: '18px', color: '#9ca3af' }}>Magic link sent to {email}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1e293b, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%', background: '#1f2937', padding: '30px', borderRadius: '12px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '8px' }}>? Monte OS</h1>
        <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '30px' }}>Enter your email to access the OS</p>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#fbbf24' }}>Email</label>
          <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', background: '#374151', color: 'white', fontSize: '16px', boxSizing: 'border-box' }} />
        </div>
        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '14px', background: '#fbbf24', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>
          {loading ? '? Sending...' : '?? Send Magic Link'}
        </button>
      </div>
    </div>
  );
}
