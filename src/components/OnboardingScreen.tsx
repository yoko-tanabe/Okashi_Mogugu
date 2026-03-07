'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, MapPin } from 'lucide-react';
import { HOBBY_TAGS, GENDER_OPTIONS, COUNTRIES, LANGUAGES, TRAVEL_STYLES } from '@/lib/constants';
import { UserProfile } from '@/lib/types';
import AmbientGlow from './AmbientGlow';

interface Props {
  onComplete: (profile: Partial<UserProfile>) => void;
}

const TOTAL_STEPS = 8;

export default function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [nationality, setNationality] = useState('');
  const [gender, setGender] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [genderFilter, setGenderFilter] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(40);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [videoLinks, setVideoLinks] = useState<string[]>(['']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [travelStyle, setTravelStyle] = useState('');

  const canProceed = () => {
    switch (step) {
      case 1: return name.trim() !== '' && nationality !== '';
      case 2: return gender !== '' && birthYear !== '';
      case 3: return genderFilter.length > 0;
      case 4: return selectedTags.length >= 3;
      case 5: return true;
      case 6: return true;
      case 7: return selectedLanguages.length > 0;
      case 8: return true;
      default: return true;
    }
  };

  const handleComplete = () => {
    const bd = `${birthYear}-${(birthMonth || '01').padStart(2, '0')}-${(birthDay || '01').padStart(2, '0')}`;
    const age = new Date().getFullYear() - parseInt(birthYear || '2000');
    const ageGroup = age < 20 ? '10s' : age < 30 ? '20s' : age < 40 ? '30s' : age < 50 ? '40s' : '50s+';
    onComplete({
      name,
      nationality,
      gender,
      birthDate: bd,
      ageGroup,
      genderFilter,
      ageRangeMin: ageMin,
      ageRangeMax: ageMax,
      hobbyTags: selectedTags,
      freeText,
      videoLinks: videoLinks.filter(v => v.trim() !== ''),
      languages: selectedLanguages,
      travelStyle,
    });
  };

  const next = () => {
    if (step === TOTAL_STEPS) {
      handleComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleLang = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const toggleGenderFilter = (g: string) => {
    if (g === 'No preference') {
      setGenderFilter(['No preference']);
    } else {
      setGenderFilter(prev => {
        const next = prev.filter(x => x !== 'No preference');
        return next.includes(g) ? next.filter(x => x !== g) : [...next, g];
      });
    }
  };

  const warmOpacity = Math.max(0.01, 0.04 - (step - 1) * 0.005);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <AmbientGlow warmOpacity={warmOpacity} />

      {/* Progress bar */}
      <div style={{ padding: '16px 24px 0', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 3,
                background: i < step
                  ? 'linear-gradient(90deg, #7C5CFC, #A78BFA)'
                  : 'rgba(255,255,255,0.06)',
                boxShadow: i < step ? '0 0 8px rgba(124,92,252,0.3)' : 'none',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Header blur area */}
      <div
        style={{
          height: 100,
          background: 'linear-gradient(to bottom, rgba(124,92,252,0.06), var(--bg))',
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div style={{ flex: 1, padding: '0 24px', position: 'relative', zIndex: 2, overflowY: 'auto', paddingBottom: 100 }}>
        {step === 1 && (
          <StepContainer title="What's your name?" sub="Tell us your nickname and where you're from">
            <input className="input-field" placeholder="Nickname" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 16 }} />
            <label style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 8, display: 'block' }}>Nationality</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {COUNTRIES.map(c => (
                <button
                  key={c.code}
                  className={`tag-chip ${nationality === c.code ? 'selected' : ''}`}
                  onClick={() => setNationality(c.code)}
                >
                  {c.flag} {c.name}
                </button>
              ))}
            </div>
          </StepContainer>
        )}

        {step === 2 && (
          <StepContainer title="About you" sub="Your gender and age (only age range will be shown)">
            <label style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 8, display: 'block' }}>Gender</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {GENDER_OPTIONS.map(g => (
                <button key={g} className={`tag-chip ${gender === g ? 'selected' : ''}`} onClick={() => setGender(g)}>
                  {g}
                </button>
              ))}
            </div>
            <label style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 8, display: 'block' }}>Birth year</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input-field" type="number" placeholder="Year" value={birthYear} onChange={e => setBirthYear(e.target.value)} style={{ flex: 2 }} />
              <input className="input-field" type="number" placeholder="Month" value={birthMonth} onChange={e => setBirthMonth(e.target.value)} style={{ flex: 1 }} />
              <input className="input-field" type="number" placeholder="Day" value={birthDay} onChange={e => setBirthDay(e.target.value)} style={{ flex: 1 }} />
            </div>
          </StepContainer>
        )}

        {step === 3 && (
          <StepContainer title="Who would you like to meet?" sub="Select gender and age range preferences (not shown to others)">
            <label style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 8, display: 'block' }}>Gender preference</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {['Male', 'Female', 'Other', 'No preference'].map(g => (
                <button key={g} className={`tag-chip ${genderFilter.includes(g) ? 'selected' : ''}`} onClick={() => toggleGenderFilter(g)}>
                  {g}
                </button>
              ))}
            </div>
            <label style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 8, display: 'block' }}>Age range: {ageMin} - {ageMax}</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input type="range" min={18} max={60} value={ageMin} onChange={e => setAgeMin(Number(e.target.value))} style={{ flex: 1, accentColor: '#7C5CFC' }} />
              <span style={{ color: 'var(--text-sub)', fontSize: 13 }}>to</span>
              <input type="range" min={18} max={60} value={ageMax} onChange={e => setAgeMax(Number(e.target.value))} style={{ flex: 1, accentColor: '#7C5CFC' }} />
            </div>
          </StepContainer>
        )}

        {step === 4 && (
          <StepContainer title="Your interests" sub="Select at least 3 tags">
            {HOBBY_TAGS.map(cat => (
              <div key={cat.category} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 10 }}>{cat.label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {cat.tags.map(tag => (
                    <button
                      key={tag}
                      className={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {selectedTags.includes(tag) && <Check size={14} />}
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ fontSize: 12, color: selectedTags.length >= 3 ? 'var(--success)' : 'var(--text-sub)' }}>
              {selectedTags.length}/3 minimum selected
            </div>
          </StepContainer>
        )}

        {step === 5 && (
          <StepContainer title="Free text" sub="Your favorite anime, artists, hobbies - anything!">
            <textarea
              className="input-field"
              placeholder="e.g. Demon Slayer, Rengoku, Hoshi no Rin"
              value={freeText}
              onChange={e => setFreeText(e.target.value)}
              style={{ minHeight: 120, resize: 'vertical' }}
            />
          </StepContainer>
        )}

        {step === 6 && (
          <StepContainer title="Favorite videos" sub="Share up to 5 video links (YouTube, TikTok, etc.)">
            {videoLinks.map((link, i) => (
              <input
                key={i}
                className="input-field"
                placeholder={`Video URL ${i + 1}`}
                value={link}
                onChange={e => {
                  const next = [...videoLinks];
                  next[i] = e.target.value;
                  setVideoLinks(next);
                }}
                style={{ marginBottom: 12 }}
              />
            ))}
            {videoLinks.length < 5 && (
              <button
                onClick={() => setVideoLinks(prev => [...prev, ''])}
                style={{ background: 'none', border: 'none', color: 'var(--accent-light)', fontSize: 14, cursor: 'pointer' }}
              >
                + Add another link
              </button>
            )}
          </StepContainer>
        )}

        {step === 7 && (
          <StepContainer title="Languages & travel style" sub="What languages do you speak?">
            <label style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 8, display: 'block' }}>Languages</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {LANGUAGES.map(lang => (
                <button key={lang} className={`tag-chip ${selectedLanguages.includes(lang) ? 'selected' : ''}`} onClick={() => toggleLang(lang)}>
                  {selectedLanguages.includes(lang) && <Check size={14} />}
                  {lang}
                </button>
              ))}
            </div>
            <label style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 8, display: 'block' }}>Travel style</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TRAVEL_STYLES.map(style => (
                <button key={style} className={`tag-chip ${travelStyle === style ? 'selected' : ''}`} onClick={() => setTravelStyle(style)}>
                  {style}
                </button>
              ))}
            </div>
          </StepContainer>
        )}

        {step === 8 && (
          <StepContainer title="Location access" sub="We need your location to detect encounters">
            <div className="card-surface" style={{ textAlign: 'center', padding: 32 }}>
              <MapPin size={48} color="#A78BFA" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: 15, marginBottom: 8 }}>Allow location access</p>
              <p style={{ fontSize: 12, color: 'var(--text-sub)', lineHeight: 1.6 }}>
                This app uses your location to find travelers nearby.
                Location is shared with a 5-minute delay for your safety.
              </p>
            </div>
          </StepContainer>
        )}
      </div>

      {/* Footer buttons */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 430,
          width: '100%',
          padding: '16px 24px calc(16px + env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        {step > 1 ? (
          <button
            onClick={() => setStep(s => s - 1)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 15 }}
          >
            <ChevronLeft size={18} /> Back
          </button>
        ) : (
          <div />
        )}
        <button className="btn-primary" disabled={!canProceed()} onClick={next}>
          {step === TOTAL_STEPS ? 'Complete' : 'Next'}
          {step < TOTAL_STEPS && <ChevronRight size={16} style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
        </button>
      </div>
    </div>
  );
}

function StepContainer({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 24 }}>{sub}</p>
      {children}
    </div>
  );
}
