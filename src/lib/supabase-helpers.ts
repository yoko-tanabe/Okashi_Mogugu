import { supabase } from './supabase';
import { UserProfile, EncounterCard, MatchEntry, ChatMessage, StampEntry, TokuHistoryEntry } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

// =====================
// Profile helpers
// =====================

function rowToProfile(row: Row): UserProfile {
  return {
    id: row.id,
    name: row.name,
    nationality: row.nationality,
    gender: row.gender,
    birthDate: row.birth_date ?? '',
    ageGroup: row.age_group,
    hobbyTags: row.hobby_tags ?? [],
    freeText: row.free_text ?? '',
    videoLinks: row.video_links ?? [],
    languages: row.languages ?? [],
    travelStyle: row.travel_style ?? '',
    genderFilter: row.gender_filter ?? ['No preference'],
    ageRangeMin: row.age_range_min ?? 18,
    ageRangeMax: row.age_range_max ?? 99,
    tokuPoints: row.toku_points ?? 0,
    avatarUrl: row.avatar_url ?? '',
    wantToMeetMode: row.want_to_meet_mode ?? true,
  };
}

function profileToRow(profile: Partial<UserProfile>): Row {
  const row: Row = {};
  if (profile.name !== undefined) row.name = profile.name;
  if (profile.nationality !== undefined) row.nationality = profile.nationality;
  if (profile.gender !== undefined) row.gender = profile.gender;
  if (profile.birthDate !== undefined) row.birth_date = profile.birthDate || null;
  if (profile.ageGroup !== undefined) row.age_group = profile.ageGroup;
  if (profile.hobbyTags !== undefined) row.hobby_tags = profile.hobbyTags;
  if (profile.freeText !== undefined) row.free_text = profile.freeText;
  if (profile.videoLinks !== undefined) row.video_links = profile.videoLinks;
  if (profile.languages !== undefined) row.languages = profile.languages;
  if (profile.travelStyle !== undefined) row.travel_style = profile.travelStyle;
  if (profile.genderFilter !== undefined) row.gender_filter = profile.genderFilter;
  if (profile.ageRangeMin !== undefined) row.age_range_min = profile.ageRangeMin;
  if (profile.ageRangeMax !== undefined) row.age_range_max = profile.ageRangeMax;
  if (profile.tokuPoints !== undefined) row.toku_points = profile.tokuPoints;
  if (profile.avatarUrl !== undefined) row.avatar_url = profile.avatarUrl;
  if (profile.wantToMeetMode !== undefined) row.want_to_meet_mode = profile.wantToMeetMode;
  return row;
}

export async function fetchMyProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return rowToProfile(data);
}

export async function upsertProfile(userId: string, profile: Partial<UserProfile>): Promise<UserProfile | null> {
  const row = profileToRow(profile);
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, name: profile.name ?? '', ...row })
    .select()
    .single();
  if (error || !data) return null;
  return rowToProfile(data);
}

export async function updateProfile(userId: string, profile: Partial<UserProfile>): Promise<boolean> {
  const row = profileToRow(profile);
  const { error } = await supabase
    .from('profiles')
    .update(row)
    .eq('id', userId);
  return !error;
}

// =====================
// Encounter helpers
// =====================

export async function fetchEncounters(userId: string): Promise<EncounterCard[]> {
  const { data: encounterRows, error } = await supabase
    .from('encounters')
    .select('*')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .eq('expired', false)
    .order('encountered_at', { ascending: false });

  if (error || !encounterRows) return [];

  const otherUserIds = encounterRows.map((e: Row) =>
    e.user_a_id === userId ? e.user_b_id : e.user_a_id
  );

  if (otherUserIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', otherUserIds);

  if (!profiles) return [];

  const profileMap = new Map(profiles.map((p: Row) => [p.id, rowToProfile(p)]));

  return encounterRows
    .map((e: Row) => {
      const otherId = e.user_a_id === userId ? e.user_b_id : e.user_a_id;
      const user = profileMap.get(otherId);
      if (!user) return null;

      const now = Date.now();
      const encTime = new Date(e.encountered_at).getTime();
      const minutesAgo = Math.floor((now - encTime) / 60000);

      return {
        id: e.id,
        user,
        location: e.location,
        encounteredAt: e.encountered_at,
        minutesAgo,
        matchingTags: [] as string[],
        matchingWords: [] as string[],
        distance: e.distance_meters,
      } satisfies EncounterCard;
    })
    .filter((c): c is EncounterCard => c !== null);
}

export function computeMatching(
  encounter: EncounterCard,
  myProfile: UserProfile
): EncounterCard {
  const matchingTags = encounter.user.hobbyTags.filter(t =>
    myProfile.hobbyTags.includes(t)
  );

  const myWords = myProfile.freeText.toLowerCase().split(/[,、\s]+/).filter(Boolean);
  const theirWords = encounter.user.freeText.toLowerCase().split(/[,、\s]+/).filter(Boolean);
  const matchingWords = myWords.filter(w => theirWords.includes(w));

  return { ...encounter, matchingTags, matchingWords };
}

// =====================
// Swipe helpers
// =====================

export async function recordSwipe(
  swiperId: string,
  targetId: string,
  encounterId: string,
  direction: 'right' | 'left'
): Promise<{ matched: boolean; matchId?: string }> {
  const { error: swipeError } = await supabase
    .from('swipes')
    .insert({ swiper_id: swiperId, target_id: targetId, encounter_id: encounterId, direction });

  if (swipeError) return { matched: false };

  if (direction === 'left') return { matched: false };

  // Check if the other user has already swiped right on us
  const { data: reverseSwipe } = await supabase
    .from('swipes')
    .select('id')
    .eq('swiper_id', targetId)
    .eq('target_id', swiperId)
    .eq('direction', 'right')
    .limit(1)
    .maybeSingle();

  if (reverseSwipe) {
    // Mutual match
    const { data: match } = await supabase
      .from('matches')
      .insert({
        user_a_id: swiperId < targetId ? swiperId : targetId,
        user_b_id: swiperId < targetId ? targetId : swiperId,
        status: 'matched',
        chat_open: true,
      })
      .select()
      .single();

    return { matched: true, matchId: match?.id };
  }

  // One-sided: create pending match
  const { data: match } = await supabase
    .from('matches')
    .insert({
      user_a_id: swiperId,
      user_b_id: targetId,
      status: 'pending',
      chat_open: false,
    })
    .select()
    .single();

  return { matched: false, matchId: match?.id };
}

// =====================
// Match helpers
// =====================

export async function fetchMatches(userId: string): Promise<MatchEntry[]> {
  const { data: matchRows, error } = await supabase
    .from('matches')
    .select('*')
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .neq('status', 'expired')
    .order('matched_at', { ascending: false });

  if (error || !matchRows) return [];

  const otherUserIds = matchRows.map((m: Row) =>
    m.user_a_id === userId ? m.user_b_id : m.user_a_id
  );

  if (otherUserIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', otherUserIds);

  if (!profiles) return [];

  const profileMap = new Map(profiles.map((p: Row) => [p.id, rowToProfile(p)]));

  return matchRows
    .map((m: Row) => {
      const otherId = m.user_a_id === userId ? m.user_b_id : m.user_a_id;
      const user = profileMap.get(otherId);
      if (!user) return null;

      let status: MatchEntry['status'];
      if (m.status === 'matched') {
        status = 'matched';
      } else if (m.user_a_id === userId) {
        status = 'pending_sent';
      } else {
        status = 'pending_received';
      }

      return {
        id: m.id,
        user,
        matchedAt: m.matched_at,
        status,
        chatOpen: m.chat_open,
      } satisfies MatchEntry;
    })
    .filter((m): m is MatchEntry => m !== null);
}

// =====================
// Message helpers
// =====================

export async function fetchMessages(matchId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map((m: Row) => ({
    id: m.id,
    senderId: m.sender_id,
    text: m.text,
    timestamp: m.created_at,
  }));
}

export async function sendMessage(matchId: string, senderId: string, text: string): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({ match_id: matchId, sender_id: senderId, text })
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    senderId: data.sender_id,
    text: data.text,
    timestamp: data.created_at,
  };
}

export function subscribeToMessages(matchId: string, onMessage: (msg: ChatMessage) => void) {
  return supabase
    .channel(`messages:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => {
        const m = payload.new as Row;
        onMessage({
          id: m.id,
          senderId: m.sender_id,
          text: m.text,
          timestamp: m.created_at,
        });
      }
    )
    .subscribe();
}

// =====================
// Stamp helpers
// =====================

export async function fetchStamps(userId: string): Promise<StampEntry[]> {
  const { data, error } = await supabase
    .from('stamps')
    .select('*')
    .eq('owner_id', userId)
    .order('stamped_at', { ascending: false });

  if (error || !data) return [];

  return data.map((s: Row) => ({
    id: s.id,
    nationality: s.nationality,
    flag: getFlagEmoji(s.nationality),
    userName: s.user_name,
    date: s.stamped_at,
    location: s.location,
  }));
}

export async function addStamp(
  ownerId: string,
  metUserId: string,
  nationality: string,
  userName: string,
  location: string
): Promise<StampEntry | null> {
  const { data, error } = await supabase
    .from('stamps')
    .insert({
      owner_id: ownerId,
      met_user_id: metUserId,
      nationality,
      user_name: userName,
      location,
    })
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    nationality: data.nationality,
    flag: getFlagEmoji(data.nationality),
    userName: data.user_name,
    date: data.stamped_at,
    location: data.location,
  };
}

// =====================
// Toku history helpers
// =====================

export async function fetchTokuHistory(userId: string): Promise<TokuHistoryEntry[]> {
  const { data, error } = await supabase
    .from('toku_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((t: Row) => ({
    id: t.id,
    action: t.action,
    points: t.points,
    date: t.created_at.split('T')[0],
  }));
}

export async function addTokuPoints(
  userId: string,
  action: string,
  points: number
): Promise<boolean> {
  const { error: histError } = await supabase
    .from('toku_history')
    .insert({ user_id: userId, action, points });

  if (histError) return false;

  // Fetch current points and update
  const { data: profile } = await supabase
    .from('profiles')
    .select('toku_points')
    .eq('id', userId)
    .single();

  if (profile) {
    await supabase
      .from('profiles')
      .update({ toku_points: (profile.toku_points ?? 0) + points })
      .eq('id', userId);
  }

  return true;
}

// =====================
// Location helpers
// =====================

export async function logLocation(userId: string, latitude: number, longitude: number): Promise<boolean> {
  const { error } = await supabase
    .from('location_logs')
    .insert({ user_id: userId, latitude, longitude });
  return !error;
}

// =====================
// Block helpers
// =====================

export async function blockUser(blockerId: string, blockedId: string): Promise<boolean> {
  const { error } = await supabase
    .from('blocks')
    .insert({ blocker_id: blockerId, blocked_id: blockedId });
  return !error;
}

export async function unblockUser(blockerId: string, blockedId: string): Promise<boolean> {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', blockerId)
    .eq('blocked_id', blockedId);
  return !error;
}

export async function fetchBlockedIds(blockerId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', blockerId);
  if (error || !data) return [];
  return data.map((b: Row) => b.blocked_id);
}

// =====================
// Auth helpers
// =====================

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(callback: (userId: string | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user?.id ?? null);
  });
}

// =====================
// Utility
// =====================

function getFlagEmoji(countryCode: string): string {
  const flags: Record<string, string> = {
    JP: '\u{1F1EF}\u{1F1F5}', US: '\u{1F1FA}\u{1F1F8}', GB: '\u{1F1EC}\u{1F1E7}',
    FR: '\u{1F1EB}\u{1F1F7}', DE: '\u{1F1E9}\u{1F1EA}', KR: '\u{1F1F0}\u{1F1F7}',
    CN: '\u{1F1E8}\u{1F1F3}', TW: '\u{1F1F9}\u{1F1FC}', TH: '\u{1F1F9}\u{1F1ED}',
    AU: '\u{1F1E6}\u{1F1FA}', BR: '\u{1F1E7}\u{1F1F7}', IN: '\u{1F1EE}\u{1F1F3}',
    ES: '\u{1F1EA}\u{1F1F8}', IT: '\u{1F1EE}\u{1F1F9}',
  };
  return flags[countryCode] || '\u{1F3F3}\u{FE0F}';
}
