/* ============================================================
   安空工具箱 — v2.1 工具包（24 个）
   纯离线、ES5 兼容写法，不依赖 ES6 语法。
   覆盖：位运算 / 数论 / 代数 / 几何 / 编码 / 财务 / 色彩
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
  return H.table(head, rows.map(function (r) { return r.map(function (c) { return esc(c); }); }));
}
function PRE(s) {
  return '<pre style="white-space:pre-wrap;word-break:break-all;font:12.5px/1.7 ui-monospace,Menlo,Consolas,monospace;margin:0;padding:2px 0">' + esc(s) + '</pre>';
}
function SEC(t) { return '<div class="sec-label" style="margin-top:14px">' + esc(t) + '</div>'; }
function HINT(t) { return '<div class="hint" style="margin-top:10px">' + esc(t) + '</div>'; }
function lines(s) { return String(s || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n'); }
function num(v, d) { return H.num(v, d == null ? 4 : d); }

/* 1. 格雷码转换 */
T({ id: 'graycode', name: '格雷码转换', cat: 'calc',
  desc: '二进制与格雷码（Gray Code）互转，相邻码仅一位不同',
  tags: '格雷码 gray 二进制 编码 转换',
  fields: [
    { k: 'num', label: '数值', type: 'text', value: '13' },
    { k: 'mode', label: '操作', type: 'select', value: 'toGray', options: [['toGray','二进制 → 格雷码'],['fromGray','格雷码 → 二进制']] }
  ],
  run: function (v) {
    var n = parseInt(v.num, 10);
    if (!(n >= 0) || !isFinite(n)) throw new Error('请输入非负整数');
    if (n > 4294967295) throw new Error('数值过大（上限 2^32-1）');
    if (v.mode === 'toGray') {
      var g = (n >> 1) ^ n;
      return R(KV([['二进制', n.toString(2)], ['格雷码(二进制)', g.toString(2)],
        ['格雷码(十进制)', g], ['格雷码(十六进制)', '0x' + g.toString(16).toUpperCase()]]));
    }
    var b = n, mask = n;
    while (mask >>= 1) b ^= mask;
    return R(KV([['格雷码(二进制)', n.toString(2)], ['二进制', b.toString(2)],
      ['十进制', b]]));
  }});

/* 2. 汉明重量（位 1 计数） */
T({ id: 'bitcount', name: '汉明重量（位计数）', cat: 'calc',
  desc: '统计整数二进制表示中 1 的个数，支持批量输入',
  tags: '汉明重量 位计数 popcount 二进制 1的个数',
  fields: [{ k: 'nums', label: '整数（逗号或空格分隔）', type: 'text', value: '0, 1, 7, 15, 255, 1024' }],
  run: function (v) {
    var arr = String(v.nums || '').split(/[,，\s]+/).filter(function (x) { return x !== ''; });
    var rows = [];
    for (var i = 0; i < arr.length; i++) {
      var n = parseInt(arr[i], 10);
      if (isNaN(n) || n < 0) throw new Error('非法整数：' + arr[i]);
      var x = n >>> 0, c = 0;
      while (x) { x &= x - 1; c++; }
      rows.push([arr[i], '0b' + (n >>> 0).toString(2), c]);
    }
    return R(TB(['数值', '二进制', '1 的个数'], rows));
  }});

/* 3. 汉明距离 */
T({ id: 'hammingdist', name: '汉明距离计算', cat: 'calc',
  desc: '计算两个等长字符串的汉明距离（不同位置数）',
  tags: '汉明距离 hamming 字符串 差异 编码',
  fields: [
    { k: 'a', label: '字符串 A', type: 'text', value: 'karolin' },
    { k: 'b', label: '字符串 B', type: 'text', value: 'kathryn' }
  ],
  run: function (v) {
    var a = String(v.a || ''), b = String(v.b || '');
    if (a.length !== b.length) throw new Error('两串长度不同：' + a.length + ' ≠ ' + b.length);
    var diff = 0;
    for (var i = 0; i < a.length; i++) if (a.charAt(i) !== b.charAt(i)) diff++;
    return R(KV([['字符串 A', esc(a)], ['字符串 B', esc(b)],
      ['长度', a.length], ['汉明距离', diff]]) +
      HINT(diff === 0 ? '两串完全相同' : '有 ' + diff + ' 个位置不同'));
  }});

/* 4. 完全数 / 亲和数检测 */
T({ id: 'perfectnum', name: '完全数与亲和数检测', cat: 'calc',
  desc: '判断完全数、盈数、亏数，并检测亲和数对',
  tags: '完全数 亲和数 盈数 亏数 数论',
  fields: [
    { k: 'n', label: '正整数 n', type: 'text', value: '28' },
    { k: 'm', label: '另一个数（可选，用于亲和数）', type: 'text', value: '220' }
  ],
  run: function (v) {
    function sumDiv(x) {
      if (x <= 1) return 0;
      var s = 1, r = Math.sqrt(x);
      for (var i = 2; i <= r; i++) if (x % i === 0) {
        s += i; var j = x / i; if (j !== i) s += j;
      }
      return s;
    }
    var n = parseInt(v.n, 10), m = parseInt(v.m, 10);
    if (!(n >= 1)) throw new Error('n 须为正整数');
    var sd = sumDiv(n);
    var kind = sd === n ? '完全数' : sd > n ? '盈数' : '亏数';
    var h = KV([['n', n], ['真因数和', sd], ['分类', kind]]);
    if (m >= 1) {
      var ok = sumDiv(n) === m && sumDiv(m) === n;
      h += '<div class="note" style="margin-top:12px">' +
        (ok ? n + ' 与 ' + m + ' 是一对亲和数' : n + ' 与 ' + m + ' 不是亲和数对') + '</div>';
    }
    return R(h);
  }});

/* 5. 水仙花数（自恋数）检测 */
T({ id: 'narcissistic', name: '自恋数（水仙花数）检测', cat: 'calc',
  desc: '判断一个数是否等于其各位数字的 n 次幂之和',
  tags: '水仙花数 自恋数 阿姆斯特朗数 数论',
  fields: [{ k: 'n', label: '正整数（可逗号分隔批量）', type: 'text', value: '153, 370, 371, 407, 9474' }],
  run: function (v) {
    var arr = String(v.n || '').split(/[,，\s]+/).filter(function (x) { return x !== ''; });
    var rows = [];
    for (var i = 0; i < arr.length; i++) {
      var s = arr[i].trim();
      if (!/^\d+$/.test(s)) throw new Error('非法整数：' + s);
      var digits = s.split(''), p = digits.length, sum = 0;
      for (var j = 0; j < digits.length; j++) sum += Math.pow(parseInt(digits[j], 10), p);
      rows.push([s, p, sum, sum === parseInt(s, 10) ? '是' : '否']);
    }
    return R(TB(['数值', '位数', '各位幂和', '是否自恋数'], rows));
  }});

/* 6. 互质判定与列表 */
T({ id: 'coprimeList', name: '互质判定与列表', cat: 'calc',
  desc: '判断两数是否互质，并列出 1~n 中与 n 互质的数',
  tags: '互质 gcd 最大公约数 数论 欧拉',
  fields: [
    { k: 'a', label: '数 a', type: 'text', value: '12' },
    { k: 'b', label: '数 b', type: 'text', value: '25' }
  ],
  run: function (v) {
    function gcd(x, y) { while (y) { var t = x % y; x = y; y = t; } return x; }
    var a = parseInt(v.a, 10), b = parseInt(v.b, 10);
    if (!(a >= 1 && b >= 1)) throw new Error('请输入正整数');
    var g = gcd(a, b);
    var list = [];
    for (var i = 1; i <= a; i++) if (gcd(i, a) === 1) list.push(i);
    return R(KV([['a', a], ['b', b], ['最大公约数', g], ['是否互质', g === 1 ? '是' : '否']]) +
      SEC('1~' + a + ' 中与 ' + a + ' 互质的数（' + list.length + ' 个）') + PRE(list.join(', ')));
  }});

/* 7. 连分数展开 */
T({ id: 'continuedFrac', name: '连分数展开', cat: 'calc',
  desc: '将分数或有理数展开为连分数表示',
  tags: '连分数 continued fraction 分数 数论',
  fields: [
    { k: 'num', label: '分子', type: 'text', value: '355' },
    { k: 'den', label: '分母', type: 'text', value: '113' }
  ],
  run: function (v) {
    var p = parseInt(v.num, 10), q = parseInt(v.den, 10);
    if (!(q > 0)) throw new Error('分母须为正整数');
    var terms = [], x = p, y = q, guard = 0;
    while (y !== 0 && guard++ < 50) {
      var a = Math.floor(x / y); terms.push(a);
      var r = x % y; x = y; y = r;
    }
    return R(KV([['分数', p + '/' + q], ['连分数项', terms.join(', ')]]) +
      SEC('展开形式') + PRE(terms.join(' + 1/') + (terms.length > 1 ? ' …' : '')) +
      HINT('连分数项依次为：' + terms.join(' → ')));
  }});

/* 8. 埃及分数分解 */
T({ id: 'egyptianFraction', name: '埃及分数分解', cat: 'calc',
  desc: '将真分数分解为若干个单位分数（分子为 1）之和',
  tags: '埃及分数 单位分数 分数 分解 贪心',
  fields: [
    { k: 'num', label: '分子', type: 'text', value: '5' },
    { k: 'den', label: '分母', type: 'text', value: '6' }
  ],
  run: function (v) {
    var p = parseInt(v.num, 10), q = parseInt(v.den, 10);
    if (!(p > 0 && q > 0)) throw new Error('请输入正整数');
    if (p >= q) throw new Error('请输入真分数（分子小于分母）');
    var parts = [], guard = 0;
    while (p > 0 && guard++ < 30) {
      var d = Math.ceil(q / p);
      parts.push(d);
      // p/q - 1/d = (p*d - q)/(q*d)
      var np = p * d - q, nq = q * d;
      function gcd(x, y) { while (y) { var t=x%y; x=y; y=t; } return x; }
      var g = gcd(np, nq); p = np / g; q = nq / g;
    }
    return R(KV([['原分数', v.num + '/' + v.den],
      ['单位分数个数', parts.length]]) +
      SEC('分解结果') + PRE('1/' + parts.join(' + 1/')) +
      HINT('即 ' + parts.map(function (d) { return '1/' + d; }).join(' + ') + ' = ' + v.num + '/' + v.den));
  }});

/* 9. 一元二次方程求根 */
T({ id: 'quadraticSolve', name: '一元二次方程求根', cat: 'calc',
  desc: '求解 ax²+bx+c=0，自动判断实根或复根',
  tags: '二次方程 求根 判别式 一元二次',
  fields: [
    { k: 'a', label: '系数 a', type: 'text', value: '1' },
    { k: 'b', label: '系数 b', type: 'text', value: '-5' },
    { k: 'c', label: '系数 c', type: 'text', value: '6' }
  ],
  run: function (v) {
    var a = parseFloat(v.a), b = parseFloat(v.b), c = parseFloat(v.c);
    if (isNaN(a) || isNaN(b) || isNaN(c)) throw new Error('请输入数字');
    if (a === 0) throw new Error('a 不能为 0');
    var disc = b * b - 4 * a * c;
    var h = KV([['方程', '(' + a + ')x² + (' + b + ')x + (' + c + ') = 0'],
      ['判别式 Δ', num(disc, 6)]]);
    if (disc >= 0) {
      var x1 = (-b + Math.sqrt(disc)) / (2 * a), x2 = (-b - Math.sqrt(disc)) / (2 * a);
      h += KV([['根 x₁', num(x1, 6)], ['根 x₂', num(x2, 6)],
        ['根的类型', disc === 0 ? '两个相等实根' : '两个不等实根']]);
    } else {
      var re = -b / (2 * a), im = Math.sqrt(-disc) / (2 * a);
      h += KV([['根 x₁', num(re, 6) + ' + ' + num(Math.abs(im), 6) + 'i'],
        ['根 x₂', num(re, 6) + ' - ' + num(Math.abs(im), 6) + 'i'],
        ['根的类型', '一对共轭复根']]);
    }
    return R(h);
  }});

/* 10. 常用三角函数值速查表 */
T({ id: 'trigTable', name: '常用三角函数值表', cat: 'calc',
  desc: '列出 0°~360° 常用角度的正弦、余弦、正切精确值与近似值',
  tags: '三角函数 正弦 余弦 正切 速查表 trig',
  fields: [
    { k: 'step', label: '角度步长', type: 'select', value: '15', options: [['15','每 15°'],['30','每 30°'],['45','每 45°']] },
    { k: 'rad', label: '附加弧度列', type: 'select', value: 'yes', options: [['yes','显示'],['no','隐藏']] }
  ],
  run: function (v) {
    var step = parseInt(v.step, 10) || 15;
    var exact = {
      0:['0','1','0'],30:['1/2','√3/2','√3/3'],45:['√2/2','√2/2','1'],
      60:['√3/2','1/2','√3'],90:['1','0','—'],120:['√3/2','-1/2','-√3'],
      135:['√2/2','-√2/2','-1'],150:['1/2','-√3/2','-√3/3'],180:['0','-1','0'],
      210:['-1/2','-√3/2','√3/3'],225:['-√2/2','-√2/2','1'],240:['-√3/2','-1/2','√3'],
      270:['-1','0','—'],300:['-√3/2','1/2','-√3'],315:['-√2/2','√2/2','-1'],
      330:['-1/2','√3/2','-√3/3'],360:['0','1','0']
    };
    var rows = [];
    for (var deg = 0; deg <= 360; deg += step) {
      var r = deg * Math.PI / 180;
      var tan = Math.abs(Math.cos(r)) < 1e-9 ? '—' : num(Math.tan(r), 4);
      var ex = exact[deg] || ['—','—','—'];
      var cols = [deg + '°'];
      if (v.rad === 'yes') cols.push(num(r, 4));
      cols.push(ex[0] + ' (' + num(Math.sin(r), 3) + ')');
      cols.push(ex[1] + ' (' + num(Math.cos(r), 3) + ')');
      cols.push(ex[2] + ' (' + tan + ')');
      rows.push(cols);
    }
    var head = ['角度'];
    if (v.rad === 'yes') head.push('弧度');
    head = head.concat(['sin', 'cos', 'tan']);
    return R(TB(head, rows) + HINT('括号内为近似值；“—”表示无定义'));
  }});

/* 11. 极坐标与直角坐标互转 */
T({ id: 'polarRect', name: '极坐标与直角坐标互转', cat: 'calc',
  desc: '笛卡尔坐标 (x,y) 与极坐标 (r,θ) 相互转换',
  tags: '极坐标 直角坐标 坐标转换 三角 角度',
  fields: [
    { k: 'mode', label: '操作', type: 'select', value: 'toPolar', options: [['toPolar','直角 → 极坐标'],['toRect','极坐标 → 直角']] },
    { k: 'x', label: 'x 或 r', type: 'text', value: '3' },
    { k: 'y', label: 'y 或 θ(度)', type: 'text', value: '4' }
  ],
  run: function (v) {
    var a = parseFloat(v.x), b = parseFloat(v.y);
    if (isNaN(a) || isNaN(b)) throw new Error('请输入数字');
    if (v.mode === 'toPolar') {
      var r = Math.sqrt(a*a + b*b), deg = Math.atan2(b, a) * 180 / Math.PI;
      return R(KV([['直角坐标', '(' + a + ', ' + b + ')'],
        ['极径 r', num(r, 6)], ['极角 θ', num(deg, 6) + '°'],
        ['极角(弧度)', num(deg * Math.PI / 180, 6)]]));
    }
    var rad = b * Math.PI / 180;
    return R(KV([['极坐标', '(r=' + a + ', θ=' + b + '°)'],
      ['x', num(a * Math.cos(rad), 6)], ['y', num(a * Math.sin(rad), 6)]]));
  }});

/* 12. 经纬度距离（Haversine） */
T({ id: 'geoDistance', name: '经纬度距离计算', cat: 'calc',
  desc: '计算地球表面两点间的直线距离（Haversine 公式）',
  tags: '经纬度 距离 haversine 地理 球面',
  fields: [
    { k: 'lat1', label: '点 A 纬度', type: 'text', value: '39.9042' },
    { k: 'lon1', label: '点 A 经度', type: 'text', value: '116.4074' },
    { k: 'lat2', label: '点 B 纬度', type: 'text', value: '31.2304' },
    { k: 'lon2', label: '点 B 经度', type: 'text', value: '121.4737' }
  ],
  run: function (v) {
    var vals = [v.lat1, v.lon1, v.lat2, v.lon2].map(parseFloat);
    if (vals.some(function (x) { return isNaN(x); })) throw new Error('请输入数字');
    var la1 = vals[0], lo1 = vals[1], la2 = vals[2], lo2 = vals[3];
    if (Math.abs(la1) > 90 || Math.abs(la2) > 90 || Math.abs(lo1) > 180 || Math.abs(lo2) > 180)
      throw new Error('纬度范围 ±90，经度范围 ±180');
    var EARTH_R = 6371, rad = Math.PI / 180;
    var dLat = (la2 - la1) * rad, dLon = (lo2 - lo1) * rad;
    var a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(la1*rad)*Math.cos(la2*rad)*Math.sin(dLon/2)*Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var km = EARTH_R * c;
    return R(KV([['距离(千米)', num(km, 2)], ['距离(米)', num(km*1000, 0)],
      ['距离(英里)', num(km*0.621371, 2)]]));
  }});

/* 13. 方位角计算 */
T({ id: 'bearingCalc', name: '方位角计算', cat: 'calc',
  desc: '计算从点 A 到点 B 的初始方位角',
  tags: '方位角 bearing 经纬度 导航 方向',
  fields: [
    { k: 'lat1', label: '起点纬度', type: 'text', value: '39.9042' },
    { k: 'lon1', label: '起点经度', type: 'text', value: '116.4074' },
    { k: 'lat2', label: '终点纬度', type: 'text', value: '31.2304' },
    { k: 'lon2', label: '终点经度', type: 'text', value: '121.4737' }
  ],
  run: function (v) {
    var vals = [v.lat1, v.lon1, v.lat2, v.lon2].map(parseFloat);
    if (vals.some(function (x) { return isNaN(x); })) throw new Error('请输入数字');
    var rad = Math.PI / 180;
    var la1 = vals[0]*rad, lo1 = vals[1]*rad, la2 = vals[2]*rad, lo2 = vals[3]*rad;
    var y = Math.sin(lo2-lo1) * Math.cos(la2);
    var x = Math.cos(la1)*Math.sin(la2) - Math.sin(la1)*Math.cos(la2)*Math.cos(lo2-lo1);
    var br = (Math.atan2(y, x) / rad + 360) % 360;
    var dirs = ['北','东北','东','东南','南','西南','西','西北'];
    var dir = dirs[Math.round(br / 45) % 8];
    return R(KV([['方位角', num(br, 2) + '°'], ['方位', dir]]));
  }});

/* 14. Soundex 语音编码 */
T({ id: 'soundex', name: 'Soundex 语音编码', cat: 'text',
  desc: '将英文姓名转为 Soundex 编码，用于按发音检索',
  tags: 'soundex 语音编码 姓名 检索 英文',
  fields: [{ k: 'text', label: '英文单词 / 姓名', type: 'text', value: 'Robert' }],
  run: function (v) {
    var s = String(v.text || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (!s) throw new Error('请输入英文字母');
    function code(c) {
      if ('BFPV'.indexOf(c) >= 0) return '1';
      if ('CGJKQSXZ'.indexOf(c) >= 0) return '2';
      if ('DT'.indexOf(c) >= 0) return '3';
      if (c === 'L') return '4';
      if ('MN'.indexOf(c) >= 0) return '5';
      if (c === 'R') return '6';
      return '';
    }
    var first = s.charAt(0), prev = code(first), out = '';
    for (var i = 1; i < s.length && out.length < 3; i++) {
      var c = code(s.charAt(i));
      if (c && c !== prev) out += c;
      if (c) prev = c;
      else prev = '';
    }
    var res = (first + out + '000').slice(0, 4);
    return R(KV([['输入', v.text], ['Soundex 编码', res]]));
  }});

/* 15. Metaphone 语音编码 */
T({ id: 'metaphone', name: 'Metaphone 语音编码', cat: 'text',
  desc: '简化的 Metaphone 编码，比 Soundex 更贴近英文发音',
  tags: 'metaphone 语音编码 发音 英文 检索',
  fields: [{ k: 'text', label: '英文单词', type: 'text', value: 'phosphorus' }],
  run: function (v) {
    var s = String(v.text || '').toUpperCase().replace(/[^A-Z]/g, '');
    if (!s) throw new Error('请输入英文字母');
    var out = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i), next = s.charAt(i+1);
      if (i === 0 && c === 'K' && next === 'N') { out += 'N'; i++; continue; }
      if (i === 0 && c === 'P' && next === 'H') { out += 'F'; i++; continue; }
      if (c === 'P' && next === 'H') { out += 'F'; i++; continue; }
      if (c === 'G' && next === 'H') { out += 'F'; i++; continue; }
      if (c === 'C') { out += (next === 'H' ? 'X' : 'K'); continue; }
      if (c === 'X') { out += 'KS'; continue; }
      if (c === 'D' && next === 'G') { out += 'J'; i++; continue; }
      if ('AEIOU'.indexOf(c) >= 0) { if (i === 0) out += c; continue; }
      if ('BHKLMNPRSTVW'.indexOf(c) >= 0) out += c;
      else if (c === 'Q') out += 'K';
      else if (c === 'Z') out += 'S';
    }
    return R(KV([['输入', v.text], ['Metaphone 编码', out]]));
  }});

/* 16. 异或校验和 */
T({ id: 'xorchecksum', name: '异或校验和计算', cat: 'dev',
  desc: '对文本字节做异或（XOR）校验，常用于简单通信协议',
  tags: '异或 xor 校验和 checksum 通信',
  fields: [{ k: 'text', label: '文本', type: 'textarea', rows: 3, value: 'Hello World' }],
  run: function (v) {
    var bytes = H.utf8Bytes(String(v.text || ''));
    var x = 0;
    for (var i = 0; i < bytes.length; i++) x ^= bytes[i];
    return R(KV([['字节数', bytes.length],
      ['异或校验和(DEC)', x],
      ['异或校验和(HEX)', '0x' + ('00' + x.toString(16).toUpperCase()).slice(-2)],
      ['二进制', '0b' + ('00000000' + x.toString(2)).slice(-8)]]));
  }});

/* 17. 奇偶校验位 */
T({ id: 'paritybit', name: '奇偶校验位计算', cat: 'dev',
  desc: '根据数据位计算奇校验或偶校验位，并验证校验结果',
  tags: '奇偶校验 parity 校验位 通信 二进制',
  fields: [
    { k: 'bits', label: '数据位（0/1 串）', type: 'text', value: '1011001' },
    { k: 'mode', label: '校验方式', type: 'select', value: 'even', options: [['even','偶校验'],['odd','奇校验']] }
  ],
  run: function (v) {
    var s = String(v.bits || '').replace(/\s/g, '');
    if (!/^[01]+$/.test(s)) throw new Error('只能包含 0 和 1');
    var ones = s.split('').filter(function (c) { return c === '1'; }).length;
    var p = v.mode === 'even' ? (ones % 2) : (ones % 2 === 0 ? 1 : 0);
    return R(KV([['数据位', s], ['1 的个数', ones],
      ['校验方式', v.mode === 'even' ? '偶校验' : '奇校验'],
      ['校验位', p], ['完整数据', s + p]]));
  }});

/* 18. 增值税价税分离 */
T({ id: 'vatsplit', name: '增值税价税分离', cat: 'calc',
  desc: '含税价与不含税价互算，支持多档税率',
  tags: '增值税 vat 价税分离 税率 含税 不含税',
  fields: [
    { k: 'amount', label: '金额', type: 'text', value: '1130' },
    { k: 'rate', label: '税率', type: 'select', value: '13', options: [['13','13%'],['9','9%'],['6','6%'],['3','3%'],['1','1%']] },
    { k: 'type', label: '输入类型', type: 'select', value: 'withTax', options: [['withTax','含税价'],['withoutTax','不含税价']] }
  ],
  run: function (v) {
    var a = parseFloat(v.amount), r = parseFloat(v.rate) / 100;
    if (isNaN(a) || a < 0) throw new Error('请输入有效金额');
    var base, tax, total;
    if (v.type === 'withTax') { total = a; base = a / (1 + r); tax = total - base; }
    else { base = a; tax = base * r; total = base + tax; }
    return R(KV([['不含税价', num(base, 2)], ['税额', num(tax, 2)],
      ['含税价', num(total, 2)], ['税率', v.rate + '%']]));
  }});

/* 19. 百分比变化与增长率 */
T({ id: 'percentchange', name: '百分比变化计算', cat: 'calc',
  desc: '计算增长率、降幅、变化量与翻倍次数',
  tags: '百分比 增长率 变化率 涨跌 幅度',
  fields: [
    { k: 'old', label: '原值', type: 'text', value: '80' },
    { k: 'new', label: '新值', type: 'text', value: '100' }
  ],
  run: function (v) {
    var o = parseFloat(v.old), n = parseFloat(v.new);
    if (isNaN(o) || isNaN(n)) throw new Error('请输入数字');
    if (o === 0) throw new Error('原值不能为 0');
    var change = n - o, pct = change / Math.abs(o) * 100;
    return R(KV([['原值', num(o, 4)], ['新值', num(n, 4)],
      ['变化量', num(change, 4)], ['变化率', num(pct, 4) + '%'],
      ['结论', pct > 0 ? '增长 ' + num(pct, 2) + '%' : pct < 0 ? '下降 ' + num(-pct, 2) + '%' : '无变化']]));
  }});

/* 20. RGB 与 CMYK 互转 */
T({ id: 'rgbCmyk', name: 'RGB 与 CMYK 互转', cat: 'calc',
  desc: '屏幕色 RGB 与印刷色 CMYK 相互转换',
  tags: 'rgb cmyk 颜色 色彩 转换 印刷',
  fields: [
    { k: 'mode', label: '操作', type: 'select', value: 'toCmyk', options: [['toCmyk','RGB → CMYK'],['toRgb','CMYK → RGB']] },
    { k: 'v1', label: 'R 或 C (0-255 / 0-100)', type: 'text', value: '255' },
    { k: 'v2', label: 'G 或 M', type: 'text', value: '128' },
    { k: 'v3', label: 'B 或 Y', type: 'text', value: '0' },
    { k: 'v4', label: '（CMYK 时的 K）', type: 'text', value: '0' }
  ],
  run: function (v) {
    var a = parseFloat(v.v1), b = parseFloat(v.v2), c = parseFloat(v.v3), d = parseFloat(v.v4);
    if ([a,b,c,d].some(function (x) { return isNaN(x); })) throw new Error('请输入数字');
    if (v.mode === 'toCmyk') {
      if ([a,b,c].some(function (x) { return x < 0 || x > 255; })) throw new Error('RGB 须在 0~255');
      var r = a/255, g = b/255, bl = c/255;
      var k = 1 - Math.max(r, g, bl);
      if (k === 1) return R(KV([['CMYK', '0%, 0%, 0%, 100%'], ['HEX', '#000000']]));
      var C = (1 - r - k) / (1 - k), M = (1 - g - k) / (1 - k), Y = (1 - bl - k) / (1 - k);
      return R(KV([['C', (C*100).toFixed(1)+'%'], ['M', (M*100).toFixed(1)+'%'],
        ['Y', (Y*100).toFixed(1)+'%'], ['K', (k*100).toFixed(1)+'%']]));
    }
    if ([a,b,c,d].some(function (x) { return x < 0 || x > 100; })) throw new Error('CMYK 须在 0~100');
    var C2=a/100, M2=b/100, Y2=c/100, K2=d/100;
    var R2 = 255*(1-C2)*(1-K2), G2 = 255*(1-M2)*(1-K2), B2 = 255*(1-Y2)*(1-K2);
    function h(x) { return ('0' + Math.round(x).toString(16)).slice(-2); }
    return R(KV([['R', Math.round(R2)], ['G', Math.round(G2)], ['B', Math.round(B2)],
      ['HEX', '#' + h(R2) + h(G2) + h(B2)]]));
  }});

/* 21. 区间质数筛选 */
T({ id: 'sieveRange', name: '区间质数筛选', cat: 'calc',
  desc: '列出指定区间内的所有质数（埃拉托斯特尼筛法）',
  tags: '质数 素数 筛选 埃氏筛 区间',
  fields: [
    { k: 'from', label: '起始', type: 'text', value: '100' },
    { k: 'to', label: '结束', type: 'text', value: '200' }
  ],
  run: function (v) {
    var lo = parseInt(v.from, 10), hi = parseInt(v.to, 10);
    if (isNaN(lo) || isNaN(hi) || lo < 0) throw new Error('请输入非负整数');
    if (hi - lo > 100000) throw new Error('区间过大（上限 10 万）');
    var isP = new Array(hi + 1);
    for (var i = 0; i <= hi; i++) isP[i] = true;
    if (hi >= 0) isP[0] = false;
    if (hi >= 1) isP[1] = false;
    for (var p = 2; p * p <= hi; p++) if (isP[p])
      for (var j = p * p; j <= hi; j += p) isP[j] = false;
    var primes = [];
    for (var k = Math.max(2, lo); k <= hi; k++) if (isP[k]) primes.push(k);
    return R(KV([['区间', lo + ' ~ ' + hi], ['质数个数', primes.length]]) +
      SEC('质数列表') + PRE(primes.join(', ') || '（该区间无质数）'));
  }});

/* 22. 斐波那契序号查询 */
T({ id: 'fibonacciIndex', name: '斐波那契数列查询', cat: 'calc',
  desc: '生成斐波那契数列指定项，或查询某数是否为斐波那契数',
  tags: '斐波那契 fibonacci 数列 黄金分割',
  fields: [
    { k: 'mode', label: '操作', type: 'select', value: 'gen', options: [['gen','生成前 N 项'],['check','查询序号']] },
    { k: 'n', label: '项数或数值', type: 'text', value: '20' }
  ],
  run: function (v) {
    var n = parseInt(v.n, 10);
    if (isNaN(n) || n < 0) throw new Error('请输入非负整数');
    if (v.mode === 'gen') {
      if (n > 500) throw new Error('项数过大（上限 500）');
      var a = 0, b = 1, seq = [];
      for (var i = 0; i < n; i++) { seq.push(a); var t = a + b; a = b; b = t; }
      return R(SEC('前 ' + n + ' 项') + PRE(seq.join(', ')));
    }
    var x = 0, y = 1, idx = 0;
    while (y < n) { var t2 = x + y; x = y; y = t2; idx++; }
    return R(KV([['数值', n], ['是否为斐波那契数', y === n ? '是' : '否'],
      ['最接近的序号', y === n ? idx + 1 : '—'],
      ['相邻项', x + ', ' + y]]));
  }});

/* 23. 卢卡斯数列 */
T({ id: 'lucas', name: '卢卡斯数列', cat: 'calc',
  desc: '生成卢卡斯数列（L₀=2, L₁=1），与斐波那契数关系密切',
  tags: '卢卡斯 lucas 数列 数论',
  fields: [{ k: 'n', label: '前 N 项', type: 'text', value: '20' }],
  run: function (v) {
    var n = parseInt(v.n, 10);
    if (!(n >= 1 && n <= 500)) throw new Error('项数须在 1~500');
    var a = 2, b = 1, seq = [];
    for (var i = 0; i < n; i++) { seq.push(a); var t = a + b; a = b; b = t; }
    return R(SEC('卢卡斯数列前 ' + n + ' 项') + PRE(seq.join(', ')));
  }});

/* 24. 卡特兰数 */
T({ id: 'catalan', name: '卡特兰数计算', cat: 'calc',
  desc: '计算第 n 个卡特兰数（括号匹配、二叉树计数等）',
  tags: '卡特兰 catalan 组合数学 数论',
  fields: [{ k: 'n', label: 'n（0~30）', type: 'text', value: '10' }],
  run: function (v) {
    var n = parseInt(v.n, 10);
    if (!(n >= 0 && n <= 30)) throw new Error('n 须在 0~30');
    // C(n) = C(2n,n)/(n+1)，用 BigInt 风格的整数数组避免溢出（n<=30 时 JS double 够用）
    var c = 1;
    for (var k = 0; k < n; k++) c = c * 2 * (2*k + 1) / (k + 2);
    var rows = [];
    for (var i = 0; i <= Math.min(n, 15); i++) {
      var ci = 1;
      for (var j = 0; j < i; j++) ci = ci * 2 * (2*j + 1) / (j + 2);
      rows.push([i, ci]);
    }
    return R(KV([['n', n], ['C(n)', c]]) +
      (n > 15 ? TB(['i', 'C(i)'], rows) + HINT('仅列出前 16 项') : TB(['i', 'C(i)'], rows)));
  }});

})();
