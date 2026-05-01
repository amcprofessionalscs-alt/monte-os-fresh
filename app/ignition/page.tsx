'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function IgnitionPage() {
  const [energy, setEnergy] = useState(5);
  const [focus, setFocus] = useState(5);
  const [mood, setMood] = useState('neutral');
  const [goal, setGoal] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await supabase.from('ignitions').insert({
        energy,
        focus,
        mood,
        goal
      });
    } catch (e) {
      console.log('Error saving:', e);
    }
    setSubmitted(true);
    setTimeout(() => router.push('/'), 2000);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1e293b, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>⚡ Ignition Set</h1>
          <p style={{ fontSize: '18px', color: '#9ca3af' }}>Ready to execute.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1e293b, #000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '500px', width: '100%', background: '#1f2937', padding: '30px', borderRadius: '12px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '36px', marginBottom: '30px' }}>⚡ Daily Ignition</h1>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', color: '#fbbf24' }}>Energy Level: {energy}/10</label>
          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', color: '#06b6d4' }}>Focus Level: {focus}/10</label>
          <input
            type="range"
            min="1"
            max="10"
            value={focus}
            onChange={(e) => setFocus(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', color: '#ec4899' }}>Mood</label>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-around' }}>
            {['fired', 'neutral', 'tired'].map(m => (
              <button
                key={m}
                onClick={() => setMood(m)}
                style={{
                  padding: '12px 16px',
                  background: mood === m ? '#fbbf24' : '#374151',
                  color: mood === m ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', color: '#06b6d4' }}>Today's Goal</label>
          <textarea
            placeholder="What's the 1 thing you need to execute today?"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: 'none', background: '#374151', color: 'white', fontFamily: 'inherit', fontSize: '14px', minHeight: '100px', resize: 'none' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: '#fbbf24', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
        >
          {loading ? '🔄 Saving...' : '🚀 Ignite'}
        </button>
      </div>
    </div>
  );
}