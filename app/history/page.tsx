'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Ignition = { id: number; created_at: string; energy: number; focus: number; mood: string; goal: string };

const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';
const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';

const MOOD_COLOR: Record<string, string> = {
  fired:   '#ec4899',
  neutral: '#06b6d4',
  tired:   'rgba(255,255,255,0.3)',
};

const STYLES = `
  @keyframes drift1 {
    0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.05)} 66%{transform:translate(-10px,15px) scale(0.97)}
  }
  @keyframes drift2 {
    0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-20px,30px) scale(1.03)} 66%{transform:translate(25px,-10px) scale(0.98)}
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes nsPulse {
    0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)}
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
  .log-card {
    opacity: 0;
    animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
  }
`;

export default function HistoryPage() {
  const [ignitions, setIgnitions] = useState<Ignition[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }
      const { data, error } = await supabase
        .from('ignitions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (!error && data) setIgnitions(data);
      setLoading(false);
    };
    init();
  }, [router]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

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
      <style>{STYLES}</style>

      {/* Grain overlay */}
      <div className="grain" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.045, pointerEvents: 'none', zIndex: 1 }} />

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,0.07) 0%,transparent 70%)', animation: 'drift1 9s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.05) 0%,transparent 70%)', animation: 'drift2 12s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '390px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>

        {/* Header */}
        <div style={{ padding: '56px 0 0' }}>
          <a href="/" style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.18em', textTransform: 'uppercase', textDecoration: 'none', display: 'block', marginBottom: '20px' }}>← Home</a>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: '32px', fontWeight: 800, margin: '0 0 2px', color: 'rgba(255,255,255,0.85)' }}>Ignition</h1>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: '32px', fontWeight: 800, margin: '0 0 22px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Log.</h1>
          {/* Gold rule */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg,rgba(251,191,36,0.7) 0%,rgba(251,191,36,0.15) 60%,transparent 100%)', marginBottom: '28px' }} />
        </div>

        {/* Empty state */}
        {ignitions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontFamily: FONT_SYNE, fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>No ignitions yet.</p>
            <a href="/ignite" style={{ fontFamily: FONT_MONO, fontSize: '11px', color: '#fbbf24', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none' }}>Log your first one →</a>
          </div>
        )}

        {/* Ignition cards */}
        <div style={{ paddingBottom: '60px' }}>
          {ignitions.map((ig, i) => {
            const moodColor = MOOD_COLOR[ig.mood] || 'rgba(255,255,255,0.3)';
            const animDelay = `${Math.min(i * 0.07, 0.6)}s`;

            return (
              <div
                key={ig.id}
                className="log-card"
                style={{ animationDelay: animDelay, marginBottom: '12px' }}
              >
                <div
                  className="card-glass"
                  style={{
                    background: 'linear-gradient(135deg,rgba(255,255,255,0.045) 0%,rgba(255,255,255,0.018) 100%)',
                    borderRadius: '20px',
                    padding: '18px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.055), inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 24px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* Bright top border */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent 0%,rgba(251,191,36,0.7) 40%,rgba(251,191,36,0.9) 50%,rgba(251,191,36,0.7) 60%,transparent 100%)' }} />

                  {/* Date + mood row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <p style={{ fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '14px', margin: '0 0 2px', color: '#fff' }}>{formatDate(ig.created_at)}</p>
                      <p style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>{formatTime(ig.created_at)}</p>
                    </div>
                    {/* Mood pill */}
                    <div style={{ padding: '4px 12px', borderRadius: '20px', border: `1px solid ${moodColor}44`, background: `${moodColor}11` }}>
                      <span style={{ fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '11px', color: moodColor, letterSpacing: '0.06em', textTransform: 'capitalize' }}>{ig.mood}</span>
                    </div>
                  </div>

                  {/* Energy + Focus — Apple Stocks mini layout */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ flex: 1, background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.12)', borderRadius: '12px', padding: '10px 12px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(251,191,36,0.5),transparent)' }} />
                      <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.2)', margin: '0 0 4px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Energy</p>
                      <p style={{ fontFamily: FONT_MONO, fontSize: '28px', fontWeight: 300, margin: 0, color: '#fbbf24', lineHeight: 1 }}>{ig.energy}</p>
                      <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.12)', margin: 0 }}>/10</p>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.12)', borderRadius: '12px', padding: '10px 12px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(6,182,212,0.5),transparent)' }} />
                      <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.2)', margin: '0 0 4px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Focus</p>
                      <p style={{ fontFamily: FONT_MONO, fontSize: '28px', fontWeight: 300, margin: 0, color: '#06b6d4', lineHeight: 1 }}>{ig.focus}</p>
                      <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.12)', margin: 0 }}>/10</p>
                    </div>
                  </div>

                  {/* Goal */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '10px 12px' }}>
                    <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.2)', margin: '0 0 5px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Goal</p>
                    <p style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.5 }}>{ig.goal}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
