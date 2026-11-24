/* ============================================================
   安空工具箱 — 扩展工具包
   46 个纯离线工具：文本 / 开发 / 计算 / 生活 / 设备 / 查询 / 游戏 / 媒体
   不联网、不依赖第三方接口，ES5 兼容写法
   ============================================================ */
(function () {
'use strict';

/* ---------------- 局部辅助 ---------------- */
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
  return '<pre style="white-space:pre-wrap;word-break:break-all;font:13px/1.65 ui-monospace,Menlo,Consolas,monospace;margin:0;padding:2px 0">' + esc(s) + '</pre>';
}
function SEC(t) { return '<div class="sec-label" style="margin-top:14px">' + esc(t) + '</div>'; }
function HINT(t) { return '<div class="hint" style="margin-top:10px">' + esc(t) + '</div>'; }
function revStr(s) { return (Array.from ? Array.from(s) : s.split('')).reverse().join(''); }
function num(v, d) { return H.num(v, d == null ? 4 : d); }
function gcdf(a, b) { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
function pad2(n) { return ('0' + n).slice(-2); }
function dateStr(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function parseDate(s) {
  var m = String(s || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) throw new Error('日期格式应为 YYYY-MM-DD');
  var d = new Date(+m[1], +m[2] - 1, +m[3]);
  if (isNaN(d.getTime())) throw new Error('日期无效');
  return d;
}

/* ============================================================
   一、文本工具（7）
   ============================================================ */

T({ id: 'textreverse', name: '文本反转', cat: 'text',
  desc: '按字符、行序或词序倒序排列文本', tags: '文本 反转 倒序 逆序 reverse',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 5, value: '安空工具箱\nAnKong Toolbox\n一二三 四五六' },
    { k: 'mode', label: '反转方式', type: 'select', value: 'chars', options: [
      ['chars', '整段字符倒序'], ['lines', '行的顺序反转'], ['words', '单词顺序反转'],
      ['eachline', '每一行内部倒序'], ['eachword', '每个单词内部倒序'] ] }
  ],
  run: function (v) {
    var s = String(v.text || '');
    if (!s.trim()) throw new Error('请输入要反转的文本');
    var out;
    if (v.mode === 'lines') out = s.split(/\r?\n/).reverse().join('\n');
    else if (v.mode === 'words') out = s.split(/\s+/).filter(Boolean).reverse().join(' ');
    else if (v.mode === 'eachline') out = s.split(/\r?\n/).map(revStr).join('\n');
    else if (v.mode === 'eachword') out = s.replace(/\S+/g, function (w) { return revStr(w); });
    else out = revStr(s);
    return R(PRE(out) + HINT('原长度 ' + s.length + ' 字符，结果 ' + out.length + ' 字符'), out);
  }
});

T({ id: 'textdedup', name: '文本去重', cat: 'text',
  desc: '按行 / 按词 / 按字符去重，保留首次出现顺序', tags: '文本 去重 重复 清洗 dedup',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6, value: '苹果\n香蕉\n苹果\n橘子\n香蕉\n葡萄' },
    { k: 'mode', label: '去重单位', type: 'select', value: 'lines', options: [
      ['lines', '按行去重'], ['words', '按词去重'], ['chars', '去除重复字符'] ] },
    { k: 'ignore', label: '忽略大小写', type: 'switch', value: false },
    { k: 'keepEmpty', label: '保留空行 / 空项', type: 'switch', value: false }
  ],
  run: function (v) {
    var s = String(v.text || '');
    if (!s) throw new Error('请输入文本');
    var parts = v.mode === 'lines' ? s.split(/\r?\n/)
      : v.mode === 'words' ? s.split(/\s+/)
      : s.split('');
    var sep = v.mode === 'lines' ? '\n' : v.mode === 'words' ? ' ' : '';
    var seen = {}, outp = [];
    parts.forEach(function (p) {
      if (!v.keepEmpty && p === '') return;
      var k = v.ignore ? p.toLowerCase() : p;
      if (seen[k]) return;
      seen[k] = 1; outp.push(p);
    });
    var out = outp.join(sep);
    return R(KV([['原始项数', esc(parts.length)], ['去重后', esc(outp.length)],
      ['移除重复', esc(parts.length - outp.length)]]) + SEC('去重结果') + PRE(out),
      out + '\n\n原始 ' + parts.length + ' 项，去重后 ' + outp.length + ' 项');
  }
});

T({ id: 'textsort', name: '文本排序', cat: 'text',
  desc: '文本行按拼音、长度、数值或随机打乱重排', tags: '文本 排序 打乱 随机 sort shuffle',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6, value: '香蕉\n苹果\n12\n3\n橘子\n101' },
    { k: 'mode', label: '排序方式', type: 'select', value: 'asc', options: [
      ['asc', '按拼音升序'], ['desc', '按拼音降序'], ['length', '按行长度'],
      ['numeric', '按行首数值'], ['shuffle', '随机打乱'], ['reverse', '直接倒序'] ] },
    { k: 'trimBlank', label: '去掉空行', type: 'switch', value: true }
  ],
  run: function (v) {
    var lines = String(v.text || '').split(/\r?\n/);
    if (v.trimBlank) lines = lines.filter(function (l) { return l.trim() !== ''; });
    if (!lines.length) throw new Error('请输入至少一行文本');
    var a = lines.slice();
    if (v.mode === 'asc') a.sort(function (x, y) { return x.localeCompare(y, 'zh-CN'); });
    else if (v.mode === 'desc') a.sort(function (x, y) { return y.localeCompare(x, 'zh-CN'); });
    else if (v.mode === 'length') a.sort(function (x, y) { return x.length - y.length || x.localeCompare(y, 'zh-CN'); });
    else if (v.mode === 'numeric') a.sort(function (x, y) {
      return (parseFloat(x) || 0) - (parseFloat(y) || 0);
    });
    else if (v.mode === 'shuffle') {
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
      }
    } else a.reverse();
    var out = a.join('\n');
    return R(PRE(out) + HINT('共 ' + a.length + ' 行'), out);
  }
});

T({ id: 'textstat', name: '字符频次统计', cat: 'text',
  desc: '统计各字符出现次数与占比，排出 Top N', tags: '文本 统计 字频 频率 词频',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6, value: '安空工具箱，一个 App 装下所有顺手的小工具。\nAnKong Toolbox 2026' },
    { k: 'mode', label: '统计范围', type: 'select', value: 'all', options: [
      ['all', '全部字符'], ['cn', '仅汉字'], ['alpha', '仅字母'], ['digit', '仅数字'] ] },
    { k: 'ignorecase', label: '字母忽略大小写', type: 'switch', value: true },
    { k: 'top', label: '显示前 N 项', type: 'number', value: 20 }
  ],
  run: function (v) {
    var s = String(v.text || '');
    if (!s) throw new Error('请输入文本');
    var chars = (Array.from ? Array.from(s) : s.split(''));
    var map = {}, total = 0;
    chars.forEach(function (c) {
      var keep = v.mode === 'all' ? /\S/.test(c)
        : v.mode === 'cn' ? /[\u4e00-\u9fa5]/.test(c)
        : v.mode === 'alpha' ? /[a-z]/i.test(c) : /[0-9]/.test(c);
      if (!keep) return;
      var k = (v.ignorecase && /[a-z]/i.test(c)) ? c.toLowerCase() : c;
      map[k] = (map[k] || 0) + 1; total++;
    });
    var list = Object.keys(map).map(function (k) { return [k, map[k]]; })
      .sort(function (a, b) { return b[1] - a[1] || a[0].localeCompare(b[0]); });
    var top = Math.max(1, Math.min(100, Math.round(Number(v.top) || 20)));
    var rows = list.slice(0, top).map(function (p) {
      var label = p[0] === ' ' ? '(空格)' : p[0] === '\n' ? '(换行)' : p[0];
      return [label, p[1], (p[1] / total * 100).toFixed(2) + '%'];
    });
    return R(KV([['参与统计字符', esc(total)], ['不同字符数', esc(list.length)],
      ['最高频', esc(list.length ? list[0][0] + ' × ' + list[0][1] : '—')]]) +
      SEC('频次排行') + TB(['字符', '次数', '占比'], rows),
      list.slice(0, top).map(function (p) { return p[0] + '\t' + p[1]; }).join('\n'));
  }
});

T({ id: 'punct', name: '全半角与标点转换', cat: 'text',
  desc: '全角 ↔ 半角、中文标点 ↔ 英文标点互转', tags: '文本 全角 半角 标点 转换 校对',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 5, value: 'ＡｎＫｏｎｇ １２３，你好！这是「测试」（１）。' },
    { k: 'mode', label: '转换方式', type: 'select', value: 'tohalf', options: [
      ['tohalf', '全角 → 半角'], ['tofull', '半角 → 全角'],
      ['cn2en', '中文标点 → 英文'], ['en2cn', '英文标点 → 中文'] ] }
  ],
  run: function (v) {
    var s = String(v.text || '');
    if (!s) throw new Error('请输入文本');
    var cn = { '，': ',', '。': '.', '！': '!', '？': '?', '；': ';', '：': ':',
      '“': '"', '”': '"', '‘': "'", '’': "'", '（': '(', '）': ')', '【': '[', '】': ']',
      '《': '<', '》': '>', '、': ',', '·': '.', '—': '-', '～': '~', '％': '%', '＃': '#',
      '＋': '+', '＝': '=', '＆': '&', '＠': '@', '＊': '*', '｜': '|', '＼': '\\', '／': '/' };
    var en = { ',': '，', '.': '。', '!': '！', '?': '？', ';': '；', ':': '：',
      '(': '（', ')': '）', '[': '【', ']': '】', '<': '《', '>': '》', '"': '“', "'": '‘' };
    var out;
    if (v.mode === 'tohalf') out = s.replace(/[\uFF01-\uFF5E]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) - 0xFEE0);
    }).replace(/\u3000/g, ' ');
    else if (v.mode === 'tofull') out = s.replace(/[!-~]/g, function (c) {
      return String.fromCharCode(c.charCodeAt(0) + 0xFEE0);
    }).replace(/ /g, '\u3000');
    else if (v.mode === 'cn2en') out = s.replace(/[，。！？；：“”‘’（）【】《》、·—～％＃＋＝＆＠＊｜＼／]/g, function (c) { return cn[c] || c; });
    else out = s.replace(/[,.;:()\[\]<>"'!?]/g, function (c, i, str) {
      if (c === '"') return (i > 0 && /[，。！？；：\u4e00-\u9fa5]/.test(str[i - 1])) ? '”' : '“';
      return en[c] || c;
    });
    return R(PRE(out) + HINT('长度 ' + s.length + ' → ' + out.length + ' 字符'), out);
  }
});

T({ id: 'num2cn', name: '数字转中文大写', cat: 'text',
  desc: '人民币金额大写、中文大写数字与中文读法', tags: '数字 中文 大写 金额 人民币 财务',
  fields: [
    { k: 'num', label: '数字', type: 'text', value: '12345.67' },
    { k: 'mode', label: '输出形式', type: 'select', value: 'money', options: [
      ['money', '人民币金额大写'], ['upper', '中文大写数字'], ['lower', '中文小写读法'] ] }
  ],
  run: function (v) {
    var raw = String(v.num || '').trim().replace(/,/g, '');
    if (!/^-?\d+(\.\d+)?$/.test(raw)) throw new Error('请输入有效数字，例如 12345.67');
    var neg = raw.charAt(0) === '-';
    raw = neg ? raw.slice(1) : raw;
    var pieces = raw.split('.'), intPart = pieces[0].replace(/^0+(?=\d)/, ''), dec = pieces[1] || '';
    if (intPart.length > 15) throw new Error('整数部分最多支持 15 位');
    var dLow = '零一二三四五六七八九', uLow = ['', '十', '百', '千'];
    var dUp = '零壹贰叁肆伍陆柒捌玖', uUp = ['', '拾', '佰', '仟'];
    var up = v.mode !== 'lower';
    var D = up ? dUp : dLow, U = up ? uUp : uLow;
    function g4(g) {
      var s = String(g), r = '', zero = false;
      for (var i = 0; i < s.length; i++) {
        var x = +s.charAt(i), p = s.length - 1 - i;
        if (x === 0) zero = true;
        else { if (zero && r) r += '零'; zero = false; r += D.charAt(x) + U[p]; }
      }
      return r;
    }
    function readInt(n) {
      if (n === 0) return D.charAt(0);
      var parts = [], x = n;
      while (x > 0) { parts.unshift(x % 10000); x = Math.floor(x / 10000); }
      var names = ['', '万', '亿', '兆'], out = '';
      for (var i = 0; i < parts.length; i++) {
        var g = parts[i], gi = parts.length - 1 - i;
        if (g === 0) { if (out && out.charAt(out.length - 1) !== '零') out += '零'; }
        else {
          if (out && g < 1000 && out.charAt(out.length - 1) !== '零') out += '零';
          out += g4(g) + (names[gi] || '');
        }
      }
      return out.replace(/零+$/, '').replace(/零+/g, '零');
    }
    var n = parseInt(intPart, 10), core = readInt(n);
    var out, decTxt = '';
    if (v.mode === 'money') {
      var jiao = dec ? +dec.charAt(0) : 0, fen = dec.length > 1 ? +dec.charAt(1) : 0;
      out = (neg ? '负' : '') + core + '元';
      if (!jiao && !fen) out += '整';
      else {
        out += jiao ? D.charAt(jiao) + '角' : '零';
        out += fen ? D.charAt(fen) + '分' : '整';
      }
      decTxt = '角分：' + jiao + ' 角 ' + fen + ' 分';
    } else {
      out = (neg ? '负' : '') + core;
      if (dec) out += '点' + dec.split('').map(function (c) { return D.charAt(+c); }).join('');
    }
    return R(KV([['原始数字', esc(raw)], ['转换结果', '<b style="font-size:15px">' + esc(out) + '</b>'],
      ['小数部分', esc(decTxt || (dec ? dec : '无'))]]) +
      HINT('人民币大写常用于票据与合同；「整」表示没有角分。'),
      out);
  }
});

T({ id: 'slug', name: 'URL 别名与安全文件名', cat: 'text',
  desc: '标题转 URL slug、安全文件名或 HTML id', tags: '文本 slug 文件名 url 别名 安全',
  fields: [
    { k: 'text', label: '标题 / 文本', type: 'text', value: '安空工具箱 v' + (window.AK_VERSION || '2.4') + '：一个 App 装下所有小工具!' },
    { k: 'mode', label: '用途', type: 'select', value: 'slug', options: [
      ['slug', 'URL slug'], ['file', '安全文件名'], ['id', 'HTML id / 锚点'] ] },
    { k: 'sep', label: '分隔符', type: 'text', value: '-' },
    { k: 'keepCn', label: '保留中文（不转拼音）', type: 'switch', value: true },
    { k: 'lower', label: '转为小写', type: 'switch', value: true }
  ],
  run: function (v) {
    var s = String(v.text || '').trim();
    if (!s) throw new Error('请输入标题文本');
    var sep = String(v.sep || '-');
    var t = s;
    if (v.mode === 'file') t = t.replace(/[\\/:*?"<>|\x00-\x1f]/g, ' ');
    else t = t.replace(/[\\/:*?"<>|#?&%+~`'^(){}\[\]]/g, ' ');
    if (!v.keepCn) t = t.replace(/[\u4e00-\u9fa5]/g, ' ');
    t = t.replace(/[，。！？；：、,.!?;:]/g, ' ');
    t = t.trim().replace(/[\s_]+/g, sep);
    t = t.replace(new RegExp('[^0-9A-Za-z\\u4e00-\\u9fa5' + sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ']', 'g'), '');
    t = t.replace(new RegExp('(' + sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '){2,}', 'g'), sep);
    t = t.replace(new RegExp('^' + sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '+|' + sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '+$', 'g'), '');
    if (v.lower) t = t.toLowerCase();
    if (v.mode === 'id' && /^[0-9]/.test(t)) t = 'ak-' + t;
    if (v.mode === 'file' && !t) t = 'untitled';
    if (v.mode === 'file' && t.length > 80) t = t.slice(0, 80);
    return R(KV([['生成结果', '<code>' + esc(t) + '</code>'],
      ['长度', esc(t.length) + ' 字符'],
      ['示例链接', esc(v.mode === 'file' ? '/Pictures/安空工具箱/' + t + '.png' : 'https://example.com/p/' + t)]]) +
      HINT('中文不做拼音转换，保留原字；URL 使用时浏览器会自动百分号编码。'), t);
  }
});

/* ============================================================
   二、开发者工具（8）
   ============================================================ */

T({ id: 'htmlenc', name: 'HTML 实体编解码', cat: 'dev',
  desc: 'HTML 特殊字符与数字实体互转', tags: '开发 html 实体 编码 解码 escape',
  fields: [
    { k: 'text', label: '文本', type: 'textarea', rows: 5, value: '<div class="box">安空 & "工具箱"</div>' },
    { k: 'mode', label: '方向', type: 'select', value: 'enc', options: [
      ['enc', '编码'], ['dec', '解码'] ] },
    { k: 'full', label: '编码全部非 ASCII 字符', type: 'switch', value: false }
  ],
  run: function (v) {
    var s = String(v.text || '');
    if (!s) throw new Error('请输入文本');
    var map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    var named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0',
      copy: '\u00a9', reg: '\u00ae', hellip: '\u2026', mdash: '\u2014', ndash: '\u2013',
      laquo: '\u00ab', raquo: '\u00bb', bull: '\u2022', middot: '\u00b7', times: '\u00d7',
      divide: '\u00f7', deg: '\u00b0', plusmn: '\u00b1', euro: '\u20ac', pound: '\u00a3' };
    var out;
    if (v.mode === 'enc') {
      out = s.replace(/[&<>"']/g, function (c) { return map[c]; });
      if (v.full) out = out.replace(/[^\x00-\x7f]/g, function (c) {
        return '&#x' + c.charCodeAt(0).toString(16).toUpperCase() + ';';
      });
    } else {
      out = s.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, function (m, body) {
        if (body.charAt(0) === '#') {
          var cp = body.charAt(1).toLowerCase() === 'x'
            ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
          if (!isFinite(cp) || cp < 0 || cp > 0x10ffff) return m;
          return cp > 0xffff ? m : String.fromCharCode(cp);
        }
        var k = body.toLowerCase();
        return named[k] != null ? named[k] : m;
      });
    }
    return R(PRE(out) + HINT('长度 ' + s.length + ' → ' + out.length), out);
  }
});

T({ id: 'jsescape', name: '字符串转义反转义', cat: 'dev',
  desc: 'JavaScript / JSON 字符串转义与还原', tags: '开发 转义 反转义 escape json 字符串',
  fields: [
    { k: 'text', label: '文本', type: 'textarea', rows: 5, value: '第一行\n第二行\t"引号"\\反斜杠' },
    { k: 'mode', label: '方向', type: 'select', value: 'enc', options: [
      ['enc', '转义'], ['dec', '反转义'] ] },
    { k: 'quote', label: '目标引号', type: 'select', value: '"', options: [
      ['"', '双引号 "'], ["'", '单引号 \''] ] }
  ],
  run: function (v) {
    var s = String(v.text || '');
    if (!s) throw new Error('请输入文本');
    var out;
    if (v.mode === 'enc') {
      out = s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t').replace(/\x08/g, '\\b').replace(/\f/g, '\\f').replace(/\v/g, '\\v');
      out = out.replace(new RegExp(v.quote, 'g'), '\\' + v.quote);
      out = out.replace(/[\x00-\x08\x0e-\x1f\x7f]/g, function (c) {
        return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
      });
    } else {
      out = s.replace(/\\(u[0-9a-f]{4}|x[0-9a-f]{2}|[0-7]{1,3}|[\\'"nrtbfv0\/])/gi, function (m, g) {
        if (g.charAt(0).toLowerCase() === 'u') return String.fromCharCode(parseInt(g.slice(1), 16));
        if (g.charAt(0).toLowerCase() === 'x') return String.fromCharCode(parseInt(g.slice(1), 16));
        if (/^[0-7]+$/.test(g)) return String.fromCharCode(parseInt(g, 8));
        return ({ n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', '0': '\u0000',
          '\\': '\\', '"': '"', "'": "'", '/': '/' })[g] || g;
      });
    }
    return R(PRE(out) + HINT('可直接粘贴到 JS / JSON 源码中使用'), out);
  }
});

function akParseCSV(s, delim) {
  var d = delim || ',', rows = [], row = [], cur = '', q = false, i;
  for (i = 0; i < s.length; i++) {
    var c = s.charAt(i);
    if (q) {
      if (c === '"') { if (s.charAt(i + 1) === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else if (c === '"' && cur === '') q = true;
    else if (c === d) { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (c !== '\r') cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(function (r) { return r.length > 1 || (r.length === 1 && r[0] !== ''); });
}
function akCsvCell(x) {
  var s = String(x == null ? '' : x);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
T({ id: 'csvjson', name: 'CSV 与 JSON 互转', cat: 'dev',
  desc: '表格文本与 JSON 数组双向转换，支持引号字段', tags: '开发 csv json 转换 表格 数据',
  fields: [
    { k: 'text', label: '数据', type: 'textarea', rows: 6, value: 'name,age,city\n张三,18,北京\n李四,20,上海\n"王,五",22,广州' },
    { k: 'dir', label: '方向', type: 'select', value: 'c2j', options: [
      ['c2j', 'CSV → JSON'], ['j2c', 'JSON → CSV'] ] },
    { k: 'delim', label: '分隔符', type: 'text', value: ',' },
    { k: 'header', label: '首行为表头（CSV → JSON）', type: 'switch', value: true }
  ],
  run: function (v) {
    var s = String(v.text || '').trim();
    if (!s) throw new Error('请输入数据');
    var d = String(v.delim || ',').charAt(0) || ',';
    var out;
    if (v.dir === 'c2j') {
      var rows = akParseCSV(s, d);
      if (!rows.length) throw new Error('没有解析到数据行');
      var arr;
      if (v.header) {
        var keys = rows[0].map(function (k, i) { return String(k).trim() || ('col' + (i + 1)); });
        arr = rows.slice(1).map(function (r) {
          var o = {}; keys.forEach(function (k, i) { o[k] = r[i] == null ? '' : r[i]; }); return o;
        });
      } else arr = rows;
      out = JSON.stringify(arr, null, 2);
      return R(PRE(out) + HINT('共 ' + arr.length + ' 条记录'), out);
    }
    var data;
    try { data = JSON.parse(s); } catch (e) { throw new Error('JSON 解析失败：' + e.message); }
    if (!Array.isArray(data)) throw new Error('JSON 需为对象数组，例如 [{"a":1}]');
    if (!data.length) throw new Error('数组为空');
    var ks = [];
    data.forEach(function (o) {
      if (o && typeof o === 'object') Object.keys(o).forEach(function (k) { if (ks.indexOf(k) < 0) ks.push(k); });
    });
    if (!ks.length) throw new Error('对象没有可用字段');
    var lines = [ks.map(akCsvCell).join(d)];
    data.forEach(function (o) {
      lines.push(ks.map(function (k) {
        var x = o && o[k];
        return akCsvCell(typeof x === 'object' ? JSON.stringify(x) : x);
      }).join(d));
    });
    out = lines.join('\n');
    return R(PRE(out) + HINT('共 ' + data.length + ' 行 × ' + ks.length + ' 列'), out);
  }
});

T({ id: 'envparse', name: '.env 配置解析', cat: 'dev',
  desc: '解析 KEY=VALUE 配置，输出键值表、JSON 或对齐文本', tags: '开发 env dotenv 配置 解析 键值',
  fields: [
    { k: 'text', label: '配置内容', type: 'textarea', rows: 7,
      value: '# 应用配置\nAPP_NAME=ankong\nDEBUG=true\nPORT=8080\nSECRET="a b c"\nEMPTY=\nCACHE_TTL=3600' },
    { k: 'mode', label: '输出形式', type: 'select', value: 'table', options: [
      ['table', '键值表'], ['json', 'JSON 对象'], ['align', '对齐重新输出'], ['clean', '去掉注释与空行'] ] }
  ],
  run: function (v) {
    var s = String(v.text || '');
    if (!s.trim()) throw new Error('请输入配置内容');
    var list = [], clean = [];
    s.split(/\r?\n/).forEach(function (line) {
      var t = line.trim();
      if (!t || t.charAt(0) === '#' || t.charAt(0) === ';') return;
      var i = t.indexOf('=');
      if (i < 0) { list.push([t, '', '缺少 =']); clean.push(t); return; }
      var k = t.slice(0, i).trim(), val = t.slice(i + 1).trim();
      if ((val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') ||
          (val.charAt(0) === "'" && val.charAt(val.length - 1) === "'")) val = val.slice(1, -1);
      list.push([k, val, /^(true|false|\d+)$/i.test(val) ? '字面量' : '字符串']);
      clean.push(k + '=' + val);
    });
    if (!list.length) throw new Error('没有解析到配置项');
    var out, html;
    if (v.mode === 'json') {
      var o = {}; list.forEach(function (p) { o[p[0]] = p[1]; });
      out = JSON.stringify(o, null, 2); html = PRE(out);
    } else if (v.mode === 'align') {
      var max = 0; list.forEach(function (p) { max = Math.max(max, p[0].length); });
      out = list.map(function (p) { return p[0] + new Array(max - p[0].length + 1).join(' ') + ' = ' + p[1]; }).join('\n');
      html = PRE(out);
    } else if (v.mode === 'clean') { out = clean.join('\n'); html = PRE(out); }
    else {
      out = list.map(function (p) { return p[0] + '=' + p[1]; }).join('\n');
      html = KV([['配置项', esc(list.length)], ['注释 / 空行', esc(s.split(/\r?\n/).length - list.length)]]) +
        SEC('解析结果') + TB(['键', '值', '类型'], list);
    }
    return R(html + HINT('引号会被剥离，# / ; 开头的注释行自动跳过'), out);
  }
});

T({ id: 'httpheaders', name: 'HTTP 报文头解析', cat: 'dev',
  desc: '解析请求行 / 状态行与全部响应头字段', tags: '开发 http header 报文 状态 请求头 调试',
  fields: [
    { k: 'text', label: '报文头', type: 'textarea', rows: 8,
      value: 'HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\nContent-Length: 128\nCache-Control: no-cache, max-age=0\nServer: nginx\nDate: Sat, 14 Nov 2026 03:00:00 GMT\nX-Request-Id: abc123' }
  ],
  run: function (v) {
    var s = String(v.text || '').replace(/\r/g, '');
    if (!s.trim()) throw new Error('请粘贴报文头（起始行 + 头字段）');
    var lines = s.split('\n'), start = lines.shift().trim(), headers = [];
    lines.forEach(function (l) {
      if (!l.trim()) return;
      var i = l.indexOf(':');
      if (i < 0) return;
      headers.push([l.slice(0, i).trim(), l.slice(i + 1).trim()]);
    });
    var m = start.match(/^HTTP\/(\d(?:\.\d)?)\s+(\d{3})\s*(.*)$/i);
    var req = start.match(/^([A-Z]+)\s+(\S+)\s+HTTP\/(\d(?:\.\d)?)$/i);
    var summary = [];
    if (m) {
      summary.push(['类型', '响应'], ['HTTP 版本', m[1]], ['状态码', m[2]], ['状态文本', m[3] || '—']);
      var code = +m[2];
      summary.push(['状态类别', code < 200 ? '信息' : code < 300 ? '成功' : code < 400 ? '重定向' : code < 500 ? '客户端错误' : '服务端错误']);
    } else if (req) summary.push(['类型', '请求'], ['方法', req[1]], ['路径', req[2]], ['HTTP 版本', req[3]]);
    else summary.push(['起始行', start]);
    headers.forEach(function (h) {
      if (/^(content-type|content-length|location|set-cookie|server|date)$/i.test(h[0])) summary.push([h[0], h[1]]);
    });
    var text = start + '\n' + headers.map(function (h) { return h[0] + ': ' + h[1]; }).join('\n');
    return R(KV(summary.map(function (p) { return [p[0], esc(p[1])]; })) +
      SEC('全部头字段（' + headers.length + '）') + TB(['字段', '值'], headers),
      text);
  }
});

T({ id: 'hexdump', name: '十六进制字节查看', cat: 'dev',
  desc: '按字节查看文本的 Hex Dump 与 ASCII 对照', tags: '开发 hex dump 字节 十六进制 二进制',
  fields: [
    { k: 'text', label: '文本', type: 'textarea', rows: 4, value: 'Hello 安空! 2026' },
    { k: 'width', label: '每行字节数', type: 'number', value: 16 },
    { k: 'upper', label: '十六进制大写', type: 'switch', value: true }
  ],
  run: function (v) {
    var s = String(v.text || '');
    if (!s) throw new Error('请输入文本');
    var b = H.utf8Bytes(s), w = Math.max(4, Math.min(32, Math.round(Number(v.width) || 16)));
    var lines = [];
    for (var off = 0; off < b.length; off += w) {
      var chunk = b.slice(off, off + w), hex = [], asc = '';
      for (var i = 0; i < w; i++) {
        if (i < chunk.length) {
          var h = ('0' + chunk[i].toString(16)).slice(-2);
          hex.push(v.upper ? h.toUpperCase() : h);
          asc += (chunk[i] >= 32 && chunk[i] < 127) ? String.fromCharCode(chunk[i]) : '.';
        } else { hex.push('  '); asc += ' '; }
      }
      lines.push(('00000000' + off.toString(16).toUpperCase()).slice(-8) + '  ' +
        hex.join(' ') + '  |' + asc + '|');
    }
    var out = lines.join('\n');
    return R(KV([['字符数', esc(s.length)], ['UTF-8 字节数', esc(b.length)],
      ['每行', esc(w) + ' 字节'], ['总行数', esc(lines.length)]]) + SEC('Hex Dump') + PRE(out),
      out);
  }
});

T({ id: 'urlbuilder', name: 'URL 参数编辑', cat: 'dev',
  desc: '列出、添加、修改或删除 URL 查询参数', tags: '开发 url 参数 query 链接 编辑',
  fields: [
    { k: 'url', label: 'URL', type: 'text', value: 'https://example.com/search?q=ankong&page=1&tag=%E5%B7%A5%E5%85%B7#top' },
    { k: 'action', label: '操作', type: 'select', value: 'list', options: [
      ['list', '列出参数'], ['set', '添加 / 修改参数'], ['del', '删除参数'], ['clear', '清空全部参数'] ] },
    { k: 'key', label: '参数名', type: 'text', value: 'page' },
    { k: 'val', label: '参数值', type: 'text', value: '2' }
  ],
  run: function (v) {
    var raw = String(v.url || '').trim();
    if (!raw) throw new Error('请输入 URL');
    var hash = '', hi = raw.indexOf('#');
    if (hi >= 0) { hash = raw.slice(hi); raw = raw.slice(0, hi); }
    var qi = raw.indexOf('?'), base = qi >= 0 ? raw.slice(0, qi) : raw;
    var qs = qi >= 0 ? raw.slice(qi + 1) : '';
    var pairs = [];
    qs.split('&').forEach(function (seg) {
      if (!seg) return;
      var i = seg.indexOf('='), k = i < 0 ? seg : seg.slice(0, i), val = i < 0 ? '' : seg.slice(i + 1);
      var dk, dv;
      try { dk = decodeURIComponent(k.replace(/\+/g, ' ')); } catch (e) { dk = k; }
      try { dv = decodeURIComponent(val.replace(/\+/g, ' ')); } catch (e) { dv = val; }
      pairs.push([dk, dv]);
    });
    var k = String(v.key || '').trim(), val = String(v.val || '');
    if (v.action === 'set') {
      if (!k) throw new Error('请填写参数名');
      var found = false;
      pairs = pairs.map(function (p) { if (p[0] === k) { found = true; return [k, val]; } return p; });
      if (!found) pairs.push([k, val]);
    } else if (v.action === 'del') {
      if (!k) throw new Error('请填写要删除的参数名');
      pairs = pairs.filter(function (p) { return p[0] !== k; });
    } else if (v.action === 'clear') pairs = [];
    var newQs = pairs.map(function (p) {
      return encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]);
    }).join('&');
    var result = base + (newQs ? '?' + newQs : '') + hash;
    var rows = pairs.map(function (p, i) { return [i + 1, p[0], p[1]]; });
    return R(KV([['基础地址', esc(base)], ['参数个数', esc(pairs.length)],
      ['完整 URL', '<code style="word-break:break-all">' + esc(result) + '</code>']]) +
      SEC('参数列表') + (rows.length ? TB(['#', '参数', '值'], rows) : '<div class="hint">当前没有查询参数</div>'),
      result + '\n\n' + pairs.map(function (p) { return p[0] + '=' + p[1]; }).join('\n'));
  }
});

T({ id: 'jsonflat', name: 'JSON 扁平化', cat: 'dev',
  desc: '展开嵌套 JSON 为路径表，统计节点与深度', tags: '开发 json 扁平 路径 遍历 节点',
  fields: [
    { k: 'text', label: 'JSON', type: 'textarea', rows: 7,
      value: '{\n  "name": "ankong",\n  "version": 1.1,\n  "tags": ["tool", "offline"],\n  "ui": { "theme": "amber", "dark": false },\n  "empty": null\n}' },
    { k: 'sep', label: '路径分隔符', type: 'text', value: '.' }
  ],
  run: function (v) {
    var s = String(v.text || '').trim();
    if (!s) throw new Error('请输入 JSON');
    var data;
    try { data = JSON.parse(s); } catch (e) { throw new Error('JSON 解析失败：' + e.message); }
    var sep = String(v.sep || '.'), rows = [], maxDepth = 0;
    function typeOf(x) { return x === null ? 'null' : Array.isArray(x) ? 'array' : typeof x; }
    function fmt(x) {
      if (x === null) return 'null';
      if (typeof x === 'object') return Array.isArray(x) ? '[]' : '{}';
      if (typeof x === 'string') return '"' + x + '"';
      return String(x);
    }
    function walk(x, path, depth) {
      maxDepth = Math.max(maxDepth, depth);
      var t = typeOf(x);
      if (t !== 'object' && t !== 'array') { rows.push([path || '(root)', t, fmt(x), depth]); return; }
      if (t === 'array') {
        if (!x.length) { rows.push([path || '(root)', 'array', '[]', depth]); return; }
        x.forEach(function (item, i) { walk(item, (path || '') + '[' + i + ']', depth + 1); });
      } else {
        var ks = Object.keys(x);
        if (!ks.length) { rows.push([path || '(root)', 'object', '{}', depth]); return; }
        ks.forEach(function (key) { walk(x[key], path ? path + sep + key : key, depth + 1); });
      }
    }
    walk(data, '', 0);
    return R(KV([['根节点类型', esc(typeOf(data))], ['叶子节点', esc(rows.length)],
      ['最大深度', esc(maxDepth)]]) + SEC('路径表') +
      TB(['路径', '类型', '值', '深度'], rows.map(function (r) { return [r[0], r[1], r[2], r[3]]; })),
      rows.map(function (r) { return r[0] + ' = ' + r[2]; }).join('\n'));
  }
});

/* ============================================================
   三、计算换算（9）
   ============================================================ */

T({ id: 'romannum', name: '罗马数字转换', cat: 'calc',
  desc: '阿拉伯数字与罗马数字互转（1 ~ 3999）', tags: '计算 罗马数字 roman 换算',
  fields: [
    { k: 'val', label: '数值或罗马数字', type: 'text', value: '2026' },
    { k: 'dir', label: '方向', type: 'select', value: 'a2r', options: [
      ['a2r', '阿拉伯 → 罗马'], ['r2a', '罗马 → 阿拉伯'] ] }
  ],
  run: function (v) {
    var s = String(v.val || '').trim();
    if (!s) throw new Error('请输入内容');
    var table = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
      [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    var out, extra;
    if (v.dir === 'a2r') {
      if (!/^\d+$/.test(s)) throw new Error('请输入正整数');
      var n = parseInt(s, 10);
      if (n < 1 || n > 3999) throw new Error('罗马数字标准范围为 1 ~ 3999');
      out = ''; var rest = n;
      table.forEach(function (p) { while (rest >= p[0]) { out += p[1]; rest -= p[0]; } });
      extra = '拆分为 ' + table.filter(function (p) { return out.indexOf(p[1]) >= 0; })
        .map(function (p) { return p[1]; }).join(' / ');
    } else {
      var upper = s.toUpperCase();
      if (!/^[MDCLXVI]+$/.test(upper)) throw new Error('罗马数字只能包含 M D C L X V I');
      var map = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 }, total = 0;
      for (var i = 0; i < upper.length; i++) {
        var cur = map[upper.charAt(i)], nxt = map[upper.charAt(i + 1)] || 0;
        total += cur < nxt ? -cur : cur;
      }
      if (total < 1 || total > 3999) throw new Error('数值超出 1 ~ 3999 范围');
      var check = '', tmp = total;
      table.forEach(function (p) { while (tmp >= p[0]) { check += p[1]; tmp -= p[0]; } });
      if (check !== upper) extra = '注意：写法不规范，标准写法应为 ' + check;
      else extra = '写法规范';
      out = String(total);
    }
    return R(KV([['输入', esc(s)], ['结果', '<b style="font-size:16px">' + esc(out) + '</b>'],
      ['说明', esc(extra)]]) +
      HINT('规则：I=1 V=5 X=10 L=50 C=100 D=500 M=1000；小数字在大数字左侧表示相减。'),
      s + ' → ' + out);
  }
});

T({ id: 'fraction', name: '分数与小数互转', cat: 'calc',
  desc: '小数转最简分数、分数化小数与约分', tags: '计算 分数 小数 约分 通分 换算',
  fields: [
    { k: 'val', label: '数值', type: 'text', value: '0.75' },
    { k: 'dir', label: '方向', type: 'select', value: 'd2f', options: [
      ['d2f', '小数 → 最简分数'], ['f2d', '分数 → 小数'], ['reduce', '分数约分'] ] },
    { k: 'maxD', label: '最大分母（小数转分数）', type: 'number', value: 10000 }
  ],
  run: function (v) {
    var s = String(v.val || '').trim();
    if (!s) throw new Error('请输入数值');
    var maxD = Math.max(10, Math.min(1000000, Math.round(Number(v.maxD) || 10000)));
    function fracOf(x) {
      var sign = x < 0 ? -1 : 1; x = Math.abs(x);
      var bestN = 0, bestD = 1, bestErr = Infinity;
      for (var d = 1; d <= maxD; d++) {
        var n = Math.round(x * d), err = Math.abs(x - n / d);
        if (err < bestErr - 1e-12) { bestErr = err; bestN = n; bestD = d; if (err < 1e-12) break; }
      }
      var g = gcdf(bestN, bestD);
      return [sign * bestN / g, bestD / g, bestErr];
    }
    function parseFrac(str) {
      var m = str.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
      if (m) return [(+m[1] >= 0 ? 1 : -1) * (Math.abs(+m[1]) * +m[3] + +m[2]), +m[3]];
      m = str.match(/^(-?\d+)\s*\/\s*(\d+)$/);
      if (m) return [+m[1], +m[2]];
      m = str.match(/^-?\d+(\.\d+)?$/);
      if (m) return [+str, 1];
      throw new Error('无法解析，示例：3/4、1 1/2 或 0.75');
    }
    var out, html;
    if (v.dir === 'd2f') {
      if (!/^-?\d+(\.\d+)?$/.test(s)) throw new Error('请输入小数，例如 0.75');
      var x = parseFloat(s), f = fracOf(x);
      var whole = Math.floor(Math.abs(f[0] / f[1])), rem = Math.abs(f[0]) % f[1];
      var show = (f[0] < 0 ? '-' : '') + (whole ? whole + (rem ? ' 又 ' : '') : '') +
        (rem ? rem + '/' + f[1] : (whole ? '' : '0'));
      out = f[1] === 1 ? String(f[0]) : f[0] + '/' + f[1];
      html = KV([['输入小数', esc(s)], ['最简分数', '<b style="font-size:16px">' + esc(out) + '</b>'],
        ['带分数读法', esc(show)], ['近似误差', esc(f[2].toExponential(2))],
        ['分母上限', esc(maxD)]]) + HINT('采用分母枚举法寻找误差最小的有理数，循环小数会给出近似值。');
    } else {
      var p = parseFrac(s);
      if (p[1] === 0) throw new Error('分母不能为 0');
      var decimal = p[0] / p[1], g = gcdf(p[0], p[1]);
      var rn = p[0] / g, rd = p[1] / g;
      out = v.dir === 'reduce' ? (rd === 1 ? String(rn) : rn + '/' + rd) : String(num(decimal, 8));
      html = KV([['输入', esc(s)], [v.dir === 'reduce' ? '约分结果' : '小数值', '<b style="font-size:16px">' + esc(out) + '</b>'],
        ['分子 / 分母', esc(p[0] + ' / ' + p[1])], ['最大公约数', esc(g)],
        ['是否最简', esc(g === 1 ? '是' : '否')]]);
    }
    return R(html, out);
  }
});

T({ id: 'gpa', name: '学分绩点计算', cat: 'calc',
  desc: '按课程学分与分数计算加权 GPA / 均分', tags: '计算 gpa 绩点 学分 成绩 学生',
  fields: [
    { k: 'rows', label: '课程列表（每行：课程,学分,分数）', type: 'textarea', rows: 7,
      value: '高等数学,4,92\n大学英语,3,85\n程序设计,3,78\n体育,1,90' },
    { k: 'scale', label: '绩点算法', type: 'select', value: 'std', options: [
      ['std', '常用 4.0 制'], ['strict', '严格 4.0 制'], ['avg', '百分制加权均分'] ] }
  ],
  run: function (v) {
    var lines = String(v.rows || '').split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (!lines.length) throw new Error('请输入课程，每行格式：课程,学分,分数');
    var rows = [], sumCredit = 0, sumPoint = 0, sumScore = 0;
    lines.forEach(function (l, i) {
      var p = l.split(/[,，\t]/).map(function (x) { return x.trim(); });
      if (p.length < 3) throw new Error('第 ' + (i + 1) + ' 行格式不对，需：课程,学分,分数');
      var c = parseFloat(p[1]), s = parseFloat(p[2]);
      if (!isFinite(c) || c <= 0 || !isFinite(s) || s < 0 || s > 100) throw new Error('第 ' + (i + 1) + ' 行的学分或分数无效');
      var std = [[90, 4], [85, 3.7], [82, 3.3], [78, 3], [75, 2.7], [72, 2.3],
        [68, 2], [64, 1.5], [60, 1], [0, 0]];
      var strict = [[90, 4], [80, 3], [70, 2], [60, 1], [0, 0]];
      var tb = v.scale === 'strict' ? strict : std, gp = 0;
      for (var j = 0; j < tb.length; j++) if (s >= tb[j][0]) { gp = tb[j][1]; break; }
      rows.push([p[0], num(c, 2), num(s, 1), num(gp, 2), num(c * gp, 3), num(c * s, 2)]);
      sumCredit += c; sumPoint += c * gp; sumScore += c * s;
    });
    var gpa = sumCredit ? sumPoint / sumCredit : 0, avg = sumCredit ? sumScore / sumCredit : 0;
    var result = v.scale === 'avg' ? num(avg, 2) : num(gpa, 3);
    return R(KV([['课程数', esc(rows.length)], ['总学分', esc(num(sumCredit, 2))],
      [v.scale === 'avg' ? '加权均分' : '加权 GPA', '<b style="font-size:16px">' + esc(result) + '</b>'],
      ['折算百分制', esc(v.scale === 'avg' ? '—' : num(avg, 2))]]) +
      SEC('明细') + TB(['课程', '学分', '分数', '绩点', '学分×绩点', '学分×分数'], rows) +
      HINT('常用 4.0 制：90+→4.0，85+→3.7，82+→3.3，78+→3.0，60+→1.0；各校规则不同，以本校为准。'),
      'GPA ' + result + '\n' + rows.map(function (r) { return r.join('\t'); }).join('\n'));
  }
});

T({ id: 'discount', name: '折扣到手价计算', cat: 'calc',
  desc: '折扣、满减、组合优惠与第二件半价对比', tags: '计算 折扣 满减 优惠 到手价 购物',
  fields: [
    { k: 'price', label: '商品原价（¥）', type: 'number', value: 299 },
    { k: 'disc', label: '折扣（几折）', type: 'number', value: 8.5 },
    { k: 'full', label: '满减门槛（¥）', type: 'number', value: 300 },
    { k: 'cut', label: '满减金额（¥）', type: 'number', value: 50 },
    { k: 'mode', label: '优惠方式', type: 'select', value: 'both', options: [
      ['disc', '仅折扣'], ['full', '仅满减'], ['both', '先折扣再满减'], ['second', '第二件半价（按 2 件算）'] ] }
  ],
  run: function (v) {
    var p = Number(v.price), d = Number(v.disc), full = Number(v.full), cut = Number(v.cut);
    if (!isFinite(p) || p <= 0) throw new Error('请输入有效的商品原价');
    var pay = p, detail = '', saved = 0;
    if (v.mode === 'disc') {
      if (!(d > 0 && d <= 10)) throw new Error('折扣应在 0 ~ 10 之间，例如 8.5');
      pay = p * d / 10; detail = num(p) + ' × ' + num(d) + ' / 10';
    } else if (v.mode === 'full') {
      pay = p >= full ? p - cut : p; detail = p >= full ? '满 ' + num(full) + ' 减 ' + num(cut) : '未达门槛，无优惠';
    } else if (v.mode === 'both') {
      if (!(d > 0 && d <= 10)) throw new Error('折扣应在 0 ~ 10 之间');
      var after = p * d / 10;
      pay = after >= full ? after - cut : after;
      detail = num(p) + ' × ' + num(d) + '/10 = ' + num(after) + (after >= full ? '，再减 ' + num(cut) : '，未达满减门槛');
    } else {
      pay = p + p / 2; detail = '第 1 件 ' + num(p) + ' + 第 2 件 ' + num(p / 2) + '（两件合计）';
    }
    pay = Math.max(0, pay);
    var base = v.mode === 'second' ? p * 2 : p;
    saved = base - pay;
    var real = base ? pay / base * 10 : 10;
    return R(KV([['原价合计', '¥' + esc(num(base, 2))],
      ['到手价', '<b style="font-size:18px;color:var(--primary,#6F5C0F)">¥' + esc(num(pay, 2)) + '</b>'],
      ['共省下', '¥' + esc(num(saved, 2))],
      ['相当于', esc(num(real, 2)) + ' 折'],
      [v.mode === 'second' ? '单件均价' : '计算过程', esc(v.mode === 'second' ? '¥' + num(pay / 2, 2) : detail)]]) +
      HINT('默认按「先打折、后满减」计算；实际以平台优惠叠加顺序为准。'),
      '到手价 ¥' + num(pay, 2) + '，共省 ¥' + num(saved, 2) + '，相当于 ' + num(real, 2) + ' 折');
  }
});

T({ id: 'bmr', name: '基础代谢与热量', cat: 'calc',
  desc: 'Mifflin-St Jeor 公式估算 BMR、TDEE 与每日摄入', tags: '计算 bmr 基础代谢 热量 卡路里 健身 减脂',
  fields: [
    { k: 'sex', label: '性别', type: 'select', value: 'm', options: [['m', '男'], ['f', '女']] },
    { k: 'age', label: '年龄（岁）', type: 'number', value: 25 },
    { k: 'h', label: '身高（cm）', type: 'number', value: 170 },
    { k: 'w', label: '体重（kg）', type: 'number', value: 65 },
    { k: 'act', label: '活动强度', type: 'select', value: '1.375', options: [
      ['1.2', '久坐（几乎不运动）'], ['1.375', '轻度（每周 1~3 次）'],
      ['1.55', '中度（每周 3~5 次）'], ['1.725', '高强度（每周 6~7 次）'],
      ['1.9', '极高（体力工作 / 双练）'] ] }
  ],
  run: function (v) {
    var age = +v.age, h = +v.h, w = +v.w, k = +v.act;
    if (!(age > 0 && age < 120 && h > 50 && h < 260 && w > 10 && w < 400)) throw new Error('请填写合理的年龄、身高与体重');
    var bmr = 10 * w + 6.25 * h - 5 * age + (v.sex === 'm' ? 5 : -161);
    var tdee = bmr * k;
    var bmi = w / Math.pow(h / 100, 2);
    var rows = [
      ['维持体重', num(tdee, 0), '与当前消耗持平'],
      ['温和减脂（-300 kcal）', num(tdee - 300, 0), '约每月减 1.1 kg'],
      ['标准减脂（-500 kcal）', num(tdee - 500, 0), '约每月减 1.9 kg'],
      ['温和增肌（+200 kcal）', num(tdee + 200, 0), '配合力量训练'],
      ['积极增肌（+400 kcal）', num(tdee + 400, 0), '注意体脂变化']
    ];
    return R(KV([['基础代谢 BMR', '<b style="font-size:16px">' + esc(num(bmr, 0)) + ' kcal/天</b>'],
      ['每日总消耗 TDEE', esc(num(tdee, 0)) + ' kcal'],
      ['活动系数', esc(k)], ['BMI', esc(num(bmi, 1))],
      ['建议蛋白质', esc(num(w * 1.6, 0)) + ' ~ ' + esc(num(w * 2.0, 0)) + ' g/天']]) +
      SEC('不同目标下的每日摄入') + TB(['目标', 'kcal/天', '说明'], rows) +
      HINT('公式仅供参考，个体差异、疾病与用药请咨询医生或营养师；每日摄入不建议长期低于 BMR。'),
      'BMR ' + num(bmr, 0) + ' kcal，TDEE ' + num(tdee, 0) + ' kcal');
  }
});

T({ id: 'areacalc', name: '几何面积体积', cat: 'calc',
  desc: '矩形、圆、三角、梯形、球、柱、锥的面积与体积', tags: '计算 几何 面积 体积 圆 三角形 数学',
  fields: [
    { k: 'shape', label: '形状', type: 'select', value: 'circle', options: [
      ['rect', '矩形面积（长 a × 宽 b）'], ['circle', '圆面积（半径 r）'],
      ['tri', '三角形面积（底 a × 高 b）'], ['tri3', '三角形面积（三边 a b c）'],
      ['trap', '梯形面积（上底 a、下底 b、高 h）'], ['sphere', '球体积（半径 r）'],
      ['cylinder', '圆柱体积（半径 r、高 h）'], ['box', '长方体体积（a × b × h）'],
      ['cone', '圆锥体积（半径 r、高 h）'] ] },
    { k: 'a', label: 'a', type: 'number', value: 10 },
    { k: 'b', label: 'b', type: 'number', value: 6 },
    { k: 'c', label: 'c', type: 'number', value: 8 },
    { k: 'r', label: 'r', type: 'number', value: 5 },
    { k: 'h', label: 'h', type: 'number', value: 12 }
  ],
  run: function (v) {
    var a = +v.a, b = +v.b, c = +v.c, r = +v.r, h = +v.h, val, formula, unitName, extra = '';
    function need(x, name) { if (!isFinite(x) || x <= 0) throw new Error('请填写正数：' + name); }
    switch (v.shape) {
      case 'rect': need(a, 'a'); need(b, 'b'); val = a * b; formula = 'a × b = ' + num(a) + ' × ' + num(b); unitName = '面积'; break;
      case 'circle': need(r, 'r'); val = Math.PI * r * r; formula = 'π × r² = π × ' + num(r) + '²'; unitName = '面积';
        extra = '周长 = ' + num(2 * Math.PI * r); break;
      case 'tri': need(a, 'a'); need(b, 'b'); val = a * b / 2; formula = 'a × b ÷ 2 = ' + num(a) + ' × ' + num(b) + ' ÷ 2'; unitName = '面积'; break;
      case 'tri3': need(a, 'a'); need(b, 'b'); need(c, 'c');
        if (a + b <= c || a + c <= b || b + c <= a) throw new Error('三边无法构成三角形：任意两边之和必须大于第三边');
        var s = (a + b + c) / 2; val = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        formula = '海伦公式 √[s(s-a)(s-b)(s-c)]，s = ' + num(s); unitName = '面积';
        extra = '周长 = ' + num(a + b + c); break;
      case 'trap': need(a, 'a'); need(b, 'b'); need(h, 'h'); val = (a + b) * h / 2;
        formula = '(a + b) × h ÷ 2 = (' + num(a) + ' + ' + num(b) + ') × ' + num(h) + ' ÷ 2'; unitName = '面积'; break;
      case 'sphere': need(r, 'r'); val = 4 / 3 * Math.PI * r * r * r;
        formula = '4/3 × π × r³'; unitName = '体积'; extra = '表面积 = ' + num(4 * Math.PI * r * r); break;
      case 'cylinder': need(r, 'r'); need(h, 'h'); val = Math.PI * r * r * h;
        formula = 'π × r² × h'; unitName = '体积'; extra = '侧面积 = ' + num(2 * Math.PI * r * h); break;
      case 'box': need(a, 'a'); need(b, 'b'); need(h, 'h'); val = a * b * h;
        formula = 'a × b × h'; unitName = '体积'; extra = '表面积 = ' + num(2 * (a * b + a * h + b * h)); break;
      default: need(r, 'r'); need(h, 'h'); val = Math.PI * r * r * h / 3;
        formula = '1/3 × π × r² × h'; unitName = '体积';
    }
    return R(KV([[unitName, '<b style="font-size:18px">' + esc(num(val)) + '</b>'],
      ['计算公式', esc(formula)], ['附加结果', esc(extra || '—')]]) +
      HINT('结果单位是输入长度单位的平方（面积）或立方（体积）；π 取 Math.PI。'),
      unitName + ' = ' + num(val) + '（' + formula + '）');
  }
});

T({ id: 'timecalc', name: '时间加减与时长汇总', cat: 'calc',
  desc: '时间点加减时长，或汇总多个时长求和', tags: '计算 时间 加减 时长 求和 分钟',
  fields: [
    { k: 'mode', label: '模式', type: 'select', value: 'add', options: [
      ['add', '基准时间 ± 时长'], ['sum', '多个时长求和'] ] },
    { k: 'base', label: '基准时间（HH:MM）', type: 'text', value: '09:30' },
    { k: 'days', label: '天', type: 'number', value: 0 },
    { k: 'hours', label: '小时', type: 'number', value: 2 },
    { k: 'mins', label: '分钟', type: 'number', value: 45 },
    { k: 'dir', label: '方向', type: 'select', value: 'plus', options: [['plus', '加上'], ['minus', '减去']] },
    { k: 'list', label: '时长列表（每行 HH:MM 或分钟数，求和模式用）', type: 'textarea', rows: 5,
      value: '1:20\n0:45\n2:05\n35' }
  ],
  run: function (v) {
    function parseClock(s) {
      var m = String(s || '').trim().match(/^(\d{1,2}):(\d{1,2})$/);
      if (!m) throw new Error('时间格式应为 HH:MM，例如 09:30');
      var hh = +m[1], mm = +m[2];
      if (hh > 23 || mm > 59) throw new Error('小时需 0~23，分钟需 0~59');
      return hh * 60 + mm;
    }
    function clockOf(total) {
      var t = ((total % 1440) + 1440) % 1440;
      return pad2(Math.floor(t / 60)) + ':' + pad2(t % 60);
    }
    function durText(mins) {
      var d = Math.floor(mins / 1440), rest = mins - d * 1440;
      var hh = Math.floor(rest / 60), mm = rest % 60;
      return (d ? d + ' 天 ' : '') + hh + ' 小时 ' + mm + ' 分（共 ' + mins + ' 分钟）';
    }
    if (v.mode === 'sum') {
      var lines = String(v.list || '').split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
      if (!lines.length) throw new Error('请输入至少一个时长');
      var total = 0, rows = [];
      lines.forEach(function (l, i) {
        var mins = /:/.test(l) ? (/^\d{1,2}:\d{1,2}$/.test(l) ? parseClock(l) : NaN) : parseFloat(l);
        if (!isFinite(mins) || mins < 0) throw new Error('第 ' + (i + 1) + ' 行无法解析：' + l);
        total += mins; rows.push([i + 1, l, Math.round(mins), clockOf(mins)]);
      });
      return R(KV([['时长条数', esc(rows.length)], ['合计', '<b style="font-size:16px">' + esc(durText(Math.round(total))) + '</b>'],
        ['折合小时', esc(num(total / 60, 2)) + ' 小时']]) +
        SEC('明细') + TB(['#', '输入', '分钟', '折算'], rows),
        '合计 ' + durText(Math.round(total)));
    }
    var base = parseClock(v.base);
    var delta = (Number(v.days) || 0) * 1440 + (Number(v.hours) || 0) * 60 + (Number(v.mins) || 0);
    var sign = v.dir === 'minus' ? -1 : 1;
    var target = base + sign * delta;
    var dayShift = Math.floor(target / 1440);
    return R(KV([['基准时间', esc(v.base)],
      ['运算', esc((sign > 0 ? '+' : '-') + ' ' + durText(delta))],
      ['结果时间', '<b style="font-size:18px">' + esc(clockOf(target)) + '</b>'],
      ['跨天', esc(dayShift === 0 ? '当天' : (dayShift > 0 ? '+' + dayShift + ' 天（之后）' : dayShift + ' 天（之前）'))],
      ['总分钟', esc(target)]]),
      v.base + ' ' + (sign > 0 ? '+' : '-') + ' ' + durText(delta) + ' = ' + clockOf(target));
  }
});

T({ id: 'pacecalc', name: '跑步配速换算', cat: 'calc',
  desc: '距离、时间、配速互算与完赛时间预测', tags: '计算 跑步 配速 马拉松 速度 运动',
  fields: [
    { k: 'mode', label: '计算方式', type: 'select', value: 'pace', options: [
      ['pace', '距离 + 时间 → 配速'], ['time', '配速 + 距离 → 时间'], ['convert', '距离单位换算对照'] ] },
    { k: 'dist', label: '距离（公里）', type: 'number', value: 5 },
    { k: 'time', label: '用时（分:秒，如 25:30）', type: 'text', value: '25:30' },
    { k: 'pace', label: '配速（分:秒 / 公里，如 5:30）', type: 'text', value: '5:30' }
  ],
  run: function (v) {
    function parseMS(s, label) {
      var m = String(s || '').trim().match(/^(\d{1,3}):([0-5]?\d)$/);
      if (!m) throw new Error(label + '格式应为 分:秒，例如 25:30');
      return +m[1] * 60 + +m[2];
    }
    function ms(sec) {
      var t = Math.max(0, Math.round(sec));
      return Math.floor(t / 3600) > 0
        ? Math.floor(t / 3600) + ':' + pad2(Math.floor(t % 3600 / 60)) + ':' + pad2(t % 60)
        : Math.floor(t / 60) + ':' + pad2(t % 60);
    }
    function paceStr(secPerKm) {
      return Math.floor(secPerKm / 60) + ':' + pad2(Math.round(secPerKm % 60));
    }
    if (v.mode === 'convert') {
      var km = Number(v.dist) || 5;
      var rows = [[5, '5 公里'], [10, '10 公里'], [21.0975, '半程马拉松'], [42.195, '全程马拉松'],
        [1, '1 公里'], [1.609344, '1 英里']].map(function (p) {
        return [p[1], num(p[0], 4) + ' km', num(p[0] / 1.609344, 4) + ' mi'];
      });
      return R(KV([['当前输入', esc(num(km, 3)) + ' km'], ['换算英里', esc(num(km / 1.609344, 4)) + ' mi'],
        ['换算米', esc(num(km * 1000, 0)) + ' m']]) + SEC('常见距离对照') +
        TB(['项目', '公里', '英里'], rows) + HINT('1 英里 = 1.609344 公里；1 公里 ≈ 0.621371 英里。'),
        num(km, 3) + ' km = ' + num(km / 1.609344, 4) + ' mi');
    }
    var dist = Number(v.dist);
    if (!(dist > 0 && dist < 1000)) throw new Error('请输入 0 ~ 1000 之间的距离');
    if (v.mode === 'pace') {
      var sec = parseMS(v.time, '用时');
      if (sec <= 0) throw new Error('用时应大于 0');
      var p = sec / dist, mph = dist / (sec / 3600);
      var rows = [[5, '5 km'], [10, '10 km'], [21.0975, '半马'], [42.195, '全马']].map(function (x) {
        return [x[1], num(x[0], 4) + ' km', ms(p * x[0])];
      });
      return R(KV([['平均配速', '<b style="font-size:18px">' + esc(paceStr(p)) + ' /公里</b>'],
        ['英里配速', esc(paceStr(p * 1.609344)) + ' /英里'],
        ['平均速度', esc(num(mph, 2)) + ' km/h'],
        ['完成距离', esc(num(dist, 3)) + ' km']]) +
        SEC('按此配速的预计完赛时间') + TB(['项目', '距离', '预计用时'], rows),
        '配速 ' + paceStr(p) + '/km，速度 ' + num(mph, 2) + ' km/h');
    }
    var pp = parseMS(v.pace, '配速');
    if (pp <= 0) throw new Error('配速应大于 0');
    var total = pp * dist;
    return R(KV([['目标距离', esc(num(dist, 3)) + ' km'],
      ['设定配速', esc(paceStr(pp)) + ' /公里'],
      ['预计用时', '<b style="font-size:18px">' + esc(ms(total)) + '</b>'],
      ['平均速度', esc(num(3600 / pp, 2)) + ' km/h'],
      ['总秒数', esc(Math.round(total))]]) +
      HINT('配速按恒定速度估算，实际比赛需考虑补给、坡度与体力分配。'),
      num(dist, 3) + ' km @ ' + paceStr(pp) + '/km = ' + ms(total));
  }
});

T({ id: 'baby', name: '预产期与孕周', cat: 'calc',
  desc: '按末次月经推算预产期、当前孕周与孕期节点', tags: '计算 预产期 孕周 怀孕 末次月经 日期',
  fields: [
    { k: 'mode', label: '计算方式', type: 'select', value: 'lmp', options: [
      ['lmp', '按末次月经推算'], ['edd', '按预产期反推'] ] },
    { k: 'date', label: '日期（末次月经第 1 天 / 预产期）', type: 'date', value: (function () {
      var d = new Date(); d.setDate(d.getDate() - 60); return dateStr(d); })() },
    { k: 'cycle', label: '平均月经周期（天）', type: 'number', value: 28 }
  ],
  run: function (v) {
    var d = parseDate(v.date), cycle = Number(v.cycle) || 28;
    if (cycle < 20 || cycle > 45) throw new Error('周期一般填 20 ~ 45 天，默认 28');
    var adjust = cycle - 28, today = new Date(); today.setHours(0, 0, 0, 0);
    var lmp, edd, label1, label2;
    if (v.mode === 'lmp') {
      lmp = new Date(d.getTime()); edd = new Date(d.getTime());
      edd.setDate(edd.getDate() + 280 + adjust);
      label1 = '末次月经'; label2 = '预产期';
    } else {
      edd = new Date(d.getTime()); lmp = new Date(d.getTime());
      lmp.setDate(lmp.getDate() - 280 - adjust);
      label1 = '预产期'; label2 = '反推末次月经';
    }
    var conceive = new Date(lmp.getTime()); conceive.setDate(conceive.getDate() + 14 + adjust);
    var days = Math.round((today - lmp) / 86400000), weeks = Math.floor(days / 7), wd = days % 7;
    var left = Math.round((edd - today) / 86400000);
    var marks = [[12, '孕早期结束 / NT 检查窗口'], [20, '孕中期 · 大排畸'],
      [28, '进入孕晚期'], [37, '足月'], [40, '预产期']].map(function (m) {
      var x = new Date(lmp.getTime()); x.setDate(x.getDate() + m[0] * 7 + adjust);
      return [m[0] + ' 周', dateStr(x), m[1]];
    });
    return R(KV([[label1, esc(dateStr(d))],
      [label2, '<b style="font-size:16px">' + esc(dateStr(edd)) + '</b>'],
      ['预计受孕日', esc(dateStr(conceive))],
      ['周期调整', esc((adjust >= 0 ? '+' : '') + adjust + ' 天')],
      ['当前孕周', esc(days >= 0 ? weeks + ' 周 + ' + wd + ' 天' : '日期尚未到')],
      ['距预产期', esc(left >= 0 ? left + ' 天' : '已过 ' + (-left) + ' 天')]]) +
      SEC('孕期节点') + TB(['孕周', '日期', '说明'], marks) +
      HINT('按 Naegele 规则（末次月经 + 280 天）估算，仅为参考；实际以早期 B 超与产科医生核定为准。'),
      label1 + ' ' + dateStr(d) + '，' + label2 + ' ' + dateStr(edd));
  }
});

/* ============================================================
   四、生活工具（8）
   ============================================================ */

T({ id: 'packing', name: '出行行李清单', cat: 'life',
  desc: '按天数、同行人与天气自动生成打包清单', tags: '生活 行李 清单 旅行 出差 打包',
  fields: [
    { k: 'days', label: '出行天数', type: 'number', value: 3 },
    { k: 'who', label: '出行类型', type: 'select', value: 'adult', options: [
      ['adult', '成人日常 / 旅行'], ['baby', '带婴幼儿'], ['biz', '商务出差'], ['student', '住校 / 短期学习'] ] },
    { k: 'weather', label: '目的地天气', type: 'select', value: 'mild', options: [
      ['warm', '炎热'], ['mild', '温暖 / 凉爽'], ['cold', '寒冷'], ['rain', '多雨'] ] },
    { k: 'extra', label: '特殊场景', type: 'select', value: 'none', options: [
      ['none', '无'], ['sea', '海边'], ['mountain', '登山'], ['camp', '露营'] ] }
  ],
  run: function (v) {
    var days = Math.max(1, Math.min(60, Math.round(Number(v.days) || 3)));
    var items = [];
    function add(cat, name, qty) { items.push([cat, name, qty]); }
    add('证件 / 财务', '身份证 / 护照', '1'); add('证件 / 财务', '手机、钱包、银行卡', '1 套');
    add('证件 / 财务', '车票 / 机票 / 酒店订单', '电子 + 纸质备份');
    add('电子设备', '手机充电器 / 数据线', '1 套'); add('电子设备', '充电宝（≤100Wh）', '1');
    add('电子设备', '耳机', '1'); if (v.who === 'biz') { add('电子设备', '笔记本电脑 + 电源', '1 套'); add('电子设备', '转接头 / 扩展坞', '1'); }
    add('衣物', '上衣', days + ' 件'); add('衣物', '裤子 / 裙子', Math.ceil(days / 2) + ' 件');
    add('衣物', '内衣 / 袜子', (days + 1) + ' 套'); add('衣物', '睡衣', '1 套');
    if (v.weather === 'cold') { add('衣物', '厚外套 / 羽绒服', '1'); add('衣物', '围巾、手套、帽子', '1 套'); }
    if (v.weather === 'warm') { add('衣物', '短袖 / 防晒衣', '2 件'); add('衣物', '遮阳帽 / 墨镜', '1 套'); }
    if (v.weather === 'rain') { add('衣物', '雨伞 / 雨衣', '1'); add('衣物', '防水鞋套', '1'); }
    if (v.extra === 'sea') { add('场景装备', '泳衣 / 泳镜', '1 套'); add('场景装备', '防晒霜 SPF50+', '1'); add('场景装备', '防水手机袋', '1'); }
    if (v.extra === 'mountain') { add('场景装备', '登山鞋 / 登山杖', '1 套'); add('场景装备', '头灯 + 备用电池', '1'); add('场景装备', '保温水壶', '1'); }
    if (v.extra === 'camp') { add('场景装备', '帐篷 / 睡袋 / 防潮垫', '1 套'); add('场景装备', '营地灯 / 打火机', '1'); add('场景装备', '垃圾袋', '若干'); }
    add('洗漱 / 个护', '牙刷、牙膏、毛巾', '1 套'); add('洗漱 / 个护', '洗面奶 / 沐浴旅行装', '1 套');
    add('洗漱 / 个护', '剃须刀 / 化妆用品', '按需'); add('洗漱 / 个护', '纸巾 / 湿巾', '1 包');
    add('药品 / 健康', '常用药（感冒、肠胃、止痛）', '1 份'); add('药品 / 健康', '创可贴 / 碘伏棉签', '1 份');
    add('药品 / 健康', '个人处方药', '足量 + 处方');
    if (v.who === 'baby') {
      add('婴幼儿', '奶粉 / 辅食 / 奶瓶', days + ' 天量'); add('婴幼儿', '纸尿裤', days * 8 + ' 片');
      add('婴幼儿', '婴儿车 / 背带', '1'); add('婴幼儿', '换洗衣物', days * 2 + ' 套');
      add('婴幼儿', '体温计 / 儿童常用药', '1 套');
    }
    if (v.who === 'biz') { add('商务', '正装 / 衬衫', '1~2 套'); add('商务', '名片 / 会议资料', '1 份'); }
    if (v.who === 'student') { add('学习', '课本 / 笔记本 / 文具', '1 套'); add('学习', '台灯 / 插线板', '1'); }
    add('其它', '水杯', '1'); add('其它', '折叠购物袋', '1'); add('其它', '少量现金', '备用');
    return R(KV([['出行天数', esc(days) + ' 天'], ['清单条目', esc(items.length) + ' 项'],
      ['天气', esc({ warm: '炎热', mild: '温暖 / 凉爽', cold: '寒冷', rain: '多雨' }[v.weather])]]) +
      SEC('打包清单') + TB(['类别', '物品', '建议数量'], items) +
      HINT('出发前按清单逐项核对；液体单件不超过 100 ml 方可随身带上飞机。'),
      items.map(function (r) { return r[0] + ' · ' + r[1] + ' × ' + r[2]; }).join('\n'));
  }
});

T({ id: 'water', name: '每日饮水量计算', cat: 'life',
  desc: '按体重、运动与气温估算饮水量与分时安排', tags: '生活 喝水 饮水 健康 水量 提醒',
  fields: [
    { k: 'w', label: '体重（kg）', type: 'number', value: 60 },
    { k: 'act', label: '今日运动（分钟）', type: 'number', value: 30 },
    { k: 'weather', label: '气温情况', type: 'select', value: 'normal', options: [
      ['normal', '常温'], ['hot', '炎热 / 大量出汗'], ['cold', '寒冷'], ['dry', '空调房 / 干燥'] ] }
  ],
  run: function (v) {
    var w = +v.w, act = +v.act;
    if (!(w > 10 && w < 300)) throw new Error('请输入合理的体重（kg）');
    if (!isFinite(act) || act < 0 || act > 600) throw new Error('运动分钟数请填 0 ~ 600');
    var base = w * 33, extra = act * 12;
    var factor = { normal: 1, hot: 1.2, cold: 0.95, dry: 1.1 }[v.weather] || 1;
    var total = Math.round((base + extra) * factor / 50) * 50;
    var cups = Math.round(total / 250);
    var slots = [['07:00', '起床后', 0.12], ['09:00', '上午', 0.15], ['11:00', '午餐前', 0.12],
      ['13:30', '午后', 0.15], ['15:30', '下午', 0.15], ['17:30', '运动前后', 0.13],
      ['19:30', '晚餐后', 0.12], ['21:00', '睡前 2 小时', 0.06]];
    var rows = slots.map(function (s) {
      return [s[0], s[1], Math.round(total * s[2] / 10) * 10 + ' ml', Math.max(1, Math.round(total * s[2] / 250)) + ' 杯'];
    });
    return R(KV([['基础需要', esc(Math.round(base)) + ' ml（约 33 ml/kg）'],
      ['运动补充', '+' + esc(Math.round(extra)) + ' ml'],
      ['环境系数', esc(factor)],
      ['建议总量', '<b style="font-size:18px">' + esc(total) + ' ml（约 ' + esc(cups) + ' 杯 / 250ml）</b>']]) +
      SEC('分时饮水建议') + TB(['时间', '场景', '建议量', '折算'], rows) +
      HINT('包含食物中的水分；肾病、心衰等需限水人群请遵医嘱，口渴与尿液颜色也是重要参考。'),
      '每日建议饮水 ' + total + ' ml，约 ' + cups + ' 杯');
  }
});

T({ id: 'unitcook', name: '烹饪计量换算', cat: 'life',
  desc: '杯 / 勺 / 毫升 / 克 / 盎司互转，含食材密度', tags: '生活 烹饪 烘焙 计量 换算 克 毫升 杯',
  fields: [
    { k: 'amount', label: '数量', type: 'number', value: 1 },
    { k: 'from', label: '原单位', type: 'select', value: 'cup', options: [
      ['cup', '杯 (240 ml)'], ['tbsp', '汤匙 (15 ml)'], ['tsp', '茶匙 (5 ml)'],
      ['ml', '毫升 ml'], ['l', '升 L'], ['g', '克 g'], ['kg', '公斤 kg'],
      ['oz', '盎司 oz'], ['lb', '磅 lb'], ['jin', '斤 (500 g)'] ] },
    { k: 'to', label: '目标单位', type: 'select', value: 'g', options: [
      ['cup', '杯 (240 ml)'], ['tbsp', '汤匙 (15 ml)'], ['tsp', '茶匙 (5 ml)'],
      ['ml', '毫升 ml'], ['l', '升 L'], ['g', '克 g'], ['kg', '公斤 kg'],
      ['oz', '盎司 oz'], ['lb', '磅 lb'], ['jin', '斤 (500 g)'] ] },
    { k: 'item', label: '食材（体积 ↔ 重量时需要）', type: 'select', value: 'flour', options: [
      ['water', '水 / 清水'], ['milk', '牛奶'], ['flour', '中筋面粉'], ['sugar', '细砂糖'],
      ['butter', '黄油'], ['rice', '大米'], ['salt', '食盐'], ['oil', '食用油'], ['honey', '蜂蜜'] ] }
  ],
  run: function (v) {
    var a = Number(v.amount);
    if (!isFinite(a) || a < 0) throw new Error('请输入非负数量');
    var vol = { cup: 240, tbsp: 15, tsp: 5, ml: 1, l: 1000 };
    var mass = { g: 1, kg: 1000, oz: 28.3495, lb: 453.592, jin: 500 };
    var dens = { water: 1, milk: 1.03, flour: 0.53, sugar: 0.85, butter: 0.91,
      rice: 0.85, salt: 1.2, oil: 0.92, honey: 1.42 };
    var names = { water: '水', milk: '牛奶', flour: '中筋面粉', sugar: '细砂糖', butter: '黄油',
      rice: '大米', salt: '食盐', oil: '食用油', honey: '蜂蜜' };
    var rho = dens[v.item] || 1, isVolF = vol[v.from] != null, isVolT = vol[v.to] != null;
    var ml, g;
    if (isVolF) { ml = a * vol[v.from]; g = ml * rho; }
    else { g = a * mass[v.from]; ml = g / rho; }
    var out = isVolT ? ml / vol[v.to] : g / mass[v.to];
    var label = { cup: '杯', tbsp: '汤匙', tsp: '茶匙', ml: 'ml', l: 'L', g: 'g', kg: 'kg',
      oz: 'oz', lb: 'lb', jin: '斤' }[v.to];
    var quick = [['1 杯', '240 ml', '面粉约 127 g'], ['1 汤匙', '15 ml', '面粉约 8 g'],
      ['1 茶匙', '5 ml', '盐约 6 g'], ['1 盎司', '28.35 g', '约 28 g'],
      ['1 磅', '453.6 g', '约 0.91 斤'], ['1 斤', '500 g', '约 1.1 lb']];
    return R(KV([[num(a) + ' ' + esc({ cup: '杯', tbsp: '汤匙', tsp: '茶匙', ml: 'ml', l: 'L', g: 'g', kg: 'kg', oz: 'oz', lb: 'lb', jin: '斤' }[v.from]) + ' =', '<b style="font-size:18px">' + esc(num(out)) + ' ' + esc(label) + '</b>'],
      ['食材密度', esc(names[v.item]) + ' ' + esc(rho) + ' g/ml'],
      ['折合体积', esc(num(ml)) + ' ml'], ['折合重量', esc(num(g)) + ' g']]) +
      SEC('常用换算速查') + TB(['单位', '体积 / 重量', '备注'], quick) +
      HINT('面粉等粉类受压实程度影响较大，烘焙建议用电子秤按克称量。'),
      num(a) + ' → ' + num(out) + ' ' + label);
  }
});

T({ id: 'clothes', name: '服装鞋码对照', cat: 'life',
  desc: '中 / 国际 / 美 / 欧 / 日 / 英尺码与鞋码速查', tags: '生活 尺码 服装 鞋码 对照 海淘',
  fields: [
    { k: 'type', label: '类别', type: 'select', value: 'women', options: [
      ['women', '女装上衣'], ['men', '男装上衣'], ['pants', '裤装腰围'], ['shoes', '鞋码'] ] },
    { k: 'size', label: '已知尺码（可留空）', type: 'text', value: 'M', placeholder: '例如 M / 40 / 170' }
  ],
  run: function (v) {
    var sets = {
      women: {
        head: ['国际', '中国', '美国 US', '欧洲 EU', '英国 UK', '日本 JP'],
        rows: [['XS', '155/80A', '2', '34', '6', '5'], ['S', '160/84A', '4', '36', '8', '7'],
          ['M', '165/88A', '6', '38', '10', '9'], ['L', '170/92A', '8', '40', '12', '11'],
          ['XL', '175/96A', '10', '42', '14', '13'], ['XXL', '180/100A', '12', '44', '16', '15']]
      },
      men: {
        head: ['国际', '中国', '美国 US', '欧洲 EU', '英国 UK', '日本 JP'],
        rows: [['S', '165/88A', '34', '46', '34', 'S'], ['M', '170/92A', '36', '48', '36', 'M'],
          ['L', '175/96A', '38', '50', '38', 'L'], ['XL', '180/100A', '40', '52', '40', 'XL'],
          ['XXL', '185/104A', '42', '54', '42', 'XXL'], ['XXXL', '190/108A', '44', '56', '44', 'XXXL']]
      },
      pants: {
        head: ['腰围(英寸)', '中国号型', '腰围(cm)', '国际', '美国 US', '欧洲 EU'],
        rows: [['26', '160/66A', '66', 'XS', '2', '34'], ['27', '165/68A', '68', 'S', '4', '36'],
          ['28', '165/70A', '70', 'S', '6', '36'], ['29', '170/72A', '72', 'M', '8', '38'],
          ['30', '170/74A', '74', 'M', '10', '38'], ['31', '175/76A', '76', 'L', '12', '40'],
          ['32', '175/80A', '80', 'L', '14', '40'], ['34', '180/84A', '84', 'XL', '16', '42'],
          ['36', '185/90A', '90', 'XXL', '18', '44']]
      },
      shoes: {
        head: ['中国(脚长 mm)', '欧码 EU', '美码 US 男', '美码 US 女', '英码 UK', '脚长 cm'],
        rows: [['230', '36', '4', '5.5', '3.5', '23.0'], ['235', '37', '5', '6.5', '4.5', '23.5'],
          ['240', '38', '6', '7.5', '5.5', '24.0'], ['245', '39', '6.5', '8', '6', '24.5'],
          ['250', '40', '7.5', '9', '7', '25.0'], ['255', '41', '8.5', '10', '8', '25.5'],
          ['260', '42', '9', '10.5', '8.5', '26.0'], ['265', '43', '10', '11.5', '9.5', '26.5'],
          ['270', '44', '11', '12', '10.5', '27.0'], ['275', '45', '12', '13', '11', '27.5']]
      }
    };
    var s = sets[v.type] || sets.women, q = String(v.size || '').trim().toUpperCase();
    var matched = q ? s.rows.filter(function (r) {
      return r.some(function (c) { return String(c).toUpperCase().indexOf(q) >= 0; });
    }) : [];
    return R(KV([['对照类别', esc({ women: '女装上衣', men: '男装上衣', pants: '裤装腰围', shoes: '鞋码' }[v.type])],
      ['查询', esc(q || '（全部）')],
      ['匹配行数', esc(matched.length)]]) +
      (matched.length ? SEC('匹配结果') + TB(s.head, matched) : '') +
      SEC('完整对照表') + TB(s.head, s.rows) +
      HINT('不同品牌版型差异明显，海淘请优先对照胸围 / 腰围 / 脚长厘米数，并查看具体尺码表。'),
      q + ' 匹配 ' + matched.length + ' 行\n' + s.rows.map(function (r) { return r.join(' / '); }).join('\n'));
  }
});

T({ id: 'bill', name: '收支小计', cat: 'life',
  desc: '粘贴流水明细，自动汇总收入、支出与结余', tags: '生活 记账 收支 结余 账单 统计',
  fields: [
    { k: 'rows', label: '流水（每行：项目,金额[,+ 表示收入]）', type: 'textarea', rows: 8,
      value: '早餐,12\n地铁,4\n午餐,28\n水果,18\n工资,8000,+\n兼职,300,+\n房租,1800' }
  ],
  run: function (v) {
    var lines = String(v.rows || '').split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (!lines.length) throw new Error('请输入至少一条流水');
    var income = 0, expense = 0, rows = [], cats = {};
    lines.forEach(function (l, i) {
      var p = l.split(/[,，\t]/).map(function (x) { return x.trim(); });
      var amt = parseFloat(p[1]);
      if (!isFinite(amt) || amt < 0) throw new Error('第 ' + (i + 1) + ' 行金额无效');
      var isIn = (p[2] || '').indexOf('+') >= 0;
      if (isIn) income += amt; else expense += amt;
      var name = p[0] || ('第 ' + (i + 1) + ' 项');
      cats[name] = (cats[name] || 0) + (isIn ? -amt : amt);
      rows.push([i + 1, name, (isIn ? '+' : '-') + num(amt, 2), isIn ? '收入' : '支出']);
    });
    var top = Object.keys(cats).sort(function (a, b) { return cats[b] - cats[a]; }).slice(0, 5);
    return R(KV([['笔数', esc(rows.length)], ['收入合计', '¥' + esc(num(income, 2))],
      ['支出合计', '¥' + esc(num(expense, 2))],
      ['结余', '<b style="font-size:18px">¥' + esc(num(income - expense, 2)) + '</b>'],
      ['支出占收入', esc(income > 0 ? num(expense / income * 100, 1) + '%' : '—')]]) +
      SEC('支出 Top 5') + TB(['项目', '净支出'], top.map(function (k) { return [k, num(cats[k], 2)]; })) +
      SEC('全部流水') + TB(['#', '项目', '金额', '类型'], rows),
      '收入 ' + num(income, 2) + '，支出 ' + num(expense, 2) + '，结余 ' + num(income - expense, 2));
  }
});

T({ id: 'passwdcheck', name: '密码强度检测', cat: 'life',
  desc: '本地评估密码强度、给出评分与改进建议', tags: '生活 密码 强度 安全 检测 评分',
  fields: [{ k: 'pwd', label: '待检测密码', type: 'text', value: 'Ankong@2026' }],
  run: function (v) {
    var p = String(v.pwd || '');
    if (!p) throw new Error('请输入要检测的密码');
    var weak = ['123456', '123456789', '12345678', 'password', 'qwerty', 'abc123',
      '111111', '000000', 'iloveyou', 'admin', 'admin123', '666666', '888888', 'a123456'];
    var seq = ['1234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'abcdefghijklmnopqrstuvwxyz'];
    var checks = [
      ['长度 ≥ 8', p.length >= 8, 18], ['长度 ≥ 12', p.length >= 12, 12],
      ['含小写字母', /[a-z]/.test(p), 10], ['含大写字母', /[A-Z]/.test(p), 10],
      ['含数字', /\d/.test(p), 10], ['含特殊符号', /[^A-Za-z0-9]/.test(p), 14],
      ['无连续 3 位相同字符', !/(.)\1\2/.test(p), 8],
      ['不是常见弱密码', weak.indexOf(p.toLowerCase()) < 0, 12],
      ['不含键盘连续串', !seq.some(function (s) { return s.indexOf(p.toLowerCase().slice(0, 4)) >= 0 && p.length >= 4; }), 6]
    ];
    var score = checks.reduce(function (a, c) { return a + (c[1] ? c[2] : 0); }, 0);
    if (p.length < 6) score = Math.min(score, 20);
    var level = score >= 85 ? '极强' : score >= 70 ? '强' : score >= 45 ? '中等' : score >= 25 ? '偏弱' : '很弱';
    var charset = ( /[a-z]/.test(p) ? 26 : 0 ) + ( /[A-Z]/.test(p) ? 26 : 0 ) +
      ( /\d/.test(p) ? 10 : 0 ) + ( /[^A-Za-z0-9]/.test(p) ? 32 : 0 );
    var bits = charset ? p.length * Math.log(charset) / Math.LN2 : 0;
    var advice = [];
    if (p.length < 12) advice.push('建议长度至少 12 位');
    if (!/[A-Z]/.test(p) || !/[a-z]/.test(p)) advice.push('混合大小写字母');
    if (!/\d/.test(p)) advice.push('加入数字');
    if (!/[^A-Za-z0-9]/.test(p)) advice.push('加入符号（如 ! @ #）');
    if (weak.indexOf(p.toLowerCase()) >= 0) advice.push('这是常见弱密码，请立即更换');
    if (!advice.length) advice.push('结构良好；不同站点请使用不同密码');
    return R(KV([['长度', esc(p.length) + ' 字符'], ['字符空间', esc(charset || 0) + ' 种'],
      ['强度评分', '<b style="font-size:18px">' + esc(score) + ' / 100（' + esc(level) + '）</b>'],
      ['理论熵', esc(num(bits, 1)) + ' bit'],
      ['输入是否上传', '否 · 仅在本机计算']]) +
      SEC('检查项') + TB(['检查项', '结果', '权重'], checks.map(function (c) {
        return [c[0], c[1] ? '通过' : '未通过', c[2]];
      })) + SEC('改进建议') + TB(['#', '建议'], advice.map(function (x, i) { return [i + 1, x]; })),
      '评分 ' + score + '/100（' + level + '）\n' + advice.join('\n'));
  }
});

T({ id: 'periodic', name: '周期日期推算', cat: 'life',
  desc: '按天 / 周 / 月 / 年生成后续重复日期', tags: '生活 周期 日期 重复 提醒 排班',
  fields: [
    { k: 'start', label: '起始日期', type: 'date', value: dateStr(new Date()) },
    { k: 'every', label: '间隔', type: 'number', value: 7 },
    { k: 'unit', label: '单位', type: 'select', value: 'day', options: [
      ['day', '天'], ['week', '周'], ['month', '月'], ['year', '年'] ] },
    { k: 'count', label: '生成条数', type: 'number', value: 10 }
  ],
  run: function (v) {
    var start = parseDate(v.start), every = Math.round(Number(v.every) || 1);
    var count = Math.max(1, Math.min(120, Math.round(Number(v.count) || 10)));
    if (every < 1 || every > 1000) throw new Error('间隔请填 1 ~ 1000');
    var week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var rows = [];
    for (var i = 0; i < count; i++) {
      var d = new Date(start.getTime()), step = every * i;
      if (v.unit === 'day') d.setDate(d.getDate() + step);
      else if (v.unit === 'week') d.setDate(d.getDate() + step * 7);
      else if (v.unit === 'month') d.setMonth(d.getMonth() + step);
      else d.setFullYear(d.getFullYear() + step);
      var delta = Math.round((d - today) / 86400000);
      rows.push([i + 1, dateStr(d), week[d.getDay()],
        delta === 0 ? '今天' : delta > 0 ? delta + ' 天后' : (-delta) + ' 天前']);
    }
    return R(KV([['起始', esc(dateStr(start))],
      ['规则', esc('每 ' + every + ' ' + ({ day: '天', week: '周', month: '月', year: '年' }[v.unit]))],
      ['生成条数', esc(count)]]) + SEC('日期列表') + TB(['#', '日期', '星期', '距今'], rows) +
      HINT('按月推算时若起始日为 31 日，遇到小月会自动落到该月最后一天。'),
      rows.map(function (r) { return r[1] + ' ' + r[2]; }).join('\n'));
  }
});

T({ id: 'petage', name: '宠物年龄换算', cat: 'life',
  desc: '猫狗年龄换算为人类年龄与生命阶段对照', tags: '生活 宠物 猫 狗 年龄 换算',
  fields: [
    { k: 'years', label: '宠物年龄（岁）', type: 'number', value: 3 },
    { k: 'type', label: '宠物类型', type: 'select', value: 'dog_m', options: [
      ['dog_s', '小型犬（<10kg）'], ['dog_m', '中型犬（10~25kg）'],
      ['dog_l', '大型犬（>25kg）'], ['cat', '猫'] ] }
  ],
  run: function (v) {
    var y = Number(v.years);
    if (!isFinite(y) || y < 0 || y > 40) throw new Error('年龄请填 0 ~ 40 岁');
    var extra = { dog_s: 4, dog_m: 5, dog_l: 6, cat: 4 }[v.type] || 5;
    var human;
    if (y <= 1) human = y * 15;
    else if (y <= 2) human = 15 + (y - 1) * 9;
    else human = 24 + (y - 2) * extra;
    var stage = y < 1 ? '幼年期' : y <= 2 ? '青年期'
      : (v.type === 'cat' ? (y <= 10 ? '成年期' : '老年期')
        : (v.type === 'dog_l' ? (y <= 8 ? '成年期' : '老年期') : y <= 10 ? '成年期' : '老年期'));
    var rows = [];
    for (var i = 1; i <= Math.min(16, Math.max(8, Math.ceil(y) + 2)); i++) {
      var hv = i <= 1 ? 15 : i <= 2 ? 15 + (i - 1) * 9 : 24 + (i - 2) * extra;
      rows.push([i, num(hv, 0), i < 1 ? '幼年' : i <= 2 ? '青年' : i <= 10 ? '成年' : '老年']);
    }
    return R(KV([['宠物年龄', esc(num(y, 1)) + ' 岁'],
      ['换算人类年龄', '<b style="font-size:18px">约 ' + esc(num(human, 0)) + ' 岁</b>'],
      ['生命阶段', esc(stage)],
      ['后续每年折算', esc('+' + extra + ' 人类岁/年')]]) +
      SEC('年龄对照表') + TB(['宠物岁', '≈人类岁', '阶段'], rows) +
      HINT('采用 AVMA 常用简化模型（第 1 年≈15、第 2 年≈24，之后按体型每年 +4~6），不同品种差异较大。'),
      num(y, 1) + ' 岁 ≈ 人类 ' + num(human, 0) + ' 岁（' + stage + '）');
  }
});

/* ============================================================
   五、设备测评（4）
   ============================================================ */

T({ id: 'battery', name: '充电时间估算', cat: 'fun',
  desc: '按电池容量与充电功率估算充满所需时间', tags: '设备 充电 电池 功率 时间 快充',
  fields: [
    { k: 'cap', label: '电池容量（mAh）', type: 'number', value: 5000 },
    { k: 'volt', label: '标称电压（V）', type: 'number', value: 3.85 },
    { k: 'power', label: '充电功率（W）', type: 'number', value: 18 },
    { k: 'from', label: '起始电量（%）', type: 'number', value: 20 },
    { k: 'to', label: '目标电量（%）', type: 'number', value: 100 },
    { k: 'eff', label: '转换效率（%）', type: 'number', value: 85 }
  ],
  run: function (v) {
    var cap = +v.cap, volt = +v.volt, p = +v.power, f = +v.from, t = +v.to, eff = +v.eff;
    if (!(cap > 0 && volt > 0 && p > 0)) throw new Error('容量、电压与功率需为正数');
    if (!(f >= 0 && t <= 100 && t > f)) throw new Error('电量范围应为 0~100，且目标大于起始');
    if (!(eff > 0 && eff <= 100)) throw new Error('效率请填 1 ~ 100');
    var wh = cap * volt / 1000, need = wh * (t - f) / 100 / (eff / 100);
    var hours = need / p, mins = Math.round(hours * 60);
    var rows = [[5, '普通 5W'], [10, '10W'], [18, '18W 快充'], [30, '30W'], [45, '45W'],
      [65, '65W'], [120, '120W']].map(function (x) {
      return [x[1], num(x[0]) + ' W', num(need / x[0] * 60, 0) + ' 分钟', num(need / x[0] * 60 / 60, 2) + ' 小时'];
    });
    return R(KV([['电池能量', esc(num(wh, 2)) + ' Wh（' + esc(num(cap * volt / 1000 * 1000, 0)) + ' mWh）'],
      ['本次需补能', esc(num(need, 2)) + ' Wh'],
      ['预计耗时', '<b style="font-size:18px">' + esc(Math.floor(mins / 60)) + ' 小时 ' + esc(mins % 60) + ' 分</b>'],
      ['平均功率', esc(num(need / hours, 1)) + ' W']]) +
      SEC('不同功率下的耗时（同样从 ' + f + '% 到 ' + t + '%）') +
      TB(['档位', '功率', '耗时', '折合'], rows) +
      HINT('实际为涓流 + 恒流 + 恒压曲线，末段 80%→100% 会明显变慢；发热、边充边用也会拉长时间。'),
      (t - f) + '% 电量约需 ' + mins + ' 分钟 @ ' + p + 'W');
  }
});

T({ id: 'storage', name: '存储容量估算', cat: 'fun',
  desc: '按容量估算可存照片数与视频时长', tags: '设备 存储 容量 照片 视频 空间 GB',
  fields: [
    { k: 'cap', label: '总容量（GB）', type: 'number', value: 128 },
    { k: 'used', label: '已占用（%）', type: 'number', value: 35 },
    { k: 'photo', label: '单张照片（MB）', type: 'number', value: 4 },
    { k: 'video', label: '视频每分钟（MB）', type: 'number', value: 200 }
  ],
  run: function (v) {
    var cap = +v.cap, used = +v.used, ph = +v.photo, vid = +v.video;
    if (!(cap > 0 && ph > 0 && vid > 0)) throw new Error('容量与文件大小需为正数');
    if (!(used >= 0 && used < 100)) throw new Error('占用比例请填 0 ~ 99');
    var freeGB = cap * (1 - used / 100), freeMB = freeGB * 1024;
    var photos = Math.floor(freeMB / ph), mins = Math.floor(freeMB / vid);
    var rows = [[64, '64 GB'], [128, '128 GB'], [256, '256 GB'], [512, '512 GB'], [1024, '1 TB']]
      .map(function (x) {
        var mb = x[0] * (1 - used / 100) * 1024;
        return [x[1], num(mb / 1024, 1) + ' GB', Math.floor(mb / ph).toLocaleString(),
          Math.floor(mb / vid / 60) + ' 小时'];
      });
    return R(KV([['总容量', esc(num(cap)) + ' GB'], ['已占用', esc(num(used)) + '%'],
      ['可用空间', '<b style="font-size:18px">' + esc(num(freeGB, 1)) + ' GB（' + esc(num(freeMB, 0)) + ' MB）</b>'],
      ['可存照片', esc(photos.toLocaleString()) + ' 张（按 ' + esc(num(ph)) + ' MB/张）'],
      ['可录视频', esc(Math.floor(mins / 60)) + ' 小时 ' + esc(mins % 60) + ' 分（按 ' + esc(num(vid)) + ' MB/分）']]) +
      SEC('同占用比例下不同容量对照') + TB(['容量', '可用', '照片张数', '视频时长'], rows) +
      HINT('按 1 GB = 1024 MB 估算；厂商标称按 1000 进制，系统显示会略小，实际还受文件系统与缓存影响。'),
      '可用 ' + num(freeGB, 1) + ' GB，约 ' + photos + ' 张照片 / ' + mins + ' 分钟视频');
  }
});

T({ id: 'dpi', name: '屏幕 PPI 计算', cat: 'fun',
  desc: '由分辨率与尺寸计算 PPI、密度档与 dp 换算', tags: '设备 屏幕 ppi dpi 分辨率 像素密度 dp',
  fields: [
    { k: 'w', label: '横向像素', type: 'number', value: 1080 },
    { k: 'h', label: '纵向像素', type: 'number', value: 2400 },
    { k: 'inch', label: '屏幕对角线（英寸）', type: 'number', value: 6.5 }
  ],
  run: function (v) {
    var w = +v.w, h = +v.h, inch = +v.inch;
    if (!(w > 0 && h > 0 && inch > 0.5 && inch < 200)) throw new Error('请填写有效的分辨率与屏幕尺寸');
    var diag = Math.sqrt(w * w + h * h), ppi = diag / inch;
    var buckets = [[120, 'ldpi', 0.75], [160, 'mdpi', 1], [240, 'hdpi', 1.5],
      [320, 'xhdpi', 2], [480, 'xxhdpi', 3], [640, 'xxxhdpi', 4]];
    var b = buckets[0];
    buckets.forEach(function (x) { if (ppi >= x[0] * 0.75) b = x; });
    var ratio = w / h, physW = inch * w / diag, physH = inch * h / diag;
    var rows = buckets.map(function (x) {
      return [x[1], x[0] + ' dpi', '×' + x[2], num(ppi / x[0] * 160, 0) + ' dp'];
    });
    return R(KV([['对角线像素', esc(num(diag, 1)) + ' px'],
      ['像素密度', '<b style="font-size:18px">' + esc(num(ppi, 1)) + ' PPI</b>'],
      ['最接近密度档', esc(b[1] + '（' + b[0] + ' dpi，×' + b[2] + '）')],
      ['1 dp ≈', esc(num(ppi / 160, 2)) + ' px'], ['1 px ≈', esc(num(160 / ppi, 3)) + ' dp'],
      ['宽高比', esc(num(w / gcdf(w, h)) + ':' + num(h / gcdf(w, h)))],
      ['物理尺寸', esc(num(physW * 2.54, 1)) + ' × ' + esc(num(physH * 2.54, 1)) + ' cm']]) +
      SEC('Android 密度档对照') + TB(['档位', '基准', '缩放', '该屏 160dp 对应'], rows) +
      HINT('PPI 只反映像素密度，实际清晰度还与像素排列、子像素和观看距离有关。'),
      num(ppi, 1) + ' PPI @ ' + w + '×' + h + ' / ' + inch + ' 英寸');
  }
});

T({ id: 'netspeed', name: '网速与下载时间', cat: 'fun',
  desc: '按带宽估算文件下载耗时，厘清 MB 与 Mb', tags: '设备 网速 带宽 下载 时间 Mbps MB',
  fields: [
    { k: 'size', label: '文件大小', type: 'number', value: 2 },
    { k: 'unit', label: '单位', type: 'select', value: 'GB', options: [
      ['MB', 'MB（兆字节）'], ['GB', 'GB'], ['TB', 'TB'] ] },
    { k: 'mbps', label: '带宽（Mbps）', type: 'number', value: 100 },
    { k: 'rate', label: '实际可达比例（%）', type: 'number', value: 80 }
  ],
  run: function (v) {
    var size = +v.size, mbps = +v.mbps, rate = +v.rate;
    if (!(size > 0 && mbps > 0)) throw new Error('文件大小与带宽需为正数');
    if (!(rate > 0 && rate <= 100)) throw new Error('可达比例请填 1 ~ 100');
    var mult = { MB: 1, GB: 1024, TB: 1024 * 1024 }[v.unit] || 1;
    var totalMB = size * mult, totalMb = totalMB * 8;
    var ideal = totalMb / mbps, real = totalMb / (mbps * rate / 100);
    function fmt(sec) {
      if (sec < 60) return num(sec, 1) + ' 秒';
      if (sec < 3600) return num(sec / 60, 1) + ' 分钟';
      if (sec < 86400) return num(sec / 3600, 2) + ' 小时';
      return num(sec / 86400, 2) + ' 天';
    }
    var rows = [10, 20, 50, 100, 200, 500, 1000].map(function (m) {
      return [m + ' Mbps', num(m / 8, 1) + ' MB/s', fmt(totalMb / (m * rate / 100))];
    });
    return R(KV([['文件大小', esc(num(size)) + ' ' + esc(v.unit) + ' = ' + esc(num(totalMB, 0)) + ' MB'],
      ['带宽', esc(num(mbps)) + ' Mbps ≈ ' + esc(num(mbps / 8, 1)) + ' MB/s（理论）'],
      ['实际速率（' + esc(num(rate)) + '%）', esc(num(mbps * rate / 100 / 8, 2)) + ' MB/s'],
      ['理论最短', esc(fmt(ideal))],
      ['预计耗时', '<b style="font-size:18px">' + esc(fmt(real)) + '</b>']]) +
      SEC('不同带宽对照') + TB(['带宽', '理论峰值', '预计耗时'], rows) +
      HINT('1 Byte = 8 bit：100 Mbps 理论峰值只有 12.5 MB/s。实际还受服务器限速、Wi-Fi 与硬盘写入影响。'),
      num(totalMB, 0) + ' MB @ ' + mbps + ' Mbps ≈ ' + fmt(real));
  }
});

/* ============================================================
   六、查询速查（5）
   ============================================================ */

T({ id: 'countrycode', name: '国际区号与时区速查', cat: 'query',
  desc: '常用国家 / 地区电话区号、时区与 UTC 偏移', tags: '查询 区号 时区 国家 电话 速查',
  fields: [{ k: 'q', label: '关键词（可留空显示全部）', type: 'text', value: '日本', placeholder: '例如：日本 / +81 / 亚洲' }],
  run: function (v) {
    var data = [
      ['中国', '+86', 'Asia/Shanghai', 'UTC+8', '亚洲'], ['中国香港', '+852', 'Asia/Hong_Kong', 'UTC+8', '亚洲'],
      ['中国澳门', '+853', 'Asia/Macau', 'UTC+8', '亚洲'], ['中国台湾', '+886', 'Asia/Taipei', 'UTC+8', '亚洲'],
      ['日本', '+81', 'Asia/Tokyo', 'UTC+9', '亚洲'], ['韩国', '+82', 'Asia/Seoul', 'UTC+9', '亚洲'],
      ['新加坡', '+65', 'Asia/Singapore', 'UTC+8', '亚洲'], ['马来西亚', '+60', 'Asia/Kuala_Lumpur', 'UTC+8', '亚洲'],
      ['泰国', '+66', 'Asia/Bangkok', 'UTC+7', '亚洲'], ['越南', '+84', 'Asia/Ho_Chi_Minh', 'UTC+7', '亚洲'],
      ['印度尼西亚', '+62', 'Asia/Jakarta', 'UTC+7~+9', '亚洲'], ['菲律宾', '+63', 'Asia/Manila', 'UTC+8', '亚洲'],
      ['印度', '+91', 'Asia/Kolkata', 'UTC+5:30', '亚洲'], ['巴基斯坦', '+92', 'Asia/Karachi', 'UTC+5', '亚洲'],
      ['阿联酋', '+971', 'Asia/Dubai', 'UTC+4', '亚洲'], ['土耳其', '+90', 'Europe/Istanbul', 'UTC+3', '亚洲/欧洲'],
      ['俄罗斯', '+7', 'Europe/Moscow', 'UTC+3', '欧洲/亚洲'], ['英国', '+44', 'Europe/London', 'UTC+0/+1', '欧洲'],
      ['德国', '+49', 'Europe/Berlin', 'UTC+1/+2', '欧洲'], ['法国', '+33', 'Europe/Paris', 'UTC+1/+2', '欧洲'],
      ['意大利', '+39', 'Europe/Rome', 'UTC+1/+2', '欧洲'], ['西班牙', '+34', 'Europe/Madrid', 'UTC+1/+2', '欧洲'],
      ['荷兰', '+31', 'Europe/Amsterdam', 'UTC+1/+2', '欧洲'], ['瑞士', '+41', 'Europe/Zurich', 'UTC+1/+2', '欧洲'],
      ['瑞典', '+46', 'Europe/Stockholm', 'UTC+1/+2', '欧洲'], ['挪威', '+47', 'Europe/Oslo', 'UTC+1/+2', '欧洲'],
      ['波兰', '+48', 'Europe/Warsaw', 'UTC+1/+2', '欧洲'], ['美国', '+1', 'America/New_York', 'UTC-5~-8', '美洲'],
      ['加拿大', '+1', 'America/Toronto', 'UTC-5~-8', '美洲'], ['墨西哥', '+52', 'America/Mexico_City', 'UTC-6', '美洲'],
      ['巴西', '+55', 'America/Sao_Paulo', 'UTC-3', '美洲'], ['阿根廷', '+54', 'America/Argentina/Buenos_Aires', 'UTC-3', '美洲'],
      ['澳大利亚', '+61', 'Australia/Sydney', 'UTC+10/+11', '大洋洲'], ['新西兰', '+64', 'Pacific/Auckland', 'UTC+12/+13', '大洋洲'],
      ['南非', '+27', 'Africa/Johannesburg', 'UTC+2', '非洲'], ['埃及', '+20', 'Africa/Cairo', 'UTC+2/+3', '非洲'],
      ['尼日利亚', '+234', 'Africa/Lagos', 'UTC+1', '非洲'], ['肯尼亚', '+254', 'Africa/Nairobi', 'UTC+3', '非洲']
    ];
    var q = String(v.q || '').trim().toLowerCase();
    var rows = q ? data.filter(function (r) {
      return r.join(' ').toLowerCase().indexOf(q) >= 0;
    }) : data;
    return R(KV([['收录', esc(data.length) + ' 个国家 / 地区'], ['匹配', esc(rows.length) + ' 条'],
      ['查询词', esc(q || '（全部）')]]) +
      SEC('区号与时区') + (rows.length ? TB(['国家 / 地区', '区号', 'IANA 时区', 'UTC 偏移', '所属洲'], rows)
        : '<div class="hint">没有匹配的条目，试试国家名、区号或洲名</div>') +
      HINT('标注 +1/+2 等地实行夏令时；拨号时省略号码前的 0，并在区号前加国际前缀（内地为 00）。'),
      rows.map(function (r) { return r[0] + ' ' + r[1] + ' ' + r[3]; }).join('\n'));
  }
});

T({ id: 'keyboard', name: '快捷键速查表', cat: 'query',
  desc: 'Windows / macOS / ChromeOS / 安卓常用快捷键', tags: '查询 快捷键 键盘 windows mac chromeos 速查',
  fields: [
    { k: 'os', label: '平台', type: 'select', value: 'all', options: [
      ['all', '全部'], ['win', 'Windows'], ['mac', 'macOS'], ['chromeos', 'ChromeOS'],
      ['android', 'Android'], ['app', '安空工具箱'] ] },
    { k: 'q', label: '关键词（可留空）', type: 'text', value: '', placeholder: '例如：截图 / 复制 / 搜索' }
  ],
  run: function (v) {
    var data = [
      ['win', 'Ctrl + C / V / X', '复制 / 粘贴 / 剪切'], ['win', 'Ctrl + Z / Y', '撤销 / 重做'],
      ['win', 'Ctrl + A / S / F', '全选 / 保存 / 查找'], ['win', 'Alt + Tab', '切换窗口'],
      ['win', 'Win + D / L', '显示桌面 / 锁屏'], ['win', 'Win + Shift + S', '区域截图'],
      ['win', 'Ctrl + Shift + Esc', '直接打开任务管理器'], ['win', 'Win + V', '剪贴板历史'],
      ['win', 'F2 / F5', '重命名 / 刷新'], ['win', 'PrtSc', '全屏截图到剪贴板'],
      ['mac', 'Cmd + C / V / X', '复制 / 粘贴 / 剪切（剪切文件用 Cmd+Opt+V）'],
      ['mac', 'Cmd + Z / Shift + Cmd + Z', '撤销 / 重做'], ['mac', 'Cmd + Space', '聚焦搜索'],
      ['mac', 'Cmd + Tab', '切换应用'], ['mac', 'Cmd + Q / W', '退出应用 / 关闭窗口'],
      ['mac', 'Cmd + Shift + 3 / 4 / 5', '全屏 / 区域截图与录屏'], ['mac', 'Cmd + , ', '打开应用偏好设置'],
      ['mac', 'Cmd + Opt + Esc', '强制退出'], ['mac', 'Ctrl + Cmd + F', '进入 / 退出全屏'],
      ['chromeos', 'Search / Launcher 键', '打开启动器与应用搜索'], ['chromeos', 'Ctrl + Alt + T', '打开终端'],
      ['chromeos', 'Ctrl + Shift + 切换窗口键', '全屏截图（F5 位置的键）'],
      ['chromeos', 'Alt + Tab / Alt + [', '切换窗口 / 切换标签'],
      ['chromeos', 'Ctrl + L / T / W', '定位地址栏 / 新标签 / 关闭标签'],
      ['chromeos', 'Ctrl + Shift + Q → 连按两次', '退出登录'], ['chromeos', 'Alt + - / =', '窗口贴靠左 / 右'],
      ['android', '电源 + 音量下', '截图（多数机型）'], ['android', '长按电源', '电源菜单 / 语音助手'],
      ['android', '三指下滑', '部分机型三指截屏'], ['android', '双击电源键', '快速打开相机'],
      ['app', 'Ctrl / Cmd + K', '在安空工具箱里直接搜索工具'], ['app', 'Esc', '返回上一页'],
      ['app', '工具栏星标', '收藏工具，出现在首页快捷面板']
    ];
    var q = String(v.q || '').trim().toLowerCase();
    var rows = data.filter(function (r) {
      return (v.os === 'all' || r[0] === v.os) && (!q || r.join(' ').toLowerCase().indexOf(q) >= 0);
    });
    var names = { win: 'Windows', mac: 'macOS', chromeos: 'ChromeOS', android: 'Android', app: '本应用' };
    return R(KV([['收录', esc(data.length) + ' 条'], ['当前筛选', esc(v.os === 'all' ? '全部平台' : names[v.os])],
      ['匹配', esc(rows.length) + ' 条']]) +
      SEC('快捷键') + (rows.length ? TB(['平台', '按键', '功能'], rows.map(function (r) {
        return [names[r[0]], r[1], r[2]];
      })) : '<div class="hint">没有匹配项，换个关键词或平台试试</div>'),
      rows.map(function (r) { return '[' + names[r[0]] + '] ' + r[1] + ' — ' + r[2]; }).join('\n'));
  }
});

T({ id: 'constants', name: '常用常数速查', cat: 'query',
  desc: '数学、物理与单位换算常数表（离线）', tags: '查询 常数 物理 数学 单位 速查 公式',
  fields: [{ k: 'q', label: '关键词（可留空显示全部）', type: 'text', value: '', placeholder: '例如：光速 / π / 英寸' }],
  run: function (v) {
    var data = [
      ['数学', '圆周率 π', '3.141592653589793', '—'], ['数学', '自然常数 e', '2.718281828459045', '—'],
      ['数学', '黄金比例 φ', '1.618033988749895', '—'], ['数学', '√2', '1.4142135623730951', '—'],
      ['数学', '√3', '1.7320508075688772', '—'], ['数学', 'ln 2 / ln 10', '0.693147 / 2.302585', '—'],
      ['物理', '真空光速 c', '299792458', 'm/s'], ['物理', '万有引力常数 G', '6.67430×10⁻¹¹', 'N·m²/kg²'],
      ['物理', '普朗克常数 h', '6.62607015×10⁻³⁴', 'J·s'], ['物理', '阿伏伽德罗常数', '6.02214076×10²³', 'mol⁻¹'],
      ['物理', '玻尔兹曼常数 k', '1.380649×10⁻²³', 'J/K'], ['物理', '基本电荷 e', '1.602176634×10⁻¹⁹', 'C'],
      ['物理', '电子静止质量', '9.1093837×10⁻³¹', 'kg'], ['物理', '质子静止质量', '1.6726219×10⁻²⁷', 'kg'],
      ['物理', '标准重力加速度 g', '9.80665', 'm/s²'], ['物理', '标准大气压', '101325', 'Pa'],
      ['物理', '空气中声速（20℃）', '343', 'm/s'], ['物理', '水的密度（4℃）', '1000', 'kg/m³'],
      ['物理', '绝对零度', '-273.15', '℃ / 0 K'], ['天文', '天文单位 AU', '1.495978707×10¹¹', 'm'],
      ['天文', '光年', '9.4607×10¹⁵', 'm'], ['天文', '地球平均半径', '6371', 'km'],
      ['天文', '太阳质量', '1.989×10³⁰', 'kg'], ['单位', '1 英寸', '2.54', 'cm'],
      ['单位', '1 英里', '1.609344', 'km'], ['单位', '1 磅', '0.45359237', 'kg'],
      ['单位', '1 盎司', '28.3495', 'g'], ['单位', '1 卡路里', '4.184', 'J'],
      ['单位', '1 度电', '3.6×10⁶', 'J / 1 kWh'], ['单位', '1 标准大气压', '760', 'mmHg'],
      ['信息', '1 Byte', '8', 'bit'], ['信息', '1 KiB / MiB / GiB', '1024 / 1048576 / 1073741824', 'Byte'],
      ['信息', 'IPv4 地址总数', '4294967296', '2³²'], ['信息', 'URL 默认端口', '80 / 443', 'HTTP / HTTPS']
    ];
    var q = String(v.q || '').trim().toLowerCase();
    var rows = q ? data.filter(function (r) { return r.join(' ').toLowerCase().indexOf(q) >= 0; }) : data;
    return R(KV([['收录', esc(data.length) + ' 条常数'], ['匹配', esc(rows.length) + ' 条']]) +
      SEC('常数表') + (rows.length ? TB(['类别', '名称', '数值', '单位 / 说明'], rows)
        : '<div class="hint">没有匹配项</div>') +
      HINT('数值取自国际单位制定义与 CODATA 常用值，工程计算请按所需精度查证原始标准。'),
      rows.map(function (r) { return r[1] + ' = ' + r[2] + ' ' + r[3]; }).join('\n'));
  }
});

T({ id: 'solarterm', name: '二十四节气查询', cat: 'query',
  desc: '按年份推算二十四节气日期与当前节气', tags: '查询 节气 二十四节气 农历 日历 日期',
  fields: [{ k: 'year', label: '年份（2001 ~ 2099）', type: 'number', value: String(new Date().getFullYear()) }],
  run: function (v) {
    var y = Math.round(Number(v.year));
    if (!(y >= 2001 && y <= 2099)) throw new Error('本近似公式适用于 2001 ~ 2099 年');
    var terms = [
      ['小寒', 1, 5.4055], ['大寒', 1, 20.12], ['立春', 2, 3.87], ['雨水', 2, 18.73],
      ['惊蛰', 3, 5.63], ['春分', 3, 20.646], ['清明', 4, 4.81], ['谷雨', 4, 20.1],
      ['立夏', 5, 5.52], ['小满', 5, 20.13], ['芒种', 6, 5.678], ['夏至', 6, 21.09],
      ['小暑', 7, 6.11], ['大暑', 7, 22.83], ['立秋', 8, 7.5], ['处暑', 8, 22.92],
      ['白露', 9, 7.646], ['秋分', 9, 22.82], ['寒露', 10, 8.318], ['霜降', 10, 23.89],
      ['立冬', 11, 7.438], ['小雪', 11, 22.36], ['大雪', 12, 7.18], ['冬至', 12, 21.94]
    ];
    var Y = y % 100, L = Math.floor((Y - 1) / 4);
    var week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var rows = [], list = [];
    terms.forEach(function (t) {
      var day = Math.floor(Y * 0.2422 + t[2]) - L;
      var d = new Date(y, t[1] - 1, day);
      var delta = Math.round((d - today) / 86400000);
      rows.push([t[0], dateStr(d), week[d.getDay()],
        delta === 0 ? '今天' : delta > 0 ? delta + ' 天后' : (-delta) + ' 天前']);
      list.push({ name: t[0], d: d });
    });
    var current = list[0], next = null;
    for (var i = 0; i < list.length; i++) {
      if (list[i].d <= today) current = list[i];
      else { next = list[i]; break; }
    }
    return R(KV([['查询年份', esc(y) + ' 年'], ['当前节气', '<b>' + esc(current.name) + '</b>（' + esc(dateStr(current.d)) + '）'],
      ['下一个节气', esc(next ? next.name + ' · ' + dateStr(next.d) : '本年已过完，见次年')],
      ['节气总数', '24']]) + SEC(y + ' 年二十四节气') + TB(['节气', '日期', '星期', '距今'], rows) +
      HINT('采用 21 世纪通用近似公式「日 = ⌊Y×0.2422 + C⌋ − L」，个别年份可能与官方历法相差 1 天，精确时刻以天文台发布为准。'),
      rows.map(function (r) { return r[0] + ' ' + r[1]; }).join('\n'));
  }
});

T({ id: 'timezone', name: '世界时区换算', cat: 'query',
  desc: '同一时刻在主要城市的本地时间与 UTC 偏移', tags: '查询 时区 时差 世界时间 UTC 换算',
  fields: [
    { k: 'dt', label: '基准时间（YYYY-MM-DD HH:MM）', type: 'text', value: '2026-11-14 12:00' },
    { k: 'from', label: '基准时间所在城市', type: 'select', value: 'Asia/Shanghai', options: [
      ['Asia/Shanghai', '北京 / 上海'], ['Asia/Tokyo', '东京'], ['Asia/Seoul', '首尔'],
      ['Europe/London', '伦敦'], ['Europe/Paris', '巴黎'], ['America/New_York', '纽约'],
      ['America/Los_Angeles', '洛杉矶'], ['Australia/Sydney', '悉尼'], ['UTC', 'UTC'] ] }
  ],
  run: function (v) {
    var m = String(v.dt || '').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})$/);
    if (!m) throw new Error('时间格式应为 YYYY-MM-DD HH:MM');
    var local = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], 0);
    if (isNaN(local.getTime())) throw new Error('时间无效');
    var cities = [
      ['北京 / 上海', 'Asia/Shanghai'], ['东京', 'Asia/Tokyo'], ['首尔', 'Asia/Seoul'],
      ['新加坡', 'Asia/Singapore'], ['迪拜', 'Asia/Dubai'], ['莫斯科', 'Europe/Moscow'],
      ['伦敦', 'Europe/London'], ['巴黎', 'Europe/Paris'], ['柏林', 'Europe/Berlin'],
      ['纽约', 'America/New_York'], ['芝加哥', 'America/Chicago'], ['洛杉矶', 'America/Los_Angeles'],
      ['悉尼', 'Australia/Sydney'], ['奥克兰', 'Pacific/Auckland'], ['UTC', 'UTC']
    ];
    function offsetMinutes(date, tz) {
      var f;
      try {
        f = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit',
          day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      } catch (e) { return null; }
      var o = {};
      f.formatToParts(date).forEach(function (p) { o[p.type] = p.value; });
      var asUTC = Date.UTC(+o.year, +o.month - 1, +o.day, (+o.hour % 24), +o.minute, +o.second);
      return (asUTC - Math.floor(date.getTime() / 1000) * 1000) / 60000;
    }
    function fmtAt(epoch, tz) {
      try {
        return new Intl.DateTimeFormat('zh-CN', { timeZone: tz, year: 'numeric', month: '2-digit',
          day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short', hour12: false }).format(new Date(epoch));
      } catch (e) { return '不支持'; }
    }
    function offText(min) {
      if (min == null) return '—';
      var s = min < 0 ? '-' : '+', a = Math.abs(min);
      return 'UTC' + s + Math.floor(a / 60) + (a % 60 ? ':' + pad2(a % 60) : '');
    }
    var probe = Date.UTC(local.getFullYear(), local.getMonth(), local.getDate(), local.getHours(), local.getMinutes());
    var fromOff = offsetMinutes(new Date(probe), v.from);
    if (fromOff == null) throw new Error('当前环境不支持该时区：' + v.from);
    var epoch = probe - fromOff * 60000;
    var week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    var rows = cities.map(function (c) {
      var off = offsetMinutes(new Date(epoch), c[1]);
      var d = new Date(epoch + (off || 0) * 60000);
      var wall = fmtAt(epoch, c[1]);
      return [c[0], c[1], offText(off), wall,
        off == null ? '—' : num((off - fromOff) / 60, 1) + ' 小时'];
    });
    return R(KV([['基准时间', esc(v.dt) + '（' + esc(offText(fromOff)) + '）'],
      ['对应 UTC 时刻', esc(fmtAt(epoch, 'UTC'))],
      ['星期', esc(week[new Date(epoch).getUTCDay()])]]) +
      SEC('各城市同一时刻的本地时间') + TB(['城市', 'IANA 时区', '偏移', '当地时间', '与基准时差'], rows) +
      HINT('夏令时由系统时区库自动处理；本表按同一瞬间换算，不是把墙上时间直接搬过去。'),
      rows.map(function (r) { return r[0] + ' ' + r[3] + ' ' + r[2]; }).join('\n'));
  }
});

/* ============================================================
   七、小游戏（3）
   ============================================================ */

T({ id: 'guessnum', name: '猜数字', cat: 'game',
  desc: '1 ~ 100 猜数字，记录次数与历史', tags: '游戏 猜数字 随机数 益智',
  fields: [
    { k: 'guess', label: '你的猜测（1 ~ 100）', type: 'number', value: 50 },
    { k: 'cmd', label: '操作', type: 'select', value: 'go', options: [
      ['go', '猜一次'], ['reset', '重新开始一局'] ] }
  ],
  run: function (v) {
    window.AK_GAMES = window.AK_GAMES || {};
    if (v.cmd === 'reset' || !window.AK_GAMES.guess) {
      window.AK_GAMES.guess = { n: 1 + Math.floor(Math.random() * 100), tries: 0, hist: [] };
      if (v.cmd === 'reset') {
        return R(KV([['新的一局', '已生成 1 ~ 100 之间的随机数'], ['提示', '输入数字后点「运行 / 计算」']]) +
          HINT('系统会提示「大了」或「小了」，直到猜中为止。'), '新的一局开始，范围是 1 ~ 100');
      }
    }
    var g = window.AK_GAMES.guess, n = Math.round(Number(v.guess));
    if (!isFinite(n) || n < 1 || n > 100) throw new Error('请输入 1 ~ 100 之间的整数');
    g.tries++; g.hist.push(n);
    var tip = n === g.n ? '猜中了！' : n > g.n ? '大了 ↓' : '小了 ↑';
    var done = n === g.n;
    var html = KV([['你的猜测', esc(n)], ['判定', '<b style="font-size:18px">' + esc(tip) + '</b>'],
      ['已猜次数', esc(g.tries)], ['范围提示', esc(done ? '本局结束' :
        (n > g.n ? '答案在 1 ~ ' + (n - 1) : (n + 1) + ' ~ 100'))]]) +
      SEC('猜测历史') + TB(['#', '猜测', '结果'], g.hist.map(function (x, i) {
        return [i + 1, x, x === g.n ? '猜中' : x > g.n ? '大了' : '小了'];
      })) + HINT(done ? '选择「重新开始一局」再来一次。' : '继续输入数字，或选择「重新开始一局」。');
    if (done) window.AK_GAMES.guess = null;
    return R(html, tip + '（第 ' + g.tries + ' 次）');
  }
});

T({ id: 'rps', name: '石头剪刀布', cat: 'game',
  desc: '和电脑猜拳，自动累计胜 / 负 / 平战绩', tags: '游戏 猜拳 石头剪刀布 随机 对战',
  fields: [
    { k: 'hand', label: '你出', type: 'select', value: 'rock', options: [
      ['rock', '石头'], ['scissors', '剪刀'], ['paper', '布'] ] },
    { k: 'cmd', label: '操作', type: 'select', value: 'go', options: [
      ['go', '出拳'], ['reset', '清空战绩'] ] }
  ],
  run: function (v) {
    window.AK_GAMES = window.AK_GAMES || {};
    if (!window.AK_GAMES.rps || v.cmd === 'reset') window.AK_GAMES.rps = { w: 0, l: 0, d: 0 };
    var s = window.AK_GAMES.rps;
    if (v.cmd === 'reset') return R(KV([['战绩', '已清空']]), '战绩已清空');
    var names = { rock: '石头', scissors: '剪刀', paper: '布' };
    var keys = ['rock', 'scissors', 'paper'], cpu = keys[Math.floor(Math.random() * 3)];
    var me = v.hand, result;
    if (me === cpu) { result = '平局'; s.d++; }
    else if ((me === 'rock' && cpu === 'scissors') || (me === 'scissors' && cpu === 'paper') ||
             (me === 'paper' && cpu === 'rock')) { result = '你赢了'; s.w++; }
    else { result = '电脑赢了'; s.l++; }
    var total = s.w + s.l + s.d;
    return R(KV([['你出', esc(names[me])], ['电脑出', esc(names[cpu])],
      ['结果', '<b style="font-size:18px">' + esc(result) + '</b>'],
      ['战绩', esc(s.w + ' 胜 / ' + s.l + ' 负 / ' + s.d + ' 平')],
      ['胜率', esc(total ? num(s.w / total * 100, 1) + '%' : '—')]]) +
      HINT('规则：石头胜剪刀、剪刀胜布、布胜石头；电脑完全随机出拳。'),
      names[me] + ' vs ' + names[cpu] + ' → ' + result);
  }
});

T({ id: 'mentalmath', name: '心算挑战', cat: 'game',
  desc: '随机出题的心算练习，自动判分与统计正确率', tags: '游戏 心算 口算 数学 练习 答题',
  fields: [
    { k: 'answer', label: '你的答案', type: 'number', value: 0 },
    { k: 'cmd', label: '操作', type: 'select', value: 'submit', options: [
      ['submit', '提交答案'], ['new', '换一道题'], ['reset', '重置统计'] ] }
  ],
  run: function (v) {
    window.AK_GAMES = window.AK_GAMES || {};
    function makeQ() {
      var a = 2 + Math.floor(Math.random() * 49), b = 2 + Math.floor(Math.random() * 49);
      var op = ['+', '-', '×'][Math.floor(Math.random() * 3)], ans;
      if (op === '+') ans = a + b;
      else if (op === '-') { if (b > a) { var t = a; a = b; b = t; } ans = a - b; }
      else { a = 2 + Math.floor(Math.random() * 12); b = 2 + Math.floor(Math.random() * 12); ans = a * b; }
      return { a: a, b: b, op: op, ans: ans };
    }
    var st = window.AK_GAMES.mental;
    if (!st || v.cmd === 'reset') {
      st = window.AK_GAMES.mental = { right: 0, total: 0, q: makeQ() };
      if (v.cmd === 'reset') return R(KV([['统计', '已重置']]) + SEC('新题目') +
        '<div class="kv"><span>请计算</span><span><b style="font-size:20px">' +
        esc(st.q.a + ' ' + st.q.op + ' ' + st.q.b + ' = ?') + '</b></span></div>',
        '统计已重置');
    }
    var last = '';
    if (v.cmd === 'submit') {
      var a = Number(v.answer);
      if (!isFinite(a)) throw new Error('请输入数字答案');
      st.total++;
      var ok = Math.round(a) === st.q.ans;
      if (ok) st.right++;
      last = ok ? '答对了' : '答错了，正确答案是 ' + st.q.ans;
      st.q = makeQ();
    } else if (v.cmd === 'new') { last = '已跳过，换新题'; st.q = makeQ(); }
    return R(KV([['上一题判定', esc(last || '—')],
      ['累计', esc(st.right + ' / ' + st.total + ' 题正确')],
      ['正确率', '<b style="font-size:16px">' + esc(st.total ? num(st.right / st.total * 100, 1) + '%' : '—') + '</b>']]) +
      SEC('当前题目') + '<div class="kv"><span>请计算</span><span><b style="font-size:22px">' +
      esc(st.q.a + ' ' + st.q.op + ' ' + st.q.b + ' = ?') + '</b></span></div>' +
      HINT('在上方输入答案后点「运行 / 计算」；加减乘均为整数，不用列竖式也能算。'),
      (last ? last + '\n' : '') + '当前题目：' + st.q.a + ' ' + st.q.op + ' ' + st.q.b + ' = ?');
  }
});

/* ============================================================
   八、媒体工具（2）
   ============================================================ */

T({ id: 'gradient', name: 'CSS 渐变生成器', cat: 'image',
  desc: '配色生成线性 / 径向渐变并直接复制 CSS', tags: '媒体 css 渐变 配色 颜色 gradient 设计',
  fields: [
    { k: 'c1', label: '起始颜色', type: 'color', value: '#FAE185' },
    { k: 'c2', label: '结束颜色', type: 'color', value: '#C7ECCB' },
    { k: 'angle', label: '角度（度）', type: 'range', min: 0, max: 360, step: 5, value: 135 },
    { k: 'type', label: '渐变类型', type: 'select', value: 'linear', options: [
      ['linear', '线性渐变'], ['radial', '径向渐变'], ['repeat', '重复线性条纹'] ] }
  ],
  run: function (v) {
    var c1 = String(v.c1 || '#FAE185'), c2 = String(v.c2 || '#C7ECCB');
    var a = Math.round(Number(v.angle) || 0), css;
    if (v.type === 'radial') css = 'radial-gradient(circle at 30% 30%, ' + c1 + ' 0%, ' + c2 + ' 100%)';
    else if (v.type === 'repeat') css = 'repeating-linear-gradient(' + a + 'deg, ' + c1 + ' 0px, ' + c1 + ' 20px, ' + c2 + ' 20px, ' + c2 + ' 40px)';
    else css = 'linear-gradient(' + a + 'deg, ' + c1 + ' 0%, ' + c2 + ' 100%)';
    var preview = '<div style="height:120px;border-radius:16px;margin-bottom:12px;background:' + esc(css) +
      ';box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)"></div>';
    var snippet = 'background: ' + css + ';';
    return R(preview + KV([['类型', esc({ linear: '线性渐变', radial: '径向渐变', repeat: '重复条纹' }[v.type])],
      ['角度', esc(a) + '°'], ['色值', esc(c1 + ' → ' + c2)]]) +
      SEC('CSS 代码') + PRE(snippet) +
      HINT('点击结果区「复制」即可粘贴到样式表；网页版与安卓客户端都可直接预览。'), snippet);
  }
});

T({ id: 'aspectratio', name: '宽高比与分辨率计算', cat: 'image',
  desc: '化简比例、按比例缩放尺寸与常见比例对照', tags: '媒体 宽高比 分辨率 缩放 比例 尺寸',
  fields: [
    { k: 'mode', label: '计算方式', type: 'select', value: 'ratio', options: [
      ['ratio', '化简宽高比'], ['byw', '按目标宽度求高度'], ['byh', '按目标高度求宽度'],
      ['preset', '按预设比例求尺寸'], ['table', '常见比例对照表'] ] },
    { k: 'w', label: '宽度（px）', type: 'number', value: 1920 },
    { k: 'h', label: '高度（px）', type: 'number', value: 1080 },
    { k: 'target', label: '目标宽度 / 高度（px）', type: 'number', value: 1280 },
    { k: 'preset', label: '预设比例', type: 'select', value: '16:9', options: [
      ['16:9', '16:9（视频 / 显示器）'], ['4:3', '4:3（老式屏幕）'], ['1:1', '1:1（方形）'],
      ['3:2', '3:2（相机）'], ['9:16', '9:16（竖屏短视频）'], ['21:9', '21:9（超宽屏）'],
      ['2:3', '2:3（竖版照片）'] ] }
  ],
  run: function (v) {
    var w = +v.w, h = +v.h, target = +v.target;
    if (v.mode === 'table') {
      var presets = [['16:9', 16 / 9], ['4:3', 4 / 3], ['1:1', 1], ['3:2', 1.5],
        ['9:16', 9 / 16], ['21:9', 21 / 9], ['2:3', 2 / 3]];
      var rows = presets.map(function (p) {
        return [p[0], num(p[1], 4), Math.round(1280 / p[1]), Math.round(1920 / p[1]), Math.round(2560 / p[1])];
      });
      return R(KV([['说明', '按固定宽度推算对应高度']]) + SEC('常见比例对照') +
        TB(['比例', '宽/高', '宽 1280 → 高', '宽 1920 → 高', '宽 2560 → 高'], rows) +
        HINT('短视频竖屏用 9:16，幻灯片与显示器常用 16:9，印刷照片常见 3:2 / 4:3。'),
        rows.map(function (r) { return r[0] + ' → 1280×' + r[2]; }).join('\n'));
    }
    if (!(w > 0 && h > 0)) throw new Error('宽和高需为正数');
    if (v.mode === 'ratio') {
      var g = gcdf(w, h), rw = w / g, rh = h / g;
      var near = [[16, 9], [4, 3], [1, 1], [3, 2], [9, 16], [21, 9], [2, 3]]
        .map(function (p) { return [p[0] + ':' + p[1], Math.abs(w / h - p[0] / p[1])]; })
        .sort(function (a, b) { return a[1] - b[1]; })[0];
      return R(KV([['原始尺寸', esc(w + ' × ' + h)],
        ['最简比例', '<b style="font-size:18px">' + esc(rw + ':' + rh) + '</b>'],
        ['小数比', esc(num(w / h, 4)) + ' : 1'], ['最大公约数', esc(g)],
        ['最接近常见比例', esc(near[0]) + '（偏差 ' + esc(num(near[1], 4)) + '）']]) +
        HINT('按最大公约数化简；若用于图片缩放，请用下方「按目标宽度 / 高度」计算，避免变形。'),
        w + '×' + h + ' = ' + rw + ':' + rh);
    }
    if (!(target > 0)) throw new Error('目标尺寸需为正数');
    if (v.mode === 'byw') {
      var nh = Math.round(target * h / w);
      return R(KV([['原尺寸', esc(w + ' × ' + h)], ['目标宽度', esc(target) + ' px'],
        ['等比高度', '<b style="font-size:18px">' + esc(nh) + ' px</b>'],
        ['结果', esc(target + ' × ' + nh)], ['缩放系数', esc(num(target / w, 4)) + '×']]),
        target + ' × ' + nh);
    }
    if (v.mode === 'byh') {
      var nw = Math.round(target * w / h);
      return R(KV([['原尺寸', esc(w + ' × ' + h)], ['目标高度', esc(target) + ' px'],
        ['等比宽度', '<b style="font-size:18px">' + esc(nw) + ' px</b>'],
        ['结果', esc(nw + ' × ' + target)], ['缩放系数', esc(num(target / h, 4)) + '×']]),
        nw + ' × ' + target);
    }
    var pr = String(v.preset || '16:9').split(':'), ratio = +pr[0] / +pr[1];
    var width = Math.round(target), height = Math.round(target / ratio);
    return R(KV([['预设比例', esc(v.preset)], ['设定宽度', esc(width) + ' px'],
      ['对应高度', '<b style="font-size:18px">' + esc(height) + ' px</b>'],
      ['总像素', esc((width * height / 1000000).toFixed(2)) + ' MP'],
      ['若按高度 ' + esc(target) + ' px', esc(Math.round(target * ratio)) + ' px 宽']]) +
      HINT('结果已四舍五入到整数像素；常见分辨率：1280×720、1920×1080、2560×1440、3840×2160。'),
      v.preset + ' @ ' + width + ' 宽 → ' + width + ' × ' + height);
  }
});

})();
