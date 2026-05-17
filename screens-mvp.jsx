// Plant Diary — MVP screens S01..S05
// Renders a stylized but content-realistic Japanese mobile UI.

// ─────────────────────────────────────────────────────────────
// S01 — ホーム
// ─────────────────────────────────────────────────────────────
function S01_Home() {
  const plants = [
    { name: '朝顔1号', species: 'アサガオ', streak: 12, photoDay: '今日', recorded: true, tone: 'a',  badge: '🌸', height: '32.5cm' },
    { name: '朝顔2号', species: 'アサガオ', streak: 11, photoDay: '今日', recorded: true, tone: 'd',  badge: '🌱', height: '28.0cm' },
    { name: 'モンステラ', species: '観葉植物', streak: 4, photoDay: '昨日', recorded: false, tone: 'b', badge: '🌿', height: '64cm' },
    { name: 'バジル', species: '家庭菜園', streak: 0, photoDay: '4日前', recorded: false, tone: 'a', badge: '🌿', height: '15cm' },
  ];

  return (
    <div style={{ background: APP.bg, height: '100%', position: 'relative', overflow: 'hidden', fontFamily: JP }}>
      <div style={{ height: '100%', overflow: 'auto', paddingBottom: 110 }}>
        <AppHeader
          title="わたしの植物"
          leading={<div style={{ width: 28, height: 28, borderRadius: 999, background: APP.primaryLt, display: 'flex', alignItems: 'center', justifyContent: 'center', color: APP.primary }}>{I.leaf}</div>}
          trailing={<div style={{ color: APP.text2 }}>{I.bell}</div>}
        />

        {/* Greeting block */}
        <div style={{ padding: '4px 20px 16px' }}>
          <div style={{ fontSize: 11, color: APP.text2, fontWeight: 500, letterSpacing: 1 }}>2026年5月18日（月）</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: APP.text, lineHeight: 1.3, marginTop: 4 }}>
            おはよう、<br/>今日も<span style={{ color: APP.primary }}>2/4</span>つ記録しよう
          </div>
        </div>

        {/* Quick streak strip */}
        <div style={{ padding: '0 20px 18px' }}>
          <div style={{
            display: 'flex', gap: 8, padding: 14, borderRadius: 18,
            background: `linear-gradient(135deg, ${APP.accentLt}, #FFF8EC)`,
            border: `1px solid ${APP.accent}33`,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: APP.accentDk }}>
              {I.flame}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: APP.accentDk, fontWeight: 600, letterSpacing: 0.5 }}>最長ストリーク</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: APP.text, marginTop: 2 }}>
                朝顔1号 · <span style={{ color: APP.accentDk }}>12日連続</span>
              </div>
            </div>
            <div style={{ alignSelf: 'center', color: APP.accentDk }}>{I.chev}</div>
          </div>
        </div>

        {/* Plant cards */}
        <div style={{ padding: '0 20px' }}>
          <SectionLabel action="並び替え">わたしの植物（4）</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {plants.map((p, i) => (
              <Card key={i} style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center', border: !p.recorded ? `1.5px solid ${APP.accent}55` : 'none' }}>
                <PhotoSlot tone={p.tone} w={72} h={72} r={14} label={p.name} stamp={p.badge} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: APP.text }}>{p.name}</div>
                    {!p.recorded && <Pill color={APP.accentDk} bg={APP.accent + '22'}>未記録</Pill>}
                  </div>
                  <div style={{ fontSize: 12, color: APP.text2, marginTop: 2 }}>{p.species} · {p.height}</div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: p.streak > 0 ? APP.accentDk : APP.text3, fontWeight: 600 }}>
                      <span style={{ color: p.streak > 0 ? APP.accentDk : APP.text3 }}>{I.flame}</span>
                      {p.streak}日連続
                    </span>
                    <span style={{ fontSize: 12, color: APP.text3 }}>記録: {p.photoDay}</span>
                  </div>
                </div>
                <div style={{ color: APP.text3 }}>{I.chev}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* Add plant card */}
        <div style={{ padding: '14px 20px 24px' }}>
          <div style={{
            border: `1.5px dashed ${APP.primary}66`, borderRadius: 18,
            padding: '16px 14px', display: 'flex', alignItems: 'center', gap: 12,
            color: APP.primary, fontWeight: 600, fontSize: 14, background: APP.primaryT,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: APP.primary,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{I.plus}</div>
            新しい植物を追加
          </div>
        </div>
      </div>

      {/* Floating record button */}
      <div style={{
        position: 'absolute', right: 20, bottom: 104,
        width: 60, height: 60, borderRadius: 30, background: APP.primary,
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 20px rgba(76,175,80,0.45), 0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 25,
      }}>
        <div style={{ transform: 'scale(1.4)' }}>{I.plus}</div>
      </div>

      <TabBar active="home" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// S02 — 植物登録
// ─────────────────────────────────────────────────────────────
function S02_Register() {
  const presets = ['朝顔', '観葉植物', '野菜・家庭菜園', 'カスタム'];
  return (
    <div style={{ background: APP.bg, height: '100%', position: 'relative', overflow: 'hidden', fontFamily: JP }}>
      <AppHeader
        title="新しい植物"
        leading={<div style={{ fontSize: 14, color: APP.text2, fontWeight: 500 }}>キャンセル</div>}
        trailing={<div style={{ fontSize: 14, color: APP.text3, fontWeight: 600 }}>保存</div>}
      />
      <div style={{ height: '100%', overflow: 'auto', padding: '4px 20px 200px' }}>
        {/* Thumbnail picker */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4, marginBottom: 24 }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 120, height: 120, borderRadius: 60, overflow: 'hidden',
              border: `2px dashed ${APP.primary}66`, background: APP.primaryT,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: APP.primary, gap: 4,
            }}>
              {I.camera}
              <div style={{ fontSize: 11, fontWeight: 600 }}>写真を追加</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <SectionLabel>基本情報</SectionLabel>
        <Card style={{ padding: 0, marginBottom: 18 }}>
          {[
            { label: '名前', value: '朝顔1号', primary: true },
            { label: '種類', value: 'アサガオ' },
            { label: '栽培開始日', value: '2026年5月10日' },
          ].map((row, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', padding: '14px 16px',
              borderBottom: i < a.length - 1 ? `0.5px solid ${APP.sep}` : 'none',
            }}>
              <div style={{ fontSize: 14, color: APP.text2, width: 96 }}>{row.label}</div>
              <div style={{ flex: 1, fontSize: 15, color: row.primary ? APP.text : APP.text, fontWeight: row.primary ? 600 : 500 }}>
                {row.value}
              </div>
              {row.label === '栽培開始日' && <div style={{ color: APP.text3 }}>{I.chev}</div>}
            </div>
          ))}
        </Card>

        {/* Preset selector */}
        <SectionLabel>テンプレート</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
          {presets.map((p, i) => {
            const on = i === 0;
            return (
              <div key={p} style={{
                padding: '14px 12px', borderRadius: 14,
                background: on ? APP.primary : APP.surface,
                border: on ? 'none' : `1px solid ${APP.border}`,
                color: on ? '#fff' : APP.text, fontWeight: 600, fontSize: 14,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ color: on ? '#fff' : APP.primary }}>{I.leaf}</div>
                {p}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: APP.text2, marginTop: -8, marginBottom: 18, padding: '0 4px', lineHeight: 1.5 }}>
          選んだテンプレートに合わせて、草丈・葉の数などの観察項目が自動で設定されます。あとから変更できます。
        </div>

        {/* Memo */}
        <SectionLabel>メモ（任意）</SectionLabel>
        <Card style={{ padding: 14, minHeight: 80 }}>
          <div style={{ fontSize: 14, color: APP.text, lineHeight: 1.6 }}>
            ベランダ南向きの鉢に植えた。<br/>
            <span style={{ color: APP.text3 }}>置き場所、品種特性などを記録できます…</span>
          </div>
        </Card>
      </div>

      {/* Sticky save bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '12px 20px 32px', background: 'rgba(250,250,246,0.95)',
        backdropFilter: 'blur(12px)', borderTop: `0.5px solid ${APP.sep}`,
      }}>
        <div style={{
          background: APP.primary, color: '#fff', textAlign: 'center',
          padding: '14px 0', borderRadius: 14, fontWeight: 700, fontSize: 16,
          boxShadow: '0 4px 14px rgba(76,175,80,0.35)',
        }}>植物を登録する</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// S03 — 記録入力
// ─────────────────────────────────────────────────────────────
function S03_Record() {
  const weatherOpts = [
    { id: 'sun', label: '晴', icon: I.sun, color: '#F5A623' },
    { id: 'cld', label: '曇', icon: I.cloud, color: APP.cloud },
    { id: 'rn',  label: '雨', icon: I.rainCloud, color: APP.rain },
    { id: 'sn',  label: '雪', icon: I.snow, color: '#88BFD8' },
  ];
  const stamps = ['☀️','🌱','🌸','🌿','💧','🐛','😊'];

  return (
    <div style={{ background: APP.bg, height: '100%', position: 'relative', overflow: 'hidden', fontFamily: JP }}>
      <AppHeader
        title="観察記録"
        leading={<div style={{ color: APP.text2 }}>{I.close}</div>}
        trailing={<div style={{ fontSize: 14, color: APP.primary, fontWeight: 700 }}>保存</div>}
        sub="朝顔1号 · 5月18日（月）"
      />

      <div style={{ height: '100%', overflow: 'auto', padding: '8px 20px 240px' }}>
        {/* Photos */}
        <SectionLabel>写真（最大3枚）</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 22 }}>
          <PhotoSlot tone="a" h={100} r={12} label="DAY 12" stamp="🌸" />
          <PhotoSlot tone="d" h={100} r={12} label="つぼみ" />
          <div style={{
            height: 100, borderRadius: 12, border: `1.5px dashed ${APP.primary}55`,
            background: APP.primaryT, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', color: APP.primary, gap: 4,
          }}>{I.camera}<div style={{ fontSize: 10, fontWeight: 600 }}>追加</div></div>
        </div>

        {/* Weather */}
        <SectionLabel>天気</SectionLabel>
        <Card style={{ padding: 12, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {weatherOpts.map((w, i) => {
              const on = i === 0;
              return (
                <div key={w.id} style={{
                  flex: 1, padding: '10px 4px', borderRadius: 12,
                  background: on ? w.color + '22' : 'transparent',
                  border: on ? `1.5px solid ${w.color}` : `1px solid ${APP.border}`,
                  color: on ? w.color : APP.text2,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  fontSize: 11, fontWeight: 600,
                }}>
                  {w.icon}
                  {w.label}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Temperature + weather note row */}
        <Card style={{ padding: 14, marginBottom: 22, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ color: APP.accentDk }}>{I.thermo}</div>
          <div style={{ fontSize: 14, color: APP.text2 }}>気温</div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: APP.text, fontFamily: MONO }}>24.5</span>
            <span style={{ fontSize: 14, color: APP.text2, marginLeft: 4 }}>℃</span>
          </div>
        </Card>

        {/* Template (asagao) */}
        <SectionLabel action="編集">観察項目（朝顔）</SectionLabel>
        <Card style={{ padding: 0, marginBottom: 22 }}>
          {[
            { label: '草丈', value: '32.5', unit: 'cm', graph: true },
            { label: '葉の数', value: '14', unit: '枚', graph: true },
            { label: 'つぼみの数', value: '3', unit: '個', graph: true },
            { label: '開いた花の数', value: '1', unit: '個', graph: true },
          ].map((r, i, a) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', padding: '14px 16px',
              borderBottom: i < a.length - 1 ? `0.5px solid ${APP.sep}` : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                <div style={{ fontSize: 14, color: APP.text, fontWeight: 500 }}>{r.label}</div>
                {r.graph && <Pill color={APP.primary}>グラフ</Pill>}
              </div>
              <div style={{
                background: APP.bg, borderRadius: 10, padding: '6px 12px',
                fontFamily: MONO, fontSize: 15, color: APP.text, fontWeight: 700, minWidth: 72, textAlign: 'right',
              }}>{r.value}<span style={{ fontSize: 11, color: APP.text2, marginLeft: 3, fontFamily: JP }}>{r.unit}</span></div>
            </div>
          ))}
          {/* color row */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderTop: `0.5px solid ${APP.sep}` }}>
            <div style={{ fontSize: 14, color: APP.text, fontWeight: 500, flex: 1 }}>花の色</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#A270D8','#D85B8E','#5B92D8','#D8B25B','#FFFFFF'].map((c,i) => (
                <div key={c} style={{
                  width: 22, height: 22, borderRadius: 11, background: c,
                  border: i === 0 ? `2px solid ${APP.text}` : `1px solid ${APP.border}`,
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderTop: `0.5px solid ${APP.sep}` }}>
            <div style={{ fontSize: 14, color: APP.text, fontWeight: 500, flex: 1 }}>全体の様子</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { l: '元気', on: true, c: APP.primary },
                { l: '普通', on: false, c: APP.text2 },
                { l: '元気なし', on: false, c: APP.text2 },
              ].map(o => (
                <div key={o.l} style={{
                  padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                  background: o.on ? o.c : 'transparent',
                  color: o.on ? '#fff' : o.c,
                  border: o.on ? 'none' : `1px solid ${APP.border}`,
                }}>{o.l}</div>
              ))}
            </div>
          </div>
        </Card>

        {/* Memo */}
        <SectionLabel>今日のメモ</SectionLabel>
        <Card style={{ padding: 14, marginBottom: 22 }}>
          <div style={{ fontSize: 14, color: APP.text, lineHeight: 1.7 }}>
            きょう、はじめての花がさいた！むらさき色できれい。<br/>
            つるが2階のまどまでのびた。
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: APP.text3, fontFamily: MONO, textAlign: 'right' }}>52 / 500</div>
        </Card>

        {/* Stamps */}
        <SectionLabel>気分スタンプ</SectionLabel>
        <Card style={{ padding: 12, display: 'flex', gap: 6, justifyContent: 'space-between' }}>
          {stamps.map((s, i) => (
            <div key={s} style={{
              width: 40, height: 40, borderRadius: 12,
              background: i === 2 ? APP.primary + '22' : APP.bg,
              border: i === 2 ? `2px solid ${APP.primary}` : `1px solid transparent`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>{s}</div>
          ))}
        </Card>
      </div>

      {/* Sticky save bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '12px 20px 32px', background: 'rgba(250,250,246,0.95)',
        backdropFilter: 'blur(12px)', borderTop: `0.5px solid ${APP.sep}`,
      }}>
        <div style={{
          background: APP.primary, color: '#fff', textAlign: 'center',
          padding: '14px 0', borderRadius: 14, fontWeight: 700, fontSize: 16,
          boxShadow: '0 4px 14px rgba(76,175,80,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>{I.check}記録を保存（13日目）</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// S04 — 記録詳細
// ─────────────────────────────────────────────────────────────
function S04_Detail() {
  return (
    <div style={{ background: APP.bg, height: '100%', position: 'relative', overflow: 'hidden', fontFamily: JP }}>
      <AppHeader
        title="5月18日（月）"
        leading={<div style={{ color: APP.text2 }}>{I.chevL}</div>}
        trailing={<div style={{ color: APP.text2 }}>{I.edit}</div>}
        sub="朝顔1号 · 13日目"
      />

      <div style={{ height: '100%', overflow: 'auto', padding: '4px 20px 60px' }}>
        {/* Hero photo */}
        <div style={{ position: 'relative', marginBottom: 8, borderRadius: 20, overflow: 'hidden' }}>
          <PhotoSlot tone="a" w="100%" h={260} r={20} label="ASAGAO · DAY 13 · 32.5cm" stamp="🌸" />
          <div style={{
            position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 6,
          }}>
            {[1,2,3].map(n => (
              <div key={n} style={{
                width: 6, height: 6, borderRadius: 3,
                background: n === 1 ? '#fff' : 'rgba(255,255,255,0.5)',
              }} />
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
          <PhotoSlot tone="d" h={56} r={10} label="" />
          <PhotoSlot tone="b" h={56} r={10} label="" />
        </div>

        {/* Conditions */}
        <Card style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, borderRight: `1px solid ${APP.sep}` }}>
            <div style={{ color: '#F5A623' }}>{I.sun}</div>
            <div style={{ fontSize: 11, color: APP.text2, fontWeight: 600 }}>晴れ</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, borderRight: `1px solid ${APP.sep}` }}>
            <div style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: APP.text }}>24.5°</div>
            <div style={{ fontSize: 10, color: APP.text2 }}>気温</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
            <div style={{ fontSize: 22 }}>🌸</div>
            <div style={{ fontSize: 10, color: APP.text2 }}>気分</div>
          </div>
        </Card>

        {/* Observation values */}
        <SectionLabel>観察項目</SectionLabel>
        <Card style={{ padding: 0, marginBottom: 16 }}>
          {[
            { l: '草丈', v: '32.5', u: 'cm', d: '+1.2cm' },
            { l: '葉の数', v: '14', u: '枚', d: '+1枚' },
            { l: 'つぼみの数', v: '3', u: '個', d: '−1個' },
            { l: '開いた花の数', v: '1', u: '個', d: '+1個', hot: true },
          ].map((r, i, a) => (
            <div key={r.l} style={{
              display: 'flex', alignItems: 'center', padding: '14px 16px',
              borderBottom: i < a.length - 1 ? `0.5px solid ${APP.sep}` : 'none',
            }}>
              <div style={{ fontSize: 14, color: APP.text, flex: 1 }}>{r.l}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: MONO, fontSize: 17, fontWeight: 700, color: APP.text }}>{r.v}</span>
                <span style={{ fontSize: 11, color: APP.text2 }}>{r.u}</span>
              </div>
              <div style={{ marginLeft: 10, minWidth: 52, textAlign: 'right' }}>
                <Pill color={r.hot ? APP.accentDk : APP.primary} bg={r.hot ? APP.accent + '20' : APP.primary + '18'}>{r.d}</Pill>
              </div>
            </div>
          ))}
        </Card>

        {/* Memo */}
        <SectionLabel>メモ</SectionLabel>
        <Card style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, color: APP.text, lineHeight: 1.8 }}>
            きょう、はじめての花がさいた！むらさき色できれい。
            つるが2階のまどまでのびた。これからもっとたくさん咲きそう。
          </div>
        </Card>

        {/* Streak */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16,
          background: APP.accent + '15', border: `1px solid ${APP.accent}33`,
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', color: APP.accentDk,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{I.flame}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: APP.text }}>13日連続記録中！</div>
            <div style={{ fontSize: 11, color: APP.text2, marginTop: 2 }}>あと1日で「2週間連続」バッジを獲得</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// S05 — カレンダービュー
// ─────────────────────────────────────────────────────────────
function S05_Calendar() {
  // build 5/2026 weeks (Sun-start). May 1 2026 is Friday.
  const monthStart = 5; // friday offset
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = i - monthStart + 1;
    return { d: d >= 1 && d <= 31 ? d : null, idx: i };
  });
  // mark records: arr of day -> stamp/tone
  const records = {
    1:{t:'a'}, 2:{t:'a',s:'🌱'}, 3:{t:'a'}, 4:{t:'b'}, 5:{t:'b',s:'☀️'},
    6:{t:'b'}, 7:{t:'a',s:'💧'}, 8:{t:'a'}, 9:{t:'d'}, 10:{t:'d'},
    11:{t:'a',s:'🌱'}, 12:{t:'a'}, 13:{t:'d'}, 14:{t:'a'}, 15:{t:'a',s:'🌸'},
    16:{t:'a'}, 17:{t:'d'}, 18:{t:'a',s:'🌸', today: true},
  };

  return (
    <div style={{ background: APP.bg, height: '100%', position: 'relative', overflow: 'hidden', fontFamily: JP }}>
      <AppHeader
        title="朝顔1号"
        leading={<div style={{ color: APP.text2 }}>{I.chevL}</div>}
        trailing={<div style={{ color: APP.text2 }}>{I.calendar}</div>}
      />

      <div style={{ height: '100%', overflow: 'auto', padding: '4px 16px 110px' }}>
        {/* Month header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 14px' }}>
          <div style={{ color: APP.text2 }}>{I.chevL}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: APP.text }}>2026年 5月</div>
          <div style={{ color: APP.text2 }}>{I.chev}</div>
        </div>

        {/* Weekday header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 6 }}>
          {['日','月','火','水','木','金','土'].map((d, i) => (
            <div key={d} style={{
              textAlign: 'center', fontSize: 11, fontWeight: 600,
              color: i === 0 ? '#D85B8E' : i === 6 ? APP.sky : APP.text2,
            }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 18 }}>
          {days.map((day, i) => {
            const rec = day.d != null ? records[day.d] : null;
            const isToday = rec?.today;
            return (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: 10, position: 'relative',
                background: rec ? 'transparent' : 'transparent',
                border: isToday ? `2px solid ${APP.primary}` : 'none',
                overflow: 'hidden',
              }}>
                {rec ? (
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <PhotoSlot tone={rec.t} w="100%" h="100%" r={isToday ? 8 : 10} label="" />
                    <div style={{
                      position: 'absolute', top: 2, left: 4,
                      fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.95)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                    }}>{day.d}</div>
                    {rec.s && (
                      <div style={{
                        position: 'absolute', bottom: 2, right: 2, fontSize: 11,
                      }}>{rec.s}</div>
                    )}
                  </div>
                ) : day.d ? (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, color: APP.text3,
                  }}>{day.d}</div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, padding: '0 4px 14px', fontSize: 11, color: APP.text2 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: APP.primary }} /> 記録あり
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, border: `2px solid ${APP.primary}`, boxSizing: 'border-box' }} /> 今日
          </span>
        </div>

        {/* Selected day preview */}
        <Card style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
          <PhotoSlot tone="a" w={64} h={64} r={12} label="" stamp="🌸" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: APP.text2, fontWeight: 600 }}>5月18日（月）</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: APP.text, marginTop: 2 }}>はじめての花が咲いた！</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 11, color: APP.text2 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>🌡 24.5°</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>📏 32.5cm</span>
              <span>🌸 1個</span>
            </div>
          </div>
          <div style={{ color: APP.text3 }}>{I.chev}</div>
        </Card>

        {/* Month summary */}
        <Card style={{ padding: 14, display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: APP.text, fontFamily: MONO }}>18</div>
            <div style={{ fontSize: 10, color: APP.text2 }}>記録日数</div>
          </div>
          <div style={{ width: 1, background: APP.sep }} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: APP.accentDk, fontFamily: MONO }}>13</div>
            <div style={{ fontSize: 10, color: APP.text2 }}>ストリーク</div>
          </div>
          <div style={{ width: 1, background: APP.sep }} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: APP.primary, fontFamily: MONO }}>+32cm</div>
            <div style={{ fontSize: 10, color: APP.text2 }}>成長</div>
          </div>
        </Card>
      </div>

      <TabBar active="cal" />
    </div>
  );
}

Object.assign(window, { S01_Home, S02_Register, S03_Record, S04_Detail, S05_Calendar });
