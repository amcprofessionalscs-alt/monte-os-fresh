'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Habit       = { id: number; name: string; current_reps: number; target_reps: number; category: string };
type Brain       = { greeting: string; analysis: string; roadmap: string[]; momentum: string };
type ChatMessage = { role: 'user' | 'assistant'; content: string };

const COLORS: Record<string, string> = { AMC: '#fbbf24', OnlyFans: '#ec4899', Monte: '#06b6d4' };
const GLOWS:  Record<string, string> = { AMC: 'rgba(251,191,36,0.22)', OnlyFans: 'rgba(236,72,153,0.22)', Monte: 'rgba(6,182,212,0.22)' };
const MOMENTUM_COLOR: Record<string, string> = {
  'LOCKED IN':    '#fbbf24',
  'BUILDING':     '#06b6d4',
  'DRIFTING':     '#ec4899',
  'RESET NEEDED': '#ff7070',
};

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
  @keyframes drift3 {
    0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,30px)}
  }

  /* ── NS logo ── */
  @keyframes nsGlow {
    0%,100% { box-shadow:0 0 16px rgba(251,191,36,0.45),0 0 4px rgba(251,191,36,0.2); transform:scale(1); }
    50%      { box-shadow:0 0 48px rgba(251,191,36,0.95),0 0 80px rgba(251,191,36,0.35),0 0 0 2px rgba(251,191,36,0.25); transform:scale(1.04); }
  }
  @keyframes nsPulseLoad {
    0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)}
  }

  /* ── Brain card ── */
  @keyframes brainGlow {
    0%,100% { box-shadow:0 0 0 1px rgba(251,191,36,0.18), inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 40px rgba(251,191,36,0.1); }
    50%      { box-shadow:0 0 0 1px rgba(251,191,36,0.5), inset 0 1px 0 rgba(255,255,255,0.16), 0 20px 80px rgba(251,191,36,0.28), 0 0 120px rgba(251,191,36,0.06); }
  }
  @keyframes brainFadeIn {
    from{opacity:0;transform:translateY(20px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)}
  }
  .brain-card { animation:brainFadeIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }

  /* ── Skeleton ── */
  @keyframes skeletonPulse { 0%,100%{opacity:0.3} 50%{opacity:0.65} }
  .skel { background:rgba(255,255,255,0.06); border-radius:6px; animation:skeletonPulse 1.6s ease-in-out infinite; }

  /* ── Habit cards ── */
  @keyframes fadeSlideUp {
    from{opacity:0;transform:translateY(44px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)}
  }
  .habit-card { opacity:0; animation:fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards; }
  .habit-card:nth-child(1) { animation-delay:0.14s; }
  .habit-card:nth-child(2) { animation-delay:0.28s; }
  .habit-card:nth-child(3) { animation-delay:0.42s; }

  /* ── Buttons ── */
  .rep-btn { min-height:48px; transition:all 0.2s cubic-bezier(0.16,1,0.3,1); -webkit-tap-highlight-color:transparent; }
  .rep-btn:active { transform:scale(0.96); filter:brightness(0.88); }

  /* ── IGNITE shimmer ── */
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  .ignite-link {
    background:linear-gradient(90deg,#92400e,#d97706,#fbbf24,#fef3c7,#fbbf24,#d97706,#92400e);
    background-size:300% auto;
    animation:shimmer 2.6s linear infinite;
    -webkit-tap-highlight-color:transparent;
    min-height:52px;
    display:flex; align-items:center; justify-content:center;
    transition: box-shadow 0.25s ease;
  }
  .ignite-link:active { opacity:0.85; }

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
  .signout-btn { min-height:36px; display:flex; align-items:center; -webkit-tap-highlight-color:transparent; }
`;

// ─── NS Badge — always glowing ────────────────────────────────────────────────
function NSBadge({ size = 40 }: { size?: number }) {
  const r = Math.round(size * 0.28);
  return (
    <div style={{ width: size, height: size, borderRadius: r, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'nsGlow 3s ease-in-out infinite', flexShrink: 0 }}>
      <span style={{ fontFamily: 'serif', fontSize: Math.round(size * 0.38), fontWeight: 900, color: '#000', lineHeight: 1 }}>NS</span>
    </div>
  );
}

// ─── Brain skeleton ───────────────────────────────────────────────────────────
function BrainSkeleton() {
  return (
    <div className="card-glass" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.015) 100%)', borderRadius: '24px', padding: '22px', marginBottom: '28px', position: 'relative', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(251,191,36,0.3),transparent)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div className="skel" style={{ width: '110px', height: '9px' }} />
        <div className="skel" style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
      </div>
      <div className="skel" style={{ width: '75%', height: '22px', marginBottom: '14px', borderRadius: '8px' }} />
      <div className="skel" style={{ width: '100%', height: '10px', marginBottom: '7px' }} />
      <div className="skel" style={{ width: '88%', height: '10px', marginBottom: '7px' }} />
      <div className="skel" style={{ width: '68%', height: '10px', marginBottom: '18px' }} />
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '14px' }} />
      <div className="skel" style={{ width: '80px', height: '8px', marginBottom: '10px' }} />
      {[95, 82, 90].map((w, i) => (
        <div key={i} className="skel" style={{ width: `${w}%`, height: '10px', marginBottom: i < 2 ? '7px' : 0 }} />
      ))}
    </div>
  );
}

// ─── Brain card — prominent ───────────────────────────────────────────────────
function BrainCard({ brain }: { brain: Brain }) {
  const momentumColor = MOMENTUM_COLOR[brain.momentum] || 'rgba(255,255,255,0.4)';
  return (
    <div className="card-glass brain-card" style={{ background: 'linear-gradient(135deg,rgba(251,191,36,0.07) 0%,rgba(255,255,255,0.02) 100%)', borderRadius: '24px', padding: '22px', marginBottom: '28px', position: 'relative', overflow: 'hidden', animation: 'brainGlow 4s ease-in-out infinite' }}>
      {/* Bright top edge */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent 0%,rgba(251,191,36,0.6) 20%,rgba(251,191,36,1) 50%,rgba(251,191,36,0.6) 80%,transparent 100%)' }} />
      {/* Corner radiance */}
      <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.28em', textTransform: 'uppercase', margin: 0 }}>⚡ Monte OS Brain</p>
        <div style={{ padding: '5px 12px', borderRadius: '20px', border: `1px solid ${momentumColor}55`, background: `${momentumColor}18`, animation: 'chatFabGlow 3s ease-in-out infinite' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: '9px', color: momentumColor, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>{brain.momentum}</span>
        </div>
      </div>

      {/* Greeting — hero text */}
      <p style={{ fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '20px', margin: '0 0 12px', lineHeight: 1.25, background: 'linear-gradient(135deg,#fff 40%,#fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{brain.greeting}</p>

      {/* Analysis */}
      <p style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '0 0 18px', lineHeight: 1.7 }}>{brain.analysis}</p>

      {/* Divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg,rgba(251,191,36,0.4),rgba(251,191,36,0.08),transparent)', marginBottom: '14px' }} />

      {/* Roadmap */}
      <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.24em', textTransform: 'uppercase', margin: '0 0 10px' }}>Today&apos;s Roadmap</p>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {brain.roadmap.map((task, i) => (
          <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: '11px', color: '#fbbf24', fontWeight: 700, lineHeight: 1.6, flexShrink: 0, minWidth: '16px' }}>{i + 1}.</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{task}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── Chat panel ───────────────────────────────────────────────────────────────
function ChatPanel({
  messages, input, streaming, habits,
  onInput, onSend, onClose,
}: {
  messages: ChatMessage[];
  input: string;
  streaming: boolean;
  habits: Habit[];
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
      {/* Grain overlay inside panel */}
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
            <p style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.15)', margin: 0 }}>Ask about habits, revenue, strategy, mindset</p>
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

        {/* Streaming cursor */}
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

// ─── Home ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [habits, setHabits]           = useState<Habit[]>([]);
  const [loading, setLoading]         = useState(true);
  const [greeting, setGreeting]       = useState('');
  const [displayCounts, setDisplayCounts] = useState<Record<number, number>>({});
  const [progressReady, setProgressReady] = useState(false);
  const [brain, setBrain]             = useState<Brain | null>(null);
  const [brainLoading, setBrainLoading] = useState(true);
  const [chatOpen, setChatOpen]       = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput]     = useState('');
  const [chatStreaming, setChatStreaming] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      fetch('/api/brain')
        .then(r => r.ok ? r.json() : null)
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

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/login'); };

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatStreaming) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...chatMessages, userMsg];
    setChatMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setChatInput('');
    setChatStreaming(true);

    try {
      const habitsSummary = habits.map(h => `${h.name}: ${h.current_reps}/${h.target_reps} reps`).join(', ') || 'No habits loaded';
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          habitsSummary,
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

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0f0a1a 50%,#0a0f1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@keyframes nsPulseLoad{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}} @keyframes nsGlow{0%,100%{box-shadow:0 0 16px rgba(251,191,36,0.45)}50%{box-shadow:0 0 60px rgba(251,191,36,0.95),0 0 100px rgba(251,191,36,0.35)}}`}</style>
        <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'nsPulseLoad 1.8s ease-in-out infinite, nsGlow 1.8s ease-in-out infinite', boxShadow: '0 0 60px rgba(251,191,36,0.6)' }}>
          <span style={{ fontFamily: 'serif', fontSize: '32px', fontWeight: 900, color: '#000' }}>NS</span>
        </div>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0d0a18 40%,#0a0d1a 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <style>{STYLES}</style>

      {/* Grain */}
      <div className="grain" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, pointerEvents: 'none', zIndex: 1 }} />

      {/* Orbs — more intense */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,0.14) 0%,transparent 70%)', animation: 'drift1 9s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '660px', height: '660px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)', animation: 'drift2 12s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', left: '30%', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 70%)', animation: 'drift3 15s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      {/* Content */}
      <div style={{ maxWidth: '390px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2, paddingBottom: '190px' }}>

        {/* Header */}
        <div style={{ padding: '52px 0 0' }}>
          {/* NS badge + date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <NSBadge size={38} />
            <p style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0 }}>{today}</p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px' }}>
            <div>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: '30px', fontWeight: 800, margin: 0, lineHeight: 1.15, color: 'rgba(255,255,255,0.85)' }}>{greeting},</h1>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: '30px', fontWeight: 800, margin: 0, lineHeight: 1.15, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Demonte.</h1>
            </div>
            <button onClick={handleSignOut} className="signout-btn" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', color: 'rgba(255,255,255,0.22)', fontSize: '10px', fontFamily: FONT_MONO, padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.08em' }}>
              sign out
            </button>
          </div>

          <div style={{ height: '1px', background: 'linear-gradient(90deg,rgba(251,191,36,0.8) 0%,rgba(251,191,36,0.2) 60%,transparent 100%)', marginBottom: '28px' }} />
        </div>

        {/* Brain section */}
        {brainLoading && <BrainSkeleton />}
        {!brainLoading && brain && <BrainCard brain={brain} />}

        {/* Law of 100 */}
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
                <div className="card-glass" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.048) 0%,rgba(255,255,255,0.018) 100%)', borderRadius: '22px', padding: '18px', marginBottom: '12px', position: 'relative', overflow: 'hidden', boxShadow: `0 0 0 1px rgba(255,255,255,0.055), inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 48px ${glow}` }}>
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

                  <button onClick={() => handleAddRep(habit.id)} className="rep-btn" style={{ width: '100%', padding: '14px', background: `linear-gradient(135deg,${color}18,${color}08)`, border: `1px solid ${color}30`, borderRadius: '13px', color, fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '13px', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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
          <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch', marginBottom: '6px' }}>
            {/* Chat FAB */}
            <button onClick={() => setChatOpen(true)} className="chat-fab" style={{ width: '52px', flexShrink: 0, borderRadius: '16px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.28)', color: '#fbbf24', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ⚡
            </button>
            {/* IGNITE */}
            <a href="/ignite" className="ignite-link" style={{ flex: 1, padding: '15px 20px', color: '#000', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '13px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '16px', boxShadow: '0 8px 40px rgba(251,191,36,0.4)', boxSizing: 'border-box' }}>
              IGNITE TODAY
            </a>
          </div>
          <a href="/history" style={{ display: 'block', padding: '10px', color: 'rgba(255,255,255,0.15)', fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center' }}>
            VIEW IGNITION LOG
          </a>
        </div>
      </div>

      {/* Chat panel */}
      {chatOpen && (
        <ChatPanel
          messages={chatMessages}
          input={chatInput}
          streaming={chatStreaming}
          habits={habits}
          onInput={setChatInput}
          onSend={sendChat}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
