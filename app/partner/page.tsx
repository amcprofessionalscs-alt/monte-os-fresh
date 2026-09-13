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
  .cta-shimmer {
    background: linear-gradient(90deg, #d97706, #fbbf24, #fef9ec, #fbbf24, #d97706);
    background-size: 300% auto;
    animation: shimmer 3.2s linear infinite;
  }
`;

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: '📦',
    title: 'White-Label Framework',
    description: 'Complete OS Audit methodology ready to rebrand as yours',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Prompts',
    description: 'Claude prompt system + creative templates built-in',
  },
  {
    icon: '💯',
    title: 'Keep 100% Revenue',
    description: 'Price it yourself. No platform fees, no revenue share.',
  },
  {
    icon: '📚',
    title: 'Creative Assets',
    description: 'Marketing templates, sales decks, and presentation materials',
  },
  {
    icon: '🎓',
    title: 'Onboarding Call',
    description: 'Personal walkthrough of the full framework + customization',
  },
  {
    icon: '🔄',
    title: 'Quarterly Updates',
    description: 'New templates, prompts, and strategies every quarter',
  },
];

interface ComparisonItem {
  feature: string;
  partner: string;
  others: string;
}

const COMPARISON: ComparisonItem[] = [
  {
    feature: 'Audit Framework',
    partner: '✓ Complete & customizable',
    others: '✗ Build from scratch',
  },
  {
    feature: 'Revenue Model',
    partner: '✓ Keep 100%',
    others: '✗ Split or commission-based',
  },
  {
    feature: 'AI Prompts',
    partner: '✓ Included',
    others: '✗ Not included',
  },
  {
    feature: 'Support',
    partner: '✓ Onboarding + quarterly updates',
    others: '✗ Usually absent',
  },
  {
    feature: 'Time to Market',
    partner: '✓ Launch in days',
    others: '✗ Months of development',
  },
];

export default function PartnerPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [partnerLink, setPartnerLink] = useState('');

  useEffect(() => {
    getPaymentLink('partner').then(setPartnerLink).catch(err => {
      console.error('Failed to load payment link:', err);
      setPartnerLink('https://checkout.stripe.com/pay/');
    });
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
        <Link href="/pricing" style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '8px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
          All Plans
        </Link>
      </motion.div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px 0', position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '80px' }}
      >
        <h1 style={{ fontFamily: FONT_SYNE, fontSize: '56px', fontWeight: 900, margin: '0 0 24px', lineHeight: 1.1, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          White-Label Your Audit
        </h1>
        <p style={{ fontFamily: FONT_MONO, fontSize: '18px', color: 'rgba(255,255,255,0.7)', margin: '0 0 40px', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.8 }}>
          Become an authorized partner. Use our framework, keep 100% of client revenue. Launch your audit service in days, not months.
        </p>

        <motion.a
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          href={partnerLink || 'javascript:void(0)'}
          onClick={(e) => !partnerLink && e.preventDefault()}
          style={{
            display: 'inline-block',
            padding: '18px 48px',
            background: 'linear-gradient(90deg, #d97706, #fbbf24, #fef9ec, #fbbf24, #d97706)',
            backgroundSize: '300% auto',
            color: '#000',
            fontFamily: FONT_SYNE,
            fontWeight: 800,
            fontSize: '16px',
            textDecoration: 'none',
            borderRadius: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 12px 48px rgba(251,191,36,0.35)',
            animation: 'shimmer 3.2s linear infinite',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
          className="cta-shimmer"
        >
          Become a Partner — $2,997/yr
        </motion.a>

        <p style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: '20px 0 0' }}>
          Annual license, renewable. Price your audits at $500–$5,000+. Keep it all.
        </p>
      </motion.div>

      {/* What's Included */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px 0', position: 'relative', zIndex: 2 }}
      >
        <h2 style={{ fontFamily: FONT_SYNE, fontSize: '36px', fontWeight: 800, margin: '0 0 40px', textAlign: 'center', color: '#fff' }}>
          What's Included
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '28px', marginBottom: '80px' }}>
          {BENEFITS.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              style={{
                padding: '32px 24px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.048) 0%, rgba(255,255,255,0.018) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                backdropFilter: 'blur(24px)',
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>{benefit.icon}</div>
              <h3 style={{ fontFamily: FONT_SYNE, fontSize: '18px', fontWeight: 800, margin: '0 0 12px', color: '#fff' }}>
                {benefit.title}
              </h3>
              <p style={{ fontFamily: FONT_MONO, fontSize: '13px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}>
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ maxWidth: '900px', margin: '80px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}
      >
        <h2 style={{ fontFamily: FONT_SYNE, fontSize: '32px', fontWeight: 800, margin: '0 0 40px', textAlign: 'center', color: '#fff' }}>
          Why Partner With Us
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '600px' }}>
            {COMPARISON.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '200px 1fr 1fr',
                  gap: '20px',
                  padding: '20px',
                  background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontFamily: FONT_MONO, fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>
                  {item.feature}
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                  {item.partner}
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                  {item.others}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Who Should Partner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ maxWidth: '900px', margin: '80px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}
      >
        <h2 style={{ fontFamily: FONT_SYNE, fontSize: '32px', fontWeight: 800, margin: '0 0 40px', textAlign: 'center', color: '#fff' }}>
          Perfect For
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          {[
            'Business coaches looking to add a premium service',
            'Consultants who want productized offerings',
            'Agencies wanting an audit / strategy tier',
            'Solopreneurs building a service business',
            'Existing course creators expanding revenue',
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{
                padding: '20px 24px',
                background: 'rgba(251,191,36,0.08)',
                border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: '12px',
              }}
            >
              <p style={{ fontFamily: FONT_MONO, fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                ✓ {item}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ maxWidth: '700px', margin: '80px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}
      >
        <h2 style={{ fontFamily: FONT_SYNE, fontSize: '28px', fontWeight: 800, margin: '0 0 40px', textAlign: 'center', color: '#fff' }}>
          Partner FAQ
        </h2>
        <div style={{ display: 'grid', gap: '16px' }}>
          {[
            { q: 'How do I customize the framework?', a: 'You get full access to rebrand, customize copy, adjust questions, and adapt the framework to your niche.' },
            { q: 'What if I need support?', a: 'Your partner license includes an onboarding call and quarterly updates with new templates and strategies.' },
            { q: 'Can I resell to my clients?', a: 'Yes! Price the audit however you want. We recommend $500–$5,000 depending on your market.' },
            { q: 'How long is the license?', a: 'Annual ($2,997/year), renewable. No long-term lock-in. Cancel anytime after the first year.' },
          ].map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                <p style={{ fontFamily: FONT_SYNE, fontSize: '14px', fontWeight: 700, color: '#fbbf24', margin: '0 0 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {faq.q}
                  <span style={{ fontSize: '12px' }}>{expandedFaq === idx ? '−' : '+'}</span>
                </p>
                {expandedFaq === idx && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.6 }}
                  >
                    {faq.a}
                  </motion.p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ maxWidth: '600px', margin: '80px auto 80px', padding: '0 20px', textAlign: 'center', position: 'relative', zIndex: 2 }}
      >
        <p style={{ fontFamily: FONT_MONO, fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '0 0 20px' }}>
          Ready to launch your audit service?
        </p>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="https://checkout.stripe.com/pay/cs_partner"
          style={{
            display: 'inline-block',
            padding: '16px 44px',
            background: 'linear-gradient(90deg, #d97706, #fbbf24, #fef9ec, #fbbf24, #d97706)',
            backgroundSize: '300% auto',
            color: '#000',
            fontFamily: FONT_SYNE,
            fontWeight: 800,
            fontSize: '14px',
            textDecoration: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '0 12px 48px rgba(251,191,36,0.35)',
            animation: 'shimmer 3.2s linear infinite',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
          className="cta-shimmer"
        >
          Become a Partner
        </motion.a>
      </motion.div>

      {/* Footer */}
      <div style={{ padding: '40px 20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', position: 'relative', zIndex: 2 }}>
        <p style={{ fontFamily: FONT_MONO, fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          Next Step OS • White-label partnership program
        </p>
      </div>
    </div>
  );
}
