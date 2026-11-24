/* ============================================================
   安空工具箱 v2.3 — 继续移植暮光工具箱（经作者授权）
   1. 今天吃什么（决策助手）
   2. 域名后缀查询（移植 1476 条公共后缀）
   3. 英制单位换算（暮光冷门英制/化学单位体系）
   4. 开源库与许可证速查（217 条开源库）
   全部本地离线，数据来自 AK_TW23，无网络请求
   ============================================================ */

function v23Esc(s) { return H.esc(s == null ? '' : String(s)); }
function v23Num(v, d) { return H.num(v, d == null ? 4 : d); }
function v23R(html, text) {
  return { html: html, text: text == null
    ? String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s{2,}/g, ' ').trim()
    : String(text) };
}
function v23KV(rows) {
  return '<div class="kv-box">' + rows.map(function (r) {
    if (r == null) return '';
    return '<div class="kv"><span>' + v23Esc(r[0]) + '</span><span>' + v23Esc(r[1]) + '</span></div>';
  }).join('') + '</div>';
}

/* ---------------- 1. 今天吃什么（决策助手） ---------------- */
function v23EatInit(host, api) {
  var KEY = 'eat_options', HIST = 'eat_history';
  var def = ['火锅', '烧烤', '日料', '川菜', '粤菜', '面食', '快餐', '沙拉'];
  var opts;
  try { opts = JSON.parse(localStorage.getItem('ak_' + KEY)); } catch (e) {}
  if (!opts || !opts.length) opts = def.slice();
  var hist = [];
  try { hist = JSON.parse(localStorage.getItem('ak_' + HIST)) || []; } catch (e) {}

  host.innerHTML =
    '<div class="field"><label>候选选项（每行一个）</label>' +
      '<textarea class="input" id="eat-opts" rows="6" style="resize:vertical">' + v23Esc(opts.join('\n')) + '</textarea></div>' +
    '<div class="btn-row"><button class="btn full" data-eat="roll">🎲 帮我选一个</button></div>' +
    '<div id="eat-result" style="text-align:center;padding:18px 0 6px"></div>' +
    '<div class="btn-row"><button class="btn tonal full" data-eat="save">保存选项</button></div>' +
    '<div id="eat-hist"></div>' +
    '<div class="note" style="margin-top:12px"><b>说明</b>选择困难症专用：自定义候选项，随机公平抽取并记录历史，避免连续重复。选项保存在本机，不联网。</div>';

  var ta = host.querySelector('#eat-opts');
  var res = host.querySelector('#eat-result');
  var hbox = host.querySelector('#eat-hist');

  function drawHist() {
    if (!hist.length) { hbox.innerHTML = ''; return; }
    var h = '<div style="font-weight:700;margin:14px 0 8px">最近抽中</div><div style="display:flex;flex-wrap:wrap;gap:6px">';
    for (var i = 0; i < hist.length; i++) h += '<span class="chip">' + v23Esc(hist[i]) + '</span>';
    h += '</div><div class="btn-row" style="margin-top:8px"><button class="btn tonal" data-eat="clearhist">清空历史</button></div>';
    hbox.innerHTML = h;
  }
  function readOpts() {
    var arr = ta.value.split('\n').map(function (s) { return s.trim(); }).filter(function (s) { return s; });
    return arr;
  }
  host.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('[data-eat]') : null;
    if (!b) return;
    var a = b.getAttribute('data-eat');
    if (a === 'save') {
      opts = readOpts();
      try { localStorage.setItem('ak_' + KEY, JSON.stringify(opts)); } catch (e) {}
      api.toast('已保存 ' + opts.length + ' 个选项');
    } else if (a === 'roll') {
      var cur = readOpts();
      if (!cur.length) { api.toast('请先填写至少一个选项'); return; }
      // 尽量避开最近一次
      var pool = cur;
      if (cur.length > 1 && hist.length && cur.indexOf(hist[0]) >= 0) {
        pool = cur.filter(function (x) { return x !== hist[0]; });
      }
      var pick = pool[Math.floor(Math.random() * pool.length)];
      res.innerHTML = '<div style="font-size:13px;color:var(--on-surface-variant)">今天就吃</div>' +
        '<div style="font-size:32px;font-weight:800;color:var(--primary);margin:8px 0">' + v23Esc(pick) + '</div>' +
        '<button class="btn tonal" data-eat="roll">再抽一次</button>';
      hist.unshift(pick);
      if (hist.length > 12) hist = hist.slice(0, 12);
      try { localStorage.setItem('ak_' + HIST, JSON.stringify(hist)); } catch (e) {}
      drawHist();
    } else if (a === 'clearhist') {
      hist = [];
      try { localStorage.removeItem('ak_' + HIST); } catch (e) {}
      drawHist();
    }
  });
  drawHist();
}
T({ id: 'whatToEat', name: '今天吃什么', cat: 'life', tint: '#ECD9E8',
  desc: '自定义选项随机抽取，告别选择困难', tags: '今天吃什么 决策 随机 抽签 选择困难',
  custom: function (host, api) { v23EatInit(host, api); } });


/* ---------------- 2. 域名后缀查询 ---------------- */
T({ id: 'domainSuffix', name: '域名后缀查询', cat: 'dev', tint: '#D8EAE9',
  desc: '识别域名主域与公共后缀（1476 条）', tags: '域名 后缀 主域 公共后缀 PSL URL 网址',
  fields: [
    { k: 'domain', label: '域名或网址', type: 'text', value: 'https://www.example.com.cn/path' }
  ],
  run: function (v) {
    var s = String(v.domain || '').trim();
    if (!s) throw new Error('请输入域名或网址');
    // 提取主机名
    var host = s;
    var m = host.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/([^\/?#]+)/);
    if (m) host = m[1];
    else { m = host.match(/^([^\/?#]+)/); if (m) host = m[1]; }
    host = host.split('@').pop().split(':')[0].toLowerCase();
    if (!host || host.indexOf('.') < 0) throw new Error('无法解析出有效域名');
    var labels = host.split('.');
    var D = window.AK_TW23 || {};
    var set = {};
    (D.suffixes || []).forEach(function (x) { set[x] = 1; });
    // 从最长匹配找公共后缀
    var suffix = '', idx = -1;
    for (var i = 1; i < labels.length; i++) {
      var cand = labels.slice(i).join('.');
      if (set[cand]) { suffix = cand; idx = i; break; }
    }
    if (!suffix) { suffix = labels[labels.length - 1]; idx = labels.length - 1; }
    var registrable = idx > 0 ? labels.slice(idx - 1).join('.') : host;
    var sub = idx > 1 ? labels.slice(0, idx - 1).join('.') : '(无)';
    var isKnown = !!set[labels.slice(labels.length - 1).join('.')];
    return v23R(v23KV([
      ['输入', s], ['主机名', host], ['公共后缀', suffix],
      ['可注册主域', registrable], ['子域名', sub],
      ['顶级后缀', labels[labels.length - 1]],
      ['后缀已知', isKnown ? '是（在公共后缀列表中）' : '否（可能为私有或未收录后缀）'],
      ['标签数', labels.length]
    ]), host + ' | 主域 ' + registrable + ' | 后缀 ' + suffix);
  }});


/* ---------------- 3. 英制单位换算（暮光冷门单位体系） ---------------- */
var V23_UNITS = {
  mass: {
    name: '质量', base: 'kg',
    units: [
      ['kg', '千克', 1], ['g', '克', 0.001], ['mg', '毫克', 0.000001],
      ['t', '公吨', 1000], ['lb', '磅', 0.45359237], ['oz', '盎司', 0.028349523125],
      ['gr', '格令', 0.00006479891], ['st', '英石', 6.35029318],
      ['longTon', '长吨(英吨)', 1016.0469088], ['shortTon', '短吨(美吨)', 907.18474],
      ['carat', '克拉', 0.0002]
    ]
  },
  volume: {
    name: '体积', base: 'L',
    units: [
      ['L', '升', 1], ['mL', '毫升', 0.001], ['m3', '立方米', 1000],
      ['galUS', '美制加仑', 3.785411784], ['galUK', '英制加仑', 4.54609],
      ['qt', '夸脱(美)', 0.946352946], ['pt', '品脱(美)', 0.473176473],
      ['floz', '液盎司(美)', 0.0295735295625], ['cup', '杯(美)', 0.2365882365],
      ['tbsp', '汤匙(美)', 0.014786764781], ['tsp', '茶匙(美)', 0.004928921594],
      ['bushel', '蒲式耳(美)', 35.23907017], ['bbl', '桶(石油)', 158.987294928]
    ]
  },
  length: {
    name: '长度', base: 'm',
    units: [
      ['m', '米', 1], ['km', '千米', 1000], ['cm', '厘米', 0.01], ['mm', '毫米', 0.001],
      ['in', '英寸', 0.0254], ['ft', '英尺', 0.3048], ['yd', '码', 0.9144],
      ['mi', '英里', 1609.344], ['nmi', '海里', 1852], ['mil', '密耳', 0.0000254],
      ['furlong', '弗隆', 201.168], ['chain', '链', 20.1168]
    ]
  },
  amount: {
    name: '物质的量', base: 'mol',
    units: [
      ['mol', '摩尔', 1], ['mmol', '毫摩尔', 0.001], ['kmol', '千摩尔', 1000],
      ['umol', '微摩尔', 0.000001], ['gramMol', '克分子(旧)', 1]
    ]
  }
};
T({ id: 'imperialUnits', name: '英制单位换算', cat: 'calc', tint: '#F2E4C9',
  desc: '格令/长吨/蒲式耳/液盎司等冷门单位', tags: '英制 单位换算 格令 长吨 短吨 蒲式耳 液盎司 加仑 摩尔',
  fields: [
    { k: 'type', label: '类别', type: 'select', value: 'mass', options: [['mass','质量'],['volume','体积'],['length','长度'],['amount','物质的量']] },
    { k: 'value', label: '数值', type: 'text', value: '1' }
  ],
  run: function (v) {
    var g = V23_UNITS[v.type] || V23_UNITS.mass;
    var val = parseFloat(v.value);
    if (isNaN(val)) throw new Error('请输入有效数值');
    // 以该类别第一项单位为输入参照，换算到其它单位
    var from = g.units[0][2];
    var baseVal = val * from;
    var rows = [['类别', g.name], ['输入', val + ' ' + g.units[0][0] + '（' + g.units[0][1] + '）'], ['—', '—']];
    for (var i = 1; i < g.units.length; i++) {
      var u = g.units[i];
      rows.push([u[1] + ' (' + u[0] + ')', v23Num(baseVal / u[2], 6)]);
    }
    return v23R(v23KV(rows), val + ' ' + g.units[0][0] + ' = ' + v23Num(baseVal / g.units[1][2], 6) + ' ' + g.units[1][0]);
  }});


/* ---------------- 4. 开源库与许可证速查 ---------------- */
function v23LibsInit(host, api) {
  var libs = (window.AK_TW23 && window.AK_TW23.libs) || [];
  var state = { q: '', lic: '' };
  host.innerHTML =
    '<div style="display:flex;gap:8px;margin-bottom:10px">' +
      '<input class="input" id="lib-q" placeholder="搜索库名 / 组织（如 androidx、kotlin）" style="flex:1">' +
    '</div>' +
    '<div id="lib-filter" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px"></div>' +
    '<div id="lib-list"></div>' +
    '<div class="note" style="margin-top:12px"><b>说明</b>移植自暮光工具箱使用的开源依赖清单（' + libs.length +
      ' 条，经作者授权），可查询库名、版本、许可证与项目主页。仅供速查，实际版本请以项目官方为准。点击条目可复制坐标。</div>';
  var qin = host.querySelector('#lib-q');
  var fbox = host.querySelector('#lib-filter');
  var list = host.querySelector('#lib-list');

  var licSet = {};
  libs.forEach(function (b) { (b.l || []).forEach(function (l) { if (l) licSet[l] = 1; }); });
  var lics = Object.keys(licSet).sort();

  function drawFilter() {
    var h = '<button class="chip' + (state.lic === '' ? ' active' : '') + '" data-lib-lic="">全部许可证</button>';
    for (var i = 0; i < lics.length && i < 12; i++) {
      var l = lics[i];
      h += '<button class="chip' + (state.lic === l ? ' active' : '') + '" data-lib-lic="' + v23Esc(l) + '">' + v23Esc(l) + '</button>';
    }
    fbox.innerHTML = h;
  }
  function filtered() {
    var out = [];
    for (var i = 0; i < libs.length; i++) {
      var b = libs[i];
      if (state.lic && (b.l || []).indexOf(state.lic) < 0) continue;
      if (state.q) {
        var q = state.q.toLowerCase();
        if ((b.g + ' ' + b.n + ' ' + b.p).toLowerCase().indexOf(q) < 0) continue;
      }
      out.push(b);
    }
    return out;
  }
  function drawList() {
    var arr = filtered();
    list._arr = arr;
    if (!arr.length) { list.innerHTML = '<div class="hint">没有匹配的开源库</div>'; return; }
    var h = '<div class="hint" style="margin-bottom:8px">共 ' + arr.length + ' 条</div>';
    for (var i = 0; i < arr.length; i++) {
      var b = arr[i];
      h += '<button class="dl-row" data-lib-open="' + i + '" style="width:100%;text-align:left">' +
        '<span><b>' + v23Esc(b.p || b.n) + '</b><br><small style="color:var(--on-surface-variant)">' + v23Esc(b.g) + ':' + v23Esc(b.n) + ' · ' + v23Esc(b.v) + '</small></span>' +
        '<small>' + v23Esc((b.l || []).join(', ')) + '</small></button>';
    }
    list.innerHTML = h;
  }
  host.addEventListener('click', function (ev) {
    var t = ev.target;
    var lb = t.closest ? t.closest('[data-lib-lic]') : null;
    if (lb) { state.lic = lb.getAttribute('data-lib-lic'); drawFilter(); drawList(); return; }
    var ob = t.closest ? t.closest('[data-lib-open]') : null;
    if (ob) {
      var b = (list._arr || [])[parseInt(ob.getAttribute('data-lib-open'), 10)];
      if (b) api.copy(b.g + ':' + b.n + ':' + b.v + '\n许可证：' + (b.l || []).join(', ') + '\n主页：' + (b.u || ''));
    }
  });
  qin.addEventListener('input', function () { state.q = qin.value.trim(); drawList(); });
  drawFilter(); drawList();
}
T({ id: 'openSourceLibs', name: '开源库速查', cat: 'dev', tint: '#D8EAE9',
  desc: '217 条开源库与许可证查询', tags: '开源 许可证 license 依赖 库 AndroidX Kotlin',
  custom: function (host, api) { v23LibsInit(host, api); } });
