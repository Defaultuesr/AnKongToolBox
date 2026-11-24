/* ============================================================
   安空工具箱 — v1.8 工具包（二）
   触控检测 · 灰度测试 · 秒表 · 计时器 · 内置浏览器入口
   纯本地离线，ES5 兼容，不使用沉浸式全屏
   ============================================================ */
(function () {
'use strict';

function esc(s) { return H.esc(s == null ? '' : String(s)); }

/* ============================================================
   5. 触控检测（画线与多点）
   ============================================================ */
T({ id: 'touchtest', name: '触控检测', cat: 'fun', icon: '👆', tint: '#DDE6F3',
  desc: '在画布上多指划线，观察线条是否连续，排查断触与失灵区域，验机常用',
  tags: '触控 断触 屏幕 检测 画线 多点 验机 坏点',
  note: '用手指缓慢划过整个区域；若线条出现断裂、跳点或某个区域无响应，可能是触控层故障。放大检测区域仍在页面内，随时可还原退出。',
  custom: function (host, api) {
    host.innerHTML =
      '<div class="chips" id="tt-ops">' +
        '<button class="chip on" data-g="1">网格辅助</button>' +
        '<button class="chip" data-c="1">清空轨迹</button>' +
        '<button class="chip" data-z="1">放大检测区域</button></div>' +
      '<canvas id="tt-cv" style="width:100%;height:56vh;display:block;border-radius:var(--radius-m);touch-action:none;background:#fff;box-shadow:inset 0 0 0 1px var(--outline-variant)"></canvas>' +
      '<div class="result" id="tt-info" style="font-family:inherit"></div>';
    var cv = host.querySelector('#tt-cv'), info = host.querySelector('#tt-info');
    var cx = cv.getContext('2d'), strokes = [], active = {}, gridOn = true, seq = 0;
    var palette = ['#E53935', '#1E88E5', '#43A047', '#FB8C00', '#8E24AA', '#00ACC1', '#6D4C41', '#5E35B1'];
    var cssW = 0, cssH = 0;

    function sizeCanvas() {
      var r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      cssW = r.width || 300; cssH = r.height || 300;
      cv.width = Math.max(1, Math.round(cssW * dpr));
      cv.height = Math.max(1, Math.round(cssH * dpr));
      cx = cv.getContext('2d'); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      repaint();
    }
    function repaint() {
      cx.clearRect(0, 0, cssW, cssH);
      if (gridOn) {
        cx.strokeStyle = 'rgba(120,120,120,.22)'; cx.lineWidth = 1;
        for (var x = 0; x <= cssW; x += 24) { cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, cssH); cx.stroke(); }
        for (var y = 0; y <= cssH; y += 24) { cx.beginPath(); cx.moveTo(0, y); cx.lineTo(cssW, y); cx.stroke(); }
        cx.strokeStyle = 'rgba(120,120,120,.35)';
        cx.beginPath(); cx.moveTo(0, 0); cx.lineTo(cssW, cssH); cx.moveTo(cssW, 0); cx.lineTo(0, cssH); cx.stroke();
      }
      strokes.forEach(function (s) {
        if (s.pts.length < 2) return;
        cx.strokeStyle = s.color; cx.lineWidth = 3.5; cx.lineCap = 'round'; cx.lineJoin = 'round';
        cx.beginPath(); cx.moveTo(s.pts[0][0], s.pts[0][1]);
        for (var i = 1; i < s.pts.length; i++) cx.lineTo(s.pts[i][0], s.pts[i][1]);
        cx.stroke();
      });
    }
    function report(extra) {
      var pts = 0; strokes.forEach(function (s) { pts += s.pts.length; });
      info.innerHTML = H.kv([
        ['当前触点数', String(Object.keys(active).length)],
        ['已完成轨迹', String(strokes.length) + ' 笔'],
        ['记录采样点', String(pts) + ' 个'],
        ['检测区域', Math.round(cssW) + ' × ' + Math.round(cssH) + ' px'],
        ['状态', esc(extra || '在上方画布缓慢划线，观察线条连续性')]
      ], '触控检测');
    }
    function pos(e) {
      var r = cv.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    }
    function down(id, e) {
      var color = palette[(seq++) % palette.length], p = pos(e);
      var s = { color: color, pts: [p] };
      strokes.push(s); active[id] = s;
      report('检测到触点 #' + id + ' @ ' + Math.round(p[0]) + ',' + Math.round(p[1]));
    }
    function move(id, e) {
      var s = active[id]; if (!s) return;
      s.pts.push(pos(e)); repaint();
    }
    function up(id) {
      var s = active[id]; if (!s) return;
      delete active[id]; report('轨迹结束：' + s.pts.length + ' 个采样点');
    }

    if (window.PointerEvent) {
      cv.addEventListener('pointerdown', function (e) { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} down(e.pointerId, e); });
      cv.addEventListener('pointermove', function (e) { e.preventDefault(); move(e.pointerId, e); });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
        cv.addEventListener(t, function (e) { up(e.pointerId); });
      });
    } else {
      cv.addEventListener('touchstart', function (e) {
        e.preventDefault();
        for (var i = 0; i < e.changedTouches.length; i++) down(e.changedTouches[i].identifier, e.changedTouches[i]);
      });
      cv.addEventListener('touchmove', function (e) {
        e.preventDefault();
        for (var i = 0; i < e.changedTouches.length; i++) move(e.changedTouches[i].identifier, e.changedTouches[i]);
      });
      ['touchend', 'touchcancel'].forEach(function (t) {
        cv.addEventListener(t, function (e) {
          for (var i = 0; i < e.changedTouches.length; i++) up(e.changedTouches[i].identifier);
        });
      });
      var md = false;
      cv.addEventListener('mousedown', function (e) { md = true; down('mouse', e); });
      cv.addEventListener('mousemove', function (e) { if (md) move('mouse', e); });
      document.addEventListener('mouseup', function () { if (md) { md = false; up('mouse'); } });
    }

    host.addEventListener('click', function (e) {
      var g = e.target.closest && e.target.closest('[data-g]');
      if (g) { gridOn = !gridOn; g.classList.toggle('on', gridOn); repaint(); return; }
      var c = e.target.closest && e.target.closest('[data-c]');
      if (c) { strokes = []; active = {}; repaint(); report('轨迹已清空'); api.toast('已清空'); return; }
      var z = e.target.closest && e.target.closest('[data-z]');
      if (z) {
        var big = cv.style.height === '82vh';
        cv.style.height = big ? '56vh' : '82vh';
        z.textContent = big ? '放大检测区域' : '还原检测区域';
        z.classList.toggle('on', !big);
        api.toast(big ? '已还原检测区域' : '已在页面内放大，随时可点「还原」退出');
        setTimeout(sizeCanvas, 60);
      }
    });
    sizeCanvas(); report();
    window.addEventListener('resize', function () { if (document.body.contains(host)) sizeCanvas(); });
  }
});

/* ============================================================
   6. 灰度 / 渐变 / 对比度测试
   ============================================================ */
T({ id: 'graytest', name: '灰度与渐变测试', cat: 'fun', icon: '🌫️', tint: '#DDE6F3',
  desc: '灰阶条、黑白对比、RGB 色带、渐变与棋盘格，检测显示层次、坏点与色彩偏差',
  tags: '灰度 灰阶 渐变 对比度 色带 棋盘格 坏点 屏幕 检测',
  custom: function (host, api) {
    var modes = [
      ['graybar', '16 级灰阶'], ['bw', '黑白对比'], ['bands', 'RGB 色带'],
      ['hgrad', '水平渐变'], ['vgrad', '垂直渐变'], ['checker', '棋盘格'],
      ['black', '纯黑'], ['white', '纯白'], ['rgb', '三原色满屏']
    ];
    host.innerHTML =
      '<div class="chips" id="gt-modes">' + modes.map(function (m, i) {
        return '<button class="chip ' + (i === 0 ? 'on' : '') + '" data-m="' + m[0] + '">' + m[1] + '</button>';
      }).join('') + '<button class="chip" data-z="1">放大测试区域</button></div>' +
      '<canvas id="gt-cv" style="width:100%;height:52vh;display:block;border-radius:var(--radius-m);background:#000"></canvas>' +
      '<div class="result" id="gt-info" style="font-family:inherit"></div>';
    var cv = host.querySelector('#gt-cv'), cur = 'graybar', info = host.querySelector('#gt-info');
    function paint() {
      var r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
      var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      var i, x, y, g;
      c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
      if (cur === 'graybar') {
        for (i = 0; i < 16; i++) {
          g = Math.round(i * 255 / 15); c.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')';
          c.fillRect(i * w / 16, 0, w / 16 + 1, h);
        }
      } else if (cur === 'bw') {
        c.fillStyle = '#000'; c.fillRect(0, 0, w / 2, h);
        c.fillStyle = '#fff'; c.fillRect(w / 2, 0, w / 2, h);
        c.fillStyle = '#808080'; c.fillRect(w / 2 - 2, 0, 4, h);
      } else if (cur === 'bands') {
        var cols = ['#FF0000', '#00FF00', '#0000FF', '#00FFFF', '#FF00FF', '#FFFF00', '#FFFFFF', '#000000'];
        for (i = 0; i < cols.length; i++) { c.fillStyle = cols[i]; c.fillRect(i * w / cols.length, 0, w / cols.length + 1, h); }
      } else if (cur === 'hgrad' || cur === 'vgrad') {
        var horiz = cur === 'hgrad';
        for (i = 0; i < 256; i++) {
          g = i; c.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')';
          if (horiz) c.fillRect(i * w / 256, 0, w / 256 + 1, h);
          else c.fillRect(0, i * h / 256, w, h / 256 + 1);
        }
      } else if (cur === 'checker') {
        var cells = 8, cw = w / cells, ch = h / cells;
        for (y = 0; y < cells; y++) for (x = 0; x < cells; x++) {
          c.fillStyle = (x + y) % 2 ? '#fff' : '#000'; c.fillRect(x * cw, y * ch, cw + 1, ch + 1);
        }
      } else if (cur === 'white') { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); }
      else if (cur === 'rgb') {
        c.fillStyle = '#F00'; c.fillRect(0, 0, w, h / 3);
        c.fillStyle = '#0F0'; c.fillRect(0, h / 3, w, h / 3);
        c.fillStyle = '#00F'; c.fillRect(0, 2 * h / 3, w, h / 3);
      }
    }
    function report() {
      var name = '16 级灰阶';
      modes.forEach(function (m) { if (m[0] === cur) name = m[1]; });
      info.innerHTML = H.kv([
        ['当前测试图', esc(name)],
        ['逻辑分辨率', innerWidth + ' × ' + innerHeight + ' px'],
        ['物理分辨率', screen.width + ' × ' + screen.height + ' px'],
        ['设备像素比', String(window.devicePixelRatio || 1)],
        ['色彩深度', screen.colorDepth + ' bit']
      ], '屏幕参数') +
        '<div class="hint" style="margin-top:10px">观察灰阶是否逐级可辨、有无亮点 / 暗点 / 色偏；屏幕调至最高亮度、关闭护眼与夜间模式再测更准确。</div>';
    }
    host.addEventListener('click', function (e) {
      var m = e.target.closest && e.target.closest('[data-m]');
      if (m) {
        host.querySelectorAll('#gt-modes .chip[data-m]').forEach(function (x) { x.classList.remove('on'); });
        m.classList.add('on'); cur = m.getAttribute('data-m'); paint(); report(); return;
      }
      var z = e.target.closest && e.target.closest('[data-z]');
      if (z) {
        var big = cv.style.height === '82vh';
        cv.style.height = big ? '52vh' : '82vh';
        z.textContent = big ? '放大测试区域' : '还原测试区域';
        z.classList.toggle('on', !big);
        api.toast(big ? '已还原测试区域' : '已在页面内放大，随时可点「还原」退出');
        setTimeout(paint, 60);
      }
    });
    paint(); report();
    window.addEventListener('resize', function () { if (document.body.contains(host)) paint(); });
  }
});

/* ============================================================
   7. 秒表（计次 / 圈速）
   ============================================================ */
T({ id: 'stopwatch', name: '秒表（计次 / 圈速）', cat: 'life', icon: '⏱️', tint: '#FFDEE4',
  desc: '高精度秒表，支持暂停、复位与多圈计次，显示每圈用时',
  tags: '秒表 计时 计次 圈速 跑表 运动',
  custom: function (host, api) {
    host.innerHTML =
      '<div style="text-align:center;padding:14px 0 6px"><div id="sw-main" style="font:700 38px/1.2 ui-monospace,Menlo,Consolas,monospace;letter-spacing:1px">00:00:00.000</div>' +
        '<div id="sw-state" style="font-size:12px;color:var(--on-surface-variant);margin-top:6px">未开始</div></div>' +
      '<div class="btn-row">' +
        '<button class="btn full" id="sw-toggle">开始</button>' +
        '<button class="btn tonal" id="sw-lap">计次</button>' +
        '<button class="btn outline" id="sw-reset">复位</button></div>' +
      '<div class="sec-label" style="margin-top:16px">计次记录</div>' +
      '<div class="result empty" id="sw-laps">暂无计次</div>';
    var main = host.querySelector('#sw-main'), state = host.querySelector('#sw-state'),
        lapsBox = host.querySelector('#sw-laps'), toggle = host.querySelector('#sw-toggle');
    var running = false, started = 0, base = 0, laps = [], tick = null;
    function now() { return base + (running ? Date.now() - started : 0); }
    function fmt(ms) {
      var t = Math.max(0, Math.floor(ms)), hh = Math.floor(t / 3600000),
          mm = Math.floor(t / 60000) % 60, ss = Math.floor(t / 1000) % 60, mmm = t % 1000;
      return ('0' + hh).slice(-2) + ':' + ('0' + mm).slice(-2) + ':' + ('0' + ss).slice(-2) + '.' + ('00' + mmm).slice(-3);
    }
    function drawLaps() {
      if (!laps.length) { lapsBox.classList.add('empty'); lapsBox.textContent = '暂无计次'; return; }
      lapsBox.classList.remove('empty');
      var rows = laps.map(function (l, i) { return [String(l.no), l.lap, l.total]; });
      lapsBox.innerHTML = H.table(['圈', '本圈用时', '累计时间'], rows);
    }
    function update() {
      if (!document.body.contains(host)) { if (tick) { clearInterval(tick); tick = null; } return; }
      main.textContent = fmt(now());
    }
    function setRun(on) {
      if (on) {
        started = Date.now(); running = true;
        if (!tick) tick = setInterval(update, 31);
        toggle.textContent = '暂停'; state.textContent = '计时中';
      } else {
        base = now(); running = false;
        if (tick) { clearInterval(tick); tick = null; }
        toggle.textContent = '继续'; state.textContent = '已暂停'; update();
      }
    }
    host.addEventListener('click', function (e) {
      var t = e.target;
      if (t.id === 'sw-toggle' || (t.closest && t.closest('#sw-toggle'))) {
        setRun(!running); api.native.call('vibrate', '10'); return;
      }
      if (t.id === 'sw-lap' || (t.closest && t.closest('#sw-lap'))) {
        if (!running && base === 0) { api.toast('请先开始计时'); return; }
        var total = now(), prev = laps.length ? laps[laps.length - 1].raw : 0;
        laps.push({ no: laps.length + 1, lap: fmt(total - prev), total: fmt(total), raw: total });
        drawLaps(); api.toast('第 ' + laps.length + ' 圈已记录'); return;
      }
      if (t.id === 'sw-reset' || (t.closest && t.closest('#sw-reset'))) {
        if (tick) { clearInterval(tick); tick = null; }
        running = false; base = 0; started = 0; laps = [];
        main.textContent = '00:00:00.000'; toggle.textContent = '开始'; state.textContent = '未开始';
        drawLaps(); api.toast('已复位');
      }
    });
  }
});

/* ============================================================
   8. 倒计时计时器
   ============================================================ */
function akBeep() {
  try {
    var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    var a = new AC(), o = a.createOscillator(), g = a.createGain();
    o.type = 'sine'; o.frequency.value = 880; g.gain.value = .12;
    o.connect(g); g.connect(a.destination); o.start();
    setTimeout(function () { try { o.stop(); a.close(); } catch (e) {} }, 650);
  } catch (e) {}
}

T({ id: 'timer', name: '倒计时计时器', cat: 'life', icon: '⏲️', tint: '#FFDEE4',
  desc: '预设或自定义时长倒计时，支持暂停 / 复位，结束时提示与振动',
  tags: '计时器 倒计时 番茄钟 定时 提醒',
  custom: function (host, api) {
    host.innerHTML =
      '<div class="chips" id="tm-presets">' +
        [1, 3, 5, 10, 15, 25, 30, 45, 60].map(function (m) {
          return '<button class="chip" data-min="' + m + '">' + m + ' 分</button>';
        }).join('') + '</div>' +
      '<div class="field-row"><div class="field"><label>时</label><input class="input" type="number" id="tm-h" value="0" min="0" max="23"></div>' +
        '<div class="field"><label>分</label><input class="input" type="number" id="tm-m" value="5" min="0" max="59"></div>' +
        '<div class="field"><label>秒</label><input class="input" type="number" id="tm-s" value="0" min="0" max="59"></div></div>' +
      '<div style="text-align:center;padding:14px 0 6px"><div id="tm-main" style="font:700 38px/1.2 ui-monospace,Menlo,Consolas,monospace;letter-spacing:1px">00:05:00</div>' +
        '<div id="tm-state" style="font-size:12px;color:var(--on-surface-variant);margin-top:6px">待开始</div></div>' +
      '<div class="btn-row">' +
        '<button class="btn full" id="tm-toggle">开始</button>' +
        '<button class="btn outline" id="tm-reset">复位</button></div>' +
      '<div class="hint" style="margin-top:10px">计时在本机运行，切到后台可能受系统省电策略影响；结束时会有声音与振动提示（需设备允许）。</div>';
    var main = host.querySelector('#tm-main'), state = host.querySelector('#tm-state'),
        toggle = host.querySelector('#tm-toggle');
    var duration = 300000, remain = 300000, running = false, endAt = 0, tick = null, done = false;
    function fmt(ms) {
      var t = Math.max(0, Math.ceil(ms / 1000)), hh = Math.floor(t / 3600),
          mm = Math.floor(t / 60) % 60, ss = t % 60;
      return ('0' + hh).slice(-2) + ':' + ('0' + mm).slice(-2) + ':' + ('0' + ss).slice(-2);
    }
    function readInput() {
      var h = Math.max(0, Math.min(23, parseInt(host.querySelector('#tm-h').value, 10) || 0));
      var m = Math.max(0, Math.min(59, parseInt(host.querySelector('#tm-m').value, 10) || 0));
      var s = Math.max(0, Math.min(59, parseInt(host.querySelector('#tm-s').value, 10) || 0));
      return (h * 3600 + m * 60 + s) * 1000;
    }
    function show() { main.textContent = fmt(remain); }
    function finish() {
      running = false; done = true;
      if (tick) { clearInterval(tick); tick = null; }
      remain = 0; show(); toggle.textContent = '开始'; state.textContent = '时间到！';
      api.toast('倒计时结束'); api.native.call('vibrate', '600'); akBeep();
    }
    function update() {
      if (!document.body.contains(host)) { if (tick) { clearInterval(tick); tick = null; } return; }
      remain = Math.max(0, endAt - Date.now()); show();
      if (remain <= 0) finish();
    }
    function start() {
      var d = readInput();
      if (done || remain <= 0) { d = duration || d; }
      duration = d; remain = d; done = false;
      if (d <= 0) { api.toast('请设置大于 0 的时长'); return; }
      endAt = Date.now() + d; running = true;
      if (!tick) tick = setInterval(update, 200);
      toggle.textContent = '暂停'; state.textContent = '倒计时中'; show();
    }
    function pause() {
      remain = Math.max(0, endAt - Date.now()); running = false;
      if (tick) { clearInterval(tick); tick = null; }
      toggle.textContent = '继续'; state.textContent = '已暂停'; show();
    }
    host.addEventListener('click', function (e) {
      var p = e.target.closest && e.target.closest('[data-min]');
      if (p) {
        var min = parseInt(p.getAttribute('data-min'), 10);
        host.querySelector('#tm-h').value = 0; host.querySelector('#tm-m').value = min; host.querySelector('#tm-s').value = 0;
        duration = min * 60000; remain = duration; done = false;
        if (tick) { clearInterval(tick); tick = null; }
        running = false; toggle.textContent = '开始'; state.textContent = '已设为 ' + min + ' 分钟'; show();
        host.querySelectorAll('#tm-presets .chip').forEach(function (x) { x.classList.remove('on'); });
        p.classList.add('on'); return;
      }
      var t = e.target;
      if (t.id === 'tm-toggle' || (t.closest && t.closest('#tm-toggle'))) {
        if (running) pause(); else if (!running && remain > 0 && remain < duration && !done) {
          endAt = Date.now() + remain; running = true;
          if (!tick) tick = setInterval(update, 200);
          toggle.textContent = '暂停'; state.textContent = '倒计时中';
        } else start();
        api.native.call('vibrate', '10'); return;
      }
      if (t.id === 'tm-reset' || (t.closest && t.closest('#tm-reset'))) {
        if (tick) { clearInterval(tick); tick = null; }
        running = false; done = false; duration = readInput(); remain = duration;
        toggle.textContent = '开始'; state.textContent = '已复位'; show(); api.toast('已复位');
      }
    });
    show();
  }
});

/* ============================================================
   9. 内置浏览器（Chromium WebView 内核）
   ============================================================ */
var SITES = [
  ['百度', 'https://www.baidu.com'], ['必应', 'https://www.bing.com'],
  ['GitHub', 'https://github.com'], ['MDN', 'https://developer.mozilla.org'],
  ['知乎', 'https://www.zhihu.com'], ['哔哩哔哩', 'https://www.bilibili.com'],
  ['维基百科', 'https://zh.wikipedia.org'], ['Stack Overflow', 'https://stackoverflow.com'],
  ['W3Schools', 'https://www.w3schools.com'], ['豆包', 'https://www.doubao.com']
];
var BK_KEY = 'ak_browser_bookmarks';

T({ id: 'browser', name: '内置浏览器', cat: 'hub', icon: '🌐', tint: '#F4EBCB',
  desc: '用系统 Chromium 内核在应用内打开网页，内置常用站点与本机书签',
  tags: '浏览器 内置浏览器 Chromium WebView 网址 书签 上网',
  note: '内置浏览器由设备 Chromium WebView 直接加载网页，不经过安空工具箱服务器；网页内容由对应网站提供，请勿在不可信页面输入密码等敏感信息。网页版会改用系统浏览器打开。',
  custom: function (host, api) {
    function loadBk() {
      try { var v = JSON.parse(localStorage.getItem(BK_KEY) || '[]'); return Array.isArray(v) ? v : []; }
      catch (e) { return []; }
    }
    function saveBk(arr) { try { localStorage.setItem(BK_KEY, JSON.stringify(arr)); } catch (e) {} }
    function renderBk() {
      var arr = loadBk(), box = host.querySelector('#br-bk');
      if (!box) return;
      if (!arr.length) { box.innerHTML = '<div class="hint" style="margin:0 2px">暂无书签，输入网址后点「存为书签」</div>'; return; }
      box.innerHTML = '<div class="btn-row" style="flex-wrap:wrap;gap:6px;margin-bottom:0">' + arr.map(function (b, i) {
        return '<button class="chip" data-open="' + esc(b.url) + '">' + esc(b.name) + '</button>' +
          '<button class="chip" data-del="' + i + '" aria-label="删除">×</button>';
      }).join('') + '</div>';
    }
    host.innerHTML =
      '<div class="field"><label>网址</label><input class="input" type="text" id="br-url" placeholder="https://example.com（直接输入域名也可）"></div>' +
      '<div class="btn-row">' +
        '<button class="btn full" id="br-go">在内置浏览器中打开</button>' +
        '<button class="btn tonal" id="br-save">存为书签</button></div>' +
      '<div class="sec-label" style="margin-top:16px">常用站点</div>' +
      '<div class="chips" id="br-sites" style="flex-wrap:wrap">' + SITES.map(function (s) {
        return '<button class="chip" data-open="' + esc(s[1]) + '">' + esc(s[0]) + '</button>';
      }).join('') + '</div>' +
      '<div class="sec-label" style="margin-top:16px">我的书签（保存在本机）</div>' +
      '<div id="br-bk"></div>' +
      '<div class="result" style="font-family:inherit;margin-top:14px">' + H.kv([
        ['内核', '设备 Chromium / Android System WebView'],
        ['数据', '网页由目标站点直接加载，不经过本应用服务器'],
        ['权限', '仅使用已有 INTERNET 权限；不读取 App 内便签 / 收藏'],
        ['退出', '浏览器顶部有「关闭」按钮，返回键先回退网页再退出']
      ], '内置浏览器说明') + '</div>';

    function norm(u) {
      u = String(u || '').trim();
      if (!u) return '';
      if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(u)) u = 'https://' + u;
      return u;
    }
    function open(u) {
      u = norm(u);
      if (!/^https?:\/\//i.test(u)) { api.toast('仅支持 http / https 网址'); return; }
      if (window.Ankong && typeof window.Ankong.openBrowser === 'function') {
        api.native.call('openBrowser', u); api.toast('已在内置浏览器打开');
      } else {
        try { window.open(u, '_blank', 'noopener,noreferrer'); }
        catch (e) { window.location.href = u; }
        api.toast('网页版已用系统浏览器打开');
      }
    }
    host.addEventListener('click', function (e) {
      var o = e.target.closest && e.target.closest('[data-open]');
      if (o) { var u = o.getAttribute('data-open'); host.querySelector('#br-url').value = u; open(u); return; }
      var d = e.target.closest && e.target.closest('[data-del]');
      if (d) {
        var arr = loadBk(); arr.splice(parseInt(d.getAttribute('data-del'), 10), 1);
        saveBk(arr); renderBk(); api.toast('已删除书签'); return;
      }
      var t = e.target;
      if (t.id === 'br-go' || (t.closest && t.closest('#br-go'))) { open(host.querySelector('#br-url').value); return; }
      if (t.id === 'br-save' || (t.closest && t.closest('#br-save'))) {
        var raw = String(host.querySelector('#br-url').value || '').trim();
        if (!raw) { api.toast('请先输入网址'); return; }
        var u2 = norm(raw), name = u2.replace(/^https?:\/\//, '').replace(/\/$/, '').slice(0, 28);
        var list = loadBk();
        for (var i = 0; i < list.length; i++) if (list[i].url === u2) { api.toast('该网址已在书签中'); return; }
        list.push({ name: name, url: u2 }); saveBk(list); renderBk(); api.toast('已存为书签');
      }
    });
    host.querySelector('#br-url').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') open(host.querySelector('#br-url').value);
    });
    renderBk();
  }
});

})();
