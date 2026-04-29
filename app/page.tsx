'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [habits, setHabits] = useState([
    { id: 1, n: 'AMC', r: 47, t: 100, c: '#fbbf24' },
    { id: 2, n: 'OnlyFans', r: 18, t: 100, c: '#ec4899' },
    { id: 3, n: 'Monte', r: 65, t: 100, c: '#06b6d4' }
  ]);

  useEffect(() => {
    loadFromSupabase();
  }, []);

  const loadFromSupabase = async () => {
    try {
      const { data } = await supabase.from('habits').select('*').limit(3);
      if (data && data.length > 0) {
        setHabits(data.map(h => ({ id: h.id, n: h.name, r: h.current_reps, t: h.target_reps, c: ['#fbbf24', '#ec4899', '#06b6d4'][data.indexOf(h) % 3] })));
      }
    } catch (e) {
      console.log('Demo mode');
    }
  };

  const addRep = async (id) => {
    setHabits(habits.map(h => h.id === id && h.r < h.t ? { ...h, r: h.r + 1 } : h));
    try {
      await supabase.from('habits').update({ current_reps: habits.find(h => h.id === id).r + 1 }).eq('id', id);
    } catch (e) {
      console.log('Local only');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1e293b, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '500px', width: '100%' }}>
        <h1 style={{ textAlign: 'center', fontSize: '48px', marginBottom: '40px' }}>⚡ Monte OS</h1>
        {habits.map(h => {
          const p = h.r / h.t * 100;
          return (
            <div key={h.id} style={{ background: '#1f2937', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <p style={{ color: h.c, fontWeight: 'bold', margin: 0 }}>{h.n}: {h.r}/{h.t}</p>
              </div>
              <div style={{ background: '#374151', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ background: h.c, height: '100%', width: p + '%', transition: 'width 0.5s' }}></div>
              </div>
              <button onClick={() => addRep(h.id)} style={{ width: '100%', padding: '12px', background: h.c, color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+1 Rep ({Math.round(p)}%)</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}