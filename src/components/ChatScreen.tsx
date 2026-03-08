'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Send, User, Clock, Check } from 'lucide-react';
import { useApp } from '@/lib/store';
import { COUNTRIES, getTokuLevel } from '@/lib/constants';
import { getSupabase } from '@/lib/supabase';

interface ChatUser {
  id: string;
  name: string;
  nationality: string;
  tokuPoints: number;
  avatarUrl: string;
}

interface DbMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

interface MatchData {
  id: string;
  userAId: string;
  userBId: string;
  status: string;
  chatOpen: boolean;
  meetConfirmedA: boolean;
  meetConfirmedB: boolean;
  meetDeadline: string | null;
  metUp: boolean;
}

interface Props {
  matchId: string;
  userId: string | null;
  onBack: () => void;
}

export default function ChatScreen({ matchId, userId, onBack }: Props) {
  const { dispatch } = useApp();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer state derived from DB meet_deadline
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch match data and messages
  const fetchData = useCallback(async () => {
    if (!userId) return;

    const { data: row } = await getSupabase()
      .from('matches')
      .select('id, user_a_id, user_b_id, status, chat_open, meet_confirmed_a, meet_confirmed_b, meet_deadline, met_up')
      .eq('id', matchId)
      .single();

    if (!row) { setLoading(false); return; }

    const md: MatchData = {
      id: row.id,
      userAId: row.user_a_id,
      userBId: row.user_b_id,
      status: row.status,
      chatOpen: row.chat_open ?? true,
      meetConfirmedA: row.meet_confirmed_a ?? false,
      meetConfirmedB: row.meet_confirmed_b ?? false,
      meetDeadline: row.meet_deadline ?? null,
      metUp: row.met_up ?? false,
    };
    setMatchData(md);

    // Fetch other user's profile
    const otherId = row.user_a_id === userId ? row.user_b_id : row.user_a_id;
    const { data: profile } = await getSupabase()
      .from('profiles')
      .select('id, name, nationality, toku_points, avatar_url')
      .eq('id', otherId)
      .single();

    if (profile) {
      setOtherUser({
        id: profile.id,
        name: profile.name ?? '',
        nationality: profile.nationality ?? '',
        tokuPoints: profile.toku_points ?? 0,
        avatarUrl: profile.avatar_url ?? '',
      });
    }

    // Fetch messages
    const { data: msgs } = await getSupabase()
      .from('messages')
      .select('id, sender_id, text, created_at')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (msgs) {
      setMessages(msgs.map(m => ({
        id: m.id,
        senderId: m.sender_id,
        text: m.text,
        createdAt: m.created_at,
      })));
    }

    setLoading(false);
  }, [userId, matchId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    pollingRef.current = setInterval(async () => {
      if (!userId) return;
      const { data: msgs } = await getSupabase()
        .from('messages')
        .select('id, sender_id, text, created_at')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (msgs) {
        setMessages(msgs.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          text: m.text,
          createdAt: m.created_at,
        })));
      }

      // Also refresh match data for meet status changes
      const { data: row } = await getSupabase()
        .from('matches')
        .select('meet_confirmed_a, meet_confirmed_b, meet_deadline, met_up')
        .eq('id', matchId)
        .single();

      if (row) {
        setMatchData(prev => prev ? {
          ...prev,
          meetConfirmedA: row.meet_confirmed_a ?? false,
          meetConfirmedB: row.meet_confirmed_b ?? false,
          meetDeadline: row.meet_deadline ?? null,
          metUp: row.met_up ?? false,
        } : prev);
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [userId, matchId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Timer countdown based on meet_deadline
  useEffect(() => {
    if (!matchData?.meetDeadline) {
      setTimeLeft(null);
      return;
    }

    const update = () => {
      const remaining = Math.max(0, Math.floor((new Date(matchData.meetDeadline!).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [matchData?.meetDeadline]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!input.trim() || !userId) return;
    const text = input.trim();
    setInput('');

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { id: tempId, senderId: userId, text, createdAt: new Date().toISOString() }]);

    await getSupabase()
      .from('messages')
      .insert({
        id: crypto.randomUUID(),
        match_id: matchId,
        sender_id: userId,
        text,
      });
  };

  const handleConfirmMeet = async () => {
    if (!userId || !matchData) return;

    const isUserA = matchData.userAId === userId;
    const updateField = isUserA ? 'meet_confirmed_a' : 'meet_confirmed_b';

    await getSupabase()
      .from('matches')
      .update({ [updateField]: true })
      .eq('id', matchId);

    setMatchData(prev => prev ? {
      ...prev,
      ...(isUserA ? { meetConfirmedA: true } : { meetConfirmedB: true }),
    } : prev);
  };

  const handleDeclineMeet = async () => {
    if (!userId || !matchData) return;

    await getSupabase()
      .from('matches')
      .update({ chat_open: false })
      .eq('id', matchId);

    setMatchData(prev => prev ? { ...prev, chatOpen: false } : prev);
  };

  const handleMetUp = async () => {
    if (!userId || !matchData) return;

    // Start countdown timer and mark met_up
    const deadline = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await getSupabase()
      .from('matches')
      .update({ met_up: true, meet_deadline: deadline })
      .eq('id', matchId);

    setMatchData(prev => prev ? { ...prev, metUp: true, meetDeadline: deadline } : prev);

    // Also update local store for stamp/toku
    dispatch({ type: 'MET_UP', matchId });
  };

  if (loading) {
    return <div className="page-container" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
      <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>Loading...</p>
    </div>;
  }

  if (!matchData || !otherUser) return null;

  const country = COUNTRIES.find(c => c.code === otherUser.nationality);
  const isMeUserA = matchData.userAId === userId;
  const myConfirmed = isMeUserA ? matchData.meetConfirmedA : matchData.meetConfirmedB;
  const otherConfirmed = isMeUserA ? matchData.meetConfirmedB : matchData.meetConfirmedA;
  const bothConfirmed = myConfirmed && otherConfirmed;
  const timerActive = matchData.meetDeadline !== null;
  const chatDisabled = !matchData.chatOpen;

  return (
    <div className="page-container" style={{ background: 'var(--bg)', display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: 'rgba(11,14,20,0.95)',
        backdropFilter: 'blur(20px)',
        flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(124,92,252,0.2), rgba(245,158,66,0.15))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {otherUser.avatarUrl ? (
            <img src={otherUser.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={18} color="rgba(255,255,255,0.3)" />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            {otherUser.name} {country?.flag}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
            {getTokuLevel(otherUser.tokuPoints).emoji} {getTokuLevel(otherUser.tokuPoints).title}
          </div>
        </div>
        {!matchData.metUp && !myConfirmed && !chatDisabled && (
          <button
            onClick={handleConfirmMeet}
            style={{
              padding: '6px 12px',
              borderRadius: 10,
              background: 'var(--surface-active)',
              border: '1px solid var(--accent-border)',
              color: 'var(--accent-light)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexShrink: 0,
            }}
          >
            <Check size={14} /> Meetup
          </button>
        )}
      </div>

      {/* Timer bar - shown after "We met!" is pressed */}
      {timerActive && timeLeft !== null && matchData.metUp && (
        <div style={{
          padding: '10px 16px',
          background: timeLeft < 600 ? 'rgba(239,68,68,0.1)' : 'var(--surface-active)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          flexShrink: 0,
        }}>
          <Clock size={16} color={timeLeft < 600 ? '#EF4444' : 'var(--accent-light)'} />
          <span style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: timeLeft < 600 ? '#EF4444' : 'var(--accent-light)' }}>
            {formatTime(timeLeft)}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>remaining</span>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.senderId === userId ? 'flex-end' : 'flex-start',
              marginBottom: 12,
            }}
          >
            <div style={{
              maxWidth: '75%',
              padding: '10px 16px',
              borderRadius: msg.senderId === userId ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.senderId === userId
                ? 'linear-gradient(135deg, #7C5CFC, #6B4FD8)'
                : 'var(--surface)',
              fontSize: 14,
              lineHeight: 1.5,
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Meetup request/status messages */}
        {!matchData.metUp && !chatDisabled && (otherConfirmed || myConfirmed) && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 12,
            marginTop: 8,
          }}>
            <div style={{
              background: bothConfirmed ? 'rgba(74,222,128,0.1)' : 'rgba(124,92,252,0.1)',
              border: `1px solid ${bothConfirmed ? 'rgba(74,222,128,0.2)' : 'rgba(124,92,252,0.2)'}`,
              borderRadius: 16,
              padding: '12px 20px',
              textAlign: 'center',
              maxWidth: '85%',
            }}>
              {bothConfirmed ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#4ADE80', marginBottom: 2 }}>
                    Meetup confirmed! 🤝
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                    会う約束が確定しました。実際に会えたら「We met!」を押してください
                  </div>
                </>
              ) : otherConfirmed && !myConfirmed ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-light)', marginBottom: 6 }}>
                    {otherUser.name} wants to meet up! 🙋
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-sub)', marginBottom: 10 }}>
                    {otherUser.name}さんが会いたいとリクエストしています
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button
                      onClick={handleConfirmMeet}
                      style={{
                        padding: '8px 20px',
                        borderRadius: 12,
                        background: 'rgba(74,222,128,0.15)',
                        border: '1px solid rgba(74,222,128,0.3)',
                        color: '#4ADE80',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Accept ✓
                    </button>
                    <button
                      onClick={handleDeclineMeet}
                      style={{
                        padding: '8px 20px',
                        borderRadius: 12,
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        color: '#EF4444',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Decline ✕
                    </button>
                  </div>
                </>
              ) : myConfirmed && !otherConfirmed ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-light)', marginBottom: 2 }}>
                    Meetup request sent 📩
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                    {otherUser.name}さんの返答を待っています...
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Chat declined message */}
        {chatDisabled && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 12,
            marginTop: 8,
          }}>
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 16,
              padding: '10px 20px',
              textAlign: 'center',
              maxWidth: '85%',
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#EF4444', marginBottom: 2 }}>
                Meetup declined
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>
                このチャットでのメッセージ送信は終了しました
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Meet up success */}
      {matchData.metUp && (
        <div style={{
          padding: '32px 24px',
          paddingBottom: 'calc(32px + 70px)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.06) 100%)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(124,92,252,0.15), rgba(245,158,66,0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            overflow: 'hidden',
          }}>
            {otherUser.avatarUrl ? (
              <img src={otherUser.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={28} color="rgba(255,255,255,0.4)" />
            )}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>
            You met {otherUser.name}!
          </div>
          <div style={{
            fontSize: 13,
            color: 'var(--text-sub)',
            marginTop: 2,
            lineHeight: 1.5,
          }}>
            +30 Toku points earned
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 12,
            padding: '6px 16px',
            borderRadius: 20,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 12,
            color: 'var(--text-sub)',
          }}>
            Stamp added to passport
          </div>
        </div>
      )}

      {/* Action buttons area */}
      {!matchData.metUp && !chatDisabled && (
        <div style={{ padding: '12px 16px', paddingBottom: 'calc(12px + 70px)', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {bothConfirmed && (
            <button
              onClick={handleMetUp}
              className="btn-gradient"
              style={{ marginBottom: 12 }}
            >
              We met! 🎉
            </button>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input-field"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSend()}
              style={{ flex: 1 }}
            />
            <button
              onClick={handleSend}
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'var(--accent)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
