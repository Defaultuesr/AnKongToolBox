/* ============================================================
   安空工具箱 v2.2 — 移植暮光工具箱数据资源（经作者授权）
   1. 交互式元素周期表（118 元素）
   2. 猫品种图鉴（233 条 + 饮食禁忌）
   3. 一笔画小游戏（120 关）
   全部本地离线，数据来自 AK_TWILIGHT，无网络请求
   ============================================================ */

/* ---------------- 1. 元素周期表 ---------------- */
var AK_PT_CATS = ['非金属', '稀有气体', '碱金属', '碱土金属', '类金属', '卤素',
  '过渡金属', '后过渡金属', '镧系', '锕系'];
AK_PT_CATS.forEach(function (c) { /* 仅用于筛选按钮顺序，兼容 ES5 */ });

function akPtInit(host, api) {
  var D = window.AK_TWILIGHT;
  var els = (D && D.elements) ? D.elements : [];
  var state = { q: '', cat: '', sel: null };

  host.innerHTML =
    '<div style="display:flex;gap:8px;margin-bottom:10px;align-items:center">' +
      '<input class="input" id="pt-q" placeholder="搜索元素名 / 符号 / 原子序数" style="flex:1">' +
      '<button class="btn" data-pt="reset" style="white-space:nowrap">重置</button>' +
    '</div>' +
    '<div id="pt-filter" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px"></div>' +
    '<div id="pt-detail"></div>' +
    '<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:var(--radius-m);background:var(--surface-container-low);padding:8px">' +
      '<div id="pt-grid" style="position:relative;min-width:680px;margin:0 auto"></div>' +
    '</div>' +
    '<div class="note" style="margin-top:12px"><b>说明</b>数据移植自暮光工具箱（经作者授权），共 118 种元素，全部本地离线查询。横向滑动查看完整周期表，点击元素查看详细信息。</div>';

  var grid = host.querySelector('#pt-grid');
  var fbox = host.querySelector('#pt-filter');
  var detail = host.querySelector('#pt-detail');
  var qin = host.querySelector('#pt-q');

  // 格子尺寸
  var CW = 36, CH = 40, GAP = 2;
  function cellW() { return CW; }
  grid.style.width = (18 * (CW + GAP) + GAP) + 'px';
  grid.style.height = (10 * (CH + GAP) + GAP) + 'px';

  var catColor = {};
  (function () {
    for (var i = 0; i < els.length; i++) {
      if (els[i].color_hex) catColor[els[i].category_ui_name] = els[i].color_hex;
    }
  })();

  function norm(s) { return String(s || '').toLowerCase(); }
  function match(e) {
    if (state.cat && e.category_ui_name !== state.cat) return false;
    if (!state.q) return true;
    var q = norm(state.q);
    return norm(e.name).indexOf(q) >= 0 || norm(e.name_en).indexOf(q) >= 0 ||
      norm(e.symbol).indexOf(q) >= 0 || String(e.number) === q;
  }

  function drawFilter() {
    var h = '<button class="chip' + (state.cat === '' ? ' active' : '') + '" data-pt-cat="">全部</button>';
    for (var i = 0; i < AK_PT_CATS.length; i++) {
      var c = AK_PT_CATS[i];
      if (!catColor[c]) continue;
      h += '<button class="chip' + (state.cat === c ? ' active' : '') + '" data-pt-cat="' + api.esc(c) + '">' +
        '<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + catColor[c] + ';margin-right:4px"></span>' +
        api.esc(c) + '</button>';
    }
    fbox.innerHTML = h;
  }

  function drawGrid() {
    var h = '';
    for (var i = 0; i < els.length; i++) {
      var e = els[i];
      var ok = match(e);
      var x = (e.xpos - 1) * (CW + GAP) + GAP;
      var y = (e.ypos - 1) * (CH + GAP) + GAP;
      var bg = e.color_hex || '#ddd';
      var sel = (state.sel && state.sel.number === e.number);
      h += '<div data-pt-num="' + e.number + '" title="' + api.esc(e.name + ' ' + e.name_en) + '" ' +
        'style="position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + CW + 'px;height:' + CH + 'px;' +
        'background:' + bg + ';border-radius:5px;cursor:pointer;box-sizing:border-box;padding:2px 0;' +
        'text-align:center;opacity:' + (ok ? '1' : '0.18') + ';' +
        'outline:' + (sel ? '2px solid var(--primary)' : 'none') + ';' +
        'box-shadow:' + (sel ? '0 0 0 2px rgba(0,0,0,.15)' : 'none') + '">' +
        '<div style="font-size:9px;line-height:11px;opacity:.75">' + e.number + '</div>' +
        '<div style="font-size:15px;font-weight:800;line-height:17px">' + api.esc(e.symbol) + '</div>' +
        '<div style="font-size:9px;line-height:11px;white-space:nowrap;overflow:hidden">' + api.esc(e.name) + '</div>' +
        '</div>';
    }
    grid.innerHTML = h;
  }

  function drawDetail(e) {
    if (!e) { detail.innerHTML = ''; return; }
    function row(k, v) {
      if (v == null || v === '') return '';
      if (v instanceof Array) v = v.join(' · ');
      return '<div style="display:flex;gap:10px;padding:5px 0;border-bottom:1px solid var(--surface-container-high);font-size:13px">' +
        '<span style="color:var(--on-surface-variant);min-width:78px">' + k + '</span>' +
        '<span style="flex:1;word-break:break-word">' + api.esc(String(v)) + '</span></div>';
    }
    var body = '<div style="display:flex;align-items:center;gap:14px;margin-bottom:8px">' +
      '<div style="width:56px;height:56px;border-radius:10px;background:' + (e.color_hex || '#ddd') +
        ';display:flex;flex-direction:column;align-items:center;justify-content:center">' +
        '<div style="font-size:10px">' + e.number + '</div><div style="font-size:24px;font-weight:800">' + api.esc(e.symbol) + '</div></div>' +
      '<div><div style="font-size:18px;font-weight:800">' + api.esc(e.name) + ' <span style="font-size:13px;color:var(--on-surface-variant)">' + api.esc(e.name_en || '') + '</span></div>' +
        '<div style="font-size:12px;color:var(--on-surface-variant)">' + api.esc(e.category_ui_name || '') + ' · 第 ' + (e.period || '-') + ' 周期 · 第 ' + (e.group || '-') + ' 族</div></div>' +
      '</div>';
    if (e.desc) body += '<div style="font-size:12px;line-height:1.7;color:var(--on-surface-variant);margin:8px 0 4px">' + api.esc(e.desc) + '</div>';
    body += row('原子量', e.atomic_mass) + row('相态', e.phase) + row('熔点', e.melt != null ? (e.melt + ' K') : '') +
      row('沸点', e.boil != null ? (e.boil + ' K') : '') + row('密度', e.density != null ? (e.density + ' g/cm³') : '') +
      row('电子排布', e.electron_configuration) + row('电子层', e.shells) + row('化合价', e.valence) +
      row('原子半径', e.radius != null ? (e.radius + ' pm') : '') +
      row('电负性', e.electronegativity_pauling) + row('发现者', e.discovered_by);
    detail.innerHTML = akCard('元素详情', body +
      '<div style="margin-top:10px;display:flex;gap:8px">' +
        '<button class="btn tonal" data-pt="close">关闭详情</button>' +
        '<button class="btn" data-pt="copy">复制信息</button></div>');
  }

  host.addEventListener('click', function (ev) {
    var t = ev.target;
    var cell = t.closest ? t.closest('[data-pt-num]') : null;
    if (cell) {
      var n = parseInt(cell.getAttribute('data-pt-num'), 10);
      var e = null;
      for (var i = 0; i < els.length; i++) if (els[i].number === n) { e = els[i]; break; }
      state.sel = e; drawGrid(); drawDetail(e);
      if (detail.scrollIntoView) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    var catBtn = t.closest ? t.closest('[data-pt-cat]') : null;
    if (catBtn) { state.cat = catBtn.getAttribute('data-pt-cat'); drawFilter(); drawGrid(); return; }
    var act = t.closest ? t.closest('[data-pt]') : null;
    if (!act) return;
    var a = act.getAttribute('data-pt');
    if (a === 'reset') { state.q = ''; state.cat = ''; state.sel = null; qin.value = ''; drawFilter(); drawGrid(); drawDetail(null); }
    else if (a === 'close') { state.sel = null; drawGrid(); drawDetail(null); }
    else if (a === 'copy' && state.sel) {
      var s = state.sel;
      api.copy('【' + s.name + ' ' + s.symbol + '】原子序数 ' + s.number +
        '，原子量 ' + s.atomic_mass + '，' + s.category_ui_name + '，' + (s.desc || ''));
    }
  });
  qin.addEventListener('input', function () { state.q = qin.value.trim(); drawGrid(); });

  drawFilter(); drawGrid();
}

T({ id: 'periodicTable', name: '元素周期表', cat: 'query', tint: '#DCE9D3',
  desc: '118 种元素交互周期表，点按查详情', tags: '元素 周期表 化学 原子 原子量 电子排布',
  custom: function (host, api) { akPtInit(host, api); } });


/* ---------------- 2. 猫品种图鉴 ---------------- */
function akCatInit(host, api) {
  var D = window.AK_TWILIGHT;
  var cats = (D && D.cats) ? D.cats : [];
  var mods = (D && D.catMods) ? D.catMods : {};
  var foods = (D && D.catFood) ? D.catFood : [];
  var order = ['breed', 'behavior', 'sound', 'care', 'food'];
  var state = { m: '', q: '', sel: null };

  host.innerHTML =
    '<div style="display:flex;gap:8px;margin-bottom:10px">' +
      '<input class="input" id="ck-q" placeholder="搜索品种 / 关键词" style="flex:1">' +
    '</div>' +
    '<div id="ck-filter" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px"></div>' +
    '<div id="ck-detail"></div>' +
    '<div id="ck-list"></div>' +
    '<div class="note" style="margin-top:12px"><b>说明</b>图鉴数据移植自暮光工具箱（经作者授权），共 ' + cats.length +
      ' 条条目，全部本地离线查询。饮食建议仅供参考，特殊情况请遵医嘱。</div>';

  var fbox = host.querySelector('#ck-filter');
  var list = host.querySelector('#ck-list');
  var detail = host.querySelector('#ck-detail');
  var qin = host.querySelector('#ck-q');

  function drawFilter() {
    var h = '<button class="chip' + (state.m === '' ? ' active' : '') + '" data-ck-m="">全部</button>';
    for (var i = 0; i < order.length; i++) {
      var m = order[i];
      if (!mods[m]) continue;
      h += '<button class="chip' + (state.m === m ? ' active' : '') + '" data-ck-m="' + m + '">' + api.esc(mods[m]) + '</button>';
    }
    fbox.innerHTML = h;
  }

  function filtered() {
    var out = [];
    for (var i = 0; i < cats.length; i++) {
      var c = cats[i];
      if (state.m && c.m !== state.m) continue;
      if (state.q) {
        var q = state.q.toLowerCase();
        var hay = (c.t + ' ' + c.s + ' ' + (c.tags || []).join(' ')).toLowerCase();
        if (hay.indexOf(q) < 0) continue;
      }
      out.push(c);
    }
    return out;
  }

  function drawList() {
    var arr = filtered();
    if (state.m === 'food') { drawFood(); return; }
    if (!arr.length) { list.innerHTML = '<div class="hint">没有匹配的条目，换个关键词试试</div>'; return; }
    var h = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px">';
    for (var i = 0; i < arr.length; i++) {
      var c = arr[i];
      h += '<button class="chip" data-ck-open="' + i + '" style="text-align:left;justify-content:flex-start;flex-direction:column;align-items:flex-start;padding:10px;min-height:70px">' +
        '<b style="font-size:14px">' + api.esc(c.t) + '</b>' +
        '<span style="font-size:11px;color:var(--on-surface-variant);margin-top:4px;line-height:1.4">' + api.esc(c.s || mods[c.m] || '') + '</span>' +
        '</button>';
    }
    h += '</div>';
    list.innerHTML = h;
    list._arr = arr;
  }

  function drawFood() {
    var h = '';
    for (var i = 0; i < foods.length; i++) {
      var f = foods[i];
      var ok = (f.ok || []).join('、') || '—';
      var no = (f.no || []).join('、') || '—';
      h += akCard(f.t,
        '<div style="font-size:13px;line-height:1.9">' +
        '<div><span style="color:#2e7d32;font-weight:700">✓ 可以吃：</span>' + api.esc(ok) + '</div>' +
        '<div><span style="color:#c62828;font-weight:700">✗ 避免吃：</span>' + api.esc(no) + '</div>' +
        '</div>');
    }
    list.innerHTML = h || '<div class="hint">暂无饮食数据</div>';
  }

  function drawDetail(c) {
    if (!c) { detail.innerHTML = ''; return; }
    var body = '<div style="font-size:15px;font-weight:800;margin-bottom:6px">' + api.esc(c.t) + '</div>' +
      '<div style="font-size:12px;color:var(--on-surface-variant);margin-bottom:8px">' + api.esc(mods[c.m] || '') + '</div>' +
      '<div style="font-size:13px;line-height:1.8">' + api.esc(c.b || c.s || '') + '</div>';
    if (c.tags && c.tags.length) {
      body += '<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">';
      for (var i = 0; i < c.tags.length; i++) body += '<span class="chip">' + api.esc(c.tags[i]) + '</span>';
      body += '</div>';
    }
    body += '<div style="margin-top:12px"><button class="btn tonal" data-ck="close">返回列表</button></div>';
    detail.innerHTML = akCard('条目详情', body);
  }

  host.addEventListener('click', function (ev) {
    var t = ev.target;
    var mb = t.closest ? t.closest('[data-ck-m]') : null;
    if (mb) { state.m = mb.getAttribute('data-ck-m'); state.sel = null; list._arr = null; drawFilter(); drawDetail(null); drawList(); return; }
    var ob = t.closest ? t.closest('[data-ck-open]') : null;
    if (ob) {
      var idx = parseInt(ob.getAttribute('data-ck-open'), 10);
      var c = (list._arr || [])[idx];
      if (c) { state.sel = c; drawDetail(c); if (detail.scrollIntoView) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
      return;
    }
    var cb = t.closest ? t.closest('[data-ck]') : null;
    if (cb && cb.getAttribute('data-ck') === 'close') { state.sel = null; drawDetail(null); }
  });
  qin.addEventListener('input', function () { state.q = qin.value.trim(); drawList(); });

  drawFilter(); drawList();
}

T({ id: 'catGuide', name: '猫品种图鉴', cat: 'life', tint: '#ECD9E8',
  desc: '233 条猫品种 / 行为 / 饮食速查', tags: '猫 品种 图鉴 宠物 饮食 行为 叫声',
  custom: function (host, api) { akCatInit(host, api); } });


/* ---------------- 3. 一笔画小游戏 ---------------- */
function akOneStrokeInit(host, api) {
  var D = window.AK_TWILIGHT;
  var levels = (D && D.onestroke) ? D.onestroke : [];
  var state = { idx: 0, path: [], used: {}, done: false, hint: false };

  host.innerHTML =
    '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap">' +
      '<button class="btn" data-os="prev">‹ 上一关</button>' +
      '<span id="os-label" style="flex:1;text-align:center;font-weight:700;font-size:14px"></span>' +
      '<button class="btn" data-os="next">下一关 ›</button>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">' +
      '<button class="btn tonal" data-os="reset">重玩本关</button>' +
      '<button class="btn tonal" data-os="hint">显示提示</button>' +
      '<button class="btn tonal" data-os="chapters">选关</button>' +
    '</div>' +
    '<div id="os-chapters" style="display:none;flex-wrap:wrap;gap:6px;margin-bottom:10px"></div>' +
    '<div style="background:var(--surface-container-low);border-radius:var(--radius-m);padding:10px;position:relative">' +
      '<svg id="os-svg" viewBox="0 0 100 100" style="width:100%;height:auto;aspect-ratio:1;display:block;touch-action:manipulation;background:var(--surface)"></svg>' +
    '</div>' +
    '<div id="os-status" style="text-align:center;font-size:13px;margin-top:10px;color:var(--on-surface-variant)"></div>' +
    '<div class="note" style="margin-top:12px"><b>玩法</b>从任意节点出发，依次点击相邻节点连线，每条线只能走一次（双线需走两次），一笔画完所有线即过关。120 关移植自暮光工具箱（经作者授权）。</div>';

  var svg = host.querySelector('#os-svg');
  var label = host.querySelector('#os-label');
  var status = host.querySelector('#os-status');
  var chapBox = host.querySelector('#os-chapters');

  function edgeKey(a, b) { return a < b ? a + '-' + b : b + '-' + a; }
  function totalNeeded(lv) {
    var t = 0;
    for (var i = 0; i < lv.e.length; i++) t += (lv.e[i][2] ? 2 : 1);
    return t;
  }
  function usedCount() {
    var n = 0;
    for (var k in state.used) if (state.used.hasOwnProperty(k)) n += state.used[k];
    return n;
  }

  function draw() {
    var lv = levels[state.idx];
    if (!lv) return;
    label.textContent = '第 ' + (state.idx + 1) + ' / ' + levels.length + ' 关 · ' + (lv.n || '');
    var V = lv.v, E = lv.e;
    var s = '';

    // 已画的路径线段（按点击顺序）
    for (var p = 0; p < state.path.length - 1; p++) {
      var a = state.path[p], b = state.path[p + 1];
      var na = V[a], nb = V[b];
      var x1 = na[0] * 100, y1 = na[1] * 100, x2 = nb[0] * 100, y2 = nb[1] * 100;
      s += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
        '" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round" opacity="0.95"/>';
    }
    // 提示解法的虚线
    if (state.hint) {
      var sol = lv.sol || [];
      for (var h = 0; h < sol.length - 1; h++) {
        var ha = V[sol[h]], hb = V[sol[h + 1]];
        if (!ha || !hb) continue;
        s += '<line x1="' + (ha[0]*100) + '" y1="' + (ha[1]*100) + '" x2="' + (hb[0]*100) + '" y2="' + (hb[1]*100) +
          '" stroke="#999" stroke-width="0.8" stroke-dasharray="2 2" opacity="0.7"/>';
      }
    }
    // 底图边（未走 / 双线）
    for (var i = 0; i < E.length; i++) {
      var e = E[i], va = V[e[0]], vb = V[e[1]];
      if (!va || !vb) continue;
      var key = edgeKey(e[0], e[1]);
      var u = state.used[key] || 0;
      var need = e[2] ? 2 : 1;
      var remain = need - u;
      if (remain <= 0) continue;
      // 用轻微偏移区分双线的两条
      var off = (e[2] && u === 1) ? 1.6 : 0;
      var mx = (va[0]+vb[0])/2, my = (va[1]+vb[1])/2;
      var dx = vb[0]-va[0], dy = vb[1]-va[1];
      var len = Math.sqrt(dx*dx+dy*dy) || 1;
      var px = -dy/len*off, py = dx/len*off;
      s += '<line x1="' + ((va[0]+px)*100) + '" y1="' + ((va[1]+py)*100) +
        '" x2="' + ((vb[0]+px)*100) + '" y2="' + ((vb[1]+py)*100) +
        '" stroke="var(--on-surface-variant)" stroke-width="1.4" opacity="0.55" stroke-linecap="round"/>';
    }
    // 节点
    var last = state.path.length ? state.path[state.path.length - 1] : -1;
    for (var j = 0; j < V.length; j++) {
      var v = V[j];
      var isLast = (j === last);
      var isStart = (lv.s || []).indexOf(j) >= 0;
      var r = isLast ? 3.4 : (isStart ? 2.8 : 2.4);
      var fill = isLast ? 'var(--primary)' : (state.path.indexOf(j) >= 0 ? 'var(--primary)' : 'var(--surface-container-high)');
      s += '<circle data-os-node="' + j + '" cx="' + (v[0]*100) + '" cy="' + (v[1]*100) + '" r="' + r +
        '" fill="' + fill + '" stroke="var(--on-surface-variant)" stroke-width="0.7" style="cursor:pointer"/>';
    }
    svg.innerHTML = s;

    var need = totalNeeded(lv), got = usedCount();
    status.textContent = state.done ? '🎉 过关！已完成本次一笔画' : ('已连 ' + got + ' / ' + need + ' 条线');
  }

  function reset() { state.path = []; state.used = {}; state.done = false; state.hint = false; draw(); }

  function tapNode(node) {
    var lv = levels[state.idx];
    if (!lv || state.done) return;
    var path = state.path;
    if (!path.length) { path.push(node); draw(); return; }
    var last = path[path.length - 1];
    if (node === last) return;
    // 找 last->node 之间是否有可用边
    var key = edgeKey(last, node), picked = null;
    for (var i = 0; i < lv.e.length; i++) {
      var e = lv.e[i];
      if (edgeKey(e[0], e[1]) === key) { picked = e; break; }
    }
    if (!picked) { api.toast('这两个点之间没有连线'); return; }
    var need = picked[2] ? 2 : 1;
    var u = state.used[key] || 0;
    if (u >= need) { api.toast('这条线已经走过了'); return; }
    state.used[key] = u + 1;
    path.push(node);
    if (usedCount() >= totalNeeded(lv)) state.done = true;
    draw();
    if (state.done) api.toast('🎉 过关！');
  }

  svg.addEventListener('click', function (ev) {
    var c = ev.target.closest ? ev.target.closest('[data-os-node]') : null;
    if (c) tapNode(parseInt(c.getAttribute('data-os-node'), 10));
  });

  host.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('[data-os]') : null;
    if (!b) return;
    var a = b.getAttribute('data-os');
    if (a === 'prev') { if (state.idx > 0) { state.idx--; reset(); } }
    else if (a === 'next') { if (state.idx < levels.length - 1) { state.idx++; reset(); } }
    else if (a === 'reset') reset();
    else if (a === 'hint') { state.hint = !state.hint; draw(); }
    else if (a === 'chapters') {
      if (chapBox.style.display === 'flex') { chapBox.style.display = 'none'; return; }
      var h = '';
      var seen = {};
      for (var i = 0; i < levels.length; i++) {
        var c = levels[i].c;
        if (seen[c]) continue;
        seen[c] = 1;
        h += '<button class="chip" data-os-chap="' + c + '">第 ' + (c + 1) + ' 章</button>';
      }
      chapBox.innerHTML = h;
      chapBox.style.display = 'flex';
    }
    var cb = ev.target.closest ? ev.target.closest('[data-os-chap]') : null;
    if (cb) {
      var ch = parseInt(cb.getAttribute('data-os-chap'), 10);
      for (var k = 0; k < levels.length; k++) if (levels[k].c === ch) { state.idx = k; break; }
      chapBox.style.display = 'none'; reset();
    }
  });

  reset();
}

T({ id: 'oneStroke', name: '一笔画', cat: 'game', tint: '#E6DEF2',
  desc: '120 关一笔画解谜，6 个章节', tags: '一笔画 游戏 解谜 关卡 益智',
  custom: function (host, api) { akOneStrokeInit(host, api); } });
