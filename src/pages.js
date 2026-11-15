/* ============================================================
   安空工具箱 — 「关于」页详情页内容
   每一项均可点开、有真实内容与可操作按钮
   ============================================================ */
(function () {
'use strict';

var E = function (s) { return H.esc(s); };
var AK_FEEDBACK_EMAIL = '3805278668@qq.com';
window.AK_FEEDBACK_EMAIL = AK_FEEDBACK_EMAIL;
function card(inner) { return '<div class="card page-card">' + inner + '</div>'; }
function h2(t) { return '<div class="sec-label">' + E(t) + '</div>'; }
function para(t) { return '<p class="pp">' + t + '</p>'; }
function kv(rows) { return '<div class="kv-box">' + H.kv(rows) + '</div>'; }
function btn(do_, label, cls) {
  return '<button class="btn ' + (cls || 'tonal') + '" data-act="page-do" data-do="' + do_ + '">' + E(label) + '</button>';
}

var CHANGELOG = [
  ['v1.5', '2026-11-15', [
    '新增 50 个实用工具，工具总数达到 275 个：按宽度折行、隐私打码、JSON 深度合并与差异、YAML/TOML 转 JSON、贝叶斯与加权平均、绿植养护、Git/Docker 命令速查、SVG 与 CSS 布局生成等',
    '新增 15 个内容页与「更多页面」聚合入口，详情页总数达到 30 个：功能地图、工具索引、使用技巧、快捷键、无障碍、数据备份、安全清单、离线说明、版本历史等',
    '「数据备份」页支持一键导出全部本机数据为 JSON；功能地图与工具索引实时读取工具注册表生成'
  ]],
  ['v1.4', '2026-11-15', [
    '版本号升级至 1.4，安装包与网页版同步构建，工具总数保持 225 个不变',
    '未改动任何工具的计算逻辑与本地数据，升级后可完全沿用原有收藏、使用记录与语言偏好',
    '同步更新检查更新页、关于页与设备信息中的版本标识'
  ]],
  ['v1.3', '2026-11-15', [
    '新增 50 个实用工具，工具总数达到 225 个：行号与文本批处理、命名风格转换、JSON 转类型定义、税后工资估算、描述性统计、优惠方案比价、行程时间规划、配色与 CSS 代码生成、24 点求解等',
    '覆盖文本效率、开发者、计算换算、生活、查询速查、媒体前端、设备测评与互动游戏八大类，全部纯离线运行',
    '新增工具的名称与描述补充英 / 日 / 法译文，切换界面语言后同样可读'
  ]],
  ['v1.2', '2026-11-15', [
    '新增简体中文 / 繁體中文 / 日本語 / Français / English 五种界面语言，在「关于」与「设置」页可随时切换并自动记忆',
    '首次启动按系统语言自动选择，桌面应用名与副标题随系统语言变化',
    '翻译覆盖导航、分类、工具名称与描述、表单与设置页；工具计算与输入内容不受影响'
  ]],
  ['v1.1', '2026-11-14', [
    '新增 46 个离线工具，工具总数达到 175 个：文本反转 / 字符频次 / CSV 与 JSON 互转 / Hex Dump / 罗马数字 / 学分绩点 / 基础代谢 / 二十四节气 / 时区换算等',
    '反馈页新增接收邮箱 3805278668@qq.com，支持一键复制与直接写邮件',
    '新增猜数字、石头剪刀布、心算挑战 3 个小游戏，以及 CSS 渐变、宽高比计算等媒体工具',
    '所有新功能依旧纯本地运行，不联网、不上传输入内容'
  ]],
  ['v1.0', '2026-11-14', [
    '129 个离线工具，覆盖查询、文本、媒体、开发、计算、生活、设备测评、小游戏与聚合资源九大类',
    '影音资源 / 玩机 / 解析三大聚合分区，共 29 张入口卡片',
    '关于页 14 个详情页：政策协议、Cookie / 下载 / 缓存管理、检查更新、反馈、帮助、设置等',
    '5 套主题色与浅色 / 深色模式，适配手机、平板与 ChromeOS 大屏',
    '系统栏常显，不提供全屏切换；屏幕检测与 LED 字幕改为页面内放大展示'
  ]]
];

var FAQ = [
  ['工具需要联网吗？', '绝大多数工具完全离线运行，输入内容只在本机处理，不会上传。少数「导航」类工具只生成官方站点链接，由系统浏览器打开。'],
  ['为什么有些在线功能没有？', '在线影视资源、短视频去水印解析、在线壁纸图集等需要第三方接口与相应授权。本应用不内置、不盗链、不抓取第三方版权内容，相关入口改为本地工具与官方站点导航。'],
  ['我的数据存在哪里？', '收藏、使用记录、便签、游戏最高分、主题偏好保存在应用本地存储（localStorage），不会同步到云端。卸载应用会一并清除。'],
  ['为什么申请相机权限？', '仅用于「手电筒」工具控制闪光灯，不拍照、不录像。可在系统设置中随时撤销，不影响其它工具。'],
  ['平板 / ChromeOS 上布局会变吗？', '会。宽屏自动切换为左侧常驻导航 + 分类栏 + 多列网格，支持鼠标、键盘与窗口自由缩放。'],
  ['保存的图片在哪里？', '保存到系统相册的「Pictures/安空工具箱」目录，可在「下载管理」中查看。'],
  ['闪退或工具算错了怎么办？', '到「反馈」页填写问题描述，把反馈文本发送到 3805278668@qq.com；也可以在工具页核对输入格式后重试。']
];

var PERMISSIONS = [
  ['INTERNET', '访问网络', '仅用于加载官方站点链接（系统浏览器）；核心工具不联网', '可选'],
  ['ACCESS_NETWORK_STATE', '查看网络状态', '「设备信息」显示当前连接方式', '可选'],
  ['VIBRATE', '振动', '工具运行完成后的轻振动反馈', '可选'],
  ['CAMERA', '相机 / 闪光灯', '仅「手电筒」工具控制补光灯，不拍照', '按需'],
  ['WRITE_EXTERNAL_STORAGE', '写入外部存储', 'Android 9 及以下保存图片到相册', '仅旧系统']
];

var AK_PAGES = {
  donate: {
    title: '支持我们', sub: '免费 · 无广告 · 不设捐赠', icon: 'heart',
    render: function () {
      return h2('关于支持') + card(
        para('安空工具箱<strong>完全免费</strong>，没有广告、没有内购、没有付费解锁，也不设置捐赠入口。') +
        para('所有工具都在你的设备上离线运行，我们不收集任何数据，也不需要你登录或注册。') +
        '<div class="kv-box">' + H.kv([
          ['广告', '无'], ['内购 / 会员', '无'], ['数据统计 / 埋点', '无'], ['账号登录', '不需要']
        ]) + '</div>'
      ) + h2('你可以这样支持') + card(
        '<div class="support-list">' +
        '<div class="support-item"><b>分享给朋友</b><p>把应用推荐给需要的人，是最直接的帮助。</p>' + btn('share', '分享应用') + '</div>' +
        '<div class="support-item"><b>认真反馈</b><p>遇到算错、卡顿或想要新工具，告诉我们。</p>' + btn('feedback', '提交反馈') + '</div>' +
        '<div class="support-item"><b>提出建议</b><p>好点子会排进后续版本，更新日志里会有记录。</p>' + btn('feedback', '提个建议') + '</div>' +
        '</div>'
      );
    }
  },

  infringe: {
    title: '侵权和违规内容处理', sub: '投诉渠道与处理流程', icon: 'shield',
    render: function () {
      return h2('基本原则') + card(
        para('安空工具箱是<strong>独立实现</strong>的本地工具类应用，不使用第三方应用的代码、图标、品牌素材，也不托管、不分发任何影视、音乐、图片、软件安装包等第三方内容。') +
        para('应用内的「导航」类工具仅提供各平台<strong>官方站点链接</strong>，跳转后看到的内容由对应平台提供并负责。')
      ) + h2('如发现涉嫌侵权的内容') + card(
        '<div class="steps">' +
        '<div class="step"><b>1 · 准备材料</b><p>权利人身份证明、权属证明、涉嫌侵权内容的具体位置（页面 / 链接 / 截图）与说明。</p></div>' +
        '<div class="step"><b>2 · 提交反馈</b><p>在应用内「反馈」页选择「内容投诉」，填写上述信息并生成反馈文本。</p></div>' +
        '<div class="step"><b>3 · 处理时限</b><p>核实后将在后续版本中移除相关链接或调整功能，并在更新日志中说明。</p></div>' +
        '</div>' + btn('feedback', '前往反馈', 'full')
      ) + h2('免责说明') + card(
        para('本应用不提供第三方内容的上传、存储、缓存或加速服务，也不对外部站点的内容承担审核义务。若你是权利人并认为权益受损，请优先联系对应平台，同时欢迎通过反馈渠道告知我们。')
      );
    }
  },

  privacy: {
    title: '隐私政策', sub: '最后更新：2026 年 11 月 14 日', icon: 'shield',
    render: function () {
      return card(
        para('本政策说明「安空工具箱」（下称「本应用」）如何处理你的信息。一句话总结：<strong>我们不收集、不上传、不共享你的任何个人信息</strong>。')
      ) + h2('一、我们收集什么') + card(
        para('不收集。本应用没有服务器账号体系，没有统计埋点，没有崩溃上报，也没有广告 SDK。你在工具中输入的文字、数字、图片仅在当前页面内参与计算，不会被发送到任何地方。')
      ) + h2('二、本地存储') + card(
        para('为提供正常功能，以下数据保存在设备本地（localStorage / WebView 存储）：收藏列表、最近使用记录、便签内容、计数器与游戏最高分、主题偏好、反馈草稿。') +
        para('你可以在「Cookie 管理」「缓存管理」「数据」中查看或清除这些数据；卸载应用会一并删除。')
      ) + h2('三、权限与设备能力') + card(
        para('仅在对应功能被使用时才会申请：相机（闪光灯）、振动、旧版系统的存储写入。详见「权限说明」。权限可随时在系统设置中撤销。')
      ) + h2('四、第三方链接与组件') + card(
        para('导航类工具会跳转到各平台官方站点，这些站点有自己的隐私政策，本政策不适用。二维码生成使用 MIT 许可的 qrcode-generator 本地库，不联网、不采集数据。')
      ) + h2('五、儿童与政策变更') + card(
        para('本应用不针对儿童收集信息。政策如有更新，会在应用内「检查更新」中展示变更摘要，不会静默改变数据处理方式。')
      ) + h2('六、联系我们') + card(para('如需反馈，请到「反馈」页生成文本，发送到 <b>' + AK_FEEDBACK_EMAIL + '</b>。本应用没有服务器，不会自动上传任何内容；邮件由你本机的邮件应用发送，内容不受本应用控制。') + btn('feedback', '打开反馈'));
    }
  },

  terms: {
    title: '用户协议', sub: '请在使用前阅读', icon: 'doc',
    render: function () {
      return card(para('欢迎使用安空工具箱。使用本应用即表示你同意以下条款。')) +
        h2('一、服务内容') + card(
          para('本应用提供离线工具类功能与官方站点导航，按「现状」提供，不承诺任何特定功能永久可用或结果绝对准确。计算类结果（如房贷、个税、BMI、农历）仅供参考，不构成投资、医疗、法律或税务建议。')
        ) + h2('二、合理使用') + card(
          para('你应遵守所在地法律法规，不得利用本应用侵犯他人合法权益、传播违法信息、绕过第三方平台的技术保护措施，或对第三方服务造成不当负担。')
        ) + h2('三、知识产权') + card(
          para('本应用为独立实现，界面、图标、代码与文案均为原创。你可以自由使用、改名、二次开发自己的版本；但不得将本应用包装为他人作品，也不得使用未获授权的第三方品牌素材。')
        ) + h2('四、免责与责任限制') + card(
          para('本应用不含恶意代码、不联网上传数据。因设备环境差异、系统限制或输入错误造成的误差，以及使用外部站点产生的后果，由使用者自行承担。')
        ) + h2('五、协议变更') + card(
          para('协议更新会在应用内公告；继续使用视为接受更新后的条款。若不同意，请停止使用并卸载应用。')
        );
    }
  },

  permission: {
    title: '权限说明', sub: '只申请用得上的权限', icon: 'key',
    render: function () {
      return h2('权限清单') + card(
        '<div class="hub-sum">共 <b>' + PERMISSIONS.length + '</b> 项，全部声明为<strong>非必需</strong>（相机、传感器、触屏等硬件特性同样非必需）</div>' +
        H.table(['权限', '名称', '用途', '性质'], PERMISSIONS.map(function (p) {
          return [E(p[0]), E(p[1]), E(p[2]), E(p[3])];
        }))
      ) + h2('如何管理') + card(
        para('Android 6.0 及以上可在「系统设置 → 应用 → 安空工具箱 → 权限」中逐项撤销。撤销相机权限只会让「手电筒」不可用，其它工具不受影响。') +
        '<div class="btn-row">' + btn('sys', '打开本应用权限设置') + btn('sysinfo', '查看系统设置入口', 'outline') + '</div>'
      ) + h2('我们不做的事') + card(
        para('不读取通讯录、短信、通话记录、位置、剪贴板历史、已安装应用列表；不申请无障碍服务、悬浮窗、后台自启动或设备管理员权限；不申请通知权限推送广告。')
      );
    }
  },

  cookie: {
    title: 'Cookie 管理', sub: '查看并清理本机站点数据', icon: 'database',
    render: function () {
      var ck = 0;
      try { ck = document.cookie ? document.cookie.split(';').filter(function (x) { return x.trim(); }).length : 0; } catch (e) {}
      var ls = 0, bytes = 0;
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i); ls++; bytes += (k.length + (localStorage.getItem(k) || '').length) * 2;
        }
      } catch (e) {}
      return h2('当前状态') + card(
        kv([
          ['Cookie 条数', String(ck)], ['localStorage 项数', String(ls)],
          ['本地数据大小', (bytes / 1024).toFixed(1) + ' KB'],
          ['上传服务器', '从不']
        ])
      ) + h2('清理操作') + card(
        para('清理只影响本机数据。收藏、使用记录、便签、主题偏好会一并清除，操作不可撤销。') +
        '<div class="btn-row">' + btn('clear-cookie', '清除 Cookie') + btn('clear-storage', '清除本地数据', 'outline') + '</div>'
      ) + h2('说明') + card(
        para('本应用是单页离线应用，不依赖 Cookie 维持登录或追踪行为。Android 客户端的 WebView 缓存可在「缓存管理」中清理。')
      );
    }
  },

  downloads: {
    title: '下载管理', sub: '已保存到本机相册的图片', icon: 'download',
    render: function () {
      var files = null;
      try {
        var raw = window.AnkongApp ? window.AnkongApp.api.native.call('listDownloads', '') : null;
        if (raw) files = JSON.parse(raw);
      } catch (e) { files = null; }
      var body;
      if (files && files.length) {
        body = '<div class="hub-sum">共 <b>' + files.length + '</b> 个文件 · Pictures/安空工具箱</div>' +
          '<div class="dl-list">' + files.map(function (f) {
            return '<div class="dl-row"><span class="dl-ic">' + akIcon('image') + '</span>' +
              '<span class="dl-tx"><b>' + E(f.name) + '</b><small>' + E(f.size) + ' · ' + E(f.time) + '</small></span>' +
              '<button class="dl-del" data-act="page-do" data-do="del-file" data-name="' + E(f.name) + '">' + akIcon('trash') + '</button></div>';
          }).join('') + '</div>';
      } else if (files) {
        body = '<div class="empty-state"><span class="em">—</span><b>还没有保存过图片</b>' +
          '<p>用「渐变壁纸」「表情包制作」「二维码生成」等工具保存后会显示在这里。</p></div>';
      } else {
        body = '<div class="empty-state"><span class="em">—</span><b>网页版暂不支持文件管理</b>' +
          '<p>在安卓客户端中，这里会列出保存到系统相册「Pictures/安空工具箱」的图片，长按或点击删除按钮即可移除。</p></div>';
      }
      return h2('我的下载') + card(body) + h2('保存位置') + card(
        kv([['目录', 'Pictures/安空工具箱'], ['格式', 'PNG / JPEG'], ['写入方式', '系统媒体库（MediaStore）']]) +
        '<div class="btn-row">' + btn('sys', '打开系统文件管理', 'outline') + '</div>'
      );
    }
  },

  cache: {
    title: '缓存管理', sub: '占用统计与清理', icon: 'trash',
    render: function () {
      var bytes = 0, n = 0;
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i); n++; bytes += (k.length + (localStorage.getItem(k) || '').length) * 2;
        }
      } catch (e) {}
      return h2('占用统计') + card(
        kv([
          ['本地数据', n + ' 项 / ' + (bytes / 1024).toFixed(1) + ' KB'],
          ['WebView 网页缓存', '由系统管理（LOAD_NO_CACHE，基本不累积）'],
          ['应用安装包', '约 180 KB'],
          ['联网缓存', '无']
        ])
      ) + h2('清理') + card(
        para('「清理缓存」会同时调用系统 WebView 缓存清理；「重置全部数据」会清空收藏、记录、便签与偏好设置。') +
        '<div class="btn-row">' + btn('clear-cache', '清理缓存') + btn('reset-all', '重置全部数据', 'outline') + '</div>'
      ) + h2('为什么这么小') + card(
        para('应用主体是一个内嵌的单文件网页，没有图片资源包、没有字体文件、没有远程接口，所以体积和缓存占用都很低。')
      );
    }
  },

  update: {
    title: '检查更新', sub: '当前版本 v' + (window.AK_VERSION || '1.5'), icon: 'refresh',
    render: function () {
      return h2('版本信息') + card(
        kv([
          ['当前版本', 'v' + (window.AK_VERSION || '1.5')],
          ['构建日期', '2026-11-15'],
          ['最低系统', 'Android 6.0 (API 23)'],
          ['适配平台', '手机 / 平板 / ChromeOS'],
          ['更新方式', '离线本地版本，不联网检查']
        ]) + '<div class="btn-row">' + btn('check-update', '检查更新') + '</div>'
      ) + h2('更新日志') + card(
        CHANGELOG.map(function (c) {
          return '<div class="chg"><div class="chg-head"><b>' + E(c[0]) + '</b><span>' + E(c[1]) + '</span></div><ul>' +
            c[2].map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul></div>';
        }).join('')
      ) + h2('关于检查方式') + card(
        para('本应用不连接任何更新服务器，也不自动下载安装包。「检查更新」只读取本地版本信息，避免后台流量与静默升级。')
      );
    }
  },

  feedback: {
    title: '反馈', sub: '问题、建议与内容投诉', icon: 'note',
    render: function () {
      return h2('接收反馈邮箱') + card(
        '<div class="kv-box">' + H.kv([
          ['邮箱地址', '<b>' + AK_FEEDBACK_EMAIL + '</b>'],
          ['适用范围', '功能异常、结果有误、建议、内容投诉'],
          ['发送方式', '复制邮箱 / 直接写邮件（本机邮件应用）']
        ]) + '</div>' +
        '<div class="btn-row">' + btn('copy-email', '复制邮箱') + btn('send-email', '写邮件', 'outline') + '</div>' +
        para('邮件标题建议写成「安空工具箱反馈」，正文可粘贴下方生成的反馈文本。')
      ) + h2('填写反馈') + card(
        '<div class="field"><label>类型</label><select class="input" id="fb-type" data-fb>' +
        '<option value="功能异常">功能异常</option><option value="计算结果有误">计算结果有误</option>' +
        '<option value="功能建议">功能建议</option><option value="界面 / 适配问题">界面 / 适配问题</option>' +
        '<option value="内容投诉">内容投诉（侵权 / 违规）</option><option value="其它">其它</option></select></div>' +
        '<div class="field"><label>问题描述</label><textarea class="input" id="fb-text" data-fb rows="6" ' +
        'placeholder="请描述复现步骤、输入内容、期望结果与实际结果。若涉及侵权，请附上权利人证明与具体位置。"></textarea></div>' +
        '<div class="field"><label>联系方式（可选）</label><input class="input" id="fb-contact" data-fb placeholder="方便回复你的邮箱，留空则匿名"></div>' +
        '<div class="field"><label>附加环境信息</label><div class="switch-row"><div><div class="st">附上设备与版本</div>' +
        '<div class="sd">仅包含机型、Android 版本、应用版本、窗口形态，不含任何个人数据</div></div>' +
        '<button class="toggle on" data-act="fb-toggle" role="switch"></button></div></div>' +
        '<div class="btn-row">' + btn('fb-build', '生成反馈文本') + btn('fb-clear', '清空', 'outline') + '</div>'
      ) + h2('生成结果') + card('<div id="fb-out" class="hub-code" style="min-height:60px">填写后点击「生成反馈文本」</div>' +
        '<div class="btn-row">' + btn('fb-copy', '复制') + btn('fb-share', '分享 / 发送', 'outline') + '</div>') +
        h2('提示') + card(para('本应用没有服务器，反馈文本只在你本机生成，不会自动发送。你可以复制后粘贴到邮件 App 发往 <b>' + AK_FEEDBACK_EMAIL + '</b>，或点上方「写邮件」直接唤起邮件应用。请不要在反馈中填写密码等敏感信息。'));
    }
  },

  help: {
    title: '帮助', sub: '常见问题与使用技巧', icon: 'book',
    render: function () {
      return h2('常见问题') + card(
        FAQ.map(function (f) {
          return '<details class="faq"><summary>' + E(f[0]) + '</summary><p>' + E(f[1]) + '</p></details>';
        }).join('')
      ) + h2('使用技巧') + card(
        '<ul class="tips">' +
        '<li>ChromeOS / 平板外接键盘：按 <b>Ctrl / Cmd + K</b> 直接搜索工具，<b>Esc</b> 返回上一页。</li>' +
        '<li>工具页右上角星标可收藏，收藏后会出现在「关于 → 我的收藏」和首页快捷面板。</li>' +
        '<li>工具结果区有「复制」按钮；富文本结果（表格、键值卡片）也能一键复制成纯文本。</li>' +
        '<li>「关于 → 外观」可切换主题模式与 5 套主题色，浅色 / 深色都适配。</li>' +
        '<li>窗口宽度变化时布局自动切换：手机底部三 tab、平板左侧分类栏、桌面常驻导航栏。</li>' +
        '</ul>'
      ) + h2('仍然没解决？') + card(para('到「反馈」页描述问题，生成文本后发到 <b>' + AK_FEEDBACK_EMAIL + '</b>；也可以先到「缓存管理」清理数据后重试。') + btn('feedback', '去反馈'));
    }
  },

  group: {
    title: '加入官群', sub: '交流与使用反馈', icon: 'person',
    render: function () {
      return h2('关于交流群') + card(
        para('目前<strong>没有设立官方 QQ 群 / 微信群 / 频道</strong>，也不会在应用内弹出任何加群广告或引导关注。') +
        para('如后续开设，会且只会在这里公布，不会通过弹窗、推送或第三方链接私下引导。')
      ) + h2('现在可以怎么交流') + card(
        '<div class="support-list">' +
        '<div class="support-item"><b>应用内反馈</b><p>问题与建议走「反馈」页，生成文本后发到 ' + AK_FEEDBACK_EMAIL + '。</p>' + btn('feedback', '打开反馈') + '</div>' +
        '<div class="support-item"><b>分享给朋友</b><p>和朋友一起用，比群聊更直接。</p>' + btn('share', '分享应用') + '</div>' +
        '</div>'
      ) + h2('谨防冒充') + card(
        para('任何以「安空工具箱官方群」名义索取账号、密码、验证码或要求付费入群的行为，都与本应用无关，请勿轻信。')
      );
    }
  },

  settings: {
    title: '设置', sub: '主题模式、主题色等个性化配置', icon: 'settings',
    render: function () {
      var A = window.AnkongApp, st = A ? A.state : { theme: 'auto', accent: 'amber' };
      var themes = [['auto', '跟随系统'], ['light', '浅色'], ['dark', '深色']];
      var accents = [
        ['amber', '浅黄', '#FAE185'], ['mint', '薄荷', '#BFE6D2'], ['sakura', '樱粉', '#F5D6DE'],
        ['sky', '天蓝', '#CBE1F3'], ['lilac', '丁香', '#E1D6F2']
      ];
      var L = window.AKI18N;
      var langCur = L ? L.get() : 'zh-CN';
      var langChips = L ? '<div class="chips" data-no-i18n="1" style="padding:0">' + L.langs.map(function (l) {
        return '<button class="chip ' + (langCur === l.id ? 'on' : '') + '" data-act="lang" data-lang="' + l.id + '">' + E(l.name) + '</button>';
      }).join('') + '</div>' : '';
      return h2('界面语言') + card(
        langChips + para('切换后所有界面文字即时更新，选择会保存在本机；首次启动会按系统语言自动选择。')
      ) + h2('主题模式') + card(
        '<div class="chips" style="padding:0">' + themes.map(function (t) {
          return '<button class="chip ' + (st.theme === t[0] ? 'on' : '') + '" data-act="theme" data-mode="' + t[0] + '">' + t[1] + '</button>';
        }).join('') + '</div>' + para('「跟随系统」会随 Android / ChromeOS 的深色模式自动切换。')
      ) + h2('主题色') + card(
        '<div class="accent-grid">' + accents.map(function (a) {
          return '<button class="accent-item ' + (st.accent === a[0] ? 'on' : '') + '" data-act="accent" data-accent="' + a[0] + '">' +
            '<span class="ac-dot" style="--ac:' + a[2] + '"></span><b>' + a[1] + '</b>' +
            (st.accent === a[0] ? '<span class="ac-ok">' + akIcon('check') + '</span>' : '') + '</button>';
        }).join('') + '</div>' + para('主题色影响强调色、按钮、选中态与图标底色，浅色与深色模式下都有配套对比度。')
      ) + h2('显示') + card(
        '<div class="setting-row"><span class="si">' + akIcon('eye') + '</span>' +
        '<span class="st"><b>系统栏常显</b><small>状态栏与导航栏始终显示，布局稳定不跳动</small></span></div>' +
        para('本版本不提供全屏沉浸切换；系统栏颜色会随浅色 / 深色主题自动适配。')
      ) + h2('快捷入口') + card(
        '<div class="btn-row">' + btn('go-fav', '我的收藏', 'outline') + btn('go-help', '帮助', 'outline') + btn('go-about', '关于', 'outline') + '</div>'
      );
    }
  },

  about: {
    title: '关于', sub: '应用信息与致谢', icon: 'info',
    render: function () {
      return '<div class="about-hero"><span class="ah-ic">' + akIcon('grid') + '</span>' +
        '<b>安空工具箱</b><small>v' + (window.AK_VERSION || '1.5') + ' · 一个 App，装下所有顺手的小工具</small></div>' +
        h2('应用信息') + card(
          kv([
            ['应用名称', '安空工具箱'], ['版本', 'v' + (window.AK_VERSION || '1.5')],
            ['包名', 'com.ankong.toolbox'], ['最低系统', 'Android 6.0 / API 23'],
            ['目标系统', 'Android 14 / API 34'], ['界面风格', 'Material Design 3 · 浅黄色'],
            ['适配平台', '手机 / 平板 / ChromeOS'], ['工具数量', String(window.AnkongApp ? window.AnkongApp.tools().length : 129) + ' 个'],
            ['联网需求', '核心工具完全离线'], ['广告 / 账号 / 埋点', '无']
          ])
        ) + h2('实现说明') + card(
          para('界面与全部工具均为独立实现：原生 HTML / CSS / JavaScript 单页应用 + 轻量 Android WebView 壳。未反编译、未复制任何第三方应用的代码、图标或品牌资源。') +
          para('二维码生成使用 MIT 许可的 qrcode-generator（内嵌本地），其余功能不依赖第三方库。')
        ) + h2('相关页面') + card(
          '<div class="btn-row">' + btn('go-privacy', '隐私政策', 'outline') + btn('go-terms', '用户协议', 'outline') +
          btn('go-permission', '权限说明', 'outline') + btn('go-update', '更新日志', 'outline') + '</div>'
        );
    }
  }
};

function akPageTitle(id) {
  var p = AK_PAGES[id];
  return p ? p.title : '详情';
}
function akPageHtml(id) {
  var p = AK_PAGES[id];
  if (!p) return '<div class="page"><div class="empty-state">页面不存在</div></div>';
  return '<div class="page"><div class="page-title"><span class="pt-ic">' + akIcon(p.icon) + '</span>' +
    '<div><b>' + E(p.title) + '</b><small>' + E(p.sub) + '</small></div></div>' +
    p.render() + '<div style="height:20px"></div></div>';
}

window.AK_PAGES = AK_PAGES;
window.AK_CHANGELOG = CHANGELOG;
window.AK_FAQ = FAQ;
window.akPageHtml = akPageHtml;
window.akPageTitle = akPageTitle;
})();
