/* ============================================================
   安空工具箱 — 新增工具：查询 / 文本 / 开发者 / 计算换算
   全部本地离线运行，不请求任何网络接口
   ============================================================ */

function akTodayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + H.pad(d.getMonth() + 1) + '-' + H.pad(d.getDate());
}
function akParseDate(s) {
  if (!s) return new Date();
  var d = new Date(String(s) + 'T00:00:00');
  if (isNaN(d.getTime())) throw new Error('日期格式不正确，请选择有效日期');
  return d;
}
function akGanzhi(y) {
  var g = '甲乙丙丁戊己庚辛壬癸', z = '子丑寅卯辰巳午未申酉戌亥';
  var gi = ((y - 4) % 10 + 10) % 10, zi = ((y - 4) % 12 + 12) % 12;
  return { gan: g.charAt(gi), zhi: z.charAt(zi), text: g.charAt(gi) + z.charAt(zi),
    animal: '鼠牛虎兔龙蛇马羊猴鸡狗猪'.charAt(zi),
    element: '金木水火土'.charAt(Math.floor(gi / 2)) };
}
var AK_TERMS = [
  ['小寒', 1, 5], ['大寒', 1, 20], ['立春', 2, 4], ['雨水', 2, 19],
  ['惊蛰', 3, 5], ['春分', 3, 20], ['清明', 4, 5], ['谷雨', 4, 20],
  ['立夏', 5, 5], ['小满', 5, 21], ['芒种', 6, 6], ['夏至', 6, 21],
  ['小暑', 7, 7], ['大暑', 7, 22], ['立秋', 8, 7], ['处暑', 8, 23],
  ['白露', 9, 7], ['秋分', 9, 23], ['寒露', 10, 8], ['霜降', 10, 23],
  ['立冬', 11, 7], ['小雪', 11, 22], ['大雪', 12, 7], ['冬至', 12, 22]
];

/* ---------------- 1. 万年历 / 农历 ---------------- */
T({ id: 'lunar', name: '万年历 / 农历', cat: 'query', icon: '历', tint: '#EEE9D5',
  desc: '农历日期、干支生肖、节气与星期', tags: '农历 阴历 万年历 干支 生肖 节气 calendar',
  fields: [{ k: 'date', label: '选择日期', type: 'date', value: akTodayStr() }],
  note: '农历由系统日历引擎换算，干支按公历年近似（严格以立春为界）。节气为常见公历日期，仅供参看。',
  auto: true, live: false,
  run: function (v) {
    var d = akParseDate(v.date);
    var y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    var gz = akGanzhi(y);
    var lunar = '当前环境不支持农历';
    try {
      var full = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', { dateStyle: 'full' }).format(d);
      var mm = full.match(/^\d{4}.{2}年(.+?)(星期.)$/);
      lunar = mm ? mm[1] : full;
    } catch (e) {}
    var week = '日一二三四五六'.charAt(d.getDay());
    var start = new Date(y, 0, 1);
    var dayOfYear = Math.floor((d - start) / 86400000) + 1;
    var iso = new Date(Date.UTC(y, d.getMonth(), d.getDate()));
    var isoDay = iso.getUTCDay() || 7;
    iso.setUTCDate(iso.getUTCDate() + 4 - isoDay);
    var isoStart = new Date(Date.UTC(iso.getUTCFullYear(), 0, 1));
    var isoWeek = Math.ceil((((iso - isoStart) / 86400000) + 1) / 7);
    var term = '', next = '';
    for (var i = 0; i < AK_TERMS.length; i++) {
      var t = AK_TERMS[i], td = new Date(y, t[1] - 1, t[2]);
      if (td <= d) term = t[0];
      else { next = t[0] + '（约 ' + t[1] + ' 月 ' + t[2] + ' 日）'; break; }
    }
    var rows = [
      ['公历', y + ' 年 ' + m + ' 月 ' + day + ' 日 · 星期' + week],
      ['农历', H.esc(lunar)],
      ['干支纪年', gz.text + '年（' + gz.element + '）'],
      ['生肖', gz.animal],
      ['年内第几天', dayOfYear + ' / ' + (new Date(y + 1, 0, 1) - new Date(y, 0, 1)) / 86400000 + ' 天'],
      ['ISO 周数', y + ' 年第 ' + isoWeek + ' 周'],
      ['最近节气', term || '—'],
      ['下一个节气', next || '—'],
      ['距今天', Math.round((d - new Date(new Date().setHours(0, 0, 0, 0))) / 86400000) + ' 天']
    ];
    return { html: H.kv(rows, '日期详情'), text: rows.map(function (r) { return r[0] + '：' + r[1]; }).join('\n') };
  }
});

/* ---------------- 2. 干支纪年 ---------------- */
T({ id: 'ganzhi', name: '干支纪年换算', cat: 'query', icon: '干', tint: '#EEE9D5',
  desc: '年份换算天干地支、生肖与六十甲子', tags: '干支 天干 地支 甲子 生肖 年份',
  fields: [{ k: 'year', label: '公历年份', type: 'number', value: String(new Date().getFullYear()) }],
  note: '以公历年近似换算（立春前后会有差异），六十甲子每 60 年一轮回。',
  run: function (v) {
    var y = Math.round(Number(v.year));
    if (!y || y < 1 || y > 9999) throw new Error('请输入 1 - 9999 之间的年份');
    var gz = akGanzhi(y);
    var cycle = ((y - 4) % 60 + 60) % 60 + 1;
    var rows = [
      ['公历年份', y + ' 年'],
      ['干支', gz.text + '年'],
      ['天干', gz.gan + '（' + gz.element + '）'],
      ['地支', gz.zhi],
      ['生肖', gz.animal],
      ['六十甲子', '第 ' + cycle + ' 位'],
      ['上一个同干支年', (y - 60) + ' 年'],
      ['下一个同干支年', (y + 60) + ' 年']
    ];
    var near = [];
    for (var i = y - 5; i <= y + 5; i++) {
      var g = akGanzhi(i);
      near.push([i, g.text, g.animal, i === y ? '★ 当前' : '']);
    }
    return { html: H.kv(rows, '换算结果') + '<div style="font-weight:700;margin:16px 0 8px">前后年份对照</div>' +
      H.table(['公历', '干支', '生肖', ''], near),
      text: rows.map(function (r) { return r[0] + '：' + r[1]; }).join('\n') };
  }
});

/* ---------------- 3. 历史上的今天 ---------------- */
var AK_HISTORY = {
  '01-01': ['1863 年：林肯签署《解放奴隶宣言》正式生效', '1912 年：中华民国成立，孙中山就任临时大总统', '1995 年：世界贸易组织（WTO）正式成立', '1999 年：欧元正式启动'],
  '01-15': ['1929 年：马丁·路德·金出生', '2001 年：维基百科正式上线', '2009 年：全美航空 1549 号班机迫降哈德逊河'],
  '02-04': ['1945 年：雅尔塔会议召开', '1970 年：中国成功发射第一颗人造卫星的筹备进入关键阶段', '2004 年：Facebook 上线'],
  '02-14': ['1876 年：贝尔申请电话专利', '1946 年：世界第一台通用电子计算机 ENIAC 交付', '1990 年：旅行者 1 号拍下「暗淡蓝点」'],
  '03-14': ['1879 年：爱因斯坦出生', '1594 年起：圆周率日（Pi Day）', '2018 年：霍金逝世'],
  '03-21': ['1685 年：巴赫出生', '1960 年：世界气象组织设立世界气象日', '2006 年：Twitter 发出第一条推文'],
  '04-12': ['1961 年：加加林成为首位进入太空的人类', '1981 年：哥伦比亚号航天飞机首飞'],
  '04-22': ['1970 年：首个世界地球日', '1500 年：卡布拉尔抵达巴西海岸'],
  '05-01': ['1886 年：芝加哥工人大罢工，国际劳动节的由来', '1931 年：纽约帝国大厦落成', '2004 年：欧盟扩大至 25 国'],
  '05-04': ['1919 年：五四运动爆发', '1970 年：中国第一颗人造卫星「东方红一号」相关纪念活动'],
  '06-01': ['1925 年：国际儿童节设立', '1980 年：CNN 开播'],
  '06-21': ['1788 年：美国宪法正式生效', '1948 年：第一块集成电路相关研究推进'],
  '07-01': ['1921 年：中国共产党成立', '1997 年：香港回归祖国', '1962 年：卢旺达独立'],
  '07-20': ['1969 年：阿波罗 11 号登月，人类首次踏上月球', '1900 年：第一届现代奥运会在巴黎举办期间'],
  '08-01': ['1927 年：南昌起义，中国人民解放军建军节', '1981 年：MTV 开播'],
  '08-15': ['1945 年：日本宣布无条件投降', '1947 年：印度独立', '1971 年：尼克松宣布美元与黄金脱钩'],
  '09-01': ['1939 年：第二次世界大战欧洲战场全面爆发', '1969 年：利比亚革命'],
  '09-10': ['1985 年：中国第一个教师节', '2008 年：大型强子对撞机首次注入质子束'],
  '10-01': ['1949 年：中华人民共和国成立', '1969 年：北京地铁一期工程建成通车'],
  '10-24': ['1945 年：联合国正式成立', '1929 年：美国股市「黑色星期四」'],
  '11-11': ['1918 年：第一次世界大战停战协定签署', '1989 年：柏林墙开始被拆除后的首个光棍节'],
  '11-14': ['1940 年：考文垂大轰炸', '1963 年：冰岛叙尔特塞岛火山喷发形成新岛'],
  '12-01': ['1955 年：罗莎·帕克斯拒让座，美国民权运动起点', '1988 年：世界艾滋病日设立'],
  '12-25': ['1642 年：牛顿出生', '1991 年：苏联解体进程完成']
};
T({ id: 'history', name: '历史上的今天', cat: 'query', icon: '史', tint: '#EEE9D5',
  desc: '本地事件库，按日期回看历史大事', tags: '历史 今天 大事记 日期 事件',
  fields: [{ k: 'date', label: '选择日期', type: 'date', value: akTodayStr() }],
  note: '内置精简的本地事件库，完全离线。未收录的日期会展示同月事件与精选大事。',
  run: function (v) {
    var d = akParseDate(v.date);
    var md = H.pad(d.getMonth() + 1) + '-' + H.pad(d.getDate());
    var list = AK_HISTORY[md];
    var title = (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日 · ' + (list ? '收录事件' : '本地库暂无该日条目');
    if (!list) {
      var pool = [];
      Object.keys(AK_HISTORY).forEach(function (k) {
        if (k.slice(0, 2) === H.pad(d.getMonth() + 1)) pool = pool.concat(AK_HISTORY[k]);
      });
      if (!pool.length) Object.keys(AK_HISTORY).forEach(function (k) { pool = pool.concat(AK_HISTORY[k]); });
      list = pool.slice(0, 5);
      title += '（以下为精选大事）';
    }
    var html = '<div style="font-weight:700;margin-bottom:10px">' + H.esc(title) + '</div>';
    list.forEach(function (s, i) {
      html += '<div class="kv"><span>' + (i + 1) + '</span><span style="text-align:left">' + H.esc(s) + '</span></div>';
    });
    return { html: html, text: title + '\n' + list.join('\n') };
  }
});

/* ---------------- 4. 血型遗传 ---------------- */
var AK_BLOOD_TABLE = {
  'A|A': ['A', 'O'], 'A|AB': ['A', 'B', 'AB'], 'A|B': ['A', 'B', 'AB', 'O'], 'A|O': ['A', 'O'],
  'AB|AB': ['A', 'B', 'AB'], 'AB|B': ['A', 'B', 'AB'], 'AB|O': ['A', 'B'],
  'B|B': ['B', 'O'], 'B|O': ['B', 'O'], 'O|O': ['O']
};
function akBloodKey(a, b) { return [a, b].sort().join('|'); }
T({ id: 'blood', name: '血型遗传查询', cat: 'query', icon: '血', tint: '#EEE9D5',
  desc: '父母血型推算子女可能的 ABO / Rh 血型', tags: '血型 遗传 ABO Rh 父母 子女 亲子鉴定',
  fields: [
    { k: 'p1', label: '父亲 / 母亲 ABO 血型', type: 'select', value: 'A', options: ['A', 'B', 'AB', 'O'] },
    { k: 'p2', label: '另一方 ABO 血型', type: 'select', value: 'O', options: ['A', 'B', 'AB', 'O'] },
    { k: 'r1', label: '第一方 Rh', type: 'select', value: '+', options: [['+', 'Rh 阳性（+）'], ['-', 'Rh 阴性（-）']] },
    { k: 'r2', label: '另一方 Rh', type: 'select', value: '+', options: [['+', 'Rh 阳性（+）'], ['-', 'Rh 阴性（-）']] }
  ],
  note: '仅按经典 ABO / Rh 遗传规律推算，属概率参考，不能作为医学或亲子鉴定依据。',
  run: function (v) {
    var key = akBloodKey(v.p1, v.p2);
    var possible = AK_BLOOD_TABLE[key] || ['A', 'B', 'AB', 'O'];
    var impossible = ['A', 'B', 'AB', 'O'].filter(function (x) { return possible.indexOf(x) < 0; });
    var rh = (v.r1 === '-' && v.r2 === '-') ? '只能是 Rh 阴性（-）' : 'Rh 阳性或阴性均有可能';
    var rows = [
      ['父母血型', v.p1 + ' × ' + v.p2],
      ['子女可能血型', possible.join('、')],
      ['子女不可能血型', impossible.length ? impossible.join('、') : '无'],
      ['Rh 血型', rh],
      ['提示', '若孩子血型不在「可能」列，建议咨询专业医疗机构']
    ];
    return { html: H.kv(rows, 'ABO 遗传推算'), text: rows.map(function (r) { return r[0] + '：' + r[1]; }).join('\n') };
  }
});

/* ---------------- 5. 星座与生肖 ---------------- */
var AK_ZODIAC = [
  ['摩羯座', 12, 22, 1, 19, '土', '土星', '深棕'], ['水瓶座', 1, 20, 2, 18, '风', '天王星', '天蓝'],
  ['双鱼座', 2, 19, 3, 20, '水', '海王星', '海蓝'], ['白羊座', 3, 21, 4, 19, '火', '火星', '正红'],
  ['金牛座', 4, 20, 5, 20, '土', '金星', '墨绿'], ['双子座', 5, 21, 6, 21, '风', '水星', '明黄'],
  ['巨蟹座', 6, 22, 7, 22, '水', '月亮', '银白'], ['狮子座', 7, 23, 8, 22, '火', '太阳', '金黄'],
  ['处女座', 8, 23, 9, 22, '土', '水星', '米白'], ['天秤座', 9, 23, 10, 23, '风', '金星', '淡粉'],
  ['天蝎座', 10, 24, 11, 22, '水', '冥王星', '深红'], ['射手座', 11, 23, 12, 21, '火', '木星', '紫蓝']
];
T({ id: 'zodiac', name: '星座与生肖', cat: 'query', icon: '星', tint: '#EEE9D5',
  desc: '生日查星座、生肖、元素与守护星', tags: '星座 生肖 生日 十二星座 horoscope',
  fields: [{ k: 'date', label: '出生日期', type: 'date', value: '1995-06-15' }],
  run: function (v) {
    var d = akParseDate(v.date), m = d.getMonth() + 1, day = d.getDate();
    var z = null;
    for (var i = 0; i < AK_ZODIAC.length; i++) {
      var a = AK_ZODIAC[i];
      if ((m === a[1] && day >= a[2]) || (m === a[3] && day <= a[4])) { z = a; break; }
    }
    if (!z) z = AK_ZODIAC[0];
    var gz = akGanzhi(d.getFullYear());
    var rows = [
      ['出生日期', d.getFullYear() + '-' + H.pad(m) + '-' + H.pad(day)],
      ['星座', z[0]], ['星座区间', z[1] + '.' + z[2] + ' — ' + z[3] + '.' + z[4]],
      ['四象元素', z[5] + '象'], ['守护星', z[6]], ['幸运色', z[7]],
      ['农历年干支', gz.text], ['生肖', gz.animal]
    ];
    return { html: H.kv(rows, '生日档案'), text: rows.map(function (r) { return r[0] + '：' + r[1]; }).join('\n') };
  }
});

/* ---------------- 6. 地震烈度速查 ---------------- */
var AK_QUAKE = [
  ['1 度', '无感', '仅仪器能记录'], ['2 度', '微有感', '静止中的人有轻微感觉'],
  ['3 度', '少有感', '室内少数人有感，悬挂物轻微摆动'],
  ['4 度', '多有感', '多数人有感，器皿翻倒、门窗作响'],
  ['5 度', '惊醒', '睡着的人惊醒，墙壁出现细裂缝'],
  ['6 度', '惊慌', '站立不稳，简易工房可能损坏'],
  ['7 度', '房屋损坏', '房屋轻微破坏，烟囱倒塌'],
  ['8 度', '结构破坏', '房屋较多破坏，道路出现裂缝'],
  ['9 度', '严重破坏', '多数房屋严重破坏，地面裂缝明显'],
  ['10 度', '大量倒塌', '大量房屋倒塌，铁轨轻度弯曲'],
  ['11 度', '毁灭', '绝大多数房屋倒塌，地面大裂缝'],
  ['12 度', '山河改观', '地面剧烈变化，建筑物普遍摧毁']
];
T({ id: 'quake', name: '地震烈度速查', cat: 'query', icon: '震', tint: '#EEE9D5',
  desc: '中国地震烈度表 1–12 度对照', tags: '地震 烈度 震级 速查 防灾',
  fields: [{ k: 'lv', label: '查看烈度', type: 'select', value: '6',
    options: AK_QUAKE.map(function (q, i) { return [String(i + 1), q[0]]; }) }],
  note: '烈度表示地面受影响程度，与震级（释放能量）不是同一概念。',
  run: function (v) {
    var n = Math.max(1, Math.min(12, Math.round(Number(v.lv) || 6)));
    var q = AK_QUAKE[n - 1];
    return { html: H.kv([['烈度', q[0]], ['人的感觉', q[1]], ['典型现象', q[2]],
      ['参考震级（浅源）', '约 ' + H.num(1 + n * 0.55, 1) + ' 级左右，仅供粗略对照']], '第 ' + n + ' 度') +
      '<div style="font-weight:700;margin:16px 0 8px">完整烈度表</div>' +
      H.table(['烈度', '感觉', '典型现象'], AK_QUAKE),
      text: q.join(' / ') };
  }
});

/* ---------------- 7. HTTP 状态码速查 ---------------- */
var AK_HTTP = [
  ['100', 'Continue', '继续，客户端应继续发送请求'], ['101', 'Switching Protocols', '切换协议'],
  ['200', 'OK', '请求成功'], ['201', 'Created', '已创建资源'], ['204', 'No Content', '成功但无返回内容'],
  ['206', 'Partial Content', '断点续传 / 部分内容'], ['301', 'Moved Permanently', '永久重定向'],
  ['302', 'Found', '临时重定向'], ['304', 'Not Modified', '缓存未修改'],
  ['307', 'Temporary Redirect', '临时重定向，保持方法'], ['308', 'Permanent Redirect', '永久重定向，保持方法'],
  ['400', 'Bad Request', '请求参数有误'], ['401', 'Unauthorized', '未认证'],
  ['403', 'Forbidden', '无权限访问'], ['404', 'Not Found', '资源不存在'],
  ['405', 'Method Not Allowed', '请求方法不允许'], ['408', 'Request Timeout', '请求超时'],
  ['409', 'Conflict', '资源冲突'], ['410', 'Gone', '资源已永久删除'],
  ['413', 'Payload Too Large', '请求体过大'], ['415', 'Unsupported Media Type', '不支持的媒体类型'],
  ['418', "I'm a teapot", '彩蛋状态码：我是茶壶'], ['422', 'Unprocessable Entity', '语义错误'],
  ['429', 'Too Many Requests', '请求过于频繁'], ['500', 'Internal Server Error', '服务器内部错误'],
  ['501', 'Not Implemented', '功能未实现'], ['502', 'Bad Gateway', '网关错误'],
  ['503', 'Service Unavailable', '服务不可用'], ['504', 'Gateway Timeout', '网关超时'],
  ['505', 'HTTP Version Not Supported', 'HTTP 版本不支持']
];
T({ id: 'httpcode', name: 'HTTP 状态码速查', cat: 'query', icon: '码', tint: '#EEE9D5',
  desc: '常见状态码含义与分类速查', tags: 'HTTP 状态码 404 500 200 301 接口',
  fields: [{ k: 'q', label: '输入状态码或关键字', type: 'text', value: '', placeholder: '例如 404 / gateway / 重定向' }],
  note: '内置 30 条常见状态码，可输数字、英文名称或中文含义搜索。',
  run: function (v) {
    var q = String(v.q || '').trim().toLowerCase();
    var list = !q ? AK_HTTP : AK_HTTP.filter(function (r) {
      return (r[0] + ' ' + r[1] + ' ' + r[2]).toLowerCase().indexOf(q) >= 0;
    });
    if (!list.length) return '没有匹配的状态码，试试 404、500 或 gateway';
    return { html: '<div style="font-weight:700;margin-bottom:8px">共 ' + list.length + ' 条</div>' +
      H.table(['状态码', '英文', '含义'], list), text: list.map(function (r) { return r.join(' '); }).join('\n') };
  }
});

/* ---------------- 8. MIME 类型速查 ---------------- */
var AK_MIME = [
  ['.html', 'text/html', '网页'], ['.css', 'text/css', '样式表'], ['.js', 'text/javascript', '脚本'],
  ['.json', 'application/json', 'JSON 数据'], ['.xml', 'application/xml', 'XML 数据'],
  ['.txt', 'text/plain', '纯文本'], ['.csv', 'text/csv', '逗号分隔表格'],
  ['.md', 'text/markdown', 'Markdown'], ['.pdf', 'application/pdf', 'PDF 文档'],
  ['.png', 'image/png', 'PNG 图片'], ['.jpg', 'image/jpeg', 'JPEG 图片'],
  ['.gif', 'image/gif', 'GIF 动图'], ['.webp', 'image/webp', 'WebP 图片'],
  ['.svg', 'image/svg+xml', 'SVG 矢量图'], ['.ico', 'image/x-icon', '网站图标'],
  ['.mp3', 'audio/mpeg', 'MP3 音频'], ['.wav', 'audio/wav', 'WAV 音频'],
  ['.ogg', 'audio/ogg', 'OGG 音频'], ['.mp4', 'video/mp4', 'MP4 视频'],
  ['.webm', 'video/webm', 'WebM 视频'], ['.zip', 'application/zip', 'ZIP 压缩包'],
  ['.tar', 'application/x-tar', 'TAR 归档'], ['.gz', 'application/gzip', 'GZIP'],
  ['.7z', 'application/x-7z-compressed', '7-Zip'], ['.rar', 'application/vnd.rar', 'RAR'],
  ['.doc', 'application/msword', 'Word 97'], ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Word'],
  ['.xls', 'application/vnd.ms-excel', 'Excel 97'], ['.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Excel'],
  ['.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'PPT'],
  ['.apk', 'application/vnd.android.package-archive', '安卓安装包'],
  ['.woff2', 'font/woff2', 'Web 字体'], ['.ttf', 'font/ttf', 'TrueType 字体'],
  ['.wasm', 'application/wasm', 'WebAssembly']
];
T({ id: 'mimetype', name: 'MIME 类型速查', cat: 'query', icon: '型', tint: '#EEE9D5',
  desc: '扩展名与 Content-Type 对照表', tags: 'MIME Content-Type 扩展名 文件类型',
  fields: [{ k: 'q', label: '输入扩展名或类型', type: 'text', value: '', placeholder: '例如 .png / image / json' }],
  run: function (v) {
    var q = String(v.q || '').trim().toLowerCase().replace(/^\*/, '.');
    var list = !q ? AK_MIME : AK_MIME.filter(function (r) {
      return (r[0] + ' ' + r[1] + ' ' + r[2]).toLowerCase().indexOf(q) >= 0;
    });
    if (!list.length) return '没有匹配的 MIME 类型，试试 .png、json 或 image';
    return { html: '<div style="font-weight:700;margin-bottom:8px">共 ' + list.length + ' 条</div>' +
      H.table(['扩展名', 'Content-Type', '说明'], list), text: list.map(function (r) { return r.join(' '); }).join('\n') };
  }
});

/* ---------------- 9. 成语接龙 ---------------- */
var AK_IDIOMS = ('一心一意 意气风发 发扬光大 大显身手 手到擒来 来日方长 长驱直入 入木三分 分秒必争 争先恐后 ' +
  '后来居上 上行下效 效颦学步 步步高升 升堂入室 室迩人遐 遐迩闻名 名副其实 实事求是 是非分明 ' +
  '明察秋毫 毫不犹豫 豫备不虞 虞褚欧颜 颜面扫地 地大物博 博古通今 今非昔比 比翼双飞 飞黄腾达 ' +
  '达官贵人 人山人海 海阔天空 空前绝后 后顾之忧 忧国忧民 民不聊生 生龙活虎 虎头蛇尾 尾大不掉 ' +
  '掉以轻心 心花怒放 放虎归山 山清水秀 秀外慧中 中流砥柱 柱石之坚 坚持不懈 懈志灰心 心旷神怡 ' +
  '怡然自得 得心应手 手不释卷 卷土重来 来龙去脉 脉络分明 明目张胆 胆大心细 细水长流 流芳百世 ' +
  '世外桃源 源远流长 长治久安 安居乐业 业精于勤 勤能补拙 拙口钝腮 腮红齿白 白手起家 家喻户晓 ' +
  '晓以大义 义无反顾 顾名思义 义正词严 严阵以待 待人接物 物尽其用 用心良苦 苦尽甘来 来者不拒 ' +
  '拒之门外 外柔内刚 刚正不阿 阿谀奉承 承前启后 后起之秀 秀色可餐 餐风露宿 宿弊一清 清心寡欲 ' +
  '欲罢不能 能者多劳 劳苦功高 高瞻远瞩 瞩望已久 久负盛名 名落孙山 山穷水尽 尽善尽美 美不胜收 ' +
  '收放自如 如鱼得水 水到渠成 成千上万 万紫千红 红红火火 火树银花 花好月圆 圆滑世故 故弄玄虚 ' +
  '虚怀若谷 谷父蚕母 母以子贵 贵在坚持 持之以恒 恒河沙数 数不胜数 数典忘祖 祖述尧舜 舜日尧年 ' +
  '年富力强 强词夺理 理直气壮 壮志凌云 云开见日 日新月异 异想天开 开门见山 山高水长 长年累月 ' +
  '月白风清 清风明月 月明星稀 稀奇古怪 怪诞不经 经久不衰 衰草连天 天南地北 北雁南飞 飞禽走兽').split(' ');
T({ id: 'idiom', name: '成语接龙', cat: 'text', icon: '成', tint: '#DCE9D3',
  desc: '本地成语库，自动接龙与查询', tags: '成语 接龙 词语 汉字 文字游戏',
  fields: [{ k: 'word', label: '起始成语（留空随机）', type: 'text', value: '', placeholder: '例如 一心一意' }],
  note: '内置 ' + AK_IDIOMS.length + ' 条成语，按末字同字接续。同音接龙暂不支持。',
  run: function (v) {
    var w = String(v.word || '').trim();
    if (!w) w = AK_IDIOMS[Math.floor(Math.random() * AK_IDIOMS.length)];
    if (w.length !== 4) throw new Error('请输入四个字的成语');
    if (AK_IDIOMS.indexOf(w) < 0) AK_IDIOMS.push(w);
    var chain = [w], used = {}, last = w.charAt(3);
    used[w] = true;
    for (var i = 0; i < 9; i++) {
      var cand = AK_IDIOMS.filter(function (x) { return !used[x] && x.charAt(0) === last; });
      if (!cand.length) break;
      var nx = cand[Math.floor(Math.random() * cand.length)];
      chain.push(nx); used[nx] = true; last = nx.charAt(3);
    }
    var html = '<div style="font-weight:700;margin-bottom:10px">接龙链（' + chain.length + ' 个）</div>';
    chain.forEach(function (x, i) {
      html += '<span style="display:inline-block;margin:0 8px 8px 0;padding:6px 12px;border-radius:12px;' +
        'background:var(--surface-container-low);font-size:15px;font-weight:600">' + H.esc(x) + '</span>';
      if (i < chain.length - 1) html += '<span style="color:var(--outline);margin-right:8px">→</span>';
    });
    var same = AK_IDIOMS.filter(function (x) { return x.indexOf(w.charAt(0)) === 0; });
    html += '<div style="font-weight:700;margin:16px 0 8px">同首字成语（' + same.length + ' 个）</div>' +
      '<div style="line-height:2;font-size:13px">' + same.map(H.esc).join(' · ') + '</div>';
    return { html: html, text: chain.join(' → ') };
  }
});

/* ---------------- 10. 简繁转换 ---------------- */
var AK_S2T = {
  '爱':'愛','帮':'幫','宝':'寶','报':'報','备':'備','边':'邊','变':'變','标':'標','别':'別',
  '参':'參','层':'層','产':'產','长':'長','场':'場','车':'車','陈':'陳','称':'稱','迟':'遲',
  '齿':'齒','冲':'衝','虫':'蟲','处':'處','传':'傳','辞':'辭','从':'從','达':'達','带':'帶',
  '担':'擔','胆':'膽','当':'當','党':'黨','导':'導','岛':'島','灯':'燈','敌':'敵','点':'點',
  '电':'電','调':'調','东':'東','动':'動','独':'獨','断':'斷','队':'隊','对':'對','吨':'噸',
  '儿':'兒','发':'發','范':'範','访':'訪','飞':'飛','费':'費','丰':'豐','风':'風','凤':'鳳',
  '妇':'婦','复':'復','盖':'蓋','干':'乾','赶':'趕','个':'個','给':'給','沟':'溝','构':'構',
  '购':'購','顾':'顧','关':'關','观':'觀','馆':'館','广':'廣','归':'歸','规':'規','贵':'貴',
  '国':'國','过':'過','还':'還','汉':'漢','号':'號','后':'後','护':'護','华':'華','划':'劃',
  '画':'畫','怀':'懷','坏':'壞','欢':'歡','环':'環','换':'換','黄':'黃','汇':'匯','会':'會',
  '获':'獲','击':'擊','机':'機','鸡':'雞','积':'積','极':'極','际':'際','济':'濟','记':'記',
  '纪':'紀','价':'價','驾':'駕','监':'監','检':'檢','见':'見','将':'將','奖':'獎','讲':'講',
  '节':'節','结':'結','仅':'僅','进':'進','尽':'盡','经':'經','惊':'驚','举':'舉','据':'據',
  '剧':'劇','觉':'覺','军':'軍','开':'開','课':'課','亏':'虧','扩':'擴','阔':'闊','来':'來',
  '兰':'蘭','栏':'欄','劳':'勞','乐':'樂','类':'類','里':'裡','礼':'禮','丽':'麗','历':'歷',
  '联':'聯','连':'連','练':'練','粮':'糧','两':'兩','辆':'輛','疗':'療','临':'臨','邻':'鄰',
  '灵':'靈','龄':'齡','龙':'龍','楼':'樓','炉':'爐','陆':'陸','录':'錄','乱':'亂','论':'論',
  '罗':'羅','络':'絡','妈':'媽','马':'馬','码':'碼','买':'買','卖':'賣','麦':'麥','满':'滿',
  '猫':'貓','么':'麼','门':'門','梦':'夢','灭':'滅','鸣':'鳴','铭':'銘','谬':'謬','谋':'謀',
  '难':'難','脑':'腦','闹':'鬧','内':'內','拟':'擬','鸟':'鳥','宁':'寧','农':'農','浓':'濃',
  '欧':'歐','盘':'盤','弃':'棄','气':'氣','启':'啟','签':'簽','迁':'遷','牵':'牽','铅':'鉛',
  '谦':'謙','枪':'槍','墙':'牆','强':'強','抢':'搶','桥':'橋','窃':'竊','亲':'親','轻':'輕',
  '庆':'慶','穷':'窮','区':'區','驱':'驅','权':'權','劝':'勸','却':'卻','确':'確','让':'讓',
  '热':'熱','认':'認','荣':'榮','软':'軟','润':'潤','洒':'灑','伞':'傘','丧':'喪','扫':'掃',
  '涩':'澀','杀':'殺','纱':'紗','删':'刪','闪':'閃','伤':'傷','赏':'賞','烧':'燒','绍':'紹',
  '舍':'捨','设':'設','审':'審','声':'聲','绳':'繩','圣':'聖','师':'師','湿':'濕','诗':'詩',
  '时':'時','识':'識','实':'實','释':'釋','势':'勢','视':'視','试':'試','饰':'飾','适':'適',
  '兽':'獸','书':'書','输':'輸','属':'屬','术':'術','树':'樹','数':'數','双':'雙','顺':'順',
  '说':'說','丝':'絲','松':'鬆','苏':'蘇','诉':'訴','虽':'雖','随':'隨','岁':'歲','损':'損',
  '缩':'縮','锁':'鎖','台':'臺','态':'態','摊':'攤','滩':'灘','谈':'談','叹':'嘆','汤':'湯',
  '题':'題','体':'體','条':'條','贴':'貼','铁':'鐵','厅':'廳','听':'聽','铜':'銅','统':'統',
  '头':'頭','图':'圖','团':'團','万':'萬','网':'網','为':'為','围':'圍','违':'違','维':'維',
  '伟':'偉','卫':'衛','温':'溫','闻':'聞','问':'問','稳':'穩','无':'無','务':'務','误':'誤',
  '雾':'霧','袭':'襲','习':'習','细':'細','虾':'蝦','吓':'嚇','狭':'狹','纤':'纖','闲':'閒',
  '贤':'賢','显':'顯','险':'險','现':'現','线':'線','宪':'憲','乡':'鄉','详':'詳','响':'響',
  '项':'項','销':'銷','晓':'曉','协':'協','胁':'脅','谐':'諧','携':'攜','锌':'鋅','兴':'興',
  '虚':'虛','须':'須','许':'許','绪':'緒','续':'續','悬':'懸','选':'選','学':'學','寻':'尋',
  '训':'訓','讯':'訊','压':'壓','鸦':'鴉','鸭':'鴨','哑':'啞','亚':'亞','严':'嚴','盐':'鹽',
  '颜':'顏','厌':'厭','验':'驗','杨':'楊','扬':'揚','阳':'陽','养':'養','样':'樣','谣':'謠',
  '遥':'遙','药':'藥','爷':'爺','页':'頁','叶':'葉','医':'醫','仪':'儀','遗':'遺','亿':'億',
  '忆':'憶','义':'義','艺':'藝','议':'議','译':'譯','异':'異','阴':'陰','银':'銀','饮':'飲',
  '隐':'隱','应':'應','婴':'嬰','樱':'櫻','鹰':'鷹','营':'營','赢':'贏','拥':'擁','优':'優',
  '忧':'憂','犹':'猶','邮':'郵','游':'遊','诱':'誘','于':'於','鱼':'魚','娱':'娛','渔':'漁',
  '与':'與','语':'語','预':'預','誉':'譽','员':'員','园':'園','圆':'圓','缘':'緣','远':'遠',
  '愿':'願','约':'約','跃':'躍','云':'雲','运':'運','杂':'雜','灾':'災','载':'載','赞':'贊',
  '脏':'髒','责':'責','择':'擇','泽':'澤','赠':'贈','债':'債','战':'戰','张':'張','涨':'漲',
  '账':'賬','针':'針','诊':'診','镇':'鎮','证':'證','郑':'鄭','织':'織','执':'執','职':'職',
  '纸':'紙','志':'誌','质':'質','钟':'鐘','终':'終','种':'種','众':'眾','周':'週','昼':'晝',
  '诸':'諸','猪':'豬','烛':'燭','嘱':'囑','注':'註','驻':'駐','筑':'築','专':'專','砖':'磚',
  '转':'轉','赚':'賺','装':'裝','壮':'壯','状':'狀','准':'準','浊':'濁','资':'資','综':'綜',
  '总':'總','纵':'縱','组':'組','钻':'鑽'
};
var AK_T2S = {};
Object.keys(AK_S2T).forEach(function (k) {
  var t = AK_S2T[k];
  if (t.length === 1 && !AK_T2S[t]) AK_T2S[t] = k;
});
function akConvert(s, map) {
  var out = '';
  for (var i = 0; i < s.length; i++) out += map[s.charAt(i)] || s.charAt(i);
  return out;
}
T({ id: 'simptrad', name: '简繁转换', cat: 'text', icon: '繁', tint: '#DCE9D3',
  desc: '简体 ↔ 繁体中文互转（本地字表）', tags: '简体 繁体 简繁 中文 转换 繁體',
  fields: [
    { k: 'text', label: '待转换文本', type: 'textarea', value: '安空工具箱，让每一个小工具都顺手好用。', rows: 5 },
    { k: 'mode', label: '转换方向', type: 'select', value: 's2t', options: [['s2t', '简体 → 繁体'], ['t2s', '繁体 → 简体']] }
  ],
  note: '内置 ' + Object.keys(AK_S2T).length + ' 组常用字对照，逐字转换；生僻字与一简对多繁的情况保持原样。',
  run: function (v) {
    var s = String(v.text || '');
    if (!s) throw new Error('请输入要转换的文本');
    var out = akConvert(s, v.mode === 't2s' ? AK_T2S : AK_S2T);
    return H.esc(out);
  }
});

/* ---------------- 11. 文案审查 ---------------- */
var AK_TYPOS = [
  ['帐号', '账号'], ['登陆', '登录'], ['按装', '安装'], ['既使', '即使'],
  ['做为', '作为'], ['渡过难关', '度过难关'], ['迫不急待', '迫不及待'],
  ['一如继往', '一如既往'], ['不径而走', '不胫而走'], ['再接再励', '再接再厉'],
  ['甘之如怡', '甘之如饴'], ['美仑美奂', '美轮美奂'], ['默守成规', '墨守成规'],
  ['磬竹难书', '罄竹难书'], ['人情事故', '人情世故'], ['谈笑风声', '谈笑风生'],
  ['提心掉胆', '提心吊胆'], ['走头无路', '走投无路'], ['座落', '坐落'],
  ['布署', '部署'], ['凑和', '凑合'], ['侯车', '候车'], ['精萃', '精粹']
];
T({ id: 'textcheck', name: '文案审查', cat: 'text', icon: '审', tint: '#DCE9D3',
  desc: '检查错别字、重复词、标点与超长句', tags: '文案 校对 错别字 审查 排版 标点',
  fields: [{ k: 'text', label: '待审查文本', type: 'textarea', rows: 7,
    value: '我们的产品既使在复杂场景下也能稳定运行，欢迎登陆官网查看。这个功能真的是太好用了！！！！' }],
  note: '基于本地规则做常见中文文案检查，不上传文本，也不替代人工校对。',
  run: function (v) {
    var s = String(v.text || '');
    if (!s.trim()) throw new Error('请输入要审查的文本');
    var issues = [];
    AK_TYPOS.forEach(function (p) {
      if (s.indexOf(p[0]) >= 0) issues.push(['疑似错别字', '「' + p[0] + '」建议改为「' + p[1] + '」']);
    });
    var dup = s.match(/(.)\1{2,}/g);
    if (dup) issues.push(['连续重复字符', dup.slice(0, 5).join('、')]);
    if (/[!！?？]{2,}/.test(s)) issues.push(['重复标点', '存在连续感叹号或问号']);
    if (/ {2,}/.test(s)) issues.push(['多余空格', '存在连续空格']);
    if (/[，。；：、！？][A-Za-z0-9]|[A-Za-z0-9][，。；：、！？]/.test(s)) {
      issues.push(['中英文间距', '中文标点与英文/数字直接相连']);
    }
    var long = s.split(/[。！？\n]/).filter(function (x) { return x.replace(/\s/g, '').length > 80; });
    if (long.length) issues.push(['句子过长', long.length + ' 句超过 80 字，建议拆分']);
    var chars = s.replace(/\s/g, '').length;
    var sents = s.split(/[。！？!?\n]/).filter(function (x) { return x.trim(); }).length;
    var rows = [
      ['字符数（不含空白）', chars], ['句子数', sents],
      ['平均句长', sents ? H.num(chars / sents, 1) + ' 字' : '—'],
      ['发现问题', issues.length + ' 项']
    ];
    var html = H.kv(rows, '审查概览');
    if (issues.length) {
      html += '<div style="font-weight:700;margin:16px 0 8px">问题清单</div>' +
        H.table(['类型', '说明'], issues.map(function (x) { return [H.esc(x[0]), H.esc(x[1])]; }));
    } else {
      html += '<div style="margin-top:14px;padding:12px;border-radius:14px;background:#C7ECCB;color:#2E6B3E;font-weight:600">未发现常见文案问题，看起来很棒</div>';
    }
    return { html: html, text: rows.map(function (r) { return r[0] + '：' + r[1]; }).join('\n') +
      '\n' + issues.map(function (x) { return x[0] + '：' + x[1]; }).join('\n') };
  }
});

/* ---------------- 12. IP 子网计算 ---------------- */
T({ id: 'ipcalc', name: 'IP 子网计算', cat: 'dev', icon: '网', tint: '#D8EAE9',
  desc: 'IPv4 网段、掩码、广播与可用主机', tags: 'IP 子网 掩码 CIDR 网段 广播 网络',
  fields: [
    { k: 'ip', label: 'IPv4 地址', type: 'text', value: '192.168.1.100', placeholder: '例如 10.0.0.5' },
    { k: 'mask', label: '掩码位数', type: 'select', value: '24',
      options: (function () { var a = [], i; for (i = 0; i <= 32; i++) a.push([String(i), '/' + i + (i === 24 ? ' · 常用' : '')]); return a; })() }
  ],
  note: '纯本地计算，支持 /0 – /32。不含 IPv6。',
  run: function (v) {
    var parts = String(v.ip || '').trim().split('.');
    if (parts.length !== 4) throw new Error('请输入合法的 IPv4 地址，例如 192.168.1.1');
    var n = 0;
    parts.forEach(function (p) {
      if (!/^\d{1,3}$/.test(p) || Number(p) > 255) throw new Error('IPv4 每段必须是 0 - 255 的数字');
      n = (n * 256 + Number(p)) >>> 0;
    });
    var bits = Math.max(0, Math.min(32, Math.round(Number(v.mask))));
    var mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    var net = (n & mask) >>> 0;
    var bcast = (net | (~mask >>> 0)) >>> 0;
    function ip(x) { return [(x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255].join('.'); }
    var hosts = Math.pow(2, 32 - bits);
    var usable = bits >= 31 ? hosts : Math.max(0, hosts - 2);
    var cls = n < 0x80000000 ? 'A 类' : n < 0xC0000000 ? 'B 类' : n < 0xE0000000 ? 'C 类' : n < 0xF0000000 ? 'D 类（组播）' : 'E 类（保留）';
    var priv = /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(v.ip.trim());
    var rows = [
      ['输入地址', ip(n) + '/' + bits], ['子网掩码', ip(mask)],
      ['通配符掩码', ip((~mask >>> 0))], ['网络地址', ip(net)],
      ['广播地址', bits >= 31 ? '—（/31、/32 无广播）' : ip(bcast)],
      ['首个可用主机', bits >= 31 ? ip(net) : ip((net + 1) >>> 0)],
      ['末个可用主机', bits >= 31 ? ip(bcast) : ip((bcast - 1) >>> 0)],
      ['地址总数', hosts.toLocaleString()], ['可用主机数', usable.toLocaleString()],
      ['二进制掩码', ('00000000000000000000000000000000' + mask.toString(2)).slice(-32).replace(/(.{8})/g, '$1 ').trim()],
      ['地址类别', cls], ['是否私有地址', priv ? '是（RFC 1918）' : '否（公网地址）']
    ];
    return { html: H.kv(rows, '子网计算结果'), text: rows.map(function (r) { return r[0] + '：' + r[1]; }).join('\n') };
  }
});

/* ---------------- 13. SQL 格式化 ---------------- */
T({ id: 'sqlfmt', name: 'SQL 格式化', cat: 'dev', icon: '库', tint: '#D8EAE9',
  desc: '关键字大写、自动换行与缩进', tags: 'SQL 格式化 美化 关键字 数据库',
  fields: [
    { k: 'sql', label: 'SQL 语句', type: 'textarea', rows: 6,
      value: 'select u.id, u.name, count(o.id) as cnt from users u left join orders o on u.id=o.user_id where u.status=1 and o.created_at>="2026-01-01" group by u.id order by cnt desc limit 10;' },
    { k: 'upper', label: '关键字大写', type: 'switch', value: true, hint: '关闭则保持原大小写' }
  ],
  note: '简易格式化器：按主关键字换行、AND/OR 缩进。不解析嵌套子查询与字符串字面量。',
  run: function (v) {
    var s = String(v.sql || '').trim();
    if (!s) throw new Error('请输入 SQL 语句');
    var KW = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
      'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'LEFT JOIN', 'RIGHT JOIN',
      'INNER JOIN', 'JOIN', 'ON', 'UNION ALL', 'UNION', 'AND', 'OR'];
    var re = new RegExp('\\b(' + KW.join('|').replace(/ /g, '\\s+') + ')\\b', 'gi');
    s = s.replace(/\s+/g, ' ').replace(/\s*([(),])\s*/g, '$1');
    s = s.replace(re, function (m) {
      return '§' + (v.upper ? m.toUpperCase().replace(/\s+/g, ' ') : m.replace(/\s+/g, ' ')) + '§';
    });
    var lines = [], cur = '';
    s.split('§').forEach(function (seg) {
      var t = seg.trim();
      if (!t) return;
      if (KW.indexOf(t.toUpperCase()) >= 0) {
        if (cur.trim()) lines.push(cur.trim());
        var major = ['AND', 'OR', 'ON'].indexOf(t.toUpperCase()) < 0;
        cur = (major ? '' : '  ') + t + ' ';
      } else cur += t + ' ';
    });
    if (cur.trim()) lines.push(cur.trim());
    var out = lines.join('\n').replace(/ +/g, ' ');
    return { html: '<pre style="margin:0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,Consolas,monospace;font-size:13px;line-height:1.7">' +
      H.esc(out) + '</pre>', text: out };
  }
});

/* ---------------- 14. JSONPath 取值 ---------------- */
T({ id: 'jsonpath', name: 'JSONPath 取值', cat: 'dev', icon: '径', tint: '#D8EAE9',
  desc: '按点路径从 JSON 中快速取字段', tags: 'JSON JSONPath 路径 取值 查询',
  fields: [
    { k: 'json', label: 'JSON 文本', type: 'textarea', rows: 6,
      value: '{"code":0,"data":{"users":[{"name":"安空","age":3},{"name":"工具箱","age":5}],"total":2}}' },
    { k: 'path', label: '路径', type: 'text', value: 'data.users[0].name', placeholder: '例如 data.users[1].name' }
  ],
  note: '支持点号与方括号下标，例如 data.list[2].id。根节点可用 $ 开头。',
  run: function (v) {
    var obj;
    try { obj = JSON.parse(v.json); } catch (e) { throw new Error('JSON 解析失败：' + e.message); }
    var p = String(v.path || '').trim().replace(/^\$/, '').replace(/^\./, '');
    if (!p) return JSON.stringify(obj, null, 2);
    var keys = p.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    var cur = obj;
    for (var i = 0; i < keys.length; i++) {
      if (cur == null) throw new Error('路径在第 ' + (i + 1) + ' 段「' + keys[i] + '」处中断');
      cur = cur[keys[i]];
    }
    var val = typeof cur === 'string' ? cur : JSON.stringify(cur, null, 2);
    return { html: H.kv([['路径', H.esc(p)], ['结果类型', cur === null ? 'null' : Array.isArray(cur) ? '数组' : typeof cur],
      ['命中', cur === undefined ? '否' : '是']], '查询结果') +
      '<pre style="margin:12px 0 0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,Consolas,monospace;font-size:13px">' +
      H.esc(val === undefined ? '（未找到）' : val) + '</pre>',
      text: String(val === undefined ? '' : val) };
  }
});

/* ---------------- 15. 复利 / 定投计算 ---------------- */
T({ id: 'compound', name: '复利 / 定投计算', cat: 'calc', icon: '利', tint: '#F2E4C9',
  desc: '本金 + 每月定投的复利终值与收益', tags: '复利 定投 理财 收益 年化 投资',
  fields: [
    { k: 'principal', label: '初始本金（元）', type: 'number', value: '10000' },
    { k: 'monthly', label: '每月定投（元）', type: 'number', value: '1000' },
    { k: 'rate', label: '预期年化收益率（%）', type: 'number', value: '6' },
    { k: 'years', label: '投资年限（年）', type: 'number', value: '10' }
  ],
  note: '按月复利估算，公式为教学演示用，不构成任何投资建议。',
  run: function (v) {
    var P = Math.max(0, Number(v.principal) || 0), M = Math.max(0, Number(v.monthly) || 0);
    var r = (Number(v.rate) || 0) / 100 / 12, n = Math.max(1, Math.min(60, Math.round(Number(v.years) || 1)));
    var bal = P, invest = P, rows = [];
    for (var y = 1; y <= n; y++) {
      for (var m = 0; m < 12; m++) { bal = bal * (1 + r) + M; invest += M; }
      rows.push([y + ' 年末', '¥' + Math.round(bal).toLocaleString(), '¥' + Math.round(invest).toLocaleString(),
        '¥' + Math.round(bal - invest).toLocaleString()]);
    }
    var final = bal, profit = final - invest;
    return { html: H.kv([
      ['期末总资产', '¥' + Math.round(final).toLocaleString()],
      ['累计投入', '¥' + Math.round(invest).toLocaleString()],
      ['累计收益', '¥' + Math.round(profit).toLocaleString()],
      ['总收益率', invest ? H.num(profit / invest * 100, 2) + '%' : '—'],
      ['年化收益率', (Number(v.rate) || 0) + '%']
    ], '测算结果') + '<div style="font-weight:700;margin:16px 0 8px">逐年明细</div>' +
      H.table(['时间', '资产', '累计投入', '累计收益'], rows),
      text: '期末总资产 ¥' + Math.round(final) + '，累计投入 ¥' + Math.round(invest) + '，收益 ¥' + Math.round(profit) };
  }
});

/* ---------------- 16. 油耗与油费 ---------------- */
T({ id: 'fuel', name: '油耗与油费', cat: 'calc', icon: '油', tint: '#F2E4C9',
  desc: '按百公里油耗估算里程成本', tags: '油耗 油费 里程 加油 用车成本 百公里',
  fields: [
    { k: 'consume', label: '百公里油耗（L/100km）', type: 'number', value: '7.5' },
    { k: 'km', label: '行驶里程（km）', type: 'number', value: '500' },
    { k: 'price', label: '油价（元/L）', type: 'number', value: '7.8' },
    { k: 'mode', label: '计算方式', type: 'select', value: 'cost',
      options: [['cost', '已知油耗算费用'], ['consume', '已知加油量反算油耗']] },
    { k: 'liters', label: '实际加油量（L，反算时用）', type: 'number', value: '40' }
  ],
  note: '反算模式下会忽略「百公里油耗」输入，改用加油量与里程计算实际油耗。',
  run: function (v) {
    var km = Math.max(0, Number(v.km) || 0), price = Math.max(0, Number(v.price) || 0);
    if (!km) throw new Error('请填写行驶里程');
    var cons, liters;
    if (v.mode === 'consume') {
      liters = Math.max(0, Number(v.liters) || 0);
      if (!liters) throw new Error('反算油耗需要填写实际加油量');
      cons = liters / km * 100;
    } else {
      cons = Math.max(0, Number(v.consume) || 0);
      liters = cons / 100 * km;
    }
    var cost = liters * price;
    var rows = [
      ['行驶里程', H.num(km, 1) + ' km'],
      ['百公里油耗', H.num(cons, 2) + ' L/100km'],
      ['消耗燃油', H.num(liters, 2) + ' L'],
      ['油费合计', '¥' + H.num(cost, 2)],
      ['每公里成本', '¥' + H.num(cost / km, 3)],
      ['每 100 km 费用', '¥' + H.num(cost / km * 100, 2)],
      ['估算碳排放', H.num(liters * 2.3, 1) + ' kg CO₂（按 2.3 kg/L 估算）']
    ];
    return { html: H.kv(rows, '用车成本'), text: rows.map(function (r) { return r[0] + '：' + r[1]; }).join('\n') };
  }
});

/* ---------------- 17. AA 分账 / 折扣 ---------------- */
T({ id: 'split', name: 'AA 分账 / 折扣', cat: 'calc', icon: '账', tint: '#F2E4C9',
  desc: '折扣、小费与人均应付一笔算清', tags: 'AA 分账 折扣 小费 人均 聚餐 消费',
  fields: [
    { k: 'total', label: '消费总额（元）', type: 'number', value: '328' },
    { k: 'people', label: '人数', type: 'number', value: '4' },
    { k: 'discount', label: '折扣（%，如 88 表示 8.8 折）', type: 'number', value: '88' },
    { k: 'tip', label: '服务费 / 小费（%）', type: 'number', value: '0' }
  ],
  note: '折扣作用于总额，小费按折后金额计算，最后由人数均分。',
  run: function (v) {
    var t = Math.max(0, Number(v.total) || 0), n = Math.max(1, Math.round(Number(v.people) || 1));
    var d = Math.max(0, Math.min(100, Number(v.discount) || 0)), tip = Math.max(0, Number(v.tip) || 0);
    if (!t) throw new Error('请填写消费总额');
    var after = t * d / 100, tipAmt = after * tip / 100, pay = after + tipAmt, each = pay / n;
    var rows = [
      ['原价', '¥' + H.num(t, 2)], ['折扣', d ? d + ' 折（省 ¥' + H.num(t - after, 2) + '）' : '无折扣'],
      ['折后金额', '¥' + H.num(after, 2)], ['服务费 / 小费', '¥' + H.num(tipAmt, 2)],
      ['实付合计', '¥' + H.num(pay, 2)], ['人数', n + ' 人'],
      ['人均应付', '¥' + H.num(each, 2)],
      ['若按整数收', '每人 ¥' + Math.ceil(each) + '，合计 ¥' + (Math.ceil(each) * n)]
    ];
    return { html: H.kv(rows, '分账结果'), text: rows.map(function (r) { return r[0] + '：' + r[1]; }).join('\n') };
  }
});

/* ---------------- 18. 周数与工作日 ---------------- */
T({ id: 'week', name: '周数与工作日', cat: 'calc', icon: '周', tint: '#F2E4C9',
  desc: 'ISO 周数、工作日与日期区间统计', tags: '周数 工作日 ISO 周 日期 排班 考勤',
  fields: [
    { k: 'date', label: '起始日期', type: 'date', value: akTodayStr() },
    { k: 'date2', label: '结束日期（可选，用于区间统计）', type: 'date', value: '' }
  ],
  note: '工作日按周一至周五计算，不含法定节假日调休。',
  run: function (v) {
    var d = akParseDate(v.date), y = d.getFullYear();
    var iso = new Date(Date.UTC(y, d.getMonth(), d.getDate()));
    var isoDay = iso.getUTCDay() || 7;
    iso.setUTCDate(iso.getUTCDate() + 4 - isoDay);
    var isoStart = new Date(Date.UTC(iso.getUTCFullYear(), 0, 1));
    var isoWeek = Math.ceil((((iso - isoStart) / 86400000) + 1) / 7);
    var dim = new Date(y, d.getMonth() + 1, 0).getDate();
    var workdays = 0;
    for (var i = 1; i <= dim; i++) {
      var w = new Date(y, d.getMonth(), i).getDay();
      if (w >= 1 && w <= 5) workdays++;
    }
    var rows = [
      ['查询日期', H.fmtDate(d, false)], ['星期', '星期' + '日一二三四五六'.charAt(d.getDay())],
      ['ISO 周数', iso.getUTCFullYear() + ' 年第 ' + isoWeek + ' 周'],
      ['本月天数', dim + ' 天'], ['本月工作日', workdays + ' 天'],
      ['本月周末', (dim - workdays) + ' 天'],
      ['年内第几天', Math.floor((d - new Date(y, 0, 1)) / 86400000) + 1]
    ];
    var html = H.kv(rows, '日期统计');
    if (v.date2) {
      var e = akParseDate(v.date2);
      var a = new Date(Math.min(d, e)), b = new Date(Math.max(d, e));
      var wd = 0, total = 0;
      for (var t = new Date(a); t <= b; t.setDate(t.getDate() + 1)) {
        total++;
        if (t.getDay() >= 1 && t.getDay() <= 5) wd++;
      }
      html += '<div style="font-weight:700;margin:16px 0 8px">区间统计</div>' + H.kv([
        ['区间', H.fmtDate(a, false) + ' → ' + H.fmtDate(b, false)],
        ['自然日', total + ' 天'], ['工作日', wd + ' 天'], ['周末', (total - wd) + ' 天']
      ]);
    }
    return { html: html, text: rows.map(function (r) { return r[0] + '：' + r[1]; }).join('\n') };
  }
});
