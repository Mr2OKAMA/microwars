// キャラクターデザイン: 名前の元になった微生物を 32x32 のドット絵で描く(Canvasで生成)
// 種族(family)ごとに固有の形(桿菌・球菌・ツリガネムシ・アメーバ・ミジンコ…)を持ち、
// 段階(進化/強化)が上がるほど斑点・王冠・オーラが増える。敵は暗い配色+怒り目で描く。
const ART_N = 32;
const ART_ALLY_FALLBACK = { '線虫': 1, 'アメーバ': 1, '鞭毛虫': 1, 'ワムシ': 1, 'クマムシ': 1 };
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

// 種族 -> [形状, バリエーション]
const ART_SHAPE = {
  '好気性細菌': ['rod', 0], 'バチルス': ['rod', 1], 'シュードモナス': ['rod', 2], '硝化菌': ['spiral', 0], '脱窒菌': ['rod', 3],
  'リン蓄積菌': ['coccus', 1], 'ツリガネムシ': ['bell', 0], 'アメーバ': ['amoeba', 0], '鞭毛虫': ['flag', 0], 'ワムシ': ['rotifer', 0],
  'クマムシ': ['tardi', 0], '線虫': ['worm', 0], '繊毛虫': ['ciliate', 0], 'カイミジンコ': ['daphnia', 0], 'ケンミジンコ': ['copepod', 0],
  'クラゲ型原虫': ['jelly', 0], 'バクテリオファージ': ['phage', 0], 'フロック形成菌': ['floc', 0], 'メタン菌': ['coccus', 2], '藻類': ['alga', 0],
  '浮遊細菌': ['coccus', 0], '大腸菌': ['rod', 4], '細菌群': ['floc', 1], '小型鞭毛虫': ['flag', 1], 'ファージ': ['phage', 1],
  '糸状菌': ['filament', 0], 'スフェロチルス': ['filament', 1], 'チオスリックス': ['filament', 2], 'ミクロスリックス': ['filament', 3],
  'ノカルディア': ['actino', 0], 'ゴルドニア': ['actino', 1], '油脂分解菌': ['rod', 5], '嫌気性菌': ['spiral', 1], '耐性菌': ['coccus', 3],
  '付着細菌': ['biofilm', 0], '硫黄細菌': ['coccus', 4], '鉄細菌': ['rod', 6], '酵母': ['yeast', 0], 'カビ': ['mold', 0], '放線菌': ['actino', 2],
  '原虫シスト': ['cyst', 0], 'ヒドラ': ['hydra', 0], 'ミジンコ': ['daphnia', 1], 'スカムの子': ['amoeba', 1], '膜付着菌': ['biofilm', 1],
};
function artDraw(shape, v, g, p, t) {
  const px = (x, y, c = p.c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  const rc = (x, y, w, h, c = p.c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const disc = (cx, cy, rx, ry, c = p.c, shade = true) => {
    for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if ((x * x) / (rx * rx + .3) + (y * y) / (ry * ry + .3) <= 1) {
      px(cx + x, cy + y, shade && (x + y > (rx + ry) * 0.45) ? p.d : shade && (x + y < -(rx + ry) * 0.5) ? p.l : c);
    }
  };
  const line = (x0, y0, x1, y1, c = p.d) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) px(x0 + (x1 - x0) * i / (n || 1), y0 + (y1 - y0) * i / (n || 1), c); };
  const spots = (arr, c = p.d) => arr.forEach(([x, y]) => px(x, y, c));
  let eye = [16, 15, 5];
  switch (shape) {
    case 'rod': { // 桿菌: カプセル型+鞭毛
      const len = [10, 11, 9, 11, 8, 12, 9][v], hh = [5, 4, 5, 5, 4, 4, 6][v];
      rc(16 - len, 16 - hh, len * 2, hh * 2 + 1); disc(16 - len, 16, hh, hh); disc(16 + len, 16, hh, hh);
      rc(16 - len, 16 + hh - 2, len * 2, 3, p.d); rc(16 - len, 16 - hh, len * 2, 2, p.l);
      if (v === 1) { disc(16 + 5, 16, 3, 3, p.a, false); }
      if (v === 3 || v === 6) spots([[10, 13], [22, 18], [14, 19], [19, 12]], p.l);
      if (v === 5) spots([[9, 14], [12, 19], [21, 13], [23, 18]], p.a);
      for (let i = 0; i < 3; i++) { px(3 - i, 14 + i * 2 + (i % 2), p.d); px(2 - i, 14 + i * 2 + (i % 2), p.d); }
      eye = [16, 15, 6]; break;
    }
    case 'coccus': { // 球菌
      const r = [9, 8, 6, 9, 7][v];
      if (v === 2) { disc(10, 20, r, r); disc(21, 20, r, r); disc(16, 10, r, r); eye = [16, 11, 4]; }
      else { disc(16, 17, r, r); eye = [16, 16, 6]; if (v === 4) spots([[11, 21], [20, 22], [14, 23], [22, 14]], p.a); if (v === 3) { for (let a = 0; a < 8; a++) px(16 + Math.cos(a * .785) * (r + 2), 17 + Math.sin(a * .785) * (r + 2), p.a); } if (v === 1) spots([[11, 12], [22, 12], [12, 22], [21, 22]], p.a); }
      break;
    }
    case 'spiral': { // らせん菌
      for (let x = 3; x <= 28; x++) { const y = 16 + Math.sin(x * (v ? 0.6 : 0.5)) * 6; rc(x, Math.round(y) - 2, 1, 5, x % 4 < 2 ? p.c : p.d); }
      eye = [16, 16, 0]; break;
    }
    case 'bell': { // ツリガネムシ
      for (let y = 4; y < 18; y++) { const w = 4 + Math.sin((y - 4) / 13 * 1.6) * 9; rc(Math.round(16 - w), y, Math.round(w * 2), 1, y > 14 ? p.d : y < 7 ? p.l : p.c); }
      rc(7, 17, 18, 2, p.a); for (let i = 0; i < 7; i++) px(8 + i * 2.6, 3, p.l);
      for (let y = 19; y < 30; y++) px(16 + Math.sin(y * 0.9) * 2.5, y, p.d), px(17 + Math.sin(y * 0.9) * 2.5, y, p.d);
      eye = [16, 11, 6]; break;
    }
    case 'amoeba': { // アメーバ
      disc(16, 17, 10, 8);
      disc(7, 12, 4, 3); disc(25, 22, 4, 3); disc(8, 24, 3, 3); disc(24, 10, 3, 3);
      if (v === 1) { spots([[12, 24], [18, 25], [22, 14]], p.l); }
      disc(19, 19, 3, 3, p.a, false); eye = [15, 14, 6]; break;
    }
    case 'flag': { // 鞭毛虫: 洋梨形+長い鞭毛
      disc(18, 17, 9, 7); disc(24, 17, 5, 5);
      for (let x = 0; x < 11; x++) px(10 - x, 16 + Math.sin(x * .8) * 3, p.d), px(10 - x, 17 + Math.sin(x * .8) * 3, p.d);
      disc(20, 20, 2, 2, p.a, false); if (v) px(14, 12, p.l);
      eye = [19, 14, 5]; break;
    }
    case 'rotifer': { // ワムシ
      disc(16, 19, 7, 8); rc(13, 26, 6, 4, p.d); rc(12, 29, 3, 2, p.d); rc(17, 29, 3, 2, p.d);
      rc(7, 8, 18, 3, p.a); for (let i = 0; i < 9; i++) { px(7 + i * 2, 6 + (i % 2), p.l); px(7 + i * 2, 5, p.d); }
      eye = [16, 16, 5]; break;
    }
    case 'tardi': { // クマムシ
      disc(16, 16, 11, 8);
      for (let i = 0; i < 4; i++) { rc(7 + i * 5 + (i > 1 ? 2 : 0), 22, 3, 6, p.d); rc(6 + i * 5 + (i > 1 ? 2 : 0), 27, 5, 2, p.d); }
      for (let i = 0; i < 4; i++) rc(8 + i * 5, 10, 1, 12, p.d);
      px(5, 15, p.d); px(4, 16, p.d); eye = [10, 14, 4]; break;
    }
    case 'worm': { // 線虫
      for (let x = 3; x < 29; x++) { const y = 16 + Math.sin(x * 0.45) * 6; disc(x, Math.round(y), 2, 2, x % 5 < 2 ? p.l : p.c, false); }
      eye = [28, 16 + Math.sin(28 * 0.45) * 6 - 1, 0]; break;
    }
    case 'ciliate': { // ゾウリムシ
      disc(16, 16, 13, 7); for (let a = 0; a < 20; a++) { const x = 5 + a * 1.1; px(x, 8, p.d); px(x, 24, p.d); }
      disc(18, 17, 3, 3, p.a, false); disc(11, 16, 2, 2, p.d, false); if (v === 0) px(24, 14, p.l);
      eye = [22, 14, 4]; break;
    }
    case 'daphnia': { // ミジンコ
      disc(15, 18, 9, 8); disc(24, 13, 5, 5);
      rc(14, 13, 1, 10, p.d); for (let i = 0; i < 5; i++) px(8 + i * 2, 24 + (i % 2), p.d);
      line(26, 8, 30, 3); line(27, 9, 31, 7); line(6, 20, 1, 24); disc(14, 19, 3, 3, p.a, false);
      eye = [24, 13, 0]; break;
    }
    case 'copepod': { // ケンミジンコ
      disc(14, 16, 8, 6); disc(22, 15, 4, 4); rc(4, 15, 4, 3, p.d);
      line(25, 12, 31, 5); line(25, 13, 31, 9); line(1, 12, 5, 16); line(1, 20, 5, 17);
      rc(26, 16, 0, 0); line(7, 19, 3, 25); line(10, 21, 7, 26); disc(12, 17, 2, 2, p.a, false);
      eye = [21, 14, 0]; break;
    }
    case 'jelly': { // クラゲ
      disc(16, 13, 11, 9); rc(5, 14, 22, 5, p.c); rc(4, 19, 24, 2, p.a);
      for (let i = 0; i < 6; i++) for (let y = 21; y < 29; y++) px(6 + i * 4 + Math.sin(y + i) * 1.2, y, i % 2 ? p.d : p.l);
      eye = [16, 12, 7]; break;
    }
    case 'hydra': { // ヒドラ
      rc(14, 14, 5, 15, p.c); rc(12, 27, 9, 3, p.d); disc(16, 11, 6, 5);
      for (let i = 0; i < 6; i++) { const a = -2.6 + i * 0.5; line(16, 10, 16 + Math.cos(a) * 14, 8 + Math.sin(a) * 9 + 6, i % 2 ? p.d : p.a); }
      eye = [16, 11, 4]; break;
    }
    case 'phage': { // バクテリオファージ
      const h = v ? 6 : 7; for (let y = 3; y < 3 + h * 2; y++) { const w = h - Math.abs(y - (3 + h)) * 0.5; rc(Math.round(16 - w), y, Math.round(w * 2), 1, y > 3 + h ? p.d : p.c); }
      rc(15, 3 + h * 2, 3, 8, p.a); for (let i = 0; i < 4; i++) { rc(15, 17 + i * 2, 3, 1, p.l); }
      rc(11, 26, 11, 2, p.d); line(11, 27, 5, 31); line(21, 27, 27, 31); line(14, 28, 12, 31); line(18, 28, 20, 31);
      eye = [16, 10, 4]; break;
    }
    case 'floc': { // フロック(塊)
      const ds = v ? [[10, 20, 5], [21, 19, 6], [15, 11, 5], [24, 11, 3], [6, 12, 3]] : [[9, 21, 6], [22, 20, 6], [15, 12, 7], [26, 11, 3], [5, 12, 3]];
      ds.forEach(([x, y, r]) => disc(x, y, r, r)); spots([[12, 22], [20, 18], [14, 10]], p.l); eye = [16, 13, 6]; break;
    }
    case 'alga': { // 藻類(緑の細胞)
      disc(16, 16, 11, 11); disc(11, 12, 3, 3, p.a, false); disc(21, 20, 3, 3, p.a, false); disc(22, 10, 2, 2, p.a, false);
      line(16, 5, 16, 27, p.d); eye = [16, 16, 8]; break;
    }
    case 'filament': { // 糸状菌
      const n = [9, 7, 8, 11][v]; for (let i = 0; i < n; i++) { const x = 3 + i * (26 / n), y = 16 + Math.sin(i * (v + 1) * .5) * 6; rc(Math.round(x), Math.round(y) - 3, Math.ceil(26 / n) - 1, 7, i % 2 ? p.c : p.l); rc(Math.round(x), Math.round(y) + 2, Math.ceil(26 / n) - 1, 2, p.d); }
      eye = [3 + (n - 1) * 26 / n + 1, 16 + Math.sin((n - 1) * (v + 1) * .5) * 6 - 1, 0]; if (v === 2) spots([[10, 10], [18, 22]], p.a); break;
    }
    case 'actino': { // 放線菌(放射状の菌糸)
      disc(16, 16, 6, 6); for (let a = 0; a < 10; a++) { const r = a * .628; line(16 + Math.cos(r) * 6, 16 + Math.sin(r) * 6, 16 + Math.cos(r) * (v === 1 ? 11 : 14), 16 + Math.sin(r) * (v === 1 ? 11 : 14), a % 2 ? p.d : p.a); }
      eye = [16, 15, 4]; break;
    }
    case 'yeast': { // 酵母(出芽)
      disc(13, 18, 8, 8); disc(24, 10, 5, 5); disc(24, 25, 3, 3); px(18, 14, p.l); eye = [13, 17, 5]; break;
    }
    case 'mold': { // カビ
      disc(16, 20, 9, 7); for (let i = 0; i < 5; i++) { const x = 7 + i * 4.5; line(x, 15, x + (i - 2) * 1.2, 6 + (i % 2) * 3, p.d); disc(Math.round(x + (i - 2) * 1.2), 6 + (i % 2) * 3, 2, 2, p.a, false); }
      eye = [16, 20, 5]; break;
    }
    case 'cyst': { // シスト(厚い殻)
      disc(16, 16, 12, 12, p.d, false); disc(16, 16, 9, 9); disc(16, 16, 4, 4, p.a, false); eye = [16, 16, 0]; break;
    }
    case 'biofilm': { // バイオフィルム
      rc(3, 20, 26, 6, p.d); for (let i = 0; i < 5; i++) disc(6 + i * 5, 17, 3, 4); rc(3, 19, 26, 2, p.c); spots([[8, 22], [15, 23], [22, 22]], p.l);
      eye = [16, 16, 6]; break;
    }
    default: disc(16, 16, 10, 10); eye = [16, 16, 5];
  }
  return eye;
}
const artCache = {};
function artCanvas(c, enemy, boss) {
  const key = c.id + (enemy ? 'e' : 'a') + (boss ? 'b' : '');
  if (artCache[key]) return artCache[key];
  const fam = c.family, lv = artLevel(c), N = ART_N;
  const hue = ART_HUE[fam] != null ? ART_HUE[fam] : 180;
  const dk = enemy && !!ART_ALLY_FALLBACK[fam];
  const h = dk ? (hue + 160) % 360 : hue;
  const p = enemy
    ? { c: `hsl(${h},${dk ? 45 : 55}%,${dk ? 42 : 46}%)`, d: `hsl(${h},50%,24%)`, l: `hsl(${h},55%,66%)`, a: `hsl(${(h + 50) % 360},70%,52%)` }
    : { c: `hsl(${h},62%,${58 + (lv > 1 ? 4 : 0)}%)`, d: `hsl(${h},58%,34%)`, l: `hsl(${h},80%,82%)`, a: `hsl(${(h + 50) % 360},75%,62%)` };
  const cv = document.createElement('canvas'); cv.width = cv.height = N;
  const g = cv.getContext('2d');
  const [shape, v] = ART_SHAPE[fam] || ['amoeba', 0];
  const [ex, ey, sp] = artDraw(shape, v, g, p, lv);
  // 段階装飾(斑点)
  const px = (x, y, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  // 輪郭(不透明ピクセルに接する透明ピクセルを暗色で縁取る)
  const outline = () => {
    const im = g.getImageData(0, 0, N, N), d = im.data, o = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (d[(y * N + x) * 4 + 3]) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < N && yy < N && d[(yy * N + xx) * 4 + 3]) { o.push([x, y]); break; } }
    }
    g.fillStyle = '#1a1020'; o.forEach(([x, y]) => g.fillRect(x, y, 1, 1));
  };
  outline();
  // 目(白目+黒目)
  const eyeAt = (x, y) => { x = Math.round(x); y = Math.round(y); g.fillStyle = '#fff'; g.fillRect(x - 1, y - 1, 3, 3); g.fillStyle = '#111'; g.fillRect(x, y, 2, 2); };
  if (sp) { eyeAt(ex - sp / 2, ey); eyeAt(ex + sp / 2, ey); } else eyeAt(ex, ey);
  if (enemy) { const l = sp ? ex - sp / 2 : ex - 1, r = sp ? ex + sp / 2 : ex + 1; px(l - 2, ey - 3, '#111'); px(l - 1, ey - 3, '#111'); px(l, ey - 2, '#111'); px(r + 2, ey - 3, '#111'); px(r + 1, ey - 3, '#111'); px(r, ey - 2, '#111'); }
  else px(ex, ey + 4, '#c33');
  const gold = '#ffd800';
  if (lv >= 1) { px(3, 3, gold); px(4, 3, gold); px(3, 4, gold); px(28, 5, gold); px(27, 5, gold); px(28, 4, gold); }
  if (lv >= 2) { g.fillStyle = gold; g.fillRect(12, 1, 9, 2); [12, 16, 20].forEach(x => g.fillRect(x, 0, 1, 1)); g.fillStyle = '#c33'; g.fillRect(16, 1, 1, 1); }
  if (lv >= 3) { g.fillStyle = p.a; for (let a = 0; a < 16; a++) g.fillRect(Math.round(16 + Math.cos(a * .3927) * 15.5), Math.round(16 + Math.sin(a * .3927) * 15.5), 1, 1); }
  if (lv >= 4 || boss) { g.fillStyle = gold; [[2, 28], [29, 27], [4, 14], [28, 14]].forEach(([x, y]) => { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); }); }
  return artCache[key] = cv;
}
function artSvg(c, enemy, boss) {
  return `<img class="pix" alt="" src="${artCanvas(c, enemy, boss).toDataURL()}">`;
}
const artImgs = {};
function artImg(c, enemy, boss) {
  const k = c.id + (enemy ? 'e' : 'a') + (boss ? 'b' : '');
  if (!artImgs[k]) { const i = new Image(); i.src = artCanvas(c, enemy, boss).toDataURL(); artImgs[k] = i; }
  return artImgs[k];
}
