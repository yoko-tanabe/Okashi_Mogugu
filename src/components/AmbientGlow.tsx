'use client';

export default function AmbientGlow({ warmOpacity = 0.04 }: { warmOpacity?: number }) {
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: '-20%',
          right: '-20%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(124,92,252,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '-20%',
          left: '-20%',
          width: '60%',
          height: '60%',
          background: `radial-gradient(circle, rgba(245,158,66,${warmOpacity}) 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </>
  );
}
