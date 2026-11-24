/* ============================================================
   安空工具箱 — 查询工具
   ============================================================ */

/* 常见垃圾分类词典（本土通用四类标准） */
var GARBAGE_DICT = {
  '电池': ['有害垃圾', '请投入有害垃圾桶，避免重金属污染'], '充电宝': ['有害垃圾', '含锂电池，需单独回收'],
  '灯泡': ['有害垃圾', '含汞，轻放避免破碎'], '灯管': ['有害垃圾', '含汞荧光粉'], '水银温度计': ['有害垃圾', '含汞，破损后需密封处理'],
  '过期药': ['有害垃圾', '连包装一起投入，勿随意丢弃'], '药品': ['有害垃圾', '过期药品属有害垃圾'],
  '油漆': ['有害垃圾', '含挥发性有机物'], '指甲油': ['有害垃圾', '含化学溶剂'],
  '杀虫剂': ['有害垃圾', '空罐也按有害垃圾处理'], '农药瓶': ['有害垃圾', '需清洗后单独回收'],
  '废纸': ['可回收物', '保持干燥平整'], '报纸': ['可回收物', '捆扎后投放'], '纸箱': ['可回收物', '压扁后投放'],
  '快递盒': ['可回收物', '去掉胶带和面单'], '书本': ['可回收物', '保持干燥'], '杂志': ['可回收物', ''],
  '塑料瓶': ['可回收物', '清空内容物、踩扁'], '矿泉水瓶': ['可回收物', '清空后投放'], '饮料瓶': ['可回收物', ''],
  '易拉罐': ['可回收物', '清空后投放'], '罐头': ['可回收物', '清空内容物'], '玻璃瓶': ['可回收物', '轻放，避免破碎'],
  '旧衣服': ['可回收物', '洗净晾干后投入回收箱'], '毛衣': ['可回收物', ''], '金属': ['可回收物', ''],
  '铁锅': ['可回收物', ''], '旧手机': ['可回收物', '建议先清除个人数据'], '电脑': ['可回收物', '电子废弃物，建议交给正规回收'],
  '剩饭': ['厨余垃圾', '沥干水分后投放'], '剩菜': ['厨余垃圾', '去除塑料袋等包装'], '菜叶': ['厨余垃圾', ''],
  '果皮': ['厨余垃圾', ''], '苹果核': ['厨余垃圾', ''], '香蕉皮': ['厨余垃圾', ''], '鸡蛋壳': ['厨余垃圾', ''],
  '骨头': ['其他垃圾', '大棒骨质地坚硬，归其他垃圾'], '鱼刺': ['厨余垃圾', '小碎骨可归厨余'],
  '茶叶渣': ['厨余垃圾', ''], '咖啡渣': ['厨余垃圾', ''], '米饭': ['厨余垃圾', ''],
  '外卖盒': ['其他垃圾', '沾油污的餐盒一般归其他垃圾'], '餐巾纸': ['其他垃圾', '用过的纸巾不可回收'],
  '卫生纸': ['其他垃圾', ''], '湿纸巾': ['其他垃圾', ''], '纸巾': ['其他垃圾', ''],
  '塑料袋': ['其他垃圾', '干净塑料袋部分城市可回收，以本地标准为准'], '保鲜膜': ['其他垃圾', ''],
  '口罩': ['其他垃圾', '日常使用后的口罩密封后投放'], '创可贴': ['其他垃圾', ''],
  '烟头': ['其他垃圾', '确认完全熄灭'], '陶瓷': ['其他垃圾', '碎陶瓷请包裹后投放'], '碗': ['其他垃圾', '碎瓷片'],
  '口香糖': ['其他垃圾', ''], '头发': ['其他垃圾', ''], '尘土': ['其他垃圾', ''],
  '大骨头': ['其他垃圾', ''], '榴莲壳': ['其他垃圾', '质地坚硬，归其他垃圾'], '椰子壳': ['其他垃圾', ''],
  '贝壳': ['其他垃圾', ''], '核桃壳': ['其他垃圾', ''], '纸巾盒': ['可回收物', '去掉塑料膜'],
  '牙膏皮': ['其他垃圾', ''], '化妆品瓶': ['可回收物', '清空内容物'], '口红': ['其他垃圾', ''],
  '旧电池': ['有害垃圾', ''], '纽扣电池': ['有害垃圾', ''], '墨水盒': ['有害垃圾', ''],
  '硒鼓': ['有害垃圾', '建议交回厂商回收'], '荧光棒': ['有害垃圾', '']
};
var GARBAGE_HINT = [
  ['有害', '有害垃圾', '含重金属、化学品或有毒物质'],
  ['药', '有害垃圾', '药品类通常属有害垃圾'],
  ['电池', '有害垃圾', ''],
  ['厨余', '厨余垃圾', ''], ['剩', '厨余垃圾', ''], ['果皮', '厨余垃圾', ''], ['菜', '厨余垃圾', ''],
  ['塑料', '可回收物', ''], ['纸', '可回收物', '用过的纸巾除外'], ['玻璃', '可回收物', ''], ['金属', '可回收物', ''],
  ['罐', '可回收物', ''], ['瓶', '可回收物', ''], ['衣服', '可回收物', '']
];

T({ id: 'garbage', name: '垃圾分类查询', cat: 'query', icon: '🗑️', tint: '#DCEBFF',
  desc: '输入物品名，查询属于哪一类垃圾', tags: '垃圾分类 环保 查询 回收',
  fields: [{ k: 'item', label: '物品名称', type: 'text', placeholder: '例如：充电宝 / 外卖盒 / 香蕉皮' }],
  run: function (v) {
    var s = String(v.item || '').trim();
    if (!s) throw new Error('请输入要查询的物品');
    var hit = GARBAGE_DICT[s];
    var how = '精确匹配';
    if (!hit) {
      for (var key in GARBAGE_DICT) if (s.indexOf(key) >= 0 || key.indexOf(s) >= 0) { hit = GARBAGE_DICT[key]; how = '词条：' + key; break; }
    }
    if (!hit) {
      for (var i = 0; i < GARBAGE_HINT.length; i++)
        if (s.indexOf(GARBAGE_HINT[i][0]) >= 0) { hit = [GARBAGE_HINT[i][1], GARBAGE_HINT[i][2]]; how = '关键词推测'; break; }
    }
    if (!hit) return { html: '<div class="kv"><span>查询结果</span><span>词库暂未收录「' + H.esc(s) + '」</span></div>' +
      '<div class="hint" style="margin-top:10px">通用原则：可卖钱的→可回收；会腐烂的→厨余；有毒的→有害；其余→其他。各地标准略有差异，以本地公告为准。</div>',
      text: '未收录：' + s };
    var colors = { '可回收物': '#1B6EF3', '有害垃圾': '#D32F2F', '厨余垃圾': '#2E7D32', '其他垃圾': '#616161' };
    return { html: '<div style="text-align:center;padding:6px 0 14px"><div style="font-size:22px;font-weight:800;color:' + colors[hit[0]] + '">' + hit[0] + '</div>' +
      '<div style="font-size:12px;color:var(--on-surface-variant);margin-top:6px">「' + H.esc(s) + '」 · ' + how + '</div></div>' +
      (hit[1] ? '<div class="kv"><span>投放提示</span><span>' + H.esc(hit[1]) + '</span></div>' : ''),
      text: s + ' 属于 ' + hit[0] + (hit[1] ? '。' + hit[1] : '') };
  }
});

var CITIES = [
  ['北京', 39.9042, 116.4074], ['上海', 31.2304, 121.4737], ['广州', 23.1291, 113.2644],
  ['深圳', 22.5431, 114.0579], ['杭州', 30.2741, 120.1551], ['成都', 30.5728, 104.0668],
  ['武汉', 30.5928, 114.3055], ['西安', 34.3416, 108.9398], ['南京', 32.0603, 118.7969],
  ['重庆', 29.5630, 106.5516], ['天津', 39.3434, 117.3616], ['苏州', 31.2989, 120.5853],
  ['长沙', 28.2282, 112.9388], ['郑州', 34.7466, 113.6254], ['青岛', 36.0671, 120.3826],
  ['厦门', 24.4798, 118.0894], ['香港', 22.3193, 114.1694], ['台北', 25.0330, 121.5654]
];
var WMO = { 0:'晴', 1:'多云转晴', 2:'局部多云', 3:'阴', 45:'雾', 48:'雾凇', 51:'小毛毛雨', 53:'毛毛雨', 55:'大毛毛雨',
  56:'冻毛毛雨', 57:'强冻毛毛雨', 61:'小雨', 63:'中雨', 65:'大雨', 66:'冻雨', 67:'强冻雨', 71:'小雪', 73:'中雪',
  75:'大雪', 77:'雪粒', 80:'阵雨', 81:'强阵雨', 82:'暴雨', 85:'阵雪', 86:'强阵雪', 95:'雷阵雨', 96:'雷阵雨伴冰雹', 99:'强雷暴伴冰雹' };

T({ id: 'weather', name: '天气查询', cat: 'query', icon: '🌤️', tint: '#DCEBFF',
  desc: '实时天气与未来三天预报（需联网）', tags: '天气 气温 预报 温度',
  note: '使用开放的 Open-Meteo 气象数据，需要联网；不上传任何个人信息。',
  fields: [{ k: 'city', label: '城市', type: 'select', options: CITIES.map(function (c) { return [c[0], c[0]]; }) },
    { k: 'll', label: '自定义经纬度（可选）', type: 'text', placeholder: '纬度,经度，例如 30.27,120.15' }],
  run: function (v) {
    var lat, lon, name = v.city;
    CITIES.forEach(function (c) { if (c[0] === v.city) { lat = c[1]; lon = c[2]; } });
    if (v.ll && v.ll.trim()) {
      var p = v.ll.split(/[,，\s]+/);
      if (p.length >= 2 && isFinite(parseFloat(p[0])) && isFinite(parseFloat(p[1]))) {
        lat = parseFloat(p[0]); lon = parseFloat(p[1]); name = '自定义坐标';
      } else throw new Error('经纬度格式应为：纬度,经度');
    }
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FShanghai&forecast_days=4';
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('天气服务返回 ' + r.status);
      return r.json();
    }).then(function (d) {
      var c = d.current, daily = d.daily;
      var rows = daily.time.map(function (day, i) {
        return '<tr><td>' + day.slice(5) + '</td><td>' + (WMO[daily.weather_code[i]] || '—') + '</td>' +
          '<td>' + daily.temperature_2m_min[i] + '° ~ ' + daily.temperature_2m_max[i] + '°C</td></tr>';
      }).join('');
      var text = name + ' 当前 ' + c.temperature_2m + '°C，' + (WMO[c.weather_code] || '') +
        '，体感 ' + c.apparent_temperature + '°C，湿度 ' + c.relative_humidity_2m + '%，风速 ' + c.wind_speed_10m + ' km/h';
      return { html: '<div style="text-align:center;padding:4px 0 12px"><div style="font-size:34px;font-weight:700">' +
        c.temperature_2m + '°C</div><div style="font-size:13px;color:var(--on-surface-variant)">' + H.esc(name) + ' · ' +
        (WMO[c.weather_code] || '—') + '</div></div>' + H.kv([
          ['体感温度', c.apparent_temperature + ' °C'], ['相对湿度', c.relative_humidity_2m + ' %'],
          ['风速', c.wind_speed_10m + ' km/h'], ['观测时间', c.time.replace('T', ' ')]
        ]) + '<div style="font-weight:700;margin:14px 0 6px">未来三天</div>' +
          '<table><thead><tr><th>日期</th><th>天气</th><th>气温</th></tr></thead><tbody>' + rows + '</tbody></table>',
        text: text };
    }).catch(function (e) { throw new Error('获取失败：' + e.message + '（请检查网络）'); });
  }
});

var EXPRESS_RULES = [
  [/^SF\d{10,12}$/i, '顺丰速运', 'SF 开头，通常 12 位数字'],
  [/^JD[A-Z0-9]{10,}$/i, '京东物流', 'JD 开头'],
  [/^YT\d{10,16}$/i, '圆通速递', 'YT 开头'],
  [/^(7|6|5)\d{11,13}$/, '中通 / 申通 / 韵达（需按号段细分）', '常见 12~14 位纯数字'],
  [/^(43|46|47|10|12|13)\d{10,12}$/, '韵达 / 中通等', '常见纯数字单号'],
  [/^YT|^\d{12,14}$/, '通达系快递', '12~14 位纯数字，多数为通达系'],
  [/^EMS|^E[A-Z]{2}\d{9}[A-Z]{2}$/i, '邮政 EMS', '含字母与 9 位数字'],
  [/^\d{13}$/, '邮政 / 国际包裹', '13 位纯数字'],
  [/^[A-Z]{2}\d{9}[A-Z]{2}$/i, '国际挂号邮件', '如 RR123456789CN'],
  [/^\d{10,16}$/, '通用快递单号', '纯数字，需以官方渠道确认承运方']
];
T({ id: 'express', name: '快递单号识别', cat: 'query', icon: '📦', tint: '#DCEBFF',
  desc: '根据单号格式识别可能的承运快递', tags: '快递 单号 物流 查询',
  note: '单号规则为公开常见格式的经验归纳，仅作识别参考；实时物流轨迹需在对应快递官方渠道查询。',
  fields: [{ k: 'no', label: '快递单号', type: 'text', placeholder: '粘贴单号，自动去除空格' }],
  run: function (v) {
    var s = String(v.no || '').replace(/\s|-/g, '').trim();
    if (!s) throw new Error('请输入快递单号');
    var r = null;
    for (var i = 0; i < EXPRESS_RULES.length; i++) if (EXPRESS_RULES[i][0].test(s)) { r = EXPRESS_RULES[i]; break; }
    return H.kv([
      ['输入单号', H.esc(s)], ['长度', s.length + ' 位'], ['格式', /^\d+$/.test(s) ? '纯数字' : '字母 + 数字'],
      ['识别结果', r ? r[1] : '未匹配到已知规则'], ['规则说明', r ? r[2] : '可能是小众承运商或单号有误']
    ], '识别结果');
  }
});

T({ id: 'phone', name: '手机号信息', cat: 'query', icon: '📱', tint: '#DCEBFF',
  desc: '识别运营商、号段类型与归属地前缀', tags: '手机号 运营商 号段 归属地',
  note: '依据公开号段规则本地判断，归属地仅精确到号段前缀级别，不联网、不上传号码。',
  fields: [{ k: 'no', label: '手机号码', type: 'text', placeholder: '输入 11 位手机号' }],
  run: function (v) {
    var s = String(v.no || '').replace(/\D/g, '');
    if (!s) throw new Error('请输入手机号');
    if (!/^1\d{10}$/.test(s)) throw new Error('请输入正确的 11 位中国大陆手机号');
    var p3 = s.slice(0, 3), p4 = s.slice(0, 4), p7 = s.slice(0, 7);
    var cm = ['134','135','136','137','138','139','147','148','150','151','152','157','158','159','172','178','182','183','184','187','188','195','197','198'];
    var cu = ['130','131','132','145','146','155','156','166','167','175','176','185','186','196'];
    var ct = ['133','149','153','162','173','174','177','180','181','189','190','191','193','199'];
    var op = cm.indexOf(p3) >= 0 || cm.indexOf(p4) >= 0 ? '中国移动'
      : cu.indexOf(p3) >= 0 || cu.indexOf(p4) >= 0 ? '中国联通'
      : ct.indexOf(p3) >= 0 || ct.indexOf(p4) >= 0 ? '中国电信' : '未知 / 虚拟运营商';
    var type = p3 === '134' ? '含物联网/无线数据卡号段' : /^14/.test(p3) ? '数据卡 / 物联网号段'
      : /^16/.test(p3) ? '新增公众移动号段' : /^17/.test(p3) ? '4G/5G 新增号段' : /^19/.test(p3) ? '5G 新增号段' : '常规公众移动号段';
    return H.kv([
      ['号码', s.slice(0,3) + '****' + s.slice(7)], ['号段前缀', p7 + '****'],
      ['运营商', op], ['号段类型', type], ['号码位数', '11 位'], ['国家码', '+86']
    ], '号码解析');
  }
});

var PROVINCE = { 11:'北京',12:'天津',13:'河北',14:'山西',15:'内蒙古',21:'辽宁',22:'吉林',23:'黑龙江',
  31:'上海',32:'江苏',33:'浙江',34:'安徽',35:'福建',36:'江西',37:'山东',41:'河南',42:'湖北',43:'湖南',
  44:'广东',45:'广西',46:'海南',50:'重庆',51:'四川',52:'贵州',53:'云南',54:'西藏',61:'陕西',62:'甘肃',
  63:'青海',64:'宁夏',65:'新疆',71:'台湾',81:'香港',82:'澳门',91:'国外' };
T({ id: 'idcard', name: '身份证解析', cat: 'query', icon: '🪪', tint: '#DCEBFF',
  desc: '校验 18 位身份证并解析地区、生日、性别', tags: '身份证 校验 生日 性别',
  note: '纯本地解析，不存储、不上传号码。仅用于格式校验，不用于身份核验。',
  fields: [{ k: 'no', label: '身份证号', type: 'text', placeholder: '18 位居民身份证号码' }],
  run: function (v) {
    var s = String(v.no || '').trim().toUpperCase();
    if (!/^\d{17}[\dX]$/.test(s)) throw new Error('请输入 18 位身份证号（最后一位可为 X）');
    var y = +s.slice(6,10), m = +s.slice(10,12), d = +s.slice(12,14);
    var birth = new Date(y, m-1, d);
    var validDate = birth.getFullYear() === y && birth.getMonth() === m-1 && birth.getDate() === d && y >= 1900 && birth <= new Date();
    var w = [7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2], map = '10X98765432', sum = 0;
    for (var i = 0; i < 17; i++) sum += (+s[i]) * w[i];
    var expect = map[sum % 11], ok = expect === s[17];
    var age = new Date().getFullYear() - y - ((new Date().getMonth()+1)*100 + new Date().getDate() < m*100 + d ? 1 : 0);
    return H.kv([
      ['校验位', (ok ? '✓ 通过' : '✗ 不通过') + '（应为 ' + expect + '）'],
      ['出生日期', y + '-' + H.pad(m) + '-' + H.pad(d) + (validDate ? '' : '（日期无效）')],
      ['性别', (+s[16] % 2 === 1) ? '男' : '女'],
      ['年龄', validDate ? age + ' 岁' : '—'],
      ['登记地区', PROVINCE[s.slice(0,2)] || '未知', ],
      ['地区代码', s.slice(0,6)],
      ['顺序码', s.slice(14,17)]
    ], '解析结果');
  }
});

T({ id: 'dateinfo', name: '日期详情', cat: 'query', icon: '📅', tint: '#DCEBFF',
  desc: '查看某天是星期几、第几周、季度等', tags: '日期 星期 万年历 季度',
  fields: [{ k: 'date', label: '日期', type: 'date', value: new Date().toISOString().slice(0,10) }],
  run: function (v) {
    var d = new Date(String(v.date || '').replace(/-/g, '/') + ' 00:00:00');
    if (isNaN(d.getTime())) throw new Error('请选择有效日期');
    var week = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'][d.getDay()];
    var start = new Date(d.getFullYear(), 0, 1);
    var dayOfYear = Math.floor((d - start) / 86400000) + 1;
    var weekNo = Math.ceil((dayOfYear + start.getDay()) / 7);
    var quarter = Math.floor(d.getMonth() / 3) + 1;
    var daysInMonth = new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
    var leap = (d.getFullYear() % 4 === 0 && d.getFullYear() % 100 !== 0) || d.getFullYear() % 400 === 0;
    var diff = Math.round((new Date(new Date().toDateString()) - new Date(d.toDateString())) / 86400000);
    return H.kv([
      ['星期', week], ['年内第', dayOfYear + ' 天 / 第 ' + weekNo + ' 周'],
      ['季度', '第 ' + quarter + ' 季度'], ['当月天数', daysInMonth + ' 天'],
      ['年份类型', leap ? '闰年（366 天）' : '平年（365 天）'],
      ['距今天', diff === 0 ? '就是今天' : diff > 0 ? diff + ' 天前' : Math.abs(diff) + ' 天后'],
      ['完整格式', H.fmtDate(d, false) + ' ' + week]
    ], H.fmtDate(d, false));
  }
});

var FESTIVALS = [
  ['元旦',1,1],['情人节',2,14],['妇女节',3,8],['植树节',3,12],['劳动节',5,1],['青年节',5,4],
  ['儿童节',6,1],['建党节',7,1],['建军节',8,1],['教师节',9,10],['国庆节',10,1],['万圣节',10,31],
  ['双十一',11,11],['平安夜',12,24],['圣诞节',12,25],['跨年夜',12,31]
];
T({ id: 'holiday', name: '节日倒计时', cat: 'query', icon: '🎊', tint: '#DCEBFF',
  desc: '计算距离下一个公历节日还有多少天', tags: '节日 倒计时 纪念日',
  fields: [{ k: 'date', label: '基准日期', type: 'date', value: new Date().toISOString().slice(0,10) }],
  run: function (v) {
    var base = new Date(String(v.date || new Date().toISOString().slice(0,10)).replace(/-/g,'/') + ' 00:00:00');
    if (isNaN(base.getTime())) throw new Error('请选择有效日期');
    var list = [], i;
    for (i = 0; i < FESTIVALS.length; i++) {
      var f = FESTIVALS[i];
      for (var yr = base.getFullYear(); yr <= base.getFullYear() + 1; yr++) {
        var dt = new Date(yr, f[1]-1, f[2]);
        var days = Math.round((dt - base) / 86400000);
        if (days >= 0) { list.push({ name: f[0], date: yr + '-' + H.pad(f[1]) + '-' + H.pad(f[2]), days: days }); break; }
      }
    }
    list.sort(function (a,b) { return a.days - b.days; });
    var rows = list.slice(0, 12).map(function (x) {
      return '<tr><td>' + x.name + '</td><td>' + x.date + '</td><td>' + (x.days === 0 ? '<b>就是今天</b>' : x.days + ' 天') + '</td></tr>';
    }).join('');
    return { html: '<div style="font-weight:700;margin-bottom:8px">接下来 12 个节日</div>' +
      '<table><thead><tr><th>节日</th><th>日期</th><th>还有</th></tr></thead><tbody>' + rows + '</tbody></table>',
      text: list.slice(0,12).map(function (x) { return x.name + ' ' + x.date + ' 还有 ' + x.days + ' 天'; }).join('\n') };
  }
});

var RATES = { CNY:1, USD:7.18, EUR:7.82, JPY:0.047, HKD:0.92, GBP:9.12, KRW:0.0052,
  AUD:4.75, CAD:5.22, SGD:5.35, THB:0.205, RUB:0.078, TWD:0.222, MOP:0.89, CHF:8.15, MYR:1.62 };
var RATE_NAMES = { CNY:'人民币', USD:'美元', EUR:'欧元', JPY:'日元', HKD:'港币', GBP:'英镑', KRW:'韩元',
  AUD:'澳元', CAD:'加元', SGD:'新加坡元', THB:'泰铢', RUB:'卢布', TWD:'新台币', MOP:'澳门元', CHF:'瑞士法郎', MYR:'马来西亚林吉特' };
T({ id: 'exchange', name: '汇率换算', cat: 'query', icon: '💱', tint: '#DCEBFF',
  desc: '多币种换算（内置参考汇率，可离线）', tags: '汇率 换算 货币 外币',
  note: '汇率为内置的静态参考值，便于离线快速估算，不是实时行情；如需实时数据请接入合规的金融数据服务。',
  fields: [
    { k: 'amount', label: '金额', type: 'number', value: '100' },
    { k: 'from', label: '从', type: 'select', value: 'USD', options: Object.keys(RATES).map(function (k) { return [k, k + ' · ' + RATE_NAMES[k]]; }) },
    { k: 'to', label: '到', type: 'select', value: 'CNY', options: Object.keys(RATES).map(function (k) { return [k, k + ' · ' + RATE_NAMES[k]]; }) }
  ],
  run: function (v) {
    var a = parseFloat(v.amount);
    if (!isFinite(a)) throw new Error('请输入有效金额');
    var f = RATES[v.from], t = RATES[v.to];
    if (!f || !t) throw new Error('不支持该币种');
    var cny = a * f, out = cny / t;
    return { html: '<div style="text-align:center;padding:8px 0 16px"><div style="font-size:30px;font-weight:700;color:var(--primary)">' +
      H.num(out, 4) + '</div><div style="font-size:12px;color:var(--on-surface-variant);margin-top:4px">' +
      v.to + ' · ' + RATE_NAMES[v.to] + '</div></div>' + H.kv([
        ['原始金额', a + ' ' + v.from], ['折算人民币', '¥' + H.num(cny, 2)],
        ['参考汇率', '1 ' + v.from + ' ≈ ' + H.num(f / t, 6) + ' ' + v.to], ['汇率性质', '静态参考值']
      ]),
      text: a + ' ' + v.from + ' ≈ ' + H.num(out, 4) + ' ' + v.to };
  }
});

T({ id: 'netinfo', name: '本机网络信息', cat: 'query', icon: '🌐', tint: '#DCEBFF',
  desc: '查看网络状态、语言、时区与屏幕信息', tags: '网络 IP 设备 信息',
  fields: [], auto: true, copyable: false,
  run: function (v, api) {
    var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
    var extra = null;
    try { extra = JSON.parse(api.native.call('deviceInfo', '{}') || 'null'); } catch (e) {}
    var rows = [
      ['网络状态', navigator.onLine ? '在线' : '离线'],
      ['连接类型', c.effectiveType || c.type || '未知'],
      ['下行带宽', c.downlink ? c.downlink + ' Mbps' : '未知'],
      ['往返时延', c.rtt ? c.rtt + ' ms' : '未知'],
      ['省流模式', c.saveData ? '已开启' : '未开启'],
      ['浏览器语言', navigator.language || '—'],
      ['时区', Intl.DateTimeFormat().resolvedOptions().timeZone || '—'],
      ['屏幕分辨率', screen.width + ' × ' + screen.height],
      ['设备像素比', String(window.devicePixelRatio || 1)],
      ['逻辑视口', innerWidth + ' × ' + innerHeight],
      ['平台', navigator.platform || '—']
    ];
    if (extra) Object.keys(extra).slice(0, 12).forEach(function (k) { rows.push([k, String(extra[k])]); });
    return { html: H.kv(rows.map(function (r) { return [r[0], H.esc(r[1])]; }), '设备与网络'), text: rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') };
  }
});
