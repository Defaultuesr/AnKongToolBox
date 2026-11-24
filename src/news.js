/* ============================================================
   安空工具箱 — 资讯页（v2.0）
   今日新闻速览 / 五大热榜 / 每日一言
   数据来自公开聚合接口，匿名 GET，不上传任何本机数据；
   无网络或接口不可用时优雅降级，并提供官方站点导航。
   ES5 兼容写法。
   ============================================================ */
(function () {
'use strict';

var BASE = 'https://60s.viki.moe/v2/';
var K_CACHE = 'ak_news_cache';      // { ts, data:{ key: payload } }
var TTL = 15 * 60 * 1000;           // 15 分钟内复用缓存

/* 板块定义：key / 标题 / 接口路径 / 图标 */
var SECTIONS = [
  { key: 'daily',  name: '今日新闻', sub: '60 秒读懂世界', ep: '60s',        icon: 'globe' },
  { key: 'weibo',  name: '微博热搜', sub: '实时热点榜',   ep: 'weibo',      icon: 'sparkle' },
  { key: 'zhihu',  name: '知乎热榜', sub: '热门讨论',     ep: 'zhihu',      icon: 'text' },
  { key: 'douyin', name: '抖音热榜', sub: '短视频热点',   ep: 'douyin',     icon: 'video' },
  { key: 'toutiao',name: '今日头条', sub: '资讯热榜',     ep: 'toutiao',    icon: 'doc' },
  { key: 'baidu',  name: '百度热搜', sub: '搜索热度榜',   ep: 'baidu/hot',  icon: 'search' },
  { key: 'hitokoto', name: '每日一言', sub: '一句话·一份心情', ep: 'hitokoto', icon: 'quote' }
];

/* 官方站点导航（接口不可用时的降级入口） */
var SITES = [
  { name: '人民网',   url: 'http://www.people.com.cn/' },
  { name: '新华网',   url: 'http://www.xinhuanet.com/' },
  { name: '央视新闻', url: 'https://news.cctv.com/' },
  { name: '澎湃新闻', url: 'https://www.thepaper.cn/' },
  { name: '新浪新闻', url: 'https://news.sina.com.cn/' },
  { name: '腾讯新闻', url: 'https://news.qq.com/' }
];

var cache = null;
try {
  cache = JSON.parse(localStorage.getItem(K_CACHE) || 'null');
  if (!cache || typeof cache !== 'object' || !cache.data) cache = null;
} catch (e) { cache = null; }

var cur = 'daily';          // 当前选中板块
var loading = false;
var seq = 0;                // 防止过期回调覆盖

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function safeUrl(u) {
  u = String(u || '');
  return /^https?:\/\//i.test(u) ? u : '';
}
function fmtTime(ts) {
  if (!ts) return '';
  try {
    var d = new Date(ts);
    function p(x) { return x < 10 ? '0' + x : '' + x; }
    return p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  } catch (e) { return ''; }
}
function secByKey(k) {
  for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].key === k) return SECTIONS[i];
  return SECTIONS[0];
}
function fresh() { return cache && (Date.now() - (cache.ts || 0) < TTL); }

/* ---------------- 数据解析 ---------------- */
function parsePayload(key, raw) {
  if (!raw) return null;
  var o;
  try { o = JSON.parse(raw); } catch (e) { return null; }
  if (!o || o.code !== 200 || !o.data) return null;
  var d = o.data;
  if (key === 'daily') {
    return {
      date: String(d.date || ''),
      news: Array.isArray(d.news) ? d.news : [],
      tip: String(d.tip || ''),
      cover: safeUrl(d.cover || d.image || '')
    };
  }
  if (key === 'hitokoto') {
    return { text: String(d.hitokoto || ''), from: String(d.from || d.author || '') };
  }
  // 热榜：统一为 [{ title, hot, url, desc }]
  var list = Array.isArray(d) ? d : (Array.isArray(d.list) ? d.list : []);
  var out = [];
  for (var i = 0; i < list.length; i++) {
    var it = list[i] || {};
    var title = it.title || it.name || it.word || it.q || '';
    if (!title) continue;
    var hot = it.hot_value || it.hot || it.heat || it.hotValue || it.index || 0;
    out.push({
      title: String(title),
      hot: hot,
      url: safeUrl(it.link || it.url || it.href || ''),
      desc: String(it.desc || it.description || '')
    });
  }
  return { list: out };
}

/* ---------------- 渲染片段 ---------------- */
function rankNum(n) {
  return n < 9 ? '0' + (n + 1) : '' + (n + 1);
}
function hotText(n) {
  n = Number(n) || 0;
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '亿';
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  return n > 0 ? String(n) : '';
}
function row(title, sub, url, idx) {
  var inner = '<span class="dl-tx"><b>' + esc(title) + '</b>' +
    (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>';
  if (url) {
    return '<button class="dl-row" data-act="open-browser" data-url="' + esc(url) + '">' +
      '<span class="dl-ic">' + rankNum(idx) + '</span>' + inner +
      '<span class="hl-go">' + akIcon('arrow') + '</span></button>';
  }
  return '<div class="dl-row"><span class="dl-ic">' + rankNum(idx) + '</span>' + inner + '</div>';
}

function renderDaily(p) {
  var h = '';
  if (p.date) h += '<div class="hint" style="margin:2px 0 12px">' + esc(p.date) + ' · 每日新闻速览</div>';
  if (p.news && p.news.length) {
    h += '<div class="dl-list">' + p.news.map(function (n, i) {
      return '<div class="dl-row"><span class="dl-ic">' + (i + 1) + '</span>' +
        '<span class="dl-tx"><b style="font-size:12.5px;line-height:1.5">' + esc(n) + '</b></span></div>';
    }).join('') + '</div>';
  } else {
    h += '<div class="note">暂无新闻数据，可点右上角刷新重试。</div>';
  }
  if (p.tip) h += '<div class="card page-card" style="margin-top:14px;background:var(--primary-container);color:var(--on-primary-container)">' +
    '<div style="font-size:13px;line-height:1.7">' + esc(p.tip) + '</div></div>';
  return h;
}

function renderHot(p) {
  if (!p.list || !p.list.length) return '<div class="note">暂无热榜数据，可点右上角刷新重试。</div>';
  return '<div class="dl-list">' + p.list.slice(0, 20).map(function (it, i) {
    var sub = [];
    if (hotText(it.hot)) sub.push('热度 ' + hotText(it.hot));
    if (it.desc) sub.push(it.desc.slice(0, 40));
    return row(it.title, sub.join(' · '), it.url, i);
  }).join('') + '</div>';
}

function renderHitokoto(p) {
  if (!p.text) return '<div class="note">暂无内容，可点右上角刷新重试。</div>';
  return '<div class="card page-card" style="background:var(--primary-container);color:var(--on-primary-container)">' +
    '<div style="font-size:17px;line-height:1.8;font-weight:600">“' + esc(p.text) + '”</div>' +
    (p.from ? '<div style="font-size:12px;opacity:.75;margin-top:12px;text-align:right">— ' + esc(p.from) + '</div>' : '') +
    '</div>';
}

function renderPayload(key, p) {
  if (!p) return '<div class="empty-state"><span class="em">⌁</span><b>暂时无法获取</b>' +
    '<span>接口不可用或无网络，可使用下方官方站点导航</span></div>';
  if (key === 'daily') return renderDaily(p);
  if (key === 'hitokoto') return renderHitokoto(p);
  return renderHot(p);
}

function siteNav() {
  return SITES.map(function (s) {
    return '<button class="hub-link" data-act="open-url" data-url="' + esc(s.url) + '">' +
      '<span class="hl-ic">' + akIcon('globe') + '</span>' +
      '<span class="hl-tx"><b>' + esc(s.name) + '</b></span>' +
      '<span class="hl-go">' + akIcon('arrow') + '</span></button>';
  }).join('');
}

/* ---------------- 页面骨架 ---------------- */
function pageHtml() {
  var chips = SECTIONS.map(function (s) {
    return '<button class="chip ' + (s.key === cur ? 'on' : '') + '" data-act="news-tab" data-key="' + s.key + '">' + esc(s.name) + '</button>';
  }).join('');
  var sec = secByKey(cur);
  var cached = cache && cache.data ? cache.data[cur] : null;
  var body = cached ? renderPayload(cur, cached) :
    '<div class="empty-state"><span class="em">◌</span><b>正在获取资讯…</b><span>首次加载需要联网，请稍候</span></div>';
  return '<div class="page">' +
    '<div class="page-title"><span class="pt-ic">' + akIcon('globe') + '</span>' +
      '<div><b>今日资讯</b><small>新闻 · 热榜 · 每日一言</small></div>' +
      '<button class="icon-btn" data-act="news-refresh" style="margin-left:auto">' + akIcon('refresh') + '</button></div>' +
    '<div class="note" style="margin-bottom:6px">匿名读取公开资讯接口，不上传任何本机数据；仅供浏览，内容版权归原作者与平台所有。</div>' +
    '<div class="chips">' + chips + '</div>' +
    '<div class="sec-label">' + esc(sec.name) + ' · ' + esc(sec.sub) +
      (fresh() && cached ? ' · ' + fmtTime(cache.ts) + ' 更新' : '') + '</div>' +
    '<div id="news-body">' + body + '</div>' +
    '<div class="sec-label">官方新闻站点</div>' +
    '<div class="hub-links">' + siteNav() + '</div>' +
    '<div style="height:20px"></div></div>';
}

/* 只重绘内容区与标签/时间，保留站内导航与滚动位置 */
function refreshView() {
  var view = document.querySelector('#view');
  if (!view || !view.querySelector('#news-body')) return;
  var sec = secByKey(cur);
  var cached = cache && cache.data ? cache.data[cur] : null;
  // 更新 chips 选中态
  var allChips = view.querySelectorAll('[data-act="news-tab"]');
  for (var i = 0; i < allChips.length; i++) {
    allChips[i].classList.toggle('on', allChips[i].getAttribute('data-key') === cur);
  }
  // 更新小标题
  var labels = view.querySelectorAll('.sec-label');
  if (labels.length) {
    labels[0].innerHTML = esc(sec.name) + ' · ' + esc(sec.sub) +
      (fresh() && cached ? ' · ' + fmtTime(cache.ts) + ' 更新' : '');
  }
  var box = view.querySelector('#news-body');
  if (box) box.innerHTML = cached ? renderPayload(cur, cached) :
    '<div class="empty-state"><span class="em">◌</span><b>正在获取资讯…</b></div>';
}

/* ---------------- 数据加载 ---------------- */
function load(key, force) {
  if (!key) key = cur;
  var my = ++seq;
  var sec = secByKey(key);
  // 有缓存且未过期时不重复请求（强制刷新除外）
  if (!force && cache && cache.data && cache.data[key] && fresh()) { refreshView(); return; }
  loading = true;
  var U = window.AK_UPDATE;
  if (!U || typeof U.httpGet !== 'function') {
    // 无网络模块：降级展示缓存或空态
    loading = false; refreshView(); return;
  }
  U.httpGet(BASE + sec.ep, function (raw) {
    if (my !== seq) return; // 过期回调
    var p = parsePayload(key, raw);
    if (p) {
      if (!cache || typeof cache !== 'object') cache = { data: {} };
      if (!cache.data) cache.data = {};
      cache.data[key] = p;
      cache.ts = Date.now();
      try { localStorage.setItem(K_CACHE, JSON.stringify(cache)); } catch (e) {}
    }
    loading = false;
    refreshView();
  });
}

function switchTab(key) {
  var found = false;
  for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].key === key) found = true;
  if (!found) return;
  cur = key;
  refreshView();
  load(key, false);
}

/* ---------------- 注册页面与对外接口 ---------------- */
var pages = window.AK_PAGES || (window.AK_PAGES = {});
pages.news = {
  title: '今日资讯', sub: '新闻 · 热榜 · 每日一言', icon: 'globe',
  render: function () { return ''; } // 由 AK_NEWS.page() 提供完整页面（含异步容器）
};

window.AK_NEWS = {
  page: pageHtml,
  mount: function () {
    // 进入页面时：若无有效缓存则自动拉取一次
    if (!fresh()) load(cur, false);
  },
  switchTab: switchTab,
  refresh: function () { load(cur, true); },
  sections: function () { return SECTIONS; }
};
})();
