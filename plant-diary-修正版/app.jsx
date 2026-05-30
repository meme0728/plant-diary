// Plant Diary App — functional PWA implementation
// Uses globals from app-tokens.jsx: APP, JP, MONO, I, PhotoSlot, AppHeader, TabBar, Pill, Card, SectionLabel
// Uses globals from db.js: DB

// ═══════════════════════════════════════════════════════════════
// OBSERVATION TEMPLATES
// ═══════════════════════════════════════════════════════════════
const TEMPLATES = {
  'morning-glory': {
    label: '朝顔',
    emoji: '🌸',
    items: [
      { key: 'height',  label: '草丈',       type: 'number',  unit: 'cm' },
      { key: 'leaves',  label: '葉の数',     type: 'integer', unit: '枚' },
      { key: 'buds',    label: 'つぼみの数', type: 'integer', unit: '個' },
      { key: 'flowers', label: '開いた花の数', type: 'integer', unit: '個' },
      { key: 'color',   label: '花の色',     type: 'text',    unit: '' },
      { key: 'health',  label: '全体の様子', type: 'select',  options: ['元気', '普通', '元気なし'] },
    ],
  },
  'houseplant': {
    label: '観葉植物',
    emoji: '🌿',
    items: [
      { key: 'height',  label: '高さ',        type: 'number', unit: 'cm' },
      { key: 'leaves',  label: '葉の状態',    type: 'select', options: ['青々', '黄化', '斑点あり'] },
      { key: 'watered', label: '水やり',      type: 'toggle', unit: '' },
      { key: 'soil',    label: '土の乾き具合', type: 'select', options: ['乾燥', '適度', '湿潤'] },
    ],
  },
  'vegetable': {
    label: '野菜・家庭菜園',
    emoji: '🥦',
    items: [
      { key: 'height',  label: '草丈',       type: 'number',  unit: 'cm' },
      { key: 'fruits',  label: '実の数',     type: 'integer', unit: '個' },
      { key: 'watered', label: '水やり',     type: 'toggle',  unit: '' },
      { key: 'health',  label: '全体の様子', type: 'select',  options: ['元気', '普通', '元気なし'] },
    ],
  },
  'custom': {
    label: 'カスタム',
    emoji: '🌱',
    items: [],
  },
};

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function daysBetween(a, b) {
  return Math.round((new Date(a + 'T12:00:00') - new Date(b + 'T12:00:00')) / 86400000);
}

function formatJaDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const dow = ['日','月','火','水','木','金','土'][d.getDay()];
  return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日（${dow}）`;
}

function formatMonthYear(year, month) {
  return `${year}年${month+1}月`;
}

function computeStreak(plantId, entries) {
  const dates = entries
    .filter(e => e.plantId === plantId)
    .map(e => e.date)
    .sort()
    .reverse();
  if (!dates.length) return 0;
  if (daysBetween(todayStr(), dates[0]) > 2) return 0;
  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    if (daysBetween(dates[i], dates[i+1]) <= 2) streak++;
    else break;
  }
  return streak;
}

function hasTodayRecord(plantId, entries) {
  return entries.some(e => e.plantId === plantId && e.date === todayStr());
}

function lastRecordText(plantId, entries) {
  const sorted = entries
    .filter(e => e.plantId === plantId)
    .sort((a, b) => b.date.localeCompare(a.date));
  if (!sorted.length) return '未記録';
  const diff = daysBetween(todayStr(), sorted[0].date);
  if (diff === 0) return '今日';
  if (diff === 1) return '昨日';
  return `${diff}日前`;
}

// 画像を縮小・JPEG圧縮して Blob で返す（base64 文字列より約27%小さく、IndexedDB に直接保存できる）
async function compressPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = e => {
      const img = new Image();
      img.onerror = () => reject(new Error('image decode failed'));
      img.onload = () => {
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          blob => blob ? resolve(blob) : reject(new Error('toBlob failed')),
          'image/jpeg', 0.72
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// data: URL を Blob に変換（旧データの移行用）
function dataURLtoBlob(dataUrl) {
  const [head, body] = dataUrl.split(',');
  const mime = (head.match(/:(.*?);/) || [])[1] || 'image/jpeg';
  const bin = atob(body);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// 旧バージョンで base64 のまま localStorage に保存された写真を IndexedDB に移行し、
// localStorage を軽量化する（一度だけ実行）。これにより既存ユーザーの容量超過も解消される。
async function migratePhotos() {
  const s = DB.settings.get();
  if (s.photosMigrated) return;

  const entries = DB.entries.getAll();
  let entriesChanged = false;
  for (const e of entries) {
    if (Array.isArray(e.photos)) {
      const out = [];
      for (const p of e.photos) {
        if (typeof p === 'string' && p.startsWith('data:')) {
          out.push(await PhotoStore.put(dataURLtoBlob(p)));
          entriesChanged = true;
        } else {
          out.push(p);
        }
      }
      e.photos = out;
    }
  }
  if (entriesChanged) DB.entries.setAll(entries);

  const plants = DB.plants.getAll();
  let plantsChanged = false;
  for (const pl of plants) {
    if (typeof pl.thumbnail === 'string' && pl.thumbnail.startsWith('data:')) {
      pl.thumbnail = await PhotoStore.put(dataURLtoBlob(pl.thumbnail));
      plantsChanged = true;
    }
  }
  if (plantsChanged) DB.plants.setAll(plants);

  s.photosMigrated = true;
  DB.settings.save(s);
}

function checkAndUnlockBadges(allEntries) {
  const newlyUnlocked = [];
  if (allEntries.length >= 1 && DB.badges.unlock('first_record')) {
    newlyUnlocked.push('🌱 はじめての観察バッジ獲得！');
  }
  if (allEntries.length >= 10 && DB.badges.unlock('ten_records')) {
    newlyUnlocked.push('📖 10回記録バッジ獲得！');
  }
  if (allEntries.length >= 100 && DB.badges.unlock('hundred_records')) {
    newlyUnlocked.push('🏆 観察マスターバッジ獲得！');
  }
  const totalPhotos = allEntries.reduce((sum, e) => sum + (e.photos?.length || 0), 0);
  if (totalPhotos >= 30 && DB.badges.unlock('photo_collector')) {
    newlyUnlocked.push('📷 写真コレクターバッジ獲得！');
  }
  const plantIds = [...new Set(allEntries.map(e => e.plantId))];
  plantIds.forEach(pid => {
    const streak = computeStreak(pid, allEntries);
    if (streak >= 3 && DB.badges.unlock(`streak3_${pid}`)) {
      newlyUnlocked.push('🔥 3日連続バッジ獲得！');
    }
    if (streak >= 7 && DB.badges.unlock(`streak7_${pid}`)) {
      newlyUnlocked.push('🌟 1週間連続バッジ獲得！');
    }
    if (streak >= 30 && DB.badges.unlock(`streak30_${pid}`)) {
      newlyUnlocked.push('🎖️ 1ヶ月連続バッジ獲得！');
    }
  });
  return newlyUnlocked;
}

// ─────────────────────────────────────────────────────────────
// BADGE DEFINITIONS & HELPERS
// ─────────────────────────────────────────────────────────────
const BADGE_DEFS = [
  { type: 'first_record',    label: 'はじめての観察', emoji: '🌱', color: '#4CAF50', max: 1 },
  { type: 'streak3',         label: '3日連続',         emoji: '🔥', color: '#F57C00', max: 3 },
  { type: 'streak7',         label: '1週間連続',       emoji: '⭐', color: '#F9A825', max: 7 },
  { type: 'streak30',        label: '1ヶ月連続',       emoji: '🏆', color: '#FF8F00', max: 30 },
  { type: 'photo_collector', label: '写真コレクター', emoji: '📷', color: '#6B8AC4', max: 30 },
  { type: 'ten_records',     label: '10回記録',        emoji: '📖', color: '#8BC34A', max: 10 },
  { type: 'hundred_records', label: '観察マスター',   emoji: '🌟', color: '#2E7D32', max: 100 },
  { type: 'graph_viewed',    label: '成長の記録者',   emoji: '📈', color: '#2E7D32', max: 1 },
];

function isBadgeUnlocked(type, allBadges) {
  if (['streak3','streak7','streak30'].includes(type))
    return allBadges.some(b => b.type.startsWith(type + '_'));
  return allBadges.some(b => b.type === type);
}

function getBadgeDate(type, allBadges) {
  const b = ['streak3','streak7','streak30'].includes(type)
    ? allBadges.find(b => b.type.startsWith(type + '_'))
    : allBadges.find(b => b.type === type);
  return b?.unlockedAt;
}

function maxStreak(entries, plants) {
  if (!plants.length) return 0;
  return Math.max(0, ...plants.map(p => computeStreak(p.id, entries)));
}

function getBadgeProgress(type, entries, plants, allBadges) {
  switch (type) {
    case 'first_record':    return { cur: Math.min(entries.length, 1),                    max: 1 };
    case 'streak3':         return { cur: Math.min(maxStreak(entries, plants), 3),         max: 3 };
    case 'streak7':         return { cur: Math.min(maxStreak(entries, plants), 7),         max: 7 };
    case 'streak30':        return { cur: Math.min(maxStreak(entries, plants), 30),        max: 30 };
    case 'photo_collector': return { cur: entries.reduce((s,e) => s+(e.photos?.length||0), 0), max: 30 };
    case 'ten_records':     return { cur: Math.min(entries.length, 10),                   max: 10 };
    case 'hundred_records': return { cur: Math.min(entries.length, 100),                  max: 100 };
    case 'graph_viewed':    return { cur: isBadgeUnlocked('graph_viewed', allBadges) ? 1 : 0, max: 1 };
    default:                return { cur: 0, max: 1 };
  }
}

// ═══════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════
const AppContext = React.createContext(null);

const INIT_STATE = {
  screen: 'home',
  params: {},
  history: [],
  plants: [],
  entries: [],
  badges: [],
  toast: null,
  confirm: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_DATA':
      return { ...state, plants: action.plants, entries: action.entries, badges: action.badges };
    case 'NAVIGATE':
      return {
        ...state,
        history: [...state.history, { screen: state.screen, params: state.params }],
        screen: action.screen,
        params: action.params || {},
      };
    case 'TAB_NAVIGATE':
      return { ...state, history: [], screen: action.screen, params: action.params || {} };
    case 'GO_BACK': {
      const prev = state.history[state.history.length - 1];
      if (!prev) return { ...state, screen: 'home', params: {}, history: [] };
      return {
        ...state,
        history: state.history.slice(0, -1),
        screen: prev.screen,
        params: prev.params,
      };
    }
    case 'SHOW_TOAST':
      return { ...state, toast: action.message };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    case 'SHOW_CONFIRM':
      return { ...state, confirm: { message: action.message, onConfirm: action.onConfirm } };
    case 'HIDE_CONFIRM':
      return { ...state, confirm: null };
    default:
      return state;
  }
}

function AppProvider({ children }) {
  const [state, dispatch] = React.useReducer(reducer, INIT_STATE);

  const refresh = React.useCallback(() => {
    dispatch({
      type: 'SET_DATA',
      plants: DB.plants.getAll(),
      entries: DB.entries.getAll(),
      badges: DB.badges.getAll(),
    });
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await PhotoStore.hydrate();        // 既存写真の objectURL を用意
        await migratePhotos();             // 旧 base64 写真を IndexedDB に移行（初回のみ）
        await PhotoStore.hydrate();         // 移行分を取り込む
      } catch (e) {
        console.warn('photo init failed', e);
      }
      if (alive) refresh();
    })();
    return () => { alive = false; };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, refresh }}>
      {children}
      {state.toast && (
        <ToastBar message={state.toast} onDone={() => dispatch({ type: 'HIDE_TOAST' })} />
      )}
      {state.confirm && (
        <ConfirmDialog
          message={state.confirm.message}
          onConfirm={() => { state.confirm.onConfirm(); dispatch({ type: 'HIDE_CONFIRM' }); }}
          onCancel={() => dispatch({ type: 'HIDE_CONFIRM' })}
        />
      )}
    </AppContext.Provider>
  );
}

function useApp() { return React.useContext(AppContext); }

// ═══════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════
function NavTabBar({ active }) {
  const { dispatch } = useApp();
  const items = [
    { id: 'home',  label: 'ホーム',     icon: I.home,     screen: 'home' },
    { id: 'cal',   label: 'カレンダー', icon: I.calendar, screen: 'calendar' },
    { id: 'graph', label: 'グラフ',     icon: I.chart,    screen: 'graph' },
    { id: 'badge', label: 'バッジ',     icon: I.badge,    screen: 'badges' },
    { id: 'set',   label: '設定',       icon: I.gear,     screen: 'settings' },
  ];
  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, bottom: 0,
      paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      paddingTop: 8,
      background: 'rgba(255,255,255,0.94)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: `0.5px solid ${APP.sep}`,
      display: 'flex', justifyContent: 'space-around',
      fontFamily: JP, zIndex: 30,
    }}>
      {items.map(it => {
        const on = it.id === active;
        return (
          <div key={it.id}
            onClick={() => dispatch({ type: 'TAB_NAVIGATE', screen: it.screen })}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: on ? APP.primary : APP.text3, minWidth: 56, padding: '4px 0',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}>
            {it.icon}
            <div style={{ fontSize: 10, fontWeight: on ? 600 : 500 }}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function ToastBar({ message, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [message]);
  return (
    <div style={{
      position: 'fixed', top: 64, left: 16, right: 16, zIndex: 200,
      background: APP.text, color: '#fff',
      padding: '13px 16px', borderRadius: 14,
      fontFamily: JP, fontSize: 14, fontWeight: 500,
      boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
      lineHeight: 1.4,
    }}>
      {message}
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 24px',
    }}>
      <div style={{
        background: '#fff', borderRadius: 22, padding: '24px 20px',
        fontFamily: JP, width: '100%', maxWidth: 320,
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: APP.text, marginBottom: 20, lineHeight: 1.6, textAlign: 'center' }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div onClick={onCancel} style={{
            flex: 1, padding: '13px 0', borderRadius: 12, textAlign: 'center',
            background: APP.primaryLt, color: APP.primary, fontWeight: 600, fontSize: 15,
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}>キャンセル</div>
          <div onClick={onConfirm} style={{
            flex: 1, padding: '13px 0', borderRadius: 12, textAlign: 'center',
            background: '#FF5252', color: '#fff', fontWeight: 600, fontSize: 15,
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}>削除</div>
        </div>
      </div>
    </div>
  );
}

function InputRow({ label, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '14px 16px', borderBottom: `0.5px solid ${APP.sep}`,
    }}>
      <div style={{ fontSize: 14, color: APP.text2, width: 90, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

const inputStyle = {
  width: '100%', border: 'none', outline: 'none', background: 'transparent',
  fontSize: 15, color: APP.text, fontFamily: JP, fontWeight: 500,
};

// ─────────────────────────────────────────────────────────────
// LINE CHART — pure SVG, no external library
// ─────────────────────────────────────────────────────────────
function LineChart({ data, unit = '', color = APP.primary }) {
  if (!data || data.length === 0) return null;

  const W = 320, H = 180;
  const PAD = { l: 38, r: 10, t: 20, b: 26 };
  const iW = W - PAD.l - PAD.r;
  const iH = H - PAD.t - PAD.b;

  const values = data.map(d => parseFloat(d.value));
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;

  const xOf = i => PAD.l + (data.length > 1 ? (i / (data.length - 1)) * iW : iW / 2);
  const yOf = v => PAD.t + iH - ((parseFloat(v) - minV) / range) * iH;

  const pts = data.map((d, i) => `${xOf(i)},${yOf(d.value)}`).join(' ');
  const fill = [
    `M ${xOf(0)},${PAD.t + iH}`,
    ...data.map((d, i) => `L ${xOf(i)},${yOf(d.value)}`),
    `L ${xOf(data.length - 1)},${PAD.t + iH} Z`,
  ].join(' ');

  // Y-axis: 4 grid levels
  const yLevels = [0, 0.33, 0.67, 1].map(pct => ({
    v: minV + range * pct,
    y: PAD.t + iH * (1 - pct),
  }));

  // X-axis: show up to 5 labels evenly
  const xStep = Math.max(1, Math.ceil(data.length / 5));
  const xLabels = data.map((d, i) => ({ d, i })).filter(({ i }) => i % xStep === 0 || i === data.length - 1);

  const lastIdx = data.length - 1;
  const lastV = parseFloat(data[lastIdx].value);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {yLevels.map((l, i) => (
        <g key={i}>
          <line x1={PAD.l} y1={l.y} x2={W - PAD.r} y2={l.y}
            stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
          <text x={PAD.l - 4} y={l.y + 3.5} textAnchor="end"
            fontSize="9" fill="#9E9E9E" fontFamily="sans-serif">
            {Number.isInteger(l.v) ? l.v : l.v.toFixed(1)}
          </text>
        </g>
      ))}

      <path d={fill} fill="url(#chartFill)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />

      {data.map((d, i) => {
        const isLast = i === lastIdx;
        if (i % 2 !== 0 && !isLast) return null;
        return (
          <circle key={i} cx={xOf(i)} cy={yOf(d.value)}
            r={isLast ? 5 : 3}
            fill={isLast ? color : '#fff'}
            stroke={color}
            strokeWidth={isLast ? 0 : 2} />
        );
      })}

      {data.length > 0 && (
        <text x={xOf(lastIdx)} y={yOf(lastV) - 8}
          textAnchor="middle" fontSize="10" fontWeight="700" fill={color}
          fontFamily="sans-serif">
          {lastV}{unit}
        </text>
      )}

      {xLabels.map(({ d, i }) => (
        <text key={i} x={xOf(i)} y={H - 4}
          textAnchor="middle" fontSize="9" fill="#9E9E9E" fontFamily="sans-serif">
          {d.date.slice(5).replace('-', '/')}
        </text>
      ))}
    </svg>
  );
}

function StubScreen({ title, icon, tabId }) {
  return (
    <div style={{ background: APP.bg, minHeight: '100dvh', fontFamily: JP }}>
      <AppHeader title={title} />
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '80px 40px', gap: 16, color: APP.text3,
      }}>
        <div style={{ fontSize: 48 }}>{icon}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: APP.text2 }}>準備中</div>
        <div style={{ fontSize: 13, textAlign: 'center', lineHeight: 1.6 }}>
          このページは今後のアップデートで追加される予定です。
        </div>
      </div>
      <NavTabBar active={tabId} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// S01 — HOME SCREEN
// ═══════════════════════════════════════════════════════════════
function S01_Home() {
  const { state, dispatch } = useApp();
  const { plants, entries } = state;
  const tones = ['a', 'b', 'c', 'd', 'e', 'f'];

  const today = todayStr();
  const d = new Date(today + 'T12:00:00');
  const dateLabel = formatJaDate(today);

  const recordedCount = plants.filter(p => hasTodayRecord(p.id, entries)).length;

  const bestStreak = plants.reduce(
    (best, p) => { const s = computeStreak(p.id, entries); return s > best.streak ? { streak: s, plant: p } : best; },
    { streak: 0, plant: null }
  );

  const sortedPlants = [...plants].sort((a, b) => {
    const aRec = hasTodayRecord(a.id, entries) ? 1 : 0;
    const bRec = hasTodayRecord(b.id, entries) ? 1 : 0;
    return aRec - bRec;
  });

  return (
    <div style={{ background: APP.bg, minHeight: '100dvh', fontFamily: JP }}>
      <AppHeader
        title="わたしの植物"
        leading={
          <div style={{
            width: 28, height: 28, borderRadius: 999,
            background: APP.primaryLt, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: APP.primary,
          }}>
            {I.leaf}
          </div>
        }
      />

      <div style={{ padding: '4px 20px 16px' }}>
        <div style={{ fontSize: 11, color: APP.text2, fontWeight: 500, letterSpacing: 1 }}>{dateLabel}</div>
        {plants.length === 0 ? (
          <div style={{ fontSize: 22, fontWeight: 700, color: APP.text, lineHeight: 1.35, marginTop: 4 }}>
            最初の植物を<br/>登録してみよう 🌱
          </div>
        ) : (
          <div style={{ fontSize: 22, fontWeight: 700, color: APP.text, lineHeight: 1.35, marginTop: 4 }}>
            おはよう、<br/>今日も<span style={{ color: APP.primary }}>{recordedCount}/{plants.length}</span>つ記録しよう
          </div>
        )}
      </div>

      {bestStreak.streak > 0 && (
        <div style={{ padding: '0 20px 18px' }}>
          <div style={{
            display: 'flex', gap: 10, padding: 14, borderRadius: 18,
            background: `linear-gradient(135deg, ${APP.accentLt}, #FFF8EC)`,
            border: `1px solid ${APP.accent}33`,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: APP.accentDk, flexShrink: 0,
            }}>
              {I.flame}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: APP.accentDk, fontWeight: 600, letterSpacing: 0.5 }}>最長ストリーク</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: APP.text, marginTop: 2 }}>
                {bestStreak.plant.name} · <span style={{ color: APP.accentDk }}>{bestStreak.streak}日連続</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '0 20px', paddingBottom: 110 }}>
        {plants.length > 0 && (
          <SectionLabel>わたしの植物（{plants.length}）</SectionLabel>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sortedPlants.map((p, i) => {
            const streak = computeStreak(p.id, entries);
            const recorded = hasTodayRecord(p.id, entries);
            const lastRec = lastRecordText(p.id, entries);
            return (
              <div key={p.id}
                onClick={() => dispatch({ type: 'NAVIGATE', screen: 'calendar', params: { plantId: p.id } })}
                style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                <Card style={{
                  padding: 12, display: 'flex', gap: 12, alignItems: 'center',
                  border: recorded ? `1px solid ${APP.border}` : `1.5px solid ${APP.accent}55`,
                }}>
                  {p.thumbnail ? (
                    <img src={PhotoStore.url(p.thumbnail)} alt={p.name}
                      style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <PhotoSlot tone={tones[i % 6]} w={72} h={72} r={14} label={p.name} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: APP.text }}>{p.name}</div>
                      {!recorded && (
                        <Pill color={APP.accentDk} bg={APP.accent + '22'}>未記録</Pill>
                      )}
                    </div>
                    {p.species ? (
                      <div style={{ fontSize: 12, color: APP.text2, marginTop: 2 }}>{p.species}</div>
                    ) : null}
                    <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 12, color: streak > 0 ? APP.accentDk : APP.text3, fontWeight: 600,
                      }}>
                        {I.flame}{streak}日連続
                      </span>
                      <span style={{ fontSize: 12, color: APP.text3 }}>記録: {lastRec}</span>
                    </div>
                  </div>
                  <div style={{ color: APP.text3, flexShrink: 0 }}>{I.chev}</div>
                </Card>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 10 }}>
          <div
            onClick={() => dispatch({ type: 'NAVIGATE', screen: 'register', params: {} })}
            style={{
              border: `1.5px dashed ${APP.primary}66`, borderRadius: 18,
              padding: '16px 14px', display: 'flex', alignItems: 'center', gap: 12,
              color: APP.primary, fontWeight: 600, fontSize: 14, background: APP.primaryT,
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}>
            <div style={{
              width: 36, height: 36, borderRadius: 12, background: APP.primary,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>{I.plus}</div>
            新しい植物を追加
          </div>
        </div>
      </div>

      {plants.length > 0 && (
        <div
          onClick={() => {
            const unrecorded = sortedPlants.find(p => !hasTodayRecord(p.id, entries));
            const target = unrecorded || sortedPlants[0];
            dispatch({ type: 'NAVIGATE', screen: 'record', params: { plantId: target.id } });
          }}
          style={{
            position: 'fixed', right: 20, bottom: 90,
            width: 60, height: 60, borderRadius: 30, background: APP.primary,
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(76,175,80,0.45)',
            zIndex: 25, cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}>
          <div style={{ transform: 'scale(1.35)' }}>{I.plus}</div>
        </div>
      )}

      <NavTabBar active="home" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// S02 — PLANT REGISTRATION SCREEN
// ═══════════════════════════════════════════════════════════════
function S02_Register() {
  const { dispatch, refresh } = useApp();
  const { params } = useApp().state;
  const existingPlant = params.plantId ? DB.plants.get(params.plantId) : null;

  const [name, setName] = React.useState(existingPlant?.name || '');
  const [species, setSpecies] = React.useState(existingPlant?.species || '');
  const [startDate, setStartDate] = React.useState(existingPlant?.startDate || todayStr());
  const [template, setTemplate] = React.useState(existingPlant?.template || 'morning-glory');
  const [memo, setMemo] = React.useState(existingPlant?.memo || '');
  const [thumbnail, setThumbnail] = React.useState(existingPlant?.thumbnail || null);
  const [saving, setSaving] = React.useState(false);
  const thumbInputRef = React.useRef(null);

  const handleThumbChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const blob = await compressPhoto(file);
        const id = await PhotoStore.put(blob);
        setThumbnail(id);
      } catch (err) {
        console.error(err);
        dispatch({ type: 'SHOW_TOAST', message: '写真の処理に失敗しました' });
      }
    }
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!name.trim()) {
      dispatch({ type: 'SHOW_TOAST', message: '植物の名前を入力してください' });
      return;
    }
    setSaving(true);
    let plant;
    try {
      plant = DB.plants.save({
      id: existingPlant?.id,
      name: name.trim(),
      species: species.trim(),
      startDate,
      template,
      memo: memo.trim(),
      thumbnail,
      });
    } catch (err) {
      console.error(err);
      setSaving(false);
      dispatch({ type: 'SHOW_TOAST', message: '保存に失敗しました。端末の空き容量を確認してください' });
      return;
    }
    refresh();
    dispatch({ type: 'SHOW_TOAST', message: existingPlant ? '植物を更新しました' : '植物を登録しました 🌱' });
    dispatch({ type: 'GO_BACK' });
  };

  const handleDelete = () => {
    dispatch({
      type: 'SHOW_CONFIRM',
      message: `「${name}」を削除しますか？\n記録もすべて削除されます。`,
      onConfirm: () => {
        DB.entries.getByPlant(existingPlant.id).forEach(e => DB.entries.delete(e.id));
        DB.plants.delete(existingPlant.id);
        refresh();
        dispatch({ type: 'TAB_NAVIGATE', screen: 'home' });
        dispatch({ type: 'SHOW_TOAST', message: '植物を削除しました' });
      },
    });
  };

  const templateKeys = Object.keys(TEMPLATES);

  return (
    <div style={{ background: APP.bg, minHeight: '100dvh', fontFamily: JP }}>
      <AppHeader
        title={existingPlant ? '植物を編集' : '新しい植物'}
        leading={
          <div onClick={() => dispatch({ type: 'GO_BACK' })}
            style={{ fontSize: 14, color: APP.text2, fontWeight: 500, cursor: 'pointer', padding: '4px 0' }}>
            キャンセル
          </div>
        }
        trailing={
          <div onClick={handleSave}
            style={{ fontSize: 14, color: saving ? APP.text3 : APP.primary, fontWeight: 700, cursor: 'pointer' }}>
            保存
          </div>
        }
      />

      <div style={{ padding: '4px 20px 160px' }}>
        {/* Thumbnail */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4, marginBottom: 24 }}>
          <div
            onClick={() => thumbInputRef.current?.click()}
            style={{ position: 'relative', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
            {thumbnail ? (
              <img src={PhotoStore.url(thumbnail)} alt="サムネイル"
                style={{ width: 120, height: 120, borderRadius: 60, objectFit: 'cover',
                  border: `2px solid ${APP.primary}44` }} />
            ) : (
              <div style={{
                width: 120, height: 120, borderRadius: 60,
                border: `2px dashed ${APP.primary}66`, background: APP.primaryT,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', color: APP.primary, gap: 4,
              }}>
                {I.camera}
                <div style={{ fontSize: 11, fontWeight: 600 }}>写真を追加</div>
              </div>
            )}
          </div>
          <input ref={thumbInputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={handleThumbChange} />
        </div>

        {/* Basic info */}
        <SectionLabel>基本情報</SectionLabel>
        <Card style={{ padding: 0, marginBottom: 18 }}>
          <InputRow label="名前">
            <input
              style={{ ...inputStyle, fontWeight: 600 }}
              placeholder="例: 朝顔1号"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={30}
            />
          </InputRow>
          <InputRow label="種類">
            <input
              style={inputStyle}
              placeholder="例: アサガオ"
              value={species}
              onChange={e => setSpecies(e.target.value)}
              maxLength={30}
            />
          </InputRow>
          <div style={{
            display: 'flex', alignItems: 'center', padding: '14px 16px',
          }}>
            <div style={{ fontSize: 14, color: APP.text2, width: 90, flexShrink: 0 }}>栽培開始日</div>
            <input
              type="date"
              style={{ ...inputStyle }}
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
        </Card>

        {/* Template */}
        <SectionLabel>観察テンプレート</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          {templateKeys.map(key => {
            const on = template === key;
            const t = TEMPLATES[key];
            return (
              <div key={key}
                onClick={() => setTemplate(key)}
                style={{
                  padding: '14px 12px', borderRadius: 14,
                  background: on ? APP.primary : APP.surface,
                  border: on ? 'none' : `1px solid ${APP.border}`,
                  color: on ? '#fff' : APP.text, fontWeight: 600, fontSize: 14,
                  display: 'flex', alignItems: 'center', gap: 8,
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  boxShadow: on ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                <span style={{ fontSize: 18 }}>{t.emoji}</span>
                {t.label}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: APP.text2, marginBottom: 18, padding: '0 4px', lineHeight: 1.6 }}>
          選んだテンプレートに合わせて観察項目が自動設定されます。あとから変更できます。
        </div>

        {/* Memo */}
        <SectionLabel>メモ（任意）</SectionLabel>
        <Card style={{ padding: 14, marginBottom: 18 }}>
          <textarea
            style={{
              ...inputStyle, resize: 'none', minHeight: 80, lineHeight: 1.6,
            }}
            placeholder="置き場所や品種の特性などをメモできます"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            maxLength={500}
          />
        </Card>

        {existingPlant && (
          <div
            onClick={handleDelete}
            style={{
              textAlign: 'center', padding: 16, color: '#FF5252',
              fontWeight: 600, fontSize: 15, cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}>
            この植物を削除する
          </div>
        )}
      </div>

      {/* Save bar */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        padding: '12px 20px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 16px))',
        background: 'rgba(250,250,246,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: `0.5px solid ${APP.sep}`,
      }}>
        <div
          onClick={handleSave}
          style={{
            background: saving ? APP.text3 : APP.primary,
            color: '#fff', textAlign: 'center',
            padding: '15px 0', borderRadius: 14, fontWeight: 700, fontSize: 16,
            boxShadow: '0 4px 14px rgba(76,175,80,0.35)',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}>
          {existingPlant ? '変更を保存する' : '植物を登録する'}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// S03 — RECORD INPUT SCREEN
// ═══════════════════════════════════════════════════════════════
function S03_Record() {
  const { state, dispatch, refresh } = useApp();
  const { plantId, date: initDate, entryId } = state.params;

  const plant = DB.plants.get(plantId);
  const existingEntry = entryId ? DB.entries.getAll().find(e => e.id === entryId) : null;

  const [date, setDate] = React.useState(existingEntry?.date || initDate || todayStr());
  const [photos, setPhotos] = React.useState(existingEntry?.photos || []);
  const [weather, setWeather] = React.useState(existingEntry?.weather || '');
  const [temperature, setTemperature] = React.useState(existingEntry?.temperature || '');
  const [memo, setMemo] = React.useState(existingEntry?.memo || '');
  const [observations, setObservations] = React.useState(existingEntry?.observations || {});
  const [saving, setSaving] = React.useState(false);
  const photoInputRef = React.useRef(null);

  if (!plant) {
    return (
      <div style={{ padding: 40, fontFamily: JP, textAlign: 'center', color: APP.text2 }}>
        植物が見つかりません
      </div>
    );
  }

  const templateItems = TEMPLATES[plant.template]?.items || [];

  const weatherOpts = [
    { id: 'sun', label: '晴', icon: I.sun,       color: '#F5A623' },
    { id: 'cld', label: '曇', icon: I.cloud,     color: APP.cloud },
    { id: 'rn',  label: '雨', icon: I.rainCloud, color: APP.rain },
    { id: 'sn',  label: '雪', icon: I.snow,      color: '#88BFD8' },
  ];

  const handlePhotoAdd = async (e) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 3) {
      dispatch({ type: 'SHOW_TOAST', message: '写真は最大3枚まで追加できます' });
      return;
    }
    try {
      const blobs = await Promise.all(files.slice(0, 3 - photos.length).map(compressPhoto));
      const ids = await Promise.all(blobs.map(b => PhotoStore.put(b)));
      setPhotos(prev => [...prev, ...ids]);
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SHOW_TOAST', message: '写真の処理に失敗しました' });
    }
    e.target.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    let entry;
    try {
      entry = DB.entries.save({
        id: existingEntry?.id,
        plantId,
        date,
        photos,
        weather,
        temperature,
        memo: memo.trim(),
        observations,
      });
    } catch (err) {
      console.error(err);
      setSaving(false);
      dispatch({ type: 'SHOW_TOAST', message: '保存に失敗しました。端末の空き容量を確認してください' });
      return;
    }
    const allEntries = DB.entries.getAll();
    const newBadges = checkAndUnlockBadges(allEntries);
    refresh();
    if (newBadges.length > 0) {
      dispatch({ type: 'SHOW_TOAST', message: newBadges[0] });
    } else {
      dispatch({ type: 'SHOW_TOAST', message: '記録を保存しました ✓' });
    }
    dispatch({ type: 'NAVIGATE', screen: 'detail', params: { entryId: entry.id, plantId } });
  };

  const setObs = (key, value) => setObservations(prev => ({ ...prev, [key]: value }));

  const titleSub = `${plant.name} · ${formatJaDate(date).replace(/（.）/, '')}`;

  return (
    <div style={{ background: APP.bg, minHeight: '100dvh', fontFamily: JP }}>
      <AppHeader
        title="観察記録"
        sub={titleSub}
        leading={
          <div onClick={() => dispatch({ type: 'GO_BACK' })}
            style={{ color: APP.text2, cursor: 'pointer', padding: '4px' }}>
            {I.close}
          </div>
        }
        trailing={
          <div onClick={handleSave}
            style={{ fontSize: 14, color: saving ? APP.text3 : APP.primary, fontWeight: 700, cursor: 'pointer' }}>
            保存
          </div>
        }
      />

      <div style={{ padding: '8px 20px 180px' }}>
        {/* Date */}
        <SectionLabel>記録日</SectionLabel>
        <Card style={{ padding: 0, marginBottom: 18 }}>
          <div style={{ padding: '14px 16px' }}>
            <input
              type="date"
              style={{ ...inputStyle, fontSize: 16, fontWeight: 600 }}
              value={date}
              onChange={e => setDate(e.target.value)}
              max={todayStr()}
            />
          </div>
        </Card>

        {/* Photos */}
        <SectionLabel>写真（最大3枚）</SectionLabel>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {[0, 1, 2].map(idx => (
            <div key={idx} style={{ flex: 1, aspectRatio: '1', borderRadius: 14, overflow: 'hidden', position: 'relative' }}>
              {photos[idx] ? (
                <>
                  <img src={PhotoStore.url(photos[idx])} alt={`写真${idx+1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div
                    onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      width: 22, height: 22, borderRadius: 11,
                      background: 'rgba(0,0,0,0.55)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', fontSize: 14,
                    }}>×</div>
                </>
              ) : (
                <div
                  onClick={() => photoInputRef.current?.click()}
                  style={{
                    width: '100%', height: '100%',
                    background: photos.length > idx ? APP.surface : APP.primaryT,
                    border: `1.5px dashed ${APP.primary}66`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', color: APP.primary, gap: 4, cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent', borderRadius: 14,
                    minHeight: 90,
                  }}>
                  {idx === 0 || photos.length === idx ? (
                    <>
                      {I.camera}
                      <div style={{ fontSize: 10, fontWeight: 600 }}>追加</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 24, color: APP.primaryT }}>—</div>
                  )}
                </div>
              )}
            </div>
          ))}
          <input ref={photoInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
            onChange={handlePhotoAdd} />
        </div>

        {/* Weather */}
        <SectionLabel>天気</SectionLabel>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {weatherOpts.map(opt => {
            const on = weather === opt.id;
            return (
              <div key={opt.id}
                onClick={() => setWeather(weather === opt.id ? '' : opt.id)}
                style={{
                  flex: 1, padding: '12px 4px', borderRadius: 14, textAlign: 'center',
                  background: on ? opt.color + '22' : APP.surface,
                  border: on ? `1.5px solid ${opt.color}` : `1px solid ${APP.border}`,
                  color: on ? opt.color : APP.text2, cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                <div style={{ display: 'flex', justifyContent: 'center', color: on ? opt.color : APP.text3 }}>
                  {opt.icon}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4 }}>{opt.label}</div>
              </div>
            );
          })}
        </div>

        {/* Temperature */}
        <SectionLabel>気温</SectionLabel>
        <Card style={{ padding: 0, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 8 }}>
            <div style={{ color: APP.sky }}>{I.thermo}</div>
            <input
              type="number"
              style={{ ...inputStyle, fontSize: 16 }}
              placeholder="例: 25"
              value={temperature}
              onChange={e => setTemperature(e.target.value)}
              inputMode="decimal"
            />
            <div style={{ fontSize: 14, color: APP.text2 }}>℃</div>
          </div>
        </Card>

        {/* Template observations */}
        {templateItems.length > 0 && (
          <>
            <SectionLabel>観察記録</SectionLabel>
            <Card style={{ padding: 0, marginBottom: 18 }}>
              {templateItems.map((item, idx) => (
                <div key={item.key} style={{
                  borderBottom: idx < templateItems.length - 1 ? `0.5px solid ${APP.sep}` : 'none',
                }}>
                  {item.type === 'select' ? (
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 13, color: APP.text2, marginBottom: 8 }}>{item.label}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {item.options.map(opt => {
                          const on = observations[item.key] === opt;
                          return (
                            <div key={opt}
                              onClick={() => setObs(item.key, on ? '' : opt)}
                              style={{
                                padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                                background: on ? APP.primary : APP.primaryLt,
                                color: on ? '#fff' : APP.primary,
                                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                              }}>{opt}</div>
                          );
                        })}
                      </div>
                    </div>
                  ) : item.type === 'toggle' ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', padding: '14px 16px',
                    }}>
                      <div style={{ flex: 1, fontSize: 14, color: APP.text2 }}>{item.label}</div>
                      <div
                        onClick={() => setObs(item.key, observations[item.key] === 'yes' ? 'no' : 'yes')}
                        style={{
                          width: 50, height: 28, borderRadius: 14,
                          background: observations[item.key] === 'yes' ? APP.primary : APP.border,
                          position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                          WebkitTapHighlightColor: 'transparent',
                        }}>
                        <div style={{
                          position: 'absolute', top: 2,
                          left: observations[item.key] === 'yes' ? 24 : 2,
                          width: 24, height: 24, borderRadius: 12,
                          background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                          transition: 'left 0.2s',
                        }} />
                      </div>
                    </div>
                  ) : (
                    <InputRow label={item.label}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type={item.type === 'number' || item.type === 'integer' ? 'number' : 'text'}
                          style={{ ...inputStyle, textAlign: item.type !== 'text' ? 'right' : 'left' }}
                          placeholder="—"
                          value={observations[item.key] || ''}
                          onChange={e => setObs(item.key, e.target.value)}
                          inputMode={item.type !== 'text' ? 'decimal' : 'text'}
                        />
                        {item.unit && (
                          <div style={{ fontSize: 13, color: APP.text2, flexShrink: 0 }}>{item.unit}</div>
                        )}
                      </div>
                    </InputRow>
                  )}
                </div>
              ))}
            </Card>
          </>
        )}

        {/* Memo */}
        <SectionLabel>メモ（任意）</SectionLabel>
        <Card style={{ padding: 14, marginBottom: 18 }}>
          <textarea
            style={{ ...inputStyle, resize: 'none', minHeight: 100, lineHeight: 1.7 }}
            placeholder="今日の観察メモを書いてください（500文字まで）"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            maxLength={500}
          />
          <div style={{ fontSize: 11, color: APP.text3, textAlign: 'right', marginTop: 4 }}>
            {memo.length}/500
          </div>
        </Card>
      </div>

      {/* Save bar */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        padding: '12px 20px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 16px))',
        background: 'rgba(250,250,246,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: `0.5px solid ${APP.sep}`,
      }}>
        <div
          onClick={handleSave}
          style={{
            background: saving ? APP.text3 : APP.primary,
            color: '#fff', textAlign: 'center',
            padding: '15px 0', borderRadius: 14, fontWeight: 700, fontSize: 16,
            boxShadow: '0 4px 14px rgba(76,175,80,0.35)',
            cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}>
          {existingEntry ? '記録を更新する' : '記録を保存する'}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// S04 — RECORD DETAIL SCREEN
// ═══════════════════════════════════════════════════════════════
function S04_Detail() {
  const { state, dispatch, refresh } = useApp();
  const { entryId, plantId } = state.params;

  const entry = DB.entries.getAll().find(e => e.id === entryId);
  const plant = plantId ? DB.plants.get(plantId) : (entry ? DB.plants.get(entry.plantId) : null);

  const [photoIdx, setPhotoIdx] = React.useState(0);
  const touchStartX = React.useRef(null);

  if (!entry || !plant) {
    return (
      <div style={{ padding: 40, fontFamily: JP, textAlign: 'center', color: APP.text2 }}>
        記録が見つかりません
        <div style={{ marginTop: 16 }}>
          <div onClick={() => dispatch({ type: 'GO_BACK' })}
            style={{ color: APP.primary, fontWeight: 600, cursor: 'pointer' }}>
            戻る
          </div>
        </div>
      </div>
    );
  }

  const templateItems = TEMPLATES[plant.template]?.items || [];

  const weatherLabels = { sun: '☀️ 晴れ', cld: '☁️ 曇り', rn: '🌧 雨', sn: '🌨 雪', other: 'その他' };
  const photos = entry.photos || [];

  const handleTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = e => {
    if (touchStartX.current === null || photos.length < 2) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setPhotoIdx(i => Math.min(i + 1, photos.length - 1));
      else setPhotoIdx(i => Math.max(i - 1, 0));
    }
    touchStartX.current = null;
  };

  const handleDelete = () => {
    dispatch({
      type: 'SHOW_CONFIRM',
      message: 'この記録を削除しますか？',
      onConfirm: () => {
        DB.entries.delete(entry.id);
        refresh();
        dispatch({ type: 'SHOW_TOAST', message: '記録を削除しました' });
        dispatch({ type: 'GO_BACK' });
      },
    });
  };

  const streak = computeStreak(plant.id, DB.entries.getByPlant(plant.id));

  return (
    <div style={{ background: APP.bg, minHeight: '100dvh', fontFamily: JP }}>
      <AppHeader
        title={formatJaDate(entry.date)}
        sub={plant.name}
        leading={
          <div onClick={() => dispatch({ type: 'GO_BACK' })}
            style={{ color: APP.text2, cursor: 'pointer', padding: '4px' }}>
            {I.chevL}
          </div>
        }
        trailing={
          <div style={{ display: 'flex', gap: 16 }}>
            <div onClick={() => dispatch({ type: 'NAVIGATE', screen: 'record', params: { plantId: plant.id, entryId: entry.id } })}
              style={{ color: APP.primary, cursor: 'pointer', padding: '4px' }}>{I.edit}</div>
            <div onClick={handleDelete}
              style={{ color: '#FF5252', cursor: 'pointer', padding: '4px' }}>{I.trash}</div>
          </div>
        }
      />

      <div style={{ paddingBottom: 40 }}>
        {/* Photo carousel */}
        {photos.length > 0 ? (
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ position: 'relative', margin: '0 0 4px' }}>
            <img src={PhotoStore.url(photos[photoIdx])} alt={`写真${photoIdx+1}`}
              style={{ width: '100%', height: 280, objectFit: 'cover' }} />
            {photos.length > 1 && (
              <div style={{
                position: 'absolute', bottom: 12, left: 0, right: 0,
                display: 'flex', justifyContent: 'center', gap: 6,
              }}>
                {photos.map((_, i) => (
                  <div key={i}
                    onClick={() => setPhotoIdx(i)}
                    style={{
                      width: i === photoIdx ? 20 : 6, height: 6, borderRadius: 3,
                      background: '#fff', opacity: i === photoIdx ? 1 : 0.5,
                      cursor: 'pointer', transition: 'width 0.2s',
                    }} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <PhotoSlot tone="a" w="100%" h={180} r={0} label={plant.name} />
        )}

        <div style={{ padding: '16px 20px' }}>
          {/* Streak */}
          {streak > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 999,
              background: APP.accentLt, color: APP.accentDk,
              fontSize: 13, fontWeight: 700, marginBottom: 16,
            }}>
              {I.flame} {streak}日連続
            </div>
          )}

          {/* Weather & temp */}
          <Card style={{ padding: 14, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              {entry.weather && (
                <div style={{ fontSize: 13, color: APP.text }}>
                  <span style={{ color: APP.text2, marginRight: 6 }}>天気</span>
                  {weatherLabels[entry.weather] || entry.weather}
                </div>
              )}
              {entry.temperature && (
                <div style={{ fontSize: 13, color: APP.text }}>
                  <span style={{ color: APP.text2, marginRight: 6 }}>気温</span>
                  {entry.temperature}℃
                </div>
              )}
              {!entry.weather && !entry.temperature && (
                <div style={{ fontSize: 13, color: APP.text3 }}>天気・気温の記録なし</div>
              )}
            </div>
          </Card>

          {/* Observations */}
          {templateItems.length > 0 && Object.keys(entry.observations || {}).length > 0 && (
            <Card style={{ padding: 0, marginBottom: 14 }}>
              {templateItems.filter(item => entry.observations?.[item.key]).map((item, idx, arr) => (
                <div key={item.key} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px',
                  borderBottom: idx < arr.length - 1 ? `0.5px solid ${APP.sep}` : 'none',
                }}>
                  <div style={{ fontSize: 13, color: APP.text2 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: APP.text }}>
                    {item.type === 'toggle'
                      ? (entry.observations[item.key] === 'yes' ? 'あり ✓' : 'なし')
                      : `${entry.observations[item.key]}${item.unit ? ' ' + item.unit : ''}`
                    }
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Memo */}
          {entry.memo && (
            <Card style={{ padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: APP.text2, marginBottom: 6, fontWeight: 600, letterSpacing: 0.5 }}>
                メモ
              </div>
              <div style={{ fontSize: 14, color: APP.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {entry.memo}
              </div>
            </Card>
          )}

          {!entry.weather && !entry.temperature && !entry.memo &&
            Object.keys(entry.observations || {}).length === 0 && (
            <div style={{ textAlign: 'center', color: APP.text3, fontSize: 13, padding: '20px 0' }}>
              詳細な記録はありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// S05 — CALENDAR SCREEN
// ═══════════════════════════════════════════════════════════════
function S05_Calendar() {
  const { state, dispatch } = useApp();
  const { plants, entries } = state;
  const initPlantId = state.params.plantId || (plants[0]?.id);

  const [plantId, setPlantId] = React.useState(initPlantId);
  const now = new Date();
  const [year, setYear] = React.useState(now.getFullYear());
  const [month, setMonth] = React.useState(now.getMonth());

  const plant = plants.find(p => p.id === plantId);
  const plantEntries = entries.filter(e => e.plantId === plantId);

  const entryByDate = {};
  plantEntries.forEach(e => { entryByDate[e.date] = e; });

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const today = todayStr();
  const streak = plant ? computeStreak(plantId, plantEntries) : 0;
  const monthEntries = plantEntries.filter(e => e.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`));

  const prevMonth = () => {
    if (month === 0) { setYear(y => y-1); setMonth(11); }
    else setMonth(m => m-1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y+1); setMonth(0); }
    else setMonth(m => m+1);
  };

  const handleDayTap = (day) => {
    if (!day || !plantId) return;
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const entry = entryByDate[dateStr];
    if (entry) {
      dispatch({ type: 'NAVIGATE', screen: 'detail', params: { entryId: entry.id, plantId } });
    } else if (dateStr <= today) {
      dispatch({ type: 'NAVIGATE', screen: 'record', params: { plantId, date: dateStr } });
    }
  };

  if (plants.length === 0) {
    return (
      <div style={{ background: APP.bg, minHeight: '100dvh', fontFamily: JP }}>
        <AppHeader title="カレンダー" />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '80px 40px', gap: 16, color: APP.text3,
        }}>
          <div style={{ fontSize: 40 }}>📅</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: APP.text2 }}>植物を登録してから<br/>カレンダーを使えます</div>
          <div
            onClick={() => dispatch({ type: 'NAVIGATE', screen: 'register', params: {} })}
            style={{
              marginTop: 8, padding: '12px 24px', borderRadius: 14,
              background: APP.primary, color: '#fff', fontWeight: 700, fontSize: 15,
              cursor: 'pointer',
            }}>植物を追加する</div>
        </div>
        <NavTabBar active="cal" />
      </div>
    );
  }

  return (
    <div style={{ background: APP.bg, minHeight: '100dvh', fontFamily: JP }}>
      <AppHeader title="カレンダー" />

      {/* Plant selector */}
      {plants.length > 1 && (
        <div style={{
          display: 'flex', gap: 8, padding: '0 20px 12px',
          overflowX: 'auto',
        }}>
          {plants.map(p => (
            <div key={p.id}
              onClick={() => setPlantId(p.id)}
              style={{
                padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                background: plantId === p.id ? APP.primary : APP.surface,
                color: plantId === p.id ? '#fff' : APP.text2,
                border: plantId === p.id ? 'none' : `1px solid ${APP.border}`,
                flexShrink: 0, cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}>
              {p.name}
            </div>
          ))}
        </div>
      )}

      {/* Month navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px 12px',
      }}>
        <div onClick={prevMonth}
          style={{ color: APP.text2, cursor: 'pointer', padding: '8px', WebkitTapHighlightColor: 'transparent' }}>
          {I.chevL}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: APP.text }}>
          {formatMonthYear(year, month)}
        </div>
        <div
          onClick={() => { const n = new Date(); if (year < n.getFullYear() || (year === n.getFullYear() && month < n.getMonth())) nextMonth(); }}
          style={{ color: (year < now.getFullYear() || month < now.getMonth()) ? APP.text2 : APP.text3, cursor: 'pointer', padding: '8px', WebkitTapHighlightColor: 'transparent' }}>
          {I.chev}
        </div>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px', marginBottom: 4 }}>
        {['日','月','火','水','木','金','土'].map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 11, fontWeight: 600,
            color: i === 0 ? '#FF5252' : i === 6 ? '#448AFF' : APP.text2,
            paddingBottom: 6,
          }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 8px', gap: 2 }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const entry = entryByDate[dateStr];
          const isToday = dateStr === today;
          const isFuture = dateStr > today;
          const dayOfWeek = idx % 7;

          return (
            <div key={idx}
              onClick={() => handleDayTap(day)}
              style={{
                position: 'relative', aspectRatio: '1',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, cursor: isFuture ? 'default' : 'pointer',
                background: isToday ? APP.primaryT : 'transparent',
                WebkitTapHighlightColor: 'transparent',
              }}>
              <div style={{
                fontSize: 14, fontWeight: isToday ? 700 : 500,
                color: isToday ? APP.primary
                  : isFuture ? APP.text3
                  : dayOfWeek === 0 ? '#FF5252'
                  : dayOfWeek === 6 ? '#448AFF'
                  : APP.text,
              }}>
                {day}
              </div>
              {entry ? (
                entry.photos?.length > 0 ? (
                  <div style={{ marginTop: 2, width: 6, height: 6, borderRadius: 3, background: APP.primary }} />
                ) : (
                  <div style={{ marginTop: 2, width: 6, height: 6, borderRadius: 3, background: APP.secondary }} />
                )
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Month summary */}
      <div style={{ padding: '16px 20px', paddingBottom: 110 }}>
        <Card style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: APP.primary }}>{monthEntries.length}</div>
              <div style={{ fontSize: 11, color: APP.text2, marginTop: 2 }}>今月の記録</div>
            </div>
            <div style={{ width: 1, background: APP.sep }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: APP.accentDk }}>{streak}</div>
              <div style={{ fontSize: 11, color: APP.text2, marginTop: 2 }}>現在の連続日数</div>
            </div>
            <div style={{ width: 1, background: APP.sep }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: APP.sky }}>{plantEntries.length}</div>
              <div style={{ fontSize: 11, color: APP.text2, marginTop: 2 }}>総記録数</div>
            </div>
          </div>
        </Card>

        <div style={{ marginTop: 12 }}>
          <div
            onClick={() => dispatch({ type: 'NAVIGATE', screen: 'record', params: { plantId, date: today } })}
            style={{
              background: APP.primary, color: '#fff', textAlign: 'center',
              padding: '14px 0', borderRadius: 14, fontWeight: 700, fontSize: 15,
              boxShadow: '0 4px 14px rgba(76,175,80,0.3)',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}>
            今日の記録を追加する
          </div>
        </div>
      </div>

      <NavTabBar active="cal" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// S06 — GROWTH GRAPH SCREEN
// ═══════════════════════════════════════════════════════════════
function S06_Graph() {
  const { state, dispatch, refresh } = useApp();
  const { plants, entries } = state;

  const initPlantId = state.params.plantId || plants[0]?.id;
  const [plantId, setPlantId] = React.useState(initPlantId);
  const [period, setPeriod] = React.useState('all');

  const plant = plants.find(p => p.id === plantId);
  const templateItems = TEMPLATES[plant?.template]?.items || [];
  const graphableItems = templateItems.filter(item => item.type === 'number' || item.type === 'integer');

  const [selectedMetric, setSelectedMetric] = React.useState(graphableItems[0]?.key || '');

  // Unlock "成長の記録者" badge on first visit
  React.useEffect(() => {
    if (DB.badges.unlock('graph_viewed')) refresh();
  }, []);

  // Keep selectedMetric valid when plant changes
  React.useEffect(() => {
    const items = TEMPLATES[plant?.template]?.items || [];
    const gItems = items.filter(i => i.type === 'number' || i.type === 'integer');
    if (gItems.length > 0 && !gItems.find(i => i.key === selectedMetric)) {
      setSelectedMetric(gItems[0].key);
    }
  }, [plantId]);

  // Filter entries by period
  const periodDays = { '1m': 30, '3m': 90, 'all': Infinity };
  const cutoff = period === 'all' ? '' : (() => {
    const d = new Date();
    d.setDate(d.getDate() - periodDays[period]);
    return d.toISOString().slice(0, 10);
  })();

  const plantEntries = DB.entries.getByPlant(plantId);
  const filteredEntries = plantEntries
    .filter(e => !cutoff || e.date >= cutoff)
    .filter(e => e.observations?.[selectedMetric] !== undefined && e.observations[selectedMetric] !== '')
    .sort((a, b) => a.date.localeCompare(b.date));

  const chartData = filteredEntries.map(e => ({
    date: e.date,
    value: parseFloat(e.observations[selectedMetric]) || 0,
  }));

  const selectedItem = graphableItems.find(i => i.key === selectedMetric);
  const latestValue = chartData.length > 0 ? chartData[chartData.length - 1].value : null;
  const firstValue = chartData.length > 0 ? chartData[0].value : null;
  const delta = latestValue !== null && firstValue !== null ? latestValue - firstValue : null;

  return (
    <div style={{ background: APP.bg, minHeight: '100dvh', fontFamily: JP }}>
      <AppHeader
        title="成長グラフ"
        leading={
          <div onClick={() => dispatch({ type: 'GO_BACK' })}
            style={{ color: APP.text2, cursor: 'pointer', padding: '4px' }}>
            {I.chevL}
          </div>
        }
      />

      {/* Plant selector */}
      {plants.length > 1 && (
        <div style={{ display: 'flex', gap: 8, padding: '0 20px 12px', overflowX: 'auto' }}>
          {plants.map(p => (
            <div key={p.id}
              onClick={() => setPlantId(p.id)}
              style={{
                padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, flexShrink: 0,
                background: plantId === p.id ? APP.primary : APP.surface,
                color: plantId === p.id ? '#fff' : APP.text2,
                border: plantId === p.id ? 'none' : `1px solid ${APP.border}`,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}>
              {p.name}
            </div>
          ))}
        </div>
      )}

      <div style={{ padding: '0 20px', paddingBottom: 100 }}>
        {/* Metric tabs */}
        {graphableItems.length > 0 ? (
          <>
            <div style={{
              display: 'flex', gap: 6, padding: '8px', borderRadius: 14,
              background: '#EFEDE6', marginBottom: 16, overflowX: 'auto',
            }}>
              {graphableItems.map(item => {
                const on = selectedMetric === item.key;
                return (
                  <div key={item.key}
                    onClick={() => setSelectedMetric(item.key)}
                    style={{
                      padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                      background: on ? '#fff' : 'transparent',
                      color: on ? APP.text : APP.text2,
                      boxShadow: on ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                      cursor: 'pointer', flexShrink: 0,
                      WebkitTapHighlightColor: 'transparent',
                    }}>
                    {item.label}
                  </div>
                );
              })}
            </div>

            {/* Current value card */}
            {latestValue !== null && (
              <Card style={{ padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11, color: APP.text2, marginBottom: 4 }}>最新の{selectedItem?.label}</div>
                    <div style={{
                      fontSize: 36, fontWeight: 700, color: APP.primary,
                      fontFamily: MONO, lineHeight: 1,
                    }}>
                      {latestValue}<span style={{ fontSize: 16, marginLeft: 4, color: APP.text2 }}>{selectedItem?.unit}</span>
                    </div>
                  </div>
                  {delta !== null && delta !== 0 && (
                    <Pill color={delta >= 0 ? APP.primary : '#FF5252'}
                      bg={(delta >= 0 ? APP.primary : '#FF5252') + '18'}>
                      {delta >= 0 ? '↑' : '↓'} 合計{Math.abs(delta).toFixed(1)}{selectedItem?.unit}
                    </Pill>
                  )}
                </div>
                <div style={{ fontSize: 12, color: APP.text3, marginTop: 6 }}>
                  {chartData.length}件のデータ
                </div>
              </Card>
            )}

            {/* Chart */}
            <Card style={{ padding: 12, marginBottom: 14 }}>
              {chartData.length >= 2 ? (
                <LineChart data={chartData} unit={selectedItem?.unit || ''} color={APP.primary} />
              ) : chartData.length === 1 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: APP.text2, fontSize: 13 }}>
                  データが2件以上あるとグラフが表示されます
                </div>
              ) : (
                <div style={{ padding: '20px 0', textAlign: 'center', color: APP.text3, fontSize: 13 }}>
                  この期間に{selectedItem?.label}の記録がありません
                </div>
              )}
            </Card>

            {/* Period filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {[['1m','1ヶ月'], ['3m','3ヶ月'], ['all','全期間']].map(([v, label]) => {
                const on = period === v;
                return (
                  <div key={v} onClick={() => setPeriod(v)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 12, textAlign: 'center',
                    fontSize: 13, fontWeight: 600,
                    background: on ? APP.primary : APP.surface,
                    color: on ? '#fff' : APP.text2,
                    border: on ? 'none' : `1px solid ${APP.border}`,
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}>{label}</div>
                );
              })}
            </div>

            {/* Timeline link */}
            <div
              onClick={() => dispatch({ type: 'NAVIGATE', screen: 'timeline', params: { plantId } })}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', borderRadius: 14,
                background: APP.surface, border: `1px solid ${APP.border}`,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>🎬</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: APP.text }}>成長タイムライン</div>
                  <div style={{ fontSize: 12, color: APP.text2 }}>写真で振り返る</div>
                </div>
              </div>
              <div style={{ color: APP.text3 }}>{I.chev}</div>
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center', padding: '60px 20px', color: APP.text3,
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: APP.text2, marginBottom: 8 }}>
              グラフ対応の記録がありません
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              草丈などの数値を記録すると<br/>ここにグラフが表示されます
            </div>
          </div>
        )}
      </div>

      <NavTabBar active="graph" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// S07 — PHOTO TIMELINE SCREEN
// ═══════════════════════════════════════════════════════════════
function S07_Timeline() {
  const { state, dispatch } = useApp();
  const { plants } = state;
  const plantId = state.params.plantId || plants[0]?.id;

  const plant = plants.find(p => p.id === plantId);
  const allEntries = DB.entries.getByPlant(plantId);
  const photoEntries = allEntries
    .filter(e => e.photos?.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  const [currentIdx, setCurrentIdx] = React.useState(
    Math.max(0, photoEntries.length - 1)
  );
  const thumbsRef = React.useRef(null);
  const touchStartX = React.useRef(null);

  const current = photoEntries[currentIdx];

  // Auto-scroll thumbnail strip to active item
  React.useEffect(() => {
    const el = thumbsRef.current?.children[currentIdx];
    if (el) el.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  }, [currentIdx]);

  const handleTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = e => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setCurrentIdx(i => Math.min(i + 1, photoEntries.length - 1));
      else setCurrentIdx(i => Math.max(i - 1, 0));
    }
    touchStartX.current = null;
  };

  // Get first numeric observation for overlay
  const templateItems = TEMPLATES[plant?.template]?.items || [];
  const firstNumericKey = templateItems.find(i => i.type === 'number' || i.type === 'integer');

  const DARK = '#1A1A1A';
  const DARK2 = 'rgba(255,255,255,0.6)';

  if (!plant) {
    return (
      <div style={{ background: DARK, minHeight: '100dvh', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: DARK2, fontFamily: JP }}>
        植物が見つかりません
      </div>
    );
  }

  return (
    <div style={{ background: DARK, minHeight: '100dvh', fontFamily: JP }}>
      {/* Header — dark theme */}
      <div style={{
        paddingTop: 54, paddingBottom: 10, paddingLeft: 20, paddingRight: 20,
        position: 'sticky', top: 0, zIndex: 10, background: DARK,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 }}>
          <div onClick={() => dispatch({ type: 'GO_BACK' })}
            style={{ color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '4px' }}>
            {I.close}
          </div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>
            {plant.name} · {photoEntries.length}枚
          </div>
          <div style={{ width: 28 }} />
        </div>
      </div>

      {photoEntries.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '80px 40px', gap: 12,
        }}>
          <div style={{ fontSize: 40 }}>📷</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
            写真付きの記録がありません
          </div>
          <div style={{ fontSize: 13, color: DARK2, textAlign: 'center', lineHeight: 1.6 }}>
            記録に写真を追加すると<br/>タイムラインで成長を振り返れます
          </div>
        </div>
      ) : (
        <>
          {/* Hero photo */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ position: 'relative', margin: '8px 0' }}>
            <img src={PhotoStore.url(current.photos[0])} alt={`Day ${currentIdx + 1}`}
              style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }} />

            {/* Top-left: DAY badge */}
            <div style={{
              position: 'absolute', top: 12, left: 12,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              padding: '6px 12px', borderRadius: 8,
              color: '#fff', fontFamily: MONO, fontSize: 11, fontWeight: 700,
              letterSpacing: 0.8,
            }}>
              DAY {currentIdx + 1} · {formatJaDate(current.date).replace('年','/').replace('月','/').replace(/日.*/,'')}
            </div>

            {/* Bottom-left: numeric value */}
            {firstNumericKey && current.observations?.[firstNumericKey.key] && (
              <div style={{
                position: 'absolute', bottom: 12, left: 12,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(8px)',
                padding: '6px 12px', borderRadius: 8,
                color: '#fff', fontFamily: MONO, fontSize: 13, fontWeight: 700,
              }}>
                {firstNumericKey.label} {current.observations[firstNumericKey.key]}{firstNumericKey.unit}
              </div>
            )}

            {/* Navigation arrows for non-touch */}
            {currentIdx > 0 && (
              <div onClick={() => setCurrentIdx(i => i - 1)}
                style={{
                  position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, borderRadius: 18,
                  background: 'rgba(0,0,0,0.4)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                {I.chevL}
              </div>
            )}
            {currentIdx < photoEntries.length - 1 && (
              <div onClick={() => setCurrentIdx(i => i + 1)}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, borderRadius: 18,
                  background: 'rgba(0,0,0,0.4)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}>
                {I.chev}
              </div>
            )}
          </div>

          {/* Scrubber */}
          <div style={{ padding: '12px 20px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: DARK2, fontFamily: MONO }}>DAY 1</div>
              <div style={{ fontSize: 11, color: '#fff', fontFamily: MONO }}>
                DAY {currentIdx + 1} / {photoEntries.length}
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(0, photoEntries.length - 1)}
              value={currentIdx}
              onChange={e => setCurrentIdx(Number(e.target.value))}
              style={{ width: '100%', accentColor: APP.primary, cursor: 'pointer' }}
            />
          </div>

          {/* Thumbnail strip */}
          <div
            ref={thumbsRef}
            style={{
              display: 'flex', gap: 8, padding: '4px 20px 12px',
              overflowX: 'auto',
            }}>
            {photoEntries.map((entry, idx) => {
              const isActive = idx === currentIdx;
              return (
                <div key={entry.id}
                  onClick={() => setCurrentIdx(idx)}
                  style={{
                    flexShrink: 0, cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}>
                  <img src={PhotoStore.url(entry.photos[0])} alt={`Day ${idx + 1}`}
                    style={{
                      width: 60, height: 76, objectFit: 'cover', borderRadius: 8,
                      border: isActive ? `2px solid ${APP.primary}` : '2px solid transparent',
                      opacity: isActive ? 1 : 0.55,
                      transition: 'opacity 0.15s',
                    }} />
                  <div style={{
                    fontFamily: MONO, fontSize: 9, color: DARK2,
                    textAlign: 'center', marginTop: 4,
                  }}>
                    {entry.date.slice(5).replace('-', '/')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Memo if any */}
          {current.memo && (
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: 12,
                padding: '12px 14px', fontSize: 13, color: 'rgba(255,255,255,0.8)',
                lineHeight: 1.6,
              }}>
                {current.memo}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// S08 — BADGES SCREEN
// ═══════════════════════════════════════════════════════════════
function S08_Badges() {
  const { state } = useApp();
  const { plants, entries } = state;
  const allBadges = DB.badges.getAll();

  const unlockedDefs = BADGE_DEFS.filter(def => isBadgeUnlocked(def.type, allBadges));
  const lockedDefs   = BADGE_DEFS.filter(def => !isBadgeUnlocked(def.type, allBadges));
  const total = BADGE_DEFS.length;
  const earned = unlockedDefs.length;

  function formatBadgeDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getMonth()+1}/${d.getDate()} 獲得`;
  }

  return (
    <div style={{ background: APP.bg, minHeight: '100dvh', fontFamily: JP }}>
      <AppHeader title="バッジ" />

      <div style={{ padding: '0 20px', paddingBottom: 100 }}>
        {/* Progress hero */}
        <Card style={{
          padding: 20, marginBottom: 20,
          background: `linear-gradient(135deg, ${APP.primaryLt}, #fff)`,
          border: `1px solid ${APP.primary}22`,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
              <span style={{ fontSize: 44, fontWeight: 700, color: APP.primary }}>{earned}</span>
              <span style={{ fontSize: 18, color: APP.text3 }}>/ {total}</span>
            </div>
            <div style={{ fontSize: 13, color: APP.text2, marginBottom: 12 }}>あなたの実績 · バッジを獲得</div>
            <div style={{ height: 8, borderRadius: 4, background: '#fff', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4, background: APP.primary,
                width: `${(earned / total) * 100}%`,
                transition: 'width 0.4s ease-out',
              }} />
            </div>
          </div>
        </Card>

        {/* Earned badges */}
        {unlockedDefs.length > 0 && (
          <>
            <SectionLabel>獲得済み {earned}個</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {unlockedDefs.map(def => {
                const dateStr = getBadgeDate(def.type, allBadges);
                return (
                  <Card key={def.type} style={{ padding: 12, textAlign: 'center' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 28, margin: '0 auto 8px',
                      background: def.color + '20',
                      border: `2px solid ${def.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26,
                    }}>
                      {def.emoji}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: APP.text, lineHeight: 1.3 }}>
                      {def.label}
                    </div>
                    {dateStr && (
                      <div style={{ fontSize: 9, color: APP.text3, marginTop: 4, fontFamily: MONO }}>
                        {formatBadgeDate(dateStr)}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {/* Locked / in-progress badges */}
        {lockedDefs.length > 0 && (
          <>
            <SectionLabel>挑戦中 {lockedDefs.length}個</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lockedDefs.map(def => {
                const prog = getBadgeProgress(def.type, entries, plants, allBadges);
                const pct = prog.max > 0 ? Math.min(1, prog.cur / prog.max) : 0;
                return (
                  <Card key={def.type} style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 24, flexShrink: 0,
                      background: '#f0f0f0',
                      border: `1.5px dashed #ccc`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, opacity: 0.5,
                    }}>
                      {def.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: APP.text2, marginBottom: 8 }}>
                        {def.label}
                      </div>
                      <div style={{ height: 5, borderRadius: 3, background: APP.border, overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{
                          height: '100%', borderRadius: 3, background: APP.text3,
                          width: `${pct * 100}%`,
                          transition: 'width 0.3s',
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: APP.text3, fontFamily: MONO }}>
                        {prog.cur} / {prog.max}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {earned === total && (
          <div style={{ textAlign: 'center', padding: '24px 0', fontSize: 13, color: APP.primary, fontWeight: 600 }}>
            🎉 すべてのバッジを獲得しました！
          </div>
        )}
      </div>

      <NavTabBar active="badge" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP ROUTER
// ═══════════════════════════════════════════════════════════════
function AppRouter() {
  const { state } = useApp();

  const screens = {
    home:     S01_Home,
    register: S02_Register,
    record:   S03_Record,
    detail:   S04_Detail,
    calendar: S05_Calendar,
    graph:    S06_Graph,
    timeline: S07_Timeline,
    badges:   S08_Badges,
    settings: () => <StubScreen title="設定" icon="⚙️" tabId="set" />,
  };

  const Screen = screens[state.screen] || S01_Home;
  const key = state.screen + JSON.stringify(state.params);

  return (
    <div key={key} className="screen-enter">
      <Screen />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
