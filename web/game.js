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
function icon(c, enemy) { return `<div class="icon" style="background:${color(c.family, enemy ? 180 : 0)}">${c.name[0]}</div>`; }
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
    show(`<h1 class="logo">MicroWars</h1><div class="sub">〜 活性汚泥の大戦争 〜</div><div class="blink">タップでスタート</div>`, 'title');
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
const W = 1000, H = 400, GY = 270;

function startBattle(si) {
  const stage = DATA.stages[si];
  show(`<div class="bar"><b class="grow">${stage.no}. ${stage.name}</b><button class="btn" onclick="go('stages')">撤退</button></div>
    <canvas id="cv" width="${W}" height="${H}"></canvas><div class="deck" id="deck"></div>`);
  B = { si, stage, units: [], eBase: 800 + si * 400, aBase: 1000, money: 200, maxMoney: 600, cd: {}, t: 0, nextE: 120, boss: false, over: false, fx: [] };
  B.eMax = B.eBase;
  $app.firstChild.style.position = 'absolute';
  document.getElementById('deck').innerHTML = save.party.map(id =>
    `<button class="btn" id="d-${id}" onclick="spawnAlly('${id}')">${A[id].name}<br>🪙${A[id].cost}</button>`).join('');
  B.raf = requestAnimationFrame(tick);
}
function mk(side, c, hp, atk, kind, scale = 1) {
  const [spd, range] = side === 'a' ? ROLE[c.role] : [kind === 'boss' ? 0.4 : 0.5, 30];
  B.units.push({ side, c, x: side === 'a' ? 60 : W - 60, hp, max: hp, atk, spd, range, cd: 0, r: 14 * scale, kind });
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
  if (--B.nextE <= 0) { spawnEnemy(false); B.nextE = Math.max(80, 260 - B.si * 6) * (0.7 + Math.random() * 0.6); }
  if (!B.boss && B.eBase < B.eMax * 0.7) { B.boss = true; spawnEnemy(true); }
  const us = B.units;
  for (const u of us) {
    const dir = u.side === 'a' ? 1 : -1;
    let tgt = null, best = 1e9;
    for (const o of us) if (o.side !== u.side && o.hp > 0) { const d = (o.x - u.x) * dir - 0; if (d > -5 && d < best) { best = d; tgt = o; } }
    const baseX = u.side === 'a' ? W - 30 : 30, bd = (baseX - u.x) * dir;
    const inUnit = tgt && best <= u.range + tgt.r, inBase = bd <= u.range + 20;
    if (inUnit || inBase) {
      if (u.cd-- <= 0) {
        u.cd = 60;
        if (u.c.role === '支援' && u.side === 'a') {
          for (const o of us) if (o.side === 'a' && Math.abs(o.x - u.x) < 120) o.hp = Math.min(o.max, o.hp + u.atk * 2);
        }
        if (inUnit) { tgt.hp -= u.atk; B.fx.push({ x: tgt.x, t: 8 }); }
        else if (u.side === 'a') B.eBase -= u.atk; else B.aBase -= u.atk;
      }
    } else u.x += u.spd * dir;
  }
  B.units = us.filter(u => u.hp > 0);
  for (const id of save.party) {
    const b = document.getElementById('d-' + id);
    if (b) b.disabled = B.money < A[id].cost || (B.cd[id] || 0) > 0;
  }
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
  } else msg = '<div class="logo" style="color:#e02a1a">FAILED</div>';
  const o = document.createElement('div');
  o.className = 'ovl';
  o.innerHTML = msg + `<button class="btn" onclick="go('stages')">ステージ選択へ</button>`;
  $app.appendChild(o);
}
function draw() {
  const cv = document.getElementById('cv'); if (!cv) return;
  const g = cv.getContext('2d');
  g.clearRect(0, 0, W, H);
  const base = (x, hp, max, col) => {
    g.fillStyle = col; g.fillRect(x - 25, GY - 110, 50, 110); g.strokeStyle = '#222'; g.lineWidth = 3; g.strokeRect(x - 25, GY - 110, 50, 110);
    g.fillStyle = '#222'; g.fillRect(x - 40, GY - 135, 80, 12); g.fillStyle = '#4c4'; g.fillRect(x - 38, GY - 133, 76 * Math.max(0, hp) / max, 8);
  };
  base(25, B.aBase, 1000, '#4a90e2'); base(W - 25, B.eBase, B.eMax, '#c0392b');
  g.fillStyle = '#222'; g.font = 'bold 22px sans-serif'; g.textAlign = 'left';
  g.fillText(`💰 ${Math.floor(B.money)} / ${B.maxMoney}`, 12, 28);
  g.textAlign = 'center';
  for (const u of B.units) {
    const y = GY - u.r + (u.side === 'a' ? 0 : 0);
    g.fillStyle = color(u.c.family, u.side === 'e' ? 180 : 0); g.beginPath(); g.arc(u.x, y, u.r, 0, 7); g.fill();
    g.lineWidth = 3; g.strokeStyle = u.kind === 'boss' ? '#ffd800' : '#222'; g.stroke();
    g.fillStyle = '#fff'; g.font = `bold ${Math.round(u.r)}px sans-serif`; g.fillText(u.c.name[0], u.x, y + u.r * 0.35);
    g.fillStyle = '#222'; g.fillRect(u.x - u.r, y - u.r - 9, u.r * 2, 5); g.fillStyle = u.side === 'a' ? '#4c4' : '#e55'; g.fillRect(u.x - u.r, y - u.r - 9, u.r * 2 * u.hp / u.max, 5);
  }
  B.fx = B.fx.filter(f => --f.t > 0);
  for (const f of B.fx) { g.fillStyle = '#ffd800'; g.fillText('✦', f.x, GY - 30 - f.t); }
}

screens.title();
