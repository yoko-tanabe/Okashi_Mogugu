'use client';
import { Globe, Shield } from 'lucide-react';
import Logo from './Logo';

interface Props {
  onStart: () => void;
  onLogin: () => void;
}

export default function WelcomeScreen({ onStart, onLogin }: Props) {
  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Background photo overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'url("https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80") center/cover',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent 0%, #0B0E14 70%)',
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(245,158,66,0.07)',
          zIndex: 1,
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 40%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 40%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '80px 28px 40px',
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <Logo size={56} />
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 400, lineHeight: 1.3, marginBottom: 16 }}>
          Turn encounters
          <br />
          into <span className="gradient-text" style={{ fontWeight: 600 }}>connections</span>
        </h1>

        <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.7, marginBottom: 40 }}>
          Connect with travelers you crossed paths with.
          <br />
          A serendipitous matching app.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 'auto' }}>
          <FeatureCard
            icon={<Globe size={20} color="#A78BFA" />}
            title="Serendipitous encounters"
            desc="Travelers within 50m appear on your card"
          />
          <FeatureCard
            icon={<Shield size={20} color="#A78BFA" />}
            title="Safety first"
            desc="5-min delay & location blur for safety"
          />
        </div>

        <button className="btn-gradient" onClick={onStart} style={{ marginTop: 32 }}>
          Get Started
        </button>
        <button
          onClick={onLogin}
          style={{
            marginTop: 12,
            background: 'none',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 14,
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            padding: '14px 0',
            width: '100%',
            cursor: 'pointer',
          }}
        >
          Log In
        </button>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: '16px 18px',
      }}
    >
      <div style={{ marginTop: 2 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>{desc}</div>
      </div>
    </div>
  );
}
