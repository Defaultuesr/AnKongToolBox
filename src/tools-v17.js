/* ============================================================
   安空工具箱 — v1.7 工具包（一）1~14
   文本编码 9 · 开发者 5
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
function lines(s) { return String(s || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n'); }
function pnum(v, d) { var n = parseFloat(v); return isFinite(n) ? n : (d || 0); }
function rnd(n, d) { var p = Math.pow(10, d == null ? 2 : d); return Math.round(n * p) / p; }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function bytes(s) { return H.utf8Bytes(String(s)); }
function fromBytes(b) { return H.bytesToStr(b); }
function hex2(x) { return ('0' + x.toString(16).toUpperCase()).slice(-2); }

/* ============================================================
   一、文本编码（9）
   ============================================================ */

/* 1. Quoted-Printable */
function qpWrap(s, w) {
  var out = [], line = '', i = 0;
  while (i < s.length) {
    var seg = (s.charAt(i) === '=' && /^[0-9A-Fa-f]{2}$/.test(s.substr(i + 1, 2))) ? s.substr(i, 3) : s.charAt(i);
    if (line.length + seg.length > w - 1) { out.push(line + '='); line = ''; }
    line += seg; i += seg.length;
  }
  out.push(line);
  return out.join('\r\n');
}
T({ id: 'qpcode', name: 'Quoted-Printable 编解码', cat: 'text',
  desc: '邮件 QP 编码：非 ASCII 字节与等号转成 =XX，可打印字符原样保留',
  tags: 'QP quoted printable 邮件 MIME 编码 解码 =XX RFC2045',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6,
      value: '安空工具箱 AnKong Toolbox = 100% 离线可用！\n第二行：中文与 Emoji 😀 测试' },
    { k: 'mode', label: '操作', type: 'select', value: 'encode', options: [
      ['encode', '编码为 QP'], ['decode', '解码 QP'] ] },
    { k: 'wrap', label: '每行最大长度', type: 'select', value: '76', options: [
      ['76', '76（RFC 推荐，软换行）'], ['0', '不折行'] ] }
  ],
  run: function (v) {
    var s = String(v.text == null ? '' : v.text), out = '';
    if (v.mode === 'decode') {
      var t = s.replace(/=\r?\n/g, ''), bs = [], i = 0, soft = 0;
      soft = (s.length - t.length);
      while (i < t.length) {
        if (t.charAt(i) === '=' && /^[0-9A-Fa-f]{2}$/.test(t.substr(i + 1, 2))) {
          bs.push(parseInt(t.substr(i + 1, 2), 16)); i += 3;
        } else {
          var c = t.charCodeAt(i), u = bytes(t.charAt(i)), k;
          if (c < 128) bs.push(c);
          else for (k = 0; k < u.length; k++) bs.push(u[k]);
          i++;
        }
      }
      out = fromBytes(bs);
      return SEC('解码结果') + PRE(out) +
        KV([['解码字节数', bs.length + ' B'], ['去除软换行', soft + ' 字符'],
            ['字符数', out.length + ' 个']]) +
        HINT('解码时 =XX 按十六进制还原为字节，再按 UTF-8 还原文本；行尾单独的 = 视为软换行被丢弃。');
    }
    var b = bytes(s), parts = [], j;
    for (j = 0; j < b.length; j++) {
      var x = b[j];
      if (x === 61) parts.push('=3D');
      else if ((x >= 33 && x <= 60) || (x >= 62 && x <= 126) || x === 32 || x === 9) parts.push(String.fromCharCode(x));
      else parts.push('=' + hex2(x));
    }
    out = parts.join('');
    if (v.wrap !== '0') out = qpWrap(out, parseInt(v.wrap, 10) || 76);
    return SEC('QP 编码结果') + PRE(out) +
      KV([['原始字节数', b.length + ' B'], ['QP 字符数', out.replace(/\r?\n/g, '').length + ' 个'],
          ['膨胀率', rnd(out.length / (b.length || 1), 2) + ' ×']]) +
      HINT('等号本身编码为 =3D；= 后跟换行表示软换行。QP 常用于邮件正文，保证只出现 7 位可打印 ASCII。');
  }
});

/* 2. UUencode */
T({ id: 'uuencode', name: 'UUencode 编解码', cat: 'text',
  desc: '经典 uuencode：每 3 字节转 4 个可打印字符，输出 begin/end 报文',
  tags: 'uuencode uudecode 编码 解码 邮件 Usenet base64',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6,
      value: '安空工具箱 · AnKong Toolbox\nUUencode 是一种早期二进制转文本的编码方式。' },
    { k: 'mode', label: '操作', type: 'select', value: 'encode', options: [
      ['encode', '编码为 uuencode'], ['decode', '解码 uuencode'] ] },
    { k: 'fname', label: '文件名（编码时）', type: 'text', value: 'ankong.txt' }
  ],
  run: function (v) {
    var s = String(v.text == null ? '' : v.text), out = '';
    function uuChar(n) { var c = n & 63; return String.fromCharCode(c === 0 ? 96 : 32 + c); }
    if (v.mode === 'decode') {
      var ls = lines(s), bs = [], k, i, j;
      for (k = 0; k < ls.length; k++) {
        var ln = ls[k];
        if (!ln || /^(begin|end)\b/i.test(ln) || ln === '`' || ln === 'end') continue;
        var cnt = ln.charCodeAt(0) - 32;
        if (!(cnt >= 0 && cnt <= 63)) continue;
        cnt = cnt === 96 - 32 ? 0 : cnt;
        var grp = [];
        for (i = 1; i < ln.length && grp.length < 4; i++) {
          var c2 = ln.charCodeAt(i) - 32;
          grp.push((c2 === 64 || c2 < 0) ? 0 : (c2 & 63));
        }
        while (grp.length < 4) grp.push(0);
        var triple = [
          ((grp[0] << 2) | (grp[1] >> 4)) & 255,
          ((grp[1] << 4) | (grp[2] >> 2)) & 255,
          ((grp[2] << 6) | grp[3]) & 255
        ];
        for (j = 0; j < Math.min(cnt, 3); j++) bs.push(triple[j]);
      }
      out = fromBytes(bs);
      return SEC('解码结果') + PRE(out) + KV([['还原字节数', bs.length + ' B']]) +
        HINT('解码会跳过 begin/end 行，按每行首字符给出的长度还原字节。');
    }
    var b = bytes(s), rows = [], p = 0;
    while (p < b.length) {
      var chunk = b.slice(p, p + 45), line = String.fromCharCode(32 + (chunk.length & 63)), q = 0;
      while (q < chunk.length) {
        var a = chunk[q] || 0, bb = chunk[q + 1] || 0, c = chunk[q + 2] || 0;
        line += uuChar(a >> 2) + uuChar(((a & 3) << 4) | (bb >> 4)) +
                uuChar(((bb & 15) << 2) | (c >> 6)) + uuChar(c & 63);
        q += 3;
      }
      rows.push(line); p += 45;
    }
    out = 'begin 644 ' + String(v.fname || 'ankong.txt') + '\n' + rows.join('\n') + '\n`\nend';
    return SEC('uuencode 报文') + PRE(out) +
      KV([['原始字节数', b.length + ' B'], ['数据行', rows.length + ' 行'],
          ['每行最大', '45 字节 → 60 字符'], ['编码后字符', out.length + ' 个']]) +
      HINT('uuencode 把 3 字节（24 bit）拆成 4 个 6 bit 组并加 32 变为可打印字符；空格有时写作反引号 `。');
  }
});

/* 3. Ascii85 */
T({ id: 'ascii85', name: 'Ascii85 / Base85 编解码', cat: 'text',
  desc: 'Adobe Ascii85 与 Z85 风格编码：4 字节转 5 个可打印字符',
  tags: 'ascii85 base85 adobe 编码 解码 二进制 文本 PDF',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 5,
      value: '安空工具箱 AnKong Toolbox 2026' },
    { k: 'mode', label: '操作', type: 'select', value: 'encode', options: [
      ['encode', '编码为 Ascii85'], ['decode', '解码 Ascii85'] ] },
    { k: 'zshort', label: '全零压缩 z', type: 'select', value: 'yes', options: [
      ['yes', '启用（4 个零字节写作 z）'], ['no', '不启用'] ] }
  ],
  run: function (v) {
    var s = String(v.text == null ? '' : v.text), out = '';
    if (v.mode === 'decode') {
      var t = s.replace(/<~|~>/g, '').replace(/\s/g, ''), bs = [], i = 0;
      while (i < t.length) {
        if (t.charAt(i) === 'z') { bs.push(0, 0, 0, 0); i++; continue; }
        var g = [], k;
        for (k = 0; k < 5 && i < t.length; k++, i++) g.push(t.charCodeAt(i) - 33);
        if (!g.length) break;
        while (g.length < 5) g.push(84);
        var n = 0, ok = true;
        for (k = 0; k < 5; k++) { if (g[k] < 0 || g[k] > 84) ok = false; n = n * 85 + Math.max(0, g[k]); }
        if (!ok) { bs = []; break; }
        var quad = [Math.floor(n / 16777216) & 255, Math.floor(n / 65536) & 255,
                    Math.floor(n / 256) & 255, n & 255];
        var take = Math.min(4, g[4] === 84 ? 4 : 4);
        for (k = 0; k < take - (5 - g.length > 0 ? (5 - g.length) : 0); k++) bs.push(quad[k]);
      }
      out = fromBytes(bs);
      return SEC('解码结果') + PRE(out) + KV([['还原字节数', bs.length + ' B']]) +
        HINT('Adobe 形式可用 <~ ... ~> 包裹；z 代表 4 个零字节。不足 4 字节的组尾部省略输出字符。');
    }
    var b = bytes(s), parts = [], p = 0;
    while (p < b.length) {
      var q = b.slice(p, p + 4), zeros = q.length === 4 && q[0] === 0 && q[1] === 0 && q[2] === 0 && q[3] === 0;
      if (zeros && v.zshort === 'yes') { parts.push('z'); p += 4; continue; }
      while (q.length < 4) q.push(0);
      var val = ((q[0] * 256 + q[1]) * 256 + q[2]) * 256 + q[3];
      var cs = [], d;
      for (d = 4; d >= 0; d--) { cs.push(val % 85); val = Math.floor(val / 85); }
      cs.reverse();
      var emit = Math.min(5, b.length - p + 1);
      for (d = 0; d < emit; d++) parts.push(String.fromCharCode(33 + cs[d]));
      p += 4;
    }
    out = '<~' + parts.join('') + '~>';
    return SEC('Ascii85 结果') + PRE(out) +
      KV([['原始字节数', b.length + ' B'], ['编码字符数', out.length + ' 个'],
          ['膨胀率', rnd(out.length / (b.length || 1), 2) + ' ×']]) +
      HINT('每 4 字节视为 32 位整数，按 85 进制拆成 5 个字符（33~117）。相比 Base64 膨胀约 25%，Ascii85 约 25% 但字符更密集。');
  }
});

/* 4. ROT47 */
T({ id: 'rot47', name: 'ROT47 加解密', cat: 'text',
  desc: '对全部可打印 ASCII（33~126）做 47 位循环移位，字母数字符号一起变换',
  tags: 'ROT47 ROT13 凯撒 密码 移位 加密 解密 ASCII',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 5,
      value: 'Hello, AnKong Toolbox 2026! 安空工具箱' },
    { k: 'shift', label: '移位量', type: 'number', value: 47 },
    { k: 'mode', label: '操作', type: 'select', value: 'enc', options: [
      ['enc', '加密 / 正向位移'], ['dec', '解密 / 反向位移'] ] }
  ],
  run: function (v) {
    var s = String(v.text == null ? '' : v.text);
    var k = ((parseInt(v.shift, 10) || 47) % 94 + 94) % 94;
    if (v.mode === 'dec') k = (94 - k) % 94;
    var out = '', i;
    for (i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      out += (c >= 33 && c <= 126) ? String.fromCharCode(33 + ((c - 33 + k) % 94)) : s.charAt(i);
    }
    return SEC('结果') + PRE(out) +
      KV([['可打印字符集', '94 个（ASCII 33~126）'], ['实际移位', k + ' 位'],
          ['变换字符数', out.split('').filter(function (ch) { return ch.charCodeAt(0) >= 33 && ch.charCodeAt(0) <= 126; }).length + ' 个']]) +
      HINT('ROT47 是自反的：移位 47 两次即还原。中文等非 ASCII 字符保持不变。');
  }
});

/* 5. 维吉尼亚密码 */
T({ id: 'vigenere', name: '维吉尼亚密码', cat: 'text',
  desc: '按关键词对字母做多表移位加密 / 解密，非字母字符原样保留',
  tags: 'Vigenere 维吉尼亚 密码 多表 关键词 加密 解密',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 5,
      value: 'Attack at dawn! 安空工具箱 AnKong Toolbox' },
    { k: 'key', label: '密钥（仅字母）', type: 'text', value: 'ANKONG' },
    { k: 'mode', label: '操作', type: 'select', value: 'enc', options: [
      ['enc', '加密'], ['dec', '解密'] ] }
  ],
  run: function (v) {
    var s = String(v.text == null ? '' : v.text), key = String(v.key || 'A').replace(/[^A-Za-z]/g, '');
    if (!key) key = 'A';
    var ks = [], i;
    for (i = 0; i < key.length; i++) ks.push(key.toUpperCase().charCodeAt(i) - 65);
    var out = '', j = 0;
    for (i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i), sh = ks[j % ks.length];
      if (v.mode === 'dec') sh = -sh;
      if (c >= 65 && c <= 90) { out += String.fromCharCode(65 + ((c - 65 + sh) % 26 + 26) % 26); j++; }
      else if (c >= 97 && c <= 122) { out += String.fromCharCode(97 + ((c - 97 + sh) % 26 + 26) % 26); j++; }
      else out += s.charAt(i);
    }
    return SEC('结果') + PRE(out) +
      KV([['密钥', key.toUpperCase()], ['密钥长度', ks.length],
          ['参与移位的字母', j + ' 个'], ['操作', v.mode === 'dec' ? '解密' : '加密']]) +
      HINT('密钥按字母循环使用；非字母（含中文、数字、标点）不参与移位也不消耗密钥位。');
  }
});

/* 6. 培根密码 / 栅栏密码 */
T({ id: 'baconcipher', name: '培根与栅栏密码', cat: 'text',
  desc: '培根密码（A/B 五位码）与栅栏密码（按行数分栏重排）编解码',
  tags: 'Bacon 培根 栅栏 rail fence 密码 编码 解码 古典密码',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 5, value: 'ANKONG TOOLBOX' },
    { k: 'cipher', label: '密码类型', type: 'select', value: 'bacon', options: [
      ['bacon', '培根密码'], ['rail', '栅栏密码'] ] },
    { k: 'mode', label: '操作', type: 'select', value: 'enc', options: [
      ['enc', '编码 / 加密'], ['dec', '解码 / 解密'] ] },
    { k: 'rails', label: '栅栏行数（2~8）', type: 'number', value: 3 },
    { k: 'style', label: '培根码形式', type: 'select', value: 'ab', options: [
      ['ab', 'a / b'], ['01', '0 / 1'] ] }
  ],
  run: function (v) {
    var s = String(v.text == null ? '' : v.text), out = '', i, j;
    var A = v.style === '01' ? '0' : 'a', B = v.style === '01' ? '1' : 'b';
    if (v.cipher === 'bacon') {
      if (v.mode === 'enc') {
        var parts = [];
        for (i = 0; i < s.length; i++) {
          var c = s.charAt(i).toUpperCase();
          if (c >= 'A' && c <= 'Z') {
            var n = c.charCodeAt(0) - 65, bits = '';
            for (j = 4; j >= 0; j--) bits += ((n >> j) & 1) ? B : A;
            parts.push(bits);
          } else parts.push(c);
        }
        out = parts.join(' ');
      } else {
        var toks = s.replace(/[^ABab01\s]/g, '').split(/\s+/), dec = '';
        for (i = 0; i < toks.length; i++) {
          var tk = toks[i];
          if (tk.length !== 5) continue;
          var nn = 0;
          for (j = 0; j < 5; j++) {
            var ch = tk.charAt(j);
            nn = nn * 2 + ((ch === 'B' || ch === 'b' || ch === '1') ? 1 : 0);
          }
          dec += String.fromCharCode(65 + (nn % 26));
        }
        out = dec;
      }
      return SEC('结果') + PRE(out) +
        KV([['密码', '培根密码（24 字母表，I/J 与 U/V 合并）'], ['码元', A + ' / ' + B + '，每字母 5 位'],
            ['操作', v.mode === 'dec' ? '解码' : '编码']]) +
        HINT('经典培根密码用 5 位 A/B 表示 24 个字母；本工具按 A=0…Z=25 的现代扩展处理，解码时忽略非码元字符。');
    }
    var r = Math.max(2, Math.min(8, parseInt(v.rails, 10) || 3));
    var t = s.replace(/\s/g, '');
    if (v.mode === 'enc') {
      var rows = [];
      for (i = 0; i < r; i++) rows.push('');
      var row = 0, dir = 1;
      for (i = 0; i < t.length; i++) {
        rows[row] += t.charAt(i);
        if (r > 1) { if (row === r - 1) dir = -1; else if (row === 0) dir = 1; row += dir; }
      }
      out = rows.join('');
      return SEC('栅栏密文') + PRE(out) + KV([['行数', r], ['原文长度', t.length + ' 字符']]) +
        HINT('按「之」字形把字符分配到 r 行，再逐行拼接。解码时按相同行数还原位置。');
    }
    var n = t.length, pos = [], rr = 0, dd = 1, lens = [];
    for (i = 0; i < r; i++) lens.push(0);
    for (i = 0; i < n; i++) {
      lens[rr]++;
      if (r > 1) { if (rr === r - 1) dd = -1; else if (rr === 0) dd = 1; rr += dd; }
    }
    var chunks = [], p = 0;
    for (i = 0; i < r; i++) { chunks.push(t.substr(p, lens[i])); p += lens[i]; }
    var idx = [];
    for (i = 0; i < r; i++) idx.push(0);
    var res = [], r2 = 0, d2 = 1;
    for (i = 0; i < n; i++) {
      res.push(chunks[r2].charAt(idx[r2]++));
      if (r > 1) { if (r2 === r - 1) d2 = -1; else if (r2 === 0) d2 = 1; r2 += d2; }
    }
    out = res.join('');
    return SEC('栅栏解密') + PRE(out) + KV([['行数', r], ['密文长度', n + ' 字符']]) +
      HINT('解密时先按「之」字形推算每行应分到的字符数，再按同样路径依次取回。');
  }
});

/* 7. 哈夫曼编码 */
T({ id: 'huffman', name: '哈夫曼编码演示', cat: 'text',
  desc: '按字符频次构建哈夫曼树，输出码表、编码结果与理论压缩率',
  tags: 'Huffman 哈夫曼 熵 编码 压缩 码表 前缀码 信息论',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6,
      value: '安空工具箱 ANKONG ANKONG 离线工具箱 huffman huffman coding' },
    { k: 'unit', label: '统计单位', type: 'select', value: 'char', options: [
      ['char', '按字符'], ['byte', '按 UTF-8 字节'] ] }
  ],
  run: function (v) {
    var s = String(v.text == null ? '' : v.text);
    if (!s) return HINT('请输入要编码的文本。');
    var freq = {}, i, seq = [];
    if (v.unit === 'byte') {
      var bs = bytes(s);
      for (i = 0; i < bs.length; i++) { var kb = '0x' + hex2(bs[i]); if (!freq[kb]) { freq[kb] = 0; seq.push(kb); } freq[kb]++; }
    } else {
      for (i = 0; i < s.length; i++) { var c = s.charAt(i); if (!freq[c]) { freq[c] = 0; seq.push(c); } freq[c]++; }
    }
    var nodes = seq.map(function (k, ix) { return { k: k, w: freq[k], leaf: true, id: ix, l: null, r: null }; });
    var queue = nodes.slice().sort(function (a, b) { return a.w - b.w || a.id - b.id; }), uid = nodes.length;
    while (queue.length > 1) {
      var a = queue.shift(), b = queue.shift();
      var pnode = { k: null, w: a.w + b.w, leaf: false, id: uid++, l: a, r: b };
      queue.push(pnode); queue.sort(function (x, y) { return x.w - y.w || x.id - y.id; });
    }
    var codes = {};
    (function walk(nd, code) {
      if (nd.leaf) { codes[nd.k] = code || '0'; return; }
      walk(nd.l, code + '0'); walk(nd.r, code + '1');
    })(queue[0], '');
    var total = 0, bits = 0, entropy = 0;
    for (i = 0; i < seq.length; i++) {
      var k2 = seq[i], f = freq[k2], L = codes[k2].length;
      total += f; bits += f * L;
      var pr = f / (v.unit === 'byte' ? bytes(s).length : s.length);
      if (pr > 0) entropy -= pr * (Math.log(pr) / Math.LN2);
    }
    var enc = [];
    if (v.unit === 'byte') { var bb = bytes(s); for (i = 0; i < bb.length; i++) enc.push(codes['0x' + hex2(bb[i])]); }
    else for (i = 0; i < s.length; i++) enc.push(codes[s.charAt(i)]);
    var outBits = enc.join('');
    var rows = seq.sort(function (x, y) { return freq[y] - freq[x]; }).map(function (k3) {
      return [v.unit === 'byte' ? k3 : (k3 === ' ' ? '␠ 空格' : k3 === '\n' ? '⏎ 换行' : k3),
              freq[k3], codes[k3], (freq[k3] * codes[k3].length)];
    });
    var origBits = (v.unit === 'byte' ? bytes(s).length : s.length) * 8;
    return SEC('码表（按频次降序）') + TB(['符号', '频次', '哈夫曼码', '占用 bit'], rows) +
      SEC('编码结果（bit 流）') + PRE(outBits) +
      SEC('统计') + KV([
        ['不同符号数', seq.length + ' 个'], ['定长编码', origBits + ' bit（8 bit/符号）'],
        ['哈夫曼编码', bits + ' bit'], ['平均码长', rnd(bits / (total || 1), 3) + ' bit/符号'],
        ['信息熵', rnd(entropy, 3) + ' bit/符号'],
        ['理论压缩率', rnd(100 - bits / (origBits || 1) * 100, 2) + ' %']
      ]) + HINT('哈夫曼码是前缀码，任一码字都不是另一码字的前缀，因此无需分隔符即可无歧义解码。');
  }
});

/* 8. 游程编码 RLE */
T({ id: 'rlecode', name: '游程编码 RLE', cat: 'text',
  desc: '把连续重复字符压缩为「字符*次数;」形式，支持编解码与压缩率统计',
  tags: 'RLE 游程编码 run length 压缩 解压 重复 字符',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 5,
      value: 'AAAAABBBCCDDDDDDD安安安安空空空空空空空空工具箱!!!!!!!!!!' },
    { k: 'mode', label: '操作', type: 'select', value: 'enc', options: [
      ['enc', '编码 / 压缩'], ['dec', '解码 / 还原'] ] },
    { k: 'minrun', label: '最小游程长度', type: 'number', value: 1 }
  ],
  run: function (v) {
    var s = String(v.text == null ? '' : v.text), out = '', i;
    if (v.mode === 'dec') {
      var toks = s.split(';'), dec = '', bad = 0;
      for (i = 0; i < toks.length; i++) {
        var tk = toks[i];
        if (!tk) continue;
        var m = /^([\s\S])(\*(\d+))?$/.exec(tk);
        if (!m) { bad++; continue; }
        var ch = m[1], cnt = m[3] ? parseInt(m[3], 10) : 1;
        if (cnt > 20000) cnt = 20000;
        for (var j = 0; j < cnt; j++) dec += ch;
      }
      return SEC('还原结果') + PRE(dec) +
        KV([['还原字符数', dec.length + ' 个'], ['忽略的非法片段', bad + ' 个']]) +
        HINT('格式：字符*次数; —— 次数为 1 时可省略。分号作分隔符，故含量较大的文本不适合此简版格式。');
    }
    var minr = Math.max(1, parseInt(v.minrun, 10) || 1), parts = [], p = 0;
    while (p < s.length) {
      var q = p;
      while (q < s.length && s.charAt(q) === s.charAt(p) && q - p < 99999) q++;
      var run = q - p;
      if (run >= minr) parts.push(s.charAt(p) + '*' + run + ';');
      else for (var z = p; z < q; z++) parts.push(s.charAt(z) + ';');
      p = q;
    }
    out = parts.join('');
    return SEC('RLE 编码结果') + PRE(out) +
      KV([['原始字符数', s.length + ' 个'], ['编码字符数', out.length + ' 个'],
          ['游程段数', parts.length + ' 段'],
          ['压缩率', rnd(100 - out.length / (s.length || 1) * 100, 2) + ' %']]) +
      HINT('RLE 对长重复串（如纯色位图、日志中的连续空格）非常有效；对无重复的随机文本反而会变长。');
  }
});

/* 9. 文本相似度 */
T({ id: 'textsim', name: '文本相似度分析', cat: 'text',
  desc: '计算两段文本的编辑距离、Jaccard、余弦与最长公共子序列相似度',
  tags: '相似度 Levenshtein 编辑距离 Jaccard 余弦 LCS 查重 文本对比',
  fields: [
    { k: 'a', label: '文本 A', type: 'textarea', rows: 5, value: '安空工具箱是一个离线小工具集合，支持网页版与安卓客户端。' },
    { k: 'b', label: '文本 B', type: 'textarea', rows: 5, value: '安空工具箱是一个离线工具集合，支持网页版和安卓客户端。' },
    { k: 'gram', label: '分词粒度', type: 'select', value: 'char', options: [
      ['char', '按字符'], ['bi', '按二元字符组（bigram）'], ['word', '按空白分词'] ] }
  ],
  run: function (v) {
    var A = String(v.a || ''), B = String(v.b || ''), i, j;
    function lev(x, y) {
      var m = x.length, n = y.length;
      if (m * n > 250000) return null;
      var prev = [], cur = [];
      for (j = 0; j <= n; j++) prev[j] = j;
      for (i = 1; i <= m; i++) {
        cur[0] = i;
        for (j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x.charAt(i - 1) === y.charAt(j - 1) ? 0 : 1));
        for (j = 0; j <= n; j++) prev[j] = cur[j];
      }
      return prev[n];
    }
    function grams(s) {
      var g = {}, k;
      if (v.gram === 'word') {
        var ws = s.trim().split(/\s+/).filter(Boolean);
        for (k = 0; k < ws.length; k++) g[ws[k]] = (g[ws[k]] || 0) + 1;
      } else if (v.gram === 'bi') {
        var t = s.replace(/\s/g, '');
        for (k = 0; k < t.length - 1; k++) g[t.substr(k, 2)] = (g[t.substr(k, 2)] || 0) + 1;
      } else for (k = 0; k < s.length; k++) g[s.charAt(k)] = (g[s.charAt(k)] || 0) + 1;
      return g;
    }
    var ga = grams(A), gb = grams(B), inter = 0, uni = 0, dot = 0, na = 0, nb = 0, k3;
    var keys = {};
    for (k3 in ga) if (Object.prototype.hasOwnProperty.call(ga, k3)) keys[k3] = 1;
    for (k3 in gb) if (Object.prototype.hasOwnProperty.call(gb, k3)) keys[k3] = 1;
    for (k3 in keys) if (Object.prototype.hasOwnProperty.call(keys, k3)) {
      var x = ga[k3] || 0, y = gb[k3] || 0;
      inter += Math.min(x, y); uni += Math.max(x, y);
      dot += x * y; na += x * x; nb += y * y;
    }
    var jac = uni ? inter / uni : 0;
    var cos = (na && nb) ? dot / Math.sqrt(na * nb) : 0;
    var d = lev(A, B), levSim = d == null ? null : 1 - d / Math.max(A.length, B.length, 1);
    // LCS
    var lcs = null;
    if (A.length * B.length <= 250000) {
      var dp = [], k;
      for (i = 0; i <= A.length; i++) { dp[i] = []; for (k = 0; k <= B.length; k++) dp[i][k] = 0; }
      for (i = 1; i <= A.length; i++) for (j = 1; j <= B.length; j++)
        dp[i][j] = A.charAt(i - 1) === B.charAt(j - 1) ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
      lcs = dp[A.length][B.length];
    }
    var rows = [
      ['文本 A 长度', A.length + ' 字符'], ['文本 B 长度', B.length + ' 字符'],
      ['编辑距离 Levenshtein', d == null ? '文本过长，已跳过' : d + ' 次编辑'],
      ['编辑距离相似度', levSim == null ? '—' : rnd(levSim * 100, 2) + ' %'],
      ['Jaccard 相似度', rnd(jac * 100, 2) + ' %'],
      ['余弦相似度', rnd(cos * 100, 2) + ' %'],
      ['最长公共子序列', lcs == null ? '文本过长，已跳过' : lcs + ' 字符'],
      ['LCS 相似度', lcs == null ? '—' : rnd(2 * lcs / (A.length + B.length || 1) * 100, 2) + ' %']
    ];
    return SEC('相似度指标') + KV(rows) +
      HINT('编辑距离看「改几个字」，Jaccard 与余弦看「用词重合度」，LCS 看「顺序一致的最长片段」。文本超过 500×500 时跳过 O(n²) 算法。');
  }
});

/* ============================================================
   二、开发者（5）
   ============================================================ */

/* 10. Set-Cookie 解析 */
T({ id: 'setcookie', name: 'Set-Cookie 头解析', cat: 'dev',
  desc: '解析 Set-Cookie 的键值对与全部属性，并给出安全配置检查建议',
  tags: 'Set-Cookie Cookie HttpOnly Secure SameSite Domain Path Max-Age 解析 安全',
  fields: [
    { k: 'raw', label: 'Set-Cookie 值', type: 'textarea', rows: 5,
      value: 'session=abc123xyz; Path=/; Domain=.example.com; Expires=Wed, 21 Oct 2026 07:28:00 GMT; Max-Age=3600; Secure; HttpOnly; SameSite=Lax; Priority=High' },
    { k: 'multi', label: '多行批量', type: 'switch', value: false }
  ],
  run: function (v) {
    var raw = String(v.raw || ''), ls = v.multi ? lines(raw).filter(function (x) { return x.trim(); }) : [raw];
    var all = [], k;
    for (k = 0; k < ls.length; k++) {
      var segs = ls[k].split(';'), kvp = segs[0], eq = kvp.indexOf('=');
      var name = eq < 0 ? kvp.trim() : kvp.slice(0, eq).trim();
      var val = eq < 0 ? '' : kvp.slice(eq + 1).trim();
      var attrs = [], flags = { secure: false, httpOnly: false, sameSite: '', domain: '', path: '', maxAge: '', expires: '', priority: '' };
      for (var i = 1; i < segs.length; i++) {
        var seg = segs[i].trim(); if (!seg) continue;
        var p = seg.indexOf('='), an = (p < 0 ? seg : seg.slice(0, p)).trim(), av = p < 0 ? '' : seg.slice(p + 1).trim();
        attrs.push([an, av || '（标志位）']);
        var low = an.toLowerCase();
        if (low === 'secure') flags.secure = true;
        else if (low === 'httponly') flags.httpOnly = true;
        else if (low === 'samesite') flags.sameSite = av;
        else if (low === 'domain') flags.domain = av;
        else if (low === 'path') flags.path = av;
        else if (low === 'max-age') flags.maxAge = av;
        else if (low === 'expires') flags.expires = av;
        else if (low === 'priority') flags.priority = av;
      }
      var tips = [];
      if (!flags.secure) tips.push('未设置 Secure：HTTPS 之外也可能被发送');
      if (!flags.httpOnly) tips.push('未设置 HttpOnly：脚本可读取，XSS 风险');
      if (!flags.sameSite) tips.push('未设置 SameSite：可能存在 CSRF 风险');
      if (/^__Host-/.test(name)) {
        if (!flags.secure || flags.domain || flags.path !== '/') tips.push('__Host- 前缀要求 Secure、无 Domain、Path=/');
      }
      if (/^__Secure-/.test(name) && !flags.secure) tips.push('__Secure- 前缀要求 Secure');
      var life = flags.maxAge ? (parseInt(flags.maxAge, 10) + ' 秒') : (flags.expires ? ('到 ' + flags.expires) : '会话级（关闭浏览器失效）');
      all.push({ name: name, val: val, attrs: attrs, flags: flags, tips: tips, life: life });
    }
    var html = '', textArr = [];
    for (k = 0; k < all.length; k++) {
      var o = all[k];
      html += SEC('Cookie ' + (k + 1) + '：' + o.name) +
        KV([['值', esc(o.val)], ['生命周期', esc(o.life)],
            ['Secure', o.flags.secure ? '是' : '否'], ['HttpOnly', o.flags.httpOnly ? '是' : '否'],
            ['SameSite', esc(o.flags.sameSite || '未设置')], ['Domain', esc(o.flags.domain || '未设置（默认当前主机）')],
            ['Path', esc(o.flags.path || '未设置')]]) +
        (o.attrs.length ? SEC('属性明细') + TB(['属性', '值'], o.attrs) : '') +
        HINT(o.tips.length ? '安全建议：' + o.tips.join('；') : '安全配置良好：已包含 Secure、HttpOnly 与 SameSite。');
      textArr.push(o.name + '=' + o.val + ' | ' + o.life);
    }
    return { html: html, text: textArr.join('\n') };
  }
});

/* 11. Data URI */
T({ id: 'datauri', name: 'Data URI 生成与解析', cat: 'dev',
  desc: '把文本编码成 data: URI，或解析出 MIME、编码方式与内容并估算体积',
  tags: 'data URI data: base64 内联 图片 编码 解码 MIME 体积',
  fields: [
    { k: 'text', label: '内容 / Data URI', type: 'textarea', rows: 5,
      value: '安空工具箱 · AnKong Toolbox 2026' },
    { k: 'mode', label: '操作', type: 'select', value: 'enc', options: [
      ['enc', '生成 Data URI'], ['dec', '解析 Data URI'] ] },
    { k: 'mime', label: 'MIME 类型', type: 'select', value: 'text/plain;charset=utf-8', options: [
      ['text/plain;charset=utf-8', 'text/plain（纯文本）'], ['text/html;charset=utf-8', 'text/html'],
      ['text/css;charset=utf-8', 'text/css'], ['application/json;charset=utf-8', 'application/json'],
      ['image/svg+xml', 'image/svg+xml'], ['application/octet-stream', 'application/octet-stream'] ] },
    { k: 'enc', label: '编码方式', type: 'select', value: 'b64', options: [
      ['b64', 'base64'], ['pct', '百分号编码（URL 编码）'], ['raw', '不编码（仅 ASCII 安全字符）'] ] }
  ],
  run: function (v) {
    var s = String(v.text == null ? '' : v.text), out = '';
    if (v.mode === 'dec') {
      var m = /^data:([^,]*),([\s\S]*)$/.exec(s.trim());
      if (!m) return HINT('未识别为合法的 Data URI，格式应为 data:[<MIME>][;base64],<数据>。');
      var meta = m[1], payload = m[2], isB64 = /;base64$/i.test(meta);
      var mime = meta.replace(/;base64$/i, '').split(';')[0] || 'text/plain';
      var charset = (/;charset=([^;]+)/i.exec(meta) || [])[1] || '';
      var body = '', size = 0;
      if (isB64) {
        try {
          var bin = atob(payload.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/'));
          var bs = []; for (var i = 0; i < bin.length; i++) bs.push(bin.charCodeAt(i));
          body = fromBytes(bs); size = bs.length;
        } catch (e) { return HINT('base64 数据无法解码：' + e.message); }
      } else {
        try { body = decodeURIComponent(payload); size = bytes(body).length; } catch (e2) { body = payload; size = bytes(body).length; }
      }
      return SEC('解析结果') + KV([
        ['MIME 类型', esc(mime)], ['字符集', esc(charset || '未声明')],
        ['编码', isB64 ? 'base64' : '百分号 / 原文'], ['解码后字节', size + ' B'],
        ['URI 总字符', s.length + ' 个'],
        ['体积开销', rnd(100 - size / (bytes(s).length || 1) * 100 * -1, 2) + ' %（URI 比原始字节大约 ' + rnd(bytes(s).length / (size || 1), 2) + ' ×）']
      ]) + SEC('内容') + PRE(body.length > 4000 ? body.slice(0, 4000) + '\n…（已截断）' : body) +
        HINT('base64 会让体积增大约 33%；SVG 等文本资源用百分号编码通常更省。');
    }
    var mime2 = String(v.mime || 'text/plain;charset=utf-8'), enc = String(v.enc || 'b64');
    if (enc === 'b64') out = 'data:' + mime2 + ';base64,' + H.b64enc(s);
    else if (enc === 'pct') out = 'data:' + mime2 + ',' + encodeURIComponent(s).replace(/%20/g, '%20');
    else out = 'data:' + mime2 + ',' + s.replace(/[#%]/g, function (c) { return '%' + c.charCodeAt(0).toString(16).toUpperCase(); });
    return SEC('生成的 Data URI') + PRE(out) +
      KV([['MIME', esc(mime2)], ['编码', enc === 'b64' ? 'base64' : (enc === 'pct' ? '百分号编码' : '原文')],
          ['原始字节', bytes(s).length + ' B'], ['URI 字节', bytes(out).length + ' B'],
          ['膨胀', rnd(bytes(out).length / (bytes(s).length || 1), 2) + ' ×']]) +
      HINT('Data URI 适合内联小图标、字体片段或测试样本；体积较大时建议改用独立文件以便浏览器缓存。');
  }
});

/* 12. ULID / Snowflake 解析 */
T({ id: 'idparse', name: 'ULID / Snowflake ID 解析', cat: 'dev',
  desc: '从 ULID、雪花 ID 中还原时间戳、机器位与序列号，校验格式合法性',
  tags: 'ULID Snowflake 雪花算法 分布式ID 时间戳 解析 Crockford Base32 Twitter Discord',
  fields: [
    { k: 'text', label: 'ID（每行一个）', type: 'textarea', rows: 4,
      value: '01J9Z8X7Q2P3M4N5K6R7S8T9VW\n1759288474624000000' },
    { k: 'kind', label: 'ID 类型', type: 'select', value: 'auto', options: [
      ['auto', '自动识别'], ['ulid', 'ULID（26 位 Crockford）'], ['snowflake', 'Snowflake（纯数字）'] ] },
    { k: 'epoch', label: 'Snowflake 自定义纪元（ms）', type: 'select', value: '1288834974657', options: [
      ['1288834974657', 'Twitter 2010-11-04 (1288834974657)'],
      ['1420070400000', 'Discord 2015-01-01 (1420070400000)'],
      ['0', 'Unix 纪元 (0)'] ] }
  ],
  run: function (v) {
    var ls = lines(v.text).map(function (x) { return x.trim(); }).filter(Boolean), rows = [], k;
    var CROCK = '0123456789ABCDEFGHJKMNPQRSTVWXYZ', ep = parseInt(v.epoch, 10) || 0;
    function fmt(ms) {
      if (!isFinite(ms) || ms < 0 || ms > 8.64e15) return '无效时间戳';
      var d = new Date(ms);
      return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()) + ' ' +
             pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes()) + ':' + pad2(d.getUTCSeconds()) + '.' +
             ('00' + d.getUTCMilliseconds()).slice(-3) + ' UTC';
    }
    for (k = 0; k < ls.length; k++) {
      var id = ls[k], type = v.kind, note = '';
      if (type === 'auto') type = /^[0-9A-HJKMNP-TV-Z]{26}$/i.test(id) ? 'ulid' : (/^\d+$/.test(id) ? 'snowflake' : '?');
      if (type === 'ulid') {
        var up = id.toUpperCase(), ms = 0, ok = true, i;
        for (i = 0; i < 10; i++) { var d = CROCK.indexOf(up.charAt(i)); if (d < 0) { ok = false; break; } ms = ms * 32 + d; }
        var randPart = up.slice(10);
        rows.push([id.length > 20 ? id.slice(0, 20) + '…' : id, 'ULID', ok ? fmt(ms) : '非法字符', ok ? String(ms) : '—', ok ? ('随机部分 ' + randPart.length + ' 位') : '时间部分含非法 Crockford 字符']);
      } else if (type === 'snowflake') {
        var n = parseFloat(id);
        if (!isFinite(n) || n < 0 || n > 9e15) { rows.push([id, 'Snowflake', '数值越界', '—', '仅支持 < 2^53 的 ID']); }
        else {
          var ts = Math.floor(n / 4194304) + ep;           // >>22
          var worker = Math.floor(n / 4096) % 1024;        // 10 bit
          var seqp = n % 4096;                             // 12 bit
          rows.push([id, 'Snowflake', fmt(ts), String(ts), '机器/进程 ' + worker + ' · 序列 ' + seqp + ' · 纪元 ' + ep]);
        }
      } else rows.push([id, '未识别', '—', '—', '仅支持 26 位 ULID 或纯数字 Snowflake ID']);
    }
    if (!rows.length) return HINT('请输入至少一个 ID。');
    return SEC('解析结果') + TB(['ID', '类型', '生成时间', '毫秒时间戳', '其它字段'], rows) +
      HINT('ULID 前 10 位是 48 bit 毫秒时间戳（Crockford Base32），后 16 位为随机性；Snowflake 高 41 位是相对纪元的时间戳，随后 10 位机器 ID、12 位序列号。');
  }
});

/* 13. chmod / umask */
T({ id: 'chmodcalc', name: 'chmod 权限与 umask 计算', cat: 'dev',
  desc: '数字权限与 rwx 符号互转，计算 umask 后的实际权限与常用组合',
  tags: 'chmod umask linux 权限 rwx 八进制 文件权限 计算 0777',
  fields: [
    { k: 'perm', label: '权限（数字如 754 或符号 rwxr-xr--）', type: 'text', value: '754' },
    { k: 'umask', label: 'umask', type: 'text', value: '0022' },
    { k: 'type', label: '目标类型', type: 'select', value: 'file', options: [
      ['file', '普通文件（基准 666）'], ['dir', '目录（基准 777）'] ] }
  ],
  run: function (v) {
    var p = String(v.perm || '').trim(), u = String(v.umask || '').trim();
    function parsePerm(x) {
      if (/^[0-7]{3,4}$/.test(x)) return parseInt(x.slice(-3), 8);
      if (/^[rwx-]{9}$/.test(x)) {
        var n = 0, i;
        for (i = 0; i < 9; i++) n = n * 2 + (x.charAt(i) === '-' ? 0 : 1);
        return n;
      }
      if (/^[0-7]{1,3}$/.test(x)) return parseInt(x, 8);
      return null;
    }
    function sym(n) {
      var s = '', bits = [4, 2, 1], j, k;
      for (j = 0; j < 3; j++) for (k = 0; k < 3; k++) s += (n & (bits[k] << (6 - j * 3))) ? 'rwx'.charAt(k) : '-';
      return s;
    }
    var pv = parsePerm(p), uv = /^[0-7]{3,4}$/.test(u) ? parseInt(u.slice(-3), 8) : null;
    if (pv == null) return HINT('权限格式无法识别，请输入 3 位八进制（如 754）或 9 位符号（如 rwxr-xr--）。');
    var oct = ('000' + pv.toString(8)).slice(-3);
    var html = SEC('权限互转') + KV([
      ['数字（八进制）', oct], ['符号表示', sym(pv)],
      ['所有者', oct.charAt(0) + ' → ' + sym(pv).slice(0, 3)],
      ['所属组', oct.charAt(1) + ' → ' + sym(pv).slice(3, 6)],
      ['其他用户', oct.charAt(2) + ' → ' + sym(pv).slice(6, 9)]
    ]);
    if (uv != null) {
      var base = v.type === 'dir' ? 511 : 438;   // 0777 / 0666
      var actual = base & (~uv & 511);
      html += SEC('umask 生效结果') + KV([
        ['umask', ('000' + uv.toString(8)).slice(-3) + '（' + sym(uv) + '）'],
        ['创建基准', v.type === 'dir' ? '0777 目录' : '0666 文件'],
        ['实际权限', ('000' + actual.toString(8)).slice(-3) + '（' + sym(actual) + '）'],
        ['计算式', '实际 = 基准 & ~umask']
      ]);
    }
    html += SEC('常见权限速查') + TB(['数字', '符号', '含义'], [
      ['600', '-rw-------', '仅所有者可读写（私钥）'],
      ['644', '-rw-r--r--', '所有者可写，其他只读（普通文件）'],
      ['664', '-rw-rw-r--', '组成员可写'],
      ['700', '-rwx------', '仅所有者可进入 / 执行'],
      ['755', '-rwxr-xr-x', '常用目录与可执行程序'],
      ['775', '-rwxrwxr-x', '组协作目录'],
      ['777', '-rwxrwxrwx', '完全开放（不推荐）']
    ]) + HINT('r=4、w=2、x=1；三组分别对应所有者 / 组 / 其他人。umask 用「按位取反后与基准相与」去掉权限位。');
    return { html: html, text: oct + ' ' + sym(pv) };
  }
});

/* 14. HTML 转 Markdown */
T({ id: 'html2md', name: 'HTML 转 Markdown', cat: 'dev',
  desc: '把常见 HTML 标签转换为 Markdown：标题、列表、链接、表格、代码块等',
  tags: 'HTML Markdown 转换 标签 清洗 导出 文档 md',
  fields: [
    { k: 'text', label: 'HTML 源码', type: 'textarea', rows: 9,
      value: '<h2>安空工具箱</h2>\n<p>一个 <strong>离线</strong> 小工具集合，支持 <a href="https://example.com">网页版</a> 与 <em>安卓客户端</em>。</p>\n<ul><li>纯本地运行</li><li>无需登录</li></ul>\n<blockquote>数据只保存在本机。</blockquote>\n<pre><code>const v = 1.7;</code></pre>\n<table><tr><th>功能</th><th>状态</th></tr><tr><td>工具箱</td><td>可用</td></tr></table>' },
    { k: 'style', label: '列表符号', type: 'select', value: '-', options: [
      ['-', '短横线 -'], ['*', '星号 *'], ['+', '加号 +'] ] }
  ],
  run: function (v) {
    var s = String(v.text == null ? '' : v.text), bullet = String(v.style || '-');
    // 代码块先占位保护
    var blocks = [], i;
    s = s.replace(/<pre[^>]*>\s*(?:<code[^>]*>)?([\s\S]*?)(?:<\/code>)?\s*<\/pre>/gi, function (m, body) {
      var txt = body.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
      blocks.push(txt.replace(/^\n/, '').replace(/\n$/, ''));
      return '\u0001CODE' + (blocks.length - 1) + '\u0002';
    });
    s = s.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
    s = s.replace(/<br\s*\/?>/gi, '  \n').replace(/<hr\s*\/?>/gi, '\n\n---\n\n');
    s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, function (m, lv, body) {
      var n = parseInt(lv, 10), mark = '';
      for (i = 0; i < n; i++) mark += '#';
      return '\n\n' + mark + ' ' + body.replace(/<[^>]+>/g, '').trim() + '\n\n';
    });
    s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**').replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
    s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*').replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
    s = s.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, '~~$1~~');
    s = s.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');
    s = s.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)');
    s = s.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '![$1]($2)');
    s = s.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');
    // 列表
    s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, function (m, body) { return '\n' + bullet + ' ' + body.replace(/<[^>]+>/g, '').trim(); });
    s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, function (m, body) {
      var c = 0; return '\n\n' + body.replace(/^[\s]*[-\*\+] /gm, function () { c++; return '\n' + c + '. '; }).trim() + '\n\n';
    });
    s = s.replace(/<\/?[uo]l[^>]*>/gi, '\n\n');
    // 引用
    s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, function (m, body) {
      return '\n\n' + body.replace(/<[^>]+>/g, '').trim().split('\n').map(function (x) { return '> ' + x; }).join('\n') + '\n\n';
    });
    // 表格
    s = s.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, function (m, body) {
      var trs = body.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [], out = [], headDone = false, colCount = 0;
      for (var t = 0; t < trs.length; t++) {
        var cells = trs[t].match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/gi) || [];
        var vals = cells.map(function (c) { return c.replace(/<[^>]+>/g, '').trim().replace(/\|/g, '\\|'); });
        if (!vals.length) continue;
        colCount = vals.length;
        out.push('| ' + vals.join(' | ') + ' |');
        if (!headDone) { out.push('| ' + vals.map(function () { return '---'; }).join(' | ') + ' |'); headDone = true; }
      }
      return '\n\n' + out.join('\n') + '\n\n';
    });
    s = s.replace(/<\/?(p|div|section|article|table|tr|td|th|thead|tbody|span)[^>]*>/gi, '\n');
    s = s.replace(/<[^>]+>/g, '');
    s = s.replace(/&nbsp;/gi, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    s = s.replace(/\u0001CODE(\d+)\u0002/g, function (m, ix) { return '\n\n```\n' + blocks[parseInt(ix, 10)] + '\n```\n\n'; });
    s = s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    return SEC('Markdown 结果') + PRE(s) +
      KV([['输入字符', String(v.text || '').length + ' 个'], ['输出字符', s.length + ' 个'],
          ['代码块', blocks.length + ' 个'], ['表格', (String(v.text || '').match(/<table/gi) || []).length + ' 个']]) +
      HINT('这是基于正则的轻量转换，覆盖常见标签；嵌套结构复杂或含自定义组件时建议人工校对。');
  }
});

})();
