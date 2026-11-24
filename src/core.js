/* ============================================================
   安空工具箱 — 应用框架 / 路由 / 工具引擎
   浅黄主题 · 手机 / 平板 / ChromeOS 响应式
   ============================================================ */
(function () {
'use strict';

var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
  return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
}); };
function ic(name, cls) { return akIcon(name, cls); }

var APP_NAME = '安空工具箱';
var VERSION = '2.8';
window.AK_VERSION = VERSION;
var FEEDBACK_EMAIL = window.AK_FEEDBACK_EMAIL || '3805278668@qq.com';

/* ---------------- 分类 ---------------- */
var CATS = [
  { id: 'query', name: '查询工具', tint: '#EEE9D5', desc: '农历 · 历史 · 性格测试 · 速查表' },
  { id: 'text',  name: '文本工具', tint: '#DCE9D3', desc: '编码解码 · 加密摘要 · 正则 · 校对' },
  { id: 'image', name: '媒体工具', tint: '#D9E8F0', desc: '取色 · 压缩裁剪 · 二维码 · 条形码' },
  { id: 'dev',   name: '开发者工具', tint: '#D8EAE9', desc: 'JSON/XML · 时间戳 · 进制 · IP 子网' },
  { id: 'calc',  name: '计算换算', tint: '#F2E4C9', desc: '计算器 · 单位换算 · 复利 · BMI' },
  { id: 'life',  name: '生活工具', tint: '#ECD9E8', desc: '便签 · 番茄钟 · 倒数日 · 密码' },
  { id: 'fun',   name: '设备测评', tint: '#DDE6F3', desc: '设备信息 · 水平仪 · 指南针 · 屏幕' },
  { id: 'game',  name: '小游戏', tint: '#E6DEF2', desc: '2048 · 井字棋 · 反应测试 · 节拍器' },
  { id: 'hub',   name: '聚合资源', tint: '#F4EBCB', desc: '影音 · 玩机 · 链接解析 · 资料库' }
];
function catById(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i]; return CATS[0]; }

/* ---------------- 本地存储 ---------------- */
function load(k, d) { try { var v = localStorage.getItem('ak_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
function save(k, v) { try { localStorage.setItem('ak_' + k, JSON.stringify(v)); } catch (e) {} }

var state = {
  tab: 'home',
  route: 'home',
  back: 'home',
  query: '',
  theme: load('theme', 'auto'),
  accent: load('accent', 'purple'),
  fav: load('fav', []),
  history: load('history', []),
  catFilter: 'all',
  catOpen: false,
  quickOpen: false,
  layout: 'phone'
};

/* ---------------- 主题 ---------------- */
function isDark() {
  return state.theme === 'dark' || (state.theme === 'auto' &&
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}
function applyTheme() {
  var dark = isDark();
  var root = document.documentElement;
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  root.setAttribute('data-accent', state.accent || 'purple');
  var meta = $('#theme-meta');
  if (meta) meta.setAttribute('content', dark ? '#191610' : '#FFF8EE');
  N.call('theme', dark ? 'dark' : 'light');
  N.call('accent', state.accent || 'purple');
}
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (state.theme === 'auto') applyTheme();
  });
}

/* ---------------- 原生桥 ---------------- */
var N = {
  has: function () { return !!(window.Ankong && typeof window.Ankong.openUrl === 'function'); },
  call: function (method, arg) {
    try {
      if (window.Ankong && typeof window.Ankong[method] === 'function') {
        return window.Ankong[method](typeof arg === 'string' ? arg : JSON.stringify(arg));
      }
    } catch (e) {}
    return null;
  }
};

/* ---------------- 通用 UI ---------------- */
var toastTimer;
function toast(msg) {
  N.call('toast', msg);
  var el = $('#toast'); if (!el) return;
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1900);
}
function copyText(text) {
  if (!text) { toast('没有可复制的内容'); return; }
  N.call('copy', String(text));
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(String(text)).catch(function () { fallbackCopy(text); });
  } else fallbackCopy(text);
  toast('已复制到剪贴板');
}
function fallbackCopy(text) {
  try {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
  } catch (e) {}
}

function toolById(id) { for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i].id === id) return TOOLS[i]; return null; }
function isFav(id) { return state.fav.indexOf(id) >= 0; }
function toggleFav(id) {
  var i = state.fav.indexOf(id);
  if (i >= 0) { state.fav.splice(i, 1); toast('已取消收藏'); }
  else { state.fav.unshift(id); toast('已加入收藏'); }
  save('fav', state.fav); render();
}
function pushHistory(id) {
  var i = state.history.indexOf(id);
  if (i >= 0) state.history.splice(i, 1);
  state.history.unshift(id);
  if (state.history.length > 30) state.history.length = 30;
  save('history', state.history);
}

/* ---------------- 布局：手机 / 平板 / 桌面 ---------------- */
function applyLayout() {
  var w = window.innerWidth || document.documentElement.clientWidth;
  var l = w >= 1100 ? 'desktop' : w >= 720 ? 'tablet' : 'phone';
  state.layout = l;
  document.documentElement.setAttribute('data-layout', l);
  document.documentElement.setAttribute('data-input', window.matchMedia && window.matchMedia('(pointer: fine)').matches ? 'mouse' : 'touch');
}

/* 兼容保留：标准窗口下由系统自动避让系统栏，此处不再需要注入 */
function setInsets(top, bottom, left, right) {
  var s = document.documentElement.style;
  s.setProperty('--safe-top', Math.max(0, Math.round(top)) + 'px');
  s.setProperty('--safe-bottom', Math.max(0, Math.round(bottom)) + 'px');
  s.setProperty('--safe-left', Math.max(0, Math.round(left)) + 'px');
  s.setProperty('--safe-right', Math.max(0, Math.round(right)) + 'px');
}

/* ---------------- 顶栏 ---------------- */
function appbarHtml() {
  var r = state.route;
  if (r === 'home') {
    // 首页品牌标题在页面内，这里只保留安全区 + 右上角快捷按钮
    return '<div class="appbar-row" style="min-height:6px"></div>';
  }
  if (r === 'search') {
    return '<div class="appbar-row" style="gap:8px">' +
      '<button class="icon-btn" data-act="back">' + ic('back') + '</button>' +
      '<div style="flex:1">' + searchbarHtml(true) + '</div></div>';
  }
  var title = APP_NAME, sub = '';
  if (r === 'tools') { title = '工具'; sub = TOOLS.length + ' 个工具 · ' + CATS.length + ' 个分类'; }
  else if (r === 'news') { title = '今日资讯'; sub = '新闻 · 热榜 · 每日一言'; }
  else if (r === 'fav') { title = '我的收藏'; sub = state.fav.length + ' 个常用工具'; }
  else if (r === 'me') { title = '关于'; sub = '设置 · 数据 · 关于'; }
  else if (r.indexOf('page:') === 0) { title = akPageTitle(r.slice(5)); sub = '安空工具箱'; }
  else if (r.indexOf('cat:') === 0) { var c = catById(r.slice(4)); title = c.name; sub = c.desc; }
  else if (r.indexOf('tool:') === 0) { var t = toolById(r.slice(5)); title = t ? t.name : '工具'; sub = t ? catById(t.cat).name : ''; }
  return '<div class="appbar-row">' +
    (r.indexOf('tool:') === 0 || r.indexOf('cat:') === 0 || r === 'fav' || r.indexOf('page:') === 0
      ? '<button class="icon-btn" data-act="back">' + ic('back') + '</button>' : '') +
    '<div style="flex:1;min-width:0"><div class="title" style="font-size:22px">' + esc(title) + '</div>' +
    (sub ? '<div class="subtitle">' + esc(sub) + '</div>' : '') + '</div>' +
    (r.indexOf('tool:') === 0
      ? '<button class="icon-btn" data-act="fav" data-id="' + esc(r.slice(5)) + '">' +
        ic(isFav(r.slice(5)) ? 'star' : 'starOutline') + '</button>'
      : '<button class="icon-btn" data-act="go-search">' + ic('search') + '</button>') +
    '<button class="icon-btn" data-act="theme-quick">' + ic(isDark() ? 'sun' : 'moon') + '</button>' +
    '</div>';
}
function searchbarHtml(autofocus) {
  return '<div class="searchbar" style="margin-top:' + (autofocus ? '0' : '14px') + '">' + ic('search') +
    '<input id="search-input" type="search" placeholder="搜索工具，例如：JSON / 图片压缩 / 单位换算" ' +
    'value="' + esc(state.query) + '" ' + (autofocus ? 'autofocus' : '') + '></div>';
}

/* ---------------- 导航 ---------------- */
var TABS = [
  { id: 'home', name: '功能', icon: 'grid' },
  { id: 'tools', name: '工具', icon: 'toolbox' },
  { id: 'news', name: '资讯', icon: 'globe' },
  { id: 'me', name: '关于', icon: 'info' }
];
function renderTabs() {
  $('#tabbar').innerHTML = TABS.map(function (t) {
    var on = state.tab === t.id;
    return '<button class="tab ' + (on ? 'on' : '') + '" data-act="tab" data-tab="' + t.id + '">' +
      '<span class="ic-wrap">' + ic(t.icon) + '</span><span class="lb">' + t.name + '</span></button>';
  }).join('');
  $('#rail').innerHTML = '<div class="logo">' + ic('grid') + '</div>' +
    TABS.map(function (t) {
      var on = state.tab === t.id;
      return '<button class="rail-btn ' + (on ? 'on' : '') + '" data-act="tab" data-tab="' + t.id + '">' +
        '<span class="rw">' + ic(t.icon) + '</span><span>' + t.name + '</span></button>';
    }).join('') +
    '<button class="rail-btn" data-act="go-search" style="margin-top:auto"><span class="rw">' + ic('search') + '</span><span>搜索</span></button>';
}
function renderCatbar() {
  var f = state.catFilter;
  var all = TOOLS.length;
  $('#catbar').innerHTML = '<div class="cb-head">工具分类</div>' +
    '<button class="cb-item ' + (f === 'all' ? 'on' : '') + '" data-act="filter" data-cat="all">' +
      ic('grid') + '<span>全部 ' + all + '</span></button>' +
    CATS.map(function (c) {
      var n = TOOLS.filter(function (t) { return t.cat === c.id; }).length;
      return '<button class="cb-item ' + (f === c.id ? 'on' : '') + '" data-act="filter" data-cat="' + c.id + '">' +
        ic(AK_CAT_ICON[c.id] || 'grid') + '<span>' + esc(c.name) + '</span></button>';
    }).join('') +
    '<button class="cb-fold" data-act="filter" data-cat="all">' + ic('menu') + '</button>';
}
function renderFab() {
  $('#fab').innerHTML = ic(state.quickOpen ? 'close' : 'back');
  var ids = state.fav.length ? state.fav.slice(0, 4) : [];
  ['json', 'qrcode', 'base64', 'unit'].forEach(function (id) { if (ids.length < 8 && ids.indexOf(id) < 0) ids.push(id); });
  $('#quick').innerHTML = '<h4>快捷工具</h4><div class="qp-grid">' +
    ids.map(function (id) {
      var t = toolById(id); if (!t) return '';
      return '<button data-act="tool" data-id="' + id + '">' + akToolIcon(t) + '<span>' + esc(t.name) + '</span></button>';
    }).join('') + '</div>';
  $('#quick').classList.toggle('show', !!state.quickOpen);
}

/* ---------------- 组件片段 ---------------- */
function tile(t, withBadge) {
  return '<button class="tool-tile" data-act="tool" data-id="' + t.id + '">' +
    (withBadge && isFav(t.id) ? '<span class="badge"></span>' : '') +
    akToolIcon(t) + '<span class="nm">' + esc(t.name) + '</span></button>';
}
function hcard(t, plain) {
  return '<button class="hcard ' + (plain ? 'plain' : '') + '" data-act="tool" data-id="' + t.id + '">' +
    akToolIcon(t) + '<span class="nm">' + esc(t.name) + '</span></button>';
}
function catRow(c, count) {
  return '<button class="cat-row" data-act="cat" data-cat="' + c.id + '">' +
    akCatIcon(c.id, 'ci') +
    '<span class="tx"><b>' + esc(c.name) + '</b><small>' + esc(c.desc) + '</small></span>' +
    '<span class="cnt">' + count + '</span>' + ic('arrow', 'arrow') + '</button>';
}
function section(title, extra, body, iconName) {
  return '<div class="section-head">' +
    (iconName ? '<span class="sec-ic">' + ic(iconName) + '</span>' : '') +
    '<h2>' + esc(title) + '</h2><span class="extra">' + (extra || '') + '</span></div>' + body;
}
function secLabel(t) { return '<div class="sec-label">' + esc(t) + '</div>'; }

/* ---------------- 检查更新：动态 UI 片段 ----------------
   由 update.js 在检查状态变化时调用；这里集中产出三块可替换的 HTML，
   避免整页重绘打断用户正在填写的表单或滚动位置。 */
function akUpdBannerHtml() {
  var U = window.AK_UPDATE;
  if (!U || !U.visible()) return '';
  var s = U.get();
  return '<div class="upd-banner-wrap">' +
    '<button class="upd-banner" data-act="update-banner">' +
      '<span class="ub-ic">' + ic('download') + '</span>' +
      '<span class="ub-tx"><b>发现新版本 v' + esc(s.version) + '</b>' +
      '<small>点击查看更新说明并下载安装包</small></span>' +
      '<span class="ub-go">' + ic('arrow') + '</span></button>' +
    '<button class="ub-x" data-act="update-dismiss" aria-label="忽略此版本">' + ic('close') + '</button>' +
    '</div>';
}
function akUpdStatusHtml(s) {
  var U = window.AK_UPDATE;
  var local = U ? U.get().localVersion : VERSION;
  var cls = 'upd-box';
  if (!s) s = { state: 'idle' };
  function box(kind, title, sub) {
    return '<div class="' + cls + ' ' + kind + '"><span class="ud-dot"></span>' +
      '<div><b>' + title + '</b><small>' + sub + '</small></div></div>';
  }
  if (s.state === 'checking') return box('is-load', '正在检查更新', '正在连接 GitHub Releases，请稍候');
  if (s.state === 'available') {
    var pub = U ? (U.formatTime(s.publishedAt) || '—') : '—';
    return box('is-new', '发现新版本', 'v' + esc(s.version) + ' · 发布于 ' + esc(pub));
  }
  if (s.state === 'uptodate') {
    var last = U ? (U.formatTime(s.checkedAt) || '刚刚') : '刚刚';
    return box('is-ok', '已是最新版本', '当前版本 v' + esc(local) + ' · 上次检查 ' + esc(last));
  }
  if (s.state === 'error') return box('is-warn', '暂时无法检查更新', '网络不可用或接口暂不可达，可稍后重试；不影响离线使用');
  return box('', '尚未检查', '点击「检查更新」获取最新版本信息');
}
function akUpdActionsHtml(s) {
  var U = window.AK_UPDATE;
  var h = '<button class="btn tonal" data-act="page-do" data-do="check-update">检查更新</button>';
  if (s && s.state === 'available' && s.downloadUrl) {
    var sz = U && s.assetSize ? '（' + esc(U.formatSize(s.assetSize)) + '）' : '';
    h += '<button class="btn tonal" data-act="page-do" data-do="update-download">下载新版本' + sz + '</button>';
  } else if (s && s.state === 'available') {
    h += '<button class="btn tonal" data-act="page-do" data-do="update-releases">前往下载页面</button>';
  }
  h += '<button class="btn outline" data-act="page-do" data-do="update-releases">查看全部版本</button>';
  return h;
}
function akUpdRowSub() {
  var U = window.AK_UPDATE;
  if (U && U.visible()) return '发现新版本 v' + U.get().version + '，点击查看';
  return '当前版本 v' + VERSION + ' · ' + (U && U.get().auto ? '自动检查已开启' : '自动检查已关闭');
}
window.akUpdBannerHtml = akUpdBannerHtml;
window.akUpdStatusHtml = akUpdStatusHtml;
window.akUpdActionsHtml = akUpdActionsHtml;

/* ---------------- 页面：功能（首页） ---------------- */
var BANNERS = [
  { cls: 'b1', tag: '推荐', title: '工具上新', sub: TOOLS.length + ' 个工具，全部离线可用', route: 'tools' },
  { cls: 'b2', tag: '效率', title: '文本与开发', sub: '编码、摘要、JSON、正则一应俱全', route: 'cat:dev' },
  { cls: 'b4', tag: '轻松', title: '小游戏时间', sub: '2048 · 井字棋 · 反应速度测试', route: 'cat:game' },
  { cls: 'b3', tag: '外观', title: '深色模式', sub: '夜里使用更舒服，一键切换', route: 'theme-quick' }
];
function pageHome() {
  var quick = ['json', 'base64', 'imgcompress', 'unit', 'qrcode', 'password', 'timestamp', 'device'];
  var rec = ['wallpaper', 'avatar', 'lunar', 'history', 'mbti', 'led', 'weather', 'garbage', 'bmi', 'calc', 'ninegrid', 'color', 'game2048', 'idiom'];
  var recent = state.history.length ? state.history.slice(0, 10) : quick;

  var banners = '<div class="banner-row">' + BANNERS.map(function (b) {
    return '<button class="banner ' + b.cls + '" data-act="banner" data-route="' + b.route + '">' +
      '<span class="b-tag">' + b.tag + '</span><b>' + esc(b.title) + '</b><small>' + esc(b.sub) + '</small></button>';
  }).join('') + '</div>';

  var left =
    banners + searchbarHtml(false) +
    '<div class="promo">' + ic('shield') + '<div><b>完全离线 · 不收集数据</b>' +
    '<p>' + TOOLS.length + ' 个工具全部在本机运行，输入内容不会上传，无广告、免登录、不申请多余权限。</p></div></div>' +
    akHubsHtml() +
    section('最近使用', '点击即用', '<div class="hscroll">' + recent.map(function (id) {
      var t = toolById(id); return t ? hcard(t) : '';
    }).join('') + '</div>', 'history') +
    section('常用功能', '', '<div class="hscroll">' + rec.map(function (id) {
      var t = toolById(id); return t ? hcard(t, true) : '';
    }).join('') + '</div>', 'sparkle');

  var right = section('全部工具分类', CATS.length + ' 类', CATS.map(function (c) {
    return catRow(c, TOOLS.filter(function (t) { return t.cat === c.id; }).length);
  }).join(''), 'grid');

  return '<div class="page">' +
    '<div class="brand"><h1>' + APP_NAME + '</h1><p>探索 · 发现 · 效率</p></div>' +
    '<div id="upd-slot">' + akUpdBannerHtml() + '</div>' +
    '<div class="home-cols"><div>' + left + '</div><div>' + right + '</div></div>' +
    '<div style="height:16px"></div></div>';
}

/* ---------------- 页面：工具 ---------------- */
function pageTools() {
  var f = state.catFilter;
  var list = f === 'all' ? TOOLS : TOOLS.filter(function (t) { return t.cat === f; });
  var cname = f === 'all' ? '全部工具' : catById(f).name;
  var chips = '<div class="chips"' + (state.catOpen ? '' : ' style="display:none"') + '>' +
    '<button class="chip ' + (f === 'all' ? 'on' : '') + '" data-act="filter" data-cat="all">全部</button>' +
    CATS.map(function (c) { return '<button class="chip ' + (f === c.id ? 'on' : '') + '" data-act="filter" data-cat="' + c.id + '">' + esc(c.name) + '</button>'; }).join('') + '</div>';
  var body;
  if (f === 'all') {
    body = CATS.map(function (c) {
      var ts = TOOLS.filter(function (t) { return t.cat === c.id; });
      return section(c.name, ts.length + ' 个', '<div class="grid">' + ts.map(function (t) { return tile(t, true); }).join('') + '</div>');
    }).join('');
  } else {
    body = '<div class="grid" style="margin-top:6px">' + list.map(function (t) { return tile(t, true); }).join('') + '</div>';
  }
  return '<div class="page">' +
    '<button class="cat-select" data-act="cat-toggle"><span>' + esc(cname) + ' · ' + list.length + ' 个工具</span>' + ic('chevron') + '</button>' +
    chips + body + '<div style="height:12px"></div></div>';
}

/* ---------------- 页面：收藏 / 分类 ---------------- */
function pageFav() {
  if (!state.fav.length) {
    return '<div class="page"><div class="empty-state"><span class="em">☆</span><b>还没有收藏的工具</b>' +
      '<p>打开任意工具，点击右上角的星标即可收藏，下次一秒直达。</p></div>' +
      section('猜你想用', '', '<div class="grid">' +
        ['json', 'base64', 'imgcompress', 'qrcode', 'lunar', 'game2048'].map(function (id) { var t = toolById(id); return t ? tile(t) : ''; }).join('') + '</div>') + '</div>';
  }
  return '<div class="page">' + section('我的收藏', state.fav.length + ' 个', '<div class="grid">' +
    state.fav.map(function (id) { var t = toolById(id); return t ? tile(t, true) : ''; }).join('') + '</div>') +
    section('最近使用', '', '<div class="grid">' +
      state.history.slice(0, 12).map(function (id) { var t = toolById(id); return t ? tile(t) : ''; }).join('') + '</div>') + '</div>';
}
function pageCat(id) {
  var c = catById(id), ts = TOOLS.filter(function (t) { return t.cat === id; });
  return '<div class="page">' + section(c.name, ts.length + ' 个工具',
    '<div class="grid">' + ts.map(function (t) { return tile(t, true); }).join('') + '</div>') + '</div>';
}

/* ---------------- 页面：关于 / 设置 ---------------- */
/* ---------------- 多语言 ---------------- */
function akLang() { return window.AKI18N ? window.AKI18N.get() : 'zh-CN'; }
function akLangChips() {
  if (!window.AKI18N) return '';
  var cur = akLang();
  return '<div class="chips chips-wrap" data-no-i18n="1" style="padding:0 2px 4px">' +
    window.AKI18N.langs.map(function (l) {
      return '<button class="chip ' + (cur === l.id ? 'on' : '') + '" data-act="lang" data-lang="' + l.id + '">' + esc(l.name) + '</button>';
    }).join('') + '</div>';
}

function settingRow(icon, title, sub, act, id) {
  return '<button class="setting-row" data-act="' + act + '"' + (id ? ' data-id="' + id + '"' : '') + '>' +
    '<span class="si">' + ic(icon) + '</span>' +
    '<span class="st"><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></span>' + ic('arrow', 'arrow') + '</button>';
}
function pageMe() {
  var themeLabels = { auto: '跟随系统', light: '浅色', dark: '深色' };
  var themeRow = '<div class="setting-row"><span class="si">' + ic('moon') + '</span>' +
    '<span class="st"><b>主题模式</b><small>当前：' + themeLabels[state.theme] + '</small></span></div>' +
    '<div class="chips" style="padding:0 2px 10px">' + ['auto', 'light', 'dark'].map(function (m) {
      return '<button class="chip ' + (state.theme === m ? 'on' : '') + '" data-act="theme" data-mode="' + m + '">' + themeLabels[m] + '</button>';
    }).join('') + '</div>';
  var accentNames = { purple: '优雅紫', grass: '青草绿', amber: '浅黄', mint: '薄荷', sakura: '樱粉', sky: '天蓝', lilac: '丁香' };
  var accentRow = '<div class="setting-row"><span class="si">' + ic('palette') + '</span>' +
    '<span class="st"><b>主题色</b><small>当前：' + (accentNames[state.accent] || '优雅紫') + ' · 更多在「设置」中</small></span>' +
    '<button class="sr-link" data-act="page" data-id="settings">配置' + ic('arrow') + '</button></div>';

  return '<div class="page">' +
    '<div class="user-hero"><div class="uh-row"><span class="uh-ic">' + ic('person') + '</span>' +
      '<div><b>你好，欢迎使用</b><small>所有数据仅保存在本机，无需登录，也不会同步到云端。</small></div></div>' +
      '<button class="uh-btn" data-act="theme-quick">' + ic(isDark() ? 'sun' : 'moon') +
      '切换为' + (isDark() ? '浅色' : '深色') + '模式</button></div>' +
    '<div class="stat-cards"><div class="card"><b>' + TOOLS.length + '</b><small>工具总数</small></div>' +
      '<div class="card"><b>' + state.fav.length + '</b><small>我的收藏</small></div>' +
      '<div class="card"><b>' + state.history.length + '</b><small>使用记录</small></div></div>' +

    secLabel('我的') +
    settingRow('star', '我的收藏', state.fav.length + ' 个常用工具', 'nav-fav') +
    settingRow('history', '最近使用', state.history.length + ' 条记录', 'nav-fav') +
    settingRow('heart', '推荐给朋友', '把安空工具箱分享给身边的人', 'share') +

    secLabel('语言 / Language') + '<div class="card" style="padding:10px">' +
      '<div class="setting-row"><span class="si">' + ic('translate') + '</span>' +
      '<span class="st"><b>界面语言</b><small>切换后即时生效并记住选择</small></span></div>' +
      akLangChips() + '</div>' +

    secLabel('外观') + '<div class="card" style="padding:6px 10px">' + themeRow + accentRow + '</div>' +

    secLabel('数据') +
    settingRow('trash', '清空使用记录', '仅清除本机记录，不影响收藏', 'clear-history') +
    settingRow('trash', '清空收藏', '移除所有已收藏的工具', 'clear-fav') +
    settingRow('database', '本地存储管理', '便签、计分、最高分等均保存在本机', 'storage-info') +

    secLabel('支持') +
    settingRow('heart', '捐赠支持', '免费 · 无广告 · 不设捐赠', 'page', 'donate') +

    secLabel('政策') +
    settingRow('shield', '侵权和违规内容处理', '投诉渠道与处理流程', 'page', 'infringe') +
    settingRow('shield', '隐私政策', '不联网上传、不收集个人信息', 'page', 'privacy') +
    settingRow('doc', '用户协议', '使用条款与免责说明', 'page', 'terms') +
    settingRow('key', '权限说明', '逐项列出权限与用途', 'page', 'permission') +

    secLabel('其他') +
    settingRow('grid', '更多页面', '指南 · 功能地图 · 工具索引 · 说明 · 版本历史', 'page', 'more') +
    settingRow('database', 'Cookie 管理', '查看并清理本机站点数据', 'page', 'cookie') +
    settingRow('download', '下载管理', '已保存到相册的图片', 'page', 'downloads') +
    settingRow('trash', '缓存管理', '占用统计与清理', 'page', 'cache') +
    settingRow('refresh', '检查更新', akUpdRowSub(), 'page', 'update') +
    settingRow('note', '反馈', '问题、建议与内容投诉', 'page', 'feedback') +
    settingRow('book', '帮助', '常见问题与使用技巧', 'page', 'help') +
    settingRow('person', '加入官群', '交流与使用反馈', 'page', 'group') +
    settingRow('heart', '分享应用', '把安空工具箱推荐给朋友', 'share') +
    settingRow('settings', '设置', '主题模式、主题色等个性化配置', 'page', 'settings') +
    settingRow('info', '关于', '应用信息、实现说明与致谢', 'page', 'about') +

    '<div style="height:16px"></div></div>';
}

/* ---------------- 页面：搜索 ---------------- */
function pageSearch() {
  var q = state.query.trim().toLowerCase();
  var list = !q ? [] : TOOLS.filter(function (t) {
    return (t.name + ' ' + (t.desc || '') + ' ' + (t.tags || '') + ' ' + catById(t.cat).name).toLowerCase().indexOf(q) >= 0;
  });
  var body = !q
    ? '<div class="empty-state"><span class="em">?</span><b>搜索工具</b><p>试试输入「压缩」「换算」「JSON」「二维码」「农历」</p></div>'
    : (list.length ? list.map(function (t) {
        return '<button class="search-result" data-act="tool" data-id="' + t.id + '">' +
          akToolIcon(t) +
          '<span class="sr-tx"><b>' + esc(t.name) + '</b><small>' + esc(t.desc || '') + '</small></span>' +
          '<span class="sr-cat">' + esc(catById(t.cat).name) + '</span></button>';
      }).join('') : '<div class="empty-state"><span class="em">…</span><b>没有找到「' + esc(state.query) + '」</b><p>换个关键词试试</p></div>');
  return '<div class="page">' + section(q ? '搜索结果' : '', q ? list.length + ' 个' : '', body) + '</div>';
}

/* ---------------- 工具引擎 ---------------- */
function fieldHtml(f) {
  var v = f.value == null ? '' : f.value;
  var id = 'f-' + f.k;
  var label = '<label for="' + id + '">' + esc(f.label) + '</label>';
  var input;
  switch (f.type) {
    case 'textarea':
      input = '<textarea class="input" id="' + id + '" data-k="' + f.k + '" rows="' + (f.rows || 5) + '" placeholder="' + esc(f.placeholder || '') + '">' + esc(v) + '</textarea>'; break;
    case 'select':
      input = '<select class="input" id="' + id + '" data-k="' + f.k + '">' + (f.options || []).map(function (o) {
        var val = Array.isArray(o) ? o[0] : o, txt = Array.isArray(o) ? o[1] : o;
        return '<option value="' + esc(val) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + esc(txt) + '</option>';
      }).join('') + '</select>'; break;
    case 'color':
      input = '<div class="color-row"><input type="color" id="' + id + '" data-k="' + f.k + '" value="' + esc(v || '#6750a4') + '">' +
        '<input class="input" type="text" data-mirror="' + id + '" value="' + esc(v || '#6750a4') + '" placeholder="#RRGGBB"></div>'; break;
    case 'range':
      input = '<input type="range" id="' + id + '" data-k="' + f.k + '" min="' + (f.min || 0) + '" max="' + (f.max || 100) + '" step="' + (f.step || 1) + '" value="' + esc(v || f.min || 0) + '">' +
        '<div class="hint" data-range-label="' + id + '">' + esc(v || f.min || 0) + '</div>'; break;
    case 'switch':
      return '<div class="switch-row"><div><div class="st">' + esc(f.label) + '</div>' +
        (f.hint ? '<div class="sd">' + esc(f.hint) + '</div>' : '') + '</div>' +
        '<button class="toggle ' + (v ? 'on' : '') + '" data-act="toggle" data-k="' + f.k + '" role="switch"></button></div>';
    case 'file':
      input = '<input class="input" type="file" id="' + id + '" data-k="' + f.k + '" accept="' + (f.accept || 'image/*') + '">'; break;
    case 'date': case 'time': case 'datetime-local':
      input = '<input class="input" type="' + f.type + '" id="' + id + '" data-k="' + f.k + '" value="' + esc(v) + '">'; break;
    default:
      input = '<input class="input" type="' + (f.type || 'text') + '" id="' + id + '" data-k="' + f.k + '" value="' + esc(v) + '" placeholder="' + esc(f.placeholder || '') + '"' +
        (f.type === 'number' ? ' step="any"' : '') + '>';
  }
  return '<div class="field">' + (f.type === 'switch' ? '' : label) + input +
    (f.hint && f.type !== 'switch' ? '<div class="hint">' + esc(f.hint) + '</div>' : '') + '</div>';
}

function readFields(host, fields) {
  var v = {};
  (fields || []).forEach(function (f) {
    if (f.type === 'switch') {
      var tg = host.querySelector('[data-act="toggle"][data-k="' + f.k + '"]');
      v[f.k] = !!(tg && tg.classList.contains('on'));
    } else {
      var el = host.querySelector('[data-k="' + f.k + '"]');
      if (el) v[f.k] = f.type === 'file' ? el.files[0] : el.value;
    }
  });
  return v;
}

function stripTags(s) {
  return String(s)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|tr|p|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n').trim();
}
function showResult(host, out, isErr, copyable) {
  var box = host.querySelector('.result');
  if (!box) return;
  box.classList.remove('err', 'empty');
  if (isErr) box.classList.add('err');
  if (out == null || out === '') {
    box.classList.add('empty'); box.innerHTML = '结果会显示在这里';
    return;
  }
  var html, text;
  if (out && typeof out === 'object') {
    html = out.html != null ? out.html : esc(String(out.text == null ? '' : out.text));
    text = out.text != null ? out.text : stripTags(out.html || '');
  } else {
    var s = String(out);
    var rich = /class="(kv|hint|note|color-row|sec-label)"|<table|<div|<pre|<span style=|<img |<b style=|<mark |<code /i.test(s);
    html = rich ? s : esc(s);
    text = rich ? stripTags(s) : s;
  }
  box.innerHTML = html + (copyable === false ? '' : '<button class="copy" data-act="copy-result">复制</button>');
  box._text = text;
}

function pageTool(id) {
  var t = toolById(id);
  if (!t) return '<div class="page"><div class="empty-state">工具不存在</div></div>';
  pushHistory(id);
  var head = '<div class="detail-head">' + akToolIcon(t) +
    '<span class="dh-tx"><b>' + esc(t.name) + '</b><small>' + esc(t.desc || '') + '</small></span></div>';
  var fields = (t.fields || []).map(fieldHtml).join('');
  var note = t.note ? '<div class="note"><b>说明</b>' + esc(t.note) + '</div>' : '';
  var custom = !!t.custom;
  var html = '<div class="page" id="tool-host" data-tool="' + id + '">' + head + note +
    (custom ? '<div id="tool-custom"></div>' : fields +
      '<div class="btn-row"><button class="btn full" data-act="run">运行 / 计算</button></div>' +
      '<div class="result empty">结果会显示在这里</div>');
  if (t.extra) html += t.extra;
  html += '</div>';
  return html;
}

var api = {
  toast: toast, copy: copyText, esc: esc, $: $, $$: $$,
  showResult: function (out, err, copyable) { showResult($('#tool-host'), out, err, copyable); },
  host: function () { return $('#tool-host'); },
  custom: function () { return $('#tool-custom'); },
  native: N,
  refresh: render,
  fields: function () { return readFields($('#tool-host'), (toolById(state.route.slice(5)) || {}).fields); },
  download: function (dataUrl, name) {
    N.call('saveImage', JSON.stringify({ data: dataUrl, name: name || 'ankong.png' }));
    try {
      var a = document.createElement('a'); a.href = dataUrl; a.download = name || 'ankong.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      toast('已保存到下载目录');
    } catch (e) { toast('长按图片可保存'); }
  }
};

function runTool(host, id) {
  var t = toolById(id); if (!t || t.custom || !t.run) return;
  var v = readFields(host, t.fields);
  try {
    var out = t.run(v, api);
    if (out && typeof out.then === 'function') {
      showResult(host, '处理中…', false, false);
      out.then(function (res) { showResult(host, res, false, t.copyable); N.call('vibrate', '10'); })
         .catch(function (err) { showResult(host, err && err.message ? err.message : String(err), true, false); });
      return;
    }
    showResult(host, out, false, t.copyable);
    N.call('vibrate', '10');
  } catch (e) {
    showResult(host, e && e.message ? e.message : String(e), true, false);
  }
}

/* ---------------- 主渲染 ---------------- */
function render() {
  applyTheme();
  applyLayout();
  var r = state.route;
  var dev = $('#device');
  dev.setAttribute('data-page', (r === 'tools' || r.indexOf('cat:') === 0) ? 'tools' : r.split(':')[0]);
  $('#appbar').innerHTML = appbarHtml();
  var html;
  if (r === 'home') html = pageHome();
  else if (r === 'tools') html = pageTools();
  else if (r === 'news') html = (window.AK_NEWS && window.AK_NEWS.page) ? window.AK_NEWS.page() : '<div class="page"><div class="empty-state">资讯模块未加载</div></div>';
  else if (r === 'fav') html = pageFav();
  else if (r === 'me') html = pageMe();
  else if (r === 'search') html = pageSearch();
  else if (r.indexOf('page:') === 0) html = akPageHtml(r.slice(5));
  else if (r.indexOf('cat:') === 0) html = pageCat(r.slice(4));
  else if (r.indexOf('tool:') === 0) html = pageTool(r.slice(5));
  else html = pageHome();
  var view = $('#view');
  view.innerHTML = html;
  view.scrollTop = 0;
  renderTabs();
  renderCatbar();
  renderFab();
  if (r.indexOf('tool:') === 0) {
    var t = toolById(r.slice(5));
    if (t && t.custom) {
      try { t.custom($('#tool-custom'), api); }
      catch (e) { $('#tool-custom').innerHTML = '<div class="note">组件加载失败：' + esc(e.message) + '</div>'; }
    }
    if (t && t.auto && !t.custom) runTool($('#tool-host'), r.slice(5));
  }
  if (r === 'news' && window.AK_NEWS && window.AK_NEWS.mount) {
    try { window.AK_NEWS.mount(); } catch (e) {}
  }
  var si = $('#search-input');
  if (si) {
    si.addEventListener('input', function () {
      state.query = si.value;
      if (state.route !== 'search') { go('search'); setTimeout(function () { var n = $('#search-input'); if (n) { n.focus(); } }, 30); }
      else {
        var host = $('#view');
        var pos = host.scrollTop;
        var page = $('.page', host);
        if (page) { page.innerHTML = pageSearch().replace(/^<div class="page">|<\/div>$/g, ''); }
        host.scrollTop = pos;
      }
    });
    si.addEventListener('focus', function () { if (state.route !== 'search') go('search'); });
  }
  $$('input[type="color"]').forEach(function (c) {
    c.addEventListener('input', function () {
      var m = $('[data-mirror="' + c.id + '"]'); if (m) m.value = c.value;
    });
  });
  $$('[data-mirror]').forEach(function (m) {
    m.addEventListener('change', function () {
      var c = $('#' + m.getAttribute('data-mirror'));
      if (c && /^#[0-9a-f]{6}$/i.test(m.value.trim())) c.value = m.value.trim();
    });
  });
  $$('input[type="range"]').forEach(function (rg) {
    rg.addEventListener('input', function () {
      var lb = $('[data-range-label="' + rg.id + '"]'); if (lb) lb.textContent = rg.value;
    });
  });
  if (window.AKI18N) window.AKI18N.apply();
}

function go(route, tab) {
  if (route !== state.route) state.back = state.route;
  state.route = route;
  state.quickOpen = false;
  if (tab) state.tab = tab;
  else if (['home', 'tools', 'news', 'me'].indexOf(route) >= 0) state.tab = route;
  render();
}

/* ---------------- 音阶试听 ---------------- */
function akPlayNotes(notes) {
  var C = window.AudioContext || window.webkitAudioContext;
  if (!C) { toast('当前环境不支持音频播放'); return; }
  var ctx;
  try { ctx = new C(); if (ctx.state === 'suspended') ctx.resume(); }
  catch (e) { toast('无法初始化音频'); return; }
  notes.forEach(function (f, i) {
    if (!f || !isFinite(f)) return;
    setTimeout(function () {
      try {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + 0.32);
      } catch (e) {}
    }, i * 260);
  });
  toast('正在试听 ' + notes.length + ' 个音');
}

/* ---------------- 反馈文本 ---------------- */
function akBuildFeedback() {
  var type = $('#fb-type') ? $('#fb-type').value : '功能建议';
  var text = $('#fb-text') ? $('#fb-text').value.trim() : '';
  var contact = $('#fb-contact') ? $('#fb-contact').value.trim() : '';
  var attach = !!$('[data-act="fb-toggle"].on');
  if (!text) { toast('请先填写问题描述'); return ''; }
  var lines = ['【安空工具箱 · 反馈】', '收件人：' + FEEDBACK_EMAIL, '类型：' + type, '版本：v' + VERSION,
    '时间：' + new Date().toLocaleString('zh-CN'), '', '问题描述：', text];
  if (contact) lines.push('', '联系方式：' + contact);
  if (attach) {
    var env = '网页 / 浏览器';
    try {
      var raw = N.call('deviceInfo', '');
      if (raw) {
        var d = JSON.parse(raw);
        env = [d.form, d.android, d.window].filter(Boolean).join(' · ');
      }
    } catch (e) {}
    lines.push('', '环境：' + env + ' · UA ' + (navigator.userAgent || '—').slice(0, 120));
  }
  lines.push('', '（本反馈文本在本机生成，未自动发送；请复制到邮件发往 ' + FEEDBACK_EMAIL + '）');
  return lines.join('\n');
}

/* ---------------- 事件委托 ---------------- */
document.addEventListener('DOMContentLoaded', function () {
  applyTheme();
  applyLayout();
  document.addEventListener('click', function (e) {
    var cc = e.target.closest && e.target.closest('[data-copy-color]');
    if (cc) { copyText(cc.getAttribute('data-copy-color')); return; }
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el) {
      if (state.quickOpen && !e.target.closest('#quick') && !e.target.closest('#fab')) {
        state.quickOpen = false; renderFab();
      }
      return;
    }
    var act = el.getAttribute('data-act');
    var id = el.getAttribute('data-id');
    switch (act) {
      case 'tab': state.query = ''; go(el.getAttribute('data-tab'), el.getAttribute('data-tab')); break;
      case 'tool': go('tool:' + id); break;
      case 'cat': go('cat:' + el.getAttribute('data-cat')); break;
      case 'filter': state.catFilter = el.getAttribute('data-cat'); state.catOpen = false; render(); break;
      case 'cat-toggle': state.catOpen = !state.catOpen; render(); break;
      case 'go-search': state.query = ''; go('search'); break;
      case 'back': go(state.back && state.back !== state.route ? state.back : state.tab, state.tab); break;
      case 'fav': toggleFav(id); break;
      case 'nav-fav': go('fav', 'me'); break;
      case 'banner':
        var rt = el.getAttribute('data-route');
        if (rt === 'theme-quick') { state.theme = isDark() ? 'light' : 'dark'; save('theme', state.theme); applyTheme(); render(); }
        else go(rt);
        break;
      case 'lang': {
        var lg = el.getAttribute('data-lang');
        if (window.AKI18N && lg) { window.AKI18N.set(lg); render(); toast('语言已切换'); }
        break;
      }
      case 'theme': state.theme = el.getAttribute('data-mode'); save('theme', state.theme); applyTheme(); render(); toast('已切换主题'); break;
      case 'theme-quick': state.theme = isDark() ? 'light' : 'dark'; save('theme', state.theme); applyTheme(); render(); break;
      case 'share': N.call('share', APP_NAME + ' — ' + TOOLS.length + ' 个离线小工具，推荐给你'); break;
      case 'clear-history': state.history = []; save('history', []); render(); toast('使用记录已清空'); break;
      case 'clear-fav': state.fav = []; save('fav', []); render(); toast('收藏已清空'); break;
      case 'storage-info': toast('便签 / 计分 / 游戏最高分保存在本机 localStorage'); break;
      case 'privacy': toast('核心工具完全离线，输入内容不会离开设备'); break;
      case 'permission': toast('仅使用相机(闪光灯)、振动、图片保存权限'); break;
      case 'toggle': el.classList.toggle('on'); break;
      case 'run': runTool($('#tool-host'), state.route.slice(5)); break;
      case 'copy-result':
        var box = $('.result', $('#tool-host'));
        copyText(box && box._text != null ? box._text : (box ? box.innerText : ''));
        break;
      case 'fab': state.quickOpen = !state.quickOpen; renderFab(); break;

      /* ---- 新增：详情页 / 聚合资源 / 个性化 ---- */
      case 'page': go('page:' + id); break;
      case 'accent':
        state.accent = el.getAttribute('data-accent') || 'purple';
        save('accent', state.accent); applyTheme(); render(); toast('主题色已切换');
        break;
      case 'open-url': {
        var url = el.getAttribute('data-url');
        if (!url) break;
        if (N.has()) N.call('openUrl', url);
        else window.open(url, '_blank', 'noopener,noreferrer');
        break;
      }
      case 'hub-play':
        akPlayNotes((el.getAttribute('data-notes') || '').split(',').map(Number));
        break;
      case 'hub-sys': {
        var key = el.getAttribute('data-key');
        if (N.has()) N.call('openSettings', key);
        else toast('需在安空工具箱安卓客户端中使用');
        break;
      }
      case 'hub-reroll': {
        var sel = $('#tool-host [data-k="which"]');
        if (sel) { sel.value = 'random'; runTool($('#tool-host'), 'hub_recipe'); }
        break;
      }
      case 'copy-text': copyText(el.getAttribute('data-copy') || ''); break;
      case 'export-data': {
        var dump = {}, cnt = 0;
        try {
          for (var li = 0; li < localStorage.length; li++) {
            var lk = localStorage.key(li);
            if (lk) { dump[lk] = localStorage.getItem(lk); cnt++; }
          }
        } catch (e2) {}
        var bak = JSON.stringify({ app: APP_NAME, version: VERSION, exportedAt: new Date().toISOString(), items: cnt, data: dump }, null, 2);
        copyText(bak); toast('已导出 ' + cnt + ' 项本机数据到剪贴板');
        break;
      }
      case 'fb-toggle': el.classList.toggle('on'); break;
      case 'page-do': {
        var d = el.getAttribute('data-do');
        if (d === 'share') {
          var txt = APP_NAME + ' — ' + TOOLS.length + ' 个离线小工具，推荐给你';
          if (N.has()) N.call('share', txt); else copyText(txt);
        } else if (d === 'copy-email') {
          copyText(FEEDBACK_EMAIL);
        } else if (d === 'send-email') {
          var fbox = $('#fb-out'), body = fbox ? fbox.textContent : '';
          if (!body || body.indexOf('填写后') === 0) body = '';
          var uri = 'mailto:' + FEEDBACK_EMAIL + '?subject=' + encodeURIComponent('安空工具箱反馈') +
            '&body=' + encodeURIComponent(body);
          if (N.has()) N.call('openUrl', uri);
          else window.location.href = uri;
        } else if (d === 'feedback' || d === 'go-help' || d === 'go-about' ||
                   d === 'go-privacy' || d === 'go-terms' || d === 'go-permission' || d === 'go-update') {
          go('page:' + { feedback: 'feedback', 'go-help': 'help', 'go-about': 'about',
            'go-privacy': 'privacy', 'go-terms': 'terms', 'go-permission': 'permission',
            'go-update': 'update' }[d]);
        } else if (d === 'go-fav') go('fav', 'me');
        else if (d === 'sys') {
          if (N.has()) N.call('openSettings', 'appinfo'); else toast('需在安卓客户端中使用');
        } else if (d === 'sysinfo') go('tool:hub_syssettings');
        else if (d === 'clear-cookie') {
          try {
            (document.cookie.split(';') || []).forEach(function (c) {
              var n = c.split('=')[0].trim();
              if (n) document.cookie = n + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
            });
          } catch (e) {}
          N.call('clearCookies', ''); toast('Cookie 已清除'); render();
        } else if (d === 'clear-storage' || d === 'reset-all') {
          try {
            localStorage.clear();
          } catch (e) {}
          N.call('clearCache', '');
          state.fav = []; state.history = [];
          if (d === 'reset-all') { state.theme = 'auto'; state.accent = 'purple'; }
          toast(d === 'reset-all' ? '已重置全部数据' : '本地数据已清除');
          render();
        } else if (d === 'clear-cache') {
          N.call('clearCache', ''); toast('缓存已清理'); render();
        } else if (d === 'check-update') {
          if (window.AK_UPDATE) window.AK_UPDATE.check(true, function () {});
          else toast('更新模块未加载');
        } else if (d === 'update-download') {
          if (window.AK_UPDATE) window.AK_UPDATE.openDownload();
        } else if (d === 'update-releases') {
          if (window.AK_UPDATE) window.AK_UPDATE.openReleases();
        } else if (d === 'fb-build') {
          var out = akBuildFeedback();
          if (out) { var box = $('#fb-out'); if (box) box.textContent = out; toast('反馈文本已生成'); }
        } else if (d === 'fb-clear') {
          ['#fb-text', '#fb-contact', '#fb-out'].forEach(function (s) {
            var n = $(s); if (n) { if (n.tagName === 'INPUT' || n.tagName === 'TEXTAREA') n.value = ''; else n.textContent = '填写后点击「生成反馈文本」'; }
          });
        } else if (d === 'fb-copy' || d === 'fb-share') {
          var fb = $('#fb-out') ? $('#fb-out').textContent : '';
          if (!fb || fb.indexOf('填写后') === 0) { toast('请先生成反馈文本'); break; }
          if (d === 'fb-copy') copyText(fb);
          else if (N.has()) N.call('share', fb); else copyText(fb);
        } else if (d === 'del-file') {
          var name = el.getAttribute('data-name');
          N.call('deleteDownload', name); toast('已删除'); render();
        }
        break;
      }
      case 'noop': break;
      /* ---- v2.0：资讯页 ---- */
      case 'news-tab':
        if (window.AK_NEWS) window.AK_NEWS.switchTab(el.getAttribute('data-key'));
        break;
      case 'news-refresh':
        if (window.AK_NEWS) { window.AK_NEWS.refresh(); toast('正在刷新资讯…'); }
        break;
      case 'open-browser': {
        var bu = el.getAttribute('data-url');
        if (!bu) break;
        if (N.has() && typeof N.call === 'function') N.call('openBrowser', bu);
        else if (N.has()) N.call('openUrl', bu);
        else window.open(bu, '_blank', 'noopener,noreferrer');
        break;
      }
      /* ---- v1.6：自动检查更新 ---- */
      case 'update-banner': go('page:update'); break;
      case 'update-dismiss':
        if (window.AK_UPDATE) { window.AK_UPDATE.dismiss(); toast('已忽略此版本'); }
        break;
      case 'update-auto': {
        var uon = !el.classList.contains('on');
        $$('[data-act="update-auto"]').forEach(function (b) { b.classList.toggle('on', uon); });
        if (window.AK_UPDATE) window.AK_UPDATE.setAuto(uon);
        toast(uon ? '已开启自动检查更新' : '已关闭自动检查更新');
        break;
      }
    }
  });
  document.addEventListener('change', function (e) {
    if (!e.target || !e.target.getAttribute) return;
    if (!e.target.getAttribute('data-k')) return;
    var host = $('#tool-host'); if (!host) return;
    var id = host.getAttribute('data-tool'); var t = toolById(id);
    if (t && t.onChange) {
      var rerun = t.onChange(e.target.getAttribute('data-k'), e.target.value, api);
      if (rerun) { runTool(host, id); return; }
    }
    if (t && t.auto && !t.custom) runTool(host, id);
  });
  document.addEventListener('input', function (e) {
    if (!e.target || !e.target.getAttribute) return;
    if (!e.target.getAttribute('data-k')) return;
    var host = $('#tool-host'); if (!host) return;
    var id = host.getAttribute('data-tool'); var t = toolById(id);
    if (t && t.auto && !t.custom && t.live) runTool(host, id);
  });
  // 键盘快捷键（ChromeOS / 平板外接键盘）
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault(); state.query = ''; go('search');
      setTimeout(function () { var n = $('#search-input'); if (n) n.focus(); }, 40);
      return;
    }
    if (e.key === 'Escape') {
      if (state.quickOpen) { state.quickOpen = false; renderFab(); return; }
      if (state.route !== state.tab) { go(state.tab, state.tab); return; }
    }
  });
  window.addEventListener('resize', function () { applyLayout(); });
  render();
  // 启动后延迟自动检查更新（受开关与 12 小时节流控制，失败静默降级）
  if (window.AK_UPDATE) window.AK_UPDATE.auto();
});

window.AnkongApp = {
  go: go, render: render, state: state, tools: function () { return TOOLS; }, api: api,
  cats: function () { return CATS; }, pages: function () { return window.AK_PAGES || {}; },
  update: function () { return window.AK_UPDATE || null; },
  setInsets: setInsets, applyLayout: applyLayout,
  onBack: function () {
    if (state.quickOpen) { state.quickOpen = false; renderFab(); return; }
    if (state.route !== state.tab) go(state.tab, state.tab);
    else N.call('exit', '');
  }
};
})();
