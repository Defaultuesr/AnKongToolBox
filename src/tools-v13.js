/* ============================================================
   安空工具箱 — v1.3 实用工具包
   50 个纯离线工具：文本 / 开发 / 计算 / 生活 / 查询 / 媒体 / 设备 / 互动
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
function num(v, d) { return H.num(v, d == null ? 4 : d); }
function padL(s, n, c) { s = String(s); c = c || '0'; while (s.length < n) s = c + s; return s; }
function lines(s) { return String(s || '').replace(/\r\n/g, '\n').split('\n'); }
function parseNum(v, d) { var n = parseFloat(v); return isFinite(n) ? n : (d || 0); }
function gcd(a, b) { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b) { var t = a % b; a = b; b = t; } return a || 1; }
function fmtMoney(n) { return (Math.round(n * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function round(n, d) { var p = Math.pow(10, d == null ? 2 : d); return Math.round(n * p) / p; }
function comb(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k); var r = 1;
  for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
  return Math.round(r);
}

/* ============================================================
   一、文本效率（8）
   ============================================================ */

T({ id: 'linenum', name: '行号工具', cat: 'text',
  desc: '批量添加或移除行号，按字数折行', tags: '行号 编号 折行 换行 文本 line number',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6, value: '安空工具箱\nAnKong Toolbox\n第三行内容\n最后一行' },
    { k: 'mode', label: '处理方式', type: 'select', value: 'add', options: [
      ['add', '添加行号'], ['remove', '移除行号'], ['wrap', '按字数折行'] ] },
    { k: 'start', label: '起始编号', type: 'text', value: '1' },
    { k: 'width', label: '编号补零位数', type: 'text', value: '2' },
    { k: 'wraplen', label: '每行最多字数', type: 'text', value: '12' }
  ],
  run: function (v) {
    var arr = lines(v.text), out, i;
    if (v.mode === 'remove') {
      out = arr.map(function (l) {
        return l.replace(/^\s*\d+\s*[\.、:：)）\]】]?\s*/, '');
      }).join('\n');
    } else if (v.mode === 'wrap') {
      var n = Math.max(1, Math.round(parseNum(v.wraplen, 12))), res = [];
      for (i = 0; i < arr.length; i++) {
        if (arr[i].length <= n) { res.push(arr[i]); continue; }
        var s = arr[i];
        while (s.length > n) { res.push(s.slice(0, n)); s = s.slice(n); }
        if (s) res.push(s);
      }
      out = res.join('\n');
    } else {
      var st = Math.round(parseNum(v.start, 1)), w = Math.max(0, Math.round(parseNum(v.width, 2)));
      out = arr.map(function (l, j) { return padL(st + j, w) + ' ' + l; }).join('\n');
    }
    return R(PRE(out) + KV([['原始行数', arr.length], ['结果行数', lines(out).length], ['字符数', out.length]]), out);
  }
});

T({ id: 'textchunk', name: '文本切分合并', cat: 'text',
  desc: '按分隔符、固定长度或行数切分，也能反向合并', tags: '切分 分割 合并 分段 文本 split join',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 5, value: '苹果,香蕉,橘子,葡萄,西瓜,芒果' },
    { k: 'mode', label: '处理方式', type: 'select', value: 'sep', options: [
      ['sep', '按分隔符切分'], ['len', '按固定字数切分'], ['lines', '按固定行数分组'], ['merge', '把多行合并成一行'] ] },
    { k: 'sep', label: '分隔符', type: 'text', value: ',' },
    { k: 'len', label: '每段字数 / 每组行数', type: 'text', value: '3' },
    { k: 'join', label: '合并连接符', type: 'text', value: ' | ' }
  ],
  run: function (v) {
    var s = String(v.text || ''), n = Math.max(1, Math.round(parseNum(v.len, 3))), parts, i;
    if (v.mode === 'merge') {
      var joined = lines(s).filter(function (l) { return l !== ''; }).join(String(v.join == null ? ' ' : v.join));
      return R(PRE(joined) + HINT('共合并 ' + lines(s).length + ' 行'), joined);
    }
    if (v.mode === 'sep') parts = s.split(v.sep === '' ? /\s+/ : String(v.sep));
    else if (v.mode === 'len') {
      parts = []; var flat = s.replace(/\n/g, '');
      for (i = 0; i < flat.length; i += n) parts.push(flat.slice(i, i + n));
    } else {
      var ls = lines(s); parts = [];
      for (i = 0; i < ls.length; i += n) parts.push(ls.slice(i, i + n).join(String(v.sep || ' ')));
    }
    parts = parts.filter(function (x) { return x !== ''; });
    var body = TB(['序号', '内容'], parts.map(function (p, j) { return [j + 1, p]; }));
    return R(body + HINT('共切分出 ' + parts.length + ' 段'), parts.join('\n'));
  }
});

T({ id: 'affix', name: '批量前后缀', cat: 'text',
  desc: '给每行批量加前缀、后缀与自增编号，或反向去除', tags: '前缀 后缀 编号 批量 重命名 affix',
  fields: [
    { k: 'text', label: '每行一项', type: 'textarea', rows: 5, value: '照片\n截图\n扫描件\n备份' },
    { k: 'prefix', label: '前缀（可用 {n} 表示编号）', type: 'text', value: 'IMG_{n}_' },
    { k: 'suffix', label: '后缀', type: 'text', value: '.jpg' },
    { k: 'start', label: '编号起始值', type: 'text', value: '1' },
    { k: 'width', label: '编号补零位数', type: 'text', value: '3' },
    { k: 'strip', label: '去除模式（去掉前后缀）', type: 'switch', value: false }
  ],
  run: function (v) {
    var arr = lines(v.text).filter(function (l) { return l !== ''; });
    var st = Math.round(parseNum(v.start, 1)), w = Math.max(0, Math.round(parseNum(v.width, 3)));
    var pre = String(v.prefix || ''), suf = String(v.suffix || '');
    var out = arr.map(function (l, j) {
      if (v.strip) {
        var re1 = new RegExp('^' + pre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\{n\\\}/g, '\\d+'), '');
        var r = l.replace(re1, '');
        if (suf && r.slice(-suf.length) === suf) r = r.slice(0, -suf.length);
        return r;
      }
      var no = padL(st + j, w);
      return pre.replace(/\{n\}/g, no) + l + suf;
    }).join('\n');
    return R(PRE(out) + HINT('处理 ' + arr.length + ' 行'), out);
  }
});

T({ id: 'spaceclean', name: '空白清理', cat: 'text',
  desc: '清理全角空格、零宽字符、行尾空白、空行与多余空格', tags: '空格 空白 清理 零宽 不可见 缩进 trim',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6, value: '  第一行结尾有空格   \n\u3000\u3000全角空格开头\n\n第三行\t含制表符\n\u200b零宽字符\u200b\n' },
    { k: 'trim', label: '去除每行首尾空白', type: 'switch', value: true },
    { k: 'blank', label: '删除空行', type: 'switch', value: true },
    { k: 'wide', label: '全角空格转半角', type: 'switch', value: true },
    { k: 'zero', label: '删除零宽 / 不可见字符', type: 'switch', value: true },
    { k: 'merge', label: '连续空格合并为一个', type: 'switch', value: true },
    { k: 'tab', label: '制表符转为空格', type: 'switch', value: true }
  ],
  run: function (v) {
    var s = String(v.text || ''), before = s.length;
    if (v.wide) s = s.replace(/\u3000/g, ' ');
    if (v.zero) s = s.replace(/[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g, '');
    if (v.tab) s = s.replace(/\t/g, '    ');
    var arr = lines(s);
    if (v.trim) arr = arr.map(function (l) { return l.replace(/^[\s]+|[\s]+$/g, ''); });
    if (v.merge) arr = arr.map(function (l) { return l.replace(/ {2,}/g, ' '); });
    if (v.blank) arr = arr.filter(function (l) { return l.trim() !== ''; });
    var out = arr.join('\n');
    return R(PRE(out) + KV([['原始字符', before], ['清理后', out.length], ['减少', before - out.length], ['保留行数', arr.length]]), out);
  }
});

T({ id: 'tplfill', name: '模板批量填充', cat: 'text',
  desc: '用表格数据批量替换 {{变量}}，一次生成多段文案', tags: '模板 变量 批量 生成 文案 替换 template',
  fields: [
    { k: 'tpl', label: '模板（{{列名}} 或 {{1}} 表示第几列）', type: 'textarea', rows: 4, value: '{{name}} 你好，你的工号是 {{id}}，部门：{{dept}}。' },
    { k: 'data', label: '数据（第一行为表头）', type: 'textarea', rows: 5, value: 'name,id,dept\n张三,1001,技术部\n李四,1002,市场部\n王五,1003,设计部' },
    { k: 'sep', label: '列分隔符', type: 'text', value: ',' },
    { k: 'wrap', label: '每段之间空一行', type: 'switch', value: true }
  ],
  run: function (v) {
    var tpl = String(v.tpl || ''), rows = lines(v.data).filter(function (l) { return l.trim() !== ''; });
    if (!rows.length) throw new Error('请填写数据，第一行为表头');
    var sp = String(v.sep || ','), head = rows[0].split(sp).map(function (x) { return x.trim(); });
    var out = [];
    for (var i = 1; i < rows.length; i++) {
      var cells = rows[i].split(sp), seg = tpl;
      for (var j = 0; j < head.length; j++) {
        seg = seg.split('{{' + head[j] + '}}').join(cells[j] == null ? '' : cells[j].trim());
      }
      seg = seg.replace(/\{\{(\d+)\}\}/g, function (m, d) {
        var k = parseInt(d, 10) - 1; return cells[k] == null ? '' : cells[k].trim();
      });
      out.push(seg);
    }
    var text = out.join(v.wrap ? '\n\n' : '\n');
    return R(PRE(text) + HINT('表头 ' + head.length + ' 列，生成 ' + out.length + ' 段'), text);
  }
});

T({ id: 'colpick', name: '表格列提取', cat: 'text',
  desc: '从 CSV / TSV 中挑选指定列并重新排序', tags: '列 提取 CSV TSV 表格 重排 column',
  fields: [
    { k: 'text', label: '表格数据', type: 'textarea', rows: 6, value: '姓名,年龄,城市,职业\n张三,28,北京,工程师\n李四,34,上海,设计师\n王五,25,深圳,编辑' },
    { k: 'sep', label: '分隔符', type: 'select', value: ',', options: [
      [',', '逗号 ,'], ['\t', '制表符 Tab'], [';', '分号 ;'], ['|', '竖线 |'], [' ', '空格'] ] },
    { k: 'cols', label: '列序号（从 1 开始，逗号分隔）', type: 'text', value: '1,3,2' },
    { k: 'header', label: '第一行是表头', type: 'switch', value: true },
    { k: 'outsep', label: '输出分隔符', type: 'text', value: ' | ' }
  ],
  run: function (v) {
    var rows = lines(v.text).filter(function (l) { return l !== ''; })
      .map(function (l) { return l.split(String(v.sep || ',')); });
    var cols = String(v.cols || '1').split(/[,\s]+/).filter(Boolean)
      .map(function (x) { return parseInt(x, 10) - 1; })
      .filter(function (x) { return x >= 0; });
    if (!cols.length) throw new Error('请填写有效的列序号');
    var picked = rows.map(function (r) {
      return cols.map(function (c) { return r[c] == null ? '' : r[c].trim(); });
    });
    var head = v.header ? picked[0] : cols.map(function (c) { return '第 ' + (c + 1) + ' 列'; });
    var body = v.header ? picked.slice(1) : picked;
    var text = picked.map(function (r) { return r.join(String(v.outsep == null ? ' ' : v.outsep)); }).join('\n');
    return R(TB(head, body) + HINT('共 ' + (body.length) + ' 行数据，选取 ' + cols.length + ' 列'), text);
  }
});

T({ id: 'rowfilter', name: '按条件筛选行', cat: 'text',
  desc: '按关键词、正则、长度或数值范围过滤文本行', tags: '筛选 过滤 行 正则 关键词 filter',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6, value: 'apple 苹果\nbanana 香蕉\ncherry 樱桃\navocado 牛油果\nblueberry 蓝莓\nkiwi 猕猴桃' },
    { k: 'mode', label: '筛选条件', type: 'select', value: 'contains', options: [
      ['contains', '包含关键词'], ['notcontains', '不包含关键词'], ['regex', '匹配正则表达式'],
      ['length', '行的长度在范围内'], ['numeric', '首个数字在范围内'] ] },
    { k: 'kw', label: '关键词 / 正则表达式', type: 'text', value: 'berry' },
    { k: 'min', label: '最小值（长度 / 数字）', type: 'text', value: '0' },
    { k: 'max', label: '最大值（长度 / 数字）', type: 'text', value: '999' },
    { k: 'ignore', label: '忽略大小写', type: 'switch', value: true }
  ],
  run: function (v) {
    var arr = lines(v.text), lo = parseNum(v.min, 0), hi = parseNum(v.max, 999);
    var kw = String(v.kw || ''), re = null;
    if (v.mode === 'regex') {
      try { re = new RegExp(kw, v.ignore ? 'i' : ''); }
      catch (e) { throw new Error('正则表达式无效：' + e.message); }
    }
    var keep = arr.filter(function (l) {
      var x = v.ignore ? l.toLowerCase() : l, k = v.ignore ? kw.toLowerCase() : kw;
      if (v.mode === 'contains') return k === '' || x.indexOf(k) >= 0;
      if (v.mode === 'notcontains') return x.indexOf(k) < 0;
      if (v.mode === 'regex') return re.test(l);
      if (v.mode === 'length') return l.length >= lo && l.length <= hi;
      var m = l.match(/-?\d+(\.\d+)?/); if (!m) return false;
      var n = parseFloat(m[0]); return n >= lo && n <= hi;
    });
    return R(PRE(keep.join('\n') || '（没有符合条件的行）') +
      KV([['原始行数', arr.length], ['保留行数', keep.length], ['过滤掉', arr.length - keep.length]]), keep.join('\n'));
  }
});

T({ id: 'sqllist', name: '批量列表生成', cat: 'text',
  desc: '把多行文本转成 SQL IN、JSON 数组、Python 列表等格式', tags: 'SQL IN 列表 引号 JSON 数组 批量 生成',
  fields: [
    { k: 'text', label: '每行一项', type: 'textarea', rows: 5, value: '北京\n上海\n广州\n深圳\n北京' },
    { k: 'mode', label: '输出格式', type: 'select', value: 'sqlstr', options: [
      ['sqlstr', "SQL 字符串 ('a','b')"], ['sqlnum', 'SQL 数字 (1,2)'],
      ['json', 'JSON 数组'], ['python', 'Python 列表'], ['array', 'JS 数组'], ['lines', '带引号每行一个'] ] },
    { k: 'dedup', label: '去重', type: 'switch', value: true },
    { k: 'quote', label: '引号字符', type: 'text', value: "'" }
  ],
  run: function (v) {
    var arr = lines(v.text).map(function (l) { return l.trim(); }).filter(Boolean), seen = {}, out = [];
    for (var i = 0; i < arr.length; i++) {
      if (v.dedup && seen[arr[i]]) continue;
      seen[arr[i]] = 1; out.push(arr[i]);
    }
    var q = String(v.quote || "'"), res;
    if (v.mode === 'sqlstr' || v.mode === 'python' || v.mode === 'array' || v.mode === 'json') {
      res = out.map(function (x) { return q + String(x).split(q).join(q + q) + q; }).join(', ');
      if (v.mode === 'sqlstr' || v.mode === 'sqlnum') res = '(' + res + ')';
      else if (v.mode === 'python' || v.mode === 'array') res = '[' + res + ']';
      else res = '[' + res + ']';
      if (v.mode === 'json') { q = '"'; res = JSON.stringify(out); }
    } else if (v.mode === 'sqlnum') {
      res = '(' + out.join(', ') + ')';
    } else {
      res = out.map(function (x) { return q + x + q; }).join(',\n');
    }
    return R(PRE(res) + KV([['原始项', arr.length], ['输出项', out.length], ['已去重', arr.length - out.length]]), res);
  }
});

/* ============================================================
   二、开发者（8）
   ============================================================ */

T({ id: 'namecase', name: '命名风格转换', cat: 'dev',
  desc: 'camelCase / snake_case / kebab-case 等风格批量互转', tags: '命名 驼峰 下划线 变量 风格 camel snake kebab',
  fields: [
    { k: 'text', label: '每行一个名称', type: 'textarea', rows: 5, value: 'userName\nuser_id\nAPIResponse\nmax-retry-count\nBackgroundColor' },
    { k: 'style', label: '目标风格', type: 'select', value: 'camel', options: [
      ['camel', 'camelCase 小驼峰'], ['pascal', 'PascalCase 大驼峰'], ['snake', 'snake_case 下划线'],
      ['kebab', 'kebab-case 连字符'], ['constant', 'CONSTANT_CASE 全大写'], ['title', 'Title Case 空格分隔'],
      ['lower', '全小写去分隔'], ['upper', '全大写去分隔'] ] }
  ],
  run: function (v) {
    function splitWords(s) {
      return String(s).replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/[^A-Za-z0-9\u4e00-\u9fff]+/g, ' ').trim().split(/\s+/).filter(Boolean);
    }
    var out = lines(v.text).filter(function (l) { return l.trim() !== ''; }).map(function (l) {
      var w = splitWords(l);
      if (!w.length) return '';
      var low = w.map(function (x) { return x.toLowerCase(); });
      if (v.style === 'camel') return low[0] + low.slice(1).map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1); }).join('');
      if (v.style === 'pascal') return low.map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1); }).join('');
      if (v.style === 'snake') return low.join('_');
      if (v.style === 'kebab') return low.join('-');
      if (v.style === 'constant') return low.join('_').toUpperCase();
      if (v.style === 'title') return low.map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1); }).join(' ');
      if (v.style === 'lower') return low.join('');
      return low.join('').toUpperCase();
    });
    var text = out.join('\n');
    return R(TB(['原始', '转换结果'], lines(v.text).filter(function (l) { return l.trim() !== ''; })
      .map(function (l, j) { return [l, out[j]]; })) + PRE(text), text);
  }
});

T({ id: 'json2ts', name: 'JSON 转类型定义', cat: 'dev',
  desc: '根据示例 JSON 生成 TypeScript / Java 类型定义', tags: 'JSON TypeScript interface 类型 生成 DTO',
  fields: [
    { k: 'json', label: '示例 JSON', type: 'textarea', rows: 8,
      value: '{\n  "id": 1001,\n  "name": "安空",\n  "active": true,\n  "tags": ["tool", "offline"],\n  "profile": { "city": "深圳", "score": 9.5 },\n  "items": [ { "sku": "A01", "qty": 2 } ]\n}' },
    { k: 'root', label: '根类型名', type: 'text', value: 'Root' },
    { k: 'style', label: '输出风格', type: 'select', value: 'ts', options: [
      ['ts', 'TypeScript interface'], ['type', 'TypeScript type'], ['java', 'Java class 字段'] ] }
  ],
  run: function (v) {
    var data;
    try { data = JSON.parse(v.json); } catch (e) { throw new Error('JSON 解析失败：' + e.message); }
    var root = String(v.root || 'Root').replace(/[^A-Za-z0-9_]/g, '') || 'Root';
    var defs = [];
    function cap(s) { return String(s).replace(/[^A-Za-z0-9]/g, ' ').split(/\s+/).filter(Boolean)
      .map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1); }).join('') || 'Item'; }
    function key(s) { return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(s) ? s : JSON.stringify(s); }
    function infer(val, name, depth) {
      if (depth > 6) return 'any';
      if (val === null) return 'any';
      if (Array.isArray(val)) return val.length ? infer(val[0], name + 'Item', depth + 1) + '[]' : 'any[]';
      if (typeof val === 'object') {
        var rows = [];
        for (var k in val) if (Object.prototype.hasOwnProperty.call(val, k)) {
          rows.push('  ' + key(k) + ': ' + infer(val[k], cap(k), depth + 1) + ';');
        }
        defs.push({ name: name, rows: rows });
        return name;
      }
      return typeof val === 'number' ? 'number' : typeof val === 'boolean' ? 'boolean' : 'string';
    }
    var top = infer(data, root, 0);
    if (typeof data !== 'object' || data === null) {
      return R(PRE('type ' + root + ' = ' + top + ';'), 'type ' + root + ' = ' + top + ';');
    }
    var out = [];
    if (v.style === 'java') {
      defs.slice().reverse().forEach(function (d) {
        out.push('class ' + d.name + ' {');
        d.rows.forEach(function (r) {
          var m = r.match(/^\s*(.+?):\s*(.+);$/);
          var jt = /number/.test(m[2]) ? 'double' : /boolean/.test(m[2]) ? 'boolean'
            : /\[\]/.test(m[2]) ? 'List<' + m[2].replace('[]', '').replace(/number/g, 'Double').replace(/string/g, 'String').replace(/boolean/g, 'Boolean') + '>'
            : /string/.test(m[2]) ? 'String' : m[2];
          out.push('  public ' + jt + ' ' + String(m[1]).replace(/"/g, '') + ';');
        });
        out.push('}\n');
      });
    } else {
      defs.slice().reverse().forEach(function (d) {
        out.push((v.style === 'type' ? 'type ' + d.name + ' = {' : 'interface ' + d.name + ' {'));
        d.rows.forEach(function (r) { out.push(r); });
        out.push('}' + (v.style === 'type' ? ';' : '') + '\n');
      });
    }
    var text = out.join('\n');
    return R(PRE(text) + HINT('共生成 ' + defs.length + ' 个类型定义，数组元素取第一项推断'), text);
  }
});

T({ id: 'basen', name: '任意进制转换', cat: 'dev',
  desc: '2 ~ 36 进制互转，附带按位展开过程', tags: '进制 二进制 八进制 十六进制 转换 base',
  fields: [
    { k: 'value', label: '数值', type: 'text', value: '2026' },
    { k: 'from', label: '原进制（2~36）', type: 'text', value: '10' },
    { k: 'to', label: '目标进制（2~36）', type: 'text', value: '16' },
    { k: 'show', label: '显示常见进制对照', type: 'switch', value: true }
  ],
  run: function (v) {
    var from = Math.round(parseNum(v.from, 10)), to = Math.round(parseNum(v.to, 16));
    if (from < 2 || from > 36 || to < 2 || to > 36) throw new Error('进制必须在 2 ~ 36 之间');
    var s = String(v.value || '').trim().replace(/^0[xX]/, ''), n = parseInt(s, from);
    if (!isFinite(n)) throw new Error('数值无法按 ' + from + ' 进制解析');
    var res = n.toString(to).toUpperCase();
    var rows = [['十进制值', String(n)], ['转换结果（' + to + ' 进制）', res]];
    if (v.show) [2, 8, 10, 16, 36].forEach(function (b) {
      if (b !== to) rows.push([b + ' 进制', n.toString(b).toUpperCase()]);
    });
    var detail = n.toString(2) + '（二进制） = ' + n;
    return R(KV(rows) + HINT('按位展开：' + detail + '。超出 2^53 的大数可能有精度误差'), String(n) + ' -> ' + res);
  }
});

T({ id: 'bitwise', name: '位运算计算器', cat: 'dev',
  desc: '与 / 或 / 异或 / 取反 / 移位，同时给出二进制视图', tags: '位运算 与 或 异或 移位 二进制 bit',
  fields: [
    { k: 'a', label: '第一个数', type: 'text', value: '60' },
    { k: 'b', label: '第二个数（移位时表示位数）', type: 'text', value: '13' },
    { k: 'op', label: '运算', type: 'select', value: 'and', options: [
      ['and', '按位与 &'], ['or', '按位或 |'], ['xor', '按位异或 ^'], ['not', '按位取反 ~'],
      ['shl', '左移 <<'], ['shr', '有符号右移 >>'], ['ushr', '无符号右移 >>>'] ] }
  ],
  run: function (v) {
    var a = parseInt(v.a, 10) | 0, b = parseInt(v.b, 10) | 0, r;
    if (v.op === 'and') r = a & b;
    else if (v.op === 'or') r = a | b;
    else if (v.op === 'xor') r = a ^ b;
    else if (v.op === 'not') r = ~a;
    else if (v.op === 'shl') r = a << (b & 31);
    else if (v.op === 'shr') r = a >> (b & 31);
    else r = a >>> (b & 31);
    var u = r >>> 0;
    function bin(x) { return padL((x >>> 0).toString(2), 32, '0').replace(/(\d{4})(?=\d)/g, '$1 '); }
    var expr = { and: ' & ', or: ' | ', xor: ' ^ ', not: '~', shl: ' << ', shr: ' >> ', ushr: ' >>> ' }[v.op];
    return R(TB(['视图', 'A', (v.op === 'not' ? '' : 'B'), '结果'], [
      ['十进制', String(a), v.op === 'not' ? '—' : String(b), String(r)],
      ['二进制（32 位）', bin(a), v.op === 'not' ? '—' : bin(b), bin(r)],
      ['十六进制', '0x' + (a >>> 0).toString(16).toUpperCase(), v.op === 'not' ? '—' : '0x' + (b >>> 0).toString(16).toUpperCase(), '0x' + u.toString(16).toUpperCase()],
      ['无符号十进制', String(a >>> 0), v.op === 'not' ? '—' : String(b >>> 0), String(u)]
    ]) + HINT('表达式：' + (v.op === 'not' ? '~' + a : a + expr + b) + ' = ' + r), String(r));
  }
});

T({ id: 'curlgen', name: 'cURL / fetch 互转', cat: 'dev',
  desc: '把 cURL 命令转成 fetch 代码，或反向生成 cURL', tags: 'curl fetch HTTP 请求 代码 生成 转换',
  fields: [
    { k: 'mode', label: '转换方向', type: 'select', value: 'curl2fetch', options: [
      ['curl2fetch', 'cURL → fetch'], ['fetch2curl', 'fetch → cURL'] ] },
    { k: 'input', label: '输入命令 / 代码', type: 'textarea', rows: 7,
      value: "curl -X POST 'https://api.example.com/v1/items' \\\n  -H 'Content-Type: application/json' \\\n  -H 'Authorization: Bearer token123' \\\n  -d '{\"name\":\"ankong\",\"count\":2}'" }
  ],
  run: function (v) {
    var s = String(v.input || '').replace(/\\\s*\n/g, ' ');
    if (v.mode === 'curl2fetch') {
      var url = (s.match(/(?:curl\s+|--url\s+)?['"]?(https?:\/\/[^\s'"]+)/) || [])[1] || '';
      if (!url) throw new Error('没有找到 http(s) 地址');
      var mm = s.match(/-X\s+['"]?([A-Za-z]+)['"]?/);
      var hasBody = /(-d\s|--data|--data-raw|--data-binary)/.test(s);
      var method = mm ? mm[1].toUpperCase() : (hasBody ? 'POST' : 'GET');
      var hs = [], re = /-H\s+['"]([^'"]+)['"]/g, m;
      while ((m = re.exec(s)) !== null) hs.push(m[1]);
      var body = (s.match(/(?:-d|--data-raw|--data(?:-binary)?)\s+['"]([\s\S]*?)['"](?:\s|$)/) || [])[1] || '';
      var headers = {};
      hs.forEach(function (h) { var i = h.indexOf(':'); if (i > 0) headers[h.slice(0, i).trim()] = h.slice(i + 1).trim(); });
      var opts = ['  method: ' + JSON.stringify(method), '  headers: ' + JSON.stringify(headers, null, 2).replace(/\n/g, '\n  ')];
      if (body) opts.push('  body: ' + JSON.stringify(body));
      var code = 'fetch(' + JSON.stringify(url) + ', {\n' + opts.join(',\n') + '\n})\n  .then(function (r) { return r.json(); })\n  .then(function (data) { console.log(data); });';
      return R(PRE(code) + KV([['请求方法', method], ['请求头', String(hs.length)], ['请求体', body ? '有' : '无']]), code);
    }
    var u = (s.match(/fetch\(\s*['"]([^'"]+)['"]/) || [])[1] || '';
    if (!u) throw new Error('没有找到 fetch(...) 的地址');
    var meth = (s.match(/method:\s*['"]([A-Za-z]+)['"]/) || [])[1] || 'GET';
    var hm = s.match(/headers:\s*\{([\s\S]*?)\}/), hd = [];
    if (hm) {
      var hr = /['"]?([^'":,\n]+)['"]?\s*:\s*['"]([^'"]+)['"]/g, h;
      while ((h = hr.exec(hm[1])) !== null) hd.push("-H '" + h[1].trim() + ': ' + h[2].trim() + "'");
    }
    var bd = (s.match(/body:\s*(['"])([\s\S]*?)\1/) || [])[2] || '';
    var cmd = ["curl -X " + meth + " '" + u + "'"].concat(hd);
    if (bd) cmd.push("-d '" + bd + "'");
    var text = cmd.join(' \\\n  ');
    return R(PRE(text) + HINT('提取到 ' + hd.length + ' 个请求头'), text);
  }
});

T({ id: 'semver', name: '语义化版本比较', cat: 'dev',
  desc: '比较 semver 大小、批量排序、判断是否满足范围', tags: '版本 semver 比较 排序 版本号 范围',
  fields: [
    { k: 'a', label: '版本 A / 版本列表（每行一个）', type: 'textarea', rows: 4, value: '1.3.0' },
    { k: 'b', label: '版本 B', type: 'text', value: '1.2.9' },
    { k: 'mode', label: '模式', type: 'select', value: 'compare', options: [
      ['compare', '比较 A 与 B'], ['sort', '批量排序 A'], ['satisfy', '判断 A 是否 >= B'] ] }
  ],
  run: function (v) {
    function parse(s) {
      var m = String(s).trim().replace(/^[vV]/, '').match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.\-]+))?(?:\+[0-9A-Za-z.\-]+)?$/);
      if (!m) return null;
      return { n: [+m[1], +m[2], +m[3]], pre: m[4] ? m[4].split('.') : [] };
    }
    function cmp(x, y) {
      for (var i = 0; i < 3; i++) { if (x.n[i] !== y.n[i]) return x.n[i] > y.n[i] ? 1 : -1; }
      if (!x.pre.length && !y.pre.length) return 0;
      if (!x.pre.length) return 1;
      if (!y.pre.length) return -1;
      var L = Math.max(x.pre.length, y.pre.length);
      for (i = 0; i < L; i++) {
        var a = x.pre[i], b = y.pre[i];
        if (a === undefined) return -1;
        if (b === undefined) return 1;
        if (a === b) continue;
        var an = /^\d+$/.test(a), bn = /^\d+$/.test(b);
        if (an && bn) return +a > +b ? 1 : -1;
        if (an) return -1;
        if (bn) return 1;
        return a > b ? 1 : -1;
      }
      return 0;
    }
    if (v.mode === 'sort') {
      var arr = lines(v.a).filter(function (l) { return l.trim() !== ''; });
      var bad = arr.filter(function (l) { return !parse(l); });
      if (bad.length) throw new Error('无法解析：' + bad.join(', '));
      arr.sort(function (p, q) { return cmp(parse(p), parse(q)); });
      return R(TB(['升序', '版本'], arr.map(function (x, i) { return [i + 1, x]; })) + PRE(arr.join('\n')), arr.join('\n'));
    }
    var A = parse(v.a), B = parse(v.b);
    if (!A || !B) throw new Error('版本格式应为 主.次.修订，例如 1.3.0-beta.1');
    var c = cmp(A, B), rel = c > 0 ? '大于' : c < 0 ? '小于' : '等于';
    if (v.mode === 'satisfy') {
      var okv = c >= 0;
      return R(KV([['版本 A', String(v.a).trim()], ['要求', '>= ' + String(v.b).trim()], ['是否满足', okv ? '✅ 满足' : '❌ 不满足']]), okv ? 'satisfy: true' : 'satisfy: false');
    }
    return R(KV([['版本 A', String(v.a).trim()], ['版本 B', String(v.b).trim()], ['比较结果', 'A ' + rel + ' B'], ['cmp 值', String(c)]]) +
      HINT('预发布版本低于正式版；按标识符逐段比较，数字按数值、其余按字典序。'), rel + ' (' + c + ')');
  }
});

T({ id: 'regexbuild', name: '常用正则生成', cat: 'dev',
  desc: '内置十余种常用正则，附带说明与测试用例验证', tags: '正则 regex 手机号 邮箱 身份证 生成 校验',
  fields: [
    { k: 'type', label: '正则类型', type: 'select', value: 'phone', options: [
      ['phone', '中国大陆手机号'], ['email', '电子邮箱'], ['date', '日期 YYYY-MM-DD'],
      ['idcard', '18 位身份证号'], ['ipv4', 'IPv4 地址'], ['url', 'http(s) 链接'],
      ['postcode', '邮政编码'], ['chinese', '纯中文'], ['username', '用户名'],
      ['password', '强密码（8 位以上含大小写数字）'], ['hexcolor', 'HEX 颜色'], ['custom', '自定义正则'] ] },
    { k: 'custom', label: '自定义正则（选 custom 时生效）', type: 'text', value: '^[A-Z]{2}\\d{4}$' },
    { k: 'test', label: '测试文本（每行一个）', type: 'textarea', rows: 4, value: '13800138000\n12345\nabc@test.com' }
  ],
  run: function (v) {
    var lib = {
      phone: ['^1[3-9]\\d{9}$', '1 开头、第二位 3~9、共 11 位数字', '13800138000'],
      email: ['^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$', '常见的邮箱地址格式', 'hello@example.com'],
      date: ['^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$', '年-月-日，月份与日期做基础范围校验', '2026-11-15'],
      idcard: ['^[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]$', '18 位身份证格式（不含校验码验证）', '110101199003074516'],
      ipv4: ['^((25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1?\\d?\\d)$', '四段 0~255 的 IPv4 地址', '192.168.1.1'],
      url: ['^https?:\\/\\/[^\\s/$.?#].[^\\s]*$', 'http 或 https 开头的链接', 'https://example.com/a?q=1'],
      postcode: ['^[1-9]\\d{5}$', '6 位中国邮政编码', '518000'],
      chinese: ['^[\\u4e00-\\u9fa5]+$', '仅包含常用汉字', '安空工具箱'],
      username: ['^[A-Za-z][A-Za-z0-9_]{3,15}$', '字母开头，4~16 位字母数字下划线', 'ankong_01'],
      password: ['^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,}$', '至少 8 位，含大小写字母与数字', 'Ankong2026'],
      hexcolor: ['^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$', '3 位或 6 位十六进制颜色', '#FAE185']
    };
    var item = v.type === 'custom' ? [String(v.custom || ''), '自定义表达式', ''] : lib[v.type];
    var re;
    try { re = new RegExp(item[0]); } catch (e) { throw new Error('正则无效：' + e.message); }
    var cases = lines(v.test).filter(function (l) { return l !== ''; });
    if (cases.length === 0 && item[2]) cases = [item[2]];
    var rows = cases.map(function (c) { return [c, re.test(c) ? '✅ 匹配' : '❌ 不匹配']; });
    return R(PRE('/' + item[0] + '/') + KV([['说明', esc(item[1])], ['测试用例', String(cases.length)], ['匹配数', String(rows.filter(function (r) { return r[1].indexOf('✅') === 0; }).length)]]) +
      TB(['测试文本', '结果'], rows) + HINT('表达式可直接复制到代码中使用'), item[0]);
  }
});

T({ id: 'gitignore', name: '.gitignore 生成', cat: 'dev',
  desc: '按技术栈勾选生成 .gitignore 忽略规则', tags: 'git gitignore 忽略 项目 生成 配置',
  fields: [
    { k: 'node', label: 'Node.js', type: 'switch', value: true },
    { k: 'python', label: 'Python', type: 'switch', value: false },
    { k: 'java', label: 'Java / Maven / Gradle', type: 'switch', value: false },
    { k: 'android', label: 'Android', type: 'switch', value: false },
    { k: 'go', label: 'Go', type: 'switch', value: false },
    { k: 'rust', label: 'Rust', type: 'switch', value: false },
    { k: 'ide', label: '编辑器（VSCode / JetBrains）', type: 'switch', value: true },
    { k: 'os', label: '系统文件（.DS_Store / Thumbs.db）', type: 'switch', value: true },
    { k: 'secret', label: '密钥与本地环境变量', type: 'switch', value: true },
    { k: 'extra', label: '追加自定义规则（每行一条）', type: 'textarea', rows: 2, value: '' }
  ],
  run: function (v) {
    var out = ['# 由安空工具箱生成 · ' + new Date().toISOString().slice(0, 10)];
    function block(title, arr) { if (!arr.length) return; out.push('', '# ' + title); out = out.concat(arr); }
    if (v.os) block('系统文件', ['.DS_Store', 'Thumbs.db', 'desktop.ini']);
    if (v.ide) block('编辑器', ['.vscode/', '.idea/', '*.swp', '*.swo', '.history/']);
    if (v.node) block('Node.js', ['node_modules/', 'npm-debug.log*', 'yarn-error.log', 'pnpm-debug.log*', 'dist/', '.next/', 'coverage/', '.env.local']);
    if (v.python) block('Python', ['__pycache__/', '*.py[cod]', '.venv/', 'venv/', '.pytest_cache/', '*.egg-info/', '.mypy_cache/']);
    if (v.java) block('Java', ['target/', 'build/', '*.class', '.gradle/', '*.jar', '*.war']);
    if (v.android) block('Android', ['*.iml', '.gradle/', 'local.properties', 'build/', 'captures/', '.externalNativeBuild/', '*.apk', '*.aab']);
    if (v.go) block('Go', ['/bin/', '/vendor/', '*.test', '*.out', 'go.work.sum']);
    if (v.rust) block('Rust', ['/target/', 'Cargo.lock', '**/*.rs.bk']);
    if (v.secret) block('密钥与本地配置', ['.env', '.env.*', '!.env.example', '*.pem', '*.key', '*.p12', 'secrets.json']);
    var extra = lines(v.extra).filter(function (l) { return l.trim() !== ''; });
    if (extra.length) block('自定义', extra);
    var text = out.join('\n') + '\n';
    return R(PRE(text) + HINT('共 ' + text.split('\n').length + ' 行，可直接保存为项目根目录的 .gitignore'), text);
  }
});

/* ============================================================
   三、计算换算（7）
   ============================================================ */

T({ id: 'salary', name: '税后工资估算', cat: 'calc',
  desc: '估算五险一金、个税与到手工资（按年度综合所得税率）', tags: '工资 个税 五险一金 税后 到手 社保 公积金',
  fields: [
    { k: 'gross', label: '税前月薪（元）', type: 'text', value: '15000' },
    { k: 'base', label: '社保公积金缴费基数（留空同月薪）', type: 'text', value: '' },
    { k: 'fund', label: '公积金个人比例（%）', type: 'text', value: '12' },
    { k: 'special', label: '每月专项附加扣除（元）', type: 'text', value: '1000' },
    { k: 'threshold', label: '每月基本减除费用', type: 'text', value: '5000' }
  ],
  run: function (v) {
    var g = parseNum(v.gross, 0), base = v.base === '' ? g : parseNum(v.base, g);
    var fund = parseNum(v.fund, 12) / 100, special = parseNum(v.special, 0), th = parseNum(v.threshold, 5000);
    var rates = [0.08, 0.02, 0.005, fund];
    var pension = base * rates[0], medical = base * rates[1], unemp = base * rates[2], housing = base * rates[3];
    var social = pension + medical + unemp + housing;
    var taxableM = Math.max(0, g - social - th - special), taxableY = taxableM * 12;
    var bands = [[36000, .03, 0], [144000, .10, 2520], [300000, .20, 16920],
                 [420000, .25, 31920], [660000, .30, 52920], [960000, .35, 85920], [Infinity, .45, 181920]];
    var rate = .03, quick = 0;
    for (var i = 0; i < bands.length; i++) if (taxableY <= bands[i][0]) { rate = bands[i][1]; quick = bands[i][2]; break; }
    var taxY = Math.max(0, taxableY * rate - quick), taxM = taxY / 12;
    var net = g - social - taxM;
    return R(KV([
      ['税前月薪', '¥ ' + fmtMoney(g)],
      ['养老 8%', '¥ ' + fmtMoney(pension)], ['医疗 2%', '¥ ' + fmtMoney(medical)],
      ['失业 0.5%', '¥ ' + fmtMoney(unemp)], ['公积金 ' + round(fund * 100, 1) + '%', '¥ ' + fmtMoney(housing)],
      ['五险一金合计', '¥ ' + fmtMoney(social)],
      ['月应纳税所得额', '¥ ' + fmtMoney(taxableM)],
      ['适用税率 / 速算扣除', (rate * 100) + '% / ¥' + fmtMoney(quick)],
      ['月均个税', '¥ ' + fmtMoney(taxM)],
      ['预计到手', '¥ ' + fmtMoney(net)]
    ]) + HINT('按年度综合所得税率表把月应纳税所得额 ×12 计算年税后再除以 12，为近似估算；实际以累计预扣法与当地社保基数上下限为准。'),
      '到手约 ¥' + fmtMoney(net));
  }
});

T({ id: 'stats', name: '描述性统计', cat: 'calc',
  desc: '一次算出均值、中位数、方差、标准差、四分位数等', tags: '统计 平均数 中位数 方差 标准差 四分位 数据',
  fields: [
    { k: 'data', label: '数值（空格 / 逗号 / 换行分隔）', type: 'textarea', rows: 5,
      value: '12 15 18 22 22 25 28 30 34 40 45 60' },
    { k: 'mode', label: '标准差类型', type: 'select', value: 'sample', options: [
      ['sample', '样本标准差（n-1）'], ['population', '总体标准差（n）'] ] }
  ],
  run: function (v) {
    var arr = String(v.data || '').split(/[\s,，;；]+/).filter(Boolean).map(Number).filter(function (x) { return isFinite(x); });
    if (!arr.length) throw new Error('没有解析到有效数值');
    arr.sort(function (a, b) { return a - b; });
    var n = arr.length, sum = 0, i;
    for (i = 0; i < n; i++) sum += arr[i];
    var mean = sum / n;
    function med(a) { var m = a.length; return m % 2 ? a[(m - 1) / 2] : (a[m / 2 - 1] + a[m / 2]) / 2; }
    var median = med(arr), half = Math.floor(n / 2);
    var q1 = med(arr.slice(0, half)), q3 = med(arr.slice(n % 2 ? half + 1 : half));
    var ss = 0, freq = {};
    for (i = 0; i < n; i++) { ss += Math.pow(arr[i] - mean, 2); freq[arr[i]] = (freq[arr[i]] || 0) + 1; }
    var denom = v.mode === 'sample' ? Math.max(1, n - 1) : n;
    var varr = ss / denom, sd = Math.sqrt(varr), modeVal = null, modeCnt = 0;
    for (var k in freq) if (freq[k] > modeCnt) { modeCnt = freq[k]; modeVal = +k; }
    return R(KV([
      ['样本数', String(n)], ['总和', num(sum)], ['最小值 / 最大值', num(arr[0]) + ' / ' + num(arr[n - 1])],
      ['极差', num(arr[n - 1] - arr[0])], ['平均值', num(mean)], ['中位数', num(median)],
      ['众数', modeCnt > 1 ? num(modeVal) + '（出现 ' + modeCnt + ' 次）' : '无明显众数'],
      ['Q1 / Q3', num(q1) + ' / ' + num(q3)], ['四分位距 IQR', num(q3 - q1)],
      ['方差', num(varr)], ['标准差', num(sd)],
      ['变异系数', mean ? num(sd / Math.abs(mean) * 100) + '%' : '—']
    ]) + SEC('排序后的数据') + PRE(arr.join(', ')), '均值 ' + num(mean) + '，标准差 ' + num(sd));
  }
});

T({ id: 'triangle', name: '直角三角形求解', cat: 'calc',
  desc: '已知两边或一边一角，求斜边、角度、面积与周长', tags: '三角形 勾股 斜边 角度 面积 三角函数',
  fields: [
    { k: 'mode', label: '已知条件', type: 'select', value: 'ab', options: [
      ['ab', '两条直角边 a、b'], ['ac', '直角边 a 与斜边 c'], ['angle', '斜边 c 与锐角 A（度）'] ] },
    { k: 'a', label: '直角边 a', type: 'text', value: '3' },
    { k: 'b', label: '直角边 b', type: 'text', value: '4' },
    { k: 'c', label: '斜边 c', type: 'text', value: '5' },
    { k: 'ang', label: '锐角 A（度）', type: 'text', value: '30' }
  ],
  run: function (v) {
    var a, b, c, A, B;
    if (v.mode === 'ab') {
      a = parseNum(v.a, 3); b = parseNum(v.b, 4);
      if (a <= 0 || b <= 0) throw new Error('直角边必须为正数');
      c = Math.sqrt(a * a + b * b); A = Math.atan2(a, b) * 180 / Math.PI;
    } else if (v.mode === 'ac') {
      a = parseNum(v.a, 3); c = parseNum(v.c, 5);
      if (a <= 0 || c <= a) throw new Error('需要 0 < a < c');
      b = Math.sqrt(c * c - a * a); A = Math.asin(a / c) * 180 / Math.PI;
    } else {
      c = parseNum(v.c, 5); A = parseNum(v.ang, 30);
      if (c <= 0 || A <= 0 || A >= 90) throw new Error('需要 c > 0 且 0 < A < 90');
      var rad = A * Math.PI / 180; a = c * Math.sin(rad); b = c * Math.cos(rad);
    }
    B = 90 - A;
    return R(KV([
      ['直角边 a', num(a)], ['直角边 b', num(b)], ['斜边 c', num(c)],
      ['锐角 A', num(A) + '°'], ['锐角 B', num(B) + '°'],
      ['面积', num(a * b / 2)], ['周长', num(a + b + c)],
      ['勾股校验 a²+b²', num(a * a + b * b)], ['斜边平方 c²', num(c * c)]
    ]) + HINT('a 为角 A 的对边、b 为角 A 的邻边；角度单位为度。'), 'c=' + num(c) + ', 面积=' + num(a * b / 2));
  }
});

T({ id: 'prob', name: '排列组合与概率', cat: 'calc',
  desc: '计算排列数、组合数与二项分布概率', tags: '概率 排列 组合 二项分布 阶乘 数学',
  fields: [
    { k: 'n', label: '总数 n', type: 'text', value: '10' },
    { k: 'k', label: '选取数 k / 成功次数', type: 'text', value: '3' },
    { k: 'p', label: '单次成功概率 p（0~1）', type: 'text', value: '0.5' },
    { k: 'mode', label: '计算类型', type: 'select', value: 'comb', options: [
      ['comb', '组合数 C(n,k)'], ['perm', '排列数 A(n,k)'], ['repeat', '可重复排列 n^k'],
      ['binom', '二项分布 P(X=k)'], ['atleast', '二项分布 P(X≥k)'], ['atmost', '二项分布 P(X≤k)'] ] }
  ],
  run: function (v) {
    var n = Math.round(parseNum(v.n, 10)), k = Math.round(parseNum(v.k, 3)), p = parseNum(v.p, .5);
    if (n < 0 || k < 0 || k > n) throw new Error('需要 0 ≤ k ≤ n');
    if (p < 0 || p > 1) throw new Error('概率 p 需在 0 ~ 1 之间');
    function fact(x) { var r = 1; for (var i = 2; i <= x; i++) r *= i; return r; }
    var C = comb(n, k), res, label;
    if (v.mode === 'comb') { res = C; label = 'C(' + n + ',' + k + ')'; }
    else if (v.mode === 'perm') { res = fact(n) / fact(n - k); label = 'A(' + n + ',' + k + ')'; }
    else if (v.mode === 'repeat') { res = Math.pow(n, k); label = n + '^' + k; }
    else {
      function pmf(i) { return comb(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i); }
      var rows = [], i;
      for (i = 0; i <= n; i++) rows.push([i, num(pmf(i), 6), num(pmf(i) * 100, 3) + '%']);
      if (v.mode === 'binom') { res = pmf(k); label = 'P(X=' + k + ')'; }
      else if (v.mode === 'atleast') { res = 0; for (i = k; i <= n; i++) res += pmf(i); label = 'P(X≥' + k + ')'; }
      else { res = 0; for (i = 0; i <= k; i++) res += pmf(i); label = 'P(X≤' + k + ')'; }
      return R(KV([['参数', 'n=' + n + ', k=' + k + ', p=' + num(p)], [label, num(res, 8)], ['百分比', num(res * 100, 4) + '%']]) +
        SEC('完整分布') + TB(['X', 'P(X)', '百分比'], rows) + HINT('二项分布假设每次试验独立且成功概率相同。'), label + ' = ' + num(res, 8));
    }
    return R(KV([['n / k', n + ' / ' + k], [label, num(res)], ['组合数 C(n,k)', num(C)], ['排列数 A(n,k)', num(fact(n) / fact(n - k))]]) +
      HINT('阶乘在 n 较大时可能超出浮点精度，结果仅供参考。'), label + ' = ' + num(res));
  }
});

T({ id: 'invest', name: '定投收益估算', cat: 'calc',
  desc: '按月定投复利计算期末资产、总收益与逐年明细', tags: '定投 基金 复利 收益 理财 投资 年化',
  fields: [
    { k: 'monthly', label: '每月投入（元）', type: 'text', value: '1000' },
    { k: 'years', label: '投资年数', type: 'text', value: '10' },
    { k: 'rate', label: '预期年化收益率（%）', type: 'text', value: '6' },
    { k: 'initial', label: '初始本金（元）', type: 'text', value: '0' },
    { k: 'timing', label: '投入时点', type: 'select', value: 'end', options: [
      ['end', '月末投入（普通年金）'], ['begin', '月初投入（预付年金）'] ] }
  ],
  run: function (v) {
    var m0 = parseNum(v.monthly, 1000), yr = parseNum(v.years, 10), rate = parseNum(v.rate, 6) / 100;
    var init = parseNum(v.initial, 0), months = Math.max(1, Math.round(yr * 12)), r = rate / 12;
    var fv, i;
    if (Math.abs(r) < 1e-12) fv = init + m0 * months;
    else {
      var grow = Math.pow(1 + r, months);
      fv = init * grow + m0 * (grow - 1) / r * (v.timing === 'begin' ? (1 + r) : 1);
    }
    var invested = init + m0 * months, gain = fv - invested;
    var rows = [];
    for (i = 1; i <= Math.min(months, 30 * 12); i++) {
      var y = i / 12;
      if (i % 12 !== 0 && i !== months) continue;
      var g = Math.pow(1 + r, i), f = Math.abs(r) < 1e-12 ? init + m0 * i : init * g + m0 * (g - 1) / r * (v.timing === 'begin' ? (1 + r) : 1);
      rows.push([num(y, 1), fmtMoney(init + m0 * i), fmtMoney(f), fmtMoney(f - init - m0 * i)]);
    }
    return R(KV([
      ['总投入本金', '¥ ' + fmtMoney(invested)],
      ['期末资产', '¥ ' + fmtMoney(fv)],
      ['累计收益', '¥ ' + fmtMoney(gain)],
      ['总收益率', num(invested ? gain / invested * 100 : 0) + '%'],
      ['月利率', num(r * 100) + '%'], ['期数', months + ' 个月']
    ]) + SEC('逐年明细') + TB(['年', '累计投入', '期末资产', '累计收益'], rows) +
      HINT('按固定年化收益复利估算，未计手续费、税费与市场波动，不构成投资建议。'), '期末约 ¥' + fmtMoney(fv));
  }
});

T({ id: 'workhours', name: '工时与加班费', cat: 'calc',
  desc: '按 1.5 / 2 / 3 倍工资核算正常工时与加班费', tags: '加班费 工时 工资 1.5倍 双倍 三倍 考勤',
  fields: [
    { k: 'hourly', label: '正常时薪（元/小时）', type: 'text', value: '50' },
    { k: 'normal', label: '正常出勤工时', type: 'text', value: '174' },
    { k: 'ot1', label: '工作日加班小时（1.5 倍）', type: 'text', value: '10' },
    { k: 'ot2', label: '休息日加班小时（2 倍）', type: 'text', value: '8' },
    { k: 'ot3', label: '法定节假日加班小时（3 倍）', type: 'text', value: '0' }
  ],
  run: function (v) {
    var h = parseNum(v.hourly, 50), n = parseNum(v.normal, 0);
    var a = parseNum(v.ot1, 0), b = parseNum(v.ot2, 0), c = parseNum(v.ot3, 0);
    var base = h * n, p1 = h * 1.5 * a, p2 = h * 2 * b, p3 = h * 3 * c;
    var total = base + p1 + p2 + p3, hours = n + a + b + c;
    return R(TB(['项目', '小时', '倍率', '金额（元）'], [
      ['正常出勤', num(n), '1', fmtMoney(base)],
      ['工作日加班', num(a), '1.5', fmtMoney(p1)],
      ['休息日加班', num(b), '2', fmtMoney(p2)],
      ['法定节假日加班', num(c), '3', fmtMoney(p3)],
      ['合计', num(hours), '—', fmtMoney(total)]
    ]) + KV([['折合平均时薪', '¥ ' + fmtMoney(hours ? total / hours : 0)], ['加班费占比', total ? num((p1 + p2 + p3) / total * 100) + '%' : '0%']]) +
      HINT('倍率依据《劳动法》常见口径；具体以劳动合同与当地规定为准。'), '合计 ¥' + fmtMoney(total));
  }
});

T({ id: 'ratio', name: '按比例分摊', cat: 'calc',
  desc: '按权重把总额分摊给多方，自动处理除不尽的尾差', tags: '分摊 比例 权重 AA 分配 金额 尾差',
  fields: [
    { k: 'total', label: '待分摊总额', type: 'text', value: '10000' },
    { k: 'parts', label: '参与方（每行「名称,权重」或只写权重）', type: 'textarea', rows: 5,
      value: '甲,3\n乙,2\n丙,1' },
    { k: 'unit', label: '金额单位', type: 'text', value: '元' }
  ],
  run: function (v) {
    var total = parseNum(v.total, 0), arr = lines(v.parts).filter(function (l) { return l.trim() !== ''; });
    var items = arr.map(function (l, i) {
      var p = l.split(/[,，\t]/), name, w;
      if (p.length >= 2) { name = p[0].trim(); w = parseNum(p[1], 0); }
      else { name = '第 ' + (i + 1) + ' 方'; w = parseNum(p[0], 0); }
      return { name: name || '第 ' + (i + 1) + ' 方', w: w };
    });
    var sum = items.reduce(function (s, x) { return s + Math.max(0, x.w); }, 0);
    if (sum <= 0) throw new Error('权重之和必须大于 0');
    var acc = 0, rows = items.map(function (x, i) {
      var amt = i === items.length - 1 ? round(total - acc, 2) : round(total * Math.max(0, x.w) / sum, 2);
      acc = round(acc + amt, 2);
      return [x.name, num(Math.max(0, x.w)), num(Math.max(0, x.w) / sum * 100) + '%', fmtMoney(amt)];
    });
    return R(TB(['参与方', '权重', '占比', '分摊金额（' + esc(v.unit || '元') + '）'], rows) +
      KV([['总额', fmtMoney(total)], ['权重合计', num(sum)], ['分摊合计', fmtMoney(acc)]]) +
      HINT('最后一方承接四舍五入产生的尾差，保证分摊合计与总额严格一致。'), rows.map(function (r) { return r[0] + ' ' + r[3]; }).join('\n'));
  }
});

/* ============================================================
   四、生活（8）
   ============================================================ */

T({ id: 'coupon', name: '优惠方案比价', cat: 'life',
  desc: '自动比较满减、折扣与无门槛券，找出最省钱的一种', tags: '满减 折扣 优惠券 比价 省钱 购物 实付',
  fields: [
    { k: 'amount', label: '订单金额（元）', type: 'text', value: '268' },
    { k: 'coupons', label: '优惠券（每行一条：满100减20 / 8.5折 / 减15）', type: 'textarea', rows: 6,
      value: '满100减20\n满200减50\n满300减80\n8.5折\n减15' },
    { k: 'stack', label: '显示所有方案对比', type: 'switch', value: true }
  ],
  run: function (v) {
    var amt = parseNum(v.amount, 0), list = lines(v.coupons).filter(function (l) { return l.trim() !== ''; });
    var res = list.map(function (s) {
      var t = s.trim(), save = 0, ok = true, desc = '';
      var m = t.match(/满\s*([\d.]+)\s*减\s*([\d.]+)/);
      if (m) { ok = amt >= parseNum(m[1], 0); save = ok ? parseNum(m[2], 0) : 0; desc = '满 ' + m[1] + ' 减 ' + m[2]; }
      else if ((m = t.match(/([\d.]+)\s*折/))) {
        var d = parseNum(m[1], 10); if (d <= 0 || d > 10) throw new Error('折扣应为 0~10 之间的数字，如 8.5 折');
        save = amt * (1 - d / 10); desc = d + ' 折';
      } else if ((m = t.match(/减\s*([\d.]+)/))) { save = parseNum(m[1], 0); desc = '无门槛减 ' + m[1]; }
      else throw new Error('无法识别优惠券：' + t + '（支持 满X减Y / X折 / 减Y）');
      save = Math.min(amt, Math.max(0, save));
      return { raw: t, desc: desc, ok: ok, save: save, pay: amt - save };
    });
    var valid = res.filter(function (x) { return x.ok && x.save > 0; });
    valid.sort(function (a, b) { return b.save - a.save; });
    var best = valid[0];
    var rows = res.map(function (x) { return [x.raw, x.desc, x.ok ? '可用' : '不满足门槛', fmtMoney(x.save), fmtMoney(x.pay)]; });
    return R(KV([['订单金额', '¥ ' + fmtMoney(amt)],
      ['最优方案', best ? best.raw : '无可用的优惠券'],
      ['最多可省', '¥ ' + fmtMoney(best ? best.save : 0)],
      ['最优实付', '¥ ' + fmtMoney(best ? best.pay : amt)]]) +
      (v.stack ? SEC('全部方案对比') + TB(['原始输入', '规则', '是否可用', '优惠', '实付'], rows) : '') +
      HINT('各券按"单独使用"计算，未考虑平台叠加规则；折扣与满减以实付更低者优先。'),
      best ? best.raw + ' 实付 ¥' + fmtMoney(best.pay) : '实付 ¥' + fmtMoney(amt));
  }
});

T({ id: 'travel', name: '行程时间规划', cat: 'life',
  desc: '把多段路程耗时串成时间轴，可正推到达或倒推出发', tags: '行程 时间 规划 通勤 出发 到达 倒推',
  fields: [
    { k: 'time', label: '出发时间 / 期望到达时间（HH:MM）', type: 'text', value: '08:00' },
    { k: 'legs', label: '每段行程（每行「名称,分钟」）', type: 'textarea', rows: 6,
      value: '步行到地铁,8\n地铁 2 号线,22\n换乘步行,6\n地铁 5 号线,18\n步行到公司,10' },
    { k: 'reverse', label: '倒推模式（由到达时间反推出发）', type: 'switch', value: false },
    { k: 'buffer', label: '预留缓冲时间（分钟）', type: 'text', value: '5' }
  ],
  run: function (v) {
    var m = String(v.time || '').match(/^(\d{1,2}):(\d{2})$/);
    if (!m) throw new Error('时间格式应为 HH:MM，例如 08:00');
    var base = +m[1] * 60 + +m[2], legs = lines(v.legs).filter(function (l) { return l.trim() !== ''; })
      .map(function (l, i) {
        var p = l.split(/[,，\t]/);
        return { name: (p[0] || ('第 ' + (i + 1) + ' 段')).trim(), min: Math.max(0, parseNum(p[1], 0)) };
      });
    var total = legs.reduce(function (s, x) { return s + x.min; }, 0) + Math.max(0, parseNum(v.buffer, 0));
    function hhmm(t) { t = ((t % 1440) + 1440) % 1440; return padL(Math.floor(t / 60), 2) + ':' + padL(t % 60, 2); }
    var cursor = v.reverse ? base - total : base, rows = [];
    legs.forEach(function (x, i) {
      rows.push([i + 1, x.name, String(x.min) + ' 分钟', hhmm(cursor) + ' → ' + hhmm(cursor + x.min)]);
      cursor += x.min;
    });
    var buf = Math.max(0, parseNum(v.buffer, 0));
    if (buf) rows.push([legs.length + 1, '缓冲预留', String(buf) + ' 分钟', hhmm(cursor) + ' → ' + hhmm(cursor + buf)]);
    var start = v.reverse ? base - total : base, end = v.reverse ? base : base + total;
    return R(KV([
      [v.reverse ? '期望到达' : '出发时间', hhmm(v.reverse ? end : start)],
      [v.reverse ? '应出发时间' : '预计到达', hhmm(v.reverse ? start : end)],
      ['行程段数', String(legs.length)], ['总耗时', total + ' 分钟（' + num(total / 60) + ' 小时）']
    ]) + SEC('时间轴') + TB(['#', '路段', '耗时', '时间段'], rows), (v.reverse ? '应 ' + hhmm(start) + ' 出发' : '预计 ' + hhmm(end) + ' 到达'));
  }
});

T({ id: 'budget', name: '月度预算分配', cat: 'life',
  desc: '按 50/30/20 法则或自定义比例分配收入', tags: '预算 收入 分配 理财 50/30/20 记账',
  fields: [
    { k: 'income', label: '月收入（元）', type: 'text', value: '12000' },
    { k: 'mode', label: '分配法则', type: 'select', value: '503020', options: [
      ['503020', '50/30/20 法则'], ['632', '60/30/10'], ['custom', '自定义比例'] ] },
    { k: 'needs', label: '必要支出比例（%）', type: 'text', value: '50' },
    { k: 'wants', label: '想要支出比例（%）', type: 'text', value: '30' },
    { k: 'save', label: '储蓄投资比例（%）', type: 'text', value: '20' },
    { k: 'fixed', label: '固定支出（每行「名称,金额」）', type: 'textarea', rows: 4,
      value: '房租,3500\n通勤,600\n话费,100' }
  ],
  run: function (v) {
    var inc = parseNum(v.income, 0), p;
    if (v.mode === '503020') p = [50, 30, 20];
    else if (v.mode === '632') p = [60, 30, 10];
    else p = [parseNum(v.needs, 50), parseNum(v.wants, 30), parseNum(v.save, 20)];
    var sum = p[0] + p[1] + p[2];
    if (sum <= 0) throw new Error('比例合计必须大于 0');
    var alloc = p.map(function (x) { return inc * x / sum; });
    var fixed = lines(v.fixed).filter(function (l) { return l.trim() !== ''; }).map(function (l) {
      var q = l.split(/[,，\t]/); return { name: (q[0] || '').trim(), amt: parseNum(q[1], 0) };
    });
    var fixedSum = fixed.reduce(function (s, x) { return s + x.amt; }, 0);
    var rows = [
      ['必要支出', p[0] + '%', fmtMoney(alloc[0])],
      ['想要支出', p[1] + '%', fmtMoney(alloc[1])],
      ['储蓄投资', p[2] + '%', fmtMoney(alloc[2])]
    ];
    return R(TB(['分类', '比例', '建议额度（元）'], rows) +
      SEC('固定支出明细') + TB(['项目', '金额（元）'], fixed.map(function (x) { return [x.name, fmtMoney(x.amt)]; })) +
      KV([
        ['固定支出合计', '¥ ' + fmtMoney(fixedSum)],
        ['占必要支出', alloc[0] ? num(fixedSum / alloc[0] * 100) + '%' : '—'],
        ['必要支出剩余', '¥ ' + fmtMoney(alloc[0] - fixedSum)],
        ['每日可用（想要支出）', '¥ ' + fmtMoney(alloc[1] / 30)]
      ]) + HINT('比例按合计 ' + num(sum) + '% 归一化；每日可用按 30 天估算。'),
      '必要 ' + fmtMoney(alloc[0]) + ' / 想要 ' + fmtMoney(alloc[1]) + ' / 储蓄 ' + fmtMoney(alloc[2]));
  }
});

T({ id: 'lifedays', name: '人生日历', cat: 'life',
  desc: '计算已活天数、周数、进度与下一个万天里程碑', tags: '人生 天数 生日 里程碑 年龄 倒计时',
  fields: [
    { k: 'birth', label: '出生日期（YYYY-MM-DD）', type: 'text', value: '1995-06-15' },
    { k: 'expect', label: '预期寿命（岁）', type: 'text', value: '80' },
    { k: 'today', label: '计算基准日（留空为今天）', type: 'text', value: '' }
  ],
  run: function (v) {
    function pd(s) { var m = String(s).match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if (!m) return null; var d = new Date(+m[1], +m[2] - 1, +m[3]); return isNaN(d.getTime()) ? null : d; }
    var b = pd(v.birth); if (!b) throw new Error('出生日期格式应为 YYYY-MM-DD');
    var now = v.today ? pd(v.today) : new Date(); if (!now) throw new Error('基准日格式应为 YYYY-MM-DD');
    now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.floor((now - b) / 86400000);
    if (days < 0) throw new Error('出生日期晚于基准日');
    var exp = parseNum(v.expect, 80), total = Math.round(exp * 365.2425), pct = days / total * 100;
    var next = (Math.floor(days / 10000) + 1) * 10000;
    var nextD = new Date(b.getTime() + next * 86400000);
    var birthday = new Date(now.getFullYear(), b.getMonth(), b.getDate());
    if (birthday < now) birthday = new Date(now.getFullYear() + 1, b.getMonth(), b.getDate());
    function ds(d) { return d.getFullYear() + '-' + padL(d.getMonth() + 1, 2) + '-' + padL(d.getDate(), 2); }
    return R(KV([
      ['已活天数', days.toLocaleString() + ' 天'],
      ['已活周数', Math.floor(days / 7).toLocaleString() + ' 周'],
      ['约合月数', num(days / 30.4375, 1) + ' 个月'],
      ['周岁', String(now.getFullYear() - b.getFullYear() - ((now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) ? 1 : 0)) + ' 岁'],
      ['按 ' + num(exp, 0) + ' 岁计的人生进度', num(pct, 3) + '%'],
      ['预计总天数', total.toLocaleString() + ' 天'],
      ['下一个万天里程碑', '第 ' + next.toLocaleString() + ' 天 → ' + ds(nextD) + '（还有 ' + (next - days).toLocaleString() + ' 天）'],
      ['下次生日', ds(birthday) + '（还有 ' + Math.round((birthday - now) / 86400000) + ' 天）']
    ]) + HINT('按公历估算，闰年已由日期差自动计入；预期寿命仅用于进度演示。'), '已活 ' + days + ' 天，进度 ' + num(pct, 2) + '%');
  }
});

T({ id: 'habit', name: '习惯打卡统计', cat: 'life',
  desc: '统计打卡天数、当前连续、最长连续与近 30 天完成率', tags: '习惯 打卡 连续 坚持 统计 自律',
  fields: [
    { k: 'dates', label: '打卡日期（每行 YYYY-MM-DD）', type: 'textarea', rows: 6,
      value: '2026-11-01\n2026-11-02\n2026-11-03\n2026-11-05\n2026-11-06\n2026-11-08\n2026-11-09\n2026-11-10\n2026-11-11\n2026-11-12\n2026-11-13\n2026-11-14' },
    { k: 'today', label: '统计截止日（留空取最后一个打卡日）', type: 'text', value: '2026-11-15' }
  ],
  run: function (v) {
    function pd(s) { var m = String(s).trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); if (!m) return null; var d = new Date(+m[1], +m[2] - 1, +m[3]); return isNaN(d.getTime()) ? null : d; }
    var set = {}, list = [];
    lines(v.dates).forEach(function (l) {
      var d = pd(l); if (!d) return;
      var key = d.getFullYear() + '-' + padL(d.getMonth() + 1, 2) + '-' + padL(d.getDate(), 2);
      if (!set[key]) { set[key] = 1; list.push(d); }
    });
    if (!list.length) throw new Error('没有解析到有效的打卡日期');
    list.sort(function (a, b) { return a - b; });
    var end = v.today ? (pd(v.today) || list[list.length - 1]) : list[list.length - 1];
    var maxStreak = 0, cur = 0, prev = null;
    list.forEach(function (d) {
      if (prev && Math.round((d - prev) / 86400000) === 1) cur++; else cur = 1;
      if (cur > maxStreak) maxStreak = cur;
      prev = d;
    });
    var todayStreak = 0, probe = new Date(end.getTime());
    for (var i = 0; i < 3650; i++) {
      var key = probe.getFullYear() + '-' + padL(probe.getMonth() + 1, 2) + '-' + padL(probe.getDate(), 2);
      if (!set[key]) break;
      todayStreak++;
      probe = new Date(probe.getTime() - 86400000);
    }
    var recent = 0;
    for (i = 0; i < 30; i++) {
      var d2 = new Date(end.getTime() - i * 86400000);
      var k2 = d2.getFullYear() + '-' + padL(d2.getMonth() + 1, 2) + '-' + padL(d2.getDate(), 2);
      if (set[k2]) recent++;
    }
    var span = Math.round((end - list[0]) / 86400000) + 1;
    return R(KV([
      ['累计打卡', list.length + ' 天'],
      ['打卡跨度', span + ' 天'],
      ['最长连续', maxStreak + ' 天'],
      ['截至统计日连续', todayStreak + ' 天' + (todayStreak === 0 ? '（当天未打卡）' : '')],
      ['近 30 天完成率', num(recent / 30 * 100) + '%（' + recent + '/30 天）'],
      ['整体完成率', num(list.length / span * 100) + '%'],
      ['首次打卡', list[0].getFullYear() + '-' + padL(list[0].getMonth() + 1, 2) + '-' + padL(list[0].getDate(), 2)]
    ]) + HINT('日期会自动去重并按日历天计算连续；断签后连续天数重新从 1 开始。'), '累计 ' + list.length + ' 天，最长连续 ' + maxStreak + ' 天');
  }
});

T({ id: 'commute', name: '通勤成本核算', cat: 'life',
  desc: '把通勤时间折算成钱，算出月度与年度真实成本', tags: '通勤 时间成本 交通费 工资 折算 上班',
  fields: [
    { k: 'days', label: '每月通勤天数', type: 'text', value: '22' },
    { k: 'oneway', label: '单程耗时（分钟）', type: 'text', value: '45' },
    { k: 'fare', label: '单程交通费（元）', type: 'text', value: '6' },
    { k: 'hourly', label: '你的时间价值（元/小时）', type: 'text', value: '50' },
    { k: 'roundtrip', label: '按往返计算', type: 'switch', value: true }
  ],
  run: function (v) {
    var days = parseNum(v.days, 0), mins = parseNum(v.oneway, 0), fare = parseNum(v.fare, 0);
    var hourly = parseNum(v.hourly, 0), times = v.roundtrip ? 2 : 1;
    var hoursM = mins * times * days / 60, moneyM = fare * times * days;
    var timeCostM = hoursM * hourly, totalM = moneyM + timeCostM;
    return R(KV([
      ['每月通勤天数', num(days) + ' 天'],
      ['每月通勤时长', num(hoursM, 1) + ' 小时（约 ' + num(hoursM / 8, 1) + ' 个工作日）'],
      ['每月交通费', '¥ ' + fmtMoney(moneyM)],
      ['每月时间成本', '¥ ' + fmtMoney(timeCostM)],
      ['每月综合成本', '¥ ' + fmtMoney(totalM)],
      ['年度综合成本', '¥ ' + fmtMoney(totalM * 12)],
      ['每年投入时间', num(hoursM * 12, 0) + ' 小时']
    ]) + HINT('时间价值可按税后时薪估算；这里只做量化参考，帮助比较租房、换工作等方案。'), '每月综合成本约 ¥' + fmtMoney(totalM));
  }
});

T({ id: 'subscription', name: '订阅费用年化', cat: 'life',
  desc: '把月付 / 季付 / 年付订阅统一折算，看清一年花多少', tags: '订阅 会员 年费 月费 记账 自动续费 汇总',
  fields: [
    { k: 'items', label: '订阅项（每行「名称,金额,周期」）', type: 'textarea', rows: 6,
      value: '视频会员,25,月\n音乐会员,15,月\n云盘,168,年\n杂志,99,季\n软件许可,8,周' },
    { k: 'sort', label: '按年费从高到低排序', type: 'switch', value: true }
  ],
  run: function (v) {
    var unit = { '日': 365, '天': 365, '周': 52, '月': 12, '季': 4, '半年': 2, '年': 1, 'd': 365, 'w': 52, 'm': 12, 'y': 1 };
    var items = lines(v.items).filter(function (l) { return l.trim() !== ''; }).map(function (l, i) {
      var p = l.split(/[,，\t]/), u = String(p[2] || '月').trim(), f = unit[u];
      if (!f) throw new Error('第 ' + (i + 1) + ' 行周期「' + u + '」无法识别（支持 日/周/月/季/半年/年）');
      var price = parseNum(p[1], 0);
      return { name: (p[0] || ('订阅 ' + (i + 1))).trim(), price: price, unit: u, f: f, year: price * f };
    });
    if (v.sort) items.sort(function (a, b) { return b.year - a.year; });
    var totalY = items.reduce(function (s, x) { return s + x.year; }, 0);
    return R(TB(['订阅项', '单次金额', '周期', '年化金额'], items.map(function (x) {
      return [x.name, fmtMoney(x.price), x.unit, fmtMoney(x.year)];
    })) + KV([
      ['订阅项数量', String(items.length)],
      ['年度合计', '¥ ' + fmtMoney(totalY)],
      ['月均', '¥ ' + fmtMoney(totalY / 12)],
      ['日均', '¥ ' + fmtMoney(totalY / 365)],
      ['占月入 10000 元比例', num(totalY / 12 / 10000 * 100) + '%']
    ]) + HINT('周按 52、月按 12、季按 4、日按 365 折算；一次性买断不计入。'), '年度合计 ¥' + fmtMoney(totalY));
  }
});

T({ id: 'electricity', name: '阶梯电费计算', cat: 'life',
  desc: '按三档阶梯电价拆分用电量并计算总电费', tags: '电费 阶梯 电价 用电量 分档 账单',
  fields: [
    { k: 'kwh', label: '本期用电量（度）', type: 'text', value: '420' },
    { k: 'l1', label: '第一档上限（度）', type: 'text', value: '260' },
    { k: 'l2', label: '第二档上限（度）', type: 'text', value: '600' },
    { k: 'p1', label: '第一档单价（元/度）', type: 'text', value: '0.68' },
    { k: 'p2', label: '第二档单价（元/度）', type: 'text', value: '0.73' },
    { k: 'p3', label: '第三档单价（元/度）', type: 'text', value: '0.98' }
  ],
  run: function (v) {
    var kwh = parseNum(v.kwh, 0), l1 = parseNum(v.l1, 260), l2 = parseNum(v.l2, 600);
    if (l2 < l1) throw new Error('第二档上限应不小于第一档上限');
    var p1 = parseNum(v.p1, .68), p2 = parseNum(v.p2, .73), p3 = parseNum(v.p3, .98);
    var u1 = Math.min(kwh, l1), u2 = Math.min(Math.max(0, kwh - l1), l2 - l1), u3 = Math.max(0, kwh - l2);
    var c1 = u1 * p1, c2 = u2 * p2, c3 = u3 * p3, total = c1 + c2 + c3;
    return R(TB(['档位', '电量区间（度）', '本期电量', '单价', '电费（元）'], [
      ['第一档', '0 ~ ' + num(l1), num(u1), fmtMoney(p1), fmtMoney(c1)],
      ['第二档', num(l1) + ' ~ ' + num(l2), num(u2), fmtMoney(p2), fmtMoney(c2)],
      ['第三档', num(l2) + ' 以上', num(u3), fmtMoney(p3), fmtMoney(c3)]
    ]) + KV([
      ['总用电量', num(kwh) + ' 度'], ['总电费', '¥ ' + fmtMoney(total)],
      ['平均单价', '¥ ' + fmtMoney(kwh ? total / kwh : 0) + ' / 度'],
      ['若全按第一档', '¥ ' + fmtMoney(kwh * p1)],
      ['阶梯多支出', '¥ ' + fmtMoney(total - kwh * p1)]
    ]) + HINT('默认档位与单价为示例参考值，请按当地居民阶梯电价修改；部分省市按年周期累进计费。'), '总电费 ¥' + fmtMoney(total));
  }
});

/* ============================================================
   五、查询速查（6）
   ============================================================ */

T({ id: 'wifichan', name: 'WiFi 信道速查', cat: 'query',
  desc: '2.4G / 5G 信道频率对照与抗干扰选道建议', tags: 'WiFi 信道 2.4G 5G 频率 干扰 路由器',
  fields: [
    { k: 'band', label: '频段', type: 'select', value: 'all', options: [
      ['all', '全部'], ['24', '仅 2.4 GHz'], ['5', '仅 5 GHz'] ] },
    { k: 'width', label: '频宽', type: 'select', value: '20', options: [
      ['20', '20 MHz'], ['40', '40 MHz'], ['80', '80 MHz'], ['160', '160 MHz'] ] }
  ],
  run: function (v) {
    var html = '', text = '';
    if (v.band === 'all' || v.band === '24') {
      var rows = [];
      for (var i = 1; i <= 13; i++) {
        var f = 2412 + (i - 1) * 5;
        rows.push([String(i), f + ' MHz', (i === 1 || i === 6 || i === 11) ? '推荐（互不重叠）' : '与相邻信道重叠']);
      }
      html += SEC('2.4 GHz 信道（中心频率）') + TB(['信道', '中心频率', '说明'], rows);
      text += '2.4G: 1/6/11 互不重叠；' + rows.map(function (r) { return r[0] + '=' + r[1]; }).join(' ') + '\n';
    }
    if (v.band === 'all' || v.band === '5') {
      var rows5 = [[36, 5180], [40, 5200], [44, 5220], [48, 5240], [52, 5260], [56, 5280],
                   [60, 5300], [64, 5320], [149, 5745], [153, 5765], [157, 5785], [161, 5805], [165, 5825]];
      html += SEC('5 GHz 常用信道') + TB(['信道', '中心频率', '说明'], rows5.map(function (r) {
        return [String(r[0]), r[1] + ' MHz', r[0] >= 149 ? '中国常用，可用功率较高' : '部分信道需雷达避让（DFS）'];
      }));
      text += '5G: 36/40/44/48 与 149/153/157/161/165 最常用\n';
    }
    html += SEC('选道建议') + KV([
      ['2.4 GHz', '优先 1 / 6 / 11（或 1 / 5 / 9 / 13），三者互不重叠'],
      ['频宽 ' + v.width + ' MHz', v.width === '20' ? '2.4G 建议固定 20 MHz，减少同频干扰' : '频宽越大速率越高，但占用的信道越多、越易受干扰'],
      ['5 GHz', '优先 36~48 或 149~165；DFS 信道可能被雷达抢占'],
      ['排查干扰', '蓝牙、微波炉、无线鼠标、邻居路由器都会占用 2.4G']
    ]);
    return R(html + HINT('不同国家/地区可用信道不同，本表按中国常见配置列出。'), text);
  }
});

T({ id: 'usbspec', name: 'USB 规格速查', cat: 'query',
  desc: 'USB 2.0 / 3.2 / USB4 / 雷电的速率与接口对照', tags: 'USB Type-C 雷电 速率 充电 规格 接口',
  fields: [
    { k: 'q', label: '筛选关键词（留空显示全部）', type: 'text', value: '' },
    { k: 'unit', label: '速率单位', type: 'select', value: 'gbps', options: [
      ['gbps', 'Gbps'], ['mbs', 'MB/s（理论值）'] ] }
  ],
  run: function (v) {
    var data = [
      ['USB 2.0', '480 Mbps', '60 MB/s', 'USB-A / Micro-B / Type-C', '5V 0.5A', '最常见，键盘鼠标与低速设备足够'],
      ['USB 3.2 Gen 1', '5 Gbps', '500 MB/s', 'USB-A（蓝）/ Type-C', '5V 0.9A', '原名 USB 3.0 / USB 3.1 Gen 1'],
      ['USB 3.2 Gen 2', '10 Gbps', '1000 MB/s', 'USB-A / Type-C', '5V 1.5A', '原名 USB 3.1 Gen 2'],
      ['USB 3.2 Gen 2x2', '20 Gbps', '2000 MB/s', '仅 Type-C', '5V 1.5A', '需要双通道线缆与主机支持'],
      ['USB4 20/40', '20 / 40 Gbps', '2500 / 5000 MB/s', '仅 Type-C', '最高 100W (PD)', '兼容雷电 3，支持显示输出'],
      ['USB4 v2', '80 Gbps', '8000 MB/s', '仅 Type-C', '最高 240W (PD 3.1)', '需要认证线缆'],
      ['Thunderbolt 3', '40 Gbps', '5000 MB/s', '仅 Type-C', '最高 100W', '可外接显卡与双 4K 显示器'],
      ['Thunderbolt 4', '40 Gbps', '5000 MB/s', '仅 Type-C', '最高 100W', '强制要求 40Gbps 与双 4K 支持']
    ];
    var q = String(v.q || '').trim().toLowerCase();
    var rows = data.filter(function (r) { return !q || r.join(' ').toLowerCase().indexOf(q) >= 0; })
      .map(function (r) { return [r[0], v.unit === 'mbs' ? r[2] : r[1], r[3], r[4], r[5]]; });
    if (!rows.length) throw new Error('没有匹配的规格，试试 Type-C、40、PD 等关键词');
    return R(TB(['规格名称', '理论速率', '常见接口', '供电', '备注'], rows) +
      HINT('标称速率为理论上限，实际传输受硬盘、线缆与协议开销影响；Type-C 只是接口形状，不代表速度。'),
      rows.map(function (r) { return r[0] + ' ' + r[1]; }).join('\n'));
  }
});

T({ id: 'portlist', name: '常用端口速查', cat: 'query',
  desc: '服务端口号与协议速查，可按端口或名称筛选', tags: '端口 port 80 443 3306 服务 网络 协议',
  fields: [
    { k: 'q', label: '搜索（端口号或服务名，留空显示全部）', type: 'text', value: '' },
    { k: 'safe', label: '附带安全提示', type: 'switch', value: true }
  ],
  run: function (v) {
    var data = [
      [20, 'FTP 数据', 'TCP', '文件传输'], [21, 'FTP 控制', 'TCP', '明文传输，建议改用 SFTP'],
      [22, 'SSH / SFTP / SCP', 'TCP', '远程登录，务必禁用密码弱口令'],
      [23, 'Telnet', 'TCP', '明文，不建议公网开放'],
      [25, 'SMTP', 'TCP', '邮件发送'], [53, 'DNS', 'TCP/UDP', '域名解析'],
      [67, 'DHCP 服务端', 'UDP', ''], [68, 'DHCP 客户端', 'UDP', ''],
      [80, 'HTTP', 'TCP', '明文网页'], [110, 'POP3', 'TCP', '邮件收取'],
      [123, 'NTP', 'UDP', '时间同步'], [143, 'IMAP', 'TCP', '邮件收取'],
      [161, 'SNMP', 'UDP', '网络设备管理'], [443, 'HTTPS', 'TCP', '加密网页'],
      [445, 'SMB', 'TCP', '文件共享，勿对公网开放'],
      [465, 'SMTPS', 'TCP', ''], [587, 'SMTP 提交', 'TCP', ''],
      [993, 'IMAPS', 'TCP', ''], [995, 'POP3S', 'TCP', ''],
      [1433, 'SQL Server', 'TCP', ''], [1521, 'Oracle DB', 'TCP', ''],
      [2049, 'NFS', 'TCP/UDP', ''], [2181, 'ZooKeeper', 'TCP', ''],
      [3000, '开发服务器', 'TCP', 'Node / Grafana 常用'],
      [3306, 'MySQL', 'TCP', '数据库不应暴露公网'],
      [3389, '远程桌面 RDP', 'TCP', '公网开放风险高'],
      [5000, 'Flask / 开发服务', 'TCP', ''], [5432, 'PostgreSQL', 'TCP', ''],
      [6379, 'Redis', 'TCP', '未授权访问风险高，务必设密码'],
      [8080, 'HTTP 备用 / 代理', 'TCP', 'Tomcat 等常用'],
      [8443, 'HTTPS 备用', 'TCP', ''], [8888, 'Jupyter / 开发服务', 'TCP', ''],
      [9200, 'Elasticsearch', 'TCP', ''], [11211, 'Memcached', 'TCP/UDP', ''],
      [27017, 'MongoDB', 'TCP', '未授权访问风险高']
    ];
    var q = String(v.q || '').trim().toLowerCase();
    var rows = data.filter(function (r) { return !q || String(r[0]).indexOf(q) >= 0 || r[1].toLowerCase().indexOf(q) >= 0 || r[3].toLowerCase().indexOf(q) >= 0; });
    if (!rows.length) throw new Error('没有匹配的端口，试试 443、mysql、远程 等关键词');
    return R(TB(['端口', '服务', '协议', '备注'], rows.map(function (r) { return [String(r[0]), r[1], r[2], r[3] || '—']; })) +
      (v.safe ? HINT('安全提示：数据库、缓存、远程桌面、文件共享类端口尽量不要暴露到公网；确需开放时配合防火墙白名单、强密码与 TLS。') : ''),
      rows.map(function (r) { return r[0] + ' ' + r[1]; }).join('\n'));
  }
});

T({ id: 'printsize', name: '照片打印尺寸', cat: 'query',
  desc: '常见证件照 / 照片尺寸与所需像素对照', tags: '照片 证件照 一寸 二寸 像素 DPI 打印 尺寸',
  fields: [
    { k: 'dpi', label: '打印分辨率 DPI', type: 'text', value: '300' },
    { k: 'customw', label: '自定义宽度（毫米，可选）', type: 'text', value: '' },
    { k: 'customh', label: '自定义高度（毫米，可选）', type: 'text', value: '' }
  ],
  run: function (v) {
    var dpi = parseNum(v.dpi, 300); if (dpi <= 0) throw new Error('DPI 必须为正数');
    var data = [
      ['小一寸', 22, 32], ['一寸', 25, 35], ['大一寸', 33, 48], ['小二寸', 35, 45],
      ['二寸', 35, 49], ['大二寸', 35, 53], ['五寸 (3R)', 89, 127], ['六寸 (4R)', 102, 152],
      ['七寸 (5R)', 127, 178], ['八寸 (6R)', 152, 203], ['A4', 210, 297], ['A5', 148, 210]
    ];
    function px(mm) { return Math.round(mm / 25.4 * dpi); }
    var rows = data.map(function (r) {
      return [r[0], r[1] + ' × ' + r[2] + ' mm', px(r[1]) + ' × ' + px(r[2]) + ' px', num(r[1] / 25.4, 2) + ' × ' + num(r[2] / 25.4, 2) + ' in'];
    });
    var extra = '';
    if (v.customw !== '' && v.customh !== '') {
      var w = parseNum(v.customw, 0), h = parseNum(v.customh, 0);
      if (w > 0 && h > 0) {
        rows.push(['自定义', w + ' × ' + h + ' mm', px(w) + ' × ' + px(h) + ' px', num(w / 25.4, 2) + ' × ' + num(h / 25.4, 2) + ' in']);
        extra = KV([['自定义尺寸所需像素', px(w) + ' × ' + px(h) + ' px'], ['总像素', (px(w) * px(h) / 1e6).toFixed(2) + ' MP']]);
      }
    }
    return R(TB(['名称', '物理尺寸', '所需像素 @' + num(dpi, 0) + ' DPI', '英寸'], rows) + extra +
      HINT('像素 = 毫米 ÷ 25.4 × DPI；证件照实际排版常含白边与背景色要求，请以办事机构要求为准。'),
      rows.map(function (r) { return r[0] + ' ' + r[2]; }).join('\n'));
  }
});

T({ id: 'calorie', name: '热量与运动消耗', cat: 'query',
  desc: '按食物重量估算摄入热量，按体重与时长估算运动消耗', tags: '热量 卡路里 食物 运动 消耗 减脂 代谢 MET',
  fields: [
    { k: 'weight', label: '体重（kg）', type: 'text', value: '65' },
    { k: 'sport', label: '运动项目', type: 'select', value: 'run', options: [
      ['walk', '步行 5km/h'], ['run', '跑步 8km/h'], ['cycle', '骑车 16km/h'],
      ['swim', '游泳 中等强度'], ['rope', '跳绳'], ['yoga', '瑜伽'],
      ['strength', '力量训练'], ['climb', '爬楼梯'], ['housework', '家务'] ] },
    { k: 'minutes', label: '运动时长（分钟）', type: 'text', value: '30' },
    { k: 'food', label: '食物（每行「名称,克数」）', type: 'textarea', rows: 5,
      value: '米饭,150\n鸡胸肉,100\n鸡蛋,50\n苹果,200' }
  ],
  run: function (v) {
    var KCAL = { '米饭': 116, '面条': 110, '馒头': 223, '面包': 313, '鸡胸肉': 133, '牛肉': 250,
      '猪肉': 395, '鸡蛋': 144, '牛奶': 54, '豆浆': 31, '苹果': 53, '香蕉': 93,
      '土豆': 77, '番茄': 20, '黄瓜': 16, '可乐': 43, '薯条': 312, '炸鸡': 260,
      '坚果': 600, '米饭团': 160, '三文鱼': 208, '虾': 99, '豆腐': 84 };
    var MET = { walk: 3.5, run: 8.3, cycle: 6.8, swim: 7.0, rope: 11.0, yoga: 2.5,
      strength: 5.0, climb: 8.8, housework: 3.3 };
    var w = parseNum(v.weight, 65), mins = parseNum(v.minutes, 30), met = MET[v.sport] || 4;
    var burn = met * 3.5 * w / 200 * mins;
    var rows = [], total = 0, unknown = [];
    lines(v.food).filter(function (l) { return l.trim() !== ''; }).forEach(function (l) {
      var p = l.split(/[,，\t]/), name = (p[0] || '').trim(), g = parseNum(p[1], 0);
      var per = KCAL[name];
      if (per == null) { unknown.push(name); return; }
      var k = per * g / 100; total += k;
      rows.push([name, num(g) + ' g', num(per) + ' kcal/100g', num(k, 1) + ' kcal']);
    });
    var sportName = ({ walk: '步行', run: '跑步', cycle: '骑车', swim: '游泳', rope: '跳绳',
      yoga: '瑜伽', strength: '力量训练', climb: '爬楼梯', housework: '家务' })[v.sport];
    return R(TB(['食物', '份量', '参考热量', '小计'], rows) +
      KV([
        ['摄入合计', num(total, 1) + ' kcal'],
        ['运动项目', sportName + '（MET ' + num(met, 1) + '）'],
        ['运动时长', num(mins) + ' 分钟'],
        ['运动消耗', num(burn, 1) + ' kcal'],
        ['净摄入', num(total - burn, 1) + ' kcal'],
        ['约相当于脂肪', num(Math.max(0, burn) / 7.7, 1) + ' g']
      ]) + HINT('热量表为每 100g 常见参考值；运动消耗按 MET 公式估算，个体差异较大。' +
        (unknown.length ? ' 未收录食物：' + unknown.join('、') : '')) +
      PRE('收录食物：' + Object.keys(KCAL).join('、')),
      '摄入 ' + num(total, 1) + ' kcal，消耗 ' + num(burn, 1) + ' kcal');
  }
});

T({ id: 'papersize', name: '纸张尺寸对照', cat: 'query',
  desc: 'A / B 系列、信封与照片纸的毫米、英寸及像素对照', tags: '纸张 A4 B5 尺寸 毫米 英寸 DPI 打印',
  fields: [
    { k: 'series', label: '系列', type: 'select', value: 'all', options: [
      ['all', '全部'], ['a', 'A 系列'], ['b', 'B 系列'], ['other', '信封 / 卡片 / 照片'] ] },
    { k: 'dpi', label: '换算 DPI', type: 'text', value: '300' }
  ],
  run: function (v) {
    var dpi = parseNum(v.dpi, 300); if (dpi <= 0) throw new Error('DPI 必须为正数');
    var A = [['A0', 841, 1189], ['A1', 594, 841], ['A2', 420, 594], ['A3', 297, 420],
      ['A4', 210, 297], ['A5', 148, 210], ['A6', 105, 148], ['A7', 74, 105], ['A8', 52, 74]];
    var B = [['B0', 1000, 1414], ['B1', 707, 1000], ['B2', 500, 707], ['B3', 353, 500],
      ['B4', 250, 353], ['B5', 176, 250], ['B6', 125, 176], ['B7', 88, 125]];
    var O = [['C4 信封', 229, 324], ['C5 信封', 162, 229], ['DL 信封', 110, 220],
      ['名片', 90, 54], ['身份证', 85.6, 54], ['六寸照片', 102, 152], ['五寸照片', 89, 127]];
    var data = v.series === 'a' ? A : v.series === 'b' ? B : v.series === 'other' ? O : A.concat(B, O);
    function px(mm) { return Math.round(mm / 25.4 * dpi); }
    return R(TB(['名称', '毫米 (宽×高)', '英寸 (宽×高)', '像素 @' + num(dpi, 0) + ' DPI'], data.map(function (r) {
      return [r[0], r[1] + ' × ' + r[2], num(r[1] / 25.4, 2) + ' × ' + num(r[2] / 25.4, 2), px(r[1]) + ' × ' + px(r[2])];
    })) + HINT('ISO 216 的 A / B 系列长宽比均为 √2，对折后比例不变；像素按 1 英寸 = 25.4 mm 换算。'),
      data.map(function (r) { return r[0] + ' ' + r[1] + 'x' + r[2] + 'mm'; }).join('\n'));
  }
});

/* ============================================================
   六、媒体 / 前端（6）
   ============================================================ */

T({ id: 'cssshadow', name: 'CSS 阴影生成', cat: 'image',
  desc: '可视化调出 box-shadow，支持多层叠加与内阴影', tags: 'CSS 阴影 box-shadow 样式 生成 前端 预览',
  fields: [
    { k: 'hx', label: '水平偏移（px）', type: 'text', value: '0' },
    { k: 'vy', label: '垂直偏移（px）', type: 'text', value: '8' },
    { k: 'blur', label: '模糊半径（px）', type: 'text', value: '24' },
    { k: 'spread', label: '扩散半径（px）', type: 'text', value: '-4' },
    { k: 'color', label: '阴影颜色', type: 'color', value: '#6F5C0F' },
    { k: 'alpha', label: '透明度（0~1）', type: 'text', value: '0.25' },
    { k: 'inset', label: '内阴影 inset', type: 'switch', value: false },
    { k: 'layers', label: '阴影层数', type: 'select', value: '1', options: [
      ['1', '单层'], ['2', '双层（更立体）'], ['3', '三层（柔和）'] ] }
  ],
  run: function (v) {
    var rgb = H.hex2rgb(v.color), a = Math.max(0, Math.min(1, parseNum(v.alpha, .25)));
    function rgba(al) { return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + num(al, 3) + ')'; }
    var n = parseInt(v.layers, 10) || 1, parts = [];
    for (var i = 0; i < n; i++) {
      var f = 1 + i * 0.8, al = a / (1 + i * 1.1);
      parts.push((v.inset ? 'inset ' : '') + num(parseNum(v.hx, 0), 1) + 'px ' +
        num(parseNum(v.vy, 0) * f, 1) + 'px ' + num(parseNum(v.blur, 0) * f, 1) + 'px ' +
        num(parseNum(v.spread, 0) * (i ? .5 : 1), 1) + 'px ' + rgba(al));
    }
    var shadow = parts.join(', ');
    var css = 'box-shadow: ' + shadow + ';\n-webkit-box-shadow: ' + shadow + ';';
    var preview = '<div style="margin:18px 10px 8px;padding:26px 18px;border-radius:18px;background:var(--surface-container-low,#FAF2E7);' +
      'box-shadow:' + esc(shadow) + ';text-align:center;font-weight:700;color:var(--on-surface,#333)">阴影效果预览</div>';
    return R(PRE(css) + preview + KV([['层数', String(n)], ['颜色', esc(v.color)], ['合成透明度', num(a, 2)]]) +
      HINT('多层阴影用逗号分隔，先写的层在最上面；内阴影适合做凹陷输入框。'), css);
  }
});

T({ id: 'mdtable', name: 'Markdown 表格生成', cat: 'image',
  desc: '把 CSV / TSV 数据转成对齐的 Markdown 表格', tags: 'Markdown 表格 CSV 文档 生成 对齐',
  fields: [
    { k: 'data', label: '表格数据', type: 'textarea', rows: 6,
      value: '工具,分类,是否离线\n二维码,媒体,是\nJSON 格式化,开发者,是\n汇率换算,查询,否' },
    { k: 'sep', label: '分隔符', type: 'select', value: ',', options: [
      [',', '逗号 ,'], ['\t', '制表符 Tab'], [';', '分号 ;'], ['|', '竖线 |'] ] },
    { k: 'align', label: '列对齐', type: 'select', value: 'left', options: [
      ['left', '左对齐'], ['center', '居中'], ['right', '右对齐'] ] },
    { k: 'header', label: '第一行作为表头', type: 'switch', value: true }
  ],
  run: function (v) {
    var rows = lines(v.data).filter(function (l) { return l.trim() !== ''; })
      .map(function (l) { return l.split(String(v.sep || ',')).map(function (x) { return x.trim().replace(/\|/g, '\\|'); }); });
    if (!rows.length) throw new Error('请填写表格数据');
    var cols = Math.max.apply(null, rows.map(function (r) { return r.length; }));
    rows = rows.map(function (r) { while (r.length < cols) r.push(''); return r; });
    var widths = [];
    for (var c = 0; c < cols; c++) {
      var w = 3;
      rows.forEach(function (r) { w = Math.max(w, r[c].replace(/\\\|/g, '|').length); });
      widths.push(w);
    }
    function row(r) { return '| ' + r.map(function (x, i) {
      var s = x.replace(/\\\|/g, '|'); return s + new Array(Math.max(0, widths[i] - s.length) + 1).join(' ');
    }).join(' | ') + ' |'; }
    var mark = v.align === 'center' ? { l: ':', r: ':' } : v.align === 'right' ? { l: '', r: ':' } : { l: ':', r: '' };
    if (v.align === 'left') mark = { l: '', r: '' };
    var sep = '| ' + widths.map(function (w) {
      var bar = new Array(Math.max(3, w) - 1).join('-');
      return (v.align === 'center' ? ':' + bar + ':' : v.align === 'right' ? bar + ':' : v.align === 'left' ? ':' + bar : bar);
    }).join(' | ') + ' |';
    var out = [];
    if (v.header) { out.push(row(rows[0])); out.push(sep); rows.slice(1).forEach(function (r) { out.push(row(r)); }); }
    else { out.push(row(['Column ' + 1].concat(rows[0].slice(1)))); out.push(sep); rows.forEach(function (r) { out.push(row(r)); }); }
    var text = out.join('\n');
    return R(PRE(text) + KV([['列数', String(cols)], ['数据行数', String(v.header ? rows.length - 1 : rows.length)], ['对齐方式', String(v.align)]]) +
      HINT('单元格内的竖线会自动转义为 \\|，可直接粘贴到支持 GFM 的编辑器。'), text);
  }
});

T({ id: 'harmony', name: '配色方案生成', cat: 'image',
  desc: '基于一个主色生成互补、类似、三角等配色色板', tags: '配色 色板 互补色 HSL 设计 颜色 主题',
  fields: [
    { k: 'base', label: '主色', type: 'color', value: '#FAE185' },
    { k: 'scheme', label: '配色方案', type: 'select', value: 'analogous', options: [
      ['analogous', '类似色（相邻色相）'], ['complementary', '互补色（180°）'],
      ['split', '分裂互补（±150°）'], ['triadic', '三角色（120°）'],
      ['tetradic', '四方色（90°）'], ['monochrome', '单色（明度变化）'] ] },
    { k: 'count', label: '生成颜色数量', type: 'text', value: '5' }
  ],
  run: function (v) {
    var rgb = H.hex2rgb(v.base), hsl = H.rgb2hsl(rgb[0], rgb[1], rgb[2]);
    var n = Math.max(2, Math.min(12, Math.round(parseNum(v.count, 5))));
    var offsets = { complementary: [0, 180], split: [0, 150, 210], triadic: [0, 120, 240],
      tetradic: [0, 90, 180, 270] };
    var list = [], i;
    if (v.scheme === 'monochrome') {
      for (i = 0; i < n; i++) {
        var l = 15 + (75 * i / (n - 1));
        var rr = H.hsl2rgb(hsl[0], hsl[1], l); list.push(H.rgb2hex(rr[0], rr[1], rr[2]));
      }
    } else if (v.scheme === 'analogous') {
      for (i = 0; i < n; i++) {
        var h = hsl[0] - 30 + (60 * i / (n - 1));
        var r2 = H.hsl2rgb((h + 360) % 360, hsl[1], hsl[2]); list.push(H.rgb2hex(r2[0], r2[1], r2[2]));
      }
    } else {
      var offs = offsets[v.scheme] || [0, 180];
      for (i = 0; i < n; i++) {
        var hue = (hsl[0] + offs[i % offs.length] + Math.floor(i / offs.length) * 12) % 360;
        var li = Math.max(12, Math.min(92, hsl[2] + (i % 2 ? 8 : -8)));
        var r3 = H.hsl2rgb(hue, hsl[1], li); list.push(H.rgb2hex(r3[0], r3[1], r3[2]));
      }
    }
    var swatches = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0">' + list.map(function (c) {
      var dark = H.luminance(c) < .45;
      return '<div style="flex:1 1 88px;min-width:88px;background:' + c + ';border-radius:12px;padding:16px 8px;text-align:center;' +
        'color:' + (dark ? '#fff' : '#2b2410') + ';font:600 12px ui-monospace,monospace">' + esc(c) + '</div>';
    }).join('') + '</div>';
    return R(swatches + TB(['序号', 'HEX', 'RGB', 'HSL'], list.map(function (c, j) {
      var r = H.hex2rgb(c), h = H.rgb2hsl(r[0], r[1], r[2]);
      return [String(j + 1), c, r.join(', '), h[0] + '°, ' + h[1] + '%, ' + h[2] + '%'];
    })) + HINT('主色 HSL：' + hsl[0] + '°, ' + hsl[1] + '%, ' + hsl[2] + '%。深色文字配浅底色时对比度更佳。'),
      list.join('\n'));
  }
});

T({ id: 'cssunit', name: 'px / rem 换算', cat: 'image',
  desc: 'px、rem、em、vw、vh 与百分比互相换算', tags: 'CSS px rem em vw 换算 前端 响应式 字号',
  fields: [
    { k: 'px', label: '像素值 px', type: 'text', value: '16' },
    { k: 'root', label: '根字号（px）', type: 'text', value: '16' },
    { k: 'parent', label: '父元素字号（px）', type: 'text', value: '16' },
    { k: 'viewport', label: '视口宽度（px）', type: 'text', value: '375' },
    { k: 'height', label: '视口高度（px）', type: 'text', value: '812' }
  ],
  run: function (v) {
    var px = parseNum(v.px, 16), root = parseNum(v.root, 16), parent = parseNum(v.parent, 16);
    var vw = parseNum(v.viewport, 375), vh = parseNum(v.height, 812);
    if (root <= 0 || parent <= 0 || vw <= 0 || vh <= 0) throw new Error('字号与视口尺寸必须为正数');
    return R(TB(['单位', '数值', '说明'], [
      ['px', num(px), '绝对像素'],
      ['rem', num(px / root), '相对根字号（' + num(root) + 'px）'],
      ['em', num(px / parent), '相对父元素字号（' + num(parent) + 'px）'],
      ['vw', num(px / vw * 100), '占视口宽度（' + num(vw) + 'px）的百分比'],
      ['vh', num(px / vh * 100), '占视口高度（' + num(vh) + 'px）的百分比'],
      ['%', num(px / parent * 100), '相对父元素字号']
    ]) + SEC('常用字号速查（根字号 16px）') + TB(['px', 'rem'], [12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(function (p) {
      return [p + 'px', num(p / 16, 4) + 'rem'];
    })) + HINT('rem 只受 html 根字号影响；em 会随父级层层叠加，嵌套时容易失控。'),
    num(px) + 'px = ' + num(px / root) + 'rem');
  }
});

T({ id: 'bezier', name: '缓动曲线生成', cat: 'image',
  desc: '生成 cubic-bezier 参数与 CSS transition / animation 代码', tags: 'CSS 动画 缓动 cubic-bezier transition easing 曲线',
  fields: [
    { k: 'preset', label: '预设曲线', type: 'select', value: 'easeOut', options: [
      ['easeOut', 'ease-out 标准减速'], ['easeInOut', 'ease-in-out 平滑'], ['easeIn', 'ease-in 加速'],
      ['linear', 'linear 匀速'], ['snappy', '轻快回弹感'], ['gentle', '柔和缓慢'], ['custom', '自定义四个参数'] ] },
    { k: 'x1', label: 'P1 x', type: 'text', value: '0.16' },
    { k: 'y1', label: 'P1 y', type: 'text', value: '1' },
    { k: 'x2', label: 'P2 x', type: 'text', value: '0.3' },
    { k: 'y2', label: 'P2 y', type: 'text', value: '1' },
    { k: 'duration', label: '动画时长（毫秒）', type: 'text', value: '300' }
  ],
  run: function (v) {
    var P = { easeOut: [.16, 1, .3, 1], easeInOut: [.65, 0, .35, 1], easeIn: [.7, 0, .84, 0],
      linear: [0, 0, 1, 1], snappy: [.34, 1.56, .64, 1], gentle: [.25, .1, .25, 1] };
    var p = v.preset === 'custom' ? [parseNum(v.x1, 0), parseNum(v.y1, 0), parseNum(v.x2, 1), parseNum(v.y2, 1)] : (P[v.preset] || P.easeOut);
    if (p[0] < 0 || p[0] > 1 || p[2] < 0 || p[2] > 1) throw new Error('控制点的 x 必须在 0 ~ 1 之间');
    var bez = 'cubic-bezier(' + p.map(function (x) { return num(x, 3); }).join(', ') + ')';
    var ms = Math.max(1, Math.round(parseNum(v.duration, 300)));
    var css = 'transition: all ' + ms + 'ms ' + bez + ';\n' +
      '/* 或 */\nanimation: slide ' + ms + 'ms ' + bez + ' both;';
    var demo = '<div style="margin:14px 0;padding:12px;border-radius:12px;background:var(--surface-container-low,#FAF2E7);overflow:hidden">' +
      '<div style="width:38px;height:38px;border-radius:10px;background:#FAE185;' +
      'transition:transform ' + ms + 'ms ' + esc(bez) + ';transform:translateX(0)" id="bz-demo"></div></div>' +
      '<div class="hint">把鼠标移到下面的按钮上试试（网页版支持）</div>' +
      '<div class="btn-row"><button class="btn tonal" data-act="noop" ' +
      'onmouseover="var d=document.getElementById(\'bz-demo\');if(d)d.style.transform=\'translateX(160px)\'" ' +
      'onmouseout="var d=document.getElementById(\'bz-demo\');if(d)d.style.transform=\'translateX(0)\'">悬停预览</button></div>';
    return R(PRE(css) + demo + SEC('常用预设') + TB(['名称', '参数'], [
      ['ease（默认）', 'cubic-bezier(0.25, 0.1, 0.25, 1)'],
      ['ease-in', 'cubic-bezier(0.42, 0, 1, 1)'],
      ['ease-out', 'cubic-bezier(0, 0, 0.58, 1)'],
      ['ease-in-out', 'cubic-bezier(0.42, 0, 0.58, 1)'],
      ['Material 标准', 'cubic-bezier(0.4, 0, 0.2, 1)']
    ]) + HINT('y 可超出 0~1 产生回弹/过冲效果，x 必须在 0~1 内。'), css);
  }
});

T({ id: 'lorem', name: '占位文本生成', cat: 'image',
  desc: '生成中文或英文假文，用于排版与设计稿填充', tags: '假文 Lorem ipsum 占位 排版 设计 文案 生成',
  fields: [
    { k: 'lang', label: '语言', type: 'select', value: 'zh', options: [
      ['zh', '中文假文'], ['en', 'Lorem ipsum'] ] },
    { k: 'mode', label: '生成单位', type: 'select', value: 'paragraph', options: [
      ['paragraph', '段落'], ['sentence', '句子'], ['word', '词组'], ['title', '标题'] ] },
    { k: 'count', label: '数量', type: 'text', value: '3' },
    { k: 'len', label: '每段大致字数', type: 'text', value: '80' }
  ],
  run: function (v) {
    var zhWords = ['工具', '设计', '效率', '体验', '界面', '数据', '本地', '离线', '清爽', '便捷',
      '顺手', '轻量', '实用', '简洁', '流畅', '可靠', '日常', '创作', '记录', '整理',
      '灵感', '细节', '节奏', '色彩', '排版', '模块', '功能', '场景', '自由', '安心'];
    var zhTail = ['。', '，', '；', '。'];
    var enWords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'labore', 'magna', 'aliqua', 'enim',
      'minim', 'veniam', 'quis', 'nostrud', 'ullamco', 'nisi', 'aliquip', 'commodo', 'duis',
      'aute', 'irure', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat'];
    function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
    var n = Math.max(1, Math.min(100, Math.round(parseNum(v.count, 3))));
    var L = Math.max(10, Math.min(2000, Math.round(parseNum(v.len, 80))));
    var out = [], i, j;
    for (i = 0; i < n; i++) {
      if (v.mode === 'word') { out.push(pick(v.lang === 'zh' ? zhWords : enWords)); continue; }
      if (v.mode === 'title') {
        var t = '', tl = v.lang === 'zh' ? 6 : 4;
        for (j = 0; j < tl; j++) t += pick(v.lang === 'zh' ? zhWords : enWords) + (v.lang === 'zh' ? '' : ' ');
        out.push(t.trim()); continue;
      }
      var s = '', guard = 0;
      while (s.length < L && guard++ < 500) {
        if (v.lang === 'zh') s += pick(zhWords) + pick(zhTail);
        else s += pick(enWords) + ' ';
        if (v.mode === 'sentence' && s.length > 18) break;
      }
      if (v.lang === 'zh') { s = s.replace(/[，；]$/, '。'); if (!/。$/.test(s)) s += '。'; }
      else { s = s.trim(); s = s.charAt(0).toUpperCase() + s.slice(1) + '.'; }
      out.push(s);
    }
    var text = out.join(v.mode === 'word' || v.mode === 'title' ? '\n' : '\n\n');
    return R(PRE(text) + KV([['语言', v.lang === 'zh' ? '中文' : 'English'], ['单位', String(v.mode)],
      ['生成数量', String(n)], ['总字符数', String(text.length)]]) +
      HINT('每次运行结果随机生成，仅用于排版占位，不含真实语义。'), text);
  }
});

/* ============================================================
   七、设备测评（4）
   ============================================================ */

T({ id: 'batteryhealth', name: '电池健康度', cat: 'fun',
  desc: '按标称容量与当前容量估算电池损耗与剩余循环', tags: '电池 健康度 容量 循环 损耗 续航 手机',
  fields: [
    { k: 'design', label: '标称容量（mAh）', type: 'text', value: '4500' },
    { k: 'now', label: '当前实际容量（mAh）', type: 'text', value: '3780' },
    { k: 'cycles', label: '已充电循环次数', type: 'text', value: '520' },
    { k: 'screen', label: '标称亮屏续航（小时）', type: 'text', value: '8' }
  ],
  run: function (v) {
    var d = parseNum(v.design, 0), n = parseNum(v.now, 0), c = parseNum(v.cycles, 0), sc = parseNum(v.screen, 0);
    if (d <= 0 || n < 0) throw new Error('标称容量需为正数，当前容量不能为负');
    var pct = n / d * 100, loss = 100 - pct;
    var perCycle = c > 0 ? loss / c : 0;
    var to80 = perCycle > 0 ? Math.max(0, (20 - loss) / perCycle) : 0;
    return R(KV([
      ['标称容量', num(d) + ' mAh'], ['当前容量', num(n) + ' mAh'],
      ['电池健康度', num(pct) + '%'], ['容量损耗', num(loss) + '%'],
      ['已循环次数', num(c) + ' 次'],
      ['平均每次循环损耗', num(perCycle, 4) + '%'],
      ['按此速度到 80% 还需', to80 ? num(to80, 0) + ' 次循环' : loss >= 20 ? '已低于 80%' : '数据不足'],
      ['估算亮屏续航', num(sc * pct / 100) + ' 小时（标称 ' + num(sc) + ' 小时）'],
      ['状态建议', pct >= 90 ? '状态良好' : pct >= 80 ? '正常损耗，可继续使用' : '损耗明显，建议考虑更换电池']
    ]) + HINT('健康度为容量比值估算；实际以系统读数与专业检测为准。浅充浅放、避免高温可延缓损耗。'),
      '健康度 ' + num(pct) + '%');
  }
});

T({ id: 'contrast', name: '色彩对比度检测', cat: 'fun',
  desc: '计算前景/背景对比度并判定 WCAG AA / AAA 等级', tags: '对比度 WCAG 无障碍 颜色 可访问性 可读性',
  fields: [
    { k: 'fg', label: '文字颜色', type: 'color', value: '#6F5C0F' },
    { k: 'bg', label: '背景颜色', type: 'color', value: '#FFF8EE' },
    { k: 'size', label: '文字尺寸', type: 'select', value: 'normal', options: [
      ['normal', '普通正文（< 18pt）'], ['large', '大号文字（≥ 18pt 或 14pt 粗体）'] ] }
  ],
  run: function (v) {
    var L1 = H.luminance(v.fg), L2 = H.luminance(v.bg);
    var hi = Math.max(L1, L2), lo = Math.min(L1, L2), ratio = (hi + .05) / (lo + .05);
    var aa = v.size === 'large' ? 3 : 4.5, aaa = v.size === 'large' ? 4.5 : 7;
    var level = ratio >= aaa ? 'AAA 通过' : ratio >= aa ? 'AA 通过' : '未达标';
    var preview = '<div style="margin:14px 0;padding:22px 18px;border-radius:14px;background:' + esc(v.bg) +
      ';color:' + esc(v.fg) + ';font-size:' + (v.size === 'large' ? '22px;font-weight:700' : '15px') +
      '">这是文字在背景上的实际效果预览 Aa 中文 123</div>';
    return R(KV([
      ['前景色', esc(v.fg)], ['背景色', esc(v.bg)],
      ['对比度', num(ratio) + ' : 1'],
      ['AA 门槛', aa + ' : 1'], ['AAA 门槛', aaa + ' : 1'],
      ['判定结果', level]
    ]) + preview + HINT('WCAG 2.1：普通正文 AA ≥ 4.5、AAA ≥ 7；大号文字 AA ≥ 3、AAA ≥ 4.5。' +
      (ratio < aa ? ' 当前组合可读性不足，建议加深文字或提亮背景。' : '')) +
      TB(['相对亮度', '数值'], [['前景', num(L1, 5)], ['背景', num(L2, 5)]]), num(ratio) + ':1 ' + level);
  }
});

T({ id: 'raidcalc', name: 'RAID 容量计算', cat: 'fun',
  desc: '按磁盘数量与容量算可用空间、容错与热备占用', tags: 'RAID 磁盘 阵列 容量 容错 NAS 存储',
  fields: [
    { k: 'disks', label: '磁盘数量（含热备）', type: 'text', value: '4' },
    { k: 'size', label: '单盘容量', type: 'text', value: '4' },
    { k: 'unit', label: '容量单位', type: 'select', value: 'TB', options: [
      ['TB', 'TB'], ['GB', 'GB'] ] },
    { k: 'level', label: 'RAID 级别', type: 'select', value: '5', options: [
      ['0', 'RAID 0 条带'], ['1', 'RAID 1 镜像'], ['5', 'RAID 5 单校验'],
      ['6', 'RAID 6 双校验'], ['10', 'RAID 10 镜像+条带'], ['jbod', 'JBOD 简单合并'] ] },
    { k: 'spare', label: '热备盘数量', type: 'text', value: '0' }
  ],
  run: function (v) {
    var n = Math.round(parseNum(v.disks, 4)), sz = parseNum(v.size, 4), spare = Math.round(parseNum(v.spare, 0));
    if (n <= 0 || sz <= 0 || spare < 0 || spare >= n) throw new Error('磁盘数量需大于 0，热备盘数需小于磁盘总数');
    var usable = n - spare, cap = 0, fault = 0, desc = '';
    if (v.level === '0') { cap = usable * sz; desc = '无冗余，任一盘损坏即全部数据丢失'; }
    else if (v.level === '1') { cap = sz; fault = usable - 1; desc = '所有盘互为镜像，容量等于单盘'; }
    else if (v.level === '5') {
      if (usable < 3) throw new Error('RAID 5 至少需要 3 块可用盘');
      cap = (usable - 1) * sz; fault = 1; desc = '分布式单校验，允许坏 1 块盘';
    } else if (v.level === '6') {
      if (usable < 4) throw new Error('RAID 6 至少需要 4 块可用盘');
      cap = (usable - 2) * sz; fault = 2; desc = '双校验，允许同时坏 2 块盘';
    } else if (v.level === '10') {
      if (usable < 4 || usable % 2) throw new Error('RAID 10 需要偶数且至少 4 块可用盘');
      cap = usable / 2 * sz; fault = 1; desc = '每组镜像允许坏 1 块，重建快但容量减半';
    } else { cap = usable * sz; desc = '仅合并容量，无冗余'; }
    var raw = n * sz;
    return R(KV([
      ['磁盘总数', n + ' 块 × ' + num(sz) + ' ' + v.unit],
      ['热备盘', spare + ' 块'],
      ['可用容量', num(cap) + ' ' + v.unit],
      ['原始容量', num(raw) + ' ' + v.unit],
      ['容量利用率', num(cap / raw * 100) + '%'],
      ['可容忍故障盘', fault + ' 块'],
      ['特点', esc(desc)]
    ]) + SEC('各级别对比（相同磁盘配置）') + TB(['级别', '可用容量', '容错盘数'], [
      ['RAID 0', num(usable * sz) + ' ' + v.unit, '0'],
      ['RAID 1', num(sz) + ' ' + v.unit, String(usable - 1)],
      ['RAID 5', usable >= 3 ? num((usable - 1) * sz) + ' ' + v.unit : '不适用', '1'],
      ['RAID 6', usable >= 4 ? num((usable - 2) * sz) + ' ' + v.unit : '不适用', '2'],
      ['RAID 10', usable >= 4 && usable % 2 === 0 ? num(usable / 2 * sz) + ' ' + v.unit : '不适用', '1']
    ]) + HINT('厂商标称 1 TB 按 1000 进制、系统多按 1024 进制显示，实际可用空间会略小；RAID 不能替代备份。'),
      '可用 ' + num(cap) + ' ' + v.unit);
  }
});

T({ id: 'videobitrate', name: '视频码率与体积', cat: 'fun',
  desc: '按时长、体积与码率互相换算，附分辨率推荐码率', tags: '视频 码率 体积 比特率 分辨率 压缩 导出',
  fields: [
    { k: 'mode', label: '换算方向', type: 'select', value: 'size2rate', options: [
      ['size2rate', '由目标体积推算码率'], ['rate2size', '由码率推算文件体积'] ] },
    { k: 'minutes', label: '视频时长（分钟）', type: 'text', value: '90' },
    { k: 'size', label: '目标体积（GB，size2rate 用）', type: 'text', value: '2' },
    { k: 'rate', label: '视频码率（Mbps，rate2size 用）', type: 'text', value: '8' },
    { k: 'audio', label: '音频码率（kbps）', type: 'text', value: '128' }
  ],
  run: function (v) {
    var mins = parseNum(v.minutes, 90), audio = parseNum(v.audio, 128);
    if (mins <= 0) throw new Error('时长必须为正数');
    var secs = mins * 60, sizeGB, rateMbps;
    if (v.mode === 'size2rate') {
      sizeGB = parseNum(v.size, 2); if (sizeGB <= 0) throw new Error('目标体积必须为正数');
      rateMbps = sizeGB * 8 * 1000 / secs - audio / 1000;
      if (rateMbps <= 0) throw new Error('目标体积太小，扣除音频后已无视频码率空间');
    } else {
      rateMbps = parseNum(v.rate, 8); if (rateMbps <= 0) throw new Error('码率必须为正数');
      sizeGB = (rateMbps * 1000 + audio) * secs / 8 / 1000 / 1000;
    }
    return R(KV([
      ['视频时长', num(mins) + ' 分钟（' + num(secs, 0) + ' 秒）'],
      ['视频码率', num(rateMbps) + ' Mbps'],
      ['音频码率', num(audio) + ' kbps'],
      ['总码率', num(rateMbps * 1000 + audio) + ' kbps'],
      ['预计体积', num(sizeGB) + ' GB（约 ' + num(sizeGB * 1024) + ' MB）'],
      ['每分钟体积', num(sizeGB * 1024 / mins) + ' MB']
    ]) + SEC('常见分辨率参考码率（H.264 / 30fps）') + TB(['分辨率', '推荐码率', '90 分钟约'], [
      ['480p', '1 ~ 2 Mbps', '0.7 ~ 1.4 GB'],
      ['720p', '2.5 ~ 5 Mbps', '1.7 ~ 3.4 GB'],
      ['1080p', '5 ~ 10 Mbps', '3.4 ~ 6.8 GB'],
      ['2K', '10 ~ 20 Mbps', '6.8 ~ 13.5 GB'],
      ['4K', '25 ~ 50 Mbps', '17 ~ 34 GB']
    ]) + HINT('按 1 GB = 1000 MB、8 bit = 1 Byte 估算；H.265 / AV1 在同等画质下可再省约 30%~50% 体积。'),
      num(sizeGB) + ' GB @ ' + num(rateMbps) + ' Mbps');
  }
});

/* ============================================================
   八、互动工具（3）
   ============================================================ */

T({ id: 'typingtest', name: '打字速度测试', cat: 'game',
  desc: '按用时与输入内容计算 WPM、准确率与错字分布', tags: '打字 速度 WPM 准确率 键盘 练习 测试',
  fields: [
    { k: 'original', label: '原文', type: 'textarea', rows: 4,
      value: '一个简单的工具，往往能省下每天几分钟。AnKong Toolbox keeps everything local.' },
    { k: 'typed', label: '你输入的内容', type: 'textarea', rows: 4,
      value: '一个简单的工具，往往能省下每天几分钟。AnKong Toolbax keeps everything local.' },
    { k: 'seconds', label: '用时（秒）', type: 'text', value: '45' }
  ],
  run: function (v) {
    var o = String(v.original || ''), t = String(v.typed || ''), sec = parseNum(v.seconds, 60);
    if (!o) throw new Error('请填写原文');
    if (sec <= 0) throw new Error('用时必须为正数');
    var n = Math.max(o.length, t.length), correct = 0, wrong = [], i;
    for (i = 0; i < n; i++) {
      if (o.charAt(i) === t.charAt(i) && o.charAt(i) !== '') correct++;
      else if (wrong.length < 12) wrong.push([String(i + 1), o.charAt(i) || '（无）', t.charAt(i) || '（无）']);
    }
    var acc = n ? correct / n * 100 : 0;
    var cpm = correct / sec * 60, wpm = cpm / 5;
    return R(KV([
      ['用时', num(sec) + ' 秒'],
      ['原文字符数', String(o.length)], ['输入字符数', String(t.length)],
      ['正确字符', String(correct)], ['错误 / 缺失字符', String(n - correct)],
      ['准确率', num(acc) + '%'],
      ['速度 CPM', num(cpm, 1) + ' 字符/分钟'],
      ['速度 WPM', num(wpm, 1) + ' 词/分钟'],
      ['评级', wpm >= 60 ? '很熟练' : wpm >= 40 ? '熟练' : wpm >= 25 ? '正常' : '继续练习']
    ]) + (wrong.length ? SEC('前几处差异') + TB(['位置', '原文', '输入'], wrong) : '') +
      HINT('WPM 按「5 个正确字符 = 1 词」折算，中文按字符计；准确率同时计入多打与漏打。'),
      'WPM ' + num(wpm, 1) + '，准确率 ' + num(acc) + '%');
  }
});

T({ id: 'math24', name: '24 点求解', cat: 'game',
  desc: '给定四个数字，穷举加减乘除与括号找出全部解法', tags: '24点 数学 游戏 算数 穷举 括号 益智',
  fields: [
    { k: 'nums', label: '四个数字（空格或逗号分隔）', type: 'text', value: '3 3 8 8' },
    { k: 'target', label: '目标值', type: 'text', value: '24' },
    { k: 'limit', label: '最多显示解法数', type: 'text', value: '8' }
  ],
  run: function (v) {
    var arr = String(v.nums || '').split(/[\s,，]+/).filter(Boolean).map(Number);
    if (arr.length !== 4 || arr.some(function (x) { return !isFinite(x); })) throw new Error('请填写恰好 4 个有效数字');
    var target = parseNum(v.target, 24), limit = Math.max(1, Math.min(50, Math.round(parseNum(v.limit, 8))));
    var found = {}, results = [], ops = ['+', '-', '*', '/'], EPS = 1e-6;
    function calc(a, b, op) { return op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : a / b; }
    function solve(vals, exprs) {
      if (results.length >= limit) return;
      if (vals.length === 1) {
        if (Math.abs(vals[0] - target) < EPS && !found[exprs[0]]) { found[exprs[0]] = 1; results.push(exprs[0]); }
        return;
      }
      for (var i = 0; i < vals.length; i++) for (var j = 0; j < vals.length; j++) {
        if (i === j) continue;
        var rest = [], rex = [];
        for (var k = 0; k < vals.length; k++) if (k !== i && k !== j) { rest.push(vals[k]); rex.push(exprs[k]); }
        for (var q = 0; q < ops.length; q++) {
          var op = ops[q];
          if (op === '/' && Math.abs(vals[j]) < EPS) continue;
          if ((op === '+' || op === '*') && i > j) continue;
          solve(rest.concat([calc(vals[i], vals[j], op)]),
            rex.concat(['(' + exprs[i] + ' ' + op + ' ' + exprs[j] + ')']));
        }
        if (results.length >= limit) return;
      }
    }
    solve(arr.slice(), arr.map(String));
    if (!results.length) {
      return R(KV([['输入', arr.join('、')], ['目标', num(target)], ['结果', '未找到解法']]) +
        HINT('已穷举全部数字顺序、运算符与括号组合；可换一组数字再试。'), '无解');
    }
    return R(KV([['输入', arr.join('、')], ['目标', num(target)], ['找到解法', results.length + ' 个（最多显示 ' + limit + ' 个）']]) +
      TB(['#', '表达式'], results.map(function (e, i) { return [String(i + 1), e + ' = ' + num(target)]; })) +
      HINT('使用 + − × ÷ 与括号，每个数字恰好用一次；结果按发现顺序展示。'), results.join('\n'));
  }
});

T({ id: 'diceexpr', name: '骰子掷点', cat: 'game',
  desc: '解析 2d6+3 这类骰子表达式，批量掷点并给出期望', tags: '骰子 d20 TRPG 桌游 随机 概率 掷点',
  fields: [
    { k: 'expr', label: '骰子表达式（如 2d6+3、1d20-1）', type: 'text', value: '2d6+3' },
    { k: 'times', label: '掷点次数', type: 'text', value: '10' },
    { k: 'detail', label: '显示每次各骰点数', type: 'switch', value: true }
  ],
  run: function (v) {
    var m = String(v.expr || '').trim().toLowerCase().replace(/\s/g, '').match(/^(\d*)d(\d+)([+-]\d+)?$/);
    if (!m) throw new Error('表达式格式应为 NdM±K，例如 2d6+3 或 1d20');
    var count = Math.max(1, Math.min(100, parseInt(m[1] || '1', 10)));
    var sides = parseInt(m[2], 10), mod = parseInt(m[3] || '0', 10);
    if (sides < 2 || sides > 1000) throw new Error('骰子面数需在 2 ~ 1000 之间');
    var times = Math.max(1, Math.min(200, Math.round(parseNum(v.times, 10))));
    var rolls = [], i, j, sum = 0, minV = Infinity, maxV = -Infinity;
    for (i = 0; i < times; i++) {
      var dice = [], base = 0;
      for (j = 0; j < count; j++) { var d = 1 + Math.floor(Math.random() * sides); dice.push(d); base += d; }
      var total = base + mod; rolls.push({ dice: dice, total: total });
      sum += total; if (total < minV) minV = total; if (total > maxV) maxV = total;
    }
    var exp = count * (sides + 1) / 2 + mod;
    var rows = v.detail ? rolls.map(function (r, k) { return [String(k + 1), r.dice.join(' + '), String(r.total)]; })
      : rolls.map(function (r, k) { return [String(k + 1), '—', String(r.total)]; });
    return R(KV([
      ['表达式', count + 'd' + sides + (mod >= 0 ? '+' : '') + mod],
      ['理论期望', num(exp)],
      ['取值范围', (count + mod) + ' ~ ' + (count * sides + mod)],
      ['实际平均', num(sum / times)],
      ['最小 / 最大', minV + ' / ' + maxV]
    ]) + TB(['#', '各骰点数', '合计'], rows) +
      HINT('每次掷点独立均匀随机；结果仅为模拟，次数越多平均值越接近理论期望。'),
      rolls.map(function (r) { return String(r.total); }).join(', '));
  }
});

})();



