/* ============================================================
   安空工具箱 v2.6 — 新增 6 个离线工具
   1. 哈希类型识别  2. 配色方案生成  3. Cron 表达式解读
   4. 任意进制转换  5. 摩尔斯电码  6. 文本统计
   全部本地运行，无网络请求，ES5 兼容写法
   ============================================================ */

function v26Esc(s) { return H.esc(s == null ? '' : String(s)); }
function v26R(html, text) {
  return { html: html, text: text == null
    ? String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s{2,}/g, ' ').trim()
    : String(text) };
}
function v26KV(rows) {
  return '<div class="kv-box">' + rows.map(function (r) {
    if (r == null) return '';
    return '<div class="kv"><span>' + v26Esc(r[0]) + '</span><span>' + v26Esc(r[1]) + '</span></div>';
  }).join('') + '</div>';
}

/* ---------------- 1. 哈希类型识别 ---------------- */
T({ id: 'hashCrack', name: '哈希类型识别', cat: 'dev', tint: '#D8EAE9',
  desc: '根据长度与字符集识别哈希算法', tags: '哈希 识别 MD5 SHA hash 摘要 类型',
  fields: [ { k: 'h', label: '哈希字符串', type: 'text', value: 'd41d8cd98f00b204e9800998ecf8427e', placeholder: '粘贴哈希值' } ],
  run: function (v) {
    var s = String(v.h || '').trim();
    if (!s) throw new Error('请输入哈希字符串');
    var len = s.length;
    var hex = /^[0-9a-fA-F]+$/.test(s);
    var guesses = [];
    if (hex) {
      if (len === 32) guesses.push('MD5', 'MD4', 'NTLM');
      if (len === 40) guesses.push('SHA-1', 'RIPEMD-160');
      if (len === 56) guesses.push('SHA-224');
      if (len === 64) guesses.push('SHA-256', 'SHA3-256', 'BLAKE2s');
      if (len === 96) guesses.push('SHA-384');
      if (len === 128) guesses.push('SHA-512', 'SHA3-512', 'BLAKE2b');
      if (len === 16) guesses.push('MySQL OLD (部分)', 'CRC-128');
      if (len === 8) guesses.push('CRC-32');
    }
    if (/^\$2[aby]\$\d\d\$/.test(s)) guesses.push('bcrypt');
    if (/^\$1\$/.test(s)) guesses.push('MD5-crypt');
    if (/^\$5\$/.test(s)) guesses.push('SHA-256-crypt');
    if (/^\$6\$/.test(s)) guesses.push('SHA-512-crypt');
    if (/^\$argon2/.test(s)) guesses.push('Argon2');
    if (/^[0-9a-fA-F]{32}:[0-9a-fA-F]{32}$/.test(s)) guesses.push('NTLM (LM:NT)');
    if (!guesses.length) guesses.push('未知 / 非标准格式');
    return v26R(v26KV([
      ['长度', len + ' 字符'],
      ['十六进制', hex ? '是' : '否'],
      ['可能算法', guesses.join(' / ')]
    ]), '长度 ' + len + '，可能算法：' + guesses.join(' / '));
  }});

/* ---------------- 2. 配色方案生成 ---------------- */
function v26HslToHex(h, s, l) {
  s /= 100; l /= 100;
  var c = (1 - Math.abs(2 * l - 1)) * s;
  var x = c * (1 - Math.abs((h / 60) % 2 - 1));
  var m = l - c / 2, r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  function p(x) { var v = Math.round((x + m) * 255).toString(16); return v.length < 2 ? '0' + v : v; }
  return '#' + p(r) + p(g) + p(b);
}
T({ id: 'colorHarmony', name: '配色方案生成', cat: 'image', tint: '#D9E8F0',
  desc: '按色彩理论生成和谐配色', tags: '配色 颜色 和谐 互补 类似 三色 调色板',
  fields: [
    { k: 'hex', label: '基准色', type: 'text', value: '#6F5C0F', placeholder: '#RRGGBB' },
    { k: 'mode', label: '方案', type: 'select', value: 'analogous', options: [
      ['analogous','类似色'],['complementary','互补色'],['triadic','三角色'],
      ['tetradic','四角色'],['split','分裂互补'],['mono','单色阶'] ] }
  ],
  run: function (v) {
    var h = String(v.hex || '').trim().replace('#','');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error('请输入 6 位十六进制颜色');
    var r = parseInt(h.slice(0,2),16)/255, g = parseInt(h.slice(2,4),16)/255, b = parseInt(h.slice(4,6),16)/255;
    var max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min, hue = 0;
    if (d) {
      if (max === r) hue = 60 * (((g-b)/d) % 6);
      else if (max === g) hue = 60 * ((b-r)/d + 2);
      else hue = 60 * ((r-g)/d + 4);
    }
    if (hue < 0) hue += 360;
    var sat = max ? d/max*100 : 0, lig = (max+min)/2*100;
    var offsets;
    switch (v.mode) {
      case 'analogous': offsets = [-30,0,30,60]; break;
      case 'complementary': offsets = [0,180]; break;
      case 'triadic': offsets = [0,120,240]; break;
      case 'tetradic': offsets = [0,90,180,270]; break;
      case 'split': offsets = [0,150,210]; break;
      case 'mono': offsets = [0,0,0,0]; break;
      default: offsets = [0,120,240];
    }
    var colors = offsets.map(function (off, i) {
      var hh = (hue + off + 360) % 360;
      var ll = v.mode === 'mono' ? [30,50,70,88][i % 4] : lig;
      return v26HslToHex(hh, sat, ll);
    });
    var swatches = colors.map(function (c) {
      return '<div style="flex:1;height:64px;border-radius:10px;background:' + c + ';display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;font-size:10px;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.5)">' + c + '</div>';
    }).join('');
    return v26R('<div style="display:flex;gap:6px;margin-bottom:10px">' + swatches + '</div>' + v26KV([['基准色','#'+h],['色相',hue.toFixed(0)+'°'],['方案',v.mode]]),
      '配色：' + colors.join(' '));
  }});

/* ---------------- 3. Cron 表达式解读 ---------------- */
T({ id: 'cronExplain', name: 'Cron 表达式解读', cat: 'dev', tint: '#D8EAE9',
  desc: '把 Cron 表达式翻译为中文', tags: 'cron 定时 表达式 解读 计划任务 schedule',
  fields: [ { k: 'expr', label: 'Cron 表达式（5 段）', type: 'text', value: '0 9 * * 1-5', placeholder: '分 时 日 月 周' } ],
  run: function (v) {
    var parts = String(v.expr || '').trim().split(/\s+/);
    if (parts.length !== 5) throw new Error('请输入 5 段cron表达式：分 时 日 月 周');
    function desc(field, val, names) {
      if (val === '*') return '每' + field;
      if (val.indexOf('*/') === 0) return '每 ' + val.slice(2) + ' ' + field;
      if (val.indexOf('-') > 0) {
        var ab = val.split('-');
        return '第 ' + (names ? (names[+ab[0]] || ab[0]) : ab[0]) + ' 到 ' + (names ? (names[+ab[1]] || ab[1]) : ab[1]) + ' ' + field;
      }
      if (val.indexOf(',') > 0) return '第 ' + val.replace(/,/g, '、') + ' ' + field;
      return names ? ('第 ' + (names[+val] || val) + ' ' + field) : ('第 ' + val + ' ' + field);
    }
    var weeks = ['日','一','二','三','四','五','六'];
    var months = ['1','2','3','4','5','6','7','8','9','10','11','12'];
    var text = desc('分钟',parts[0]) + '，' + desc('小时',parts[1]) + '，' +
               desc('日',parts[2]) + '，' + desc('月',parts[3],months) + '，星期' + desc('',parts[4],weeks);
    return v26R(v26KV([['表达式',parts.join(' ')],['含义',text]]), text);
  }});

/* ---------------- 4. 任意进制转换 ---------------- */
T({ id: 'baseNConvert', name: '任意进制转换', cat: 'dev', tint: '#D8EAE9',
  desc: '2~36 进制互转', tags: '进制 转换 二进制 八进制 十六进制 base',
  fields: [
    { k: 'num', label: '数字', type: 'text', value: '255', placeholder: '输入数字' },
    { k: 'from', label: '源进制', type: 'number', value: '10' },
    { k: 'to', label: '目标进制', type: 'number', value: '16' }
  ],
  run: function (v) {
    var s = String(v.num || '').trim().toUpperCase();
    var from = parseInt(v.from,10), to = parseInt(v.to,10);
    if (!(from >= 2 && from <= 36 && to >= 2 && to <= 36)) throw new Error('进制须在 2~36 之间');
    if (!s) throw new Error('请输入数字');
    var dec = parseInt(s, from);
    if (!isFinite(dec)) throw new Error('数字含有源进制不支持的字符');
    var out = dec.toString(to).toUpperCase();
    return v26R(v26KV([['输入',s+' (base '+from+')'],['十进制',String(dec)],['结果',out+' (base '+to+')']]),
      s + '(base '+from+') = ' + out + '(base '+to+')');
  }});

/* ---------------- 5. 摩尔斯电码 ---------------- */
var V26_MORSE = { A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',
  '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--','/':'-..-.',' ':'/' };
T({ id: 'morseCode', name: '摩尔斯电码', cat: 'text', tint: '#DCE9D3',
  desc: '文本与摩尔斯电码互转', tags: '摩尔斯 电码 morse 编码 解码 信号',
  fields: [
    { k: 'mode', label: '方向', type: 'select', value: 'encode', options: [['encode','文本 → 电码'],['decode','电码 → 文本']] },
    { k: 'text', label: '内容', type: 'textarea', value: 'HELLO 2026', placeholder: '输入文本或电码' }
  ],
  run: function (v) {
    var s = String(v.text || '').toUpperCase();
    if (!s.trim()) throw new Error('请输入内容');
    if (v.mode === 'encode') {
      var enc = [];
      for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        enc.push(V26_MORSE[c] != null ? V26_MORSE[c] : (c === ' ' ? '/' : '?'));
      }
      var out = enc.join(' ');
      return v26R(v26KV([['原文',s],['电码',out]]), out);
    }
    var rev = {}; for (var k in V26_MORSE) if (V26_MORSE.hasOwnProperty(k)) rev[V26_MORSE[k]] = k;
    var words = s.split(/\s*\/\s*/), dec = [];
    for (var wi = 0; wi < words.length; wi++) {
      var letters = words[wi].trim().split(/\s+/).filter(function(x){return x;});
      var word = '';
      for (var li = 0; li < letters.length; li++) word += (rev[letters[li]] || '?');
      dec.push(word);
    }
    var plain = dec.join(' ');
    return v26R(v26KV([['电码',s],['文本',plain]]), plain);
  }});

/* ---------------- 6. 文本统计 ---------------- */
T({ id: 'textStats', name: '文本统计', cat: 'text', tint: '#DCE9D3',
  desc: '字数行数词频等文本统计', tags: '文本 统计 字数 行数 词频 字符',
  fields: [ { k: 'text', label: '文本内容', type: 'textarea', value: 'The quick brown fox jumps over the lazy dog.\nMaterial 3 design is beautiful.', placeholder: '粘贴要统计的文本' } ],
  run: function (v) {
    var s = String(v.text || '');
    var chars = s.length;
    var noSpace = s.replace(/\s/g, '').length;
    var lines = s ? s.split(/\r?\n/).length : 0;
    var words = (s.match(/[A-Za-z0-9\u4e00-\u9fa5]+/g) || []).length;
    var cn = (s.match(/[\u4e00-\u9fa5]/g) || []).length;
    var en = (s.match(/[A-Za-z]/g) || []).length;
    var digits = (s.match(/\d/g) || []).length;
    // 词频 top 5
    var freq = {}, toks = s.toLowerCase().match(/[a-z0-9\u4e00-\u9fa5]+/g) || [];
    for (var i = 0; i < toks.length; i++) freq[toks[i]] = (freq[toks[i]] || 0) + 1;
    var top = Object.keys(freq).sort(function(a,b){return freq[b]-freq[a];}).slice(0,5);
    var topStr = top.length ? top.map(function(k){return k+'×'+freq[k];}).join('，') : '无';
    return v26R(v26KV([
      ['总字符', chars], ['不含空白', noSpace], ['行数', lines],
      ['词数', words], ['中文字符', cn], ['英文字母', en], ['数字', digits],
      ['高频词 Top5', topStr]
    ]), '字符 '+chars+'，行数 '+lines+'，词数 '+words+'，中文 '+cn);
  }});
