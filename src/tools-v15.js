/* ============================================================
   安空工具箱 — v1.5 工具包
   50 个纯离线工具：文本 / 开发 / 计算 / 生活 / 查询 / 媒体 / 设备 / 互动
   不联网、不依赖第三方接口，沿用 ES5 兼容写法
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
function round(n, d) { var p = Math.pow(10, d == null ? 2 : d); return Math.round(n * p) / p; }
function fmtMoney(n) { return (Math.round(n * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function width(s) { var w = 0; for (var i = 0; i < s.length; i++) w += s.charCodeAt(i) > 255 ? 2 : 1; return w; }
function cutWidth(s, max) { var out = '', w = 0; for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i) > 255 ? 2 : 1; if (w + c > max) break; out += s.charAt(i); w += c; } return out; }

/* ============================================================
   一、文本效率（8）
   ============================================================ */

T({ id: 'wraptext', name: '按宽度折行', cat: 'text',
  desc: '按显示宽度折行，中文按两格计算，可保留缩进', tags: '折行 换行 排版 宽度 中文 wrap',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6, value: '安空工具箱把常用的小工具装进一个 App，AnKong Toolbox 全部离线运行，输入内容不会离开你的设备。' },
    { k: 'width', label: '每行宽度（半角字符数）', type: 'text', value: '28' },
    { k: 'indent', label: '续行缩进', type: 'text', value: '' }
  ],
  run: function (v) {
    var w = Math.max(4, Math.min(200, parseInt(v.width, 10) || 28));
    var out = [], total = 0;
    lines(v.text).forEach(function (ln) {
      var rest = ln;
      if (!rest) { out.push(''); return; }
      while (rest.length) {
        var part = cutWidth(rest, w) || rest.charAt(0);
        out.push((out.length && v.indent ? v.indent : '') + part);
        total++;
        rest = rest.slice(part.length);
        if (!rest) break;
        w = Math.max(4, w - width(v.indent));
      }
    });
    return R(KV([['每行宽度', w + ' 半角字符'], ['折后行数', total + ' 行']]) + SEC('折行结果') + PRE(out.join('\n')),
      out.join('\n'));
  }
});

T({ id: 'parareflow', name: '段落重排', cat: 'text',
  desc: '合并软换行、按空行分段、清理多余空白与行尾空格', tags: '段落 重排 换行 空白 排版 reflow',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 7, value: '这是第一段的第一行，\n这是第一段的第二行，   行尾有多余空格。   \n\n\n这是第二段，\n前面有多个空行。' },
    { k: 'keepBlank', label: '保留段落间空行', type: 'select', value: 'one', options: [
      ['one', '保留一个空行'], ['none', '不保留空行'], ['all', '原样保留'] ] },
    { k: 'trim', label: '清理行尾空格', type: 'select', value: 'yes', options: [['yes', '清理'], ['no', '保留']] }
  ],
  run: function (v) {
    var ls = lines(v.text);
    if (v.trim === 'yes') ls = ls.map(function (l) { return l.replace(/\s+$/, ''); });
    var paras = [], buf = [];
    ls.forEach(function (l) {
      if (!l.trim()) { if (buf.length) { paras.push(buf.join('')); buf = []; } }
      else buf.push(l.trim());
    });
    if (buf.length) paras.push(buf.join(''));
    var sep = v.keepBlank === 'none' ? '\n' : (v.keepBlank === 'all' ? '\n\n\n' : '\n\n');
    var out = paras.join(sep);
    return R(KV([['段落数', paras.length], ['原行数', lines(v.text).length], ['字符数', out.replace(/\s/g, '').length]]) +
      SEC('重排结果') + PRE(out), out);
  }
});

T({ id: 'aligncols', name: '文本对齐成表格', cat: 'text',
  desc: '按分隔符切分每行并对齐列宽，可输出 Markdown 表格', tags: '对齐 列 表格 分隔符 align column',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6, value: '姓名,年龄,城市\n张三,28,北京\n李四,35,上海\n王五,22,广州' },
    { k: 'sep', label: '分隔符', type: 'text', value: ',' },
    { k: 'mode', label: '输出格式', type: 'select', value: 'plain', options: [
      ['plain', '等宽对齐文本'], ['md', 'Markdown 表格'], ['csv', '规范化 CSV'] ] },
    { k: 'header', label: '首行作为表头', type: 'select', value: 'yes', options: [['yes', '是'], ['no', '否']] }
  ],
  run: function (v) {
    var sep = v.sep || ',';
    var rows = lines(v.text).filter(function (l) { return l.trim(); }).map(function (l) {
      return l.split(sep).map(function (c) { return c.trim(); });
    });
    if (!rows.length) return R(HINT('请输入至少一行数据'));
    var cols = 0;
    rows.forEach(function (r) { cols = Math.max(cols, r.length); });
    var w = [];
    for (var c = 0; c < cols; c++) {
      var m = 0;
      rows.forEach(function (r) { m = Math.max(m, width(r[c] || '')); });
      w.push(m);
    }
    function padCell(s, i) { return s + new Array(Math.max(1, w[i] - width(s) + 1)).join(' '); }
    var out;
    if (v.mode === 'md') {
      var head = rows[0].map(function (x, i) { return x || ('列' + (i + 1)); });
      var body = (v.header === 'yes' ? rows.slice(1) : rows).map(function (r) {
        return '| ' + w.map(function (_, i) { return r[i] || ''; }).join(' | ') + ' |';
      });
      out = '| ' + head.join(' | ') + ' |\n| ' + w.map(function () { return '---'; }).join(' | ') + ' |\n' + body.join('\n');
    } else if (v.mode === 'csv') {
      out = rows.map(function (r) { return w.map(function (_, i) { return (r[i] || ''); }).join(', '); }).join('\n');
    } else {
      out = rows.map(function (r) { return w.map(function (_, i) { return padCell(r[i] || '', i); }).join(' ').replace(/\s+$/, ''); }).join('\n');
    }
    return R(KV([['行数', rows.length], ['列数', cols], ['格式', v.mode]]) + SEC('对齐结果') + PRE(out), out);
  }
});

T({ id: 'masktext', name: '隐私信息打码', cat: 'text',
  desc: '识别并打码手机号、邮箱、身份证、银行卡与 IP，支持自定义保留位数', tags: '打码 脱敏 隐私 手机号 身份证 mask',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6, value: '联系人：张三 13812345678，邮箱 zhangsan@example.com，身份证 110101199001011234，卡号 6222021234567890123，服务器 192.168.1.100' },
    { k: 'mode', label: '打码方式', type: 'select', value: 'star', options: [
      ['star', '星号替换'], ['bracket', '保留首末 + 类型标签'], ['remove', '整段删除'] ] },
    { k: 'phone', label: '手机号', type: 'select', value: 'yes', options: [['yes', '打码'], ['no', '保留']] },
    { k: 'mail', label: '邮箱', type: 'select', value: 'yes', options: [['yes', '打码'], ['no', '保留']] },
    { k: 'id', label: '身份证 / 银行卡', type: 'select', value: 'yes', options: [['yes', '打码'], ['no', '保留']] }
  ],
  run: function (v) {
    var s = String(v.text || ''), counts = { 手机号: 0, 邮箱: 0, 身份证: 0, 银行卡: 0, IP: 0 };
    function mk(m, type, label) {
      counts[label]++;
      if (v.mode === 'remove') return '';
      if (v.mode === 'bracket') return '[' + label + ':' + m.charAt(0) + '…' + m.charAt(m.length - 1) + ']';
      var keep = m.length <= 6 ? 1 : (type === 'mail' ? 1 : 3);
      return m.slice(0, keep) + new Array(Math.max(2, m.length - keep - 1)).join('*') + m.slice(-1);
    }
    if (v.mail === 'yes') s = s.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, function (m) { return mk(m, 'mail', '邮箱'); });
    if (v.id === 'yes') {
      s = s.replace(/\b\d{17}[\dXx]\b/g, function (m) { return mk(m, 'id', '身份证'); });
      s = s.replace(/\b\d{16,19}\b/g, function (m) { return mk(m, 'card', '银行卡'); });
    }
    if (v.phone === 'yes') s = s.replace(/(^|[^\d])(1[3-9]\d{9})(?!\d)/g, function (all, pre, m) {
      return pre + mk(m, 'phone', '手机号');
    });
    s = s.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, function (m) { counts.IP++; return v.mode === 'remove' ? '' : (v.mode === 'bracket' ? '[IP]' : m.replace(/\d+\.\d+$/, '***.***')); });
    var detail = Object.keys(counts).filter(function (k) { return counts[k]; }).map(function (k) { return k + ' ' + counts[k] + ' 处'; }).join('、') || '未识别到敏感信息';
    return R(KV([['识别结果', detail], ['打码方式', v.mode]]) + SEC('脱敏结果') + PRE(s) +
      HINT('识别基于正则，仅供文本预览与分享前自查，请人工复核后再外发。'), s);
  }
});

T({ id: 'initials', name: '缩写提取器', cat: 'text',
  desc: '从词组生成首字母缩写、取前 N 字缩写或驼峰简写', tags: '缩写 首字母 简称 acronym 驼峰',
  fields: [
    { k: 'text', label: '词组（每行一条）', type: 'textarea', rows: 5, value: 'AnKong Toolbox\n中国香港特别行政区\nToo Long Did Not Read\n人工智能生成内容' },
    { k: 'mode', label: '缩写方式', type: 'select', value: 'initial', options: [
      ['initial', '英文首字母 / 中文首字'], ['words', '每个单词前 3 字母'], ['len', '按目标长度截取'] ] },
    { k: 'len', label: '目标长度（按长度截取时）', type: 'text', value: '4' },
    { k: 'upper', label: '结果大写', type: 'select', value: 'yes', options: [['yes', '大写'], ['no', '原样']] }
  ],
  run: function (v) {
    var rows = lines(v.text).filter(function (l) { return l.trim(); }).map(function (l) {
      var raw = l.trim(), out = '';
      if (v.mode === 'len') {
        out = raw.replace(/\s/g, '').slice(0, Math.max(1, parseInt(v.len, 10) || 4));
      } else if (v.mode === 'words') {
        out = raw.split(/\s+/).map(function (w) { return /^[A-Za-z]/.test(w) ? w.slice(0, 3) : w.charAt(0); }).join('');
      } else {
        out = raw.split(/\s+/).map(function (w) { return w.charAt(0); }).join('');
      }
      if (v.upper === 'yes') out = out.toUpperCase();
      return [raw, out];
    });
    return R(TB(['原文', '缩写'], rows) + HINT('中文按每个词的首字提取；英文按空格分词。'),
      rows.map(function (r) { return r[0] + ' → ' + r[1]; }).join('\n'));
  }
});

T({ id: 'cnplaceholder', name: '中文占位文本', cat: 'text',
  desc: '生成中文假文用于排版预览，可选段落数、句式与是否加标题', tags: '占位 假文 中文 lorem 排版 预览',
  fields: [
    { k: 'paras', label: '段落数', type: 'text', value: '3' },
    { k: 'sent', label: '每段句数', type: 'text', value: '4' },
    { k: 'style', label: '文风', type: 'select', value: 'general', options: [
      ['general', '通用说明文'], ['tech', '技术文档'], ['life', '生活随笔'] ] },
    { k: 'title', label: '添加小标题', type: 'select', value: 'yes', options: [['yes', '是'], ['no', '否']] }
  ],
  run: function (v) {
    var subj = ['工具', '界面', '数据', '流程', '设计', '设备', '文本', '功能', '体验', '设置'];
    var verb = ['可以在本机完成', '支持多种方式', '会按当前配置自动调整', '不需要联网即可使用', '提供清晰的说明', '可按需要随时修改'];
    var tail = ['方便反复核对结果。', '避免重复输入带来的误差。', '适合日常快速处理。', '结果可一键复制或导出。', '所有内容仅保存在本机。'];
    var tech = ['输入数据在浏览器本地解析', '结果通过纯前端算法计算', '不向任何服务器发起请求', '兼容主流移动与桌面浏览器', '配置项会写入本地存储'];
    var life = ['午后把桌面收拾整齐', '顺手记下今天想做的事', '给窗台上的绿植浇了水', '翻几页放在床头的书', '傍晚沿着河边慢慢走回去'];
    var pool = v.style === 'tech' ? tech : (v.style === 'life' ? life : null);
    var p = Math.max(1, Math.min(20, parseInt(v.paras, 10) || 3));
    var n = Math.max(1, Math.min(12, parseInt(v.sent, 10) || 4));
    var out = [], seed = 7;
    function pick(a) { seed = (seed * 9301 + 49297) % 233280; return a[Math.floor(seed / 233280 * a.length) % a.length]; }
    for (var i = 0; i < p; i++) {
      if (v.title === 'yes') out.push('第 ' + (i + 1) + ' 节  ' + pick(subj) + '与' + pick(subj));
      var ss = [];
      for (var j = 0; j < n; j++) {
        ss.push(pool ? pick(pool) + '，' + pick(tail) : '关于' + pick(subj) + '的这部分' + pick(verb) + '，' + pick(tail));
      }
      out.push(ss.join(''));
      out.push('');
    }
    var text = out.join('\n').trim();
    return R(KV([['段落', p], ['每段句数', n], ['文风', v.style], ['字数', text.replace(/\s/g, '').length]]) + SEC('占位文本') + PRE(text), text);
  }
});

T({ id: 'symbols', name: '特殊符号速查', cat: 'text',
  desc: '按类别查找数学、货币、箭头、制表与标点符号，点击可复制', tags: '符号 特殊字符 数学 货币 箭头 unicode',
  fields: [
    { k: 'cat', label: '符号类别', type: 'select', value: 'math', options: [
      ['math', '数学符号'], ['money', '货币符号'], ['arrow', '箭头符号'],
      ['punct', '中文标点'], ['shape', '几何图形'], ['tech', '技术符号'] ] },
    { k: 'filter', label: '名称筛选（可选）', type: 'text', value: '' }
  ],
  run: function (v) {
    var data = {
      math: [['±', '正负'], ['×', '乘'], ['÷', '除'], ['≈', '约等于'], ['≠', '不等于'], ['≤', '小于等于'], ['≥', '大于等于'], ['∑', '求和'], ['√', '根号'], ['∞', '无穷'], ['∫', '积分'], ['π', '圆周率'], ['‰', '千分比'], ['∠', '角'], ['⊥', '垂直'], ['∈', '属于']],
      money: [['¥', '人民币'], ['$', '美元'], ['€', '欧元'], ['£', '英镑'], ['₩', '韩元'], ['₹', '印度卢比'], ['₽', '卢布'], ['¢', '分'], ['₿', '比特币'], ['₺', '里拉']],
      arrow: [['→', '右箭头'], ['←', '左箭头'], ['↑', '上箭头'], ['↓', '下箭头'], ['↔', '双向'], ['⇒', '推导'], ['⇄', '互换'], ['↗', '右上'], ['↩', '回车'], ['⟶', '长右箭头']],
      punct: [['「', '左引号'], ['」', '右引号'], ['『', '左双引'], ['』', '右双引'], ['《', '左书名号'], ['》', '右书名号'], ['、', '顿号'], ['·', '间隔号'], ['—', '破折号'], ['…', '省略号'], ['．', '全角句点'], ['【', '方头括号']],
      shape: [['●', '实心圆'], ['○', '空心圆'], ['■', '实心方'], ['□', '空心方'], ['▲', '实心三角'], ['△', '空心三角'], ['★', '实心星'], ['☆', '空心星'], ['◆', '菱形'], ['◇', '空菱形']],
      tech: [['©', '版权'], ['®', '注册'], ['™', '商标'], ['§', '章节'], ['¶', '段落'], ['°', '度'], ['℃', '摄氏度'], ['µ', '微'], ['Ω', '欧姆'], ['↯', '高压'], ['⌘', 'Command'], ['⌥', 'Option']]
    };
    var rows = (data[v.cat] || []).filter(function (r) { return !v.filter || r[1].indexOf(v.filter) >= 0; });
    var grid = rows.map(function (r) {
      return '<button class="chip" data-act="copy-text" data-copy="' + esc(r[0]) + '" style="min-width:74px;margin:3px">' +
        '<b style="font-size:17px">' + esc(r[0]) + '</b><br><small>' + esc(r[1]) + '</small></button>';
    }).join('');
    return R(KV([['类别', v.cat], ['符号数', rows.length]]) + '<div style="margin-top:10px">' + (grid || HINT('没有匹配的符号')) + '</div>' +
      HINT('点击任意符号即可复制到剪贴板。'),
      rows.map(function (r) { return r[0] + ' ' + r[1]; }).join('\n'));
  }
});

T({ id: 'quotefix', name: '智能引号配对', cat: 'text',
  desc: '把直引号配对成中文弯引号 / 书名号，或反向还原', tags: '引号 配对 弯引号 书名号 标点 quote',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 6, value: '他说:"这本书叫《安空工具箱》,里面提到\'离线\'两个字。"' },
    { k: 'mode', label: '处理方式', type: 'select', value: 'to', options: [
      ['to', '直引号 → 弯引号'], ['from', '弯引号 → 直引号'], ['book', '尖括号 → 书名号'] ] },
    { k: 'style', label: '引号样式', type: 'select', value: 'cn', options: [
      ['cn', '中文 “ ” ‘ ’'], ['corner', '直角 「」『』'] ] }
  ],
  run: function (v) {
    var s = String(v.text || '');
    if (v.mode === 'from') {
      s = s.replace(/[“”„]/g, '"').replace(/[‘’]/g, "'").replace(/[「」]/g, '"').replace(/[『』]/g, "'").replace(/[《》]/g, '<>');
    } else if (v.mode === 'book') {
      s = s.replace(/<<([^<>]+)>>/g, '《$1》').replace(/<([^<>]{1,30})>/g, '《$1》');
    } else {
      var l = v.style === 'corner' ? '「' : '“', r = v.style === 'corner' ? '」' : '”';
      var l2 = v.style === 'corner' ? '『' : '‘', r2 = v.style === 'corner' ? '』' : '’';
      var open = true, open2 = true;
      s = s.replace(/"/g, function () { var c = open ? l : r; open = !open; return c; });
      s = s.replace(/'/g, function () { var c = open2 ? l2 : r2; open2 = !open2; return c; });
      s = s.replace(/,(?=[^"]*$)/g, '，');
    }
    return R(KV([['处理方式', v.mode], ['字符数', s.length]]) + SEC('转换结果') + PRE(s) +
      HINT('配对按出现顺序交替，若原文引号不成对请先在「文本校对」里检查。'), s);
  }
});

/* ============================================================
   二、开发者（8）
   ============================================================ */

T({ id: 'jsonmerge', name: 'JSON 深度合并', cat: 'dev',
  desc: '把两个 JSON 对象按键递归合并，可选覆盖或保留原值策略', tags: 'JSON 合并 merge 深度 对象 配置',
  fields: [
    { k: 'a', label: '基础 JSON', type: 'textarea', rows: 6, value: '{\n  "name": "ankong",\n  "ui": { "theme": "light", "lang": "zh" },\n  "items": [1, 2]\n}' },
    { k: 'b', label: '覆盖 JSON', type: 'textarea', rows: 6, value: '{\n  "ui": { "theme": "dark", "accent": "amber" },\n  "version": "1.5"\n}' },
    { k: 'mode', label: '冲突策略', type: 'select', value: 'override', options: [
      ['override', '用后者覆盖'], ['keep', '保留前者'], ['array', '数组拼接'] ] },
    { k: 'indent', label: '缩进空格数', type: 'text', value: '2' }
  ],
  run: function (v) {
    var a, b;
    try { a = JSON.parse(v.a); b = JSON.parse(v.b); }
    catch (e) { return R(HINT('JSON 解析失败：' + e.message)); }
    function isObj(x) { return x && typeof x === 'object' && !Array.isArray(x); }
    function mg(x, y) {
      if (isObj(x) && isObj(y)) {
        var o = {}, k;
        for (k in x) if (Object.prototype.hasOwnProperty.call(x, k)) o[k] = x[k];
        for (k in y) if (Object.prototype.hasOwnProperty.call(y, k)) o[k] = isObj(o[k]) && isObj(y[k]) ? mg(o[k], y[k]) : y[k];
        return o;
      }
      if (Array.isArray(x) && Array.isArray(y) && v.mode === 'array') return x.concat(y);
      return v.mode === 'keep' ? x : y;
    }
    var out = mg(a, b), txt = JSON.stringify(out, null, Math.max(0, Math.min(8, parseInt(v.indent, 10) || 2)));
    function keys(o) { return isObj(o) ? Object.keys(o).length : 0; }
    return R(KV([['基础键数', keys(a)], ['覆盖键数', keys(b)], ['合并后键数', keys(out)], ['冲突策略', v.mode]]) + SEC('合并结果') + PRE(txt), txt);
  }
});

T({ id: 'jsonschema', name: 'JSON Schema 生成', cat: 'dev',
  desc: '从 JSON 样例推断类型与必填字段，生成 draft-07 Schema', tags: 'JSON Schema 推断 类型 draft 校验',
  fields: [
    { k: 'json', label: 'JSON 样例', type: 'textarea', rows: 8, value: '{\n  "id": 1,\n  "name": "安空工具箱",\n  "enabled": true,\n  "tags": ["tool", "offline"],\n  "meta": { "version": 1.5, "note": null },\n  "score": 4.8\n}' },
    { k: 'required', label: '全部字段设为必填', type: 'select', value: 'yes', options: [['yes', '是'], ['no', '否']] }
  ],
  run: function (v) {
    var d;
    try { d = JSON.parse(v.json); } catch (e) { return R(HINT('JSON 解析失败：' + e.message)); }
    function infer(x) {
      if (x === null) return { type: 'null' };
      if (Array.isArray(x)) {
        var s = { type: 'array' };
        if (x.length) s.items = infer(x[0]);
        return s;
      }
      if (typeof x === 'object') {
        var p = {}, req = [], k;
        for (k in x) if (Object.prototype.hasOwnProperty.call(x, k)) { p[k] = infer(x[k]); req.push(k); }
        var o = { type: 'object', properties: p };
        if (v.required === 'yes' && req.length) o.required = req;
        return o;
      }
      if (typeof x === 'number') return { type: (x % 1 === 0) ? 'integer' : 'number' };
      if (typeof x === 'boolean') return { type: 'boolean' };
      return { type: 'string' };
    }
    var s = infer(d);
    s.$schema = 'http://json-schema.org/draft-07/schema#';
    s.title = 'Generated by 安空工具箱';
    var txt = JSON.stringify(s, null, 2);
    return R(KV([['顶层类型', s.type], ['顶层属性数', s.properties ? Object.keys(s.properties).length : 0]]) + SEC('Schema') + PRE(txt), txt);
  }
});

T({ id: 'yaml2json', name: 'YAML 转 JSON', cat: 'dev',
  desc: '解析常见 YAML 子集（缩进映射、列表、布尔与数字），输出 JSON', tags: 'YAML JSON 转换 配置 缩进',
  fields: [
    { k: 'yaml', label: 'YAML 文本', type: 'textarea', rows: 9, value: 'name: 安空工具箱\nversion: 1.5\noffline: true\nfeatures:\n  - tools\n  - themes\nui:\n  theme: light\n  accent: amber' },
    { k: 'indent', label: '输出缩进', type: 'text', value: '2' }
  ],
  run: function (v) {
    var ls = lines(v.yaml), root = {}, stack = [{ ind: -1, obj: root }];
    function scalar(s) {
      s = s.trim();
      if (/^(true|yes)$/i.test(s)) return true;
      if (/^(false|no)$/i.test(s)) return false;
      if (/^(null|~|)$/i.test(s)) return null;
      if (/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
      return s.replace(/^['"]|['"]$/g, '');
    }
    try {
      ls.forEach(function (raw) {
        var ln = raw.replace(/\t/g, '  ');
        if (!ln.trim() || /^\s*#/.test(ln)) return;
        var ind = ln.length - ln.replace(/^\s*/, '').length;
        var body = ln.trim();
        while (stack.length > 1 && stack[stack.length - 1].ind >= ind) stack.pop();
        var cur = stack[stack.length - 1].obj;
        if (/^-\s+/.test(body)) {
          if (!Array.isArray(cur)) return;
          cur.push(scalar(body.replace(/^-\s+/, '')));
          return;
        }
        var m = body.match(/^([^:]+):\s*(.*)$/);
        if (!m) return;
        var key = m[1].trim().replace(/^['"]|['"]$/g, ''), rest = m[2];
        if (rest === '') {
          var next = ls[ls.indexOf(raw) + 1];
          var isList = next && /^\s*-\s+/.test(next);
          var child = isList ? [] : {};
          cur[key] = child;
          stack.push({ ind: ind, obj: child });
        } else cur[key] = scalar(rest);
      });
    } catch (e) { return R(HINT('解析失败：' + e.message)); }
    var txt = JSON.stringify(root, null, Math.max(0, Math.min(8, parseInt(v.indent, 10) || 2)));
    return R(KV([['行数', ls.length], ['顶层键数', Object.keys(root).length]]) + SEC('JSON 结果') + PRE(txt) +
      HINT('仅支持常见 YAML 子集：缩进映射、简单列表、标量。复杂锚点与多行块请用专业解析器。'), txt);
  }
});

T({ id: 'toml2json', name: 'TOML 转 JSON', cat: 'dev',
  desc: '解析常见 TOML 子集（表、键值对、数组、布尔），输出 JSON', tags: 'TOML JSON 转换 配置 表',
  fields: [
    { k: 'toml', label: 'TOML 文本', type: 'textarea', rows: 9, value: 'name = "安空工具箱"\nversion = 1.5\noffline = true\n\n[ui]\ntheme = "light"\naccent = "amber"\n\n[features]\nitems = ["tools", "themes", "i18n"]' },
    { k: 'indent', label: '输出缩进', type: 'text', value: '2' }
  ],
  run: function (v) {
    var root = {}, cur = root;
    function scalar(s) {
      s = s.trim();
      if (/^\[.*\]$/.test(s)) return s.slice(1, -1).split(',').map(function (x) { return scalar(x); }).filter(function (x) { return x !== ''; });
      if (/^(true|false)$/i.test(s)) return s.toLowerCase() === 'true';
      if (/^-?\d+(\.\d+)?$/.test(s)) return parseFloat(s);
      return s.replace(/^['"]|['"]$/g, '');
    }
    lines(v.toml).forEach(function (raw) {
      var ln = raw.trim();
      if (!ln || ln.charAt(0) === '#') return;
      var t = ln.match(/^\[([^\]]+)\]$/);
      if (t) {
        cur = root;
        t[1].split('.').forEach(function (p) { p = p.trim(); if (!cur[p]) cur[p] = {}; cur = cur[p]; });
        return;
      }
      var m = ln.match(/^([^=]+)=\s*(.+)$/);
      if (m) cur[m[1].trim()] = scalar(m[2]);
    });
    var txt = JSON.stringify(root, null, Math.max(0, Math.min(8, parseInt(v.indent, 10) || 2)));
    return R(KV([['顶层键数', Object.keys(root).length]]) + SEC('JSON 结果') + PRE(txt) +
      HINT('仅支持常见 TOML 子集：表、键值对、简单数组与标量。'), txt);
  }
});

T({ id: 'html2text', name: 'HTML 转纯文本', cat: 'dev',
  desc: '去掉标签与实体，保留段落与列表结构，可选压缩空白', tags: 'HTML 纯文本 去标签 实体 提取',
  fields: [
    { k: 'html', label: 'HTML 片段', type: 'textarea', rows: 8, value: '<h2>标题</h2>\n<p>第一段 &amp; <b>加粗</b> 与 <a href="#">链接</a>。</p>\n<ul><li>项目一</li><li>项目二</li></ul>' },
    { k: 'list', label: '列表加符号', type: 'select', value: 'yes', options: [['yes', '是'], ['no', '否']] },
    { k: 'blank', label: '块级元素后空行', type: 'select', value: 'yes', options: [['yes', '是'], ['no', '否']] }
  ],
  run: function (v) {
    var s = String(v.html || '');
    s = s.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
    s = s.replace(/<br\s*\/?>/gi, '\n');
    s = s.replace(/<li[^>]*>/gi, v.list === 'yes' ? '\n• ' : '\n');
    s = s.replace(/<\/(p|div|h[1-6]|ul|ol|tr|section|blockquote)>/gi, v.blank === 'yes' ? '\n\n' : '\n');
    s = s.replace(/<[^>]+>/g, '');
    s = s.replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(+d); });
    s = s.split('\n').map(function (l) { return l.replace(/[ \t]+/g, ' ').trim(); }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
    return R(KV([['输出字符数', s.length], ['行数', lines(s).length]]) + SEC('纯文本') + PRE(s), s);
  }
});

T({ id: 'cssformat', name: 'CSS 格式化 / 压缩', cat: 'dev',
  desc: '整理缩进与换行，或反过来压缩体积，显示节省比例', tags: 'CSS 格式化 压缩 minify 美化',
  fields: [
    { k: 'css', label: 'CSS 文本', type: 'textarea', rows: 8, value: '.card{color:#6750A4;background:#FFF8EE;margin:8px}\n.card b{font-weight:700}@media (max-width:600px){.card{margin:4px}}' },
    { k: 'mode', label: '处理方式', type: 'select', value: 'format', options: [
      ['format', '格式化'], ['minify', '压缩'] ] },
    { k: 'indent', label: '缩进空格数', type: 'text', value: '2' }
  ],
  run: function (v) {
    var s = String(v.css || ''), before = s.length, out;
    if (v.mode === 'minify') {
      out = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*([{}:;,>])\s*/g, '$1')
        .replace(/;}/g, '}').replace(/\s+/g, ' ').trim();
    } else {
      var sp = new Array(Math.max(1, Math.min(8, parseInt(v.indent, 10) || 2)) + 1).join(' ');
      out = s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*{\s*/g, ' {\n').replace(/\s*}\s*/g, '\n}\n')
        .replace(/;\s*/g, ';\n').replace(/\n\s*\n/g, '\n');
      out = out.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l; })
        .map(function (l) { return l === '}' ? '}' : (l.charAt(0) === '}' ? l : sp + l); }).join('\n')
        .replace(/\n}/g, '\n}').replace(/\{\n/g, '{\n').replace(/\n\}/g, '\n}');
      out = out.replace(new RegExp('^' + sp, 'gm'), function (m, off) { return out.charAt(off - 1) === '\n' ? sp : m; });
    }
    var saved = before - out.length;
    return R(KV([['原始字符', before], ['结果字符', out.length],
      ['变化', (saved >= 0 ? '减少 ' : '增加 ') + Math.abs(saved) + ' 字符（' + round(Math.abs(saved) / before * 100, 1) + '%）']]) +
      SEC('结果') + PRE(out), out);
  }
});

T({ id: 'diffjson', name: 'JSON 结构差异', cat: 'dev',
  desc: '逐键对比两个 JSON，列出新增、删除与值变化', tags: 'JSON diff 对比 差异 变更',
  fields: [
    { k: 'a', label: '旧 JSON', type: 'textarea', rows: 7, value: '{\n  "name": "ankong",\n  "version": "1.4",\n  "ui": { "theme": "light" },\n  "removed": true\n}' },
    { k: 'b', label: '新 JSON', type: 'textarea', rows: 7, value: '{\n  "name": "ankong",\n  "version": "1.5",\n  "ui": { "theme": "dark", "accent": "amber" },\n  "added": 225\n}' }
  ],
  run: function (v) {
    var a, b;
    try { a = JSON.parse(v.a); b = JSON.parse(v.b); }
    catch (e) { return R(HINT('JSON 解析失败：' + e.message)); }
    var rows = [];
    function isObj(x) { return x && typeof x === 'object' && !Array.isArray(x); }
    function walk(x, y, path) {
      if (isObj(x) && isObj(y)) {
        var keys = {}, k;
        for (k in x) if (Object.prototype.hasOwnProperty.call(x, k)) keys[k] = 1;
        for (k in y) if (Object.prototype.hasOwnProperty.call(y, k)) keys[k] = 1;
        for (k in keys) if (Object.prototype.hasOwnProperty.call(keys, k)) {
          var p = path ? path + '.' + k : k;
          if (!(k in x)) rows.push(['新增', p, JSON.stringify(y[k])]);
          else if (!(k in y)) rows.push(['删除', p, JSON.stringify(x[k])]);
          else walk(x[k], y[k], p);
        }
      } else if (JSON.stringify(x) !== JSON.stringify(y)) {
        rows.push(['修改', path || '(根)', JSON.stringify(x) + ' → ' + JSON.stringify(y)]);
      }
    }
    walk(a, b, '');
    var cnt = { 新增: 0, 删除: 0, 修改: 0 };
    rows.forEach(function (r) { cnt[r[0]]++; });
    return R(KV([['新增', cnt.新增], ['删除', cnt.删除], ['修改', cnt.修改], ['差异总数', rows.length]]) +
      (rows.length ? SEC('差异明细') + TB(['类型', '路径', '值 / 变化'], rows) : HINT('两个 JSON 完全一致。')),
      rows.map(function (r) { return r[0] + ' ' + r[1] + ' ' + r[2]; }).join('\n'));
  }
});

T({ id: 'hashbatch', name: '批量摘要计算', cat: 'dev',
  desc: '逐行计算 MD5 / 长度 / 十六进制，适合批量生成校验值', tags: 'MD5 批量 摘要 校验 哈希 hash',
  fields: [
    { k: 'text', label: '文本（每行一条）', type: 'textarea', rows: 6, value: 'hello\n安空工具箱\n123456' },
    { k: 'algo', label: '算法 / 输出', type: 'select', value: 'md5', options: [
      ['md5', 'MD5'], ['len', '字符 / 字节长度'], ['hex', 'UTF-8 十六进制'], ['sum', '字符码累加'] ] },
    { k: 'upper', label: '十六进制大写', type: 'select', value: 'no', options: [['yes', '大写'], ['no', '小写']] }
  ],
  run: function (v) {
    var rows = lines(v.text).filter(function (l) { return l.length; }).map(function (l) {
      var out = '';
      if (v.algo === 'md5') out = H.md5(l);
      else if (v.algo === 'len') out = '字符 ' + l.length + ' / UTF-8 ' + H.strToHex(l).length / 2 + ' 字节';
      else if (v.algo === 'sum') { var s = 0; for (var i = 0; i < l.length; i++) s += l.charCodeAt(i); out = String(s); }
      else out = H.strToHex(l);
      if (v.upper === 'yes' && /^[0-9a-f]+$/.test(out)) out = out.toUpperCase();
      return [l.length > 28 ? l.slice(0, 28) + '…' : l, out];
    });
    return R(KV([['条数', rows.length], ['算法', v.algo]]) + TB(['输入', '结果'], rows),
      rows.map(function (r) { return r[0] + '\t' + r[1]; }).join('\n'));
  }
});

/* ============================================================
   三、计算换算（8）
   ============================================================ */

T({ id: 'tipcalc', name: '小费与服务费', cat: 'calc',
  desc: '按小费比例或人均金额计算总额与每人应付', tags: '小费 服务费 分账 消费 tip',
  fields: [
    { k: 'amount', label: '消费金额', type: 'text', value: '268.00' },
    { k: 'rate', label: '小费比例（%）', type: 'text', value: '10' },
    { k: 'people', label: '人数', type: 'text', value: '3' },
    { k: 'round', label: '总额取整', type: 'select', value: 'no', options: [
      ['no', '不取整'], ['up', '向上取整到元'], ['near', '四舍五入到元'] ] }
  ],
  run: function (v) {
    var a = parseNum(v.amount), r = parseNum(v.rate), p = Math.max(1, Math.round(parseNum(v.people, 1)));
    var tip = a * r / 100, total = a + tip;
    if (v.round === 'up') total = Math.ceil(total);
    else if (v.round === 'near') total = Math.round(total);
    var each = total / p;
    return R(KV([
      ['消费金额', fmtMoney(a) + ' 元'],
      ['小费（' + num(r, 2) + '%）', fmtMoney(tip) + ' 元'],
      ['合计', fmtMoney(total) + ' 元'],
      ['每人应付（' + p + ' 人）', fmtMoney(each) + ' 元'],
      ['实际小费比例', num(total - a > 0 ? (total - a) / a * 100 : 0, 2) + '%']
    ]) + HINT('取整作用于合计金额，人均按取整后的总额平分。'), '合计 ' + fmtMoney(total) + ' 元，每人 ' + fmtMoney(each) + ' 元');
  }
});

T({ id: 'currencyfmt', name: '多币种金额格式', cat: 'calc',
  desc: '按常见币种规则格式化金额，对比千分位、小数位与符号位置', tags: '货币 金额 格式化 千分位 币种',
  fields: [
    { k: 'amount', label: '金额', type: 'text', value: '1234567.891' },
    { k: 'cur', label: '币种', type: 'select', value: 'CNY', options: [
      ['CNY', 'CNY 人民币 ¥'], ['USD', 'USD 美元 $'], ['EUR', 'EUR 欧元 €'],
      ['JPY', 'JPY 日元 ¥'], ['GBP', 'GBP 英镑 £'], ['KRW', 'KRW 韩元 ₩'] ] },
    { k: 'sep', label: '千分位', type: 'select', value: 'yes', options: [['yes', '使用'], ['no', '不使用']] }
  ],
  run: function (v) {
    var cfg = { CNY: ['¥', 2, '前'], USD: ['$', 2, '前'], EUR: ['€', 2, '后'], GBP: ['£', 2, '前'], JPY: ['¥', 0, '前'], KRW: ['₩', 0, '前'] };
    var c = cfg[v.cur] || cfg.CNY, n = parseNum(v.amount);
    var fixed = n.toFixed(c[1]);
    var parts = fixed.split('.');
    if (v.sep === 'yes') parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var s = parts.join('.');
    var out = c[2] === '前' ? c[0] + s : s + ' ' + c[0];
    return R(KV([['币种', v.cur], ['符号', c[0]], ['小数位', c[1]], ['符号位置', c[2] === '前' ? '金额前' : '金额后'],
      ['千分位', v.sep === 'yes' ? '使用' : '不使用']]) + SEC('格式化结果') + PRE(out) +
      HINT('按常见书写习惯展示，不含实时汇率换算。'), out);
  }
});

T({ id: 'unitbatch', name: '批量单位换算', cat: 'calc',
  desc: '逐行把数值在长度 / 重量 / 温度单位间换算，自动识别源单位', tags: '单位 换算 批量 长度 重量 温度',
  fields: [
    { k: 'text', label: '数值（每行一条）', type: 'textarea', rows: 6, value: '100 cm\n2.5 kg\n32 C\n1.75 m\n500 g' },
    { k: 'group', label: '换算组', type: 'select', value: 'length', options: [
      ['length', '长度（mm/cm/m/km/in/ft）'], ['weight', '重量（g/kg/lb/oz）'], ['temp', '温度（C/F/K）'] ] },
    { k: 'to', label: '目标单位', type: 'text', value: 'm' }
  ],
  run: function (v) {
    var to = String(v.to || '').trim().toLowerCase();
    var L = { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 };
    var W = { g: 0.001, kg: 1, lb: 0.45359237, oz: 0.028349523, t: 1000, jin: 0.5 };
    var map = v.group === 'weight' ? W : L;
    var rows = lines(v.text).filter(function (l) { return l.trim(); }).map(function (l) {
      var m = l.trim().match(/^(-?[\d.]+)\s*([A-Za-z°℃]*)$/);
      if (!m) return [l, '无法解析', ''];
      var n = parseFloat(m[1]), u = (m[2] || '').toLowerCase().replace('℃', 'c').replace('°c', 'c').replace('°f', 'f');
      if (v.group === 'temp') {
        var c;
        if (u === 'f' || u === '°f') c = (n - 32) * 5 / 9;
        else if (u === 'k' || u === 'K') c = n - 273.15;
        else c = n;
        var out;
        if (to === 'f') out = c * 9 / 5 + 32;
        else if (to === 'k') out = c + 273.15;
        else out = c;
        return [l.trim(), num(out, 3) + ' ' + (to === 'f' ? '°F' : to === 'k' ? 'K' : '°C'), '摄氏 ' + num(c, 2) + '°'];
      }
      if (!map[u] || !map[to]) return [l.trim(), '单位不支持', ''];
      return [l.trim(), num(n * map[u] / map[to], 6) + ' ' + v.to, '基准 ' + num(n * map[u], 4)];
    });
    return R(KV([['换算组', v.group], ['目标单位', v.to], ['条数', rows.length]]) +
      TB(['输入', '结果', '备注'], rows), rows.map(function (r) { return r[0] + ' → ' + r[1]; }).join('\n'));
  }
});

T({ id: 'apr', name: '实际年利率换算', cat: 'calc',
  desc: '名义年利率与按不同复利周期的实际年利率 EAR 互算', tags: '利率 年化 APR EAR 复利 理财',
  fields: [
    { k: 'rate', label: '年化数值（%）', type: 'text', value: '12' },
    { k: 'n', label: '每年计息次数', type: 'select', value: '12', options: [
      ['1', '1 次 / 年'], ['2', '2 次 / 半年'], ['4', '4 次 / 季'], ['12', '12 次 / 月'], ['365', '365 次 / 日'] ] },
    { k: 'mode', label: '换算方向', type: 'select', value: 'apr2ear', options: [
      ['apr2ear', '名义 APR → 实际 EAR'], ['ear2apr', '实际 EAR → 名义 APR'] ] }
  ],
  run: function (v) {
    var r = parseNum(v.rate) / 100, n = parseInt(v.n, 10) || 1;
    var apr, ear;
    if (v.mode === 'apr2ear') { apr = r; ear = Math.pow(1 + r / n, n) - 1; }
    else { ear = r; apr = n * (Math.pow(1 + r, 1 / n) - 1); }
    return R(KV([
      ['名义年利率 APR', num(apr * 100, 4) + '%'],
      ['实际年利率 EAR', num(ear * 100, 4) + '%'],
      ['计息次数', n + ' 次 / 年'],
      ['每期利率', num(apr / n * 100, 4) + '%'],
      ['差额', num((ear - apr) * 100, 4) + ' 个百分点']
    ]) + SEC('说明') + '<div class="hint" style="margin-top:6px">EAR = (1 + APR/n)<sup>n</sup> − 1。分期越多，实际成本高于名义利率越多；比较不同产品请统一用 EAR。</div>',
      'APR ' + num(apr * 100, 4) + '% → EAR ' + num(ear * 100, 4) + '%');
  }
});

T({ id: 'bayes', name: '贝叶斯定理计算', cat: 'calc',
  desc: '由先验概率、灵敏度与误报率计算后验概率，适合检测类场景', tags: '贝叶斯 概率 后验 灵敏度 误报 条件概率',
  fields: [
    { k: 'prior', label: '先验概率 P(A)（%）', type: 'text', value: '1' },
    { k: 'sens', label: '灵敏度 P(B|A)（%）', type: 'text', value: '95' },
    { k: 'fpr', label: '误报率 P(B|¬A)（%）', type: 'text', value: '5' },
    { k: 'n', label: '以多少人为示例', type: 'text', value: '10000' }
  ],
  run: function (v) {
    var pa = Math.max(0, Math.min(100, parseNum(v.prior))) / 100;
    var sens = Math.max(0, Math.min(100, parseNum(v.sens))) / 100;
    var fpr = Math.max(0, Math.min(100, parseNum(v.fpr))) / 100;
    var pb = pa * sens + (1 - pa) * fpr;
    var post = pb > 0 ? pa * sens / pb : 0;
    var N = Math.max(1, Math.round(parseNum(v.n, 10000)));
    var tp = N * pa * sens, fp = N * (1 - pa) * fpr;
    return R(KV([
      ['P(B) 阳性总概率', num(pb * 100, 4) + '%'],
      ['后验 P(A|B)', num(post * 100, 4) + '%'],
      ['先验 P(A)', num(pa * 100, 4) + '%'],
      ['概率提升倍数', num(pa > 0 ? post / pa : 0, 2) + ' 倍']
    ]) + SEC('人数示例（' + N + ' 人）') + TB(['分组', '阳性', '阴性'], [
      ['真实为 A', String(Math.round(tp)), String(Math.round(N * pa - tp))],
      ['真实非 A', String(Math.round(fp)), String(Math.round(N * (1 - pa) - fp))]
    ]) + HINT('即使灵敏度很高，低先验概率下阳性结果仍可能大部分是误报，这是「基础比率谬误」。'),
      '后验概率 ' + num(post * 100, 4) + '%');
  }
});

T({ id: 'circle', name: '圆与扇形计算', cat: 'calc',
  desc: '由半径或直径求周长面积、扇形弧长面积与弓形参数', tags: '圆 半径 扇形 弧长 面积 几何',
  fields: [
    { k: 'r', label: '半径', type: 'text', value: '5' },
    { k: 'angle', label: '扇形圆心角（度）', type: 'text', value: '60' },
    { k: 'by', label: '输入的是', type: 'select', value: 'r', options: [
      ['r', '半径'], ['d', '直径'], ['c', '周长'] ] }
  ],
  run: function (v) {
    var x = parseNum(v.r), r = v.by === 'd' ? x / 2 : (v.by === 'c' ? x / (2 * Math.PI) : x);
    if (r <= 0) return R(HINT('请输入大于 0 的数值'));
    var a = Math.max(0, Math.min(360, parseNum(v.angle))) * Math.PI / 180;
    var d = 2 * r, c = 2 * Math.PI * r, area = Math.PI * r * r;
    var arc = r * a, sec = r * r * a / 2, chord = 2 * r * Math.sin(a / 2);
    return R(TB(['项目', '公式', '结果'], [
      ['直径', '2r', num(d, 4)], ['周长', '2πr', num(c, 4)], ['圆面积', 'πr²', num(area, 4)],
      ['扇形弧长', 'rθ', num(arc, 4)], ['扇形面积', 'r²θ/2', num(sec, 4)],
      ['弦长', '2r·sin(θ/2)', num(chord, 4)],
      ['扇形占圆比例', 'θ/2π', num(a / (2 * Math.PI) * 100, 2) + '%']
    ]) + HINT('θ 使用弧度参与计算，界面输入为角度；π 取 Math.PI。'),
      '半径 ' + num(r, 4) + '，周长 ' + num(c, 4) + '，面积 ' + num(area, 4));
  }
});

T({ id: 'physics', name: '常用物理公式', cat: 'calc',
  desc: '速度、加速度、力、动能、功率、压强与欧姆定律一次算全', tags: '物理 公式 速度 动能 功率 欧姆 压强',
  fields: [
    { k: 'm', label: '质量 m（kg）', type: 'text', value: '10' },
    { k: 'v', label: '速度 v（m/s）', type: 'text', value: '6' },
    { k: 'a', label: '加速度 a（m/s²）', type: 'text', value: '2' },
    { k: 't', label: '时间 t（s）', type: 'text', value: '3' },
    { k: 'F', label: '受力 F（N，可选）', type: 'text', value: '' },
    { k: 'A', label: '受力面积 A（m²）', type: 'text', value: '0.5' },
    { k: 'I', label: '电流 I（A）', type: 'text', value: '2' },
    { k: 'R', label: '电阻 R（Ω）', type: 'text', value: '10' }
  ],
  run: function (v) {
    var m = parseNum(v.m), v0 = parseNum(v.v), a = parseNum(v.a), t = parseNum(v.t);
    var F = v.F === '' ? m * a : parseNum(v.F), A = parseNum(v.A, 1) || 1;
    var I = parseNum(v.I), res = parseNum(v.R, 1) || 1;
    var rows = [
      ['末速度', 'v + at', num(v0 + a * t, 3) + ' m/s'],
      ['位移', 'vt + ½at²', num(v0 * t + 0.5 * a * t * t, 3) + ' m'],
      ['合力', 'F = ma', num(F, 3) + ' N'],
      ['动量', 'p = mv', num(m * v0, 3) + ' kg·m/s'],
      ['动能', 'E = ½mv²', num(0.5 * m * v0 * v0, 3) + ' J'],
      ['平均功率', 'P = F·v', num(F * v0, 3) + ' W'],
      ['做功', 'W = F·s', num(F * (v0 * t + 0.5 * a * t * t), 3) + ' J'],
      ['压强', 'p = F/A', num(F / A, 3) + ' Pa'],
      ['电压', 'U = IR', num(I * res, 3) + ' V'],
      ['电功率', 'P = I²R', num(I * I * res, 3) + ' W']
    ];
    return R(TB(['物理量', '公式', '结果'], rows) + HINT('默认取 g = 9.8 m/s² 未参与上述计算；输入为空的项按公式反推。'),
      rows.map(function (r) { return r[0] + ' = ' + r[2]; }).join('\n'));
  }
});

T({ id: 'weightedavg', name: '加权平均分', cat: 'calc',
  desc: '按学分或权重计算加权平均，并对比算术平均的差距', tags: '加权 平均 学分 成绩 权重 GPA',
  fields: [
    { k: 'text', label: '数据（每行：名称 分数 权重）', type: 'textarea', rows: 6, value: '高等数学 88 4\n大学英语 92 2\n程序设计 95 3\n体育 80 1' },
    { k: 'digits', label: '保留小数位', type: 'text', value: '2' }
  ],
  run: function (v) {
    var rows = [], sw = 0, sx = 0, sum = 0, n = 0;
    lines(v.text).forEach(function (l) {
      var p = l.trim().split(/[\s,，\t]+/);
      if (p.length < 3) return;
      var x = parseFloat(p[1]), w = parseFloat(p[2]);
      if (!isFinite(x) || !isFinite(w) || w <= 0) return;
      rows.push([p[0], x, w, num(x * w, 2)]);
      sw += w; sx += x * w; sum += x; n++;
    });
    if (!n) return R(HINT('请按「名称 分数 权重」每行输入一条'));
    var d = Math.max(0, Math.min(6, parseInt(v.digits, 10) || 2));
    var wa = sx / sw, aa = sum / n;
    return R(KV([
      ['条目数', n], ['权重合计', num(sw, d)], ['加权平均', num(wa, d)],
      ['算术平均', num(aa, d)], ['差值', num(wa - aa, d)]
    ]) + SEC('明细') + TB(['名称', '分数', '权重', '分数×权重'], rows),
      '加权平均 ' + num(wa, d) + '，算术平均 ' + num(aa, d));
  }
});

/* ============================================================
   四、生活（7）
   ============================================================ */

T({ id: 'medicine', name: '用药间隔提醒', cat: 'life',
  desc: '按每日次数或固定间隔生成一天内的服药时间点', tags: '用药 服药 间隔 提醒 时间 健康',
  fields: [
    { k: 'start', label: '首次时间（HH:MM）', type: 'text', value: '08:00' },
    { k: 'mode', label: '排布方式', type: 'select', value: 'times', options: [
      ['times', '按每日次数均分'], ['interval', '按固定小时间隔'] ] },
    { k: 'times', label: '每日次数', type: 'text', value: '3' },
    { k: 'interval', label: '间隔小时', type: 'text', value: '8' },
    { k: 'span', label: '清醒时段小时数', type: 'text', value: '16' }
  ],
  run: function (v) {
    var m = String(v.start || '08:00').match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return R(HINT('时间格式应为 HH:MM，例如 08:00'));
    var base = (+m[1]) * 60 + (+m[2]);
    var pts = [], i;
    if (v.mode === 'interval') {
      var gap = Math.max(1, parseNum(v.interval, 8)) * 60, n = Math.max(1, Math.min(24, Math.floor(1440 / gap)));
      for (i = 0; i < n; i++) pts.push((base + i * gap) % 1440);
    } else {
      var times = Math.max(1, Math.min(12, parseInt(v.times, 10) || 3));
      var span = Math.max(1, Math.min(24, parseNum(v.span, 16))) * 60;
      for (i = 0; i < times; i++) pts.push((base + Math.round(i * span / times)) % 1440);
    }
    function hh(mm) { return padL(Math.floor(mm / 60) % 24, 2) + ':' + padL(mm % 60, 2); }
    var rows = pts.sort(function (a, b) { return a - b; }).map(function (p, i) {
      return ['第 ' + (i + 1) + ' 次', hh(p), i < pts.length - 1 ? num((pts[i + 1] - p + 1440) % 1440 / 60, 1) + ' 小时后' : '—'];
    });
    return R(KV([['首次', hh(base)], ['每日次数', rows.length], ['方式', v.mode]]) + TB(['次序', '时间', '间隔'], rows) +
      HINT('仅为时间排布参考，具体用法用量请遵医嘱。'), pts.map(hh).join('、'));
  }
});

T({ id: 'caffeine', name: '咖啡因代谢估算', cat: 'life',
  desc: '按摄入量与半衰期估算体内剩余咖啡因及建议入睡时间', tags: '咖啡因 半衰期 咖啡 睡眠 代谢',
  fields: [
    { k: 'drinks', label: '饮品（每行：名称 毫克 饮用时间）', type: 'textarea', rows: 5, value: '美式咖啡 95 09:00\n拿铁 75 14:00\n绿茶 30 16:00' },
    { k: 'half', label: '半衰期（小时）', type: 'text', value: '5' },
    { k: 'check', label: '查看时刻（HH:MM）', type: 'text', value: '22:00' },
    { k: 'limit', label: '睡前可接受上限（mg）', type: 'text', value: '50' }
  ],
  run: function (v) {
    var h = Math.max(1, parseNum(v.half, 5));
    var cm = String(v.check || '22:00').match(/^(\d{1,2}):(\d{2})$/);
    if (!cm) return R(HINT('查看时刻格式应为 HH:MM'));
    var now = (+cm[1]) * 60 + (+cm[2]);
    var rows = [], total = 0;
    lines(v.drinks).forEach(function (l) {
      var p = l.trim().split(/\s+/);
      if (p.length < 3) return;
      var mg = parseFloat(p[1]), tm = p[2].match(/^(\d{1,2}):(\d{2})$/);
      if (!isFinite(mg) || !tm) return;
      var t0 = (+tm[1]) * 60 + (+tm[2]);
      var dt = (now - t0 + 1440) % 1440 / 60;
      var left = mg * Math.pow(0.5, dt / h);
      total += left;
      rows.push([p[0], mg + ' mg', p[2], num(dt, 1) + ' h', num(left, 1) + ' mg']);
    });
    var lim = parseNum(v.limit, 50);
    var need = total > lim ? h * Math.log(total / lim) / Math.LN2 : 0;
    return R(KV([['饮品数', rows.length], ['查看时刻', v.check],
      ['体内剩余合计', num(total, 1) + ' mg'], ['可接受上限', lim + ' mg'],
      ['降至上限还需', num(need, 1) + ' 小时']]) +
      (rows.length ? TB(['饮品', '含量', '饮用', '已过', '剩余'], rows) : '') +
      HINT('半衰期个体差异较大（通常 3~7 小时）；结果仅为粗略估算，不构成医学建议。'),
      '查看时刻剩余 ' + num(total, 1) + ' mg');
  }
});

T({ id: 'plant', name: '绿植养护周期', cat: 'life',
  desc: '按季节与植物类型生成浇水、施肥与转盆的日期表', tags: '绿植 浇水 养护 周期 日历 植物',
  fields: [
    { k: 'start', label: '起始日期', type: 'text', value: '2026-11-15' },
    { k: 'type', label: '植物类型', type: 'select', value: 'leaf', options: [
      ['leaf', '观叶植物'], ['succulent', '多肉 / 仙人掌'], ['flower', '开花植物'], ['herb', '香草 / 蔬菜'] ] },
    { k: 'season', label: '季节', type: 'select', value: 'autumn', options: [
      ['spring', '春'], ['summer', '夏'], ['autumn', '秋'], ['winter', '冬'] ] },
    { k: 'weeks', label: '生成周数', type: 'text', value: '6' }
  ],
  run: function (v) {
    var base = { leaf: 7, succulent: 14, flower: 5, herb: 4 };
    var f = { spring: 0.8, summer: 0.7, autumn: 1.2, winter: 1.8 };
    var gap = Math.max(2, Math.round(base[v.type] * f[v.season]));
    var d = new Date(String(v.start || '2026-11-15') + 'T00:00:00');
    if (isNaN(d.getTime())) return R(HINT('日期格式应为 YYYY-MM-DD'));
    var w = Math.max(1, Math.min(26, parseInt(v.weeks, 10) || 6)), rows = [];
    for (var i = 0; i < w; i++) {
      var x = new Date(d.getTime() + i * 7 * 86400000);
      var water = new Date(d.getTime() + Math.floor(i * 7 / gap) * gap * 86400000);
      rows.push(['第 ' + (i + 1) + ' 周', H.fmtDate(x, false),
        H.fmtDate(water, false), i % 4 === 3 ? '施薄肥 / 转盆' : '常规观察']);
    }
    return R(KV([['植物类型', v.type], ['季节', v.season], ['建议浇水间隔', gap + ' 天'], ['生成周数', w]]) +
      TB(['周次', '周起始', '建议浇水', '其它'], rows) +
      HINT('间隔按常见养护经验估算；实际请以盆土干湿、光照与品种说明为准。'),
      '每 ' + gap + ' 天浇水一次');
  }
});

T({ id: 'parking', name: '停车费计算', cat: 'life',
  desc: '按时段、免费时长、封顶价与跨天规则计算停车费用', tags: '停车 计费 时长 封顶 收费',
  fields: [
    { k: 'in', label: '入场时间', type: 'text', value: '2026-11-15 09:20' },
    { k: 'out', label: '出场时间', type: 'text', value: '2026-11-15 18:05' },
    { k: 'free', label: '免费时长（分钟）', type: 'text', value: '15' },
    { k: 'rate', label: '每小时费用（元）', type: 'text', value: '6' },
    { k: 'cap', label: '每日封顶（元，0 为不封顶）', type: 'text', value: '48' },
    { k: 'unit', label: '计费单位', type: 'select', value: 'hour', options: [
      ['hour', '按小时（不足1小时按1小时）'], ['half', '按半小时'], ['minute', '按分钟精确'] ] }
  ],
  run: function (v) {
    var a = new Date(String(v.in).replace(' ', 'T')), b = new Date(String(v.out).replace(' ', 'T'));
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return R(HINT('时间格式应为 YYYY-MM-DD HH:MM'));
    var mins = Math.max(0, (b - a) / 60000), free = parseNum(v.free), rate = parseNum(v.rate), cap = parseNum(v.cap);
    var charge = Math.max(0, mins - free), units;
    if (v.unit === 'minute') units = charge / 60;
    else if (v.unit === 'half') units = Math.ceil(charge / 30) / 2;
    else units = Math.ceil(charge / 60);
    var raw = units * rate;
    var days = Math.max(1, Math.ceil(mins / 1440));
    var capped = cap > 0 ? Math.min(raw, cap * days) : raw;
    return R(KV([
      ['停车时长', Math.floor(mins / 60) + ' 小时 ' + Math.round(mins % 60) + ' 分'],
      ['免费时长', free + ' 分钟'], ['计费时长', num(charge, 1) + ' 分钟'],
      ['计费单位数', num(units, 2)], ['单价', fmtMoney(rate) + ' 元'],
      ['按量费用', fmtMoney(raw) + ' 元'], ['跨天数', days + ' 天'],
      ['应收金额', fmtMoney(capped) + ' 元']
    ]) + HINT('跨天封顶按整天数粗略折算，实际以停车场公示规则为准。'), '应收 ' + fmtMoney(capped) + ' 元');
  }
});

T({ id: 'rentsplit', name: '房租按面积分摊', cat: 'life',
  desc: '按房间面积或人数分摊房租与公共费用，自动处理尾差', tags: '房租 分摊 合租 面积 AA 尾差',
  fields: [
    { k: 'total', label: '房租总额', type: 'text', value: '6000' },
    { k: 'common', label: '公共费用（水电等）', type: 'text', value: '400' },
    { k: 'text', label: '房间（每行：名称 面积 人数）', type: 'textarea', rows: 5, value: '主卧 22 2\n次卧A 15 1\n次卧B 13 1' },
    { k: 'mode', label: '房租分摊依据', type: 'select', value: 'area', options: [
      ['area', '按面积'], ['people', '按人数'], ['equal', '按房间均分'] ] }
  ],
  run: function (v) {
    var rows = [], sumA = 0, sumP = 0;
    lines(v.text).forEach(function (l) {
      var p = l.trim().split(/\s+/);
      if (p.length < 2) return;
      var a = parseFloat(p[1]) || 0, n = parseFloat(p[2]) || 1;
      rows.push({ name: p[0], area: a, people: n }); sumA += a; sumP += n;
    });
    if (!rows.length) return R(HINT('请按「名称 面积 人数」每行输入一间房'));
    var rent = parseNum(v.total), common = parseNum(v.common);
    var rowsOut = [], acc = 0;
    rows.forEach(function (r, i) {
      var w = v.mode === 'area' ? (sumA ? r.area / sumA : 1 / rows.length)
        : v.mode === 'people' ? (sumP ? r.people / sumP : 1 / rows.length) : 1 / rows.length;
      var share = i === rows.length - 1 ? round(rent - acc, 2) : round(rent * w, 2);
      acc += share;
      rowsOut.push([r.name, num(r.area, 1) + ' m²', r.people + ' 人', fmtMoney(share), fmtMoney(common / sumP * r.people), fmtMoney(share + common / sumP * r.people)]);
    });
    return R(KV([['房租', fmtMoney(rent)], ['公共费用', fmtMoney(common)],
      ['总面积', num(sumA, 1) + ' m²'], ['总人数', sumP + ' 人'], ['分摊依据', v.mode]]) +
      TB(['房间', '面积', '人数', '房租', '公摊', '合计'], rowsOut) +
      HINT('最后一间房承担四舍五入产生的尾差，确保合计与总额一致。'),
      rowsOut.map(function (r) { return r[0] + ' ' + r[5]; }).join('\n'));
  }
});

T({ id: 'expiry', name: '保质期与过期提醒', cat: 'life',
  desc: '由生产日期加保质期推算到期日、剩余天数与建议处理时间', tags: '保质期 过期 食品 日期 提醒 剩余天数',
  fields: [
    { k: 'text', label: '物品（每行：名称 生产日期 保质期天数）', type: 'textarea', rows: 5, value: '牛奶 2026-11-10 7\n面包 2026-11-13 5\n鸡蛋 2026-10-28 30' },
    { k: 'today', label: '今天日期', type: 'text', value: '2026-11-15' },
    { k: 'warn', label: '提前提醒天数', type: 'text', value: '3' }
  ],
  run: function (v) {
    var today = new Date(String(v.today) + 'T00:00:00');
    if (isNaN(today.getTime())) return R(HINT('今天日期格式应为 YYYY-MM-DD'));
    var warn = Math.max(0, parseInt(v.warn, 10) || 3), rows = [];
    lines(v.text).forEach(function (l) {
      var p = l.trim().split(/\s+/);
      if (p.length < 3) return;
      var d = new Date(p[1] + 'T00:00:00');
      if (isNaN(d.getTime())) return;
      var days = parseInt(p[2], 10) || 0;
      var end = new Date(d.getTime() + days * 86400000);
      var left = Math.round((end - today) / 86400000);
      var status = left < 0 ? '已过期 ' + (-left) + ' 天' : (left <= warn ? '即将到期' : '正常');
      rows.push([p[0], p[1], days + ' 天', H.fmtDate(end, false), String(left), status]);
    });
    if (!rows.length) return R(HINT('请按「名称 生产日期 保质期天数」每行输入一条'));
    rows.sort(function (a, b) { return (+a[4]) - (+b[4]); });
    return R(KV([['物品数', rows.length], ['今天', v.today], ['提醒阈值', warn + ' 天'],
      ['需处理', rows.filter(function (r) { return (+r[4]) <= warn; }).length + ' 项']]) +
      TB(['物品', '生产日期', '保质期', '到期日', '剩余天数', '状态'], rows),
      rows.map(function (r) { return r[0] + ' ' + r[5]; }).join('\n'));
  }
});

T({ id: 'cleanplan', name: '家务轮换排班', cat: 'life',
  desc: '按成员与任务自动生成若干周的轮换表，尽量均衡分配', tags: '家务 排班 轮换 值日 分工 周表',
  fields: [
    { k: 'people', label: '成员（逗号或空格分隔）', type: 'text', value: '张三,李四,王五' },
    { k: 'tasks', label: '任务（每行一项）', type: 'textarea', rows: 4, value: '扫地拖地\n洗碗\n倒垃圾\n擦桌面' },
    { k: 'weeks', label: '生成周数', type: 'text', value: '4' }
  ],
  run: function (v) {
    var ps = String(v.people || '').split(/[,，\s]+/).filter(function (x) { return x; });
    var ts = lines(v.tasks).filter(function (l) { return l.trim(); }).map(function (l) { return l.trim(); });
    if (!ps.length || !ts.length) return R(HINT('请至少填写一名成员与一项任务'));
    var w = Math.max(1, Math.min(12, parseInt(v.weeks, 10) || 4)), rows = [], count = {};
    ps.forEach(function (p) { count[p] = 0; });
    for (var i = 0; i < w; i++) {
      ts.forEach(function (t, j) {
        var p = ps[(i * ts.length + j) % ps.length];
        count[p]++;
        rows.push(['第 ' + (i + 1) + ' 周', t, p]);
      });
    }
    var balance = ps.map(function (p) { return p + ' ' + count[p] + ' 次'; }).join('、');
    return R(KV([['成员数', ps.length], ['任务数', ts.length], ['周数', w], ['分配次数', balance]]) +
      TB(['周次', '任务', '负责人'], rows) +
      HINT('按「周 × 任务」顺序轮转，成员数量固定时分配天然均衡。'),
      rows.map(function (r) { return r.join(' / '); }).join('\n'));
  }
});

/* ============================================================
   五、查询速查（7）
   ============================================================ */

T({ id: 'gitcmd', name: 'Git 命令速查', cat: 'query',
  desc: '按场景查找常用 Git 命令与说明，支持关键词筛选并复制', tags: 'Git 命令 速查 版本控制 commit branch',
  fields: [
    { k: 'cat', label: '场景', type: 'select', value: 'all', options: [
      ['all', '全部'], ['init', '初始化与配置'], ['daily', '日常提交'], ['branch', '分支与合并'],
      ['remote', '远程协作'], ['undo', '撤销与回退'], ['inspect', '查看与排查'] ] },
    { k: 'q', label: '关键词筛选（可选）', type: 'text', value: '' }
  ],
  run: function (v) {
    var D = [
      ['init', 'git init', '在当前目录初始化仓库'],
      ['init', 'git clone <url>', '克隆远程仓库到本地'],
      ['init', 'git config user.name "名字"', '设置提交者姓名'],
      ['daily', 'git status', '查看工作区状态'],
      ['daily', 'git add .', '暂存所有改动'],
      ['daily', 'git commit -m "说明"', '提交暂存区'],
      ['daily', 'git commit --amend', '修改最近一次提交'],
      ['branch', 'git branch', '列出本地分支'],
      ['branch', 'git switch -c <name>', '创建并切换到新分支'],
      ['branch', 'git merge <branch>', '把指定分支合并到当前分支'],
      ['branch', 'git rebase <branch>', '变基到指定分支'],
      ['remote', 'git remote -v', '查看远程仓库地址'],
      ['remote', 'git fetch origin', '拉取远程更新（不合并）'],
      ['remote', 'git pull', '拉取并合并当前分支'],
      ['remote', 'git push -u origin main', '首次推送并关联上游'],
      ['undo', 'git restore <file>', '丢弃工作区改动'],
      ['undo', 'git restore --staged <file>', '取消暂存'],
      ['undo', 'git reset --soft HEAD~1', '撤销提交但保留改动'],
      ['undo', 'git revert <commit>', '新建一次提交来撤销历史提交'],
      ['inspect', 'git log --oneline --graph', '图形化查看提交历史'],
      ['inspect', 'git diff', '查看未暂存的差异'],
      ['inspect', 'git show <commit>', '查看某次提交详情'],
      ['inspect', 'git stash / git stash pop', '暂存 / 恢复未完成改动']
    ];
    var q = String(v.q || '').trim().toLowerCase();
    var rows = D.filter(function (r) {
      return (v.cat === 'all' || r[0] === v.cat) && (!q || (r[1] + r[2]).toLowerCase().indexOf(q) >= 0);
    });
    return R(KV([['场景', v.cat], ['命令数', rows.length]]) +
      (rows.length ? TB(['场景', '命令', '说明'], rows.map(function (r) { return [r[0], r[1], r[2]]; })) : HINT('没有匹配的命令')) +
      HINT('尖括号 &lt;name&gt; 表示需替换的参数；rebase 与 reset --hard 会改写历史，协作前请确认。'),
      rows.map(function (r) { return r[1] + ' — ' + r[2]; }).join('\n'));
  }
});

T({ id: 'docker', name: 'Docker 命令速查', cat: 'query',
  desc: '镜像、容器、网络与清理的常用 Docker 命令与说明', tags: 'Docker 容器 镜像 命令 速查 compose',
  fields: [
    { k: 'cat', label: '场景', type: 'select', value: 'all', options: [
      ['all', '全部'], ['image', '镜像'], ['run', '容器运行'], ['manage', '容器管理'],
      ['net', '网络与卷'], ['clean', '清理'], ['compose', 'Compose'] ] },
    { k: 'q', label: '关键词筛选（可选）', type: 'text', value: '' }
  ],
  run: function (v) {
    var D = [
      ['image', 'docker images', '列出本地镜像'],
      ['image', 'docker pull <image>:<tag>', '拉取镜像'],
      ['image', 'docker build -t <name> .', '用当前目录 Dockerfile 构建'],
      ['image', 'docker rmi <image>', '删除镜像'],
      ['run', 'docker run -d -p 8080:80 <image>', '后台运行并映射端口'],
      ['run', 'docker run -it --rm <image> sh', '临时进入交互式容器'],
      ['run', 'docker run -v $(pwd):/app <image>', '挂载当前目录'],
      ['manage', 'docker ps -a', '列出全部容器'],
      ['manage', 'docker logs -f <container>', '实时查看日志'],
      ['manage', 'docker exec -it <container> sh', '进入运行中的容器'],
      ['manage', 'docker stop / start <container>', '停止 / 启动容器'],
      ['net', 'docker network ls', '列出网络'],
      ['net', 'docker volume ls', '列出数据卷'],
      ['net', 'docker inspect <container>', '查看容器详细配置'],
      ['clean', 'docker system df', '查看磁盘占用'],
      ['clean', 'docker system prune -a', '清理未使用镜像与容器'],
      ['clean', 'docker container prune', '清理已停止的容器'],
      ['compose', 'docker compose up -d', '后台启动全部服务'],
      ['compose', 'docker compose down', '停止并移除服务'],
      ['compose', 'docker compose logs -f', '跟随查看服务日志']
    ];
    var q = String(v.q || '').trim().toLowerCase();
    var rows = D.filter(function (r) {
      return (v.cat === 'all' || r[0] === v.cat) && (!q || (r[1] + r[2]).toLowerCase().indexOf(q) >= 0);
    });
    return R(KV([['场景', v.cat], ['命令数', rows.length]]) +
      (rows.length ? TB(['场景', '命令', '说明'], rows) : HINT('没有匹配的命令')),
      rows.map(function (r) { return r[1] + ' — ' + r[2]; }).join('\n'));
  }
});

T({ id: 'regexref', name: '正则语法速查', cat: 'query',
  desc: '元字符、量词、分组、断言与常用模式的对照表', tags: '正则 regex 语法 速查 元字符 断言',
  fields: [
    { k: 'cat', label: '类别', type: 'select', value: 'all', options: [
      ['all', '全部'], ['char', '字符类'], ['quant', '量词'], ['group', '分组与断言'],
      ['flag', '修饰符'], ['common', '常用模式'] ] }
  ],
  run: function (v) {
    var D = [
      ['char', '.', '任意字符（默认不含换行）'],
      ['char', '\\d / \\D', '数字 / 非数字'],
      ['char', '\\w / \\W', '单词字符 / 非单词字符'],
      ['char', '\\s / \\S', '空白 / 非空白'],
      ['char', '[abc] / [^abc]', '字符集合 / 取反集合'],
      ['char', '[a-z]', '范围'],
      ['quant', '* / + / ?', '0 次以上 / 1 次以上 / 0 或 1 次'],
      ['quant', '{n} / {n,} / {n,m}', '恰好 n 次 / 至少 n 次 / n 到 m 次'],
      ['quant', '*? / +?', '惰性量词（尽可能少匹配）'],
      ['group', '(abc)', '捕获分组'],
      ['group', '(?:abc)', '非捕获分组'],
      ['group', 'a|b', '或'],
      ['group', '^ / $', '行首 / 行尾'],
      ['group', '\\b', '单词边界'],
      ['group', '(?=x) / (?!x)', '正向 / 负向先行断言'],
      ['group', '(?<=x) / (?<!x)', '后行断言（较新引擎才支持）'],
      ['flag', 'g', '全局匹配'],
      ['flag', 'i', '忽略大小写'],
      ['flag', 'm', '多行模式（^ $ 匹配每行）'],
      ['flag', 's', '点号匹配换行'],
      ['common', '^1[3-9]\\d{9}$', '中国大陆手机号'],
      ['common', '^[\\w.+-]+@[\\w-]+\\.[\\w.]+$', '邮箱（简化）'],
      ['common', '^\\d{4}-\\d{2}-\\d{2}$', '日期 YYYY-MM-DD'],
      ['common', '^(?=.*[a-z])(?=.*\\d).{8,}$', '至少 8 位且含字母数字']
    ];
    var rows = D.filter(function (r) { return v.cat === 'all' || r[0] === v.cat; });
    return R(KV([['类别', v.cat], ['条目数', rows.length]]) + TB(['类别', '写法', '说明'], rows) +
      HINT('安卓较老 WebView 不支持后行断言 (?&lt;=…)，跨平台正则请避免使用。'),
      rows.map(function (r) { return r[1] + ' — ' + r[2]; }).join('\n'));
  }
});

T({ id: 'latex', name: 'LaTeX 符号速查', cat: 'query',
  desc: '希腊字母、运算符、关系符与常用结构的写法对照', tags: 'LaTeX 公式 符号 希腊字母 数学 排版',
  fields: [
    { k: 'cat', label: '类别', type: 'select', value: 'greek', options: [
      ['greek', '希腊字母'], ['op', '运算符'], ['rel', '关系符'], ['struct', '常用结构'] ] },
    { k: 'q', label: '名称筛选（可选）', type: 'text', value: '' }
  ],
  run: function (v) {
    var D = {
      greek: [['α', '\\alpha'], ['β', '\\beta'], ['γ', '\\gamma'], ['δ', '\\delta'], ['ε', '\\epsilon'], ['θ', '\\theta'], ['λ', '\\lambda'], ['μ', '\\mu'], ['π', '\\pi'], ['σ', '\\sigma'], ['φ', '\\phi'], ['ω', '\\omega'], ['Γ', '\\Gamma'], ['Δ', '\\Delta'], ['Ω', '\\Omega']],
      op: [['±', '\\pm'], ['×', '\\times'], ['÷', '\\div'], ['·', '\\cdot'], ['√', '\\sqrt{x}'], ['∑', '\\sum_{i=1}^{n}'], ['∫', '\\int_a^b'], ['∂', '\\partial'], ['∞', '\\infty'], ['lim', '\\lim_{x \\to 0}']],
      rel: [['≤', '\\le'], ['≥', '\\ge'], ['≠', '\\ne'], ['≈', '\\approx'], ['≡', '\\equiv'], ['∝', '\\propto'], ['∈', '\\in'], ['⊂', '\\subset'], ['→', '\\to'], ['⇒', '\\Rightarrow']],
      struct: [['分数', '\\frac{a}{b}'], ['上标', 'x^{2}'], ['下标', 'x_{i}'], ['根号', '\\sqrt[n]{x}'], ['矩阵', '\\begin{matrix} a & b \\\\ c & d \\end{matrix}'], ['求和', '\\sum_{i=1}^{n} i'], ['极限', '\\lim_{x \\to \\infty}'], ['箭头', '\\xrightarrow{f}']]
    };
    var q = String(v.q || '').trim().toLowerCase();
    var rows = (D[v.cat] || []).filter(function (r) { return !q || (r[0] + r[1]).toLowerCase().indexOf(q) >= 0; });
    return R(KV([['类别', v.cat], ['条目数', rows.length]]) +
      TB(['符号 / 名称', 'LaTeX 写法'], rows.map(function (r) {
        return [r[0], '<code>' + esc(r[1]) + '</code>'];
      })) + HINT('点击结果可直接复制整表；公式写法需在数学环境 $…$ 或 \\[…\\] 内使用。'),
      rows.map(function (r) { return r[0] + ' ' + r[1]; }).join('\n'));
  }
});

T({ id: 'phonetic', name: '北约音标字母表', cat: 'query',
  desc: '把文本逐字母转成 NATO 音标词，或反向还原', tags: '音标 NATO 字母 拼读 无线电 phonetic',
  fields: [
    { k: 'text', label: '文本', type: 'text', value: 'ANKONG' },
    { k: 'mode', label: '方向', type: 'select', value: 'to', options: [
      ['to', '字母 → 音标词'], ['from', '音标词 → 字母'] ] }
  ],
  run: function (v) {
    var M = { A: 'Alpha', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot', G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett', K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu' };
    var NUM = { 0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Niner' };
    var s = String(v.text || '').toUpperCase();
    if (v.mode === 'to') {
      var rows = [], out = [];
      for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i), w = M[c] || NUM[c] || null;
        rows.push([c, w || '（原样）']);
        out.push(w || c);
      }
      var txt = out.join(' ');
      return R(KV([['字符数', s.length], ['可拼读', rows.filter(function (r) { return r[1] !== '（原样）'; }).length]]) +
        TB(['字符', '音标词'], rows) + SEC('拼读结果') + PRE(txt), txt);
    }
    var rev = {}, k;
    for (k in M) if (Object.prototype.hasOwnProperty.call(M, k)) rev[M[k].toUpperCase()] = k;
    for (k in NUM) if (Object.prototype.hasOwnProperty.call(NUM, k)) rev[NUM[k].toUpperCase()] = k;
    var back = s.split(/[\s,，\-]+/).map(function (w) { return rev[w] || (w.length === 1 ? w : '?'); }).join('');
    return R(KV([['输入词数', s.split(/[\s,，\-]+/).length], ['还原结果', back]]) + SEC('还原文本') + PRE(back), back);
  }
});

T({ id: 'currency', name: '世界货币速查', cat: 'query',
  desc: '按代码、名称或符号查询常见货币与小数位规则', tags: '货币 币种 代码 ISO 符号 汇率 速查',
  fields: [
    { k: 'q', label: '关键词（代码 / 名称 / 符号）', type: 'text', value: '' },
    { k: 'region', label: '地区', type: 'select', value: 'all', options: [
      ['all', '全部'], ['asia', '亚洲'], ['europe', '欧洲'], ['america', '美洲'], ['other', '其它'] ] }
  ],
  run: function (v) {
    var D = [
      ['CNY', '人民币', '¥', '元', 2, 'asia'], ['HKD', '港元', 'HK$', '元', 2, 'asia'],
      ['TWD', '新台币', 'NT$', '元', 2, 'asia'], ['JPY', '日元', '¥', '円', 0, 'asia'],
      ['KRW', '韩元', '₩', '원', 0, 'asia'], ['SGD', '新加坡元', 'S$', '元', 2, 'asia'],
      ['INR', '印度卢比', '₹', 'रुपया', 2, 'asia'], ['THB', '泰铢', '฿', 'บาท', 2, 'asia'],
      ['EUR', '欧元', '€', 'Euro', 2, 'europe'], ['GBP', '英镑', '£', 'Pound', 2, 'europe'],
      ['CHF', '瑞士法郎', 'CHF', 'Franken', 2, 'europe'], ['RUB', '俄罗斯卢布', '₽', 'рубль', 2, 'europe'],
      ['SEK', '瑞典克朗', 'kr', 'krona', 2, 'europe'], ['PLN', '波兰兹罗提', 'zł', 'złoty', 2, 'europe'],
      ['USD', '美元', '$', 'Dollar', 2, 'america'], ['CAD', '加元', 'C$', 'Dollar', 2, 'america'],
      ['BRL', '巴西雷亚尔', 'R$', 'Real', 2, 'america'], ['MXN', '墨西哥比索', 'Mex$', 'Peso', 2, 'america'],
      ['AUD', '澳元', 'A$', 'Dollar', 2, 'other'], ['NZD', '新西兰元', 'NZ$', 'Dollar', 2, 'other'],
      ['ZAR', '南非兰特', 'R', 'Rand', 2, 'other'], ['AED', '阿联酋迪拉姆', 'د.إ', 'Dirham', 2, 'other']
    ];
    var q = String(v.q || '').trim().toLowerCase();
    var rows = D.filter(function (r) {
      return (v.region === 'all' || r[5] === v.region) &&
        (!q || (r[0] + r[1] + r[2] + r[3]).toLowerCase().indexOf(q) >= 0);
    });
    return R(KV([['地区', v.region], ['币种数', rows.length]]) +
      TB(['代码', '名称', '符号', '单位', '小数位'], rows.map(function (r) { return [r[0], r[1], r[2], r[3], String(r[4])]; })) +
      HINT('仅列书写习惯，不含实时汇率；实际金额请用换算工具核对。'),
      rows.map(function (r) { return r[0] + ' ' + r[1] + ' ' + r[2]; }).join('\n'));
  }
});

T({ id: 'unicodeblock', name: 'Unicode 区段速查', cat: 'query',
  desc: '查询常用 Unicode 区段范围与起始码位，可把字符反查区段', tags: 'Unicode 区段 码位 字符 范围 编码',
  fields: [
    { k: 'char', label: '字符（留空显示全部）', type: 'text', value: '' }
  ],
  run: function (v) {
    var D = [
      ['基本拉丁字母', 0x0000, 0x007F], ['拉丁字母补充-1', 0x0080, 0x00FF],
      ['希腊字母', 0x0370, 0x03FF], ['西里尔字母', 0x0400, 0x04FF],
      ['希伯来文', 0x0590, 0x05FF], ['阿拉伯文', 0x0600, 0x06FF],
      ['中日韩统一表意文字', 0x4E00, 0x9FFF], ['CJK 符号与标点', 0x3000, 0x303F],
      ['平假名', 0x3040, 0x309F], ['片假名', 0x30A0, 0x30FF],
      ['全角与半角字符', 0xFF00, 0xFFEF], ['常用标点', 0x2000, 0x206F],
      ['货币符号', 0x20A0, 0x20CF], ['数学运算符', 0x2200, 0x22FF],
      ['箭头', 0x2190, 0x21FF], ['几何图形', 0x25A0, 0x25FF],
      ['表情符号基础区', 0x1F600, 0x1F64F], ['杂项符号与图形', 0x1F300, 0x1F5FF]
    ];
    function hex(c) { return 'U+' + c.toString(16).toUpperCase().replace(/^(.{1,3})$/, function (m) { return ('0000' + m).slice(-4); }); }
    if (v.char) {
      var cp = v.char.codePointAt ? v.char.codePointAt(0) : v.char.charCodeAt(0);
      var hit = null;
      D.forEach(function (r) { if (cp >= r[1] && cp <= r[2]) hit = r; });
      return R(KV([['字符', v.char.charAt(0)], ['码位', hex(cp)], ['字符数', v.char.length],
        ['所属区段', hit ? hit[0] : '未在本表范围内'],
        ['区段范围', hit ? hex(hit[1]) + ' ~ ' + hex(hit[2]) : '—']]) +
        HINT('codePointAt 可正确处理 emoji 等增补平面字符。'), v.char.charAt(0) + ' ' + hex(cp));
    }
    return R(KV([['区段数', D.length]]) + TB(['区段', '起始', '结束', '容量'], D.map(function (r) {
      return [r[0], hex(r[1]), hex(r[2]), String(r[2] - r[1] + 1)];
    })), D.map(function (r) { return r[0] + ' ' + hex(r[1]); }).join('\n'));
  }
});

/* ============================================================
   六、媒体 / 前端（6）
   ============================================================ */

T({ id: 'svggen', name: 'SVG 图形生成', cat: 'image',
  desc: '生成圆角矩形、星形、多边形与渐变背景的 SVG 代码并实时预览', tags: 'SVG 图形 星形 多边形 渐变 生成',
  fields: [
    { k: 'shape', label: '形状', type: 'select', value: 'star', options: [
      ['star', '五角星'], ['polygon', '正多边形'], ['roundrect', '圆角矩形'], ['circle', '圆形'] ] },
    { k: 'size', label: '画布尺寸', type: 'text', value: '200' },
    { k: 'fill', label: '填充色', type: 'text', value: '#FAE185' },
    { k: 'stroke', label: '描边色', type: 'text', value: '#6F5C0F' },
    { k: 'n', label: '多边形边数 / 星角数', type: 'text', value: '6' }
  ],
  run: function (v) {
    var S = Math.max(40, Math.min(600, parseInt(v.size, 10) || 200)), c = S / 2, r = S * 0.4;
    var fill = /^#[0-9a-f]{3,6}$/i.test(v.fill) ? v.fill : '#FAE185';
    var stroke = /^#[0-9a-f]{3,6}$/i.test(v.stroke) ? v.stroke : '#6F5C0F';
    var n = Math.max(3, Math.min(24, parseInt(v.n, 10) || 6));
    var body = '', pts = [];
    if (v.shape === 'roundrect') body = '<rect x="' + (S * 0.12) + '" y="' + (S * 0.12) + '" width="' + (S * 0.76) + '" height="' + (S * 0.76) + '" rx="' + (S * 0.14) + '"/>';
    else if (v.shape === 'circle') body = '<circle cx="' + c + '" cy="' + c + '" r="' + r + '"/>';
    else {
      for (var i = 0; i < n * (v.shape === 'star' ? 2 : 1); i++) {
        var rr = (v.shape === 'star' && i % 2) ? r * 0.45 : r;
        var a = -Math.PI / 2 + i * Math.PI * 2 / (n * (v.shape === 'star' ? 2 : 1));
        pts.push(num(c + rr * Math.cos(a), 2) + ',' + num(c + rr * Math.sin(a), 2));
      }
      body = '<polygon points="' + pts.join(' ') + '"/>';
    }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + S + ' ' + S + '" width="' + S + '" height="' + S + '">' +
      '<g fill="' + fill + '" stroke="' + stroke + '" stroke-width="3" stroke-linejoin="round">' + body + '</g></svg>';
    return R(KV([['形状', v.shape], ['画布', S + ' × ' + S], ['顶点数', pts.length || '—']]) +
      '<div style="margin:12px 0;text-align:center">' + svg + '</div>' + SEC('SVG 代码') + PRE(svg), svg);
  }
});

T({ id: 'gridgen', name: 'CSS Grid 生成器', cat: 'image',
  desc: '按列数、间距与对齐方式生成 Grid 布局代码和预览', tags: 'CSS Grid 网格 布局 生成 前端',
  fields: [
    { k: 'cols', label: '列数', type: 'text', value: '3' },
    { k: 'rows', label: '行数', type: 'text', value: '2' },
    { k: 'gap', label: '间距（px）', type: 'text', value: '12' },
    { k: 'min', label: '最小列宽（px，0 为等分）', type: 'text', value: '0' },
    { k: 'align', label: '对齐', type: 'select', value: 'stretch', options: [
      ['stretch', '拉伸 stretch'], ['center', '居中 center'], ['start', '靠前 start'] ] }
  ],
  run: function (v) {
    var cols = Math.max(1, Math.min(12, parseInt(v.cols, 10) || 3));
    var rows = Math.max(1, Math.min(12, parseInt(v.rows, 10) || 2));
    var gap = Math.max(0, Math.min(48, parseInt(v.gap, 10) || 12));
    var min = Math.max(0, Math.min(400, parseInt(v.min, 10) || 0));
    var tpl = min > 0 ? 'repeat(auto-fit, minmax(' + min + 'px, 1fr))' : 'repeat(' + cols + ', 1fr)';
    var css = '.grid {\n  display: grid;\n  grid-template-columns: ' + tpl + ';\n' +
      '  gap: ' + gap + 'px;\n  align-items: ' + v.align + ';\n}';
    var cells = '';
    for (var i = 0; i < cols * rows; i++) cells += '<div style="background:#FAE185;border:1px solid #E3CE86;border-radius:8px;padding:14px;text-align:center;font-size:12px;color:#6F5C0F">' + (i + 1) + '</div>';
    var preview = '<div style="display:grid;grid-template-columns:' + tpl + ';gap:' + gap + 'px;align-items:' + v.align + ';margin:12px 0">' + cells + '</div>';
    return R(KV([['列数', cols], ['行数', rows], ['间距', gap + ' px'], ['列模板', tpl]]) + preview + SEC('CSS') + PRE(css), css);
  }
});

T({ id: 'flexgen', name: 'Flexbox 生成器', cat: 'image',
  desc: '配置主轴、交叉轴、换行与间距，生成 Flex 布局代码与预览', tags: 'CSS Flex 弹性 布局 生成 前端',
  fields: [
    { k: 'dir', label: '主轴方向', type: 'select', value: 'row', options: [
      ['row', 'row 横向'], ['column', 'column 纵向'], ['row-reverse', 'row-reverse 反向'] ] },
    { k: 'justify', label: '主轴对齐', type: 'select', value: 'space-between', options: [
      ['flex-start', 'flex-start'], ['center', 'center'], ['flex-end', 'flex-end'],
      ['space-between', 'space-between'], ['space-around', 'space-around'], ['space-evenly', 'space-evenly'] ] },
    { k: 'align', label: '交叉轴对齐', type: 'select', value: 'center', options: [
      ['stretch', 'stretch'], ['flex-start', 'flex-start'], ['center', 'center'], ['flex-end', 'flex-end'] ] },
    { k: 'wrap', label: '换行', type: 'select', value: 'nowrap', options: [['nowrap', 'nowrap'], ['wrap', 'wrap']] },
    { k: 'gap', label: '间距（px）', type: 'text', value: '10' }
  ],
  run: function (v) {
    var gap = Math.max(0, Math.min(48, parseInt(v.gap, 10) || 10));
    var css = '.flex {\n  display: flex;\n  flex-direction: ' + v.dir + ';\n' +
      '  justify-content: ' + v.justify + ';\n  align-items: ' + v.align + ';\n' +
      '  flex-wrap: ' + v.wrap + ';\n  gap: ' + gap + 'px;\n}';
    var cells = '';
    for (var i = 0; i < 4; i++) cells += '<div style="background:#C7ECCB;border:1px solid #8FC49A;border-radius:8px;padding:12px 18px;font-size:12px;color:#2F5D3A">item ' + (i + 1) + '</div>';
    var preview = '<div style="display:flex;flex-direction:' + v.dir + ';justify-content:' + v.justify +
      ';align-items:' + v.align + ';flex-wrap:' + v.wrap + ';gap:' + gap + 'px;min-height:88px;background:#FFF8EE;border-radius:10px;padding:10px;margin:12px 0">' + cells + '</div>';
    return R(KV([['方向', v.dir], ['主轴', v.justify], ['交叉轴', v.align], ['换行', v.wrap], ['间距', gap + ' px']]) +
      preview + SEC('CSS') + PRE(css), css);
  }
});

T({ id: 'fontstack', name: '字体栈生成', cat: 'image',
  desc: '按平台与用途生成 system-ui / 中文 / 等宽字体栈 CSS', tags: '字体 font-family 字体栈 system-ui 中文 等宽',
  fields: [
    { k: 'use', label: '用途', type: 'select', value: 'ui', options: [
      ['ui', '界面正文'], ['cn', '中文正文'], ['mono', '代码 / 等宽'], ['serif', '衬线标题'], ['all', '全部方案'] ] },
    { k: 'extra', label: '追加首选字体（可选）', type: 'text', value: '' }
  ],
  run: function (v) {
    var D = {
      ui: ['界面正文', 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'],
      cn: ['中文正文', '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", "Hiragino Sans GB", sans-serif'],
      mono: ['代码 / 等宽', 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", monospace'],
      serif: ['衬线标题', 'Georgia, "Songti SC", "Noto Serif CJK SC", "SimSun", serif']
    };
    var keys = v.use === 'all' ? ['ui', 'cn', 'mono', 'serif'] : [v.use];
    var rows = keys.map(function (k) {
      var s = D[k][1];
      if (v.extra) s = '"' + String(v.extra).replace(/"/g, '') + '", ' + s;
      return [D[k][0], 'font-family: ' + s + ';'];
    });
    var css = rows.map(function (r) { return '/* ' + r[0] + ' */\n' + r[1]; }).join('\n\n');
    return R(KV([['方案数', rows.length], ['首选字体', v.extra || '（无）']]) +
      TB(['用途', 'CSS'], rows.map(function (r) { return [r[0], '<code>' + esc(r[1]) + '</code>']; })) +
      SEC('完整 CSS') + PRE(css) + '<div style="margin-top:10px;font-family:' + (v.extra ? '"' + v.extra + '", ' : '') + 'system-ui,sans-serif">界面字体预览 Aa 安空工具箱 123</div>', css);
  }
});

T({ id: 'borderradius', name: '圆角与裁剪生成', cat: 'image',
  desc: '生成统一或分角圆角、胶囊与常见 clip-path 形状代码', tags: 'CSS 圆角 border-radius clip-path 胶囊 形状',
  fields: [
    { k: 'size', label: '元素尺寸（px）', type: 'text', value: '120' },
    { k: 'r', label: '圆角（px）', type: 'text', value: '16' },
    { k: 'shape', label: '形状', type: 'select', value: 'radius', options: [
      ['radius', '四角统一圆角'], ['pill', '胶囊 / 圆形'], ['leaf', '叶片形（不对称）'],
      ['triangle', '三角形 clip-path'], ['hexagon', '六边形 clip-path'] ] }
  ],
  run: function (v) {
    var S = Math.max(40, Math.min(400, parseInt(v.size, 10) || 120));
    var r = Math.max(0, Math.min(200, parseInt(v.r, 10) || 16));
    var css = '', style = '';
    if (v.shape === 'pill') css = 'border-radius: ' + (S / 2) + 'px; /* 或 9999px */';
    else if (v.shape === 'leaf') css = 'border-radius: ' + S * 0.5 + 'px ' + r + 'px ' + S * 0.5 + 'px ' + r + 'px;';
    else if (v.shape === 'triangle') css = 'clip-path: polygon(50% 0%, 0% 100%, 100% 100%);';
    else if (v.shape === 'hexagon') css = 'clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);';
    else css = 'border-radius: ' + r + 'px;';
    style = css.replace(/;\s*\/\*[^*]*\*\//, '');
    var full = '.shape {\n  width: ' + S + 'px;\n  height: ' + S + 'px;\n  background: linear-gradient(135deg,#FAE185,#F5C96B);\n  ' + css + '\n}';
    return R(KV([['尺寸', S + ' × ' + S], ['形状', v.shape], ['圆角值', r + ' px']]) +
      '<div style="margin:12px 0;display:flex;justify-content:center"><div style="width:' + S + 'px;height:' + S + 'px;background:linear-gradient(135deg,#FAE185,#F5C96B);' + style + '"></div></div>' +
      SEC('CSS') + PRE(full), full);
  }
});

T({ id: 'favicon', name: '文字 Favicon 生成', cat: 'image',
  desc: '用首字生成圆形或方形 SVG favicon，输出可直接内嵌的 Data URI', tags: 'favicon SVG 图标 首字 data URI 生成',
  fields: [
    { k: 'text', label: '文字（取首字符）', type: 'text', value: '安' },
    { k: 'bg', label: '背景色', type: 'text', value: '#FAE185' },
    { k: 'fg', label: '文字色', type: 'text', value: '#6F5C0F' },
    { k: 'shape', label: '外形', type: 'select', value: 'round', options: [
      ['round', '圆角方形'], ['circle', '圆形'] ] }
  ],
  run: function (v) {
    var ch = String(v.text || 'A').charAt(0);
    var bg = /^#[0-9a-f]{3,6}$/i.test(v.bg) ? v.bg : '#FAE185';
    var fg = /^#[0-9a-f]{3,6}$/i.test(v.fg) ? v.fg : '#6F5C0F';
    var rect = v.shape === 'circle'
      ? '<circle cx="32" cy="32" r="32" fill="' + bg + '"/>'
      : '<rect width="64" height="64" rx="14" fill="' + bg + '"/>';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">' + rect +
      '<text x="32" y="43" text-anchor="middle" font-family="system-ui,sans-serif" font-size="36" font-weight="700" fill="' + fg + '">' + esc(ch) + '</text></svg>';
    var uri = 'data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27');
    var link = '<link rel="icon" href="' + uri + '">';
    return R(KV([['首字符', ch], ['外形', v.shape], ['Data URI 长度', uri.length]]) +
      '<div style="margin:12px 0">' + svg + '</div>' + SEC('SVG') + PRE(svg) + SEC('可直接放入 head') + PRE(link),
      link);
  }
});

/* ============================================================
   七、设备测评（3）
   ============================================================ */

T({ id: 'dataplan', name: '流量套餐余量', cat: 'fun',
  desc: '按已用量与账期剩余天数估算日均可用流量与超量风险', tags: '流量 套餐 余量 日均 超量 计费',
  fields: [
    { k: 'total', label: '套餐总量（GB）', type: 'text', value: '30' },
    { k: 'used', label: '已使用（GB）', type: 'text', value: '18.6' },
    { k: 'days', label: '账期总天数', type: 'text', value: '30' },
    { k: 'left', label: '剩余天数', type: 'text', value: '12' },
    { k: 'speed', label: '超量后限速（Mbps，0 为按量计费）', type: 'text', value: '1' }
  ],
  run: function (v) {
    var total = parseNum(v.total), used = parseNum(v.used);
    var days = Math.max(1, parseNum(v.days, 30)), left = Math.max(0, parseNum(v.left, 0));
    var remain = Math.max(0, total - used);
    var perDay = left > 0 ? remain / left : remain;
    var usedDays = Math.max(1, days - left), avg = used / usedDays;
    var predict = avg * days, over = Math.max(0, predict - total);
    return R(KV([
      ['套餐总量', num(total, 2) + ' GB'], ['已使用', num(used, 2) + ' GB（' + num(total > 0 ? used / total * 100 : 0, 1) + '%）'],
      ['剩余流量', num(remain, 2) + ' GB'], ['剩余天数', left + ' 天'],
      ['剩余日均可用', num(perDay, 2) + ' GB / 天'],
      ['已用日均', num(avg, 2) + ' GB / 天'],
      ['按当前速度预计月用量', num(predict, 2) + ' GB'],
      ['预计超量', num(over, 2) + ' GB'],
      ['风险', over > 0 ? '可能超量，建议降低日均用量' : '按当前节奏不会超量']
    ]) + TB(['阶段', '日均', '合计'], [
      ['已过 ' + usedDays + ' 天', num(avg, 2) + ' GB', num(used, 2) + ' GB'],
      ['剩余 ' + left + ' 天（建议）', num(perDay, 2) + ' GB', num(remain, 2) + ' GB']
    ]) + HINT(parseNum(v.speed) > 0 ? '超量后按 ' + num(parseNum(v.speed), 1) + ' Mbps 限速，不额外计费。' : '超量后按量计费，请注意运营商资费。'),
      '剩余 ' + num(remain, 2) + ' GB，日均可用 ' + num(perDay, 2) + ' GB');
  }
});

T({ id: 'cpubench', name: '设备算力小测', cat: 'fun',
  desc: '在本机跑整数、浮点与字符串混合运算，给出耗时与相对评分', tags: '跑分 性能 CPU 基准 benchmark 耗时',
  fields: [
    { k: 'n', label: '循环次数（万次）', type: 'text', value: '80' },
    { k: 'mode', label: '测试项', type: 'select', value: 'all', options: [
      ['all', '全部三项'], ['int', '整数运算'], ['float', '浮点运算'], ['str', '字符串处理'] ] }
  ],
  run: function (v) {
    var n = Math.max(1, Math.min(400, parseInt(v.n, 10) || 80)) * 10000;
    var items = v.mode === 'all' ? ['int', 'float', 'str'] : [v.mode];
    var rows = [], totalMs = 0, i, t0, x;
    if (items.indexOf('int') >= 0) {
      t0 = Date.now(); x = 1;
      for (i = 0; i < n; i++) x = (x * 1103515245 + 12345 + i) & 0x7fffffff;
      var t1 = Date.now() - t0; totalMs += t1; rows.push(['整数运算', t1 + ' ms', num(n / Math.max(1, t1) / 1000, 2) + ' M/s', String(x)]);
    }
    if (items.indexOf('float') >= 0) {
      t0 = Date.now(); var f = 1.000001;
      for (i = 0; i < n; i++) f = f * 1.0000001 + Math.sqrt(i % 97 + 1) * 0.0000001;
      var t2 = Date.now() - t0; totalMs += t2; rows.push(['浮点运算', t2 + ' ms', num(n / Math.max(1, t2) / 1000, 2) + ' M/s', num(f, 4)]);
    }
    if (items.indexOf('str') >= 0) {
      t0 = Date.now(); var s = '';
      var lim = Math.min(n, 120000);
      for (i = 0; i < lim; i++) s = ('a' + i % 10 + s).slice(0, 24);
      var t3 = Date.now() - t0; totalMs += t3; rows.push(['字符串处理', t3 + ' ms', num(lim / Math.max(1, t3) / 1000, 2) + ' M/s', s.slice(0, 12)]);
    }
    var score = Math.round(100000 / Math.max(1, totalMs) * items.length);
    return R(KV([['循环次数', (n / 10000) + ' 万次'], ['测试项', items.length + ' 项'],
      ['总耗时', totalMs + ' ms'], ['相对评分', score + ' 分（仅本机对比）']]) +
      TB(['项目', '耗时', '吞吐', '校验值'], rows) +
      HINT('评分 = 100000 / 总耗时 × 项数，仅用于同一台设备前后对比，不能跨设备当作绝对性能。'),
      '总耗时 ' + totalMs + ' ms，评分 ' + score);
  }
});

T({ id: 'printcost', name: '打印成本估算', cat: 'fun',
  desc: '按纸张、墨盒与覆盖率估算单页成本与整批打印费用', tags: '打印 成本 墨盒 纸张 单页 耗材',
  fields: [
    { k: 'pages', label: '打印页数', type: 'text', value: '200' },
    { k: 'color', label: '彩色占比（%）', type: 'text', value: '30' },
    { k: 'paper', label: '每包纸价格（元）', type: 'text', value: '25' },
    { k: 'pack', label: '每包张数', type: 'text', value: '500' },
    { k: 'ink', label: '墨盒价格（元）', type: 'text', value: '120' },
    { k: 'yield', label: '墨盒标称页数', type: 'text', value: '300' },
    { k: 'cover', label: '实际覆盖率（相对标称 %）', type: 'text', value: '100' }
  ],
  run: function (v) {
    var p = Math.max(1, parseNum(v.pages, 1)), cr = Math.max(0, Math.min(100, parseNum(v.color)));
    var paperEach = parseNum(v.paper) / Math.max(1, parseNum(v.pack, 500));
    var cov = Math.max(10, parseNum(v.cover, 100)) / 100;
    var inkEach = parseNum(v.ink) / Math.max(1, parseNum(v.yield, 300) / cov);
    var colorExtra = inkEach * 0.6 * cr / 100;
    var bw = paperEach + inkEach, color = bw + colorExtra;
    var total = p * (bw + colorExtra * cr / 100);
    return R(KV([
      ['打印页数', p + ' 页'], ['彩色占比', num(cr, 1) + '%'],
      ['单张纸成本', num(paperEach, 4) + ' 元'], ['单页墨耗', num(inkEach, 4) + ' 元'],
      ['黑白单页成本', num(bw, 4) + ' 元'], ['彩色单页成本', num(color, 4) + ' 元'],
      ['整批合计', fmtMoney(total) + ' 元']
    ]) + TB(['类型', '页数', '单页', '小计'], [
      ['黑白', String(Math.round(p * (1 - cr / 100))), num(bw, 4), fmtMoney(p * (1 - cr / 100) * bw)],
      ['彩色', String(Math.round(p * cr / 100)), num(color, 4), fmtMoney(p * cr / 100 * color)]
    ]) + HINT('覆盖率高于标称会缩短墨盒实际页数；激光打印机可把「墨盒」理解为硒鼓。'),
      '整批合计 ' + fmtMoney(total) + ' 元');
  }
});

/* ============================================================
   八、互动（3）
   ============================================================ */

T({ id: 'trivia', name: '知识问答', cat: 'game',
  desc: '离线题库随机出题，答完自动计分并给出解析', tags: '问答 知识 答题 计分 测验 quiz',
  fields: [
    { k: 'answer', label: '你的答案（A/B/C/D，留空看新题）', type: 'text', value: '' },
    { k: 'cmd', label: '操作', type: 'select', value: 'next', options: [
      ['next', '继续 / 下一题'], ['reset', '重新开始'] ] }
  ],
  run: function (v) {
    var Q = [
      ['太阳系中体积最大的行星是？', ['A 地球', 'B 木星', 'C 土星', 'D 火星'], 'B', '木星的体积约为地球的 1300 倍。'],
      ['HTTP 状态码 404 表示？', ['A 成功', 'B 重定向', 'C 未找到', 'D 服务器错误'], 'C', '404 Not Found 表示请求的资源不存在。'],
      ['1 字节等于多少位？', ['A 4 位', 'B 8 位', 'C 16 位', 'D 32 位'], 'B', '1 byte = 8 bits。'],
      ['水的化学式是？', ['A CO2', 'B H2O2', 'C H2O', 'D NaCl'], 'C', '水由两个氢原子与一个氧原子组成。'],
      ['CSS 中用于弹性布局的值是？', ['A display: grid', 'B display: flex', 'C float: left', 'D position: absolute'], 'B', 'Flexbox 通过 display: flex 启用。'],
      ['农历五月五日通常对应哪个节日？', ['A 春节', 'B 中秋', 'C 端午', 'D 重阳'], 'C', '端午节在农历五月初五。'],
      ['IPv4 地址由多少位组成？', ['A 16 位', 'B 32 位', 'C 64 位', 'D 128 位'], 'B', 'IPv4 为 32 位，IPv6 为 128 位。'],
      ['光在真空中的速度约为？', ['A 3×10⁵ km/s', 'B 3×10⁸ km/s', 'C 340 m/s', 'D 1500 m/s'], 'A', '约 30 万公里每秒，340 m/s 是声速。'],
      ['下列哪个是质数？', ['A 21', 'B 27', 'C 29', 'D 33'], 'C', '29 只能被 1 和自身整除。'],
      ['JSON 中对象的键必须是什么类型？', ['A 数字', 'B 字符串', 'C 布尔', 'D 任意'], 'B', 'JSON 对象的键必须是双引号包裹的字符串。']
    ];
    window.AK_GAMES = window.AK_GAMES || {};
    var g = window.AK_GAMES.trivia;
    if (v.cmd === 'reset' || !g) { g = window.AK_GAMES.trivia = { i: Math.floor(Math.random() * Q.length), score: 0, total: 0, last: '' }; }
    var ans = String(v.answer || '').trim().toUpperCase().charAt(0);
    var feedback = '';
    if (ans && /^[ABCD]$/.test(ans) && g.total >= 0) {
      var q = Q[g.i];
      g.total++;
      if (ans === q[2]) { g.score++; feedback = '回答正确！'; } else feedback = '答错了，正确答案是 ' + q[2] + '。';
      feedback += q[3];
      g.last = feedback;
      g.i = Math.floor(Math.random() * Q.length);
    } else if (ans) feedback = '请输入 A、B、C 或 D。';
    var cur = Q[g.i];
    return R(KV([['得分', g.score + ' / ' + g.total], ['正确率', g.total ? num(g.score / g.total * 100, 1) + '%' : '—'],
      ['题库', Q.length + ' 题']]) + (feedback ? '<div class="hint" style="margin:8px 0">' + esc(feedback) + '</div>' : '') +
      SEC('第 ' + (g.total + 1) + ' 题') + '<div class="card" style="padding:14px"><b>' + esc(cur[0]) + '</b>' +
      '<div style="margin-top:10px;line-height:1.9">' + cur[1].map(function (o) { return esc(o); }).join('<br>') + '</div></div>' +
      HINT('在上方输入答案后点「运行 / 计算」即可判题；选择「重新开始」清空计分。'),
      cur[0] + ' ' + cur[1].join(' '));
  }
});

T({ id: 'hangman', name: '猜单词', cat: 'game',
  desc: '经典猜词游戏，输入一个字母逐步揭开单词，最多 6 次失误', tags: '猜词 hangman 单词 游戏 英语',
  fields: [
    { k: 'guess', label: '输入一个字母（留空开新局）', type: 'text', value: '' },
    { k: 'cmd', label: '操作', type: 'select', value: 'play', options: [
      ['play', '继续猜'], ['reset', '换一个词'] ] }
  ],
  run: function (v) {
    var W = ['TOOLBOX', 'OFFLINE', 'BROWSER', 'KEYBOARD', 'ANDROID', 'PALETTE', 'CALENDAR', 'LANGUAGE', 'GRADIENT', 'NOTEBOOK', 'WEBVIEW', 'UTILITY'];
    window.AK_GAMES = window.AK_GAMES || {};
    var g = window.AK_GAMES.hangman;
    if (v.cmd === 'reset' || !g || (!String(v.guess || '').trim() && !g.started)) {
      g = window.AK_GAMES.hangman = { word: W[Math.floor(Math.random() * W.length)], got: {}, wrong: [], started: true };
    }
    var ch = String(v.guess || '').trim().toUpperCase().charAt(0), msg = '';
    if (ch) {
      if (!/^[A-Z]$/.test(ch)) msg = '请输入单个英文字母。';
      else if (g.got[ch] || g.wrong.indexOf(ch) >= 0) msg = '这个字母已经猜过了。';
      else if (g.word.indexOf(ch) >= 0) { g.got[ch] = 1; msg = '猜中了！包含 ' + ch + '。'; }
      else { g.wrong.push(ch); msg = '没有 ' + ch + '，还剩 ' + (6 - g.wrong.length) + ' 次机会。'; }
    }
    var shown = '', done = true;
    for (var i = 0; i < g.word.length; i++) {
      var c = g.word.charAt(i);
      if (g.got[c]) shown += c + ' '; else { shown += '_ '; done = false; }
    }
    var lost = g.wrong.length >= 6;
    var status = done ? '恭喜，单词是 ' + g.word + '！' : (lost ? '游戏结束，答案是 ' + g.word : '继续猜');
    return R(KV([['单词长度', g.word.length + ' 个字母'], ['已猜中', Object.keys(g.got).length + ' 个'],
      ['错误次数', g.wrong.length + ' / 6'], ['状态', status]]) +
      '<div style="margin:14px 0;text-align:center;font:700 26px/1.6 ui-monospace,Menlo,Consolas,monospace;letter-spacing:2px">' + esc(shown.trim()) + '</div>' +
      (g.wrong.length ? '<div class="hint">错误字母：' + esc(g.wrong.join(' ')) + '</div>' : '') +
      (msg ? '<div class="hint" style="margin-top:8px">' + esc(msg) + '</div>' : '') +
      HINT(done || lost ? '选择「换一个词」开始新的一局。' : '输入一个字母后点「运行 / 计算」。'), shown.trim());
  }
});

T({ id: 'maze', name: '随机迷宫生成', cat: 'game',
  desc: '用深度优先回溯生成迷宫，输出 ASCII 图与可缩放 SVG', tags: '迷宫 随机 生成 DFS 游戏 SVG',
  fields: [
    { k: 'w', label: '宽度（格，奇数）', type: 'text', value: '15' },
    { k: 'h', label: '高度（格，奇数）', type: 'text', value: '15' },
    { k: 'seed', label: '随机种子（0 为随机）', type: 'text', value: '0' }
  ],
  run: function (v) {
    var MW = Math.max(5, Math.min(41, parseInt(v.w, 10) || 15));
    var MH = Math.max(5, Math.min(41, parseInt(v.h, 10) || 15));
    if (MW % 2 === 0) MW++; if (MH % 2 === 0) MH++;
    var seed = parseInt(v.seed, 10) || (Math.floor(Math.random() * 1e9) + 1);
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    var g = [], x, y;
    for (y = 0; y < MH; y++) { g[y] = []; for (x = 0; x < MW; x++) g[y][x] = 1; }
    var stack = [[1, 1]]; g[1][1] = 0;
    var dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];
    while (stack.length) {
      var cur = stack[stack.length - 1];
      var opts = [];
      for (var i = 0; i < 4; i++) {
        var nx = cur[0] + dirs[i][0], ny = cur[1] + dirs[i][1];
        if (nx > 0 && ny > 0 && nx < MW - 1 && ny < MH - 1 && g[ny][nx] === 1) opts.push([nx, ny, cur[0] + dirs[i][0] / 2, cur[1] + dirs[i][1] / 2]);
      }
      if (!opts.length) { stack.pop(); continue; }
      var o = opts[Math.floor(rnd() * opts.length) % opts.length];
      g[o[3]][o[2]] = 0; g[o[1]][o[0]] = 0; stack.push([o[0], o[1]]);
    }
    g[1][0] = 0; g[MH - 2][MW - 1] = 0;
    var ascii = g.map(function (row) { return row.map(function (c) { return c ? '██' : '  '; }).join(''); }).join('\n');
    var cell = 14, sw = MW * cell, sh = MH * cell;
    var rects = '';
    for (y = 0; y < MH; y++) for (x = 0; x < MW; x++) if (g[y][x]) rects += '<rect x="' + x * cell + '" y="' + y * cell + '" width="' + cell + '" height="' + cell + '"/>';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + sw + ' ' + sh + '" width="100%" style="max-width:340px" shape-rendering="crispEdges">' +
      '<rect width="' + sw + '" height="' + sh + '" fill="#FFF8EE"/><g fill="#6F5C0F">' + rects + '</g>' +
      '<circle cx="' + cell + '" cy="' + cell + '" r="' + (cell * 0.3) + '" fill="#E06C5B"/>' +
      '<circle cx="' + (MW - 1) * cell + '" cy="' + (MH - 2) * cell + '" r="' + (cell * 0.3) + '" fill="#5AA469"/></svg>';
    return R(KV([['尺寸', MW + ' × ' + MH + ' 格'], ['种子', seed], ['通道格', g.reduce(function (a, r) { return a + r.filter(function (c) { return !c; }).length; }, 0)]]) +
      '<div style="margin:12px 0;text-align:center">' + svg + '</div>' + SEC('ASCII 迷宫（红点为起点，绿点为终点）') + PRE(ascii), ascii);
  }
});

})();

