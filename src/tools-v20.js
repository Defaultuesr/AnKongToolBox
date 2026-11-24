/* ============================================================
   安空工具箱 — v2.0 工具包（24 个）
   纯离线、ES5 兼容写法，不依赖 ES6 语法。
   覆盖：数论 / 文本 / 编码 / 校验 / 换算 / 日期 / 生活
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

/* 1. 任意大数进制转换（2~36，纯字符串除法） */
T({ id: 'numbase', name: '大数任意进制转换', cat: 'calc',
  desc: '支持超长整数的 2~36 进制互转，采用字符串运算无精度损失',
  tags: '进制 大数 base 转换 二进制 十六进制',
  fields: [
    { k: 'num', label: '数字', type: 'text', value: '123456789012345678901234567890' },
    { k: 'from', label: '源进制', type: 'text', value: '10' },
    { k: 'to', label: '目标进制', type: 'text', value: '16' }
  ],
  run: function (v) {
    function toDec(s, b) {
      s = s.toUpperCase().trim(); var r = [0];
      for (var i = 0; i < s.length; i++) {
        var d = parseInt(s.charAt(i), 36);
        if (isNaN(d) || d >= b) throw new Error('含非法字符：' + s.charAt(i));
        var carry = d, j;
        for (j = 0; j < r.length; j++) { var x = r[j] * b + carry; r[j] = x % 1000000000; carry = Math.floor(x / 1000000000); }
        while (carry) { r.push(carry % 1000000000); carry = Math.floor(carry / 1000000000); }
      }
      while (r.length > 1 && r[r.length - 1] === 0) r.pop();
      return r;
    }
    function divDec(r, b) {
      var q = [], carry = 0;
      for (var i = r.length - 1; i >= 0; i--) {
        var x = carry * 1000000000 + r[i];
        q.unshift(Math.floor(x / b)); carry = x % b;
      }
      while (q.length > 1 && q[0] === 0) q.shift();
      return [q, carry];
    }
    function fromDec(r, b) {
      if (r.length === 1 && r[0] === 0) return '0';
      var out = [];
      while (!(r.length === 1 && r[0] === 0)) {
        var d = divDec(r, b); r = d[0];
        out.push('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(d[1]));
      }
      return out.reverse().join('');
    }
    var b1 = parseInt(v.from, 10), b2 = parseInt(v.to, 10);
    if (!(b1 >= 2 && b1 <= 36) || !(b2 >= 2 && b2 <= 36)) throw new Error('进制须在 2~36 之间');
    var dec = toDec(String(v.num || '0'), b1);
    var res = fromDec(dec.slice(), b2);
    return R(SEC('转换结果（' + b1 + ' → ' + b2 + '）') + PRE(res) + HINT('采用分块大整数运算，可处理任意长度输入'));
  }});

/* 2. Luhn 校验（银行卡 / 各类编号） */
T({ id: 'luhncheck', name: 'Luhn 校验码计算', cat: 'dev',
  desc: '计算或验证 Luhn 校验位，常用于银行卡、IMEI 等编号',
  tags: 'luhn 校验位 银行卡 imei 验证',
  fields: [
    { k: 'num', label: '编号', type: 'text', value: '7992739871' },
    { k: 'mode', label: '操作', type: 'select', value: 'calc', options: [['calc', '计算校验位'], ['verify', '验证完整性']] }
  ],
  run: function (v) {
    var s = String(v.num || '').replace(/[\s-]/g, '');
    if (!/^\d+$/.test(s)) throw new Error('只能包含数字');
    function checkDigit(body) {
      var sum = 0, alt = true;
      for (var i = body.length - 1; i >= 0; i--) {
        var d = parseInt(body.charAt(i), 10);
        if (alt) { d *= 2; if (d > 9) d -= 9; }
        sum += d; alt = !alt;
      }
      return (10 - (sum % 10)) % 10;
    }
    if (v.mode === 'verify') {
      var body = s.slice(0, -1), given = parseInt(s.slice(-1), 10);
      var ok = checkDigit(body) === given;
      return R('<div class="note ' + (ok ? '' : '') + '">' + (ok ? '校验通过：编号合法' : '校验失败：校验位不匹配') + '</div>' +
        KV([['编号', esc(s)], ['计算校验位', checkDigit(body)], ['给定校验位', given]]));
    }
    var cd = checkDigit(s);
    return R(KV([['编号主体', esc(s)], ['校验位', cd], ['完整编号', esc(s + cd)]]));
  }});

/* 3. CRC16 校验计算 */
T({ id: 'crc16', name: 'CRC16 校验计算', cat: 'dev',
  desc: '计算文本的 CRC16 校验值，支持常见多项式',
  tags: 'crc crc16 校验 通信',
  fields: [
    { k: 'text', label: '文本', type: 'textarea', rows: 3, value: '123456789' },
    { k: 'poly', label: '多项式', type: 'select', value: '1021', options: [['1021', 'CCITT (0x1021)'], ['8005', 'MODBUS (0x8005)'], ['3D65', 'X-25 (0x3D65)']] }
  ],
  run: function (v) {
    var bytes = H.utf8Bytes(String(v.text || ''));
    var poly = parseInt(v.poly, 16), crc = 0xFFFF;
    for (var i = 0; i < bytes.length; i++) {
      crc ^= (bytes[i] << 8);
      for (var j = 0; j < 8; j++) crc = (crc & 0x8000) ? ((crc << 1) ^ poly) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
    var hex = ('0000' + crc.toString(16).toUpperCase()).slice(-4);
    return R(KV([['算法', 'CRC16 / 0x' + v.poly.toUpperCase()], ['字节数', bytes.length],
      ['校验值 (HEX)', '0x' + hex], ['校验值 (DEC)', crc]]));
  }});

/* 4. Email 格式校验 */
T({ id: 'emailvalidate', name: '邮箱地址批量校验', cat: 'text',
  desc: '逐行校验邮箱地址格式，标注合法性与可能的问题',
  tags: 'email 邮箱 校验 格式 批量',
  fields: [
    { k: 'text', label: '邮箱地址（每行一个）', type: 'textarea', rows: 6,
      value: 'user@example.com\nbad@@example\nname+tag@sub.domain.co.uk\n@missing.com' }
  ],
  run: function (v) {
    var arr = lines(v.text).filter(function (l) { return l.trim(); });
    var re = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;
    var rows = arr.map(function (e, i) {
      var ok = re.test(e.trim());
      return [i + 1, e.trim(), ok ? '合法' : '格式错误'];
    });
    var valid = rows.filter(function (r) { return r[2] === '合法'; }).length;
    return R(SEC('校验结果：' + valid + ' / ' + arr.length + ' 合法') + TB(['#', '邮箱', '结果'], rows));
  }});

/* 5. 中国手机号段识别 */
T({ id: 'phonelookup', name: '手机号段归属识别', cat: 'query',
  desc: '根据中国大陆手机号前 7 位识别运营商与号段类型',
  tags: '手机 号段 运营商 归属 电话',
  fields: [
    { k: 'phone', label: '手机号', type: 'text', value: '13800138000' }
  ],
  run: function (v) {
    var s = String(v.phone || '').replace(/[\s-]/g, '');
    if (!/^1\d{10}$/.test(s)) throw new Error('请输入 11 位中国大陆手机号');
    var p3 = s.slice(0, 3), p7 = s.slice(0, 7);
    function op(p) {
      if (/^13[0-9]$|^14[5-9]$|^15[0-3,5-9]$|^166$|^17[0-8]$|^18[0-9]$|^19[0-3,5-9]$/.test(p)) {
        if (/^14[5-9]$|^166$|^17[0-8]$|^19[0-3,5-9]$/.test(p)) return '中国移动（4G/5G 号段）';
        return '中国移动';
      }
      if (/^13[0-2]$|^145$|^146$|^15[0-1]$|^17[0-1]$|^18[5-6]$|^185$|^186$|^185$|^13[0-2]$/.test(p)) return '中国联通';
      return '疑似移动 / 联通号段';
    }
    var isVirtual = /^17[0-8]$|^16[6-7]$|^19[0-9]$/.test(p3);
    return R(KV([['手机号', esc(s)], ['前 3 位', p3], ['前 7 位', p7],
      ['运营商（推断）', op(p3)], ['号段类型', isVirtual ? '可能为虚拟运营商 / 数据卡' : '常规移动号段']]) +
      HINT('运营商归属以最新工信部号段分配为准，此处为常见号段规则推断，仅供大致参考。'));
  }});

/* 6. 身份证号校验与信息提取 */
T({ id: 'idcardcheck', name: '身份证号校验', cat: 'query',
  desc: '验证 18 位身份证校验码并提取出生日期、性别、地区码',
  tags: '身份证 校验 出生日期 性别 地区',
  fields: [
    { k: 'id', label: '身份证号', type: 'text', value: '11010519491231002X' }
  ],
  run: function (v) {
    var s = String(v.id || '').replace(/\s/g, '').toUpperCase();
    if (!/^\d{17}[\dX]$/.test(s)) throw new Error('请输入 18 位身份证号');
    var w = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2];
    var codes = '10X98765432', sum = 0;
    for (var i = 0; i < 17; i++) sum += parseInt(s.charAt(i), 10) * w[i];
    var expect = codes.charAt(sum % 11), ok = expect === s.charAt(17);
    var y = s.slice(6, 10), m = s.slice(10, 12), d = s.slice(12, 14), seq = s.slice(14, 17);
    var gender = parseInt(seq.charAt(2), 10) % 2 ? '男' : '女';
    return R('<div class="note">' + (ok ? '校验通过：校验码正确' : '校验失败：应为 ' + expect) + '</div>' +
      KV([['出生日期', y + '-' + m + '-' + d], ['性别', gender], ['地区码', s.slice(0, 6)],
        ['顺序码', seq], ['校验码', s.charAt(17)]]));
  }});

/* 7. Unicode 转义 / 反转义 */
T({ id: 'unicodeEscape', name: 'Unicode 转义工具', cat: 'text',
  desc: '文本与 \\uXXXX / \\xXX 转义串互转',
  tags: 'unicode 转义 反转义 编码 文本',
  fields: [
    { k: 'text', label: '文本', type: 'textarea', rows: 4, value: '你好 Hello 😀' },
    { k: 'mode', label: '操作', type: 'select', value: 'escape', options: [['escape', '转义为 \\u'], ['unescape', '从 \\u 还原']] }
  ],
  run: function (v) {
    var s = String(v.text || '');
    if (v.mode === 'escape') {
      var out = [];
      for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        if (c >= 0xD800 && c <= 0xDBFF && i + 1 < s.length) {
          var c2 = s.charCodeAt(i + 1);
          if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
            out.push('\\u' + c.toString(16) + '\\u' + c2.toString(16)); i++; continue;
          }
        }
        out.push(c > 0xFFFF ? '\\u' + c.toString(16) : '\\u' + ('0000' + c.toString(16)).slice(-4));
      }
      return R(PRE(out.join('')));
    }
    try {
      var res = JSON.parse('"' + s.replace(/"/g, '\\"') + '"');
      return R(PRE(res));
    } catch (e) { throw new Error('转义串格式错误：' + e.message); }
  }});

/* 8. Base32 编解码 */
T({ id: 'base32', name: 'Base32 编解码', cat: 'text',
  desc: 'Base32 编码与解码，RFC 4648 标准',
  tags: 'base32 编码 解码 编码转换',
  fields: [
    { k: 'text', label: '内容', type: 'textarea', rows: 4, value: 'Hello 安空工具箱' },
    { k: 'mode', label: '操作', type: 'select', value: 'enc', options: [['enc', '编码'], ['dec', '解码']] }
  ],
  run: function (v) {
    var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    if (v.mode === 'enc') {
      var bytes = H.utf8Bytes(String(v.text || '')), out = '', bits = 0, buf = 0;
      for (var i = 0; i < bytes.length; i++) {
        buf = (buf << 8) | bytes[i]; bits += 8;
        while (bits >= 5) { out += A.charAt((buf >>> (bits - 5)) & 31); bits -= 5; }
      }
      if (bits > 0) out += A.charAt((buf << (5 - bits)) & 31);
      while (out.length % 8) out += '=';
      return R(PRE(out));
    }
    var s = String(v.text || '').toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
    var b = 0, nb = 0, res = [];
    for (var j = 0; j < s.length; j++) {
      var idx = A.indexOf(s.charAt(j)); if (idx < 0) throw new Error('非法 Base32 字符：' + s.charAt(j));
      b = (b << 5) | idx; nb += 5;
      if (nb >= 8) { res.push((b >>> (nb - 8)) & 255); nb -= 8; }
    }
    return R(PRE(H.bytesToStr(res)));
  }});

/* 9. 凯撒密码 */
T({ id: 'cipherplayfair', name: '凯撒密码', cat: 'text',
  desc: '经典凯撒移位加密解密，支持自定义偏移量',
  tags: '凯撒 caesar 移位 加密 密码',
  fields: [
    { k: 'text', label: '文本', type: 'textarea', rows: 4, value: 'Hello World' },
    { k: 'shift', label: '偏移量', type: 'text', value: '3' },
    { k: 'mode', label: '操作', type: 'select', value: 'enc', options: [['enc', '加密'], ['dec', '解密']] }
  ],
  run: function (v) {
    var s = parseInt(v.shift, 10); if (isNaN(s)) throw new Error('偏移量必须是数字');
    var sh = ((s % 26) + 26) % 26, dir = v.mode === 'dec' ? -sh : sh;
    var out = String(v.text || '').replace(/[a-zA-Z]/g, function (ch) {
      var base = ch <= 'Z' ? 65 : 97;
      return String.fromCharCode((ch.charCodeAt(0) - base + dir + 26) % 26 + base);
    });
    return R(PRE(out) + HINT('偏移量 ' + sh + ' · ' + (v.mode === 'dec' ? '解密' : '加密')));
  }});

/* 10. 摩尔分数计算 */
T({ id: 'mobius', name: '莫比乌斯函数 μ(n)', cat: 'calc',
  desc: '计算莫比乌斯函数值，用于数论与容斥原理',
  tags: '莫比乌斯 mobius 数论 容斥',
  fields: [
    { k: 'n', label: '正整数 n', type: 'text', value: '30' },
    { k: 'range', label: '同时列出 1~n', type: 'select', value: 'no', options: [['no', '仅 n'], ['yes', '列出 1~n']] }
  ],
  run: function (v) {
    var n = parseInt(v.n, 10);
    if (!(n >= 1 && n <= 100000)) throw new Error('n 须为 1~100000 的整数');
    function mu(x) {
      var cnt = 0, p = 2;
      while (p * p <= x) {
        if (x % p === 0) { x /= p; cnt++; if (x % p === 0) return 0; }
        p++;
      }
      if (x > 1) cnt++;
      return cnt % 2 ? -1 : 1;
    }
    if (v.range === 'yes') {
      var rows = [], lim = Math.min(n, 200);
      for (var i = 1; i <= lim; i++) rows.push([i, mu(i)]);
      return R(TB(['n', 'μ(n)'], rows) + (n > 200 ? HINT('仅展示前 200 项，输入更小范围可查看全部') : ''));
    }
    return R(KV([['n', n], ['μ(n)', mu(n)]]));
  }});

/* 11. 欧拉函数 φ(n) */
T({ id: 'eulerphi', name: '欧拉函数 φ(n)', cat: 'calc',
  desc: '计算 1~n 中与 n 互质的正整数个数',
  tags: '欧拉函数 phi 互质 数论',
  fields: [{ k: 'n', label: '正整数 n', type: 'text', value: '36' }],
  run: function (v) {
    var n = parseInt(v.n, 10);
    if (!(n >= 1)) throw new Error('请输入正整数');
    var r = n, x = n, p = 2;
    while (p * p <= x) {
      if (x % p === 0) { while (x % p === 0) x /= p; r = r / p * (p - 1); }
      p++;
    }
    if (x > 1) r = r / x * (x - 1);
    return R(KV([['n', n], ['φ(n)', r], ['含义', '1~' + n + ' 中与 ' + n + ' 互质的数有 ' + r + ' 个']]));
  }});

/* 12. 矩阵行列式 */
T({ id: 'matrixdet', name: '矩阵行列式计算', cat: 'calc',
  desc: '计算 2x2 与 3x3 矩阵的行列式',
  tags: '矩阵 行列式 determinant 线性代数',
  fields: [
    { k: 'size', label: '矩阵阶数', type: 'select', value: '2', options: [['2', '2 × 2'], ['3', '3 × 3']] },
    { k: 'm', label: '矩阵元素（逗号分隔，行用换行）', type: 'textarea', rows: 3, value: '1,2\n3,4' }
  ],
  run: function (v) {
    var n = parseInt(v.size, 10);
    var arr = lines(v.m).map(function (l) { return l.split(/[,，\s]+/).filter(function (x) { return x !== ''; }).map(Number); });
    if (arr.length !== n) throw new Error('需要 ' + n + ' 行');
    for (var i = 0; i < n; i++) if (arr[i].length !== n || arr[i].some(function (x) { return !isFinite(x); })) throw new Error('每行需要 ' + n + ' 个数字');
    var det;
    if (n === 2) det = arr[0][0] * arr[1][1] - arr[0][1] * arr[1][0];
    else det = arr[0][0]*(arr[1][1]*arr[2][2]-arr[1][2]*arr[2][1])
             - arr[0][1]*(arr[1][0]*arr[2][2]-arr[1][2]*arr[2][0])
             + arr[0][2]*(arr[1][0]*arr[2][1]-arr[1][1]*arr[2][0]);
    return R(TB([], arr.map(function (r) { return r.map(num); })) +
      KV([['行列式 det(A)', num(det, 6)]]));
  }});

/* 13. 相对湿度换算（露点近似） */
T({ id: 'timeconv', name: '时区时间换算', cat: 'calc',
  desc: '在世界主要城市时区之间换算指定时间',
  tags: '时区 时间换算 世界时间 UTC',
  fields: [
    { k: 'time', label: '时间（HH:MM）', type: 'text', value: '09:00' },
    { k: 'from', label: '源时区', type: 'text', value: '8' },
    { k: 'to', label: '目标时区', type: 'text', value: '0' }
  ],
  run: function (v) {
    var m = /^(\d{1,2}):(\d{2})$/.exec(String(v.time || '').trim());
    if (!m) throw new Error('时间格式应为 HH:MM');
    var h = parseInt(m[1], 10), mi = parseInt(m[2], 10);
    if (h > 23 || mi > 59) throw new Error('时间超出范围');
    var f = parseFloat(v.from) || 0, t = parseFloat(v.to) || 0;
    var total = (h * 60 + mi + (t - f) * 60) % 1440;
    if (total < 0) total += 1440;
    var oh = Math.floor(total / 60), om = total % 60;
    function p(x) { return x < 10 ? '0' + x : '' + x; }
    return R(KV([['源时间', p(h) + ':' + p(mi) + ' (UTC' + (f >= 0 ? '+' : '') + f + ')'],
      ['目标时间', p(oh) + ':' + p(om) + ' (UTC' + (t >= 0 ? '+' : '') + t + ')'],
      ['时差', ((t - f) >= 0 ? '+' : '') + (t - f) + ' 小时']]));
  }});

/* 14. 电阻色环识别 */
T({ id: 'resistorcolor', name: '电阻色环计算器', cat: 'calc',
  desc: '根据色环颜色读取电阻阻值与误差',
  tags: '电阻 色环 电子 阻值',
  fields: [
    { k: 'c1', label: '第一环', type: 'select', value: '4', options: [['0','黑'],['1','棕'],['2','红'],['3','橙'],['4','黄'],['5','绿'],['6','蓝'],['7','紫'],['8','灰'],['9','白']] },
    { k: 'c2', label: '第二环', type: 'select', value: '7', options: [['0','黑'],['1','棕'],['2','红'],['3','橙'],['4','黄'],['5','绿'],['6','蓝'],['7','紫'],['8','灰'],['9','白']] },
    { k: 'mul', label: '倍率环', type: 'select', value: '2', options: [['-2','金×0.01'],['-1','银×0.1'],['0','黑×1'],['1','棕×10'],['2','红×100'],['3','橙×1k'],['4','黄×10k'],['5','绿×100k']] },
    { k: 'tol', label: '误差环', type: 'select', value: '5', options: [['1','棕 ±1%'],['2','红 ±2%'],['5','绿 ±0.5%'],['10','银 ±10%'],['20','金 ±5%']] }
  ],
  run: function (v) {
    var val = (parseInt(v.c1, 10) * 10 + parseInt(v.c2, 10)) * Math.pow(10, parseInt(v.mul, 10));
    function fmt(x) {
      if (x >= 1e6) return num(x / 1e6) + ' MΩ';
      if (x >= 1e3) return num(x / 1e3) + ' kΩ';
      if (x < 1) return num(x) + ' Ω';
      return num(x) + ' Ω';
    }
    return R(KV([['阻值', fmt(val)], ['精度', '±' + v.tol + '%'],
      ['范围', fmt(val * (1 - parseFloat(v.tol) / 100)) + ' ~ ' + fmt(val * (1 + parseFloat(v.tol) / 100))]]));
  }});

/* 15. 100 以内质数表 */
T({ id: 'primfact', name: '质因数分解与质数表', cat: 'calc',
  desc: '将整数分解为质因数乘积，并列出因子',
  tags: '质数 质因数 分解 因子 数论',
  fields: [{ k: 'n', label: '正整数', type: 'text', value: '360' }],
  run: function (v) {
    var n = parseInt(v.n, 10);
    if (!(n >= 1 && n <= 1e12)) throw new Error('请输入 1~1e12 的整数');
    var x = n, fac = [], p = 2;
    while (p * p <= x) { var c = 0; while (x % p === 0) { x /= p; c++; } if (c) fac.push([p, c]); p++; }
    if (x > 1) fac.push([x, 1]);
    var expr = fac.length ? fac.map(function (f) { return f[1] > 1 ? f[0] + '^' + f[1] : '' + f[0]; }).join(' × ') : '1';
    return R(KV([['数字', n], ['质因数分解', expr]]) +
      (fac.length ? TB(['质因数', '指数'], fac.map(function (f) { return [f[0], f[1]]; })) : HINT('1 没有质因数')));
  }});

/* 16. 分数化简（含带分数） */
T({ id: 'fraccalc', name: '分数化简与运算', cat: 'calc',
  desc: '分数化简、加减乘除运算，输出最简分数与小数',
  tags: '分数 化简 约分 运算 最小公倍数',
  fields: [
    { k: 'a', label: '第一个分数（如 3/4）', type: 'text', value: '3/4' },
    { k: 'op', label: '运算', type: 'select', value: '+', options: [['+','加'],['-','减'],['*','乘'],['/','除']] },
    { k: 'b', label: '第二个分数（如 2/3）', type: 'text', value: '2/3' }
  ],
  run: function (v) {
    function parse(s) {
      var m = /^(-?\d+)\/(\d+)$/.exec(String(s || '').trim()) || /^(-?\d+)$/.exec(String(s || '').trim());
      if (!m) throw new Error('分数格式错误：' + s);
      var a = parseInt(m[1], 10), b = m[2] ? parseInt(m[2], 10) : 1;
      if (b === 0) throw new Error('分母不能为 0');
      return [a, b];
    }
    function gcd(x, y) { x = Math.abs(x); y = Math.abs(y); while (y) { var t = x % y; x = y; y = t; } return x; }
    var A = parse(v.a), B = parse(v.b), r;
    if (v.op === '+') r = [A[0] * B[1] + B[0] * A[1], A[1] * B[1]];
    else if (v.op === '-') r = [A[0] * B[1] - B[0] * A[1], A[1] * B[1]];
    else if (v.op === '*') r = [A[0] * B[0], A[1] * B[1]];
    else { if (B[0] === 0) throw new Error('除数不能为 0'); r = [A[0] * B[1], A[1] * B[0]]; }
    if (r[1] < 0) { r[0] = -r[0]; r[1] = -r[1]; }
    var g = gcd(r[0], r[1]) || 1;
    return R(KV([['结果（最简分数）', (r[0] / g) + (r[1] / g !== 1 ? '/' + (r[1] / g) : '')],
      ['小数', num(r[0] / r[1], 8)]]));
  }});

/* 17. 日期差值计算 */
T({ id: 'dateDiff', name: '日期差值计算器', cat: 'life',
  desc: '计算两个日期相差的天数，支持推算 N 天后的日期',
  tags: '日期 天数 差值 倒计时 推算',
  fields: [
    { k: 'd1', label: '开始日期', type: 'text', value: '2026-01-01' },
    { k: 'd2', label: '结束日期', type: 'text', value: '2026-12-31' }
  ],
  run: function (v) {
    function parse(s) {
      var m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(s || '').trim());
      if (!m) throw new Error('日期格式应为 YYYY-MM-DD');
      return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
    }
    var a = parse(v.d1), b = parse(v.d2);
    var diff = Math.round((b - a) / 86400000);
    var weeks = Math.floor(Math.abs(diff) / 7), rest = Math.abs(diff) % 7;
    return R(KV([['相差天数', diff + ' 天'], ['折合', weeks + ' 周 ' + rest + ' 天'],
      ['开始', v.d1], ['结束', v.d2]]));
  }});

/* 18. 文本相似度（编辑距离） */
T({ id: 'fuzzysearch', name: '文本相似度比较', cat: 'text',
  desc: '基于编辑距离计算两段文本的相似度',
  tags: '相似度 编辑距离 levenshtein 比较 文本',
  fields: [
    { k: 'a', label: '文本 A', type: 'textarea', rows: 3, value: '安空工具箱' },
    { k: 'b', label: '文本 B', type: 'textarea', rows: 3, value: '安空工具盒' }
  ],
  run: function (v) {
    var a = String(v.a || ''), b = String(v.b || '');
    var m = a.length, n = b.length;
    var d = [];
    for (var i = 0; i <= m; i++) { d[i] = []; d[i][0] = i; }
    for (var j = 0; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a.charAt(i-1) === b.charAt(j-1) ? 0 : 1));
    }
    var dist = d[m][n], max = Math.max(m, n), sim = max === 0 ? 1 : (1 - dist / max);
    return R(KV([['编辑距离', dist], ['相似度', (sim * 100).toFixed(2) + '%'],
      ['文本 A 长度', m], ['文本 B 长度', n]]));
  }});

/* 19. 拼音首字母提取（常用汉字映射） */
T({ id: 'pinyinInitials', name: '拼音首字母提取', cat: 'text',
  desc: '提取中文文本的拼音首字母缩写，常用于检索与索引',
  tags: '拼音 首字母 缩写 中文 检索',
  fields: [{ k: 'text', label: '中文文本', type: 'textarea', rows: 3, value: '安空工具箱' }],
  run: function (v) {
    // 常用汉字首字母边界表（按 Unicode 码点分段，覆盖 GB2312 一级常用字）
    var bounds = [0x4E02,0x4E1F,0x4E56,0x4E7C,0x4E8C,0x4E92,0x4EA1,0x4ED7,0x4F09,0x4F3D,
      0x4F76,0x4FB4,0x503C,0x507F,0x50B4,0x50EF,0x5150,0x51A2,0x51E0,0x5230,0x5272,0x52A8,
      0x52F9,0x5346,0x5377,0x53D4,0x5411,0x5468,0x54A8,0x54E6,0x554A,0x55B5,0x5634,0x56A3,
      0x571F,0x5757,0x57CB,0x585E,0x58A8,0x58F0,0x5957,0x599E,0x5A74,0x5B50,0x5B8C,0x5BE8,
      0x5C31,0x5C4F,0x5D4C,0x5DE5,0x5E26,0x5E7C,0x5EA6,0x5ED3,0x5F00,0x5F7B,0x5FEB,0x6028,
      0x607F,0x60A0,0x60E8,0x616E,0x6200,0x624B,0x629E,0x62D2,0x6311,0x6377,0x63A5,0x641C,
      0x64AD,0x654F,0x65B0,0x660E,0x6709,0x673A,0x67AA,0x684C,0x68A8,0x690D,0x6B63,0x6C34,
      0x6D4B,0x6E05,0x706B,0x71C3,0x7279,0x7387,0x751F,0x76EE,0x7801,0x79CD,0x7A0B,0x7B14,
      0x7F16,0x80FD,0x81F4,0x82F1,0x83B7,0x84DD,0x85E4,0x86C7,0x87BA,0x88AB,0x8BA1,0x8C01,
      0x8D27,0x8DDD,0x8F66,0x90D1,0x91D1,0x97F3,0x9875,0x9965,0x9A6C,0x9C7C,0x9ECE,0x9F99];
    var letters = 'ABCDEFGHJKLMNPQRSTWXYZ';
    function initial(ch) {
      var c = ch.charCodeAt(0);
      if (c < 0x4E00 || c > 0x9FA5) return ch;
      var idx = -1;
      for (var i = 0; i < bounds.length; i++) if (c >= bounds[i]) idx = i;
      // bounds 与 letters 的映射（含 I/U/V 跳过）
      var map = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90];
      var li = idx < 0 ? 0 : map[Math.min(idx, map.length - 1)];
      return letters.charAt(Math.min(li, letters.length - 1));
    }
    var s = String(v.text || '');
    var out = [];
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (/[\u4e00-\u9fa5]/.test(ch)) out.push(initial(ch));
      else if (/[a-zA-Z0-9]/.test(ch)) out.push(ch.toUpperCase());
    }
    return R(PRE(out.join('')) + HINT('基于常用汉字分区的近似首字母，生僻字可能有偏差'));
  }});

/* 20. 文本差异对比 */
T({ id: 'snakekebab', name: '命名风格转换器', cat: 'text',
  desc: '在 camelCase / snake_case / kebab-case / PascalCase 间互转',
  tags: '命名 驼峰 下划线 短横线 转换',
  fields: [
    { k: 'text', label: '文本', type: 'textarea', rows: 3, value: 'hello world example' },
    { k: 'mode', label: '目标风格', type: 'select', value: 'camel', options: [['camel','camelCase'],['pascal','PascalCase'],['snake','snake_case'],['kebab','kebab-case'],['upper','UPPER_SNAKE']] }
  ],
  run: function (v) {
    var words = String(v.text || '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_\-]+/g, ' ')
      .trim().split(/\s+/).filter(function (w) { return w; });
    function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }
    var out = '';
    if (v.mode === 'camel') out = words.map(function (w, i) { return i ? cap(w) : w.toLowerCase(); }).join('');
    else if (v.mode === 'pascal') out = words.map(cap).join('');
    else if (v.mode === 'snake') out = words.map(function (w) { return w.toLowerCase(); }).join('_');
    else if (v.mode === 'kebab') out = words.map(function (w) { return w.toLowerCase(); }).join('-');
    else out = words.map(function (w) { return w.toUpperCase(); }).join('_');
    return R(PRE(out));
  }});

/* 21. 字符串截取统计 */
T({ id: 'substring', name: '字符位置与截取', cat: 'text',
  desc: '查找字符位置并按位置截取子串，支持中文',
  tags: '截取 位置 查找 子串 文本',
  fields: [
    { k: 'text', label: '文本', type: 'text', value: 'Hello 安空工具箱' },
    { k: 'find', label: '查找', type: 'text', value: '安空' },
    { k: 'start', label: '截取起点', type: 'text', value: '6' },
    { k: 'len', label: '截取长度（0=到末尾）', type: 'text', value: '4' }
  ],
  run: function (v) {
    var s = String(v.text || ''), f = String(v.find || '');
    var pos = f ? s.indexOf(f) : -1;
    var st = parseInt(v.start, 10) || 0, ln = parseInt(v.len, 10) || 0;
    if (st < 0 || st > s.length) throw new Error('起点超出范围');
    var sub = ln > 0 ? s.substr(st, ln) : s.slice(st);
    return R(KV([['文本长度', s.length], ['查找“' + f + '”位置', pos < 0 ? '未找到' : pos],
      ['截取结果', esc(sub)], ['截取长度', sub.length]]));
  }});

/* 22. 数字转中文大写金额增强 */
T({ id: 'moneyupper2', name: '金额大写（增强版）', cat: 'calc',
  desc: '将金额转为人民币大写，支持角分与负号',
  tags: '金额 大写 人民币 财务 中文',
  fields: [{ k: 'n', label: '金额（元）', type: 'text', value: '12345.67' }],
  run: function (v) {
    var n = parseFloat(v.n); if (isNaN(n)) throw new Error('请输入数字');
    var neg = n < 0; n = Math.abs(n);
    var digits = '零壹贰叁肆伍陆柒捌玖', units = ['', '拾', '佰', '仟'];
    var bigUnits = ['', '万', '亿', '兆'];
    var cents = Math.round(n * 100), integer = Math.floor(cents / 100), jiao = Math.floor((cents % 100) / 10), fen = cents % 10;
    function intToCN(x) {
      if (x === 0) return '零';
      var groups = [], gi = 0;
      while (x > 0) { groups.push(x % 10000); x = Math.floor(x / 10000); }
      var parts = [];
      for (var g = groups.length - 1; g >= 0; g--) {
        var grp = groups[g], s = '', zero = false;
        for (var i = 3; i >= 0; i--) {
          var d = Math.floor(grp / Math.pow(10, i)) % 10;
          if (d === 0) { if (s) zero = true; }
          else { if (zero) { s += '零'; zero = false; } s += digits.charAt(d) + units[i]; }
        }
        if (s) parts.push(s + bigUnits[g]);
        else if (parts.length && g > 0) parts.push('');
      }
      return parts.join('').replace(/零+/g, '零').replace(/零$/, '');
    }
    var res = (neg ? '负' : '') + intToCN(integer) + '元';
    if (jiao || fen) {
      res += (jiao ? digits.charAt(jiao) + '角' : (fen ? '零' : ''));
      if (fen) res += digits.charAt(fen) + '分';
      else res += '整';
    } else res += '整';
    return R(KV([['数字', v.n], ['人民币大写', res]]));
  }});

/* 23. 时间戳批量转换 */
T({ id: 'timeago', name: '时间戳与相对时间', cat: 'dev',
  desc: 'Unix 时间戳互转，并展示相对当前时间的描述',
  tags: '时间戳 unix 时间 相对 转换',
  fields: [{ k: 'ts', label: 'Unix 时间戳（秒 / 毫秒）', type: 'text', value: '1763472000' }],
  run: function (v) {
    var raw = String(v.ts || '').trim(); if (!/^\d+$/.test(raw)) throw new Error('请输入纯数字时间戳');
    var ts = parseInt(raw, 10);
    if (raw.length <= 10) ts *= 1000;
    var d = new Date(ts); if (isNaN(d.getTime())) throw new Error('时间戳超出范围');
    function p(x) { return x < 10 ? '0' + x : '' + x; }
    var iso = d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    var diff = Date.now() - ts, abs = Math.abs(diff), rel;
    if (abs < 60000) rel = '刚刚';
    else if (abs < 3600000) rel = Math.floor(abs / 60000) + ' 分钟' + (diff >= 0 ? '前' : '后');
    else if (abs < 86400000) rel = Math.floor(abs / 3600000) + ' 小时' + (diff >= 0 ? '前' : '后');
    else if (abs < 2592000000) rel = Math.floor(abs / 86400000) + ' 天' + (diff >= 0 ? '前' : '后');
    else rel = Math.floor(abs / 2592000000) + ' 个月' + (diff >= 0 ? '前' : '后');
    return R(KV([['本地时间', iso], ['UTC', d.toISOString()], ['相对现在', rel], ['毫秒时间戳', ts]]));
  }});

/* 24. 正则调试速查（常用模式） */
T({ id: 'regexdetect', name: '正则匹配测试', cat: 'dev',
  desc: '输入正则与文本，查看匹配结果、分组与位置',
  tags: '正则 regex 匹配 测试 分组',
  fields: [
    { k: 'pattern', label: '正则表达式', type: 'text', value: '(\\d{4})-(\\d{2})-(\\d{2})' },
    { k: 'flags', label: '标志', type: 'text', value: 'g' },
    { k: 'text', label: '测试文本', type: 'textarea', rows: 3, value: '日期 2026-11-18 和 2025-01-01' }
  ],
  run: function (v) {
    var re;
    try { re = new RegExp(v.pattern, v.flags || ''); }
    catch (e) { throw new Error('正则语法错误：' + e.message); }
    var s = String(v.text || ''), rows = [], m, count = 0;
    var global = re.global;
    while ((m = re.exec(s)) !== null) {
      rows.push([count + 1, m[0], m.index, m.slice(1).join(' | ') || '—']);
      count++;
      if (!global) break;
      if (m[0] === '') re.lastIndex++;
    }
    if (!count) return R('<div class="note">没有匹配到任何内容</div>');
    return R(SEC('匹配到 ' + count + ' 处') + TB(['#', '匹配', '位置', '分组'], rows));
  }});

})();
