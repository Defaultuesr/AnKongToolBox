/* ============================================================
   安空工具箱 — v1.7 工具包（三）27~40
   生活 5 · 媒体 3 · 设备测评 4 · 小游戏 2
   纯离线、ES5 兼容写法
   ============================================================ */
(function () {
'use strict';

function esc(s) { return H.esc(s == null ? '' : String(s)); }
function KV(rows) {
  return '<div class="kv-box">' + rows.map(function (r) {
    return '<div class="kv"><span>' + esc(r[0]) + '</span><span>' + r[1] + '</span></div>';
  }).join('') + '</div>';
}
function TB(head, rows) {
  return H.table(head, rows.map(function (r) {
    return r.map(function (c) { return esc(c); });
  }));
}
function PRE(s) {
  return '<pre style="white-space:pre-wrap;word-break:break-all;font:12.5px/1.7 ui-monospace,Menlo,Consolas,monospace;margin:0;padding:2px 0">' + esc(s) + '</pre>';
}
function SEC(t) { return '<div class="sec-label" style="margin-top:14px">' + esc(t) + '</div>'; }
function HINT(t) { return '<div class="hint" style="margin-top:10px">' + esc(t) + '</div>'; }
function num(v, d) { return H.num(v, d == null ? 4 : d); }
function lines(s) { return String(s || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n'); }
function pnum(v, d) { var n = parseFloat(v); return isFinite(n) ? n : (d || 0); }
function rnd(n, d) { var p = Math.pow(10, d == null ? 2 : d); return Math.round(n * p) / p; }
function money(n) { return (Math.round(n * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

/* ============================================================
   五、生活（5）
   ============================================================ */

/* 27. 社保公积金估算 */
T({ id: 'socialins', name: '社保公积金缴纳估算', cat: 'life',
  desc: '按缴费基数与比例估算个人 / 单位每月五险一金缴纳额与到手工资',
  tags: '社保 五险一金 公积金 缴费基数 到手工资 个税 比例 估算',
  fields: [
    { k: 'salary', label: '税前月薪（元）', type: 'number', value: 12000 },
    { k: 'base', label: '缴费基数（0 = 同月薪）', type: 'number', value: 0 },
    { k: 'pension', label: '养老个人比例 %', type: 'number', value: 8 },
    { k: 'medical', label: '医疗个人比例 %', type: 'number', value: 2 },
    { k: 'unemploy', label: '失业个人比例 %', type: 'number', value: 0.5 },
    { k: 'fund', label: '公积金个人比例 %', type: 'number', value: 12 },
    { k: 'fundSame', label: '单位公积金同比例', type: 'switch', value: true },
    { k: 'unitRate', label: '单位合计比例 %（养老+医疗+失业+工伤）', type: 'number', value: 27 }
  ],
  run: function (v) {
    var s = pnum(v.salary), b = pnum(v.base) > 0 ? pnum(v.base) : s;
    if (s <= 0) return HINT('请输入大于 0 的税前月薪。');
    var pe = pnum(v.pension), me = pnum(v.medical), ue = pnum(v.unemploy), fu = pnum(v.fund), ur = pnum(v.unitRate);
    var pp = b * pe / 100, mp = b * me / 100, up = b * ue / 100, fp = b * fu / 100;
    var personal = pp + mp + up + fp;
    var unitIns = b * ur / 100, unitFund = v.fundSame ? fp : b * fu / 100;
    var taxable = s - personal;
    // 简化累计预扣：按月应纳税所得额 × 税率 − 速算扣除数（示意）
    var t = Math.max(0, taxable - 5000), tax = 0;
    var brackets = [[3000, 0.03, 0], [12000, 0.10, 210], [25000, 0.20, 1410], [35000, 0.25, 2660],
                    [55000, 0.30, 4410], [80000, 0.35, 7160], [Infinity, 0.45, 15160]];
    for (var i = 0; i < brackets.length; i++) if (t <= brackets[i][0]) { tax = Math.max(0, t * brackets[i][1] - brackets[i][2]); break; }
    var net = taxable - tax;
    return SEC('缴费明细（基数 ' + money(b) + ' 元）') + TB(['项目', '比例', '个人', '单位'], [
      ['养老保险', pe + '%', money(pp), '—'], ['医疗保险', me + '%', money(mp), '—'],
      ['失业保险', ue + '%', money(up), '—'], ['住房公积金', fu + '%', money(fp), money(unitFund)],
      ['单位社保合计', ur + '%', '—', money(unitIns)]
    ]) + SEC('工资构成') + KV([
      ['税前月薪', money(s) + ' 元'], ['五险一金个人合计', money(personal) + ' 元'],
      ['应纳税所得额（扣 5000 起征）', money(Math.max(0, taxable - 5000)) + ' 元'],
      ['个人所得税（按月示意）', money(tax) + ' 元'],
      ['预计到手工资', money(net) + ' 元'],
      ['单位用工总成本', money(s + unitIns + unitFund) + ' 元'],
      ['个人缴纳占税前比例', rnd(personal / s * 100, 2) + ' %']
    ]) + HINT('比例与基数上限因城市、年度政策而异，请以当地社保局公布数据为准；个税此处按单月简化示意，实际为累计预扣法，全年汇算清缴。');
  }
});

/* 28. 信用卡循环利息 */
T({ id: 'creditcard', name: '信用卡最低还款与循环利息', cat: 'life',
  desc: '对比一次性还清与最低还款的利息成本，估算还清所需月数',
  tags: '信用卡 最低还款 循环利息 账单 分期 日息 复利 还款',
  fields: [
    { k: 'bill', label: '本期账单（元）', type: 'number', value: 10000 },
    { k: 'minRate', label: '最低还款比例 %', type: 'number', value: 10 },
    { k: 'daily', label: '日利率（万分之几）', type: 'number', value: 5 },
    { k: 'monthly', label: '每月固定还款额（0 = 只还最低）', type: 'number', value: 0 },
    { k: 'mode', label: '计息方式', type: 'select', value: 'full', options: [
      ['full', '全额罚息（未还清按账单全额计息）'], ['part', '余额计息（仅对未还部分计息）'] ] }
  ],
  run: function (v) {
    var bill = pnum(v.bill), mr = pnum(v.minRate) / 100, dr = pnum(v.daily) / 10000, pay = pnum(v.monthly);
    if (bill <= 0 || dr <= 0) return HINT('请输入大于 0 的账单金额与日利率。');
    var minPay = bill * mr, first = Math.max(minPay, pay || minPay);
    var rate = dr * 30;
    var interest1 = (v.mode === 'full' ? bill : (bill - first)) * rate;
    var bal = bill - first + interest1, months = 1, totalInt = interest1, rows = [], guard = 0;
    rows.push([1, money(first), money(interest1), money(bal)]);
    while (bal > 0.01 && months < 120 && guard++ < 120) {
      months++;
      var due = Math.max(bal * mr, pay || (bal * mr));
      if (due > bal) due = bal;
      var it = (v.mode === 'full' ? Math.max(bal, bill * 0 + bal) : bal - due) * rate;
      if (v.mode === 'full') it = bal * rate;
      bal = bal - due + it; totalInt += it;
      if (months <= 12 || months % 6 === 0) rows.push([months, money(due), money(it), money(Math.max(0, bal))]);
      if (bal < 0) bal = 0;
    }
    var extra = totalInt;
    return SEC('首月对比') + KV([
      ['账单金额', money(bill) + ' 元'], ['最低还款额', money(minPay) + ' 元'],
      ['折合月利率', rnd(rate * 100, 3) + ' %（日息 ' + rnd(dr * 10000, 2) + '‱）'],
      ['折合年化（单利）', rnd(rate * 12 * 100, 2) + ' %'],
      ['一次性还清总支出', money(bill) + ' 元'],
      ['最低还款首月利息', money(interest1) + ' 元']
    ]) + SEC('逐月还款推演（每月 ' + (pay > 0 ? '固定 ' + money(pay) + ' 元' : '按最低比例') + '）') +
      TB(['月份', '当月还款', '当月利息', '剩余欠款'], rows) +
      SEC('结论') + KV([
        ['预计还清月数', months >= 120 ? '超过 120 个月' : months + ' 个月'],
        ['累计利息', money(extra) + ' 元'],
        ['利息占账单比例', rnd(extra / bill * 100, 2) + ' %'],
        ['总计支出', money(bill + extra) + ' 元']
      ]) + HINT('循环利息通常按日计息、按月计复利，年化可达 18% 以上；全额罚息指未全额还清时对整笔账单计息（部分银行已改为余额计息）。此结果为示意估算。');
  }
});

/* 29. 洗涤符号速查 */
T({ id: 'laundry', name: '洗涤护理符号速查', cat: 'life',
  desc: '按洗涤、漂白、干燥、熨烫、专业护理五类查询服装标签符号含义',
  tags: '洗涤 洗衣 标签 符号 护理 水温 熨烫 干洗 漂白 速查',
  fields: [
    { k: 'type', label: '符号类别', type: 'select', value: 'all', options: [
      ['all', '全部'], ['wash', '洗涤'], ['bleach', '漂白'], ['dry', '干燥'], ['iron', '熨烫'], ['pro', '专业护理'] ] },
    { k: 'q', label: '关键词筛选（可选）', type: 'text', value: '' }
  ],
  run: function (v) {
    var D = [
      ['wash', '洗涤', '水盆', '可水洗'],
      ['wash', '洗涤', '水盆 30 / 40 / 50 / 60', '数字表示最高水洗温度（℃）'],
      ['wash', '洗涤', '水盆 + 手', '仅手洗，最高 40℃'],
      ['wash', '洗涤', '水盆 + 一条横线', '缓和洗涤（轻柔程序）'],
      ['wash', '洗涤', '水盆 + 两条横线', '非常缓和洗涤'],
      ['wash', '洗涤', '水盆打叉', '不可水洗'],
      ['bleach', '漂白', '空心三角形', '允许任何漂白剂'],
      ['bleach', '漂白', '三角形 + CL + 两斜线', '仅允许氧漂 / 非氯漂'],
      ['bleach', '漂白', '实心三角打叉', '不可漂白'],
      ['dry', '干燥', '正方形 + 圆圈', '可转笼烘干'],
      ['dry', '干燥', '圆圈内 1 / 2 / 3 点', '低温 60℃ / 中温 80℃ / 高温 110℃'],
      ['dry', '干燥', '正方形 + 圆圈打叉', '不可转笼烘干'],
      ['dry', '干燥', '正方形内一条竖线', '悬挂晾干'],
      ['dry', '干燥', '正方形内一条横线', '平摊晾干'],
      ['dry', '干燥', '正方形内左上角两条斜线', '阴凉处晾干（避免阳光直晒）'],
      ['iron', '熨烫', '熨斗', '可熨烫'],
      ['iron', '熨烫', '熨斗内 1 / 2 / 3 点', '底板最高 110℃ / 150℃ / 200℃'],
      ['iron', '熨烫', '熨斗打叉', '不可熨烫'],
      ['iron', '熨烫', '熨斗下加两条横线（蒸汽）', '可蒸汽熨烫'],
      ['pro', '专业护理', '圆圈', '可专业干洗'],
      ['pro', '专业护理', '圆圈内 P / F', '四氯乙烯干洗 / 碳氢溶剂干洗'],
      ['pro', '专业护理', '圆圈内 W', '专业湿洗'],
      ['pro', '专业护理', '圆圈打叉', '不可干洗'],
      ['pro', '专业护理', '圆圈下 / 内加横线', '缓和 / 非常缓和护理']
    ];
    var t = String(v.type || 'all'), q = String(v.q || '').trim();
    var rows = D.filter(function (r) {
      return (t === 'all' || r[0] === t) && (!q || (r[1] + r[2] + r[3]).indexOf(q) >= 0);
    }).map(function (r) { return [r[1], r[2], r[3]]; });
    return SEC('符号对照（' + rows.length + ' 条）') + TB(['类别', '符号 / 标记', '含义'], rows) +
      HINT('依据 ISO 3758 / GINETEX 护理标识体系整理。符号下方的横线越多表示处理越缓和，打叉表示禁止该项操作。');
  }
});

/* 30. 营养成分 NRV */
T({ id: 'nutrition', name: '营养成分 NRV 解读', cat: 'life',
  desc: '按每 100 g / 每份含量计算营养素参考值百分比并给出膳食提示',
  tags: '营养 成分表 NRV 参考值 热量 蛋白质 脂肪 钠 糖 食品标签',
  fields: [
    { k: 'per', label: '标注单位', type: 'select', value: '100', options: [
      ['100', '每 100 g / 100 mL'], ['serv', '每份'] ] },
    { k: 'serving', label: '每份重量 g（仅「每份」时）', type: 'number', value: 30 },
    { k: 'energy', label: '能量 kJ', type: 'number', value: 1800 },
    { k: 'protein', label: '蛋白质 g', type: 'number', value: 8 },
    { k: 'fat', label: '脂肪 g', type: 'number', value: 18 },
    { k: 'satfat', label: '饱和脂肪 g', type: 'number', value: 6 },
    { k: 'carb', label: '碳水化合物 g', type: 'number', value: 55 },
    { k: 'sugar', label: '糖 g', type: 'number', value: 22 },
    { k: 'sodium', label: '钠 mg', type: 'number', value: 420 },
    { k: 'fiber', label: '膳食纤维 g', type: 'number', value: 3 }
  ],
  run: function (v) {
    var NRV = { energy: 8400, protein: 60, fat: 60, satfat: 20, carb: 300, sodium: 2000, fiber: 25 };
    var LBL = { energy: '能量 (kJ)', protein: '蛋白质 (g)', fat: '脂肪 (g)', satfat: '饱和脂肪 (g)',
      carb: '碳水化合物 (g)', sugar: '糖 (g)', sodium: '钠 (mg)', fiber: '膳食纤维 (g)' };
    var isServ = v.per === 'serv', sv = pnum(v.serving, 30) || 30;
    var scale = isServ ? 100 / sv : 1;
    var vals = { energy: pnum(v.energy), protein: pnum(v.protein), fat: pnum(v.fat), satfat: pnum(v.satfat),
      carb: pnum(v.carb), sugar: pnum(v.sugar), sodium: pnum(v.sodium), fiber: pnum(v.fiber) };
    var rows = [], k, hints = [];
    for (k in vals) if (Object.prototype.hasOwnProperty.call(vals, k)) {
      var p100 = vals[k] * scale, pct = NRV[k] ? p100 / NRV[k] * 100 : null;
      rows.push([LBL[k], num(vals[k], 2), k === 'sugar' ? '—' : (pct == null ? '—' : num(p100, 1) + ' / ' + (NRV[k])) ,
        pct == null ? '无 NRV' : rnd(pct, 1) + ' %']);
    }
    var kcal = vals.energy / 4.184, sugar100 = vals.sugar * scale, sodium100 = vals.sodium * scale;
    var fatPct = vals.fat * scale / NRV.fat * 100;
    if (sugar100 >= 15) hints.push('每 100 g 糖 ≥ 15 g，属于高糖，建议控制摄入量');
    else if (sugar100 <= 5) hints.push('每 100 g 糖 ≤ 5 g，属于低糖');
    if (sodium100 >= 600) hints.push('每 100 g 钠 ≥ 600 mg，钠含量偏高，高血压人群需注意');
    if (fatPct >= 30) hints.push('脂肪 NRV 占比偏高，注意总脂肪摄入');
    if (!hints.length) hints.push('各项指标处于常见范围，仍需结合全天膳食总量判断');
    return SEC('NRV 计算（' + (isServ ? '每份 ' + sv + ' g' : '每 100 g') + '）') +
      TB(['项目', '标注值', '折算每 100 g / NRV', 'NRV%'], rows) +
      SEC('能量换算') + KV([
        ['能量', num(vals.energy, 1) + ' kJ ≈ ' + num(kcal, 1) + ' kcal'],
        ['折算每 100 g', num(vals.energy * scale, 0) + ' kJ ≈ ' + num(kcal * scale, 0) + ' kcal'],
        ['占每日 8400 kJ', rnd(vals.energy * scale / 8400 * 100, 1) + ' %']
      ]) + SEC('膳食提示') + HINT(hints.join('；') + '。') +
      HINT('NRV 依据中国 GB 28050 营养素参考值（能量 8400 kJ、蛋白质 60 g、脂肪 60 g、碳水 300 g、钠 2000 mg、膳食纤维 25 g）；糖无 NRV，按每 100 g 含量参考判断。');
  }
});

/* 31. 航班行李额度速查 */
T({ id: 'baggage', name: '行李额度与超重估算', cat: 'life',
  desc: '按舱位与航线查询常见随身 / 托运行李额度，并估算超重费用',
  tags: '行李 托运 随身 登机箱 超重 航空 额度 公斤 尺寸 速查',
  fields: [
    { k: 'cabin', label: '舱位', type: 'select', value: 'eco', options: [
      ['eco', '经济舱'], ['premium', '超级经济舱 /  premium'], ['business', '商务舱'], ['first', '头等舱'] ] },
    { k: 'route', label: '航线类型', type: 'select', value: 'intl', options: [
      ['intl', '国际 / 地区航线'], ['domestic', '中国国内航线'] ] },
    { k: 'weight', label: '实际托运行李重量 kg', type: 'number', value: 26 },
    { k: 'pieces', label: '托运件数', type: 'number', value: 1 },
    { k: 'fee', label: '每超重 1 kg 费率（元，示意）', type: 'number', value: 60 }
  ],
  run: function (v) {
    var C = {
      eco:      { intl: [7, 23, 1], domestic: [5, 20, 1] },
      premium:  { intl: [7, 23, 2], domestic: [5, 20, 1] },
      business: { intl: [10, 32, 2], domestic: [8, 30, 1] },
      first:    { intl: [14, 32, 3], domestic: [10, 40, 2] }
    };
    var c = C[String(v.cabin || 'eco')][String(v.route || 'intl')];
    var w = pnum(v.weight), pieces = Math.max(1, parseInt(v.pieces, 10) || 1), fee = pnum(v.fee, 60);
    var over = Math.max(0, w - c[1]), extraPieces = Math.max(0, pieces - c[2]);
    var cost = over * fee + extraPieces * fee * c[1];
    return SEC('常见额度参考（' + (v.route === 'domestic' ? '国内' : '国际') + '）') + KV([
      ['随身行李', c[0] + ' kg（通常 20×40×55 cm 内，1 件 + 1 个人物品）'],
      ['托运单件上限', c[1] + ' kg / 件'],
      ['免费托运件数', c[2] + ' 件'],
      ['单件三边和', '一般 ≤ 158 cm；超尺寸另收费']
    ]) + SEC('你的行李') + KV([
      ['实际托运重量', num(w, 1) + ' kg'], ['托运件数', pieces + ' 件'],
      ['超重', num(over, 1) + ' kg'], ['超件', extraPieces + ' 件'],
      ['预估超额费用', money(cost) + ' 元（按 ' + money(fee) + ' 元/kg 示意）']
    ]) + SEC('各舱位对照') + TB(['舱位', '随身 kg', '托运 kg/件', '免费件数'], [
      ['经济舱', 7, 23, 1], ['超级经济舱', 7, 23, 2], ['商务舱', 10, 32, 2], ['头等舱', 14, 32, 3]
    ]) + HINT('不同航司、会员等级、票价规则差异很大（尤其廉航常需另购行李额），单件超过 32 kg 多数航司拒收。请以购票时的行李条款为准。');
  }
});

/* ============================================================
   六、媒体（3）
   ============================================================ */

/* 32. 色觉模拟 */
T({ id: 'colorblind', name: '色觉模拟与色板检查', cat: 'image',
  desc: '模拟红绿色盲、蓝黄色盲与全色盲下的颜色表现，检查配色可辨识度',
  tags: '色盲 色弱 色觉 无障碍 accessibility 红绿色盲 对比度 配色 模拟',
  fields: [
    { k: 'colors', label: '颜色列表（HEX，逗号 / 换行分隔）', type: 'textarea', rows: 3,
      value: '#E24A4A, #4CAF50, #3B82F6, #F5C542, #9B59B6, #FFFFFF, #222222' },
    { k: 'size', label: '色块尺寸', type: 'select', value: 'md', options: [
      ['sm', '小'], ['md', '中'], ['lg', '大'] ] }
  ],
  run: function (v) {
    var cs = String(v.colors || '').split(/[\s,，;；\n]+/).filter(Boolean).slice(0, 16), i, k;
    var M = {
      protan: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
      deuter: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
      tritan: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
      achro: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114]
    };
    function hex(s) {
      var t = String(s).replace('#', '');
      if (!/^[0-9a-fA-F]{6}$/.test(t)) return null;
      return [parseInt(t.slice(0, 2), 16), parseInt(t.slice(2, 4), 16), parseInt(t.slice(4, 6), 16)];
    }
    function toHex(rgb) {
      return '#' + rgb.map(function (x) { return ('0' + Math.max(0, Math.min(255, Math.round(x))).toString(16).toUpperCase()).slice(-2); }).join('');
    }
    function apply(rgb, m) {
      return [m[0] * rgb[0] + m[1] * rgb[1] + m[2] * rgb[2],
              m[3] * rgb[0] + m[4] * rgb[1] + m[5] * rgb[2],
              m[6] * rgb[0] + m[7] * rgb[1] + m[8] * rgb[2]];
    }
    var h = v.size === 'lg' ? 44 : (v.size === 'sm' ? 22 : 32);
    var html = '', rows = [];
    var names = ['原始', '红色盲 protan', '绿色盲 deuter', '蓝色盲 tritan', '全色盲 achro'];
    var keys = [null, 'protan', 'deuter', 'tritan', 'achro'];
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;font-size:11px;color:var(--muted,#888);margin-bottom:8px">' +
      names.map(function (n) { return '<span style="min-width:74px">' + esc(n) + '</span>'; }).join('') + '</div>';
    for (i = 0; i < cs.length; i++) {
      var rgb = hex(cs[i]);
      if (!rgb) { rows.push([cs[i], '非法 HEX']); continue; }
      var swatches = '<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:6px">' +
        keys.map(function (kk) {
          var outRgb = kk ? apply(rgb, M[kk]) : rgb, oh = toHex(outRgb);
          return '<div title="' + esc(oh) + '" style="width:74px;text-align:center">' +
                 '<div style="height:' + h + 'px;border-radius:8px;background:' + oh + ';border:1px solid rgba(0,0,0,.08)"></div>' +
                 '<div style="font-size:10px;margin-top:2px">' + esc(oh) + '</div></div>';
        }).join('') + '</div>';
      html += swatches;
      rows.push([toHex(rgb), toHex(apply(rgb, M.protan)), toHex(apply(rgb, M.deuter)), toHex(apply(rgb, M.tritan)), toHex(apply(rgb, M.achro))]);
    }
    return SEC('色板模拟（每行依次为原始 / 红 / 绿 / 蓝色盲 / 全色盲）') + html +
      SEC('HEX 对照') + TB(['原始', '红色盲', '绿色盲', '蓝色盲', '全色盲'], rows) +
      HINT('采用简化的 Brettel/Viénot 线性变换矩阵，仅作设计参考，不能替代专业色觉检查。重要信息不要仅靠颜色区分，请同时提供文字或图标。');
  }
});

/* 33. 调色板导出 */
T({ id: 'cssvar', name: '调色板导出 CSS 变量', cat: 'image',
  desc: '把一组颜色导出为 CSS 变量、SCSS、Tailwind 与 JSON 配置',
  tags: '调色板 CSS 变量 SCSS Tailwind JSON 导出 设计 token 颜色',
  fields: [
    { k: 'colors', label: '颜色（每行「名称 色值」，可省略名称）', type: 'textarea', rows: 6,
      value: 'primary #6F5C0F\nsecondary #BFE6D2\naccent #F5C542\nbg #FBF6E3\ntext #2B2A24' },
    { k: 'prefix', label: '变量名前缀', type: 'text', value: 'ak' },
    { k: 'format', label: '输出格式', type: 'select', value: 'all', options: [
      ['all', '全部格式'], ['css', 'CSS 变量'], ['scss', 'SCSS'], ['tailwind', 'Tailwind'], ['json', 'JSON'] ] }
  ],
  run: function (v) {
    var ls = lines(v.colors).filter(function (x) { return x.trim(); }), items = [], i;
    function normHex(s) {
      var t = String(s).trim().replace(/^#/, '');
      if (/^[0-9a-fA-F]{3}$/.test(t)) t = t.charAt(0) + t.charAt(0) + t.charAt(1) + t.charAt(1) + t.charAt(2) + t.charAt(2);
      return /^[0-9a-fA-F]{6}$/.test(t) ? '#' + t.toUpperCase() : null;
    }
    for (i = 0; i < ls.length && i < 40; i++) {
      var parts = ls[i].trim().split(/\s+/), name, col;
      if (parts.length >= 2) { name = parts[0]; col = normHex(parts.slice(1).join('')); }
      else { name = 'color-' + (i + 1); col = normHex(parts[0]); }
      if (!col) continue;
      name = name.replace(/[^A-Za-z0-9_-]/g, '-').toLowerCase();
      items.push({ name: name, hex: col });
    }
    if (!items.length) return HINT('请输入颜色，格式如「primary #6F5C0F」或直接写 HEX。');
    var pre = String(v.prefix || 'ak').replace(/[^A-Za-z0-9_-]/g, '') || 'ak';
    var css = ':root {\n' + items.map(function (o) { return '  --' + pre + '-' + o.name + ': ' + o.hex + ';'; }).join('\n') + '\n}';
    var scss = items.map(function (o) { return '$' + pre + '-' + o.name + ': ' + o.hex + ';'; }).join('\n');
    var tw = 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n' +
      items.map(function (o) { return "        '" + pre + '-' + o.name + "': '" + o.hex + "',"; }).join('\n') +
      '\n      }\n    }\n  }\n}';
    var js = '{\n' + items.map(function (o) { return '  "' + pre + '-' + o.name + '": "' + o.hex + '"'; }).join(',\n') + '\n}';
    var f = String(v.format || 'all'), html = SEC('颜色清单（' + items.length + ' 个）') +
      TB(['变量名', 'HEX'], items.map(function (o) { return [pre + '-' + o.name, o.hex]; }));
    if (f === 'all' || f === 'css') html += SEC('CSS 变量') + PRE(css);
    if (f === 'all' || f === 'scss') html += SEC('SCSS 变量') + PRE(scss);
    if (f === 'all' || f === 'tailwind') html += SEC('Tailwind 配置片段') + PRE(tw);
    if (f === 'all' || f === 'json') html += SEC('JSON') + PRE(js);
    return { html: html + HINT('支持 3 位与 6 位 HEX；名称会转成小写连字符形式。把 CSS 变量放在 :root 下即可全站复用，换肤时只需覆盖变量值。'),
      text: css };
  }
});

/* 34. 二维码容量估算 */
T({ id: 'qrcap', name: '二维码版本与容量估算', cat: 'image',
  desc: '按内容类型与纠错级别估算所需 QR 版本、模块数与最大容量',
  tags: '二维码 QR 版本 纠错级别 L M Q H 容量 模块 字节 估算',
  fields: [
    { k: 'text', label: '要编码的内容', type: 'textarea', rows: 4,
      value: 'https://github.com/Defaultuesr/AnKongToolBox/releases' },
    { k: 'ecl', label: '纠错级别', type: 'select', value: 'M', options: [
      ['L', 'L 约 7%'], ['M', 'M 约 15%'], ['Q', 'Q 约 25%'], ['H', 'H 约 30%'] ] },
    { k: 'mode', label: '编码模式', type: 'select', value: 'auto', options: [
      ['auto', '自动判断'], ['numeric', '纯数字'], ['alnum', '字母数字'], ['byte', '字节 / UTF-8'] ] }
  ],
  run: function (v) {
    var s = String(v.text == null ? '' : v.text), ecl = String(v.ecl || 'M');
    var numeric = /^\d+$/.test(s), alnum = /^[0-9A-Z$%*+\-./: ]+$/.test(s);
    var mode = String(v.mode || 'auto');
    if (mode === 'auto') mode = numeric ? 'numeric' : (alnum ? 'alnum' : 'byte');
    var n = s.length, bytes = mode === 'byte' ? H.utf8Bytes(s).length : n;
    // 各纠错级别 版本1~10 的字节模式容量（简化表，版本 11+ 用外推）
    var CAP = {
      L: [17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520, 586, 644, 718, 792, 858],
      M: [14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666],
      Q: [11, 20, 32, 46, 60, 74, 86, 108, 130, 151, 177, 203, 241, 258, 292, 322, 364, 394, 442, 482],
      H: [7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220, 250, 280, 310, 338, 382]
    };
    var perChar = { numeric: 3 / 1 * 0.42, alnum: 0.62, byte: 1 };
    var need = mode === 'numeric' ? bytes * 0.42 : (mode === 'alnum' ? bytes * 0.62 : bytes);
    var table = CAP[ecl], ver = 0, k;
    for (k = 0; k < table.length; k++) if (table[k] >= need) { ver = k + 1; break; }
    if (!ver) ver = 40;
    var side = ver <= 40 ? 21 + (ver - 1) * 4 : 177;
    var capAt = table[Math.min(ver, table.length) - 1];
    var rows = [];
    for (k = 0; k < 4; k++) {
      var E = ['L', 'M', 'Q', 'H'][k], tb = CAP[E], vv = 0;
      for (var q = 0; q < tb.length; q++) if (tb[q] >= need) { vv = q + 1; break; }
      if (!vv) vv = 40;
      rows.push([E, ['约 7%', '约 15%', '约 25%', '约 30%'][k], String(vv), String(21 + (vv - 1) * 4) + ' × ' + String(21 + (vv - 1) * 4)]);
    }
    return SEC('内容分析') + KV([
      ['字符数', n + ' 个'], ['UTF-8 字节数', H.utf8Bytes(s).length + ' B'],
      ['编码模式', mode === 'numeric' ? '数字（最省）' : (mode === 'alnum' ? '字母数字' : '字节 / UTF-8')],
      ['等效字节需求', rnd(need, 1) + ' B'], ['当前纠错级别', ecl]
    ]) + SEC('估算结果') + KV([
      ['所需最低版本', 'Version ' + ver + '（共 40 个版本）'],
      ['模块尺寸', side + ' × ' + side + ' 模块'],
      ['该级别最大容量', capAt + ' 字节（版本 ' + Math.min(ver, table.length) + '）'],
      ['建议最小打印尺寸', rnd(side * 0.33, 1) + ' mm（按 0.33 mm/模块）'],
      ['中文提示', /[\u4e00-\u9fff]/.test(s) ? '含中文，按 UTF-8 每字 3 字节计，容量约为纯数字的 1/3' : '无中文，可用更省的模式']
    ]) + SEC('四种纠错级别对比') + TB(['级别', '可恢复码字', '所需版本', '模块尺寸'], rows) +
      HINT('QR 版本每加 1，边长增加 4 模块；纠错级别越高越耐污损但容量越小。带 Logo 或用于印刷时建议选 Q / H 并留足静区（4 模块白边）。');
  }
});

/* ============================================================
   七、设备测评（4）
   ============================================================ */

/* 35. 快充协议速查 */
T({ id: 'chargeproto', name: '快充协议对照速查', cat: 'fun',
  desc: '对照 USB PD、QC、VOOC 等常见快充协议的功率、电压电流与兼容要点',
  tags: '快充 USB PD QC VOOC 充电 协议 功率 电压 电流 Type-C 速查',
  fields: [
    { k: 'q', label: '关键词筛选（可选）', type: 'text', value: '' },
    { k: 'power', label: '目标功率 W（用于估算充电电流）', type: 'number', value: 65 }
  ],
  run: function (v) {
    var D = [
      ['USB PD 3.0', '5/9/15/20 V', '最高 100 W (20V×5A)', 'USB-C 通用标准，需 E-Marker 线缆支持 5A'],
      ['USB PD 3.1 EPR', '28/36/48 V', '最高 240 W', '扩展功率范围，笔记本 / 显示器'],
      ['USB PD PPS', '3.3~21 V 可调', '通常 25~65 W', '可编程电源，安卓直充主流，发热更低'],
      ['QC 2.0', '5/9/12/20 V', '最高 18 W', '高通早期方案，需协议握手'],
      ['QC 3.0', '3.6~20 V 步进 0.2 V', '最高 18 W', '在 QC2.0 基础上支持动态调压'],
      ['QC 4 / 4+', '兼容 USB PD/PPS', '最高 27 W', '与 PD 互通，需 Type-C'],
      ['VOOC / Dash', '5 V 大电流', '20~65 W', '低压高电流，需原装线与充电头'],
      ['SuperVOOC', '10 V 大电流', '65~240 W', 'OPPO 系，私有协议'],
      ['SuperCharge', '4.5~5 V / 10 V', '22~88 W', '华为系，私有协议'],
      ['FlashCharge', '5~11 V', '33~200 W', 'vivo / iQOO 系，私有协议'],
      ['Apple 20W', '9 V ≈ 2.22 A', '20 W', 'iPhone USB-C PD 快充'],
      ['普通 USB', '5 V', '2.5~15 W', 'USB-A 默认 5V/0.5~3A，无协议握手']
    ];
    var q = String(v.q || '').trim(), P = pnum(v.power, 65);
    var rows = D.filter(function (r) { return !q || r.join(' ').toLowerCase().indexOf(q.toLowerCase()) >= 0; });
    var cur = [5, 9, 12, 20].map(function (u) { return [u + ' V', num(P / u, 2) + ' A']; });
    return SEC('协议对照（' + rows.length + ' 条）') + TB(['协议', '电压', '功率 / 电流', '要点'], rows) +
      SEC('目标功率 ' + num(P, 0) + ' W 对应电流') + TB(['电压', '所需电流'], cur) +
      HINT('私有快充协议通常需要原装充电器 + 原装线才能满速；混用时一般回落到 USB PD 或 5V 普通充电。功率 = 电压 × 电流，实际功率受电池温度与电量影响。');
  }
});

/* 36. 音频体积换算 */
T({ id: 'audiofmt', name: '音频码率与体积换算', cat: 'fun',
  desc: '按时长、采样率、位深、声道与码率估算音频文件体积与压缩比',
  tags: '音频 码率 比特率 采样率 位深 声道 WAV MP3 FLAC 体积 时长',
  fields: [
    { k: 'minutes', label: '时长（分钟）', type: 'number', value: 4 },
    { k: 'rate', label: '采样率 Hz', type: 'select', value: '44100', options: [
      ['8000', '8000 电话'], ['22050', '22050'], ['44100', '44100 CD'], ['48000', '48000 视频'], ['96000', '96000 高清'], ['192000', '192000 高清'] ] },
    { k: 'depth', label: '位深 bit', type: 'select', value: '16', options: [
      ['8', '8 bit'], ['16', '16 bit'], ['24', '24 bit'], ['32', '32 bit float'] ] },
    { k: 'ch', label: '声道数', type: 'select', value: '2', options: [['1', '单声道'], ['2', '立体声'], ['6', '5.1 声道']] },
    { k: 'kbps', label: '有损码率 kbps', type: 'number', value: 320 }
  ],
  run: function (v) {
    var min = Math.max(0.01, pnum(v.minutes, 4)), sr = parseInt(v.rate, 10) || 44100,
        dep = parseInt(v.depth, 10) || 16, ch = parseInt(v.ch, 10) || 2, kbps = pnum(v.kbps, 320);
    var sec = min * 60;
    var bps = sr * dep * ch / 8;
    var wav = bps * sec, lossy = kbps * 1000 / 8 * sec, flac = wav * 0.6;
    function fmt(b) { return b >= 1073741824 ? num(b / 1073741824, 2) + ' GB' : (b >= 1048576 ? num(b / 1048576, 2) + ' MB' : num(b / 1024, 1) + ' KB'); }
    var rows = [
      ['未压缩 PCM / WAV', num(bps / 1024, 1) + ' KB/s', fmt(wav), '1.00 ×'],
      ['FLAC 无损（按 60% 估）', '—', fmt(flac), num(flac / wav, 2) + ' ×'],
      ['MP3 / AAC ' + num(kbps, 0) + ' kbps', num(kbps / 8, 1) + ' KB/s', fmt(lossy), num(lossy / wav, 4) + ' ×']
    ];
    var table = [64, 128, 192, 256, 320].map(function (kb) {
      return [kb + ' kbps', fmt(kb * 1000 / 8 * sec), '1 小时 ' + fmt(kb * 1000 / 8 * 3600)];
    });
    return SEC('输入参数') + KV([
      ['时长', num(min, 2) + ' 分钟（' + num(sec, 0) + ' 秒）'],
      ['采样率', sr + ' Hz'], ['位深', dep + ' bit'], ['声道', ch + ' 声道'],
      ['未压缩比特率', num(sr * dep * ch / 1000, 1) + ' kbps']
    ]) + SEC('体积估算') + TB(['格式', '速率', '本段体积', '相对 WAV'], rows) +
      SEC('常见码率（本段时长）') + TB(['码率', '体积', '换算'], table) +
      HINT('WAV 体积 = 采样率 × 位深 × 声道 × 时长 ÷ 8（另有 44 字节头，可忽略）。FLAC 压缩率随内容变化，通常 50%~70%；有损码率固定，与内容无关。');
  }
});

/* 37. 帧时间与延迟 */
T({ id: 'frametime', name: '刷新率与帧时间换算', cat: 'fun',
  desc: '换算刷新率、单帧时间、每秒帧数与输入延迟，估算掉帧影响',
  tags: '刷新率 Hz 帧时间 ms FPS 输入延迟 掉帧 显示器 电竞 换算',
  fields: [
    { k: 'hz', label: '刷新率 Hz（可多个，逗号分隔）', type: 'text', value: '60, 90, 120, 144, 165, 240' },
    { k: 'fps', label: '实际渲染帧率 FPS', type: 'number', value: 60 },
    { k: 'drops', label: '每分钟掉帧数', type: 'number', value: 30 }
  ],
  run: function (v) {
    var hzs = String(v.hz || '').split(/[\s,，]+/).filter(Boolean).map(parseFloat).filter(function (x) { return isFinite(x) && x > 0; }).slice(0, 12);
    var fps = pnum(v.fps, 60), drops = pnum(v.drops, 0);
    var rows = hzs.map(function (h) {
      return [num(h, 0) + ' Hz', num(1000 / h, 3) + ' ms', num(h, 0) + ' FPS',
              num(1000 / h / 2, 2) + ' ms', num(1000 / h * 2, 2) + ' ms'];
    });
    var actualFps = Math.max(0.1, fps - drops / 60);
    return SEC('刷新率对照') + TB(['刷新率', '单帧时间', '理论 FPS', '平均等待（半帧）', '两帧耗时'], rows) +
      SEC('实际渲染') + KV([
        ['设定帧率', num(fps, 1) + ' FPS'], ['单帧预算', num(1000 / (fps || 60), 3) + ' ms'],
        ['每分钟掉帧', num(drops, 0) + ' 帧'], ['等效实际帧率', num(actualFps, 2) + ' FPS'],
        ['掉帧比例', rnd(drops / (fps * 60 || 1) * 100, 2) + ' %'],
        ['流畅度评价', drops / (fps * 60 || 1) < 0.01 ? '几乎没有掉帧' : (drops / (fps * 60 || 1) < 0.05 ? '轻微掉帧' : '明显卡顿')]
      ]) + HINT('单帧时间 = 1000 / 刷新率(Hz)。60 Hz 为 16.67 ms，144 Hz 为 6.94 ms。刷新率越高，同样的渲染耗时越容易超出帧预算，也更依赖 GPU 与 VSync 配合。');
  }
});

/* 38. dBm 换算 */
T({ id: 'dbmcalc', name: 'dBm 与信号强度换算', cat: 'fun',
  desc: 'dBm ↔ 毫瓦互转，评估 WiFi / 蜂窝信号质量与自由空间损耗',
  tags: 'dBm mW 信号强度 WiFi 蜂窝 RSSI 自由空间损耗 分贝 换算',
  fields: [
    { k: 'dbm', label: 'dBm 值（可多个，逗号分隔）', type: 'text', value: '-30, -50, -67, -70, -80, -90, -100' },
    { k: 'freq', label: '频率 MHz（用于路径损耗）', type: 'select', value: '2437', options: [
      ['900', '900 蜂窝'], ['1800', '1800 蜂窝'], ['2437', '2.4 GHz WiFi'], ['5180', '5 GHz WiFi'], ['3500', '3.5 GHz 5G'] ] },
    { k: 'dist', label: '距离 m（用于路径损耗）', type: 'number', value: 10 }
  ],
  run: function (v) {
    var vals = String(v.dbm || '').split(/[\s,，]+/).filter(Boolean).map(parseFloat).filter(isFinite).slice(0, 20);
    var f = parseInt(v.freq, 10) || 2437, d = Math.max(0.1, pnum(v.dist, 10));
    function qual(x) {
      if (x >= -50) return '极好（贴近路由器）';
      if (x >= -60) return '很好';
      if (x >= -67) return '良好（流畅视频 / 游戏）';
      if (x >= -70) return '可用（一般网页浏览）';
      if (x >= -80) return '较弱（可能偶发掉线）';
      if (x >= -90) return '很差（连接不稳定）';
      return '几乎不可用';
    }
    var rows = vals.map(function (x) {
      var mw = Math.pow(10, x / 10);
      return [num(x, 1) + ' dBm', mw >= 1 ? num(mw, 4) + ' mW' : num(mw * 1000, 4) + ' µW',
              num(Math.sqrt(mw * 50) * 1000, 4) + ' mV（50Ω）', qual(x)];
    });
    var fspl = 20 * Math.log10(d) + 20 * Math.log10(f) + 32.44;
    var rx = 20 - fspl;
    return SEC('dBm 换算') + TB(['功率', '毫瓦 / 微瓦', '等效电压', '信号评价（WiFi 参考）'], rows) +
      SEC('自由空间路径损耗') + KV([
        ['频率', f + ' MHz'], ['距离', num(d, 2) + ' m'],
        ['FSPL = 20log₁₀(d) + 20log₁₀(f) + 32.44', num(fspl, 2) + ' dB'],
        ['假设发射 20 dBm（100 mW）时接收', num(rx, 2) + ' dBm'],
        ['对应评价', qual(rx)]
      ]) + HINT('dBm 是以 1 mW 为参考的对数单位：0 dBm = 1 mW，每 +3 dBm 功率约翻倍、每 −10 dBm 降为十分之一。FSPL 为理想空旷环境，实际还要计入墙体、遮挡与天线增益。');
  }
});

/* ============================================================
   八、小游戏（2）
   ============================================================ */

/* 39. 数独生成与求解 */
T({ id: 'sudoku', name: '数独生成与求解', cat: 'game',
  desc: '生成 9×9 数独题目并给出完整解，可调难度与挖空数量',
  tags: '数独 sudoku 9x9 生成 求解 回溯 逻辑 益智 游戏',
  fields: [
    { k: 'diff', label: '难度（挖空数）', type: 'select', value: '40', options: [
      ['30', '简单（挖 30 格）'], ['40', '中等（挖 40 格）'], ['50', '困难（挖 50 格）'], ['56', '专家（挖 56 格）'] ] },
    { k: 'seed', label: '随机种子', type: 'number', value: 2026 }
  ],
  run: function (v) {
    var seed = parseInt(v.seed, 10) || 1;
    function rf() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rf() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    var base = 3, side = 9;
    function pattern(r, c) { return (base * (r % base) + Math.floor(r / base) + c) % side; }
    var rBase = [0, 1, 2], rowsG = shuffle(rBase.slice()).reduce(function (a, g) { return a.concat(shuffle([g * 3, g * 3 + 1, g * 3 + 2])); }, []);
    var colsG = shuffle(rBase.slice()).reduce(function (a, g) { return a.concat(shuffle([g * 3, g * 3 + 1, g * 3 + 2])); }, []);
    var nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    var sol = [], r, c;
    for (r = 0; r < 9; r++) { sol[r] = []; for (c = 0; c < 9; c++) sol[r][c] = nums[pattern(rowsG[r], colsG[c])]; }
    var holes = Math.max(20, Math.min(60, parseInt(v.diff, 10) || 40));
    var puzzle = sol.map(function (row) { return row.slice(); });
    var cells = shuffle((function () { var a = [], i; for (i = 0; i < 81; i++) a.push(i); return a; })());
    for (var k = 0; k < holes && k < cells.length; k++) puzzle[Math.floor(cells[k] / 9)][cells[k] % 9] = 0;
    function draw(g) {
      var out = '', i2, j2;
      for (i2 = 0; i2 < 9; i2++) {
        if (i2 % 3 === 0 && i2 > 0) out += '------+-------+------\n';
        var line = '';
        for (j2 = 0; j2 < 9; j2++) {
          if (j2 % 3 === 0 && j2 > 0) line += '| ';
          line += (g[i2][j2] ? String(g[i2][j2]) : '.') + ' ';
        }
        out += line.replace(/\s+$/, '') + '\n';
      }
      return out;
    }
    var filled = 81 - holes;
    return SEC('题目（' + holes + ' 个空格，' + filled + ' 个已知数）') + PRE(draw(puzzle)) +
      SEC('答案') + PRE(draw(sol)) +
      KV([['难度', ['简单', '中等', '困难', '专家'][[30, 40, 50, 56].indexOf(holes)] || '自定义'],
          ['空格数', holes + ' 格'], ['种子', String(seed)], ['唯一解', '由完整解挖空生成，解唯一性未经唯一解校验']]) +
      HINT('通过「基础模式 + 行/列/数字随机置换」生成完整解，再按种子挖空。相同种子会得到相同题目，方便分享给朋友一起玩。');
  }
});

/* 40. 汉诺塔 */
T({ id: 'hanoi', name: '汉诺塔步数求解', cat: 'game',
  desc: '计算汉诺塔最少移动步数与耗时，并输出完整移动序列',
  tags: '汉诺塔 Tower of Hanoi 递归 步数 2^n 移动序列 益智 数学',
  fields: [
    { k: 'n', label: '盘子数（1~12）', type: 'number', value: 4 },
    { k: 'sec', label: '每步耗时（秒）', type: 'number', value: 1 },
    { k: 'show', label: '输出移动步骤上限', type: 'number', value: 40 }
  ],
  run: function (v) {
    var n = Math.max(1, Math.min(12, parseInt(v.n, 10) || 3)), sec = Math.max(0, pnum(v.sec, 1)),
        lim = Math.max(1, Math.min(511, parseInt(v.show, 10) || 40));
    var steps = Math.pow(2, n) - 1, moves = [], over = false;
    function move(k, from, to, via) {
      if (over) return;
      if (k === 1) { if (moves.length < lim) moves.push('把 1 号盘从 ' + from + ' 移到 ' + to); else over = true; return; }
      move(k - 1, from, via, to);
      if (!over) { if (moves.length < lim) moves.push('把 ' + k + ' 号盘从 ' + from + ' 移到 ' + to); else over = true; }
      if (!over) move(k - 1, via, to, from);
    }
    move(n, 'A', 'C', 'B');
    var total = steps * sec;
    function human(s) {
      if (s < 60) return num(s, 1) + ' 秒';
      if (s < 3600) return num(s / 60, 2) + ' 分钟';
      if (s < 86400) return num(s / 3600, 2) + ' 小时';
      if (s < 31536000) return num(s / 86400, 2) + ' 天';
      return num(s / 31536000, 2) + ' 年';
    }
    var scale = [3, 5, 8, 10, 15, 20, 25, 31, 40, 64].map(function (k) {
      return [k + ' 盘', num(Math.pow(2, k) - 1, 0) + ' 步', sec > 0 ? human((Math.pow(2, k) - 1) * sec) : '—'];
    });
    return SEC('结果') + KV([
      ['盘子数', n + ' 盘'], ['最少移动步数 2ⁿ−1', num(steps, 0) + ' 步'],
      ['每步耗时', num(sec, 2) + ' 秒'], ['理论总耗时', sec > 0 ? human(total) : '—'],
      ['递归深度', n + ' 层']
    ]) + SEC('移动序列（前 ' + Math.min(lim, steps) + ' 步）') +
      PRE(moves.map(function (m, i) { return ('00' + (i + 1)).slice(-3) + '. ' + m; }).join('\n') + (over ? '\n…（已截断，共 ' + num(steps, 0) + ' 步）' : '')) +
      SEC('规模对照') + TB(['盘子数', '步数', '耗时（按当前速度）'], scale) +
      HINT('汉诺塔最少步数满足 T(n) = 2T(n−1) + 1，即 2ⁿ−1。64 盘按每秒一步需约 5849 亿年，常用来说明指数增长的速度。');
  }
});

})();
