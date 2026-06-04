'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function IgnitionButton() {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      style={{ flex: 1.2 }}
    >
      <Link
        href="/ignite"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '52px',
          padding: '15px 20px',
          borderRadius: '16px',
          color: '#000',
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontWeight: 800,
          fontSize: '13px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          background: 'linear-gradient(90deg,#92400e,#d97706,#fbbf24,#fef3c7,#fbbf24,#d97706,#92400e)',
          backgroundSize: '300% auto',
          animation: 'shimmer 2.6s linear infinite',
          boxShadow: '0 8px 40px rgba(251,191,36,0.4)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        🔥 Daily Ignition
      </Link>
    </motion.div>
  );
}
