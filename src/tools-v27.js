/* ============================================================
   安空工具箱 v2.7 — 新增 6 个离线工具（呼应 M3E 设计规范）
   1. Material 色板生成  2. 颜色对比度检查  3. UUID 生成
   4. Lorem 文本生成     5. 十六进制↔RGB      6. 字符串反转/大小写
   全部本地运行，无网络请求，ES5 兼容写法
   ============================================================ */

function v27Esc(s) { return H.esc(s == null ? '' : String(s)); }
function v27R(html, text) {
  return { html: html, text: text == null
    ? String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s{2,}/g, ' ').trim()
    : String(text) };
}
function v27KV(rows) {
  return '<div class="kv-box">' + rows.map(function (r) {
    if (r == null) return '';
    return '<div class="kv"><span>' + v27Esc(r[0]) + '</span><span>' + v27Esc(r[1]) + '</span></div>';
  }).join('') + '</div>';
}

/* ---------- 工具函数 ---------- */
function v27HexToRgb(hex) {
  var h = String(hex || '').replace('#', '');
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function v27RgbToHex(r, g, b) {
  function p(n) { n = Math.max(0, Math.min(255, Math.round(n))).toString(16); return n.length < 2 ? '0' + n : n; }
  return '#' + p(r) + p(g) + p(b);
}
function v27Lum(hex) {
  var c = v27HexToRgb(hex); if (!c) return null;
  var a = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function v27HslToHex(h, s, l) {
  s /= 100; l /= 100;
  var c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
  var r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  return v27RgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

/* ---------------- 1. Material 色板生成 ---------------- */
T({ id: 'm3Palette', name: 'Material 色板生成', cat: 'dev', tint: '#EADDFF',
  desc: '由一个种子色生成 10 阶 tonal 色板', tags: '配色 色板 Material tonal 主题 颜色',
  fields: [ { k: 'hex', label: '种子色', type: 'text', value: '#6750A4', placeholder: '#6750A4' } ],
  run: function (v) {
    var hex = String(v.hex || '').trim();
    var c = v27HexToRgb(hex);
    if (!c) throw new Error('请输入合法的十六进制颜色，如 #6750A4');
    var tones = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100];
    var swatches = tones.map(function (t) {
      // 近似 tonal palette：向白(高 tone)或黑(低 tone)混合
      var base = t <= 50 ? [0, 0, 0] : [255, 255, 255];
      var p = t <= 50 ? (50 - t) / 50 : (t - 50) / 50;
      var col = v27RgbToHex(c[0] * (1 - p) + base[0] * p, c[1] * (1 - p) + base[1] * p, c[2] * (1 - p) + base[2] * p);
      return '<div style="flex:1;min-width:52px;text-align:center">' +
        '<div style="height:56px;border-radius:12px;background:' + col + ';border:1px solid rgba(0,0,0,.08)"></div>' +
        '<small>' + t + '</small><div style="font-size:10px;color:var(--on-surface-variant)">' + col + '</div></div>';
    }).join('');
    return v27R('<div style="display:flex;gap:4px;flex-wrap:wrap">' + swatches + '</div>',
      '种子色 ' + hex + ' 生成的 tonal 色板：' + tones.join('/'));
  }});

/* ---------------- 2. 颜色对比度检查 ---------------- */
T({ id: 'contrastCheck', name: '颜色对比度检查', cat: 'dev', tint: '#FFD8E4',
  desc: '计算两色对比度并评估 WCAG 等级', tags: '对比度 无障碍 WCAG 颜色 对比',
  fields: [
    { k: 'fg', label: '前景色', type: 'text', value: '#6750A4', placeholder: '#6750A4' },
    { k: 'bg', label: '背景色', type: 'text', value: '#FFFFFF', placeholder: '#FFFFFF' }
  ],
  run: function (v) {
    var a = v27Lum(v.fg), b = v27Lum(v.bg);
    if (a == null || b == null) throw new Error('请输入两个合法的十六进制颜色');
    var ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    var aa = ratio >= 4.5 ? '通过' : '不通过';
    var aaLarge = ratio >= 3 ? '通过' : '不通过';
    var aaa = ratio >= 7 ? '通过' : '不通过';
    return v27R(v27KV([
      ['对比度', ratio.toFixed(2) + ' : 1'],
      ['WCAG AA（正文）', aa],
      ['WCAG AA（大字）', aaLarge],
      ['WCAG AAA', aaa]
    ]), '对比度 ' + ratio.toFixed(2) + ':1，AA 正文' + aa + '，AAA ' + aaa);
  }});

/* ---------------- 3. UUID 生成器 ---------------- */
T({ id: 'uuidGen', name: 'UUID 生成器', cat: 'dev', tint: '#E8DEF8',
  desc: '批量生成 UUID v4', tags: 'UUID GUID 随机 标识 ID',
  fields: [ { k: 'n', label: '生成数量', type: 'number', value: 5, placeholder: '1-100' } ],
  run: function (v) {
    var n = parseInt(v.n, 10);
    if (isNaN(n) || n < 1 || n > 100) throw new Error('请输入 1-100 之间的数量');
    var list = [];
    for (var i = 0; i < n; i++) {
      list.push('xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (ch) {
        var r = Math.random() * 16 | 0, val = ch === 'x' ? r : (r & 0x3 | 0x8);
        return val.toString(16);
      }));
    }
    return v27R('<div class="code-box">' + list.map(v27Esc).join('\n') + '</div>', list.join('\n'));
  }});

/* ---------------- 4. Lorem 文本生成 ---------------- */
T({ id: 'loremGen', name: 'Lorem 文本生成', cat: 'text', tint: '#F3EDF7',
  desc: '生成用于排版的占位文本', tags: 'Lorem 占位 文本 假文 排版',
  fields: [
    { k: 'n', label: '段落数', type: 'number', value: 3, placeholder: '1-20' },
    { k: 'zh', label: '中文占位（1=中文，0=拉丁）', type: 'number', value: 1, placeholder: '1 或 0' }
  ],
  run: function (v) {
    var n = parseInt(v.n, 10); if (isNaN(n) || n < 1 || n > 20) throw new Error('段落数 1-20');
    var zh = parseInt(v.zh, 10) !== 0;
    var latin = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';
    var chinese = '这是一个用于排版预览的占位段落。Material 3 Expressive 强调清晰的信息层级与富有表现力的视觉节奏，让每一段文字都恰到好处地服务于内容本身。';
    var out = [];
    for (var i = 0; i < n; i++) out.push(zh ? chinese : latin);
    var text = out.join('\n\n');
    return v27R('<div class="pp">' + out.map(v27Esc).join('</div><div class="pp">') + '</div>', text);
  }});

/* ---------------- 5. 十六进制 ↔ RGB ---------------- */
T({ id: 'hexRgb', name: '十六进制 ↔ RGB', cat: 'dev', tint: '#CBE1F3',
  desc: '颜色格式互转', tags: '颜色 十六进制 RGB HEX 转换',
  fields: [ { k: 'c', label: '颜色值（HEX 或 rgb(r,g,b)）', type: 'text', value: '#6750A4', placeholder: '#6750A4 或 rgb(103,80,164)' } ],
  run: function (v) {
    var s = String(v.c || '').trim();
    var lines = [];
    var rgbm = s.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (rgbm) {
      var hex = v27RgbToHex(+rgbm[1], +rgbm[2], +rgbm[3]);
      lines.push(['HEX', hex]);
      lines.push(['简写', hex[1] === hex[2] && hex[3] === hex[4] && hex[5] === hex[6] ? '#' + hex[1] + hex[3] + hex[5] : hex]);
      lines.push(['RGB', (+rgbm[1]) + ', ' + (+rgbm[2]) + ', ' + (+rgbm[3])]);
      lines.push(['预览', hex]);
    } else {
      var c = v27HexToRgb(s);
      if (!c) throw new Error('无法识别，请输入 #RRGGBB 或 rgb(r,g,b)');
      lines.push(['HEX', v27RgbToHex(c[0], c[1], c[2])]);
      lines.push(['RGB', 'rgb(' + c[0] + ', ' + c[1] + ', ' + c[2] + ')']);
      lines.push(['R / G / B', c[0] + ' / ' + c[1] + ' / ' + c[2]]);
      lines.push(['预览', v27RgbToHex(c[0], c[1], c[2])]);
    }
    var html = v27KV(lines.slice(0, lines.length - 1));
    html += '<div style="height:64px;border-radius:16px;background:' + lines[lines.length - 1][1] + ';border:1px solid rgba(0,0,0,.08)"></div>';
    return v27R(html, lines.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n'));
  }});

/* ---------------- 6. 字符串变换 ---------------- */
T({ id: 'strTransform', name: '字符串变换', cat: 'text', tint: '#E6E0E9',
  desc: '反转、大小写与词数统计', tags: '字符串 反转 大小写 变换 文本',
  fields: [ { k: 's', label: '输入文本', type: 'text', value: 'Material 3 Expressive', placeholder: '输入文本' } ],
  run: function (v) {
    var s = String(v.s || '');
    if (!s) throw new Error('请输入文本');
    var rev = s.split('').reverse().join('');
    var words = s.trim() ? s.trim().split(/\s+/).length : 0;
    return v27R(v27KV([
      ['原文', s],
      ['反转', rev],
      ['大写', s.toUpperCase()],
      ['小写', s.toLowerCase()],
      ['字符数', s.length],
      ['词数', words]
    ]), '反转：' + rev + '\n字符数：' + s.length + '，词数：' + words);
  }});
