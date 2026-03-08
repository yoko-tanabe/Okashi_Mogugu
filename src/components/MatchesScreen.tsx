'use client';
import { useState, useEffect } from 'react';
import { User, MessageCircle, Clock, MapPin } from 'lucide-react';
import { getTokuLevel, COUNTRIES } from '@/lib/constants';
import { getSupabase } from '@/lib/supabase';
import AmbientGlow from './AmbientGlow';
import { useNearbyEncounters } from '@/hooks/useNearbyEncounters';

interface MatchUser {
  id: string;
  name: string;
  nationality: string;
  gender: string;
  ageGroup: string;
  hobbyTags: string[];
  tokuPoints: number;
  avatarUrl: string;
}

interface DbMatch {
  id: string;
  user: MatchUser;
  matchedAt: string;
  status: 'pending_sent' | 'pending_received' | 'matched';
  chatOpen: boolean;
  metUp: boolean;
}

interface NearbyEncounter {
  userId: string;
  encounteredAt: string;
  name: string;
  nationality: string;
  ageGroup: string;
  hobbyTags: string[];
  tokuPoints: number;
  avatarUrl: string;
  address: string;
}

interface Props {
  onOpenChat: (matchId: string) => void;
  userId: string | null;
}

export default function MatchesScreen({ onOpenChat, userId }: Props) {
  const [dbMatches, setDbMatches] = useState<DbMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matches' | 'nearby' | 'met'>('matches');
  const [nearbyEncounters, setNearbyEncounters] = useState<NearbyEncounter[]>([]);
  useNearbyEncounters(userId); // バックグラウンドでencountersテーブルに保存

  useEffect(() => {
    if (!userId) return;

    const fetchNearby = async () => {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: rows } = await getSupabase()
        .from('encounters')
        .select('user_b_id, encountered_at, location')
        .eq('user_a_id', userId)
        .gte('encountered_at', since)
        .order('encountered_at', { ascending: false });

      if (!rows || rows.length === 0) return;

      const otherIds = rows.map(r => r.user_b_id);
      const { data: profiles } = await getSupabase()
        .from('profiles')
        .select('id, name, nationality, age_group, hobby_tags, toku_points, avatar_url')
        .in('id', otherIds);

      const profileMap = new Map((profiles ?? []).map(p => [p.id, p]));
      const encounters: NearbyEncounter[] = rows
        .map(r => {
          const p = profileMap.get(r.user_b_id);
          if (!p) return null;
          return {
            userId: r.user_b_id,
            encounteredAt: r.encountered_at,
            name: p.name ?? '',
            nationality: p.nationality ?? '',
            ageGroup: p.age_group ?? '',
            hobbyTags: p.hobby_tags ?? [],
            tokuPoints: p.toku_points ?? 0,
            avatarUrl: p.avatar_url ?? '',
            address: r.location ?? '',
          };
        })
        .filter((e): e is NearbyEncounter => e !== null);

      // 同一ユーザーの重複を除去（最新のみ残す）
      const seen = new Set<string>();
      setNearbyEncounters(encounters.filter(e => {
        if (seen.has(e.userId)) return false;
        seen.add(e.userId);
        return true;
      }));
    };

    fetchNearby();
  }, [userId]);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    const fetchMatches = async () => {
      // matchesテーブルから自分が関わるレコードを取得
      const { data: matchRows, error } = await getSupabase()
        .from('matches')
        .select('id, user_a_id, user_b_id, status, chat_open, matched_at, met_up')
        .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

      if (error || !matchRows || matchRows.length === 0) {
        setLoading(false);
        return;
      }

      // 相手のユーザーIDを集める
      const otherUserIds = matchRows.map(row =>
        row.user_a_id === userId ? row.user_b_id : row.user_a_id
      );

      // 相手のプロフィールを取得
      const { data: profiles } = await getSupabase()
        .from('profiles')
        .select('id, name, nationality, gender, age_group, hobby_tags, toku_points, avatar_url')
        .in('id', otherUserIds);

      const profileMap = new Map<string, MatchUser>();
      (profiles ?? []).forEach(p => {
        profileMap.set(p.id, {
          id: p.id,
          name: p.name ?? '',
          nationality: p.nationality ?? '',
          gender: p.gender ?? '',
          ageGroup: p.age_group ?? '',
          hobbyTags: p.hobby_tags ?? [],
          tokuPoints: p.toku_points ?? 0,
          avatarUrl: p.avatar_url ?? '',
        });
      });

      // MatchEntryに変換
      const entries: DbMatch[] = matchRows
        .map(row => {
          const otherId = row.user_a_id === userId ? row.user_b_id : row.user_a_id;
          const user = profileMap.get(otherId);
          if (!user) return null;

          // statusの判定: DB上 'matched' ならmatched、それ以外はpending
          let status: DbMatch['status'];
          if (row.status === 'matched') {
            status = 'matched';
          } else {
            // user_a_idがスワイプを先にした側
            status = row.user_a_id === userId ? 'pending_sent' : 'pending_received';
          }

          return {
            id: row.id,
            user,
            matchedAt: row.matched_at ?? '',
            status,
            chatOpen: row.chat_open ?? false,
            metUp: row.met_up ?? false,
          };
        })
        .filter((e): e is DbMatch => e !== null);

      setDbMatches(entries);
      setLoading(false);
    };

    fetchMatches();
  }, [userId]);

  const metUp = dbMatches.filter(m => m.metUp);
  const matched = dbMatches.filter(m => m.status === 'matched' && !m.metUp);
  const pending = dbMatches.filter(m => (m.status === 'pending_received' || m.status === 'pending_sent') && !m.metUp);

  // マッチ済み・ペンディングのユーザーIDを除外
  const matchedUserIds = new Set(dbMatches.map(m => m.user.id));
  const filteredNearbyUsers = nearbyEncounters.filter(u => !matchedUserIds.has(u.userId));

  return (
    <div className="page-container" style={{ background: 'var(--bg)', paddingBottom: 80 }}>
      <AmbientGlow />

      <div style={{ padding: '16px 24px', position: 'relative', zIndex: 2 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          <span className="gradient-text">Matches</span>
        </h1>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          gap: 0,
          marginBottom: 20,
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 12,
          padding: 3,
        }}>
          {(['matches', 'nearby', 'met'] as const).map(tab => {
            const isActive = activeTab === tab;
            const label = tab === 'matches'
              ? `Matches${matched.length + pending.length > 0 ? ` (${matched.length + pending.length})` : ''}`
              : tab === 'nearby'
                ? `Nearby${filteredNearbyUsers.length > 0 ? ` (${filteredNearbyUsers.length})` : ''}`
                : `Met${metUp.length > 0 ? ` (${metUp.length})` : ''}`;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 10,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: isActive ? 'var(--text-main)' : 'var(--text-sub)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {loading && (
          <p style={{ color: 'var(--text-sub)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Loading...</p>
        )}

        {/* Matches tab */}
        {activeTab === 'matches' && (
          <>
            {/* Matched */}
            {matched.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 12 }}>
                  Matched ({matched.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {matched.map(m => {
                    const country = COUNTRIES.find(c => c.code === m.user.nationality);
                    const toku = getTokuLevel(m.user.tokuPoints);
                    return (
                      <div
                        key={m.id}
                        className="card-surface"
                        style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                        onClick={() => onOpenChat(m.id)}
                      >
                        <div style={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(124,92,252,0.2), rgba(245,158,66,0.15))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}>
                          {m.user.avatarUrl ? (
                            <img src={m.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User size={24} color="rgba(255,255,255,0.3)" />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 16, fontWeight: 600 }}>{m.user.name}</span>
                            <span>{country?.flag}</span>
                            <span style={{ fontSize: 11, color: 'var(--accent-light)' }}>{toku.emoji} {toku.title}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                            {m.user.hobbyTags.slice(0, 3).join(' / ')}
                          </div>
                        </div>
                        <MessageCircle size={20} color="var(--accent-light)" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pending */}
            {pending.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-sub)', marginBottom: 12 }}>
                  Pending ({pending.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pending.map(m => {
                    const country = COUNTRIES.find(c => c.code === m.user.nationality);
                    return (
                      <div key={m.id} className="card-surface" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          background: 'var(--surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}>
                          {m.user.avatarUrl ? (
                            <img src={m.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User size={24} color="rgba(255,255,255,0.2)" />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 16, fontWeight: 600 }}>{m.user.name}</span>
                            <span>{country?.flag}</span>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} />
                            {m.status === 'pending_sent' ? 'Waiting for response' : 'Wants to meet you!'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!loading && matched.length === 0 && pending.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-sub)' }}>
                <User size={48} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: 16 }}>No matches yet</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>Swipe right on travelers you want to meet!</p>
              </div>
            )}
          </>
        )}

        {/* Nearby tab */}
        {activeTab === 'nearby' && (
          <>
            {filteredNearbyUsers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredNearbyUsers.map(u => {
                  const country = COUNTRIES.find(c => c.code === u.nationality);
                  const toku = getTokuLevel(u.tokuPoints);
                  const timeAgo = formatTimeAgo(u.encounteredAt);
                  return (
                    <div key={u.userId} className="card-surface" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(124,92,252,0.15))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}>
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={24} color="rgba(255,255,255,0.3)" />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 16, fontWeight: 600 }}>{u.name}</span>
                          <span>{country?.flag}</span>
                          <span style={{ fontSize: 11, color: 'var(--accent-light)' }}>{toku.emoji} {toku.title}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} />
                          <span>{u.address ? u.address : '2m以内'} · {timeAgo}</span>
                        </div>
                        {u.hobbyTags.length > 0 && (
                          <div style={{ fontSize: 12, color: 'var(--text-sub)', marginTop: 2 }}>
                            {u.hobbyTags.slice(0, 3).join(' / ')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-sub)' }}>
                <MapPin size={48} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: 16 }}>No nearby people found</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>近くにいた人がここに表示されます</p>
              </div>
            )}
          </>
        )}

        {/* Met tab */}
        {activeTab === 'met' && (
          <>
            {metUp.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {metUp.map(m => {
                  const country = COUNTRIES.find(c => c.code === m.user.nationality);
                  const toku = getTokuLevel(m.user.tokuPoints);
                  return (
                    <div
                      key={m.id}
                      className="card-surface"
                      style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                      onClick={() => onOpenChat(m.id)}
                    >
                      <div style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(74,222,128,0.2), rgba(124,92,252,0.15))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}>
                        {m.user.avatarUrl ? (
                          <img src={m.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={24} color="rgba(255,255,255,0.3)" />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 16, fontWeight: 600 }}>{m.user.name}</span>
                          <span>{country?.flag}</span>
                          <span style={{ fontSize: 11, color: 'var(--accent-light)' }}>{toku.emoji} {toku.title}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                          {m.user.hobbyTags.slice(0, 3).join(' / ')}
                        </div>
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: '#4ADE80',
                        background: 'rgba(74,222,128,0.1)',
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        Met
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-sub)' }}>
                <User size={48} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: 16 }}>No met-up history yet</p>
                <p style={{ fontSize: 13, marginTop: 4 }}>実際に会った人がここに表示されます</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}分前`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}時間前`;
  return `${Math.floor(diffH / 24)}日前`;
}
