'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [user, setUser] = useState<any>(null);
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
    }
    setLoading(false);
  };

  const handleAddRep = async (id: number) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    const newReps = Math.min(habit.reps + 1, habit.target);
    try {
      await supabase.from('habits').update({ current_reps: newReps }).eq('id', id);
    } catch (e) {
      console.log('Offline');
    }
    setHabits(habits.map(h => h.id === id && h.reps < h.target ? { ...h, reps: h.reps + 1 } : h));
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
          return (
            <div key={habit.id} style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <p style={{ color: habit.color, fontWeight: 'bold', margin: 0 }}>{habit.name}</p>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{habit.reps} / {habit.target}</p>
              </div>
              <div style={{ background: '#374151', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ background: habit.color, height: '100%', width: progress + '%', transition: 'width 0.5s ease' }}></div>
              </div>
              <button onClick={() => handleAddRep(habit.id)} style={{ width: '100%', padding: '12px', background: habit.color, color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>⚡ +1 Rep ({progress}%)</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
