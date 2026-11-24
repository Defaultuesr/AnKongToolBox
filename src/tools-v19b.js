/* ============================================================
   安空工具箱 — v1.9 工具包（二）文本处理与密码学 14 个
   纯离线、ES5 兼容写法
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

/* 15. 智能折行排版 */
T({ id: 'textwrap', name: '智能折行排版', cat: 'text',
  desc: '按指定宽度折行，支持中英文混排与首行缩进',
  tags: '折行 换行 排版 wrap 文本整理',
  fields: [
    { k: 'text', label: '文本', type: 'textarea', rows: 5, value: '这是一个中英文混排的文本示例 Hello World，用于演示智能折行排版效果。' },
    { k: 'width', label: '每行宽度（字符）', type: 'text', value: '20' },
    { k: 'indent', label: '首行缩进（空格数）', type: 'text', value: '0' }
  ],
  run: function (v) {
    var w = Math.max(4, Math.floor(parseFloat(v.width) || 20));
    var ind = Math.max(0, Math.floor(parseFloat(v.indent) || 0));
    var text = String(v.text || '').replace(/\r/g, '');
    var paras = text.split('\n'), out = [];
    paras.forEach(function (p) {
      if (!p.trim()) { out.push(''); return; }
      // 按字符计数折行（中文算1，简单处理）
      var line = '', count = 0;
      for (var i = 0; i < p.length; i++) {
        line += p.charAt(i); count++;
        if (count >= w) { out.push(line); line = ''; count = 0; }
      }
      if (line) out.push(line);
    });
    if (ind) out = out.map(function (l, i) { return new Array(ind + 1).join(' ') + l; });
    return R(SEC('折行结果（宽度 ' + w + '）') + PRE(out.join('\n')));
  }});

/* 16. 缩进批量调整 */
T({ id: 'indenttool', name: '缩进批量调整', cat: 'text',
  desc: '为多行文本批量增加或减少缩进',
  tags: '缩进 批量 代码整理 indent',
  fields: [
    { k: 'text', label: '文本', type: 'textarea', rows: 5, value: '第一行\n第二行\n第三行' },
    { k: 'mode', label: '操作', type: 'select', value: 'add', options: [['add', '增加缩进'], ['remove', '减少缩进']] },
    { k: 'unit', label: '缩进单位', type: 'select', value: 'space2', options: [['space2', '2 空格'], ['space4', '4 空格'], ['tab', 'Tab']] }
  ],
  run: function (v) {
    var unit = v.unit === 'tab' ? '\t' : new Array((v.unit === 'space4' ? 4 : 2) + 1).join(' ');
    var out = lines(v.text).map(function (l) {
      if (!l.trim()) return l;
      if (v.mode === 'add') return unit + l;
      // remove
      if (l.indexOf(unit) === 0) return l.slice(unit.length);
      return l.replace(/^\s/, '');
    });
    return R(PRE(out.join('\n')));
  }});

/* 17. 高级行排序 */
T({ id: 'sortlines', name: '高级行排序去重', cat: 'text',
  desc: '多行文本按拼音/数字/长度/随机排序，支持去重与反向',
  tags: '排序 去重 行排序 sort uniq',
  fields: [
    { k: 'text', label: '文本（每行一项）', type: 'textarea', rows: 5, value: '香蕉\n苹果\n橙子\n葡萄\n苹果' },
    { k: 'by', label: '排序依据', type: 'select', value: 'locale', options: [
      ['locale', '默认字典序'], ['len', '按长度'], ['num', '按数值'], ['random', '随机打乱'], ['none', '不排序'] ] },
    { k: 'uniq', label: '去重', type: 'select', value: '1', options: [['1', '去重'], ['0', '保留重复']] },
    { k: 'rev', label: '反向', type: 'select', value: '0', options: [['0', '正序'], ['1', '倒序']] }
  ],
  run: function (v) {
    var arr = lines(v.text).filter(function (l) { return l.length; });
    if (v.uniq === '1') { var seen = {}; arr = arr.filter(function (l) { if (seen[l]) return false; seen[l] = 1; return true; }); }
    if (v.by === 'locale') arr.sort(function (a, b) { return a.localeCompare(b, 'zh-CN'); });
    else if (v.by === 'len') arr.sort(function (a, b) { return a.length - b.length; });
    else if (v.by === 'num') arr.sort(function (a, b) { return (parseFloat(a) || 0) - (parseFloat(b) || 0); });
    else if (v.by === 'random') arr.sort(function () { return Math.random() - 0.5; });
    if (v.rev === '1') arr.reverse();
    return R(SEC('共 ' + arr.length + ' 行') + PRE(arr.join('\n')));
  }});

/* 18. 词频统计（中文分词近似）*/
T({ id: 'wordfreq', name: '词频统计', cat: 'text',
  desc: '统计英文单词与中文字符出现频率，输出排行',
  tags: '词频 统计 频率 word frequency',
  fields: [
    { k: 'text', label: '文本', type: 'textarea', rows: 6, value: 'hello world hello tool box world hello' },
    { k: 'type', label: '统计模式', type: 'select', value: 'word', options: [['word', '英文单词'], ['char', '中文字符'], ['both', '混合']] },
    { k: 'top', label: '显示前 N 名', type: 'text', value: '20' }
  ],
  run: function (v) {
    var text = String(v.text || '').toLowerCase(), m = {}, top = Math.max(1, Math.floor(parseFloat(v.top) || 20));
    var tokens = [];
    if (v.type === 'word' || v.type === 'both') tokens = tokens.concat(text.match(/[a-z][a-z0-9']*/g) || []);
    if (v.type === 'char' || v.type === 'both') tokens = tokens.concat(text.match(/[\u4e00-\u9fff]/g) || []);
    tokens.forEach(function (t) { m[t] = (m[t] || 0) + 1; });
    var arr = Object.keys(m).map(function (k) { return [k, m[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
    if (!arr.length) return R(HINT('未找到可统计的词'));
    var rows = arr.slice(0, top).map(function (x, i) { return [i + 1, x[0], String(x[1])]; });
    return R(SEC('不同词 ' + arr.length + ' 个，总计 ' + tokens.length + ' 次') + TB(['#', '词', '次数'], rows));
  }});

/* 19. N-Gram 生成 */
T({ id: 'ngram', name: 'N-Gram 序列生成', cat: 'text',
  desc: '生成文本的二元/三元词组，用于文本分析',
  tags: 'ngram bigram trigram 词组 文本分析',
  fields: [
    { k: 'text', label: '文本', type: 'textarea', rows: 4, value: 'the quick brown fox jumps' },
    { k: 'n', label: 'N 值（1~5）', type: 'text', value: '2' }
  ],
  run: function (v) {
    var n = Math.max(1, Math.min(5, Math.floor(parseFloat(v.n) || 2)));
    var toks = String(v.text || '').toLowerCase().match(/[a-z0-9\u4e00-\u9fff]+/g) || [];
    var grams = [];
    for (var i = 0; i + n <= toks.length; i++) grams.push(toks.slice(i, i + n).join(' '));
    return R(SEC(n + '-Gram（共 ' + grams.length + ' 个）') + PRE(grams.join('\n')));
  }});

/* 20. 文本可读性 */
T({ id: 'readability', name: '文本可读性分析', cat: 'text',
  desc: '计算字数、句数、平均句长与中文易读性指标',
  tags: '可读性 字数 句长 文本分析 readability',
  fields: [{ k: 'text', label: '文本', type: 'textarea', rows: 6, value: '这是一个可读性分析的示例。句子应该简洁明了。太长的句子会降低可读性。' }],
  run: function (v) {
    var text = String(v.text || '').trim();
    var chars = text.replace(/\s/g, '').length;
    var sentences = (text.match(/[。！？.!?]+/g) || []).length || (text ? 1 : 0);
    var words = (text.match(/[a-zA-Z]+/g) || []).length;
    var zh = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    var avg = sentences ? chars / sentences : 0;
    var level = avg < 15 ? '易读' : avg < 25 ? '适中' : '偏难';
    return R(SEC('文本统计') + KV([
      ['总字符（不含空格）', String(chars)],
      ['中文字符', String(zh)],
      ['英文单词', String(words)],
      ['句子数', String(sentences)],
      ['平均句长', num(avg, 1) + ' 字'],
      ['可读性评估', '<b>' + level + '</b>']
    ]) + HINT('平均句长越短越易读。建议中文句子控制在 15~25 字以内。'));
  }});

/* 21. 哈希可视化 */
T({ id: 'hashviz', name: '哈希值可视化', cat: 'dev',
  desc: '把文本的哈希指纹渲染成色块与位图，直观对比差异',
  tags: '哈希 可视化 MD5 位图 colorhash 指纹',
  fields: [{ k: 'text', label: '文本', type: 'textarea', rows: 3, value: '安空工具箱' }],
  run: function (v) {
    var text = String(v.text || '');
    var md5 = H.md5(text);
    var fingerprint2 = H.md5(text + '\u00b7AK19'); // 加盐二次指纹（同步）
    // 把哈希前 36 位（18 字节）渲染成 6x6 色块
    var bytes = [], i;
    for (i = 0; i < md5.length - 1; i += 2) bytes.push(parseInt(md5.substr(i, 2), 16));
    var cells = '';
    for (i = 0; i < 36; i++) {
      var b = bytes[i % bytes.length];
      var r = (b * 7) % 256, g = (b * 13) % 256, bl = (b * 29) % 256;
      cells += '<span style="display:inline-block;width:22px;height:22px;background:rgb(' + r + ',' + g + ',' + bl + ');margin:1px;border-radius:3px"></span>';
      if ((i + 1) % 6 === 0) cells += '<br>';
    }
    return R(SEC('MD5 指纹') + PRE(md5) + SEC('加盐指纹') + PRE(fingerprint2) +
      SEC('哈希色块指纹') + '<div style="line-height:0">' + cells + '</div>' +
      HINT('相同文本总是产生相同色块；微小改动会导致完全不同的图案（雪崩效应）。'));
  }});

/* 22. BBCode 转换 */
T({ id: 'bbcode', name: 'BBCode 与 Markdown 互转', cat: 'text',
  desc: '在 BBCode 与 Markdown 之间转换常见标记',
  tags: 'BBCode Markdown 论坛 格式转换',
  fields: [
    { k: 'text', label: '文本', type: 'textarea', rows: 5, value: '[b]粗体[/b] [i]斜体[/i] [url=https://example.com]链接[/url]' },
    { k: 'dir', label: '方向', type: 'select', value: 'bb2md', options: [['bb2md', 'BBCode → Markdown'], ['md2bb', 'Markdown → BBCode']] }
  ],
  run: function (v) {
    var s = String(v.text || '');
    if (v.dir === 'bb2md') {
      s = s.replace(/\[b\](.*?)\[\/b\]/gi, '**$1**')
           .replace(/\[i\](.*?)\[\/i\]/gi, '*$1*')
           .replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>')
           .replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, '[$2]($1)')
           .replace(/\[url\](.*?)\[\/url\]/gi, '<$1>')
           .replace(/\[img\](.*?)\[\/img\]/gi, '![]($1)')
           .replace(/\[code\](.*?)\[\/code\]/gi, '`$1`')
           .replace(/\[quote\](.*?)\[\/quote\]/gi, '> $1');
    } else {
      s = s.replace(/\*\*(.*?)\*\*/g, '[b]$1[/b]')
           .replace(/\*([^*\n]+)\*/g, '[i]$1[/i]')
           .replace(/\[(.*?)\]\((.*?)\)/g, '[url=$2]$1[/url]')
           .replace(/!\[(.*?)\]\((.*?)\)/g, '[img]$2[/img]')
           .replace(/`([^`]+)`/g, '[code]$1[/code]')
           .replace(/^> (.*)$/gm, '[quote]$1[/quote]');
    }
    return R(PRE(s));
  }});

/* 23. Markdown 转义 */
T({ id: 'markdownesc', name: 'Markdown 特殊字符转义', cat: 'text',
  desc: '转义或反转义 Markdown 特殊字符',
  tags: 'Markdown 转义 escape 特殊字符',
  fields: [
    { k: 'text', label: '文本', type: 'textarea', rows: 4, value: '*粗体* #标题 [链接] `代码`' },
    { k: 'dir', label: '方向', type: 'select', value: 'esc', options: [['esc', '转义'], ['unesc', '反转义']] }
  ],
  run: function (v) {
    var s = String(v.text || '');
    var chars = '\\`*_{}[]()#+-.!|>';
    if (v.dir === 'esc') {
      s = s.replace(/([\\`*_{}\[\]()#+\-.!|>])/g, '\\$1');
    } else {
      s = s.replace(/\\([\\`*_{}\[\]()#+\-.!|>])/g, '$1');
    }
    return R(PRE(s));
  }});

/* 24. CSV 转 Markdown 表格 */
T({ id: 'csvtomd', name: 'CSV 转 Markdown 表格', cat: 'dev',
  desc: '把 CSV 数据转换为 Markdown 表格语法',
  tags: 'CSV Markdown 表格 转换',
  fields: [
    { k: 'text', label: 'CSV 内容', type: 'textarea', rows: 5, value: '姓名,年龄,城市\n张三,25,北京\n李四,30,上海' },
    { k: 'sep', label: '分隔符', type: 'text', value: ',' }
  ],
  run: function (v) {
    var sep = v.sep || ',';
    var rows = lines(v.text).filter(function (l) { return l.trim(); }).map(function (l) { return l.split(sep); });
    if (!rows.length) return R(HINT('无数据'));
    var cols = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    var out = [];
    rows.forEach(function (r, i) {
      var cells = [];
      for (var j = 0; j < cols; j++) cells.push((r[j] || '').trim());
      out.push('| ' + cells.join(' | ') + ' |');
      if (i === 0) out.push('| ' + cells.map(function () { return '---'; }).join(' | ') + ' |');
    });
    return R(SEC('Markdown 表格') + PRE(out.join('\n')));
  }});

/* 25. 经典密码：Atbash */
T({ id: 'atbash', name: 'Atbash 字母反转密码', cat: 'text',
  desc: 'A↔Z、B↔Y 的字母表反转加密解密',
  tags: 'Atbash 密码 字母反转 古典密码',
  fields: [{ k: 'text', label: '文本', type: 'textarea', rows: 4, value: 'Hello World' }],
  run: function (v) {
    var s = String(v.text || '');
    var out = s.replace(/[a-z]/g, function (c) { return String.fromCharCode(219 - c.charCodeAt(0)); })
               .replace(/[A-Z]/g, function (c) { return String.fromCharCode(155 - c.charCodeAt(0)); });
    return R(SEC('Atbash 结果') + PRE(out));
  }});

/* 26. 仿射密码 */
T({ id: 'affine', name: '仿射密码', cat: 'text',
  desc: '仿射变换加密解密，可调乘数 a 与加数 b',
  tags: '仿射密码 affine 古典密码 加密',
  fields: [
    { k: 'text', label: '文本（仅字母）', type: 'text', value: 'AFFINE' },
    { k: 'a', label: '乘数 a（须与26互质）', type: 'text', value: '5' },
    { k: 'b', label: '加数 b', type: 'text', value: '8' },
    { k: 'dir', label: '方向', type: 'select', value: 'enc', options: [['enc', '加密'], ['dec', '解密']] }
  ],
  run: function (v) {
    var a = Math.floor(parseFloat(v.a) || 5), b = Math.floor(parseFloat(v.b) || 8);
    function gcd(x, y) { while (y) { var t = x % y; x = y; y = t; } return Math.abs(x); }
    if (gcd(a, 26) !== 1) return R(HINT('乘数 a 必须与 26 互质（如 3,5,7,9,11,15,17,19,21,23,25）'));
    var s = String(v.text || '').toUpperCase();
    var inv = 0;
    for (var i = 0; i < 26; i++) if ((a * i) % 26 === 1) { inv = i; break; }
    var out = s.replace(/[A-Z]/g, function (c) {
      var x = c.charCodeAt(0) - 65;
      var y = v.dir === 'enc' ? (a * x + b) % 26 : (inv * (x - b) % 26 + 26) % 26;
      return String.fromCharCode(65 + y);
    });
    return R(SEC('结果（a=' + a + ', b=' + b + '）') + PRE(out) + HINT('a 的模逆元 = ' + inv));
  }});

/* 27. 波利比乌斯方阵 */
T({ id: 'polybius', name: '波利比乌斯方阵密码', cat: 'text',
  desc: '把字母映射为行列坐标（如 11=A）的古典密码',
  tags: '波利比乌斯 polybius 坐标 古典密码',
  fields: [{ k: 'text', label: '文本', type: 'text', value: 'HELLO' }],
  run: function (v) {
    var s = String(v.text || '').toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
    var grid = [], idx = 0;
    var letters = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // 5x5，I/J 合并
    for (var r = 1; r <= 5; r++) { var row = []; for (var c = 1; c <= 5; c++) row.push(r + '' + c); grid.push(row); }
    var map = {};
    for (var i = 0; i < letters.length; i++) map[letters.charAt(i)] = Math.floor(i / 5) + 1 + '' + (i % 5 + 1);
    var codes = s.split('').map(function (ch) { return map[ch] || '??'; });
    var tbl = '<table style="border-collapse:collapse;font-family:monospace"><tr><th></th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>';
    for (r = 0; r < 5; r++) { tbl += '<tr><th>' + (r + 1) + '</th>'; for (c = 0; c < 5; c++) tbl += '<td style="border:1px solid #ccc;padding:4px;text-align:center">' + letters.charAt(r * 5 + c) + '</td>'; tbl += '</tr>'; }
    tbl += '</table>';
    return R(SEC('5×5 方阵（I/J 合并）') + tbl + SEC('编码结果') + PRE(codes.join(' ')));
  }});

/* 28. 文本转莫尔斯音频时序 */
T({ id: 'morsetiming', name: '摩斯电码时序表', cat: 'text',
  desc: '生成摩斯电码的点划时序表（用于发报练习）',
  tags: '摩斯 电码 时序 发报 morse timing',
  fields: [
    { k: 'text', label: '文本', type: 'text', value: 'SOS' },
    { k: 'wpm', label: '速度 WPM', type: 'text', value: '15' }
  ],
  run: function (v) {
    var MORSE = { A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..', '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.' };
    var wpm = Math.max(5, Math.min(40, parseFloat(v.wpm) || 15));
    var unit = 1200 / wpm; // 点长毫秒
    var s = String(v.text || '').toUpperCase();
    var rows = [];
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      if (ch === ' ') { rows.push(['空格', '/', num(7 * unit, 0) + ' ms']); continue; }
      var code = MORSE[ch];
      if (!code) continue;
      var ms = 0;
      for (var j = 0; j < code.length; j++) ms += (code.charAt(j) === '.' ? 1 : 3) * unit;
      ms += (code.length - 1) * unit; // 符号内间隔
      rows.push([ch, code, num(ms, 0) + ' ms']);
    }
    return R(SEC('速度 ' + wpm + ' WPM，点长 ' + num(unit, 1) + ' ms') + TB(['字符', '电码', '时长'], rows));
  }});

})();
