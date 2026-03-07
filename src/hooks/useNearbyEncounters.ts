'use client';
import { useState, useEffect } from 'react';
import { getSupabase } from '@/lib/supabase';

export interface NearbyUser {
  userId: string;
  encounteredAt: string;
  name: string;
  nationality: string;
  gender: string;
  ageGroup: string;
  hobbyTags: string[];
  freeText: string;
  languages: string[];
  travelStyle: string;
  tokuPoints: number;
  avatarUrl: string;
  address: string;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useNearbyEncounters(userId: string | null) {
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadNearby = async () => {
      setLoading(true);

      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [myResult, otherResult] = await Promise.all([
        getSupabase()
          .from('location_logs')
          .select('latitude, longitude, recorded_at')
          .eq('user_id', userId)
          .gte('recorded_at', since),
        getSupabase()
          .from('location_logs')
          .select('user_id, latitude, longitude, recorded_at')
          .neq('user_id', userId)
          .gte('recorded_at', since),
      ]);

      const myLogs = myResult.data;
      const otherLogs = otherResult.data;

      if (!myLogs?.length || !otherLogs?.length) {
        setLoading(false);
        return;
      }

      // Find users who were within 2m within 2 minutes
      const matched = new Map<string, { encounteredAt: string; midLat: number; midLon: number }>();

      for (const mine of myLogs) {
        const myTime = new Date(mine.recorded_at).getTime();
        for (const other of otherLogs) {
          if (matched.has(other.user_id)) continue;
          const timeDiffMin = Math.abs(myTime - new Date(other.recorded_at).getTime()) / 60000;
          if (timeDiffMin > 2) continue;
          const dist = haversineMeters(mine.latitude, mine.longitude, other.latitude, other.longitude);
          if (dist <= 2) {
            matched.set(other.user_id, {
              encounteredAt: other.recorded_at,
              midLat: (mine.latitude + other.latitude) / 2,
              midLon: (mine.longitude + other.longitude) / 2,
            });
          }
        }
      }

      if (matched.size === 0) {
        setLoading(false);
        return;
      }

      const userIds = Array.from(matched.keys());
      const { data: profiles } = await getSupabase()
        .from('profiles')
        .select('id, name, nationality, gender, age_group, hobby_tags, free_text, languages, travel_style, toku_points, avatar_url')
        .in('id', userIds);

      // Fetch addresses from Nominatim for each midpoint
      const addressMap = new Map<string, string>();
      await Promise.all(
        userIds.map(async (uid) => {
          const info = matched.get(uid)!;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${info.midLat}&lon=${info.midLon}`,
              { headers: { 'Accept-Language': 'ja', 'User-Agent': 'OkashiMoguguApp/1.0' } }
            );
            const json = await res.json();
            const a = json.address ?? {};
            const parts = [a.road, a.suburb ?? a.neighbourhood, a.city ?? a.town ?? a.village].filter(Boolean);
            addressMap.set(uid, parts.length > 0 ? parts.join(', ') : (json.display_name ?? ''));
          } catch {
            addressMap.set(uid, '');
          }
        })
      );

      const result: NearbyUser[] = userIds
        .map((uid) => {
          const p = profiles?.find((x) => x.id === uid);
          if (!p) return null;
          const info = matched.get(uid)!;
          return {
            userId: uid,
            encounteredAt: info.encounteredAt,
            name: p.name ?? '',
            nationality: p.nationality ?? '',
            gender: p.gender ?? '',
            ageGroup: p.age_group ?? '',
            hobbyTags: p.hobby_tags ?? [],
            freeText: p.free_text ?? '',
            languages: p.languages ?? [],
            travelStyle: p.travel_style ?? '',
            tokuPoints: p.toku_points ?? 0,
            avatarUrl: p.avatar_url ?? '',
            address: addressMap.get(uid) ?? '',
          };
        })
        .filter(Boolean) as NearbyUser[];

      // Save encounters to Supabase (upsert to avoid duplicates)
      const encounterRows = result.map((u) => {
        const info = matched.get(u.userId)!;
        return {
          id: crypto.randomUUID(),
          user_a_id: userId,
          user_b_id: u.userId,
          encountered_at: info.encounteredAt,
          location: u.address || '',
          latitude: info.midLat,
          longitude: info.midLon,
          distance_meters: 2,
          expired: false,
        };
      });
      if (encounterRows.length > 0) {
        await getSupabase()
          .from('encounters')
          .insert(encounterRows)
          .then(({ error }) => {
            // Ignore unique constraint violations (duplicate encounters)
            if (error && error.code !== '23505') {
              console.error('Failed to save encounters:', error);
            }
          });
      }

      setNearbyUsers(result);
      setLoading(false);
    };

    loadNearby();
  }, [userId]);

  return { nearbyUsers, loading };
}
