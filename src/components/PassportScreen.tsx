'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { useApp } from '@/lib/store';
import { getTokuLevel, COUNTRIES } from '@/lib/constants';
import AmbientGlow from './AmbientGlow';

const STAMPS_PER_PAGE = 4;

export default function PassportScreen() {
  const { state } = useApp();
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const toku = getTokuLevel(state.myProfile.tokuPoints);
  const myCountry = COUNTRIES.find(c => c.code === state.myProfile.nationality);
  const uniqueCountries = new Set(state.stamps.map(s => s.nationality)).size;

  const totalPages = Math.ceil(state.stamps.length / STAMPS_PER_PAGE);
  const currentStamps = state.stamps.slice(
    currentPage * STAMPS_PER_PAGE,
    (currentPage + 1) * STAMPS_PER_PAGE
  );

  const navigate = (dir: number) => {
    const next = currentPage + dir;
    if (next < 0 || next >= totalPages) return;
    setDirection(dir);
    setCurrentPage(next);
  };

  return (
    <div className="page-container" style={{ background: 'var(--bg)', paddingBottom: 80 }}>
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
          {/* Decorative border */}
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
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{state.myProfile.name}</div>
          <div style={{ fontSize: 14, color: 'var(--text-sub)', marginBottom: 16 }}>
            {toku.emoji} {toku.title}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-light)' }}>{state.stamps.length}</div>
              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>Meetings</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#FBB969' }}>{uniqueCountries}</div>
              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>Countries</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>{state.myProfile.tokuPoints}</div>
              <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>Toku pts</div>
            </div>
          </div>
        </div>

        {/* Stamp pages */}
        {state.stamps.length > 0 ? (
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
                    {currentStamps.map(stamp => (
                      <div
                        key={stamp.id}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 16,
                          padding: 20,
                          textAlign: 'center',
                          position: 'relative',
                          transform: `rotate(${(Math.random() - 0.5) * 6}deg)`,
                        }}
                      >
                        <div style={{ fontSize: 36, marginBottom: 8 }}>{stamp.flag}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{stamp.userName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-sub)' }}>{stamp.location}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-hint)', marginTop: 4 }}>{stamp.date}</div>
                        {/* Stamp circle decoration */}
                        <div style={{
                          position: 'absolute',
                          inset: 6,
                          border: '2px dashed rgba(167,139,250,0.2)',
                          borderRadius: 12,
                          pointerEvents: 'none',
                        }} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Page navigation */}
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
    </div>
  );
}
