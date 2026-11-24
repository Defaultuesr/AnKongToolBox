/* ============================================================
   安空工具箱 — 聚合资源分区的本地实现
   全部为离线算法 / 本地资料库 / 官方公开站点导航，
   不依赖第三方在线接口，不下载或解析第三方版权内容。
   ============================================================ */
(function () {
'use strict';

var E = function (s) { return H.esc(s); };
function kvBox(rows) { return '<div class="kv-box">' + H.kv(rows) + '</div>'; }
function linksHTML(items) {
  return '<div class="hub-links">' + items.map(function (it) {
    return '<button class="hub-link" data-act="open-url" data-url="' + E(it[2]) + '">' +
      '<span class="hl-ic">' + akIcon(it[3] || 'globe') + '</span>' +
      '<span class="hl-tx"><b>' + E(it[0]) + '</b><small>' + E(it[1]) + '</small></span>' +
      '<span class="hl-go">' + akIcon('arrow') + '</span></button>';
  }).join('') + '</div>';
}
function note(t) { return '<div class="note"><b>说明</b>' + E(t) + '</div>'; }
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

/* ================= 一、影音与资料库 ================= */

var MOVIES = [
  ['肖申克的救赎', 1994, '剧情', '希望与自由，监狱题材的经典之作'],
  ['霸王别姬', 1993, '剧情', '华语电影巅峰，戏与人生交织'],
  ['千与千寻', 2001, '动画', '宫崎骏代表作，成长与善意'],
  ['星际穿越', 2014, '科幻', '时间与亲情，硬科幻入门'],
  ['盗梦空间', 2010, '悬疑', '多层梦境结构与开放式结局'],
  ['大话西游', 1995, '喜剧', '无厘头与悲剧内核的奇妙融合'],
  ['阿甘正传', 1994, '剧情', '一个普通人串起的时代记忆'],
  ['疯狂动物城', 2016, '动画', '偏见与包容的寓言'],
  ['2001 太空漫游', 1968, '科幻', '科幻电影的视觉与哲学原点'],
  ['看不见的客人', 2016, '悬疑', '层层反转的密室推理'],
  ['让子弹飞', 2010, '喜剧', '密集台词与隐喻叙事'],
  ['你的名字。', 2016, '动画', '时空错位与青春悸动'],
  ['海上钢琴师', 1998, '剧情', '关于选择、天赋与陆地'],
  ['降临', 2016, '科幻', '语言学与非线性时间'],
  ['摔跤吧！爸爸', 2016, '剧情', '体育励志与家庭叙事'],
  ['机器人总动员', 2008, '动画', '极少台词讲出的温柔故事']
];
T({ id: 'hub_movie', name: '影视片单速查', cat: 'hub', icon: '影视',
  desc: '经典片单 · 类型年代索引（仅资料，不提供片源）', tags: '影视 电影 片单 推荐',
  auto: true,
  fields: [
    { k: 'genre', label: '类型', type: 'select', value: '全部', options: ['全部', '剧情', '科幻', '动画', '悬疑', '喜剧'] },
    { k: 'era', label: '年代', type: 'select', value: '全部', options: ['全部', '1990s 及以前', '2000s', '2010s 及以后'] }
  ],
  run: function (v) {
    var list = MOVIES.filter(function (m) {
      if (v.genre !== '全部' && m[2] !== v.genre) return false;
      if (v.era === '1990s 及以前' && m[1] > 1999) return false;
      if (v.era === '2000s' && (m[1] < 2000 || m[1] > 2009)) return false;
      if (v.era === '2010s 及以后' && m[1] < 2010) return false;
      return true;
    });
    return '<div class="hub-sum">共 <b>' + list.length + '</b> 部 · 纯本地资料库</div>' +
      H.table(['片名', '年份', '类型', '简介'], list.map(function (m) {
        return [E(m[0]), m[1], E(m[2]), E(m[3])];
      })) + note('只提供影片资料索引，不提供、不链接任何未经授权的在线播放或下载资源。');
  }
});

var NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
var SCALES = {
  '大调音阶': [0, 2, 4, 5, 7, 9, 11], '自然小调': [0, 2, 3, 5, 7, 8, 10],
  '五声音阶': [0, 2, 4, 7, 9], '蓝调音阶': [0, 3, 5, 6, 7, 10]
};
T({ id: 'hub_music', name: '音阶和弦速查', cat: 'hub', icon: '音乐',
  desc: '12 调音阶 / 和弦组成，可试听', tags: '音乐 音阶 和弦 调式 乐理',
  auto: true,
  fields: [
    { k: 'root', label: '主音', type: 'select', value: 'C', options: NOTES },
    { k: 'scale', label: '音阶', type: 'select', value: '大调音阶', options: Object.keys(SCALES) },
    { k: 'oct', label: '八度', type: 'select', value: '4', options: [['3', '低八度 (3)'], ['4', '中央区 (4)'], ['5', '高八度 (5)']] }
  ],
  run: function (v) {
    var r = NOTES.indexOf(v.root), steps = SCALES[v.scale] || SCALES['大调音阶'];
    var midi = (+v.oct + 1) * 12 + r;
    var items = steps.map(function (st) { return { n: NOTES[(r + st) % 12], m: midi + st }; });
    var freqs = items.map(function (x) { return 440 * Math.pow(2, (x.m - 69) / 12); });
    var names = items.map(function (x) { return x.n + v.oct; });
    var chord = [0, 2, 4].map(function (i) { return items[i] ? items[i].n : '—'; }).join(' - ');
    var dom = [0, 4].map(function (i) { return items[i] ? items[i].n : '—'; }).join(' · ');
    return '<div class="hub-sum"><b>' + E(v.root) + ' ' + E(v.scale) + '</b> · ' + names.join('  ') + '</div>' +
      kvBox([
        ['组成音', names.join(' · ')],
        ['频率 (Hz)', freqs.map(function (f) { return f.toFixed(1); }).join(' / ')],
        ['主三和弦', chord],
        ['五度关系', dom],
        ['半音数', steps.join(' , ')]
      ]) +
      '<div class="btn-row"><button class="btn tonal" data-act="hub-play" data-notes="' +
        E(freqs.map(function (f) { return f.toFixed(2); }).join(',')) + '">试听音阶</button></div>' +
      note('频率按十二平均律计算，A4 = 440 Hz。试听使用本机 Web Audio，无需联网。');
  }
});

var IMG_SITES = [
  ['Unsplash', '免费可商用高清图库', 'https://unsplash.com/s/photos/'],
  ['Pexels', '免费图片与视频素材', 'https://www.pexels.com/search/'],
  ['Pixabay', '免版税图片 / 插画', 'https://pixabay.com/images/search/'],
  ['Openverse', '开放许可内容检索', 'https://openverse.org/search/image?q='],
  ['Wikimedia Commons', '维基共享资源', 'https://commons.wikimedia.org/w/index.php?search='],
  ['Flickr', '创作共用授权图片', 'https://www.flickr.com/search/?text=']
];
T({ id: 'hub_imgsearch', name: '图片搜索导航', cat: 'hub', icon: '搜图',
  desc: '一次生成多个公开图库的搜索链接', tags: '搜图 图片 壁纸 图库 unsplash pexels',
  fields: [{ k: 'q', label: '关键词', type: 'text', value: '风景', placeholder: '例如：猫 / 极简 / 星空' }],
  run: function (v) {
    var q = (v.q || '').trim() || '风景';
    var enc = encodeURIComponent(q);
    return '<div class="hub-sum">关键词「<b>' + E(q) + '</b>」· 以下均为各图库官方搜索页</div>' +
      linksHTML(IMG_SITES.map(function (s) { return [s[0], s[1], s[2] + enc, 'image']; })) +
      note('链接跳转到各平台官方页面，图片版权归原作者所有，请遵守各站的许可协议。');
  }
});

var GALLERY_SITES = [
  ['CNU 视觉联盟', '视觉艺术与摄影作品精选', 'https://www.cnu.cc/', 'palette'],
  ['Behance', '全球创意设计作品集', 'https://www.behance.net/', 'palette'],
  ['Dribbble', '设计师社区与灵感', 'https://dribbble.com/', 'palette'],
  ['ArtStation', '概念艺术与插画', 'https://www.artstation.com/', 'palette'],
  ['Unsplash', '高质量免费摄影', 'https://unsplash.com/', 'image'],
  ['站酷 ZCOOL', '中文设计互动平台', 'https://www.zcool.com.cn/', 'palette'],
  ['花瓣网', '灵感采集与画板', 'https://huaban.com/', 'palette'],
  ['Wikimedia Commons', '开放共享媒体库', 'https://commons.wikimedia.org/', 'globe']
];
T({ id: 'hub_gallery', name: '视觉艺术导航', cat: 'hub', icon: '画廊',
  desc: 'CNU 视觉联盟等 8 个公开站点入口', tags: 'CNU 视觉 设计 艺术 画廊',
  fields: [{ k: 'g', label: '分组', type: 'select', value: '全部', options: ['全部', '综合视觉', '设计社区', '免费图库'] }],
  auto: true,
  run: function (v) {
    var list = GALLERY_SITES.filter(function (s) {
      if (v.g === '综合视觉') return s[3] === 'palette' || s[3] === 'image';
      if (v.g === '设计社区') return ['Behance', 'Dribbble', 'ArtStation', '站酷 ZCOOL', '花瓣网'].indexOf(s[0]) >= 0;
      if (v.g === '免费图库') return s[3] === 'image' || s[0] === 'Wikimedia Commons';
      return true;
    });
    return '<div class="hub-sum">共 <b>' + list.length + '</b> 个公开站点 · 在系统浏览器中打开</div>' +
      linksHTML(list) + note('仅提供官方网站导航，不抓取、不缓存、不二次分发站点内容。');
  }
});

/* 表情包生成器 */
T({ id: 'hub_meme', name: '表情包制作', cat: 'hub', icon: '表情',
  desc: '本地生成文字表情包，可保存图片', tags: '表情包 斗图 制作 图片',
  custom: function (host, api) {
    host.innerHTML = '<div class="field"><label>顶部文字</label><input class="input" id="mm-top" value="我不想上班"></div>' +
      '<div class="field"><label>底部文字</label><input class="input" id="mm-bot" value="但是我想有钱"></div>' +
      '<div class="field-row"><div class="field"><label>表情</label><select class="input" id="mm-face">' +
      '<option value="calm">面无表情</option><option value="happy">开心</option><option value="cry">流泪</option>' +
      '<option value="angry">生气</option><option value="shock">震惊</option></select></div>' +
      '<div class="field"><label>底色</label><input type="color" id="mm-bg" value="#FAE185"></div></div>' +
      '<div class="btn-row"><button class="btn full" data-mm="go">生成表情包</button>' +
      '<button class="btn tonal full" data-mm="save">保存到相册</button></div>' +
      '<div class="qr-box" id="mm-out"></div>';
    var cv = null;
    function draw() {
      var top = host.querySelector('#mm-top').value, bot = host.querySelector('#mm-bot').value;
      var face = host.querySelector('#mm-face').value, bg = host.querySelector('#mm-bg').value;
      cv = document.createElement('canvas'); cv.width = 600; cv.height = 600;
      var x = cv.getContext('2d');
      x.fillStyle = bg; x.fillRect(0, 0, 600, 600);
      x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.arc(300, 300, 200, 0, 7); x.fill();
      x.strokeStyle = '#3A3428'; x.lineWidth = 9; x.lineCap = 'round';
      x.beginPath(); x.arc(300, 300, 200, 0, 7); x.stroke();
      // 眼睛
      x.fillStyle = '#3A3428';
      x.beginPath(); x.arc(235, 260, 20, 0, 7); x.fill();
      x.beginPath(); x.arc(365, 260, 20, 0, 7); x.fill();
      // 嘴
      x.beginPath(); x.lineWidth = 11;
      if (face === 'happy') x.arc(300, 310, 78, .15 * Math.PI, .85 * Math.PI);
      else if (face === 'cry' || face === 'angry') x.arc(300, 400, 78, 1.15 * Math.PI, 1.85 * Math.PI);
      else if (face === 'shock') { x.arc(300, 360, 34, 0, 7); x.fillStyle = '#3A3428'; x.fill(); }
      else x.moveTo(235, 370), x.lineTo(365, 370);
      x.stroke();
      if (face === 'cry') { x.fillStyle = '#5AA9E6'; x.beginPath(); x.arc(220, 310, 13, 0, 7); x.fill(); }
      if (face === 'angry') {
        x.lineWidth = 9; x.beginPath(); x.moveTo(195, 215); x.lineTo(270, 235);
        x.moveTo(405, 215); x.lineTo(330, 235); x.stroke();
      }
      // 顶部 / 底部文字（自动换行 + 描边）
      function text(t, y) {
        if (!t) return;
        x.font = 'bold 46px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
        var lines = [], line = '';
        for (var i = 0; i < t.length; i++) {
          line += t[i];
          if (x.measureText(line).width > 540) { lines.push(line.slice(0, -1)); line = t[i]; }
        }
        if (line) lines.push(line);
        lines.slice(0, 2).forEach(function (ln, i) {
          var yy = y + (i - (lines.length - 1) / 2) * 54;
          x.lineWidth = 10; x.strokeStyle = 'rgba(255,255,255,.95)'; x.strokeText(ln, 300, yy);
          x.fillStyle = '#2B261C'; x.fillText(ln, 300, yy);
        });
      }
      text(top, 62); text(bot, 545);
      host.querySelector('#mm-out').innerHTML = '';
      host.querySelector('#mm-out').appendChild(cv);
      api.toast('已生成');
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mm]'); if (!b) return;
      if (b.getAttribute('data-mm') === 'go') draw();
      else { if (!cv) draw(); api.download(cv.toDataURL('image/png'), 'ankong-meme.png'); }
    });
    draw();
  }
});

var FITNESS = [
  ['深蹲', '腿 / 臀', '徒手', '双脚与肩同宽，下蹲时膝盖对齐脚尖，臀部向后坐，起身时髋部发力'],
  ['俯卧撑', '胸 / 手臂', '徒手', '身体保持一条直线，下降至胸口贴近地面，推起时肩胛收紧'],
  ['平板支撑', '核心', '徒手', '肘部在肩正下方，收紧腹部与臀部，避免塌腰或撅臀'],
  ['弓步蹲', '腿 / 臀', '徒手', '前后腿均呈 90°，前膝不超过脚尖，躯干保持直立'],
  ['引体向上', '背 / 手臂', '单杠', '起始肩胛下沉，用背部发力拉至上胸触杠，缓慢下放'],
  ['硬拉', '背 / 腿', '杠铃', '髋部铰链前屈，杠铃贴腿上行，全程保持背部中立'],
  ['卧推', '胸 / 手臂', '杠铃', '肩胛后缩下沉，杠铃落至乳头连线，手腕保持中立'],
  ['臀桥', '臀 / 腘绳', '徒手', '仰卧屈膝，脚跟发力顶髋，顶点停顿一秒再下落'],
  ['卷腹', '腹部', '徒手', '下背贴地，用腹部卷起肩胛，不要用脖子发力'],
  ['开合跳', '全身 / 心肺', '徒手', '落地轻缓、膝盖微屈，保持节奏均匀'],
  ['哑铃划船', '背', '哑铃', '躯干前倾约 45°，肘部贴近身体向后拉至腰侧'],
  ['侧平板', '核心 / 腰', '徒手', '肘撑地，髋部上抬，身体成一条直线'],
  ['登山跑', '核心 / 心肺', '徒手', '保持平板姿势，交替提膝向胸口，控制骨盆稳定'],
  ['波比跳', '全身 / 心肺', '徒手', '下蹲—俯撑—俯卧撑—收腿—跳跃，一气呵成'],
  ['提踵', '小腿', '徒手', '前脚掌踩台阶边缘，缓慢下放再充分踮起'],
  ['俄罗斯转体', '腰腹', '徒手', '坐姿后倾，双脚离地，双手随躯干左右转体']
];
T({ id: 'hub_fitness', name: '健身动作库', cat: 'hub', icon: '健身',
  desc: '16 个动作 · 部位 / 器械索引与要领', tags: '健身 训练 动作 增肌 减脂',
  auto: true,
  fields: [
    { k: 'part', label: '部位', type: 'select', value: '全部', options: ['全部', '腿 / 臀', '胸 / 手臂', '背', '核心', '腹部', '全身 / 心肺'] },
    { k: 'tool', label: '器械', type: 'select', value: '全部', options: ['全部', '徒手', '哑铃', '杠铃', '单杠'] }
  ],
  run: function (v) {
    var list = FITNESS.filter(function (f) {
      if (v.part !== '全部' && f[1].indexOf(v.part) < 0) return false;
      if (v.tool !== '全部' && f[2] !== v.tool) return false;
      return true;
    });
    return '<div class="hub-sum">匹配 <b>' + list.length + '</b> 个动作</div>' +
      (list.length ? list.map(function (f) {
        return '<div class="hub-item"><b>' + E(f[0]) + '</b><span class="tag">' + E(f[1]) + ' · ' + E(f[2]) + '</span>' +
          '<p>' + E(f[3]) + '</p></div>';
      }).join('') : '<div class="empty-state">没有匹配的动作</div>') +
      note('动作要领仅供一般性参考，训练前请热身；有伤病请咨询专业教练或医生。');
  }
});

var RECIPES = [
  ['番茄炒蛋', '家常 / 快手', '10 分钟', '番茄 2 个、鸡蛋 3 个、葱花、盐、糖', '鸡蛋打散炒至凝固盛出；番茄切块炒出汁，加少许糖和盐；倒回鸡蛋翻匀，撒葱花出锅。'],
  ['可乐鸡翅', '家常 / 下饭', '30 分钟', '鸡翅 8 个、可乐 1 罐、姜、生抽、料酒', '鸡翅两面划刀焯水；煎至金黄，加姜片、生抽、料酒和可乐没过；大火收汁至浓稠。'],
  ['蒜蓉西兰花', '清淡 / 素菜', '8 分钟', '西兰花 1 颗、蒜 4 瓣、盐、蚝油', '西兰花掰小朵焯水 1 分钟；热油爆香蒜末，下西兰花快炒，加盐与少许蚝油调味。'],
  ['红烧肉', '硬菜 / 宴客', '90 分钟', '五花肉 500g、冰糖、生抽、老抽、八角、姜', '五花肉切块焯水；冰糖炒糖色，下肉块裹色；加调料与热水，小火炖 60 分钟，大火收汁。'],
  ['酸辣土豆丝', '快手 / 下饭', '12 分钟', '土豆 2 个、干辣椒、花椒、醋、盐', '土豆切细丝泡水去淀粉；热油爆香花椒辣椒，下土豆丝大火快炒，沿锅边淋醋，加盐出锅。'],
  ['蛋炒饭', '主食 / 快手', '10 分钟', '隔夜米饭 1 碗、鸡蛋 2 个、葱花、盐', '蛋液炒散盛出；米饭炒至粒粒分明，倒回鸡蛋，加盐和葱花翻匀。'],
  ['紫菜蛋花汤', '汤羹 / 清淡', '8 分钟', '紫菜、鸡蛋 1 个、虾皮、香油', '水开下紫菜与虾皮；淋入蛋液边搅边倒，关火加盐、香油。'],
  ['麻婆豆腐', '川菜 / 下饭', '20 分钟', '嫩豆腐 1 盒、肉末、豆瓣酱、花椒粉、蒜苗', '豆腐切块盐水焯；炒香肉末与豆瓣酱，加水烧开下豆腐，勾芡后撒花椒粉与蒜苗。'],
  ['清蒸鲈鱼', '蒸菜 / 清淡', '20 分钟', '鲈鱼 1 条、姜丝、葱丝、蒸鱼豉油', '鱼身两面划刀，铺姜片水开后蒸 8 分钟；倒掉盘中汁水，铺葱丝淋热油与豉油。'],
  ['青椒肉丝', '家常 / 下饭', '15 分钟', '里脊肉 200g、青椒 2 个、生抽、淀粉', '肉丝用生抽淀粉抓匀；滑炒至变色盛出；青椒丝炒断生，倒回肉丝翻匀调味。'],
  ['凉拌黄瓜', '凉菜 / 快手', '6 分钟', '黄瓜 2 根、蒜、醋、生抽、香油、辣椒油', '黄瓜拍裂切段，加蒜末与所有调料拌匀，冷藏 5 分钟更爽脆。'],
  ['南瓜小米粥', '主食 / 养胃', '35 分钟', '小米 80g、南瓜 200g、水', '小米淘洗后加水煮开，转小火 20 分钟；加南瓜块再煮 10 分钟至软糯。']
];
T({ id: 'hub_recipe', name: '家常菜谱', cat: 'hub', icon: '菜谱',
  desc: '12 道家常菜 · 食材与步骤，支持随机推荐', tags: '菜谱 做菜 食谱 家常菜 做饭',
  auto: true,
  fields: [{ k: 'which', label: '选择菜品', type: 'select', value: 'random',
    options: [['random', '随机来一道']].concat(RECIPES.map(function (r) { return [r[0], r[0]]; })) }],
  run: function (v) {
    var r = v.which === 'random' ? pick(RECIPES) : RECIPES.filter(function (x) { return x[0] === v.which; })[0];
    if (!r) return '没有找到这道菜';
    return '<div class="hub-sum">今天推荐 <b>' + E(r[0]) + '</b> · ' + E(r[1]) + ' · 约 ' + E(r[2]) + '</div>' +
      kvBox([['分类', r[1]], ['耗时', r[2]], ['食材', r[3]]]) +
      '<div class="hub-item"><b>做法</b><p>' + E(r[4]) + '</p></div>' +
      '<div class="btn-row"><button class="btn tonal" data-act="hub-reroll">换一道</button></div>';
  }
});

/* 音效发生器 */
T({ id: 'hub_tone', name: '音效发生器', cat: 'hub', icon: '音效',
  desc: '本机合成音阶 / 提示音，可试听', tags: '音效 音阶 频率 提示音 蜂鸣',
  custom: function (host, api) {
    host.innerHTML = '<div class="field"><label>频率 <span id="tn-v">440</span> Hz</label>' +
      '<input type="range" id="tn-freq" min="80" max="2000" step="1" value="440"></div>' +
      '<div class="field-row"><div class="field"><label>波形</label><select class="input" id="tn-wave">' +
      '<option value="sine">正弦波</option><option value="square">方波</option>' +
      '<option value="triangle">三角波</option><option value="sawtooth">锯齿波</option></select></div>' +
      '<div class="field"><label>时长 (ms)</label><input class="input" type="number" id="tn-dur" value="260"></div></div>' +
      '<div class="hub-sum" style="margin-top:4px">预设旋律</div>' +
      '<div class="hub-presets">' +
      '<button class="chip" data-tn="scale">C 大调音阶</button>' +
      '<button class="chip" data-tn="major">大三和弦</button>' +
      '<button class="chip" data-tn="up">上升提示音</button>' +
      '<button class="chip" data-tn="down">下降提示音</button>' +
      '<button class="chip" data-tn="sos">SOS 摩斯</button>' +
      '<button class="chip" data-tn="hakimi">哈基米小调</button></div>' +
      '<div class="btn-row"><button class="btn full" data-tn="play">播放当前音调</button>' +
      '<button class="btn outline full" data-tn="stop">停止</button></div>' +
      note('由 Web Audio 在本机实时合成，不加载任何音频文件；请勿把音量调得过大。');
    var ctx = null, timers = [];
    function getCtx() {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) { api.toast('当前环境不支持音频合成'); return null; }
      if (!ctx) ctx = new C();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function stop() { timers.forEach(clearTimeout); timers = []; }
    function beep(freq, dur, delay, wave) {
      var c = getCtx(); if (!c) return;
      timers.push(setTimeout(function () {
        var o = c.createOscillator(), g = c.createGain();
        o.type = wave || host.querySelector('#tn-wave').value;
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.18, c.currentTime + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur / 1000);
        o.connect(g); g.connect(c.destination);
        o.start(); o.stop(c.currentTime + dur / 1000 + 0.02);
      }, delay || 0));
    }
    function seq(freqs, dur, gap) {
      stop();
      freqs.forEach(function (f, i) { if (f > 0) beep(f, dur, i * gap); });
    }
    host.addEventListener('input', function (e) {
      if (e.target.id === 'tn-freq') host.querySelector('#tn-v').textContent = e.target.value;
    });
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-tn]'); if (!b) return;
      var k = b.getAttribute('data-tn');
      if (k === 'stop') { stop(); return; }
      if (k === 'play') { stop(); beep(+host.querySelector('#tn-freq').value, +host.querySelector('#tn-dur').value || 260); return; }
      var C4 = 261.63, sc = [C4, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];
      if (k === 'scale') seq(sc, 240, 270);
      else if (k === 'major') seq([C4, 329.63, 392, 523.25], 420, 60);
      else if (k === 'up') seq([440, 554.37, 659.25, 880], 120, 130);
      else if (k === 'down') seq([880, 659.25, 554.37, 440], 120, 130);
      else if (k === 'sos') seq([600, 600, 600, 600, 600, 600, 600, 600, 600], 110, 170);
      else if (k === 'hakimi') seq([392, 440, 493.88, 523.25, 493.88, 440, 392, 329.63], 200, 220);
      api.toast('播放中');
    });
  }
});

var RADIO = [
  ['北京', '中国之声', 'FM 106.1', '新闻'], ['北京', '音乐之声', 'FM 90.0', '音乐'],
  ['北京', '北京交通广播', 'FM 103.9', '交通'], ['上海', '上海新闻广播', 'FM 93.4', '新闻'],
  ['上海', '动感 101', 'FM 101.7', '音乐'], ['上海', '第一财经广播', 'FM 90.9', '财经'],
  ['广州', '广东之声', 'FM 91.4', '新闻'], ['广州', '音乐之声', 'FM 99.3', '音乐'],
  ['深圳', '深圳新闻广播', 'FM 89.8', '新闻'], ['成都', '四川之声', 'FM 98.1', '新闻'],
  ['杭州', '浙江之声', 'FM 88.0', '新闻'], ['南京', '江苏新闻广播', 'FM 93.7', '新闻'],
  ['武汉', '湖北之声', 'FM 104.6', '新闻'], ['西安', '陕西新闻广播', 'FM 101.8', '新闻'],
  ['全国', '中央广播电视总台', '网络收听', '综合'], ['全国', '中国国际广播电台', '网络收听', '综合']
];
T({ id: 'hub_radio', name: '电台频率速查', cat: 'hub', icon: '广播',
  desc: '主要城市 FM 频率与公开台站导航', tags: '广播 电台 FM 频率 收听',
  auto: true,
  fields: [
    { k: 'city', label: '城市', type: 'select', value: '全部',
      options: ['全部'].concat(RADIO.map(function (r) { return r[0]; }).filter(function (x, i, a) { return a.indexOf(x) === i; })) },
    { k: 'kind', label: '类型', type: 'select', value: '全部', options: ['全部', '新闻', '音乐', '交通', '财经', '综合'] }
  ],
  run: function (v) {
    var list = RADIO.filter(function (r) {
      return (v.city === '全部' || r[0] === v.city) && (v.kind === '全部' || r[3] === v.kind);
    });
    return '<div class="hub-sum">共 <b>' + list.length + '</b> 个台站 · 频率可能随地区调整</div>' +
      H.table(['城市', '台站', '频率', '类型'], list.map(function (r) { return [E(r[0]), E(r[1]), E(r[2]), E(r[3])]; })) +
      linksHTML([
        ['央广网', '中央广播电视总台官方收听', 'https://www.cnr.cn/', 'radio'],
        ['云听', '总台官方音频客户端', 'https://www.radio.cn/', 'radio'],
        ['中国广播', '公开电台在线目录', 'https://www.cnr.cn/radio/', 'radio']
      ]) + note('仅提供频率资料与官方网站入口，不转播、不抓取任何广播流。');
  }
});

/* ================= 二、玩机 ================= */

T({ id: 'hub_blog', name: '玩机博客导航', cat: 'hub', icon: '博客',
  desc: '极客 / 安卓技术站点聚合入口', tags: '玩机 博客 技术 安卓 社区',
  auto: true,
  fields: [{ k: 'g', label: '方向', type: 'select', value: '全部', options: ['全部', '安卓开发', '极客社区', '折腾玩机'] }],
  run: function (v) {
    var all = [
      ['Android Developers', '官方开发者文档与最佳实践', 'https://developer.android.com/', '安卓开发', 'code'],
      ['Android Open Source Project', 'AOSP 官方源码与文档', 'https://source.android.com/', '安卓开发', 'code'],
      ['Google Developers Blog', '官方技术博客', 'https://developers.googleblog.com/', '安卓开发', 'code'],
      ['XDA Developers', '老牌安卓玩机与刷机社区', 'https://www.xda-developers.com/', '折腾玩机', 'bug'],
      ['酷安', '中文应用与玩机社区', 'https://www.coolapk.com/', '折腾玩机', 'phone'],
      ['少数派', '效率工具与数字生活', 'https://sspai.com/', '极客社区', 'book'],
      ['V2EX', '技术创意社区', 'https://www.v2ex.com/', '极客社区', 'globe'],
      ['GitHub', '开源项目托管', 'https://github.com/', '极客社区', 'code'],
      ['LineageOS', '知名第三方 ROM 项目', 'https://lineageos.org/', '折腾玩机', 'download'],
      ['F-Droid', '开源安卓应用仓库', 'https://f-droid.org/', '折腾玩机', 'cube']
    ];
    var list = all.filter(function (x) { return v.g === '全部' || x[3] === v.g; });
    return '<div class="hub-sum">共 <b>' + list.length + '</b> 个站点</div>' +
      linksHTML(list.map(function (x) { return [x[0], x[1], x[2], x[4]]; }));
  }
});

T({ id: 'hub_rom', name: '固件下载导航', cat: 'hub', icon: '固件',
  desc: '官方固件入口与刷机风险须知', tags: '小米 ROM 刷机 固件 MIUI HyperOS',
  auto: true,
  fields: [{ k: 'brand', label: '品牌 / 项目', type: 'select', value: '全部',
    options: ['全部', '小米 / Redmi / POCO', 'Google Pixel', 'LineageOS', '其他开源项目'] }],
  run: function (v) {
    var all = [
      ['小米社区 / 系统更新', 'MIUI / HyperOS 官方固件与更新说明', 'https://www.miui.com/', '小米 / Redmi / POCO', 'download'],
      ['小米官网服务支持', '官方售后与系统资源', 'https://www.mi.com/service/', '小米 / Redmi / POCO', 'phone'],
      ['Google Factory Images', 'Pixel 官方工厂镜像', 'https://developers.google.com/android/images', 'Google Pixel', 'download'],
      ['Google OTA 更新', 'Pixel 官方 OTA 包', 'https://developers.google.com/android/ota', 'Google Pixel', 'download'],
      ['LineageOS Downloads', 'LineageOS 官方构建下载', 'https://download.lineageos.org/', 'LineageOS', 'download'],
      ['LineageOS Wiki', '机型安装与升级指引', 'https://wiki.lineageos.org/', 'LineageOS', 'book'],
      ['GrapheneOS', '隐私向开源 ROM 官方发布页', 'https://grapheneos.org/releases', '其他开源项目', 'shield'],
      ['CalyxOS', '隐私向开源 ROM 官方下载', 'https://calyxos.org/install/', '其他开源项目', 'shield']
    ];
    var list = all.filter(function (x) { return v.brand === '全部' || x[3] === v.brand; });
    return '<div class="hub-sum">共 <b>' + list.length + '</b> 个官方入口</div>' +
      linksHTML(list.map(function (x) { return [x[0], x[1], x[2], x[4]]; })) +
      '<div class="hub-warn"><b>刷机前必读</b><p>务必核对机型代号与区域版本；刷机会清除数据并可能失去保修；请提前完整备份，使用官方渠道镜像，电量保持 50% 以上。因刷机导致的设备损坏，本应用不承担责任。</p></div>' +
      note('本工具仅提供官方站点导航，不托管、不分发任何固件文件。');
  }
});

var SYS_KEYS = [
  ['wifi', 'WLAN 设置', 'wifi'], ['bluetooth', '蓝牙设置', 'phone'],
  ['display', '显示设置', 'eye'], ['sound', '声音设置', 'volume'],
  ['apps', '应用管理', 'grid'], ['dev', '开发者选项', 'gear'],
  ['battery', '电池设置', 'battery'], ['storage', '存储设置', 'database'],
  ['access', '无障碍设置', 'person'], ['date', '日期与时间', 'clock'],
  ['locale', '语言与输入法', 'translate'], ['about', '关于手机', 'device'],
  ['appinfo', '本应用详情页', 'info'], ['webview', 'WebView 设置', 'code']
];
T({ id: 'hub_syssettings', name: '隐启设置', cat: 'hub', icon: '系统',
  desc: '安卓原生隐藏设置页一键直达', tags: '隐藏设置 系统设置 开发者选项 玩机',
  custom: function (host, api) {
    host.innerHTML = '<div class="hub-sum">点击任意项，直接打开系统对应的原生设置页</div>' +
      '<div class="hub-sysgrid">' + SYS_KEYS.map(function (s) {
        return '<button class="hub-sys" data-act="hub-sys" data-key="' + s[0] + '">' +
          '<span class="hs-ic">' + akIcon(s[2]) + '</span><b>' + E(s[1]) + '</b></button>';
      }).join('') + '</div>' +
      note('需要「安空工具箱」安卓客户端；网页版受浏览器沙箱限制，无法拉起系统设置页。');
  }
});

T({ id: 'hub_appsearch', name: '应用搜索', cat: 'hub', icon: '应用',
  desc: '一次生成多个应用商店的搜索链接', tags: '应用搜索 商店 下载 apk',
  fields: [{ k: 'q', label: '应用名称', type: 'text', value: '安空工具箱', placeholder: '输入应用名' }],
  run: function (v) {
    var q = (v.q || '').trim() || '工具箱', e = encodeURIComponent(q);
    return '<div class="hub-sum">「<b>' + E(q) + '</b>」· 均为官方商店搜索页</div>' +
      linksHTML([
        ['酷安', '中文应用社区搜索', 'https://www.coolapk.com/search?q=' + e, 'search'],
        ['应用宝', '腾讯应用商店搜索', 'https://sj.qq.com/search?kw=' + e, 'search'],
        ['华为应用市场', '官方应用市场搜索', 'https://appgallery.huawei.com/search/' + e, 'search'],
        ['小米应用商店', '官方应用商店', 'https://app.mi.com/search?keywords=' + e, 'search'],
        ['Google Play', '官方应用商店搜索', 'https://play.google.com/store/search?q=' + e + '&c=apps', 'search'],
        ['F-Droid', '开源应用仓库搜索', 'https://search.f-droid.org/?q=' + e, 'cube']
      ]) + note('仅生成官方搜索链接，不提供任何应用的安装包或修改版 APK。');
  }
});

T({ id: 'hub_openapk', name: '开源应用导航', cat: 'hub', icon: '开源',
  desc: 'F-Droid / GitHub / AOSP 等开源资源', tags: 'OpenAPK 开源 F-Droid GitHub 应用',
  auto: true,
  fields: [{ k: 'g', label: '类型', type: 'select', value: '全部', options: ['全部', '应用仓库', '源码托管', '系统源码'] }],
  run: function (v) {
    var all = [
      ['F-Droid', '完全开源的安卓应用仓库', 'https://f-droid.org/', '应用仓库', 'cube'],
      ['IzzyOnDroid', '开源应用附加仓库', 'https://apt.izzysoft.de/fdroid/', '应用仓库', 'cube'],
      ['OpenAPK', '开源应用目录', 'https://www.openapk.net/', '应用仓库', 'cube'],
      ['GitHub · Android Topic', '按主题浏览安卓开源项目', 'https://github.com/topics/android', '源码托管', 'code'],
      ['GitLab · Android', 'GitLab 上的安卓开源项目', 'https://gitlab.com/search?search=android', '源码托管', 'code'],
      ['Codeberg', '欧洲非营利代码托管', 'https://codeberg.org/', '源码托管', 'code'],
      ['AOSP', '安卓开源项目官方源码', 'https://source.android.com/', '系统源码', 'code'],
      ['Android Code Search', '官方源码在线检索', 'https://cs.android.com/', '系统源码', 'search']
    ];
    var list = all.filter(function (x) { return v.g === '全部' || x[3] === v.g; });
    return '<div class="hub-sum">共 <b>' + list.length + '</b> 个开源资源入口</div>' +
      linksHTML(list.map(function (x) { return [x[0], x[1], x[2], x[4]]; })) +
      note('本工具只做导航，第三方站点的可用性与内容由各站点自行负责。');
  }
});

/* ================= 三、链接解析 ================= */

/* BV / av 互转：B 站公开算法，纯整数实现，兼容旧 WebView */
var BV_A = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf';
var BV_XOR = 23442827791579, BV_MASK = 2251799813685247, BV_MAX = 2251799813685248, BV_P = 4294967296;
function bvXor(a, b) {
  var ah = Math.floor(a / BV_P), al = a - ah * BV_P, bh = Math.floor(b / BV_P), bl = b - bh * BV_P;
  return ((ah ^ bh) >>> 0) * BV_P + ((al ^ bl) >>> 0);
}
function bvAnd(a, b) {
  var ah = Math.floor(a / BV_P), al = a - ah * BV_P, bh = Math.floor(b / BV_P), bl = b - bh * BV_P;
  return ((ah & bh) >>> 0) * BV_P + ((al & bl) >>> 0);
}
function av2bv(aid) {
  var b = ['B', 'V', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0'], i = 11;
  var t = bvXor(BV_MAX + Number(aid), BV_XOR), x;
  while (t > 0) { b[i] = BV_A.charAt(t % 58); t = Math.floor(t / 58); i--; }
  x = b[3]; b[3] = b[9]; b[9] = x; x = b[4]; b[4] = b[7]; b[7] = x;
  return b.join('');
}
function bv2av(bv) {
  var b = String(bv).trim().split(''); if (b.length !== 12) return null;
  var x = b[3]; b[3] = b[9]; b[9] = x; x = b[4]; b[4] = b[7]; b[7] = x;
  var t = 0;
  for (var i = 3; i < 12; i++) { var k = BV_A.indexOf(b[i]); if (k < 0) return null; t = t * 58 + k; }
  return bvXor(bvAnd(t, BV_MASK), BV_XOR);
}
T({ id: 'hub_bili', name: 'BV / av 号互转', cat: 'hub', icon: 'B站',
  desc: 'B 站视频编号互转与分 P 链接生成', tags: 'bilibili B站 BV av 解析 视频',
  fields: [
    { k: 'text', label: 'BV 号 / av 号 / 视频链接', type: 'text', value: 'BV17x411w7KC', placeholder: '例如 BV17x411w7KC 或 av170001' },
    { k: 'p', label: '生成分 P 数', type: 'number', value: '3' }
  ],
  run: function (v) {
    var s = String(v.text || '').trim(), bv = '', av = null;
    var mb = s.match(/BV[0-9A-Za-z]{10}/);
    var ma = s.match(/(?:^|\/)av(\d+)/i) || s.match(/[?&]aid=(\d+)/);
    if (mb) { bv = mb[0]; av = bv2av(bv); }
    else if (ma) { av = +ma[1]; bv = av2bv(av); }
    else if (/^\d+$/.test(s)) { av = +s; bv = av2bv(av); }
    else if (/^BV[0-9A-Za-z]{10}$/.test(s)) { bv = s; av = bv2av(bv); }
    if (!bv || av == null || !isFinite(av) || av < 1) return '无法识别：请输入 BV 号（12 位）或 av 号（纯数字）';
    var n = Math.max(1, Math.min(50, +v.p || 3));
    var plinks = [];
    for (var i = 1; i <= n; i++) plinks.push('https://www.bilibili.com/video/' + bv + '?p=' + i);
    return '<div class="hub-sum">识别成功</div>' + kvBox([
      ['BV 号', bv], ['av 号', 'av' + av],
      ['标准页面', 'https://www.bilibili.com/video/' + bv],
      ['短链接', 'https://b23.tv/' + bv]
    ]) + '<div class="hub-item"><b>分 P 链接（' + n + ' 条）</b><p>' +
      plinks.map(function (u) { return E(u); }).join('<br>') + '</p></div>' +
      '<div class="btn-row"><button class="btn tonal" data-act="copy-text" data-copy="' + E(plinks.join('\n')) + '">复制分 P 链接</button></div>' +
      note('仅做编号换算与官方页面链接生成，不解析、不下载视频内容。');
  }
});

/* 解析 1：追踪参数清洗 */
T({ id: 'hub_p1', name: '链接参数清洗', cat: 'hub', icon: '解析',
  desc: '去除 utm / spm / 分享追踪参数', tags: '解析 链接 清洗 utm 追踪 参数',
  fields: [{ k: 'text', label: '原始链接', type: 'textarea', rows: 4,
    value: 'https://example.com/item?id=123&utm_source=share&spm=a1z&from=timeline&fbclid=abc', placeholder: '粘贴带追踪参数的链接' }],
  run: function (v) {
    var re = /^(utm_|spm|from$|fbclid|gclid|gbraid|wbraid|igshid|mc_cid|mc_eid|ref$|ref_src|share_|__|_ga|msclkid|yclid|ttclid|si$|feature$|timestamp$)/i;
    var out = String(v.text || '').trim().split(/\s+/).filter(Boolean).map(function (u) {
      try {
        var q = u.indexOf('?'); if (q < 0) return u;
        var base = u.slice(0, q), parts = u.slice(q + 1).split('#'), hash = parts.length > 1 ? '#' + parts.slice(1).join('#') : '';
        var keep = parts[0].split('&').filter(function (p) { return p && !re.test(p.split('=')[0]); });
        return base + (keep.length ? '?' + keep.join('&') : '') + hash;
      } catch (e) { return u; }
    });
    return '<div class="hub-sum">已清洗 <b>' + out.length + '</b> 条链接</div>' +
      '<div class="hub-code">' + E(out.join('\n')) + '</div>' +
      '<div class="btn-row"><button class="btn tonal" data-act="copy-text" data-copy="' + E(out.join('\n')) + '">复制结果</button></div>';
  }
});

/* 解析 2：批量链接提取 */
T({ id: 'hub_p2', name: '批量链接提取', cat: 'hub', icon: '解析',
  desc: '从任意文本里提取全部 http(s) 链接', tags: '解析 提取 链接 网址 批量',
  fields: [{ k: 'text', label: '待解析文本', type: 'textarea', rows: 5,
    value: '推荐两个站点：https://example.com/a 和 http://test.org/b?q=1\n还有 <a href="https://a.cn/x">链接</a>', placeholder: '粘贴含链接的文本' }],
  run: function (v) {
    var m = String(v.text || '').match(/https?:\/\/[^\s<>"'`）】]+/g) || [];
    var clean = m.map(function (u) { return u.replace(/[.,;，。；!！?？]+$/, ''); });
    var uniq = clean.filter(function (u, i) { return clean.indexOf(u) === i; });
    return '<div class="hub-sum">提取 <b>' + clean.length + '</b> 条，去重后 <b>' + uniq.length + '</b> 条</div>' +
      (uniq.length ? '<div class="hub-code">' + E(uniq.join('\n')) + '</div>' : '<div class="empty-state">未发现链接</div>') +
      '<div class="btn-row"><button class="btn tonal" data-act="copy-text" data-copy="' + E(uniq.join('\n')) + '">复制全部</button></div>';
  }
});

/* 解析 3：图片直链提取 */
T({ id: 'hub_p3', name: '图片直链提取', cat: 'hub', icon: '解析',
  desc: '提取文本 / HTML 中的图片文件地址', tags: '解析 图片 直链 提取 img src',
  fields: [{ k: 'text', label: '待解析内容', type: 'textarea', rows: 5,
    value: '<img src="https://a.com/p.jpg"> 还有 https://b.com/q.png?w=200\n以及 https://c.com/photo.webp', placeholder: '粘贴 HTML 或含图片链接的文本' }],
  run: function (v) {
    var s = String(v.text || '');
    var m = s.match(/https?:\/\/[^\s<>"'`]+?\.(?:jpe?g|png|gif|webp|bmp|svg|avif)(?:\?[^\s<>"'`]*)?/gi) || [];
    var uniq = m.filter(function (u, i) { return m.indexOf(u) === i; });
    return '<div class="hub-sum">找到 <b>' + uniq.length + '</b> 个图片地址</div>' +
      (uniq.length ? '<div class="hub-code">' + E(uniq.join('\n')) + '</div>' : '<div class="empty-state">未发现图片直链</div>') +
      '<div class="btn-row"><button class="btn tonal" data-act="copy-text" data-copy="' + E(uniq.join('\n')) + '">复制地址</button></div>' +
      note('仅做字符串提取，不会自动请求或下载图片。');
  }
});

/* 解析 4：短链服务识别 */
var SHORT_DOMAINS = {
  't.cn': '新浪微博短链', 'url.cn': '腾讯短链', 'dwz.cn': '百度短链', 'm.tb.cn': '淘宝短链',
  'u.jd.com': '京东短链', 'b23.tv': '哔哩哔哩短链', 'bit.ly': 'Bitly', 'tinyurl.com': 'TinyURL',
  'goo.gl': 'Google 短链（已停用）', 'is.gd': 'is.gd', 's.id': 's.id',
  'suo.im': '缩小网址', 'mrw.so': '摩尔短链', 'mtl.tt': '麦拓短链', 'w.url.cn': '微信短链',
  't.co': 'X / Twitter 短链', 'youtu.be': 'YouTube 短链', 'suo.nz': 'suo.nz', 'qcn.tw': 'qcn.tw'
};
T({ id: 'hub_p4', name: '短链服务识别', cat: 'hub', icon: '解析',
  desc: '识别 20+ 种短链服务并给出处理建议', tags: '解析 短链 短网址 识别 展开',
  fields: [{ k: 'text', label: '短链接', type: 'textarea', rows: 3,
    value: 'https://b23.tv/BV17x411w7KC\nhttps://t.cn/A6xxxxx', placeholder: '每行一个短链接' }],
  run: function (v) {
    var list = String(v.text || '').split(/\s+/).filter(Boolean);
    var rows = list.map(function (u) {
      var m = u.match(/^https?:\/\/([^\/?#]+)/i), host = m ? m[1].toLowerCase() : '—';
      return [E(host), E(SHORT_DOMAINS[host] || '未收录的短链 / 普通域名'),
        E(SHORT_DOMAINS[host] ? '在系统浏览器打开即可跳转' : '检查是否为正常网址')];
    });
    return '<div class="hub-sum">识别 <b>' + list.length + '</b> 条</div>' +
      H.table(['域名', '服务识别', '建议'], rows) +
      note('出于隐私与离线考虑，本工具不主动请求短链目标；请自行在系统浏览器中打开确认。');
  }
});

/* 解析 5：分享口令提取 */
T({ id: 'hub_p5', name: '分享口令提取', cat: 'hub', icon: '解析',
  desc: '从分享文案中提取链接与各类口令', tags: '解析 口令 淘口令 分享 文案 提取',
  fields: [{ k: 'text', label: '分享文案', type: 'textarea', rows: 5,
    value: '【超值好物】复制这行话￥ABC123xyz￥打开App\n链接 https://m.tb.cn/h.abc?utm_source=share #好物推荐#', placeholder: '粘贴分享文案' }],
  run: function (v) {
    var s = String(v.text || '');
    var urls = s.match(/https?:\/\/[^\s<>"'`）】]+/g) || [];
    var tokens = s.match(/[¥$￥][A-Za-z0-9]{6,}[¥$￥]?/g) || [];
    var brackets = s.match(/【[^】]{2,30}】/g) || [];
    var tags = s.match(/#[^#\s]{1,20}#/g) || [];
    return '<div class="hub-sum">提取结果</div>' + kvBox([
      ['链接', urls.length ? E(urls.join('  ')) : '无'],
      ['口令码', tokens.length ? E(tokens.join('  ')) : '无'],
      ['标题文案', brackets.length ? E(brackets.join('  ')) : '无'],
      ['话题标签', tags.length ? E(tags.join('  ')) : '无']
    ]) + '<div class="btn-row"><button class="btn tonal" data-act="copy-text" data-copy="' +
      E(urls.concat(tokens).join('\n')) + '">复制链接与口令</button></div>' +
      note('纯文本提取，不会打开、不会跳转到任何外部 App。');
  }
});

/* 解析 6：磁力链接解析 */
T({ id: 'hub_p6', name: '磁力链接解析', cat: 'hub', icon: '解析',
  desc: '解析 magnet 链接的 infohash / 名称 / tracker', tags: '解析 磁力 magnet btih tracker',
  fields: [{ k: 'text', label: 'magnet 链接', type: 'textarea', rows: 4,
    value: 'magnet:?xt=urn:btih:1A2B3C4D5E6F708192A3B4C5D6E7F8091A2B3C4D&dn=示例文件&tr=udp://tracker.example.com:1337', placeholder: '粘贴 magnet:?xt=urn:btih:...' }],
  run: function (v) {
    var s = String(v.text || '').trim();
    if (s.indexOf('magnet:') !== 0) return '不是有效的 magnet 链接';
    var q = s.slice(s.indexOf('?') + 1), parts = q.split('&'), rows = [], trackers = [], hash = '', dn = '';
    parts.forEach(function (p) {
      var i = p.indexOf('='), k = i < 0 ? p : p.slice(0, i), val = i < 0 ? '' : p.slice(i + 1);
      try { val = decodeURIComponent(val.replace(/\+/g, ' ')); } catch (e) {}
      if (k === 'xt' && /urn:btih:/i.test(val)) { hash = val.replace(/^urn:btih:/i, ''); rows.push(['infohash', E(hash)]); }
      else if (k === 'dn') { dn = val; rows.push(['文件名', E(val)]); }
      else if (k === 'tr') trackers.push(val);
      else if (k === 'xl') rows.push(['文件大小', E(val) + ' 字节']);
      else rows.push([E(k), E(val)]);
    });
    rows.push(['hash 类型', hash.length === 40 ? 'SHA-1 (40 位十六进制)' : hash.length === 32 ? 'Base32 (32 位)' : '未知 / 非常规']);
    return '<div class="hub-sum">' + (dn ? '「' + E(dn) + '」' : '磁力链接') + ' · <b>' + trackers.length + '</b> 个 Tracker</div>' +
      kvBox(rows) + (trackers.length ? '<div class="hub-item"><b>Tracker 列表</b><p>' + E(trackers.join('\n')).replace(/\n/g, '<br>') + '</p></div>' : '') +
      note('仅解析链接中的文本参数，不连接网络、不下载任何内容；请遵守所在地法律法规与版权要求。');
  }
});

/* 解析 7：视频页链接规范化 */
T({ id: 'hub_p7', name: '视频链接规范化', cat: 'hub', icon: '解析',
  desc: '把短链 / 分享页还原为标准视频页地址', tags: '解析 视频 链接 规范化 b23 短链',
  fields: [{ k: 'text', label: '视频链接或分享文本', type: 'textarea', rows: 3,
    value: 'https://b23.tv/BV17x411w7KC?share_source=copy_web', placeholder: '粘贴视频链接' }],
  run: function (v) {
    var s = String(v.text || '');
    var bv = (s.match(/BV[0-9A-Za-z]{10}/) || [])[0];
    var av = (s.match(/(?:^|\/)av(\d+)/i) || [])[1];
    var mid = (s.match(/[?&]mid=(\d+)/) || [])[1];
    var rows = [];
    if (bv) {
      rows.push(['平台', '哔哩哔哩']); rows.push(['BV 号', bv]);
      rows.push(['av 号', 'av' + bv2av(bv)]);
      rows.push(['标准页', 'https://www.bilibili.com/video/' + bv]);
      rows.push(['短链', 'https://b23.tv/' + bv]);
    } else if (av) {
      rows.push(['平台', '哔哩哔哩（av 号）']); rows.push(['BV 号', av2bv(+av)]);
      rows.push(['标准页', 'https://www.bilibili.com/video/av' + av]);
    } else if (mid) {
      rows.push(['平台', '微博 / 其他']); rows.push(['ID', mid]);
    } else {
      var u = (s.match(/https?:\/\/[^\s<>"'`]+/) || [])[0] || '';
      if (!u) return '未识别到链接或视频编号';
      try {
        var a = document.createElement('a'); a.href = u;
        rows.push(['域名', a.hostname]); rows.push(['路径', a.pathname]);
        rows.push(['规范化', a.protocol + '//' + a.hostname + a.pathname]);
      } catch (e) { rows.push(['原始', E(u)]); }
    }
    return '<div class="hub-sum">规范化结果</div>' + kvBox(rows.map(function (r) { return [r[0], r[1]]; })) +
      note('只做链接字符串还原，不抓取页面内容、不解析视频流。');
  }
});

/* 解析 8：链接去重分类 */
T({ id: 'hub_p8', name: '链接去重分类', cat: 'hub', icon: '解析',
  desc: '批量去重并按域名归类统计', tags: '解析 去重 分类 域名 批量链接',
  fields: [{ k: 'text', label: '链接列表（每行一个）', type: 'textarea', rows: 5,
    value: 'https://a.com/1\nhttps://b.com/2\nhttps://a.com/3\nhttps://a.com/1', placeholder: '每行一个链接' }],
  run: function (v) {
    var all = (String(v.text || '').match(/https?:\/\/[^\s<>"'`]+/g) || []);
    var uniq = all.filter(function (u, i) { return all.indexOf(u) === i; }), groups = {};
    uniq.forEach(function (u) {
      var h = (u.match(/^https?:\/\/([^\/?#]+)/i) || [])[1] || '未知';
      (groups[h] = groups[h] || []).push(u);
    });
    var keys = Object.keys(groups).sort(function (a, b) { return groups[b].length - groups[a].length; });
    return '<div class="hub-sum">原始 <b>' + all.length + '</b> 条 → 去重 <b>' + uniq.length + '</b> 条 · <b>' + keys.length + '</b> 个域名</div>' +
      H.table(['域名', '条数', '示例'], keys.map(function (k) { return [E(k), groups[k].length, E(groups[k][0].slice(0, 42))]; })) +
      '<div class="btn-row"><button class="btn tonal" data-act="copy-text" data-copy="' + E(uniq.join('\n')) + '">复制去重结果</button></div>';
  }
});

/* 解析 9：URL 编解码 */
T({ id: 'hub_p9', name: 'URL 编解码', cat: 'hub', icon: '解析',
  desc: '编码 / 解码并列出全部查询参数', tags: '解析 url 编码 解码 参数 query',
  auto: true,
  fields: [
    { k: 'text', label: '内容', type: 'textarea', rows: 3, value: 'https://example.com/s?q=安空 工具箱&page=1', placeholder: 'URL 或待编码文本' },
    { k: 'mode', label: '操作', type: 'select', value: 'decode', options: [['parse', '解析链接结构'], ['encode', '编码为 percent'], ['decode', '解码 percent']] }
  ],
  run: function (v) {
    var s = String(v.text || '');
    if (v.mode === 'encode') return '<div class="hub-sum">编码结果</div><div class="hub-code">' + E(encodeURIComponent(s)) + '</div>';
    if (v.mode === 'decode') {
      var d; try { d = decodeURIComponent(s); } catch (e) { return '解码失败：' + e.message; }
      return '<div class="hub-sum">解码结果</div><div class="hub-code">' + E(d) + '</div>';
    }
    var rows = [], q = s.indexOf('?'), hash = s.indexOf('#');
    var base = q >= 0 ? s.slice(0, q) : (hash >= 0 ? s.slice(0, hash) : s);
    rows.push(['协议', E((s.match(/^([a-z]+):\/\//i) || [])[1] || '—')]);
    rows.push(['主机', E((s.match(/^https?:\/\/([^\/?#]+)/i) || [])[1] || '—')]);
    rows.push(['路径', E(base.replace(/^[a-z]+:\/\/[^/]+/i, '') || '/')]);
    if (q >= 0) {
      var qs = s.slice(q + 1).split('#')[0];
      qs.split('&').forEach(function (p) {
        if (!p) return;
        var i = p.indexOf('='), k = i < 0 ? p : p.slice(0, i), val = i < 0 ? '' : p.slice(i + 1);
        try { k = decodeURIComponent(k); val = decodeURIComponent(val.replace(/\+/g, ' ')); } catch (e) {}
        rows.push(['参数 · ' + E(k), E(val)]);
      });
    }
    if (hash >= 0) rows.push(['锚点', E(s.slice(hash + 1))]);
    return '<div class="hub-sum">链接结构</div>' + kvBox(rows);
  }
});

/* 解析 10：链接转二维码 */
T({ id: 'hub_p10', name: '批量链接转二维码', cat: 'hub', icon: '解析',
  desc: '为多个链接一次生成二维码，可逐个保存', tags: '解析 二维码 链接 批量 qrcode',
  custom: function (host, api) {
    host.innerHTML = '<div class="field"><label>链接列表（每行一个）</label>' +
      '<textarea class="input" id="bq-text" rows="4">https://example.com\nhttps://www.bilibili.com</textarea></div>' +
      '<div class="btn-row"><button class="btn full" data-bq="go">生成二维码</button></div>' +
      '<div class="hub-qrgrid" id="bq-out"></div>';
    function build() {
      var list = host.querySelector('#bq-text').value.split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 12);
      var out = host.querySelector('#bq-out'); out.innerHTML = '';
      if (typeof qrcode === 'undefined') { out.innerHTML = '<div class="note">二维码组件未加载</div>'; return; }
      list.forEach(function (text, idx) {
        try {
          if (qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
          var qr = qrcode(0, 'M'); qr.addData(text, 'Byte'); qr.make();
          var n = qr.getModuleCount(), cell = 5, quiet = 4, px = (n + quiet * 2) * cell;
          var cv = document.createElement('canvas'); cv.width = px; cv.height = px;
          var c = cv.getContext('2d');
          c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, px, px); c.fillStyle = '#2B261C';
          for (var r = 0; r < n; r++) for (var col = 0; col < n; col++)
            if (qr.isDark(r, col)) c.fillRect((col + quiet) * cell, (r + quiet) * cell, cell, cell);
          var wrap = document.createElement('div'); wrap.className = 'hub-qr';
          wrap.appendChild(cv);
          var cap = document.createElement('div'); cap.className = 'hq-cap'; cap.textContent = text.length > 26 ? text.slice(0, 25) + '…' : text;
          wrap.appendChild(cap);
          var btn = document.createElement('button'); btn.className = 'btn sm outline'; btn.textContent = '保存';
          btn.setAttribute('data-bq-save', String(idx));
          btn.addEventListener('click', function () { api.download(cv.toDataURL('image/png'), 'ankong-qr-' + (idx + 1) + '.png'); });
          wrap.appendChild(btn); out.appendChild(wrap);
        } catch (e) { /* 单个失败不影响其它 */ }
      });
      api.toast('已生成 ' + list.length + ' 个二维码');
    }
    host.addEventListener('click', function (e) { if (e.target.closest('[data-bq="go"]')) build(); });
    build();
  }
});

/* 解析 11：链接安全自查 */
T({ id: 'hub_p11', name: '链接安全自查', cat: 'hub', icon: '解析',
  desc: '检查可疑字符、短链、IP 直连等风险点', tags: '解析 安全 链接 钓鱼 风险 检测',
  fields: [{ k: 'text', label: '待检查链接', type: 'textarea', rows: 3,
    value: 'https://example.com/path?next=http://other.com', placeholder: '粘贴需要检查的链接' }],
  run: function (v) {
    var u = String(v.text || '').trim();
    if (!u) return '请输入链接';
    var risks = [], score = 100;
    if (/^(javascript|data|vbscript|file):/i.test(u)) { risks.push('使用了危险协议，可能被用于执行脚本'); score -= 60; }
    if (!/^https:\/\//i.test(u)) { risks.push('未使用 HTTPS，传输内容可能被窃听或篡改'); score -= 20; }
    if (u.indexOf('@') >= 0 && u.indexOf('://') >= 0) { risks.push('包含 @ 符号，可能伪装真实域名'); score -= 25; }
    if (/^https?:\/\/\d{1,3}(\.\d{1,3}){3}/i.test(u)) { risks.push('直接使用 IP 地址访问，缺少域名身份校验'); score -= 20; }
    var host = (u.match(/^https?:\/\/([^\/?#@]+)/i) || [])[1] || '';
    if (SHORT_DOMAINS[host.toLowerCase()]) { risks.push('短链接（' + SHORT_DOMAINS[host.toLowerCase()] + '），无法直接看到最终目标'); score -= 15; }
    if (host.split('.').length > 4) { risks.push('子域名层级过多，注意仿冒域名'); score -= 10; }
    if (/xn--/i.test(host)) { risks.push('包含 punycode，可能是形近字域名'); score -= 10; }
    if (u.length > 300) { risks.push('链接异常长，可能隐藏了额外参数'); score -= 10; }
    if (/(login|verify|account|secure|bank|pay|update)[-._]/i.test(u)) { risks.push('路径含登录 / 验证 / 支付类关键词，请核对域名是否为官方'); score -= 10; }
    if (/[?&](redirect|next|url|return|goto)=https?:/i.test(u)) { risks.push('包含开放式跳转参数，可能被用于跳到第三方站点'); score -= 15; }
    score = Math.max(0, Math.min(100, score));
    var level = score >= 80 ? '低风险' : score >= 50 ? '需留意' : '高风险';
    return '<div class="hub-sum">评分 <b>' + score + '/100</b> · ' + level + '</div>' +
      kvBox([['域名', E(host || '—')], ['协议', E((u.match(/^([a-z]+):/i) || [])[1] || '—')],
        ['长度', u.length + ' 字符'], ['风险项', risks.length + ' 条']]) +
      (risks.length ? '<div class="hub-item"><b>发现的问题</b><p>' + risks.map(function (r, i) { return (i + 1) + '. ' + E(r); }).join('<br>') + '</p></div>'
        : '<div class="hub-item"><b>未发现明显风险</b><p>仍请确认域名拼写与来源可信，不要在不明页面输入密码。</p></div>') +
      note('启发式文本检查，不能替代专业安全检测；不会访问该链接，也不保证判断绝对准确。');
  }
});

})();
