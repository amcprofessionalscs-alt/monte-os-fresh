'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getPaymentLink } from '@/lib/payment-links';

const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';
const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';

const TIERS = [
  { name: 'OS Audit', price: 197, description: 'One-time audit', terms: 'One-time, 48-hr', features: ['Tool audit', 'Bottleneck map', 'Top 3 opportunities', 'Loom walkthrough'], key: 'audit' as const, ctaLink: '/book' },
  { name: 'Operator Lite', price: 997, description: 'Monthly support', terms: 'Month-to-month', features: ['Monthly call', 'System tune-ups', 'Async questions', 'For founders'], key: 'lite' as const, ctaLink: '/book' },
  { name: 'Operator Pro', price: 1997, description: 'Hands-on execution', terms: '3-month minimum', features: ['Weekly calls', 'Execution support', 'Systems built', 'Maintained'], key: 'pro' as const, ctaLink: '/book' },
  { name: 'Licensed Partner', price: 2997, description: 'White-label OS', terms: 'Annual', features: ['White-label framework', 'Prompt system', 'Templates', 'Keep 100% revenue'], key: 'partner' as const, ctaLink: '/book' },
];

export default function PricingPage() {
  const [links, setLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all(TIERS.map(t => getPaymentLink(t.key).then(url => ({ [t.key]: url })))).then(results => {
      setLinks(Object.assign({}, ...results));
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0a18 40%, #0a0d1a 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes drift1 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(40px,-25px) } }
        @keyframes drift2 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(-25px,40px) } }
        @keyframes drift3 { 0%,100% { transform: translate(0,0) } 50% { transform: translate(15px,35px) } }
        @keyframes shimmer { 0% { background-position: -200% } 100% { background-position: 200% } }
        .drift1 { animation: drift1 9s ease-in-out infinite; }
        .drift2 { animation: drift2 12s ease-in-out infinite; }
        .drift3 { animation: drift3 15s ease-in-out infinite; }
        .shimmer { background: linear-gradient(90deg, #d97706, #fbbf24, #fef9ec, #fbbf24, #d97706); background-size: 300% auto; animation: shimmer 3.2s linear infinite; }
      `}</style>

      <div className="drift1" style={{ position: 'fixed', top: '-15%', right: '-10%', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div className="drift2" style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '660px', height: '660px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div className="drift3" style={{ position: 'fixed', top: '40%', left: '30%', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px', position: 'relative', zIndex: 2 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: FONT_SYNE, fontSize: '18px', fontWeight: 900, color: '#000' }}>NS</span>
            </div>
            <span style={{ fontFamily: FONT_SYNE, fontSize: '18px', fontWeight: 800 }}>Next Step OS</span>
          </div>
          <Link href="/partner" style={{ fontFamily: FONT_MONO, fontSize: '12px', color: '#fbbf24', textDecoration: 'none', padding: '8px 16px', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '8px' }}>For Partners</Link>
        </motion.div>

        <h1 style={{ fontFamily: FONT_SYNE, fontSize: '48px', fontWeight: 900, margin: '0 0 16px', textAlign: 'center', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Choose Your Path</h1>
        <p style={{ fontFamily: FONT_MONO, fontSize: '16px', color: 'rgba(255,255,255,0.6)', margin: '0 0 60px', textAlign: 'center' }}>Start with audit or scale with ongoing support.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '80px' }}>
          {TIERS.map((tier, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.048) 0%, rgba(255,255,255,0.018) 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '32px 24px', backdropFilter: 'blur(24px)' }}>
              <h3 style={{ fontFamily: FONT_SYNE, fontSize: '24px', fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>{tier.name}</h3>
              <p style={{ fontFamily: FONT_MONO, fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '0 0 20px' }}>{tier.description}</p>
              <div style={{ marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontFamily: FONT_SYNE, fontSize: '40px', fontWeight: 900, color: '#fbbf24' }}>${tier.price}</span>
                <p style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0' }}>{tier.terms}</p>
              </div>
              <div style={{ marginBottom: '32px' }}>
                {tier.features.map((f, i) => <div key={i} style={{ fontFamily: FONT_MONO, fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>✓ {f}</div>)}
              </div>
              {links[tier.key] && <a href={links[tier.key]} className="shimmer" style={{ display: 'block', width: '100%', padding: '14px 20px', color: '#000', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '13px', border: 'none', borderRadius: '12px', cursor: 'pointer', textDecoration: 'none', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Get Started</a>}
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 2 }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>Next Step OS • Secure payments with Stripe</p>
      </div>
    </div>
  );
}
