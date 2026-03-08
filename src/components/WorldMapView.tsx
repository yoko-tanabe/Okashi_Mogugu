'use client';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// ISO alpha-2 → topojson country name mapping
const ALPHA2_TO_NAME: Record<string, string> = {
  JP: 'Japan',
  US: 'United States of America',
  GB: 'United Kingdom',
  FR: 'France',
  DE: 'Germany',
  KR: 'South Korea',
  CN: 'China',
  TW: 'Taiwan',
  TH: 'Thailand',
  AU: 'Australia',
  BR: 'Brazil',
  IN: 'India',
  ES: 'Spain',
  IT: 'Italy',
  MX: 'Mexico',
  VN: 'Vietnam',
  ID: 'Indonesia',
  PH: 'Philippines',
  CA: 'Canada',
  NZ: 'New Zealand',
  SG: 'Singapore',
  HK: 'Hong Kong',
  MY: 'Malaysia',
  RU: 'Russia',
  TR: 'Turkey',
  SA: 'Saudi Arabia',
  AE: 'United Arab Emirates',
  ZA: 'South Africa',
  NG: 'Nigeria',
  EG: 'Egypt',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Peru',
  PT: 'Portugal',
  NL: 'Netherlands',
  BE: 'Belgium',
  CH: 'Switzerland',
  AT: 'Austria',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  PL: 'Poland',
  CZ: 'Czech Republic',
  GR: 'Greece',
};

const NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(ALPHA2_TO_NAME).map(([code, name]) => [name, code])
);

interface Props {
  metCountries: Set<string>;
  onCountryClick?: (code: string) => void;
}

export default function WorldMapView({ metCountries, onCountryClick }: Props) {
  const metNames = new Set(
    Array.from(metCountries)
      .map(code => ALPHA2_TO_NAME[code])
      .filter(Boolean)
  );

  return (
    <div style={{ width: '100%', borderRadius: 16, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
      <ComposableMap
        projection="geoNaturalEarth1"
        projectionConfig={{ scale: 140, center: [0, 10] }}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name: string = geo.properties.name;
              const isMet = metNames.has(name);
              const code = NAME_TO_CODE[name];
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isMet ? 'rgba(124,92,252,0.85)' : 'rgba(255,255,255,0.06)'}
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={0.4}
                  onClick={isMet && code && onCountryClick ? () => onCountryClick(code) : undefined}
                  style={{
                    default: { outline: 'none', cursor: isMet ? 'pointer' : 'default' },
                    hover: {
                      outline: 'none',
                      fill: isMet ? 'rgba(167,139,250,0.95)' : 'rgba(255,255,255,0.1)',
                      cursor: isMet ? 'pointer' : 'default',
                    },
                    pressed: { outline: 'none' },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(124,92,252,0.85)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>出身国の人と出会った</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-sub)' }}>まだ</span>
        </div>
      </div>
    </div>
  );
}
