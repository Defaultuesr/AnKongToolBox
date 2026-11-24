/* ============================================================
   安空工具箱 — v1.5 扩展详情页
   15 个内容页 + 1 个聚合入口，挂到 window.AK_PAGES
   ============================================================ */
(function () {
'use strict';

var E = function (s) { return H.esc(s == null ? '' : String(s)); };
function card(inner) { return '<div class="card page-card">' + inner + '</div>'; }
function h2(t) { return '<div class="sec-label">' + E(t) + '</div>'; }
function para(t) { return '<p class="pp">' + t + '</p>'; }
function kv(rows) { return '<div class="kv-box">' + H.kv(rows) + '</div>'; }
function btn(id, label, cls) {
  return '<button class="btn ' + (cls || 'tonal') + '" data-act="page" data-id="' + id + '">' + E(label) + '</button>';
}
function row(icon, title, sub, id) {
  return '<div class="setting-row"><span class="si">' + akIcon(icon) + '</span>' +
    '<span class="st"><b>' + E(title) + '</b><small>' + E(sub) + '</small></span>' +
    '<button class="sr-link" data-act="page" data-id="' + id + '">查看' + akIcon('arrow') + '</button></div>';
}
function linkRow(label, id, cls) {
  return '<button class="btn ' + (cls || 'outline') + '" data-act="page" data-id="' + id + '">' + E(label) + '</button>';
}
function tools() { return (window.AnkongApp && window.AnkongApp.tools) ? window.AnkongApp.tools() : []; }

var MORE_GROUPS = [
  ['入门与检索', [
    ['guide', '快速上手', '三分钟找到并用好第一个工具'],
    ['toolmap', '功能地图', '按分类查看工具分布'],
    ['toolindex', '工具索引', '全部工具名一览，点击直达'],
    ['tips', '使用技巧', '十条能立刻用上的小窍门'],
    ['shortcuts', '快捷键与手势', '键盘、鼠标与触摸操作一览']
  ]],
  ['个性化与数据', [
    ['themes', '主题与配色', '浅黄底色 · 五套主题色 · 深色暖棕'],
    ['accessibility', '无障碍说明', '对比度、字号、大屏与键盘可达性'],
    ['backup', '数据备份', '本机数据说明与一键导出'],
    ['faq', '常见问题', '按主题重新归组的问答']
  ]],
  ['安全与说明', [
    ['security', '安全清单', '权限、网络与数据流向逐项列明'],
    ['offline', '离线能力说明', '哪些功能不联网，哪些只是打开浏览器'],
    ['opensource', '开源许可', '第三方组件与授权说明'],
    ['credits', '致谢', '感谢每一个让工具更好用的人']
  ]],
  ['版本', [
    ['changelog', '版本历史', '从 v1.0 到当前版本的完整更新记录'],
    ['roadmap', '后续计划', '正在考虑的方向与优先级']
  ]]
];

var P = {

  /* ---------- 聚合入口 ---------- */
  more: {
    title: '更多页面', sub: '指南、索引、说明与版本信息', icon: 'grid',
    render: function () {
      var n = MORE_GROUPS.reduce(function (a, g) { return a + g[1].length; }, 0);
      var out = card(kv([['说明性页面', n + ' 个'], ['存储位置', '本机']]) +
        para('这里汇总了应用内全部说明性页面。内容都写在本机，打开不需要联网。'));
      MORE_GROUPS.forEach(function (g) {
        out += h2(g[0]) + '<div class="card" style="padding:6px 10px">' +
          g[1].map(function (x) { return row('doc', x[1], x[2], x[0]); }).join('') + '</div>';
      });
      return out;
    }
  },

  /* ---------- 1. 快速上手 ---------- */
  guide: {
    title: '快速上手', sub: '三分钟找到并用好第一个工具', icon: 'bulb',
    render: function () {
      return h2('四步开始') + card(
        '<div class="steps">' +
        '<div class="step"><b>1 · 找工具</b><p>首页顶部搜索框输入关键词，例如「二维码」「汇率」「JSON」；平板与 ChromeOS 上也可以直接按 <b>Ctrl / ⌘ + K</b>。</p></div>' +
        '<div class="step"><b>2 · 填参数</b><p>进入工具页后按需填写输入框、选择下拉项。每个工具都给了可以直接运行的示例值。</p></div>' +
        '<div class="step"><b>3 · 看结果</b><p>点「运行 / 计算」，结果以表格、键值或代码块呈现，右下角可一键复制纯文本。</p></div>' +
        '<div class="step"><b>4 · 收藏</b><p>点右上角星标收藏，之后在「我的 → 我的收藏」里一键直达，最近使用也会自动记录。</p></div>' +
        '</div>') +
        h2('几个好用的习惯') + card(
          para('· 需要联网的功能（在线影视、去水印、在线壁纸）本应用一律不提供，相关入口改为本地资料库与官方站点导航。') +
          para('· 输入内容只在本机处理，不会上传；关闭页面后不会残留到服务器，因为根本没有服务器。') +
          para('· 主题模式、主题色、界面语言、收藏与历史都保存在本机，换设备不会自动同步。')
        ) +
        h2('直接去试试') + card('<div class="btn-row">' +
          linkRow('功能地图', 'toolmap') + linkRow('工具索引', 'toolindex') +
          linkRow('使用技巧', 'tips') + linkRow('设置', 'settings') + '</div>');
    }
  },

  /* ---------- 2. 功能地图 ---------- */
  toolmap: {
    title: '功能地图', sub: '按分类查看工具分布，点卡片直接进分类', icon: 'grid',
    render: function () {
      var ts = tools(), cats = (window.AnkongApp && window.AnkongApp.cats) ? window.AnkongApp.cats() : null;
      if (!cats) cats = [
        { id: 'query', name: '查询工具' }, { id: 'text', name: '文本工具' }, { id: 'image', name: '媒体工具' },
        { id: 'dev', name: '开发者工具' }, { id: 'calc', name: '计算换算' }, { id: 'life', name: '生活工具' },
        { id: 'fun', name: '设备测评' }, { id: 'game', name: '小游戏' }, { id: 'hub', name: '聚合资源' }
      ];
      var rows = cats.map(function (c) {
        var n = ts.filter(function (t) { return t.cat === c.id; }).length;
        return [c.name, String(n), '<button class="btn outline" data-act="cat" data-cat="' + c.id + '">进入分类</button>'];
      });
      return card(kv([['工具总数', String(ts.length)], ['分类数', String(cats.length)]]) +
        para('全部工具按分类汇总如下，点「进入分类」可查看该分类下的工具。全部为本地运算，不依赖网络接口。')) +
        h2('分类分布') + card('<table><thead><tr><th>分类</th><th>工具数</th><th>操作</th></tr></thead><tbody>' +
          rows.map(function (r) { return '<tr><td>' + E(r[0]) + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('') +
          '</tbody></table>') +
        h2('相关页面') + card('<div class="btn-row">' + linkRow('工具索引', 'toolindex') + linkRow('快速上手', 'guide') + '</div>');
    }
  },

  /* ---------- 3. 工具索引 ---------- */
  toolindex: {
    title: '工具索引', sub: '全部工具名一览，点名称直接打开', icon: 'list',
    render: function () {
      var ts = tools(), names = {};
      ts.forEach(function (t) {
        var c = t.cat || 'other';
        if (!names[c]) names[c] = [];
        names[c].push(t);
      });
      var cats = (window.AnkongApp && window.AnkongApp.cats) ? window.AnkongApp.cats() : null;
      var label = {};
      if (cats) cats.forEach(function (c) { label[c.id] = c.name; });
      var out = card(kv([['工具总数', String(ts.length)], ['分类数', String(Object.keys(names).length)]]) +
        para('按分类列出全部工具，点击任意名称进入工具页。列表由工具注册表实时生成，不会遗漏新增功能。'));
      Object.keys(names).forEach(function (c) {
        var arr = names[c];
        out += h2(label[c] || c) +
          '<div class="card" style="padding:10px">' + arr.map(function (t) {
            return '<button class="chip" data-act="tool" data-id="' + E(t.id) + '" style="margin:3px">' + E(t.name) + '</button>';
          }).join('') + '</div>';
      });
      return out;
    }
  },

  /* ---------- 4. 使用技巧 ---------- */
  tips: {
    title: '使用技巧', sub: '十条能立刻用上的小窍门', icon: 'sparkle',
    render: function () {
      var TIPS = [
        ['搜索比翻页快', '顶部搜索支持工具名、描述与标签，输入拼音无关但支持中文关键词与英文术语，比如直接搜「base64」。'],
        ['示例值可以直接跑', '每个工具都预填了合法示例，点「运行 / 计算」就能看到结果格式，再替换成自己的数据。'],
        ['结果可以复制纯文本', '结果区右下角的复制按钮会复制纯文本版本，表格也能直接粘贴到表格软件里。'],
        ['批量处理用换行隔开', '文本类与批量类工具普遍支持「每行一条」，一次可以处理几十上百条数据。'],
        ['收藏＋历史＝快捷入口', '常用的收藏起来，临时用过的在「最近使用」里找回，比搜索还快。'],
        ['大屏用键盘', 'ChromeOS / 平板上 Ctrl / ⌘ + K 打开搜索，Esc 返回上一级，右侧导航常驻。'],
        ['多语言随时切', '「我的 → 界面语言」即时生效并记住选择，工具的计算逻辑与输入数据不受翻译影响。'],
        ['深色模式不只是变黑', '深色主题采用暖棕底色，配合五套主题色，夜间阅读更柔和。'],
        ['不确定就先自查', '「安全清单」「隐私政策」两页写清了权限与数据流向，任何工具都不会把输入内容发到服务器。'],
        ['算错了请反馈', '带上输入值、期待结果与实际结果提交反馈，邮箱 3805278668@qq.com，复现越具体修得越快。']
      ];
      return card(para('以下技巧来自实际使用路径，按顺序读一遍基本就能覆盖日常用法。')) +
        TIPS.map(function (t) {
          return h2(t[0]) + card(para(E(t[1])));
        }).join('');
    }
  },

  /* ---------- 5. 快捷键与手势 ---------- */
  shortcuts: {
    title: '快捷键与手势', sub: '键盘、鼠标与触摸操作一览', icon: 'terminal',
    render: function () {
      return h2('键盘（平板 / ChromeOS / 桌面浏览器）') + card(
        '<table><thead><tr><th>按键</th><th>作用</th></tr></thead><tbody>' +
        [['Ctrl / ⌘ + K', '打开搜索并聚焦输入框'],
         ['Esc', '返回上一级；搜索页清空并返回'],
         ['Enter', '在搜索框中跳转到第一个结果；表单中提交当前工具'],
         ['Alt + ←', '浏览器式后退（网页版）'],
         ['Tab / Shift + Tab', '在输入框、下拉框与按钮之间切换焦点']].map(function (r) {
          return '<tr><td><code>' + E(r[0]) + '</code></td><td>' + E(r[1]) + '</td></tr>';
        }).join('') + '</tbody></table>') +
        h2('触摸与鼠标') + card(
          '<table><thead><tr><th>操作</th><th>作用</th></tr></thead><tbody>' +
          [['点顶部星标', '收藏 / 取消收藏当前工具'],
           ['点分类名', '筛选该分类下的工具'],
           ['长按结果文本', '选中后复制（网页版可用系统菜单）'],
           ['从左侧边缘右滑', '在支持的浏览器上返回上一页'],
           ['点击右下角悬浮按钮', '打开快捷工具面板'],
           ['双指缩放', '网页版可缩放；App 内保持固定比例以保证排版']].map(function (r) {
          return '<tr><td>' + E(r[0]) + '</td><td>' + E(r[1]) + '</td></tr>';
        }).join('') + '</tbody></table>') +
        h2('安卓返回键') + card(para('按系统返回键会先关闭搜索、退出工具页或详情页，最后才退出应用。应用不提供全屏切换，系统状态栏始终常显。')) +
        h2('相关页面') + card('<div class="btn-row">' + linkRow('快速上手', 'guide') + linkRow('无障碍说明', 'accessibility') + '</div>');
    }
  },

  /* ---------- 6. 常见问题 ---------- */
  faq: {
    title: '常见问题', sub: '独立整理版，按主题分组', icon: 'book',
    render: function () {
      var src = window.AK_FAQ || [];
      var groups = [
        ['数据与隐私', 2], ['功能范围', 1], ['设备与权限', 1], ['异常与反馈', Math.max(1, src.length - 4)]
      ];
      var out = card(para('共 ' + src.length + ' 个问题。更完整的使用说明见「帮助」页；这里按主题重新归组，方便快速定位。'));
      var idx = 0;
      groups.forEach(function (g) {
        var items = src.slice(idx, idx + g[1]); idx += g[1];
        out += h2(g[0]);
        items.forEach(function (it) {
          out += '<div class="card page-card"><div style="font-weight:700;margin-bottom:6px">' + E(it[0]) + '</div>' +
            '<p class="pp">' + E(it[1]) + '</p></div>';
        });
      });
      return out + h2('还没解决？') + card('<div class="btn-row">' +
        linkRow('提交反馈', 'feedback') + linkRow('帮助', 'help') + linkRow('安全清单', 'security') + '</div>');
    }
  },

  /* ---------- 7. 主题与配色 ---------- */
  themes: {
    title: '主题与配色', sub: 'Material 3 Expressive · M3E Canvas 设计 · 六套主题色', icon: 'palette',
    render: function () {
      var C = [['purple', '优雅紫', '#6750A4'], ['amber', '浅黄', '#FAE185'], ['mint', '薄荷', '#A8DCC0'],
        ['sakura', '樱粉', '#F3BFCB'], ['sky', '天蓝', '#A9CFEA'], ['lilac', '丁香', '#C9BCE8']];
      var sw = C.map(function (c) {
        return '<div style="text-align:center;min-width:74px"><div style="width:46px;height:46px;border-radius:50%;background:' + c[2] +
          ';border:2px solid rgba(0,0,0,.08);margin:0 auto 6px"></div><small>' + E(c[1]) + '</small></div>';
      }).join('');
      return h2('设计基调') + card(
        para('默认采用<strong>浅黄奶油色</strong>背景（#FFF8EE）与暖白卡片（#FAF2E7），主强调色为亮黄 #FAE185，正文为深橄榄 #6F5C0F，绿色卡片用于正向结果提示。') +
        para('深色模式不是简单反色，而是改用暖棕色系，降低夜间对比刺激；系统栏颜色会随模式自动切换。')) +
        h2('五套主题色') + card('<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:space-around">' + sw + '</div>' +
          para('主题色只影响强调元素（按钮、选中态、进度条），不改变工具计算与文本内容。')) +
        h2('三种模式') + card(kv([
          ['跟随系统', '按系统深色模式设置自动切换'],
          ['浅色', '始终使用浅黄奶油主题'],
          ['深色', '始终使用暖棕深色主题']
        ])) +
        h2('去设置') + card('<div class="btn-row">' + linkRow('打开设置', 'settings') + linkRow('无障碍说明', 'accessibility') + '</div>');
    }
  },

  /* ---------- 8. 无障碍说明 ---------- */
  accessibility: {
    title: '无障碍说明', sub: '对比度、字号、大屏与键盘可达性', icon: 'eye',
    render: function () {
      return h2('我们做了什么') + card(
        '<table><thead><tr><th>方面</th><th>说明</th></tr></thead><tbody>' +
        [['颜色对比', '浅色主题正文使用深橄榄 #6F5C0F 配浅黄底，深色主题使用高亮暖白文字；重要状态不只靠颜色，还配文字标签。'],
         ['可点击区域', '按钮、标签与列表项最小触控高度不低于 40dp，相邻的 chip 之间留有间距。'],
         ['图标语义', '所有图标为内联 SVG 并带 aria-hidden，功能名称始终有可见文字，不依赖纯图形表意。'],
         ['键盘可达', 'Tab 可遍历全部交互元素，焦点样式可见；Ctrl / ⌘ + K 直达搜索，Esc 返回。'],
         ['大屏适配', '平板显示左侧分类栏，ChromeOS / 桌面常驻导航栏 + 多列网格，窗口可自由缩放。'],
         ['系统字体', '字号跟随系统字体缩放设置，长文本自动换行，不固定死高度导致截断。'],
         ['无闪烁动画', '页面切换使用短淡入，不提供闪烁、自动轮播或强动效。']].map(function (r) {
          return '<tr><td><b>' + E(r[0]) + '</b></td><td>' + E(r[1]) + '</td></tr>';
        }).join('') + '</tbody></table>') +
        h2('仍可改进') + card(para('语音朗读的完整标签覆盖、动态结果的实时播报还在完善中。如果你在使用读屏或放大模式时遇到障碍，欢迎通过反馈页告诉我们具体页面与操作步骤。')) +
        h2('相关页面') + card('<div class="btn-row">' + linkRow('主题与配色', 'themes') + linkRow('快捷键与手势', 'shortcuts') + linkRow('提交反馈', 'feedback') + '</div>');
    }
  },

  /* ---------- 9. 数据备份 ---------- */
  backup: {
    title: '数据备份', sub: '本机数据说明与一键导出', icon: 'database',
    render: function () {
      var keys = [], used = 0;
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i), val = localStorage.getItem(k) || '';
          keys.push([k, val.length]); used += val.length;
        }
      } catch (e) {}
      return h2('数据存在哪里') + card(
        para('收藏、使用记录、便签、游戏最高分、主题模式、主题色与界面语言都保存在应用本地存储（localStorage），<strong>不上传、不同步、不备份到云端</strong>。卸载应用会一并清除。')) +
        h2('当前占用') + card(kv([
          ['存储项数', String(keys.length)], ['估算占用', (used / 1024).toFixed(1) + ' KB'],
          ['云同步', '无'], ['账号体系', '无']
        ]) + (keys.length ? '<table style="margin-top:10px"><thead><tr><th>键名</th><th>字符数</th></tr></thead><tbody>' +
          keys.slice(0, 12).map(function (r) { return '<tr><td><code>' + E(r[0]) + '</code></td><td>' + r[1] + '</td></tr>'; }).join('') +
          '</tbody></table>' : '')) +
        h2('导出备份') + card(para('点下面的按钮会把当前全部本机数据打包成 JSON 并复制到剪贴板，可粘贴到备忘录或文本文件中保存。') +
          '<div class="btn-row"><button class="btn tonal" data-act="export-data">导出全部数据</button>' +
          linkRow('缓存管理', 'cache', 'outline') + linkRow('Cookie 管理', 'cookie', 'outline') + '</div>') +
        h2('注意事项') + card(para('导出的 JSON 里可能包含便签正文等你自行输入的内容，请自行妥善保管；应用不提供云端恢复，换设备需手动把内容粘贴回去。'));
    }
  },

  /* ---------- 10. 安全清单 ---------- */
  security: {
    title: '安全清单', sub: '权限、网络与数据流向逐项列明', icon: 'shield',
    render: function () {
      return h2('一句话结论') + card(para('本应用<strong>没有账号、没有埋点、没有后台服务、没有更新服务器</strong>。全部工具在本机运算，输入内容不会离开设备。')) +
        h2('权限清单') + card('<table><thead><tr><th>权限</th><th>用途</th><th>是否必需</th></tr></thead><tbody>' +
        [['INTERNET', '仅用于在系统浏览器打开官方站点链接', '可选'],
         ['ACCESS_NETWORK_STATE', '设备信息里显示连接方式', '可选'],
         ['VIBRATE', '工具完成后的轻振动反馈', '可选'],
         ['CAMERA（闪光灯）', '仅「手电筒」工具控制补光灯，不拍照', '按需'],
         ['WRITE_EXTERNAL_STORAGE', 'Android 9 及以下保存图片到相册', '仅旧系统']].map(function (r) {
          return '<tr><td><code>' + E(r[0]) + '</code></td><td>' + E(r[1]) + '</td><td>' + E(r[2]) + '</td></tr>';
        }).join('') + '</tbody></table>') +
        h2('数据流向') + card('<table><thead><tr><th>数据</th><th>去向</th></tr></thead><tbody>' +
        [['工具输入与计算结果', '仅内存，覆盖后即消失'],
         ['收藏 / 历史 / 便签', '本机 localStorage'],
         ['主题与语言偏好', '本机 localStorage'],
         ['反馈内容', '由你主动通过邮件 App 发送，应用不代发'],
         ['崩溃 / 使用统计', '完全不采集']].map(function (r) {
          return '<tr><td>' + E(r[0]) + '</td><td>' + E(r[1]) + '</td></tr>';
        }).join('') + '</tbody></table>') +
        h2('相关页面') + card('<div class="btn-row">' + linkRow('隐私政策', 'privacy') + linkRow('权限说明', 'permission') +
          linkRow('离线能力说明', 'offline') + linkRow('数据备份', 'backup') + '</div>');
    }
  },

  /* ---------- 11. 离线能力说明 ---------- */
  offline: {
    title: '离线能力说明', sub: '哪些功能不联网，哪些只是打开浏览器', icon: 'cloud',
    render: function () {
      return h2('完全离线（默认）') + card(
        para('文本处理、编码解码、哈希摘要、JSON / XML / YAML / TOML、正则、单位与进制换算、日期与农历、财务与几何计算、颜色与 CSS 生成、二维码 / 条形码生成、图片本地处理、小游戏、便签与番茄钟等，<strong>全部在本机完成</strong>。') +
        para('断网、开飞行模式，这些工具依然可用；结果不经过任何服务器。')) +
        h2('需要系统浏览器（应用本身仍不联网取数）') + card(
          para('「导航」类工具只生成各平台<strong>官方站点链接</strong>，点击后交给系统浏览器打开；应用内不内嵌网页、不抓取、不缓存第三方内容。') +
          para('系统设置入口（WiFi、蓝牙、应用详情等）通过系统 Intent 跳转，不读取设置内容。')) +
        h2('明确不提供') + card(kv([
          ['在线影视 / 音乐资源', '改为本地片单与官方站点导航'],
          ['短视频去水印解析', '改为链接清洗与参数分析等本地工具'],
          ['在线壁纸图集 / 头像库', '改为本地配色、渐变与头像生成'],
          ['任何第三方版权内容', '不内置、不盗链、不分发']
        ])) +
        h2('为什么要这样设计') + card(para('这类功能依赖第三方接口与授权，容易失效、涉及版权与隐私风险。把它们换成纯本地工具，应用才能长期稳定、无广告、无服务器成本，也不需要申请多余权限。')) +
        h2('相关页面') + card('<div class="btn-row">' + linkRow('安全清单', 'security') + linkRow('帮助', 'help') + '</div>');
    }
  },

  /* ---------- 12. 开源许可 ---------- */
  opensource: {
    title: '开源许可', sub: '第三方组件与授权说明', icon: 'code',
    render: function () {
      return h2('内嵌第三方组件') + card(
        '<table><thead><tr><th>组件</th><th>用途</th><th>许可</th></tr></thead><tbody>' +
        [['qrcode-generator', '二维码生成（内嵌本地文件 vendor/qrcode.js）', 'MIT'],
         ['Android SDK / aapt2 / d8', '仅用于构建，不随应用分发运行时代码', 'Android SDK 许可']].map(function (r) {
          return '<tr><td><b>' + E(r[0]) + '</b></td><td>' + E(r[1]) + '</td><td>' + E(r[2]) + '</td></tr>';
        }).join('') + '</tbody></table>') +
        h2('MIT 许可摘要') + card(para('允许任何人免费使用、复制、修改、合并、出版发行与再授权，唯一条件是保留版权声明与许可声明。软件按「原样」提供，不作任何明示或暗示担保。') +
          '<div class="hint">完整许可文本请查阅组件源码头部或 MIT 官方页面；本页为通俗说明，不替代法律文本。</div>') +
        h2('本项目自身') + card(para('界面与全部工具为独立实现，未反编译、未复制任何第三方应用的代码、图标或品牌资源。项目源码发布在 GitHub 的 AnKongToolBox 仓库，各版本安装包在 Releases 中提供。')) +
        h2('相关页面') + card('<div class="btn-row">' + linkRow('关于', 'about') + linkRow('致谢', 'credits') + linkRow('安全清单', 'security') + '</div>');
    }
  },

  /* ---------- 13. 致谢 ---------- */
  credits: {
    title: '致谢', sub: '感谢每一个让工具更好用的人', icon: 'heart',
    render: function () {
      return h2('感谢') + card(
        '<div class="support-list">' +
        '<div class="support-item"><b>每一位使用者</b><p>你的收藏、使用路径和「这里算错了」的反馈，决定了工具该长什么样。</p></div>' +
        '<div class="support-item"><b>提出建议的朋友</b><p>浅黄主题、多语言、Pad / ChromeOS 适配、更多页面，都来自具体的使用反馈。</p></div>' +
        '<div class="support-item"><b>开源社区</b><p>qrcode-generator 与 Android 构建工具链，让一个不依赖服务器的小应用成为可能。</p></div>' +
        '</div>') +
        h2('联系我们') + card(kv([
          ['反馈邮箱', '3805278668@qq.com'],
          ['项目仓库', 'github.com/Defaultuesr/AnKongToolBox'],
          ['应用性质', '免费 · 无广告 · 不设捐赠']
        ])) +
        h2('相关页面') + card('<div class="btn-row">' + linkRow('提交反馈', 'feedback') +
          linkRow('支持我们', 'donate') + linkRow('开源许可', 'opensource') + '</div>');
    }
  },

  /* ---------- 14. 版本历史 ---------- */
  changelog: {
    title: '版本历史', sub: '从 v1.0 到当前版本的完整更新记录', icon: 'history',
    render: function () {
      var log = window.AK_CHANGELOG || [];
      var out = card(kv([['当前版本', 'v' + (window.AK_VERSION || '2.4')],
        ['已发布版本数', String(log.length)], ['首次发布', '2026-11-14']]));
      log.forEach(function (item, i) {
        out += h2('v' + item[0].replace(/^v/, '') + ' · ' + item[1] + (i === 0 ? ' · 当前' : ''));
        out += card('<ul style="margin:0;padding-left:20px;line-height:1.85">' +
          item[2].map(function (b) { return '<li>' + E(b) + '</li>'; }).join('') + '</ul>');
      });
      return out + h2('相关页面') + card('<div class="btn-row">' +
        linkRow('检查更新', 'update') + linkRow('后续计划', 'roadmap') + '</div>');
    }
  },

  /* ---------- 15. 后续计划 ---------- */
  roadmap: {
    title: '后续计划', sub: '正在考虑的方向，以及怎么把它们排进版本', icon: 'target',
    render: function () {
      var R = [
        ['翻译覆盖继续补齐', '把工具内置数据（成语、菜谱、城市名等）与长尾选项在英 / 日 / 法界面下也逐步本地化。', '进行中'],
        ['更多离线工具', '按反馈频率增补文本批处理、开发者速查与生活计算，保持每版几十个的节奏。', '计划中'],
        ['数据导入', '配合「数据备份」的导出，增加从 JSON 文本恢复收藏与便签的能力。', '计划中'],
        ['读屏体验', '完善动态结果的实时播报与更完整的控件标签。', '计划中'],
        ['大屏多窗', '进一步适配 ChromeOS 自由窗口与平板分屏下的多列布局。', '评估中']
      ];
      return card(para('下面只是方向，<strong>不是承诺的时间表</strong>。实际优先级按反馈数量、实现成本与离线原则综合排序。')) +
        R.map(function (r) {
          return h2(r[0]) + card(kv([['状态', r[2]], ['说明', E(r[1])]]));
        }).join('') +
        h2('想让某件事排前面？') + card(para('到「反馈」页写清楚使用场景：在哪个页面、想解决什么问题、现在怎么绕过去。具体场景比一句「加个功能」更容易被排进版本。') +
          '<div class="btn-row">' + linkRow('提交反馈', 'feedback') + linkRow('版本历史', 'changelog') + '</div>');
    }
  }
};

/* 合并到既有 AK_PAGES（同一对象引用，akPageHtml 立即可见） */
var pages = window.AK_PAGES || (window.AK_PAGES = {});
Object.keys(P).forEach(function (k) { pages[k] = P[k]; });
window.AK_MORE_PAGES = MORE_GROUPS;
})();
