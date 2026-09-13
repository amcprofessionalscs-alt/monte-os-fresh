'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPaymentLink } from '@/lib/payment-links';

const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';
const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';

export default function Home() {
  const [auditLink, setAuditLink] = useState('');

  useEffect(() => {
    getPaymentLink('audit').then(setAuditLink).catch(() => setAuditLink(''));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0a18 40%, #0a0d1a 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes drift1 { 0%,100% { transform: translate(0,0) scale(1) } 33% { transform: translate(40px,-25px) scale(1.08) } 66% { transform: translate(-15px,20px) scale(0.95) } }
        @keyframes drift2 { 0%,100% { transform: translate(0,0) scale(1) } 33% { transform: translate(-25px,40px) scale(1.06) } 66% { transform: translate(35px,-15px) scale(0.96) } }
        @keyframes drift3 { 0%,100% { transform: translate(0,0) scale(1) } 33% { transform: translate(15px,35px) scale(0.98) } 66% { transform: translate(-30px,-10px) scale(1.05) } }
        @keyframes nsGlow { 0%,100% { box-shadow: 0 0 16px rgba(251,191,36,0.45); transform: scale(1); } 50% { box-shadow: 0 0 48px rgba(251,191,36,0.95); transform: scale(1.04); } }
        @keyframes shimmer { 0% { background-position: -200% center } 100% { background-position: 200% center } }
        @keyframes float { 0%,100% { transform: translateY(0px) } 50% { transform: translateY(-20px) } }
        .cta-shimmer { background: linear-gradient(90deg, #d97706, #fbbf24, #fef9ec, #fbbf24, #d97706); background-size: 300% auto; animation: shimmer 3.2s linear infinite; }
        .floating-card { animation: float 4s ease-in-out infinite; }
      `}</style>

      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 70%)', animation: 'drift1 9s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '660px', height: '660px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', animation: 'drift2 12s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', left: '30%', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', animation: 'drift3 15s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 0', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'nsGlow 3s ease-in-out infinite' }}>
            <span style={{ fontFamily: FONT_SYNE, fontSize: '24px', fontWeight: 900, color: '#000' }}>NS</span>
          </div>
          <span style={{ fontFamily: FONT_SYNE, fontSize: '20px', fontWeight: 800 }}>Next Step OS</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/pricing" style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '10px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>Pricing</Link>
          <Link href="/partner" style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '10px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>For Partners</Link>
        </div>
      </motion.div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 120px', position: 'relative', zIndex: 2 }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: '64px', fontWeight: 900, margin: '0 0 24px', lineHeight: 1.1, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Stop Guessing. Start Executing.</h1>
          <p style={{ fontFamily: FONT_MONO, fontSize: '18px', color: 'rgba(255,255,255,0.7)', margin: '0 0 40px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.8 }}>Your Next Step OS Audit is a comprehensive review of your systems, bottlenecks, and opportunities. Get a clear roadmap in 48 hours.</p>
          {auditLink && <a href={auditLink} className="cta-shimmer" style={{ display: 'inline-block', padding: '18px 48px', color: '#000', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '16px', textDecoration: 'none', borderRadius: '14px', cursor: 'pointer', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Get the Audit — $197</a>}
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px', marginBottom: '80px' }}>
          {[{ icon: '🎯', title: 'Strategic Clarity', desc: 'Get a comprehensive audit of your current systems' }, { icon: '📊', title: 'Data-Driven', desc: 'Understand what\'s working and what needs optimization' }, { icon: '🚀', title: 'Actionable Roadmap', desc: 'Leave with a clear, prioritized plan for growth' }, { icon: '⏱️', title: '48-Hour Delivery', desc: 'Get your full audit in just 2 days' }].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.6 }} className="floating-card" style={{ padding: '32px 24px', background: 'linear-gradient(135deg, rgba(255,255,255,0.048) 0%, rgba(255,255,255,0.018) 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', backdropFilter: 'blur(24px)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontFamily: FONT_SYNE, fontSize: '18px', fontWeight: 800, margin: '0 0 12px', color: '#fff' }}>{f.title}</h3>
              <p style={{ fontFamily: FONT_MONO, fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 2 }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Next Step OS • Secure payments with Stripe • No hidden fees</p>
      </div>
    </div>
  );
}
