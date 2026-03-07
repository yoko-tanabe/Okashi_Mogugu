'use client';
import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import Logo from './Logo';
import AmbientGlow from './AmbientGlow';

interface Props {
  onBack: () => void;
  onLogin: (email: string, password: string) => void;
  error?: string;
}

export default function LoginScreen({ onBack, onLogin, error }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const canSubmit = email.trim() !== '' && password.trim() !== '';

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <AmbientGlow warmOpacity={0.03} />

      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 24px 40px' }}>
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 15,
            padding: '8px 0',
            marginBottom: 32,
          }}
        >
          <ChevronLeft size={18} /> Back
        </button>

        <div style={{ marginBottom: 32 }}>
          <Logo size={48} />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 36 }}>
          Log in to your account
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 8, display: 'block' }}>Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 8, display: 'block' }}>Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          {error && (
            <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 12, textAlign: 'center' }}>{error}</p>
          )}
          <button
            className="btn-gradient"
            disabled={!canSubmit}
            onClick={() => onLogin(email, password)}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}
