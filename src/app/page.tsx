'use client';
import { useReducer, useState, useEffect } from 'react';
import { AppContext, appReducer, defaultState } from '@/lib/store';
import { UserProfile, EncounterCard } from '@/lib/types';
import { getSupabase } from '@/lib/supabase';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import WelcomeScreen from '@/components/WelcomeScreen';
import LoginScreen from '@/components/LoginScreen';
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
  | { type: 'login' }
  | { type: 'onboarding' }
  | { type: 'home' }
  | { type: 'profile-detail'; card: EncounterCard }
  | { type: 'matches' }
  | { type: 'chat'; matchId: string }
  | { type: 'passport' }
  | { type: 'my-profile' };

export default function App() {
  const [state, dispatch] = useReducer(appReducer, defaultState);
  const [screen, setScreen] = useState<Screen>({ type: 'welcome' });
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useLocationTracking(userId);

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        setScreen({ type: 'home' });
      }
      setLoading(false);
    });
  }, []);

  const handleOnboardingComplete = async (profile: Partial<UserProfile>, email: string, password: string, photoFile?: File) => {
    setAuthError('');
    const { data, error } = await getSupabase().auth.signUp({ email, password });
    if (error) {
      setAuthError(error.message);
      return;
    }

    const { error: dbError } = await getSupabase().from('profiles').insert({
      id: data.user!.id,
      name: profile.name,
      nationality: profile.nationality,
      gender: profile.gender,
      birth_date: profile.birthDate,
      age_group: profile.ageGroup,
      hobby_tags: profile.hobbyTags,
      free_text: profile.freeText,
      video_links: profile.videoLinks,
      languages: profile.languages,
      travel_style: profile.travelStyle,
      gender_filter: profile.genderFilter,
      age_range_min: profile.ageRangeMin,
      age_range_max: profile.ageRangeMax,
    });
    if (dbError) {
      setAuthError(dbError.message);
      return;
    }

    // Upload photo if provided
    if (photoFile) {
      const formData = new FormData();
      formData.append('file', photoFile);
      formData.append('userId', data.user!.id);
      const uploadRes = await fetch('/api/upload-photo', { method: 'POST', body: formData });
      if (uploadRes.ok) {
        const { avatarUrl } = await uploadRes.json();
        await getSupabase().from('profiles').update({ avatar_url: avatarUrl }).eq('id', data.user!.id);
      }
    }

    setUserId(data.user!.id);
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
    dispatch({ type: 'SET_ONBOARDED' });
    setScreen({ type: 'home' });
  };

  const handleLogin = async (email: string, password: string) => {
    setAuthError('');
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      return;
    }
    setUserId(data.user.id);
    setScreen({ type: 'home' });
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

  const showNav = !['welcome', 'login', 'onboarding', 'profile-detail'].includes(screen.type);
  const pendingCount = state.matches.filter(m => m.status === 'pending_received').length;

  if (loading) {
    return <div style={{ background: '#0B0E14', minHeight: '100dvh' }} />;
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div style={{ background: '#0B0E14', minHeight: '100dvh' }}>
        {screen.type === 'welcome' && (
          <WelcomeScreen
            onStart={() => setScreen({ type: 'onboarding' })}
            onLogin={() => setScreen({ type: 'login' })}
          />
        )}

        {screen.type === 'login' && (
          <LoginScreen
            onBack={() => setScreen({ type: 'welcome' })}
            onLogin={handleLogin}
            error={authError}
          />
        )}

        {screen.type === 'onboarding' && (
          <OnboardingScreen onComplete={handleOnboardingComplete} />
        )}

        {screen.type === 'home' && (
          <HomeScreen
            onViewProfile={(card) => setScreen({ type: 'profile-detail', card })}
            userId={userId}
          />
        )}

        {screen.type === 'profile-detail' && (
          <ProfileDetailScreen
            card={screen.card}
            onBack={() => setScreen({ type: 'home' })}
            onLike={() => {
              dispatch({ type: 'SWIPE_RIGHT', cardId: screen.card.id });
              setScreen({ type: 'home' });
            }}
            onPass={() => {
              dispatch({ type: 'SWIPE_LEFT', cardId: screen.card.id });
              setScreen({ type: 'home' });
            }}
          />
        )}

        {screen.type === 'matches' && (
          <MatchesScreen onOpenChat={(matchId) => setScreen({ type: 'chat', matchId })} userId={userId} />
        )}

        {screen.type === 'chat' && (
          <ChatScreen
            matchId={screen.matchId}
            userId={userId}
            onBack={() => setScreen({ type: 'matches' })}
            onNavigatePassport={() => setScreen({ type: 'passport' })}
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
