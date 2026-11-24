/* ============================================================
   安空工具箱 — v1.6 工具包（上）1~25
   文本效率 8 · 开发者 10 · 计算换算 7
   纯离线运行，沿用 ES5 兼容写法，不联网、不依赖第三方接口
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
function padL(s, n, c) { s = String(s); c = c || '0'; while (s.length < n) s = c + s; return s; }
function pad2(n) { return padL(n, 2); }
function fmtDate(d) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) +
    ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
}
function money(n) { return (Math.round(n * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function bytesOf(s) { return H.utf8Bytes(String(s)); }

/* ============================================================
   一、文本效率（8）
   ============================================================ */

T({ id: 'fullhalf', name: '全角半角转换', cat: 'text',
  desc: '全角 / 半角字母数字与标点互转，支持智能规范化', tags: '全角 半角 标点 空格 排版 转换 fullwidth',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6,
      value: 'ＡｎＫｏｎｇ 工具箱 ２０２６，版本 １．６！  Ｈｅｌｌｏ， Ｗｏｒｌｄ？' },
    { k: 'mode', label: '转换方式', type: 'select', value: 'toHalf', options: [
      ['toHalf', '全部转半角'], ['toFull', '全部转全角'], ['smart', '智能规范'] ] },
    { k: 'space', label: '全角空格', type: 'select', value: 'half', options: [
      ['half', '转半角空格'], ['keep', '保持原样'] ] }
  ],
  run: function (v) {
    function half(c) {
      var n = c.charCodeAt(0);
      if (n === 0x3000) return ' ';
      if (n >= 0xFF01 && n <= 0xFF5E) return String.fromCharCode(n - 0xFEE0);
      return c;
    }
    function full(c) {
      var n = c.charCodeAt(0);
      if (n === 0x20) return String.fromCharCode(0x3000);
      if (n >= 0x21 && n <= 0x7E) return String.fromCharCode(n + 0xFEE0);
      return c;
    }
    var src = String(v.text || ''), out = '', changed = 0;
    for (var i = 0; i < src.length; i++) {
      var c = src.charAt(i), nc = c, code = c.charCodeAt(0);
      if (v.mode === 'toHalf') nc = (code === 0x3000 && v.space === 'keep') ? c : half(c);
      else if (v.mode === 'toFull') nc = full(c);
      else {
        if (code >= 0xFF01 && code <= 0xFF5E) nc = half(c);
        if (code === 0x3000) nc = v.space === 'keep' ? c : ' ';
      }
      if (nc !== c) changed++;
      out += nc;
    }
    var width = function (s) { var w = 0; for (var j = 0; j < s.length; j++) w += s.charCodeAt(j) > 255 ? 2 : 1; return w; };
    return R(KV([['转换方式', { toHalf: '全部转半角', toFull: '全部转全角', smart: '智能规范' }[v.mode]],
      ['改动字符', changed + ' 个'], ['原显示宽度', width(src) + ' 格'], ['现显示宽度', width(out) + ' 格']]) +
      SEC('转换结果') + PRE(out) +
      HINT('全角字符 U+FF01~U+FF5E 与半角 U+0021~U+007E 相差 0xFEE0；全角空格为 U+3000。'), out);
  }
});

T({ id: 'markdowntoc', name: 'Markdown 目录生成', cat: 'text',
  desc: '提取标题层级生成目录，支持缩进列表与锚点链接', tags: 'markdown 目录 toc 标题 锚点 大纲',
  fields: [
    { k: 'text', label: 'Markdown 文本', type: 'textarea', rows: 9,
      value: '# 安空工具箱\n\n## 快速开始\n安装后打开即可使用。\n\n### 工具分类\n共九大类。\n\n## 常见问题\n\n### 需要联网吗\n绝大多数工具离线可用。\n\n```\n## 这不是标题\n```\n\n## 更新日志\n' },
    { k: 'max', label: '最大标题层级', type: 'select', value: '6', options: [['2', '2 级'], ['3', '3 级'], ['4', '4 级'], ['6', '6 级']] },
    { k: 'style', label: '输出格式', type: 'select', value: 'anchor', options: [
      ['anchor', '带锚点链接'], ['indent', '缩进列表'], ['plain', '纯文本大纲'] ] }
  ],
  run: function (v) {
    var maxL = parseInt(v.max, 10) || 6, fence = false, hs = [];
    lines(v.text).forEach(function (ln) {
      if (/^\s*(```|~~~)/.test(ln)) { fence = !fence; return; }
      if (fence) return;
      var m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(ln);
      if (m && m[1].length <= maxL) hs.push({ lv: m[1].length, tx: m[2].replace(/[*_`]/g, '') });
    });
    function slug(s) {
      return String(s).toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\w\u4e00-\u9fff\- ]/g, '')
        .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    }
    var out = hs.map(function (h) {
      var ind = new Array(h.lv).join('  ');
      if (v.style === 'plain') return ind + h.tx;
      if (v.style === 'indent') return ind + '- ' + h.tx;
      return ind + '- [' + h.tx + '](#' + slug(h.tx) + ')';
    }).join('\n');
    var dist = {};
    hs.forEach(function (h) { dist[h.lv] = (dist[h.lv] || 0) + 1; });
    return R(KV([['标题总数', hs.length + ' 个'],
      ['层级分布', Object.keys(dist).sort().map(function (k) { return 'H' + k + ' × ' + dist[k]; }).join(' · ') || '无'],
      ['输出格式', { anchor: '带锚点链接', indent: '缩进列表', plain: '纯文本大纲' }[v.style]]]) +
      SEC('生成目录') + PRE(out || '（没有找到标题）') +
      HINT('已自动跳过 ``` 代码块内的伪标题；锚点规则与常见 Markdown 渲染器一致。'), out);
  }
});

T({ id: 'textsplit', name: '文本定长切块', cat: 'text',
  desc: '按字符数、行数或分隔符把长文本切成编号块', tags: '切块 分段 分片 定长 文本 chunk',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6,
      value: '安空工具箱把常用的小工具装进一个 App，所有数据仅保存在本机。工具覆盖文本、开发、计算、生活、查询、媒体、设备与游戏，全部离线可用。' },
    { k: 'mode', label: '切分方式', type: 'select', value: 'char', options: [
      ['char', '按字符数'], ['line', '按行数'], ['sep', '按分隔符'] ] },
    { k: 'size', label: '每块大小', type: 'text', value: '20' },
    { k: 'sep', label: '分隔符（按分隔符时）', type: 'text', value: '。' }
  ],
  run: function (v) {
    var n = Math.max(1, Math.min(2000, parseInt(v.size, 10) || 20)), chunks = [];
    if (v.mode === 'char') {
      var s = String(v.text || '').replace(/\n/g, ' ');
      for (var i = 0; i < s.length; i += n) chunks.push(s.substr(i, n));
      if (!s.length) chunks.push('');
    } else if (v.mode === 'line') {
      var ls = lines(v.text);
      for (var j = 0; j < ls.length; j += n) chunks.push(ls.slice(j, j + n).join('\n'));
      if (!ls.length) chunks.push('');
    } else {
      var d = String(v.sep || '；');
      var parts = String(v.text || '').split(d);
      var cur = [];
      parts.forEach(function (p, idx) {
        cur.push(p + (idx < parts.length - 1 ? d : ''));
        if (cur.length >= n) { chunks.push(cur.join('')); cur = []; }
      });
      if (cur.length) chunks.push(cur.join(''));
      if (!chunks.length) chunks.push('');
    }
    var body = chunks.map(function (c, i) {
      return '【' + padL(i + 1, 2) + '】(' + c.length + ' 字)\n' + c;
    }).join('\n\n');
    var lens = chunks.map(function (c) { return c.length; });
    return R(KV([['切分方式', { char: '按字符数', line: '按行数', sep: '按分隔符' }[v.mode]],
      ['每块大小', n + (v.mode === 'char' ? ' 字' : v.mode === 'line' ? ' 行' : ' 段')],
      ['切出块数', chunks.length + ' 块'],
      ['最大 / 最小长度', Math.max.apply(null, lens) + ' / ' + Math.min.apply(null, lens) + ' 字']]) +
      SEC('切块结果') + PRE(body), body);
  }
});

T({ id: 'emojicode', name: 'Emoji 短码互转', cat: 'text',
  desc: '常用 Emoji 与 :短码: 互转，并可输出 Unicode 码点', tags: 'emoji 表情 短码 码点 unicode 转换',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 5,
      value: '今天 :smile: 完成了工具箱更新 :tada: ，:heart: 感谢支持！' },
    { k: 'mode', label: '转换方式', type: 'select', value: 'decode', options: [
      ['decode', '短码 → Emoji'], ['encode', 'Emoji → 短码'], ['codepoint', '输出 Unicode 码点'] ] }
  ],
  run: function (v) {
    var M = {
      smile: '\uD83D\uDE04', grin: '\uD83D\uDE00', joy: '\uD83D\uDE02', laugh: '\uD83D\uDE06',
      wink: '\uD83D\uDE09', blush: '\uD83D\uDE0A', heart: '\u2764\uFE0F', star: '\u2B50',
      fire: '\uD83D\uDD25', tada: '\uD83C\uDF89', thumbsup: '\uD83D\uDC4D', thumbsdown: '\uD83D\uDC4E',
      clap: '\uD83D\uDC4F', ok: '\uD83D\uDC4C', rocket: '\uD83D\uDE80', sun: '\u2600\uFE0F',
      moon: '\uD83C\uDF19', cloud: '\u2601\uFE0F', rain: '\uD83C\uDF27\uFE0F', snow: '\u2744\uFE0F',
      coffee: '\u2615', tea: '\uD83C\uDF75', book: '\uD83D\uDCDA', bulb: '\uD83D\uDCA1',
      gear: '\u2699\uFE0F', lock: '\uD83D\uDD12', key: '\uD83D\uDD11', bell: '\uD83D\uDD14',
      check: '\u2705', cross: '\u274C', warning: '\u26A0\uFE0F', info: '\u2139\uFE0F',
      music: '\uD83C\uDFB5', game: '\uD83C\uDFAE', phone: '\uD83D\uDCF1', computer: '\uD83D\uDCBB',
      camera: '\uD83D\uDCF7', gift: '\uD83C\uDF81', money: '\uD83D\uDCB0', target: '\uD83C\uDFAF'
    };
    var keys = Object.keys(M), s = String(v.text || ''), out = '', count = 0;
    if (v.mode === 'decode') {
      out = s.replace(/:([a-z0-9_+-]+):/gi, function (all, k) {
        var kk = k.toLowerCase();
        if (M[kk]) { count++; return M[kk]; }
        return all;
      });
    } else if (v.mode === 'encode') {
      out = s;
      keys.sort(function (a, b) { return M[b].length - M[a].length; }).forEach(function (k) {
        var parts = out.split(M[k]);
        if (parts.length > 1) { count += parts.length - 1; out = parts.join(':' + k + ':'); }
      });
    } else {
      var arr = [];
      for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i), cp = c, ch = s.charAt(i), extra = false;
        if (c >= 0xD800 && c <= 0xDBFF && i + 1 < s.length) {
          var c2 = s.charCodeAt(i + 1);
          if (c2 >= 0xDC00 && c2 <= 0xDFFF) { cp = 0x10000 + ((c - 0xD800) << 10) + (c2 - 0xDC00); ch = s.substr(i, 2); i++; extra = true; }
        }
        arr.push(ch + '  U+' + cp.toString(16).toUpperCase().replace(/^(.{1,4})$/, function (m, x) { return padL(x, 4); }) + (extra ? '  (代理对)' : ''));
      }
      out = arr.join('\n');
      count = arr.length;
    }
    return R(KV([['转换方式', { decode: '短码 → Emoji', encode: 'Emoji → 短码', codepoint: 'Unicode 码点' }[v.mode]],
      ['词库收录', keys.length + ' 个常用 Emoji'], ['处理数量', count + (v.mode === 'codepoint' ? ' 个字符' : ' 处')]]) +
      SEC('结果') + PRE(out) + HINT('解码支持 :短码: 写法；码点模式会把代理对合并为一个码点显示。'), out);
  }
});

T({ id: 'cjkpunct', name: '中文标点规范化', cat: 'text',
  desc: '中英标点互转、引号配对与省略号破折号整理', tags: '标点 中文 引号 省略号 破折号 排版',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6,
      value: '他说:"这是安空工具箱,真的很好用!" 还有...等等--先别急?? 价格(参考)是 199 元.' },
    { k: 'mode', label: '规范方式', type: 'select', value: 'zh', options: [
      ['zh', '转为中文标点'], ['en', '转为英文标点'], ['fix', '仅修正重复与配对'] ] },
    { k: 'quote', label: '引号处理', type: 'select', value: 'pair', options: [
      ['pair', '配对成弯引号'], ['keep', '保持直引号'] ] }
  ],
  run: function (v) {
    var s = String(v.text || '');
    var toZh = { ',': '，', '.': '。', ':': '：', ';': '；', '?': '？', '!': '！', '(': '（', ')': '）' };
    var toEn = { '，': ',', '。': '.', '：': ':', '；': ';', '？': '?', '！': '!', '（': '(', '）': ')' };
    var out = '', i;
    if (v.mode === 'zh' || v.mode === 'en') {
      var map = v.mode === 'zh' ? toZh : toEn;
      for (i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        if (v.mode === 'zh' && /[A-Za-z0-9]/.test(s.charAt(i - 1) || '') && /[A-Za-z0-9]/.test(s.charAt(i + 1) || '') && (c === '.' || c === ':')) { out += c; continue; }
        out += map[c] || c;
      }
    } else out = s;
    if (v.quote === 'pair' && v.mode !== 'en') {
      var open = true;
      out = out.replace(/["“”]/g, function () { var r = open ? '“' : '”'; open = !open; return r; });
      var open2 = true;
      out = out.replace(/['‘’]/g, function () { var r = open2 ? '‘' : '’'; open2 = !open2; return r; });
    }
    var repeats = 0;
    out = out.replace(/\.{3,}|。{3,}/g, function (m) { repeats++; return v.mode === 'en' ? '...' : '……'; });
    out = out.replace(/-{2,}/g, function () { repeats++; return '——'; });
    out = out.replace(/([！？!?，,。;；:：])\1+/g, function (m, c) { repeats++; return c; });
    out = out.replace(/[ \t]+/g, ' ').replace(/ +([，。！？；：、])/g, '$1');
    return R(KV([['规范方式', { zh: '转为中文标点', en: '转为英文标点', fix: '仅修正重复与配对' }[v.mode]],
      ['引号处理', v.quote === 'pair' ? '配对成弯引号' : '保持直引号'],
      ['整理的重复标点', repeats + ' 处'], ['字符数', s.length + ' → ' + out.length]]) +
      SEC('规范结果') + PRE(out) +
      HINT('英文单词内部的小数点与冒号会保留为半角，避免把 1.6 或 12:30 改坏。'), out);
  }
});

T({ id: 'stringesc', name: '多语言字符串转义', cat: 'text',
  desc: '生成 JSON / JS / Java / Python / SQL / HTML 的字符串字面量', tags: '转义 字符串 字面量 引号 代码生成 escape',
  fields: [
    { k: 'text', label: '原始字符串', type: 'textarea', rows: 5,
      value: '安空工具箱 v1.6\n路径 C:\\tools\\ak\n他说 "离线可用" & 100%' },
    { k: 'lang', label: '目标语言', type: 'select', value: 'json', options: [
      ['json', 'JSON'], ['js', 'JavaScript'], ['java', 'Java / C# / C++'],
      ['python', 'Python'], ['sql', 'SQL'], ['html', 'HTML 属性'], ['java15', 'Java 15+ 文本块'] ] }
  ],
  run: function (v) {
    var s = String(v.text || ''), out = '', label = '';
    function ctrl(c, style) {
      var n = c.charCodeAt(0);
      if (c === '\n') return '\\n';
      if (c === '\r') return '\\r';
      if (c === '\t') return '\\t';
      if (c === '\\') return '\\\\';
      if (c === '"') return '\\"';
      if (c === "'") return style === 'sql' ? "''" : "\\'";
      if (n < 32) return style === 'json' || style === 'js' || style === 'java'
        ? '\\u' + padL(n.toString(16).toUpperCase(), 4)
        : '\\x' + padL(n.toString(16).toUpperCase(), 2);
      return c;
    }
    var i, c;
    switch (v.lang) {
      case 'json':
        label = 'JSON 字符串';
        out = '"';
        for (i = 0; i < s.length; i++) {
          c = s.charAt(i);
          if (c === '\n') { out += '\\n'; continue; }
          if (c === '\r') { out += '\\r'; continue; }
          if (c === '\t') { out += '\\t'; continue; }
          if (c === '\\' || c === '"') { out += '\\' + c; continue; }
          if (c.charCodeAt(0) < 32) { out += '\\u' + padL(c.charCodeAt(0).toString(16).toUpperCase(), 4); continue; }
          out += c;
        }
        out += '"';
        break;
      case 'js':
        label = 'JavaScript 模板字符串';
        out = '`' + s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';
        break;
      case 'java':
      case 'java15':
        label = v.lang === 'java15' ? 'Java 文本块' : 'Java / C# / C++ 字符串';
        if (v.lang === 'java15') out = '"""\n' + s.replace(/"""/g, '\\"\\"\\"') + '\n"""';
        else {
          out = '"';
          for (i = 0; i < s.length; i++) { c = s.charAt(i); out += ctrl(c, 'java'); }
          out += '"';
        }
        break;
      case 'python':
        label = 'Python 三引号字符串';
        out = '"""' + s.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"') + '"""';
        break;
      case 'sql':
        label = 'SQL 字符串字面量';
        out = "'" + s.replace(/'/g, "''") + "'";
        break;
      default:
        label = 'HTML 属性（双引号内）';
        out = s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        out = '"' + out + '"';
    }
    var lit = String(s).length;
    return R(KV([['目标语言', label], ['原字符数', lit + ' 个'],
      ['字面量长度', out.length + ' 个字符'], ['UTF-8 字节', bytesOf(s).length + ' B']]) +
      SEC('生成结果') + PRE(out) +
      SEC('验证回显') + PRE(String(v.lang === 'json' ? (function () { try { return JSON.parse(out); } catch (e) { return '（无法解析）'; } })() : s)) +
      HINT('JSON / Java 使用 \\uXXXX 表示控制字符；SQL 用两个单引号转义；HTML 用实体编码。'), out);
  }
});

T({ id: 'csvclean', name: 'CSV 清洗整理', cat: 'text',
  desc: '解析带引号的 CSV，统一列数、去除空行并输出 TSV 预览', tags: 'csv 清洗 分隔符 引号 表格 整理',
  fields: [
    { k: 'text', label: 'CSV 文本', type: 'textarea', rows: 8,
      value: '\uFEFF名称,数量,备注\n安空工具箱,1,"离线,免登录"\n二维码,2,支持批量\n\n图片压缩,3,"含 ""高质量"" 选项"\n便签,4,' },
    { k: 'delim', label: '分隔符', type: 'text', value: ',' },
    { k: 'mode', label: '处理方式', type: 'select', value: 'clean', options: [
      ['clean', '清理并统一列数'], ['trim', '仅去除首尾空白'], ['quote', '规范引号输出'] ] },
    { k: 'dropEmpty', label: '删除空行', type: 'select', value: 'yes', options: [['yes', '删除'], ['no', '保留']] }
  ],
  run: function (v) {
    var d = (String(v.delim || ',') || ',').charAt(0);
    var src = String(v.text || '').replace(/^\uFEFF/, '');
    var rows = [], row = [], cur = '', q = false, i;
    for (i = 0; i < src.length; i++) {
      var c = src.charAt(i);
      if (q) {
        if (c === '"') { if (src.charAt(i + 1) === '"') { cur += '"'; i++; } else q = false; }
        else cur += c;
      } else {
        if (c === '"' && cur === '') q = true;
        else if (c === d) { row.push(cur); cur = ''; }
        else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
        else if (c !== '\r') cur += c;
      }
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    var before = rows.length;
    if (v.mode === 'trim') rows = rows.map(function (r) { return r.map(function (x) { return x.trim(); }); });
    else {
      rows = rows.map(function (r) {
        return r.map(function (x) { return x.trim(); });
      });
      if (v.dropEmpty === 'yes') rows = rows.filter(function (r) { return r.some(function (x) { return x !== ''; }); });
      var maxC = 0;
      rows.forEach(function (r) { maxC = Math.max(maxC, r.length); });
      rows = rows.map(function (r) { while (r.length < maxC) r.push(''); return r.slice(0, maxC); });
    }
    function cell(x) {
      if (v.mode === 'quote' || /[",\n]/.test(x)) return '"' + String(x).replace(/"/g, '""') + '"';
      return x;
    }
    var csv = rows.map(function (r) { return r.map(cell).join(d); }).join('\n');
    var tsv = rows.map(function (r) { return r.map(function (x) { return String(x).replace(/\t/g, ' '); }).join('\t'); }).join('\n');
    var lens = {};
    rows.forEach(function (r) { lens[r.length] = (lens[r.length] || 0) + 1; });
    return R(KV([['原始行数', before + ' 行'], ['处理后行数', rows.length + ' 行'],
      ['列数', Object.keys(lens).join(' / ') + ' 列'], ['分隔符', d === '\t' ? 'TAB' : '"' + d + '"']]) +
      SEC('预览（前 8 行）') + TB(rows[0] || [], rows.slice(1, 8)) +
      SEC('清洗后 CSV') + PRE(csv) + SEC('TSV 预览') + PRE(tsv) +
      HINT('支持双引号包裹字段、字段内分隔符与 "" 转义引号；开头 BOM 会自动移除。'), csv);
  }
});

T({ id: 'repeatfind', name: '重复片段查找', cat: 'text',
  desc: '统计重复行或重复子串，列出出现位置与次数', tags: '重复 查重 片段 子串 词频 检测',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 7,
      value: '离线工具，离线可用。\n工具全部在本机运行。\n离线工具，离线可用。\n不上传任何数据。\n工具全部在本机运行。\n离线工具，离线可用。' },
    { k: 'mode', label: '检测粒度', type: 'select', value: 'line', options: [
      ['line', '按整行'], ['char', '按子串'] ] },
    { k: 'min', label: '最小子串长度（按子串时）', type: 'text', value: '4' }
  ],
  run: function (v) {
    var s = String(v.text || ''), out = '', list = [];
    if (v.mode === 'line') {
      var cnt = {}, first = {};
      lines(s).forEach(function (ln, idx) {
        var t = ln.trim(); if (!t) return;
        cnt[t] = (cnt[t] || 0) + 1;
        if (first[t] == null) first[t] = idx + 1;
      });
      Object.keys(cnt).forEach(function (k) { if (cnt[k] > 1) list.push([k, cnt[k], first[k]]); });
      list.sort(function (a, b) { return b[1] - a[1] || a[2] - b[2]; });
      out = list.length ? TB(['重复行', '次数', '首次行号'], list.slice(0, 20).map(function (r) {
        return [r[0].length > 60 ? r[0].slice(0, 60) + '…' : r[0], String(r[1]), String(r[2])];
      })) : '<div class="note">没有发现重复行。</div>';
    } else {
      var mn = Math.max(2, Math.min(20, parseInt(v.min, 10) || 4));
      var flat = s.replace(/\s+/g, ' ').slice(0, 400), map = {};
      var mx = Math.min(12, flat.length);
      for (var L = mn; L <= mx; L++) {
        for (var i = 0; i + L <= flat.length; i++) {
          var sub = flat.substr(i, L);
          if (/^\s|\s$/.test(sub)) continue;
          map[sub] = (map[sub] || 0) + 1;
        }
      }
      var arr = [];
      Object.keys(map).forEach(function (k) { if (map[k] > 1) arr.push([k, map[k]]); });
      arr.sort(function (a, b) { return b[1] - a[1] || b[0].length - a[0].length; });
      var seen = [];
      arr.forEach(function (a) {
        if (seen.length >= 15) return;
        for (var j = 0; j < seen.length; j++) if (seen[j].indexOf(a[0]) >= 0 || a[0].indexOf(seen[j]) >= 0) return;
        seen.push(a[0]); list.push(a);
      });
      out = list.length ? TB(['重复子串', '出现次数', '长度'], list.map(function (r) {
        return [r[0], String(r[1]), String(r[0].length)];
      })) : '<div class="note">没有发现达到长度的重复子串。</div>';
    }
    return R(KV([['检测粒度', v.mode === 'line' ? '按整行' : '按子串'],
      ['发现的重复项', list.length + ' 项'], ['文本长度', s.length + ' 字符']]) +
      SEC('重复项列表') + out +
      HINT('按子串模式会把输入压平并截取前 400 字符，仅统计 2~12 字长且出现 2 次以上的片段。'),
      list.map(function (r) { return r[0] + ' × ' + r[1]; }).join('\n'));
  }
});

/* ============================================================
   二、开发者（10）
   ============================================================ */

T({ id: 'urlparams', name: 'URL 参数编辑', cat: 'dev',
  desc: '列出、增删、排序 URL 查询参数并重新编码生成完整链接', tags: 'url 参数 query string 编码 链接 编辑',
  fields: [
    { k: 'url', label: '原始 URL', type: 'text',
      value: 'https://example.com/search?q=安空工具箱&page=2&sort=time&utm_source=app#result' },
    { k: 'action', label: '操作', type: 'select', value: 'list', options: [
      ['list', '仅列出参数'], ['add', '添加 / 修改'], ['remove', '删除'], ['sort', '按名排序'], ['clear', '清空参数'] ] },
    { k: 'key', label: '参数名', type: 'text', value: 'lang' },
    { k: 'val', label: '参数值', type: 'text', value: 'zh-CN' }
  ],
  run: function (v) {
    var u = String(v.url || ''), qi = u.indexOf('?');
    var base = qi >= 0 ? u.slice(0, qi) : u;
    var rest = qi >= 0 ? u.slice(qi + 1) : '', hash = '';
    var hi = rest.indexOf('#');
    if (hi >= 0) { hash = rest.slice(hi); rest = rest.slice(0, hi); }
    var pairs = [];
    (rest ? rest.split('&') : []).forEach(function (p) {
      if (!p) return;
      var eq = p.indexOf('='), k = eq >= 0 ? p.slice(0, eq) : p, val = eq >= 0 ? p.slice(eq + 1) : '';
      function dec(x) { try { return decodeURIComponent(String(x).replace(/\+/g, ' ')); } catch (e) { return x; } }
      pairs.push([dec(k), dec(val)]);
    });
    var changed = 0;
    if (v.action === 'add') {
      var found = false;
      pairs.forEach(function (p) { if (p[0] === v.key) { p[1] = v.val; found = true; changed++; } });
      if (!found) { pairs.push([v.key, v.val]); changed++; }
    } else if (v.action === 'remove') {
      var n0 = pairs.length;
      pairs = pairs.filter(function (p) { return p[0] !== v.key; });
      changed = n0 - pairs.length;
    } else if (v.action === 'sort') { pairs.sort(function (a, b) { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0; }); changed = 1; }
    else if (v.action === 'clear') { changed = pairs.length; pairs = []; }
    var qs = pairs.map(function (p) { return encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]); }).join('&');
    var full = base + (qs ? '?' + qs : '') + hash;
    return R(KV([['协议与主机', esc(base.split('/').slice(0, 3).join('/')) || '—'],
      ['参数个数', pairs.length + ' 个'], ['本次改动', changed + ' 项'],
      ['片段标识', hash || '—']]) +
      SEC('参数明细') + (pairs.length ? TB(['序号', '参数名', '参数值'], pairs.map(function (p, i) {
        return [String(i + 1), p[0], p[1] || '(空)'];
      })) : '<div class="note">没有查询参数。</div>') +
      SEC('生成的 URL') + PRE(full) +
      HINT('参数名与值均按 UTF-8 做 percent-encoding，+ 号按空格解码，# 后的片段保持不变。'), full);
  }
});

T({ id: 'regexbatch', name: '正则批量替换', cat: 'dev',
  desc: '对多行文本执行正则替换、匹配提取或按匹配切分', tags: '正则 regex 替换 提取 捕获组 批量',
  fields: [
    { k: 'text', label: '待处理文本', type: 'textarea', rows: 7,
      value: '用户 13800138000 于 2026-11-15 登录\n邮箱 admin@example.com 已验证\n订单 SN20261115001 金额 199.00 元\n电话 13912345678 未绑定' },
    { k: 'pattern', label: '正则表达式', type: 'text', value: '(1[3-9]\\d{9})|([\\w.+-]+@[\\w.-]+)' },
    { k: 'flags', label: '修饰符', type: 'text', value: 'g' },
    { k: 'repl', label: '替换为（支持 $1 $&）', type: 'text', value: '[$1$2]' },
    { k: 'mode', label: '模式', type: 'select', value: 'replace', options: [
      ['replace', '替换'], ['extract', '提取匹配'], ['split', '按匹配切分'] ] }
  ],
  run: function (v) {
    var re, out = '', matches = [];
    try { re = new RegExp(String(v.pattern || ''), String(v.flags == null ? 'g' : v.flags)); }
    catch (e) { return R('<div class="note">正则表达式无效：' + esc(e.message) + '</div>', '错误：' + e.message); }
    var s = String(v.text || '');
    if (v.mode === 'replace') {
      out = s.replace(re, String(v.repl == null ? '' : v.repl));
      var g = new RegExp(re.source, re.ignoreCase ? 'gi' : 'g');
      var m; while ((m = g.exec(s)) !== null) { matches.push(m[0]); if (!g.global || m[0] === '') break; }
    } else if (v.mode === 'extract') {
      var g2 = new RegExp(re.source, (re.global ? 'g' : '') + (re.ignoreCase ? 'i' : '') + (re.multiline ? 'm' : ''));
      var m2;
      while ((m2 = g2.exec(s)) !== null) { matches.push(m2[0]); if (!g2.global || m2[0] === '') break; }
      out = matches.map(function (x, i) { return padL(i + 1, 2) + '. ' + x; }).join('\n');
    } else {
      var parts = s.split(re);
      out = parts.map(function (x, i) { return '【' + padL(i, 2) + '】' + x; }).join('\n');
      matches = parts;
    }
    return R(KV([['模式', { replace: '替换', extract: '提取匹配', split: '按匹配切分' }[v.mode]],
      ['表达式', '/' + esc(v.pattern) + '/' + esc(v.flags == null ? 'g' : v.flags)],
      [v.mode === 'split' ? '切出片段' : '匹配次数', matches.length + ' 项'],
      ['结果长度', out.length + ' 字符']]) +
      SEC('处理结果') + PRE(out || '（无结果）') +
      (v.mode !== 'split' && matches.length ? SEC('匹配清单（前 20 项）') + PRE(matches.slice(0, 20).join('\n')) : '') +
      HINT('替换内容支持 $1 / $2 捕获组与 $& 整体匹配；提取模式会自动补 g 标志。'), out);
  }
});

T({ id: 'sqlparams', name: 'SQL 参数绑定', cat: 'dev',
  desc: '把 ? 占位符与参数列表绑定，生成可直接查看的 SQL', tags: 'sql 参数 占位符 预编译 绑定 调试',
  fields: [
    { k: 'sql', label: 'SQL 模板（? 占位符）', type: 'textarea', rows: 5,
      value: 'SELECT * FROM tools WHERE cat = ? AND enabled = ? AND min_version >= ? LIMIT ?;' },
    { k: 'params', label: '参数值（每行一个）', type: 'textarea', rows: 5,
      value: 'text\n1\n1.4\n20' },
    { k: 'mode', label: '输出方式', type: 'select', value: 'inline', options: [
      ['inline', '生成内联 SQL'], ['list', '列出参数位'], ['named', '转命名参数'] ] }
  ],
  run: function (v) {
    var ps = lines(v.params).map(function (x) { return x.trim(); }).filter(function (x, i, a) { return x !== '' || a.length === 1; });
    var s = String(v.sql || ''), idx = 0;
    function lit(x) {
      if (/^-?\d+(\.\d+)?$/.test(x)) return x;
      if (/^null$/i.test(x)) return 'NULL';
      if (/^true|false$/i.test(x)) return x.toUpperCase();
      return "'" + String(x).replace(/'/g, "''") + "'";
    }
    var out = s.replace(/\?/g, function () {
      var x = ps[idx] == null ? 'NULL' : ps[idx];
      idx++;
      return v.mode === 'named' ? ':p' + idx : lit(x);
    });
    var rows = ps.map(function (x, i) { return [String(i + 1), x, lit(x)]; });
    return R(KV([['占位符数量', idx + ' 个'], ['提供参数', ps.length + ' 个'],
      ['是否匹配', idx === ps.length ? '是' : '否（不足处按 NULL 处理）'],
      ['输出方式', { inline: '内联 SQL', list: '参数位列表', named: '命名参数' }[v.mode]]]) +
      SEC('参数明细') + (rows.length ? TB(['位置', '原始值', 'SQL 字面量'], rows) : '<div class="note">没有参数。</div>') +
      SEC('生成的 SQL') + PRE(out) +
      HINT('仅用于本地查看与调试拼接结果；实际项目请始终使用预编译语句，不要拼接用户输入。'), out);
  }
});

T({ id: 'htmlattr', name: 'HTML 属性解析', cat: 'dev',
  desc: '解析标签名与属性列表，或从 JSON 反向生成标签', tags: 'html 标签 属性 解析 dom 代码生成',
  fields: [
    { k: 'tag', label: 'HTML 标签 / JSON', type: 'textarea', rows: 5,
      value: '<a href="https://example.com" class="link primary" data-id=42 target=_blank rel="noopener" disabled>安空工具箱</a>' },
    { k: 'mode', label: '模式', type: 'select', value: 'list', options: [
      ['list', '列出属性'], ['json', '输出 JSON'], ['build', '从 JSON 生成标签'] ] },
    { k: 'tagname', label: '生成时的标签名', type: 'text', value: 'div' }
  ],
  run: function (v) {
    var src = String(v.tag || '').trim(), out = '', rows = [], obj = {}, name = '';
    if (v.mode === 'build') {
      try { obj = JSON.parse(src); } catch (e) { return R('<div class="note">JSON 解析失败：' + esc(e.message) + '</div>', '错误'); }
      name = String(v.tagname || 'div').replace(/[^a-zA-Z0-9:-]/g, '') || 'div';
      var attrs = [];
      Object.keys(obj).forEach(function (k) {
        var val = obj[k];
        if (val === true || val === null) attrs.push(k);
        else attrs.push(k + '="' + esc(val).replace(/"/g, '&quot;') + '"');
      });
      out = '<' + name + (attrs.length ? ' ' + attrs.join(' ') : '') + '></' + name + '>';
      rows = Object.keys(obj).map(function (k) { return [k, String(obj[k])]; });
    } else {
      var m = /^<\s*([a-zA-Z][\w:-]*)/.exec(src);
      name = m ? m[1] : '(未识别)';
      var body = src.replace(/^<\s*[a-zA-Z][\w:-]*/, '').replace(/>\s*$/, '');
      var re = /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g, mm;
      while ((mm = re.exec(body)) !== null) {
        var k = mm[1];
        if (!k || /^\//.test(k)) continue;
        var val = mm[2] != null ? mm[2] : mm[3] != null ? mm[3] : mm[4] != null ? mm[4] : '(布尔属性)';
        rows.push([k, val]); obj[k] = val;
      }
      out = v.mode === 'json' ? JSON.stringify({ tag: name, attrs: obj }, null, 2) : '';
    }
    var html = (v.mode === 'list' ? (rows.length ? TB(['属性名', '属性值'], rows) : '<div class="note">没有解析到属性。</div>')
      : PRE(out));
    return R(KV([['标签名', esc(name)], ['属性个数', rows.length + ' 个'],
      ['模式', { list: '列出属性', json: '输出 JSON', build: '从 JSON 生成标签' }[v.mode]]]) +
      SEC('结果') + html + (v.mode === 'build' ? SEC('生成标签（转义显示）') + PRE(out) : '') +
      HINT('支持双引号、单引号、无引号与布尔属性；生成标签时会转义引号避免结构被破坏。'), out);
  }
});

T({ id: 'uuidbatch', name: '批量 ID 生成', cat: 'dev',
  desc: '一次生成多个 UUID v4、十六进制、短 ID 或纯数字编号', tags: 'uuid 随机 id 批量 生成 标识',
  fields: [
    { k: 'n', label: '生成数量', type: 'text', value: '8' },
    { k: 'kind', label: 'ID 类型', type: 'select', value: 'uuid4', options: [
      ['uuid4', 'UUID v4'], ['hex', '十六进制'], ['nanoid', '短 ID（字母数字）'], ['num', '纯数字'] ] },
    { k: 'len', label: '长度（非 UUID 时）', type: 'text', value: '16' },
    { k: 'upper', label: '字母大小写', type: 'select', value: 'no', options: [['no', '小写'], ['yes', '大写']] },
    { k: 'prefix', label: '前缀', type: 'text', value: '' }
  ],
  run: function (v) {
    var n = Math.max(1, Math.min(200, parseInt(v.n, 10) || 8));
    var L = Math.max(1, Math.min(64, parseInt(v.len, 10) || 16));
    var alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    function rh(k) { var s = ''; for (var i = 0; i < k; i++) s += Math.floor(Math.random() * 16).toString(16); return s; }
    function one() {
      var s;
      if (v.kind === 'uuid4') s = rh(8) + '-' + rh(4) + '-4' + rh(3) + '-' +
        ((8 + Math.floor(Math.random() * 4)).toString(16)) + rh(3) + '-' + rh(12);
      else if (v.kind === 'hex') s = rh(L);
      else if (v.kind === 'num') { s = ''; for (var i = 0; i < L; i++) s += Math.floor(Math.random() * 10); }
      else { s = ''; for (var j = 0; j < L; j++) s += alpha.charAt(Math.floor(Math.random() * alpha.length)); }
      if (v.upper === 'yes') s = s.toUpperCase();
      return String(v.prefix || '') + s;
    }
    var arr = [];
    for (var i = 0; i < n; i++) arr.push(one());
    var uniq = {}; arr.forEach(function (x) { uniq[x] = 1; });
    return R(KV([['生成数量', n + ' 个'], ['ID 类型', { uuid4: 'UUID v4', hex: '十六进制', nanoid: '短 ID', num: '纯数字' }[v.kind]],
      ['唯一数量', Object.keys(uniq).length + ' 个'], ['单条长度', arr[0] ? arr[0].length : 0 + ' 字符']]) +
      SEC('生成结果') + PRE(arr.map(function (x, i) { return padL(i + 1, 2) + '. ' + x; }).join('\n')) +
      HINT('由本机 Math.random() 生成，用于测试数据、临时标识与示例；请勿作为密钥或安全令牌。'), arr.join('\n'));
  }
});

T({ id: 'checksum', name: '校验和计算', cat: 'dev',
  desc: '一次算出 CRC32、Adler-32、异或校验、Luhn 与 MD5', tags: 'crc32 adler32 校验和 luhn md5 摘要 完整性',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 5, value: '安空工具箱 v1.6 — AnKong Toolbox' },
    { k: 'mode', label: '计算模式', type: 'select', value: 'all', options: [
      ['all', '全部算法'], ['crc', '仅 CRC32'], ['luhn', 'Luhn 校验位'] ] }
  ],
  run: function (v) {
    var b = bytesOf(String(v.text || '')), s = String(v.text || '');
    var crcTable = [], i, j, c;
    for (i = 0; i < 256; i++) {
      c = i;
      for (j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      crcTable[i] = c >>> 0;
    }
    var crc = 0xFFFFFFFF;
    for (i = 0; i < b.length; i++) crc = (crcTable[(crc ^ b[i]) & 0xFF] ^ (crc >>> 8)) >>> 0;
    crc = (crc ^ 0xFFFFFFFF) >>> 0;
    var a = 1, d = 0;
    for (i = 0; i < b.length; i++) { a = (a + b[i]) % 65521; d = (d + a) % 65521; }
    var adler = ((d << 16) | a) >>> 0;
    var xor = 0, sum = 0;
    for (i = 0; i < b.length; i++) { xor ^= b[i]; sum += b[i]; }
    var md5 = H.md5(s);
    function luhnBase(x) { return String(x).replace(/\D/g, ''); }
    function luhnDigit(x) {
      var t = 0, alt = true;
      for (var k = x.length - 1; k >= 0; k--) {
        var nn = parseInt(x.charAt(k), 10);
        if (alt) { nn *= 2; if (nn > 9) nn -= 9; }
        t += nn; alt = !alt;
      }
      return (10 - (t % 10)) % 10;
    }
    var digits = luhnBase(s), luhn = digits.length ? luhnDigit(digits) : '—';
    var rows = [
      ['字节长度', b.length + ' B'], ['CRC32', crc.toString(16).toUpperCase().replace(/^(.{1,8})$/, function (m, x) { return padL(x, 8); }) + ' (0x)'],
      ['CRC32 十进制', String(crc)], ['Adler-32', adler.toString(16).toUpperCase() + ' (0x)'],
      ['异或校验 XOR8', xor.toString(16).toUpperCase() + ' (0x)'], ['字节累加和', String(sum) + ' / mod256 ' + (sum % 256)],
      ['MD5', md5], ['Luhn 校验位', String(luhn)]
    ];
    if (v.mode === 'crc') rows = [rows[0], rows[1], rows[2]];
    if (v.mode === 'luhn') rows = [['提取的数字', digits || '（无）'], ['Luhn 校验位', String(luhn)],
      ['带校验位完整串', digits ? digits + luhn : '—']];
    return R(KV(rows) + HINT('校验和按 UTF-8 字节计算；CRC32 使用 IEEE 802.3 多项式 0xEDB88320，结果与常见工具一致。'),
      rows.map(function (r) { return r[0] + ': ' + String(r[1]).replace(/<[^>]+>/g, ''); }).join('\n'));
  }
});

T({ id: 'base58', name: 'Base58 / Base32 编解码', cat: 'dev',
  desc: '比特币风格 Base58 与 RFC4648 Base32 互转，支持 UTF-8 中文', tags: 'base58 base32 编码 解码 比特币 utf8',
  fields: [
    { k: 'text', label: '输入文本', type: 'text', value: '安空工具箱' },
    { k: 'mode', label: '模式', type: 'select', value: 'b58enc', options: [
      ['b58enc', 'Base58 编码'], ['b58dec', 'Base58 解码'],
      ['b32enc', 'Base32 编码'], ['b32dec', 'Base32 解码'] ] }
  ],
  run: function (v) {
    var A58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    var A32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    var s = String(v.text || ''), out = '', bytes = [];
    function b58enc(bs) {
      var dg = [0];
      for (var i = 0; i < bs.length; i++) {
        var carry = bs[i];
        for (var j = 0; j < dg.length; j++) { carry += dg[j] << 8; dg[j] = carry % 58; carry = (carry / 58) | 0; }
        while (carry > 0) { dg.push(carry % 58); carry = (carry / 58) | 0; }
      }
      var o = '', z = 0;
      for (z = 0; z < bs.length && bs[z] === 0; z++) o += '1';
      for (var p = dg.length - 1; p >= 0; p--) o += A58.charAt(dg[p]);
      return o;
    }
    function b58dec(str) {
      var bs = [0];
      for (var i = 0; i < str.length; i++) {
        var x = A58.indexOf(str.charAt(i));
        if (x < 0) throw new Error('非法 Base58 字符：' + str.charAt(i));
        var carry = x;
        for (var j = 0; j < bs.length; j++) { carry += bs[j] * 58; bs[j] = carry & 255; carry = carry >> 8; }
        while (carry > 0) { bs.push(carry & 255); carry = carry >> 8; }
      }
      for (var k = 0; k < str.length && str.charAt(k) === '1'; k++) bs.push(0);
      bs.reverse();
      while (bs.length > 1 && bs[0] === 0) bs.shift();
      return bs;
    }
    function b32enc(bs) {
      var o = '', buf = 0, bits = 0;
      for (var i = 0; i < bs.length; i++) {
        buf = (buf << 8) | bs[i]; bits += 8;
        while (bits >= 5) { bits -= 5; o += A32.charAt((buf >> bits) & 31); }
      }
      if (bits > 0) o += A32.charAt((buf << (5 - bits)) & 31);
      while (o.length % 8) o += '=';
      return o;
    }
    function b32dec(str) {
      var t = String(str).toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
      var buf = 0, bits = 0, o = [];
      for (var i = 0; i < t.length; i++) {
        var x = A32.indexOf(t.charAt(i));
        if (x < 0) throw new Error('非法 Base32 字符：' + t.charAt(i));
        buf = (buf << 5) | x; bits += 5;
        if (bits >= 8) { bits -= 8; o.push((buf >> bits) & 255); }
      }
      return o;
    }
    try {
      if (v.mode === 'b58enc') { bytes = bytesOf(s); out = b58enc(bytes); }
      else if (v.mode === 'b32enc') { bytes = bytesOf(s); out = b32enc(bytes); }
      else if (v.mode === 'b58dec') { bytes = b58dec(s.trim()); out = H.bytesToStr(bytes); }
      else { bytes = b32dec(s.trim()); out = H.bytesToStr(bytes); }
    } catch (e) { return R('<div class="note">处理失败：' + esc(e.message) + '</div>', '错误：' + e.message); }
    var hex = H.bytesToHex(bytes);
    return R(KV([['模式', { b58enc: 'Base58 编码', b58dec: 'Base58 解码', b32enc: 'Base32 编码', b32dec: 'Base32 解码' }[v.mode]],
      ['输入长度', s.length + ' 字符'], ['字节数', bytes.length + ' B'], ['输出长度', out.length + ' 字符']]) +
      SEC('结果') + PRE(out) + SEC('对应十六进制') + PRE(hex) +
      HINT('Base58 去除易混淆的 0 / O / I / l；前导零字节编码为字符 1。解码结果按 UTF-8 还原。'), out);
  }
});

T({ id: 'codepoints', name: 'Unicode 码点分析', cat: 'dev',
  desc: '逐字符列出码点、UTF-8 字节、字符类别与代理对信息', tags: 'unicode 码点 utf8 代理对 字符 编码',
  fields: [
    { k: 'text', label: '待分析文本', type: 'text', value: '安空 A😀 1.6' },
    { k: 'mode', label: '分析模式', type: 'select', value: 'chars', options: [
      ['chars', '逐字符明细'], ['bytes', 'UTF-8 字节流'], ['stats', '类别统计'] ] }
  ],
  run: function (v) {
    var s = String(v.text || ''), items = [], i;
    for (i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i), cp = c, ch = s.charAt(i), pair = false;
      if (c >= 0xD800 && c <= 0xDBFF && i + 1 < s.length) {
        var c2 = s.charCodeAt(i + 1);
        if (c2 >= 0xDC00 && c2 <= 0xDFFF) { cp = 0x10000 + ((c - 0xD800) << 10) + (c2 - 0xDC00); ch = s.substr(i, 2); i++; pair = true; }
      }
      var kind = cp < 128 ? 'ASCII' : (cp >= 0x4E00 && cp <= 0x9FFF) ? 'CJK 汉字'
        : (cp >= 0x1F000) ? 'Emoji / 符号' : (cp >= 0x3000 && cp <= 0x303F) ? 'CJK 标点'
        : (cp >= 0xFF00 && cp <= 0xFFEF) ? '全角 / 半宽' : '其它';
      var hb = H.utf8Bytes(ch);
      items.push({ ch: ch, cp: cp, hex: cp.toString(16).toUpperCase(), pair: pair, kind: kind,
        bytes: hb.map(function (x) { return padL(x.toString(16).toUpperCase(), 2); }).join(' ') });
    }
    var out = '';
    if (v.mode === 'bytes') {
      var all = [];
      items.forEach(function (it) { all.push(it.ch + ' → ' + it.bytes); });
      out = PRE(all.join('\n')) + SEC('完整字节流') + PRE(H.bytesToHex(bytesOf(s)).toUpperCase());
    } else if (v.mode === 'stats') {
      var st = {};
      items.forEach(function (it) { st[it.kind] = (st[it.kind] || 0) + 1; });
      out = TB(['字符类别', '数量'], Object.keys(st).map(function (k) { return [k, String(st[k])]; })) +
        KV([['字符数（码点数）', items.length + ' 个'], ['UTF-16 单元', s.length + ' 个'],
          ['UTF-8 字节', bytesOf(s).length + ' B'], ['代理对数量', items.filter(function (x) { return x.pair; }).length + ' 个']]);
    } else {
      out = TB(['字符', '码点', '类别', 'UTF-8 字节'], items.map(function (it) {
        return [it.ch, 'U+' + padL(it.hex, 4), it.kind, it.bytes];
      }));
    }
    return R(KV([['分析模式', { chars: '逐字符明细', bytes: 'UTF-8 字节流', stats: '类别统计' }[v.mode]],
      ['码点数', items.length + ' 个'], ['UTF-16 单元', s.length + ' 个'], ['UTF-8 字节', bytesOf(s).length + ' B']]) +
      SEC('分析结果') + out +
      HINT('Emoji 等非 BMP 字符由两个 UTF-16 单元组成，这里会自动合并为一个码点显示。'),
      items.map(function (it) { return it.ch + ' U+' + it.hex; }).join('\n'));
  }
});

T({ id: 'jsonstat', name: 'JSON 结构统计', cat: 'dev',
  desc: '统计节点数、最大深度、键频次、数组长度与值类型分布', tags: 'json 统计 深度 节点 结构 分析',
  fields: [
    { k: 'json', label: 'JSON 文本', type: 'textarea', rows: 9,
      value: '{"name":"安空工具箱","version":1.6,"offline":true,"cats":["text","dev","calc","life"],"ui":{"theme":"light","accent":"amber","flags":{"dark":false,"rtl":false}},"tools":[{"id":"json","hot":true},{"id":"qrcode","hot":false}],"meta":null}' },
    { k: 'top', label: '键频次显示条数', type: 'text', value: '10' }
  ],
  run: function (v) {
    var obj;
    try { obj = JSON.parse(String(v.json || '')); }
    catch (e) { return R('<div class="note">JSON 解析失败：' + esc(e.message) + '</div>', '错误：' + e.message); }
    var acc = { nodes: 0, depth: 0, keys: {}, types: {}, arrays: [], longest: '', longestD: 0, strLen: 0, strCount: 0 };
    function walk(x, path, d) {
      acc.nodes++;
      if (d > acc.depth) acc.depth = d;
      if (path.length > acc.longestD) { acc.longestD = path.length; acc.longest = path; }
      if (x === null) { acc.types['null'] = (acc.types['null'] || 0) + 1; return; }
      var t = typeof x;
      if (Object.prototype.toString.call(x) === '[object Array]') {
        acc.types['array'] = (acc.types['array'] || 0) + 1;
        acc.arrays.push([path || '(root)', x.length]);
        for (var i = 0; i < x.length; i++) walk(x[i], path + '[' + i + ']', d + 1);
        return;
      }
      if (t === 'object') {
        acc.types['object'] = (acc.types['object'] || 0) + 1;
        Object.keys(x).forEach(function (k) {
          acc.keys[k] = (acc.keys[k] || 0) + 1;
          walk(x[k], path ? path + '.' + k : k, d + 1);
        });
        return;
      }
      acc.types[t] = (acc.types[t] || 0) + 1;
      if (t === 'string') { acc.strCount++; acc.strLen += x.length; }
    }
    walk(obj, '', 1);
    var topN = Math.max(1, Math.min(30, parseInt(v.top, 10) || 10));
    var keys = Object.keys(acc.keys).sort(function (a, b) { return acc.keys[b] - acc.keys[a] || (a < b ? -1 : 1); }).slice(0, topN);
    var types = Object.keys(acc.types).map(function (k) { return [k, String(acc.types[k])]; });
    return R(KV([['总节点数', acc.nodes + ' 个'], ['最大嵌套深度', acc.depth + ' 层'],
      ['对象键种类', Object.keys(acc.keys).length + ' 种'], ['数组个数', acc.arrays.length + ' 个'],
      ['字符串平均长度', acc.strCount ? rnd(acc.strLen / acc.strCount, 1) + ' 字符' : '—'],
      ['最深路径', esc(acc.longest) || '(root)']]) +
      SEC('值类型分布') + TB(['类型', '数量'], types) +
      SEC('高频键（前 ' + topN + '）') + TB(['键名', '出现次数'], keys.map(function (k) { return [k, String(acc.keys[k])]; })) +
      SEC('数组长度') + (acc.arrays.length ? TB(['路径', '长度'], acc.arrays.map(function (a) { return [a[0], String(a[1])]; })) : '<div class="note">没有数组。</div>') +
      HINT('深度从根节点的第 1 层开始计数；路径使用点号与方括号表示。'),
      'nodes=' + acc.nodes + ', depth=' + acc.depth);
  }
});

T({ id: 'cronnext', name: 'Cron 下次执行时间', cat: 'dev',
  desc: '解析 5 段 Cron 表达式，列出未来 N 次执行时间', tags: 'cron 定时任务 计划 表达式 下次执行',
  fields: [
    { k: 'expr', label: 'Cron 表达式（分 时 日 月 周）', type: 'text', value: '*/15 9-18 * * 1-5' },
    { k: 'n', label: '列出次数', type: 'text', value: '8' },
    { k: 'base', label: '起始时间（留空为现在）', type: 'text', value: '', placeholder: '2026-11-15 08:00' }
  ],
  run: function (v) {
    var parts = String(v.expr || '').trim().split(/\s+/);
    if (parts.length !== 5) return R('<div class="note">请输入 5 段 Cron 表达式：分 时 日 月 周</div>', '表达式格式错误');
    function field(str, lo, hi) {
      var set = {};
      String(str).split(',').forEach(function (piece) {
        var step = 1, body = piece, si = piece.indexOf('/');
        if (si >= 0) { step = parseInt(piece.slice(si + 1), 10) || 1; body = piece.slice(0, si); }
        var a, b;
        if (body === '*') { a = lo; b = hi; }
        else if (body.indexOf('-') >= 0) { var ab = body.split('-'); a = parseInt(ab[0], 10); b = parseInt(ab[1], 10); }
        else { a = parseInt(body, 10); b = step > 1 ? hi : a; }
        if (!isFinite(a) || !isFinite(b)) return;
        if (a < lo) a = lo; if (b > hi) b = hi;
        for (var x = a; x <= b; x += step) set[x] = 1;
      });
      return set;
    }
    var MIN = field(parts[0], 0, 59), HR = field(parts[1], 0, 23),
        DOM = field(parts[2], 1, 31), MON = field(parts[3], 1, 12), DOW = field(parts[4], 0, 6);
    if (!Object.keys(MIN).length || !Object.keys(HR).length || !Object.keys(MON).length)
      return R('<div class="note">表达式中有无法解析的字段。</div>', '解析失败');
    var base;
    if (String(v.base || '').trim()) { base = new Date(String(v.base).replace(' ', 'T')); if (isNaN(base.getTime())) base = new Date(); }
    else base = new Date();
    base.setSeconds(0, 0);
    var want = Math.max(1, Math.min(50, parseInt(v.n, 10) || 8)), res = [];
    for (var off = 0; off < 800 && res.length < want; off++) {
      var day = new Date(base.getFullYear(), base.getMonth(), base.getDate() + off, 0, 0, 0, 0);
      if (!MON[day.getMonth() + 1]) continue;
      if (!DOM[day.getDate()]) continue;
      if (!DOW[day.getDay()]) continue;
      for (var h = 0; h < 24 && res.length < want; h++) {
        if (!HR[h]) continue;
        for (var mi = 0; mi < 60 && res.length < want; mi++) {
          if (!MIN[mi]) continue;
          var t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, mi, 0, 0);
          if (t.getTime() <= base.getTime()) continue;
          var wk = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][t.getDay()];
          res.push([fmtDate(t), wk, String(off)]);
        }
      }
    }
    var body = res.length ? TB(['序号', '执行时间', '星期', '距起始天数'], res.map(function (r, i) {
      return [String(i + 1), r[0], r[1], r[2] + ' 天'];
    })) : '<div class="note">未来 800 天内没有匹配的执行时间，请检查表达式。</div>';
    return R(KV([['表达式', esc(v.expr)], ['起始时间', fmtDate(base)],
      ['匹配分钟', Object.keys(MIN).length + ' 个/小时'], ['匹配小时', Object.keys(HR).length + ' 个/天'],
      ['列出次数', res.length + ' 次']]) + SEC('未来执行时间') + body +
      HINT('支持 * 、数字、范围 1-5、步长 */15、列表 1,3,5 及组合；周日为 0，按系统本地时区计算。'),
      res.map(function (r) { return r[0]; }).join('\n'));
  }
});

/* ============================================================
   三、计算换算（7）
   ============================================================ */

T({ id: 'unitflow', name: '带宽流量换算', cat: 'calc',
  desc: 'bps / MB/s 互算，估算下载时间与月度流量', tags: '带宽 网速 流量 bps 下载时间 MB GB 换算',
  fields: [
    { k: 'val', label: '数值', type: 'text', value: '100' },
    { k: 'unit', label: '输入单位', type: 'select', value: 'Mbps', options: [
      ['bps', 'bps'], ['Kbps', 'Kbps'], ['Mbps', 'Mbps'], ['Gbps', 'Gbps'],
      ['Bps', 'B/s'], ['KBps', 'KB/s'], ['MBps', 'MB/s'] ] },
    { k: 'file', label: '待下载文件大小（GB）', type: 'text', value: '4.5' },
    { k: 'days', label: '月度天数', type: 'text', value: '30' }
  ],
  run: function (v) {
    var x = pnum(v.val, 0), u = v.unit, bps;
    var factors = { bps: 1, Kbps: 1e3, Mbps: 1e6, Gbps: 1e9,
      Bps: 8, KBps: 8 * 1024, MBps: 8 * 1024 * 1024 };
    bps = x * (factors[u] || 1);
    var Bps = bps / 8;
    var fileGB = pnum(v.file, 0), days = Math.max(1, pnum(v.days, 30));
    var sec = fileGB > 0 ? (fileGB * 1024 * 1024 * 1024) / Bps : 0;
    function dur(s) {
      if (!isFinite(s) || s <= 0) return '—';
      if (s < 60) return rnd(s, 1) + ' 秒';
      if (s < 3600) return rnd(s / 60, 1) + ' 分钟';
      if (s < 86400) return rnd(s / 3600, 2) + ' 小时';
      return rnd(s / 86400, 2) + ' 天';
    }
    var monthBytes = Bps * 86400 * days;
    var rows = [
      ['比特率', num(bps, 2) + ' bps / ' + num(bps / 1e6, 3) + ' Mbps'],
      ['字节速率', num(Bps / 1024, 2) + ' KB/s / ' + num(Bps / 1048576, 3) + ' MB/s'],
      ['每小时流量', num(Bps * 3600 / 1073741824, 3) + ' GB（' + num(Bps * 3600 / 1e9, 2) + ' GB 十进制）'],
      ['每日流量', num(Bps * 86400 / 1073741824, 2) + ' GiB'],
      [days + ' 天理论流量', num(monthBytes / 1099511627776, 3) + ' TiB / ' + num(monthBytes / 1e12, 2) + ' TB'],
      ['下载 ' + fileGB + ' GB', dur(sec)]
    ];
    var cmp = [['1 Mbps', 1e6], ['10 Mbps', 1e7], ['100 Mbps', 1e8], ['1 Gbps', 1e9]].map(function (r) {
      return [r[0], num(r[1] / 8 / 1048576, 2) + ' MB/s', dur(fileGB * 1073741824 / (r[1] / 8))];
    });
    return R(KV([['输入', num(x, 3) + ' ' + u], ['等效比特率', num(bps, 2) + ' bps'], ['下载文件大小', fileGB + ' GB']]) +
      SEC('换算结果') + KV(rows) + SEC('常见带宽对比') + TB(['带宽', '理论下载速度', '下载用时'], cmp) +
      HINT('按 1 Byte = 8 bit、1 GiB = 1024³ Byte 计算；实际速度受协议开销、磁盘与服务器限速影响。'),
      rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n'));
  }
});

T({ id: 'tempconv', name: '温度换算', cat: 'calc',
  desc: '摄氏 / 华氏 / 开尔文 / 兰氏四温标互转并列出参考点', tags: '温度 摄氏 华氏 开尔文 兰氏 换算',
  fields: [
    { k: 'val', label: '温度数值', type: 'text', value: '25' },
    { k: 'from', label: '输入温标', type: 'select', value: 'C', options: [
      ['C', '摄氏 °C'], ['F', '华氏 °F'], ['K', '开尔文 K'], ['R', '兰氏 °R'] ] }
  ],
  run: function (v) {
    var x = pnum(v.val, 0), C;
    if (v.from === 'C') C = x;
    else if (v.from === 'F') C = (x - 32) * 5 / 9;
    else if (v.from === 'K') C = x - 273.15;
    else C = (x - 491.67) * 5 / 9;
    var F = C * 9 / 5 + 32, K = C + 273.15, Ra = F + 459.67;
    var ref = [
      ['绝对零度', -273.15, -459.67, 0, 0],
      ['水的冰点', 0, 32, 273.15, 491.67],
      ['人体正常体温', 37, 98.6, 310.15, 558.27],
      ['水的沸点', 100, 212, 373.15, 671.67]
    ];
    return R(KV([['输入', num(x, 3) + ' ' + v.from],
      ['摄氏 °C', num(C, 3) + ' °C'], ['华氏 °F', num(F, 3) + ' °F'],
      ['开尔文 K', num(K, 3) + ' K'], ['兰氏 °R', num(Ra, 3) + ' °R'],
      ['状态提示', K < 0 ? '低于绝对零度，物理上不存在' : (C < 0 ? '低于冰点' : C > 100 ? '高于水的沸点' : '常温区间')]]) +
      SEC('常用参考点') + TB(['参考点', '°C', '°F', 'K', '°R'], ref.map(function (r) {
        return [r[0], num(r[1], 2), num(r[2], 2), num(r[3], 2), num(r[4], 2)];
      })) + HINT('°F = °C × 9/5 + 32；K = °C + 273.15；°R = °F + 459.67。'),
      'C=' + num(C, 3) + ', F=' + num(F, 3) + ', K=' + num(K, 3));
  }
});

T({ id: 'angleconv', name: '角度与三角换算', cat: 'calc',
  desc: '度 / 弧度 / 梯度 / 密位互转，并计算三角函数值', tags: '角度 弧度 梯度 密位 sin cos tan 三角函数',
  fields: [
    { k: 'val', label: '角度数值', type: 'text', value: '45' },
    { k: 'from', label: '输入单位', type: 'select', value: 'deg', options: [
      ['deg', '度 °'], ['rad', '弧度 rad'], ['grad', '梯度 gon'], ['mil', '密位 mil'] ] }
  ],
  run: function (v) {
    var x = pnum(v.val, 0), deg;
    if (v.from === 'deg') deg = x;
    else if (v.from === 'rad') deg = x * 180 / Math.PI;
    else if (v.from === 'grad') deg = x * 0.9;
    else deg = x * 9 / 160;
    var rad = deg * Math.PI / 180;
    var norm = ((deg % 360) + 360) % 360;
    var quad = norm < 90 ? '第一象限' : norm < 180 ? '第二象限' : norm < 270 ? '第三象限' : '第四象限';
    var f = function (n) { return isFinite(n) ? num(n, 6) : '无定义'; };
    var table = [['sin', Math.sin(rad)], ['cos', Math.cos(rad)], ['tan', Math.tan(rad)],
      ['cot', 1 / Math.tan(rad)], ['sec', 1 / Math.cos(rad)], ['csc', 1 / Math.sin(rad)]];
    var common = [[0, '0°'], [30, '30°'], [45, '45°'], [60, '60°'], [90, '90°'], [180, '180°'], [270, '270°'], [360, '360°']];
    return R(KV([['输入', num(x, 4) + ' ' + v.from],
      ['度 °', num(deg, 5)], ['弧度 rad', num(rad, 6)],
      ['梯度 gon', num(deg * 10 / 9, 5)], ['密位 mil', num(deg * 160 / 9, 4)],
      ['归一化角度', num(norm, 3) + '° · ' + quad]]) +
      SEC('三角函数值') + TB(['函数', '数值'], table.map(function (r) { return [r[0], f(r[1])]; })) +
      SEC('常见角速查') + TB(['角度', '弧度', '梯度', '密位', 'sin'], common.map(function (r) {
        var rr = r[0] * Math.PI / 180;
        return [r[1], num(rr, 5), num(r[0] * 10 / 9, 3), num(r[0] * 160 / 9, 2), f(Math.sin(rr))];
      })) + HINT('密位采用 NATO 标准 6400 mil = 360°；1 gon = 0.9°。'),
      'deg=' + num(deg, 5) + ', rad=' + num(rad, 6));
  }
});

T({ id: 'powercalc', name: '功率能耗电费', cat: 'calc',
  desc: '按功率与使用时长算电费，或按电池容量估算续航', tags: '功率 电费 能耗 kwh 电池 续航 用电',
  fields: [
    { k: 'w', label: '设备功率（W）', type: 'text', value: '120' },
    { k: 'hours', label: '每天使用小时', type: 'text', value: '8' },
    { k: 'days', label: '计费天数', type: 'text', value: '30' },
    { k: 'price', label: '电价（元 / 度）', type: 'text', value: '0.62' },
    { k: 'capacity', label: '电池容量（mAh）', type: 'text', value: '5000' },
    { k: 'voltage', label: '电池电压（V）', type: 'text', value: '3.85' },
    { k: 'mode', label: '计算模式', type: 'select', value: 'cost', options: [
      ['cost', '电费与能耗'], ['battery', '电池续航'], ['compare', '不同功率对比'] ] }
  ],
  run: function (v) {
    var w = pnum(v.w, 0), h = pnum(v.hours, 0), d = Math.max(1, pnum(v.days, 30)), price = pnum(v.price, 0);
    var cap = pnum(v.capacity, 0), volt = pnum(v.voltage, 3.85);
    var kwh = w * h * d / 1000, fee = kwh * price, year = fee * 365 / d;
    var wh = cap * volt / 1000, runtime = w > 0 ? wh / (w / 1000) : 0;
    var rows = [
      ['每天耗电', num(w * h / 1000, 3) + ' kWh'],
      [d + ' 天耗电', num(kwh, 3) + ' 度'],
      ['电费合计', '¥ ' + money(fee)],
      ['年化电费', '¥ ' + money(year)],
      ['电池能量', num(wh, 2) + ' Wh'],
      ['理论续航', num(runtime, 2) + ' 小时（' + rnd(runtime / 24, 2) + ' 天）']
    ];
    var extra = '';
    if (v.mode === 'compare') {
      var list = [[5, '待机 / 传感器'], [25, '轻负载'], [60, '中等负载'], [120, '高负载'], [300, '满载']];
      extra = SEC('不同功率下的续航与电费') + TB(['功率', '场景', '续航（小时）', d + ' 天电费'], list.map(function (r) {
        return [r[0] + ' W', r[1], num(wh / (r[0] / 1000), 1), '¥ ' + money(r[0] * h * d / 1000 * price)];
      }));
    } else if (v.mode === 'battery') {
      extra = SEC('续航换算') + KV([
        ['能量', num(wh, 2) + ' Wh = ' + num(wh * 3600, 0) + ' J'],
        ['每小时耗电', num(w / 1000, 3) + ' kWh'],
        ['可用时长', num(runtime, 2) + ' 小时'],
        ['考虑 85% 转换效率', num(runtime * 0.85, 2) + ' 小时']
      ]);
    } else {
      extra = SEC('阶梯估算') + TB(['周期', '耗电', '电费'], [
        ['1 天', num(w * h / 1000, 3) + ' 度', '¥ ' + money(w * h / 1000 * price)],
        [d + ' 天', num(kwh, 3) + ' 度', '¥ ' + money(fee)],
        ['1 年', num(kwh * 365 / d, 2) + ' 度', '¥ ' + money(year)]
      ]);
    }
    return R(KV([['设备功率', num(w, 2) + ' W'], ['每天使用', num(h, 2) + ' 小时'],
      ['电价', '¥ ' + num(price, 3) + ' / 度'], ['电池', cap + ' mAh × ' + volt + ' V']]) +
      SEC('综合结果') + KV(rows) + extra +
      HINT('1 度电 = 1 kWh；电池续航未计入转换损耗，实际一般按 80%~90% 估算。'),
      rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n'));
  }
});

T({ id: 'loancompare', name: '等额本息 / 本金对比', cat: 'calc',
  desc: '对比两种还款方式的总利息与前 12 期还款计划', tags: '房贷 贷款 等额本息 等额本金 利息 还款计划',
  fields: [
    { k: 'principal', label: '贷款本金（元）', type: 'text', value: '1000000' },
    { k: 'rate', label: '年利率（%）', type: 'text', value: '4.2' },
    { k: 'months', label: '贷款期数（月）', type: 'text', value: '360' }
  ],
  run: function (v) {
    var P = pnum(v.principal, 0), ar = pnum(v.rate, 0), n = Math.max(1, Math.min(480, parseInt(v.months, 10) || 360));
    var r = ar / 100 / 12;
    var pay;
    if (r === 0) pay = P / n;
    else pay = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    var totalA = pay * n, interestA = totalA - P;
    var interestB = P * r * (n + 1) / 2, totalB = P + interestB;
    var rows = [], remA = P, remB = P;
    for (var i = 1; i <= Math.min(12, n); i++) {
      var intA = remA * r, prinA = pay - intA; remA -= prinA;
      var prinB = P / n, intB = remB * r; remB -= prinB;
      rows.push([String(i), money(pay), money(intA), money(prinA), money(prinB + intB), money(intB)]);
    }
    return R(KV([['贷款本金', '¥ ' + money(P)], ['年利率', num(ar, 3) + '%（月利率 ' + num(r * 100, 4) + '%）'],
      ['期数', n + ' 期（' + rnd(n / 12, 1) + ' 年）'],
      ['等额本息月供', '¥ ' + money(pay)], ['等额本息总利息', '¥ ' + money(interestA)],
      ['等额本金首月', '¥ ' + money(P / n + P * r)], ['等额本金总利息', '¥ ' + money(interestB)],
      ['两种方式利息差', '¥ ' + money(Math.abs(interestA - interestB)) + '（' + (interestA > interestB ? '等额本金更省' : '等额本息更省') + '）']]) +
      SEC('前 ' + Math.min(12, n) + ' 期还款对比') +
      TB(['期数', '本息月供', '本息利息', '本息本金', '本金月供', '本金利息'], rows) +
      HINT('等额本息月供固定；等额本金每月偿还相同本金，月供逐月递减。结果未计入 LPR 调整、提前还款与手续费。'),
      'A monthly=' + money(pay) + ', A interest=' + money(interestA) + ', B interest=' + money(interestB));
  }
});

T({ id: 'margin', name: '毛利率与定价', cat: 'calc',
  desc: '毛利率、加价率互算，按目标率反推售价与含税价', tags: '毛利率 加价率 定价 成本 售价 盈亏平衡',
  fields: [
    { k: 'cost', label: '单位成本（元）', type: 'text', value: '68' },
    { k: 'price', label: '当前售价（元）', type: 'text', value: '99' },
    { k: 'basis', label: '目标率类型', type: 'select', value: 'margin', options: [
      ['margin', '毛利率（占售价）'], ['markup', '加价率（占成本）'] ] },
    { k: 'target', label: '目标率（%）', type: 'text', value: '40' },
    { k: 'tax', label: '税率（%）', type: 'text', value: '13' },
    { k: 'mode', label: '计算模式', type: 'select', value: 'both', options: [
      ['both', '全部'], ['fromPrice', '由成本与售价算利润率'], ['fromRate', '由目标率反推售价'] ] }
  ],
  run: function (v) {
    var cost = pnum(v.cost, 0), price = pnum(v.price, 0), target = pnum(v.target, 0) / 100, tax = pnum(v.tax, 0) / 100;
    var profit = price - cost;
    var margin = price > 0 ? profit / price : 0;
    var markup = cost > 0 ? profit / cost : 0;
    var suggest;
    if (v.basis === 'margin') suggest = target >= 1 ? Infinity : cost / (1 - target);
    else suggest = cost * (1 + target);
    var taxPrice = isFinite(suggest) ? suggest * (1 + tax) : Infinity;
    var rows = [
      ['单位成本', '¥ ' + money(cost)], ['当前售价', '¥ ' + money(price)],
      ['单位毛利', '¥ ' + money(profit)], ['毛利率', num(margin * 100, 2) + '%'],
      ['加价率', num(markup * 100, 2) + '%'],
      ['目标' + (v.basis === 'margin' ? '毛利率' : '加价率'), num(target * 100, 2) + '%'],
      ['建议售价', isFinite(suggest) ? '¥ ' + money(suggest) : '不可达（目标率 ≥ 100%）'],
      ['建议售价含税', isFinite(taxPrice) ? '¥ ' + money(taxPrice) : '—'],
      ['盈亏平衡售价', '¥ ' + money(cost)],
      ['每件税额（按建议价）', isFinite(suggest) ? '¥ ' + money(suggest * tax) : '—']
    ];
    var grid = [];
    [20, 30, 40, 50, 60].forEach(function (t) {
      var pm = cost / (1 - t / 100), pk = cost * (1 + t / 100);
      grid.push([t + '%', money(pm), money(pk), money(pm - cost), money(pk - cost)]);
    });
    return R(KV(rows) + SEC('不同目标率对照') +
      TB(['目标率', '按毛利率定价', '按加价率定价', '毛利（毛利率）', '毛利（加价率）'], grid) +
      HINT('毛利率 = 毛利 ÷ 售价；加价率 = 毛利 ÷ 成本。同样 40% 的目标，按毛利率定价会明显高于按加价率定价。'),
      rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n'));
  }
});

T({ id: 'agecalc', name: '精确年龄计算', cat: 'calc',
  desc: '由出生日期算周岁、生活天数、下次生日、生肖与星座', tags: '年龄 周岁 生日 生肖 星座 天数 计算',
  fields: [
    { k: 'birth', label: '出生日期', type: 'date', value: '1995-06-15' },
    { k: 'today', label: '计算基准日（留空为今天）', type: 'date', value: '' }
  ],
  run: function (v) {
    function pd(s) { var d = new Date(String(s) + 'T00:00:00'); return isNaN(d.getTime()) ? null : d; }
    var b = pd(v.birth), t = v.today ? pd(v.today) : new Date();
    if (!b || !t) return R('<div class="note">请填写有效的日期。</div>', '日期无效');
    t = new Date(t.getFullYear(), t.getMonth(), t.getDate());
    if (t < b) return R('<div class="note">基准日不能早于出生日期。</div>', '日期顺序错误');
    var years = t.getFullYear() - b.getFullYear();
    var had = (t.getMonth() > b.getMonth()) || (t.getMonth() === b.getMonth() && t.getDate() >= b.getDate());
    if (!had) years--;
    var days = Math.round((t.getTime() - b.getTime()) / 86400000);
    var months = years * 12 + (t.getMonth() - b.getMonth() + 12) % 12;
    var next = new Date(t.getFullYear(), b.getMonth(), b.getDate());
    if (next.getTime() < t.getTime()) next = new Date(t.getFullYear() + 1, b.getMonth(), b.getDate());
    var toNext = Math.round((next.getTime() - t.getTime()) / 86400000);
    var zodiac = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'][((b.getFullYear() - 4) % 12 + 12) % 12];
    var bounds = [[1, 20, '水瓶座'], [2, 19, '双鱼座'], [3, 21, '白羊座'], [4, 20, '金牛座'],
      [5, 21, '双子座'], [6, 22, '巨蟹座'], [7, 23, '狮子座'], [8, 23, '处女座'],
      [9, 23, '天秤座'], [10, 24, '天蝎座'], [11, 23, '射手座'], [12, 22, '摩羯座']];
    var md = b.getMonth() + 1, dd = b.getDate(), sign = '摩羯座';
    for (var i = 0; i < bounds.length; i++) {
      if (md > bounds[i][0] || (md === bounds[i][0] && dd >= bounds[i][1])) sign = bounds[i][2];
    }
    var hundred = new Date(b.getFullYear() + 100, b.getMonth(), b.getDate());
    var to100 = Math.round((hundred.getTime() - t.getTime()) / 86400000);
    return R(KV([['出生日期', v.birth], ['基准日期', t.getFullYear() + '-' + pad2(t.getMonth() + 1) + '-' + pad2(t.getDate())],
      ['周岁', years + ' 岁' + (had ? '（今年生日已过）' : '（今年生日未到）')],
      ['月龄', months + ' 个月'], ['已生活', days + ' 天（约 ' + rnd(days / 365.2425, 2) + ' 年）'],
      ['下次生日', next.getFullYear() + '-' + pad2(next.getMonth() + 1) + '-' + pad2(next.getDate()) + '（还有 ' + toNext + ' 天）'],
      ['生肖', zodiac + '年'], ['星座', sign],
      ['距 100 岁', to100 > 0 ? to100 + ' 天（约 ' + rnd(to100 / 365.2425, 1) + ' 年）' : '已超过']]) +
      HINT('周岁按是否已过当年生日计算；生活天数按本地日历日差，星座按常见日期分界。'),
      'age=' + years + ', days=' + days + ', zodiac=' + zodiac);
  }
});

})();
