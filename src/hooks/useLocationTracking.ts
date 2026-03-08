'use client';
import { useEffect, useRef } from 'react';
import { getSupabase } from '@/lib/supabase';

// const INTERVAL_MS = 30_000; // 30秒（テスト用）
const INTERVAL_MS = 60 * 60 * 1_000; // 1時間

export function useLocationTracking(userId: string | null) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!userId) return;
    if (!navigator.geolocation) return;

    const saveLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { error } = await getSupabase().from('location_logs').insert({
            id: crypto.randomUUID(),
            user_id: userId,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            recorded_at: new Date().toISOString(),
          });
          if (error) {
            console.error('location_logs insert error:', error.message, error.details, error.hint);
          } else {
            console.log('位置情報を保存しました');
          }
        },
        (err) => {
          console.warn('位置情報の取得に失敗しました:', err.message);
        },
        { enableHighAccuracy: false, timeout: 10_000 }
      );
    };

    saveLocation();
    intervalRef.current = setInterval(saveLocation, INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [userId]);
}
