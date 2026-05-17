// Plant Diary — Phase 2 screens S06..S09

// ─────────────────────────────────────────────────────────────
// S06 — 成長グラフ
// ─────────────────────────────────────────────────────────────
function S06_Graph() {
  // line chart points (草丈 cm over 14 days)
  const data = [4.5, 6, 8, 10, 12, 14, 16, 18.5, 21, 23.5, 26, 28, 30, 32.5];
  const W = 320, H = 180, P = 20;
  const xMax = data.length - 1, yMax = 40;
  const points = data.map((v, i) => {
    const x = P + (i / xMax) * (W - P * 2);
    const y = H - P - (v / yMax) * (H - P * 2);
    return [x, y];
  });
  const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = path + ` L${points[points.length-1][0]},${H-P} L${points[0][0]},${H-P} Z`;

  const metrics = ['草丈', '葉の数', 'つぼみ', '開花数'];
  const periods = ['1ヶ月', '3ヶ月', '全期間'];

  return (
    <div style={{ background: APP.bg, height: '100%', position: 'relative', overflow: 'hidden', fontFamily: JP }}>
      <AppHeader
        title="成長グラフ"
        leading={<div style={{ color: APP.text2 }}>{I.chevL}</div>}
        trailing={<div style={{ fontSize: 13, color: APP.primary, fontWeight: 600 }}>共有</div>}
        sub="朝顔1号"
      />

      <div style={{ height: '100%', overflow: 'auto', padding: '4px 20px 110px' }}>
        {/* Metric tabs */}
        <div style={{
          display: 'flex', gap: 6, padding: 4, background: '#EFEDE6',
          borderRadius: 12, marginBottom: 16,
        }}>
          {metrics.map((m, i) => {
            const on = i === 0;
            return (
              <div key={m} style={{
                flex: 1, padding: '8px 0', textAlign: 'center',
                background: on ? APP.surface : 'transparent',
                borderRadius: 9, fontSize: 12, fontWeight: 600,
                color: on ? APP.text : APP.text2,
                boxShadow: on ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>{m}</div>
            );
          })}
        </div>

        {/* Stat */}
        <Card style={{ padding: 16, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontSize: 11, color: APP.text2, fontWeight: 600, letterSpacing: 0.5 }}>現在の草丈</div>
            <div style={{ marginLeft: 'auto' }}>
              <Pill color={APP.primary}>{I.chart} +28cm / 14日</Pill>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 36, fontWeight: 700, color: APP.text, fontFamily: MONO, letterSpacing: -1 }}>32.5</span>
            <span style={{ fontSize: 16, color: APP.text2 }}>cm</span>
            <span style={{ fontSize: 11, color: APP.primary, fontWeight: 600, marginLeft: 'auto' }}>↑ 前日 +1.2cm</span>
          </div>

          {/* Chart */}
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ marginTop: 8 }}>
            <defs>
              <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={APP.primary} stopOpacity="0.35"/>
                <stop offset="100%" stopColor={APP.primary} stopOpacity="0"/>
              </linearGradient>
            </defs>
            {/* y grid */}
            {[0, 10, 20, 30, 40].map(v => {
              const y = H - P - (v / yMax) * (H - P * 2);
              return (
                <g key={v}>
                  <line x1={P} y1={y} x2={W-P} y2={y} stroke={APP.sep} strokeDasharray="2 4"/>
                  <text x={P-6} y={y+3} textAnchor="end" fontSize="9" fill={APP.text3} fontFamily={MONO}>{v}</text>
                </g>
              );
            })}
            <path d={area} fill="url(#gradA)"/>
            <path d={path} fill="none" stroke={APP.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {points.map((p, i) => (i % 2 === 0 || i === points.length-1) && (
              <circle key={i} cx={p[0]} cy={p[1]} r={i === points.length-1 ? 5 : 3} fill={i === points.length-1 ? APP.primary : APP.surface} stroke={APP.primary} strokeWidth={i === points.length-1 ? 0 : 2}/>
            ))}
            {/* x axis labels */}
            {[0, 4, 8, 12].map(i => (
              <text key={i} x={points[i][0]} y={H-4} textAnchor="middle" fontSize="9" fill={APP.text3} fontFamily={MONO}>5/{i+5}</text>
            ))}
            {/* highlight last point */}
            <text x={points[points.length-1][0]} y={points[points.length-1][1] - 12} textAnchor="middle" fontSize="10" fill={APP.primary} fontWeight="700" fontFamily={MONO}>32.5</text>
          </svg>
        </Card>

        {/* Period filter */}
        <div style={{
          display: 'flex', gap: 6, padding: 4, marginBottom: 16,
        }}>
          {periods.map((p, i) => {
            const on = i === 0;
            return (
              <div key={p} style={{
                flex: 1, padding: '8px 0', textAlign: 'center',
                background: on ? APP.primary : APP.surface,
                color: on ? '#fff' : APP.text,
                borderRadius: 10, fontSize: 12, fontWeight: 600,
                border: on ? 'none' : `1px solid ${APP.border}`,
              }}>{p}</div>
            );
          })}
        </div>

        {/* Insights */}
        <SectionLabel>成長の記録</SectionLabel>
        <Card style={{ padding: 0, marginBottom: 14 }}>
          {[
            { d:'5/18', l:'はじめての花が咲いた', v:'+1個', c: APP.accentDk, icon: '🌸' },
            { d:'5/14', l:'最も成長した日', v:'+2.5cm', c: APP.primary, icon: '🌱' },
            { d:'5/05', l:'観察スタート', v:'4.5cm', c: APP.text2, icon: '🌱' },
          ].map((row, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12,
              borderBottom: i < a.length - 1 ? `0.5px solid ${APP.sep}` : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12, background: APP.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>{row.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: APP.text2, fontWeight: 600 }}>{row.d}</div>
                <div style={{ fontSize: 14, color: APP.text, fontWeight: 500, marginTop: 1 }}>{row.l}</div>
              </div>
              <div style={{ fontSize: 13, color: row.c, fontWeight: 700, fontFamily: MONO }}>{row.v}</div>
            </div>
          ))}
        </Card>
      </div>

      <TabBar active="graph" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// S07 — 成長タイムライン
// ─────────────────────────────────────────────────────────────
function S07_Timeline() {
  const days = [
    { d: '5/05', n: 1,  t: 'a', h: '4.5cm',  s: '🌱' },
    { d: '5/08', n: 4,  t: 'a', h: '10cm',   s: null },
    { d: '5/11', n: 7,  t: 'a', h: '16cm',   s: '💧' },
    { d: '5/14', n: 10, t: 'd', h: '23.5cm', s: '🌱' },
    { d: '5/17', n: 12, t: 'a', h: '30cm',   s: null },
    { d: '5/18', n: 13, t: 'a', h: '32.5cm', s: '🌸' },
  ];
  return (
    <div style={{ background: '#1A1A1A', height: '100%', position: 'relative', overflow: 'hidden', fontFamily: JP }}>
      <AppHeader
        title="タイムライン"
        leading={<div style={{ color: '#fff' }}>{I.close}</div>}
        trailing={<div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>共有</div>}
        sub="朝顔1号 · 14日間"
        bg="#1A1A1A"
      />

      <div style={{ height: '100%', overflow: 'auto', padding: '4px 20px 110px', color: '#fff' }}>
        {/* Hero photo */}
        <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', marginBottom: 14 }}>
          <PhotoSlot tone="a" w="100%" h={340} r={24} label="ASAGAO · DAY 13" stamp="🌸" />
          <div style={{
            position: 'absolute', top: 14, left: 14,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
            borderRadius: 999, padding: '6px 10px', color: '#fff',
            fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: 1,
          }}>DAY 13 · 5/18</div>
          <div style={{
            position: 'absolute', bottom: 14, left: 14, right: 14,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>草丈</div>
              <div style={{ fontSize: 42, fontWeight: 700, color: '#fff', fontFamily: MONO, lineHeight: 1, letterSpacing: -2 }}>32.5<span style={{ fontSize: 18, fontFamily: JP, marginLeft: 4 }}>cm</span></div>
            </div>
            <div style={{
              width: 56, height: 56, borderRadius: 28, background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            }}>{I.play}</div>
          </div>
        </div>

        {/* Scrubber */}
        <div style={{ padding: '4px 0 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontFamily: MONO }}>
            <span>DAY 1</span><span>DAY 13 / 14</span>
          </div>
          <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '93%', background: APP.primary, borderRadius: 2 }} />
            <div style={{ position: 'absolute', left: '93%', top: '50%', transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: 8, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }} />
          </div>
        </div>

        {/* Mini strip */}
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 10 }}>すべての写真</div>
        <div style={{ display: 'flex', gap: 8, overflow: 'hidden' }}>
          {days.map((d, i) => {
            const active = i === days.length - 1;
            return (
              <div key={i} style={{ position: 'relative', flex: '0 0 auto' }}>
                <PhotoSlot tone={d.t} w={64} h={80} r={10} label="" stamp={d.s} />
                {active && (
                  <div style={{
                    position: 'absolute', inset: -3, border: `2px solid ${APP.primary}`, borderRadius: 12,
                  }} />
                )}
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 4, fontFamily: MONO }}>{d.d}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// S08 — バッジ
// ─────────────────────────────────────────────────────────────
function S08_Badges() {
  const badges = [
    { n: 'はじめての観察', c: 'A', got: true,  date: '5/05', icon: '🌱', col: APP.primary },
    { n: '3日連続',       c: 'B', got: true,  date: '5/07', icon: '🔥', col: APP.accentDk },
    { n: '1週間連続',     c: 'C', got: true,  date: '5/11', icon: '⭐', col: APP.accent },
    { n: '写真コレクター', c: 'D', got: true,  date: '5/15', icon: '📷', col: '#6B8AC4' },
    { n: '成長の記録者',   c: 'E', got: true,  date: '5/18', icon: '📈', col: APP.primaryDk },
    { n: '1ヶ月連続',     c: 'F', got: false, prog: 13, max: 30, icon: '🏆', col: APP.text3 },
    { n: '観察マスター',   c: 'G', got: false, prog: 47, max: 100, icon: '🌟', col: APP.text3 },
    { n: '春の使者',       c: 'H', got: false, prog: 1, max: 5, icon: '🌸', col: APP.text3 },
  ];

  const got = badges.filter(b => b.got).length;

  return (
    <div style={{ background: APP.bg, height: '100%', position: 'relative', overflow: 'hidden', fontFamily: JP }}>
      <AppHeader
        title="バッジ"
        leading={<div style={{ color: APP.text2 }}>{I.chevL}</div>}
      />

      <div style={{ height: '100%', overflow: 'auto', padding: '4px 20px 110px' }}>
        {/* Progress hero */}
        <Card style={{ padding: 18, marginBottom: 20, textAlign: 'center', background: `linear-gradient(135deg, ${APP.primaryLt}, #fff)`, border: `1px solid ${APP.primary}22` }}>
          <div style={{ fontSize: 11, color: APP.text2, fontWeight: 600, letterSpacing: 1 }}>あなたの実績</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center', marginTop: 6 }}>
            <span style={{ fontSize: 44, fontWeight: 700, color: APP.primary, fontFamily: MONO, letterSpacing: -2 }}>{got}</span>
            <span style={{ fontSize: 18, color: APP.text2 }}>/ {badges.length}</span>
          </div>
          <div style={{ fontSize: 13, color: APP.text, marginTop: 2 }}>バッジを獲得</div>
          <div style={{ marginTop: 14, height: 8, background: '#fff', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '100%', width: `${(got / badges.length) * 100}%`, background: APP.primary, borderRadius: 4 }} />
          </div>
        </Card>

        <SectionLabel>獲得済み（5）</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 22 }}>
          {badges.filter(b => b.got).map(b => (
            <div key={b.n} style={{
              background: APP.surface, borderRadius: 16, padding: 12,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 28,
                background: b.col + '20', border: `2px solid ${b.col}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
              }}>{b.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: APP.text, textAlign: 'center' }}>{b.n}</div>
              <div style={{ fontSize: 9, color: APP.text3, fontFamily: MONO }}>{b.date}</div>
            </div>
          ))}
        </div>

        <SectionLabel>挑戦中（3）</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {badges.filter(b => !b.got).map(b => (
            <Card key={b.n} style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 24,
                background: APP.bg, border: `2px dashed ${APP.text3}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                filter: 'grayscale(0.5)', opacity: 0.5,
              }}>{b.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: APP.text }}>{b.n}</div>
                <div style={{ marginTop: 6, height: 5, background: APP.bg, borderRadius: 2.5, overflow: 'hidden' }}>
                  <div style={{ width: `${(b.prog/b.max)*100}%`, height: '100%', background: APP.accent }} />
                </div>
                <div style={{ fontSize: 10, color: APP.text2, marginTop: 4, fontFamily: MONO }}>{b.prog} / {b.max}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <TabBar active="badge" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// S09 — 設定
// ─────────────────────────────────────────────────────────────
function S09_Settings() {
  return (
    <div style={{ background: APP.bg, height: '100%', position: 'relative', overflow: 'hidden', fontFamily: JP }}>
      <AppHeader
        title="設定"
        leading={<div style={{ width: 28 }}></div>}
      />

      <div style={{ height: '100%', overflow: 'auto', padding: '4px 0 110px' }}>
        {/* Notifications */}
        <SectionLabel>&nbsp;&nbsp;通知</SectionLabel>
        <div style={{ margin: '0 16px 22px' }}>
          <Card style={{ padding: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: `0.5px solid ${APP.sep}` }}>
              <div style={{ color: APP.accentDk, marginRight: 12 }}>{I.bell}</div>
              <div style={{ flex: 1, fontSize: 14, color: APP.text }}>毎日のリマインダー</div>
              <Toggle on={true} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: `0.5px solid ${APP.sep}` }}>
              <div style={{ flex: 1, fontSize: 14, color: APP.text }}>通知時刻</div>
              <div style={{ fontFamily: MONO, fontSize: 15, color: APP.text, fontWeight: 600 }}>18:00</div>
              <div style={{ color: APP.text3, marginLeft: 6 }}>{I.chev}</div>
            </div>
            <div style={{ padding: '14px 16px', fontSize: 11, color: APP.text2, lineHeight: 1.5 }}>
              当日に記録がない植物のみ通知されます。
            </div>
          </Card>
        </div>

        {/* Per-plant */}
        <SectionLabel>&nbsp;&nbsp;植物ごとの通知</SectionLabel>
        <div style={{ margin: '0 16px 22px' }}>
          <Card style={{ padding: 0 }}>
            {[
              { n: '朝顔1号', t: 'a', on: true },
              { n: '朝顔2号', t: 'd', on: true },
              { n: 'モンステラ', t: 'b', on: false },
              { n: 'バジル', t: 'a', on: true },
            ].map((p, i, a) => (
              <div key={p.n} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px',
                borderBottom: i < a.length-1 ? `0.5px solid ${APP.sep}` : 'none' }}>
                <PhotoSlot tone={p.t} w={36} h={36} r={10} label="" />
                <div style={{ flex: 1, fontSize: 14, color: APP.text, marginLeft: 12 }}>{p.n}</div>
                <Toggle on={p.on} />
              </div>
            ))}
          </Card>
        </div>

        {/* Appearance */}
        <SectionLabel>&nbsp;&nbsp;表示</SectionLabel>
        <div style={{ margin: '0 16px 22px' }}>
          <Card style={{ padding: 0 }}>
            <div style={{ padding: '14px 16px', borderBottom: `0.5px solid ${APP.sep}` }}>
              <div style={{ fontSize: 14, color: APP.text, marginBottom: 10 }}>テーマ</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { n: 'ライト', bg: '#FFFFFF', on: true },
                  { n: 'ダーク', bg: '#1A1A1A', on: false },
                  { n: '自動',   bg: 'linear-gradient(135deg, #FFFFFF 50%, #1A1A1A 50%)', on: false },
                ].map(t => (
                  <div key={t.n} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{
                      height: 56, borderRadius: 12, background: t.bg,
                      border: t.on ? `2px solid ${APP.primary}` : `1px solid ${APP.border}`,
                      marginBottom: 6,
                    }} />
                    <div style={{ fontSize: 11, fontWeight: 600, color: t.on ? APP.primary : APP.text2 }}>{t.n}</div>
                  </div>
                ))}
              </div>
            </div>
            <Row title="テンプレート管理" detail="3種" />
            <Row title="文字サイズ" detail="標準" last />
          </Card>
        </div>

        {/* Data */}
        <SectionLabel>&nbsp;&nbsp;データ</SectionLabel>
        <div style={{ margin: '0 16px 22px' }}>
          <Card style={{ padding: 0 }}>
            <Row title="バックアップを書き出す" />
            <Row title="観察日記をPDFで出力" pill="Phase 2" />
            <Row title="すべてのデータを削除" warn last />
          </Card>
        </div>

        {/* About */}
        <SectionLabel>&nbsp;&nbsp;このアプリについて</SectionLabel>
        <div style={{ margin: '0 16px 22px' }}>
          <Card style={{ padding: 0 }}>
            <Row title="バージョン" detail="1.0.0" chev={false} />
            <Row title="ライセンス" last />
          </Card>
        </div>

        <div style={{ textAlign: 'center', padding: '12px 0 40px', fontSize: 11, color: APP.text3, fontFamily: MONO }}>
          🌱 Plant Diary · v1.0.0
        </div>
      </div>

      <TabBar active="set" />
    </div>
  );
}

function Toggle({ on }) {
  return (
    <div style={{
      width: 44, height: 26, borderRadius: 13,
      background: on ? APP.primary : '#D1D1D6',
      position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 20 : 2,
        width: 22, height: 22, borderRadius: 11, background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

function Row({ title, detail, pill, warn, chev = true, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', padding: '14px 16px',
      borderBottom: last ? 'none' : `0.5px solid ${APP.sep}`,
    }}>
      <div style={{ flex: 1, fontSize: 14, color: warn ? '#D85B5B' : APP.text, fontWeight: warn ? 500 : 500 }}>{title}</div>
      {detail && <span style={{ fontSize: 13, color: APP.text2, marginRight: 6 }}>{detail}</span>}
      {pill && <Pill color={APP.text2} bg={APP.bg} style={{ marginRight: 6 }}>{pill}</Pill>}
      {chev && <div style={{ color: APP.text3 }}>{I.chev}</div>}
    </div>
  );
}

Object.assign(window, { S06_Graph, S07_Timeline, S08_Badges, S09_Settings, Toggle, Row });
