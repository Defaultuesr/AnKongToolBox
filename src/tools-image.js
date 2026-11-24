/* ============================================================
   安空工具箱 — 颜色 / 图片工具
   ============================================================ */

/* 通用图片工具构造器：文件选择 → 参数 → 处理 → 预览 → 保存 */
function IM(cfg) {
  return T({
    id: cfg.id, name: cfg.name, cat: cfg.cat || 'image', icon: cfg.icon,
    tint: cfg.tint || '#F0E0FF', desc: cfg.desc, tags: cfg.tags, note: cfg.note,
    custom: function (host, api) {
      host.innerHTML =
        (cfg.noFile ? '' : '<div class="field"><label>选择图片</label><input class="input" type="file" id="im-file" accept="image/*"></div>') +
        (cfg.params || function () { return ''; })() +
        '<div class="btn-row"><button class="btn full" data-go>' + (cfg.btn || '开始处理') + '</button></div>' +
        '<div class="preview-box" id="im-out"><span style="color:var(--on-surface-variant);font-size:13px">处理后预览</span></div>' +
        (cfg.noSave ? '' : '<div class="btn-row"><button class="btn tonal full" data-dl="' + (cfg.filename || 'ankong.png') + '">保存 / 下载图片</button></div>');
      var canvas = null;
      function pget() {
        var o = {};
        host.querySelectorAll('[data-p]').forEach(function (el) {
          var k = el.getAttribute('data-p');
          o[k] = el.tagName === 'BUTTON' ? el.classList.contains('on')
            : el.type === 'checkbox' ? el.checked
            : (el.type === 'range' || el.type === 'number') ? Number(el.value) : el.value;
        });
        return o;
      }
      host.addEventListener('click', function (e) {
        var dl = e.target.closest('[data-dl]');
        if (dl) {
          if (!canvas) { api.toast('请先生成图片'); return; }
          try {
            var mime = cfg.mime ? cfg.mime(pget()) : 'image/png';
            api.download(canvas.toDataURL(mime, 0.92), dl.getAttribute('data-dl'));
          } catch (err) { api.toast('保存失败：' + err.message); }
          return;
        }
        if (!e.target.closest('[data-go]')) return;
        function go(img) {
          try {
            var r = cfg.process(img, pget(), host);
            canvas = r.canvas || r;
            var out = host.querySelector('#im-out');
            out.innerHTML = H.canvasHTML(canvas) + (r.html || '');
            if (r.after) r.after(out, api);
            api.toast('处理完成');
          } catch (err) { api.toast('处理失败：' + err.message); }
        }
        if (cfg.noFile) { go(null); return; }
        var f = host.querySelector('#im-file').files[0];
        H.readImage(f, function (err, img) { if (err) api.toast(err.message); else go(img); });
      });
      if (cfg.init) cfg.init(host, api);
    }
  });
}

T({ id: 'color', name: '颜色转换', cat: 'image', icon: '🎨', tint: '#F0E0FF',
  desc: 'HEX / RGB / HSL / CMYK 互转与对比色', tags: '颜色 hex rgb hsl 取色 调色',
  fields: [
    { k: 'hex', label: 'HEX 颜色', type: 'color', value: '#6750A4' },
    { k: 'mode', label: '输出', type: 'select', options: [['all','全部信息'],['rgb','RGB'],['hsl','HSL'],['cmyk','CMYK'],['complement','互补 / 对比色']] }
  ],
  live: true,
  run: function (v) {
    var rgb = H.hex2rgb(v.hex), hsl = H.rgb2hsl.apply(null, rgb), hex = H.rgb2hex.apply(null, rgb);
    var r = rgb[0]/255, g = rgb[1]/255, b = rgb[2]/255, k = 1 - Math.max(r,g,b);
    var cmyk = k === 1 ? [0,0,0,100] : [(1-r-k)/(1-k)*100, (1-g-k)/(1-k)*100, (1-b-k)/(1-k)*100, k*100];
    var comp = H.rgb2hex(255-rgb[0], 255-rgb[1], 255-rgb[2]);
    var text = H.luminance(hex) > .4 ? '#1d1b20' : '#ffffff';
    var sw = '<div style="height:64px;border-radius:16px;background:' + hex + ';color:' + text +
      ';display:grid;place-items:center;font-weight:700;margin-bottom:12px">' + hex + '</div>';
    if (v.mode === 'rgb') return { html: sw, text: 'rgb(' + rgb.join(', ') + ')' };
    if (v.mode === 'hsl') return { html: sw, text: 'hsl(' + hsl[0] + ', ' + hsl[1] + '%, ' + hsl[2] + '%)' };
    if (v.mode === 'cmyk') return { html: sw, text: 'cmyk(' + cmyk.map(function (x) { return Math.round(x); }).join('%, ') + '%)' };
    if (v.mode === 'complement') return { html: sw + '<div style="height:48px;border-radius:14px;background:' + comp +
      ';display:grid;place-items:center;color:' + (H.luminance(comp) > .4 ? '#1d1b20' : '#fff') + ';font-weight:600">' + comp + ' 互补色</div>',
      text: '互补色 ' + comp };
    return { html: sw + H.kv([
      ['HEX', hex], ['RGB', 'rgb(' + rgb.join(', ') + ')'], ['HSL', 'hsl(' + hsl[0] + ', ' + hsl[1] + '%, ' + hsl[2] + '%)'],
      ['CMYK', cmyk.map(function (x) { return Math.round(x) + '%'; }).join(' / ')],
      ['互补色', comp], ['相对亮度', H.luminance(hex).toFixed(4)],
      ['建议文字色', text === '#1d1b20' ? '深色文字' : '浅色文字'], ['互补色块', '<span style="display:inline-block;width:36px;height:16px;border-radius:4px;background:' + comp + '"></span>']
    ]), text: hex + ' / rgb(' + rgb.join(',') + ') / hsl(' + hsl.join(',') + ')' };
  }
});

T({ id: 'palette', name: '配色方案', cat: 'image', icon: '🌈', tint: '#F0E0FF',
  desc: '由基色生成互补、类似、三色配色', tags: '配色 色卡 调色板 设计',
  fields: [
    { k: 'hex', label: '基色', type: 'color', value: '#6750A4' },
    { k: 'scheme', label: '方案', type: 'select', options: [
      ['complement','互补色'],['analogous','类似色'],['triadic','三角色'],['split','分裂互补'],
      ['mono','单色阶'],['pastel','柔和粉彩']] }
  ],
  run: function (v) {
    var rgb = H.hex2rgb(v.hex), hsl = H.rgb2hsl.apply(null, rgb), h = hsl[0], s = hsl[1], l = hsl[2];
    var hs = [], names = [];
    if (v.scheme === 'complement') hs = [h, (h+180)%360];
    else if (v.scheme === 'analogous') hs = [h, (h+30)%360, (h+330)%360, (h+60)%360, (h+300)%360];
    else if (v.scheme === 'triadic') hs = [h, (h+120)%360, (h+240)%360];
    else if (v.scheme === 'split') hs = [h, (h+150)%360, (h+210)%360];
    else if (v.scheme === 'mono') hs = [h,h,h,h,h];
    else hs = [h, (h+40)%360, (h+80)%360, (h+200)%360, (h+280)%360];
    var colors = hs.map(function (hh, i) {
      var ss = v.scheme === 'pastel' ? Math.min(s, 45) : v.scheme === 'mono' ? s : s;
      var ll = v.scheme === 'mono' ? Math.min(92, 20 + i*18) : v.scheme === 'pastel' ? Math.min(88, l + 18) : l;
      return H.rgb2hex.apply(null, H.hsl2rgb(hh, ss, ll));
    });
    var blocks = colors.map(function (c) {
      return '<div style="flex:1;text-align:center"><div data-copy-color="' + c + '" style="height:66px;border-radius:14px;background:' + c +
        ';box-shadow:inset 0 0 0 1px rgba(128,128,128,.15);cursor:pointer"></div>' +
        '<div style="font-size:11px;margin-top:6px;font-weight:600">' + c + '</div></div>';
    }).join('');
    return { html: '<div style="display:flex;gap:8px;margin:6px 0 14px">' + blocks + '</div>' +
      '<div class="hint" style="margin:0 2px">点击色块复制色值 · 共 ' + colors.length + ' 色</div>',
      text: colors.join('\n') };
  }
});

IM({ id: 'imgcompress', name: '图片压缩', icon: '🗜️', desc: '按质量与尺寸压缩图片，减小体积', tags: '图片 压缩 体积 优化',
  filename: 'ankong-compressed.jpg',
  params: function () {
    return '<div class="field"><label>压缩质量 <span id="q-lab">70</span>%</label>' +
      '<input type="range" data-p="q" min="10" max="100" step="5" value="70"></div>' +
      '<div class="field"><label>最大边长（px，0 为不缩放）</label><input class="input" type="number" data-p="max" value="1600"></div>' +
      '<div class="field"><label>输出格式</label><select class="input" data-p="fmt">' +
      '<option value="image/jpeg">JPEG（体积最小）</option><option value="image/webp">WebP</option><option value="image/png">PNG（无损）</option></select></div>';
  },
  init: function (host) {
    var r = host.querySelector('[data-p="q"]');
    r.addEventListener('input', function () { host.querySelector('#q-lab').textContent = r.value; });
  },
  mime: function (p) { return p.fmt || 'image/jpeg'; },
  process: function (img, p) {
    var scale = p.max > 0 ? Math.min(1, p.max / Math.max(img.width, img.height)) : 1;
    var c = H.drawToCanvas(img, img.width*scale, img.height*scale);
    if (p.fmt === 'image/jpeg') {
      var w = document.createElement('canvas'); w.width = c.width; w.height = c.height;
      var cx = w.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0,0,w.width,w.height); cx.drawImage(c,0,0); c = w;
    }
    return c;
  }
});

IM({ id: 'imgcrop', name: '图片裁剪', icon: '✂️', desc: '按比例居中裁剪，常用社交尺寸', tags: '图片 裁剪 比例 头像',
  filename: 'ankong-crop.png',
  params: function () {
    return '<div class="field"><label>裁剪比例</label><select class="input" data-p="ratio">' +
      [['1:1','1:1 正方形'],['4:3','4:3'],['3:4','3:4'],['16:9','16:9'],['9:16','9:16 竖屏'],['3:2','3:2'],['free','保持原图比例']].map(function (o) {
        return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>输出宽度（px）</label><input class="input" type="number" data-p="w" value="1080"></div>';
  },
  process: function (img, p) {
    var r = p.ratio === 'free' ? img.width / img.height : parseFloat(p.ratio.split(':')[0]) / parseFloat(p.ratio.split(':')[1]);
    var sw, sh;
    if (img.width / img.height > r) { sh = img.height; sw = sh * r; } else { sw = img.width; sh = sw / r; }
    var sx = (img.width - sw)/2, sy = (img.height - sh)/2;
    var w = Math.max(1, Math.min(4096, p.w || 1080)), h = Math.round(w / r);
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
    return c;
  }
});

IM({ id: 'resize', name: '图片尺寸调整', icon: '📏', desc: '按指定宽高缩放图片', tags: '图片 尺寸 缩放 分辨率',
  filename: 'ankong-resize.png',
  params: function () {
    return '<div class="field-row"><div class="field"><label>宽度 (px)</label><input class="input" type="number" data-p="w" value="1080"></div>' +
      '<div class="field"><label>高度 (px)</label><input class="input" type="number" data-p="h" value="0"></div></div>' +
      '<div class="switch-row"><div><div class="st">保持宽高比</div><div class="sd">填一个尺寸，另一个自动计算</div></div>' +
      '<button class="toggle on" data-p="keep" type="button" role="switch"></button></div>';
  },
  init: function (host) {
    var t = host.querySelector('[data-p="keep"]');
    t.addEventListener('click', function () { t.classList.toggle('on'); });
  },
  process: function (img, p) {
    var keep = p.keep === true;
    var w = p.w || 0, h = p.h || 0;
    if (keep) { if (w && !h) h = Math.round(w * img.height / img.width); else if (h && !w) w = Math.round(h * img.width / img.height); }
    if (!w || !h) throw new Error('请填写宽度或高度');
    return H.drawToCanvas(img, Math.min(6000, w), Math.min(6000, h));
  }
});

IM({ id: 'imgformat', name: '图片格式转换', icon: '🔄', desc: 'PNG / JPEG / WebP 互转', tags: '图片 格式 png jpg webp 转换',
  filename: 'ankong-convert.png',
  params: function () {
    return '<div class="field"><label>目标格式</label><select class="input" data-p="fmt">' +
      '<option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></div>';
  },
  mime: function (p) { return p.fmt; },
  process: function (img, p) {
    var c = H.drawToCanvas(img, img.width, img.height);
    if (p.fmt === 'image/jpeg') {
      var w = document.createElement('canvas'); w.width = c.width; w.height = c.height;
      var cx = w.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0,0,w.width,w.height); cx.drawImage(c,0,0); c = w;
    }
    return c;
  }
});

IM({ id: 'sketch', name: '图片转素描', icon: '✏️', desc: '边缘检测生成铅笔素描效果', tags: '图片 素描 铅笔画 滤镜',
  filename: 'ankong-sketch.png',
  params: function () {
    return '<div class="field"><label>线条强度 <span id="sk-lab">1.0</span></label>' +
      '<input type="range" data-p="k" min="5" max="30" step="1" value="12"></div>' +
      '<div class="switch-row"><div><div class="st">反相（黑底白线）</div></div>' +
      '<button class="toggle" data-p="inv" type="button" role="switch"></button></div>';
  },
  init: function (host) {
    var r = host.querySelector('[data-p="k"]'), inv = host.querySelector('[data-p="inv"]');
    r.addEventListener('input', function () { host.querySelector('#sk-lab').textContent = (r.value/12).toFixed(1); });
    inv.addEventListener('click', function () { inv.classList.toggle('on'); });
  },
  process: function (img, p) {
    var maxSide = 1400, scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    var w = Math.max(1, Math.round(img.width*scale)), h = Math.max(1, Math.round(img.height*scale));
    var c = H.drawToCanvas(img, w, h), cx = c.getContext('2d');
    var src = cx.getImageData(0,0,w,h), d = src.data, gray = new Float32Array(w*h);
    for (var i = 0; i < w*h; i++) gray[i] = .299*d[i*4] + .587*d[i*4+1] + .114*d[i*4+2];
    var out = cx.createImageData(w,h), od = out.data, k = (p.k || 12)/12;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var gx = 0, gy = 0;
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        var xx = Math.min(w-1, Math.max(0, x+dx)), yy = Math.min(h-1, Math.max(0, y+dy));
        var val = gray[yy*w+xx], kernelX = [-1,0,1,-2,0,2,-1,0,1][(dy+1)*3+(dx+1)], kernelY = [-1,-2,-1,0,0,0,1,2,1][(dy+1)*3+(dx+1)];
        gx += val*kernelX; gy += val*kernelY;
      }
      var e = Math.min(255, Math.sqrt(gx*gx + gy*gy) * k * .5);
      var v = p.inv ? e : 255 - e;
      var idx = (y*w+x)*4; od[idx] = od[idx+1] = od[idx+2] = v; od[idx+3] = 255;
    }
    cx.putImageData(out,0,0);
    return c;
  }
});

IM({ id: 'watermark', name: '图片加水印', icon: '💧', desc: '给图片添加文字水印', tags: '图片 水印 文字 版权',
  filename: 'ankong-watermark.png',
  params: function () {
    return '<div class="field"><label>水印文字</label><input class="input" type="text" data-p="text" value="© 安空工具箱"></div>' +
      '<div class="field-row"><div class="field"><label>位置</label><select class="input" data-p="pos">' +
      [['lb','左下'],['rb','右下'],['lt','左上'],['rt','右上'],['center','居中']].map(function (o) { return '<option value="'+o[0]+'">'+o[1]+'</option>'; }).join('') +
      '</select></div><div class="field"><label>文字颜色</label><input type="color" data-p="color" value="#FFFFFF"></div></div>' +
      '<div class="field"><label>字号相对大小 <span id="wm-lab">3</span>%</label><input type="range" data-p="size" min="1" max="10" value="3"></div>' +
      '<div class="field"><label>不透明度 <span id="wo-lab">70</span>%</label><input type="range" data-p="alpha" min="10" max="100" value="70"></div>';
  },
  init: function (host) {
    ['size','alpha'].forEach(function (k) {
      var r = host.querySelector('[data-p="'+k+'"]');
      r.addEventListener('input', function () { host.querySelector('#' + (k === 'size' ? 'wm' : 'wo') + '-lab').textContent = r.value; });
    });
  },
  process: function (img, p) {
    var scale = Math.min(1, 2000/Math.max(img.width,img.height));
    var c = H.drawToCanvas(img, img.width*scale, img.height*scale), cx = c.getContext('2d');
    var fs = Math.max(12, c.width * (p.size||3)/100);
    cx.font = '600 ' + fs + 'px sans-serif';
    cx.globalAlpha = (p.alpha||70)/100;
    cx.fillStyle = p.color || '#fff';
    cx.shadowColor = 'rgba(0,0,0,.5)'; cx.shadowBlur = fs/4;
    var m = fs, tw = cx.measureText(p.text || '').width;
    var x = /l/.test(p.pos) ? m : /r/.test(p.pos) ? c.width - tw - m : (c.width - tw)/2;
    var y = /t/.test(p.pos) ? m + fs : p.pos === 'center' ? c.height/2 : c.height - m;
    cx.fillText(p.text || '', x, y);
    return c;
  }
});

/* 九宫格切图：单独实现，输出 9 张 */
T({ id: 'ninegrid', name: '九宫格切图', cat: 'image', icon: '🔲', tint: '#F0E0FF',
  desc: '把一张图切成 9 张，方便社交平台发布', tags: '九宫格 切图 图片 朋友圈',
  custom: function (host, api) {
    host.innerHTML = '<div class="field"><label>选择图片</label><input class="input" type="file" id="ng-file" accept="image/*"></div>' +
      '<div class="field"><label>裁切方式</label><select class="input" id="ng-mode">' +
      '<option value="square">先居中裁成正方形</option><option value="keep">保持原图比例</option></select></div>' +
      '<div class="btn-row"><button class="btn full" data-go>开始切图</button></div>' +
      '<div id="ng-out" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px"></div>';
    var parts = [];
    host.addEventListener('click', function (e) {
      var save = e.target.closest('[data-save]');
      if (save) {
        var c = parts[+save.getAttribute('data-save')];
        if (c) api.download(c.toDataURL('image/png'), 'ankong-grid-' + (+save.getAttribute('data-save')+1) + '.png');
        return;
      }
      if (!e.target.closest('[data-go]')) return;
      H.readImage(host.querySelector('#ng-file').files[0], function (err, img) {
        if (err) { api.toast(err.message); return; }
        var sw = img.width, sh = img.height, sx = 0, sy = 0;
        if (host.querySelector('#ng-mode').value === 'square') {
          var side = Math.min(sw, sh); sw = sh = side; sx = (img.width-side)/2; sy = (img.height-side)/2;
        }
        var cw = Math.floor(sw/3), ch = Math.floor(sh/3);
        parts = [];
        for (var r = 0; r < 3; r++) for (var col = 0; col < 3; col++) {
          var c = document.createElement('canvas'); c.width = cw; c.height = ch;
          c.getContext('2d').drawImage(img, sx + col*cw, sy + r*ch, cw, ch, 0, 0, cw, ch);
          parts.push(c);
        }
        host.querySelector('#ng-out').innerHTML = parts.map(function (c, i) {
          return '<div style="text-align:center"><img src="' + c.toDataURL('image/png') + '" style="width:100%;border-radius:6px;display:block">' +
            '<button class="btn sm tonal" style="min-height:28px;padding:0 8px;margin-top:4px;font-size:11px" data-save="' + i + '">保存 ' + (i+1) + '</button></div>';
        }).join('');
        api.toast('已切成 9 张，点每张下方按钮保存');
      });
    });
  }
});

/* 图片取色 */
T({ id: 'colorpick', name: '图片取色', cat: 'image', icon: '💉', tint: '#F0E0FF',
  desc: '点击图片取像素颜色，提取主色调', tags: '取色 图片 颜色 主色调',
  custom: function (host, api) {
    host.innerHTML = '<div class="field"><label>选择图片</label><input class="input" type="file" id="cp-file" accept="image/*"></div>' +
      '<div class="btn-row"><button class="btn tonal" data-main>提取主色调</button></div>' +
      '<div class="preview-box" id="cp-out" style="padding:0;overflow:hidden"><span style="color:var(--on-surface-variant);font-size:13px;padding:20px">加载图片后点击取色</span></div>' +
      '<div id="cp-info" style="margin-top:12px"></div>';
    var cv = null;
    function showColor(hex) {
      host.querySelector('#cp-info').innerHTML = '<div class="color-row"><span class="color-swatch" style="background:' + hex + '"></span>' +
        '<div style="flex:1"><div style="font-size:16px;font-weight:700">' + hex + '</div>' +
        '<div class="hint" style="margin:2px 0 0">点击色值可复制</div></div>' +
        '<button class="btn sm tonal" data-copy="' + hex + '">复制</button></div>';
    }
    host.querySelector('#cp-file').addEventListener('change', function (e) {
      H.readImage(e.target.files[0], function (err, img) {
        if (err) { api.toast(err.message); return; }
        var scale = Math.min(1, 1200/Math.max(img.width,img.height));
        cv = H.drawToCanvas(img, img.width*scale, img.height*scale);
        host.querySelector('#cp-out').innerHTML = '';
        cv.style.maxWidth = '100%'; cv.style.cursor = 'crosshair';
        host.querySelector('#cp-out').appendChild(cv);
        cv.addEventListener('click', function (ev) {
          var rect = cv.getBoundingClientRect();
          var x = Math.floor((ev.clientX - rect.left) / rect.width * cv.width);
          var y = Math.floor((ev.clientY - rect.top) / rect.height * cv.height);
          var d = cv.getContext('2d').getImageData(Math.max(0,x), Math.max(0,y), 1, 1).data;
          showColor(H.rgb2hex(d[0], d[1], d[2]));
        });
      });
    });
    host.addEventListener('click', function (e) {
      var cp = e.target.closest('[data-copy]');
      if (cp) { api.copy(cp.getAttribute('data-copy')); return; }
      if (!e.target.closest('[data-main]') || !cv) { if (e.target.closest('[data-main]')) api.toast('请先选择图片'); return; }
      var d = cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data, buckets = {};
      for (var i = 0; i < d.length; i += 4*17) {
        var key = [Math.round(d[i]/32)*32, Math.round(d[i+1]/32)*32, Math.round(d[i+2]/32)*32].join(',');
        buckets[key] = (buckets[key] || 0) + 1;
      }
      var top = Object.keys(buckets).sort(function (a,b) { return buckets[b]-buckets[a]; }).slice(0, 8)
        .map(function (k) { var a = k.split(',').map(Number); return H.rgb2hex(Math.min(255,a[0]), Math.min(255,a[1]), Math.min(255,a[2])); });
      host.querySelector('#cp-info').innerHTML = '<div style="font-weight:700;margin-bottom:8px">主色调 TOP 8</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' + top.map(function (c) {
          return '<button data-copy="' + c + '" style="background:' + c + ';width:44px;height:44px;border-radius:12px;border:1px solid var(--outline-variant)"></button>';
        }).join('') + '</div><div class="hint" style="margin-top:8px">点击色块复制 · ' + top.join(' / ') + '</div>';
    });
  }
});

/* 图片转 Base64 */
T({ id: 'img2base64', name: '图片转 Base64', cat: 'image', icon: '🧬', tint: '#F0E0FF',
  desc: '把图片编码为 Data URL 文本', tags: 'base64 图片 dataurl 编码',
  custom: function (host, api) {
    host.innerHTML = '<div class="field"><label>选择图片</label><input class="input" type="file" id="i2b-file" accept="image/*"></div>' +
      '<div class="btn-row"><button class="btn full" data-go>转换</button></div>' +
      '<div class="result empty" id="i2b-out">结果会显示在这里</div>' +
      '<div class="btn-row" style="margin-top:10px"><button class="btn tonal full" data-copy>复制结果</button></div>';
    var text = '';
    host.addEventListener('click', function (e) {
      if (e.target.closest('[data-copy]')) { api.copy(text); return; }
      if (!e.target.closest('[data-go]')) return;
      var f = host.querySelector('#i2b-file').files[0];
      if (!f) { api.toast('请先选择图片'); return; }
      var fr = new FileReader();
      fr.onload = function () {
        text = fr.result;
        host.querySelector('#i2b-out').classList.remove('empty');
        host.querySelector('#i2b-out').innerHTML = '<div style="font-size:12px;color:var(--on-surface-variant);margin-bottom:8px">' +
          f.name + ' · ' + (f.size/1024).toFixed(1) + ' KB → ' + (text.length/1024).toFixed(1) + ' KB 文本</div>' +
          '<div style="word-break:break-all;font-size:11px;max-height:220px;overflow:auto">' + H.esc(text.slice(0, 1200)) +
          (text.length > 1200 ? '…（已截断显示，复制可获得完整内容）' : '') + '</div>';
        api.toast('转换完成');
      };
      fr.readAsDataURL(f);
    });
  }
});

T({ id: 'base642img', name: 'Base64 转图片', cat: 'image', icon: '🖼️', tint: '#F0E0FF',
  desc: '把 Data URL / Base64 还原成图片预览', tags: 'base64 图片 解码 预览',
  fields: [{ k: 'text', label: 'Data URL 或纯 Base64', type: 'textarea', rows: 4, placeholder: 'data:image/png;base64,iVBOR...' }],
  copyable: false,
  run: function (v) {
    var s = String(v.text || '').trim().replace(/\s/g, '');
    if (!s) throw new Error('请输入 Base64 内容');
    var url = /^data:image\//.test(s) ? s : 'data:image/png;base64,' + s;
    return { html: '<img src="' + url + '" style="max-width:100%;border-radius:12px" alt="预览" onerror="this.outerHTML=\'<span style=color:var(--error)>图片解码失败，请检查 Base64 内容</span>\'">' , text: url };
  }
});

/* 二维码生成（内嵌 qrcode-generator，MIT） */
T({ id: 'qrcode', name: '二维码生成', cat: 'image', icon: '🔳', tint: '#F0E0FF',
  desc: '把文字、网址生成二维码，可保存', tags: '二维码 qrcode 生成 网址',
  custom: function (host, api) {
    host.innerHTML = '<div class="field"><label>内容</label><textarea class="input" id="qr-text" rows="3" placeholder="输入文字或网址">https://example.com</textarea></div>' +
      '<div class="field-row"><div class="field"><label>纠错级别</label><select class="input" id="qr-ec">' +
      '<option value="M">M（推荐）</option><option value="L">L（容量最大）</option><option value="Q">Q</option><option value="H">H（最耐损）</option></select></div>' +
      '<div class="field"><label>尺寸 (px)</label><input class="input" type="number" id="qr-size" value="480"></div></div>' +
      '<div class="field-row"><div class="field"><label>前景色</label><input type="color" id="qr-fg" value="#1D1B20"></div>' +
      '<div class="field"><label>背景色</label><input type="color" id="qr-bg" value="#FFFFFF"></div></div>' +
      '<div class="btn-row"><button class="btn full" data-go>生成二维码</button></div>' +
      '<div class="qr-box" id="qr-out"><span style="color:var(--on-surface-variant);font-size:13px">二维码预览</span></div>' +
      '<div class="btn-row"><button class="btn tonal full" data-save>保存二维码</button></div>';
    var cv = null;
    function build() {
      var text = host.querySelector('#qr-text').value;
      if (!text) { api.toast('请输入内容'); return; }
      if (typeof qrcode === 'undefined') { api.toast('二维码组件未加载'); return; }
      try {
        if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
        var qr = qrcode(0, host.querySelector('#qr-ec').value);
        qr.addData(text, 'Byte'); qr.make();
        var n = qr.getModuleCount(), size = Math.max(128, Math.min(1200, +host.querySelector('#qr-size').value || 480));
        var quiet = 4, cell = Math.floor(size / (n + quiet*2)), px = cell * (n + quiet*2);
        cv = document.createElement('canvas'); cv.width = px; cv.height = px;
        var cx = cv.getContext('2d');
        cx.fillStyle = host.querySelector('#qr-bg').value; cx.fillRect(0,0,px,px);
        cx.fillStyle = host.querySelector('#qr-fg').value;
        for (var r = 0; r < n; r++) for (var c = 0; c < n; c++)
          if (qr.isDark(r,c)) cx.fillRect((c+quiet)*cell, (r+quiet)*cell, cell, cell);
        host.querySelector('#qr-out').innerHTML = ''; host.querySelector('#qr-out').appendChild(cv);
        api.toast('已生成（版本 ' + qr.getModuleCount() + ' 模块）');
      } catch (err) { api.toast('生成失败：' + err.message); }
    }
    host.addEventListener('click', function (e) {
      if (e.target.closest('[data-go]')) build();
      if (e.target.closest('[data-save]')) {
        if (!cv) { api.toast('请先生成二维码'); return; }
        api.download(cv.toDataURL('image/png'), 'ankong-qrcode.png');
      }
    });
    build();
  }
});

/* 渐变壁纸生成器 —— 本地原创生成，替代在线壁纸库 */
T({ id: 'wallpaper', name: '壁纸生成', cat: 'image', icon: '🌄', tint: '#F0E0FF',
  desc: '生成原创渐变壁纸，支持手机分辨率', tags: '壁纸 渐变 桌面 锁屏 原创',
  note: '壁纸由本地算法实时生成，原创且无版权顾虑；可更换颜色与风格反复生成。',
  custom: function (host, api) {
    host.innerHTML = '<div class="field-row"><div class="field"><label>起始色</label><input type="color" id="wp-a" value="#6750A4"></div>' +
      '<div class="field"><label>结束色</label><input type="color" id="wp-b" value="#FF8A65"></div></div>' +
      '<div class="field"><label>分辨率</label><select class="input" id="wp-size">' +
      [['1080x2400','1080 × 2400（常见手机）'],['1440x3200','1440 × 3200（2K）'],['1080x1920','1080 × 1920'],['720x1280','720 × 1280'],['1080x1080','1080 × 1080（方形）']].map(function (o) {
        return '<option value="'+o[0]+'">'+o[1]+'</option>'; }).join('') + '</select></div>' +
      '<div class="field"><label>风格</label><select class="input" id="wp-style">' +
      [['linear','线性渐变'],['radial','径向光晕'],['mesh','柔和网格'],['rings','同心光环']].map(function (o) { return '<option value="'+o[0]+'">'+o[1]+'</option>'; }).join('') + '</select></div>' +
      '<div class="btn-row"><button class="btn full" data-go>生成壁纸</button>' +
      '<button class="btn tonal" data-rand>随机配色</button></div>' +
      '<div class="preview-box" id="wp-out" style="padding:8px"><span style="color:var(--on-surface-variant);font-size:13px">壁纸预览</span></div>' +
      '<div class="btn-row"><button class="btn tonal full" data-save>保存壁纸</button></div>';
    var cv = null;
    function rndHex() { return '#' + Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0'); }
    function build() {
      var wh = host.querySelector('#wp-size').value.split('x').map(Number);
      var W = Math.round(wh[0]/3), Hh = Math.round(wh[1]/3);
      cv = document.createElement('canvas'); cv.width = W; cv.height = Hh;
      var cx = cv.getContext('2d'), a = host.querySelector('#wp-a').value, b = host.querySelector('#wp-b').value;
      var style = host.querySelector('#wp-style').value;
      if (style === 'radial') {
        var g = cx.createRadialGradient(W*.5, Hh*.38, 10, W*.5, Hh*.5, Math.max(W,Hh)*.8);
        g.addColorStop(0, a); g.addColorStop(1, b); cx.fillStyle = g; cx.fillRect(0,0,W,Hh);
      } else if (style === 'mesh') {
        cx.fillStyle = b; cx.fillRect(0,0,W,Hh);
        for (var i = 0; i < 7; i++) {
          var x = Math.random()*W, y = Math.random()*Hh, r = Math.max(W,Hh)*(.35 + Math.random()*.5);
          var rg = cx.createRadialGradient(x,y,0,x,y,r);
          rg.addColorStop(0, i%2 ? a : b); rg.addColorStop(1, 'rgba(0,0,0,0)');
          cx.globalAlpha = .45; cx.fillStyle = rg; cx.beginPath(); cx.arc(x,y,r,0,Math.PI*2); cx.fill();
        }
        cx.globalAlpha = 1;
      } else if (style === 'rings') {
        var lg = cx.createLinearGradient(0,0,0,Hh); lg.addColorStop(0,a); lg.addColorStop(1,b);
        cx.fillStyle = lg; cx.fillRect(0,0,W,Hh);
        cx.strokeStyle = 'rgba(255,255,255,.16)';
        for (var k = 1; k < 14; k++) { cx.lineWidth = W*.01; cx.beginPath(); cx.arc(W*.5, Hh*.46, k*W*.055, 0, Math.PI*2); cx.stroke(); }
      } else {
        var l2 = cx.createLinearGradient(0,0,W,Hh); l2.addColorStop(0,a); l2.addColorStop(1,b);
        cx.fillStyle = l2; cx.fillRect(0,0,W,Hh);
        var sh = cx.createLinearGradient(0,Hh*.6,0,Hh); sh.addColorStop(0,'rgba(0,0,0,0)'); sh.addColorStop(1,'rgba(0,0,0,.22)');
        cx.fillStyle = sh; cx.fillRect(0,0,W,Hh);
      }
      cv.style.maxHeight = '300px'; cv.style.width = 'auto'; cv.style.borderRadius = '10px';
      host.querySelector('#wp-out').innerHTML = ''; host.querySelector('#wp-out').appendChild(cv);
      api.toast('壁纸已生成');
    }
    host.addEventListener('click', function (e) {
      if (e.target.closest('[data-go]')) build();
      if (e.target.closest('[data-rand]')) { host.querySelector('#wp-a').value = rndHex(); host.querySelector('#wp-b').value = rndHex(); build(); }
      if (e.target.closest('[data-save]')) { if (!cv) { api.toast('请先生成'); return; } api.download(cv.toDataURL('image/png'), 'ankong-wallpaper.png'); }
    });
    build();
  }
});

/* 头像制作 */
T({ id: 'avatar', name: '头像制作', cat: 'image', icon: '👤', tint: '#F0E0FF',
  desc: '用文字 / emoji 生成圆形或方形头像', tags: '头像 制作 文字 emoji 原创',
  custom: function (host, api) {
    host.innerHTML = '<div class="field"><label>文字 / Emoji</label><input class="input" type="text" id="av-text" value="安"></div>' +
      '<div class="field-row"><div class="field"><label>背景色</label><input type="color" id="av-bg" value="#6750A4"></div>' +
      '<div class="field"><label>文字色</label><input type="color" id="av-fg" value="#FFFFFF"></div></div>' +
      '<div class="field"><label>形状</label><select class="input" id="av-shape">' +
      '<option value="circle">圆形</option><option value="square">圆角方形</option></select></div>' +
      '<div class="field"><label>尺寸 (px)</label><input class="input" type="number" id="av-size" value="512"></div>' +
      '<div class="btn-row"><button class="btn full" data-go>生成头像</button></div>' +
      '<div class="preview-box" id="av-out"><span style="color:var(--on-surface-variant);font-size:13px">头像预览</span></div>' +
      '<div class="btn-row"><button class="btn tonal full" data-save>保存头像</button></div>';
    var cv = null;
    function build() {
      var s = Math.max(64, Math.min(1024, +host.querySelector('#av-size').value || 512));
      cv = document.createElement('canvas'); cv.width = cv.height = s;
      var cx = cv.getContext('2d');
      cx.fillStyle = host.querySelector('#av-bg').value;
      if (host.querySelector('#av-shape').value === 'circle') {
        cx.beginPath(); cx.arc(s/2,s/2,s/2,0,Math.PI*2); cx.fill(); cx.clip();
      } else cx.fillRect(0,0,s,s);
      var t = host.querySelector('#av-text').value || 'A';
      cx.fillStyle = host.querySelector('#av-fg').value;
      cx.textAlign = 'center'; cx.textBaseline = 'middle';
      cx.font = '700 ' + Math.round(s * (Array.from(t).length > 2 ? .28 : .48)) + 'px sans-serif';
      cx.fillText(t, s/2, s/2 + s*.02);
      cv.style.width = '180px'; cv.style.height = '180px'; cv.style.borderRadius = '20px';
      host.querySelector('#av-out').innerHTML = ''; host.querySelector('#av-out').appendChild(cv);
    }
    host.addEventListener('click', function (e) {
      if (e.target.closest('[data-go]')) build();
      if (e.target.closest('[data-save]')) { if (!cv) { api.toast('请先生成'); return; } api.download(cv.toDataURL('image/png'), 'ankong-avatar.png'); }
    });
    build();
  }
});
