'use client';
import { useState, useMemo } from 'react';
import { Pause, Play } from 'lucide-react';
import { useApp } from '@/lib/store';
import { useNearbyEncounters } from '@/hooks/useNearbyEncounters';
import { EncounterCard } from '@/lib/types';
import SwipeCard from './SwipeCard';
import AmbientGlow from './AmbientGlow';

interface Props {
  onViewProfile: (cardId: string) => void;
  userId: string | null;
}

export default function HomeScreen({ onViewProfile, userId }: Props) {
  const { state, dispatch } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { nearbyUsers } = useNearbyEncounters(userId);

  const nearbyCards = useMemo<EncounterCard[]>(() =>
    nearbyUsers.map((u) => ({
      id: u.userId,
      user: {
        id: u.userId,
        name: u.name,
        nationality: u.nationality,
        gender: u.gender,
        birthDate: '',
        ageGroup: u.ageGroup,
        hobbyTags: u.hobbyTags,
        freeText: u.freeText,
        videoLinks: [],
        languages: u.languages,
        travelStyle: u.travelStyle,
        genderFilter: [],
        ageRangeMin: 18,
        ageRangeMax: 99,
        tokuPoints: u.tokuPoints,
        avatarUrl: u.avatarUrl,
        wantToMeetMode: true,
      },
      location: '近く',
      encounteredAt: u.encounteredAt,
      minutesAgo: Math.floor((Date.now() - new Date(u.encounteredAt).getTime()) / 60000),
      matchingTags: [],
      matchingWords: [],
      distance: 2,
    })),
  [nearbyUsers]);

  // 近くにいた人を先頭に、モックデータを後ろに結合
  const cards = useMemo(() => {
    const nearbyIds = new Set(nearbyCards.map((c) => c.id));
    const mockCards = state.encounters.filter((e) => !nearbyIds.has(e.id));
    return [...nearbyCards, ...mockCards];
  }, [nearbyCards, state.encounters]);
  const currentCard = cards[currentIndex];

  const handleSwipeRight = () => {
    if (currentCard) {
      dispatch({ type: 'SWIPE_RIGHT', cardId: currentCard.id });
    }
    setCurrentIndex(prev => prev);
  };

  const handleSwipeLeft = () => {
    if (currentCard) {
      dispatch({ type: 'SWIPE_LEFT', cardId: currentCard.id });
    }
    setCurrentIndex(prev => prev);
  };

  return (
    <div className="page-container" style={{ background: 'var(--bg)', paddingBottom: 80 }}>
      <AmbientGlow />

      {/* Header */}
      <div style={{
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>
          <span className="gradient-text">Encounters</span>
        </h1>
      </div>

      {/* Card stack */}
      <div style={{ padding: '0 20px', position: 'relative', height: 520, zIndex: 5 }}>
        {state.doNotDisturbMode ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-sub)',
            textAlign: 'center',
            gap: 16,
          }}>
            <Pause size={48} color="rgba(255,255,255,0.15)" />
            <p style={{ fontSize: 16 }}>Do Not Disturb mode is ON</p>
            <p style={{ fontSize: 13 }}>Tap the button below to resume</p>
          </div>
        ) : cards.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-sub)',
            textAlign: 'center',
            gap: 12,
          }}>
            <p style={{ fontSize: 16 }}>No encounters yet</p>
            <p style={{ fontSize: 13 }}>Move around to find travelers nearby!</p>
          </div>
        ) : (
          <>
            {/* Background cards */}
            {cards.slice(1, 3).map((card, i) => (
              <div
                key={card.id}
                style={{
                  position: 'absolute',
                  width: '100%',
                  transform: `scale(${1 - (i + 1) * 0.05}) translateY(${(i + 1) * 12}px)`,
                  opacity: 1 - (i + 1) * 0.2,
                  zIndex: 3 - i,
                  pointerEvents: 'none',
                }}
              >
                <div style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 24,
                  height: 460,
                }} />
              </div>
            ))}
            {/* Active card */}
            {cards[0] && (
              <SwipeCard
                card={cards[0]}
                onSwipeRight={handleSwipeRight}
                onSwipeLeft={handleSwipeLeft}
                onTap={() => onViewProfile(cards[0].id)}
              />
            )}
          </>
        )}
      </div>

      {/* Active/Paused button */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '12px 0',
        position: 'relative',
        zIndex: 10,
      }}>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_DND' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: state.doNotDisturbMode ? 'rgba(239,68,68,0.15)' : 'var(--surface)',
            border: `1px solid ${state.doNotDisturbMode ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
            borderRadius: 20,
            padding: '8px 14px',
            color: state.doNotDisturbMode ? '#EF4444' : 'var(--text-sub)',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {state.doNotDisturbMode ? <Pause size={14} /> : <Play size={14} />}
          {state.doNotDisturbMode ? 'Paused' : 'Active'}
        </button>
      </div>

      {/* Action buttons */}
      {!state.doNotDisturbMode && cards.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 32,
          padding: '20px 0',
          position: 'relative',
          zIndex: 10,
        }}>
          <button
            onClick={handleSwipeLeft}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)',
              border: '2px solid rgba(239,68,68,0.3)',
              color: '#EF4444',
              fontSize: 24,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
          <button
            onClick={handleSwipeRight}
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(74,222,128,0.1)',
              border: '2px solid rgba(74,222,128,0.3)',
              color: '#4ADE80',
              fontSize: 24,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ♥
          </button>
        </div>
      )}
    </div>
  );
}
