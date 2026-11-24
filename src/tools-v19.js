/* ============================================================
   安空工具箱 — v1.9 工具包（一）数论与算法演示 14 个
   纯离线、ES5 兼容写法，不联网、不依赖浏览器专有 API
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
function pnum(v, d) { var n = parseFloat(v); return isFinite(n) ? n : (d || 0); }
function lines(s) { return String(s || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n'); }
function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return Math.abs(a); }

/* 1. 回文数检测 */
T({ id: 'palnum', name: '回文数与特殊数检测', cat: 'calc',
  desc: '检测回文数、水仙花数、完全数、自恋数等趣味数性质',
  tags: '回文数 水仙花 完全数 阿姆斯特朗 趣味数学',
  fields: [{ k: 'n', label: '整数（1 ~ 1,000,000）', type: 'text', value: '153' }],
  run: function (v) {
    var n = Math.floor(pnum(v.n));
    if (n < 0 || n > 1000000) return R(HINT('请输入 0 ~ 1,000,000 的整数'));
    var s = String(n), rev = s.split('').reverse().join('');
    var props = [];
    props.push([s === rev ? '是' : '否', '回文数（正读反读相同）']);
    var digits = s.split(''), sum = 0, p = 1;
    for (var i = 0; i < digits.length; i++) sum += parseInt(digits[i], 10);
    for (i = 0; i < digits.length; i++) p *= parseInt(digits[i], 10);
    props.push([String(sum), '各位数字之和']);
    props.push([String(p), '各位数字之积']);
    // 水仙花数（3位）/ 阿姆斯特朗数（n位）
    var arm = 0, len = digits.length;
    for (i = 0; i < len; i++) arm += Math.pow(parseInt(digits[i], 10), len);
    props.push([arm === n ? '是' : '否', '阿姆斯特朗数 / 水仙花数（各位数的 n 次幂之和等于自身）']);
    // 完全数
    var dsum = 0;
    for (i = 1; i <= n / 2; i++) if (n % i === 0) dsum += i;
    props.push([n > 1 && dsum === n ? '是' : '否', '完全数（真因子之和等于自身，如 6、28）']);
    return R(SEC('数字 ' + n + ' 的性质') + KV(props));
  }});

/* 2. 卡普雷卡尔常数 */
T({ id: 'kaprekar', name: '卡普雷卡尔常数演算', cat: 'calc',
  desc: '演示 6174 卡普雷卡尔运算的逐步收敛过程',
  tags: '卡普雷卡尔 6174 数字黑洞 趣味数学',
  fields: [{ k: 'n', label: '四位以内的整数（非全相同数字）', type: 'text', value: '3524' }],
  run: function (v) {
    var n = Math.floor(pnum(v.n));
    if (n < 0 || n > 9999) return R(HINT('请输入 0 ~ 9999 的整数'));
    var s = ('0000' + n).slice(-4);
    if (/^(\d)\1{3}$/.test(s)) return R(HINT('四位数字完全相同，无收敛过程'));
    var rows = [], cur = s, step = 0, seen = {};
    while (step < 20 && !seen[cur]) {
      seen[cur] = 1;
      var arr = cur.split('').sort();
      var desc = arr.slice().reverse().join('');
      var asc = arr.join('');
      var d = parseInt(desc, 10) - parseInt(asc, 10);
      rows.push([step, cur, desc, asc, ('0000' + d).slice(-4)]);
      if (d === 0) break;
      cur = ('0000' + d).slice(-4);
      step++;
    }
    return R(SEC('收敛过程') + TB(['步', '当前', '降序', '升序', '相减'], rows) +
      HINT('四位数的卡普雷卡尔常数是 6174，最多 7 步收敛；三位数为 495。'));
  }});

/* 3. 快乐数检测 */
T({ id: 'happynum', name: '快乐数检测', cat: 'calc',
  desc: '判断快乐数（各位平方和反复计算最终为 1），展示迭代链',
  tags: '快乐数 happy number 平方和 趣味数学',
  fields: [{ k: 'n', label: '正整数', type: 'text', value: '19' }],
  run: function (v) {
    var n = Math.floor(pnum(v.n));
    if (n < 1 || n > 1000000) return R(HINT('请输入 1 ~ 1,000,000 的正整数'));
    function sqsum(x) { var s = 0; while (x > 0) { var d = x % 10; s += d * d; x = Math.floor(x / 10); } return s; }
    var chain = [], cur = n, seen = {}, happy = false;
    while (!seen[cur] && chain.length < 50) {
      chain.push(cur); seen[cur] = 1;
      if (cur === 1) { happy = true; break; }
      cur = sqsum(cur);
    }
    var rows = chain.map(function (x, i) { return [i + 1, String(x)]; });
    return R(SEC(n + (happy ? ' 是快乐数 ✓' : ' 不是快乐数')) + TB(['步', '数值'], rows) +
      HINT('快乐数：反复将各位数字平方求和，最终得到 1；否则会进入 4→16→37→58→89→145→42→20→4 的循环。'));
  }});

/* 4. 幸运数与质数检查 */
T({ id: 'primesieve', name: '埃氏筛与质数分解', cat: 'calc',
  desc: '列出区间内所有质数，用埃拉托斯特尼筛法演示',
  tags: '质数 素数 埃氏筛 sieve prime',
  fields: [
    { k: 'from', label: '起始', type: 'text', value: '1' },
    { k: 'to', label: '结束（≤ 10000）', type: 'text', value: '100' }
  ],
  run: function (v) {
    var a = Math.floor(pnum(v.from)), b = Math.floor(pnum(v.to));
    if (b < a || b > 10000) return R(HINT('请输入合理区间，上限 10000'));
    var isP = [], i, j;
    for (i = 0; i <= b; i++) isP[i] = true;
    if (b >= 0) isP[0] = false; if (b >= 1) isP[1] = false;
    for (i = 2; i * i <= b; i++) if (isP[i]) for (j = i * i; j <= b; j += i) isP[j] = false;
    var primes = [];
    for (i = Math.max(2, a); i <= b; i++) if (isP[i]) primes.push(i);
    var cnt = primes.length;
    var body = PRE(primes.join('  '));
    return R(SEC('[' + a + ', ' + b + '] 共 ' + cnt + ' 个质数') + body +
      (cnt ? HINT('最大质数：' + primes[cnt - 1]) : ''));
  }});

/* 5. 最大公约数最小公倍数 */
T({ id: 'gcdlcm', name: '最大公约数与最小公倍数', cat: 'calc',
  desc: '批量计算多个整数的 GCD 与 LCM，展示欧几里得算法步骤',
  tags: '最大公约数 最小公倍数 gcd lcm 欧几里得',
  fields: [{ k: 'nums', label: '整数列表（空格或逗号分隔）', type: 'textarea', rows: 3, value: '12 18 30' }],
  run: function (v) {
    var arr = String(v.nums || '').split(/[\s,，]+/).map(function (x) { return Math.floor(parseFloat(x)); })
      .filter(function (x) { return isFinite(x) && x > 0; });
    if (arr.length < 2) return R(HINT('请至少输入两个正整数'));
    function lcm(a, b) { return a / gcd(a, b) * b; }
    var g = arr[0], l = arr[0];
    for (var i = 1; i < arr.length; i++) { g = gcd(g, arr[i]); l = lcm(l, arr[i]); }
    var steps = [];
    var x = arr[0], y = arr[1];
    while (y) { steps.push(gcd(x, y) === gcd(x, y) ? x + ' mod ' + y + ' = ' + (x % y) : ''); var t = x % y; x = y; y = t; if (steps.length > 20) break; }
    return R(SEC('结果') + KV([
      ['整数个数', String(arr.length) + ' 个'],
      ['最大公约数 GCD', '<b>' + g + '</b>'],
      ['最小公倍数 LCM', '<b>' + l + '</b>']
    ]) + SEC('欧几里得算法（前两个数）') + PRE(steps.join('\n')));
  }});

/* 6. 进制转换增强 */
T({ id: 'radixconv', name: '任意进制互转（2~36）', cat: 'calc',
  desc: '在 2~36 进制间互转，显示完整转换表',
  tags: '进制转换 二进制 十六进制 radix base',
  fields: [
    { k: 'num', label: '数值', type: 'text', value: '255' },
    { k: 'from', label: '源进制（2~36）', type: 'text', value: '10' }
  ],
  run: function (v) {
    var s = String(v.num || '').trim().toUpperCase();
    var from = Math.floor(pnum(v.from, 10));
    if (from < 2 || from > 36) return R(HINT('源进制须在 2~36 之间'));
    var val;
    try { val = parseInt(s, from); } catch (e) { val = NaN; }
    if (!isFinite(val)) return R(HINT('数值在源进制下无效'));
    var rows = [];
    [2, 8, 10, 16, 32, 36].forEach(function (b) {
      rows.push([b + ' 进制', val.toString(b).toUpperCase()]);
    });
    return R(SEC(s + '（' + from + '进制）= ' + val + '（十进制）') + TB(['进制', '表示'], rows));
  }});

/* 7. 分数化简 */
T({ id: 'fracsimplify', name: '分数化简与运算', cat: 'calc',
  desc: '分数约分、通分、加减乘除运算',
  tags: '分数 约分 通分 化简 fraction',
  fields: [
    { k: 'a', label: '分子1', type: 'text', value: '12' },
    { k: 'b', label: '分母1', type: 'text', value: '18' },
    { k: 'c', label: '分子2', type: 'text', value: '3' },
    { k: 'd', label: '分母2', type: 'text', value: '4' }
  ],
  run: function (v) {
    var a = Math.floor(pnum(v.a)), b = Math.floor(pnum(v.b)), c = Math.floor(pnum(v.c)), d = Math.floor(pnum(v.d));
    if (!b || !d) return R(HINT('分母不能为 0'));
    var g1 = gcd(a, b) || 1, g2 = gcd(c, d) || 1;
    function fmt(n, dn) { var g = gcd(Math.abs(n), Math.abs(dn)) || 1; n /= g; dn /= g; if (dn < 0) { n = -n; dn = -dn; } return dn === 1 ? String(n) : n + '/' + dn; }
    var rows = [
      ['原分数一', fmt(a, b) + '  ≈ ' + num(a / b, 6)],
      ['约分后', (a / g1) + ' / ' + (b / g1)],
      ['原分数二', fmt(c, d) + '  ≈ ' + num(c / d, 6)],
      ['加法', fmt(a * d + c * b, b * d)],
      ['减法', fmt(a * d - c * b, b * d)],
      ['乘法', fmt(a * c, b * d)],
      ['除法', fmt(a * d, b * c)]
    ];
    return R(TB(['运算', '结果'], rows));
  }});

/* 8. 卢恩/进制和校验 */
T({ id: 'checkdigit', name: '校验位计算与验证', cat: 'dev',
  desc: '计算 ISBN-10/13、EAN-13、UPC-A、身份证等校验位',
  tags: '校验位 ISBN EAN UPC Luhn 身份证 check digit',
  fields: [
    { k: 'scheme', label: '校验方案', type: 'select', value: 'isbn13', options: [
      ['isbn13', 'ISBN-13'], ['isbn10', 'ISBN-10'], ['ean13', 'EAN-13'], ['upca', 'UPC-A'], ['luhn', 'Luhn（银行卡）'] ] },
    { k: 'code', label: '编码（不含校验位）', type: 'text', value: '978030640615' }
  ],
  run: function (v) {
    var s = String(v.code || '').replace(/[\s-]/g, '');
    if (!/^\d+$/.test(s)) return R(HINT('编码只能包含数字'));
    var scheme = v.scheme, d;
    if (scheme === 'isbn13' || scheme === 'ean13') {
      var sum = 0;
      for (var i = 0; i < s.length; i++) sum += parseInt(s.charAt(i), 10) * (i % 2 ? 3 : 1);
      d = (10 - sum % 10) % 10;
    } else if (scheme === 'upca') {
      var su = 0;
      for (i = 0; i < s.length; i++) su += parseInt(s.charAt(i), 10) * (i % 2 ? 3 : 1);
      d = (10 - su % 10) % 10;
    } else if (scheme === 'isbn10') {
      var si = 0;
      for (i = 0; i < s.length; i++) si += parseInt(s.charAt(i), 10) * (10 - i);
      var r = 11 - si % 11;
      d = r === 11 ? '0' : r === 10 ? 'X' : String(r);
    } else {
      var dr = 0, alt = true;
      for (i = s.length - 1; i >= 0; i--) {
        var n = parseInt(s.charAt(i), 10);
        if (alt) { n *= 2; if (n > 9) n -= 9; }
        dr += n; alt = !alt;
      }
      d = (10 - dr % 10) % 10;
    }
    return R(SEC(scheme.toUpperCase() + ' 校验位') + KV([
      ['输入编码', s],
      ['校验位', '<b>' + d + '</b>'],
      ['完整编码', '<b>' + s + d + '</b>']
    ]));
  }});

/* 9. 大数阶乘 */
T({ id: 'bigfact', name: '大数阶乘精确计算', cat: 'calc',
  desc: '用数组模拟大整数，精确计算最高 1000 的阶乘',
  tags: '阶乘 大数 factorial 精确计算',
  fields: [{ k: 'n', label: 'n（0 ~ 1000）', type: 'text', value: '50' }],
  run: function (v) {
    var n = Math.floor(pnum(v.n));
    if (n < 0 || n > 1000) return R(HINT('请输入 0 ~ 1000 的整数'));
    var a = [1];
    for (var k = 2; k <= n; k++) {
      var carry = 0;
      for (var i = 0; i < a.length; i++) {
        var p = a[i] * k + carry;
        a[i] = p % 10; carry = Math.floor(p / 10);
      }
      while (carry) { a.push(carry % 10); carry = Math.floor(carry / 10); }
    }
    var out = a.slice().reverse().join('');
    return R(SEC(n + '! （共 ' + out.length + ' 位）') + PRE(out));
  }});

/* 10. 斐波那契数列 */
T({ id: 'fibseq', name: '斐波那契数列生成', cat: 'calc',
  desc: '生成指定范围的斐波那契数列，支持大数',
  tags: '斐波那契 Fibonacci 数列 黄金分割',
  fields: [
    { k: 'count', label: '生成项数（1 ~ 500）', type: 'text', value: '30' }
  ],
  run: function (v) {
    var c = Math.floor(pnum(v.count));
    if (c < 1 || c > 500) return R(HINT('请输入 1 ~ 500 的项数'));
    function add(x, y) {
      var a = x.split('').reverse().map(Number), b = y.split('').reverse().map(Number), carry = 0, out = [];
      var len = Math.max(a.length, b.length);
      for (var i = 0; i < len; i++) {
        var s = (a[i] || 0) + (b[i] || 0) + carry;
        out.push(s % 10); carry = Math.floor(s / 10);
      }
      if (carry) out.push(carry);
      return out.reverse().join('');
    }
    var f0 = '0', f1 = '1', arr = [];
    if (c >= 1) arr.push(f0); if (c >= 2) arr.push(f1);
    for (var i = 3; i <= c; i++) { var nx = add(f0, f1); arr.push(nx); f0 = f1; f1 = nx; }
    var rows = [];
    for (i = 0; i < arr.length; i += 4) rows.push(arr.slice(i, i + 4).map(function (x, j) { return 'F' + (i + j + 1) + ' = ' + x; }).join('   '));
    return R(PRE(rows.join('\n')));
  }});

/* 11. 数字根 */
T({ id: 'digitalroot', name: '数字根与数独根', cat: 'calc',
  desc: '计算数字根（反复求各位和至个位数），展示过程',
  tags: '数字根 digital root 九余数 弃九法',
  fields: [{ k: 'n', label: '整数', type: 'text', value: '987654321' }],
  run: function (v) {
    var s = String(Math.floor(pnum(v.n)));
    if (!/^\d+$/.test(s)) return R(HINT('请输入非负整数'));
    var chain = [], cur = s;
    while (cur.length > 1) {
      chain.push(cur + ' → ' + cur.split('').reduce(function (a, b) { return a + parseInt(b, 10); }, 0));
      cur = String(cur.split('').reduce(function (a, b) { return a + parseInt(b, 10); }, 0));
    }
    var root = parseInt(cur, 10);
    return R(SEC('数字根 = <b>' + root + '</b>') + PRE(chain.join('\n') || s) +
      HINT('数字根等于该数对 9 取模（0 时记为 9），常用于「弃九法」验算加减乘除。'));
  }});

/* 12. 排列组合 */
T({ id: 'permutation', name: '排列组合 P/A/C 计算', cat: 'calc',
  desc: '计算排列数 A(n,m) 与组合数 C(n,m)，含大数支持',
  tags: '排列 组合 二项式系数 permutation combination',
  fields: [
    { k: 'n', label: '总数 n', type: 'text', value: '10' },
    { k: 'm', label: '选取 m', type: 'text', value: '3' }
  ],
  run: function (v) {
    var n = Math.floor(pnum(v.n)), m = Math.floor(pnum(v.m));
    if (n < 0 || m < 0 || m > n) return R(HINT('需满足 0 ≤ m ≤ n'));
    function mulRange(a, b) { // a..b 连乘，字符串大数
      var r = '1';
      for (var i = a; i <= b; i++) r = bigMulSmall(r, i);
      return r;
    }
    function bigMulSmall(s, k) {
      var carry = 0, out = [];
      for (var i = s.length - 1; i >= 0; i--) {
        var p = parseInt(s.charAt(i), 10) * k + carry;
        out.push(p % 10); carry = Math.floor(p / 10);
      }
      while (carry) { out.push(carry % 10); carry = Math.floor(carry / 10); }
      return out.reverse().join('');
    }
    var a = mulRange(n - m + 1, n);
    var c = n <= 100 ? String(Math.round(factorial(n) / (factorial(m) * factorial(n - m)))) : '(n 过大，请用阶乘分解)';
    function factorial(k) { var r = 1; for (var i = 2; i <= k; i++) r *= i; return r; }
    return R(SEC('n = ' + n + ', m = ' + m) + KV([
      ['排列数 A(' + n + ',' + m + ')', '<b>' + a + '</b>'],
      ['组合数 C(' + n + ',' + m + ')', '<b>' + c + '</b>']
    ]));
  }});

/* 13. 概率计算器 */
T({ id: 'probcalc', name: '基础概率计算器', cat: 'calc',
  desc: '计算独立事件、互斥事件、条件概率与期望值',
  tags: '概率 期望 独立事件 条件概率 probability',
  fields: [
    { k: 'p1', label: '事件 A 概率 P(A)（0~1）', type: 'text', value: '0.6' },
    { k: 'p2', label: '事件 B 概率 P(B)（0~1）', type: 'text', value: '0.3' }
  ],
  run: function (v) {
    var a = pnum(v.p1), b = pnum(v.p2);
    if (a < 0 || a > 1 || b < 0 || b > 1) return R(HINT('概率须在 0~1 之间'));
    var rows = [
      ['P(A) 不发生', num(1 - a, 6)],
      ['P(B) 不发生', num(1 - b, 6)],
      ['P(A 且 B) 独立', num(a * b, 6)],
      ['P(A 或 B) 独立', num(a + b - a * b, 6)],
      ['P(A 或 B) 互斥', num(Math.min(1, a + b), 6)],
      ['条件概率 P(A|B) 独立', b ? num(a * b / b, 6) : '—'],
      ['赔率（A 发生:不发生）', num(a / (1 - a), 4) + ' : 1']
    ];
    return R(TB(['指标', '结果'], rows));
  }});

/* 14. 数值积分 */
T({ id: 'integration', name: '梯形法数值积分', cat: 'calc',
  desc: '用梯形公式近似计算函数在区间上的定积分',
  tags: '积分 梯形法 数值计算 Simpson integral',
  fields: [
    { k: 'expr', label: '函数 f(x)（如 x^2+1，支持 sin/cos/sqrt/log/exp/abs）', type: 'text', value: 'x^2+1' },
    { k: 'a', label: '下限 a', type: 'text', value: '0' },
    { k: 'b', label: '上限 b', type: 'text', value: '2' },
    { k: 'n', label: '分割份数（越大越精确）', type: 'text', value: '1000' }
  ],
  run: function (v) {
    var a = pnum(v.a), b = pnum(v.b), n = Math.floor(pnum(v.n, 100));
    var expr = String(v.expr || 'x');
    if (n < 1 || n > 200000 || b <= a) return R(HINT('参数无效：需 b > a，分割数 1~200000'));
    // 使用框架自带的安全表达式解析器（非 eval）
    function evalF(x) {
      var e = expr.replace(/\bx\b/g, '(' + x + ')');
      try { return H.evalExpr(e); } catch (err) { return NaN; }
    }
    var h = (b - a) / n, sum = (evalF(a) + evalF(b)) / 2;
    for (var i = 1; i < n; i++) sum += evalF(a + i * h);
    var result = sum * h;
    if (!isFinite(result)) return R(HINT('函数表达式无效或结果溢出'));
    return R(SEC('∫[' + a + ', ' + b + '] f(x) dx  其中 f(x) = ' + expr) + KV([
      ['分割份数', String(n)],
      ['近似积分值', '<b>' + num(result, 8) + '</b>']
    ]) + HINT('采用复合梯形公式；f(x) 中可用 + - * / ^ 及 sin/cos/tan/sqrt/log/exp/abs 等函数。'));
  }});

})();
