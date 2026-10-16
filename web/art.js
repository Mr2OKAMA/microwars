// キャラクターデザイン: 種族ごとの体形をSVGで手続き生成
const ART_SHAPES = [
  ['ファージ', 'phage'], ['ツリガネ', 'bell'], ['クラゲ', 'jelly'], ['ヒドラ', 'jelly'],
  ['クマムシ', 'tardi'], ['ミジンコ', 'crust'], ['線虫', 'worm'], ['糸状', 'worm'], ['スリックス', 'worm'],
  ['スフェロチルス', 'worm'], ['放線', 'worm'], ['カビ', 'worm'], ['ワムシ', 'rotifer'],
  ['アメーバ', 'amoeba'], ['シスト', 'amoeba'], ['スカム', 'amoeba'], ['膜', 'amoeba'], ['フロック', 'amoeba'],
  ['鞭毛', 'flag'], ['繊毛', 'cili'], ['藻', 'algae'], ['酵母', 'yeast'],
  ['バチルス', 'rod'], ['大腸', 'rod'], ['菌', 'rod'], ['細菌', 'coccus'],
];
const ART_FALLBACK = ['coccus', 'rod', 'amoeba'];
function artShape(fam) {
  for (const [k, s] of ART_SHAPES) if (fam.includes(k)) return s;
  let h = 0; for (const c of fam) h = (h * 31 + c.charCodeAt(0)) % 997;
  return ART_FALLBACK[h % 3];
}
function artHue(fam) { let h = 0; for (const c of fam) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
// level: 0=基本/通常 1=進化1/強化 2=進化2/変異 3=上位 4=エリート
function artLevel(c) {
  const m = { '基本': 0, '進化1': 1, '進化2': 2, '通常': 0, '強化': 1, '変異': 2, '上位': 3, 'エリート': 4 };
  return m[c.stage || c.tier] || 0;
}
const artCache = {};
function artSvg(c, enemy, boss) {
  const key = c.id + (enemy ? 'e' : 'a') + (boss ? 'b' : '');
  if (artCache[key]) return artCache[key];
  const fam = c.family, shape = artShape(fam), lv = artLevel(c);
  const hue = (artHue(fam) + (enemy ? 180 : 0)) % 360;
  const fill = `hsl(${hue},65%,${55 + (lv > 1 ? 5 : 0)}%)`, dark = `hsl(${hue},60%,28%)`, light = `hsl(${hue},80%,80%)`;
  const S = `stroke="#222" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
  let b = '', ey = 52, ex = 18;
  switch (shape) {
    case 'rod': b = `<rect x="14" y="30" width="72" height="44" rx="22" fill="${fill}" ${S}/><path d="M24 24l-6-8M50 22v-9M76 24l6-8" ${S} fill="none"/>`; ey = 52; break;
    case 'coccus': b = `<circle cx="50" cy="52" r="34" fill="${fill}" ${S}/><circle cx="68" cy="68" r="4" fill="${light}"/><circle cx="30" cy="70" r="3" fill="${light}"/>`; break;
    case 'amoeba': b = `<path d="M18 56Q10 34 34 30Q44 14 64 28Q90 28 84 54Q92 76 64 78Q44 90 26 76Q12 72 18 56Z" fill="${fill}" ${S}/><circle cx="68" cy="62" r="6" fill="${dark}" opacity=".5"/>`; break;
    case 'flag': b = `<ellipse cx="50" cy="56" rx="26" ry="30" fill="${fill}" ${S}/><path d="M50 26Q40 10 54 4Q66 0 62 12" fill="none" ${S}/>`; ey = 56; break;
    case 'cili': b = `<ellipse cx="50" cy="52" rx="38" ry="28" fill="${fill}" ${S}/>` + Array.from({ length: 9 }, (_, i) => `<path d="M${18 + i * 8} ${i % 2 ? 80 : 24}v${i % 2 ? 8 : -8}" ${S} fill="none"/>`).join(''); break;
    case 'bell': b = `<path d="M50 80V92" ${S}/><path d="M16 58Q16 18 50 18Q84 18 84 58Z" fill="${fill}" ${S}/><path d="M16 58Q30 70 50 58Q70 70 84 58" fill="${light}" ${S}/>`; ey = 42; break;
    case 'jelly': b = `<path d="M18 52Q18 12 50 12Q82 12 82 52Z" fill="${fill}" ${S}/><path d="M26 52Q20 70 28 86M42 52Q38 72 44 90M58 52Q62 72 56 90M74 52Q80 70 72 86" fill="none" ${S}/>`; ey = 36; break;
    case 'worm': b = `<path d="M14 66Q26 30 42 56Q58 82 72 40Q80 26 90 34" fill="none" stroke="#222" stroke-width="22" stroke-linecap="round"/><path d="M14 66Q26 30 42 56Q58 82 72 40Q80 26 90 34" fill="none" stroke="${fill}" stroke-width="14" stroke-linecap="round"/>`; ex = 0; break;
    case 'rotifer': b = `<path d="M50 60V88" ${S}/><ellipse cx="50" cy="52" rx="24" ry="30" fill="${fill}" ${S}/><circle cx="32" cy="22" r="9" fill="${light}" ${S}/><circle cx="68" cy="22" r="9" fill="${light}" ${S}/>`; break;
    case 'tardi': b = `<ellipse cx="50" cy="50" rx="36" ry="28" fill="${fill}" ${S}/><path d="M24 70v14M42 74v14M58 74v14M76 70v14" ${S} stroke-width="8" fill="none"/>`; break;
    case 'crust': b = `<path d="M18 56Q18 22 52 22Q84 24 84 56Q80 82 48 80Q18 78 18 56Z" fill="${fill}" ${S}/><path d="M20 38Q4 28 12 14M84 40Q96 30 92 16" fill="none" ${S}/><path d="M36 82v8M60 82v8" ${S}/>`; break;
    case 'phage': b = `<path d="M50 10L74 24V48L50 62L26 48V24Z" fill="${fill}" ${S}/><path d="M50 62V80M50 80L34 94M50 80L66 94" fill="none" ${S}/>`; ey = 36; break;
    case 'algae': b = `<path d="M50 90Q10 70 16 40Q22 12 50 14Q78 12 84 40Q90 70 50 90Z" fill="#5c5" ${S}/><path d="M50 20V84M50 40L32 30M50 56L68 44" stroke="#2a7" stroke-width="3" fill="none"/>`; break;
    case 'yeast': b = `<circle cx="42" cy="56" r="28" fill="${fill}" ${S}/><circle cx="76" cy="34" r="14" fill="${fill}" ${S}/>`; ex = 14; ey = 56; break;
  }
  const cx = shape === 'yeast' ? 42 : 50;
  let face = '';
  if (ex) {
    const l = cx - ex * 0.6, r = cx + ex * 0.6;
    face = `<circle cx="${l}" cy="${ey}" r="7" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="${r}" cy="${ey}" r="7" fill="#fff" stroke="#222" stroke-width="2"/>`
      + `<circle cx="${l + 1}" cy="${ey + 1}" r="3.5" fill="#222"/><circle cx="${r + 1}" cy="${ey + 1}" r="3.5" fill="#222"/>`
      + (enemy ? `<path d="M${l - 8} ${ey - 12}L${l + 6} ${ey - 8}M${r + 8} ${ey - 12}L${r - 6} ${ey - 8}" stroke="#222" stroke-width="3" stroke-linecap="round"/><path d="M${cx - 7} ${ey + 16}Q${cx} ${ey + 9} ${cx + 7} ${ey + 16}" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round"/>`
        : `<path d="M${cx - 7} ${ey + 11}Q${cx} ${ey + 19} ${cx + 7} ${ey + 11}" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round"/>`);
  } else face = `<circle cx="82" cy="30" r="6" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="83" cy="31" r="3" fill="#222"/>`;
  let deco = '';
  if (lv >= 1) deco += `<path d="M30 10l6 10M70 10l-6 10" stroke="#ffd800" stroke-width="4" stroke-linecap="round"/>`;
  if (lv >= 2) deco += `<path d="M34 16L38 4L50 12L62 4L66 16Z" fill="#ffd800" ${S} stroke-width="3"/>`;
  if (lv >= 3) deco += `<circle cx="50" cy="50" r="46" fill="none" stroke="#ffd800" stroke-width="3" stroke-dasharray="6 6"/>`;
  if (lv >= 4 || boss) deco += `<path d="M8 20l5 10 10-5-5 10 10 5-10 4 3 11-10-6-6 10-3-11-11 2 8-8z" fill="#ffd800" opacity=".7" transform="scale(.5) translate(6 0)"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${b}${face}${deco}</svg>`;
  return artCache[key] = svg;
}
const artImgs = {};
function artImg(c, enemy, boss) {
  const k = c.id + (enemy ? 'e' : 'a') + (boss ? 'b' : '');
  if (!artImgs[k]) { const i = new Image(); i.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(artSvg(c, enemy, boss)); artImgs[k] = i; }
  return artImgs[k];
}
