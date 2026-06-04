'use client';

export function NSBadge({ size = 40 }: { size?: number }) {
  const r = Math.round(size * 0.28);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: 'linear-gradient(135deg,#fbbf24,#f59e0b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'ns-glow 3s ease-in-out infinite',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontSize: Math.round(size * 0.38),
          fontWeight: 900,
          color: '#000',
          lineHeight: 1,
        }}
      >
        NS
      </span>
    </div>
  );
}
