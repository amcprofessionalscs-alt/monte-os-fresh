'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';
const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';

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

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0f0a1a 50%,#0a0f1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <style>{`@keyframes nsPulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}`}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'nsPulse 2s ease-in-out infinite', boxShadow: '0 0 60px rgba(251,191,36,0.4)', fontSize: '28px' }}>
            ⚡
          </div>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: '32px', fontWeight: 800, margin: '0 0 12px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ignition Set</h1>
          <p style={{ fontFamily: FONT_MONO, fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Ready to execute.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0d0a18 40%,#0a0d1a 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes drift1{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
        @keyframes drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,30px)}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        .ig-field{opacity:0;animation:fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards}
        .ig-field:nth-child(1){animation-delay:0.05s}
        .ig-field:nth-child(2){animation-delay:0.15s}
        .ig-field:nth-child(3){animation-delay:0.25s}
        .ig-field:nth-child(4){animation-delay:0.35s}
        .ig-field:nth-child(5){animation-delay:0.45s}
        input[type=range]{-webkit-appearance:none;width:100%;height:3px;border-radius:2px;background:rgba(255,255,255,0.1);outline:none;cursor:pointer}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#fbbf24;cursor:pointer;box-shadow:0 0 12px rgba(251,191,36,0.5)}
        textarea{resize:none;outline:none}
        textarea::placeholder{color:rgba(255,255,255,0.2)}
        .mood-btn{transition:all 0.2s cubic-bezier(0.16,1,0.3,1)}
        .mood-btn:hover{transform:translateY(-2px)}
        .ignite-btn{transition:all 0.25s ease}
        .ignite-btn:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(251,191,36,0.45)!important}
        .ignite-btn:active{transform:scale(0.98)}
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,0.07) 0%,transparent 70%)', animation: 'drift1 9s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.05) 0%,transparent 70%)', animation: 'drift2 12s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '60px 20px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <a href="/" style={{ fontFamily: FONT_MONO, fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', marginBottom: '24px', display: 'block' }}>← Back</a>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: '36px', fontWeight: 800, margin: '0 0 2px', color: 'rgba(255,255,255,0.85)' }}>Daily</h1>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: '36px', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ignition.</h1>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '28px', padding: '28px', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden', boxShadow: '0 0 60px rgba(251,191,36,0.05), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
          {/* Top shimmer */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(251,191,36,0.35),transparent)' }} />

          {/* Energy */}
          <div className="ig-field" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <label style={{ fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '13px', color: '#fbbf24', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Energy</label>
              <span style={{ fontFamily: FONT_MONO, fontSize: '28px', fontWeight: 300, color: '#fbbf24', lineHeight: 1 }}>{energy}</span>
            </div>
            <input type="range" min="1" max="10" value={energy} onChange={e => setEnergy(Number(e.target.value))} />
          </div>

          {/* Focus */}
          <div className="ig-field" style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <label style={{ fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '13px', color: '#06b6d4', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Focus</label>
              <span style={{ fontFamily: FONT_MONO, fontSize: '28px', fontWeight: 300, color: '#06b6d4', lineHeight: 1 }}>{focus}</span>
            </div>
            <input type="range" min="1" max="10" value={focus} onChange={e => setFocus(Number(e.target.value))} />
          </div>

          {/* Mood */}
          <div className="ig-field" style={{ marginBottom: '28px' }}>
            <label style={{ fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '13px', color: '#ec4899', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Mood</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['fired', 'neutral', 'tired'].map(m => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className="mood-btn"
                  style={{ flex: 1, padding: '12px 8px', background: mood === m ? 'linear-gradient(135deg,#ec4899,#db2777)' : 'rgba(255,255,255,0.04)', border: mood === m ? 'none' : '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', color: mood === m ? '#fff' : 'rgba(255,255,255,0.4)', fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize', letterSpacing: '0.05em', boxShadow: mood === m ? '0 0 20px rgba(236,72,153,0.3)' : 'none' }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="ig-field" style={{ marginBottom: '28px' }}>
            <label style={{ fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '13px', color: '#06b6d4', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>Today&apos;s Goal</label>
            <textarea
              placeholder="What's the 1 thing you need to execute today?"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: 'white', fontFamily: FONT_MONO, fontSize: '13px', minHeight: '100px', boxSizing: 'border-box', lineHeight: 1.6 }}
            />
          </div>

          {/* Submit */}
          <div className="ig-field">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="ignite-btn"
              style={{ width: '100%', padding: '18px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b,#d97706)', color: '#000', border: 'none', borderRadius: '18px', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '14px', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 8px 32px rgba(251,191,36,0.3)' }}
            >
              {loading ? 'Saving...' : 'Ignite'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
