'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { checkCustomerPaymentStatus } from '@/lib/payments';
import { OnboardingForm } from '@/components';

const FONT_SYNE = 'var(--font-syne), Syne, sans-serif';
const FONT_MONO = 'var(--font-dm-mono), DM Mono, monospace';

function PaymentSuccessContent() {
  const [isVerified, setIsVerified] = useState(false);
  const [product, setProduct] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const productType = searchParams.get('product');

      if (!sessionId) {
        setError('No session found');
        setTimeout(() => router.push('/pricing'), 3000);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        // Check payment status in database
        const paymentStatus = await checkCustomerPaymentStatus(session.user.id);

        if (paymentStatus.hasPaid) {
          setProduct(paymentStatus.productType || 'Unknown');
          setUserId(session.user.id);
          setIsVerified(true);
          setShowOnboarding(true);
        } else {
          setError('Payment verification failed. Please contact support.');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Failed to verify payment. Please try again.');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  const handleOnboardingComplete = () => {
    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0f0a1a 50%,#0a0f1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', padding: '20px' }}>
      <style>{`
        @keyframes nsPulse {
          0%,100% { opacity:0.4;transform:scale(1); }
          50% { opacity:1;transform:scale(1.08); }
        }
        @keyframes fadeUp {
          from { opacity:0;transform:translateY(24px); }
          to { opacity:1;transform:translateY(0); }
        }
        @keyframes spin {
          from { transform:rotate(0deg); }
          to { transform:rotate(360deg); }
        }
      `}</style>

      <div style={{ maxWidth: '500px', margin: '0 auto', animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards' }}>
        {isVerified && showOnboarding ? (
          <>
            <div style={{ marginBottom: '28px' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'nsPulse 2s ease-in-out infinite', boxShadow: '0 0 60px rgba(16,185,129,0.4)', fontSize: '32px' }}>
                ✓
              </div>
              <h1 style={{ fontFamily: FONT_SYNE, fontSize: '28px', fontWeight: 800, margin: '0 0 8px', color: '#fff', textAlign: 'center' }}>Payment Confirmed!</h1>
              <p style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0, textAlign: 'center' }}>
                Welcome! Let's personalize your experience.
              </p>
            </div>
            <OnboardingForm userId={userId} onComplete={handleOnboardingComplete} />
          </>
        ) : isVerified ? (
          <>
            <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg,#10b981,#059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'nsPulse 2s ease-in-out infinite', boxShadow: '0 0 60px rgba(16,185,129,0.4)', fontSize: '32px' }}>
              ✓
            </div>
            <h1 style={{ fontFamily: FONT_SYNE, fontSize: '32px', fontWeight: 800, margin: '0 0 12px', color: '#fff' }}>Payment Confirmed!</h1>
            <p style={{ fontFamily: FONT_MONO, fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '0 0 28px', lineHeight: 1.7 }}>
              You now have access to your {product} and the Monte OS dashboard.
            </p>
            <p style={{ fontFamily: FONT_MONO, fontSize: '12px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Redirecting to your dashboard in a moment...
            </p>
          </>
        ) : error ? (
          <>
            <div style={{ width: '72px', height: '72px', borderRadius: '20px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 60px rgba(239,68,68,0.4)', fontSize: '32px' }}>
              ✕
            </div>
            <h1 style={{ fontFamily: FONT_SYNE, fontSize: '32px', fontWeight: 800, margin: '0 0 12px', color: '#fff' }}>Payment Issue</h1>
            <p style={{ fontFamily: FONT_MONO, fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '0 0 28px', lineHeight: 1.7 }}>
              {error}
            </p>
            <button
              onClick={() => router.push('/pricing')}
              style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', border: 'none', borderRadius: '12px', color: '#000', fontFamily: FONT_SYNE, fontWeight: 800, fontSize: '12px', letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              Back to Pricing
            </button>
          </>
        ) : (
          <>
            <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'spin 2s linear infinite', boxShadow: '0 0 60px rgba(251,191,36,0.4)', fontSize: '24px' }}>
              ⚡
            </div>
            <h1 style={{ fontFamily: FONT_SYNE, fontSize: '28px', fontWeight: 800, margin: '0 0 12px', color: '#fff' }}>Verifying Payment...</h1>
            <p style={{ fontFamily: FONT_MONO, fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Please wait while we confirm your order.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0a0a0f 0%,#0f0a1a 50%,#0a0f1a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 2s linear infinite', boxShadow: '0 0 60px rgba(251,191,36,0.4)', fontSize: '24px' }}>⚡</div></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
