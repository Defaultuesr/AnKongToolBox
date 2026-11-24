/* ============================================================
   安空工具箱 — v1.8 工具包（一）
   OCR 图片文字提取 · 图片旋转 / 信息 / 哈希
   纯本地离线，ES5 兼容写法，不使用沉浸式全屏
   ============================================================ */
(function () {
'use strict';

function esc(s) { return H.esc(s == null ? '' : String(s)); }
function nl(s) { return String(s == null ? '' : s).replace(/\r\n/g, '\n').replace(/\r/g, '\n'); }
function fmtSize(n) {
  n = Number(n) || 0;
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1024 / 1024).toFixed(2) + ' MB';
}

/* ------------------------------------------------------------
   全局 OCR 结果桥：供原生本地识别引擎（ML Kit）回调。
   引擎为可插拔模块；未集成时页面仍可完整使用整理 / 排版 / 导出。
   ------------------------------------------------------------ */
var ocrActive = null;
window.AK_OCR = {
  available: function () {
    try {
      return !!(window.Ankong && typeof window.Ankong.ocrAvailable === 'function' &&
        window.Ankong.ocrAvailable('') === '1' && typeof window.Ankong.ocr === 'function');
    } catch (e) { return false; }
  },
  onResult: function (text, err) {
    if (ocrActive && typeof ocrActive.onResult === 'function') ocrActive.onResult(text, err);
  },
  _bind: function (o) { ocrActive = o; },
  _unbind: function (o) { if (ocrActive === o) ocrActive = null; }
};

/* 文本整理算子：被 OCR 结果与「文本清洗」工具共用 */
function cleanOp(op, raw) {
  var s = nl(raw), i, lines, out;
  if (op === 'noempty') {
    return s.split('\n').filter(function (l) { return l.trim() !== ''; }).join('\n');
  }
  if (op === 'nonl') return s.replace(/\n/g, '');
  if (op === 'nospace') return s.replace(/[ \t\u3000\u00A0]+/g, '');
  if (op === 'trim') {
    return s.split('\n').map(function (l) { return l.replace(/^[ \t\u3000]+|[ \t\u3000]+$/g, ''); }).join('\n');
  }
  if (op === 'space1') return s.replace(/[ \t\u3000]{2,}/g, ' ');
  if (op === 'fwspace') return s.replace(/\u3000/g, ' ');
  if (op === 'uniq') {
    var seen = {}, o = [];
    lines = s.split('\n');
    for (i = 0; i < lines.length; i++) { if (!seen[lines[i]]) { seen[lines[i]] = 1; o.push(lines[i]); } }
    return o.join('\n');
  }
  if (op === 'merge' || op === 'paras') {
    lines = s.split('\n'); out = []; var buf = '';
    for (i = 0; i < lines.length; i++) {
      var t = lines[i].trim();
      if (!t) {
        if (buf) { out.push(buf); buf = ''; }
        if (op === 'paras' && out.length && out[out.length - 1] !== '') out.push('');
        continue;
      }
      var sp = buf && /[A-Za-z0-9]$/.test(buf) && /^[A-Za-z0-9]/.test(t) ? ' ' : '';
      buf += sp + t;
    }
    if (buf) out.push(buf);
    return out.join(op === 'paras' ? '\n\n' : '\n');
  }
  if (op === 'all') {
    var x = cleanOp('fwspace', s);
    x = cleanOp('trim', x);
    x = cleanOp('space1', x);
    x = cleanOp('noempty', x);
    return cleanOp('merge', x);
  }
  return s;
}
window.AK_CLEAN_OP = cleanOp;

/* ============================================================
   1. OCR 图片文字提取与排版
   ============================================================ */
T({ id: 'ocrtext', name: 'OCR 图片文字提取', cat: 'image', icon: '🔎', tint: '#D9E8F0',
  desc: '相册 / 拍照选图 → 本地预处理 → 文字提取，支持去空行、合并换行、排版与导出 TXT',
  tags: 'OCR 文字识别 图片转文字 提取文字 去空行 排版 导出TXT 拍照',
  note: '图片只在本机处理，不会上传。安卓安装包已内置 ML Kit 中文识别模型，点「开始本地识别」即可自动提取文字；单文件网页版可直接粘贴或录入图片文字，整理、复制与导出功能同样可用。',
  custom: function (host, api) {
    var curImg = null, mode = 'gray', canvas = null;
    host.innerHTML =
      '<div class="field"><label>选择图片（相册 / 拍照）</label>' +
        '<input class="input" type="file" id="oc-file" accept="image/*"></div>' +
      '<div class="chips" id="oc-modes">' +
        '<button class="chip on" data-m="gray">灰度增强</button>' +
        '<button class="chip" data-m="binary">二值化</button>' +
        '<button class="chip" data-m="zoom">放大 2×</button>' +
        '<button class="chip" data-m="origin">原图</button></div>' +
      '<div class="preview-box" id="oc-prev"><span style="color:var(--on-surface-variant);font-size:13px">图片预览与预处理效果</span></div>' +
      '<div class="btn-row"><button class="btn full" id="oc-rec">开始本地识别</button></div>' +
      '<div class="hint" id="oc-engine" style="margin:0 2px 12px"></div>' +
      '<div class="field"><label>识别结果（可直接编辑 / 粘贴图片文字）</label>' +
        '<textarea class="input" id="oc-text" rows="8" placeholder="识别出的文字会显示在这里；也可以直接粘贴或手动录入，然后使用下方整理功能"></textarea></div>' +
      '<div class="sec-label">一键整理</div>' +
      '<div class="chips" id="oc-ops">' +
        '<button class="chip" data-op="noempty">去空行</button>' +
        '<button class="chip" data-op="merge">合并换行</button>' +
        '<button class="chip" data-op="paras">段落重排</button>' +
        '<button class="chip" data-op="nonl">去除换行</button>' +
        '<button class="chip" data-op="nospace">去除空白</button>' +
        '<button class="chip" data-op="trim">去首尾空格</button>' +
        '<button class="chip" data-op="uniq">去重行</button>' +
        '<button class="chip" data-op="all">全部整理</button></div>' +
      '<div class="btn-row">' +
        '<button class="btn tonal" id="oc-copy">复制文字</button>' +
        '<button class="btn tonal" id="oc-txt">导出 TXT</button>' +
        '<button class="btn outline" id="oc-clear">清空</button></div>' +
      '<div class="result empty" id="oc-stat">整理后会显示字符 / 行数变化</div>';

    var prev = host.querySelector('#oc-prev'), textEl = host.querySelector('#oc-text');
    var stat = host.querySelector('#oc-stat'), eng = host.querySelector('#oc-engine');
    eng.textContent = window.AK_OCR.available()
      ? '本地识别引擎：设备端 ML Kit · 图片不离开设备'
      : '本地识别引擎：当前环境未内置 · 可粘贴 / 录入文字，整理、复制与导出功能完全可用';

    function draw() {
      if (!curImg) return;
      var maxSide = mode === 'zoom' ? 2600 : 1400;
      var sc = Math.min(1, maxSide / Math.max(curImg.width, curImg.height));
      if (mode === 'zoom') sc = Math.min(2, 2600 / Math.max(curImg.width, curImg.height));
      var w = Math.max(1, Math.round(curImg.width * sc)), h = Math.max(1, Math.round(curImg.height * sc));
      canvas = H.drawToCanvas(curImg, w, h);
      if (mode === 'gray' || mode === 'binary') {
        var cx = canvas.getContext('2d'), im = cx.getImageData(0, 0, w, h), d = im.data, i;
        var gray = new Float32Array(w * h);
        for (i = 0; i < w * h; i++) gray[i] = .299 * d[i * 4] + .587 * d[i * 4 + 1] + .114 * d[i * 4 + 2];
        var v, avg = 0;
        if (mode === 'binary') { for (i = 0; i < gray.length; i++) avg += gray[i]; avg /= gray.length; }
        for (i = 0; i < gray.length; i++) {
          v = mode === 'binary' ? (gray[i] > avg * .92 ? 255 : 0) : Math.round(gray[i]);
          d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255;
        }
        cx.putImageData(im, 0, 0);
      }
      prev.innerHTML = H.canvasHTML(canvas);
    }

    var ctx = {
      onResult: function (text, err) {
        if (!document.body.contains(host)) { window.AK_OCR._unbind(ctx); return; }
        if (err) { api.toast(String(err)); return; }
        if (text) { textEl.value = String(text); api.toast('识别完成，可继续整理'); report('识别完成'); }
        else api.toast('未识别到文字，可手动录入');
      }
    };
    window.AK_OCR._bind(ctx);

    function report(tag) {
      var s = textEl.value, ch = s.replace(/\s/g, '').length, ln = s ? s.split('\n').length : 0;
      stat.classList.remove('empty');
      stat.innerHTML = H.kv([
        ['状态', esc(tag)], ['总字符数', String(s.length)], ['不含空白字符', String(ch)], ['行数', String(ln)]
      ], '文本统计');
    }

    host.addEventListener('change', function (e) {
      if (!e.target || e.target.id !== 'oc-file') return;
      H.readImage(e.target.files[0], function (err, img) {
        if (err) { api.toast(err.message); return; }
        curImg = img; draw(); api.toast('图片已载入，可切换预处理效果');
      });
    });
    host.addEventListener('click', function (e) {
      var m = e.target.closest && e.target.closest('[data-m]');
      if (m) {
        host.querySelectorAll('#oc-modes .chip').forEach(function (x) { x.classList.remove('on'); });
        m.classList.add('on'); mode = m.getAttribute('data-m'); draw(); return;
      }
      var op = e.target.closest && e.target.closest('[data-op]');
      if (op) {
        if (!textEl.value) { api.toast('请先填入文字'); return; }
        var before = textEl.value.length;
        textEl.value = cleanOp(op.getAttribute('data-op'), textEl.value);
        report('已' + op.textContent);
        api.toast('已整理：' + before + ' → ' + textEl.value.length + ' 字符');
        return;
      }
      var t = e.target;
      if (t.id === 'oc-rec' || (t.closest && t.closest('#oc-rec'))) {
        if (!curImg || !canvas) { api.toast('请先选择一张图片'); return; }
        if (!window.AK_OCR.available()) {
          api.toast('当前环境未内置本地识别引擎，可直接粘贴文字');
          textEl.focus();
          return;
        }
        api.toast('正在本机识别…');
        try { api.native.call('ocr', canvas.toDataURL('image/jpeg', 0.9)); }
        catch (er) { api.toast('识别调用失败，可手动录入文字'); }
        return;
      }
      if (t.id === 'oc-copy' || (t.closest && t.closest('#oc-copy'))) {
        if (!textEl.value.trim()) { api.toast('没有可复制的文字'); return; }
        api.copy(textEl.value); return;
      }
      if (t.id === 'oc-txt' || (t.closest && t.closest('#oc-txt'))) {
        if (!textEl.value.trim()) { api.toast('没有可导出的文字'); return; }
        try {
          var a = document.createElement('a');
          a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(textEl.value);
          a.download = 'ankong-ocr-' + Date.now() + '.txt';
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          api.toast('已导出 TXT');
        } catch (er2) { api.copy(textEl.value); api.toast('导出受限，已复制文字'); }
        return;
      }
      if (t.id === 'oc-clear' || (t.closest && t.closest('#oc-clear'))) {
        textEl.value = ''; stat.classList.add('empty');
        stat.textContent = '整理后会显示字符 / 行数变化'; api.toast('已清空');
      }
    });
  }
});

/* ============================================================
   2. 图片旋转与翻转
   ============================================================ */
IM({ id: 'imgrotate', name: '图片旋转与翻转', icon: '🔃', tint: '#D9E8F0',
  desc: '按 90° 步进旋转，支持水平 / 垂直镜像翻转',
  tags: '图片 旋转 翻转 镜像 方向 90度',
  filename: 'ankong-rotate.png',
  params: function () {
    return '<div class="field"><label>旋转角度</label><select class="input" data-p="deg">' +
      [['0', '不旋转'], ['90', '顺时针 90°'], ['180', '180°'], ['270', '顺时针 270°（逆时针 90°）']].map(function (o) {
        return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select></div>' +
      '<div class="switch-row"><div><div class="st">水平翻转（左右镜像）</div><div class="sd">自拍、文字图片常用</div></div>' +
        '<button class="toggle" data-p="flipH" type="button" role="switch"></button></div>' +
      '<div class="switch-row"><div><div class="st">垂直翻转（上下镜像）</div></div>' +
        '<button class="toggle" data-p="flipV" type="button" role="switch"></button></div>';
  },
  init: function (host) {
    ['flipH', 'flipV'].forEach(function (k) {
      var t = host.querySelector('[data-p="' + k + '"]');
      t.addEventListener('click', function () { t.classList.toggle('on'); });
    });
  },
  process: function (img, p) {
    var deg = parseInt(p.deg, 10) || 0, swap = (deg === 90 || deg === 270);
    var w = swap ? img.height : img.width, h = swap ? img.width : img.height;
    var sc = Math.min(1, 4000 / Math.max(w, h));
    w = Math.max(1, Math.round(w * sc)); h = Math.max(1, Math.round(h * sc));
    var iw = img.width * sc, ih = img.height * sc;
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var cx = c.getContext('2d');
    cx.translate(w / 2, h / 2);
    cx.rotate(deg * Math.PI / 180);
    cx.scale(p.flipH ? -1 : 1, p.flipV ? -1 : 1);
    cx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
    return c;
  }
});

/* ============================================================
   3. 图片信息查看
   ============================================================ */
IM({ id: 'imginfo', name: '图片信息查看', icon: '📐', tint: '#D9E8F0',
  desc: '查看宽高、格式、体积、宽高比、主色、透明度与编码体积估算',
  tags: '图片 信息 宽高 尺寸 分辨率 主色 透明度 体积',
  noSave: true,
  params: function () {
    return '<div class="hint" style="margin:0 2px 4px">仅在本机读取图片信息，不上传任何内容；编码体积基于缩略图估算。</div>';
  },
  process: function (img, p, host) {
    var fi = host.querySelector('#im-file');
    var f = fi && fi.files ? fi.files[0] : null;
    var tw = Math.min(360, img.width), th = Math.round(tw * img.height / img.width);
    if (th > 360) { th = 360; tw = Math.round(th * img.width / img.height); }
    var thumb = H.drawToCanvas(img, Math.max(1, tw), Math.max(1, th));
    var s = H.drawToCanvas(img, 16, 16), d = s.getContext('2d').getImageData(0, 0, 16, 16).data;
    var r = 0, g = 0, b = 0, trans = 0, i, n = d.length / 4;
    for (i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; if (d[i + 3] < 250) trans++; }
    r = Math.round(r / n); g = Math.round(g / n); b = Math.round(b / n);
    var hex = H.rgb2hex(r, g, b);
    var gcd = function (a, bb) { return bb ? gcd(bb, a % bb) : a; };
    var q = gcd(img.width, img.height) || 1;
    var enc = {};
    ['image/png', 'image/jpeg', 'image/webp'].forEach(function (m) {
      try { enc[m.split('/')[1].toUpperCase()] = fmtSize(Math.round(thumb.toDataURL(m, 0.9).length * .75)); }
      catch (e) { enc[m.split('/')[1].toUpperCase()] = '不支持'; }
    });
    var rows = [
      ['文件名', esc(f ? f.name : '—')],
      ['文件类型', esc((f && f.type) || '未知（由文件内容解析）')],
      ['文件体积', f ? fmtSize(f.size) : '—'],
      ['原始尺寸', img.width + ' × ' + img.height + ' px'],
      ['宽高比', (img.width / q) + ' : ' + (img.height / q) + '（约 ' + (img.width / img.height).toFixed(3) + '）'],
      ['像素总量', (img.width * img.height / 1000000).toFixed(2) + ' MP'],
      ['方向', img.width > img.height ? '横图' : img.width < img.height ? '竖图' : '正方形'],
      ['平均主色', '<span style="display:inline-block;width:44px;height:16px;border-radius:4px;vertical-align:middle;background:' + hex + ';box-shadow:inset 0 0 0 1px rgba(128,128,128,.3)"></span> ' + hex + ' / rgb(' + r + ',' + g + ',' + b + ')'],
      ['透明像素', trans ? '抽样发现 ' + Math.round(trans / n * 100) + '% 半透明 / 透明像素' : '抽样未发现透明像素'],
      ['缩略图编码体积', 'PNG ' + enc.PNG + ' · JPEG ' + enc.JPEG + ' · WebP ' + enc.WEBP]
    ];
    return { canvas: thumb, html: H.kv(rows, '图片信息') };
  }
});

/* ============================================================
   4. 图片哈希与相似度（aHash / dHash）
   ============================================================ */
function imgBits(img, mode) {
  var w = mode === 'dhash' ? 9 : 8, h = 8;
  var c = H.drawToCanvas(img, w, h), d = c.getContext('2d').getImageData(0, 0, w, h).data;
  var gray = [], i;
  for (i = 0; i < w * h; i++) gray.push(.299 * d[i * 4] + .587 * d[i * 4 + 1] + .114 * d[i * 4 + 2]);
  var bits = '';
  if (mode === 'dhash') {
    for (var y = 0; y < h; y++) for (var x = 0; x < w - 1; x++) {
      bits += gray[y * w + x] > gray[y * w + x + 1] ? '1' : '0';
    }
  } else {
    var avg = 0;
    for (i = 0; i < gray.length; i++) avg += gray[i];
    avg /= gray.length;
    for (i = 0; i < gray.length; i++) bits += gray[i] > avg ? '1' : '0';
  }
  var hex = '';
  for (i = 0; i < bits.length; i += 4) hex += parseInt(bits.substr(i, 4), 2).toString(16);
  return { bits: bits, hex: hex.toUpperCase() };
}
function ham(a, b) {
  var n = Math.min(a.length, b.length), c = 0;
  for (var i = 0; i < n; i++) if (a.charAt(i) !== b.charAt(i)) c++;
  return c + Math.abs(a.length - b.length);
}

T({ id: 'imghash', name: '图片哈希与相似度', cat: 'image', icon: '#️⃣', tint: '#D9E8F0',
  desc: '计算图片感知哈希（aHash / dHash），可对比两张图的相似程度，纯本地计算',
  tags: '图片 哈希 aHash dHash 感知哈希 相似度 去重 查重',
  note: '感知哈希对缩放、轻微压缩不敏感，常用于图片去重；对内容完全不同的图片仍可能出现碰撞，仅作参考。',
  custom: function (host, api) {
    host.innerHTML =
      '<div class="field-row"><div class="field"><label>图片 A</label>' +
        '<input class="input" type="file" id="ih-a" accept="image/*"></div>' +
        '<div class="field"><label>图片 B（可选，用于对比）</label>' +
        '<input class="input" type="file" id="ih-b" accept="image/*"></div></div>' +
      '<div class="field"><label>哈希算法</label><select class="input" id="ih-mode">' +
        '<option value="dhash">dHash 差值哈希（推荐，抗亮度变化）</option>' +
        '<option value="ahash">aHash 均值哈希</option>' +
        '<option value="both">两种都算</option></select></div>' +
      '<div class="btn-row"><button class="btn full" id="ih-go">计算哈希 / 对比</button></div>' +
      '<div class="result empty" id="ih-out">结果会显示在这里</div>';
    var out = host.querySelector('#ih-out');
    host.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('#ih-go')) return;
      var fa = host.querySelector('#ih-a').files[0], fb = host.querySelector('#ih-b').files[0];
      if (!fa) { api.toast('请至少选择图片 A'); return; }
      var mode = host.querySelector('#ih-mode').value;
      H.readImage(fa, function (err, imgA) {
        if (err) { api.toast(err.message); return; }
        function finish(imgB) {
          try {
            var modes = mode === 'both' ? ['ahash', 'dhash'] : [mode];
            var rows = [], html = '', pair = [];
            modes.forEach(function (m) {
              var A = imgBits(imgA, m), B = imgB ? imgBits(imgB, m) : null;
              rows.push([m.toUpperCase() + ' · 图片 A', A.hex]);
              if (B) {
                var dist = ham(A.bits, B.bits), sim = A.bits.length ? (1 - dist / A.bits.length) * 100 : 0;
                rows.push([m.toUpperCase() + ' · 图片 B', B.hex]);
                rows.push(['汉明距离', dist + ' / ' + A.bits.length + ' bit']);
                rows.push(['相似度', sim.toFixed(1) + '%' + (sim >= 90 ? '（高度相似，可能是同一张图）' : sim >= 70 ? '（较相似）' : '（差异较大）')]);
                pair.push(sim);
              }
            });
            html = '<div style="display:flex;gap:10px;margin-bottom:12px">' +
              '<div style="flex:1;text-align:center"><div style="font-size:11px;font-weight:600;margin-bottom:4px">图片 A</div>' + H.canvasHTML(H.drawToCanvas(imgA, 160, Math.max(1, Math.round(160 * imgA.height / imgA.width)))) + '</div>' +
              (imgB ? '<div style="flex:1;text-align:center"><div style="font-size:11px;font-weight:600;margin-bottom:4px">图片 B</div>' + H.canvasHTML(H.drawToCanvas(imgB, 160, Math.max(1, Math.round(160 * imgB.height / imgB.width)))) + '</div>' : '') +
              '</div>' + H.kv(rows, '感知哈希结果') +
              '<div class="hint" style="margin-top:10px">哈希仅在本机计算，图片不会上传。位数 64 bit（16 位十六进制）。</div>';
            out.classList.remove('empty'); out.innerHTML = html;
            out._text = rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');
            api.toast(imgB ? '对比完成' : '哈希计算完成');
          } catch (er) { api.toast('计算失败：' + er.message); }
        }
        if (fb) H.readImage(fb, function (e2, imgB) { if (e2) api.toast(e2.message); finish(e2 ? null : imgB); });
        else finish(null);
      });
    });
  }
});

})();
