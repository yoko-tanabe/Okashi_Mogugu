'use client';
import { useState } from 'react';
import { User, Globe, MapPin, Shield, Clock, ChevronRight, Edit3 } from 'lucide-react';
import { useApp } from '@/lib/store';
import { getTokuLevel, COUNTRIES, HOBBY_TAGS, LANGUAGES, TRAVEL_STYLES } from '@/lib/constants';
import AmbientGlow from './AmbientGlow';

export default function MyProfileScreen() {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(state.myProfile.name);
  const [editFreeText, setEditFreeText] = useState(state.myProfile.freeText);
  const [showTokuHistory, setShowTokuHistory] = useState(false);

  const profile = state.myProfile;
  const country = COUNTRIES.find(c => c.code === profile.nationality);
  const toku = getTokuLevel(profile.tokuPoints);

  const handleSave = () => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { name: editName, freeText: editFreeText } });
    setEditing(false);
  };

  return (
    <div className="page-container" style={{ background: 'var(--bg)', paddingBottom: 80, overflowY: 'auto' }}>
      <AmbientGlow />

      <div style={{ padding: '16px 24px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>
            <span className="gradient-text">My Profile</span>
          </h1>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '8px 14px',
              color: editing ? 'var(--success)' : 'var(--accent-light)',
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Edit3 size={14} /> {editing ? 'Save' : 'Edit'}
          </button>
        </div>

        {/* Profile card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,92,252,0.12), rgba(245,158,66,0.08))',
          border: '1px solid var(--accent-border)',
          borderRadius: 24,
          padding: 24,
          marginBottom: 24,
          textAlign: 'center',
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(124,92,252,0.3), rgba(245,158,66,0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <User size={36} color="rgba(255,255,255,0.4)" />
          </div>

          {editing ? (
            <input
              className="input-field"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              style={{ textAlign: 'center', marginBottom: 8 }}
            />
          ) : (
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{profile.name}</div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 20 }}>{country?.flag}</span>
            <span style={{ fontSize: 14, color: 'var(--text-sub)' }}>{profile.ageGroup} &middot; {profile.gender}</span>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--surface-active)',
            border: '1px solid var(--accent-border)',
            borderRadius: 20,
            padding: '6px 16px',
            fontSize: 14,
            color: 'var(--accent-light)',
          }}>
            {toku.emoji} {toku.title} &middot; {profile.tokuPoints}pt
          </div>
        </div>

        {/* Interests */}
        <SectionCard title="Interests">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {profile.hobbyTags.map(tag => (
              <span key={tag} className="tag-chip selected">{tag}</span>
            ))}
          </div>
        </SectionCard>

        {/* Free text */}
        <SectionCard title="About me">
          {editing ? (
            <textarea
              className="input-field"
              value={editFreeText}
              onChange={e => setEditFreeText(e.target.value)}
              style={{ minHeight: 80, resize: 'vertical' }}
            />
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-sub)', lineHeight: 1.6 }}>
              {profile.freeText || 'No description yet'}
            </p>
          )}
        </SectionCard>

        {/* Languages */}
        <SectionCard title="Languages">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {profile.languages.map(l => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-sub)' }}>
                <Globe size={14} /> {l}
              </span>
            ))}
          </div>
        </SectionCard>

        {/* Travel style */}
        <SectionCard title="Travel style">
          <span className="tag-chip selected">{profile.travelStyle}</span>
        </SectionCard>

        {/* Toku history */}
        <button
          onClick={() => setShowTokuHistory(!showTokuHistory)}
          className="card-surface"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            marginBottom: 16,
            border: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600 }}>Toku Point History</span>
          <ChevronRight size={18} color="var(--text-sub)" style={{ transform: showTokuHistory ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {showTokuHistory && (
          <div style={{ marginBottom: 16 }}>
            {state.tokuHistory.map(h => (
              <div key={h.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontSize: 14 }}>{h.action}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>{h.date}</div>
                </div>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--success)' }}>+{h.points}</span>
              </div>
            ))}
          </div>
        )}

        {/* Settings section */}
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, marginTop: 8 }}>Settings</div>

        <SettingRow icon={<Shield size={18} />} label="Do Not Disturb mode" value={state.doNotDisturbMode ? 'ON' : 'OFF'} onClick={() => dispatch({ type: 'TOGGLE_DND' })} />
        <SettingRow icon={<MapPin size={18} />} label="Location sharing" value="Active" />
        <SettingRow icon={<Clock size={18} />} label="DND schedule" value="Not set" />
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-surface" style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function SettingRow({ icon, label, value, onClick }: { icon: React.ReactNode; label: string; value: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        cursor: onClick ? 'pointer' : 'default',
        marginBottom: 8,
        color: 'var(--text)',
        fontSize: 14,
      }}
    >
      <span style={{ color: 'var(--accent-light)' }}>{icon}</span>
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      <span style={{ color: 'var(--text-sub)', fontSize: 13 }}>{value}</span>
      <ChevronRight size={16} color="var(--text-hint)" />
    </button>
  );
}
