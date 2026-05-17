// Plant Diary App — shared tokens, icons, atoms.

const APP = {
  primary:   '#4CAF50',
  primaryDk: '#2E7D32',
  primaryLt: '#E8F5E9',
  primaryT:  'rgba(76,175,80,0.10)',
  secondary: '#8BC34A',
  accent:    '#FFA726',
  accentDk:  '#F57C00',
  accentLt:  '#FFF3E0',
  bg:        '#FAFAF6',
  surface:   '#FFFFFF',
  text:      '#2E2E2E',
  text2:     '#757575',
  text3:     '#9E9E9E',
  border:    'rgba(0,0,0,0.06)',
  sep:       'rgba(0,0,0,0.08)',
  sky:       '#62B7E0',
  cloud:     '#94A4B0',
  rain:      '#3D7DAA',
};

const JP = `"Noto Sans JP", -apple-system, BlinkMacSystemFont, "Hiragino Sans", "Yu Gothic UI", sans-serif`;
const MONO = `"JetBrains Mono", "SF Mono", ui-monospace, Menlo, monospace`;

// ─────────────────────────────────────────────────────────────
// Inline SVG icons — single-color line icons, stroke=currentColor
// ─────────────────────────────────────────────────────────────
const I = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2z"/>
    </svg>
  ),
  calendar: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
    </svg>
  ),
  chart: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19V5M4 19h16M7 15l4-4 3 3 6-7"/>
    </svg>
  ),
  badge: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 21l5-3 5 3-1.5-7"/>
    </svg>
  ),
  gear: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.65 1.65 0 00-1.8-.3 1.65 1.65 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.65 1.65 0 00-1-1.5 1.65 1.65 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.65 1.65 0 00.3-1.8 1.65 1.65 0 00-1.5-1H3a2 2 0 110-4h.1a1.65 1.65 0 001.5-1 1.65 1.65 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.65 1.65 0 001.8.3H9a1.65 1.65 0 001-1.5V3a2 2 0 114 0v.1a1.65 1.65 0 001 1.5 1.65 1.65 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.65 1.65 0 00-.3 1.8V9a1.65 1.65 0 001.5 1H21a2 2 0 110 4h-.1a1.65 1.65 0 00-1.5 1z"/>
    </svg>
  ),
  plus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  camera: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h3l2-3h8l2 3h3a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  flame: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2s5 4 5 9a5 5 0 11-10 0c0-2 1-3 1-3s-1 5 2 5c0-3 2-5 2-11z"/>
    </svg>
  ),
  leaf: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4C9 4 4 10 4 17c0 2 1 3 3 3 7 0 13-5 13-16zM4 20l8-8"/>
    </svg>
  ),
  drop: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3s-7 8-7 13a7 7 0 0014 0c0-5-7-13-7-13z"/>
    </svg>
  ),
  sun: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  ),
  cloud: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 18a5 5 0 000-10c-.3-2.3-2.4-4-4.9-4-2.3 0-4.3 1.6-4.8 3.7A4.5 4.5 0 003 12.5 4.5 4.5 0 007.5 17z"/>
    </svg>
  ),
  rainCloud: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14a4.5 4.5 0 000-9c-.3-2-2.2-3.5-4.4-3.5-2 0-3.8 1.4-4.3 3.3A4 4 0 003 9.5 4 4 0 007 13.5"/>
      <path d="M8 17v3M12 18v3M16 17v3"/>
    </svg>
  ),
  snow: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M4 7l16 10M4 17l16-10M9 3l3 3 3-3M9 21l3-3 3 3"/>
    </svg>
  ),
  thermo: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4a2 2 0 10-4 0v10a4 4 0 104 0V4z"/>
    </svg>
  ),
  chev: (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2l6 6-6 6"/>
    </svg>
  ),
  chevL: (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L2 8l6 6"/>
    </svg>
  ),
  chevDown: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6l5 5 5-5"/>
    </svg>
  ),
  close: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12l5 5L20 6"/>
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 16v-5a6 6 0 10-12 0v5l-2 2h16zM10 21a2 2 0 004 0"/>
    </svg>
  ),
  edit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4l6 6L8 22H2v-6zM12 6l6 6"/>
    </svg>
  ),
  trash: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14"/>
    </svg>
  ),
  play: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 4v16l13-8z"/>
    </svg>
  ),
};

// ─────────────────────────────────────────────────────────────
// Photo placeholder — striped tonal swatch + monospace caption.
// ─────────────────────────────────────────────────────────────
function PhotoSlot({ tone = 'a', label = 'PHOTO', stamp, w = '100%', h = 140, r = 14, style = {} }) {
  const palettes = {
    a: { bg: '#e3eed5', stripe: '#c8dcb1', ink: '#4d6a37' }, // young leaf
    b: { bg: '#d8e8db', stripe: '#b7d1bc', ink: '#395a40' }, // mature leaf
    c: { bg: '#e5d7c3', stripe: '#cdb999', ink: '#6b5333' }, // soil
    d: { bg: '#e8dfe8', stripe: '#ccb6cc', ink: '#5e3f5e' }, // flower
    e: { bg: '#f0e3c8', stripe: '#dcc89a', ink: '#7a5e2a' }, // dry
    f: { bg: '#d4e3ea', stripe: '#b0c7d2', ink: '#33586a' }, // wet/cool
  };
  const p = palettes[tone] || palettes.a;
  return (
    <div style={{
      width: w, height: h, borderRadius: r, position: 'relative', overflow: 'hidden',
      background: `repeating-linear-gradient(135deg, ${p.bg} 0 14px, ${p.stripe} 14px 16px)`,
      ...style,
    }}>
      <div style={{
        position: 'absolute', left: 8, bottom: 8,
        fontFamily: MONO, fontSize: 9, letterSpacing: 0.6,
        color: p.ink, textTransform: 'uppercase', opacity: 0.85,
      }}>{label}</div>
      {stamp && (
        <div style={{
          position: 'absolute', top: 8, right: 8,
          width: 24, height: 24, borderRadius: 999,
          background: 'rgba(255,255,255,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}>{stamp}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Status bar overlay (re-uses IOSStatusBar from frame, transparent bg)
// Use a Header component that pushes content below 54px status area.
// ─────────────────────────────────────────────────────────────
function AppHeader({ title, leading, trailing, sub, bg = APP.bg }) {
  return (
    <div style={{
      paddingTop: 54, paddingBottom: 12, paddingLeft: 20, paddingRight: 20,
      background: bg, position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 36, gap: 8 }}>
        <div style={{ minWidth: 36, flex: '0 0 auto', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>{leading}</div>
        <div style={{
          fontFamily: JP, fontWeight: 600, fontSize: 16, color: APP.text, letterSpacing: 0.2,
          flex: '1 1 auto', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{title}</div>
        <div style={{ minWidth: 36, flex: '0 0 auto', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', whiteSpace: 'nowrap' }}>{trailing}</div>
      </div>
      {sub && <div style={{ marginTop: 4, textAlign: 'center', fontFamily: JP, fontSize: 12, color: APP.text2 }}>{sub}</div>}
    </div>
  );
}

// Tab bar — bottom nav, 5 items
function TabBar({ active = 'home' }) {
  const items = [
    { id: 'home', label: 'ホーム', icon: I.home },
    { id: 'cal',  label: 'カレンダー', icon: I.calendar },
    { id: 'graph',label: 'グラフ', icon: I.chart },
    { id: 'badge',label: 'バッジ', icon: I.badge },
    { id: 'set',  label: '設定',   icon: I.gear },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingBottom: 22, paddingTop: 8,
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: `0.5px solid ${APP.sep}`,
      display: 'flex', justifyContent: 'space-around',
      fontFamily: JP, zIndex: 30,
    }}>
      {items.map(it => {
        const on = it.id === active;
        return (
          <div key={it.id} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: on ? APP.primary : APP.text3, minWidth: 56,
          }}>
            {it.icon}
            <div style={{ fontSize: 10, fontWeight: on ? 600 : 500 }}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function Pill({ children, color = APP.primary, bg, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 999,
      background: bg || color + '18',
      color, fontFamily: JP, fontSize: 11, fontWeight: 600,
      ...style,
    }}>{children}</span>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: APP.surface, borderRadius: 18,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)',
      ...style,
    }}>{children}</div>
  );
}

function SectionLabel({ children, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '0 4px 8px',
    }}>
      <div style={{ fontFamily: JP, fontSize: 13, fontWeight: 700, color: APP.text, letterSpacing: 0.4 }}>{children}</div>
      {action && <div style={{ fontFamily: JP, fontSize: 12, color: APP.primary, fontWeight: 600 }}>{action}</div>}
    </div>
  );
}

Object.assign(window, { APP, JP, MONO, I, PhotoSlot, AppHeader, TabBar, Pill, Card, SectionLabel });
