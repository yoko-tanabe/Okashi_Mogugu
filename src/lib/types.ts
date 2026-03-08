export interface UserProfile {
  id: string;
  name: string;
  nationality: string;
  gender: string;
  birthDate: string;
  ageGroup: string;
  hobbyTags: string[];
  freeText: string;
  videoLinks: string[];
  favoriteImages: string[];
  languages: string[];
  travelStyle: string;
  genderFilter: string[];
  ageRangeMin: number;
  ageRangeMax: number;
  tokuPoints: number;
  avatarUrl: string;
  wantToMeetMode: boolean;
}

export interface EncounterCard {
  id: string;
  user: UserProfile;
  location: string;
  encounteredAt: string;
  minutesAgo: number;
  matchingTags: string[];
  matchingWords: string[];
  distance: number;
}

export interface MatchEntry {
  id: string;
  user: UserProfile;
  matchedAt: string;
  status: 'pending_sent' | 'pending_received' | 'matched';
  chatOpen: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface StampEntry {
  id: string;
  nationality: string;
  flag: string;
  userName: string;
  date: string;
  location: string;
}

export interface TokuHistoryEntry {
  id: string;
  action: string;
  points: number;
  date: string;
}
