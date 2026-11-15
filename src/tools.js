/* ============================================================
   安空工具箱 — 公共函数与工具注册表
   ============================================================ */
var TOOLS = [];
function T(o) { TOOLS.push(o); return o; }

var H = (function () {
  /* --- 编码 --- */
  function utf8Bytes(s) {
    if (window.TextEncoder) return Array.prototype.slice.call(new TextEncoder().encode(s));
    var out = [], i, c;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
        var c2 = s.charCodeAt(++i), cp = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
        out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      } else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }
  function bytesToStr(bytes) {
    if (window.TextDecoder) return new TextDecoder().decode(new Uint8Array(bytes));
    var s = '';
    for (var i = 0; i < bytes.length; i += 4096) s += String.fromCharCode.apply(null, bytes.slice(i, i + 4096));
    return s;
  }
  function b64enc(s) {
    var b = utf8Bytes(s), out = '';
    for (var i = 0; i < b.length; i += 4096) out += String.fromCharCode.apply(null, b.slice(i, i + 4096));
    return btoa(out);
  }
  function b64dec(s) {
    var bin = atob(s.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/'));
    var b = [];
    for (var i = 0; i < bin.length; i++) b.push(bin.charCodeAt(i));
    return bytesToStr(b);
  }
  function bytesToHex(b) { return b.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
  function strToHex(s) { return bytesToHex(utf8Bytes(s)); }
  function hexToStr(h) {
    h = h.replace(/[^0-9a-f]/gi, '');
    if (h.length % 2) throw new Error('十六进制长度必须为偶数');
    var b = []; for (var i = 0; i < h.length; i += 2) b.push(parseInt(h.substr(i, 2), 16));
    return bytesToStr(b);
  }

  /* --- MD5 --- */
  function md5(str) {
    var bytes = utf8Bytes(str), bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (var li = 0; li < 8; li++) bytes.push(Math.floor(bitLen / Math.pow(2, 8 * li)) & 0xff);
    var S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
             5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
             4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
             6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
    var K = [], i;
    for (i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
    var a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
    function rotl(x, s) { return (x << s) | (x >>> (32 - s)); }
    for (var off = 0; off < bytes.length; off += 64) {
      var M = [];
      for (i = 0; i < 16; i++) M[i] = bytes[off+4*i] | (bytes[off+4*i+1] << 8) | (bytes[off+4*i+2] << 16) | (bytes[off+4*i+3] << 24);
      var A = a0, B = b0, C = c0, D = d0, F, g;
      for (i = 0; i < 64; i++) {
        if (i < 16) { F = (B & C) | (~B & D); g = i; }
        else if (i < 32) { F = (D & B) | (~D & C); g = (5*i+1) % 16; }
        else if (i < 48) { F = B ^ C ^ D; g = (3*i+5) % 16; }
        else { F = C ^ (B | ~D); g = (7*i) % 16; }
        F = (F + A + K[i] + M[g]) | 0;
        A = D; D = C; C = B; B = (B + rotl(F, S[i])) | 0;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }
    return [a0, b0, c0, d0].map(function (w) {
      var s = '', j;
      for (j = 0; j < 4; j++) s += ('0' + ((w >>> (8*j)) & 0xff).toString(16)).slice(-2);
      return s;
    }).join('');
  }
  function sha(algo, str) {
    if (!window.crypto || !crypto.subtle) return Promise.reject(new Error('当前环境不支持 Web Crypto'));
    return crypto.subtle.digest(algo, new Uint8Array(utf8Bytes(str)))
      .then(function (buf) { return bytesToHex(Array.prototype.slice.call(new Uint8Array(buf))); });
  }

  /* --- 格式化 --- */
  function pad(n, w) { return String(n).padStart(w || 2, '0'); }
  function fmtDate(d, withTime) {
    var s = d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
    return withTime === false ? s : s + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }
  function kv(pairs, title) {
    return (title ? '<div style="font-weight:700;margin-bottom:8px">' + title + '</div>' : '') +
      pairs.map(function (p) { return '<div class="kv"><span>' + esc(p[0]) + '</span><span>' + p[1] + '</span></div>'; }).join('');
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function table(headers, rows) {
    return '<table><thead><tr>' + headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
  }
  function num(n, digits) {
    if (!isFinite(n)) return String(n);
    var d = digits == null ? 6 : digits;
    return parseFloat(n.toFixed(d)).toString();
  }

  /* --- 颜色 --- */
  function hex2rgb(hex) {
    hex = String(hex).trim().replace('#','');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    if (!/^[0-9a-f]{6}$/i.test(hex)) throw new Error('请输入有效的 HEX 颜色，例如 #6750A4');
    return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
  }
  function rgb2hex(r, g, b) {
    return '#' + [r,g,b].map(function (x) { return ('0' + Math.max(0, Math.min(255, Math.round(x))).toString(16)).slice(-2); }).join('').toUpperCase();
  }
  function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min, h = 0, s = 0, l = (max+min)/2;
    if (d) {
      s = l > .5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g-b)/d + (g < b ? 6 : 0));
      else if (max === g) h = (b-r)/d + 2;
      else h = (r-g)/d + 4;
      h *= 60;
    }
    return [Math.round(h), Math.round(s*100), Math.round(l*100)];
  }
  function hsl2rgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360; s = s/100; l = l/100;
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q-p)*6*t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q-p)*(2/3-t)*6;
      return p;
    }
    if (!s) return [l*255, l*255, l*255].map(Math.round);
    var q = l < .5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
    return [hue2rgb(p,q,h+1/3)*255, hue2rgb(p,q,h)*255, hue2rgb(p,q,h-1/3)*255].map(Math.round);
  }
  function luminance(hex) {
    var c = hex2rgb(hex).map(function (x) { x /= 255; return x <= .03928 ? x/12.92 : Math.pow((x+.055)/1.055, 2.4); });
    return .2126*c[0] + .7152*c[1] + .0722*c[2];
  }

  /* --- 图片 --- */
  function readImage(file, cb) {
    if (!file) { cb(new Error('请先选择一张图片')); return; }
    if (!/^image\//.test(file.type)) { cb(new Error('请选择图片文件')); return; }
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () { cb(null, img, fr.result); };
      img.onerror = function () { cb(new Error('图片解析失败')); };
      img.src = fr.result;
    };
    fr.onerror = function () { cb(new Error('文件读取失败')); };
    fr.readAsDataURL(file);
  }
  function drawToCanvas(img, w, h) {
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c;
  }
  function canvasHTML(c) { return '<img src="' + c.toDataURL('image/png') + '" alt="预览">'; }
  function downloadButton(label, filename) {
    return '<button class="btn tonal" data-dl="' + esc(filename || 'ankong.png') + '">' + esc(label || '保存图片') + '</button>';
  }
  function bindDownload(host, getCanvas, filename) {
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-dl]'); if (!b) return;
      var A = window.AnkongApp && window.AnkongApp.api; if (!A) return;
      var c = getCanvas();
      if (!c) { A.toast('请先生成图片'); return; }
      try { A.download(c.toDataURL('image/png'), b.getAttribute('data-dl')); }
      catch (err) { A.toast('保存失败：' + err.message); }
    });
  }
  function imgResultBox() {
    return '<div class="preview-box" id="img-out"><span style="color:var(--on-surface-variant);font-size:13px">处理后预览</span></div>' +
      '<div class="btn-row"><button class="btn full" data-act="noop">等待操作</button></div>';
  }

  /* --- 表达式求值（安全解析器，不使用 eval） --- */
  function evalExpr(expr) {
    var tokens = String(expr).replace(/\s+/g,'').replace(/π/g,'PI').replace(/×/g,'*').replace(/÷/g,'/')
      .match(/(\d+\.?\d*|\.\d+|[A-Za-z]+|[+\-*/^%(),])/g);
    if (!tokens) throw new Error('表达式为空');
    var i = 0;
    function peek() { return tokens[i]; }
    function eat() { return tokens[i++]; }
    function factor() {
      var t = eat();
      if (t === undefined) throw new Error('表达式不完整');
      if (t === '+') return factor();
      if (t === '-') return -factor();
      if (t === '(') { var v = expression(); if (eat() !== ')') throw new Error('缺少右括号'); return v; }
      if (/^\d|^\./.test(t)) return parseFloat(t);
      var fn = t.toLowerCase();
      var consts = { pi: Math.PI, e: Math.E };
      var fns = {
        sin: Math.sin, cos: Math.cos, tan: Math.tan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
        sqrt: Math.sqrt, abs: Math.abs, log: Math.log, ln: Math.log, log10: Math.log10,
        exp: Math.exp, floor: Math.floor, ceil: Math.ceil, round: Math.round, sign: Math.sign
      };
      if (peek() === '(') { eat(); var arg = expression(); if (eat() !== ')') throw new Error('缺少右括号');
        if (!fns[fn]) throw new Error('未知函数：' + t); return fns[fn](arg); }
      if (consts[fn] !== undefined) return consts[fn];
      throw new Error('无法识别：' + t);
    }
    function power() { var v = factor(); while (peek() === '^') { eat(); v = Math.pow(v, factor()); } return v; }
    function term() {
      var v = power();
      while (peek() === '*' || peek() === '/' || peek() === '%') { var op = eat(); var r = power(); v = op === '*' ? v*r : op === '/' ? v/r : v%r; }
      return v;
    }
    function expression() {
      var v = term();
      while (peek() === '+' || peek() === '-') { var op = eat(); var r = term(); v = op === '+' ? v+r : v-r; }
      return v;
    }
    var out = expression();
    if (i < tokens.length) throw new Error('多余内容：' + tokens[i]);
    if (!isFinite(out)) throw new Error('计算结果无效（除零或溢出）');
    return out;
  }

  return {
    utf8Bytes: utf8Bytes, bytesToStr: bytesToStr, b64enc: b64enc, b64dec: b64dec,
    bytesToHex: bytesToHex, strToHex: strToHex, hexToStr: hexToStr, md5: md5, sha: sha,
    pad: pad, fmtDate: fmtDate, kv: kv, esc: esc, table: table, num: num,
    hex2rgb: hex2rgb, rgb2hex: rgb2hex, rgb2hsl: rgb2hsl, hsl2rgb: hsl2rgb, luminance: luminance,
    readImage: readImage, drawToCanvas: drawToCanvas, canvasHTML: canvasHTML,
    downloadButton: downloadButton, bindDownload: bindDownload, evalExpr: evalExpr
  };
})();
