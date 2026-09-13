'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';
const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';

interface OnboardingFormProps {
  userId: string;
  onComplete?: () => void;
}

export function OnboardingForm({ userId, onComplete }: OnboardingFormProps) {
  const [businessType, setBusinessType] = useState('');
  const [challenge, setChallenge] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessType.trim() || !challenge.trim() || !contact.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Store onboarding info in customers table or separate table
      const { error } = await supabase.from('customers').update({
        metadata: {
          business_type: businessType,
          biggest_challenge: challenge,
          contact_method: contact,
          onboarded_at: new Date().toISOString(),
        },
      }).eq('user_id', userId);

      if (error) {
        console.error('Onboarding error:', error);
        // Still mark as submitted even if update fails
      }

      setSubmitted(true);
      onComplete?.();
    } catch (err) {
      console.error('Error:', err);
      setSubmitted(true);
      onComplete?.();
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>
          ✓
        </div>
        <h3 style={{ fontFamily: FONT_SYNE, fontSize: '20px', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>All Set!</h3>
        <p style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
          We'll be in touch soon. Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.048) 0%,rgba(255,255,255,0.018) 100%)', borderRadius: '20px', padding: '28px 24px', border: '1px solid rgba(255,255,255,0.055)', backdropFilter: 'blur(24px)' }}>
      <h2 style={{ fontFamily: FONT_SYNE, fontSize: '24px', fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>
        Quick Setup
      </h2>
      <p style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '0 0 24px' }}>
        Tell us a bit about your business so we can personalize your experience.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Business Type */}
        <div>
          <label style={{ display: 'block', fontFamily: FONT_SYNE, fontSize: '12px', fontWeight: 700, color: '#fbbf24', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Business Type
          </label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontFamily: FONT_MONO,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="">Select your business type...</option>
            <option value="solopreneur">Solopreneur / Freelancer</option>
            <option value="agency">Agency / Service Business</option>
            <option value="course">Course Creator</option>
            <option value="coaching">Coaching / Consulting</option>
            <option value="ecommerce">E-commerce / Products</option>
            <option value="saas">SaaS / Tech</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Biggest Challenge */}
        <div>
          <label style={{ display: 'block', fontFamily: FONT_SYNE, fontSize: '12px', fontWeight: 700, color: '#06b6d4', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Your Biggest Challenge
          </label>
          <textarea
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            placeholder="What's the #1 thing holding your business back right now?"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontFamily: FONT_MONO,
              fontSize: '13px',
              resize: 'none',
              minHeight: '80px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Best Way to Reach */}
        <div>
          <label style={{ display: 'block', fontFamily: FONT_SYNE, fontSize: '12px', fontWeight: 700, color: '#ec4899', marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Best Way to Reach You
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Phone, email, or preferred method..."
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontFamily: FONT_MONO,
              fontSize: '13px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(90deg,#d97706,#fbbf24,#fef9ec,#fbbf24,#d97706)',
            backgroundSize: '300% auto',
            animation: 'shimmer 3.2s linear infinite',
            border: 'none',
            borderRadius: '12px',
            color: '#000',
            fontFamily: FONT_SYNE,
            fontWeight: 800,
            fontSize: '13px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginTop: '12px',
          }}
        >
          {loading ? 'Setting up...' : 'Get Started'}
        </button>
      </form>

      <style>{`
        @keyframes shimmer {
          0%{background-position:-200% center} 100%{background-position:200% center}
        }
      `}</style>
    </div>
  );
}
