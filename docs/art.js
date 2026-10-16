// キャラクターデザイン: 種族(family)ごとに固有デザインをSVGで描き、段階(進化/強化)で装飾が増える
// 各デザインは (p, lv) -> { b: 本体SVG, e: [目のx, y, 間隔] } を返す。eの間隔0は一つ目/目なし(別途描画)
const S = 'stroke="#222" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"';
const T = 'stroke="#222" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" fill="none"';
const el = (x, y, rx, ry, f) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${S}/>`;
const ci = (x, y, r, f, s = S) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${s}/>`;
const pa = (d, f) => `<path d="${d}" fill="${f}" ${S}/>`;
const ln = (d, w = 3, c = '#222') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const dots = (arr, r, f) => arr.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`).join('');
const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');

const DESIGNS = {
  // ---- 味方 ----
  '好気性細菌': (p, lv) => ({ b: el(50, 54, 38, 27, p.c) + ln('M20 40Q30 36 40 40', 3, p.l) + rep(2 + lv, i => ln(`M${30 + i * 14} 80v8`, 4)) + `<text x="50" y="36" font-size="14" text-anchor="middle" fill="${p.l}" stroke="#222" stroke-width="1">O₂</text>`, e: [50, 56, 22] }),
  'バチルス': (p, lv) => ({ b: `<rect x="8" y="34" width="84" height="40" rx="20" fill="${p.c}" ${S}/>` + el(50, 54, 16, 12, p.l) + ln('M50 46v16M42 54h16', 3, p.d) + (lv ? pa('M62 30L72 22L80 32Z', p.d) : ''), e: [28, 52, 10] }),
  'シュードモナス': (p, lv) => ({ b: pa('M12 56Q14 28 46 28Q80 26 88 52Q80 78 46 78Q14 80 12 56Z', p.c) + ln('M88 52Q98 44 96 34M88 52Q98 62 98 72', 3) + dots([[40, 70], [56, 72], [66, 62]], 4, p.a) + ci(70, 40, 5, p.l), e: [38, 50, 18] }),
  '硝化菌': (p, lv) => ({ b: ci(50, 54, 30, p.c) + `<text x="50" y="92" font-size="14" text-anchor="middle" fill="${p.d}" stroke="#fff" stroke-width="3" paint-order="stroke">NH₄</text>` + pa('M50 12Q64 28 50 36Q36 28 50 12Z', p.a) + ln('M22 40Q12 30 18 20M78 40Q88 30 82 20', 3), e: [50, 56, 22] }),
  '脱窒菌': (p, lv) => ({ b: el(44, 56, 30, 26, p.c) + rep(3 + lv, i => ci(78 + (i % 2) * 8, 20 + i * 14, 6 - i * .5, '#fff', 'stroke="#222" stroke-width="2"')) + `<rect x="72" y="46" width="16" height="10" rx="3" fill="${p.d}" ${S}/>`, e: [40, 54, 20] }),
  'リン蓄積菌': (p, lv) => ({ b: el(50, 56, 38, 30, p.c) + rep(3 + lv, i => ci(30 + i * 14, 72 - (i % 2) * 6, 6, p.a, 'stroke="#222" stroke-width="2"')) + `<text x="50" y="30" font-size="15" text-anchor="middle" fill="#fff" stroke="#222" stroke-width="1.5">P</text>`, e: [50, 52, 22] }),
  'ツリガネムシ': (p, lv) => ({ b: ln('M50 94Q34 80 52 66Q66 56 50 44', 5, '#222') + ln('M50 94Q34 80 52 66Q66 56 50 44', 2, p.l) + pa('M14 40Q14 6 50 6Q86 6 86 40Q86 46 50 46Q14 46 14 40Z', p.c) + ln('M14 40Q30 52 50 44Q70 52 86 40', 3, '#222') + rep(5, i => `<path d="M${22 + i * 14} 46v6" stroke="${p.d}" stroke-width="3" stroke-linecap="round"/>`), e: [50, 26, 26] }),
  'アメーバ': (p, lv) => ({ b: pa('M16 58Q6 34 32 28Q46 10 66 26Q94 26 86 54Q98 78 66 80Q46 92 26 78Q8 74 16 58Z', p.c) + ci(66, 62, 7, p.d, 'stroke="#222" stroke-width="2"') + dots([[28, 70], [74, 40]], 3, p.l), e: [48, 50, 22] }),
  '鞭毛虫': (p, lv) => ({ b: pa('M50 14Q84 28 78 62Q70 90 50 90Q30 90 22 62Q16 28 50 14Z', p.c) + ln('M50 14Q36 0 46 -4M50 14Q70 -2 84 8', 3) + ci(38, 70, 5, '#e33', 'stroke="#222" stroke-width="2"') + dots([[62, 72], [58, 82], [44, 82]], 3, p.a), e: [50, 46, 22] }),
  'ワムシ': (p, lv) => ({ b: pa('M50 62V90L38 96M50 90L62 96', p.d) + pa('M28 56Q26 30 50 28Q74 30 72 56Q70 76 50 78Q30 76 28 56Z', p.c) + ci(32, 22, 11, p.l) + ci(68, 22, 11, p.l) + rep(6, i => `<path d="M${22 + (i % 3) * 10 - (i > 2 ? -34 : 0)} 12l-2-6" stroke="#222" stroke-width="2.5"/>`), e: [50, 50, 18] }),
  'クマムシ': (p, lv) => ({ b: el(50, 50, 38, 28, p.c) + rep(4, i => `<rect x="${18 + i * 17}" y="68" width="11" height="20" rx="5" fill="${p.d}" ${S}/>`) + ln('M24 40Q34 34 44 40M50 36Q62 30 72 38', 3, p.d), e: [66, 48, 16] }),
  '線虫': (p, lv) => ({ b: ln('M10 74Q24 36 42 58Q58 80 72 42Q80 24 92 34', 22, '#222') + ln('M10 74Q24 36 42 58Q58 80 72 42Q80 24 92 34', 14, p.c) + ln('M22 56Q34 56 40 64M60 62Q66 50 70 44', 3, p.d), e: [0, 0, 0] , o: ci(88, 33, 5, '#fff', 'stroke="#222" stroke-width="2"') + ci(89, 34, 2.5, '#222', '') }),
  '繊毛虫': (p, lv) => ({ b: `<path d="M6 54Q8 26 50 26Q92 28 94 54Q92 78 50 78Q8 78 6 54Z" fill="${p.c}" ${S}/>` + rep(8 + lv, i => `<path d="M${14 + i * (72 / (7 + lv))} 78v7M${14 + i * (72 / (7 + lv))} 26v-6" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>`) + el(30, 54, 8, 6, p.d), e: [66, 50, 14] }),
  'カイミジンコ': (p, lv) => ({ b: pa('M10 56Q10 20 50 20Q92 22 90 56Q84 84 50 84Q14 84 10 56Z', p.c) + ln('M50 20V84M30 26Q24 50 32 80M70 26Q76 50 68 80', 2.5, p.d) + ln('M14 40Q2 34 8 20M86 40Q98 34 94 22', 3), e: [66, 56, 12] }),
  'ケンミジンコ': (p, lv) => ({ b: el(44, 48, 28, 22, p.c) + ln('M16 48Q0 40 4 24M16 52Q0 60 4 74', 3) + pa('M70 52Q86 56 92 50Q90 70 76 72Z', p.d) + ln('M70 56Q82 74 78 90M72 52Q92 62 94 80', 3) + ci(32, 60, 5, '#e84', 'stroke="#222" stroke-width="2"') + ci(48, 62, 5, '#e84', 'stroke="#222" stroke-width="2"'), e: [38, 42, 16] }),
  'クラゲ型原虫': (p, lv) => ({ b: pa('M16 50Q14 8 50 8Q86 8 84 50Z', p.c) + dots([[34, 20], [64, 24], [52, 14]], 4, p.l) + rep(5, i => ln(`M${24 + i * 13} 50Q${16 + i * 13} 68 ${26 + i * 13} 86`, 4, i % 2 ? p.a : p.d)), e: [50, 36, 26] }),
  'バクテリオファージ': (p, lv) => ({ b: pa('M50 8L76 22V44L50 58L24 44V22Z', p.c) + ln('M50 8V58M24 22L50 36L76 22', 2.5, p.d) + `<rect x="44" y="58" width="12" height="18" fill="${p.l}" ${S}/>` + ln('M44 76L26 94M56 76L74 94M50 76V96', 3) + ln('M26 94l-6 2M74 94l6 2', 3), e: [50, 30, 22] }),
  'フロック形成菌': (p, lv) => ({ b: rep(3, i => ci(26 + i * 24, 64, 18, p.c)) + rep(2, i => ci(38 + i * 24, 44, 18, p.l)) + ci(50, 28, 16, p.c), e: [50, 36, 18] }),
  'メタン菌': (p, lv) => ({ b: ci(48, 58, 30, p.c) + rep(3, i => ci(74 + i * 6, 38 - i * 14, 5 - i, '#fff', 'stroke="#222" stroke-width="2"')) + `<text x="48" y="90" font-size="13" text-anchor="middle" fill="${p.d}" stroke="#fff" stroke-width="3" paint-order="stroke">CH₄</text>`, e: [48, 54, 20] }),
  '藻類': (p, lv) => ({ b: pa('M50 92Q8 72 14 40Q22 8 50 12Q78 8 86 40Q92 72 50 92Z', p.c) + ln('M50 22V84M50 40L30 28M50 56L72 42M50 70L34 62', 3, p.d) + ci(50, 14, 5, '#ffe14a', 'stroke="#222" stroke-width="2"'), e: [50, 52, 28] }),

  // ---- 敵 ----
  '浮遊細菌': (p) => ({ b: ci(50, 52, 32, p.c) + ln('M20 30Q10 20 16 12M80 30Q90 20 84 12', 3) + dots([[66, 70], [34, 72]], 4, p.l), e: [50, 52, 20] }),
  '大腸菌': (p, lv) => ({ b: `<rect x="8" y="32" width="84" height="42" rx="21" fill="${p.c}" ${S}/>` + rep(7, i => ln(`M${18 + i * 11} ${i % 2 ? 74 : 32}v${i % 2 ? 10 : -10}`, 3)) + ci(80, 53, 5, p.d), e: [34, 52, 12] }),
  '細菌群': (p) => ({ b: ci(30, 62, 20, p.c) + ci(66, 62, 20, p.l) + ci(48, 36, 20, p.c) + ci(78, 34, 11, p.d) + ci(20, 36, 10, p.d), e: [48, 38, 12] }),
  '小型鞭毛虫': (p) => ({ b: pa('M22 62Q22 30 54 32Q82 34 82 62Q82 86 52 84Q22 86 22 62Z', p.c) + ln('M24 48Q6 36 12 18Q16 8 26 12', 3), e: [56, 56, 14] }),
  'ファージ': (p) => ({ b: pa('M50 6L80 24V50L50 66L20 50V24Z', p.c) + ln('M50 6L50 66M20 24L80 50M80 24L20 50', 2, p.d) + ln('M50 66V82M50 82L26 96M50 82L74 96M50 82L38 98M50 82L62 98', 3), e: [50, 38, 22] }),
  '糸状菌': (p) => ({ b: ln('M6 70Q22 30 36 66Q50 100 64 40Q76 6 94 30', 14, '#222') + ln('M6 70Q22 30 36 66Q50 100 64 40Q76 6 94 30', 8, p.c) + rep(6, i => ln(`M${14 + i * 14} ${48 + (i % 2) * 20}v6`, 2, p.d)), e: [0, 0, 0], o: '' }),
  'スフェロチルス': (p) => ({ b: ln('M10 80Q30 70 50 60T90 40', 12, '#222') + ln('M10 80Q30 70 50 60T90 40', 7, p.c) + rep(5, i => ci(22 + i * 16, 74 - i * 8, 10, p.l)) + ln('M20 30Q30 10 42 28', 3), e: [0, 0, 0], o: ci(90, 38, 6, '#fff', 'stroke="#222" stroke-width="2"') }),
  'チオスリックス': (p) => ({ b: rep(7, i => `<rect x="${8 + i * 12}" y="${40 + (i % 2) * 6}" width="12" height="24" rx="3" fill="${i % 2 ? p.c : p.l}" ${S} stroke-width="3"/>`) + ci(88, 52, 4, p.d), e: [0, 0, 0], o: ci(48, 52, 4, '#fff', 'stroke="#222" stroke-width="2"') }),
  'ミクロスリックス': (p) => ({ b: rep(3, i => ln(`M${14 + i * 30} 90Q${4 + i * 30} 60 ${24 + i * 30} 40Q${34 + i * 30} 22 ${22 + i * 30} 8`, 5, p.c)) + el(50, 78, 26, 12, p.d), e: [50, 78, 14] }),
  'ノカルディア': (p) => ({ b: el(50, 56, 34, 28, p.c) + rep(7, i => ln(`M${22 + i * 9} 30l${i % 2 ? -4 : 4} -12`, 3, p.d)) + ln('M30 70Q50 82 70 70', 3, p.d), e: [50, 54, 20] }),
  'ゴルドニア': (p) => ({ b: `<rect x="14" y="24" width="72" height="56" rx="14" fill="${p.c}" ${S}/>` + ln('M22 40h56M22 54h56M22 68h56', 2, p.d) + ci(14, 52, 6, p.l) + ci(86, 52, 6, p.l), e: [50, 50, 20] }),
  '油脂分解菌': (p) => ({ b: pa('M50 8Q86 48 80 68Q74 90 50 90Q26 90 20 68Q14 48 50 8Z', p.c) + ci(40, 56, 8, p.l, 'stroke="#222" stroke-width="2"') + ci(62, 72, 6, p.l, 'stroke="#222" stroke-width="2"'), e: [50, 50, 18] }),
  '嫌気性菌': (p) => ({ b: ci(50, 56, 32, p.c) + pa('M26 38Q50 6 74 38Q50 26 26 38Z', p.d) + ln('M24 60Q10 70 14 84M76 60Q90 70 86 84', 3), e: [50, 56, 20] }),
  '耐性菌': (p) => ({ b: ci(50, 54, 32, p.c) + rep(10, i => { const a = i * Math.PI / 5; return pa(`M${50 + 32 * Math.cos(a - .15)} ${54 + 32 * Math.sin(a - .15)}L${50 + 46 * Math.cos(a)} ${54 + 46 * Math.sin(a)}L${50 + 32 * Math.cos(a + .15)} ${54 + 32 * Math.sin(a + .15)}Z`, p.d); }), e: [50, 54, 20] }),
  '付着細菌': (p) => ({ b: `<rect x="6" y="82" width="88" height="10" rx="3" fill="${p.d}" ${S}/>` + pa('M16 82Q16 30 50 30Q84 30 84 82Z', p.c) + ln('M30 82v8M50 82v8M70 82v8', 3), e: [50, 58, 20] }),
  '硫黄細菌': (p) => ({ b: el(50, 54, 36, 28, p.c) + rep(6, i => ci(26 + (i % 3) * 24, 44 + Math.floor(i / 3) * 18, 6, '#fff', 'stroke="#222" stroke-width="2"')), e: [50, 36, 18] }),
  '鉄細菌': (p) => ({ b: pa('M10 46Q10 22 30 22H70Q90 22 90 46V62Q90 80 70 80H30Q10 80 10 62Z', p.c) + dots([[24, 70], [76, 68], [30, 34]], 3, p.d) + ln('M10 46h80', 2, p.d), e: [50, 52, 22] }),
  '酵母': (p) => ({ b: ci(40, 58, 28, p.c) + ci(74, 36, 16, p.l) + ci(78, 74, 9, p.c) + ci(40, 58, 8, p.d, 'stroke="#222" stroke-width="2"'), e: [38, 46, 16] }),
  'カビ': (p) => ({ b: rep(6, i => ln(`M50 90L${10 + i * 16} ${30 + (i % 2) * 14}`, 4, p.d)) + rep(6, i => ci(10 + i * 16, 30 + (i % 2) * 14, 9, i % 2 ? p.c : p.l)) + el(50, 78, 18, 12, p.c), e: [50, 78, 12] }),
  '放線菌': (p) => ({ b: ci(50, 54, 22, p.c) + rep(8, i => { const a = i * Math.PI / 4; return ln(`M${50 + 22 * Math.cos(a)} ${54 + 22 * Math.sin(a)}L${50 + 42 * Math.cos(a)} ${54 + 42 * Math.sin(a)}`, 5, p.d) + ci(50 + 42 * Math.cos(a), 54 + 42 * Math.sin(a), 4, p.l, 'stroke="#222" stroke-width="2"'); }), e: [50, 54, 14] }),
  '原虫シスト': (p) => ({ b: ci(50, 54, 38, p.d) + ci(50, 54, 28, p.c) + ln('M24 40Q50 20 76 40M24 70Q50 90 76 70', 2, p.l), e: [50, 54, 16] }),
  'ヒドラ': (p) => ({ b: `<rect x="40" y="38" width="20" height="56" rx="10" fill="${p.c}" ${S}/>` + rep(5, i => ln(`M${42 + i * 4} 38Q${14 + i * 18} ${28 - (i % 2) * 14} ${8 + i * 21} ${16 + (i % 2) * 10}`, 4, p.d)) + el(50, 40, 14, 10, p.c), e: [50, 62, 8] }),
  'ミジンコ': (p) => ({ b: pa('M16 58Q14 22 52 22Q86 24 86 56Q80 84 48 82Q18 80 16 58Z', p.c) + pa('M52 22Q70 10 88 20Q90 36 80 40', p.d) + ln('M30 82v8M50 84v8M68 80v8', 3) + ci(68, 42, 6, '#222'), e: [0, 0, 0], o: ci(66, 44, 8, '#fff', 'stroke="#222" stroke-width="2"') + ci(68, 45, 4, '#222', '') }),
  'スカムの子': (p) => ({ b: pa('M10 70Q8 40 28 38Q36 20 54 28Q74 20 82 42Q96 56 88 72Q70 84 50 78Q26 86 10 70Z', p.c) + dots([[30, 56], [56, 44], [70, 62], [40, 70]], 5, p.l), e: [50, 54, 22] }),
  '膜付着菌': (p) => ({ b: `<rect x="4" y="46" width="92" height="12" rx="3" fill="${p.d}" ${S}/>` + rep(3, i => el(24 + i * 26, 34, 12, 14, p.c)) + rep(3, i => ln(`M${24 + i * 26} 58v8`, 4)), e: [50, 34, 52] }),
};
// 味方と共通の種族名の敵は、味方デザインを暗色で描く
const ART_ALLY_FALLBACK = { '線虫': 1, 'アメーバ': 1, '鞭毛虫': 1, 'ワムシ': 1, 'クマムシ': 1 };
// 色相(種族ごとの固定色)
const ART_HUE = {
  '好気性細菌': 200, 'バチルス': 30, 'シュードモナス': 150, '硝化菌': 280, '脱窒菌': 175, 'リン蓄積菌': 48, 'ツリガネムシ': 320, 'アメーバ': 100, '鞭毛虫': 60,
  'ワムシ': 340, 'クマムシ': 25, '線虫': 15, '繊毛虫': 235, 'カイミジンコ': 190, 'ケンミジンコ': 8, 'クラゲ型原虫': 300, 'バクテリオファージ': 255, 'フロック形成菌': 40, 'メタン菌': 130, '藻類': 120,
  '浮遊細菌': 90, '大腸菌': 20, '細菌群': 330, '小型鞭毛虫': 70, 'ファージ': 260, '糸状菌': 45, 'スフェロチルス': 195, 'チオスリックス': 55, 'ミクロスリックス': 160,
  'ノカルディア': 20, 'ゴルドニア': 35, '油脂分解菌': 48, '嫌気性菌': 270, '耐性菌': 350, '付着細菌': 15, '硫黄細菌': 58, '鉄細菌': 8, '酵母': 38, 'カビ': 140, '放線菌': 110,
  '原虫シスト': 210, 'ヒドラ': 170, 'ミジンコ': 5, 'スカムの子': 75, '膜付着菌': 300,
};
function artLevel(c) {
  const m = { '基本': 0, '進化1': 1, '進化2': 2, '通常': 0, '強化': 1, '変異': 2, '上位': 3, 'エリート': 4 };
  return m[c.stage || c.tier] || 0;
}
const artCache = {};
function artSvg(c, enemy, boss) {
  const key = c.id + (enemy ? 'e' : 'a') + (boss ? 'b' : '');
  if (artCache[key]) return artCache[key];
  const fam = c.family, lv = artLevel(c);
  const hue = ART_HUE[fam] != null ? ART_HUE[fam] : 180;
  const shared = !!ART_ALLY_FALLBACK[fam];
  const dk = enemy && shared;
  const p = dk
    ? { c: `hsl(${(hue + 160) % 360},45%,42%)`, d: `hsl(${(hue + 160) % 360},45%,20%)`, l: `hsl(${(hue + 160) % 360},50%,65%)`, a: `hsl(${(hue + 200) % 360},60%,60%)` }
    : { c: `hsl(${hue},62%,${58 + (lv > 1 ? 4 : 0)}%)`, d: `hsl(${hue},58%,30%)`, l: `hsl(${hue},80%,82%)`, a: `hsl(${(hue + 50) % 360},75%,62%)` };
  const d = (DESIGNS[fam] || DESIGNS['アメーバ'])(p, lv);
  let face = '';
  const [ex, ey, sp] = d.e;
  if (sp) {
    const l = ex - sp / 2, r = ex + sp / 2, er = sp < 14 ? 5.5 : 7;
    face = `<circle cx="${l}" cy="${ey}" r="${er}" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="${r}" cy="${ey}" r="${er}" fill="#fff" stroke="#222" stroke-width="2"/>`
      + `<circle cx="${l + 1}" cy="${ey + 1}" r="${er / 2}" fill="#222"/><circle cx="${r + 1}" cy="${ey + 1}" r="${er / 2}" fill="#222"/>`
      + (enemy ? `<path d="M${l - er - 1} ${ey - er - 5}L${l + er} ${ey - er + 1}M${r + er + 1} ${ey - er - 5}L${r - er} ${ey - er + 1}" stroke="#222" stroke-width="3" stroke-linecap="round"/><path d="M${ex - 6} ${ey + er + 10}Q${ex} ${ey + er + 4} ${ex + 6} ${ey + er + 10}" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round"/>`
        : `<path d="M${ex - 6} ${ey + er + 3}Q${ex} ${ey + er + 10} ${ex + 6} ${ey + er + 3}" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round"/>`);
  } else if (d.o) face = d.o;
  // 段階ごとの装飾(種族ごとに固有の色・位置)
  const gold = '#ffd800';
  let deco = '';
  if (lv >= 1) deco += dots([[22, 22], [78, 20]], 4, gold) + `<path d="M${14 + (hue % 20)} 12l4 8" stroke="${p.a}" stroke-width="4" stroke-linecap="round"/>`;
  if (lv >= 2) deco += `<path d="M34 18L38 4L50 12L62 4L66 18Z" fill="${gold}" stroke="#222" stroke-width="3" stroke-linejoin="round"/>`;
  if (lv >= 3) deco += `<circle cx="50" cy="50" r="47" fill="none" stroke="${p.a}" stroke-width="3" stroke-dasharray="6 6"/>`;
  if (lv >= 4 || boss) deco += `<path d="M8 20l5 10 10-5-5 10 10 5-10 4 3 11-10-6-6 10-3-11-11 2 8-8z" fill="${gold}" opacity=".8" transform="scale(.5) translate(6 0)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${d.b}${face}${deco}</svg>`;
  return artCache[key] = svg;
}
const artImgs = {};
function artImg(c, enemy, boss) {
  const k = c.id + (enemy ? 'e' : 'a') + (boss ? 'b' : '');
  if (!artImgs[k]) { const i = new Image(); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(artSvg(c, enemy, boss)); artImgs[k] = i; }
  return artImgs[k];
}
