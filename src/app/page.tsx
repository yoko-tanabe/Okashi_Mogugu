'use client';
import { useReducer, useState, useEffect } from 'react';
import { AppContext, appReducer, defaultState } from '@/lib/store';
import { UserProfile } from '@/lib/types';
import { useSupabaseSync, useSupabaseActions } from '@/lib/useSupabaseSync';
import WelcomeScreen from '@/components/WelcomeScreen';
import AuthScreen from '@/components/AuthScreen';
import OnboardingScreen from '@/components/OnboardingScreen';
import HomeScreen from '@/components/HomeScreen';
import ProfileDetailScreen from '@/components/ProfileDetailScreen';
import MatchesScreen from '@/components/MatchesScreen';
import ChatScreen from '@/components/ChatScreen';
import PassportScreen from '@/components/PassportScreen';
import MyProfileScreen from '@/components/MyProfileScreen';
import BottomNav from '@/components/BottomNav';


type Screen =
  | { type: 'welcome' }
  | { type: 'auth' }
  | { type: 'onboarding' }
  | { type: 'home' }
  | { type: 'profile-detail'; cardId: string }
  | { type: 'matches' }
  | { type: 'chat'; matchId: string }
  | { type: 'passport' }
  | { type: 'my-profile' };

export default function App() {
  const [state, dispatch] = useReducer(appReducer, defaultState);
  const [screen, setScreen] = useState<Screen>({ type: 'welcome' });

  // Sync with Supabase when configured
  useSupabaseSync(dispatch);
  const { saveProfile, swipe } = useSupabaseActions(state.userId, state.myProfile);

  // Auto-navigate when auth state resolves
  useEffect(() => {
    if (state.loading) return;
    if (state.userId && state.onboarded && screen.type === 'welcome') {
      setScreen({ type: 'home' });
    }
  }, [state.loading, state.userId, state.onboarded, screen.type]);

  const handleOnboardingComplete = async (profile: Partial<UserProfile>) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
    dispatch({ type: 'SET_ONBOARDED' });
    await saveProfile(profile);
    setScreen({ type: 'home' });
  };

  const handleSwipeRight = async (cardId: string) => {
    const card = state.encounters.find(e => e.id === cardId);
    dispatch({ type: 'SWIPE_RIGHT', cardId });
    if (card) {
      const result = await swipe(cardId, card.user.id, 'right');
      if (result.matched && result.matchId) {
        dispatch({
          type: 'ADD_MATCH',
          match: { id: result.matchId, user: card.user, matchedAt: new Date().toISOString(), status: 'matched', chatOpen: true },
        });
      }
    }
    setScreen({ type: 'home' });
  };

  const handleSwipeLeft = async (cardId: string) => {
    const card = state.encounters.find(e => e.id === cardId);
    dispatch({ type: 'SWIPE_LEFT', cardId });
    if (card) {
      await swipe(cardId, card.user.id, 'left');
    }
  };

  const activeTab = (() => {
    switch (screen.type) {
      case 'home':
      case 'profile-detail':
        return 'home' as const;
      case 'matches':
        return 'matches' as const;
      case 'chat':
        return 'chat' as const;
      case 'passport':
        return 'passport' as const;
      case 'my-profile':
        return 'profile' as const;
      default:
        return 'home' as const;
    }
  })();

  const showNav = !['welcome', 'auth', 'onboarding'].includes(screen.type);
  const pendingCount = state.matches.filter(m => m.status === 'pending_received').length;

  if (state.loading) {
    return (
      <div style={{ background: '#0B0E14', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16 }}>Loading...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div style={{ background: '#0B0E14', minHeight: '100dvh' }}>
        {screen.type === 'welcome' && (
          <WelcomeScreen onStart={() => setScreen({ type: 'auth' })} />
        )}

        {screen.type === 'auth' && (
          <AuthScreen onAuthenticated={() => {
            if (state.onboarded) {
              setScreen({ type: 'home' });
            } else {
              setScreen({ type: 'onboarding' });
            }
          }} />
        )}

        {screen.type === 'onboarding' && (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}

        {screen.type === 'home' && (
          <HomeScreen
            onViewProfile={(cardId) => setScreen({ type: 'profile-detail', cardId })}
          />
        )}

        {screen.type === 'profile-detail' && (() => {
          const card = state.encounters.find(e => e.id === screen.cardId);
          if (!card) return null;
          return (
            <ProfileDetailScreen
              card={card}
              onBack={() => setScreen({ type: 'home' })}
              onLike={() => handleSwipeRight(screen.cardId)}
              onPass={() => {
                handleSwipeLeft(screen.cardId);
                setScreen({ type: 'home' });
              }}
            />
          );
        })()}

        {screen.type === 'matches' && (
          <MatchesScreen onOpenChat={(matchId) => setScreen({ type: 'chat', matchId })} />
        )}

        {screen.type === 'chat' && (
          <ChatScreen
            matchId={screen.matchId}
            onBack={() => setScreen({ type: 'matches' })}
          />
        )}

        {screen.type === 'passport' && <PassportScreen />}

        {screen.type === 'my-profile' && <MyProfileScreen />}

        {showNav && (
          <BottomNav
            active={activeTab}
            matchCount={pendingCount}
            onNavigate={(tab) => {
              switch (tab) {
                case 'home': setScreen({ type: 'home' }); break;
                case 'matches': setScreen({ type: 'matches' }); break;
                case 'chat': setScreen({ type: 'matches' }); break;
                case 'passport': setScreen({ type: 'passport' }); break;
                case 'profile': setScreen({ type: 'my-profile' }); break;
              }
            }}
          />
        )}
      </div>
    </AppContext.Provider>
  );
}
