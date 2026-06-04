'use client';

import { motion } from 'framer-motion';

type Habit = {
  id: string;
  name: string;
  category: 'amc' | 'monte' | 'content';
  reps: number;
  target: number;
};

const CATEGORY_COLOR: Record<string, string> = {
  amc:     '#fbbf24',
  monte:   '#06b6d4',
  content: '#ec4899',
};

const CATEGORY_GLOW: Record<string, string> = {
  amc:     'rgba(251,191,36,0.22)',
  monte:   'rgba(6,182,212,0.22)',
  content: 'rgba(236,72,153,0.22)',
};

const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';
const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';

export function HabitCard({
  habit,
  onAddRep,
  onRemoveRep,
}: {
  habit: Habit;
  onAddRep: (id: string) => void;
  onRemoveRep: (id: string) => void;
}) {
  const color    = CATEGORY_COLOR[habit.category] || '#fff';
  const glow     = CATEGORY_GLOW[habit.category]  || 'rgba(255,255,255,0.1)';
  const progress = Math.round((habit.reps / habit.target) * 100);
  const done     = habit.reps >= habit.target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ boxShadow: `0 0 0 1px ${color}44, 0 12px 48px ${glow}` }}
      className="glass"
      style={{
        background: 'linear-gradient(135deg,rgba(255,255,255,0.048) 0%,rgba(255,255,255,0.018) 100%)',
        borderRadius: '22px',
        padding: '18px',
        marginBottom: '12px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 0 0 1px rgba(255,255,255,0.055), inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 48px ${glow}`,
      }}
    >
      {/* Color top edge */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg,transparent 0%,${color}bb 25%,${color} 50%,${color}bb 75%,transparent 100%)` }} />
      {/* Corner radiance */}
      <div style={{ position: 'absolute', top: '-28px', right: '-28px', width: '110px', height: '110px', borderRadius: '50%', background: `radial-gradient(circle,${glow} 0%,transparent 70%)`, pointerEvents: 'none' }} />

      {/* Name + count row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div style={{ paddingTop: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <p style={{ fontFamily: FONT_SYNE, fontWeight: 700, fontSize: '16px', margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>{habit.name}</p>
            {done && <span style={{ fontSize: '14px' }}>✓</span>}
          </div>
          <p style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            {done ? 'Complete!' : `${habit.target - habit.reps} reps to go`}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: FONT_MONO, fontSize: '36px', fontWeight: 300, margin: 0, color, lineHeight: 1, letterSpacing: '-0.02em' }}>{habit.reps}</p>
          <p style={{ fontFamily: FONT_MONO, fontSize: '10px', color: 'rgba(255,255,255,0.15)', margin: 0 }}>/ {habit.target}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'rgba(255,255,255,0.05)', height: '2px', borderRadius: '1px', overflow: 'hidden', marginBottom: '14px' }}>
        <div
          style={{
            background: `linear-gradient(90deg,${color},${color}77)`,
            height: '100%',
            width: `${progress}%`,
            borderRadius: '1px',
            transition: 'width 0.4s cubic-bezier(0.22,1,0.36,1)',
            boxShadow: `0 0 10px ${color}88`,
          }}
        />
      </div>

      {/* Rep buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => onRemoveRep(habit.id)}
          disabled={habit.reps <= 0}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '18px',
            cursor: habit.reps > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          −
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => onAddRep(habit.id)}
          disabled={done}
          style={{
            flex: 1,
            height: '44px',
            borderRadius: '12px',
            background: done ? 'rgba(255,255,255,0.03)' : `linear-gradient(135deg,${color}18,${color}08)`,
            border: `1px solid ${done ? 'rgba(255,255,255,0.06)' : `${color}30`}`,
            color: done ? 'rgba(255,255,255,0.2)' : color,
            fontFamily: FONT_SYNE,
            fontWeight: 700,
            fontSize: '13px',
            cursor: done ? 'not-allowed' : 'pointer',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {done ? 'Done' : `+ Rep · ${progress}%`}
        </motion.button>
      </div>
    </motion.div>
  );
}
