'use client';
import { createContext, useContext } from 'react';
import { UserProfile, EncounterCard, MatchEntry, ChatMessage, StampEntry, TokuHistoryEntry } from './types';
import { mockEncounterCards, mockMatches, mockMessages, mockStamps, mockTokuHistory, mockMyProfile } from './mockData';

export interface AppState {
  myProfile: UserProfile;
  encounters: EncounterCard[];
  matches: MatchEntry[];
  messages: ChatMessage[];
  stamps: StampEntry[];
  tokuHistory: TokuHistoryEntry[];
  onboarded: boolean;
  doNotDisturbMode: boolean;
  userId: string | null;
  loading: boolean;
}

import { isSupabaseConfigured } from './supabase';

export const defaultState: AppState = {
  myProfile: isSupabaseConfigured
    ? { id: '', name: '', nationality: 'JP', gender: '', birthDate: '', ageGroup: '', hobbyTags: [], freeText: '', videoLinks: [], languages: [], travelStyle: '', genderFilter: ['No preference'], ageRangeMin: 18, ageRangeMax: 99, tokuPoints: 0, avatarUrl: '', wantToMeetMode: true }
    : mockMyProfile,
  encounters: isSupabaseConfigured ? [] : mockEncounterCards,
  matches: isSupabaseConfigured ? [] : mockMatches,
  messages: isSupabaseConfigured ? [] : mockMessages,
  stamps: isSupabaseConfigured ? [] : mockStamps,
  tokuHistory: isSupabaseConfigured ? [] : mockTokuHistory,
  onboarded: false,
  doNotDisturbMode: false,
  userId: null,
  loading: isSupabaseConfigured,
};

export type AppAction =
  | { type: 'SET_ONBOARDED' }
  | { type: 'TOGGLE_DND' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'SWIPE_RIGHT'; cardId: string }
  | { type: 'SWIPE_LEFT'; cardId: string }
  | { type: 'SEND_MESSAGE'; message: ChatMessage }
  | { type: 'CONFIRM_MEET'; matchId: string }
  | { type: 'MET_UP'; matchId: string }
  | { type: 'ADD_STAMP'; stamp: StampEntry }
  | { type: 'SET_USER_ID'; userId: string | null }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'SET_ENCOUNTERS'; encounters: EncounterCard[] }
  | { type: 'SET_MATCHES'; matches: MatchEntry[] }
  | { type: 'SET_MESSAGES'; messages: ChatMessage[] }
  | { type: 'ADD_MATCH'; match: MatchEntry };

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ONBOARDED':
      return { ...state, onboarded: true };
    case 'TOGGLE_DND':
      return { ...state, doNotDisturbMode: !state.doNotDisturbMode };
    case 'UPDATE_PROFILE':
      return { ...state, myProfile: { ...state.myProfile, ...action.payload } };
    case 'SWIPE_LEFT':
      return { ...state, encounters: state.encounters.filter(e => e.id !== action.cardId) };
    case 'SWIPE_RIGHT': {
      const card = state.encounters.find(e => e.id === action.cardId);
      if (!card) return state;
      const newMatch: MatchEntry = {
        id: `m-${Date.now()}`,
        user: card.user,
        matchedAt: new Date().toISOString(),
        status: 'matched',
        chatOpen: true,
      };
      return {
        ...state,
        encounters: state.encounters.filter(e => e.id !== action.cardId),
        matches: [...state.matches, newMatch],
      };
    }
    case 'SEND_MESSAGE':
      return { ...state, messages: [...state.messages, action.message] };
    case 'MET_UP': {
      const match = state.matches.find(m => m.id === action.matchId);
      if (!match) return state;
      const country = match.user.nationality;
      const countryFlag = getFlag(country);
      const newStamp: StampEntry = {
        id: `s-${Date.now()}`,
        nationality: country,
        flag: countryFlag,
        userName: match.user.name,
        date: new Date().toISOString().split('T')[0],
        location: 'Current Location',
      };
      const newToku: TokuHistoryEntry = {
        id: `t-${Date.now()}`,
        action: 'Met someone',
        points: 30,
        date: new Date().toISOString().split('T')[0],
      };
      return {
        ...state,
        stamps: [...state.stamps, newStamp],
        tokuHistory: [newToku, ...state.tokuHistory],
        myProfile: { ...state.myProfile, tokuPoints: state.myProfile.tokuPoints + 30 },
      };
    }
    case 'SET_USER_ID':
      return { ...state, userId: action.userId };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'LOAD_DATA':
      return { ...state, ...action.payload, loading: false };
    case 'SET_ENCOUNTERS':
      return { ...state, encounters: action.encounters };
    case 'SET_MATCHES':
      return { ...state, matches: action.matches };
    case 'SET_MESSAGES':
      return { ...state, messages: action.messages };
    case 'ADD_MATCH':
      return { ...state, matches: [...state.matches, action.match] };
    default:
      return state;
  }
}

function getFlag(code: string): string {
  const flags: Record<string, string> = {
    JP: '\u{1F1EF}\u{1F1F5}', US: '\u{1F1FA}\u{1F1F8}', GB: '\u{1F1EC}\u{1F1E7}',
    FR: '\u{1F1EB}\u{1F1F7}', DE: '\u{1F1E9}\u{1F1EA}', KR: '\u{1F1F0}\u{1F1F7}',
    CN: '\u{1F1E8}\u{1F1F3}', TW: '\u{1F1F9}\u{1F1FC}', TH: '\u{1F1F9}\u{1F1ED}',
    AU: '\u{1F1E6}\u{1F1FA}', BR: '\u{1F1E7}\u{1F1F7}', IN: '\u{1F1EE}\u{1F1F3}',
    ES: '\u{1F1EA}\u{1F1F8}', IT: '\u{1F1EE}\u{1F1F9}',
  };
  return flags[code] || '\u{1F3F3}\u{FE0F}';
}

export const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({ state: defaultState, dispatch: () => {} });

export const useApp = () => useContext(AppContext);
