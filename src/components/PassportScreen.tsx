'use client';
import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Share2, X } from 'lucide-react';
import { useApp } from '@/lib/store';
import { getSupabase } from '@/lib/supabase';
import { getTokuLevel, COUNTRIES } from '@/lib/constants';
import AmbientGlow from './AmbientGlow';

const WorldMapView = dynamic(() => import('./WorldMapView'), { ssr: false });

const STAMPS_PER_PAGE = 4;

const STAMP_IMAGES: Record<string, string> = {
  JP: '/stamps/japan.png',
  US: '/stamps/usa.png',
  GB: '/stamps/uk.png',
  FR: '/stamps/france.png',
  DE: '/stamps/germany.png',
  BR: '/stamps/brazil.png',
  IN: '/stamps/india.png',
  ES: '/stamps/spain.png',
  IT: '/stamps/italy.png',
  SG: '/stamps/singapore.png',
  CA: '/stamps/canada.png',
  CN: '/stamps/china.png',
  KR: '/stamps/korea.png',
};

interface DbProfile {
  id: string;
  name: string;
  nationality: string;
  gender: string;
  age_group: string;
  toku_points: number;
  created_at: string;
}

export default function PassportScreen() {
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [profiles, setProfiles] = useState<DbProfile[]>([]);
  const [metProfiles, setMetProfiles] = useState<DbProfile[]>([]);
  const [myDbProfile, setMyDbProfile] = useState<DbProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [userEncounterTimes, setUserEncounterTimes] = useState<Map<string, string>>(new Map());
  const [metUserTimes, setMetUserTimes] = useState<Map<string, string>>(new Map());
  const [stampTab, setStampTab] = useState<'met' | 'nearby'>('met');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await getSupabase().auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch my profile
      const { data: myProfileData } = await getSupabase()
        .from('profiles')
        .select('id, name, nationality, gender, age_group, toku_points, created_at')
        .eq('id', user.id)
        .single();

      if (myProfileData) {
        setMyDbProfile(myProfileData);
      }

      // Fetch encounters where I am user_a or user_b (with timestamps)
      const [encA, encB] = await Promise.all([
        getSupabase()
          .from('encounters')
          .select('user_b_id, encountered_at')
          .eq('user_a_id', user.id),
        getSupabase()
          .from('encounters')
          .select('user_a_id, encountered_at')
          .eq('user_b_id', user.id),
      ]);

      // Map user ID -> latest encountered_at
      const encounterTimeMap = new Map<string, string>();
      encA.data?.forEach(e => {
        const prev = encounterTimeMap.get(e.user_b_id);
        if (!prev || e.encountered_at > prev) encounterTimeMap.set(e.user_b_id, e.encountered_at);
      });
      encB.data?.forEach(e => {
        const prev = encounterTimeMap.get(e.user_a_id);
        if (!prev || e.encountered_at > prev) encounterTimeMap.set(e.user_a_id, e.encountered_at);
      });

      const encounteredIds = new Set(encounterTimeMap.keys());

      setUserEncounterTimes(encounterTimeMap);

      if (encounteredIds.size > 0) {
        const { data: encounteredProfiles } = await getSupabase()
          .from('profiles')
          .select('id, name, nationality, gender, age_group, toku_points, created_at')
          .in('id', Array.from(encounteredIds));

        if (encounteredProfiles) {
          setProfiles(encounteredProfiles);
        }
      }

      // Fetch matches where met_up = true
      const { data: metMatchRows } = await getSupabase()
        .from('matches')
        .select('user_a_id, user_b_id, matched_at')
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .eq('met_up', true);

      if (metMatchRows && metMatchRows.length > 0) {
        const metTimeMap = new Map<string, string>();
        const metOtherIds = metMatchRows.map(row => {
          const otherId = row.user_a_id === user.id ? row.user_b_id : row.user_a_id;
          const prev = metTimeMap.get(otherId);
          if (!prev || (row.matched_at && row.matched_at > prev)) {
            metTimeMap.set(otherId, row.matched_at ?? '');
          }
          return otherId;
        });
        setMetUserTimes(metTimeMap);

        const uniqueMetIds = [...new Set(metOtherIds)];
        const { data: metProfileData } = await getSupabase()
          .from('profiles')
          .select('id, name, nationality, gender, age_group, toku_points, created_at')
          .in('id', uniqueMetIds);

        if (metProfileData) {
          setMetProfiles(metProfileData);
        }
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  const myProfile = myDbProfile
    ? { name: myDbProfile.name, nationality: myDbProfile.nationality, tokuPoints: myDbProfile.toku_points }
    : state.myProfile;

  const toku = getTokuLevel(myProfile.tokuPoints);
  const myCountry = COUNTRIES.find(c => c.code === myProfile.nationality);

  // Active tab data
  const activeProfiles = stampTab === 'met' ? metProfiles : profiles;
  const activeTimesMap = stampTab === 'met' ? metUserTimes : userEncounterTimes;
  const activeCountries = useMemo(() => new Set(activeProfiles.map(p => p.nationality)), [activeProfiles]);
  const uniqueCountries = activeCountries.size;

  // Group profiles by nationality for stamp display, with new countries first
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  const countriesWithProfiles = useMemo(() => {
    const map = new Map<string, DbProfile[]>();
    activeProfiles.forEach(p => {
      const list = map.get(p.nationality) ?? [];
      list.push(p);
      map.set(p.nationality, list);
    });

    // For each country, find the latest encounter/met time among its people
    const entries = Array.from(map.entries()).map(([code, people]) => {
      let latestEncounter = '';
      people.forEach(p => {
        const t = activeTimesMap.get(p.id) ?? '';
        if (t > latestEncounter) latestEncounter = t;
      });
      return { code, people, latestEncounter };
    });

    // Sort: countries with encounters in last 24h first (newest first), then the rest
    entries.sort((a, b) => {
      const aIsNew = a.latestEncounter && new Date(a.latestEncounter).getTime() > oneDayAgo;
      const bIsNew = b.latestEncounter && new Date(b.latestEncounter).getTime() > oneDayAgo;
      if (aIsNew && !bIsNew) return -1;
      if (!aIsNew && bIsNew) return 1;
      if (aIsNew && bIsNew) return b.latestEncounter.localeCompare(a.latestEncounter);
      return 0;
    });

    return entries;
  }, [activeProfiles, activeTimesMap, oneDayAgo]);

  // Set of country codes that are "new" (encountered within last 24h)
  const newCountryCodes = useMemo(() => {
    const codes = new Set<string>();
    countriesWithProfiles.forEach(entry => {
      if (entry.latestEncounter && new Date(entry.latestEncounter).getTime() > oneDayAgo) {
        codes.add(entry.code);
      }
    });
    return codes;
  }, [countriesWithProfiles, oneDayAgo]);

  // Stable rotations per country
  const rotations = useMemo(() => {
    return countriesWithProfiles.map(c => {
      let hash = 0;
      for (let i = 0; i < c.code.length; i++) hash = ((hash << 5) - hash) + c.code.charCodeAt(i);
      return ((hash % 60) - 30) / 10;
    });
  }, [countriesWithProfiles]);

  const totalPages = Math.ceil(countriesWithProfiles.length / STAMPS_PER_PAGE);
  const currentStamps = countriesWithProfiles.slice(
    currentPage * STAMPS_PER_PAGE,
    (currentPage + 1) * STAMPS_PER_PAGE
  );

  const navigate = (dir: number) => {
    const next = currentPage + dir;
    if (next < 0 || next >= totalPages) return;
    setDirection(dir);
    setCurrentPage(next);
  };

  const getFlag = (code: string) => COUNTRIES.find(c => c.code === code)?.flag ?? '🏳️';
  const getCountryName = (code: string) => COUNTRIES.find(c => c.code === code)?.name ?? code;

  const selectedPeople = selectedCountry
    ? activeProfiles.filter(p => p.nationality === selectedCountry)
    : [];

  if (loading) {
    return <div className="page-container" style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--text-sub)', fontSize: 14 }}>Loading...</p>
    </div>;
  }

  return (
    <div className="page-container" style={{ background: 'var(--bg)', paddingBottom: 80, overflowY: 'auto' }}>
      <AmbientGlow />

      <div style={{ padding: '16px 24px', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>
            <span className="gradient-text">Passport</span>
          </h1>
          <button style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '8px 14px',
            color: 'var(--text-sub)',
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <Share2 size={14} /> Share
          </button>
        </div>

        {/* Passport cover */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(124,92,252,0.15), rgba(245,158,66,0.1))',
          border: '1px solid var(--accent-border)',
          borderRadius: 24,
          padding: '32px 24px',
          marginBottom: 24,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            inset: 8,
            border: '1px solid rgba(167,139,250,0.15)',
            borderRadius: 18,
            pointerEvents: 'none',
          }} />

          <div style={{ fontSize: 40, marginBottom: 12 }}>{myCountry?.flag}</div>
          <div style={{ fontSize: 12, color: 'var(--accent-light)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
            Travel Passport
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{myProfile.name}</div>
          <div style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 16 }}>
            {toku.emoji} {toku.title}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-light)' }}>{activeProfiles.length}</div>
              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>Meetings</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#FBB969' }}>{uniqueCountries}</div>
              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>Countries</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>{myProfile.tokuPoints}</div>
              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>Toku pts</div>
            </div>
          </div>
        </div>

        {/* World map */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-main)' }}>出会った人の出身国</h2>
            {activeCountries.size > 0 && (
              <span style={{ fontSize: 12, color: 'var(--accent-light)', background: 'rgba(124,92,252,0.15)', padding: '3px 10px', borderRadius: 20 }}>
                {activeCountries.size}カ国
              </span>
            )}
          </div>

          {/* Tab switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--surface)',
            borderRadius: 12,
            padding: 3,
            marginBottom: 16,
            border: '1px solid var(--border)',
          }}>
            {([
              { key: 'met' as const, label: 'We met' },
              { key: 'nearby' as const, label: 'Nearby' },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => { setStampTab(tab.key); setCurrentPage(0); }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: 10,
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: stampTab === tab.key
                    ? 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(251,185,105,0.2))'
                    : 'transparent',
                  color: stampTab === tab.key ? 'var(--text-main)' : 'var(--text-sub)',
                  boxShadow: stampTab === tab.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <WorldMapView
            metCountries={activeCountries}
            onCountryClick={setSelectedCountry}
          />
        </div>

        {/* Stamp pages */}
        {countriesWithProfiles.length > 0 ? (
          <>
            <div style={{ position: 'relative', minHeight: 320, marginBottom: 16 }}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentPage}
                  custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 100 : -100, rotateY: direction > 0 ? -15 : 15 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -100 : 100, rotateY: direction > 0 ? 15 : -15 }}
                  transition={{ duration: 0.4 }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 16,
                  }}>
                    {currentStamps.map((entry, i) => {
                      const globalIdx = currentPage * STAMPS_PER_PAGE + i;
                      const isNew = newCountryCodes.has(entry.code);
                      return (
                        <button
                          key={entry.code}
                          onClick={() => setSelectedCountry(entry.code)}
                          style={{
                            background: 'var(--surface)',
                            border: isNew ? '1px solid rgba(251,185,105,0.4)' : '1px solid var(--border)',
                            borderRadius: 16,
                            padding: 12,
                            textAlign: 'center',
                            position: 'relative',
                            transform: `rotate(${rotations[globalIdx]}deg)`,
                            cursor: 'pointer',
                            color: 'inherit',
                          }}
                        >
                          {isNew && (
                            <div style={{
                              position: 'absolute',
                              top: -6,
                              right: -6,
                              background: 'linear-gradient(135deg, #FBB969, #F59E42)',
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              padding: '2px 8px',
                              borderRadius: 8,
                              zIndex: 2,
                              boxShadow: '0 2px 8px rgba(245,158,66,0.3)',
                            }}>
                              NEW
                            </div>
                          )}
                          {STAMP_IMAGES[entry.code] ? (
                            <img
                              src={STAMP_IMAGES[entry.code]}
                              alt={entry.code}
                              style={{
                                width: '100%',
                                height: 'auto',
                                maxWidth: 120,
                                margin: '0 auto',
                                display: 'block',
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: 48, padding: 16 }}>{getFlag(entry.code)}</div>
                          )}
                          <div style={{
                            position: 'absolute',
                            inset: 6,
                            border: `2px dashed ${isNew ? 'rgba(251,185,105,0.3)' : 'rgba(167,139,250,0.2)'}`,
                            borderRadius: 12,
                            pointerEvents: 'none',
                          }} />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
                <button
                  onClick={() => navigate(-1)}
                  disabled={currentPage === 0}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    width: 40,
                    height: 40,
                    cursor: 'pointer',
                    color: 'var(--text-sub)',
                    opacity: currentPage === 0 ? 0.3 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>
                  Page {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => navigate(1)}
                  disabled={currentPage === totalPages - 1}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    width: 40,
                    height: 40,
                    cursor: 'pointer',
                    color: 'var(--text-sub)',
                    opacity: currentPage === totalPages - 1 ? 0.3 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-sub)' }}>
            <p>No stamps yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Meet travelers to collect stamps!</p>
          </div>
        )}
      </div>

      {/* Country detail overlay */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedCountry(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg)',
                borderRadius: '24px 24px 0 0',
                width: '100%',
                maxWidth: 430,
                maxHeight: '60vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px 24px 16px',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{getFlag(selectedCountry)}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{getCountryName(selectedCountry)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                      {selectedPeople.length} {selectedPeople.length === 1 ? 'person' : 'people'} met
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCountry(null)}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    width: 36,
                    height: 36,
                    cursor: 'pointer',
                    color: 'var(--text-sub)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* People list */}
              <div style={{ overflowY: 'auto', padding: '8px 24px 24px' }}>
                {selectedPeople.map(p => (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 0',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-sub)' }}>
                        {p.age_group} · {p.gender}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
