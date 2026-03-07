'use client';
import { useEffect, useCallback } from 'react';
import { AppAction } from './store';
import { UserProfile } from './types';
import { isSupabaseConfigured } from './supabase';
import { onAuthStateChange, getCurrentUser } from './supabase-helpers';
import {
  fetchMyProfile,
  fetchEncounters,
  fetchMatches,
  fetchStamps,
  fetchTokuHistory,
  upsertProfile,
  updateProfile,
  recordSwipe,
  sendMessage,
  addStamp,
  addTokuPoints,
  logLocation,
  computeMatching,
} from './api-client';

export function useSupabaseSync(dispatch: React.Dispatch<AppAction>) {
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = onAuthStateChange(async (userId) => {
      dispatch({ type: 'SET_USER_ID', userId });

      if (userId) {
        dispatch({ type: 'SET_LOADING', loading: true });
        await loadAllData(userId, dispatch);
      }
    });

    getCurrentUser().then(user => {
      if (user) {
        dispatch({ type: 'SET_USER_ID', userId: user.id });
        loadAllData(user.id, dispatch);
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);
}

async function loadAllData(userId: string, dispatch: React.Dispatch<AppAction>) {
  const [profile, encounters, matches, stamps, tokuHistory] = await Promise.all([
    fetchMyProfile(userId),
    fetchEncounters(userId),
    fetchMatches(userId),
    fetchStamps(userId),
    fetchTokuHistory(userId),
  ]);

  dispatch({
    type: 'LOAD_DATA',
    payload: {
      myProfile: profile ?? undefined,
      encounters: profile ? encounters.map(e => computeMatching(e, profile)) : encounters,
      matches,
      stamps,
      tokuHistory,
      onboarded: !!profile?.name,
      userId,
    },
  });
}

export function useSupabaseActions(userId: string | null, myProfile: UserProfile) {
  const saveProfile = useCallback(async (profile: Partial<UserProfile>) => {
    if (!isSupabaseConfigured || !userId) return;
    await upsertProfile(userId, { ...myProfile, ...profile });
  }, [userId, myProfile]);

  const updateMyProfile = useCallback(async (profile: Partial<UserProfile>) => {
    if (!isSupabaseConfigured || !userId) return;
    await updateProfile(userId, profile);
  }, [userId]);

  const swipe = useCallback(async (
    encounterId: string,
    targetUserId: string,
    direction: 'right' | 'left'
  ) => {
    if (!isSupabaseConfigured || !userId) return { matched: false };
    return recordSwipe(userId, targetUserId, encounterId, direction);
  }, [userId]);

  const sendChatMessage = useCallback(async (matchId: string, text: string) => {
    if (!isSupabaseConfigured || !userId) return null;
    return sendMessage(matchId, userId, text);
  }, [userId]);

  const recordMeetup = useCallback(async (
    metUserId: string,
    nationality: string,
    userName: string,
    location: string
  ) => {
    if (!isSupabaseConfigured || !userId) return;
    await Promise.all([
      addStamp(userId, metUserId, nationality, userName, location),
      addTokuPoints(userId, 'Met someone', 30),
    ]);
  }, [userId]);

  const updateLocation = useCallback(async (latitude: number, longitude: number) => {
    if (!isSupabaseConfigured || !userId) return;
    await logLocation(userId, latitude, longitude);
  }, [userId]);

  return { saveProfile, updateMyProfile, swipe, sendChatMessage, recordMeetup, updateLocation };
}
