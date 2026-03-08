'use client';
import { useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { MapPin, User, Heart, X } from 'lucide-react';
import { EncounterCard } from '@/lib/types';
import { getTokuLevel, COUNTRIES } from '@/lib/constants';

interface Props {
  card: EncounterCard;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onTap: () => void;
}

export default function SwipeCard({ card, onSwipeRight, onSwipeLeft, onTap }: Props) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const passOpacity = useTransform(x, [-80, 0], [1, 0]);
  const likeScale = useTransform(x, [0, 80, 140], [0.5, 1, 1.15]);
  const passScale = useTransform(x, [-140, -80, 0], [1.15, 1, 0.5]);
  const cardBorderLike = useTransform(x, [0, 120], ['rgba(255,255,255,0)', 'rgba(167,139,250,0.5)']);
  const cardBorderPass = useTransform(x, [-120, 0], ['rgba(120,113,140,0.5)', 'rgba(255,255,255,0)']);
  const [swiped, setSwiped] = useState(false);

  const country = COUNTRIES.find(c => c.code === card.user.nationality);
  const toku = getTokuLevel(card.user.tokuPoints);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (swiped) return;
    if (info.offset.x > 100 || info.velocity.x > 500) {
      setSwiped(true);
      animate(x, 500, { duration: 0.25, ease: [0.32, 0.72, 0, 1] }).then(onSwipeRight);
    } else if (info.offset.x < -100 || info.velocity.x < -500) {
      setSwiped(true);
      animate(x, -500, { duration: 0.25, ease: [0.32, 0.72, 0, 1] }).then(onSwipeLeft);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 600, damping: 35 });
    }
  };

  return (
    <motion.div
      style={{
        x,
        rotate,
        position: 'absolute',
        width: '100%',
        cursor: 'grab',
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      onClick={onTap}
      whileDrag={{ cursor: 'grabbing' }}
    >
      <motion.div
        style={{
          background: 'var(--surface)',
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: useTransform(
            x,
            [-120, -40, 0, 40, 120],
            ['rgba(120,113,140,0.5)', 'rgba(120,113,140,0.25)', 'var(--border)', 'rgba(167,139,250,0.25)', 'rgba(167,139,250,0.5)']
          ),
          borderRadius: 24,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        {/* Like indicator — centered icon */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: likeOpacity,
            scale: likeScale,
            background: 'radial-gradient(circle at center, rgba(167,139,250,0.14) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(251,185,105,0.15))',
            backdropFilter: 'blur(24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 48px rgba(167,139,250,0.25)',
          }}>
            <Heart size={36} color="#A78BFA" fill="#A78BFA" />
          </div>
        </motion.div>

        {/* Pass indicator — centered icon */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: passOpacity,
            scale: passScale,
            background: 'radial-gradient(circle at center, rgba(120,113,140,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        >
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(120,113,140,0.18)',
            backdropFilter: 'blur(24px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 48px rgba(120,113,140,0.15)',
          }}>
            <X size={36} color="#8E86A4" strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* Avatar area */}
        <div
          style={{
            height: 340,
            background: `linear-gradient(135deg, rgba(124,92,252,0.15), rgba(245,158,66,0.1))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {card.user.avatarUrl ? (
            <img src={card.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', userSelect: 'none' }} draggable={false} />
          ) : (
            <User size={80} color="rgba(255,255,255,0.2)" />
          )}
          {/* Location badge */}
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 12,
              color: 'rgba(255,255,255,0.8)',
            }}
          >
            <MapPin size={14} />
            {card.location} &middot; {card.minutesAgo}min ago
          </div>
        </div>

        {/* Card content */}
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 22, fontWeight: 700 }}>{card.user.name}</span>
            <span style={{ fontSize: 20 }}>{country?.flag}</span>
            <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>{card.user.ageGroup}</span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 12,
                background: 'var(--surface-active)',
                border: '1px solid var(--accent-border)',
                borderRadius: 20,
                padding: '4px 12px',
                color: 'var(--accent-light)',
              }}
            >
              {toku.emoji} {toku.title}
            </span>
          </div>

          {/* Matching highlights */}
          {(card.matchingWords.length > 0 || card.matchingTags.length > 0) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {card.matchingWords.map(w => (
                <span
                  key={w}
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#FBB969',
                    background: 'rgba(245,158,66,0.12)',
                    borderRadius: 8,
                    padding: '4px 10px',
                  }}
                >
                  {w} matched!
                </span>
              ))}
              {card.matchingTags.map(t => (
                <span
                  key={t}
                  style={{
                    fontSize: 13,
                    color: 'var(--accent-light)',
                    background: 'var(--surface-active)',
                    borderRadius: 8,
                    padding: '4px 10px',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {card.user.hobbyTags.slice(0, 5).map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: 12,
                  color: 'var(--text-sub)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: '4px 12px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {card.user.freeText && (
            <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 12, lineHeight: 1.5 }}>
              {card.user.freeText.length > 200 ? card.user.freeText.slice(0, 200) + '…' : card.user.freeText}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
