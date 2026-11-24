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
  ['v2.8', '2026-11-24', [
    '新增「时间屏幕」工具，一比一复刻暮光工具箱 4.0.6 的 Material Design 3 桌面钟：薰衣草背景、波浪花边时钟、粉色模板面板',
    '内置 10 款时钟模板（焦点 / 海报 / 极简 / 表盘 / 双块 / 堆叠 / 轨道 / 气泡 / 混合 / 丝带）与 3 种外观（主题 / 暗色 / 柔和），实时预览切换',
    '复刻视频中的 8 周年「为爱发电 · 持续更新」主题氛围与浅绿 MD3 视觉元素'
  ]],
  ['v2.7', '2026-11-24', [
    'UI 全面改用 M3E Canvas（lnkiai.github.io/m3e-canvas）设计并导出：所有配色角色、字体、图标、圆角与动效素材均取自该网站生成的 Material 3 Expressive 规范',
    '新增网站同款 Roboto 字体与 Material Symbols Rounded 图标字体（内联离线可用）；默认主题切换为优雅紫（网站 Purple baseline 精确色彩角色）',
    '按 M3 Expressive 组件规范升级：56dp pill 按钮、连接按钮组、20dp 卡片、72dp 列表项与 28/8dp 堆叠圆角、80dp 导航 pill indicator、16dp FAB、28dp 底部面板与弹性弹簧动效'
  ]],
  ['v2.6', '2026-11-24', [
    '全面升级为真正的 Material 3 UI：接入 Google 官方 Material Color Utilities（HCT 感知色彩空间 + TonalPalette）算法，5 套主题色全部由种子色派生完整 M3 色彩角色，而非手工调色',
    '实现 M3 Design Token 系统：完整的 color roles、Typography 排版层级（display/headline/title/body/label）、Shape 形状层级、Elevation 阴影层级、State Layer 交互反馈与 Motion 动效规范',
    '按 M3 组件规范重塑导航栏 active indicator、按钮、卡片、Chip、文本字段、搜索栏、FAB 等核心组件；新增 6 个离线工具，工具总数达到 489 个'
  ]],
  ['v2.5', '2026-11-22', [
    '新增 6 个纯离线工具：逻辑门真值表、编辑距离、罗马数字转换、复数运算、二元一次方程组、BMI 与基础代谢，工具总数达到 483 个',
    '首发桌面平台：新增 macOS dmg 与 Windows exe（NSIS 安装包 / 便携版），桌面端内置全部工具、15 种语言与资讯页，离线可用',
    '版本号升级至 2.5（versionCode 20），网页版、安卓、iOS、macOS、Windows 五端同步构建，新工具配齐图标与 15 种界面语言词条'
  ]],
  ['v2.4', '2026-11-22', [
    '首次支持 iOS 平台：提供 Capacitor iOS 工程源码（可用 Xcode 构建签名为正式 IPA）与未签名 IPA 结构包，安卓 APK 同步更新',
    '新增 6 个纯离线工具：彩票号码生成、百家姓查询、盲文转换、车牌号归属地、体脂率计算、元素周期表测验，工具总数达到 477 个',
    '版本号升级至 2.4（versionCode 19），网页版与安卓安装包同步构建，新工具配齐图标与 15 种界面语言词条'
  ]],
  ['v2.3', '2026-11-22', [
    '继续移植暮光工具箱（经作者授权）的数据资源与功能设计：新增 4 个纯离线工具，工具总数达到 471 个',
    '新增「今天吃什么」决策助手（自定义选项随机抽取、历史记录）、「域名后缀查询」（移植 1476 条公共后缀数据，识别主域与后缀）、「英制单位换算」（格令 / 长吨 / 短吨 / 蒲式耳 / 液盎司 / 摩尔等冷门单位）、「开源库与许可证速查」（217 条开源库数据）',
    '版本号升级至 2.3（versionCode 18），网页版与安卓安装包同步构建，新工具配齐图标与 15 种界面语言词条'
  ]],
  ['v2.2', '2026-11-22', [
    '移植暮光工具箱（经作者授权）的优质离线数据资源，以本应用的架构重新实现三个招牌功能：交互式元素周期表、猫品种图鉴、一笔画小游戏',
    '元素周期表：118 种元素完整数据，按周期表网格排布并按类别着色，支持搜索、分类筛选与详情查看（原子量、熔沸点、密度、电子排布、发现者、简介等）',
    '猫品种图鉴：233 条猫品种 / 行为 / 叫声 / 护理条目 + 饮食禁忌速查，全部本地查询；一笔画：120 个关卡、6 个章节，Canvas 手绘连线解谜',
    '版本号升级至 2.2（versionCode 17），网页版与安卓安装包同步构建，新增功能配齐图标与 15 种界面语言词条'
  ]],
  ['v2.1', '2026-11-19', [
    '新增 24 个实用工具，工具总数达到 464 个：格雷码转换、汉明重量、汉明距离、完全数与亲和数、自恋数、互质判定、连分数、埃及分数、一元二次方程求根、常用三角函数值表、极坐标互转、经纬度距离、方位角、Soundex / Metaphone 语音编码、异或校验和、奇偶校验位、增值税价税分离、百分比变化、RGB/CMYK 互转、区间质数筛选、斐波那契 / 卢卡斯 / 卡特兰数列',
    '新工具覆盖位运算、数论、代数、几何地理、编码与财务色彩等多个方向，全部纯离线运行，输入内容不离开设备',
    '版本号升级至 2.1（versionCode 16），网页版与安卓安装包同步构建，15 种界面语言的新工具名称词条全部补齐'
  ]],
  ['v2.0', '2026-11-18', [
    '导航栏新增「资讯」页面：今日新闻速览（60 秒读懂世界）、微博 / 知乎 / 抖音 / 今日头条 / 百度五大热榜与每日一言，一次打开即可纵览全网热点',
    '资讯数据来自公开RSS聚合接口，匿名读取、不上传任何本机数据；无网络或接口不可用时优雅降级，并附官方站点导航，核心离线工具不受影响',
    '新增一批实用工具与对应图标、多语言词条，工具总数进一步扩充',
    '版本号升级至 2.0（versionCode 15），网页版与安卓安装包同步构建，15 种界面语言词条全部补齐'
  ]],
  ['v1.9', '2026-11-16', [
    '新增 40 个实用工具，工具总数达到 416 个：回文数与特殊数检测、卡普雷卡尔常数、快乐数、埃氏筛、最大公约数与最小公倍数、任意进制互转、分数化简、校验位计算、大数阶乘、斐波那契数列、数字根、排列组合、概率计算、梯形法数值积分、智能折行、词频统计、N-Gram、可读性分析、哈希可视化、BBCode/Markdown 互转、Atbash/仿射/波利比乌斯密码、摩斯时序、语义化版本比较、Cron 表达式解释、JWT 解码、配色方案、WCAG 对比度检查、时间预算、金额大写与拆分等',
    'OCR 图片文字提取现已真实可用：集成 Google ML Kit bundled 中文识别模型并随 APK 打包，完全在本机解码与识别，不上传图片、无需联网、无需 Google Play 服务或 API Key；支持相册选图与拍照，识别后可去空行、合并换行、段落重排与导出 TXT',
    'APK 改用 Gradle 正式构建以纳入 ML Kit 及其依赖（仅打包 arm64-v8a 与 armeabi-v7a 主流架构），网页版保持单文件形态并继续提供 OCR 手动录入 / 粘贴降级路径',
    '版本号升级至 1.9（versionCode 14），15 种界面语言词条与全部新工具图标补齐'
  ]],
  ['v1.8', '2026-11-15', [
    '新增 11 个实用工具，工具总数达到 376 个：OCR 图片文字提取工作台、图片旋转与翻转、图片信息查看、图片哈希与相似度、触控检测、灰度与渐变测试、秒表（计次 / 圈速）、倒计时计时器、内置浏览器、大小写转换、文本清洗',
    '新增内置 Chromium 浏览器：基于设备 WebView 内核在应用内打开网页，带地址栏、前进 / 后退 / 刷新与常驻关闭按钮，内置常用站点与本机书签；网页由目标站点直接加载，不经过本应用服务器',
    '补齐并增强日常功能：亲戚称呼关系表扩充至 100 余条；屏幕检测补上触控断触与灰度渐变测试；文本清洗支持去空行、合并 / 去除换行、去除空白、去重行与段落重排自由组合；单位换算已覆盖长度 / 重量 / 面积 / 体积 / 温度 / 速度 / 压力',
    'OCR 采用「本地预处理 + 可插拔端侧识别引擎 + 完整排版导出」工作流，图片只在本机解码处理、绝不上传；内置浏览器与拍照选图带来的权限与隐私说明已同步更新',
    '版本号升级至 1.8（versionCode 13），网页版与安卓安装包同步构建，15 种界面语言词条与图标全部补齐'
  ]],
  ['v1.7', '2026-11-15', [
    '新增 40 个实用工具，工具总数达到 365 个：Quoted-Printable / UUencode / Ascii85、ROT47 与维吉尼亚密码、哈夫曼编码、Set-Cookie 解析、ULID 解析、chmod 权限、HTML 转 Markdown、CSP 安全头、正则解释器、质因数分解、IEEE 754 位级解析、模逆元、向量与复数运算、社保公积金、信用卡循环利息、色觉模拟、dBm 换算、数独与汉诺塔等',
    '界面语言从 5 种扩展到 15 种：新增 Deutsch、Español、한국어、Русский、Português、Italiano、Nederlands、Türkçe、Tiếng Việt、Bahasa Indonesia',
    '新增语言采用独立词典与英文兜底机制：界面框架、设置、分类、按钮、更新与表单标签完整本地化，未覆盖的长文本回退为完整译文，不会出现中英混杂的破碎文本',
    '版本号升级至 1.7（versionCode 12），网页版与安卓安装包同步构建；自动检查更新已发布到 GitHub Releases'
  ]],
  ['v1.6', '2026-11-15', [
    '新增 50 个实用工具，工具总数达到 325 个：全角半角转换、Markdown 目录生成、Emoji 短码、Base58 与校验和、Cron 下次执行时间、等额本息与等额本金对比、睡眠周期、债务简化结算、IPv6 地址分析、CSS clip-path 与 SVG 波浪生成等',
    '新增自动检查更新：启动后自动读取 GitHub Releases 的公开版本信息，发现新版本时首页显示提示条并给出下载入口，也可随时手动检查',
    '检查更新只读取公开版本号与更新说明，不上传任何本机数据、不自动下载或安装；可在「设置」「检查更新」中关闭自动检查或忽略某个版本，离线时静默降级不影响任何离线工具',
    '版本号升级至 1.6（versionCode 11），网页版与安卓安装包同步构建，五种界面语言的更新相关文案全部补齐'
  ]],
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
  ['工具需要联网吗？', '绝大多数工具完全离线运行，输入内容只在本机处理，不会上传。会产生对外网络请求的功能只有三类：「检查更新」匿名读取 GitHub 公开版本信息（可在设置中关闭）、「内置浏览器」按你输入的网址加载网页，以及「资讯」页匿名读取公开新闻 / 热榜数据。三者都不上传收藏、便签、图片或任何工具输入内容。'],
  ['「今日新闻」的数据从哪来？', '「资讯」页通过公开的第三方聚合接口匿名读取新闻摘要与热榜标题（如 60s 新闻、各平台公开热榜），仅用于展示，不进行个性化推荐，也不采集你的浏览偏好。接口不可用时页面会提示，可改用页面内的官方站点导航。'],
  ['为什么有些在线功能没有？', '在线影视资源、短视频去水印解析、在线壁纸图集等需要第三方接口与相应授权。本应用不内置、不盗链、不抓取第三方版权内容，相关入口改为本地工具与官方站点导航。'],
  ['我的数据存在哪里？', '收藏、使用记录、便签、游戏最高分、主题偏好保存在应用本地存储（localStorage），不会同步到云端。卸载应用会一并清除。'],
  ['为什么申请相机权限？', '用于「手电筒」控制闪光灯，以及图片类工具的拍照选图；照片只在本机解码处理，不上传。可在系统设置中随时撤销，撤销后手电筒与拍照选图不可用，其它工具不受影响。'],
  ['平板 / ChromeOS 上布局会变吗？', '会。宽屏自动切换为左侧常驻导航 + 分类栏 + 多列网格，支持鼠标、键盘与窗口自由缩放。'],
  ['保存的图片在哪里？', '保存到系统相册的「Pictures/安空工具箱」目录，可在「下载管理」中查看。'],
  ['闪退或工具算错了怎么办？', '到「反馈」页填写问题描述，把反馈文本发送到 3805278668@qq.com；也可以在工具页核对输入格式后重试。']
];

var PERMISSIONS = [
  ['INTERNET', '访问网络', '用于「检查更新」读取 GitHub 公开版本信息、「内置浏览器」加载你输入的网页，以及「资讯」页读取公开新闻 / 热榜；核心工具不联网', '可选'],
  ['ACCESS_NETWORK_STATE', '查看网络状态', '「设备信息」显示当前连接方式', '可选'],
  ['VIBRATE', '振动', '工具运行完成后的轻振动反馈', '可选'],
  ['CAMERA', '相机 / 闪光灯', '「手电筒」控制补光灯，及图片类工具拍照选图；照片仅本机处理', '按需'],
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
    title: '隐私政策', sub: '最后更新：2026 年 11 月 18 日', icon: 'shield',
    render: function () {
      return card(
        para('本政策说明「安空工具箱」（下称「本应用」）如何处理你的信息。一句话总结：<strong>我们不收集、不上传、不共享你的任何个人信息</strong>。')
      ) + h2('一、我们收集什么') + card(
        para('不收集。本应用没有服务器账号体系，没有统计埋点，没有崩溃上报，也没有广告 SDK。你在工具中输入的文字、数字、图片仅在当前页面内参与计算，不会被发送到任何地方。') +
        para('会产生对外网络请求的功能有三类：「检查更新」向 GitHub 接口发起一次匿名 GET，读取公开的版本号、发布时间与更新说明；「内置浏览器」按你输入的网址加载网页，网页由对应站点直接提供；「资讯」页匿名读取公开的第三方新闻 / 热榜聚合接口，仅用于展示标题与摘要。三者都不携带账号、设备标识、收藏、便签或任何工具输入内容，也不上传任何文件。你可以在「设置」中随时关闭自动检查；内置浏览器仅在打开时联网，随时可用顶部「关闭」按钮退出；资讯页不采集你的浏览偏好，也不做个性化推荐。')
      ) + h2('二、本地存储') + card(
        para('为提供正常功能，以下数据保存在设备本地（localStorage / WebView 存储）：收藏列表、最近使用记录、便签内容、计数器与游戏最高分、主题偏好、反馈草稿。') +
        para('你可以在「Cookie 管理」「缓存管理」「数据」中查看或清除这些数据；卸载应用会一并删除。')
      ) + h2('三、权限与设备能力') + card(
        para('仅在对应功能被使用时才会申请：相机（闪光灯与拍照选图）、振动、旧版系统的存储写入。图片类工具选择的图片只在本机解码与处理，不会上传。详见「权限说明」。权限可随时在系统设置中撤销。')
      ) + h2('四、第三方链接与组件') + card(
        para('导航类工具会跳转到各平台官方站点，这些站点有自己的隐私政策，本政策不适用。「资讯」页展示的新闻与热榜标题来自公开第三方聚合接口，版权归原作者与平台所有，点击后跳转至对应站点。二维码生成使用 MIT 许可的 qrcode-generator 本地库，不联网、不采集数据。')
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
        para('Android 6.0 及以上可在「系统设置 → 应用 → 安空工具箱 → 权限」中逐项撤销。撤销相机权限只会让「手电筒」与拍照选图不可用，其它工具不受影响。') +
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
    title: '检查更新', sub: '当前版本 v' + (window.AK_VERSION || '2.8'), icon: 'refresh',
    render: function () {
      var U = window.AK_UPDATE;
      var s = U ? U.get() : { state: 'idle' };
      var statusHtml = window.akUpdStatusHtml ? window.akUpdStatusHtml(s) : '';
      var actionsHtml = window.akUpdActionsHtml ? window.akUpdActionsHtml(s) : '';
      var autoOn = s.auto !== false;
      var notes = '';
      if (s.state === 'available' && s.body) {
        notes = h2('新版本更新说明') + card('<pre class="upd-notes">' + E(s.body) + '</pre>');
      }
      var rows = [
        ['当前版本', 'v' + (window.AK_VERSION || '2.8')],
        ['构建日期', '2026-11-15'],
        ['最低系统', 'Android 6.0 (API 23)'],
        ['适配平台', '手机 / 平板 / ChromeOS'],
        ['更新来源', 'GitHub Releases · Defaultuesr/AnKongToolBox']
      ];
      if (s.assetSize && U) rows.push(['安装包大小', U.formatSize(s.assetSize)]);
      return h2('版本信息') + card(
        kv(rows) +
        '<div id="upd-status">' + statusHtml + '</div>' +
        '<div class="btn-row" id="upd-actions">' + actionsHtml + '</div>'
      ) + notes +
      h2('自动检查') + card(
        '<div class="switch-row"><div><div class="st">启动时自动检查更新</div>' +
        '<div class="sd">每隔 12 小时最多检查一次，仅在联网时读取公开版本信息</div></div>' +
        '<button class="toggle' + (autoOn ? ' on' : '') + '" data-act="update-auto" role="switch" aria-label="启动时自动检查更新"></button></div>' +
        '<div class="hint">上次检查：' + E(U ? (U.formatTime(s.checkedAt) || '尚未检查') : '尚未检查') + '</div>' +
        para('检查更新只向 GitHub 发起一次匿名 GET 请求，读取公开的版本号与更新说明，不上传任何本机数据，也不会自动下载或安装 APK。是否升级完全由你决定。')
      ) + h2('更新日志') + card(
        CHANGELOG.map(function (c) {
          return '<div class="chg"><div class="chg-head"><b>' + E(c[0]) + '</b><span>' + E(c[1]) + '</span></div><ul>' +
            c[2].map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul></div>';
        }).join('')
      ) + h2('关于检查方式') + card(
        para('应用本体与全部工具依旧完全离线可用。若网络不可用、接口限流或仓库暂无 Release，检查会静默失败并显示提示，不会弹出干扰，也不影响任何本地数据与工具使用。') +
        para('你也可以直接访问项目 Release 页面查看历史版本与源码，所有安装包均由该仓库公开发布。')
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
        ['purple', '优雅紫', '#6750A4'], ['grass', '青草绿', '#2E6A44'], ['amber', '浅黄', '#FAE185'], ['mint', '薄荷', '#BFE6D2'], ['sakura', '樱粉', '#F5D6DE'],
        ['sky', '天蓝', '#CBE1F3'], ['lilac', '丁香', '#E1D6F2']
      ];
      var L = window.AKI18N;
      var langCur = L ? L.get() : 'zh-CN';
      var updAuto = window.AK_UPDATE ? window.AK_UPDATE.get().auto : true;
      var langChips = L ? '<div class="chips chips-wrap" data-no-i18n="1" style="padding:0">' + L.langs.map(function (l) {
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
      ) + h2('更新') + card(
        '<div class="switch-row"><div><div class="st">启动时自动检查更新</div>' +
        '<div class="sd">每隔 12 小时最多检查一次，可随时关闭，不影响离线工具</div></div>' +
        '<button class="toggle' + (updAuto ? ' on' : '') + '" data-act="update-auto" role="switch" aria-label="启动时自动检查更新"></button></div>' +
        '<div class="btn-row" style="margin-bottom:0">' + btn('check-update', '立即检查更新', 'outline') + '</div>'
      ) + h2('快捷入口') + card(
        '<div class="btn-row">' + btn('go-fav', '我的收藏', 'outline') + btn('go-help', '帮助', 'outline') + btn('go-about', '关于', 'outline') + '</div>'
      );
    }
  },

  about: {
    title: '关于', sub: '应用信息与致谢', icon: 'info',
    render: function () {
      return '<div class="about-hero"><span class="ah-ic">' + akIcon('grid') + '</span>' +
        '<b>安空工具箱</b><small>v' + (window.AK_VERSION || '2.8') + ' · 一个 App，装下所有顺手的小工具</small></div>' +
        h2('应用信息') + card(
          kv([
            ['应用名称', '安空工具箱'], ['版本', 'v' + (window.AK_VERSION || '2.8')],
            ['包名', 'com.ankong.toolbox'], ['最低系统', 'Android 6.0 / API 23'],
            ['目标系统', 'Android 14 / API 34'], ['界面风格', 'Material Design 3 Expressive'],
            ['适配平台', '手机 / 平板 / ChromeOS'], ['工具数量', String(window.AnkongApp ? window.AnkongApp.tools().length : 129) + ' 个'],
            ['联网需求', '核心工具完全离线'], ['广告 / 账号 / 埋点', '无']
          ])
        ) + h2('致敬') + card(
          para('「时间屏幕」桌面钟一比一复刻自暮光工具箱 4.0.6 的 Material Design 3 设计（见 B 站官方宣传视频）。向坚持「为爱发电 · 持续更新」八年的开发者致敬——纯净无广、用户意见至上，愿你归来仍是少年。')
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
