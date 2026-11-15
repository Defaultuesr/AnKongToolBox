/* ============================================================
   安空工具箱 — 文本工具
   ============================================================ */

T({ id: 'base64', name: 'Base64 编解码', cat: 'text', icon: '🔤', tint: '#FFE6CF',
  desc: 'UTF-8 文本的 Base64 编码与解码', tags: 'base64 编码 解码 加密',
  fields: [
    { k: 'text', label: '内容', type: 'textarea', placeholder: '输入要编码的文本，或粘贴 Base64 串' },
    { k: 'mode', label: '操作', type: 'select', options: [['encode', '编码 → Base64'], ['decode', '解码 → 文本']] }
  ],
  run: function (v) {
    if (!v.text) throw new Error('请输入内容');
    return v.mode === 'decode' ? H.b64dec(v.text) : H.b64enc(v.text);
  }
});

T({ id: 'urlenc', name: 'URL 编解码', cat: 'text', icon: '🔗', tint: '#FFE6CF',
  desc: 'URL / 组件编码与解码', tags: 'url encodeURIComponent 编码 解码',
  fields: [
    { k: 'text', label: '内容', type: 'textarea', placeholder: 'https://example.com/?q=安空 工具箱' },
    { k: 'mode', label: '操作', type: 'select', options: [['encode', '编码 encodeURIComponent'], ['decode', '解码'], ['encodeFull', '整串编码 encodeURI']] }
  ],
  run: function (v) {
    if (!v.text) throw new Error('请输入内容');
    if (v.mode === 'encode') return encodeURIComponent(v.text);
    if (v.mode === 'encodeFull') return encodeURI(v.text);
    return decodeURIComponent(v.text);
  }
});

T({ id: 'unicode', name: 'Unicode 转换', cat: 'text', icon: '🈶', tint: '#FFE6CF',
  desc: '文本、\\u 转义、UTF-8 十六进制互转', tags: 'unicode utf8 转义 十六进制',
  fields: [
    { k: 'text', label: '内容', type: 'textarea', placeholder: '安空 或 \\u5b89\\u7a7a 或 e5ae89e7a9ba' },
    { k: 'mode', label: '操作', type: 'select', options: [
      ['toU', '文本 → \\u 转义'], ['fromU', '\\u 转义 → 文本'],
      ['toHex', '文本 → UTF-8 十六进制'], ['fromHex', '十六进制 → 文本'],
      ['toCode', '文本 → 逐字符码点']
    ] }
  ],
  run: function (v) {
    var s = v.text || '';
    if (!s) throw new Error('请输入内容');
    if (v.mode === 'toU') return Array.from(s).map(function (c) {
      var cp = c.codePointAt(0);
      return cp > 0xffff ? '\\u' + H.pad(((cp - 0x10000) >> 10) + 0xd800, 4) + '\\u' + H.pad(((cp - 0x10000) & 0x3ff) + 0xdc00, 4)
        : '\\u' + H.pad(cp.toString(16), 4);
    }).join('');
    if (v.mode === 'fromU') return s.replace(/\\u([0-9a-fA-F]{4})/g, function (_, h) { return String.fromCharCode(parseInt(h, 16)); });
    if (v.mode === 'toHex') return H.strToHex(s);
    if (v.mode === 'fromHex') return H.hexToStr(s);
    return Array.from(s).map(function (c) { return c + '  U+' + c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'); }).join('\n');
  }
});

T({ id: 'hash', name: '哈希摘要', cat: 'text', icon: '🔐', tint: '#FFE6CF',
  desc: '计算 MD5 / SHA-1 / SHA-256 / SHA-512', tags: 'md5 sha256 哈希 摘要 校验',
  fields: [
    { k: 'text', label: '内容', type: 'textarea', placeholder: '输入要计算摘要的文本' },
    { k: 'algo', label: '算法', type: 'select', options: [['MD5','MD5'],['SHA-1','SHA-1'],['SHA-256','SHA-256'],['SHA-384','SHA-384'],['SHA-512','SHA-512']] },
    { k: 'upper', label: '结果大写', type: 'switch', value: false }
  ],
  run: function (v) {
    if (!v.text) throw new Error('请输入内容');
    function fmt(h) { return v.upper ? h.toUpperCase() : h; }
    if (v.algo === 'MD5') return fmt(H.md5(v.text));
    return H.sha(v.algo, v.text).then(function (h) { return fmt(h); });
  }
});

T({ id: 'regex', name: '正则表达式测试', cat: 'text', icon: '.*',
  tint: '#FFE6CF', desc: '实时测试正则，列出全部匹配与分组', tags: '正则 regex 匹配 测试',
  fields: [
    { k: 'text', label: '待匹配文本', type: 'textarea', placeholder: '安空工具箱 AnKong 2026\n联系电话 13800138000', rows: 6 },
    { k: 'pattern', label: '正则表达式', type: 'text', placeholder: '\\d+|[A-Za-z]+' },
    { k: 'flags', label: '修饰符', type: 'select', options: [['gi','g 全局 + i 忽略大小写'],['g','g 全局'],['i','i 忽略大小写'],['gim','g + i + m 多行'],['','无']] },
    { k: 'replace', label: '替换为（可选，填写则执行替换）', type: 'text', placeholder: '留空则只列出匹配' }
  ],
  run: function (v) {
    if (!v.pattern) throw new Error('请输入正则表达式');
    var re;
    try { re = new RegExp(v.pattern, v.flags); } catch (e) { throw new Error('正则语法错误：' + e.message); }
    var src = v.text || '';
    if (v.replace !== '' && v.replace != null) {
      var out = src.replace(re, v.replace);
      return { html: '<div style="font-weight:700;margin-bottom:8px">替换结果</div><div>' + H.esc(out) + '</div>', text: out };
    }
    var matches = [], m, guard = 0;
    var rx = new RegExp(v.pattern, v.flags.indexOf('g') >= 0 ? v.flags : v.flags + 'g');
    while ((m = rx.exec(src)) !== null && guard++ < 500) {
      matches.push(m);
      if (m[0] === '') rx.lastIndex++;
    }
    if (!matches.length) return '没有找到匹配项';
    var rows = matches.slice(0, 60).map(function (x, i) {
      return '<tr><td>' + (i+1) + '</td><td>' + x.index + '</td><td>' + H.esc(x[0]) + '</td><td>' +
        H.esc(x.slice(1).filter(function (g) { return g !== undefined; }).join(' | ') || '—') + '</td></tr>';
    }).join('');
    var highlighted = H.esc(src).replace(new RegExp(re.source, re.flags.indexOf('g') >= 0 ? re.flags : re.flags + 'g'),
      function (mm) { return '<mark style="background:var(--primary-container);color:var(--on-primary-container);border-radius:3px">' + mm + '</mark>'; });
    return { html: '<div style="font-weight:700;margin-bottom:6px">共 ' + matches.length + ' 处匹配</div>' +
      '<div style="margin-bottom:12px;line-height:1.8">' + highlighted + '</div>' +
      '<table><thead><tr><th>#</th><th>位置</th><th>匹配</th><th>分组</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      (matches.length > 60 ? '<div class="hint">仅显示前 60 条</div>' : ''),
      text: matches.map(function (x) { return x.index + ': ' + x[0]; }).join('\n') };
  }
});

T({ id: 'textcase', name: '文本格式处理', cat: 'text', icon: '🔠', tint: '#FFE6CF',
  desc: '大小写、反转、去重、排序、命名风格转换', tags: '大小写 去重 排序 驼峰 文本处理',
  fields: [
    { k: 'text', label: '内容', type: 'textarea', placeholder: '每行一条，或输入一段文本', rows: 6 },
    { k: 'mode', label: '处理方式', type: 'select', options: [
      ['upper','全部大写'],['lower','全部小写'],['title','每个单词首字母大写'],['sentence','句首大写'],
      ['reverse','字符反转'],['revlines','行序反转'],['trim','去除首尾空格'],['nospaces','去掉所有空白'],
      ['dedup','去除重复行'],['sort','行排序'],['sortnum','按数值排序行'],['blank','删除空行'],
      ['camel','转驼峰 camelCase'],['snake','转下划线 snake_case'],['kebab','转短横线 kebab-case'],
      ['fullwidth','全角字符'],['halfwidth','半角字符']
    ] },
    { k: 'keep', label: '保留重复行中的第一条', type: 'switch', value: true }
  ],
  run: function (v) {
    var s = v.text || '', lines = s.split('\n'), m = v.mode;
    if (m === 'upper') return s.toUpperCase();
    if (m === 'lower') return s.toLowerCase();
    if (m === 'title') return s.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    if (m === 'sentence') return s.toLowerCase().replace(/(^|[.!?。！？]\s+)([a-z])/g, function (_, a, b) { return a + b.toUpperCase(); });
    if (m === 'reverse') return Array.from(s).reverse().join('');
    if (m === 'revlines') return lines.reverse().join('\n');
    if (m === 'trim') return lines.map(function (l) { return l.trim(); }).join('\n');
    if (m === 'nospaces') return s.replace(/\s+/g, '');
    if (m === 'dedup') {
      var seen = {}, out = [];
      lines.forEach(function (l) { if (!seen[l]) { seen[l] = 1; out.push(l); } });
      return out.join('\n');
    }
    if (m === 'sort') return lines.sort().join('\n');
    if (m === 'sortnum') return lines.sort(function (a,b) { return parseFloat(a) - parseFloat(b); }).join('\n');
    if (m === 'blank') return lines.filter(function (l) { return l.trim() !== ''; }).join('\n');
    var words = s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/[^A-Za-z0-9\u4e00-\u9fa5]+/).filter(Boolean);
    if (m === 'camel') return words.map(function (w, i) { return i ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase(); }).join('');
    if (m === 'snake') return words.join('_').toLowerCase();
    if (m === 'kebab') return words.join('-').toLowerCase();
    if (m === 'fullwidth') return s.replace(/[\x21-\x7e]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) + 0xfee0); }).replace(/ /g, '\u3000');
    if (m === 'halfwidth') return s.replace(/[\uff01-\uff5e]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xfee0); }).replace(/\u3000/g, ' ');
    return s;
  }
});

T({ id: 'wordcount', name: '字数统计', cat: 'text', icon: '🔢', tint: '#FFE6CF',
  desc: '统计字符、中文、单词、行数与阅读时长', tags: '字数 统计 字符 写作',
  fields: [{ k: 'text', label: '内容', type: 'textarea', placeholder: '粘贴要统计的文本', rows: 8 }],
  run: function (v) {
    var s = v.text || '';
    if (!s) throw new Error('请输入要统计的文本');
    var chinese = (s.match(/[\u4e00-\u9fa5]/g) || []).length;
    var letters = (s.match(/[A-Za-z]/g) || []).length;
    var digits = (s.match(/\d/g) || []).length;
    var punctuation = (s.match(/[,.!?;:，。！？；：、""''（）()【】]/g) || []).length;
    var words = (s.match(/[A-Za-z]+/g) || []).length;
    var spaces = (s.match(/\s/g) || []).length;
    var lines = s.split('\n').length;
    var paragraphs = s.split(/\n\s*\n/).filter(function (p) { return p.trim(); }).length;
    var noSpace = s.replace(/\s/g, '').length;
    return H.kv([
      ['总字符数', String(Array.from(s).length)], ['不含空白', String(noSpace)],
      ['中文字', String(chinese)], ['英文字母', String(letters)], ['英文单词', String(words)],
      ['数字', String(digits)], ['标点符号', String(punctuation)], ['空白字符', String(spaces)],
      ['行数', String(lines)], ['段落数', String(paragraphs)],
      ['预计阅读', Math.max(1, Math.ceil((chinese + words) / 300)) + ' 分钟'],
      ['UTF-8 字节', String(H.utf8Bytes(s).length)]
    ], '统计结果');
  }
});

T({ id: 'replace', name: '查找与替换', cat: 'text', icon: '🔁', tint: '#FFE6CF',
  desc: '批量查找替换，支持正则与行号', tags: '替换 查找 正则 批量',
  fields: [
    { k: 'text', label: '原文', type: 'textarea', placeholder: '待处理的文本', rows: 7 },
    { k: 'find', label: '查找', type: 'text', placeholder: '要查找的内容' },
    { k: 'repl', label: '替换为', type: 'text', placeholder: '替换后的内容' },
    { k: 'mode', label: '模式', type: 'select', options: [['plain','普通替换（全部）'],['first','仅替换第一个'],['regex','正则替换'],['lines','为每行加行号'],['prefix','每行加前缀 / 后缀']] },
    { k: 'prefix', label: '前缀 / 后缀（用 | 分隔）', type: 'text', placeholder: '例如 · |' }
  ],
  run: function (v) {
    var s = v.text || '';
    if (!s) throw new Error('请输入原文');
    if (v.mode === 'lines') return s.split('\n').map(function (l, i) { return (i+1) + '. ' + l; }).join('\n');
    if (v.mode === 'prefix') {
      var p = (v.prefix || '').split('|');
      return s.split('\n').map(function (l) { return (p[0] || '') + l + (p[1] || ''); }).join('\n');
    }
    if (!v.find) throw new Error('请输入要查找的内容');
    if (v.mode === 'regex') { var re = new RegExp(v.find, 'g'); return s.replace(re, v.repl || ''); }
    if (v.mode === 'first') return s.replace(v.find, v.repl || '');
    return s.split(v.find).join(v.repl || '');
  }
});

T({ id: 'diff', name: '文本对比', cat: 'text', icon: '🆚', tint: '#FFE6CF',
  desc: '按行比对两段文本，标出差异', tags: 'diff 对比 差异 文本比较',
  note: '按行集合比对：标出仅出现在 A 或 B 的行；不计算最小编辑距离。',
  fields: [
    { k: 'a', label: '文本 A', type: 'textarea', placeholder: '原始文本', rows: 5 },
    { k: 'b', label: '文本 B', type: 'textarea', placeholder: '对比文本', rows: 5 }
  ],
  run: function (v) {
    var A = (v.a || '').split('\n'), B = (v.b || '').split('\n');
    var setA = {}, setB = {};
    A.forEach(function (l) { setA[l] = (setA[l] || 0) + 1; });
    B.forEach(function (l) { setB[l] = (setB[l] || 0) + 1; });
    var onlyA = A.filter(function (l) { return !setB[l]; });
    var onlyB = B.filter(function (l) { return !setA[l]; });
    var same = A.filter(function (l) { return setB[l]; });
    var html = '<div style="font-weight:700;margin-bottom:8px">共 ' + A.length + ' 行 / ' + B.length + ' 行</div>' +
      '<div class="kv"><span>相同行</span><span>' + same.length + '</span></div>' +
      '<div class="kv"><span>仅 A 有</span><span style="color:#c62828">' + onlyA.length + '</span></div>' +
      '<div class="kv"><span>仅 B 有</span><span style="color:#2e7d32">' + onlyB.length + '</span></div>' +
      '<div style="font-weight:700;margin:14px 0 6px">差异明细</div><div style="font-size:12.5px;line-height:1.9">' +
      onlyA.map(function (l) { return '<div style="color:#c62828">− ' + H.esc(l || '(空行)') + '</div>'; }).join('') +
      onlyB.map(function (l) { return '<div style="color:#2e7d32">+ ' + H.esc(l || '(空行)') + '</div>'; }).join('') +
      (!onlyA.length && !onlyB.length ? '<div style="color:var(--on-surface-variant)">两段文本的行内容完全一致</div>' : '') + '</div>';
    return { html: html, text: '相同 ' + same.length + ' 行，仅 A 有 ' + onlyA.length + ' 行，仅 B 有 ' + onlyB.length + ' 行\n\n' +
      onlyA.map(function (l) { return '− ' + l; }).join('\n') + '\n' + onlyB.map(function (l) { return '+ ' + l; }).join('\n') };
  }
});

var MORSE = { A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.',
  '.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--','/':'-..-.','(':'-.--.',')':'-.--.-','&':'.-...',':':'---...',';':'-.-.-.','=':'-...-','+':'.-.-.','-':'-....-','_':'..--.-','"':'.-..-.','$':'...-..-','@':'.--.-.',"'":'.----.' };
var MORSE_REV = {}; Object.keys(MORSE).forEach(function (k) { MORSE_REV[MORSE[k]] = k; });
T({ id: 'morse', name: '摩斯电码', cat: 'text', icon: '📡', tint: '#FFE6CF',
  desc: '摩斯电码编码与解码', tags: '摩斯 电码 morse 编码',
  fields: [
    { k: 'text', label: '内容', type: 'textarea', placeholder: 'SOS  或  ... --- ...' },
    { k: 'mode', label: '操作', type: 'select', options: [['enc','编码 → 电码'],['dec','解码 → 文本']] }
  ],
  run: function (v) {
    var s = String(v.text || '').trim();
    if (!s) throw new Error('请输入内容');
    if (v.mode === 'dec') return s.split(/\s*\/\s*|\s{2,}/).map(function (word) {
      return word.split(/\s+/).map(function (c) { return MORSE_REV[c] || '?'; }).join('');
    }).join(' ');
    return Array.from(s.toUpperCase()).map(function (c) {
      if (c === ' ') return '/';
      return MORSE[c] || '?';
    }).join(' ');
  }
});

T({ id: 'escape', name: '转义与实体', cat: 'text', icon: '🧩', tint: '#FFE6CF',
  desc: 'HTML 实体、JSON、JS 字符串转义', tags: 'html 实体 转义 escape json',
  fields: [
    { k: 'text', label: '内容', type: 'textarea', placeholder: '<div>安空 & "工具箱"</div>' },
    { k: 'mode', label: '操作', type: 'select', options: [
      ['htmlEnc','HTML 实体编码'],['htmlDec','HTML 实体解码'],
      ['jsonEnc','转为 JSON 字符串'],['jsonDec','解析 JSON 字符串'],
      ['jsEnc','JS / 多行转义'],['xmlEnc','XML 转义']
    ] }
  ],
  run: function (v) {
    var s = v.text || '';
    if (!s) throw new Error('请输入内容');
    if (v.mode === 'htmlEnc') return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    if (v.mode === 'htmlDec') { var ta = document.createElement('textarea'); ta.innerHTML = s; return ta.value; }
    if (v.mode === 'xmlEnc') return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
    if (v.mode === 'jsonEnc') return JSON.stringify(s);
    if (v.mode === 'jsonDec') { try { return String(JSON.parse(s)); } catch (e) { throw new Error('不是合法的 JSON 字符串'); } }
    return s.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/'/g,"\\'").replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\t/g,'\\t');
  }
});

T({ id: 'caesar', name: '凯撒 / ROT13', cat: 'text', icon: '🎡', tint: '#FFE6CF',
  desc: '字母移位加密与 ROT13', tags: '凯撒 rot13 移位 加密',
  fields: [
    { k: 'text', label: '内容', type: 'textarea', placeholder: 'Hello AnKong' },
    { k: 'shift', label: '位移量（ROT13 填 13）', type: 'number', value: '13' }
  ],
  run: function (v) {
    var n = parseInt(v.shift, 10);
    if (!isFinite(n)) throw new Error('请输入位移量');
    n = ((n % 26) + 26) % 26;
    return (v.text || '').replace(/[A-Za-z]/g, function (c) {
      var base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode((c.charCodeAt(0) - base + n) % 26 + base);
    });
  }
});

/* 轻量 Markdown 渲染：先转义再按规则替换，避免注入 */
function mdRender(src) {
  var s = H.esc(src || '');
  var blocks = [];
  s = s.replace(/```([\s\S]*?)```/g, function (_, code) {
    blocks.push('<pre style="background:var(--surface-container);padding:12px;border-radius:12px;overflow:auto;font-size:12px">' + code.trim() + '</pre>');
    return '\u0000BLOCK' + (blocks.length - 1) + '\u0000';
  });
  var lines = s.split('\n'), out = [], inList = false, inQuote = false;
  function closeList() { if (inList) { out.push('</ul>'); inList = false; } }
  function closeQuote() { if (inQuote) { out.push('</blockquote>'); inQuote = false; } }
  lines.forEach(function (raw) {
    var l = raw.trimRight(), m;
    if (/^\u0000BLOCK\d+\u0000$/.test(l.trim())) { closeList(); closeQuote(); out.push(l.trim()); return; }
    if (/^\s*$/.test(l)) { closeList(); closeQuote(); return; }
    if ((m = l.match(/^(#{1,6})\s+(.*)$/))) { closeList(); closeQuote(); out.push('<div style="font-weight:700;font-size:' + (20 - m[1].length) + 'px;margin:12px 0 6px">' + inline(m[2]) + '</div>'); return; }
    if (/^(---|\*\*\*|___)\s*$/.test(l)) { closeList(); closeQuote(); out.push('<hr style="border:0;border-top:1px solid var(--outline-variant);margin:12px 0">'); return; }
    if ((m = l.match(/^&gt;\s?(.*)$/))) { closeList(); if (!inQuote) { out.push('<blockquote style="border-left:3px solid var(--primary);padding-left:12px;color:var(--on-surface-variant)">'); inQuote = true; } out.push('<div>' + inline(m[1]) + '</div>'); return; }
    if ((m = l.match(/^\s*[-*+]\s+(.*)$/)) || (m = l.match(/^\s*\d+\.\s+(.*)$/))) {
      closeQuote(); if (!inList) { out.push('<ul style="padding-left:20px;margin:6px 0">'); inList = true; }
      out.push('<li>' + inline(m[1]) + '</li>'); return;
    }
    closeList(); closeQuote(); out.push('<div style="margin:4px 0">' + inline(l) + '</div>');
  });
  closeList(); closeQuote();
  var html = out.join('');
  blocks.forEach(function (b, i) { html = html.replace('\u0000BLOCK' + i + '\u0000', b); });
  return html;
  function inline(t) {
    return t
      .replace(/`([^`]+)`/g, '<code style="background:var(--surface-container);padding:2px 5px;border-radius:5px;font-size:.92em">$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_, alt, url) {
        var safe = /^(https?:|data:image\/|\/|#)/i.test(url) ? url : '';
        return '<img src="' + safe + '" alt="' + alt + '" style="max-width:100%;border-radius:10px">'; })
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, txt, url) {
        var safe = /^(https?:|mailto:|\/|#)/i.test(url) ? url : '#';
        return '<a href="' + safe + '" target="_blank" rel="noopener">' + txt + '</a>'; })
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/__([^_]+)__/g, '<b>$1</b>')
      .replace(/(^|\s)\*([^*\n]+)\*/g, '$1<i>$2</i>')
      .replace(/~~([^~]+)~~/g, '<s>$1</s>');
  }
}
T({ id: 'markdown', name: 'Markdown 预览', cat: 'text', icon: '📄', tint: '#FFE6CF',
  desc: '实时渲染 Markdown 文档', tags: 'markdown md 预览 文档',
  fields: [{ k: 'text', label: 'Markdown 文本', type: 'textarea', rows: 9,
    placeholder: '# 标题\n\n**加粗** 与 `代码`\n\n- 列表项一\n- 列表项二\n\n> 引用文字' }],
  run: function (v) { return { html: mdRender(v.text || '_在上方输入 Markdown_'), text: v.text || '' }; }
});

T({ id: 'cipher', name: '文本加密解密', cat: 'text', icon: '🛡️', tint: '#FFE6CF',
  desc: 'AES-GCM 口令加密（PBKDF2 派生密钥）', tags: 'aes 加密 解密 密码 安全',
  note: '加密结果包含随机盐与 IV，每次都不同；请妥善保存口令，丢失后无法解密。全过程在本地完成。',
  fields: [
    { k: 'text', label: '明文 / 密文', type: 'textarea', placeholder: '要加密的文字，或粘贴 AK1: 开头的密文', rows: 5 },
    { k: 'pass', label: '口令', type: 'text', placeholder: '设置一个加密口令' },
    { k: 'mode', label: '操作', type: 'select', options: [['enc','加密'],['dec','解密']] }
  ],
  run: function (v) {
    if (!window.crypto || !crypto.subtle) return Promise.reject(new Error('当前环境不支持 Web Crypto，请使用系统浏览器或更新 WebView'));
    if (!v.pass) throw new Error('请输入口令');
    var enc = new TextEncoder();
    function derive(salt) {
      return crypto.subtle.importKey('raw', enc.encode(v.pass), 'PBKDF2', false, ['deriveKey']).then(function (k) {
        return crypto.subtle.deriveKey({ name:'PBKDF2', salt:salt, iterations:100000, hash:'SHA-256' },
          k, { name:'AES-GCM', length:256 }, false, ['encrypt','decrypt']);
      });
    }
    function b64(bytes) { var s = ''; for (var i = 0; i < bytes.length; i += 4096) s += String.fromCharCode.apply(null, bytes.subarray(i, i+4096)); return btoa(s); }
    function unb64(str) { var bin = atob(str), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; }
    if (v.mode === 'enc') {
      if (!v.text) throw new Error('请输入要加密的内容');
      var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
      return derive(salt).then(function (key) {
        return crypto.subtle.encrypt({ name:'AES-GCM', iv:iv }, key, enc.encode(v.text));
      }).then(function (buf) {
        var all = new Uint8Array(16 + 12 + buf.byteLength);
        all.set(salt, 0); all.set(iv, 16); all.set(new Uint8Array(buf), 28);
        var res = 'AK1:' + b64(all);
        return { html: '<div style="word-break:break-all">' + H.esc(res) + '</div>', text: res };
      });
    }
    var raw = String(v.text || '').trim();
    if (raw.indexOf('AK1:') !== 0) throw new Error('密文格式应以 AK1: 开头');
    var data;
    try { data = unb64(raw.slice(4)); } catch (e) { throw new Error('密文 Base64 格式错误'); }
    if (data.length < 29) throw new Error('密文长度不足或已损坏');
    return derive(data.slice(0,16)).then(function (key) {
      return crypto.subtle.decrypt({ name:'AES-GCM', iv:data.slice(16,28) }, key, data.slice(28));
    }).then(function (buf) { return new TextDecoder().decode(buf); })
      .catch(function () { throw new Error('解密失败：口令错误或内容被篡改'); });
  }
});
