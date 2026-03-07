'use client';
import { User, MessageCircle, Clock } from 'lucide-react';
import { useApp } from '@/lib/store';
import { getTokuLevel, COUNTRIES } from '@/lib/constants';
import AmbientGlow from './AmbientGlow';

interface Props {
  onOpenChat: (matchId: string) => void;
}

export default function MatchesScreen({ onOpenChat }: Props) {
  const { state } = useApp();
  const matched = state.matches.filter(m => m.status === 'matched');
  const pending = state.matches.filter(m => m.status === 'pending_received' || m.status === 'pending_sent');

  return (
    <div className="page-container" style={{ background: 'var(--bg)', paddingBottom: 80 }}>
      <AmbientGlow />

      <div style={{ padding: '16px 24px', position: 'relative', zIndex: 2 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
          <span className="gradient-text">Matches</span>
        </h1>

        {/* Matched */}
        {matched.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 12 }}>
              Matched ({matched.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {matched.map(m => {
                const country = COUNTRIES.find(c => c.code === m.user.nationality);
                const toku = getTokuLevel(m.user.tokuPoints);
                return (
                  <div
                    key={m.id}
                    className="card-surface"
                    style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                    onClick={() => onOpenChat(m.id)}
                  >
                    <div style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(124,92,252,0.2), rgba(245,158,66,0.15))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <User size={24} color="rgba(255,255,255,0.3)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 600 }}>{m.user.name}</span>
                        <span>{country?.flag}</span>
                        <span style={{ fontSize: 11, color: 'var(--accent-light)' }}>{toku.emoji} {toku.title}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                        {m.user.hobbyTags.slice(0, 3).join(' / ')}
                      </div>
                    </div>
                    <MessageCircle size={20} color="var(--accent-light)" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pending */}
        {pending.length > 0 && (
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 12 }}>
              Pending ({pending.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pending.map(m => {
                const country = COUNTRIES.find(c => c.code === m.user.nationality);
                return (
                  <div key={m.id} className="card-surface" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      background: 'var(--surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <User size={24} color="rgba(255,255,255,0.2)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 16, fontWeight: 600 }}>{m.user.name}</span>
                        <span>{country?.flag}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} />
                        {m.status === 'pending_sent' ? 'Waiting for response' : 'Wants to meet you!'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {matched.length === 0 && pending.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-sub)' }}>
            <Users2 />
            <p style={{ marginTop: 16 }}>No matches yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Swipe right on travelers you want to meet!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Users2() {
  return <User size={48} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto' }} />;
}
