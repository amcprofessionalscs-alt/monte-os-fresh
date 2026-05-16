'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Habit = { id: number; name: string; current_reps: number; target_reps: number; category: string };

const COLORS: Record<string, string> = {
  AMC: '#fbbf24',
  OnlyFans: '#ec4899',
  Monte: '#06b6d4',
};

const GLOWS: Record<string, string> = {
  AMC: 'rgba(251,191,36,0.18)',
  OnlyFans: 'rgba(236,72,153,0.18)',
  Monte: 'rgba(6,182,212,0.18)',
};

const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';
const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const router = useRouter();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
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

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0f0a1a 50%,#0a0f1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@keyframes nsPulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}`}</style>
        <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'nsPulse 2s ease-in-out infinite', boxShadow: '0 0 60px rgba(251,191,36,0.4)' }}>
          <span style={{ fontFamily: 'serif', fontSize: '28px', fontWeight: 900, color: '#000' }}>NS</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0d0a18 40%,#0a0d1a 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes drift1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-10px,15px) scale(0.97)}}
        @keyframes drift2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-20px,30px) scale(1.03)}66%{transform:translate(25px,-10px) scale(0.98)}}
        @keyframes drift3{0%,100%{transform:translate(0,0)}50%{transform:translate(15px,25px)}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        .habit-card{opacity:0;animation:fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards}
        .habit-card:nth-child(1){animation-delay:0.1s}
        .habit-card:nth-child(2){animation-delay:0.25s}
        .habit-card:nth-child(3){animation-delay:0.4s}
        .rep-btn{transition:all 0.2s cubic-bezier(0.16,1,0.3,1)}
        .rep-btn:hover{transform:translateY(-2px);filter:brightness(1.15)}
        .rep-btn:active{transform:scale(0.97)}
        .ignite-link{display:block;transition:all 0.25s ease}
        .ignite-link:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(251,191,36,0.45)!important}
        .ignite-link:active{transform:scale(0.98)}
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,0.08) 0%,transparent 70%)', animation: 'drift1 9s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 70%)', animation: 'drift2 12s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', left: '30%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.05) 0%,transparent 70%)', animation: 'drift3 15s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '430px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ padding: '60px 0 28px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 10px' }}>{today}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: '33px', fontWeight: 800, margin: '0', lineHeight: 1.15, color: 'rgba(255,255,255,0.85)' }}>{greeting},</h1>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: '33px', fontWeight: 800, margin: 0, lineHeight: 1.15, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Demonte.</h1>
            </div>
            <button onClick={handleSignOut} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', color: 'rgba(255,255,255,0.25)', fontSize: '11px', fontFamily: FONT_MONO, padding: '7px 16px', cursor: 'pointer' }}>
              sign out
            </button>
          </div>
        </div>

        {/* Habits */}
        <div style={{ paddingTop: '8px' }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '20px 0 14px' }}>LAW OF 100</p>

          {habits.map((habit) => {
            const color = COLORS[habit.name] || '#fff';
            const glow = GLOWS[habit.name] || 'rgba(255,255,255,0.1)';
            const progress = Math.round((habit.current_reps / habit.target_reps) * 100);
            const remaining = habit.target_reps - habit.current_reps;

            return (
              <div key={habit.id} className="habit-card">
                <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}33`, borderRadius: '24px', padding: '20px', marginBottom: '12px', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden', boxShadow: `0 0 40px ${glow}, inset 0 1px 0 rgba(255,255,255,0.06)` }}>
                  {/* Top shimmer line */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg,transparent,${color}55,transparent)` }} />
                  {/* Corner glow orb */}
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: `radial-gradient(circle,${glow} 0%,transparent 70%)`, pointerEvents: 'none' }} />

                  {/* Apple Stocks layout: name left, big number right */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <p style={{ fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '18px', margin: '0 0 4px', color: '#fff' }}>{habit.name}</p>
                      <p style={{ fontFamily: FONT_MONO, fontSize: '11px', color: 'rgba(255,255,255,0.22)', margin: 0 }}>{remaining} reps to go</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: FONT_MONO, fontSize: '38px', fontWeight: 300, margin: 0, color, lineHeight: 1 }}>{habit.current_reps}</p>
                      <p style={{ fontFamily: FONT_MONO, fontSize: '11px', color: 'rgba(255,255,255,0.18)', margin: 0 }}>/ {habit.target_reps}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ background: 'rgba(255,255,255,0.06)', height: '3px', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div style={{ background: `linear-gradient(90deg,${color},${color}88)`, height: '100%', width: `${progress}%`, borderRadius: '2px', transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 8px ${color}60` }} />
                  </div>

                  {/* BLK-style bold rep button */}
                  <button
                    onClick={() => handleAddRep(habit.id)}
                    className="rep-btn"
                    style={{ width: '100%', padding: '13px', background: `linear-gradient(135deg,${color}22,${color}0a)`, border: `1px solid ${color}44`, borderRadius: '14px', color, fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '13px', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  >
                    + Rep &nbsp; {progress}%
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '24px 0 60px' }}>
          <a
            href="/ignite"
            className="ignite-link"
            style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b,#d97706)', color: '#000', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '14px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center', borderRadius: '18px', boxShadow: '0 8px 32px rgba(251,191,36,0.3)', boxSizing: 'border-box' }}
          >
            IGNITE TODAY
          </a>
          <a href="/history" style={{ display: 'block', padding: '16px', color: 'rgba(255,255,255,0.18)', fontFamily: FONT_MONO, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center', marginTop: '8px' }}>
            VIEW IGNITION LOG
          </a>
        </div>
      </div>
    </div>
  );
}
