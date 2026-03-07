'use client';
import { ChevronLeft, User, MapPin, Globe, MessageCircle } from 'lucide-react';
import { EncounterCard } from '@/lib/types';
import { getTokuLevel, COUNTRIES } from '@/lib/constants';

interface Props {
  card: EncounterCard;
  onBack: () => void;
  onLike: () => void;
  onPass: () => void;
}

export default function ProfileDetailScreen({ card, onBack, onLike, onPass }: Props) {
  const { user } = card;
  const country = COUNTRIES.find(c => c.code === user.nationality);
  const toku = getTokuLevel(user.tokuPoints);

  return (
    <div className="page-container" style={{ background: 'var(--bg)', overflowY: 'auto', paddingBottom: 120 }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '16px 24px', background: 'rgba(11,14,20,0.9)', backdropFilter: 'blur(20px)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 15 }}>
          <ChevronLeft size={20} /> Back
        </button>
      </div>

      {/* Avatar */}
      <div style={{
        height: 300,
        background: 'linear-gradient(135deg, rgba(124,92,252,0.15), rgba(245,158,66,0.1))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <User size={80} color="rgba(255,255,255,0.2)" />
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(0,0,0,0.6)',
          borderRadius: 20,
          padding: '6px 14px',
          fontSize: 12,
          color: 'rgba(255,255,255,0.8)',
        }}>
          <MapPin size={14} />
          {card.location} &middot; {card.minutesAgo}min ago
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 26, fontWeight: 700 }}>{user.name}</span>
          <span style={{ fontSize: 24 }}>{country?.flag}</span>
          <span style={{ fontSize: 14, color: 'var(--text-sub)' }}>{user.ageGroup}</span>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--surface-active)',
          border: '1px solid var(--accent-border)',
          borderRadius: 20,
          padding: '6px 14px',
          fontSize: 13,
          color: 'var(--accent-light)',
          marginBottom: 24,
        }}>
          {toku.emoji} {toku.title} ({user.tokuPoints}pt)
        </div>

        {/* Matching highlights */}
        {(card.matchingWords.length > 0 || card.matchingTags.length > 0) && (
          <div className="card-surface" style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#FBB969' }}>Common interests</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {card.matchingWords.map(w => (
                <span key={w} style={{ fontSize: 13, fontWeight: 600, color: '#FBB969', background: 'rgba(245,158,66,0.12)', borderRadius: 8, padding: '4px 10px' }}>
                  {w}
                </span>
              ))}
              {card.matchingTags.map(t => (
                <span key={t} style={{ fontSize: 13, color: 'var(--accent-light)', background: 'var(--surface-active)', borderRadius: 8, padding: '4px 10px' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Hobby tags */}
        <Section title="Interests">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {user.hobbyTags.map(tag => (
              <span key={tag} className="tag-chip">{tag}</span>
            ))}
          </div>
        </Section>

        {/* Free text */}
        {user.freeText && (
          <Section title="About">
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6 }}>{user.freeText}</p>
          </Section>
        )}

        {/* Languages */}
        <Section title="Languages">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {user.languages.map(l => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-sub)' }}>
                <Globe size={14} /> {l}
              </span>
            ))}
          </div>
        </Section>

        {/* Travel style */}
        {user.travelStyle && (
          <Section title="Travel style">
            <span className="tag-chip selected">{user.travelStyle}</span>
          </Section>
        )}
      </div>

      {/* Action buttons */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 430,
        width: '100%',
        padding: '16px 24px calc(16px + env(safe-area-inset-bottom))',
        background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
        display: 'flex',
        gap: 12,
        zIndex: 10,
      }}>
        <button
          onClick={onPass}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: 28,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#EF4444',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Pass
        </button>
        <button
          onClick={onLike}
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: 28,
            background: 'linear-gradient(135deg, #7C5CFC, #F59E42)',
            border: 'none',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Want to meet!
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}
