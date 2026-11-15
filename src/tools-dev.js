/* ============================================================
   安空工具箱 — 开发者工具 / 计算换算
   ============================================================ */

T({ id: 'json', name: 'JSON 格式化', cat: 'dev', icon: '{}', tint: '#D8F0E4',
  desc: '格式化、压缩、校验、转义 JSON', tags: 'json 格式化 校验 压缩',
  fields: [
    { k: 'text', label: 'JSON 文本', type: 'textarea', rows: 8, placeholder: '{"name":"安空","tools":["json","base64"],"ok":true}' },
    { k: 'mode', label: '操作', type: 'select', options: [
      ['pretty','美化（缩进 2 空格）'],['pretty4','美化（缩进 4 空格）'],['minify','压缩为单行'],
      ['check','仅校验并统计'],['escape','转为 JSON 字符串'],['sort','按键名排序']
    ] }
  ],
  run: function (v) {
    var s = String(v.text || '').trim();
    if (!s) throw new Error('请输入 JSON 文本');
    var obj;
    try { obj = JSON.parse(s); } catch (e) { throw new Error('JSON 解析失败：' + e.message); }
    if (v.mode === 'escape') return JSON.stringify(s);
    if (v.mode === 'minify') return JSON.stringify(obj);
    if (v.mode === 'sort') {
      function sk(o) { if (Array.isArray(o)) return o.map(sk);
        if (o && typeof o === 'object') { var r = {}; Object.keys(o).sort().forEach(function (k) { r[k] = sk(o[k]); }); return r; } return o; }
      return JSON.stringify(sk(obj), null, 2);
    }
    if (v.mode === 'check') {
      var keys = [], count = 0;
      (function walk(o) { if (Array.isArray(o)) o.forEach(walk);
        else if (o && typeof o === 'object') Object.keys(o).forEach(function (k) { keys.push(k); count++; walk(o[k]); }); })(obj);
      return H.kv([['状态', '✓ 合法 JSON'], ['根节点类型', Array.isArray(obj) ? 'Array' : typeof obj],
        ['顶层元素数', Array.isArray(obj) ? String(obj.length) : String(Object.keys(obj).length)],
        ['对象属性总数', String(count)], ['序列化长度', String(JSON.stringify(obj).length) + ' 字符'],
        ['字段名', H.esc(Array.from(new Set(keys)).slice(0, 20).join(', ') || '—')]], '校验结果');
    }
    return JSON.stringify(obj, null, v.mode === 'pretty4' ? 4 : 2);
  }
});

T({ id: 'xml', name: 'XML 格式化', cat: 'dev', icon: '🏷️', tint: '#D8F0E4',
  desc: '缩进美化 / 压缩 XML 与 HTML 片段', tags: 'xml 格式化 html 美化',
  fields: [
    { k: 'text', label: 'XML / HTML', type: 'textarea', rows: 7, placeholder: '<root><item id="1">安空</item></root>' },
    { k: 'mode', label: '操作', type: 'select', options: [['pretty','美化缩进'],['minify','压缩'],['esc','转义为文本']] }
  ],
  run: function (v) {
    var s = String(v.text || '').trim();
    if (!s) throw new Error('请输入内容');
    if (v.mode === 'esc') return H.esc(s);
    if (v.mode === 'minify') return s.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
    var out = [], depth = 0, parts = s.replace(/>\s+</g, '><').split(/(<[^>]+>)/).filter(Boolean);
    parts.forEach(function (p) {
      if (/^<\//.test(p)) depth = Math.max(0, depth - 1);
      if (p.indexOf('<') !== 0 && !p.trim()) return;
      out.push('  '.repeat(depth) + p);
      if (/^<[^/!?][^>]*[^/]>$/.test(p) && !/^<(br|hr|img|input|meta|link)/i.test(p)) depth++;
    });
    return out.join('\n');
  }
});

T({ id: 'timestamp', name: '时间戳转换', cat: 'dev', icon: '⏱️', tint: '#D8F0E4',
  desc: 'Unix 时间戳与日期时间互转', tags: '时间戳 unix timestamp 日期',
  fields: [
    { k: 'val', label: '时间戳 / 日期时间', type: 'text', placeholder: '留空则显示当前时间' },
    { k: 'mode', label: '操作', type: 'select', options: [
      ['now','当前时间总览'],['toDate','时间戳 → 日期'],['toTs','日期 → 时间戳'],['ms','毫秒 → 秒']
    ] },
    { k: 'unit', label: '时间戳单位', type: 'select', options: [['auto','自动判断'],['s','秒'],['ms','毫秒']] }
  ],
  auto: true,
  run: function (v) {
    var val = String(v.val || '').trim();
    if (v.mode === 'ms') {
      var n = parseFloat(val); if (!isFinite(n)) throw new Error('请输入毫秒时间戳');
      return H.kv([['毫秒', String(n)], ['秒', String(n / 1000)], ['对应日期', H.fmtDate(new Date(n))]], '换算结果');
    }
    var d;
    if (v.mode === 'toTs') {
      if (!val) throw new Error('请输入日期，例如 2026-01-01 12:00:00');
      d = new Date(val.replace(/-/g, '/'));
      if (isNaN(d.getTime())) throw new Error('日期格式无法识别，试试 2026-01-01 12:00:00');
      return H.kv([['本地时间', H.fmtDate(d)], ['秒级时间戳', String(Math.floor(d.getTime()/1000))],
        ['毫秒时间戳', String(d.getTime())], ['UTC', d.toUTCString()], ['ISO', d.toISOString()]], '转换结果');
    }
    if (v.mode === 'toDate') {
      if (!val) throw new Error('请输入时间戳');
      var num = parseFloat(val); if (!isFinite(num)) throw new Error('时间戳必须是数字');
      var ms = v.unit === 's' ? num * 1000 : v.unit === 'ms' ? num : (String(Math.trunc(num)).length <= 10 ? num * 1000 : num);
      d = new Date(ms);
      if (isNaN(d.getTime())) throw new Error('时间戳超出有效范围');
      return H.kv([['本地时间', H.fmtDate(d)], ['UTC 时间', d.toUTCString()], ['ISO 8601', d.toISOString()],
        ['秒级', String(Math.floor(ms/1000))], ['毫秒级', String(ms)],
        ['星期', ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()]]], '转换结果');
    }
    d = val ? new Date(parseFloat(val) * (v.unit === 'ms' || String(Math.trunc(parseFloat(val))).length > 10 ? 1 : 1000)) : new Date();
    if (isNaN(d.getTime())) throw new Error('时间值无效');
    return H.kv([
      ['本地时间', H.fmtDate(d)], ['秒级时间戳', String(Math.floor(d.getTime()/1000))],
      ['毫秒时间戳', String(d.getTime())], ['UTC', d.toUTCString()], ['ISO 8601', d.toISOString()],
      ['时区偏移', 'UTC' + (d.getTimezoneOffset() > 0 ? '-' : '+') + Math.abs(d.getTimezoneOffset()/60)],
      ['年内第几天', String(Math.floor((d - new Date(d.getFullYear(),0,0)) / 86400000))]
    ], val ? '时间总览' : '此刻的时间');
  }
});

T({ id: 'uuid', name: 'UUID 生成', cat: 'dev', icon: '🆔', tint: '#D8F0E4',
  desc: '批量生成 UUID v4 / 短 ID', tags: 'uuid guid 随机 唯一id',
  fields: [
    { k: 'count', label: '生成数量', type: 'number', value: '5' },
    { k: 'type', label: '类型', type: 'select', options: [['v4','UUID v4（标准）'],['nohyphen','UUID v4（无横线）'],['upper','UUID v4（大写）'],['short','短 ID（16 位）'],['hex','随机十六进制（32 位）']] }
  ],
  run: function (v) {
    var n = Math.min(100, Math.max(1, parseInt(v.count, 10) || 1)), out = [];
    function rnd(len) { var a = new Uint8Array(len); (crypto.getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.random()*256; })); return a; }
    for (var i = 0; i < n; i++) {
      var b = rnd(16);
      b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
      var h = H.bytesToHex(Array.prototype.slice.call(b));
      var u = h.slice(0,8) + '-' + h.slice(8,12) + '-' + h.slice(12,16) + '-' + h.slice(16,20) + '-' + h.slice(20);
      if (v.type === 'nohyphen') out.push(h);
      else if (v.type === 'upper') out.push(u.toUpperCase());
      else if (v.type === 'short') out.push(h.slice(0, 16));
      else if (v.type === 'hex') out.push(h);
      else out.push(u);
    }
    return out.join('\n');
  }
});

T({ id: 'base', name: '进制转换', cat: 'dev', icon: '🔟', tint: '#D8F0E4',
  desc: '2~36 进制互转，支持超长整数', tags: '进制 二进制 十六进制 转换',
  fields: [
    { k: 'val', label: '数值', type: 'text', placeholder: '例如 FF 或 101010 或 12345678901234567890' },
    { k: 'from', label: '源进制', type: 'select', value: '10', options: [2,8,10,16,32,36].map(function (r) { return [String(r), r + ' 进制']; }) },
    { k: 'to', label: '目标进制', type: 'select', value: '16', options: [2,8,10,16,32,36].map(function (r) { return [String(r), r + ' 进制']; }) }
  ],
  run: function (v) {
    var s = String(v.val || '').trim().replace(/^0[xXbBoO]/, '').replace(/\s/g, '');
    if (!s) throw new Error('请输入数值');
    var from = parseInt(v.from, 10), to = parseInt(v.to, 10);
    var digits = '0123456789abcdefghijklmnopqrstuvwxyz';
    var neg = s[0] === '-'; if (neg) s = s.slice(1);
    for (var i = 0; i < s.length; i++) {
      var d = digits.indexOf(s[i].toLowerCase());
      if (d < 0 || d >= from) throw new Error('字符「' + s[i] + '」不属于 ' + from + ' 进制');
    }
    var n = 0n;
    try { for (i = 0; i < s.length; i++) n = n * BigInt(from) + BigInt(digits.indexOf(s[i].toLowerCase())); }
    catch (e) { throw new Error('数值过大，无法计算'); }
    if (neg) n = -n;
    var res = n.toString(to);
    var rows = [['输入', v.val + '（' + from + ' 进制）'], ['结果 (' + to + ' 进制)', res.toUpperCase()]];
    [2,8,10,16].forEach(function (r) { if (r !== to && r !== from) rows.push([r + ' 进制', n.toString(r).toUpperCase()]); });
    return H.kv(rows, '转换结果');
  }
});

T({ id: 'jwt', name: 'JWT 解析', cat: 'dev', icon: '🎫', tint: '#D8F0E4',
  desc: '解出 Header / Payload 与过期时间', tags: 'jwt token 解析 过期',
  note: '仅解码查看内容，不校验签名，请勿用于鉴权判断。',
  fields: [{ k: 'token', label: 'JWT Token', type: 'textarea', rows: 5, placeholder: 'eyJhbGciOi... . eyJzdWIiOi... . signature' }],
  run: function (v) {
    var t = String(v.token || '').trim().replace(/\s/g, '');
    var p = t.split('.');
    if (p.length !== 3) throw new Error('JWT 应由 3 段组成（header.payload.signature）');
    function dec(x) { return H.b64dec(x.replace(/-/g,'+').replace(/_/g,'/') + '==='.slice((x.length + 3) % 4)); }
    var h, pl;
    try { h = JSON.parse(dec(p[0])); pl = JSON.parse(dec(p[1])); } catch (e) { throw new Error('Base64 解码失败：' + e.message); }
    var rows = [['算法 alg', H.esc(h.alg || '—')], ['类型 typ', H.esc(h.typ || '—')]];
    Object.keys(pl).forEach(function (k) {
      var val = pl[k];
      if (/^(exp|iat|nbf)$/.test(k) && typeof val === 'number') val = H.fmtDate(new Date(val*1000)) + '（' + val + '）';
      rows.push([k, H.esc(typeof val === 'object' ? JSON.stringify(val) : String(val))]);
    });
    if (pl.exp) rows.push(['过期状态', Date.now() > pl.exp*1000 ? '已过期' : '✓ 未过期']);
    return { html: H.kv(rows, 'Header / Payload') +
      '<div style="font-weight:700;margin:14px 0 6px">Header</div><div>' + H.esc(JSON.stringify(h, null, 2)) + '</div>' +
      '<div style="font-weight:700;margin:14px 0 6px">Payload</div><div>' + H.esc(JSON.stringify(pl, null, 2)) + '</div>',
      text: 'Header:\n' + JSON.stringify(h, null, 2) + '\n\nPayload:\n' + JSON.stringify(pl, null, 2) };
  }
});

T({ id: 'urlparse', name: 'URL 解析', cat: 'dev', icon: '🧭', tint: '#D8F0E4',
  desc: '拆解 URL 各组成部分与查询参数', tags: 'url 解析 参数 query',
  fields: [{ k: 'url', label: '完整 URL', type: 'textarea', rows: 3, placeholder: 'https://example.com:8080/path/a?x=1&y=安空#top' }],
  run: function (v) {
    var s = String(v.url || '').trim();
    if (!s) throw new Error('请输入 URL');
    var u;
    try { u = new URL(s); } catch (e) { throw new Error('URL 格式错误：' + e.message); }
    var params = [];
    u.searchParams.forEach(function (val, key) { params.push([key, val]); });
    var rows = [['完整 URL', H.esc(u.href)], ['协议', u.protocol], ['主机', H.esc(u.host)],
      ['主机名', H.esc(u.hostname)], ['端口', u.port || '默认'], ['路径', H.esc(u.pathname)],
      ['查询串', H.esc(u.search || '(无)')], ['片段', H.esc(u.hash || '(无)')],
      ['来源 origin', H.esc(u.origin)], ['参数个数', String(params.length)]];
    var html = H.kv(rows, '组成');
    if (params.length) html += '<div style="font-weight:700;margin:14px 0 6px">查询参数</div>' +
      H.kv(params.map(function (p) { return [H.esc(p[0]), H.esc(p[1])]; }));
    return { html: html, text: rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') +
      (params.length ? '\n\n参数：\n' + params.map(function (p) { return p[0] + '=' + p[1]; }).join('\n') : '') };
  }
});

T({ id: 'ua', name: 'UA / 设备识别', cat: 'dev', icon: '🖥️', tint: '#D8F0E4',
  desc: '解析浏览器、系统、设备与渲染引擎', tags: 'useragent ua 浏览器 识别',
  fields: [{ k: 'ua', label: 'User-Agent', type: 'textarea', rows: 3, value: navigator.userAgent }],
  run: function (v) {
    var s = String(v.ua || navigator.userAgent);
    var browsers = [[/Edg\/([\d.]+)/,'Edge'],[/OPR\/([\d.]+)/,'Opera'],[/Firefox\/([\d.]+)/,'Firefox'],
      [/Chrome\/([\d.]+)/,'Chrome'],[/Version\/([\d.]+).*Safari/,'Safari'],[/MicroMessenger\/([\d.]+)/,'微信内置浏览器'],
      [/MiuiBrowser\/([\d.]+)/,'小米浏览器'],[/UCBrowser\/([\d.]+)/,'UC 浏览器']];
    var oses = [[/Android\s([\d.]+)/,'Android'],[/iPhone OS ([\d_]+)/,'iOS'],[/Windows NT 10.0/,'Windows 10/11'],
      [/Windows NT 6.1/,'Windows 7'],[/Mac OS X ([\d_]+)/,'macOS'],[/Linux/,'Linux'],[/HarmonyOS/,'HarmonyOS']];
    var b = '未知', o = '未知', ver = '';
    browsers.some(function (x) { var m = s.match(x[0]); if (m) { b = x[1]; ver = m[1] || ''; return true; } return false; });
    oses.some(function (x) { var m = s.match(x[0]); if (m) { o = x[1] + (m[1] ? ' ' + m[1].replace(/_/g,'.') : ''); return true; } return false; });
    var engine = /AppleWebKit/.test(s) ? 'WebKit/Blink' : /Gecko/.test(s) ? 'Gecko' : /Trident/.test(s) ? 'Trident' : '未知';
    var mobile = /Mobile|Android|iPhone|iPad/.test(s);
    return H.kv([['浏览器', b + (ver ? ' ' + ver : '')], ['操作系统', o],
      ['渲染引擎', engine], ['设备类型', mobile ? '移动设备' : '桌面设备'],
      ['WebView', /; wv\)|Version\/.*Chrome/.test(s) ? '可能是 WebView' : '否 / 无法判断'],
      ['语言', navigator.language || '—'], ['是否触屏', ('ontouchstart' in window) ? '支持' : '不支持'],
      ['原始 UA', '<span style="font-size:11px">' + H.esc(s) + '</span>']], '识别结果');
  }
});

T({ id: 'ascii', name: 'ASCII 与字符', cat: 'dev', icon: '🔡', tint: '#D8F0E4',
  desc: '字符与编码互转，附常用 ASCII 表', tags: 'ascii 编码 字符 码点',
  fields: [
    { k: 'val', label: '字符 / 码点', type: 'text', placeholder: '输入 A，或 65，或 65 66 67' },
    { k: 'mode', label: '操作', type: 'select', options: [['toCode','字符 → 码点'],['fromCode','码点 → 字符'],['table','显示 ASCII 可打印字符表']] }
  ],
  run: function (v) {
    if (v.mode === 'table') {
      var rows = [];
      for (var i = 32; i < 128; i += 4) {
        rows.push('<tr>' + [0,1,2,3].map(function (j) {
          var c = i + j; if (c > 127) return '<td></td>';
          return '<td>' + c + ' : <b>' + H.esc(String.fromCharCode(c)) + '</b></td>';
        }).join('') + '</tr>');
      }
      return { html: '<div style="font-weight:700;margin-bottom:8px">可打印 ASCII（32–127）</div>' +
        '<table><tbody>' + rows.join('') + '</tbody></table>', text: Array.from({length:96}, function (_,k) { return (k+32) + ' ' + String.fromCharCode(k+32); }).join('\n') };
    }
    var s = String(v.val || '').trim();
    if (!s) throw new Error('请输入内容');
    if (v.mode === 'fromCode') {
      var ns = s.split(/[\s,]+/).filter(Boolean).map(Number);
      if (ns.some(function (n) { return !isFinite(n); })) throw new Error('码点必须是数字，可用空格分隔');
      return ns.map(function (n) { return String.fromCodePoint(n); }).join('');
    }
    return Array.from(s).map(function (c) { return c === ' ' ? '(空格) 32' : c + '  ' + c.codePointAt(0) + '  0x' + c.codePointAt(0).toString(16).toUpperCase(); }).join('\n');
  }
});

T({ id: 'cron', name: 'Cron 表达式速查', cat: 'dev', icon: '⏰', tint: '#D8F0E4',
  desc: '常用 Cron 表达式与字段说明', tags: 'cron 定时任务 表达式',
  fields: [{ k: 'expr', label: '表达式（可选，做基础校验）', type: 'text', placeholder: '0 2 * * *' }],
  auto: true, copyable: false,
  run: function (v) {
    var expr = String(v.expr || '').trim(), check = '';
    if (expr) {
      var parts = expr.split(/\s+/);
      check = parts.length === 5 || parts.length === 6
        ? '✓ 字段数 ' + parts.length + '（' + (parts.length === 5 ? '分 时 日 月 周' : '秒 分 时 日 月 周') + '），格式基本正确'
        : '⚠️ 通常应为 5 或 6 个字段，当前 ' + parts.length + ' 个';
    }
    var examples = [['0 * * * *','每小时整点'],['*/5 * * * *','每 5 分钟'],['0 2 * * *','每天凌晨 2 点'],
      ['0 9 * * 1-5','工作日每天 9 点'],['30 8 * * 1','每周一 8:30'],['0 0 1 * *','每月 1 日零点'],
      ['0 0 * * 0','每周日零点'],['0 0 1 1 *','每年元旦'],['0 */2 * * *','每 2 小时'],['0 18 * * 1-5','工作日 18 点']];
    return { html: (check ? '<div class="note"><b>校验</b>' + H.esc(check) + '</div>' : '') +
      '<div style="font-weight:700;margin-bottom:8px">常用表达式</div>' +
      H.kv(examples.map(function (e) { return ['<code>' + H.esc(e[0]) + '</code>', H.esc(e[1])]; })) +
      '<div style="font-weight:700;margin:14px 0 6px">字段含义</div>' + H.kv([
        ['*','任意值'],[',','列举多个值'],['-','范围'],['/','步长'],['?','不指定（部分实现支持）'],
        ['周','0/7=周日，1–6=周一至周六']
      ]), text: examples.map(function (e) { return e[0] + '  ' + e[1]; }).join('\n') };
  }
});

T({ id: 'minify', name: '代码压缩', cat: 'dev', icon: '📦', tint: '#D8F0E4',
  desc: '压缩 CSS / JSON，移除注释与多余空白', tags: '压缩 minify css 代码',
  fields: [
    { k: 'text', label: '代码', type: 'textarea', rows: 8, placeholder: '粘贴 CSS 或 JSON 代码' },
    { k: 'lang', label: '类型', type: 'select', options: [['css','CSS'],['json','JSON'],['html','HTML（保守）']] }
  ],
  run: function (v) {
    var s = String(v.text || '');
    if (!s.trim()) throw new Error('请输入代码');
    if (v.lang === 'json') { try { return JSON.stringify(JSON.parse(s)); } catch (e) { throw new Error('JSON 无效：' + e.message); } }
    if (v.lang === 'html') return s.replace(/<!--(?!\[if)[\s\S]*?-->/g, '').replace(/>\s+</g, '><').replace(/\n\s*\n/g, '\n').trim();
    return s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*([{}:;,>~+])\s*/g, '$1')
      .replace(/;}/g, '}').replace(/\s+/g, ' ').trim();
  }
});

/* ==================== 计算换算 ==================== */

var UNITS = {
  '长度': { m:1, km:1000, cm:0.01, mm:0.001, 'μm':1e-6, nm:1e-9, '里':500, '丈':10/3, '尺':1/3, '寸':1/30, '英里':1609.344, '英尺':0.3048, '英寸':0.0254, '码':0.9144, '海里':1852 },
  '重量': { kg:1, g:0.001, mg:1e-6, t:1000, '斤':0.5, '两':0.05, '钱':0.005, '磅':0.45359237, '盎司':0.0283495231, '克拉':0.0002 },
  '面积': { 'm²':1, 'km²':1e6, 'cm²':1e-4, '公顷':10000, '亩':666.6667, '平方尺':1/9, '英亩':4046.856, '平方英尺':0.092903, '平方英里':2.58999e6 },
  '体积': { 'L':1, 'mL':0.001, 'm³':1000, 'cm³':0.001, '加仑(美)':3.785412, '加仑(英)':4.546092, '品脱':0.473176, '杯':0.236588 },
  '时间': { '秒':1, '毫秒':0.001, '分钟':60, '小时':3600, '天':86400, '周':604800, '月(30天)':2592000, '年(365天)':31536000 },
  '数据': { B:1, KB:1024, MB:1048576, GB:1073741824, TB:1099511627776, bit:0.125, Kb:128, Mb:131072, Gb:134217728 },
  '速度': { 'm/s':1, 'km/h':1/3.6, 'mph':0.44704, '节':0.514444, '马赫(340m/s)':340, 'ft/s':0.3048 },
  '温度': { '__special__':true },
  '压力': { Pa:1, kPa:1000, MPa:1e6, bar:1e5, atm:101325, mmHg:133.322, psi:6894.757 }
};
function convertTemp(val, from, to) {
  var c;
  if (from === '°C') c = val;
  else if (from === '°F') c = (val - 32) * 5/9;
  else if (from === 'K') c = val - 273.15;
  else if (from === '°R') c = (val - 491.67) * 5/9;
  else c = val;
  return to === '°C' ? c : to === '°F' ? c*9/5 + 32 : to === 'K' ? c + 273.15 : to === '°R' ? (c + 273.15)*9/5 : c;
}
T({ id: 'unit', name: '单位换算', cat: 'calc', icon: '📐', tint: '#FFF0C7',
  desc: '长度 / 重量 / 面积 / 温度 / 数据等换算', tags: '单位 换算 长度 重量 温度',
  fields: [
    { k: 'val', label: '数值', type: 'number', value: '1' },
    { k: 'type', label: '类别', type: 'select', value: '长度', options: Object.keys(UNITS).map(function (k) { return [k, k]; }) },
    { k: 'from', label: '从', type: 'select', options: Object.keys(UNITS['长度']).map(function (k) { return [k,k]; }) },
    { k: 'to', label: '到', type: 'select', options: Object.keys(UNITS['长度']).slice(0,4).map(function (k) { return [k,k]; }) }
  ],
  onChange: function (k, val, api) {
    if (k !== 'type') return false;
    var host = api.host(); if (!host) return false;
    var keys = val === '温度' ? ['°C','°F','K','°R'] : Object.keys(UNITS[val] || UNITS['长度']);
    ['from','to'].forEach(function (name) {
      var sel = host.querySelector('[data-k="' + name + '"]');
      if (sel) sel.innerHTML = keys.map(function (x) { return '<option value="' + H.esc(x) + '">' + H.esc(x) + '</option>'; }).join('');
    });
    var f = host.querySelector('[data-k="from"]'), t2 = host.querySelector('[data-k="to"]');
    if (f) f.value = keys[0];
    if (t2) t2.value = keys[1] || keys[0];
    return true;
  },
  run: function (v) {
    var x = parseFloat(v.val);
    if (!isFinite(x)) throw new Error('请输入有效数值');
    if (v.type === '温度') {
      var tf = ['°C','°F','K','°R'];
      var r = convertTemp(x, v.from && tf.indexOf(v.from) >= 0 ? v.from : '°C', v.to && tf.indexOf(v.to) >= 0 ? v.to : '°F');
      return H.kv([['输入', x + ' °C'], ['换算结果', H.num(r, 6) + ' °F'], ['开尔文', H.num(x + 273.15, 2) + ' K']], '温度换算');
    }
    var table = UNITS[v.type] || UNITS['长度'];
    var f = table[v.from], t = table[v.to];
    if (f == null || t == null) {
      // 用户切换类别后下拉未同步时，用该类别前两个单位兜底
      var keys = Object.keys(table); f = table[keys[0]]; t = table[keys[1]];
      v.from = keys[0]; v.to = keys[1];
    }
    var res = x * f / t;
    return { html: '<div style="text-align:center;padding:8px 0 14px"><div style="font-size:28px;font-weight:700;color:var(--primary)">' +
      H.num(res, 8) + '</div><div style="font-size:12px;color:var(--on-surface-variant)">' + H.esc(v.to) + '</div></div>' +
      H.kv([['换算式', H.num(x,4) + ' ' + H.esc(v.from) + ' = ' + H.num(res,8) + ' ' + H.esc(v.to)],
        ['基准比', '1 ' + H.esc(v.from) + ' = ' + H.num(f/t, 8) + ' ' + H.esc(v.to)]]),
      text: x + ' ' + v.from + ' = ' + H.num(res, 8) + ' ' + v.to };
  }
});

T({ id: 'science', name: '科学计算', cat: 'calc', icon: '🧪', tint: '#FFF0C7',
  desc: '表达式求值，支持函数、括号与幂运算', tags: '计算器 表达式 科学 函数',
  note: '支持 + - * / % ^ 括号，函数 sin cos tan sqrt abs log ln log10 exp floor ceil round sign，常量 PI E。不使用 eval。',
  fields: [{ k: 'expr', label: '表达式', type: 'text', placeholder: 'sqrt(2) * 10 + PI ^ 2' }],
  run: function (v) {
    var r = H.evalExpr(v.expr);
    return H.kv([['表达式', H.esc(v.expr)], ['结果', '<b style="font-size:18px;color:var(--primary)">' + H.num(r, 10) + '</b>'],
      ['取整', String(Math.round(r))], ['科学计数', r.toExponential(6)]], '计算结果');
  }
});

T({ id: 'bmi', name: 'BMI 健康计算', cat: 'calc', icon: '⚖️', tint: '#FFF0C7',
  desc: '计算 BMI、标准体重与建议范围', tags: 'bmi 体重 健康 身高',
  fields: [
    { k: 'h', label: '身高 (cm)', type: 'number', value: '170' },
    { k: 'w', label: '体重 (kg)', type: 'number', value: '65' },
    { k: 'age', label: '年龄', type: 'number', value: '25' },
    { k: 'sex', label: '性别', type: 'select', options: [['male','男'],['female','女']] }
  ],
  run: function (v) {
    var h = parseFloat(v.h)/100, w = parseFloat(v.w);
    if (!isFinite(h) || h <= 0.3 || h > 3 || !isFinite(w) || w <= 0) throw new Error('请输入合理的身高与体重');
    var bmi = w/(h*h);
    var cat = bmi < 18.5 ? '偏瘦' : bmi < 24 ? '正常' : bmi < 28 ? '超重' : '肥胖';
    var lo = 18.5*h*h, hi = 23.9*h*h;
    var bmr = 10*w + 6.25*(h*100) - 5*(parseFloat(v.age)||25) + (v.sex === 'male' ? 5 : -161);
    return H.kv([['BMI', '<b style="font-size:18px;color:var(--primary)">' + bmi.toFixed(2) + '</b>'],
      ['体型判定', cat + '（中国成人标准）'], ['健康体重范围', lo.toFixed(1) + ' ~ ' + hi.toFixed(1) + ' kg'],
      ['体重建议', bmi < 18.5 ? '建议适当增重' : bmi < 24 ? '保持得很好' : '建议适当减重'],
      ['基础代谢 (估算)', Math.round(bmr) + ' kcal/天'], ['每日总消耗 (轻活动)', Math.round(bmr*1.375) + ' kcal/天']], '健康评估');
  }
});

T({ id: 'loan', name: '房贷计算', cat: 'calc', icon: '🏠', tint: '#FFF0C7',
  desc: '等额本息 / 等额本金还款测算', tags: '房贷 贷款 月供 利息',
  fields: [
    { k: 'amount', label: '贷款金额 (万元)', type: 'number', value: '100' },
    { k: 'rate', label: '年利率 (%)', type: 'number', value: '3.5' },
    { k: 'years', label: '贷款年限', type: 'number', value: '30' },
    { k: 'mode', label: '还款方式', type: 'select', options: [['equal','等额本息'],['principal','等额本金'],['both','两种方式对比']] }
  ],
  run: function (v) {
    var P = parseFloat(v.amount)*10000, ar = parseFloat(v.rate)/100, n = parseInt(v.years,10)*12;
    if (!isFinite(P) || P <= 0 || !isFinite(ar) || ar < 0 || !isFinite(n) || n <= 0) throw new Error('请输入有效的金额、利率和年限');
    var r = ar/12;
    function equal() {
      var pay = r === 0 ? P/n : P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1);
      return { monthly: pay, total: pay*n, interest: pay*n - P };
    }
    function principal() {
      var first = P/n + P*r, last = P/n + (P/n)*r, total = 0;
      for (var i = 0; i < n; i++) total += P/n + (P - P*i/n)*r;
      return { monthly: first, first: first, last: last, total: total, interest: total - P };
    }
    var e = equal(), p = principal();
    function money(x) { return '¥' + x.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
    if (v.mode === 'equal') return H.kv([['每月月供', money(e.monthly)], ['还款总额', money(e.total)],
      ['支付利息', money(e.interest)], ['还款月数', n + ' 期'], ['贷款本金', money(P)]], '等额本息');
    if (v.mode === 'principal') return H.kv([['首月月供', money(p.first)], ['末月月供', money(p.last)],
      ['每月递减', money(P/n*r)], ['还款总额', money(p.total)], ['支付利息', money(p.interest)]], '等额本金');
    return { html: '<div style="font-weight:700;margin-bottom:8px">两种方式对比</div>' + H.table(['项目','等额本息','等额本金'], [
      ['月供', money(e.monthly) + '（固定）', money(p.first) + ' → ' + money(p.last)],
      ['还款总额', money(e.total), money(p.total)], ['支付利息', money(e.interest), money(p.interest)],
      ['利息差额', '—', '省 ' + money(e.interest - p.interest)]
    ]), text: '等额本息：月供 ' + money(e.monthly) + '，总利息 ' + money(e.interest) +
      '\n等额本金：首月 ' + money(p.first) + '，总利息 ' + money(p.interest) };
  }
});

var TAX_BRACKETS = [[36000,.03,0],[144000,.1,2520],[300000,.2,16920],[420000,.25,31920],
  [660000,.3,52920],[960000,.35,85920],[Infinity,.45,181920]];
var TAX_DEDUCT = [['子女教育',2000],['继续教育',400],['大病医疗',0],['住房贷款利息',1000],
  ['住房租金',1500],['赡养老人',3000],['3岁以下婴幼儿照护',2000]];
T({ id: 'tax', name: '个税计算', cat: 'calc', icon: '🧾', tint: '#FFF0C7',
  desc: '按月度累计预扣法估算工资个税', tags: '个税 工资 税后 五险一金',
  note: '按现行综合所得累进预扣率估算，起征点 5000 元/月；实际以税务部门口径与专项附加扣除核定为准。',
  fields: [
    { k: 'salary', label: '税前月薪 (元)', type: 'number', value: '15000' },
    { k: 'social', label: '五险一金个人部分 (元/月)', type: 'number', value: '2000' },
    { k: 'special', label: '专项附加扣除合计 (元/月)', type: 'number', value: '0' }
  ],
  run: function (v) {
    var s = parseFloat(v.salary), soc = parseFloat(v.social)||0, sp = parseFloat(v.special)||0;
    if (!isFinite(s) || s < 0) throw new Error('请输入有效的月薪');
    var taxableYear = Math.max(0, (s - soc - sp - 5000) * 12);
    var rate = 0, quick = 0;
    for (var i = 0; i < TAX_BRACKETS.length; i++) if (taxableYear <= TAX_BRACKETS[i][0]) { rate = TAX_BRACKETS[i][1]; quick = TAX_BRACKETS[i][2]; break; }
    var taxYear = Math.max(0, taxableYear*rate - quick);
    var after = s - soc - taxYear/12;
    var rows = [['税前月薪', '¥' + s.toFixed(2)], ['五险一金', '¥' + soc.toFixed(2)],
      ['专项附加扣除', '¥' + sp.toFixed(2)], ['起征点', '¥5000.00'],
      ['年度应纳税所得额', '¥' + taxableYear.toFixed(2)], ['适用预扣率', (rate*100).toFixed(0) + '%（速算扣除 ' + quick + '）'],
      ['全年预计个税', '¥' + taxYear.toFixed(2)], ['平均每月个税', '¥' + (taxYear/12).toFixed(2)],
      ['<b>税后月薪</b>', '<b style="color:var(--primary)">¥' + after.toFixed(2) + '</b>']];
    var html = H.kv(rows, '估算结果') + '<div style="font-weight:700;margin:14px 0 6px">专项附加扣除标准（元/月）</div>' +
      H.kv(TAX_DEDUCT.map(function (d) { return [d[0], d[1] ? '¥' + d[1] : '按实际发生额（限额内）']; }));
    return { html: html, text: '税后月薪约 ¥' + after.toFixed(2) + '，全年个税约 ¥' + taxYear.toFixed(2) };
  }
});

T({ id: 'percent', name: '百分比计算', cat: 'calc', icon: '💹', tint: '#FFF0C7',
  desc: '占比、增减、折扣与反向求原值', tags: '百分比 折扣 增长率 计算',
  fields: [
    { k: 'a', label: '数值 A', type: 'number', value: '80' },
    { k: 'b', label: '数值 B', type: 'number', value: '100' },
    { k: 'p', label: '百分比 / 折扣', type: 'number', value: '20' },
    { k: 'mode', label: '计算类型', type: 'select', options: [
      ['ratio','A 占 B 的百分之几'],['of','B 的 p% 是多少'],['add','B 增加 p% 后'],['sub','B 减少 p% 后'],
      ['change','从 A 到 B 的变化率'],['discount','原价 B 打 p 折后'],['reverse','已知 A 是 B 的 p%，求 B']
    ] }
  ],
  run: function (v) {
    var a = parseFloat(v.a), b = parseFloat(v.b), p = parseFloat(v.p);
    var r, label = '';
    switch (v.mode) {
      case 'ratio': if (!b) throw new Error('B 不能为 0'); r = a/b*100; label = 'A 占 B'; break;
      case 'of': r = b*p/100; label = 'B 的 p%'; break;
      case 'add': r = b*(1+p/100); label = 'B 增加 p%'; break;
      case 'sub': r = b*(1-p/100); label = 'B 减少 p%'; break;
      case 'change': if (!a) throw new Error('A 不能为 0'); r = (b-a)/a*100; label = '变化率'; break;
      case 'discount': r = b*p/10; label = '折后价'; break;
      case 'reverse': if (!p) throw new Error('p 不能为 0'); r = a/(p/100); label = '原值 B'; break;
      default: r = 0;
    }
    var unit = /ratio|change/.test(v.mode) ? '%' : /discount|of|add|sub|reverse/.test(v.mode) ? '' : '%';
    return H.kv([['计算类型', label], ['<b>结果</b>', '<b style="font-size:18px;color:var(--primary)">' + H.num(r, 4) + unit + '</b>'],
      ['输入', 'A=' + a + '  B=' + b + '  p=' + p]], '计算结果');
  }
});

T({ id: 'datediff', name: '日期间隔', cat: 'calc', icon: '🗓️', tint: '#FFF0C7',
  desc: '计算两个日期相差天数与工作日', tags: '日期 间隔 天数 工作日',
  fields: [
    { k: 'a', label: '开始日期', type: 'date', value: new Date().toISOString().slice(0,10) },
    { k: 'b', label: '结束日期', type: 'date', value: new Date(Date.now()+30*86400000).toISOString().slice(0,10) },
    { k: 'inclusive', label: '含首尾两天', type: 'switch', value: false }
  ],
  run: function (v) {
    var a = new Date(String(v.a).replace(/-/g,'/')+' 00:00:00'), b = new Date(String(v.b).replace(/-/g,'/')+' 00:00:00');
    if (isNaN(a.getTime()) || isNaN(b.getTime())) throw new Error('请选择有效日期');
    var lo = new Date(Math.min(a,b)), hi = new Date(Math.max(a,b));
    var days = Math.round((hi - lo)/86400000) + (v.inclusive ? 1 : 0);
    var work = 0, weekend = 0;
    for (var d = new Date(lo), i = 0; i < Math.round((hi-lo)/86400000) + (v.inclusive ? 1 : 0); i++, d.setDate(d.getDate()+1)) {
      if (d.getDay() === 0 || d.getDay() === 6) weekend++; else work++;
    }
    var weeks = Math.floor(days/7), rest = days % 7;
    return H.kv([['相差天数', days + ' 天' + (b < a ? '（结束早于开始）' : '')],
      ['折合', weeks + ' 周 ' + rest + ' 天'], ['工作日（不含法定假）', work + ' 天'],
      ['周末天数', weekend + ' 天'], ['约合月数', H.num(days/30.44, 2) + ' 个月'],
      ['起始星期', ['周日','周一','周二','周三','周四','周五','周六'][lo.getDay()]],
      ['结束星期', ['周日','周一','周二','周三','周四','周五','周六'][hi.getDay()]]], '间隔统计');
  }
});

T({ id: 'unitprice', name: '比价助手', cat: 'calc', icon: '🏷️', tint: '#FFF0C7',
  desc: '按单价比较哪个商品更划算', tags: '比价 单价 划算 购物',
  fields: [
    { k: 'aPrice', label: 'A 价格 (元)', type: 'number', value: '19.9' },
    { k: 'aQty', label: 'A 数量 / 规格', type: 'number', value: '500' },
    { k: 'bPrice', label: 'B 价格 (元)', type: 'number', value: '32.9' },
    { k: 'bQty', label: 'B 数量 / 规格', type: 'number', value: '1000' },
    { k: 'unit', label: '规格单位', type: 'text', value: 'g' }
  ],
  run: function (v) {
    var ap = parseFloat(v.aPrice), aq = parseFloat(v.aQty), bp = parseFloat(v.bPrice), bq = parseFloat(v.bQty);
    if ([ap,aq,bp,bq].some(function (x) { return !isFinite(x) || x <= 0; })) throw new Error('请输入大于 0 的价格与规格');
    var ua = ap/aq, ub = bp/bq, u = v.unit || '单位';
    var better = Math.abs(ua-ub) < 1e-9 ? '两者单价相同' : ua < ub ? 'A 更划算' : 'B 更划算';
    var save = Math.abs(ua-ub)/Math.max(ua,ub)*100;
    return H.kv([['A 单价', H.num(ua, 6) + ' 元/' + u], ['B 单价', H.num(ub, 6) + ' 元/' + u],
      ['<b>结论</b>', '<b style="color:var(--primary)">' + better + '</b>'],
      ['单价差', H.num(Math.abs(ua-ub), 6) + ' 元/' + u], ['便宜约', H.num(save, 2) + '%'],
      ['买 B 规格折合 A', 'A 规格需要 ' + H.num(ub*aq, 2) + ' 元']], '比价结果');
  }
});
