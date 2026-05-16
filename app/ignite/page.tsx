'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';
const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';

const STYLES = `
  @keyframes drift1{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
  @keyframes drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,30px)}}
  @keyframes nsPulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
  @keyframes fadeSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}

  .grain {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 256px 256px;
  }
  .card-glass {
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }

  .ig-field{opacity:0;animation:fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards}
  .ig-field:nth-child(1){animation-delay:0.05s}
  .ig-field:nth-child(2){animation-delay:0.15s}
  .ig-field:nth-child(3){animation-delay:0.25s}
  .ig-field:nth-child(4){animation-delay:0.35s}
  .ig-field:nth-child(5){animation-delay:0.45s}

  /* Range slider — larger track + thumb for touch */
  input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(255,255,255,0.1);
    outline: none;
    cursor: pointer;
    touch-action: none;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fbbf24;
    cursor: pointer;
    box-shadow: 0 0 14px rgba(251,191,36,0.55);
  }
  input[type=range]::-moz-range-thumb {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fbbf24;
    border: none;
    box-shadow: 0 0 14px rgba(251,191,36,0.55);
  }

  textarea { resize: none; outline: none; }
  textarea::placeholder { color: rgba(255,255,255,0.2); }

  /* Mood buttons — 48px min touch target */
  .mood-btn {
    min-height: 48px;
    transition: all 0.18s cubic-bezier(0.16,1,0.3,1);
    -webkit-tap-highlight-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mood-btn:active { transform: scale(0.96); }

  /* Ignite submit */
  .ignite-btn {
    background: linear-gradient(90deg,#d97706,#fbbf24,#fef9ec,#fbbf24,#d97706);
    background-size: 300% auto;
    animation: shimmer 3.2s linear infinite;
    min-height: 52px;
    -webkit-tap-highlight-color: transparent;
    transition: opacity 0.2s ease;
  }
  .ignite-btn:active { opacity: 0.85; }
  .ignite-btn:disabled { opacity: 0.6; }
`;

export default function IgnitionPage() {
  const [energy, setEnergy] = useState(5);
  const [focus, setFocus] = useState(5);
  const [mood, setMood] = useState('neutral');
  const [goal, setGoal] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!goal.trim()) return alert('Add your goal for today.');
    setLoading(true);
    try {
      const { error } = await supabase.from('ignitions').insert({ energy, focus, mood, goal }).select();
      if (error) throw error;
      setSubmitted(true);
      setTimeout(() => router.push('/'), 2000);
    } catch (e) {
      console.error('Error saving:', e);
      alert('Failed to save: ' + JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  /* ── Submitted state ── */
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0f0a1a 50%,#0a0f1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px' }}>
        <style>{`@keyframes nsPulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'nsPulse 2s ease-in-out infinite', boxShadow: '0 0 60px rgba(251,191,36,0.4)', fontSize: '28px' }}>
            ⚡
          </div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: '30px', fontWeight: 800, margin: '0 0 10px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ignition Set</h1>
          <p style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0 }}>Ready to execute.</p>
        </div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0d0a18 40%,#0a0d1a 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <style>{STYLES}</style>

      {/* Grain */}
      <div className="grain" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.045, pointerEvents: 'none', zIndex: 1 }} />

      {/* Orbs */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,0.07) 0%,transparent 70%)', animation: 'drift1 9s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.05) 0%,transparent 70%)', animation: 'drift2 12s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      {/* Content — 390px iPhone column */}
      <div style={{ maxWidth: '390px', margin: '0 auto', padding: '52px 20px 48px', position: 'relative', zIndex: 2 }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <a href="/" style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.18em', textTransform: 'uppercase', textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: '20px', minHeight: '44px' }}>← Back</a>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: '30px', fontWeight: 800, margin: '0 0 2px', color: 'rgba(255,255,255,0.85)' }}>Daily</h1>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: '30px', fontWeight: 800, margin: '0 0 20px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ignition.</h1>
          {/* Gold rule */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg,rgba(251,191,36,0.7) 0%,rgba(251,191,36,0.15) 60%,transparent 100%)' }} />
        </div>

        {/* Glass card */}
        <div
          className="card-glass"
          style={{
            background: 'linear-gradient(135deg,rgba(255,255,255,0.048) 0%,rgba(255,255,255,0.018) 100%)',
            borderRadius: '24px',
            padding: '24px 20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.055), inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 48px rgba(251,191,36,0.06)',
          }}
        >
          {/* Top shimmer border */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent 0%,rgba(251,191,36,0.7) 30%,rgba(251,191,36,0.95) 50%,rgba(251,191,36,0.7) 70%,transparent 100%)' }} />

          {/* Energy */}
          <div className="ig-field" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <label style={{ fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '12px', color: '#fbbf24', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Energy</label>
              <span style={{ fontFamily: FONT_MONO, fontSize: '26px', fontWeight: 300, color: '#fbbf24', lineHeight: 1 }}>{energy}</span>
            </div>
            <input type="range" min="1" max="10" value={energy} onChange={e => setEnergy(Number(e.target.value))} />
          </div>

          {/* Focus */}
          <div className="ig-field" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <label style={{ fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '12px', color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Focus</label>
              <span style={{ fontFamily: FONT_MONO, fontSize: '26px', fontWeight: 300, color: '#06b6d4', lineHeight: 1 }}>{focus}</span>
            </div>
            <input type="range" min="1" max="10" value={focus} onChange={e => setFocus(Number(e.target.value))} />
          </div>

          {/* Mood */}
          <div className="ig-field" style={{ marginBottom: '24px' }}>
            <label style={{ fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '12px', color: '#ec4899', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Mood</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['fired', 'neutral', 'tired'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className="mood-btn"
                  style={{ flex: 1, padding: '12px 4px', background: mood === m ? 'linear-gradient(135deg,#ec4899,#db2777)' : 'rgba(255,255,255,0.04)', border: mood === m ? 'none' : '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', color: mood === m ? '#fff' : 'rgba(255,255,255,0.4)', fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize', letterSpacing: '0.04em', boxShadow: mood === m ? '0 0 20px rgba(236,72,153,0.3)' : 'none' }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="ig-field" style={{ marginBottom: '24px' }}>
            <label style={{ fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '12px', color: '#06b6d4', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Today&apos;s Goal</label>
            <textarea
              placeholder="What's the 1 thing you need to execute today?"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'white', fontFamily: FONT_MONO, fontSize: '13px', minHeight: '96px', boxSizing: 'border-box', lineHeight: 1.6 }}
            />
          </div>

          {/* Submit */}
          <div className="ig-field">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="ignite-btn"
              style={{ width: '100%', padding: '15px 20px', color: '#000', border: 'none', borderRadius: '16px', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 32px rgba(251,191,36,0.3)' }}
            >
              {loading ? 'Saving...' : 'Ignite'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
