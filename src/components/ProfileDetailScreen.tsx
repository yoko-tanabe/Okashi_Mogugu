'use client';
import { useState, useRef } from 'react';
import { EncounterCard } from '@/lib/types';
import { COUNTRIES } from '@/lib/constants';

interface Props {
  card: EncounterCard;
  onBack: () => void;
  onLike: () => void;
  onPass: () => void;
}

export default function ProfileDetailScreen({ card, onBack, onLike, onPass }: Props) {
  const { user } = card;
  const country = COUNTRIES.find(c => c.code === user.nationality);
  const [scrollY, setScrollY] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop;
    setScrollY(y);
    setHeaderVisible(y > 200);
  };

  const heroOpacity = Math.max(0, 1 - scrollY / 280);
  const heroScale = 1 + scrollY * 0.0005;

  return (
    <div style={{
      width: "100%",
      maxWidth: 430,
      margin: "0 auto",
      height: "100vh",
      background: "#0B0E14",
      position: "relative",
      overflow: "hidden",
      color: "rgba(255,255,255,0.90)",
      WebkitFontSmoothing: "antialiased",
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .profile-scroll::-webkit-scrollbar { display: none; }

        .section-animate {
          opacity: 0;
          animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }

        .tag-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 16px;
          border-radius: 100px;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: 0.01em;
          transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: default;
          user-select: none;
        }
        .tag-pill:hover {
          transform: translateY(-1px);
        }

        .match-tag {
          background: rgba(251,185,105,0.12);
          color: #FBB969;
          border: 1px solid rgba(251,185,105,0.2);
        }

        .interest-tag {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.48);
          border: 1px solid rgba(255,255,255,0.10);
        }
        .interest-tag:hover {
          background: rgba(255,255,255,0.09);
          color: rgba(255,255,255,0.65);
        }

        .action-btn {
          flex: 1;
          padding: 17px 24px;
          border-radius: 28px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
          letter-spacing: 0.01em;
          position: relative;
          overflow: hidden;
        }
        .action-btn:active {
          transform: scale(0.96);
        }

        .pass-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.48);
        }
        .pass-btn:hover {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.25);
          color: #EF4444;
        }

        .meet-btn {
          background: linear-gradient(135deg, #7C5CFC, #F59E42);
          border: none;
          color: #fff;
          box-shadow: 0 4px 24px rgba(124,92,252,0.25), 0 2px 8px rgba(245,158,66,0.15);
        }
        .meet-btn:hover {
          box-shadow: 0 6px 32px rgba(124,92,252,0.35), 0 2px 12px rgba(245,158,66,0.2);
          transform: translateY(-1px);
        }
        .meet-btn:active {
          transform: scale(0.96) translateY(0);
        }

        .glass-card {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 20px;
          padding: 20px;
        }

        .section-title {
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.30);
          margin-bottom: 14px;
        }

        .lang-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          font-size: 13.5px;
          color: rgba(255,255,255,0.48);
          font-weight: 500;
        }
      `}</style>

      {/* Frosted Glass Header */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: headerVisible
          ? "rgba(11,14,20,0.88)"
          : "transparent",
        backdropFilter: headerVisible ? "blur(30px) saturate(180%)" : "none",
        WebkitBackdropFilter: headerVisible ? "blur(30px) saturate(180%)" : "none",
        borderBottom: headerVisible ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        transition: "all 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
      }}>
        <button
          onClick={onBack}
          style={{
            background: headerVisible ? "transparent" : "rgba(0,0,0,0.35)",
            backdropFilter: headerVisible ? "none" : "blur(20px)",
            WebkitBackdropFilter: headerVisible ? "none" : "blur(20px)",
            border: "none",
            borderRadius: 12,
            padding: "8px 12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: headerVisible ? "#A78BFA" : "rgba(255,255,255,0.85)",
            fontSize: 15,
            fontWeight: 500,
            transition: "all 0.35s ease",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        <div style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "translateY(0)" : "translateY(8px)",
          transition: "all 0.35s cubic-bezier(0.23, 1, 0.32, 1)",
          fontSize: 16,
          fontWeight: 600,
          color: "rgba(255,255,255,0.90)",
        }}>
          {user.name} {country?.flag}
        </div>

        <div style={{ width: 60 }} />
      </div>

      {/* Scrollable Content */}
      <div
        ref={scrollRef}
        className="profile-scroll"
        onScroll={handleScroll}
        style={{
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          paddingBottom: 120,
        }}
      >
        {/* Hero Section */}
        <div style={{
          height: 340,
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            background: user.favoriteImages?.[0]
              ? `url(${user.favoriteImages[0]}) center/cover no-repeat`
              : "linear-gradient(165deg, rgba(124,92,252,0.25) 0%, rgba(124,92,252,0.10) 35%, rgba(245,158,66,0.12) 65%, rgba(245,158,66,0.06) 100%)",
            opacity: heroOpacity,
            transform: `scale(${heroScale})`,
            transformOrigin: "center center",
            transition: "transform 0.1s linear",
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              background: user.favoriteImages?.[0]
                ? "linear-gradient(to bottom, rgba(11,14,20,0.3) 0%, rgba(11,14,20,0.6) 100%)"
                : "radial-gradient(ellipse at 25% 20%, rgba(124,92,252,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 75%, rgba(245,158,66,0.12) 0%, transparent 45%)",
            }} />
          </div>

          {/* Avatar */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid rgba(255,255,255,0.12)",
            opacity: heroOpacity,
            overflow: "hidden",
          }}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>

          {/* Encounter badge */}
          <div style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
            opacity: heroOpacity,
            animation: "fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) 0.2s both",
          }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 100,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {card.location}
            </div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: 100,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              {card.minutesAgo}min ago
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div style={{ padding: "0 20px" }}>
          {/* Name & Identity */}
          <div
            className="section-animate"
            style={{ animationDelay: "0.1s", padding: "28px 0 0" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <h1 style={{
                  fontSize: 30,
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: "-0.02em",
                  color: "rgba(255,255,255,0.95)",
                }}>
                  {user.name}
                </h1>
                <span style={{ fontSize: 26 }}>{country?.flag}</span>
              </div>

              {/* Toku Badge */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  background: "linear-gradient(135deg, #A78BFA, #7C5CFC)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1,
                }}>
                  {user.tokuPoints}
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(167,139,250,0.50)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
                  marginTop: 2,
                }}>
                  tokupo
                </span>
              </div>
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 28,
            }}>
              <span style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.38)",
                fontWeight: 500,
              }}>
                {user.ageGroup} · {country?.name}
              </span>
            </div>
          </div>

          {/* Common Interests */}
          {(card.matchingWords.length > 0 || card.matchingTags.length > 0) && (
            <div
              className="section-animate glass-card"
              style={{
                animationDelay: "0.2s",
                marginBottom: 20,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute",
                top: 0,
                left: 20,
                right: 20,
                height: 2,
                borderRadius: 1,
                background: "linear-gradient(90deg, #FBB969, rgba(251,185,105,0.05))",
              }} />
              <div className="section-title" style={{ color: "#FBB969", paddingTop: 8 }}>
                Common Interests
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {card.matchingWords.map(w => (
                  <span key={w} className="tag-pill match-tag">
                    {w}
                  </span>
                ))}
                {card.matchingTags.map(t => (
                  <span key={t} className="tag-pill match-tag" style={{ opacity: 0.7 }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* About (with Interests & Favorite Videos inside) */}
          <div
            className="section-animate glass-card"
            style={{ animationDelay: "0.35s", marginBottom: 20 }}
          >
            <div className="section-title">My Favorite</div>

            {user.hobbyTags && user.hobbyTags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: user.freeText ? 16 : 0 }}>
                {user.hobbyTags.map(tag => (
                  <span key={tag} className="tag-pill interest-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {user.freeText && (
              <p style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.55)",
                margin: 0,
                fontWeight: 400,
              }}>
                {user.freeText}
              </p>
            )}

            {((user.videoLinks && user.videoLinks.length > 0) || (user.favoriteImages && user.favoriteImages.length > 0)) && (
                <>
                  <div className="section-title" style={{ marginTop: user.freeText ? 20 : 0 }}>Favorite Contents</div>

                  {user.favoriteImages && user.favoriteImages.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: user.videoLinks && user.videoLinks.length > 0 ? 16 : 0 }}>
                      {user.favoriteImages.map((url, i) => (
                        <div key={i} style={{ aspectRatio: "1", borderRadius: 12, overflow: "hidden" }}>
                          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {user.videoLinks && user.videoLinks.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {user.videoLinks.map((url, i) => {
                        const videoId = url.match(/(?:youtu\.be\/|v=)([^&?/]+)/)?.[1];
                        return (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.10)",
                              borderRadius: 12,
                              padding: 10,
                              textDecoration: "none",
                              color: "inherit",
                              transition: "border-color 0.2s",
                            }}
                          >
                            {videoId && (
                              <img
                                alt=""
                                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                style={{
                                  width: 80,
                                  height: 45,
                                  borderRadius: 8,
                                  objectFit: "cover",
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>YouTube</div>
                              <div style={{
                                fontSize: 11,
                                color: "rgba(255,255,255,0.30)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                                {url}
                              </div>
                            </div>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                              <path d="M15 3h6v6" />
                              <path d="M10 14 21 3" />
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            </svg>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

          {/* Languages */}
          <div
            className="section-animate"
            style={{ animationDelay: "0.4s", marginBottom: 28 }}
          >
            <div className="section-title">Languages</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {user.languages.map(l => (
                <span key={l} className="lang-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Travel Style */}
          {user.travelStyle && (
            <div
              className="section-animate"
              style={{ animationDelay: "0.45s", marginBottom: 28 }}
            >
              <div className="section-title">Travel Style</div>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 20,
                background: "rgba(124,92,252,0.10)",
                border: "1px solid rgba(124,92,252,0.20)",
                fontSize: 14,
                fontWeight: 600,
                color: "#A78BFA",
              }}>
                {user.travelStyle}
              </div>
            </div>
          )}

          {/* Safety Note */}
          <div
            className="section-animate"
            style={{
              animationDelay: "0.5s",
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 18px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.30)", fontWeight: 500, lineHeight: 1.5 }}>
              Encounter location is approximate (5-min delay). Your exact position is never shared.
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "12px 20px 28px",
        background: "linear-gradient(to top, #0B0E14 65%, transparent)",
        display: "flex",
        gap: 12,
        zIndex: 15,
        animation: "slideUp 0.5s cubic-bezier(0.23, 1, 0.32, 1) 0.4s both",
      }}>
        <button className="action-btn pass-btn" onClick={onPass}>
          Pass
        </button>
        <button className="action-btn meet-btn" onClick={onLike}>
          Want to meet!
        </button>
      </div>
    </div>
  );
}
