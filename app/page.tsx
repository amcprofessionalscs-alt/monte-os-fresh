'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([
    { id: 1, name: 'AMC', reps: 47, target: 100, color: '#fbbf24' },
    { id: 2, name: 'OnlyFans', reps: 18, target: 100, color: '#ec4899' },
    { id: 3, name: 'Monte', reps: 65, target: 100, color: '#06b6d4' }
  ]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
    } else {
      setUser(user);
      loadFromDatabase(user.id);
    }
    setLoading(false);
  };

  const loadFromDatabase = async (userId: string) => {
    try {
      const { data } = await supabase.from('habits').select('*').eq('user_id', userId);
      if (data && data.length > 0) {
        const mapped = data.map((h, i) => ({
          id: h.id,
          name: h.name,
          reps: h.current_reps,
          target: h.target_reps,
          color: ['#fbbf24', '#ec4899', '#06b6d4'][i % 3]
        }));
        setHabits(mapped);
      }
    } catch (e) {
      console.log('Using demo data');
    }
  };

  const handleAddRep = async (id: number) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const newReps = Math.min(habit.reps + 1, habit.target);

    try {
      await supabase.from('habits').update({ current_reps: newReps }).eq('id', id);
    } catch (e) {
      console.log('Offline mode');
    }

    setHabits(
      habits.map(h =>
        h.id === id && h.reps < h.target
          ? { ...h, reps: h.reps + 1 }
          : h
      )
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1e293b, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '48px', margin: 0 }}>⚡ Monte OS</h1>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#ec4899', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Logout</button>
        </div>

        {habits.map(habit => {
          const progress = Math.round((habit.reps / habit.target) * 100);
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
    setError('');
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) {
      setError(err.message);
    } else {
      setError('Check your email to confirm!');
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
    } else {
      router.push('/');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1e293b, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px' }}>
      <div style={{ background: '#1f2937', padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', fontSize: '32px', marginBottom: '30px' }}>⚡ Monte OS</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '6px', border: 'none', background: '#374151', color: 'white' }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: 'none', background: '#374151', color: 'white' }}
        />

        {error && <p style={{ color: '#fbbf24', marginBottom: '12px' }}>{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#fbbf24', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' }}
        >
          {loading ? 'Loading...' : 'Login'}
        </button>

        <button
          onClick={handleSignUp}
          disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#06b6d4', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
}