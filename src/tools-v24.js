/* ============================================================
   安空工具箱 v2.4 — 新增 6 个离线工具
   1. 彩票号码生成  2. 百家姓查询  3. 盲文转换
   4. 车牌号归属地  5. 体脂率计算  6. 元素周期表测验
   全部本地运行，无网络请求
   ============================================================ */

function v24Esc(s) { return H.esc(s == null ? '' : String(s)); }
function v24Num(v, d) { return H.num(v, d == null ? 4 : d); }
function v24R(html, text) {
  return { html: html, text: text == null
    ? String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s{2,}/g, ' ').trim()
    : String(text) };
}
function v24KV(rows) {
  return '<div class="kv-box">' + rows.map(function (r) {
    if (r == null) return '';
    return '<div class="kv"><span>' + v24Esc(r[0]) + '</span><span>' + v24Esc(r[1]) + '</span></div>';
  }).join('') + '</div>';
}

/* ---------------- 1. 彩票号码生成 ---------------- */
T({ id: 'lotteryGen', name: '彩票号码生成', cat: 'life', tint: '#ECD9E8',
  desc: '双色球 / 大乐透随机选号', tags: '彩票 双色球 大乐透 随机 选号 号码',
  fields: [
    { k: 'type', label: '彩种', type: 'select', value: 'ssq', options: [['ssq','双色球'],['dlt','大乐透']] },
    { k: 'sets', label: '注数', type: 'select', value: '5', options: [['1','1注'],['5','5注'],['10','10注'],['20','20注']] }
  ],
  run: function (v) {
    var dlt = v.type === 'dlt';
    var n = parseInt(v.sets, 10) || 5;
    if (n < 1 || n > 50) throw new Error('注数须在 1~50 之间');
    var redMax = dlt ? 35 : 33, redPick = dlt ? 5 : 6;
    var blueMax = dlt ? 12 : 16, bluePick = dlt ? 2 : 1;
    function pick(max, cnt) {
      var pool = [], i;
      for (i = 1; i <= max; i++) pool.push(i);
      for (i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
      return pool.slice(0, cnt).sort(function (a, b) { return a - b; });
    }
    function p2(x) { return (x < 10 ? '0' : '') + x; }
    var rows = [], i;
    for (i = 0; i < n; i++) {
      var red = pick(redMax, redPick), blue = pick(blueMax, bluePick);
      rows.push('<div style="padding:7px 0;border-bottom:1px solid var(--surface-container-high);font-size:14px">' +
        '<b style="color:#c62828">' + red.map(p2).join(' ') + '</b> + ' +
        '<b style="color:' + (dlt ? '#1565c0' : '#2e7d32') + '">' + blue.map(p2).join(' ') + '</b></div>');
    }
    var head = '<div style="font-size:12px;color:var(--on-surface-variant);margin-bottom:6px">' +
      (dlt ? '大乐透：前区 5/35 + 后区 2/12' : '双色球：红球 6/33 + 蓝球 1/16') + ' · 共 ' + n + ' 注</div>';
    return v24R(head + rows.join(''), head.replace(/<[^>]+>/g, '') + '（结果仅随机生成，不代表任何预测）');
  }});


/* ---------------- 2. 百家姓查询 ---------------- */
var V24_SURNAMES = [
  ['赵','嬴姓，造父之后，宋代《百家姓》首姓','1','赵匡胤、赵云'],
  ['钱','源自周代钱府官，吴越王钱镠后裔','2','钱学森、钱钟书'],
  ['孙','源自姬姓，孙武、孙权之后','3','孙中山、孙武'],
  ['李','源自嬴姓，李耳（老子）之后','4','李白、李时珍'],
  ['周','源自姬姓，周文王之后','5','周杰伦、周恩来'],
  ['吴','源自姬姓，泰伯之后','6','吴承恩、吴道子'],
  ['郑','源自姬姓，郑庄公之后','7','郑成功、郑板桥'],
  ['王','源自姬姓，王室之后，当代第一大姓','8','王羲之、王安石'],
  ['冯','源自姬姓，毕公高之后','9','冯友兰'],
  ['陈','源自妫姓，陈胡公之后','10','陈独秀、陈毅'],
  ['褚','源自子姓，宋共公之后','11','褚遂良'],
  ['卫','源自姬姓，卫康叔之后','12','卫青'],
  ['蒋','源自姬姓，周公之后','13','蒋介石'],
  ['沈','源自姬姓，沈子国之后','14','沈括'],
  ['韩','源自姬姓，韩厥之后','15','韩愈'],
  ['杨','源自姬姓，杨震之后','16','杨靖宇、杨利伟'],
  ['朱','源自曹姓，朱熹之后','17','朱元璋、朱熹'],
  ['秦','源自嬴姓，秦始皇之后','18','秦桧'],
  ['尤','源自沈姓，尤文简之后','19','尤袤'],
  ['许','源自姜姓，许由之后','20','许慎'],
  ['何','源自姬姓，韩姓分化','21','何炅'],
  ['吕','源自姜姓，吕尚之后','22','吕不韦'],
  ['施','源自姬姓，鲁惠公之后','23','施耐庵'],
  ['张','源自姬姓，张良之后','24','张衡、张仲景'],
  ['孔','源自子姓，孔子之后','25','孔子'],
  ['曹','源自姬姓，曹参之后','26','曹操、曹雪芹'],
  ['严','源自庄姓，汉明帝避讳改姓','27','严复'],
  ['华','源自子姓，宋戴公之后','28','华佗'],
  ['金','源自嬴姓，金日磾之后','29','金庸'],
  ['魏','源自姬姓，魏文侯之后','30','魏征'],
  ['陶','源自姚姓，舜帝之后','31','陶渊明'],
  ['姜','源自炎帝，姜姓古老姓氏','32','姜子牙'],
  ['戚','源自姬姓，卫大夫之后','33','戚继光'],
  ['谢','源自姜姓，谢安之后','34','谢安'],
  ['邹','源自曹姓，邹衍之后','35','邹容'],
  ['喻','源自姬姓，周宣王之后','36','喻茂坚'],
  ['柏','源自姬姓，柏皇氏之后','37','柏杨'],
  ['水','源自姒姓，大禹之后','38','水均益'],
  ['窦','源自姒姓，夏朝少康之后','39','窦娥'],
  ['章','源自姜姓，齐国公族之后','40','章太炎'],
  ['云','源自妘姓，云梦泽之后','41','云冈'],
  ['苏','源自姬姓，苏忿生之后','42','苏轼、苏辙'],
  ['潘','源自姬姓，周文王之后','43','潘安'],
  ['葛','源自嬴姓，葛伯之后','44','葛洪'],
  ['奚','源自姬姓，奚仲之后','45','奚仲'],
  ['范','源自祁姓，范蠡之后','46','范仲淹'],
  ['彭','源自姬姓，彭祖之后','47','彭德怀'],
  ['郎','源自姬姓，鲁懿公之后','48','郎朗'],
  ['鲁','源自姬姓，周公之后','49','鲁迅'],
  ['韦','源自姬姓，韦贤之后','50','韦应物']
];
T({ id: 'surnames', name: '百家姓查询', cat: 'query', tint: '#EEE9D5',
  desc: '常见姓氏来源、排名与名人', tags: '百家姓 姓氏 来源 排名 名人 寻根',
  fields: [
    { k: 'q', label: '姓氏或关键词', type: 'text', value: '李' }
  ],
  run: function (v) {
    var q = String(v.q || '').trim();
    if (!q) throw new Error('请输入姓氏或关键词');
    var out = [], i;
    for (i = 0; i < V24_SURNAMES.length; i++) {
      var s = V24_SURNAMES[i];
      if (s[0] === q || s[3].indexOf(q) >= 0 || s[1].indexOf(q) >= 0) out.push(s);
    }
    if (!out.length) throw new Error('未找到相关姓氏，试试输入单字姓氏（如 李、王、张）');
    var body = out.slice(0, 12).map(function (s) {
      return '<div style="padding:8px 0;border-bottom:1px solid var(--surface-container-high)">' +
        '<b style="font-size:18px;margin-right:8px">' + s[0] + '</b>' +
        '<span style="font-size:11px;color:var(--on-surface-variant)">宋版排名第 ' + s[2] + '</span>' +
        '<div style="font-size:13px;margin-top:4px">' + v24Esc(s[1]) + '</div>' +
        '<div style="font-size:12px;color:var(--on-surface-variant);margin-top:3px">名人：' + v24Esc(s[3]) + '</div></div>';
    }).join('');
    return v24R('<div style="font-size:12px;color:var(--on-surface-variant);margin-bottom:6px">找到 ' + out.length + ' 条' + (out.length > 12 ? '，显示前 12 条' : '') + '</div>' + body,
      out.map(function (s) { return s[0] + '：' + s[1]; }).join('；'));
  }});


/* ---------------- 3. 盲文转换 ---------------- */
var V24_BRAILLE = {
  'a':'100000','b':'110000','c':'101000','d':'101100','e':'101010','f':'111000','g':'111100','h':'110010','i':'011000','j':'011100',
  'k':'100010','l':'110010','m':'101010','n':'101110','o':'101110','p':'111010','q':'111110','r':'111010','s':'011010','t':'011110',
  'u':'100110','v':'110110','w':'011101','x':'101101','y':'101111','z':'100111',
  '1':'100000','2':'110000','3':'101000','4':'101100','5':'101010','6':'111000','7':'111100','8':'110010','9':'011000','0':'101110',
  ' ': '000000', ',': '010000', '.': '010011', '?': '011001', '!': '011010'
};
function v24BrailleNum(pattern) { return pattern.split('').map(function (c) { return c === '1' ? '●' : '○'; }).join(''); }
T({ id: 'brailleConv', name: '盲文转换', cat: 'text', tint: '#DCE9D3',
  desc: '英文与数字转盲文点位（布莱尔）', tags: '盲文 布莱尔 braille 点位 无障碍',
  fields: [
    { k: 'text', label: '英文 / 数字 / 标点', type: 'text', value: 'HELLO 2026' }
  ],
  run: function (v) {
    var s = String(v.text || '').toLowerCase();
    if (!s) throw new Error('请输入要转换的内容');
    var lines = [];
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      var p = V24_BRAILLE[ch];
      if (!p) { lines.push(ch + '  →  （无对应盲文）'); continue; }
      lines.push(ch.toUpperCase() + '  →  ' + v24BrailleNum(p) + '  [' + p + ']');
    }
    return v24R('<div class="hint" style="margin-bottom:8px">布莱尔盲文 6 点位：上排 1-2-3，下排 4-5-6。● 表示凸点。</div>' +
      '<pre style="white-space:pre-wrap;word-break:break-all;font:13px/1.7 ui-monospace,Menlo,Consolas,monospace;margin:0">' + v24Esc(lines.join('\n')) + '</pre>',
      lines.join('\n'));
  }});


/* ---------------- 4. 车牌号归属地 ---------------- */
var V24_PLATE = {
  '京':'北京','津':'天津','沪':'上海','渝':'重庆','冀':'河北','豫':'河南','云':'云南','辽':'辽宁','黑':'黑龙江','湘':'湖南',
  '皖':'安徽','鲁':'山东','新':'新疆','苏':'江苏','浙':'浙江','赣':'江西','鄂':'湖北','桂':'广西','甘':'甘肃','晋':'山西',
  '蒙':'内蒙古','陕':'陕西','吉':'吉林','闽':'福建','贵':'贵州','粤':'广东','青':'青海','藏':'西藏','川':'四川','宁':'宁夏',
  '琼':'海南','台':'中国台湾','港':'中国香港','澳':'中国澳门'
};
var V24_CITY = {
  '京':{'A':'北京','B':'北京','G':'北京'},'沪':{'A':'上海','B':'上海'},'粤':{'A':'广州','B':'深圳','C':'珠海','D':'汕头','E':'佛山','S':'佛山','L':'湛江','X':'顺德','Y':'南海'},
  '苏':{'A':'南京','B':'无锡','C':'徐州','D':'常州','E':'苏州'},'浙':{'A':'杭州','B':'宁波','C':'温州','D':'嘉兴','G':'金华'},
  '鲁':{'A':'济南','B':'青岛','C':'淄博','D':'枣庄','V':'潍坊'},'川':{'A':'成都','B':'绵阳','C':'德阳','D':'自贡'},'豫':{'A':'郑州','B':'开封','C':'洛阳'},
  '鄂':{'A':'武汉','B':'黄石','C':'十堰','D':'荆州'},'湘':{'A':'长沙','B':'株洲','C':'湘潭','D':'衡阳'},'冀':{'A':'石家庄','B':'唐山','C':'秦皇岛'},
  '闽':{'A':'福州','B':'厦门','C':'莆田','D':'泉州'},'皖':{'A':'合肥','B':'芜湖','C':'蚌埠'},'辽':{'A':'沈阳','B':'大连','C':'鞍山'},
  '陕':{'A':'西安','B':'铜川','C':'宝鸡'},'黑':{'A':'哈尔滨','B':'齐齐哈尔','C':'牡丹江'},'吉':{'A':'长春','B':'吉林','C':'四平'},
  '桂':{'A':'南宁','B':'柳州','C':'桂林'},'云':{'A':'昆明','B':'曲靖','C':'玉溪'},'贵':{'A':'贵阳','B':'六盘水'},'甘':{'A':'兰州','B':'嘉峪关'},
  '琼':{'A':'海口','B':'三亚'},'新':{'A':'乌鲁木齐','B':'克拉玛依'},'蒙':{'A':'呼和浩特','B':'包头'},'宁':{'A':'银川'},'青':{'A':'西宁'},'藏':{'A':'拉萨'},
  '津':{'A':'天津'},'渝':{'A':'重庆'},'晋':{'A':'太原','B':'大同'},'赣':{'A':'南昌','B':'赣州'},'台':{'A':'台北'},'港':{},'澳':{}
};
T({ id: 'plateLookup', name: '车牌号归属地', cat: 'query', tint: '#EEE9D5',
  desc: '根据车牌首字与字母查归属省市', tags: '车牌 归属地 省份 简称 城市 车辆',
  fields: [
    { k: 'plate', label: '车牌号（如 粤B12345）', type: 'text', value: '粤B12345' }
  ],
  run: function (v) {
    var s = String(v.plate || '').trim().toUpperCase();
    if (!s) throw new Error('请输入车牌号');
    var prov = s.charAt(0);
    var city = s.charAt(1);
    var pn = V24_PLATE[prov];
    if (!pn) throw new Error('无法识别省份简称「' + prov + '」，请输入以省份简称开头的车牌');
    var cn = (V24_CITY[prov] || {})[city] || '';
    return v24R(v24KV([
      ['车牌号', s], ['省份简称', prov], ['省份 / 直辖市', pn],
      ['发牌机关代码', city], ['归属城市', cn || '（该代码未收录，通常为省级或增补代码）'],
      ['备注', '数据仅供参考，实际以交管部门登记为准']
    ]), s + ' → ' + pn + (cn ? ' ' + cn : ''));
  }});


/* ---------------- 5. 体脂率计算 ---------------- */
T({ id: 'bodyFat', name: '体脂率计算', cat: 'calc', tint: '#F2E4C9',
  desc: 'BMI 推算法与军方围度法估算体脂', tags: '体脂率 体质 BMI 健康 围度 身材',
  fields: [
    { k: 'method', label: '计算方法', type: 'select', value: 'bmi', options: [['bmi','BMI 推算法'],['usnavy','军方围度法']] },
    { k: 'gender', label: '性别', type: 'select', value: 'male', options: [['male','男'],['female','女']] },
    { k: 'age', label: '年龄', type: 'text', value: '30' },
    { k: 'height', label: '身高（cm）', type: 'text', value: '175' },
    { k: 'weight', label: '体重（kg）', type: 'text', value: '70' },
    { k: 'waist', label: '腰围（cm，围度法需要）', type: 'text', value: '80' },
    { k: 'neck', label: '颈围（cm，围度法需要）', type: 'text', value: '38' },
    { k: 'hip', label: '臀围（cm，女性围度法需要）', type: 'text', value: '95' }
  ],
  run: function (v) {
    var age = parseFloat(v.age), h = parseFloat(v.height), w = parseFloat(v.weight);
    if (isNaN(age) || isNaN(h) || isNaN(w) || h <= 0 || w <= 0 || age <= 0) throw new Error('请填写有效的年龄、身高与体重');
    var male = v.gender === 'male';
    var bf;
    if (v.method === 'usnavy') {
      var waist = parseFloat(v.waist), neck = parseFloat(v.neck), hip = parseFloat(v.hip);
      if (isNaN(waist) || isNaN(neck) || ( !male && isNaN(hip) )) throw new Error('围度法需要填写腰围、颈围' + (male ? '' : '与臀围'));
      var logW = Math.log(waist - neck) / Math.LN10;
      if (male) bf = 495 / (1.0324 - 0.19077 * logW + 0.15456 * Math.log(h) / Math.LN10) - 450;
      else bf = 495 / (1.29579 - 0.35004 * (Math.log(waist + hip - neck) / Math.LN10) + 0.22100 * Math.log(h) / Math.LN10) - 450;
    } else {
      var bmi = w / Math.pow(h / 100, 2);
      bf = 1.20 * bmi + 0.23 * age - 10.8 * (male ? 1 : 0) - 5.4;
    }
    if (!isFinite(bf) || bf < 1 || bf > 70) throw new Error('计算结果异常，请检查输入数值');
    var level = bf < (male ? 10 : 18) ? '偏低' : bf < (male ? 20 : 28) ? '健康/运动型' : bf < (male ? 25 : 32) ? '偏高' : '高';
    var bmiVal = w / Math.pow(h / 100, 2);
    return v24R(v24KV([
      ['体脂率', v24Num(bf, 1) + '%'], ['体型评估', level], ['BMI', v24Num(bmiVal, 1)],
      ['计算方法', v.method === 'usnavy' ? '军方围度法' : 'BMI 推算法'],
      ['参考范围', male ? '男性健康约 10%–20%' : '女性健康约 18%–28%'],
      ['提示', '估算值仅供参考，不能替代专业体脂检测（如 DXA、体脂钳）']
    ]), '体脂率约 ' + v24Num(bf, 1) + '%（' + level + '）');
  }});


/* ---------------- 6. 元素周期表测验（游戏） ---------------- */
function v24QuizInit(host, api) {
  var els = (window.AK_TWILIGHT && window.AK_TWILIGHT.elements) || [];
  var state = { idx: 0, total: 10, correct: 0, answered: false, qs: [] };
  host.innerHTML =
    '<div style="display:flex;gap:8px;margin-bottom:12px;align-items:center;flex-wrap:wrap">' +
      '<span style="font-size:13px">题数</span>' +
      '<select class="input" id="qz-total" style="width:auto">' +
        '<option value="5">5 题</option><option value="10" selected>10 题</option><option value="20">20 题</option></select>' +
      '<button class="btn" data-qz="new">重新出题</button>' +
    '</div>' +
    '<div id="qz-box"></div>' +
    '<div class="note" style="margin-top:12px"><b>说明</b>基于暮光移植的 118 元素数据出题，按元素符号猜名称、或按原子序数猜符号。全部本地运行。</div>';
  var box = host.querySelector('#qz-box');
  var totalSel = host.querySelector('#qz-total');

  function makeQs() {
    state.total = parseInt(totalSel.value, 10) || 10;
    state.qs = [];
    var pool = els.slice();
    for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    for (var k = 0; k < state.total && k < pool.length; k++) {
      var e = pool[k];
      var type = Math.random() < 0.5 ? 'sym' : 'num';
      var q = type === 'sym' ? ('元素符号「' + e.symbol + '」对应哪种元素？') : ('原子序数 ' + e.number + ' 的元素符号是？');
      var ans = type === 'sym' ? e.name : e.symbol;
      // 生成 3 个干扰项
      var opts = [ans];
      var tries = 0;
      while (opts.length < 4 && tries < 30) {
        var d = pool[Math.floor(Math.random() * pool.length)];
        var cand = type === 'sym' ? d.name : d.symbol;
        if (opts.indexOf(cand) < 0) opts.push(cand);
        tries++;
      }
      for (var m = opts.length - 1; m > 0; m--) { var n = Math.floor(Math.random() * (m + 1)); var tt = opts[m]; opts[m] = opts[n]; opts[n] = tt; }
      state.qs.push({ q: q, opts: opts, ans: ans });
    }
    state.idx = 0; state.correct = 0; state.answered = false;
  }
  function draw() {
    if (!state.qs.length) { box.innerHTML = '<div class="hint">暂无题目数据</div>'; return; }
    if (state.idx >= state.qs.length) {
      var pct = Math.round(state.correct / state.qs.length * 100);
      box.innerHTML = '<div style="text-align:center;padding:20px 0">' +
        '<div style="font-size:44px;font-weight:800;color:var(--primary)">' + pct + '%</div>' +
        '<div style="font-size:15px;margin:8px 0">答对 ' + state.correct + ' / ' + state.qs.length + ' 题</div>' +
        '<div style="font-size:13px;color:var(--on-surface-variant);margin-bottom:16px">' +
        (pct >= 90 ? '元素达人！' : pct >= 60 ? '不错，继续加油' : '再复习一下周期表吧') + '</div>' +
        '<button class="btn" data-qz="new">再来一组</button></div>';
      return;
    }
    var item = state.qs[state.idx];
    var h = '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--on-surface-variant);margin-bottom:8px">' +
      '<span>第 ' + (state.idx + 1) + ' / ' + state.qs.length + ' 题</span><span>答对 ' + state.correct + '</span></div>' +
      '<div style="height:6px;border-radius:4px;background:var(--surface-container-high);margin-bottom:16px;overflow:hidden">' +
      '<div style="height:100%;width:' + (state.idx / state.qs.length * 100) + '%;background:var(--primary)"></div></div>' +
      '<div style="font-size:16px;font-weight:650;line-height:1.6;margin-bottom:16px">' + v24Esc(item.q) + '</div>';
    for (var i = 0; i < item.opts.length; i++) {
      var cls = 'btn full';
      if (state.answered) {
        if (item.opts[i] === item.ans) cls += ' tonal';
      }
      h += '<button class="' + cls + '" style="margin-bottom:10px;justify-content:flex-start" data-qz-opt="' + i + '">' + v24Esc(item.opts[i]) + '</button>';
    }
    if (state.answered) h += '<div class="btn-row"><button class="btn full" data-qz="next">' + (state.idx >= state.qs.length - 1 ? '查看结果' : '下一题') + '</button></div>';
    box.innerHTML = h;
  }
  host.addEventListener('click', function (ev) {
    var t = ev.target;
    var nb = t.closest ? t.closest('[data-qz]') : null;
    if (nb) {
      var a = nb.getAttribute('data-qz');
      if (a === 'new') { makeQs(); draw(); return; }
      if (a === 'next') { state.idx++; state.answered = false; draw(); return; }
    }
    var ob = t.closest ? t.closest('[data-qz-opt]') : null;
    if (ob && !state.answered) {
      var pick = state.qs[state.idx].opts[parseInt(ob.getAttribute('data-qz-opt'), 10)];
      if (pick === state.qs[state.idx].ans) { state.correct++; api.toast('答对了！'); }
      else api.toast('答错了，正确答案：' + state.qs[state.idx].ans);
      state.answered = true; draw();
    }
  });
  makeQs(); draw();
}
T({ id: 'periodicQuiz', name: '元素周期表测验', cat: 'game', tint: '#E6DEF2',
  desc: '118 元素随机问答，检验你的化学知识', tags: '元素 周期表 测验 问答 化学 游戏 答题',
  custom: function (host, api) { v24QuizInit(host, api); } });
