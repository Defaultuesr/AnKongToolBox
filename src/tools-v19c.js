/* ============================================================
   安空工具箱 — v1.9 工具包（三）开发运维与生活 12 个
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
function num(v, d) { return H.num(v, d == null ? 4 : d); }
function lines(s) { return String(s || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n'); }

/* 39. 语义化版本比较 */
T({ id: 'vercompare', name: '语义化版本比较与排序', cat: 'dev',
  desc: '比较多个版本号（SemVer），按大小排序',
  tags: '版本号 semver 比较 排序 version',
  fields: [{ k: 'versions', label: '版本号（每行一个）', type: 'textarea', rows: 5, value: '1.9.0\n1.10.0\n2.0.0-beta\n1.9.1' }],
  run: function (v) {
    function parse(s) {
      var m = String(s).trim().match(/^v?(\d+)\.(\d+)(?:\.(\d+))?(?:[-+](.*))?$/);
      return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3] || 0), m[4] || ''] : [0, 0, 0, String(s)];
    }
    function cmp(a, b) {
      var x = parse(a), y = parse(b);
      for (var i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
      // 无预发布 > 有预发布
      if (!x[3] && y[3]) return 1; if (x[3] && !y[3]) return -1;
      return x[3] < y[3] ? -1 : x[3] > y[3] ? 1 : 0;
    }
    var arr = lines(v.versions).filter(function (x) { return x.trim(); });
    var sorted = arr.slice().sort(cmp);
    var rows = sorted.map(function (x, i) { return [i + 1, x]; });
    return R(SEC('按版本从低到高') + TB(['#', '版本'], rows));
  }});

/* 40. Cron 表达式解释 */
T({ id: 'cronexplain', name: 'Cron 表达式中文解释', cat: 'dev',
  desc: '把 5/6 位 Cron 表达式翻译为自然语言',
  tags: 'Cron 表达式 解释 定时任务 crontab',
  fields: [{ k: 'expr', label: 'Cron 表达式', type: 'text', value: '0 9 * * 1-5' }],
  run: function (v) {
    var parts = String(v.expr || '').trim().split(/\s+/);
    if (parts.length < 5) return R(HINT('Cron 表达式至少需要 5 段'));
    var names = ['分钟', '小时', '日', '月', '星期'];
    function descField(val, name) {
      if (val === '*') return '每' + name;
      if (val.indexOf('*/') === 0) return '每 ' + val.slice(2) + ' ' + name;
      if (val.indexOf('-') > 0) return name + ' ' + val.replace('-', ' 至 ');
      if (val.indexOf(',') > 0) return name + ' ' + val.replace(/,/g, '、');
      return name + ' ' + val;
    }
    var rows = [];
    for (var i = 0; i < 5; i++) rows.push([names[i], parts[i], descField(parts[i], names[i])]);
    var sentence = '在' + descField(parts[3], '月') + '的' + descField(parts[2], '日') + '，' +
      descField(parts[4], '星期') + '的' + descField(parts[1], '小时') + descField(parts[0], '分钟') + '执行';
    return R(TB(['字段', '值', '含义'], rows) + SEC('自然语言') + PRE(sentence) +
      (parts.length === 6 ? HINT('检测到 6 段：首段可能为秒') : ''));
  }});

/* 41. .env 合并 */
T({ id: 'envmerge', name: '.env 配置合并与对比', cat: 'dev',
  desc: '合并多份 .env 配置，标出冲突项',
  tags: 'env 配置 合并 对比 dotenv',
  fields: [{ k: 'text', label: '.env 内容（多个用 === 分隔）', type: 'textarea', rows: 6, value: 'PORT=3000\nDEBUG=true\n===  ===\nPORT=8080\nDB_HOST=localhost' }],
  run: function (v) {
    var blocks = String(v.text || '').split(/===\s*===/);
    var maps = blocks.map(function (b) {
      var m = {};
      lines(b).forEach(function (l) {
        l = l.trim(); if (!l || l.charAt(0) === '#') return;
        var i = l.indexOf('=');
        if (i > 0) m[l.slice(0, i).trim()] = l.slice(i + 1).trim();
      });
      return m;
    });
    var all = {}, conflicts = [];
    maps.forEach(function (m) {
      Object.keys(m).forEach(function (k) {
        if (all[k] !== undefined && all[k] !== m[k]) conflicts.push(k);
        all[k] = m[k];
      });
    });
    var rows = Object.keys(all).sort().map(function (k) {
      return [k, all[k], conflicts.indexOf(k) >= 0 ? '⚠ 冲突（取最后值）' : ''];
    });
    return R(SEC('共 ' + blocks.length + ' 份配置，' + Object.keys(all).length + ' 个键，' + conflicts.length + ' 处冲突') + TB(['键', '值（后者覆盖）', '状态'], rows));
  }});

/* 42. JWT Header 解码 */
T({ id: 'jwtdecode', name: 'JWT 三段解码', cat: 'dev',
  desc: '解码 JWT 的 Header 与 Payload（不校验签名）',
  tags: 'JWT token 解码 Base64 JSON',
  fields: [{ k: 'token', label: 'JWT Token', type: 'textarea', rows: 3, value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFua29uZyJ9.signature' }],
  run: function (v) {
    var t = String(v.token || '').trim();
    var parts = t.split('.');
    if (parts.length < 2) return R(HINT('无效的 JWT（至少需要两段）'));
    function dec(p) {
      var x = p.replace(/-/g, '+').replace(/_/g, '/');
      while (x.length % 4) x += '=';
      try { return JSON.stringify(JSON.parse(H.b64dec(x)), null, 2); } catch (e) { return '（无法解析为 JSON）\n' + H.b64dec(x); }
    }
    var out = SEC('Header') + PRE(dec(parts[0])) + SEC('Payload') + PRE(dec(parts[1]));
    if (parts[2]) out += SEC('Signature') + PRE(parts[2]);
    return R(out + HINT('仅做 Base64 解码展示，不验证签名真伪。请勿在公开工具中粘贴敏感 token。'));
  }});

/* 43. NanoID 生成 */
T({ id: 'nanoid', name: 'NanoID / UUID 批量生成', cat: 'dev',
  desc: '批量生成 NanoID 风格随机字符串与 UUID v4',
  tags: 'NanoID UUID 随机 ID 批量生成',
  fields: [
    { k: 'type', label: '类型', type: 'select', value: 'nanoid', options: [['nanoid', 'NanoID（URL 安全）'], ['uuid4', 'UUID v4'], ['hex', '十六进制']] },
    { k: 'len', label: 'NanoID 长度', type: 'text', value: '21' },
    { k: 'count', label: '生成数量（≤200）', type: 'text', value: '10' }
  ],
  run: function (v) {
    var count = Math.max(1, Math.min(200, Math.floor(parseFloat(v.count) || 10)));
    var len = Math.max(1, Math.min(256, Math.floor(parseFloat(v.len) || 21)));
    var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    var out = [];
    for (var i = 0; i < count; i++) {
      if (v.type === 'uuid4') {
        out.push('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
        }));
      } else if (v.type === 'hex') {
        var h = ''; for (var j = 0; j < len; j++) h += Math.floor(Math.random() * 16).toString(16);
        out.push(h);
      } else {
        var id = ''; for (var k = 0; k < len; k++) id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        out.push(id);
      }
    }
    return R(SEC('生成 ' + count + ' 个') + PRE(out.join('\n')));
  }});

/* 44. 颜色和谐配色 */
T({ id: 'colorharmony', name: '配色方案生成', cat: 'image',
  desc: '根据基色生成互补色、类似色、三色、分裂互补等配色方案',
  tags: '配色 色环 互补色 类似色 harmony color',
  fields: [
    { k: 'color', label: '基色（如 #6F5C0F）', type: 'text', value: '#6F5C0F' },
    { k: 'scheme', label: '配色方案', type: 'select', value: 'complement', options: [
      ['complement', '互补色'], ['analogous', '类似色'], ['triadic', '三角色'], ['split', '分裂互补'], ['tetradic', '四角色'] ] }
  ],
  run: function (v) {
    var hex = String(v.color || '').replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return R(HINT('请输入 6 位十六进制颜色，如 #6F5C0F'));
    var rgb = H.hex2rgb(hex);
    var hsl = H.rgb2hsl(rgb[0], rgb[1], rgb[2]);
    var h = hsl[0], s = hsl[1], l = hsl[2];
    var offsets = { complement: [0, 180], analogous: [-30, 0, 30], triadic: [0, 120, 240], split: [0, 150, 210], tetradic: [0, 90, 180, 270] }[v.scheme] || [0, 180];
    var swatches = '', rows = [];
    offsets.forEach(function (off, i) {
      var nh = ((h + off) % 360 + 360) % 360;
      var c = H.hsl2rgb(nh, s, l);
      var chex = H.rgb2hex(c[0], c[1], c[2]);
      swatches += '<div style="display:inline-block;text-align:center;margin:6px"><div style="width:70px;height:70px;background:#' + chex + ';border-radius:8px;border:1px solid #ccc"></div><div style="font:11px monospace;margin-top:4px">#' + chex + '</div></div>';
      rows.push(['色 ' + (i + 1), '#' + chex, 'H ' + Math.round(nh) + '°']);
    });
    return R(SEC('基色 #' + hex + '（H ' + Math.round(h) + '° S ' + Math.round(s * 100) + '% L ' + Math.round(l * 100) + '%）') + '<div>' + swatches + '</div>' + TB(['序号', '颜色', '色相'], rows));
  }});

/* 45. 对比度检查（WCAG）*/
T({ id: 'contrastcheck', name: 'WCAG 对比度检查', cat: 'image',
  desc: '计算前景/背景色对比度，判断是否符合无障碍标准',
  tags: '对比度 WCAG 无障碍 可读性 contrast',
  fields: [
    { k: 'fg', label: '前景色', type: 'text', value: '#333333' },
    { k: 'bg', label: '背景色', type: 'text', value: '#FFFFF8EE' }
  ],
  run: function (v) {
    function lum(hex) {
      hex = hex.replace('#', '');
      if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
      var r = parseInt(hex.substr(0, 2), 16) / 255, g = parseInt(hex.substr(2, 2), 16) / 255, b = parseInt(hex.substr(4, 2), 16) / 255;
      function f(c) { return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }
    var l1 = lum(String(v.fg || '')), l2 = lum(String(v.bg || ''));
    if (l1 === null || l2 === null) return R(HINT('请输入 6 位十六进制颜色'));
    var ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    var aa = ratio >= 4.5 ? '✓ 通过' : '✗ 未通过', aaa = ratio >= 7 ? '✓ 通过' : '✗ 未通过';
    var large = ratio >= 3 ? '✓ 通过' : '✗ 未通过';
    return R(SEC('对比度 <b>' + num(ratio, 2) + ' : 1</b>') + '<div style="padding:20px;background:' + v.bg + ';color:' + v.fg + ';border-radius:8px;text-align:center;font-size:18px">示例文字 Aa 安空工具箱</div>' +
      KV([['WCAG AA（正文 4.5:1）', aa], ['WCAG AAA（正文 7:1）', aaa], ['WCAG AA（大字 3:1）', large]]));
  }});

/* 46. 生日密码学 */
T({ id: 'agecheck', name: '精确年龄与星座生肖', cat: 'life',
  desc: '根据出生日期计算精确年龄、星座、生肖、下次生日',
  tags: '年龄 星座 生肖 生日 精确',
  fields: [{ k: 'date', label: '出生日期', type: 'date', value: '2000-01-01' }],
  run: function (v) {
    var d = new Date(String(v.date || ''));
    if (isNaN(d.getTime())) return R(HINT('请输入有效日期'));
    var now = new Date();
    var y = now.getFullYear() - d.getFullYear(), m = now.getMonth() - d.getMonth(), dd = now.getDate() - d.getDate();
    if (dd < 0) { m--; var pm = new Date(now.getFullYear(), now.getMonth(), 0).getDate(); dd += pm; }
    if (m < 0) { y--; m += 12; }
    var signs = ['摩羯座','水瓶座','双鱼座','白羊座','金牛座','双子座','巨蟹座','狮子座','处女座','天秤座','天蝎座','射手座','摩羯座'];
    var md = d.getMonth() + 1, day = d.getDate();
    var sign = signs[md];
    var bounds = [[1,20,'水瓶座'],[2,19,'双鱼座'],[3,21,'白羊座'],[4,20,'金牛座'],[5,21,'双子座'],[6,22,'巨蟹座'],[7,23,'狮子座'],[8,23,'处女座'],[9,23,'天秤座'],[10,24,'天蝎座'],[11,23,'射手座'],[12,22,'摩羯座']];
    for (var i = 0; i < bounds.length; i++) if (md > bounds[i][0] || (md === bounds[i][0] && day >= bounds[i][1])) sign = bounds[i][2];
    var zodiacs = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
    var zodiac = zodiacs[((d.getFullYear() - 4) % 12 + 12) % 12];
    var next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
    if (next <= now) next = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
    var days = Math.ceil((next - now) / 86400000);
    return R(KV([
      ['精确年龄', '<b>' + y + ' 岁 ' + m + ' 个月 ' + dd + ' 天</b>'],
      ['星座', sign], ['生肖', zodiac + '年'],
      ['已出生天数', String(Math.floor((now - d) / 86400000))],
      ['距下次生日', days + ' 天']
    ]));
  }});

/* 47. 时间预算分配 */
T({ id: 'timebudget', name: '24 小时时间预算分配', cat: 'life',
  desc: '规划一天的时间分配并可视化',
  tags: '时间预算 24小时 日程 规划',
  fields: [{ k: 'items', label: '活动（每行：名称,小时）', type: 'textarea', rows: 6, value: '睡眠,8\n工作,9\n学习,2\n运动,1\n餐饮,1.5\n娱乐,2.5' }],
  run: function (v) {
    var rows = [], total = 0;
    lines(v.items).forEach(function (l) {
      var p = l.split(/[,，]/); if (p.length < 2) return;
      var h = parseFloat(p[1]); if (!isFinite(h)) return;
      total += h; rows.push([p[0].trim(), h, num(h / 24 * 100, 1) + '%']);
    });
    var color = ['#6F5C0F','#8B7D3E','#A99A5C','#C7B87A','#E0D29B','#F0E6C8'];
    var bar = rows.map(function (r, i) {
      return '<div title="' + esc(r[0]) + ' ' + r[1] + 'h" style="display:inline-block;width:' + (r[1] / 24 * 100) + '%;height:26px;background:' + color[i % color.length] + '"></div>';
    }).join('');
    var status = Math.abs(total - 24) < 0.01 ? '✓ 恰好 24 小时' : total < 24 ? '还差 ' + num(24 - total, 1) + ' 小时未分配' : '超出 ' + num(total - 24, 1) + ' 小时';
    return R(SEC('总计 ' + num(total, 1) + ' 小时 — ' + status) + '<div style="display:flex;border-radius:6px;overflow:hidden">' + bar + '</div>' + TB(['活动', '小时', '占比'], rows));
  }});

/* 48. 单位换算批量 */
T({ id: 'batchconvert', name: '批量单位换算', cat: 'calc',
  desc: '批量换算一组数值的单位，支持长度/重量/温度等',
  tags: '批量换算 单位长度 重量 温度',
  fields: [
    { k: 'type', label: '类别', type: 'select', value: 'length', options: [['length','长度'],['weight','重量'],['temp','温度'],['area','面积']] },
    { k: 'from', label: '从', type: 'text', value: 'km' },
    { k: 'to', label: '到', type: 'text', value: 'mile' },
    { k: 'values', label: '数值（每行一个）', type: 'textarea', rows: 4, value: '1\n5\n10\n42.195' }
  ],
  run: function (v) {
    var F = {
      length: { mm:0.001, cm:0.01, m:1, km:1000, inch:0.0254, ft:0.3048, yard:0.9144, mile:1609.344 },
      weight: { mg:0.000001, g:0.001, kg:1, t:1000, oz:0.02835, lb:0.4536 },
      area: { 'cm2':0.0001, 'm2':1, 'km2':1000000, 'ft2':0.0929, 'acre':4046.86, 'ha':10000 },
      temp: null
    };
    var from = v.from.trim().toLowerCase(), to = v.to.trim().toLowerCase();
    var rows = [];
    lines(v.values).forEach(function (l) {
      var n = parseFloat(l); if (!isFinite(n)) return;
      var out;
      if (v.type === 'temp') {
        function toC(x, u) { return u === 'c' ? x : u === 'f' ? (x-32)*5/9 : x-273.15; }
        function fromC(x, u) { return u === 'c' ? x : u === 'f' ? x*9/5+32 : x+273.15; }
        out = fromC(toC(n, from), to);
      } else {
        var f = F[v.type];
        if (!f || f[from] === undefined || f[to] === undefined) return;
        out = n * f[from] / f[to];
      }
      rows.push([String(n), from, num(out, 6), to]);
    });
    if (!rows.length) return R(HINT('无有效换算，请检查单位名称'));
    return R(TB(['数值', '从', '结果', '到'], rows));
  }});

/* 49. 定时器提醒（微番茄钟）*/
T({ id: 'pomodoro2', name: '自定义间隔提醒', cat: 'life',
  desc: '生成自定义重复提醒计划表（如每 45 分钟休息 5 分钟）',
  tags: '提醒 间隔 番茄钟 计划表',
  fields: [
    { k: 'work', label: '专注时长（分钟）', type: 'text', value: '45' },
    { k: 'rest', label: '休息时长（分钟）', type: 'text', value: '5' },
    { k: 'rounds', label: '轮数', type: 'text', value: '4' },
    { k: 'start', label: '开始时间', type: 'text', value: '09:00' }
  ],
  run: function (v) {
    var work = Math.max(1, parseFloat(v.work) || 45), rest = Math.max(0, parseFloat(v.rest) || 5);
    var rounds = Math.max(1, Math.min(20, Math.floor(parseFloat(v.rounds) || 4)));
    var t = String(v.start || '09:00');
    var m = t.match(/(\d+):(\d+)/);
    if (!m) return R(HINT('开始时间格式应为 HH:MM'));
    var mins = parseInt(m[1]) * 60 + parseInt(m[2]);
    function fmt(x) { x = Math.floor(x) % 1440; if (x < 0) x += 1440; return ('0' + Math.floor(x / 60)).slice(-2) + ':' + ('0' + (x % 60)).slice(-2); }
    var rows = [];
    for (var i = 1; i <= rounds; i++) {
      rows.push(['第 ' + i + ' 轮开始', fmt(mins)]);
      mins += work;
      rows.push(['第 ' + i + ' 轮结束 / 休息', fmt(mins)]);
      mins += rest;
    }
    var total = rounds * (work + rest);
    return R(SEC(rounds + ' 轮，总计 ' + num(total, 0) + ' 分钟（' + num(total / 60, 1) + ' 小时）') + TB(['节点', '时间'], rows));
  }});

/* 50. 数字转金额大写增强 */
T({ id: 'moneyupper', name: '金额大写与拆分', cat: 'life',
  desc: '把金额转为人民币大写，并拆分为票面组合',
  tags: '金额大写 人民币 财务 票面',
  fields: [{ k: 'amount', label: '金额（元）', type: 'text', value: '12345.67' }],
  run: function (v) {
    var n = parseFloat(v.amount);
    if (!isFinite(n) || n < 0) return R(HINT('请输入有效金额'));
    var upper = H.numToChinese ? H.numToChinese(n) : '';
    // 简易大写转换（分位）
    var digits = '零壹贰叁肆伍陆柒捌玖', units = ['', '拾', '佰', '仟'];
    var fen = Math.round(n * 100), yuan = Math.floor(fen / 100), jiao = Math.floor(fen / 10) % 10, cent = fen % 10;
    function intUpper(x) {
      if (x === 0) return '零';
      var s = String(x), out = '', len = s.length;
      for (var i = 0; i < len; i++) {
        var d = parseInt(s.charAt(i), 10), pos = len - i - 1;
        if (d) out += digits.charAt(d) + units[pos % 4];
        else if (out && pos % 4 === 0) out += '零';
        if (pos === 4 && x >= 10000) out += '万';
      }
      return out;
    }
    var upperStr = (yuan > 0 ? intUpper(yuan) + '元' : '') + (jiao ? digits.charAt(jiao) + '角' : (cent ? '零' : '')) + (cent ? digits.charAt(cent) + '分' : (jiao ? '' : '整'));
    var notes = [100,50,20,10,5,1,0.5,0.1], remain = n, combo = [];
    notes.forEach(function (nv) {
      var c = Math.floor(remain / nv + 1e-6);
      if (c > 0) { combo.push([nv + ' 元', c + ' 张/枚']); remain -= c * nv; }
    });
    return R(KV([
      ['金额', num(n, 2) + ' 元'],
      ['人民币大写', '<b>' + upperStr + '</b>']
    ]) + SEC('票面拆分（贪心）') + TB(['面额', '数量'], combo));
  }});

})();
