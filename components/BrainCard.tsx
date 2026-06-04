'use client';

import { motion } from 'framer-motion';

type Brain = { greeting: string; analysis: string; roadmap: string[]; momentum: string };

const MOMENTUM_COLOR: Record<string, string> = {
  'LOCKED IN':    '#fbbf24',
  'BUILDING':     '#06b6d4',
  'DRIFTING':     '#ec4899',
  'RESET NEEDED': '#ff7070',
};

const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';
const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';

function BrainSkeleton() {
  return (
    <div
      className="glass"
      style={{
        background: 'linear-gradient(135deg,rgba(255,255,255,0.04) 0%,rgba(255,255,255,0.015) 100%)',
        borderRadius: '24px',
        padding: '22px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
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

export function BrainCard({ brain, isLoading }: { brain: Brain | null; isLoading: boolean }) {
  if (isLoading) return <BrainSkeleton />;
  if (!brain) return null;

  const momentumColor = MOMENTUM_COLOR[brain.momentum] || 'rgba(255,255,255,0.4)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="glass"
      style={{
        background: 'linear-gradient(135deg,rgba(251,191,36,0.07) 0%,rgba(255,255,255,0.02) 100%)',
        borderRadius: '24px',
        padding: '22px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        animation: 'glow-pulse 4s ease-in-out infinite',
      }}
    >
      {/* Top edge glow */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg,transparent 0%,rgba(251,191,36,0.6) 20%,rgba(251,191,36,1) 50%,rgba(251,191,36,0.6) 80%,transparent 100%)' }} />
      {/* Radial accents */}
      <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(251,191,36,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.28em', textTransform: 'uppercase', margin: 0 }}>⚡ Monte OS Brain</p>
        <motion.div
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            border: `1px solid ${momentumColor}55`,
            background: `${momentumColor}18`,
            animation: 'momentum-pulse 2s ease-in-out infinite',
          }}
        >
          <span style={{ fontFamily: FONT_MONO, fontSize: '9px', color: momentumColor, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>{brain.momentum}</span>
        </motion.div>
      </div>

      {/* Greeting */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '20px', margin: '0 0 12px', lineHeight: 1.25, background: 'linear-gradient(135deg,#fff 40%,#fbbf24 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
      >
        {brain.greeting}
      </motion.p>

      {/* Analysis */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '0 0 18px', lineHeight: 1.7 }}
      >
        {brain.analysis}
      </motion.p>

      {/* Divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg,rgba(251,191,36,0.4),rgba(251,191,36,0.08),transparent)', marginBottom: '14px' }} />

      {/* Roadmap */}
      <p style={{ fontFamily: FONT_MONO, fontSize: '9px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.24em', textTransform: 'uppercase', margin: '0 0 10px' }}>Today&apos;s Roadmap</p>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {brain.roadmap.map((task, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}
          >
            <span style={{ fontFamily: FONT_MONO, fontSize: '11px', color: '#fbbf24', fontWeight: 700, lineHeight: 1.6, flexShrink: 0, minWidth: '16px' }}>{i + 1}.</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{task}</span>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}
