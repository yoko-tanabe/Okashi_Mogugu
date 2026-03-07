'use client';
import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { MapPin, User } from 'lucide-react';
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
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);
  const [swiped, setSwiped] = useState(false);

  const country = COUNTRIES.find(c => c.code === card.user.nationality);
  const toku = getTokuLevel(card.user.tokuPoints);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (swiped) return;
    if (info.offset.x > 100 || info.velocity.x > 500) {
      setSwiped(true);
      animate(x, 500, { duration: 0.3 }).then(onSwipeRight);
    } else if (info.offset.x < -100 || info.velocity.x < -500) {
      setSwiped(true);
      animate(x, -500, { duration: 0.3 }).then(onSwipeLeft);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
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
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      onClick={onTap}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Swipe indicators */}
        <motion.div
          style={{
            position: 'absolute',
            top: 24,
            left: 24,
            zIndex: 10,
            opacity: likeOpacity,
            background: 'rgba(74,222,128,0.2)',
            border: '2px solid #4ADE80',
            borderRadius: 12,
            padding: '8px 20px',
            fontSize: 20,
            fontWeight: 700,
            color: '#4ADE80',
            transform: 'rotate(-15deg)',
          }}
        >
          LIKE
        </motion.div>
        <motion.div
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            zIndex: 10,
            opacity: passOpacity,
            background: 'rgba(239,68,68,0.2)',
            border: '2px solid #EF4444',
            borderRadius: 12,
            padding: '8px 20px',
            fontSize: 20,
            fontWeight: 700,
            color: '#EF4444',
            transform: 'rotate(15deg)',
          }}
        >
          PASS
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
          <User size={80} color="rgba(255,255,255,0.2)" />
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
              {card.user.freeText}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
