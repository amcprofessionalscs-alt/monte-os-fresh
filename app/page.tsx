'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Habit = {
  id: number;
  name: string;
  current_reps: number;
  target_reps: number;
  category: string;
};

const COLORS: Record<string, string> = {
  AMC: '#fbbf24',
  OnlyFans: '#ec4899',
  Monte: '#06b6d4',
};

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const { data, error } = await supabase.from('habits').select('*').order('id');
      if (!error && data) setHabits(data);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleAddRep = async (id: number) => {
    const habit = habits.find(h => h.id === id);
    if (!habit || habit.current_reps >= habit.target_reps) return;
    const newReps = habit.current_reps + 1;
    setHabits(habits.map(h => h.id === id ? { ...h, current_reps: newReps } : h));
    await supabase.from('habits').update({ current_reps: newReps, updated_at: new Date().toISOString() }).eq('id', id);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1e293b, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <p style={{ fontSize: '24px' }}>? Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1e293b, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '48px', margin: 0 }}>? Monte OS</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a href="/ignite" style={{ padding: '8px 16px', background: '#fbbf24', color: '#000', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none' }}>?? Ignition</a>
            <button onClick={handleSignOut} style={{ padding: '8px 16px', background: '#374151', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>Sign Out</button>
          </div>
        </div>
        {habits.map(habit => {
          const color = COLORS[habit.name] || '#ffffff';
          const progress = Math.round((habit.current_reps / habit.target_reps) * 100);
          return (
            <div key={habit.id} style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <p style={{ color, fontWeight: 'bold', margin: 0 }}>{habit.name}</p>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{habit.current_reps} / {habit.target_reps}</p>
              </div>
              <div style={{ background: '#374151', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ background: color, height: '100%', width: progress + '%', transition: 'width 0.5s ease' }}></div>
              </div>
              <button onClick={() => handleAddRep(habit.id)} style={{ width: '100%', padding: '12px', background: color, color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>? +1 Rep ({progress}%)</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
