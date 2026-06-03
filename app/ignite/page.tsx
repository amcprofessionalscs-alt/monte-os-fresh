'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';
const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';

const STYLES = `
  /* ── Ambient ── */
  @keyframes drift1 {
    0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-25px) scale(1.08)} 66%{transform:translate(-15px,20px) scale(0.95)}
  }
  @keyframes drift2 {
    0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-25px,40px) scale(1.06)} 66%{transform:translate(35px,-15px) scale(0.96)}
  }

  /* ── NS logo ── */
  @keyframes nsGlow {
    0%,100% { box-shadow:0 0 16px rgba(251,191,36,0.45),0 0 4px rgba(251,191,36,0.2); transform:scale(1); }
    50%      { box-shadow:0 0 48px rgba(251,191,36,0.95),0 0 80px rgba(251,191,36,0.35),0 0 0 2px rgba(251,191,36,0.25); transform:scale(1.04); }
  }
  @keyframes nsPulse {
    0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)}
  }

  /* ── Skeleton / streaming cursor ── */
  @keyframes skeletonPulse { 0%,100%{opacity:0.3} 50%{opacity:0.65} }
  .skel { background:rgba(255,255,255,0.06); border-radius:6px; animation:skeletonPulse 1.6s ease-in-out infinite; }

  /* ── Form fields ── */
  @keyframes fadeSlideUp {
    from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)}
  }
  .ig-field{opacity:0;animation:fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards}
  .ig-field:nth-child(1){animation-delay:0.05s}
  .ig-field:nth-child(2){animation-delay:0.15s}
  .ig-field:nth-child(3){animation-delay:0.25s}
  .ig-field:nth-child(4){animation-delay:0.35s}
  .ig-field:nth-child(5){animation-delay:0.45s}

  /* Range slider — larger thumb for touch */
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

  /* Mood buttons */
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
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
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

  /* ── Chat FAB ── */
  @keyframes chatFabGlow {
    0%,100% { box-shadow:0 0 0 0 rgba(251,191,36,0),inset 0 1px 0 rgba(255,255,255,0.12); }
    50%      { box-shadow:0 0 0 5px rgba(251,191,36,0.14),0 0 24px rgba(251,191,36,0.25),inset 0 1px 0 rgba(255,255,255,0.2); }
  }
  .chat-fab {
    -webkit-tap-highlight-color:transparent;
    transition:all 0.2s ease;
    animation:chatFabGlow 3s ease-in-out infinite;
    cursor:pointer;
  }
  .chat-fab:active { transform:scale(0.93); }

  /* ── Chat panel ── */
  @keyframes slideUpPanel { from{transform:translateY(100%)} to{transform:translateY(0)} }
  .chat-panel { animation:slideUpPanel 0.38s cubic-bezier(0.16,1,0.3,1) forwards; }

  /* ── Grain + glass ── */
  .grain {
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-repeat:repeat; background-size:256px 256px;
  }
  .card-glass { backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); }

  /* ── Sticky footer ── */
  .sticky-footer {
    position:fixed; bottom:0; left:0; right:0; z-index:20;
    padding:20px 20px calc(16px + env(safe-area-inset-bottom,0px));
    background:linear-gradient(to top,rgba(10,13,26,1) 0%,rgba(10,13,26,0.97) 50%,transparent 100%);
  }
`;

// ─── NS Badge ─────────────────────────────────────────────────────────────────
function NSBadge({ size = 40 }: { size?: number }) {
  const r = Math.round(size * 0.28);
  return (
    <div style={{ width: size, height: size, borderRadius: r, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'nsGlow 3s ease-in-out infinite', flexShrink: 0 }}>
      <span style={{ fontFamily: 'serif', fontSize: Math.round(size * 0.38), fontWeight: 900, color: '#000', lineHeight: 1 }}>NS</span>
    </div>
  );
}

// ─── Chat panel ───────────────────────────────────────────────────────────────
function ChatPanel({
  messages, input, streaming,
  onInput, onSend, onClose,
}: {
  messages: ChatMessage[];
  input: string;
  streaming: boolean;
  onInput: (v: string) => void;
  onSend: () => void;
  onClose: () => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-panel card-glass" style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(8,10,20,0.97)', display: 'flex', flexDirection: 'column' }}>
      <div className="grain" style={{ position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '56px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <NSBadge size={32} />
          <div>
            <p style={{ fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '16px', color: '#fff', margin: 0, lineHeight: 1 }}>Monte OS</p>
            <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.28)', margin: 0, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Brain Chat</p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '36px', height: '36px', color: 'rgba(255,255,255,0.5)', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
      </div>

      {/* Messages */}
      <div style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontFamily: FONT_SYNE, fontSize: '15px', color: 'rgba(255,255,255,0.3)', margin: '0 0 6px' }}>What do you need, Demonte?</p>
            <p style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.15)', margin: 0 }}>Ask about your goals, mood, focus, or strategy</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '8px', alignSelf: 'flex-end' }}>
                <span style={{ fontFamily: 'serif', fontSize: '9px', fontWeight: 900, color: '#000' }}>NS</span>
              </div>
            )}
            <div style={{
              maxWidth: '82%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
                : 'rgba(255,255,255,0.06)',
              border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.08)' : 'none',
              boxShadow: msg.role === 'user' ? '0 4px 20px rgba(251,191,36,0.25)' : 'none',
            }}>
              <p style={{ fontFamily: FONT_MONO, fontSize: '13px', color: msg.role === 'user' ? '#000' : 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {msg.content}
                {msg.role === 'assistant' && streaming && i === messages.length - 1 && msg.content === '' && (
                  <span style={{ opacity: 0.5 }}>thinking…</span>
                )}
              </p>
            </div>
          </div>
        ))}

        {streaming && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].content !== '' && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: '30px' }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: '14px', color: '#fbbf24', animation: 'skeletonPulse 0.8s ease-in-out infinite' }}>▋</span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ position: 'relative', zIndex: 1, padding: '12px 20px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom,0px))', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={e => onInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
            placeholder="Ask anything…"
            rows={1}
            style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '12px 14px', color: '#fff', fontFamily: FONT_MONO, fontSize: '13px', resize: 'none', outline: 'none', lineHeight: 1.5, maxHeight: '120px' }}
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || streaming}
            style={{ width: '44px', height: '44px', borderRadius: '14px', background: input.trim() && !streaming ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : 'rgba(255,255,255,0.06)', border: 'none', cursor: input.trim() && !streaming ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, transition: 'all 0.2s ease', boxShadow: input.trim() && !streaming ? '0 4px 16px rgba(251,191,36,0.35)' : 'none' }}
          >
            {streaming ? '⏳' : '↑'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Ignition page ────────────────────────────────────────────────────────────
export default function IgnitionPage() {
  const [energy, setEnergy]           = useState(5);
  const [focus, setFocus]             = useState(5);
  const [mood, setMood]               = useState('neutral');
  const [goal, setGoal]               = useState('');
  const [submitted, setSubmitted]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [chatOpen, setChatOpen]       = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput]     = useState('');
  const [chatStreaming, setChatStreaming] = useState(false);
  const router = useRouter();

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatStreaming) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...chatMessages, userMsg];
    setChatMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setChatInput('');
    setChatStreaming(true);

    try {
      const formContext = `User is setting their daily ignition — Energy: ${energy}/10, Focus: ${focus}/10, Mood: ${mood}, Goal: "${goal || 'not set yet'}"`;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          habitsSummary: formContext,
        }),
      });

      if (!res.ok || !res.body) throw new Error('Chat request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setChatMessages(prev => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== 'assistant') return prev;
          return [...prev.slice(0, -1), { ...last, content: last.content + chunk }];
        });
      }
    } catch {
      setChatMessages(prev => {
        const last = prev[prev.length - 1];
        if (!last || last.role !== 'assistant' || last.content !== '') return prev;
        return [...prev.slice(0, -1), { ...last, content: 'Something went wrong. Try again.' }];
      });
    } finally {
      setChatStreaming(false);
    }
  };

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
      <div className="grain" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, pointerEvents: 'none', zIndex: 1 }} />

      {/* Ambient orbs — matching home intensity */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,0.14) 0%,transparent 70%)', animation: 'drift1 9s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '660px', height: '660px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)', animation: 'drift2 12s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      {/* Content — 390px iPhone column */}
      <div style={{ maxWidth: '390px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2, paddingBottom: '110px' }}>

        {/* Header — matches home page structure */}
        <div style={{ padding: '52px 0 0', marginBottom: '28px' }}>
          {/* NS badge + back link row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <NSBadge size={38} />
            <a href="/" style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.18em', textTransform: 'uppercase', textDecoration: 'none', minHeight: '44px', display: 'flex', alignItems: 'center' }}>← Home</a>
          </div>

          <h1 style={{ fontFamily: FONT_SYNE, fontSize: '30px', fontWeight: 800, margin: '0 0 2px', color: 'rgba(255,255,255,0.85)' }}>Daily</h1>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: '30px', fontWeight: 800, margin: '0 0 20px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ignition.</h1>
          {/* Gold rule */}
          <div style={{ height: '1px', background: 'linear-gradient(90deg,rgba(251,191,36,0.8) 0%,rgba(251,191,36,0.2) 60%,transparent 100%)' }} />
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

      {/* Sticky footer with Brain Chat */}
      <div className="sticky-footer">
        <div style={{ maxWidth: '390px', margin: '0 auto' }}>
          <button
            onClick={() => setChatOpen(true)}
            className="chat-fab"
            style={{ width: '100%', borderRadius: '16px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.28)', color: '#fbbf24', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minHeight: '52px' }}
          >
            ⚡ Brain Chat
          </button>
        </div>
      </div>

      {/* Chat panel */}
      {chatOpen && (
        <ChatPanel
          messages={chatMessages}
          input={chatInput}
          streaming={chatStreaming}
          onInput={setChatInput}
          onSend={sendChat}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
