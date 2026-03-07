'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, User, Clock, Check } from 'lucide-react';
import { useApp } from '@/lib/store';
import { COUNTRIES, getTokuLevel } from '@/lib/constants';

interface Props {
  matchId: string;
  onBack: () => void;
}

export default function ChatScreen({ matchId, onBack }: Props) {
  const { state, dispatch } = useApp();
  const [input, setInput] = useState('');
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds
  const [confirmed, setConfirmed] = useState(false);
  const [metUp, setMetUp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const match = state.matches.find(m => m.id === matchId);
  const country = match ? COUNTRIES.find(c => c.code === match.user.nationality) : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  useEffect(() => {
    if (!timerStarted) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStarted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    dispatch({
      type: 'SEND_MESSAGE',
      message: {
        id: `msg-${Date.now()}`,
        senderId: 'me',
        text: input.trim(),
        timestamp: new Date().toISOString(),
      },
    });
    setInput('');
  };

  const handleConfirmMeet = () => {
    setConfirmed(true);
    setTimerStarted(true);
  };

  const handleMetUp = () => {
    if (match) {
      dispatch({ type: 'MET_UP', matchId: match.id });
      setMetUp(true);
    }
  };

  if (!match) return null;

  return (
    <div className="page-container" style={{ background: 'var(--bg)', display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(11,14,20,0.95)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(124,92,252,0.2), rgba(245,158,66,0.15))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <User size={18} color="rgba(255,255,255,0.3)" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            {match.user.name} {country?.flag}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
            {getTokuLevel(match.user.tokuPoints).emoji} {getTokuLevel(match.user.tokuPoints).title}
          </div>
        </div>
      </div>

      {/* Timer bar */}
      {timerStarted && (
        <div style={{
          padding: '10px 16px',
          background: timeLeft < 600 ? 'rgba(239,68,68,0.1)' : 'var(--surface-active)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          flexShrink: 0,
        }}>
          <Clock size={16} color={timeLeft < 600 ? '#EF4444' : 'var(--accent-light)'} />
          <span style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: timeLeft < 600 ? '#EF4444' : 'var(--accent-light)' }}>
            {formatTime(timeLeft)}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>remaining</span>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {state.messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.senderId === 'me' ? 'flex-end' : 'flex-start',
              marginBottom: 12,
            }}
          >
            <div style={{
              maxWidth: '75%',
              padding: '10px 16px',
              borderRadius: msg.senderId === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.senderId === 'me'
                ? 'linear-gradient(135deg, #7C5CFC, #6B4FD8)'
                : 'var(--surface)',
              fontSize: 14,
              lineHeight: 1.5,
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Meet up success */}
      {metUp && (
        <div style={{
          padding: '20px',
          background: 'rgba(74,222,128,0.1)',
          borderTop: '1px solid rgba(74,222,128,0.2)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#4ADE80' }}>You met up!</div>
          <div style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4 }}>+30 Toku points earned. Stamp added to your passport!</div>
        </div>
      )}

      {/* Action buttons area */}
      {!metUp && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {!confirmed && (
            <button
              onClick={handleConfirmMeet}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 14,
                background: 'var(--surface-active)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent-light)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Check size={16} /> Confirm meetup
            </button>
          )}

          {timerStarted && !metUp && (
            <button
              onClick={handleMetUp}
              className="btn-gradient"
              style={{ marginBottom: 12 }}
            >
              We met! 🎉
            </button>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input-field"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{ flex: 1 }}
            />
            <button
              onClick={handleSend}
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'var(--accent)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
