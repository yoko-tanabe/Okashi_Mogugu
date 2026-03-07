'use client';

export default function Logo({ size = 56 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 40 40" fill="none">
        <path
          d="M8 32C8 32 14 8 20 8"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M32 32C32 32 26 8 20 8"
          stroke="#FBB969"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
        <circle cx="20" cy="20" r="3" fill="#A78BFA" />
      </svg>
    </div>
  );
}
