/* ============================================================
   安空工具箱 — v1.7 工具包（二）15~26
   开发者 4 · 计算换算 8
   纯离线、ES5 兼容写法
   ============================================================ */
(function () {
'use strict';

function esc(s) { return H.esc(s == null ? '' : String(s)); }
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

/* ============================================================
   三、开发者（4）
   ============================================================ */

/* 15. glob → 正则 */
T({ id: 'glob2re', name: 'glob 转正则与匹配测试', cat: 'dev',
  desc: '把通配符模式转成正则表达式，并批量测试路径是否命中',
  tags: 'glob 通配符 正则 regex 匹配 gitignore minimatch 星号 花括号',
  fields: [
    { k: 'pattern', label: 'glob 模式（每行一个）', type: 'textarea', rows: 4,
      value: 'src/**/*.js\n*.{png,jpg}\nfile[0-9].txt' },
    { k: 'paths', label: '待测试路径（每行一个）', type: 'textarea', rows: 6,
      value: 'src/core.js\nsrc/utils/deep/helper.js\nindex.js\nlogo.png\ncover.jpg\nfile3.txt\nfileA.txt' },
    { k: 'anchor', label: '匹配方式', type: 'select', value: 'full', options: [
      ['full', '整串完全匹配'], ['part', '包含即命中'] ] }
  ],
  run: function (v) {
    var pats = lines(v.pattern).map(function (x) { return x.trim(); }).filter(Boolean);
    var ps = lines(v.paths).map(function (x) { return x.trim(); }).filter(Boolean);
    var rows = [], results = [], k;
    function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    function globToRe(g) {
      var out = '', i = 0;
      while (i < g.length) {
        var c = g.charAt(i);
        if (c === '*') {
          if (g.charAt(i + 1) === '*') {
            i += 2;
            if (g.charAt(i) === '/') { i++; out += '(?:.*/)?'; } else out += '.*';
          } else { out += '[^/]*'; i++; }
        } else if (c === '?') { out += '[^/]'; i++; }
        else if (c === '[') {
          var j = g.indexOf(']', i + 1);
          if (j < 0) { out += '\\['; i++; }
          else { var set = g.slice(i + 1, j); out += '[' + (set.charAt(0) === '!' ? '^' + set.slice(1) : set) + ']'; i = j + 1; }
        } else if (c === '{') {
          var j2 = g.indexOf('}', i + 1);
          if (j2 < 0) { out += '\\{'; i++; }
          else { out += '(?:' + g.slice(i + 1, j2).split(',').map(escRe).join('|') + ')'; i = j2 + 1; }
        } else if ('.+^$()|\\'.indexOf(c) >= 0) { out += '\\' + c; i++; }
        else { out += c; i++; }
      }
      return out;
    }
    for (k = 0; k < pats.length; k++) {
      var body = globToRe(pats[k]), re;
      try { re = new RegExp(v.anchor === 'part' ? body : '^' + body + '$'); }
      catch (e) { rows.push([pats[k], '正则无效：' + e.message]); continue; }
      var hits = ps.filter(function (p) { return re.test(p); });
      rows.push([pats[k], hits.length + ' / ' + ps.length + ' 命中']);
      results.push({ pat: pats[k], body: body, hits: hits });
    }
    var html = SEC('模式与命中数') + TB(['glob 模式', '结果'], rows);
    for (k = 0; k < results.length; k++) {
      html += SEC('「' + results[k].pat + '」等价正则') +
        PRE((v.anchor === 'part' ? '/' : '/^') + results[k].body + (v.anchor === 'part' ? '/' : '$/')) +
        PRE(results[k].hits.length ? results[k].hits.join('\n') : '（无命中路径）');
    }
    return { html: html + HINT('* 不匹配斜杠，** 可跨目录；? 匹配单字符；[abc] 字符集；{a,b} 分支。常用于 .gitignore、构建工具的 include/exclude 规则。'),
      text: results.map(function (r) { return r.pat + ' -> ' + r.body; }).join('\n') };
  }
});

/* 16. 统一 diff 生成 */
T({ id: 'diffformat', name: '统一 diff 生成', cat: 'dev',
  desc: '按行计算最长公共子序列，生成带 -/+ 的 unified diff 文本',
  tags: 'diff unified patch LCS 行对比 版本 diff git 文本差异',
  fields: [
    { k: 'a', label: '原始文本（旧）', type: 'textarea', rows: 7,
      value: 'const name = "ankong";\nconst version = "1.6";\nfunction hello() {\n  return name;\n}\n// 离线工具箱' },
    { k: 'b', label: '修改后文本（新）', type: 'textarea', rows: 7,
      value: 'const name = "ankong";\nconst version = "1.7";\nfunction hello() {\n  return name + " " + version;\n}\n// 离线工具箱\n// 新增一行' },
    { k: 'ctx', label: '上下文行数', type: 'number', value: 3 }
  ],
  run: function (v) {
    var A = lines(v.a), B = lines(v.b), i, j;
    if (A.length * B.length > 400000) return HINT('文本过大（行数乘积超过 400000），请缩短后再试。');
    var dp = [], k;
    for (i = 0; i <= A.length; i++) { dp[i] = []; for (k = 0; k <= B.length; k++) dp[i][k] = 0; }
    for (i = 1; i <= A.length; i++) for (j = 1; j <= B.length; j++)
      dp[i][j] = A[i - 1] === B[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    var ops = [], x = A.length, y = B.length;
    while (x > 0 || y > 0) {
      if (x > 0 && y > 0 && A[x - 1] === B[y - 1]) { ops.push([' ', A[x - 1]]); x--; y--; }
      else if (y > 0 && (x === 0 || dp[x][y - 1] >= dp[x - 1][y])) { ops.push(['+', B[y - 1]]); y--; }
      else { ops.push(['-', A[x - 1]]); x--; }
    }
    ops.reverse();
    var add = 0, del = 0, out = [];
    for (k = 0; k < ops.length; k++) { if (ops[k][0] === '+') add++; else if (ops[k][0] === '-') del++; }
    out.push('--- 原始文本');
    out.push('+++ 修改后文本');
    var ctx = Math.max(0, Math.min(10, parseInt(v.ctx, 10) || 3));
    var changed = ops.map(function (o) { return o[0] !== ' '; });
    var shown = {}, q;
    for (q = 0; q < ops.length; q++) if (changed[q])
      for (var w = Math.max(0, q - ctx); w <= Math.min(ops.length - 1, q + ctx); w++) shown[w] = 1;
    var last = -2, hunk = 1, oa = 1, ob = 1;
    for (q = 0; q < ops.length; q++) {
      if (!shown[q]) continue;
      if (q > last + 1 && q > 0) out.push('@@ hunk ' + (hunk++) + ' @@');
      out.push(ops[q][0] + ops[q][1]);
      last = q;
    }
    var diff = out.join('\n');
    var stat = ops.filter(function (o) { return o[0] === ' '; }).length;
    return SEC('Unified Diff') + PRE(diff) +
      SEC('统计') + KV([
        ['旧文本行数', A.length + ' 行'], ['新文本行数', B.length + ' 行'],
        ['新增', add + ' 行'], ['删除', del + ' 行'], ['未改动', stat + ' 行'],
        ['最长公共子序列', dp[A.length][B.length] + ' 行']
      ]) + HINT('基于 LCS 的行级 diff；上下文行数控制每个 hunk 前后保留的未改动行。可用于生成补丁说明或代码评审摘要。');
  }
});

/* 17. CSP / 安全响应头生成 */
T({ id: 'cspgen', name: 'CSP 与安全响应头生成', cat: 'dev',
  desc: '按策略与资源来源生成 Content-Security-Policy 及配套安全响应头',
  tags: 'CSP Content-Security-Policy 安全头 HSTS Referrer-Policy Permissions-Policy X-Frame-Options nonce',
  fields: [
    { k: 'level', label: '严格程度', type: 'select', value: 'balanced', options: [
      ['strict', '严格（仅 self，禁 inline）'], ['balanced', '平衡（self + 常用来源）'], ['loose', '宽松（允许 https 与 inline）'] ] },
    { k: 'img', label: '允许外部图片', type: 'switch', value: true },
    { k: 'font', label: '允许外部字体', type: 'switch', value: true },
    { k: 'frame', label: '允许 iframe 嵌入自身', type: 'switch', value: false },
    { k: 'hsts', label: '附带 HSTS（仅 HTTPS）', type: 'switch', value: true }
  ],
  run: function (v) {
    var lv = String(v.level || 'balanced'), img = !!v.img, font = !!v.font, frame = !!v.frame;
    var src = "'self'", extras = [];
    if (lv === 'loose') { extras.push('https:'); src = "'self' https:"; }
    var d = [
      ['default-src', src],
      ['script-src', lv === 'loose' ? "'self' 'unsafe-inline' https:" : "'self'"],
      ['style-src', lv === 'loose' ? "'self' 'unsafe-inline' https:" : "'self' 'unsafe-inline'"],
      ['img-src', "'self' data:" + (img ? (lv === 'strict' ? '' : ' https:') : '')],
      ['font-src', "'self' data:" + (font ? (lv === 'strict' ? '' : ' https:') : '')],
      ['connect-src', lv === 'loose' ? "'self' https:" : "'self'"],
      ['object-src', "'none'"],
      ['base-uri', "'self'"],
      ['form-action', "'self'"],
      ['frame-ancestors', frame ? "'self'" : "'none'"]
    ];
    if (lv !== 'loose') d.push(['upgrade-insecure-requests', '']);
    var csp = d.map(function (r) { return r[0] + (r[1] ? ' ' + r[1] : '') + ';'; }).join(' ');
    var headers = [
      ['Content-Security-Policy', csp],
      ['X-Content-Type-Options', 'nosniff'],
      ['Referrer-Policy', 'strict-origin-when-cross-origin'],
      ['X-Frame-Options', frame ? 'SAMEORIGIN' : 'DENY'],
      ['Permissions-Policy', 'camera=(), microphone=(), geolocation=()']
    ];
    if (v.hsts) headers.push(['Strict-Transport-Security', 'max-age=31536000; includeSubDomains']);
    var nginx = headers.map(function (h) { return 'add_header ' + h[0] + ' "' + h[1].replace(/"/g, '\\"') + '" always;'; }).join('\n');
    return SEC('生成的响应头') + TB(['响应头', '值'], headers) +
      SEC('CSP 指令明细') + TB(['指令', '值'], d) +
      SEC('Nginx 配置片段') + PRE(nginx) +
      HINT('严格模式下建议用 nonce 或 hash 替代 unsafe-inline；部署前先用 Content-Security-Policy-Report-Only 观察违规报告。');
  }
});

/* 18. 正则表达式解释器 */
T({ id: 'regexexplain', name: '正则表达式解释器', cat: 'dev',
  desc: '把正则表达式逐片段拆解成自然语言说明，并给出测试匹配结果',
  tags: '正则 regex 解释 拆解 语法 量词 分组 断言 学习',
  fields: [
    { k: 'pattern', label: '正则表达式（不含两侧斜杠）', type: 'text',
      value: '^([A-Za-z]+)@(\\w+)\\.([a-z]{2,6})$' },
    { k: 'flags', label: '修饰符', type: 'select', value: 'none', options: [
      ['none', '无'], ['i', 'i 忽略大小写'], ['g', 'g 全局'], ['gi', 'gi 全局 + 忽略大小写'], ['m', 'm 多行'] ] },
    { k: 'tests', label: '测试字符串（每行一个）', type: 'textarea', rows: 4,
      value: 'hello@ankong.com\nname@site.cn\nbad@@example\nHELLO@ANKONG.COM' }
  ],
  run: function (v) {
    var p = String(v.pattern || ''), rows = [], i = 0;
    function push(frag, mean) { rows.push([frag, mean]); }
    var escapes = { d: '数字 [0-9]', D: '非数字', w: '单词字符 [A-Za-z0-9_]', W: '非单词字符',
      s: '空白字符', S: '非空白', b: '单词边界', B: '非单词边界', n: '换行', t: '制表符', r: '回车' };
    while (i < p.length) {
      var c = p.charAt(i), frag = c, mean = '', j;
      if (c === '\\') {
        frag = p.substr(i, 2); var e = p.charAt(i + 1);
        mean = escapes[e] ? ('转义：' + escapes[e]) : ('转义字符：字面量 ' + e);
        i += 2; push(frag, mean); continue;
      }
      if (c === '[') {
        j = i + 1; if (p.charAt(j) === '^') j++; if (p.charAt(j) === ']') j++;
        while (j < p.length && p.charAt(j) !== ']') { if (p.charAt(j) === '\\') j++; j++; }
        frag = p.slice(i, Math.min(j + 1, p.length));
        var neg = p.charAt(i + 1) === '^';
        mean = '字符集合' + (neg ? '（取反，匹配不在集合中的字符）' : '：匹配其中任意一个字符');
        i = j + 1; push(frag, mean); continue;
      }
      if (c === '(') {
        if (p.substr(i, 3) === '(?:') { frag = '(?:'; mean = '非捕获分组：只分组、不单独提取'; i += 3; }
        else if (p.substr(i, 3) === '(?=') { frag = '(?='; mean = '正向先行断言：后面必须是…（不消耗字符）'; i += 3; }
        else if (p.substr(i, 3) === '(?!') { frag = '(?!'; mean = '负向先行断言：后面不能是…'; i += 3; }
        else if (p.substr(i, 4) === '(?<=') { frag = '(?<='; mean = '正向后行断言：前面必须是…'; i += 4; }
        else { frag = '('; mean = '捕获分组：括号内容作为一组，可用 $1、$2 引用'; i += 1; }
        push(frag, mean); continue;
      }
      if (c === '{') {
        var j2 = p.indexOf('}', i);
        if (j2 > i) { frag = p.slice(i, j2 + 1); mean = '量词：重复 ' + frag + ' 次（{n} / {n,} / {n,m}）'; i = j2 + 1; push(frag, mean); continue; }
      }
      var quant = { '*': '量词：重复 0 次或多次', '+': '量词：重复 1 次或多次', '?': '量词：重复 0 或 1 次（可选）' };
      if (quant[c]) {
        frag = c; mean = quant[c];
        if (p.charAt(i + 1) === '?') { frag = c + '?'; mean += '，懒惰模式（尽可能少匹配）'; i++; }
        i++; push(frag, mean); continue;
      }
      var simple = { '^': '锚点：行/字符串开始', '$': '锚点：行/字符串结束', '.': '任意单个字符（默认不含换行）',
        '|': '或：匹配左侧或右侧分支', ')': '分组结束' };
      mean = simple[c] || ('字面字符：' + c);
      i++; push(frag, mean);
    }
    var flags = v.flags === 'none' ? '' : String(v.flags || ''), re = null, err = '';
    try { re = new RegExp(p, flags); } catch (e) { err = e.message; }
    var ts = lines(v.tests).filter(function (x) { return x.length; }), testRows = [];
    for (var q = 0; q < ts.length && q < 40; q++) {
      var ok = re ? re.test(ts[q]) : false, caps = '';
      if (re && ok) {
        var m = new RegExp(p, flags.replace('g', '')).exec(ts[q]);
        if (m && m.length > 1) caps = m.slice(1).map(function (x, ix) { return '$' + (ix + 1) + '=' + (x == null ? 'undefined' : x); }).join('  ');
      }
      testRows.push([ts[q], ok ? '匹配' : '不匹配', caps || '—']);
    }
    return SEC('逐片段解释') + TB(['片段', '含义'], rows) +
      (err ? HINT('正则语法错误：' + err) : (SEC('测试匹配') + TB(['字符串', '结果', '捕获组'], testRows))) +
      SEC('概览') + KV([
        ['表达式长度', p.length + ' 字符'], ['修饰符', flags || '（无）'],
        ['片段数', rows.length + ' 个'], ['捕获分组数', (p.match(/\((?!\?)/g) || []).length + ' 个']
      ]) + HINT('解释器覆盖常用语法：锚点、量词、字符类、分组、断言与转义；复杂嵌套或回溯优化需结合具体引擎理解。');
  }
});

/* ============================================================
   四、计算换算（8）
   ============================================================ */

/* 19. 质数与因数分解 */
T({ id: 'primefact', name: '质数与因数分解', cat: 'calc',
  desc: '判定质数、分解质因数、求全部因数与个数，并计算两个数的 GCD / LCM',
  tags: '质数 素数 因数分解 质因数 最大公约数 最小公倍数 GCD LCM 试除',
  fields: [
    { k: 'text', label: '正整数（逗号 / 空格 / 换行分隔）', type: 'textarea', rows: 3,
      value: '360, 1024, 97, 1234567, 28, 49' },
    { k: 'showdiv', label: '列出全部因数', type: 'switch', value: true }
  ],
  run: function (v) {
    var raw = String(v.text || '').split(/[\s,，;；]+/).filter(Boolean), vals = [], k;
    for (k = 0; k < raw.length && k < 30; k++) {
      var n = parseInt(raw[k], 10);
      if (isFinite(n) && n > 0 && n <= 9007199254740991) vals.push(n);
    }
    if (!vals.length) return HINT('请输入正整数（建议小于 2^53）。');
    function factor(n) {
      var f = [], d = 2, x = n;
      while (d * d <= x && d <= 10000000) {
        if (x % d === 0) { var c = 0; while (x % d === 0) { x /= d; c++; } f.push([d, c]); }
        d += (d === 2 ? 1 : 2);
      }
      if (x > 1) f.push([x, 1]);
      return f;
    }
    function divisors(f) {
      var ds = [1];
      for (var a = 0; a < f.length; a++) {
        var base = f[a][0], pw = 1, cur = ds.slice(), out = ds.slice();
        for (var e = 1; e <= f[a][1]; e++) { pw *= base; for (var b = 0; b < cur.length; b++) out.push(cur[b] * pw); }
        ds = out;
      }
      return ds.sort(function (a2, b2) { return a2 - b2; });
    }
    var rows = [], details = [];
    for (k = 0; k < vals.length; k++) {
      var n2 = vals[k], f2 = factor(n2), isPrime = f2.length === 1 && f2[0][1] === 1;
      var expr = f2.map(function (q) { return q[1] > 1 ? q[0] + '^' + q[1] : String(q[0]); }).join(' × ') || '1';
      var ds = divisors(f2), sum = ds.reduce(function (a3, b3) { return a3 + b3; }, 0);
      rows.push([String(n2), isPrime ? '质数' : '合数', expr, String(ds.length), String(sum)]);
      details.push({ n: n2, ds: ds, expr: expr });
    }
    var html = SEC('分解结果') + TB(['数值', '判定', '质因数分解', '因数个数', '因数和'], rows);
    if (v.showdiv) {
      for (k = 0; k < details.length && k < 8; k++)
        html += SEC(details[k].n + ' 的全部因数（' + details[k].ds.length + ' 个）') +
          PRE(details[k].ds.length > 200 ? details[k].ds.slice(0, 200).join(', ') + ' …（已截断）' : details[k].ds.join(', '));
    }
    if (vals.length >= 2) {
      function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
      var g = vals[0], l = vals[0];
      for (k = 1; k < vals.length; k++) { g = gcd(g, vals[k]); l = l / gcd(l, vals[k]) * vals[k]; }
      html += SEC('整体关系') + KV([
        ['参与数值', vals.length + ' 个'], ['最大公约数 GCD', num(g, 0)],
        ['最小公倍数 LCM', num(l, 0)], ['数值之积', num(vals.reduce(function (a4, b4) { return a4 * b4; }, 1), 0)]
      ]);
    }
    return { html: html + HINT('使用试除法，适合 2^53 以内的整数；超大整数请用专用大数库。质数判定基于「除 1 与自身外无其它因数」。'),
      text: rows.map(function (r) { return r[0] + ' = ' + r[2]; }).join('\n') };
  }
});

/* 20. IEEE 754 浮点表示 */
T({ id: 'ieee754', name: 'IEEE 754 浮点位级解析', cat: 'calc',
  desc: '查看一个数字在单精度 / 双精度下的符号位、指数与尾数二进制及误差',
  tags: 'IEEE754 浮点数 单精度 双精度 尾数 指数 二进制 精度 舍入 NaN Infinity',
  fields: [
    { k: 'value', label: '数值', type: 'text', value: '0.1' },
    { k: 'prec', label: '精度', type: 'select', value: 'both', options: [
      ['both', '双精度 + 单精度'], ['f64', '仅双精度 float64'], ['f32', '仅单精度 float32'] ] }
  ],
  run: function (v) {
    var x = parseFloat(v.value);
    if (!isFinite(x) && String(v.value).trim() !== 'NaN' && !/inf/i.test(String(v.value)))
      return HINT('请输入有效数字，或 NaN / Infinity 查看特殊值编码。');
    var s = String(v.value).trim();
    if (/^nan$/i.test(s)) x = NaN;
    else if (/^-?inf(inity)?$/i.test(s)) x = /^-/.test(s) ? -Infinity : Infinity;
    function bits(arr, n) { var o = '', i; for (i = 0; i < arr.length; i++) { var b = arr[i].toString(2); while (b.length < 8) b = '0' + b; o += b; } return o.slice(0, n); }
    function pad(b, n) { while (b.length < n) b = '0' + b; return b.slice(-n); }
    function hexOf(buf) { var o = '', i; for (i = 0; i < buf.length; i++) o += ('0' + buf[i].toString(16).toUpperCase()).slice(-2); return o; }
    var out = [], html = '', textArr = [];
    try {
      var b8 = new ArrayBuffer(8), dv = new DataView(b8);
      dv.setFloat64(0, x, false);
      var hi = dv.getUint32(0, false), lo = dv.getUint32(4, false);
      var b64 = pad(hi.toString(2), 32) + pad(lo.toString(2), 32);
      var sg = b64.charAt(0), ex = b64.slice(1, 12), mn = b64.slice(12);
      var buf8 = [(hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255, (lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255];
      var eVal = parseInt(ex, 2) - 1023, special = parseInt(ex, 2) === 2047;
      var mant = 1 + parseInt(mn, 2) / Math.pow(2, 52);
      var recon = (sg === '1' ? -1 : 1) * (parseInt(ex, 2) === 0 ? parseInt(mn, 2) / Math.pow(2, 52) * Math.pow(2, -1022) : mant * Math.pow(2, eVal));
      var d = { name: '双精度 float64', total: 64, sign: sg, exp: ex, mantissa: mn, hex: '0x' + hexOf(buf8),
        expVal: eVal, recon: special ? (parseInt(mn, 2) ? 'NaN' : 'Infinity') : recon,
        err: special ? '—' : Math.abs(recon - x) };
      out.push(d);
    } catch (e) { return HINT('当前环境不支持 DataView，无法解析位级表示。'); }
    try {
      var b4 = new ArrayBuffer(4), dv4 = new DataView(b4);
      dv4.setFloat32(0, x, false);
      var w = dv4.getUint32(0, false), b32 = pad(w.toString(2), 32);
      var sg2 = b32.charAt(0), ex2 = b32.slice(1, 9), mn2 = b32.slice(9);
      var buf4 = [(w >>> 24) & 255, (w >>> 16) & 255, (w >>> 8) & 255, w & 255];
      var e2 = parseInt(ex2, 2) - 127, sp2 = parseInt(ex2, 2) === 255;
      var recon2 = (sg2 === '1' ? -1 : 1) * (parseInt(ex2, 2) === 0 ? parseInt(mn2, 2) / Math.pow(2, 23) * Math.pow(2, -126) : (1 + parseInt(mn2, 2) / Math.pow(2, 23)) * Math.pow(2, e2));
      out.push({ name: '单精度 float32', total: 32, sign: sg2, exp: ex2, mantissa: mn2, hex: '0x' + hexOf(buf4),
        expVal: e2, recon: sp2 ? (parseInt(mn2, 2) ? 'NaN' : 'Infinity') : recon2,
        err: sp2 ? '—' : Math.abs(recon2 - x) });
    } catch (e2) {}
    var show = String(v.prec || 'both'), list = [];
    if (show === 'f64') list = [out[0]]; else if (show === 'f32') list = [out[1]]; else list = out;
    for (var k = 0; k < list.length; k++) {
      var o = list[k]; if (!o) continue;
      html += SEC(o.name + '（' + o.total + ' bit）') +
        PRE(o.sign + ' | ' + o.exp + ' | ' + o.mantissa) +
        KV([
          ['符号位 S', o.sign + '（' + (o.sign === '1' ? '负' : '正') + '）'],
          ['指数位 E', o.exp + ' → 无偏指数 ' + o.expVal],
          ['尾数位 M', o.mantissa],
          ['十六进制', o.hex],
          ['还原数值', String(o.recon)],
          ['与输入误差', typeof o.err === 'number' ? o.err.toExponential(4) : o.err]
        ]);
      textArr.push(o.name + ' ' + o.sign + o.exp + o.mantissa + ' ' + o.hex);
    }
    return { html: html + HINT('双精度 = 1 符号位 + 11 指数位 + 52 尾数位；0.1、0.2 这类十进制小数无法用二进制精确表示，故 0.1+0.2 !== 0.3。'), text: textArr.join('\n') };
  }
});

/* 21. 模运算 */
T({ id: 'modmath', name: '模运算与模逆元', cat: 'calc',
  desc: '计算模加/减/乘、快速幂取模、最大公约数与乘法逆元',
  tags: '模运算 同余 模逆元 快速幂 扩展欧几里得 RSA 密码学 取模',
  fields: [
    { k: 'a', label: '整数 a', type: 'number', value: 17 },
    { k: 'b', label: '整数 b / 指数', type: 'number', value: 23 },
    { k: 'm', label: '模数 m（>0）', type: 'number', value: 1000000007 }
  ],
  run: function (v) {
    var a = parseInt(v.a, 10), b = parseInt(v.b, 10), m = parseInt(v.m, 10);
    if (!isFinite(a) || !isFinite(b) || !isFinite(m) || m <= 0) return HINT('请输入合法整数，且模数 m 必须大于 0。');
    function mod(x) { return ((x % m) + m) % m; }
    function gcd(x, y) { x = Math.abs(x); y = Math.abs(y); while (y) { var t = x % y; x = y; y = t; } return x; }
    function egcd(x, y) {
      if (y === 0) return [x, 1, 0];
      var r = egcd(y, ((x % y) + y) % y);
      return [r[0], r[2], r[1] - Math.floor(x / y) * r[2]];
    }
    function powmod(base, exp) {
      base = mod(base); var e = exp, res = 1 % m, guard = 0;
      while (e > 0 && guard++ < 2000) { if (e % 2) res = (res * base) % m; base = (base * base) % m; e = Math.floor(e / 2); }
      return res;
    }
    var g = gcd(a, m), inv = null, eg = egcd(a, m);
    if (g === 1) inv = mod(eg[1]);
    var rows = [
      ['a mod m', mod(a)], ['b mod m', mod(b)],
      ['(a + b) mod m', mod(a + b)], ['(a − b) mod m', mod(a - b)],
      ['(a × b) mod m', mod(a * b)],
      ['a^b mod m（快速幂）', b >= 0 && b < 100000 ? powmod(a, b) : '指数过大或为负，已跳过'],
      ['gcd(a, m)', g], ['a 与 m 是否互质', g === 1 ? '是' : '否'],
      ['a 在模 m 下的逆元', inv == null ? '不存在（gcd ≠ 1）' : inv],
      ['逆元验证 (a × inv) mod m', inv == null ? '—' : mod(a * inv)]
    ];
    return SEC('计算结果（m = ' + m + '）') + KV(rows) +
      HINT('快速幂把指数按二进制拆分，复杂度 O(log b)；模逆元由扩展欧几里得算法求出，仅当 gcd(a, m)=1 时存在，是 RSA 等公钥算法的基础。');
  }
});

/* 22. 方程求解 */
T({ id: 'eqsolve', name: '方程求解（一元二次 / 二元一次）', cat: 'calc',
  desc: '求解一元二次方程（含复根）与二元一次方程组，给出判别式与步骤',
  tags: '一元二次 方程 求根 判别式 复根 二元一次 方程组 克拉默法则',
  fields: [
    { k: 'type', label: '方程类型', type: 'select', value: 'quad', options: [
      ['quad', '一元二次 ax²+bx+c=0'], ['linear2', '二元一次方程组'] ] },
    { k: 'a', label: 'a（或方程组第一行 a₁）', type: 'number', value: 1 },
    { k: 'b', label: 'b（或 b₁）', type: 'number', value: -5 },
    { k: 'c', label: 'c（或 c₁，等号右边）', type: 'number', value: 6 },
    { k: 'a2', label: 'a₂（仅方程组）', type: 'number', value: 2 },
    { k: 'b2', label: 'b₂（仅方程组）', type: 'number', value: 1 },
    { k: 'c2', label: 'c₂（仅方程组）', type: 'number', value: 7 }
  ],
  run: function (v) {
    var a = pnum(v.a), b = pnum(v.b), c = pnum(v.c);
    if (v.type === 'linear2') {
      var a2 = pnum(v.a2), b2 = pnum(v.b2), c2 = pnum(v.c2);
      var D = a * b2 - a2 * b;
      var html2;
      if (Math.abs(D) < 1e-12) {
        html2 = KV([['系数行列式 D', num(D, 6)], ['结论', a * c2 - a2 * c === 0 && b * c2 - b2 * c === 0 ? '两式等价：无穷多组解' : '两式矛盾：无解']]);
      } else {
        var X = (c * b2 - c2 * b) / D, Y = (a * c2 - a2 * c) / D;
        html2 = KV([
          ['系数行列式 D = a₁b₂ − a₂b₁', num(D, 6)],
          ['Dₓ = c₁b₂ − c₂b₁', num(c * b2 - c2 * b, 6)],
          ['Dᵧ = a₁c₂ − a₂c₁', num(a * c2 - a2 * c, 6)],
          ['x = Dₓ / D', num(X, 8)], ['y = Dᵧ / D', num(Y, 8)]
        ]) + SEC('验算') + TB(['方程', '左边代入值', '右边'], [
          ['a₁x + b₁y', num(a * X + b * Y, 6), num(c, 6)],
          ['a₂x + b₂y', num(a2 * X + b2 * Y, 6), num(c2, 6)]
        ]);
      }
      return SEC('二元一次方程组') + PRE(a + 'x + ' + b + 'y = ' + c + '\n' + a2 + 'x + ' + b2 + 'y = ' + c2) +
        html2 + HINT('使用克拉默法则：D ≠ 0 时有唯一解；D = 0 时需进一步判断是无穷多解还是无解。');
    }
    if (Math.abs(a) < 1e-15) {
      if (Math.abs(b) < 1e-15) return HINT('a = b = 0：' + (Math.abs(c) < 1e-15 ? '恒等式，任意实数都是解。' : '矛盾式，无解。'));
      var x0 = -c / b;
      return SEC('退化为一元一次') + KV([['方程', b + 'x + ' + c + ' = 0'], ['解 x', num(x0, 8)]]);
    }
    var disc = b * b - 4 * a * c, html, res;
    if (disc >= 0) {
      var sq = Math.sqrt(disc), x1 = (-b + sq) / (2 * a), x2 = (-b - sq) / (2 * a);
      res = [num(x1, 8), num(x2, 8)];
      html = KV([
        ['判别式 Δ = b² − 4ac', num(disc, 8)],
        ['根的性质', disc > 0 ? '两个不相等的实根' : '两个相等的实根（重根）'],
        ['x₁ = (−b + √Δ) / 2a', res[0]], ['x₂ = (−b − √Δ) / 2a', res[1]],
        ['两根之和 −b/a', num(-b / a, 8)], ['两根之积 c/a', num(c / a, 8)]
      ]) + SEC('因式分解形式') + PRE(a + '(x − ' + res[0] + ')(x − ' + res[1] + ') = 0');
    } else {
      var re = -b / (2 * a), im = Math.sqrt(-disc) / (2 * a);
      res = [num(re, 6) + ' + ' + num(im, 6) + 'i', num(re, 6) + ' − ' + num(im, 6) + 'i'];
      html = KV([
        ['判别式 Δ', num(disc, 8)], ['根的性质', '一对共轭复根'],
        ['实部 −b/2a', num(re, 8)], ['虚部 √(−Δ)/2a', num(im, 8)],
        ['x₁', res[0]], ['x₂', res[1]]
      ]);
    }
    return SEC('一元二次方程') + PRE(a + 'x² + ' + (b < 0 ? '− ' + Math.abs(b) : '+ ' + b) + 'x + ' + c + ' = 0') +
      html + HINT('求根公式 x = (−b ± √(b²−4ac)) / 2a；判别式小于 0 时根为共轭复数。');
  }
});

/* 23. 数列计算 */
T({ id: 'seqcalc', name: '数列通项与求和', cat: 'calc',
  desc: '等差、等比、斐波那契数列的通项、前 n 项和与前若干项列表',
  tags: '数列 等差 等比 斐波那契 通项 求和 递推 前n项和',
  fields: [
    { k: 'type', label: '数列类型', type: 'select', value: 'arith', options: [
      ['arith', '等差数列'], ['geo', '等比数列'], ['fib', '斐波那契数列'], ['square', '平方 / 立方数列'] ] },
    { k: 'a1', label: '首项 a₁', type: 'number', value: 2 },
    { k: 'd', label: '公差 d / 公比 q', type: 'number', value: 3 },
    { k: 'n', label: '项数 n（1~200）', type: 'number', value: 12 }
  ],
  run: function (v) {
    var a1 = pnum(v.a1), d = pnum(v.d), n = Math.max(1, Math.min(200, parseInt(v.n, 10) || 10));
    var type = String(v.type || 'arith'), arr = [], i, an = 0, sum = 0, formula = '';
    if (type === 'arith') {
      for (i = 0; i < n; i++) arr.push(a1 + i * d);
      an = a1 + (n - 1) * d; sum = n * (a1 + an) / 2;
      formula = 'aₙ = a₁ + (n−1)d；Sₙ = n(a₁ + aₙ)/2';
    } else if (type === 'geo') {
      for (i = 0; i < n; i++) arr.push(a1 * Math.pow(d, i));
      an = a1 * Math.pow(d, n - 1);
      sum = Math.abs(d - 1) < 1e-12 ? a1 * n : a1 * (1 - Math.pow(d, n)) / (1 - d);
      formula = 'aₙ = a₁·qⁿ⁻¹；Sₙ = a₁(1−qⁿ)/(1−q)（q≠1）';
    } else if (type === 'fib') {
      var x = 0, y = 1;
      if (Math.abs(a1) > 0 || Math.abs(d) > 0) { x = a1; y = d; }
      for (i = 0; i < n; i++) { arr.push(x); var t = x + y; x = y; y = t; sum += arr[i]; }
      an = arr[n - 1];
      formula = 'Fₙ = Fₙ₋₁ + Fₙ₋₂（首两项分别为 ' + a1 + '、' + d + '）';
    } else {
      var pw = Math.abs(d) < 1 ? 2 : Math.min(3, Math.round(Math.abs(d)));
      for (i = 0; i < n; i++) arr.push(Math.pow(a1 + i, pw));
      an = arr[n - 1]; for (i = 0; i < n; i++) sum += arr[i];
      formula = 'aₙ = (a₁ + n − 1)^' + pw + '（' + (pw === 2 ? '平方' : '立方') + '数列）';
    }
    var maxShow = Math.min(n, 30);
    var rows = arr.slice(0, maxShow).map(function (val, ix) { return [String(ix + 1), num(val, 6), num(sumOf(arr, ix + 1), 6)]; });
    function sumOf(a, cnt) { var s = 0; for (var q = 0; q < cnt; q++) s += a[q]; return s; }
    return SEC('公式') + PRE(formula) +
      SEC('前 ' + maxShow + ' 项') + TB(['项序 n', 'aₙ', '前 n 项和 Sₙ'], rows) +
      SEC('汇总') + KV([
        ['项数', n + ' 项'], ['第 n 项 aₙ', num(an, 8)],
        ['前 n 项和 Sₙ', num(sum, 8)], ['平均值', num(sum / n, 8)],
        ['相邻项比值（末两项）', n > 1 && arr[n - 2] !== 0 ? num(arr[n - 1] / arr[n - 2], 6) : '—']
      ]) + HINT('等比数列公比 |q|<1 时存在无穷和极限 S∞ = a₁/(1−q)；斐波那契相邻项比值趋近黄金比例 1.618。');
  }
});

/* 24. 向量运算 */
T({ id: 'vectorcalc', name: '向量运算', cat: 'calc',
  desc: '计算三维向量的加减、点积、叉积、模长、夹角、投影与单位向量',
  tags: '向量 点积 叉积 内积 外积 模长 夹角 投影 单位向量 3D',
  fields: [
    { k: 'a', label: '向量 A（三个数，逗号分隔）', type: 'text', value: '1, 2, 3' },
    { k: 'b', label: '向量 B（三个数，逗号分隔）', type: 'text', value: '4, -1, 2' }
  ],
  run: function (v) {
    function parse(s) {
      var t = String(s || '').split(/[\s,，]+/).filter(Boolean).map(parseFloat);
      while (t.length < 3) t.push(0);
      return t.slice(0, 3).map(function (x) { return isFinite(x) ? x : 0; });
    }
    var A = parse(v.a), B = parse(v.b), i;
    var add = [], sub = [], i;
    for (i = 0; i < 3; i++) { add.push(A[i] + B[i]); sub.push(A[i] - B[i]); }
    var dot = A[0] * B[0] + A[1] * B[1] + A[2] * B[2];
    var cross = [A[1] * B[2] - A[2] * B[1], A[2] * B[0] - A[0] * B[2], A[0] * B[1] - A[1] * B[0]];
    var la = Math.sqrt(A[0] * A[0] + A[1] * A[1] + A[2] * A[2]);
    var lb = Math.sqrt(B[0] * B[0] + B[1] * B[1] + B[2] * B[2]);
    var cos = (la && lb) ? dot / (la * lb) : 0;
    cos = Math.max(-1, Math.min(1, cos));
    var ang = Math.acos(cos) * 180 / Math.PI;
    var ua = la ? A.map(function (x) { return x / la; }) : [0, 0, 0];
    var ub = lb ? B.map(function (x) { return x / lb; }) : [0, 0, 0];
    var projLen = lb ? dot / lb : 0;
    var proj = ub.map(function (x) { return x * projLen; });
    var crossLen = Math.sqrt(cross[0] * cross[0] + cross[1] * cross[1] + cross[2] * cross[2]);
    function f(arr) { return '(' + arr.map(function (x) { return num(x, 4); }).join(', ') + ')'; }
    return SEC('输入') + KV([['A', f(A)], ['B', f(B)]]) +
      SEC('运算结果') + KV([
        ['A + B', f(add)], ['A − B', f(sub)],
        ['点积 A·B', num(dot, 6)], ['叉积 A×B', f(cross)],
        ['|A|', num(la, 6)], ['|B|', num(lb, 6)],
        ['夹角（度）', num(ang, 4) + '°'], ['cos θ', num(cos, 6)],
        ['A 的单位向量', f(ua)], ['B 的单位向量', f(ub)],
        ['A 在 B 上的投影向量', f(proj)], ['投影长度（标量）', num(projLen, 6)],
        ['叉积模长（平行四边形面积）', num(crossLen, 6)]
      ]) + HINT('点积为 0 表示两向量垂直；叉积为 0 表示平行。叉积模长等于以 A、B 为邻边的平行四边形面积。');
  }
});

/* 25. 复数运算 */
T({ id: 'complexcalc', name: '复数四则运算', cat: 'calc',
  desc: '计算两个复数的加减乘除、模、辐角、共轭与极坐标形式',
  tags: '复数 虚数 i 四则运算 模 辐角 共轭 极坐标 欧拉公式',
  fields: [
    { k: 'a', label: '复数 A 实部', type: 'number', value: 3 },
    { k: 'b', label: '复数 A 虚部', type: 'number', value: 4 },
    { k: 'c', label: '复数 B 实部', type: 'number', value: 1 },
    { k: 'd', label: '复数 B 虚部', type: 'number', value: -2 },
    { k: 'op', label: '运算', type: 'select', value: 'all', options: [
      ['all', '全部运算'], ['add', '加法'], ['sub', '减法'], ['mul', '乘法'], ['div', '除法'] ] }
  ],
  run: function (v) {
    var a = pnum(v.a), b = pnum(v.b), c = pnum(v.c), d = pnum(v.d);
    function fmt(re, im) {
      var r = num(re, 6), s = num(Math.abs(im), 6);
      return r + (im < 0 ? ' − ' : ' + ') + s + 'i';
    }
    var den = c * c + d * d, res = [];
    if (v.op === 'all' || v.op === 'add') res.push(['A + B', fmt(a + c, b + d)]);
    if (v.op === 'all' || v.op === 'sub') res.push(['A − B', fmt(a - c, b - d)]);
    if (v.op === 'all' || v.op === 'mul') res.push(['A × B', fmt(a * c - b * d, a * d + b * c)]);
    if (v.op === 'all' || v.op === 'div') res.push(['A ÷ B', den === 0 ? '除数为零，无定义' : fmt((a * c + b * d) / den, (b * c - a * d) / den)]);
    var ma = Math.sqrt(a * a + b * b), mb = Math.sqrt(c * c + d * d);
    var ta = Math.atan2(b, a) * 180 / Math.PI, tb = Math.atan2(d, c) * 180 / Math.PI;
    return SEC('输入') + KV([['A', fmt(a, b)], ['B', fmt(c, d)]]) +
      SEC('运算结果') + TB(['运算', '结果'], res) +
      SEC('属性') + KV([
        ['|A|', num(ma, 6)], ['|B|', num(mb, 6)],
        ['arg(A)', num(ta, 3) + '°'], ['arg(B)', num(tb, 3) + '°'],
        ['A 的共轭', fmt(a, -b)], ['B 的共轭', fmt(c, -d)],
        ['A 的极坐标形式', num(ma, 4) + '(cos ' + num(ta, 2) + '° + i·sin ' + num(ta, 2) + '°)'],
        ['A²', fmt(a * a - b * b, 2 * a * b)],
        ['1/A', (a === 0 && b === 0) ? 'A 为零，无倒数' : fmt(a / (a * a + b * b), -b / (a * a + b * b))]
      ]) + HINT('复数乘法按 i² = −1 展开；除法通过乘以分母的共轭实现实数化分母。模 |z| = √(a²+b²)，辐角为 atan2(b, a)。');
  }
});

/* 26. 有效数字与舍入 */
T({ id: 'sigfig', name: '有效数字与舍入规则', cat: 'calc',
  desc: '按有效数字位数或小数位数舍入，对比四舍五入、银行家舍入等规则',
  tags: '有效数字 舍入 四舍五入 银行家 向上 向下 科学计数法 精度',
  fields: [
    { k: 'value', label: '数值（可多个，逗号分隔）', type: 'text', value: '3.14159265, 2.5, 3.5, 12345.6789, 0.0045678' },
    { k: 'digits', label: '保留位数', type: 'number', value: 3 },
    { k: 'by', label: '按什么保留', type: 'select', value: 'sig', options: [
      ['sig', '有效数字位数'], ['dec', '小数位数'] ] },
    { k: 'mode', label: '舍入规则', type: 'select', value: 'half-up', options: [
      ['half-up', '四舍五入（远离零）'], ['half-even', '银行家舍入（奇进偶舍）'],
      ['ceil', '向上取整（趋 +∞）'], ['floor', '向下取整（趋 −∞）'], ['trunc', '截断（趋零）'] ] }
  ],
  run: function (v) {
    var vals = String(v.value || '').split(/[\s,，]+/).filter(Boolean).map(parseFloat).filter(isFinite);
    var sig = Math.max(1, Math.min(15, parseInt(v.digits, 10) || 3));
    if (!vals.length) return HINT('请输入有效数字。');
    function banker(x) {
      var fl = Math.floor(x), fr = x - fl;
      if (Math.abs(fr - 0.5) < 1e-10) return (fl % 2 === 0) ? fl : fl + 1;
      return Math.round(x);
    }
    function roundAt(x, places, mode) {
      var p = Math.pow(10, places), y = x * p, neg = y < 0, ay = Math.abs(y), r;
      if (mode === 'ceil') r = Math.ceil(y);
      else if (mode === 'floor') r = Math.floor(y);
      else if (mode === 'trunc') r = y < 0 ? Math.ceil(y) : Math.floor(y);
      else if (mode === 'half-even') r = neg ? -banker(ay) : banker(ay);
      else r = y < 0 ? -Math.round(ay) : Math.round(ay);
      return r / p;
    }
    var rows = [], i;
    for (i = 0; i < vals.length && i < 20; i++) {
      var x = vals[i], places;
      if (v.by === 'dec') places = sig;
      else {
        if (x === 0) places = sig - 1;
        else places = sig - 1 - Math.floor(Math.log(Math.abs(x)) / Math.LN10);
      }
      var out = roundAt(x, Math.max(-12, Math.min(12, places)), String(v.mode || 'half-up'));
      var sci = x === 0 ? '0' : (x.toExponential(Math.max(0, sig - 1)));
      rows.push([String(x), String(places), num(out, 12), sci]);
    }
    return SEC('舍入结果') + TB(['原始数值', '舍入位（10 的幂）', '结果', '科学计数法'], rows) +
      SEC('规则说明') + TB(['规则', '含义'], [
        ['四舍五入', '恰好 .5 时远离零（2.5→3，-2.5→-3）'],
        ['银行家舍入', '恰好 .5 时取最近的偶数（2.5→2，3.5→4），可减小累计偏差'],
        ['向上 / 向下', '分别趋 +∞ / −∞'], ['截断', '直接丢弃多余位，趋零']
      ]) + HINT('有效数字从第一个非零数字起算；0.0045678 保留 3 位为 0.00457。浮点运算本身存在二进制误差，金额计算请用定点小数或整数分。');
  }
});

})();
