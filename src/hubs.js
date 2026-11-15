/* ============================================================
   安空工具箱 — 功能页「聚合资源」分区数据
   参考布局：两列圆角大卡片 + 带小圆图标的分组标题
   所有卡片均指向本地可用的真实工具 / 页面（不依赖第三方在线接口）
   ============================================================ */
var AK_HUBS = [
  {
    id: 'media', name: '影音资源', icon: 'film', tone: 'cream',
    desc: '本地资料库与创作工具，点开即用',
    cards: [
      { name: '影视', sub: '经典片单速查 · 类型年代索引', icon: 'film', to: 'hub_movie' },
      { name: '音乐', sub: '音阶和弦速查 · 可试听', icon: 'music', to: 'hub_music' },
      { name: '聚合壁纸', sub: '原创渐变壁纸生成与保存', icon: 'image', to: 'wallpaper' },
      { name: '聚合搜图', sub: '公开图库搜索链接一站生成', icon: 'search', to: 'hub_imgsearch' },
      { name: 'CNU 视觉联盟', sub: '视觉艺术站点导航', icon: 'palette', to: 'hub_gallery' },
      { name: '表情包', sub: '文字表情包自制与导出', icon: 'smile', to: 'hub_meme' },
      { name: '头像大全', sub: '渐变文字头像生成', icon: 'person', to: 'avatar' },
      { name: '健身', sub: '训练动作要领与部位索引', icon: 'dumbbell', to: 'hub_fitness' },
      { name: '菜谱', sub: '家常菜做法与随机推荐', icon: 'recipe', to: 'hub_recipe' },
      { name: '哈基米音乐', sub: '音阶音效发生器 · 可试听', icon: 'wave', to: 'hub_tone' },
      { name: '广播', sub: '电台频率速查与公开台站导航', icon: 'radio', to: 'hub_radio' }
    ]
  },
  {
    id: 'rom', name: '玩机', icon: 'bug', tone: 'green',
    desc: '系统入口、应用搜索与开源资源导航',
    cards: [
      { name: '玩机博客', sub: '极客技术站点聚合导航', icon: 'book', to: 'hub_blog' },
      { name: '小米 ROM', sub: '官方固件入口与刷机须知', icon: 'download', to: 'hub_rom' },
      { name: '主题下载', sub: '主题模式、主题色个性化配置', icon: 'settings', to: 'page:settings', kind: 'page' },
      { name: '隐启设置', sub: '安卓原生隐藏设置入口', icon: 'gear', to: 'hub_syssettings' },
      { name: '应用搜索', sub: '多平台应用商店搜索链接', icon: 'search', to: 'hub_appsearch' },
      { name: 'OpenAPK', sub: '开源安卓应用资源导航', icon: 'cube', to: 'hub_openapk' }
    ]
  },
  {
    id: 'parse', name: '解析', icon: 'link', tone: 'mint',
    desc: '本地链接解析工具集 · 不下载第三方版权内容',
    cards: [
      { name: 'bilibili 解析', sub: 'BV / av 互转 · 分 P 链接生成', icon: 'video', to: 'hub_bili' },
      { name: '解析 1', sub: '分享链接追踪参数清洗', icon: 'link', to: 'hub_p1' },
      { name: '解析 2', sub: '从文本批量提取全部链接', icon: 'link', to: 'hub_p2' },
      { name: '解析 3', sub: '提取图片直链与图片文件', icon: 'image', to: 'hub_p3' },
      { name: '解析 4', sub: '短链服务识别与展开提示', icon: 'link', to: 'hub_p4' },
      { name: '解析 5', sub: '分享口令与混合文案提取', icon: 'text', to: 'hub_p5' },
      { name: '解析 6', sub: '磁力链接元信息解析', icon: 'magnet', to: 'hub_p6' },
      { name: '解析 7', sub: '视频页链接规范化', icon: 'video', to: 'hub_p7' },
      { name: '解析 8', sub: '批量链接去重与域名分类', icon: 'list', to: 'hub_p8' },
      { name: '解析 9', sub: 'URL 编码解码与参数查看', icon: 'code', to: 'hub_p9' },
      { name: '解析 10', sub: '链接转二维码 / 二维码反查', icon: 'qr', to: 'hub_p10' },
      { name: '解析 11', sub: '链接安全自查与风险提示', icon: 'shield', to: 'hub_p11' }
    ]
  }
];

/* 分组卡片 HTML（手机 2 列 / 平板 3 列 / 桌面 4 列） */
function akHubSection(h) {
  var body = '<div class="hub-grid">' + h.cards.map(function (c) {
    var act = c.kind === 'page' ? 'page' : 'tool';
    var attr = c.kind === 'page'
      ? 'data-act="page" data-id="' + c.to.slice(5) + '"'
      : 'data-act="tool" data-id="' + c.to + '"';
    return '<button class="hub-card" ' + attr + '>' +
      '<span class="hub-ic">' + akIcon(c.icon) + '</span>' +
      '<b>' + h_esc(c.name) + '</b>' +
      '<small>' + h_esc(c.sub) + '</small></button>';
  }).join('') + '</div>';
  return '<div class="hub-group" data-tone="' + h.tone + '">' +
    '<div class="section-head"><span class="sec-ic">' + akIcon(h.icon) + '</span>' +
    '<h2>' + h_esc(h.name) + '</h2><span class="extra">' + h_esc(h.desc) + '</span></div>' +
    body + '</div>';
}
function h_esc(s) { return String(s).replace(/[&<>"']/g, function (c) {
  return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
}); }
function akHubsHtml() { return AK_HUBS.map(akHubSection).join(''); }
function akHubCardCount() { var n = 0; AK_HUBS.forEach(function (h) { n += h.cards.length; }); return n; }
