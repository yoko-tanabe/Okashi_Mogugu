'use client';
import { useState } from 'react';
import { signUp, signIn } from '@/lib/supabase-helpers';
import Logo from './Logo';
import AmbientGlow from './AmbientGlow';

interface Props {
  onAuthenticated: () => void;
}

export default function AuthScreen({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  const handleSubmit = async () => {
    setError('');
    setConfirmMessage('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: authError } = await signUp(email, password);
        if (authError) {
          setError(authError.message);
        } else {
          setConfirmMessage('Check your email to confirm your account, then sign in.');
          setMode('signin');
        }
      } else {
        const { error: authError } = await signIn(email, password);
        if (authError) {
          setError(authError.message);
        } else {
          onAuthenticated();
        }
      }
    } catch (e) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <AmbientGlow warmOpacity={0.03} />

      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 28px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Logo size={48} />
          <h1 style={{ fontSize: 24, fontWeight: 600, marginTop: 16 }}>
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 8 }}>
            {mode === 'signup' ? 'Sign up to start connecting' : 'Sign in to continue'}
          </p>
        </div>

        {confirmMessage && (
          <div style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 16,
            fontSize: 13,
            color: '#22c55e',
          }}>
            {confirmMessage}
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 16,
            fontSize: 13,
            color: '#ef4444',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
          {mode === 'signup' && (
            <input
              className="input-field"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          )}
        </div>

        <button
          className="btn-gradient"
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: 24, opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Please wait...' : mode === 'signup' ? 'Sign Up' : 'Sign In'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); setConfirmMessage(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-light)', fontSize: 14, cursor: 'pointer' }}
          >
            {mode === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
