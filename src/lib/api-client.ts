import { UserProfile, EncounterCard, MatchEntry, ChatMessage, StampEntry, TokuHistoryEntry } from './types';

const BASE = '';

function profileRowToUserProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    name: row.name as string,
    nationality: row.nationality as string,
    gender: row.gender as string,
    birthDate: row.birthDate ? (row.birthDate as string).split('T')[0] : '',
    ageGroup: row.ageGroup as string,
    hobbyTags: (row.hobbyTags as string[]) ?? [],
    freeText: (row.freeText as string) ?? '',
    videoLinks: (row.videoLinks as string[]) ?? [],
    languages: (row.languages as string[]) ?? [],
    travelStyle: (row.travelStyle as string) ?? '',
    genderFilter: (row.genderFilter as string[]) ?? ['No preference'],
    ageRangeMin: (row.ageRangeMin as number) ?? 18,
    ageRangeMax: (row.ageRangeMax as number) ?? 99,
    tokuPoints: (row.tokuPoints as number) ?? 0,
    avatarUrl: (row.avatarUrl as string) ?? '',
    wantToMeetMode: (row.wantToMeetMode as boolean) ?? true,
  };
}

// =====================
// Profile
// =====================

export async function fetchMyProfile(userId: string): Promise<UserProfile | null> {
  const res = await fetch(`${BASE}/api/profile?userId=${userId}`);
  const data = await res.json();
  if (!data) return null;
  return profileRowToUserProfile(data);
}

export async function upsertProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null> {
  const res = await fetch(`${BASE}/api/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: userId,
      name: profile.name ?? '',
      nationality: profile.nationality,
      gender: profile.gender,
      birthDate: profile.birthDate || null,
      ageGroup: profile.ageGroup,
      hobbyTags: profile.hobbyTags,
      freeText: profile.freeText,
      videoLinks: profile.videoLinks,
      languages: profile.languages,
      travelStyle: profile.travelStyle,
      genderFilter: profile.genderFilter,
      ageRangeMin: profile.ageRangeMin,
      ageRangeMax: profile.ageRangeMax,
      avatarUrl: profile.avatarUrl,
      wantToMeetMode: profile.wantToMeetMode,
    }),
  });
  const data = await res.json();
  if (!data || data.error) return null;
  return profileRowToUserProfile(data);
}

export async function updateProfile(userId: string, profile: Partial<UserProfile>): Promise<boolean> {
  const body: Record<string, unknown> = { id: userId };
  if (profile.name !== undefined) body.name = profile.name;
  if (profile.nationality !== undefined) body.nationality = profile.nationality;
  if (profile.gender !== undefined) body.gender = profile.gender;
  if (profile.birthDate !== undefined) body.birthDate = profile.birthDate || null;
  if (profile.ageGroup !== undefined) body.ageGroup = profile.ageGroup;
  if (profile.hobbyTags !== undefined) body.hobbyTags = profile.hobbyTags;
  if (profile.freeText !== undefined) body.freeText = profile.freeText;
  if (profile.videoLinks !== undefined) body.videoLinks = profile.videoLinks;
  if (profile.languages !== undefined) body.languages = profile.languages;
  if (profile.travelStyle !== undefined) body.travelStyle = profile.travelStyle;
  if (profile.genderFilter !== undefined) body.genderFilter = profile.genderFilter;
  if (profile.ageRangeMin !== undefined) body.ageRangeMin = profile.ageRangeMin;
  if (profile.ageRangeMax !== undefined) body.ageRangeMax = profile.ageRangeMax;
  if (profile.avatarUrl !== undefined) body.avatarUrl = profile.avatarUrl;
  if (profile.wantToMeetMode !== undefined) body.wantToMeetMode = profile.wantToMeetMode;

  const res = await fetch(`${BASE}/api/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.ok;
}

// =====================
// Encounters
// =====================

export async function fetchEncounters(userId: string): Promise<EncounterCard[]> {
  const res = await fetch(`${BASE}/api/encounters?userId=${userId}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.map((e: Record<string, unknown>) => ({
    id: e.id as string,
    user: profileRowToUserProfile(e.user as Record<string, unknown>),
    location: e.location as string,
    encounteredAt: e.encounteredAt as string,
    minutesAgo: e.minutesAgo as number,
    matchingTags: (e.matchingTags as string[]) ?? [],
    matchingWords: (e.matchingWords as string[]) ?? [],
    distance: e.distance as number,
  }));
}

export function computeMatching(encounter: EncounterCard, myProfile: UserProfile): EncounterCard {
  const matchingTags = encounter.user.hobbyTags.filter(t => myProfile.hobbyTags.includes(t));
  const myWords = myProfile.freeText.toLowerCase().split(/[,、\s]+/).filter(Boolean);
  const theirWords = encounter.user.freeText.toLowerCase().split(/[,、\s]+/).filter(Boolean);
  const matchingWords = myWords.filter(w => theirWords.includes(w));
  return { ...encounter, matchingTags, matchingWords };
}

// =====================
// Swipes
// =====================

export async function recordSwipe(
  swiperId: string,
  targetId: string,
  encounterId: string,
  direction: 'right' | 'left'
): Promise<{ matched: boolean; matchId?: string }> {
  const res = await fetch(`${BASE}/api/swipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ swiperId, targetId, encounterId, direction }),
  });
  return res.json();
}

// =====================
// Matches
// =====================

export async function fetchMatches(userId: string): Promise<MatchEntry[]> {
  const res = await fetch(`${BASE}/api/matches?userId=${userId}`);
  const data = await res.json();
  if (!Array.isArray(data)) return [];

  return data.map((m: Record<string, unknown>) => ({
    id: m.id as string,
    user: profileRowToUserProfile(m.user as Record<string, unknown>),
    matchedAt: m.matchedAt as string,
    status: m.status as MatchEntry['status'],
    chatOpen: m.chatOpen as boolean,
  }));
}

// =====================
// Messages
// =====================

export async function fetchMessages(matchId: string): Promise<ChatMessage[]> {
  const res = await fetch(`${BASE}/api/messages?matchId=${matchId}`);
  return res.json();
}

export async function sendMessage(matchId: string, senderId: string, text: string): Promise<ChatMessage | null> {
  const res = await fetch(`${BASE}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchId, senderId, text }),
  });
  if (!res.ok) return null;
  return res.json();
}

// =====================
// Stamps
// =====================

export async function fetchStamps(userId: string): Promise<StampEntry[]> {
  const res = await fetch(`${BASE}/api/stamps?userId=${userId}`);
  return res.json();
}

export async function addStamp(
  ownerId: string,
  metUserId: string,
  nationality: string,
  userName: string,
  location: string
): Promise<StampEntry | null> {
  const res = await fetch(`${BASE}/api/stamps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ownerId, metUserId, nationality, userName, location }),
  });
  if (!res.ok) return null;
  return res.json();
}

// =====================
// Toku
// =====================

export async function fetchTokuHistory(userId: string): Promise<TokuHistoryEntry[]> {
  const res = await fetch(`${BASE}/api/toku?userId=${userId}`);
  return res.json();
}

export async function addTokuPoints(userId: string, action: string, points: number): Promise<boolean> {
  const res = await fetch(`${BASE}/api/toku`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, action, points }),
  });
  return res.ok;
}

// =====================
// Location
// =====================

export async function logLocation(userId: string, latitude: number, longitude: number): Promise<boolean> {
  const res = await fetch(`${BASE}/api/location`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, latitude, longitude }),
  });
  return res.ok;
}

// =====================
// Blocks
// =====================

export async function blockUser(blockerId: string, blockedId: string): Promise<boolean> {
  const res = await fetch(`${BASE}/api/blocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blockerId, blockedId }),
  });
  return res.ok;
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
  const res = await fetch(`${BASE}/api/blocks?blockerId=${blockerId}&blockedId=${blockedId}`, {
    method: 'DELETE',
  });
  return res.ok;
}

export async function fetchBlockedIds(blockerId: string): Promise<string[]> {
  const res = await fetch(`${BASE}/api/blocks?blockerId=${blockerId}`);
  return res.json();
}
