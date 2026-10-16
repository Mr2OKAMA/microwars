'use strict';
const $app = document.getElementById('app');
const A = Object.fromEntries(DATA.allies.map(c => [c.id, c]));
const E = DATA.enemies;
const KEY = 'microwars-save-v1';
const PARTY_MAX = 5, LV_MAX = 20;
const ROLE = { '前衛': [0.6, 30], '近接': [0.8, 30], '遠隔': [0.6, 150], '高速': [1.5, 30], '支援': [0.6, 100], '特殊': [0.7, 60] };

let save = load();
function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.owned) return s; } catch (e) {}
  const start = ['A001', 'A004', 'A007', 'A010', 'A013'];
  return { coins: 500, owned: Object.fromEntries(start.map(i => [i, 1])), party: start.slice(), cleared: 0 };
}
function persist() { localStorage.setItem(KEY, JSON.stringify(save)); }
function color(s, h0 = 0) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return `hsl(${(h + h0) % 360},65%,45%)`; }
function stat(id, k) { return Math.round(A[id][k] * (1 + 0.08 * (save.owned[id] - 1))); }
function lvCost(id) { return 30 + save.owned[id] * 20; }
function icon(c, enemy) { return `<div class="icon">${artSvg(c, enemy)}</div>`; }
function card(c, extra = '', cls = '', click = '') {
  return `<div class="card ${cls}" ${click ? `onclick="${click}"` : ''}>${extra}${icon(c)}${c.name}</div>`;
}
function bar(title, back = 'menu') {
  return `<div class="bar"><button class="btn" onclick="go('${back}')">◀</button><h2 class="grow">${title}</h2><span class="coin">🪙 ${save.coins}</span></div>`;
}
function go(s, arg) { stopBattle(); screens[s](arg); }
function show(html, cls = '') { $app.innerHTML = `<div class="screen ${cls}">${html}</div>`; }

const screens = {
  title() {
    show(`<div class="rays"></div><h1 class="logo">MicroWars</h1><div class="sub">〜 活性汚泥の大戦争 〜</div><div class="blink">タップでスタート</div>`, 'title');
    $app.firstChild.onclick = () => go('menu');
  },
  menu() {
    show(`<div class="bar"><h2 class="grow">メニュー</h2><span class="coin">🪙 ${save.coins}</span></div>
      <div class="screen menu" style="position:static;flex:1">
      <button class="btn red" onclick="go('stages')">⚔ 出撃(ステージ選択)</button>
      <button class="btn" onclick="go('party')">👥 パーティ編成</button>
      <button class="btn blue" onclick="go('upgrade')">⬆ キャラ強化</button>
      <button class="btn" onclick="go('gacha')">🎰 ガチャ</button>
      <button class="btn" onclick="go('zukan')">📖 図鑑</button>
      <button class="btn" onclick="go('title')">タイトルへ</button></div>`);
  },
  stages() {
    let h = bar('ステージ選択'), last = '';
    h += '<div class="panel">';
    DATA.stages.forEach((s, i) => {
      if (s.chapter !== last) { h += `<div class="chap">${s.chapter}</div>`; last = s.chapter; }
      const open = i <= save.cleared, done = i < save.cleared;
      h += `<div class="stage ${open ? '' : 'lock'}" ${open ? `onclick="go('battle',${i})"` : ''}><b>${s.no}</b><div style="flex:1">${s.name}${done ? ' ✅' : ''}<small>${s.place}|${s.gimmick}</small><small>敵: ${s.enemies}</small></div>${open ? '▶' : '🔒'}</div>`;
    });
    show(h + '</div>');
  },
  zukan(tab = 'ally') {
    const tabs = `<div class="tabs"><button class="btn" onclick="screens.zukan('ally')">味方 ${Object.keys(save.owned).length}/60</button><button class="btn" onclick="screens.zukan('enemy')">敵</button></div>`;
    let h = bar('図鑑') + tabs + '<div class="panel"><div class="grid">';
    if (tab === 'ally') DATA.allies.forEach(c => {
      const o = save.owned[c.id];
      h += card(c, o ? `<span class="lv">Lv${o}</span>` : '', o ? '' : 'off', `zdetail('${c.id}')`);
    });
    else E.forEach(c => { h += `<div class="card" onclick="zdetail('${c.id}')">${icon(c, 1)}${c.name}</div>`; });
    show(h + '</div></div><div class="panel detail" id="detail" style="flex:none;height:90px">キャラをタップで詳細</div>');
  },
  gacha() {
    show(bar('ガチャ') + `<div class="screen gacha" style="position:static;flex:1"><div class="capsule">🥚</div>
      <div>1回 100🪙 / 10連 900🪙<br>基本80% 進化1 17% 進化2 3%</div>
      <div class="result" id="res"></div>
      <div><button class="btn red" onclick="pull(1)">1回</button> <button class="btn blue" onclick="pull(10)">10連</button></div></div>`);
  },
  party() {
    let h = bar('パーティ編成') + '<div class="party">';
    for (let i = 0; i < PARTY_MAX; i++) {
      const id = save.party[i];
      h += `<div class="slot">${id ? card(A[id], `<span class="lv">Lv${save.owned[id]}</span>`, '', `unset(${i})`) : '空き'}</div>`;
    }
    h += '</div><div class="panel"><div class="grid">';
    Object.keys(save.owned).sort().forEach(id => {
      const on = save.party.includes(id);
      h += card(A[id], `<span class="lv">Lv${save.owned[id]}</span>`, on ? 'sel' : '', `toggle('${id}')`);
    });
    show(h + '</div></div><div style="text-align:center;margin-top:6px;font-size:12px">タップで編成/解除</div>');
  },
  upgrade(id) {
    let h = bar('キャラクター強化') + '<div class="panel"><div class="grid">';
    Object.keys(save.owned).sort().forEach(i => {
      h += card(A[i], `<span class="lv">Lv${save.owned[i]}</span>`, i === id ? 'sel' : '', `screens.upgrade('${i}')`);
    });
    h += '</div></div><div class="panel detail" style="flex:none;margin-top:6px">';
    if (id && save.owned[id]) {
      const c = A[id], lv = save.owned[id], nx = c.evo_cost ? A[DATA.allies.find(x => x.evolves_from === id).id] : null;
      h += `<b>${c.name}</b> Lv${lv}/${LV_MAX} (${c.stage}・${c.role})<br>HP ${stat(id, 'hp')} / 攻撃 ${stat(id, 'atk')} / コスト ${c.cost}<br>${c.ability}<br>
      <button class="btn blue" ${lv >= LV_MAX || save.coins < lvCost(id) ? 'disabled' : ''} onclick="levelUp('${id}')">レベルUP 🪙${lv >= LV_MAX ? 'MAX' : lvCost(id)}</button>
      ${nx ? `<button class="btn red" ${save.coins < c.evo_cost ? 'disabled' : ''} onclick="evolve('${id}')">進化→${nx.name} 🪙${c.evo_cost}</button>` : ''}`;
    } else h += '強化するキャラを選んでください';
    show(h + '</div>');
  },
  battle(i) { startBattle(i); }
};

function zdetail(id) {
  const c = A[id] || E.find(x => x.id === id);
  const o = A[id] ? save.owned[id] : 1;
  document.getElementById('detail').innerHTML = !o ? '？？？ (未入手)' :
    `<b>${c.name}</b> [${c.family}] ${c.stage || c.tier}<br>HP ${c.hp} / 攻撃 ${c.atk}${c.cost ? ' / コスト ' + c.cost : ''}<br>${c.ability || c.extra || ''}`;
}
function toggle(id) {
  const i = save.party.indexOf(id);
  if (i >= 0) { if (save.party.length > 1) save.party.splice(i, 1); }
  else if (save.party.length < PARTY_MAX) save.party.push(id);
  persist(); screens.party();
}
function unset(i) { if (save.party.length > 1) { save.party.splice(i, 1); persist(); screens.party(); } }
function levelUp(id) {
  const c = lvCost(id);
  if (save.owned[id] < LV_MAX && save.coins >= c) { save.coins -= c; save.owned[id]++; persist(); screens.upgrade(id); }
}
function evolve(id) {
  const c = A[id], nx = DATA.allies.find(x => x.evolves_from === id);
  if (!nx || save.coins < c.evo_cost) return;
  save.coins -= c.evo_cost;
  save.owned[nx.id] = Math.max(save.owned[nx.id] || 0, save.owned[id]);
  delete save.owned[id];
  save.party = save.party.map(p => p === id ? nx.id : p).filter((p, i, a) => a.indexOf(p) === i);
  persist(); screens.upgrade(nx.id);
}
function pull(n) {
  const cost = n === 10 ? 900 : 100;
  if (save.coins < cost) { document.getElementById('res').textContent = 'コインが足りません'; return; }
  save.coins -= cost;
  let h = '';
  for (let k = 0; k < n; k++) {
    const r = Math.random(), st = r < 0.8 ? '基本' : r < 0.97 ? '進化1' : '進化2';
    const pool = DATA.allies.filter(c => c.stage === st), c = pool[Math.floor(Math.random() * pool.length)];
    const dup = save.owned[c.id];
    if (dup) save.owned[c.id] = Math.min(LV_MAX, dup + 1); else save.owned[c.id] = 1;
    h += card(c, `<span class="lv">${dup ? 'Lv↑' : 'NEW'}</span>`);
  }
  persist(); screens.gacha();
  document.getElementById('res').innerHTML = h;
}

/* ---------- 戦闘 ---------- */
let B = null;
function stopBattle() { if (B) { cancelAnimationFrame(B.raf); B = null; } }
const VW = 960, H = 540, GY = 410;
// ステージごとに全長を調整 (序盤は短く、終盤ほど長い)
function stageLen(si) { return Math.round(1500 + si * 110 + Math.sin(si * 1.7) * 120); }

function startBattle(si) {
  const stage = DATA.stages[si], L = stageLen(si);
  show(`<canvas id="cv" width="${VW}" height="${H}"></canvas>
    <div class="topbar"><div class="stname">${stage.no}. ${stage.name}<small>全長 ${L}m</small></div>
    <div class="wallet" id="wallet"></div><button class="btn small" onclick="go('stages')">撤退</button></div>
    <div class="minimap"><canvas id="mm" width="300" height="24"></canvas></div>
    <button class="scrl l" id="sl">◀</button><button class="scrl r" id="sr">▶</button>
    <div class="deck" id="deck"></div>`, 'battlescr');
  B = { si, stage, L, units: [], eBase: 800 + si * 400, aBase: 1000, money: 200, maxMoney: 600, cd: {}, t: 0, nextE: 120, boss: false, over: false, fx: [], cam: 0, manual: 0, hold: 0 };
  B.eMax = B.eBase;
  document.getElementById('deck').innerHTML = save.party.map(id =>
    `<button class="unitbtn" id="d-${id}" onclick="spawnAlly('${id}')"><span class="ic">${artSvg(A[id])}</span><span class="nm">${A[id].name}</span><span class="cs">🪙${A[id].cost}</span><i class="cdb"></i></button>`).join('');
  const cv = document.getElementById('cv');
  let drag = null;
  cv.onpointerdown = e => { drag = { x: e.clientX, cam: B.cam }; cv.setPointerCapture(e.pointerId); };
  cv.onpointermove = e => { if (drag && B) { B.cam = drag.cam - (e.clientX - drag.x) * VW / cv.clientWidth; B.manual = 240; } };
  cv.onpointerup = cv.onpointercancel = () => { drag = null; };
  const hold = d => { const b = document.getElementById(d < 0 ? 'sl' : 'sr'); b.onpointerdown = () => { if (B) B.hold = d; }; b.onpointerup = b.onpointerleave = b.onpointercancel = () => { if (B) B.hold = 0; }; };
  hold(-1); hold(1);
  B.raf = requestAnimationFrame(tick);
}
function mk(side, c, hp, atk, kind, scale = 1) {
  const [spd, range] = side === 'a' ? ROLE[c.role] : [kind === 'boss' ? 0.4 : 0.5, 30];
  B.units.push({ side, c, x: side === 'a' ? 90 : B.L - 90, hp, max: hp, atk, spd, range, cd: 0, r: 24 * scale, kind, ph: Math.random() * 6 });
}
function spawnAlly(id) {
  if (!B || B.over) return;
  const c = A[id];
  if (B.money < c.cost || (B.cd[id] || 0) > 0) return;
  B.money -= c.cost; B.cd[id] = 120;
  mk('a', c, stat(id, 'hp'), stat(id, 'atk'));
}
function spawnEnemy(boss) {
  const si = B.si, m = 1 + 0.05 * si;
  const i = Math.min(E.length - 1, boss ? si * 5 + 4 : si * 5 + Math.floor(Math.random() * 4));
  const c = E[i], k = boss ? 3 : 1;
  mk('e', c, Math.round(c.hp * m * k), Math.round(c.atk * m * (boss ? 1.5 : 1)), boss ? 'boss' : 'n', boss ? 1.8 : 1);
}
function tick() {
  if (!B) return;
  B.raf = requestAnimationFrame(tick);
  if (B.over) { draw(); return; }
  B.t++;
  B.money = Math.min(B.maxMoney, B.money + 0.25);
  for (const k in B.cd) if (B.cd[k] > 0) B.cd[k]--;
  if (--B.nextE <= 0) { spawnEnemy(false); B.nextE = Math.max(80, 260 - B.si * 6) * (0.7 + Math.random() * 0.6) * (1500 / B.L + 0.3); }
  if (!B.boss && B.eBase < B.eMax * 0.7) { B.boss = true; spawnEnemy(true); }
  const us = B.units;
  for (const u of us) {
    const dir = u.side === 'a' ? 1 : -1;
    let tgt = null, best = 1e9;
    for (const o of us) if (o.side !== u.side && o.hp > 0) { const d = (o.x - u.x) * dir; if (d > -5 && d < best) { best = d; tgt = o; } }
    const baseX = u.side === 'a' ? B.L - 40 : 40, bd = (baseX - u.x) * dir;
    const inUnit = tgt && best <= u.range + tgt.r, inBase = bd <= u.range + 30;
    if (inUnit || inBase) {
      if (u.cd-- <= 0) {
        u.cd = 60;
        if (u.c.role === '支援' && u.side === 'a') {
          for (const o of us) if (o.side === 'a' && Math.abs(o.x - u.x) < 120) o.hp = Math.min(o.max, o.hp + u.atk * 2);
        }
        if (inUnit) { tgt.hp -= u.atk; B.fx.push({ x: tgt.x, t: 14, v: u.atk }); }
        else if (u.side === 'a') B.eBase -= u.atk; else B.aBase -= u.atk;
      }
    } else u.x += u.spd * dir;
  }
  B.units = us.filter(u => u.hp > 0);
  // カメラ: 手動操作が無ければ最前線の味方を追従
  const maxCam = B.L - VW;
  if (B.hold) { B.cam += B.hold * 8; B.manual = 240; }
  else if (B.manual > 0) B.manual--;
  else {
    const al = B.units.filter(u => u.side === 'a');
    const fx = al.length ? Math.max(...al.map(u => u.x)) : 0;
    B.cam += (fx - VW * 0.4 - B.cam) * 0.04;
  }
  B.cam = Math.max(0, Math.min(maxCam, B.cam));
  for (const id of save.party) {
    const b = document.getElementById('d-' + id);
    if (b) {
      b.disabled = B.money < A[id].cost || (B.cd[id] || 0) > 0;
      b.lastChild.style.height = ((B.cd[id] || 0) / 120 * 100) + '%';
    }
  }
  const w = document.getElementById('wallet');
  if (w) w.textContent = `💰 ${Math.floor(B.money)} / ${B.maxMoney}`;
  if (B.eBase <= 0 || B.aBase <= 0) finish(B.eBase <= 0);
  draw();
}
function finish(win) {
  B.over = true;
  let msg = '';
  if (win) {
    const first = B.si >= save.cleared, reward = (100 + B.si * 30) * (first ? 1 : 0.5);
    save.coins += reward; if (first) save.cleared = B.si + 1; persist();
    msg = `<div class="logo">CLEAR!</div><div class="coin">+🪙${reward}</div>`;
  } else msg = '<div class="logo" style="color:#ff6a5a">FAILED</div>';
  const o = document.createElement('div');
  o.className = 'ovl';
  o.innerHTML = msg + `<button class="btn" onclick="go('stages')">ステージ選択へ</button>`;
  $app.appendChild(o);
}
function drawBase(g, x, hp, max, ally) {
  const top = GY - 170, c1 = ally ? '#5aa9ff' : '#ff6a5a', c2 = ally ? '#1d4fa8' : '#8e1d2a';
  const gr = g.createLinearGradient(x - 40, 0, x + 40, 0); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr; g.beginPath(); g.roundRect(x - 40, top, 80, 170, [14, 14, 0, 0]); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3; g.stroke();
  g.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(x, top + 36 + i * 40, 11, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.roundRect(x - 46, top - 22, 92, 14, 7); g.fill();
  g.fillStyle = ally ? '#6df08a' : '#ff8a6a'; g.beginPath(); g.roundRect(x - 44, top - 20, 88 * Math.max(0, hp) / max, 10, 5); g.fill();
}
function draw() {
  const cv = document.getElementById('cv'); if (!cv) return;
  const g = cv.getContext('2d'), cam = B.cam, L = B.L;
  const sky = g.createLinearGradient(0, 0, 0, GY); sky.addColorStop(0, '#2b6fc2'); sky.addColorStop(1, '#bfeaff');
  g.fillStyle = sky; g.fillRect(0, 0, VW, H);
  // 遠景(視差): 水中の気泡と菌塊のシルエット
  for (let layer = 0; layer < 2; layer++) {
    const f = layer ? 0.5 : 0.2, off = cam * f;
    g.fillStyle = layer ? 'rgba(60,130,170,.35)' : 'rgba(255,255,255,.25)';
    for (let i = 0; i < 30; i++) {
      const bx = ((i * 197 + 40) % 1400) - (off % 1400); const x = ((bx % 1400) + 1400) % 1400 - 100;
      const r = layer ? 60 + (i * 37) % 60 : 10 + (i * 13) % 20;
      const y = layer ? GY - r * 0.6 : 40 + ((i * 71 + B.t * 0.3 * (1 + i % 3)) % (GY - 60));
      g.beginPath(); g.arc(x, layer ? GY - 10 : (GY - 20) - (y % (GY - 40)), r, 0, 7); g.fill();
    }
  }
  const gd = g.createLinearGradient(0, GY - 10, 0, H); gd.addColorStop(0, '#9be05c'); gd.addColorStop(0.15, '#5aa83a'); gd.addColorStop(1, '#2e5e24');
  g.fillStyle = gd; g.fillRect(0, GY - 10, VW, H - GY + 10);
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, GY - 10, VW, 4);
  g.save(); g.translate(-Math.round(cam), 0);
  drawBase(g, 40, B.aBase, 1000, true); drawBase(g, L - 40, B.eBase, B.eMax, false);
  g.textAlign = 'center';
  const sorted = B.units.slice().sort((a, b) => a.r - b.r);
  for (const u of sorted) {
    const bob = Math.sin(B.t * 0.15 + u.ph) * 2, y = GY - u.r + bob;
    g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(u.x, GY + 4, u.r, u.r * 0.25, 0, 0, 7); g.fill();
    const im = artImg(u.c, u.side === 'e', u.kind === 'boss');
    if (im.complete && im.naturalWidth) {
      g.save(); g.translate(u.x, 0); if (u.side === 'e') g.scale(-1, 1);
      g.drawImage(im, -u.r * 1.3, y - u.r * 1.3 + u.r * 0.3, u.r * 2.6, u.r * 2.6); g.restore();
    } else { g.fillStyle = color(u.c.family, u.side === 'e' ? 180 : 0); g.beginPath(); g.arc(u.x, y, u.r, 0, 7); g.fill(); }
    const bw = u.r * 2, by = y - u.r - 12;
    g.fillStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.roundRect(u.x - bw / 2 - 1, by - 1, bw + 2, 8, 4); g.fill();
    g.fillStyle = u.side === 'a' ? '#6df08a' : '#ff6a5a'; g.beginPath(); g.roundRect(u.x - bw / 2, by, Math.max(0, bw * u.hp / u.max), 6, 3); g.fill();
  }
  B.fx = B.fx.filter(f => --f.t > 0);
  g.font = 'bold 20px sans-serif'; g.lineWidth = 4; g.strokeStyle = '#222';
  for (const f of B.fx) { const t = `${f.v}`, y = GY - 60 - (14 - f.t) * 2; g.strokeText(t, f.x, y); g.fillStyle = '#ffe45a'; g.fillText(t, f.x, y); }
  g.restore();
  const mm = document.getElementById('mm');
  if (mm) {
    const m = mm.getContext('2d'), k = mm.width / L;
    m.clearRect(0, 0, mm.width, 24); m.fillStyle = 'rgba(0,0,0,.55)'; m.fillRect(0, 9, mm.width, 6);
    for (const u of B.units) { m.fillStyle = u.side === 'a' ? '#6df08a' : '#ff6a5a'; m.fillRect(u.x * k - 2, 6, 4, 12); }
    m.strokeStyle = '#fff'; m.lineWidth = 2; m.strokeRect(cam * k, 2, VW * k, 20);
  }
}

screens.title();
