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
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px) }
    to { opacity: 1; transform: translateY(0) }
  }
  .card-glass { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
  .price-card { opacity: 0; animation: fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards; }
  .price-card:nth-child(1) { animation-delay: 0.1s; }
  .price-card:nth-child(2) { animation-delay: 0.2s; }
  .price-card:nth-child(3) { animation-delay: 0.3s; }
  .price-card:nth-child(4) { animation-delay: 0.4s; }
  .cta-btn {
    background: linear-gradient(90deg, #d97706, #fbbf24, #fef9ec, #fbbf24, #d97706);
    background-size: 300% auto;
    animation: shimmer 3.2s linear infinite;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(251,191,36,0.45); }
  .cta-btn:active { transform: scale(0.98); }
`;

interface Tier {
  name: string;
  price: string | number;
  description: string;
  terms: string;
  features: string[];
  isPrimary?: boolean;
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
}

interface Tier {
  name: string;
  price: string | number;
  description: string;
  terms: string;
  features: string[];
  isPrimary?: boolean;
  isPopular?: boolean;
  ctaText: string;
  tierKey: 'audit' | 'lite' | 'pro' | 'partner';
}

const TIERS: Tier[] = [
  {
    name: 'OS Audit',
    price: 197,
    description: 'One-time comprehensive audit',
    terms: 'One-time, 48-hr delivery',
    features: [
      'Tool audit & bottleneck map',
      'Top 3 automation opportunities',
      'Loom walkthrough',
      'Credited toward Lite/Pro upgrade',
    ],
    isPrimary: true,
    ctaText: 'Get the Audit',
    tierKey: 'audit',
  },
  {
    name: 'Operator Lite',
    price: 997,
    description: 'Ongoing support & strategy',
    terms: 'Month-to-month',
    features: [
      'One monthly strategy call',
      'System tune-ups & optimization',
      'Async questions answered',
      'For founders running execution',
    ],
    isPopular: true,
    ctaText: 'Start Lite',
    tierKey: 'lite',
  },
  {
    name: 'Operator Pro',
    price: 1997,
    description: 'Hands-on execution & support',
    terms: '3-month minimum, 5 seats',
    features: [
      'Weekly strategy calls',
      'Hands-on execution support',
      'Workflows & systems built',
      'Follow-up systems maintained',
      'Async access & support',
      'Team seats included',
    ],
    ctaText: 'Start Pro',
    tierKey: 'pro',
  },
  {
    name: 'Licensed Partner',
    price: 2997,
    description: 'White-label the OS Audit',
    terms: 'Annual, renewable',
    features: [
      'White-label OS Audit framework',
      'Claude prompt system & templates',
      'Creative templates & resources',
      'Onboarding call',
      'Quarterly toolkit updates',
      'Keep 100% of client revenue',
    ],
    ctaText: 'Become a Partner',
    tierKey: 'partner',
  },
];

export default function PricingPage() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [paymentLinks, setPaymentLinks] = useState<Record<string, string>>({
    audit: '',
    lite: '',
    pro: '',
    partner: '',
  });

  useEffect(() => {
    Promise.all([
      getPaymentLink('audit').then(url => ({ audit: url })),
      getPaymentLink('lite').then(url => ({ lite: url })),
      getPaymentLink('pro').then(url => ({ pro: url })),
      getPaymentLink('partner').then(url => ({ partner: url })),
    ]).then(results => {
      const merged = Object.assign({}, ...results);
      setPaymentLinks(merged);
    }).catch(err => console.error('Failed to load payment links:', err));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0a18 40%, #0a0d1a 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
      <style>{STYLES}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 70%)', animation: 'drift1 9s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-20%', left: '-10%', width: '660px', height: '660px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', animation: 'drift2 12s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', left: '30%', width: '340px', height: '340px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)', animation: 'drift3 15s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 0', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'nsGlow 3s ease-in-out infinite' }}>
            <span style={{ fontFamily: FONT_SYNE, fontSize: '18px', fontWeight: 900, color: '#000' }}>NS</span>
          </div>
          <span style={{ fontFamily: FONT_SYNE, fontSize: '18px', fontWeight: 800, color: '#fff' }}>Next Step OS</span>
        </Link>
        <Link href="/partner" style={{ fontFamily: FONT_MONO, fontSize: '12px', color: '#fbbf24', textDecoration: 'none', padding: '8px 16px', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '8px' }}>
          For Partners
        </Link>
      </motion.div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px 0', position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '80px' }}
      >
        <h1 style={{ fontFamily: FONT_SYNE, fontSize: '48px', fontWeight: 900, margin: '0 0 16px', lineHeight: 1.1, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Choose Your Path
        </h1>
        <p style={{ fontFamily: FONT_MONO, fontSize: '16px', color: 'rgba(255,255,255,0.6)', margin: '0 0 24px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
          Start with a one-time audit or scale with ongoing support. Upgrade anytime.
        </p>
      </motion.div>

      {/* Pricing Grid */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px 80px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {TIERS.map((tier, idx) => (
            <motion.div
              key={idx}
              className="price-card card-glass"
              onHoverStart={() => setHoveredIdx(idx)}
              onHoverEnd={() => setHoveredIdx(null)}
              whileHover={{ y: -8 }}
              style={{
                background: tier.isPrimary
                  ? 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(251,191,36,0.04) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.048) 0%, rgba(255,255,255,0.018) 100%)',
                borderRadius: '24px',
                padding: '32px 24px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: tier.isPrimary
                  ? '0 0 0 1px rgba(251,191,36,0.5), inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 48px rgba(251,191,36,0.15)'
                  : '0 0 0 1px rgba(255,255,255,0.055), inset 0 1px 0 rgba(255,255,255,0.12), 0 8px 48px rgba(251,191,36,0.06)',
                border: tier.isPrimary ? '2px solid rgba(251,191,36,0.4)' : '1px solid rgba(255,255,255,0.055)',
              }}
            >
              {tier.isPrimary && (
                <div style={{ position: 'absolute', top: '-1px', left: '20px', background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)', height: '1px', width: '100px' }} />
              )}

              {tier.isPopular && (
                <div style={{ display: 'inline-block', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '8px', padding: '4px 12px', marginBottom: '16px' }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: '10px', color: '#fbbf24', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>⭐ POPULAR</span>
                </div>
              )}

              {tier.isPrimary && (
                <div style={{ display: 'inline-block', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '8px', padding: '4px 12px', marginBottom: '16px' }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: '10px', color: '#fbbf24', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>🚀 START HERE</span>
                </div>
              )}

              <h3 style={{ fontFamily: FONT_SYNE, fontSize: '24px', fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>{tier.name}</h3>
              <p style={{ fontFamily: FONT_MONO, fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '0 0 20px', lineHeight: 1.6 }}>
                {tier.description}
              </p>

              <div style={{ marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: FONT_SYNE, fontSize: '40px', fontWeight: 900, color: tier.isPrimary ? '#fbbf24' : '#fff' }}>
                    ${tier.price}
                  </span>
                </div>
                <span style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                  {tier.terms}
                </span>
              </div>

              <div style={{ marginBottom: '32px' }}>
                {tier.features.map((feature, fidx) => (
                  <div key={fidx} style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '16px', marginTop: '2px', flexShrink: 0 }}>✓</span>
                    <span style={{ fontFamily: FONT_MONO, fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{feature}</span>
                  </div>
                ))}
              </div>

              <motion.a
                href={paymentLinks[tier.tierKey] || 'javascript:void(0)'}
                onClick={(e) => !paymentLinks[tier.tierKey] && e.preventDefault()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cta-btn"
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '14px 20px',
                  color: '#000',
                  border: 'none',
                  borderRadius: '12px',
                  fontFamily: FONT_SYNE,
                  fontWeight: 800,
                  fontSize: '13px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 8px 32px rgba(251,191,36,0.3)',
                  textDecoration: 'none',
                  textAlign: 'center',
                  opacity: paymentLinks[tier.tierKey] ? 1 : 0.6,
                }}
              >
                {paymentLinks[tier.tierKey] ? tier.ctaText : 'Loading...'}
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ maxWidth: '700px', margin: '0 auto', padding: '80px 20px 80px', position: 'relative', zIndex: 2 }}
      >
        <h2 style={{ fontFamily: FONT_SYNE, fontSize: '28px', fontWeight: 800, margin: '0 0 40px', textAlign: 'center', color: '#fff' }}>Questions?</h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          {[
            { q: 'Can I upgrade from Audit to Lite/Pro?', a: 'Yes! Your Audit payment is credited toward your first month of Lite or Pro.' },
            { q: 'What\'s included in Pro?', a: 'Weekly calls, hands-on execution support, and maintained systems. Perfect for teams wanting active help.' },
            { q: 'Can I downgrade anytime?', a: 'Absolutely. Lite and Pro are month-to-month (except Pro\'s 3-month minimum). Cancel anytime.' },
            { q: 'Is there a refund policy?', a: 'Yes, Audit has a 7-day money-back guarantee. Lite and Pro are month-to-month with no lock-in.' },
          ].map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
            >
              <p style={{ fontFamily: FONT_SYNE, fontSize: '14px', fontWeight: 700, color: '#fbbf24', margin: '0 0 8px' }}>{faq.q}</p>
              <p style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <div style={{ textAlign: 'center', paddingBottom: '40px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '40px', position: 'relative', zIndex: 2 }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: '11px', color: 'rgba(255,255,255,0.2)', margin: 0 }}>
          Next Step OS • Secure payments with Stripe • No hidden fees
        </p>
      </div>
    </div>
  );
}
