'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    setLoading(true);
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) setError(err.message);
    else setError('Check your email!');
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    else router.push('/');
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1e293b, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px' }}>
      <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '30px' }}>⚡ Monte OS</h1>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '6px', border: 'none', background: '#374151', color: 'white' }} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: 'none', background: '#374151', color: 'white' }} />
        {error && <p style={{ color: '#fbbf24', marginBottom: '12px' }}>{error}</p>}
        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '12px', background: '#fbbf24', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' }}>{loading ? 'Loading...' : 'Login'}</button>
        <button onClick={handleSignUp} disabled={loading} style={{ width: '100%', padding: '12px', background: '#06b6d4', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Loading...' : 'Sign Up'}</button>
      </div>
    </div>
  );
}
