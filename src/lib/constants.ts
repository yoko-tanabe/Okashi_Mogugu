// Design Tokens
export const colors = {
  bg: '#0B0E14',
  surface: 'rgba(255,255,255,0.06)',
  surfaceActive: 'rgba(124,92,252,0.12)',
  accent: '#7C5CFC',
  accentLight: '#A78BFA',
  accentGlow: 'rgba(124,92,252,0.15)',
  accentBorder: 'rgba(124,92,252,0.45)',
  warm: '#F59E42',
  warmLight: '#FBB969',
  warmGlow: 'rgba(245,158,66,0.12)',
  success: '#4ADE80',
  border: 'rgba(255,255,255,0.10)',
  text: 'rgba(255,255,255,0.90)',
  textSub: 'rgba(255,255,255,0.48)',
  textHint: 'rgba(255,255,255,0.22)',
} as const;

export const HOBBY_TAGS = [
  { category: 'anime', label: 'Anime/Manga/Game', tags: ['Anime', 'Game', 'Manga', 'Cosplay'] },
  { category: 'music', label: 'Music/Entertainment', tags: ['Karaoke', 'Male Idol', 'Female Idol', 'J-POP', 'K-POP', 'Jazz', 'EDM', 'Club'] },
  { category: 'food', label: 'Food/Lifestyle', tags: ['Bar/Izakaya', 'Cosmetics', 'Sauna'] },
  { category: 'outdoor', label: 'Outdoor/Sports', tags: ['Ski/Snowboard', 'Hiking'] },
] as const;

export const ALL_TAGS = HOBBY_TAGS.flatMap(c => c.tags);

export const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;
export const GENDER_FILTER_OPTIONS = ['Male', 'Female', 'Other', 'No preference'] as const;

export const TRAVEL_STYLES = ['Sightseeing', 'Gourmet', 'Adventure', 'Relaxation', 'Culture', 'Shopping'] as const;

export const LANGUAGES = [
  'Japanese', 'English', 'Chinese', 'Korean', 'Spanish', 'French',
  'German', 'Portuguese', 'Thai', 'Vietnamese', 'Indonesian', 'Arabic',
] as const;

export const TOKU_LEVELS = [
  { min: 0, max: 99, title: 'Traveler Egg', emoji: '\u{1F95A}' },
  { min: 100, max: 299, title: 'Traveler', emoji: '\u{1F392}' },
  { min: 300, max: 599, title: 'Migratory Bird', emoji: '\u{1F426}' },
  { min: 600, max: 999, title: 'World Traveler', emoji: '\u{1F30D}' },
  { min: 1000, max: Infinity, title: 'Legendary Traveler', emoji: '\u2728' },
] as const;

export function getTokuLevel(points: number) {
  return TOKU_LEVELS.find(l => points >= l.min && points <= l.max) ?? TOKU_LEVELS[0];
}

export const COUNTRIES = [
  { code: 'JP', name: 'Japan', flag: '\u{1F1EF}\u{1F1F5}' },
  { code: 'US', name: 'USA', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'GB', name: 'UK', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'FR', name: 'France', flag: '\u{1F1EB}\u{1F1F7}' },
  { code: 'DE', name: 'Germany', flag: '\u{1F1E9}\u{1F1EA}' },
  { code: 'KR', name: 'Korea', flag: '\u{1F1F0}\u{1F1F7}' },
  { code: 'CN', name: 'China', flag: '\u{1F1E8}\u{1F1F3}' },
  { code: 'TW', name: 'Taiwan', flag: '\u{1F1F9}\u{1F1FC}' },
  { code: 'TH', name: 'Thailand', flag: '\u{1F1F9}\u{1F1ED}' },
  { code: 'AU', name: 'Australia', flag: '\u{1F1E6}\u{1F1FA}' },
  { code: 'BR', name: 'Brazil', flag: '\u{1F1E7}\u{1F1F7}' },
  { code: 'IN', name: 'India', flag: '\u{1F1EE}\u{1F1F3}' },
  { code: 'ES', name: 'Spain', flag: '\u{1F1EA}\u{1F1F8}' },
  { code: 'IT', name: 'Italy', flag: '\u{1F1EE}\u{1F1F9}' },
  { code: 'MX', name: 'Mexico', flag: '\u{1F1F2}\u{1F1FD}' },
  { code: 'VN', name: 'Vietnam', flag: '\u{1F1FB}\u{1F1F3}' },
  { code: 'ID', name: 'Indonesia', flag: '\u{1F1EE}\u{1F1E9}' },
  { code: 'PH', name: 'Philippines', flag: '\u{1F1F5}\u{1F1ED}' },
  { code: 'CA', name: 'Canada', flag: '\u{1F1E8}\u{1F1E6}' },
  { code: 'NZ', name: 'New Zealand', flag: '\u{1F1F3}\u{1F1FF}' },
] as const;
