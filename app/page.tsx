'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { BrainCard, HabitCard, NSBadge, IgnitionButton, ChatPanel } from '@/components';

type RawHabit = { id: number; name: string; current_reps: number; target_reps: number; category: string };
type Brain    = { greeting: string; analysis: string; roadmap: string[]; momentum: string };

const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';
const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';

const CAT_MAP: Record<string, 'amc' | 'monte' | 'content'> = {
  AMC: 'amc', Monte: 'monte', OnlyFans: 'content',
};

export default function Home() {
  const [habits, setHabits]           = useState<RawHabit[]>([]);
  const [loading, setLoading]         = useState(true);
  const [brain, setBrain]             = useState<Brain | null>(null);
  const [brainLoading, setBrainLoading] = useState(true);
  const [chatOpen, setChatOpen]       = useState(false);
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  });
  const router = useRouter();

  useEffect(() => {

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      fetch('/api/brain')
        .then(r => r.ok ? r.json() : null)
        .then((data: Brain | null) => { if (data) setBrain(data); })
        .catch(() => {})
        .finally(() => setBrainLoading(false));

      const { data, error } = await supabase.from('habits').select('*').order('id');
      if (!error && data) setHabits(data);
      setLoading(false);
    };
    init();
  }, [router]);

  const handleAddRep = async (id: string) => {
    const numId = Number(id);
    const habit = habits.find(h => h.id === numId);
    if (!habit || habit.current_reps >= habit.target_reps) return;
    const newReps = habit.current_reps + 1;
    setHabits(prev => prev.map(h => h.id === numId ? { ...h, current_reps: newReps } : h));
    await supabase.from('habits').update({ current_reps: newReps, updated_at: new Date().toISOString() }).eq('id', numId);
  };

  const handleRemoveRep = async (id: string) => {
    const numId = Number(id);
    const habit = habits.find(h => h.id === numId);
    if (!habit || habit.current_reps <= 0) return;
    const newReps = habit.current_reps - 1;
    setHabits(prev => prev.map(h => h.id === numId ? { ...h, current_reps: newReps } : h));
    await supabase.from('habits').update({ current_reps: newReps, updated_at: new Date().toISOString() }).eq('id', numId);
  };

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push('/login'); };

  const habitsSummary = habits.map(h => `${h.name}: ${h.current_reps}/${h.target_reps} reps`).join(', ') || 'No habits loaded';

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0f0a1a 50%,#0a0f1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '22px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'ns-glow 1.8s ease-in-out infinite', boxShadow: '0 0 60px rgba(251,191,36,0.6)' }}>
          <span style={{ fontFamily: FONT_SYNE, fontSize: '32px', fontWeight: 900, color: '#000' }}>NS</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0d0a18 40%,#0a0d1a 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,0.14) 0%,transparent 70%)', animation: 'drift1 9s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '660px', height: '660px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)', animation: 'drift2 12s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', left: '30%', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 70%)', animation: 'drift3 15s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      {/* Content */}
      <div style={{ maxWidth: '390px', margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 2, paddingBottom: '190px' }}>

        {/* Top bar */}
        <div style={{ padding: '52px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <NSBadge size={38} />
            <p style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.18em', textTransform: 'uppercase', margin: 0 }}>{today}</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px' }}>
            <div>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: '30px', fontWeight: 800, margin: 0, lineHeight: 1.15, color: 'rgba(255,255,255,0.85)' }}>{greeting},</h1>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: '30px', fontWeight: 800, margin: 0, lineHeight: 1.15, background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Demonte.</h1>
            </div>
            <button
              onClick={handleSignOut}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', color: 'rgba(255,255,255,0.22)', fontSize: '10px', fontFamily: FONT_MONO, padding: '6px 14px', cursor: 'pointer', letterSpacing: '0.08em', minHeight: '36px' }}
            >
              sign out
            </button>
          </div>
          <div style={{ height: '1px', background: 'linear-gradient(90deg,rgba(251,191,36,0.8) 0%,rgba(251,191,36,0.2) 60%,transparent 100%)', marginBottom: '28px' }} />
        </div>

        {/* Brain */}
        <BrainCard brain={brain} isLoading={brainLoading} />

        {/* Habits */}
        <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.14)', letterSpacing: '0.28em', textTransform: 'uppercase', margin: '0 0 16px' }}>LAW OF 100</p>
        {habits.map((habit, i) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 + i * 0.14, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <HabitCard
              habit={{
                id:       String(habit.id),
                name:     habit.name,
                category: CAT_MAP[habit.name] ?? 'monte',
                reps:     habit.current_reps,
                target:   habit.target_reps,
              }}
              onAddRep={handleAddRep}
              onRemoveRep={handleRemoveRep}
            />
          </motion.div>
        ))}
      </div>

      {/* Sticky footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20, padding: '20px 20px calc(16px + env(safe-area-inset-bottom,0px))', background: 'linear-gradient(to top,rgba(10,13,26,1) 0%,rgba(10,13,26,0.97) 50%,transparent 100%)' }}>
        <div style={{ maxWidth: '390px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch', marginBottom: '6px' }}>
            {/* Brain Chat FAB */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setChatOpen(true)}
              style={{ flex: 1, borderRadius: '16px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.28)', color: '#fbbf24', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', minHeight: '52px', cursor: 'pointer', animation: 'chat-fab-glow 3s ease-in-out infinite' }}
            >
              ⚡ Brain Chat
            </motion.button>
            <IgnitionButton />
          </div>
          <Link href="/history" style={{ display: 'block', padding: '10px', color: 'rgba(255,255,255,0.15)', fontFamily: FONT_MONO, fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', textDecoration: 'none', textAlign: 'center' }}>
            VIEW IGNITION LOG
          </Link>
        </div>
      </div>

      {/* Chat overlay */}
      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} habitsSummary={habitsSummary} />
    </div>
  );
}
