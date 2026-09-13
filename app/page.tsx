'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPaymentLink } from '@/lib/payment-links';

const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';
const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';

const STYLES = `
  @keyframes drift1 {
    0%,100% { transform: translate(0,0) scale(1) }
    33% { transform: translate(40px,-25px) scale(1.08) }
    66% { transform: translate(-15px,20px) scale(0.95) }
  }
  @keyframes drift2 {
    0%,100% { transform: translate(0,0) scale(1) }
    33% { transform: translate(-25px,40px) scale(1.06) }
    66% { transform: translate(35px,-15px) scale(0.96) }
  }
  @keyframes drift3 {
    0%,100% { transform: translate(0,0) scale(1) }
    33% { transform: translate(15px,35px) scale(0.98) }
    66% { transform: translate(-30px,-10px) scale(1.05) }
  }
  @keyframes nsGlow {
    0%,100% { box-shadow: 0 0 16px rgba(251,191,36,0.45), 0 0 4px rgba(251,191,36,0.2); transform: scale(1); }
    50% { box-shadow: 0 0 48px rgba(251,191,36,0.95), 0 0 80px rgba(251,191,36,0.35), 0 0 0 2px rgba(251,191,36,0.25); transform: scale(1.04); }
  }
  @keyframes shimmer {
    0% { background-position: -200% center }
    100% { background-position: 200% center }
  }
  @keyframes float {
    0%,100% { transform: translateY(0px) }
    50% { transform: translateY(-20px) }
  }
  .cta-shimmer {
    background: linear-gradient(90deg, #d97706, #fbbf24, #fef9ec, #fbbf24, #d97706);
    background-size: 300% auto;
    animation: shimmer 3.2s linear infinite;
  }
  .floating-card {
    animation: float 4s ease-in-out infinite;
  }
`;

const FEATURES = [
  {
    icon: '🎯',
    title: 'Strategic Clarity',
    description: 'Get a comprehensive audit of your current systems and identify gaps',
    delay: 0.1,
  },
  {
    icon: '📊',
    title: 'Data-Driven Insights',
    description: 'Understand what\'s working and what needs optimization',
    delay: 0.2,
  },
  {
    icon: '🚀',
    title: 'Actionable Roadmap',
    description: 'Leave with a clear, prioritized plan for growth',
    delay: 0.3,
  },
  {
    icon: '⏱️',
    title: '48-Hour Delivery',
    description: 'Get your full audit and recommendations in just 2 days',
    delay: 0.4,
  },
];

export default function Home() {
  const [auditLink, setAuditLink] = useState('');

  useEffect(() => {
    getPaymentLink('audit').then(setAuditLink).catch(err => {
      console.error('Failed to load payment link:', err);
      setAuditLink('');
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0a18 40%, #0a0d1a 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <style>{STYLES}</style>

      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 70%)', animation: 'drift1 9s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '660px', height: '660px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', animation: 'drift2 12s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', left: '30%', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', animation: 'drift3 15s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 0', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'nsGlow 3s ease-in-out infinite' }}>
            <span style={{ fontFamily: FONT_SYNE, fontSize: '24px', fontWeight: 900, color: '#000' }}>NS</span>
          </div>
          <span style={{ fontFamily: FONT_SYNE, fontSize: '20px', fontWeight: 800 }}>Next Step OS</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/pricing" style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '10px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            Pricing
          </Link>
          <Link href="/partner" style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '10px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            For Partners
          </Link>
        </div>
      </motion.div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 120px', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h1 style={{ fontFamily: FONT_SYNE, fontSize: '64px', fontWeight: 900, margin: '0 0 24px', lineHeight: 1.1, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Stop Guessing.<br />Start Executing.
          </h1>
          <p style={{ fontFamily: FONT_MONO, fontSize: '18px', color: 'rgba(255,255,255,0.7)', margin: '0 0 40px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.8 }}>
            Your Next Step OS Audit is a comprehensive review of your systems, bottlenecks, and opportunities. Get a clear roadmap in 48 hours.
          </p>

          {auditLink ? (
            <a href={auditLink} style={{ display: 'inline-block', padding: '18px 48px', background: 'linear-gradient(90deg, #d97706, #fbbf24, #fef9ec, #fbbf24, #d97706)', backgroundSize: '300% auto', color: '#000', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '16px', textDecoration: 'none', borderRadius: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 12px 48px rgba(251,191,36,0.35)', animation: 'shimmer 3.2s linear infinite', letterSpacing: '0.05em', textTransform: 'uppercase' }} className="cta-shimmer">
              Get the Audit — $197
            </a>
          ) : (
            <div style={{ display: 'inline-block', padding: '18px 48px', background: 'rgba(251,191,36,0.2)', color: '#fbbf24', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '16px', borderRadius: '14px', textTransform: 'uppercase', opacity: 0.6 }}>
              Loading...
            </div>
          )}
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px', marginBottom: '80px' }}>
          {FEATURES.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay, duration: 0.6 }}
              style={{
                padding: '32px 24px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.048) 0%, rgba(255,255,255,0.018) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                backdropFilter: 'blur(24px)',
              }}
              className="floating-card"
            >
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>{feature.icon}</div>
              <h3 style={{ fontFamily: FONT_SYNE, fontSize: '18px', fontWeight: 800, margin: '0 0 12px', color: '#fff' }}>
                {feature.title}
              </h3>
              <p style={{ fontFamily: FONT_MONO, fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ maxWidth: '700px', margin: '80px auto 0', textAlign: 'center' }}
        >
          <h2 style={{ fontFamily: FONT_SYNE, fontSize: '32px', fontWeight: 800, margin: '0 0 40px', color: '#fff' }}>
            What You Get
          </h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {[
              '✓ Tool audit & optimization opportunities',
              '✓ Bottleneck identification & solutions',
              '✓ Top 3 automation opportunities',
              '✓ Custom roadmap for next 90 days',
              '✓ Loom walkthrough of findings',
              '✓ Credit toward Lite or Pro (if you upgrade)',
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                style={{ padding: '16px 20px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px' }}
              >
                <p style={{ fontFamily: FONT_MONO, fontSize: '14px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  {item}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 2 }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          Next Step OS • Secure payments with Stripe • No hidden fees
        </p>
      </div>
    </div>
  );
}
