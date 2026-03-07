'use client';
import { Home, Users, MessageCircle, BookOpen, User } from 'lucide-react';

type Tab = 'home' | 'matches' | 'chat' | 'passport' | 'profile';

interface BottomNavProps {
  active: Tab;
  onNavigate: (tab: Tab) => void;
  matchCount?: number;
}

const tabs: { key: Tab; icon: typeof Home; label: string }[] = [
  { key: 'home', icon: Home, label: 'Home' },
  { key: 'matches', icon: Users, label: 'Matches' },
  { key: 'chat', icon: MessageCircle, label: 'Chat' },
  { key: 'passport', icon: BookOpen, label: 'Passport' },
  { key: 'profile', icon: User, label: 'Profile' },
];

export default function BottomNav({ active, onNavigate, matchCount }: BottomNavProps) {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 430,
        background: 'rgba(11,14,20,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
        zIndex: 50,
      }}
    >
      {tabs.map(({ key, icon: Icon, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#A78BFA' : 'rgba(255,255,255,0.35)',
              fontSize: 10,
              position: 'relative',
              padding: '4px 12px',
            }}
          >
            <Icon size={22} />
            <span>{label}</span>
            {key === 'matches' && matchCount && matchCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 4,
                  background: '#F59E42',
                  color: '#fff',
                  fontSize: 10,
                  borderRadius: 10,
                  padding: '1px 5px',
                  fontWeight: 700,
                }}
              >
                {matchCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
