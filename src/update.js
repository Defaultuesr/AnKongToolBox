/* ============================================================
   安空工具箱 — 自动检查更新（v1.6）
   只读取 GitHub Releases 的公开版本元信息：
     · 不上传任何本机数据，不携带用户输入
     · 不自动下载、不自动安装 APK，是否升级完全由用户决定
     · 网页版走 XMLHttpRequest / fetch，安卓客户端走原生异步 HTTP 桥
   支持：自动检查（可关闭）/ 手动检查 / 版本比较 / 忽略此版本 / 下载入口
   ============================================================ */
(function () {
'use strict';

var REPO = 'Defaultuesr/AnKongToolBox';
var API = 'https://api.github.com/repos/' + REPO + '/releases/latest';
var PAGE = 'https://github.com/' + REPO + '/releases';
var INTERVAL = 12 * 60 * 60 * 1000;   // 自动检查节流：12 小时
var K_AUTO = 'ak_upd_auto', K_LAST = 'ak_upd_last',
    K_SKIP = 'ak_upd_skip', K_CACHE = 'ak_upd_cache';

function ls(k, d) {
  try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); }
  catch (e) { return d; }
}
function save(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/* ---------------- 版本比较 ---------------- */
function norm(s) { return String(s == null ? '' : s).replace(/^[vV]/, '').trim(); }
function cmp(a, b) {
  var A = norm(a).split(/[.\-_+]/), B = norm(b).split(/[.\-_+]/);
  var n = Math.max(A.length, B.length);
  for (var i = 0; i < n; i++) {
    var x = A[i], y = B[i];
    if (x == null && y == null) continue;
    var nx = parseInt(x, 10), ny = parseInt(y, 10);
    if (isFinite(nx) && isFinite(ny)) { if (nx !== ny) return nx > ny ? 1 : -1; }
    else {
      var sx = String(x == null ? '' : x), sy = String(y == null ? '' : y);
      if (sx !== sy) return sx > sy ? 1 : -1;
    }
  }
  return 0;
}
function localVersion() { return String(window.AK_VERSION || '2.7'); }

/* ---------------- 状态 ---------------- */
var IDLE = { state: 'idle', version: '', checkedAt: 0, error: '' };
var cur;
try {
  cur = ls(K_CACHE, null);
  if (!cur || typeof cur !== 'object') cur = IDLE;
  if (cur.state === 'checking') cur = { state: 'idle', version: cur.version || '', checkedAt: cur.checkedAt || 0, error: '' };
} catch (e) { cur = IDLE; }

var listeners = [];
var reqs = {}, seq = 0, busy = false;
var waiting = [];

function get() {
  return {
    state: cur.state, version: cur.version || '', name: cur.name || '',
    body: cur.body || '', publishedAt: cur.publishedAt || '',
    downloadUrl: cur.downloadUrl || '', pageUrl: cur.pageUrl || PAGE,
    assetSize: cur.assetSize || 0, checkedAt: cur.checkedAt || 0,
    error: cur.error || '',
    auto: ls(K_AUTO, true) !== false,
    localVersion: localVersion(),
    repo: REPO, page: PAGE, interval: INTERVAL
  };
}
function visible() {
  return cur.state === 'available' && !!cur.version &&
    cmp(cur.version, localVersion()) > 0 && ls(K_SKIP, '') !== cur.version;
}

function emit() {
  var snap = get();
  for (var i = 0; i < listeners.length; i++) {
    try { listeners[i](snap); } catch (e) {}
  }
  try {
    var slot = document.getElementById('upd-slot');
    if (slot && window.akUpdBannerHtml) slot.innerHTML = window.akUpdBannerHtml();
  } catch (e) {}
  try {
    var box = document.getElementById('upd-status');
    if (box && window.akUpdStatusHtml) box.innerHTML = window.akUpdStatusHtml(snap);
  } catch (e) {}
  try {
    var act = document.getElementById('upd-actions');
    if (act && window.akUpdActionsHtml) act.innerHTML = window.akUpdActionsHtml(snap);
  } catch (e) {}
  try { if (window.AKI18N) window.AKI18N.apply(); } catch (e) {}
}

/* ---------------- 网络请求 ---------------- */
/* 安卓客户端：原生异步 HTTP，避免 JS 线程被网络阻塞，也绕过 file:// 的跨源限制 */
function nativeGet(cb) {
  var id = 'r' + (++seq) + '_' + Date.now();
  var done = false;
  function finish(body) {
    if (done) return;
    done = true;
    delete reqs[id];
    cb(body || '');
  }
  reqs[id] = finish;
  try { window.Ankong.httpGet(API, id); }
  catch (e) { finish(''); }
  setTimeout(function () { finish(''); }, 10000);
}

function webGet(cb) {
  if (typeof XMLHttpRequest !== 'undefined') {
    var x = new XMLHttpRequest(), done = false;
    function fin(v) { if (done) return; done = true; cb(v); }
    try {
      x.open('GET', API, true);
      x.setRequestHeader('Accept', 'application/vnd.github+json');
      x.timeout = 8000;
      x.onreadystatechange = function () {
        if (x.readyState === 4) fin(x.status >= 200 && x.status < 300 ? (x.responseText || '') : '');
      };
      x.ontimeout = function () { fin(''); };
      x.onerror = function () { fin(''); };
      x.send();
      return;
    } catch (e) {}
  }
  if (typeof fetch === 'function') {
    fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { return r.ok ? r.text() : ''; })
      .then(function (t) { cb(t || ''); })
      .catch(function () { cb(''); });
    return;
  }
  cb('');
}

function request(cb) {
  try {
    if (window.Ankong && typeof window.Ankong.httpGet === 'function') { nativeGet(cb); return; }
  } catch (e) {}
  webGet(cb);
}

/* ---------------- 解析响应 ---------------- */
function parse(raw, now) {
  if (!raw) return { state: 'error', version: '', checkedAt: now, error: 'network' };
  var o;
  try { o = JSON.parse(raw); } catch (e) { return { state: 'error', version: '', checkedAt: now, error: 'parse' }; }
  if (!o || !o.tag_name) return { state: 'error', version: '', checkedAt: now, error: 'data' };
  var ver = norm(o.tag_name);
  var assets = o.assets || [], dl = '', size = 0;
  for (var i = 0; i < assets.length; i++) {
    if (/\.apk$/i.test(assets[i].name || '')) {
      dl = assets[i].browser_download_url || ''; size = assets[i].size || 0; break;
    }
  }
  if (!dl && assets.length) { dl = assets[0].browser_download_url || ''; size = assets[0].size || 0; }
  return {
    state: cmp(ver, localVersion()) > 0 ? 'available' : 'uptodate',
    version: ver,
    name: String(o.name || ('v' + ver)),
    body: String(o.body || '').slice(0, 3000),
    publishedAt: String(o.published_at || ''),
    downloadUrl: dl,
    pageUrl: String(o.html_url || PAGE),
    assetSize: size,
    checkedAt: now,
    error: ''
  };
}

/* ---------------- 检查 ---------------- */
function check(force, cb) {
  if (typeof force === 'function') { cb = force; force = false; }
  if (busy) { if (cb) waiting.push(cb); return; }
  var now = Date.now();
  if (!force && cur.checkedAt && now - cur.checkedAt < INTERVAL) { if (cb) cb(get()); return; }

  busy = true;
  cur = { state: 'checking', version: cur.version || '', checkedAt: cur.checkedAt || 0, error: '' };
  emit();

  request(function (raw) {
    var res = parse(raw, Date.now());
    cur = res;
    save(K_CACHE, cur);
    save(K_LAST, res.checkedAt);
    busy = false;
    // 忽略标记只对新版本生效，版本变化时自动清除
    if (res.state !== 'available' || ls(K_SKIP, '') !== res.version) save(K_SKIP, '');
    emit();
    if (cb) { try { cb(get()); } catch (e) {} }
    for (var i = 0; i < waiting.length; i++) { try { waiting[i](get()); } catch (e) {} }
    waiting = [];
  });
}

/* 启动自动检查：开关开启 且 距上次检查超过 12 小时 */
function auto() {
  if (ls(K_AUTO, true) === false) return;
  var last = ls(K_LAST, 0) || 0;
  if (Date.now() - last < INTERVAL) return;
  setTimeout(function () { check(false, function () {}); }, 1200);
}

function setAuto(on) { save(K_AUTO, !!on); if (on) auto(); }
function dismiss() { save(K_SKIP, cur.version || ''); emit(); }
function openUrl(u) {
  if (!u) return;
  try {
    if (window.Ankong && typeof window.Ankong.openUrl === 'function') { window.Ankong.openUrl(u); return; }
  } catch (e) {}
  try { window.open(u, '_blank', 'noopener,noreferrer'); }
  catch (e2) { window.location.href = u; }
}
function openDownload() { openUrl(get().downloadUrl || get().pageUrl); }
function openReleases() { openUrl(get().pageUrl || PAGE); }
function formatSize(n) {
  n = Number(n) || 0;
  if (n <= 0) return '';
  var u = ['B', 'KB', 'MB', 'GB'], i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return (i ? n.toFixed(1) : String(n)) + ' ' + u[i];
}
function formatTime(ts) {
  if (!ts) return '';
  try {
    var d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    function p(x) { return x < 10 ? '0' + x : String(x); }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  } catch (e) { return ''; }
}

/* ---------------- 通用匿名 GET（v2.0 供「资讯」页读取公开新闻源） ----------------
   复用上面的原生桥回调分发（reqs / _native），网页版走 XHR/fetch。
   仅发起一次匿名 GET，不携带任何本机数据；失败统一回传空串，由调用方降级。 */
function httpGet(url, cb) {
  if (!url || typeof cb !== 'function') return;
  var done = false;
  function finish(body) { if (done) return; done = true; cb(body || ''); }
  try {
    if (window.Ankong && typeof window.Ankong.httpGet === 'function') {
      var id = 'g' + (++seq) + '_' + Date.now();
      reqs[id] = finish;
      try { window.Ankong.httpGet(url, id); } catch (e) { delete reqs[id]; finish(''); }
      setTimeout(function () { if (reqs[id]) { delete reqs[id]; finish(''); } }, 10000);
      return;
    }
  } catch (e) {}
  if (typeof XMLHttpRequest !== 'undefined') {
    try {
      var x = new XMLHttpRequest();
      x.open('GET', url, true);
      x.timeout = 9000;
      x.onreadystatechange = function () {
        if (x.readyState === 4) finish(x.status >= 200 && x.status < 300 ? (x.responseText || '') : '');
      };
      x.ontimeout = function () { finish(''); };
      x.onerror = function () { finish(''); };
      x.send();
      return;
    } catch (e2) {}
  }
  if (typeof fetch === 'function') {
    fetch(url).then(function (r) { return r.ok ? r.text() : ''; }).then(finish).catch(function () { finish(''); });
    return;
  }
  finish('');
}

window.AK_UPDATE = {
  check: check, auto: auto, get: get, setAuto: setAuto, dismiss: dismiss,
  visible: visible, openDownload: openDownload, openReleases: openReleases,
  openUrl: openUrl, formatSize: formatSize, formatTime: formatTime,
  cmp: cmp, esc: esc, httpGet: httpGet,
  on: function (fn) { if (typeof fn === 'function') listeners.push(fn); },
  /* 原生桥回调入口 */
  _native: function (body, id) {
    var f = reqs[id];
    if (f) f(body);
  }
};
})();
