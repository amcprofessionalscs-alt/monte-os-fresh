'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Habit = { id: number; name: string; current_reps: number; target_reps: number; category: string };
type Brain = { greeting: string; analysis: string; roadmap: string[]; momentum: string };

const COLORS: Record<string, string> = {
  AMC: '#fbbf24',
  OnlyFans: '#ec4899',
  Monte: '#06b6d4',
};

const GLOWS: Record<string, string> = {
  AMC: 'rgba(251,191,36,0.22)',
  OnlyFans: 'rgba(236,72,153,0.22)',
  Monte: 'rgba(6,182,212,0.22)',
};

const MOMENTUM_COLOR: Record<string, string> = {
  'LOCKED IN':    '#fbbf24',
  'BUILDING':     '#06b6d4',
  'DRIFTING':     '#ec4899',
  'RESET NEEDED': 'rgba(255,120,120,0.9)',
};

const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';
const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';

const STYLES = `
  @keyframes drift1 {
    0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-10px,15px) scale(0.97)}
  }
  @keyframes drift2 {
    0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-20px,30px) scale(1.03)} 66%{transform:translate(25px,-10px) scale(0.98)}
  }
  @keyframes drift3 {
    0%,100%{transform:translate(0,0)} 50%{transform:translate(15px,25px)}
  }
  @keyframes nsPulse {
    0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)}
  }
  @keyframes fadeSlideUp {
    from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)}
  }
  @keyframes shimmer {
    0%{background-position:-200% center} 100%{background-position:200% center}
  }
  @keyframes skeletonPulse {
    0%,100%{opacity:0.3} 50%{opacity:0.65}
  }
  @keyframes brainFadeIn {
    from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)}
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

  /* Skeleton lines */
  .skel {
    background: rgba(255,255,255,0.06);
    border-radius: 6px;
    animation: skeletonPulse 1.6s ease-in-out infinite;
  }

  /* Brain card entrance */
  .brain-card { animation: brainFadeIn 0.65s cubic-bezier(0.16,1,0.3,1) forwards; }

  /* Habit cards */
  .habit-card { opacity:0; animation:fadeSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
  .habit-card:nth-child(1) { animation-delay:0.12s; }
  .habit-card:nth-child(2) { animation-delay:0.26s; }
  .habit-card:nth-child(3) { animation-delay:0.40s; }

  .rep-btn {
    min-height: 48px;
    transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
    -webkit-tap-highlight-color: transparent;
  }
  .rep-btn:active { transform:scale(0.97); filter:brightness(0.9); }

  .ignite-link {
    background: linear-gradient(90deg,#d97706,#fbbf24,#fef9ec,#fbbf24,#d97706);
    background-size: 300% auto;
    animation: shimmer 3.2s linear infinite;
    -webkit-tap-highlight-color: transparent;
    min-height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ignite-link:active { opacity:0.88; }

  .sticky-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 20;
    padding-top: 24px;
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    background: linear-gradient(to top, rgba(10,13,26,1) 0%, rgba(10,13,26,0.96) 55%, transparent 100%);
  }

  .signout-btn {
    min-height: 36px;
    display: flex;
    align-items: center;
    -webkit-tap-highlight-color: transparent;
  }
`;

// ── Brain skeleton ──────────────────────────────────────────────────
function BrainSkeleton() {
  return (
    <div
      className="card-glass"
      style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.015) 100%)', borderRadius: '22px', padding: '18px', marginBottom: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(251,191,36,0.3),transparent)' }} />
      {/* label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div className="skel" style={{ width: '100px', height: '8px' }} />
        <div className="skel" style={{ width: '72px', height: '22px', borderRadius: '11px' }} />
      </div>
      {/* greeting */}
      <div className="skel" style={{ width: '85%', height: '14px', marginBottom: '10px' }} />
      {/* analysis */}
      <div className="skel" style={{ width: '100%', height: '10px', marginBottom: '6px' }} />
      <div className="skel" style={{ width: '90%', height: '10px', marginBottom: '6px' }} />
      <div className="skel" style={{ width: '70%', height: '10px', marginBottom: '14px' }} />
      {/* roadmap */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="skel" style={{ width: '95%', height: '10px' }} />
        <div className="skel" style={{ width: '80%', height: '10px' }} />
        <div className="skel" style={{ width: '88%', height: '10px' }} />
      </div>
    </div>
  );
}

// ── Brain card ──────────────────────────────────────────────────────
function BrainCard({ brain }: { brain: Brain }) {
  const momentumColor = MOMENTUM_COLOR[brain.momentum] || 'rgba(255,255,255,0.4)';

  return (
    <div
      className="card-glass brain-card"
      style={{ background: 'linear-gradient(135deg,rgba(251,191,36,0.05) 0%,rgba(255,255,255,0.02) 100%)', borderRadius: '22px', padding: '18px', marginBottom: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(251,191,36,0.12), inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 48px rgba(251,191,36,0.08)' }}
    >
      {/* Top shimmer — gold */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent 0%,rgba(251,191,36,0.7) 30%,rgba(251,191,36,0.95) 50%,rgba(251,191,36,0.7) 70%,transparent 100%)' }} />
      {/* Corner radiance */}
      <div style={{ position: 'absolute', top: '-24px', right: '-24px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />

      {/* Label + momentum badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.22em', textTransform: 'uppercase', margin: 0 }}>Monte OS Brain</p>
        <div style={{ padding: '3px 10px', borderRadius: '20px', border: `1px solid ${momentumColor}44`, background: `${momentumColor}14` }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: '9px', color: momentumColor, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>{brain.momentum}</span>
        </div>
      </div>

      {/* Greeting */}
      <p style={{ fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '15px', color: '#fff', margin: '0 0 10px', lineHeight: 1.3 }}>{brain.greeting}</p>

      {/* Analysis */}
      <p style={{ fontFamily: FONT_MONO, fontSize: '11px', color: 'rgba(255,255,255,0.45)', margin: '0 0 14px', lineHeight: 1.65 }}>{brain.analysis}</p>

      {/* Gold divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg,rgba(251,191,36,0.3),transparent)', marginBottom: '12px' }} />

      {/* Roadmap */}
      <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 8px' }}>Today&apos;s Roadmap</p>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {brain.roadmap.map((task, i) => (
          <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: '10px', color: '#fbbf24', fontWeight: 500, lineHeight: 1.6, flexShrink: 0 }}>{i + 1}.</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{task}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Home ────────────────────────────────────────────────────────────
export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [displayCounts, setDisplayCounts] = useState<Record<number, number>>({});
  const [progressReady, setProgressReady] = useState(false);
  const [brain, setBrain] = useState<Brain | null>(null);
  const [brainLoading, setBrainLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      // Fire brain fetch in background — doesn't block habit render
      fetch('/api/brain')
        .then(r => (r.ok ? r.json() : null))
        .then((data: Brain | null) => { if (data) setBrain(data); })
        .catch(() => {})
        .finally(() => setBrainLoading(false));

      const { data, error } = await supabase.from('habits').select('*').order('id');

      if (!error && data) {
        setHabits(data);

        const zeros: Record<number, number> = {};
        data.forEach(h => { zeros[h.id] = 0; });
        setDisplayCounts(zeros);

        setTimeout(() => setProgressReady(true), 220);

        const DURATION = 1200;
        let startTime: number | null = null;
        const step = (now: number) => {
          if (startTime === null) startTime = now;
          const t = Math.min((now - startTime) / DURATION, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const updated: Record<number, number> = {};
          data.forEach(h => { updated[h.id] = Math.round(h.current_reps * eased); });
          setDisplayCounts(updated);
          if (t < 1) requestAnimationFrame(step);
        };
        setTimeout(() => requestAnimationFrame(step), 150);
      }

      setLoading(false);
    };
    init();
  }, [router]);

  const handleAddRep = async (id: number) => {
    const habit = habits.find(h => h.id === id);
    if (!habit || habit.current_reps >= habit.target_reps) return;
    const newReps = habit.current_reps + 1;
    setHabits(habits.map(h => h.id === id ? { ...h, current_reps: newReps } : h));
    setDisplayCounts(prev => ({ ...prev, [id]: newReps }));
    await supabase.from('habits').update({ current_reps: newReps, updated_at: new Date().toISOString() }).eq('id', id);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  /* ── Loading screen ── */
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

  /* ── Main ── */
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0d0a18 40%,#0a0d1a 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <style>{STYLES}</style>

      {/* Grain */}
      <div className="grain" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.045, pointerEvents: 'none', zIndex: 1 }} />

      {/* Orbs */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,0.09) 0%,transparent 70%)', animation: 'drift1 9s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.06) 0%,transparent 70%)', animation: 'drift2 12s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', left: '30%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.05) 0%,transparent 70%)', animation: 'drift3 15s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      {/* Scrollable content */}
      <div style={{ maxWidth: '390px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2, paddingBottom: '180px' }}>

        {/* Header */}
        <div style={{ padding: '56px 0 0' }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.18em', textTransform: 'uppercase', margin: '0 0 14px' }}>{today}</p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px' }}>
            <div>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: '30px', fontWeight: 800, margin: 0, lineHeight: 1.15, color: 'rgba(255,255,255,0.85)' }}>{greeting},</h1>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: '30px', fontWeight: 800, margin: 0, lineHeight: 1.15, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Demonte.</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="signout-btn"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', color: 'rgba(255,255,255,0.22)', fontSize: '10px', fontFamily: FONT_MONO, padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.08em' }}
            >
              sign out
            </button>
          </div>

          {/* Gold rule */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg,rgba(251,191,36,0.7) 0%,rgba(251,191,36,0.15) 60%,transparent 100%)', marginBottom: '24px' }} />
        </div>

        {/* ── Monte OS Brain ── */}
        {brainLoading && <BrainSkeleton />}
        {!brainLoading && brain && <BrainCard brain={brain} />}

        {/* ── Habits ── */}
        <div>
          <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.14)', letterSpacing: '0.28em', textTransform: 'uppercase', margin: '0 0 16px' }}>LAW OF 100</p>

          {habits.map((habit) => {
            const color = COLORS[habit.name] || '#fff';
            const glow  = GLOWS[habit.name]  || 'rgba(255,255,255,0.1)';
            const actualProgress = Math.round((habit.current_reps / habit.target_reps) * 100);
            const barWidth     = progressReady ? actualProgress : 0;
            const displayCount = displayCounts[habit.id] ?? 0;
            const remaining    = habit.target_reps - habit.current_reps;

            return (
              <div key={habit.id} className="habit-card">
                <div
                  className="card-glass"
                  style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.048) 0%,rgba(255,255,255,0.018) 100%)', borderRadius: '22px', padding: '18px', marginBottom: '12px', position: 'relative', overflow: 'hidden', boxShadow: `0 0 0 1px rgba(255,255,255,0.055), inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 48px ${glow}` }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg,transparent 0%,${color}bb 25%,${color}ff 50%,${color}bb 75%,transparent 100%)` }} />
                  <div style={{ position: 'absolute', top: '-28px', right: '-28px', width: '110px', height: '110px', borderRadius: '50%', background: `radial-gradient(circle,${glow} 0%,transparent 70%)`, pointerEvents: 'none' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ paddingTop: '2px' }}>
                      <p style={{ fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '16px', margin: '0 0 3px', color: '#fff', letterSpacing: '-0.01em' }}>{habit.name}</p>
                      <p style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>{remaining} reps to go</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: FONT_MONO, fontSize: '36px', fontWeight: 300, margin: 0, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{displayCount}</p>
                      <p style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.15)', margin: 0 }}>/ {habit.target_reps}</p>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.05)', height: '2px', borderRadius: '1px', overflow: 'hidden', marginBottom: '14px' }}>
                    <div style={{ background: `linear-gradient(90deg,${color},${color}77)`, height: '100%', width: `${barWidth}%`, borderRadius: '1px', transition: 'width 1.1s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 10px ${color}88` }} />
                  </div>

                  <button
                    onClick={() => handleAddRep(habit.id)}
                    className="rep-btn"
                    style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg,${color}18,${color}08)`, border: `1px solid ${color}30`, borderRadius: '13px', color, fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '13px', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  >
                    + Rep &nbsp;·&nbsp; {actualProgress}%
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="sticky-footer">
        <div style={{ maxWidth: '390px', margin: '0 auto' }}>
          <a
            href="/ignite"
            className="ignite-link"
            style={{ width: '100%', padding: '15px 20px', color: '#000', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '13px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '16px', boxShadow: '0 8px 36px rgba(251,191,36,0.3)', boxSizing: 'border-box' }}
          >
            IGNITE TODAY
          </a>
          <a href="/history" style={{ display: 'block', padding: '12px', color: 'rgba(255,255,255,0.15)', fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center', marginTop: '2px' }}>
            VIEW IGNITION LOG
          </a>
        </div>
      </div>
    </div>
  );
}
