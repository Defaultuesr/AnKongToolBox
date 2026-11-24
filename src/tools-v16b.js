/* ============================================================
   安空工具箱 — v1.6 工具包（下）26~50
   计算 1 · 生活 7 · 查询速查 7 · 媒体前端 5 · 设备 3 · 互动 2
   纯离线运行，沿用 ES5 兼容写法
   ============================================================ */
(function () {
'use strict';

function esc(s) { return H.esc(s == null ? '' : String(s)); }
function R(html, text) {
  return { html: html, text: text == null
    ? String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s{2,}/g, ' ').trim()
    : String(text) };
}
function KV(rows) {
  return '<div class="kv-box">' + rows.map(function (r) {
    return '<div class="kv"><span>' + esc(r[0]) + '</span><span>' + r[1] + '</span></div>';
  }).join('') + '</div>';
}
function TB(head, rows) {
  return H.table(head, rows.map(function (r) {
    return r.map(function (c) { return esc(c); });
  }));
}
function PRE(s) {
  return '<pre style="white-space:pre-wrap;word-break:break-all;font:12.5px/1.7 ui-monospace,Menlo,Consolas,monospace;margin:0;padding:2px 0">' + esc(s) + '</pre>';
}
function SEC(t) { return '<div class="sec-label" style="margin-top:14px">' + esc(t) + '</div>'; }
function HINT(t) { return '<div class="hint" style="margin-top:10px">' + esc(t) + '</div>'; }
function num(v, d) { return H.num(v, d == null ? 4 : d); }
function lines(s) { return String(s || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n'); }
function pnum(v, d) { var n = parseFloat(v); return isFinite(n) ? n : (d || 0); }
function rnd(n, d) { var p = Math.pow(10, d == null ? 2 : d); return Math.round(n * p) / p; }
function pad2(n) { return n < 10 ? '0' + n : String(n); }
function money(n) { return (Math.round(n * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function fmtD(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function mkRnd(seed) {
  if (!seed) return Math.random;
  var s = 2166136261;
  for (var i = 0; i < seed.length; i++) { s ^= seed.charCodeAt(i); s = (s * 16777619) >>> 0; }
  return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function shuffle(arr, rf) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(rf() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/* ============================================================
   四、计算换算（1）
   ============================================================ */

T({ id: 'matrix', name: '矩阵运算', cat: 'calc',
  desc: '行列式、逆矩阵、加减乘、转置与迹，支持任意方阵', tags: '矩阵 行列式 逆矩阵 转置 线性代数 计算',
  fields: [
    { k: 'a', label: '矩阵 A（JSON 二维数组）', type: 'textarea', rows: 5, value: '[[4, 7], [2, 6]]' },
    { k: 'b', label: '矩阵 B（二元运算时）', type: 'textarea', rows: 5, value: '[[1, 2], [3, 4]]' },
    { k: 'op', label: '运算', type: 'select', value: 'det', options: [
      ['det', '行列式 det(A)'], ['inv', '逆矩阵 A⁻¹'], ['add', 'A + B'], ['sub', 'A − B'],
      ['mul', 'A × B'], ['trans', '转置 Aᵀ'], ['trace', '迹 tr(A)'] ] }
  ],
  run: function (v) {
    function parse(s) {
      var a = JSON.parse(String(s));
      if (!a || !a.length || !Array.isArray(a[0])) throw new Error('需要二维数组');
      var n = a[0].length;
      for (var i = 0; i < a.length; i++) {
        if (!Array.isArray(a[i]) || a[i].length !== n) throw new Error('各行长度必须一致');
        for (var j = 0; j < n; j++) if (!isFinite(Number(a[i][j]))) throw new Error('元素必须为数字');
      }
      return a.map(function (r) { return r.map(Number); });
    }
    var A, B;
    try { A = parse(v.a); B = String(v.b || '').trim() ? parse(v.b) : null; }
    catch (e) { return R('<div class="note">矩阵解析失败：' + esc(e.message) + '</div>', '错误：' + e.message); }
    var nr = A.length, nc = A[0].length, res = null, scalar = null, extra = '';
    function clone(x) { return x.map(function (r) { return r.slice(); }); }
    function matText(m) { return m.map(function (r) { return '[ ' + r.map(function (x) { return num(x, 4); }).join(',  ') + ' ]'; }).join('\n'); }
    function show(m) {
      var head = [];
      for (var i = 0; i < m[0].length; i++) head.push('C' + (i + 1));
      return TB(head, m.map(function (r, i) { return ['R' + (i + 1)].concat(r.map(function (x) { return num(x, 5); })); }));
    }
    try {
      if (v.op === 'det' || v.op === 'inv') {
        if (nr !== nc) throw new Error('行列式与逆矩阵要求方阵');
        var n = nr, M = clone(A), det = 1;
        var aug = v.op === 'inv';
        var W = M;
        if (aug) {
          W = M.map(function (r, i) {
            return r.concat(Array.apply(null, new Array(n)).map(function (_, j) { return i === j ? 1 : 0; }));
          });
        }
        for (var c = 0; c < n; c++) {
          var piv = c;
          for (var rr = c + 1; rr < n; rr++) if (Math.abs(W[rr][c]) > Math.abs(W[piv][c])) piv = rr;
          if (Math.abs(W[piv][c]) < 1e-12) { det = 0; break; }
          if (piv !== c) { var t = W[piv]; W[piv] = W[c]; W[c] = t; det = -det; }
          det *= W[c][c];
          var pv = W[c][c];
          for (var cc = 0; cc < W[c].length; cc++) W[c][cc] /= pv;
          for (var r2 = 0; r2 < n; r2++) {
            if (r2 === c) continue;
            var f = W[r2][c];
            if (!f) continue;
            for (var c2 = 0; c2 < W[c].length; c2++) W[r2][c2] -= f * W[c][c2];
          }
        }
        scalar = det;
        if (v.op === 'inv') {
          if (det === 0) throw new Error('行列式为 0，矩阵不可逆');
          res = W.map(function (r) { return r.slice(n); });
          extra = KV([['行列式 det(A)', num(det, 6)], ['是否可逆', '是']]);
        } else {
          extra = KV([['行列式 det(A)', num(det, 6)],
            ['是否可逆', det === 0 ? '否（奇异矩阵）' : '是'],
            ['矩阵阶数', n + ' × ' + n]]);
        }
      } else if (v.op === 'trans') {
        res = [];
        for (var j = 0; j < nc; j++) { res.push([]); for (var i2 = 0; i2 < nr; i2++) res[j].push(A[i2][j]); }
        extra = KV([['维度', nr + ' × ' + nc + ' → ' + nc + ' × ' + nr]]);
      } else if (v.op === 'trace') {
        if (nr !== nc) throw new Error('迹要求方阵');
        scalar = 0; for (var k = 0; k < nr; k++) scalar += A[k][k];
        extra = KV([['迹 tr(A)', num(scalar, 6)], ['阶数', nr + ' × ' + nr]]);
      } else {
        if (!B) throw new Error('该运算需要提供矩阵 B');
        var br = B.length, bc = B[0].length;
        if (v.op === 'mul') {
          if (nc !== br) throw new Error('A 的列数必须等于 B 的行数');
          res = [];
          for (var i3 = 0; i3 < nr; i3++) {
            res.push([]);
            for (var j3 = 0; j3 < bc; j3++) {
              var s = 0;
              for (var k3 = 0; k3 < nc; k3++) s += A[i3][k3] * B[k3][j3];
              res[i3].push(s);
            }
          }
        } else {
          if (nr !== br || nc !== bc) throw new Error('加减法要求两个矩阵维度相同');
          res = A.map(function (r, i4) { return r.map(function (x, j4) { return v.op === 'add' ? x + B[i4][j4] : x - B[i4][j4]; }); });
        }
        extra = KV([['A 维度', nr + ' × ' + nc], ['B 维度', br + ' × ' + bc]]);
      }
    } catch (e2) { return R('<div class="note">运算失败：' + esc(e2.message) + '</div>', '错误：' + e2.message); }
    var label = { det: '行列式', inv: '逆矩阵', add: 'A + B', sub: 'A − B', mul: 'A × B', trans: '转置', trace: '迹' }[v.op];
    var body = res ? (show(res) + SEC('纯文本形式') + PRE(matText(res))) : extra;
    return R(KV([['运算', label], ['矩阵 A', nr + ' × ' + nc],
      ['矩阵 B', B ? B.length + ' × ' + B[0].length : '未提供']]) +
      SEC('计算结果') + body + (res ? extra : '') +
      HINT('行列式与逆矩阵用高斯消元（部分主元）计算，浮点结果保留 5 位小数。'),
      res ? matText(res) : String(scalar));
  }
});

/* ============================================================
   五、生活工具（7）
   ============================================================ */

T({ id: 'seatgroup', name: '随机分组编排', cat: 'life',
  desc: '把名单随机或蛇形分成 N 组，输出每组名单与人数', tags: '分组 随机 抽签 名单 编排 团建',
  fields: [
    { k: 'names', label: '名单（每行一个）', type: 'textarea', rows: 8,
      value: '张伟\n王芳\n李娜\n刘洋\n陈静\n杨帆\n赵磊\n黄敏\n周杰\n吴秀\n徐强\n孙丽' },
    { k: 'groups', label: '分组数量', type: 'text', value: '4' },
    { k: 'mode', label: '分组方式', type: 'select', value: 'random', options: [
      ['random', '完全随机均分'], ['snake', '蛇形轮流'], ['order', '保持原顺序均分'] ] },
    { k: 'seed', label: '随机种子（留空则每次不同）', type: 'text', value: '' }
  ],
  run: function (v) {
    var ns = lines(v.names).map(function (x) { return x.trim(); }).filter(function (x) { return x; });
    var g = Math.max(1, Math.min(30, parseInt(v.groups, 10) || 4));
    var rf = mkRnd(String(v.seed || '').trim());
    var order = v.mode === 'order' ? ns.slice() : shuffle(ns, rf);
    var buckets = []; for (var i = 0; i < g; i++) buckets.push([]);
    order.forEach(function (n, idx) {
      var pos = v.mode === 'snake'
        ? (Math.floor(idx / g) % 2 === 0 ? idx % g : g - 1 - (idx % g))
        : idx % g;
      buckets[pos].push(n);
    });
    var maxN = buckets[0].length;
    var rows = buckets.map(function (b, i2) { return ['第 ' + (i2 + 1) + ' 组', String(b.length), b.join('、') || '（空）']; });
    return R(KV([['名单人数', ns.length + ' 人'], ['分组数量', g + ' 组'],
      ['每组人数', Math.floor(ns.length / g) + ' ~ ' + Math.ceil(ns.length / g) + ' 人'],
      ['分组方式', { random: '完全随机均分', snake: '蛇形轮流', order: '保持原顺序' }[v.mode]],
      ['随机种子', v.seed ? esc(v.seed) : '未指定（每次不同）']]) +
      SEC('分组结果') + TB(['组别', '人数', '成员'], rows) +
      SEC('逐组名单') + PRE(buckets.map(function (b, i3) {
        return '【第 ' + (i3 + 1) + ' 组 · ' + b.length + ' 人】\n' + (b.join('\n') || '（空）');
      }).join('\n\n')) + HINT('填写相同随机种子可复现同一份分组结果，便于核对与公示。'),
      buckets.map(function (b, i4) { return '第' + (i4 + 1) + '组: ' + b.join('、'); }).join('\n'));
  }
});

T({ id: 'drawlots', name: '抽签与随机排序', cat: 'life',
  desc: '洗牌名单、抽取 N 名或生成不带重复的出场顺序', tags: '抽签 随机 洗牌 点名 顺序 抽奖',
  fields: [
    { k: 'names', label: '名单（每行一个）', type: 'textarea', rows: 7,
      value: '一号选手\n二号选手\n三号选手\n四号选手\n五号选手\n六号选手\n七号选手\n八号选手' },
    { k: 'n', label: '抽取人数', type: 'text', value: '3' },
    { k: 'mode', label: '模式', type: 'select', value: 'draw', options: [
      ['draw', '抽取 N 名'], ['shuffle', '仅洗牌排序'], ['order', '生成出场顺序'] ] },
    { k: 'seed', label: '随机种子（可复现）', type: 'text', value: '' }
  ],
  run: function (v) {
    var ns = lines(v.names).map(function (x) { return x.trim(); }).filter(function (x) { return x; });
    var k = Math.max(1, Math.min(ns.length || 1, parseInt(v.n, 10) || 3));
    var rf = mkRnd(String(v.seed || '').trim());
    var sh = shuffle(ns, rf);
    var picked = sh.slice(0, k), rest = sh.slice(k);
    var rows = sh.map(function (n, i) { return [String(i + 1), n, i < k ? '★ 中签 / 选中' : '—']; });
    return R(KV([['名单人数', ns.length + ' 人'], ['抽取人数', k + ' 人'],
      ['模式', { draw: '抽取 N 名', shuffle: '仅洗牌排序', order: '生成出场顺序' }[v.mode]],
      ['随机种子', v.seed ? esc(v.seed) : '未指定'],
      ['重复项', (function () { var m = {}; var d = 0; ns.forEach(function (x) { if (m[x]) d++; m[x] = 1; }); return d ? d + ' 个（注意去重）' : '无'; })()]]) +
      SEC(v.mode === 'shuffle' ? '洗牌结果' : '完整随机顺序') +
      TB(['顺序', '名单', '标记'], rows) +
      (v.mode !== 'shuffle' ? SEC('本次选中') + PRE(picked.map(function (x, i2) { return (i2 + 1) + '. ' + x; }).join('\n')) : '') +
      (v.mode === 'draw' ? SEC('未中签名单') + PRE(rest.join('\n') || '（无）') : '') +
      HINT('使用 Fisher–Yates 洗牌，每个位置等概率；填写相同种子可复现结果。'),
      picked.join('\n'));
  }
});

T({ id: 'sleepcycle', name: '睡眠周期推荐', cat: 'life',
  desc: '按 90 分钟睡眠周期推荐入睡或起床时间', tags: '睡眠 周期 起床 入睡 作息 90分钟',
  fields: [
    { k: 'mode', label: '已知条件', type: 'select', value: 'wake', options: [
      ['wake', '已知起床时间 → 推荐入睡'], ['sleep', '已知入睡时间 → 推荐起床'] ] },
    { k: 'time', label: '时间（HH:mm）', type: 'text', value: '07:00' },
    { k: 'latency', label: '入睡耗时（分钟）', type: 'text', value: '15' },
    { k: 'cycles', label: '期望周期数', type: 'text', value: '5' }
  ],
  run: function (v) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(v.time || '').trim());
    if (!m) return R('<div class="note">请按 HH:mm 格式填写时间，例如 07:00。</div>', '时间格式错误');
    var base = new Date(2026, 0, 1, parseInt(m[1], 10) % 24, parseInt(m[2], 10) % 60, 0, 0);
    var lat = Math.max(0, Math.min(120, parseInt(v.latency, 10) || 15));
    var want = Math.max(3, Math.min(7, parseInt(v.cycles, 10) || 5));
    var rows = [];
    for (var c = 3; c <= 6; c++) {
      var delta = (c * 90 + lat) * 60000;
      var t = new Date(base.getTime() + (v.mode === 'wake' ? -delta : delta));
      rows.push([String(c), num(c * 90 / 60, 1) + ' 小时',
        pad2(t.getHours()) + ':' + pad2(t.getMinutes()), c === want ? '★ 推荐' : '']);
    }
    var best = null;
    rows.forEach(function (r) { if (r[3]) best = r[2]; });
    var totalMin = want * 90;
    return R(KV([['已知条件', v.mode === 'wake' ? '起床 ' + v.time : '入睡 ' + v.time],
      ['入睡耗时', lat + ' 分钟'], ['期望周期', want + ' 个（' + num(totalMin / 60, 1) + ' 小时）'],
      ['推荐' + (v.mode === 'wake' ? '入睡' : '起床') + '时间', best || '—']]) +
      SEC('各周期候选时间') + TB(['周期数', '睡眠时长', '推荐时间', '备注'], rows) +
      HINT('成年人一个睡眠周期约 90 分钟，在周期结束时醒来通常更清醒；建议预留 15 分钟入睡时间。'),
      rows.map(function (r) { return r[0] + ' 周期 → ' + r[2]; }).join('\n'));
  }
});

T({ id: 'debtsimplify', name: '债务简化结算', cat: 'life',
  desc: '由多行欠款关系算出净额，给出最少转账次数的结算方案', tags: '债务 AA 结算 分摊 转账 净额 简化',
  fields: [
    { k: 'rows', label: '欠款记录（每行：A 欠 B 金额）', type: 'textarea', rows: 8,
      value: '张三 李四 120\n李四 王五 80\n王五 张三 50\n张三 王五 30\n赵六 张三 60' }
  ],
  run: function (v) {
    var net = {}, records = [], total = 0;
    lines(v.rows).forEach(function (ln, idx) {
      var p = ln.trim().split(/[\s,，欠]+/).filter(function (x) { return x; });
      if (p.length < 3) return;
      var amt = parseFloat(p[2]); if (!isFinite(amt)) return;
      var a = p[0], b = p[1];
      net[a] = (net[a] || 0) - amt; net[b] = (net[b] || 0) + amt;
      total += amt; records.push([String(idx + 1), a, b, money(amt)]);
    });
    var debtors = [], creditors = [];
    Object.keys(net).forEach(function (k) {
      var n = Math.round(net[k] * 100) / 100;
      if (n < -0.005) debtors.push([k, -n]);
      else if (n > 0.005) creditors.push([k, n]);
    });
    debtors.sort(function (a, b) { return b[1] - a[1]; });
    creditors.sort(function (a, b) { return b[1] - a[1]; });
    var pay = [], di = 0, ci = 0, guard = 0;
    while (di < debtors.length && ci < creditors.length && guard++ < 500) {
      var amt2 = Math.min(debtors[di][1], creditors[ci][1]);
      amt2 = Math.round(amt2 * 100) / 100;
      if (amt2 > 0.005) pay.push([debtors[di][0], creditors[ci][0], money(amt2)]);
      debtors[di][1] = Math.round((debtors[di][1] - amt2) * 100) / 100;
      creditors[ci][1] = Math.round((creditors[ci][1] - amt2) * 100) / 100;
      if (debtors[di][1] <= 0.005) di++;
      if (creditors[ci][1] <= 0.005) ci++;
    }
    var netRows = Object.keys(net).sort(function (a, b) { return net[b] - net[a]; }).map(function (k) {
      var n = Math.round(net[k] * 100) / 100;
      return [k, n > 0 ? '应收 ¥' + money(n) : n < 0 ? '应付 ¥' + money(-n) : '已平', n > 0 ? '债权人' : n < 0 ? '债务人' : '—'];
    });
    return R(KV([['原始记录', records.length + ' 条'], ['涉及人数', Object.keys(net).length + ' 人'],
      ['原始往来总额', '¥ ' + money(total)], ['简化后转账次数', pay.length + ' 笔'],
      ['转账总额', '¥ ' + money(pay.reduce(function (s, x) { return s + parseFloat(x[2].replace(/,/g, '')); }, 0))]]) +
      SEC('每人净额') + (netRows.length ? TB(['成员', '净额', '角色'], netRows) : '<div class="note">没有有效记录。</div>') +
      SEC('最少转账方案') + (pay.length ? TB(['付款方', '收款方', '金额'], pay) : '<div class="note">无需转账。</div>') +
      SEC('原始记录') + (records.length ? TB(['#', '欠款方', '收款方', '金额'], records) : '') +
      HINT('采用「净额 + 最大额优先」贪心匹配，最多需要 n−1 笔转账；金额按分四舍五入。'),
      pay.map(function (x) { return x[0] + ' → ' + x[1] + ' ¥' + x[2]; }).join('\n'));
  }
});

T({ id: 'rentutil', name: '水电燃气分摊', cat: 'life',
  desc: '按人数、居住天数或分表用量分摊账单，自动补齐尾差', tags: '房租 水电费 分摊 合租 账单 均摊',
  fields: [
    { k: 'total', label: '账单总额（元）', type: 'text', value: '386.50' },
    { k: 'mode', label: '分摊依据', type: 'select', value: 'avg', options: [
      ['avg', '按人数均摊'], ['days', '按居住天数'], ['usage', '按分表用量'] ] },
    { k: 'detail', label: '明细（每行：姓名 数值）', type: 'textarea', rows: 6,
      value: '张三 30\n李四 30\n王五 26\n赵六 14' }
  ],
  run: function (v) {
    var total = Math.round(pnum(v.total, 0) * 100);
    var items = [];
    lines(v.detail).forEach(function (ln) {
      var p = ln.trim().split(/[\s,，]+/).filter(function (x) { return x; });
      if (p.length >= 2) { var q = parseFloat(p[1]); if (isFinite(q) && q >= 0) items.push([p[0], q]); }
    });
    if (!items.length) items.push(['成员 A', 1], ['成员 B', 1]);
    var sum = items.reduce(function (s, x) { return s + x[1]; }, 0);
    if (sum <= 0) sum = 1;
    var alloc = [], used = 0;
    items.forEach(function (it, i) {
      var cents = i === items.length - 1 ? total - used : Math.round(total * it[1] / sum);
      used += cents; alloc.push([it[0], it[1], cents]);
    });
    var rows = alloc.map(function (a) { return [a[0], num(a[1], 2), num(a[1] / sum * 100, 2) + '%', '¥ ' + money(a[2] / 100)]; });
    return R(KV([['账单总额', '¥ ' + money(total / 100)],
      ['分摊依据', { avg: '按人数均摊', days: '按居住天数', usage: '按分表用量' }[v.mode]],
      ['参与人数', items.length + ' 人'], ['数值合计', num(sum, 2)],
      ['分摊合计', '¥ ' + money(used / 100)], ['尾差', used === total ? '0.00（已自动补齐）' : money((total - used) / 100)]]) +
      SEC('分摊明细') + TB(['成员', '权重数值', '占比', '应付'], rows) +
      SEC('收款清单') + PRE(alloc.map(function (a) { return a[0] + '：¥ ' + money(a[2] / 100); }).join('\n')) +
      HINT('按「分」为单位计算，最后一人的金额自动补齐四舍五入产生的尾差，确保合计与账单完全一致。'),
      alloc.map(function (a) { return a[0] + ' ¥' + money(a[2] / 100); }).join('\n'));
  }
});

T({ id: 'movingbox', name: '搬家纸箱估算', cat: 'life',
  desc: '按房间与人数估算箱数、体积、购箱费用与车辆建议', tags: '搬家 纸箱 估算 体积 打包 物流',
  fields: [
    { k: 'rooms', label: '房间数', type: 'text', value: '3' },
    { k: 'people', label: '常住人数', type: 'text', value: '2' },
    { k: 'level', label: '物品量', type: 'select', value: 'normal', options: [
      ['minimal', '极简（少家具书籍）'], ['normal', '常规'], ['lots', '物品很多'] ] },
    { k: 'price', label: '纸箱均价（元 / 个）', type: 'text', value: '6' }
  ],
  run: function (v) {
    var rooms = Math.max(0, pnum(v.rooms, 0)), ppl = Math.max(0, pnum(v.people, 0));
    var f = { minimal: 0.65, normal: 1, lots: 1.6 }[v.level];
    var small = Math.round((rooms * 3 + ppl * 2) * f);
    var medium = Math.round((rooms * 4 + ppl * 1) * f);
    var large = Math.round((rooms * 1.2 + ppl * 0.8) * f);
    var total = small + medium + large;
    var vol = small * 0.025 + medium * 0.055 + large * 0.11;
    var price = pnum(v.price, 0);
    var car = vol < 1.2 ? '轿车 / 小型面包车' : vol < 2.8 ? '面包车（1 趟）' : vol < 5 ? '厢式货车（1 趟）' : '厢式货车（2 趟以上）';
    var hours = rnd(total * 0.06 + rooms * 0.5, 1);
    return R(KV([['房间 / 人数', rooms + ' 间 / ' + ppl + ' 人'],
      ['物品量系数', num(f, 2)], ['纸箱总数', total + ' 个'],
      ['估算体积', num(vol, 2) + ' m³'], ['购箱费用', '¥ ' + money(total * price)],
      ['打包耗时', num(hours, 1) + ' 小时'], ['车辆建议', car]]) +
      SEC('纸箱配比') + TB(['箱型', '参考尺寸', '数量', '单箱体积', '小计体积'], [
        ['小箱', '30×25×25 cm', String(small), '0.025 m³', num(small * 0.025, 3) + ' m³'],
        ['中箱', '40×35×35 cm', String(medium), '0.055 m³', num(medium * 0.055, 3) + ' m³'],
        ['大箱', '50×45×45 cm', String(large), '0.110 m³', num(large * 0.11, 3) + ' m³']
      ]) + SEC('打包顺序建议') +
      PRE('1. 先装箱：换季衣物、书籍、收藏品\n2. 再装箱：厨房用品、洗漱用品（注意防漏）\n3. 最后：当日必需品单独留一个「开箱即用」箱\n4. 每个箱子标注房间 + 内容 + 是否易碎') +
      HINT('估算基于常见搬家经验系数，实际受家具拆装、书籍数量与收纳习惯影响较大，建议多备 10% 纸箱。'),
      'total=' + total + ', volume=' + num(vol, 2) + ' m3, cost=' + money(total * price));
  }
});

T({ id: 'studyplan', name: '艾宾浩斯复习计划', cat: 'life',
  desc: '按遗忘曲线间隔生成每日新学与复习任务表', tags: '复习 记忆 艾宾浩斯 学习计划 间隔重复 日程',
  fields: [
    { k: 'name', label: '学习主题', type: 'text', value: '英语词汇 Unit 1' },
    { k: 'start', label: '开始日期', type: 'date', value: '2026-11-16' },
    { k: 'days', label: '新学天数', type: 'text', value: '7' },
    { k: 'intervals', label: '复习间隔（天，逗号分隔）', type: 'text', value: '1,2,4,7,15,30' }
  ],
  run: function (v) {
    var sd = new Date(String(v.start || '') + 'T00:00:00');
    if (isNaN(sd.getTime())) sd = new Date();
    var days = Math.max(1, Math.min(60, parseInt(v.days, 10) || 7));
    var iv = String(v.intervals || '1,2,4,7,15,30').split(/[,，\s]+/).map(function (x) { return parseInt(x, 10); })
      .filter(function (x) { return isFinite(x) && x > 0; }).sort(function (a, b) { return a - b; });
    if (!iv.length) iv = [1, 2, 4, 7, 15, 30];
    var maxIv = iv[iv.length - 1], rows = [], totalRev = 0;
    for (var d = 0; d < days + maxIv; d++) {
      var date = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate() + d);
      var fresh = d < days ? String(v.name || '新内容') + ' · 第 ' + (d + 1) + ' 单元' : '—';
      var rev = [];
      iv.forEach(function (gap) { var src = d - gap; if (src >= 0 && src < days) rev.push('第 ' + (src + 1) + ' 单元（+' + gap + '天）'); });
      totalRev += rev.length;
      if (fresh !== '—' || rev.length) rows.push([fmtD(date), 'D' + (d + 1), fresh, rev.join('、') || '—', String(rev.length)]);
    }
    return R(KV([['学习主题', esc(v.name)], ['开始日期', fmtD(sd)],
      ['新学天数', days + ' 天'], ['复习间隔', iv.join(' / ') + ' 天'],
      ['计划总天数', (days + maxIv) + ' 天'], ['复习任务总数', totalRev + ' 次'],
      ['平均每日复习', num(totalRev / (days + maxIv), 2) + ' 次']]) +
      SEC('每日任务表') + TB(['日期', '第几天', '新学内容', '复习任务', '复习数'], rows) +
      HINT('复习间隔可自定义，常见组合为 1 / 2 / 4 / 7 / 15 / 30 天；表格自动延伸到最后一个复习日。'),
      rows.map(function (r) { return r[0] + ' 新学:' + r[2] + ' 复习:' + r[3]; }).join('\n'));
  }
});

/* ============================================================
   六、查询速查（7）
   ============================================================ */

T({ id: 'httpmethod', name: 'HTTP 方法速查', cat: 'query',
  desc: 'HTTP 方法、幂等与缓存特性，附请求头与状态码分类速查', tags: 'http get post 幂等 请求头 状态码 速查',
  fields: [
    { k: 'q', label: '搜索关键词', type: 'text', value: '' },
    { k: 'mode', label: '查看内容', type: 'select', value: 'method', options: [
      ['method', 'HTTP 方法'], ['header', '常见请求头'], ['status', '状态码分类'], ['all', '全部'] ] }
  ],
  run: function (v) {
    var methods = [
      ['GET', '读取资源', '是', '可缓存', '无', '查询、详情页'],
      ['HEAD', '只取响应头', '是', '可缓存', '无', '探测存在性 / 大小'],
      ['POST', '提交数据 / 创建', '否', '一般不缓存', '有', '表单提交、新建'],
      ['PUT', '整体替换资源', '是', '否', '有', '全量更新'],
      ['PATCH', '局部修改资源', '否', '否', '有', '部分字段更新'],
      ['DELETE', '删除资源', '是', '否', '通常无', '删除'],
      ['OPTIONS', '查询允许的方法', '是', '否', '无', 'CORS 预检'],
      ['TRACE', '回显请求（诊断）', '是', '否', '无', '调试，常被禁用'],
      ['CONNECT', '建立隧道', '否', '否', '无', 'HTTPS 代理']
    ];
    var headers = [
      ['Accept', '声明可接受的响应类型'], ['Content-Type', '请求体的媒体类型'],
      ['Authorization', '认证凭证 Bearer / Basic'], ['User-Agent', '客户端标识'],
      ['Cache-Control', '缓存策略指令'], ['If-None-Match', '配合 ETag 做条件请求'],
      ['If-Modified-Since', '按修改时间做条件请求'], ['Cookie', '携带会话 Cookie'],
      ['Origin', '跨域请求来源'], ['Referer', '来源页面'],
      ['Accept-Encoding', '可接受的压缩算法'], ['X-Requested-With', '标识 Ajax 请求']
    ];
    var status = [
      ['1xx', '信息', '请求已接收，继续处理'], ['2xx', '成功', '200 / 201 / 204'],
      ['3xx', '重定向', '301 / 302 / 304'], ['4xx', '客户端错误', '400 / 401 / 403 / 404 / 429'],
      ['5xx', '服务端错误', '500 / 502 / 503 / 504']
    ];
    var q = String(v.q || '').trim().toLowerCase();
    function hit(arr) { return !q || arr.join(' ').toLowerCase().indexOf(q) >= 0; }
    var out = '';
    if (v.mode === 'method' || v.mode === 'all') {
      var mm = methods.filter(hit);
      out += SEC('HTTP 方法（' + mm.length + '）') + (mm.length ? TB(['方法', '语义', '幂等', '缓存', '请求体', '常见用途'], mm) : '<div class="note">没有匹配项。</div>');
    }
    if (v.mode === 'header' || v.mode === 'all') {
      var hh = headers.filter(hit);
      out += SEC('常见请求头（' + hh.length + '）') + (hh.length ? TB(['请求头', '说明'], hh) : '<div class="note">没有匹配项。</div>');
    }
    if (v.mode === 'status' || v.mode === 'all') {
      var ss = status.filter(hit);
      out += SEC('状态码分类（' + ss.length + '）') + (ss.length ? TB(['类别', '含义', '常见码'], ss) : '<div class="note">没有匹配项。</div>');
    }
    return R(KV([['查看内容', { method: 'HTTP 方法', header: '常见请求头', status: '状态码分类', all: '全部' }[v.mode]],
      ['搜索关键词', q || '（全部）'], ['方法条目', methods.length + ' 条'],
      ['请求头条目', headers.length + ' 条']]) + out +
      HINT('幂等指多次执行同一请求对服务器资源的影响相同；安全性指不修改资源。'),
      methods.map(function (m) { return m.join(' | '); }).join('\n'));
  }
});

T({ id: 'keycode', name: '键码速查', cat: 'query',
  desc: '常用按键 KeyCode、ASCII 控制字符与字母数字编码表', tags: '键码 keycode ascii 按键 编码 速查',
  fields: [
    { k: 'q', label: '搜索关键词', type: 'text', value: '' },
    { k: 'mode', label: '查看内容', type: 'select', value: 'keys', options: [
      ['keys', '常用按键'], ['ascii', 'ASCII 可打印字符'], ['ctrl', '控制字符'], ['all', '全部'] ] }
  ],
  run: function (v) {
    var keys = [
      ['Backspace', '8', '退格'], ['Tab', '9', '制表'], ['Enter', '13', '回车'],
      ['Shift', '16', '上档'], ['Ctrl', '17', '控制'], ['Alt', '18', '换挡'],
      ['Caps Lock', '20', '大写锁定'], ['Esc', '27', '退出'], ['Space', '32', '空格'],
      ['Page Up', '33', '上翻页'], ['Page Down', '34', '下翻页'], ['End', '35', '行尾'],
      ['Home', '36', '行首'], ['←', '37', '左方向'], ['↑', '38', '上方向'],
      ['→', '39', '右方向'], ['↓', '40', '下方向'], ['Insert', '45', '插入'],
      ['Delete', '46', '删除'], ['0~9', '48~57', '数字键'], ['A~Z', '65~90', '字母键'],
      ['Windows / Cmd', '91', '系统键'], ['F1~F12', '112~123', '功能键'],
      ['Num 0~9', '96~105', '小键盘'], ['; :', '186', '分号'], ['= +', '187', '等号'],
      [', <', '188', '逗号'], ['- _', '189', '减号'], ['. >', '190', '句点'],
      ['/ ?', '191', '斜杠'], ['` ~', '192', '反引号'], ['[ {', '219', '左方括号'],
      ['\\ |', '220', '反斜杠'], ['] }', '221', '右方括号'], ["' \"", '222', '引号']
    ];
    var ctrl = [['NUL', '0', '\\0', '空字符'], ['BEL', '7', '\\a', '响铃'], ['BS', '8', '\\b', '退格'],
      ['HT', '9', '\\t', '水平制表'], ['LF', '10', '\\n', '换行'], ['VT', '11', '\\v', '垂直制表'],
      ['FF', '12', '\\f', '换页'], ['CR', '13', '\\r', '回车'], ['ESC', '27', '\\e', '转义'],
      ['DEL', '127', '—', '删除']];
    var ascii = [];
    for (var c = 32; c <= 126; c++) ascii.push([String(c), c === 32 ? 'SPACE' : String.fromCharCode(c), '0x' + pad2(c.toString(16).toUpperCase())]);
    var q = String(v.q || '').trim().toLowerCase();
    function hit(a) { return !q || a.join(' ').toLowerCase().indexOf(q) >= 0; }
    var out = '';
    if (v.mode === 'keys' || v.mode === 'all') {
      var kk = keys.filter(hit);
      out += SEC('常用按键（' + kk.length + '）') + (kk.length ? TB(['按键', 'KeyCode', '说明'], kk) : '<div class="note">没有匹配项。</div>');
    }
    if (v.mode === 'ctrl' || v.mode === 'all') {
      var cc = ctrl.filter(hit);
      out += SEC('控制字符（' + cc.length + '）') + (cc.length ? TB(['名称', '十进制', '转义', '说明'], cc) : '<div class="note">没有匹配项。</div>');
    }
    if (v.mode === 'ascii' || v.mode === 'all') {
      var aa = ascii.filter(hit);
      out += SEC('ASCII 可打印字符 32~126（' + aa.length + '）') +
        (aa.length ? TB(['十进制', '字符', '十六进制'], aa.slice(0, 100)) : '<div class="note">没有匹配项。</div>');
    }
    return R(KV([['查看内容', { keys: '常用按键', ascii: 'ASCII 可打印字符', ctrl: '控制字符', all: '全部' }[v.mode]],
      ['搜索关键词', q || '（全部）'], ['按键条目', keys.length + ' 条'],
      ['控制字符', ctrl.length + ' 个'], ['可打印字符', ascii.length + ' 个']]) + out +
      HINT('KeyCode 为传统 event.keyCode 值；新代码建议使用 event.key / event.code。'),
      keys.map(function (r) { return r.join(' | '); }).join('\n'));
  }
});

T({ id: 'dynasty', name: '中国朝代纪年', cat: 'query',
  desc: '主要朝代起止年份、都城与存续年数，可按年份或名称查询', tags: '朝代 历史 纪年 年表 都城 中国历史',
  fields: [
    { k: 'q', label: '年份或关键词', type: 'text', value: '' },
    { k: 'mode', label: '查询方式', type: 'select', value: 'all', options: [
      ['all', '完整年表'], ['year', '按年份查询'], ['search', '按名称搜索'] ] }
  ],
  run: function (v) {
    var D = [
      ['夏', -2070, -1600, '斟鄩 / 安邑', '约'], ['商', -1600, -1046, '亳 / 殷', '约'],
      ['西周', -1046, -771, '镐京', ''], ['东周（春秋）', -770, -476, '洛邑', ''],
      ['东周（战国）', -475, -221, '洛邑', ''], ['秦', -221, -207, '咸阳', ''],
      ['西汉', -202, 8, '长安', ''], ['新', 8, 23, '常安', ''], ['东汉', 25, 220, '洛阳', ''],
      ['三国', 220, 280, '洛阳 / 成都 / 建业', ''], ['西晋', 265, 316, '洛阳', ''],
      ['东晋', 317, 420, '建康', ''], ['南北朝', 420, 589, '建康 / 平城 / 邺', ''],
      ['隋', 581, 618, '大兴 / 洛阳', ''], ['唐', 618, 907, '长安', ''],
      ['五代十国', 907, 979, '开封等', ''], ['北宋', 960, 1127, '东京开封府', ''],
      ['南宋', 1127, 1279, '临安', ''], ['辽', 907, 1125, '上京', ''],
      ['金', 1115, 1234, '中都 / 汴京', ''], ['元', 1271, 1368, '大都', ''],
      ['明', 1368, 1644, '应天 / 北京', ''], ['清', 1636, 1912, '北京', '']
    ];
    var q = String(v.q || '').trim();
    function yr(y) { return y < 0 ? '公元前 ' + (-y) + ' 年' : String(y) + ' 年'; }
    var rows = D.map(function (d) {
      return [d[0], yr(d[1]) + (d[4] ? '（约）' : ''), yr(d[2]),
        String(d[2] - d[1] + 1), d[3]];
    });
    var head = '<div class="kv-box"><div class="kv"><span>年表条目</span><span>' + D.length + ' 条</span></div></div>';
    var out = '';
    if (v.mode === 'year') {
      var y = parseInt(q, 10);
      if (!isFinite(y)) return R('<div class="note">请输入年份，负数表示公元前，例如 -221 或 1368。</div>', '年份无效');
      var hits = D.filter(function (d) { return y >= d[1] && y <= d[2]; });
      out = KV([['查询年份', (y < 0 ? '公元前 ' + (-y) : String(y)) + ' 年'],
        ['所处朝代', hits.length ? hits.map(function (d) { return d[0]; }).join('、') : '年表未收录']]) +
        SEC('匹配条目') + (hits.length ? TB(['朝代', '起始', '结束', '约年数', '都城'], hits.map(function (d) {
          return [d[0], yr(d[1]), yr(d[2]), String(d[2] - d[1] + 1), d[3]];
        })) : '<div class="note">该年份不在主要朝代区间内（可能存在分裂时期）。</div>');
    } else if (v.mode === 'search') {
      var f = D.filter(function (d) { return !q || d.join(' ').indexOf(q) >= 0; });
      out = TB(['朝代', '起始', '结束', '约年数', '都城'], f.map(function (d, i) { return rows[D.indexOf(d)]; })) ||
        '<div class="note">没有匹配项。</div>';
      if (!f.length) out = '<div class="note">没有匹配的朝代。</div>';
    } else {
      out = TB(['朝代', '起始', '结束', '约年数', '都城'], rows);
    }
    return R(head + KV([['查询方式', { all: '完整年表', year: '按年份查询', search: '按名称搜索' }[v.mode]],
      ['关键词', q || '（全部）']]) + SEC('年表') + out +
      HINT('远古与夏商周年代为学界推算，标注「约」；并列政权（辽 / 金 / 西夏等）可能与中原王朝年份重叠。'),
      D.map(function (d) { return d[0] + ' ' + d[1] + '~' + d[2]; }).join('\n'));
  }
});

T({ id: 'siprefix', name: 'SI 单位前缀速查', cat: 'query',
  desc: '国际单位制前缀 yocto~yotta 换算与完整对照表', tags: 'si 前缀 单位 换算 千 兆 毫 微 纳 速查',
  fields: [
    { k: 'val', label: '数值', type: 'text', value: '1' },
    { k: 'unit', label: '基础单位', type: 'text', value: 'm' },
    { k: 'from', label: '原前缀', type: 'select', value: 'k', options: [
      ['q', 'q 仄'], ['r', 'r 柔'], ['y', 'y 幺'], ['z', 'z 仄普托'], ['a', 'a 阿托'],
      ['f', 'f 飞母托'], ['p', 'p 皮可'], ['n', 'n 纳诺'], ['µ', 'µ 微'], ['m', 'm 毫'],
      ['c', 'c 厘'], ['d', 'd 分'], ['', '（无）'], ['da', 'da 十'], ['h', 'h 百'],
      ['k', 'k 千'], ['M', 'M 兆'], ['G', 'G 吉'], ['T', 'T 太'], ['P', 'P 拍'],
      ['E', 'E 艾'], ['Z', 'Z 泽'], ['Y', 'Y 尧'], ['R', 'R 容'], ['Q', 'Q 昆'] ] },
    { k: 'to', label: '目标前缀', type: 'select', value: 'M', options: [
      ['q', 'q 仄'], ['r', 'r 柔'], ['y', 'y 幺'], ['z', 'z 仄普托'], ['a', 'a 阿托'],
      ['f', 'f 飞母托'], ['p', 'p 皮可'], ['n', 'n 纳诺'], ['µ', 'µ 微'], ['m', 'm 毫'],
      ['c', 'c 厘'], ['d', 'd 分'], ['', '（无）'], ['da', 'da 十'], ['h', 'h 百'],
      ['k', 'k 千'], ['M', 'M 兆'], ['G', 'G 吉'], ['T', 'T 太'], ['P', 'P 拍'],
      ['E', 'E 艾'], ['Z', 'Z 泽'], ['Y', 'Y 尧'], ['R', 'R 容'], ['Q', 'Q 昆'] ] }
  ],
  run: function (v) {
    var E = { q: -30, r: -27, y: -24, z: -21, a: -18, f: -15, p: -12, n: -9,
      'µ': -6, m: -3, c: -2, d: -1, '': 0, da: 1, h: 2, k: 3, M: 6, G: 9,
      T: 12, P: 15, E: 18, Z: 21, Y: 24, R: 27, Q: 30 };
    var CN = { q: '仄', r: '柔', y: '幺', z: '仄普托', a: '阿托', f: '飞母托', p: '皮可',
      n: '纳诺', 'µ': '微', m: '毫', c: '厘', d: '分', '': '—', da: '十', h: '百',
      k: '千', M: '兆', G: '吉', T: '太', P: '拍', E: '艾', Z: '泽', Y: '尧', R: '容', Q: '昆' };
    var x = pnum(v.val, 0), u = String(v.unit || '');
    var base = x * Math.pow(10, E[v.from] || 0);
    var conv = base / Math.pow(10, E[v.to] || 0);
    var order = ['q', 'r', 'y', 'z', 'a', 'f', 'p', 'n', 'µ', 'm', 'c', 'd', '', 'da', 'h', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'R', 'Q'];
    var rows = order.map(function (p) {
      return [p || '(无)', CN[p], '10^' + E[p], '1e' + (E[p] > 0 ? '+' : '') + E[p],
        num(base / Math.pow(10, E[p]), 8) + ' ' + p + u];
    });
    return R(KV([['输入', num(x, 6) + ' ' + v.from + u],
      ['换算为基本单位', num(base, 8) + ' ' + u],
      ['换算结果', num(conv, 8) + ' ' + v.to + u],
      ['倍率', '10^' + ((E[v.from] || 0) - (E[v.to] || 0))]]) +
      SEC('全部前缀对照') + TB(['前缀', '中文', '指数', '倍率', '当前值换算'], rows) +
      HINT('2022 年新增 r / R / q / Q 四个前缀；计算机领域的 KB / MB 通常按 1024 进制，与 SI 的 1000 进制不同。'),
      num(conv, 8) + ' ' + v.to + u);
  }
});

T({ id: 'magicnum', name: '文件魔数速查', cat: 'query',
  desc: '按文件头十六进制识别真实文件类型，附常见格式魔数表', tags: '魔数 文件头 hex 文件类型 识别 签名 速查',
  fields: [
    { k: 'hex', label: '文件头（十六进制，可含空格）', type: 'text', value: '89 50 4E 47 0D 0A 1A 0A' },
    { k: 'mode', label: '模式', type: 'select', value: 'lookup', options: [
      ['lookup', '识别文件头'], ['all', '全部速查表'], ['search', '按扩展名搜索'] ] },
    { k: 'q', label: '搜索关键词', type: 'text', value: '' }
  ],
  run: function (v) {
    var SIG = [
      ['89 50 4E 47 0D 0A 1A 0A', 'PNG', 'image/png', 'PNG 图片'],
      ['FF D8 FF', 'JPG / JPEG', 'image/jpeg', 'JPEG 图片'],
      ['47 49 46 38 37 61', 'GIF87a', 'image/gif', 'GIF 动图'],
      ['47 49 46 38 39 61', 'GIF89a', 'image/gif', 'GIF 动图'],
      ['42 4D', 'BMP', 'image/bmp', '位图'],
      ['52 49 46 46', 'RIFF', '—', '可能是 WebP / WAV / AVI，需看后续字节'],
      ['25 50 44 46 2D', 'PDF', 'application/pdf', 'PDF 文档'],
      ['50 4B 03 04', 'ZIP', 'application/zip', 'ZIP / docx / xlsx / apk / jar'],
      ['50 4B 05 06', 'ZIP (空)', 'application/zip', '空 ZIP 归档'],
      ['50 4B 07 08', 'ZIP (分卷)', 'application/zip', '分卷 ZIP'],
      ['1F 8B', 'GZIP', 'application/gzip', 'gzip 压缩'],
      ['37 7A BC AF 27 1C', '7z', 'application/x-7z-compressed', '7-Zip 归档'],
      ['52 61 72 21 1A 07', 'RAR', 'application/vnd.rar', 'RAR 归档'],
      ['42 5A 68', 'BZ2', 'application/x-bzip2', 'bzip2 压缩'],
      ['7F 45 4C 46', 'ELF', '—', 'Linux / Android 可执行文件'],
      ['4D 5A', 'EXE / DLL', 'application/octet-stream', 'Windows PE 文件'],
      ['53 51 4C 69 74 65 20 66 6F 72 6D 61 74 20 33 00', 'SQLite', 'application/vnd.sqlite3', 'SQLite 数据库'],
      ['49 44 33', 'MP3', 'audio/mpeg', '带 ID3 标签的 MP3'],
      ['FF FB', 'MP3', 'audio/mpeg', 'MPEG 音频帧'],
      ['4F 67 67 53', 'OGG', 'audio/ogg', 'Ogg 容器'],
      ['66 74 79 70 69 73 6F 6D', 'MP4', 'video/mp4', 'ISO BMFF / MP4（偏移 4）'],
      ['00 01 00 00', 'TTF', 'font/ttf', 'TrueType 字体'],
      ['77 4F 46 46', 'WOFF', 'font/woff', 'Web Open Font'],
      ['77 4F 46 32', 'WOFF2', 'font/woff2', 'WOFF2 字体'],
      ['3C 3F 78 6D 6C', 'XML', 'text/xml', 'XML 声明'],
      ['7B', 'JSON', 'application/json', '以 { 开头的 JSON（弱特征）'],
      ['EF BB BF', 'UTF-8 BOM', '—', '带 BOM 的文本'],
      ['FF FE', 'UTF-16 LE BOM', '—', '小端 UTF-16 文本'],
      ['FE FF', 'UTF-16 BE BOM', '—', '大端 UTF-16 文本']
    ];
    var q = String(v.q || '').trim().toLowerCase();
    var out = '', info = '';
    if (v.mode === 'lookup') {
      var clean = String(v.hex || '').replace(/[^0-9a-f]/gi, '').toUpperCase();
      var best = null;
      SIG.forEach(function (s) {
        var sig = s[0].replace(/\s/g, '').toUpperCase();
        if (clean.indexOf(sig) === 0 || (s[0].indexOf('ftyp') < 0 && clean.indexOf(sig) >= 0 && sig.length >= 6)) {
          if (!best || sig.length > best[0].replace(/\s/g, '').length) best = s;
        }
      });
      info = best ? '识别为：' + best[1] + '（' + best[3] + '）' : '未匹配到已知魔数';
      out = KV([['输入字节', (clean.length / 2) + ' B'], ['规范化文件头', esc(clean.match(/.{1,2}/g) ? clean.match(/.{1,2}/g).slice(0, 16).join(' ') : '')],
        ['识别结果', esc(best ? best[1] : '未知')], ['MIME', esc(best ? best[2] : '—')],
        ['说明', esc(best ? best[3] : '可改用「全部速查表」对照，或检查是否读取了文件开头')]]) +
        (best ? SEC('匹配签名') + PRE(best[0]) : '');
    } else {
      var f = SIG.filter(function (s) { return !q || s.join(' ').toLowerCase().indexOf(q) >= 0; });
      out = TB(['文件头（十六进制）', '扩展名 / 类型', 'MIME', '说明'], f) ||
        '<div class="note">没有匹配项。</div>';
      if (!f.length) out = '<div class="note">没有匹配的条目。</div>';
    }
    return R(KV([['模式', { lookup: '识别文件头', all: '全部速查表', search: '按扩展名搜索' }[v.mode]],
      ['词库条目', SIG.length + ' 种'], ['关键词', q || '（全部）']]) +
      SEC('结果') + out +
      HINT('魔数只能判断「像什么」，不能保证文件完整或未被改坏；ZIP 系列（docx / apk / jar）共用同一文件头。'),
      info || SIG.map(function (s) { return s[1] + ' ' + s[0]; }).join('\n'));
  }
});

T({ id: 'emergency', name: '紧急电话速查', cat: 'query',
  desc: '中国与常用国家/地区的报警、急救、火警号码及求救信号', tags: '紧急电话 报警 急救 火警 110 120 求救 SOS',
  fields: [
    { k: 'q', label: '地区关键词', type: 'text', value: '' },
    { k: 'mode', label: '查看内容', type: 'select', value: 'cn', options: [
      ['cn', '中国大陆'], ['intl', '国际常用'], ['sos', '求救信号'], ['all', '全部'] ] }
  ],
  run: function (v) {
    var cn = [
      ['110', '公安报警', '刑事、治安、交通、危急求助'], ['119', '消防 / 火警', '火灾、抢险救援'],
      ['120', '医疗急救', '救护车、突发疾病'], ['122', '交通事故', '道路交通事故报警'],
      ['12110', '短信报警', '不便语音通话时的短信报警（部分地区）'],
      ['12395', '水上遇险', '海上 / 水上搜救'], ['12345', '政务服务热线', '非紧急咨询与投诉'],
      ['95598', '电力抢修', '停电、用电故障'], ['12315', '消费投诉', '消费者权益'],
      ['中国香港', '999', '报警 / 急救 / 火警统一号码'],
      ['中国澳门', '999 / 110 / 120', '报警与急救'],
      ['中国台湾', '110 / 119 / 120', '警政 / 消防 / 救护']
    ];
    var intl = [
      ['112', '国际通用', 'GSM 全球通用紧急号码，多数国家可拨通'],
      ['911', '美国 / 加拿大', '报警、急救、火警统一'],
      ['999', '英国 / 中国香港 / 部分英联邦', '统一紧急号码'],
      ['000', '澳大利亚', '统一紧急号码'],
      ['111', '新西兰', '统一紧急号码'],
      ['110 / 119', '日本', '110 警察、119 消防与救护'],
      ['112 / 110', '欧盟多数国家', '112 为欧盟统一紧急号码'],
      ['100', '印度（警察）', '另有 101 火警、102 救护'],
      ['112', '韩国（部分）', '112 警察、119 消防救护']
    ];
    var sos = [
      ['SOS 摩尔斯', '··· ——— ···', '三短三长三短，国际通用求救信号'],
      ['Mayday', '无线电语音', '航空 / 航海最高等级遇险呼叫，连呼三次'],
      ['Pan-Pan', '无线电语音', '紧急但尚未危及生命的呼叫'],
      ['地面标志', 'V / X / SOS', '用石块、树枝等摆出大型可视符号'],
      ['声响求救', '每分钟 6 次', '连续短促声响后停 1 分钟，重复'],
      ['镜面反光', '断续闪光', '晴天可用镜子、手机屏幕向远处反光']
    ];
    var q = String(v.q || '').trim().toLowerCase();
    function hit(a) { return !q || a.join(' ').toLowerCase().indexOf(q) >= 0; }
    var out = '';
    if (v.mode === 'cn' || v.mode === 'all') {
      var a = cn.filter(hit);
      out += SEC('中国大陆及港澳台（' + a.length + '）') + (a.length ? TB(['号码 / 地区', '用途', '说明'], a) : '<div class="note">无匹配。</div>');
    }
    if (v.mode === 'intl' || v.mode === 'all') {
      var b = intl.filter(hit);
      out += SEC('国际常用（' + b.length + '）') + (b.length ? TB(['号码', '适用地区', '说明'], b) : '<div class="note">无匹配。</div>');
    }
    if (v.mode === 'sos' || v.mode === 'all') {
      var c = sos.filter(hit);
      out += SEC('求救信号（' + c.length + '）') + (c.length ? TB(['方式', '信号', '说明'], c) : '<div class="note">无匹配。</div>');
    }
    return R(KV([['查看内容', { cn: '中国大陆', intl: '国际常用', sos: '求救信号', all: '全部' }[v.mode]],
      ['关键词', q || '（全部）'], ['条目合计', (cn.length + intl.length + sos.length) + ' 条']]) + out +
      HINT('号码可能因地区与运营商而异，出行前请以当地官方公布为准；无信号时 112 仍可能通过其他运营商网络接通。'),
      cn.concat(intl).map(function (r) { return r.join(' | '); }).join('\n'));
  }
});

T({ id: 'colorname', name: 'CSS 命名色速查', cat: 'query',
  desc: '常用 CSS 命名色对照 HEX / RGB，支持按名称或色值反查', tags: 'css 颜色 命名色 hex rgb 色值 速查',
  fields: [
    { k: 'q', label: '名称或 HEX', type: 'text', value: '' },
    { k: 'mode', label: '查询方式', type: 'select', value: 'search', options: [
      ['search', '按名称搜索'], ['hex', '按 HEX 反查'], ['all', '全部色表'] ] }
  ],
  run: function (v) {
    var C = [
      ['AliceBlue', '#F0F8FF'], ['AntiqueWhite', '#FAEBD7'], ['Aqua', '#00FFFF'],
      ['Aquamarine', '#7FFFD4'], ['Beige', '#F5F5DC'], ['Bisque', '#FFE4C4'],
      ['Black', '#000000'], ['BlanchedAlmond', '#FFEBCD'], ['Blue', '#0000FF'],
      ['BlueViolet', '#8A2BE2'], ['Brown', '#A52A2A'], ['BurlyWood', '#DEB887'],
      ['CadetBlue', '#5F9EA0'], ['Chartreuse', '#7FFF00'], ['Chocolate', '#D2691E'],
      ['Coral', '#FF7F50'], ['CornflowerBlue', '#6495ED'], ['Crimson', '#DC143C'],
      ['Cyan', '#00FFFF'], ['DarkBlue', '#00008B'], ['DarkCyan', '#008B8B'],
      ['DarkGoldenRod', '#B8860B'], ['DarkGray', '#A9A9A9'], ['DarkGreen', '#006400'],
      ['DarkOrange', '#FF8C00'], ['DarkOrchid', '#9932CC'], ['DarkRed', '#8B0000'],
      ['DarkSalmon', '#E9967A'], ['DarkSlateBlue', '#483D8B'], ['DeepPink', '#FF1493'],
      ['DeepSkyBlue', '#00BFFF'], ['DimGray', '#696969'], ['DodgerBlue', '#1E90FF'],
      ['FireBrick', '#B22222'], ['FloralWhite', '#FFFAF0'], ['ForestGreen', '#228B22'],
      ['Fuchsia', '#FF00FF'], ['Gainsboro', '#DCDCDC'], ['GhostWhite', '#F8F8FF'],
      ['Gold', '#FFD700'], ['GoldenRod', '#DAA520'], ['Gray', '#808080'],
      ['Green', '#008000'], ['GreenYellow', '#ADFF2F'], ['HoneyDew', '#F0FFF0'],
      ['HotPink', '#FF69B4'], ['IndianRed', '#CD5C5C'], ['Indigo', '#4B0082'],
      ['Ivory', '#FFFFF0'], ['Khaki', '#F0E68C'], ['Lavender', '#E6E6FA'],
      ['LavenderBlush', '#FFF0F5'], ['LawnGreen', '#7CFC00'], ['LemonChiffon', '#FFFACD'],
      ['LightBlue', '#ADD8E6'], ['LightCoral', '#F08080'], ['LightCyan', '#E0FFFF'],
      ['LightGoldenRodYellow', '#FAFAD2'], ['LightGray', '#D3D3D3'], ['LightGreen', '#90EE90'],
      ['LightPink', '#FFB6C1'], ['LightSalmon', '#FFA07A'], ['LightSeaGreen', '#20B2AA'],
      ['LightSkyBlue', '#87CEFA'], ['LightSlateGray', '#778899'], ['LightSteelBlue', '#B0C4DE'],
      ['LightYellow', '#FFFFE0'], ['Lime', '#00FF00'], ['LimeGreen', '#32CD32'],
      ['Linen', '#FAF0E6'], ['Magenta', '#FF00FF'], ['Maroon', '#800000'],
      ['MediumAquaMarine', '#66CDAA'], ['MediumBlue', '#0000CD'], ['MediumOrchid', '#BA55D3'],
      ['MediumPurple', '#9370DB'], ['MediumSeaGreen', '#3CB371'], ['MidnightBlue', '#191970'],
      ['MintCream', '#F5FFFA'], ['MistyRose', '#FFE4E1'], ['Moccasin', '#FFE4B5'],
      ['NavajoWhite', '#FFDEAD'], ['Navy', '#000080'], ['OldLace', '#FDF5E6'],
      ['Olive', '#808000'], ['OliveDrab', '#6B8E23'], ['Orange', '#FFA500'],
      ['OrangeRed', '#FF4500'], ['Orchid', '#DA70D6'], ['PaleGoldenRod', '#EEE8AA'],
      ['PaleGreen', '#98FB98'], ['PaleTurquoise', '#AFEEEE'], ['PaleVioletRed', '#DB7093'],
      ['PapayaWhip', '#FFEFD5'], ['PeachPuff', '#FFDAB9'], ['Peru', '#CD853F'],
      ['Pink', '#FFC0CB'], ['Plum', '#DDA0DD'], ['PowderBlue', '#B0E0E6'],
      ['Purple', '#800080'], ['RebeccaPurple', '#663399'], ['Red', '#FF0000'],
      ['RosyBrown', '#BC8F8F'], ['RoyalBlue', '#4169E1'], ['SaddleBrown', '#8B4513'],
      ['Salmon', '#FA8072'], ['SandyBrown', '#F4A460'], ['SeaGreen', '#2E8B57'],
      ['SeaShell', '#FFF5EE'], ['Sienna', '#A0522D'], ['Silver', '#C0C0C0'],
      ['SkyBlue', '#87CEEB'], ['SlateBlue', '#6A5ACD'], ['SlateGray', '#708090'],
      ['Snow', '#FFFAFA'], ['SpringGreen', '#00FF7F'], ['SteelBlue', '#4682B4'],
      ['Tan', '#D2B48C'], ['Teal', '#008080'], ['Thistle', '#D8BFD8'],
      ['Tomato', '#FF6347'], ['Turquoise', '#40E0D0'], ['Violet', '#EE82EE'],
      ['Wheat', '#F5DEB3'], ['White', '#FFFFFF'], ['WhiteSmoke', '#F5F5F5'],
      ['Yellow', '#FFFF00'], ['YellowGreen', '#9ACD32']
    ];
    var q = String(v.q || '').trim().toLowerCase().replace(/^#/, '');
    var list = C.filter(function (c) {
      if (!q) return true;
      if (v.mode === 'hex') return c[1].toLowerCase().replace('#', '').indexOf(q) >= 0;
      return (c[0].toLowerCase().indexOf(q) >= 0 || c[1].toLowerCase().indexOf(q) >= 0);
    });
    function rgb(h) {
      return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)].join(', ');
    }
    var swatches = list.slice(0, 40).map(function (c) {
      return '<span style="display:inline-flex;align-items:center;gap:6px;margin:0 10px 8px 0;font-size:11.5px">' +
        '<span style="width:20px;height:20px;border-radius:6px;border:1px solid var(--outline-variant);background:' + c[1] + '"></span>' +
        esc(c[0]) + '</span>';
    }).join('');
    return R(KV([['查询方式', { search: '按名称搜索', hex: '按 HEX 反查', all: '全部色表' }[v.mode]],
      ['关键词', q || '（全部）'], ['收录颜色', C.length + ' 种'], ['匹配结果', list.length + ' 种']]) +
      SEC('色块预览（前 40）') + '<div style="padding:6px 2px">' + (swatches || '无匹配') + '</div>' +
      SEC('色值对照') + (list.length ? TB(['CSS 名称', 'HEX', 'RGB'], list.map(function (c) {
        return [c[0], c[1], 'rgb(' + rgb(c[1]) + ')'];
      })) : '<div class="note">没有匹配的颜色。</div>') +
      HINT('收录 CSS Color Module 常用命名色（含 RebeccaPurple）；同名不同值如 Aqua / Cyan 属于别名。'),
      list.map(function (c) { return c[0] + ' ' + c[1]; }).join('\n'));
  }
});

/* ============================================================
   七、媒体 / 前端（5）
   ============================================================ */

T({ id: 'cssclip', name: 'CSS clip-path 生成', cat: 'image',
  desc: '生成圆形、多边形、内嵌等 clip-path 代码与实时预览', tags: 'css clip-path 裁剪 多边形 形状 前端 生成',
  fields: [
    { k: 'shape', label: '形状', type: 'select', value: 'polygon', options: [
      ['circle', '圆形'], ['ellipse', '椭圆'], ['inset', '内嵌矩形'],
      ['polygon', '正多边形'], ['triangle', '三角形'], ['hexagon', '六边形'],
      ['star', '五角星'], ['diamond', '菱形'], ['arrow', '箭头'] ] },
    { k: 'size', label: '尺寸（%）', type: 'text', value: '70' },
    { k: 'sides', label: '多边形边数', type: 'text', value: '6' }
  ],
  run: function (v) {
    var sz = Math.max(10, Math.min(100, pnum(v.size, 70))), n = Math.max(3, Math.min(12, parseInt(v.sides, 10) || 6));
    var value = '', name = '';
    function poly(arr) { return 'polygon(' + arr.map(function (p) { return num(p[0], 2) + '% ' + num(p[1], 2) + '%'; }).join(', ') + ')'; }
    if (v.shape === 'circle') { value = 'circle(' + num(sz / 2, 2) + '% at 50% 50%)'; name = '圆形'; }
    else if (v.shape === 'ellipse') { value = 'ellipse(' + num(sz / 2, 2) + '% ' + num(sz / 3, 2) + '% at 50% 50%)'; name = '椭圆'; }
    else if (v.shape === 'inset') { var p = num((100 - sz) / 2, 2); value = 'inset(' + p + '% ' + p + '% ' + p + '% ' + p + '% round 12px)'; name = '内嵌矩形'; }
    else if (v.shape === 'polygon') {
      var pts = [];
      for (var i = 0; i < n; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / n; pts.push([50 + Math.cos(a) * sz / 2, 50 + Math.sin(a) * sz / 2]); }
      value = poly(pts); name = n + ' 边形';
    } else if (v.shape === 'triangle') { value = poly([[50, 100 - sz], [100 - (100 - sz) / 2, 50 + sz / 2], [(100 - sz) / 2, 50 + sz / 2]]); name = '三角形'; }
    else if (v.shape === 'hexagon') { value = poly([[25, 6], [75, 6], [98, 50], [75, 94], [25, 94], [2, 50]]); name = '六边形'; }
    else if (v.shape === 'star') { value = poly([[50, 2], [61, 38], [98, 38], [68, 60], [79, 97], [50, 74], [21, 97], [32, 60], [2, 38], [39, 38]]); name = '五角星'; }
    else if (v.shape === 'diamond') { value = poly([[50, 100 - sz], [100 - (100 - sz) / 2, 50], [50, sz], [(100 - sz) / 2, 50]]); name = '菱形'; }
    else { value = poly([[0, 35], [60, 35], [60, 5], [100, 50], [60, 95], [60, 65], [0, 65]]); name = '箭头'; }
    var css = '.clip-shape {\n  width: 200px;\n  height: 200px;\n  background: linear-gradient(135deg, #FAE185, #F5B971);\n  -webkit-clip-path: ' + value + ';\n  clip-path: ' + value + ';\n}';
    var preview = '<div style="display:flex;justify-content:center;padding:8px">' +
      '<div style="width:170px;height:170px;background:linear-gradient(135deg,#FAE185,#F5B971);' +
      '-webkit-clip-path:' + value + ';clip-path:' + value + '"></div></div>';
    return R(KV([['形状', name], ['尺寸', num(sz, 1) + '%'],
      ['clip-path 值', '<code style="font-size:11px">' + esc(value) + '</code>'],
      ['代码长度', css.length + ' 字符']]) +
      SEC('实时预览') + preview + SEC('CSS 代码') + PRE(css) +
      HINT('所有坐标使用百分比，元素缩放时形状会同步缩放；已同时输出 -webkit- 前缀以兼容旧版 WebView。'), css);
  }
});

T({ id: 'wavegen', name: 'SVG 波浪生成', cat: 'image',
  desc: '生成多层正弦波浪 SVG，可调层数、振幅、频率与配色', tags: 'svg 波浪 背景 正弦 渐变 代码生成',
  fields: [
    { k: 'layers', label: '波浪层数', type: 'text', value: '3' },
    { k: 'h', label: '视图高度', type: 'text', value: '120' },
    { k: 'amp', label: '振幅', type: 'text', value: '16' },
    { k: 'freq', label: '波数', type: 'text', value: '2' },
    { k: 'c1', label: '起始颜色', type: 'color', value: '#FAE185' },
    { k: 'c2', label: '结束颜色', type: 'color', value: '#8CC27F' }
  ],
  run: function (v) {
    var L = Math.max(1, Math.min(8, parseInt(v.layers, 10) || 3));
    var Hh = Math.max(40, Math.min(400, parseInt(v.h, 10) || 120));
    var A = Math.max(0, Math.min(Hh / 2, pnum(v.amp, 16)));
    var F = Math.max(0.5, Math.min(10, pnum(v.freq, 2)));
    function hex2rgb(h) {
      h = String(h || '#FAE185').replace('#', '');
      if (h.length === 3) h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
      return [parseInt(h.slice(0, 2), 16) || 0, parseInt(h.slice(2, 4), 16) || 0, parseInt(h.slice(4, 6), 16) || 0];
    }
    var c1 = hex2rgb(v.c1), c2 = hex2rgb(v.c2);
    function mix(t) {
      return 'rgb(' + Math.round(c1[0] + (c2[0] - c1[0]) * t) + ',' +
        Math.round(c1[1] + (c2[1] - c1[1]) * t) + ',' +
        Math.round(c1[2] + (c2[2] - c1[2]) * t) + ')';
    }
    var paths = '';
    for (var l = 0; l < L; l++) {
      var baseY = Hh * (0.42 + 0.1 * l), amp = A * (1 - l * 0.12), phase = l * 0.8;
      var d = 'M0,' + num(baseY, 1);
      for (var x = 2; x <= 100; x += 2) {
        var y = baseY + amp * Math.sin(x / 100 * F * 2 * Math.PI + phase);
        d += ' L' + x + ',' + num(y, 1);
      }
      d += ' L100,' + Hh + ' L0,' + Hh + ' Z';
      paths += '  <path d="' + d + '" fill="' + mix(L === 1 ? 0 : l / (L - 1)) + '" opacity="' + num(0.55 + 0.35 * (1 - l / L), 2) + '"/>\n';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 ' + Hh + '" width="100%" height="' + Hh + '" preserveAspectRatio="none">\n' + paths + '</svg>';
    return R(KV([['层数', L + ' 层'], ['画布', '100 × ' + Hh], ['振幅', num(A, 1)],
      ['波数', num(F, 2)], ['配色', esc(v.c1) + ' → ' + esc(v.c2)], ['SVG 大小', svg.length + ' 字符']]) +
      SEC('预览') + '<div style="border-radius:14px;overflow:hidden;border:1px solid var(--outline-variant)">' + svg + '</div>' +
      SEC('SVG 代码') + PRE(svg) +
      HINT('使用 viewBox + preserveAspectRatio="none"，宽度可随容器自适应；复制代码到 HTML 即可使用。'), svg);
  }
});

T({ id: 'asciiart', name: 'ASCII 字符画', cat: 'image',
  desc: '把字母数字转成 5×7 点阵大字，可选填充字符', tags: 'ascii 字符画 点阵 大字 banner 文本艺术',
  fields: [
    { k: 'text', label: '输入文本（A-Z / 0-9 / 空格 / - . !）', type: 'text', value: 'AK 1.6' },
    { k: 'mode', label: '填充样式', type: 'select', value: 'block', options: [
      ['block', '实心方块 ██'], ['hash', '# 号'], ['star', '星号 *'], ['inverse', '反色'] ] }
  ],
  run: function (v) {
    var F = {
      'A': '01110100011000111111100011000110001', 'B': '11110100011000111110100011000111110',
      'C': '01111100001000010000100001000001111', 'D': '11110100011000110001100011000111110',
      'E': '11111100001000011110100001000011111', 'F': '11111100001000011110100001000010000',
      'G': '01111100001000010111100011000101111', 'H': '10001100011000111111100011000110001',
      'I': '11111001000010000100001000010011111', 'J': '00111000100001000010000101001001100',
      'K': '10001100101010011000101001001010001', 'L': '10000100001000010000100001000011111',
      'M': '10001110111010110101100011000110001', 'N': '10001110011010110011100011000110001',
      'O': '01110100011000110001100011000101110', 'P': '11110100011000111110100001000010000',
      'Q': '01110100011000110001101011001001101', 'R': '11110100011000111110101001001010001',
      'S': '01111100001000001110000010000111110', 'T': '11111001000010000100001000010000100',
      'U': '10001100011000110001100011000101110', 'V': '10001100011000110001100010101000100',
      'W': '10001100011000110101101011101110001', 'X': '10001100010101000100010101000110001',
      'Y': '10001100010101000100001000010000100', 'Z': '11111000010001000100010001000011111',
      '0': '01110100011001110101110011000101110', '1': '00100011000010000100001000010001110',
      '2': '01110100010000100010001000100011111', '3': '11110000010000101110000010000111110',
      '4': '00010001100101010010111110001000010', '5': '11111100001000011110000010000111110',
      '6': '00110010001000011110100011000101110', '7': '11111000010001000100010000100001000',
      '8': '01110100011000101110100011000101110', '9': '01110100011000101111000010001001100',
      ' ': '00000000000000000000000000000000000', '-': '00000000000000011111000000000000000',
      '.': '00000000000000000000000000001100110', '!': '00100001000010000100001000000000100'
    };
    var raw = String(v.text || '').toUpperCase().slice(0, 24);
    var map = { block: ['██', '  '], hash: ['##', '  '], star: ['**', '  '], inverse: ['  ', '██'] };
    var on = map[v.mode][0], off = map[v.mode][1];
    var grid = [];
    for (var r = 0; r < 7; r++) {
      var line = '';
      for (var i = 0; i < raw.length; i++) {
        var bits = F[raw.charAt(i)] || F[' '];
        for (var c = 0; c < 5; c++) line += bits.charAt(r * 5 + c) === '1' ? on : off;
        line += ' ';
      }
      grid.push(line.replace(/\s+$/, ''));
    }
    var art = grid.join('\n');
    var unknown = raw.split('').filter(function (ch) { return !F[ch]; });
    return R(KV([['输入文本', esc(raw)], ['字符数', raw.length + ' 个'],
      ['点阵规格', '5 × 7 / 字符'], ['输出行数', '7 行'],
      ['不支持的字符', unknown.length ? esc(unknown.join(' ')) + '（按空格处理）' : '无']]) +
      SEC('字符画（可复制）') + PRE(art) +
      HINT('点阵字模内置 A-Z、0-9 与空格 / - . !；等宽字体下显示效果最佳。'), art);
  }
});

T({ id: 'htmltable', name: 'HTML 表格生成', cat: 'image',
  desc: '由 CSV / TSV 文本生成带内联样式的 HTML table 与代码', tags: 'html 表格 table csv 生成 前端 代码',
  fields: [
    { k: 'text', label: '表格文本（每行一条，逗号或 Tab 分隔）', type: 'textarea', rows: 7,
      value: '工具,分类,使用次数\nJSON 格式化,开发者,128\n二维码生成,媒体,96\n单位换算,计算,75\n便签,生活,52' },
    { k: 'header', label: '表头', type: 'select', value: 'first', options: [
      ['first', '首行作为表头'], ['none', '无表头'] ] },
    { k: 'style', label: '样式', type: 'select', value: 'striped', options: [
      ['plain', '简洁'], ['striped', '斑马纹'], ['bordered', '带边框'] ] }
  ],
  run: function (v) {
    var rows = lines(v.text).map(function (ln) {
      var d = ln.indexOf('\t') >= 0 ? '\t' : ',';
      return ln.split(d).map(function (x) { return x.trim(); });
    }).filter(function (r) { return r.some(function (x) { return x; }); });
    var ncol = 0; rows.forEach(function (r) { ncol = Math.max(ncol, r.length); });
    rows = rows.map(function (r) { while (r.length < ncol) r.push(''); return r; });
    var border = v.style === 'bordered' ? 'border:1px solid #D9CCB0;' : 'border:0;';
    var base = 'border-collapse:collapse;width:100%;font-size:13px;font-family:system-ui,sans-serif;' + border;
    var th = 'padding:8px 10px;text-align:left;background:#FAE185;color:#4A3D00;font-weight:700;' +
      (v.style === 'bordered' ? 'border:1px solid #D9CCB0;' : 'border-bottom:2px solid #E4D9C8;');
    var td = 'padding:7px 10px;color:#3A3428;' + (v.style === 'bordered' ? 'border:1px solid #D9CCB0;' : 'border-bottom:1px solid #E4D9C8;');
    var headRows = v.header === 'first' ? rows.slice(0, 1) : [];
    var bodyRows = v.header === 'first' ? rows.slice(1) : rows;
    var html = '<table style="' + base + '">\n';
    if (headRows.length) {
      html += '  <thead>\n    <tr>\n' + headRows[0].map(function (c) { return '      <th style="' + th + '">' + esc(c) + '</th>'; }).join('\n') + '\n    </tr>\n  </thead>\n';
    }
    html += '  <tbody>\n';
    bodyRows.forEach(function (r, i) {
      var bg = (v.style === 'striped' && i % 2 === 1) ? 'background:#FAF2E7;' : '';
      html += '    <tr>\n' + r.map(function (c) { return '      <td style="' + td + bg + '">' + esc(c) + '</td>'; }).join('\n') + '\n    </tr>\n';
    });
    html += '  </tbody>\n</table>';
    return R(KV([['数据行数', rows.length + ' 行'], ['列数', ncol + ' 列'],
      ['表头', v.header === 'first' ? '首行作为表头' : '无表头'],
      ['样式', { plain: '简洁', striped: '斑马纹', bordered: '带边框' }[v.style]],
      ['HTML 长度', html.length + ' 字符']]) +
      SEC('渲染预览') + '<div style="border-radius:12px;overflow:hidden">' + html + '</div>' +
      SEC('HTML 代码') + PRE(html) +
      HINT('样式全部内联，复制后粘贴到任意 HTML 即可生效，不依赖页面 CSS。'), html);
  }
});

T({ id: 'spritepos', name: '雪碧图定位计算', cat: 'image',
  desc: '由序号计算 background-position，或列出全部图标坐标', tags: '雪碧图 sprite background-position css 定位 计算',
  fields: [
    { k: 'sheetW', label: '雪碧图总宽（px）', type: 'text', value: '512' },
    { k: 'sheetH', label: '雪碧图总高（px）', type: 'text', value: '256' },
    { k: 'iconW', label: '单个图标宽（px）', type: 'text', value: '64' },
    { k: 'iconH', label: '单个图标高（px）', type: 'text', value: '64' },
    { k: 'gap', label: '图标间距（px）', type: 'text', value: '0' },
    { k: 'index', label: '图标序号（从 0 开始）', type: 'text', value: '5' },
    { k: 'mode', label: '模式', type: 'select', value: 'calc', options: [
      ['calc', '由序号算位置'], ['all', '列出全部坐标'], ['reverse', '由坐标反推序号'] ] }
  ],
  run: function (v) {
    var sw = pnum(v.sheetW, 0), sh = pnum(v.sheetH, 0), iw = Math.max(1, pnum(v.iconW, 1)),
      ih = Math.max(1, pnum(v.iconH, 1)), gap = Math.max(0, pnum(v.gap, 0));
    var stepX = iw + gap, stepY = ih + gap;
    var cols = Math.max(1, Math.floor((sw + gap) / stepX)), rows = Math.max(1, Math.floor((sh + gap) / stepY));
    var total = cols * rows, idx = Math.max(0, parseInt(v.index, 10) || 0);
    var cx = idx % cols, cy = Math.floor(idx / cols) % rows;
    var x = cx * stepX, y = cy * stepY;
    var css = '.icon-' + idx + ' {\n  width: ' + iw + 'px;\n  height: ' + ih + 'px;\n' +
      '  background-image: url("sprite.png");\n' +
      '  background-position: -' + x + 'px -' + y + 'px;\n' +
      '  background-size: ' + sw + 'px ' + sh + 'px;\n}';
    var list = [];
    for (var i = 0; i < Math.min(total, 40); i++) {
      list.push([String(i), String((i % cols) * stepX), String(Math.floor(i / cols) * stepY),
        '-' + (i % cols) * stepX + 'px -' + Math.floor(i / cols) * stepY + 'px']);
    }
    var body = '';
    if (v.mode === 'all') body = SEC('全部坐标（前 40）') + TB(['序号', 'X', 'Y', 'background-position'], list);
    else if (v.mode === 'reverse') {
      var rx = x, ry = y;
      body = KV([['输入序号', String(idx)], ['对应格', '第 ' + (cy + 1) + ' 行 / 第 ' + (cx + 1) + ' 列'],
        ['左上角坐标', '(' + rx + ', ' + ry + ')'], ['右下角坐标', '(' + (rx + iw) + ', ' + (ry + ih) + ')'],
        ['是否越界', (rx + iw <= sw && ry + ih <= sh) ? '否' : '是（该图标超出雪碧图范围）']]);
    } else body = SEC('CSS 代码') + PRE(css);
    return R(KV([['雪碧图尺寸', sw + ' × ' + sh + ' px'], ['单图尺寸', iw + ' × ' + ih + ' px'],
      ['间距', gap + ' px'], ['网格', cols + ' 列 × ' + rows + ' 行'],
      ['可容纳图标', total + ' 个'], ['当前序号', String(idx)],
      ['background-position', '-' + x + 'px -' + y + 'px']]) + body +
      HINT('序号按「从左到右、从上到下」从 0 开始编号；坐标取负值是把雪碧图向左上移动。'), css);
  }
});

/* ============================================================
   八、设备测评（3）
   ============================================================ */

T({ id: 'ipv6tool', name: 'IPv6 地址分析', cat: 'fun',
  desc: '展开 / 压缩 IPv6，判断地址类型并生成 PTR 反查域名', tags: 'ipv6 地址 展开 压缩 前缀 ptr 网络',
  fields: [
    { k: 'addr', label: 'IPv6 地址', type: 'text', value: '2001:0db8:0000:0000:0000:ff00:0042:8329' },
    { k: 'mode', label: '模式', type: 'select', value: 'analyze', options: [
      ['analyze', '完整分析'], ['expand', '仅展开'], ['compress', '仅压缩'], ['reverse', 'PTR 反查域名'] ] }
  ],
  run: function (v) {
    var raw = String(v.addr || '').trim().split('%')[0];
    var groups = [];
    try {
      var s = raw;
      // 处理尾部 IPv4（如 ::ffff:192.168.1.1）
      var v4 = '';
      var segs0 = s.split(':');
      var last = segs0[segs0.length - 1];
      if (last.indexOf('.') >= 0) {
        var q = last.split('.');
        if (q.length === 4) {
          var a = q.map(function (x) { var n = parseInt(x, 10); if (!isFinite(n) || n < 0 || n > 255) throw new Error('IPv4 段无效'); return n; });
          v4 = a[0] + '.' + a[1] + '.' + a[2] + '.' + a[3];
          var h1 = ((a[0] << 8) | a[1]).toString(16), h2 = ((a[2] << 8) | a[3]).toString(16);
          segs0[segs0.length - 1] = h1; segs0.push(h2);
          s = segs0.join(':');
        }
      }
      var dc = s.indexOf('::');
      if (dc >= 0) {
        if (s.indexOf('::', dc + 2) >= 0) throw new Error('不能出现多个 ::');
        var left = s.slice(0, dc).split(':').filter(function (x) { return x !== ''; });
        var right = s.slice(dc + 2).split(':').filter(function (x) { return x !== ''; });
        if (left.length + right.length >= 8) throw new Error(':: 展开后超过 8 组');
        var zeros = 8 - left.length - right.length;
        groups = left.concat(Array.apply(null, new Array(zeros)).map(function () { return '0'; })).concat(right);
      } else groups = s.split(':');
      if (groups.length !== 8) throw new Error('需要 8 组十六进制数');
      groups = groups.map(function (g) {
        if (!/^[0-9a-fA-F]{1,4}$/.test(g)) throw new Error('非法分组：' + g);
        return parseInt(g, 16);
      });
    } catch (e) { return R('<div class="note">IPv6 解析失败：' + esc(e.message) + '</div>', '错误：' + e.message); }
    var hex = groups.map(function (g) { return ('000' + g.toString(16)).slice(-4).toUpperCase(); });
    var full = hex.join(':');
    var bestS = -1, bestL = 0, cs = -1, cl = 0;
    for (var i = 0; i < 8; i++) {
      if (groups[i] === 0) { if (cs < 0) cs = i; cl++; if (cl > bestL) { bestL = cl; bestS = cs; } }
      else { cs = -1; cl = 0; }
    }
    var comp;
    if (bestL >= 2) {
      comp = hex.slice(0, bestS).join(':') + '::' + hex.slice(bestS + bestL).join(':');
      comp = comp.replace(/^::/, '::').replace(/::$/, '::');
      if (comp.indexOf('::') < 0) comp = '::';
      if (bestS === 0 && bestS + bestL === 8) comp = '::';
    } else comp = full;
    var first = groups[0];
    var type;
    if (groups.every(function (g) { return g === 0; })) type = '未指定地址 ::';
    else if (groups.slice(0, 7).every(function (g) { return g === 0; }) && groups[7] === 1) type = '回环地址 ::1';
    else if (groups.slice(0, 5).every(function (g) { return g === 0; }) && groups[5] === 0xffff) type = 'IPv4 映射地址';
    else if ((first & 0xff00) === 0xff00) type = '组播地址 ff00::/8';
    else if ((first & 0xfe00) === 0xfc00) type = '唯一本地地址 fc00::/7';
    else if ((first & 0xffc0) === 0xfe80) type = '链路本地地址 fe80::/10';
    else if ((first & 0xe000) === 0x2000) type = '全球单播地址 2000::/3';
    else type = '保留 / 其它类型';
    var nibble = full.replace(/:/g, '').toLowerCase().split('').reverse().join('.');
    var ptr = nibble + '.ip6.arpa';
    var out;
    if (v.mode === 'expand') out = PRE(full);
    else if (v.mode === 'compress') out = PRE(comp);
    else if (v.mode === 'reverse') out = PRE(ptr);
    else out = KV([['完整展开', '<code style="font-size:11px">' + esc(full) + '</code>'],
      ['压缩写法', '<code style="font-size:11px">' + esc(comp) + '</code>'],
      ['地址类型', esc(type)], ['网络前缀 /64', esc(hex.slice(0, 4).join(':') + '::/64')],
      ['接口标识', esc(hex.slice(4).join(':'))],
      ['内嵌 IPv4', v4 || '—'],
      ['PTR 反查域名', '<code style="font-size:11px">' + esc(ptr) + '</code>']]);
    return R(KV([['输入地址', esc(raw)], ['模式', { analyze: '完整分析', expand: '仅展开', compress: '仅压缩', reverse: 'PTR 反查域名' }[v.mode]],
      ['分组数', '8 组'], ['省略的零组', bestL >= 2 ? bestL + ' 组' : '无']]) +
      SEC('结果') + out + HINT('压缩规则：把最长的一段连续 0 组替换为 ::，只能出现一次；PTR 由 32 个 nibble 逆序组成。'),
      v.mode === 'reverse' ? ptr : (v.mode === 'expand' ? full : comp));
  }
});

T({ id: 'dnsref', name: 'DNS 记录速查', cat: 'fun',
  desc: '常见 DNS 记录类型、用途与公共 DNS 服务器对照表', tags: 'dns 记录 A AAAA CNAME MX TXT 公共DNS 速查',
  fields: [
    { k: 'q', label: '搜索关键词', type: 'text', value: '' },
    { k: 'mode', label: '查看内容', type: 'select', value: 'types', options: [
      ['types', '记录类型'], ['servers', '公共 DNS'], ['all', '全部'] ] }
  ],
  run: function (v) {
    var types = [
      ['A', '域名 → IPv4 地址', '最基础的解析记录'], ['AAAA', '域名 → IPv6 地址', 'IPv6 解析'],
      ['CNAME', '域名 → 另一个域名', '别名，不能与同名的其它记录共存'],
      ['MX', '邮件服务器', '含优先级，值必须是域名'],
      ['TXT', '任意文本', 'SPF / DKIM / 域名所有权验证'],
      ['NS', '权威域名服务器', '指定负责该域的 DNS'],
      ['SOA', '起始授权机构', '主 DNS、序列号、刷新与过期时间'],
      ['PTR', 'IP → 域名', '反向解析，用于邮件与日志'],
      ['SRV', '服务定位', '定义服务端口、优先级与权重'],
      ['CAA', '证书颁发授权', '限制哪些 CA 可为该域签发证书'],
      ['NS / DS', 'DNSSEC 链', 'DS 记录用于建立信任链'],
      ['HTTPS / SVCB', '服务绑定', 'HTTP/3、ECH 等连接参数'],
      ['TTL', '缓存时间（秒）', '不是记录类型，决定解析结果缓存多久']
    ];
    var servers = [
      ['114.114.114.114', '南京信风', '中国大陆常用公共 DNS'],
      ['223.5.5.5 / 223.6.6.6', '阿里云', '中国大陆公共 DNS'],
      ['119.29.29.29', 'DNSPod / 腾讯云', '中国大陆公共 DNS'],
      ['1.1.1.1', 'Cloudflare', '强调隐私，支持 DoH / DoT'],
      ['8.8.8.8 / 8.8.4.4', 'Google', '全球常用公共 DNS'],
      ['9.9.9.9', 'Quad9', '拦截已知恶意域名'],
      ['208.67.222.222', 'OpenDNS', '支持内容过滤'],
      ['180.76.76.76', '百度', '中国大陆公共 DNS']
    ];
    var q = String(v.q || '').trim().toLowerCase();
    function hit(a) { return !q || a.join(' ').toLowerCase().indexOf(q) >= 0; }
    var out = '';
    if (v.mode === 'types' || v.mode === 'all') {
      var a = types.filter(hit);
      out += SEC('DNS 记录类型（' + a.length + '）') + (a.length ? TB(['类型', '用途', '说明'], a) : '<div class="note">无匹配。</div>');
    }
    if (v.mode === 'servers' || v.mode === 'all') {
      var b = servers.filter(hit);
      out += SEC('公共 DNS 服务器（' + b.length + '）') + (b.length ? TB(['地址', '提供方', '说明'], b) : '<div class="note">无匹配。</div>');
    }
    return R(KV([['查看内容', { types: '记录类型', servers: '公共 DNS', all: '全部' }[v.mode]],
      ['关键词', q || '（全部）'], ['记录类型', types.length + ' 条'], ['公共 DNS', servers.length + ' 组']]) + out +
      HINT('修改 DNS 前请确认网络环境允许；DoH / DoT 属于加密 DNS 协议，与记录类型是两个概念。'),
      types.map(function (r) { return r.join(' | '); }).join('\n'));
  }
});

T({ id: 'batterytime', name: '电池续航估算', cat: 'fun',
  desc: '由容量、电压与功耗估算续航，或反推所需电池容量', tags: '电池 续航 mAh Wh 功耗 容量 估算',
  fields: [
    { k: 'capacity', label: '电池容量（mAh）', type: 'text', value: '5000' },
    { k: 'voltage', label: '标称电压（V）', type: 'text', value: '3.85' },
    { k: 'power', label: '设备功耗（mW）', type: 'text', value: '1500' },
    { k: 'hours', label: '目标续航（小时，反推容量时）', type: 'text', value: '12' },
    { k: 'mode', label: '模式', type: 'select', value: 'time', options: [
      ['time', '估算续航时长'], ['capacity', '反推所需容量'], ['compare', '不同功耗对比'] ] }
  ],
  run: function (v) {
    var cap = pnum(v.capacity, 0), volt = pnum(v.voltage, 3.85), mw = Math.max(0.01, pnum(v.power, 0));
    var wh = cap * volt / 1000, w = mw / 1000, hrs = wh / w;
    var targetH = Math.max(0.1, pnum(v.hours, 12));
    var needWh = w * targetH, needMah = needWh * 1000 / volt;
    var rows = [
      ['电池能量', num(wh, 2) + ' Wh（' + num(wh * 3600, 0) + ' J）'],
      ['设备功耗', num(mw, 1) + ' mW（' + num(w, 4) + ' W）'],
      ['理论续航', num(hrs, 2) + ' 小时（' + rnd(hrs / 24, 2) + ' 天）'],
      ['计入 85% 效率', num(hrs * 0.85, 2) + ' 小时'],
      ['目标 ' + targetH + ' 小时所需容量', money(needMah) + ' mAh（' + num(needWh, 2) + ' Wh）']
    ];
    var extra = '';
    if (v.mode === 'capacity') {
      extra = SEC('反推结果') + KV([['目标续航', targetH + ' 小时'], ['所需能量', num(needWh, 2) + ' Wh'],
        ['所需容量', money(needMah) + ' mAh'], ['相对现有容量', needMah > cap ? '需增加 ' + money(needMah - cap) + ' mAh' : '现有容量已足够']]);
    } else if (v.mode === 'compare') {
      extra = SEC('不同功耗档位') + TB(['功耗', '场景', '理论续航', '85% 效率续航'], [
        [100, '深度待机', num(wh / 0.1, 1) + ' h', num(wh / 0.1 * 0.85, 1) + ' h'],
        [500, '轻度使用', num(wh / 0.5, 1) + ' h', num(wh / 0.5 * 0.85, 1) + ' h'],
        [1500, '常规使用', num(wh / 1.5, 1) + ' h', num(wh / 1.5 * 0.85, 1) + ' h'],
        [3000, '高负载', num(wh / 3, 1) + ' h', num(wh / 3 * 0.85, 1) + ' h'],
        [6000, '峰值负载', num(wh / 6, 1) + ' h', num(wh / 6 * 0.85, 1) + ' h']
      ].map(function (r) { return [r[0] + ' mW', r[1], r[2], r[3]]; }));
    } else {
      extra = SEC('时间换算') + KV([['分钟', num(hrs * 60, 0)], ['天', num(hrs / 24, 2)],
        ['一周可用次数（按每次 2 小时）', num(hrs / 2, 1) + ' 次']]);
    }
    return R(KV([['电池规格', cap + ' mAh × ' + volt + ' V'],
      ['能量', num(wh, 2) + ' Wh'], ['功耗', num(mw, 1) + ' mW'],
      ['模式', { time: '估算续航时长', capacity: '反推所需容量', compare: '不同功耗对比' }[v.mode]]]) +
      SEC('综合结果') + KV(rows) + extra +
      HINT('Wh = mAh × V ÷ 1000；实际续航受屏幕亮度、网络、温度与电池老化影响，一般按 80%~90% 折算。'),
      rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n'));
  }
});

/* ============================================================
   九、互动工具（2）
   ============================================================ */

T({ id: 'wordchain', name: '成语接龙', cat: 'game',
  desc: '查找可接成语、校验整条接龙或生成随机接龙链', tags: '成语 接龙 文字游戏 校验 语文',
  fields: [
    { k: 'start', label: '起始成语', type: 'text', value: '一心一意' },
    { k: 'chain', label: '待校验接龙（空格分隔）', type: 'textarea', rows: 4,
      value: '一心一意 意气风发 发扬光大 大显身手' },
    { k: 'mode', label: '模式', type: 'select', value: 'next', options: [
      ['next', '查找可接成语'], ['check', '校验整条接龙'], ['random', '随机接龙 8 步'] ] }
  ],
  run: function (v) {
    var W = [
      '一心一意', '意气风发', '发扬光大', '大显身手', '手到擒来', '来日方长', '长驱直入',
      '入木三分', '分秒必争', '争先恐后', '后来居上', '上行下效', '效犬马力', '力不从心',
      '心花怒放', '放虎归山', '山清水秀', '秀外慧中', '中流砥柱', '柱石之坚', '坚持不懈',
      '懈志松心', '心想事成', '成千上万', '万紫千红', '红红火火', '火树银花', '花好月圆',
      '圆满成功', '功成名就', '就事论事', '事半功倍', '倍道兼行', '行云流水', '水落石出',
      '出类拔萃', '萃精聚华', '华而不实', '实事求是', '是非分明', '明察秋毫', '毫发无损',
      '损人利己', '己所不欲', '欲罢不能', '能者多劳', '劳苦功高', '高瞻远瞩', '瞩望未来',
      '来龙去脉', '脉络分明', '明辨是非', '非同小可', '可歌可泣', '泣不成声', '声东击西',
      '西山日薄', '薄利多销', '销声匿迹', '迹近荒唐', '堂堂正正', '正大光明', '明目张胆',
      '胆大心细', '细水长流', '流芳百世', '世外桃源', '源远流长', '长治久安', '安居乐业',
      '业精于勤', '勤能补拙', '拙嘴笨舌', '舌战群儒', '儒雅风流', '流年似水', '水到渠成',
      '成竹在胸', '胸有成竹', '竹报平安', '安之若素', '素不相识', '识途老马', '马到成功'
    ];
    var byHead = {};
    W.forEach(function (w) { var h = w.charAt(0); (byHead[h] = byHead[h] || []).push(w); });
    var out = '', summary = '';
    if (v.mode === 'next') {
      var s = String(v.start || '').trim(), last = s.charAt(s.length - 1);
      var cand = (byHead[last] || []).filter(function (w) { return w !== s; });
      out = KV([['起始成语', esc(s)], ['末字', esc(last)], ['可接成语', cand.length + ' 个']]) +
        SEC('可接成语') + (cand.length ? PRE(cand.map(function (w, i) { return (i + 1) + '. ' + w; }).join('\n'))
          : '<div class="note">词库中没有以「' + esc(last) + '」开头的成语，可换个起始词。</div>');
      summary = cand.join('、');
    } else if (v.mode === 'check') {
      var arr = String(v.chain || '').trim().split(/[\s,，、]+/).filter(function (x) { return x; });
      var rows = [], okCount = 0;
      arr.forEach(function (w, i) {
        if (i === 0) rows.push([String(i + 1), w, '—', '起点', '—']);
        else {
          var prev = arr[i - 1], need = prev.charAt(prev.length - 1), got = w.charAt(0);
          var ok = need === got;
          if (ok) okCount++;
          rows.push([String(i + 1), w, need, ok ? '✔ 首尾相接' : '✘ 接不上', got]);
        }
      });
      out = KV([['成语数量', arr.length + ' 个'], ['正确连接', okCount + ' / ' + Math.max(0, arr.length - 1)],
        ['是否全部合法', okCount === Math.max(0, arr.length - 1) ? '是' : '否'],
        ['词库是否收录', arr.filter(function (w) { return W.indexOf(w) < 0; }).length ? '有未收录成语（仅按首尾字校验）' : '全部收录']]) +
        SEC('逐步校验') + TB(['#', '成语', '需接字', '结果', '实际首字'], rows);
      summary = rows.map(function (r) { return r[1] + ' ' + r[3]; }).join('\n');
    } else {
      var chain = [String(v.start || '').trim() || W[0]], used = {};
      used[chain[0]] = 1;
      for (var i2 = 0; i2 < 8; i2++) {
        var l = chain[chain.length - 1].charAt(chain[chain.length - 1].length - 1);
        var c2 = (byHead[l] || []).filter(function (w) { return !used[w]; });
        if (!c2.length) break;
        var pick = c2[Math.floor(Math.random() * c2.length)];
        chain.push(pick); used[pick] = 1;
      }
      out = KV([['起始成语', esc(chain[0])], ['接龙步数', (chain.length - 1) + ' 步'], ['词库规模', W.length + ' 条']]) +
        SEC('随机接龙链') + PRE(chain.map(function (w, i3) { return (i3 + 1) + '. ' + w + (i3 ? '  ← ' + chain[i3 - 1].charAt(chain[i3 - 1].length - 1) : ''); }).join('\n'));
      summary = chain.join(' → ');
    }
    return R(out + SEC('词库预览（前 20）') + PRE(W.slice(0, 20).join('、')) +
      HINT('接龙规则为「上一个成语末字 = 下一个成语首字」（同字，不含同音）；词库仅收录常用成语用于演示。'), summary);
  }
});

T({ id: 'diceprob', name: '骰子概率分布', cat: 'game',
  desc: '计算 N 枚骰子点数和的完整概率分布、期望与标准差', tags: '骰子 概率 分布 期望 方差 桌游 计算',
  fields: [
    { k: 'count', label: '骰子数量', type: 'text', value: '2' },
    { k: 'sides', label: '每枚面数', type: 'text', value: '6' },
    { k: 'bonus', label: '固定修正值', type: 'text', value: '0' },
    { k: 'target', label: '目标点数（含修正）', type: 'text', value: '7' },
    { k: 'mode', label: '统计方式', type: 'select', value: 'dist', options: [
      ['dist', '完整分布'], ['exact', '恰好等于目标'], ['atleast', '大于等于目标'] ] }
  ],
  run: function (v) {
    var n = Math.max(1, Math.min(10, parseInt(v.count, 10) || 2));
    var s = Math.max(2, Math.min(30, parseInt(v.sides, 10) || 6));
    var bonus = Math.round(pnum(v.bonus, 0)), target = pnum(v.target, n);
    var dp = { 0: 1 };
    for (var k = 0; k < n; k++) {
      var nd = {};
      Object.keys(dp).forEach(function (sk) {
        var base = parseInt(sk, 10);
        for (var f = 1; f <= s; f++) nd[base + f] = (nd[base + f] || 0) + dp[sk];
      });
      dp = nd;
    }
    var total = Math.pow(s, n), sums = Object.keys(dp).map(Number).sort(function (a, b) { return a - b; });
    var mean = 0, ex2 = 0, cum = 0;
    var rows = sums.map(function (x) {
      var p = dp[x] / total; mean += x * p; ex2 += x * x * p; cum += p;
      return [String(x + bonus), String(dp[x]), num(p * 100, 3) + '%', num(cum * 100, 3) + '%'];
    });
    var variance = Math.max(0, ex2 - mean * mean), sd = Math.sqrt(variance);
    var best = sums.reduce(function (a, b) { return dp[b] > dp[a] ? b : a; }, sums[0]);
    function probAtLeast(t) {
      var acc = 0;
      sums.forEach(function (x) { if (x + bonus >= t) acc += dp[x]; });
      return acc / total;
    }
    var exact = probAtLeast(target) - probAtLeast(target + 1);
    var extra = '';
    if (v.mode === 'exact') extra = KV([['目标点数', String(target)],
      ['恰好等于的概率', num(exact * 100, 4) + '%'], ['对应组合数', String(Math.round(exact * total))]]);
    else if (v.mode === 'atleast') extra = KV([['目标点数', String(target)],
      ['大于等于的概率', num(probAtLeast(target) * 100, 4) + '%'],
      ['对应组合数', String(Math.round(probAtLeast(target) * total))]]);
    else extra = KV([['期望（含修正）', num(mean + bonus, 4)],
      ['标准差', num(sd, 4)], ['最可能点数和', String(best + bonus) + '（' + num(dp[best] / total * 100, 3) + '%）'],
      ['取值范围', (n + bonus) + ' ~ ' + (n * s + bonus)]]);
    return R(KV([['骰子配置', n + 'D' + s + (bonus ? ' + ' + bonus : '')],
      ['总组合数', String(total)], ['点数和种类', sums.length + ' 种'],
      ['期望（不含修正）', num(mean, 4)], ['标准差', num(sd, 4)]]) +
      SEC('概率分布') + TB(['点数和', '组合数', '概率', '累计概率'], rows) + SEC('目标统计') + extra +
      HINT('使用卷积动态规划计算，避免枚举 n^s 个组合；修正值只平移结果，不改变概率。'),
      rows.map(function (r) { return r[0] + ': ' + r[2]; }).join('\n'));
  }
});

})();
