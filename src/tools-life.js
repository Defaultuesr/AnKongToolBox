/* ============================================================
   安空工具箱 — 生活实用 / 玩机娱乐 / 计算器
   ============================================================ */

T({ id: 'password', name: '随机密码', cat: 'life', icon: '🔑', tint: '#FFDEE4',
  desc: '生成高强度随机密码并评估强度', tags: '密码 随机 生成 强度 安全',
  fields: [
    { k: 'len', label: '长度', type: 'number', value: '16' },
    { k: 'count', label: '生成数量', type: 'number', value: '5' },
    { k: 'lower', label: '小写字母 a-z', type: 'switch', value: true },
    { k: 'upper', label: '大写字母 A-Z', type: 'switch', value: true },
    { k: 'digit', label: '数字 0-9', type: 'switch', value: true },
    { k: 'sym', label: '符号 !@#$...', type: 'switch', value: true },
    { k: 'noConfuse', label: '排除易混淆字符 (0/O/1/l)', type: 'switch', value: false }
  ],
  run: function (v) {
    var sets = { lower:'abcdefghijkmnopqrstuvwxyz', upper:'ABCDEFGHJKLMNPQRSTUVWXYZ', digit:'23456789', sym:'!@#$%^&*()-_=+[]{};:,.?' };
    var pool = '';
    if (v.lower) pool += v.noConfuse ? sets.lower : 'abcdefghijklmnopqrstuvwxyz';
    if (v.upper) pool += v.noConfuse ? sets.upper : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (v.digit) pool += v.noConfuse ? sets.digit : '0123456789';
    if (v.sym) pool += sets.sym;
    if (!pool) throw new Error('请至少选择一种字符类型');
    var len = Math.max(4, Math.min(128, parseInt(v.len,10) || 16));
    var cnt = Math.max(1, Math.min(50, parseInt(v.count,10) || 5));
    function rand(max) { var a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % max; }
    var out = [];
    for (var i = 0; i < cnt; i++) {
      var s = '';
      for (var j = 0; j < len; j++) s += pool[rand(pool.length)];
      out.push(s);
    }
    var bits = len * Math.log2(pool.length);
    var strength = bits < 40 ? '较弱' : bits < 60 ? '中等' : bits < 80 ? '强' : '极强';
    return { html: '<div style="font-family:ui-monospace,monospace;line-height:2;word-break:break-all;font-size:14px">' +
      out.map(function (s) { return '<div>' + H.esc(s) + '</div>'; }).join('') + '</div>' +
      '<div style="margin-top:12px">' + H.kv([['字符集大小', String(pool.length)], ['约合熵', Math.round(bits) + ' bit'],
        ['强度评级', strength], ['破解难度', bits >= 80 ? '以当前算力基本不可暴力破解' : '建议增加长度']]) + '</div>',
      text: out.join('\n') };
  }
});

T({ id: 'randnum', name: '随机数抽签', cat: 'life', icon: '🎲', tint: '#FFDEE4',
  desc: '在指定范围内生成随机数 / 抽签', tags: '随机数 抽签 摇号 范围',
  fields: [
    { k: 'min', label: '最小值', type: 'number', value: '1' },
    { k: 'max', label: '最大值', type: 'number', value: '100' },
    { k: 'count', label: '数量', type: 'number', value: '1' },
    { k: 'unique', label: '不重复', type: 'switch', value: true },
    { k: 'sort', label: '结果排序', type: 'switch', value: false }
  ],
  run: function (v) {
    var lo = Math.ceil(parseFloat(v.min)), hi = Math.floor(parseFloat(v.max));
    var n = Math.max(1, Math.min(1000, parseInt(v.count,10) || 1));
    if (!isFinite(lo) || !isFinite(hi) || hi < lo) throw new Error('最大值需不小于最小值');
    if (v.unique && n > hi - lo + 1) throw new Error('不重复模式下数量不能超过 ' + (hi - lo + 1));
    function rnd() { var a = new Uint32Array(1); crypto.getRandomValues(a); return lo + a[0] % (hi - lo + 1); }
    var out = [], guard = 0;
    while (out.length < n && guard++ < 100000) {
      var x = rnd();
      if (v.unique && out.indexOf(x) >= 0) continue;
      out.push(x);
    }
    if (v.sort) out.sort(function (a,b) { return a-b; });
    return { html: '<div style="text-align:center;padding:6px 0 14px"><div style="font-size:26px;font-weight:700;color:var(--primary);word-break:break-all">' +
      H.esc(out.join('，')) + '</div><div style="font-size:12px;color:var(--on-surface-variant);margin-top:6px">' +
      lo + ' ~ ' + hi + ' 共 ' + out.length + ' 个</div></div>' + H.kv([['总和', String(out.reduce(function (a,b) { return a+b; }, 0))],
      ['平均值', H.num(out.reduce(function (a,b) { return a+b; }, 0)/out.length, 2)], ['最小 / 最大', Math.min.apply(null,out) + ' / ' + Math.max.apply(null,out)]]),
      text: out.join('\n') };
  }
});

T({ id: 'dice', name: '掷骰子', cat: 'life', icon: '🎲', tint: '#FFDEE4',
  desc: '掷 1~6 个骰子，带动画', tags: '骰子 随机 桌游 娱乐',
  custom: function (host, api) {
    host.innerHTML = '<div class="field"><label>骰子个数</label><select class="input" id="dc-n">' +
      [1,2,3,4,5,6].map(function (n) { return '<option value="'+n+'">'+n+' 个</option>'; }).join('') + '</select></div>' +
      '<div class="btn-row"><button class="btn full" data-go>掷骰子</button></div>' +
      '<div id="dc-out" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;padding:24px 8px;min-height:110px"></div>' +
      '<div class="result empty" id="dc-sum">点数合计会显示在这里</div>';
    var DOTS = ['1','2','3','4','5','6'];
    function diceHTML(x) { return '<span style="font-size:30px;font-weight:700;width:56px;height:56px;display:grid;place-items:center;background:var(--surface-container-low);border-radius:14px;border:2px solid var(--outline-variant)">' + x + '</span>'; }
    host.addEventListener('click', function (e) {
      if (!e.target.closest('[data-go]')) return;
      var n = +host.querySelector('#dc-n').value, vals = [], box = host.querySelector('#dc-out');
      box.innerHTML = Array.from({length:n}, function () { return diceHTML('?'); }).join('');
      var ticks = 0, timer = setInterval(function () {
        box.innerHTML = Array.from({length:n}, function () { return diceHTML(DOTS[Math.floor(Math.random()*6)]); }).join('');
        if (++ticks > 10) {
          clearInterval(timer);
          for (var i = 0; i < n; i++) vals.push(1 + Math.floor(Math.random()*6));
          box.innerHTML = vals.map(function (x) { return diceHTML(DOTS[x-1]); }).join('');
          host.querySelector('#dc-sum').classList.remove('empty');
          host.querySelector('#dc-sum').innerHTML = '点数：' + vals.join(' + ') + ' = <b>' + vals.reduce(function (a,b) { return a+b; },0) + '</b>';
        }
      }, 60);
    });
  }
});

var RELATIVES = {
  '爸爸的爸爸':'爷爷','爸爸的妈妈':'奶奶','妈妈的爸爸':'外公 / 姥爷','妈妈的妈妈':'外婆 / 姥姥',
  '爸爸的哥哥':'伯父 / 大伯','爸爸的弟弟':'叔叔','爸爸的姐姐':'姑妈 / 姑姑','爸爸的妹妹':'姑姑',
  '妈妈的哥哥':'舅舅','妈妈的弟弟':'舅舅','妈妈的姐姐':'姨妈 / 姨','妈妈的妹妹':'小姨',
  '爷爷的爸爸':'曾祖父','奶奶的妈妈':'曾祖母','哥哥':'哥哥','姐姐':'姐姐','弟弟':'弟弟','妹妹':'妹妹',
  '儿子的儿子':'孙子','儿子的女儿':'孙女','女儿的儿子':'外孙','女儿的女儿':'外孙女',
  '丈夫的爸爸':'公公','丈夫的妈妈':'婆婆','妻子的爸爸':'岳父','妻子的妈妈':'岳母',
  '哥哥的妻子':'嫂子','弟弟的妻子':'弟媳','姐姐的丈夫':'姐夫','妹妹的丈夫':'妹夫',
  '爸爸的哥哥的妻子':'伯母','爸爸的弟弟的妻子':'婶婶','妈妈的兄弟的妻子':'舅妈',
  '爸爸的姐妹的丈夫':'姑父','妈妈的姐妹的丈夫':'姨父','妻子的兄弟':'大舅子 / 小舅子',
  '丈夫的兄弟':'大伯子 / 小叔子','妻子的姐妹':'大姨子 / 小姨子','爸爸的儿子的妻子':'嫂子 / 弟媳'
};
T({ id: 'relative', name: '亲戚称呼', cat: 'life', icon: '👨‍👩‍👧', tint: '#FFDEE4',
  desc: '输入关系链，查出该怎么称呼', tags: '亲戚 称呼 辈分 关系',
  note: '收录常见关系链，输入如「爸爸的哥哥」；南北方叫法差异较大，结果仅供参考。',
  fields: [{ k: 'rel', label: '关系链', type: 'text', placeholder: '例如：爸爸的哥哥 / 妈妈的妹妹' }],
  run: function (v) {
    var s = String(v.rel || '').trim().replace(/的+/g, '的').replace(/^的|的$/g, '');
    if (!s) throw new Error('请输入关系链');
    var hit = RELATIVES[s];
    if (!hit) {
      for (var k in RELATIVES) if (s.indexOf(k) >= 0 || k.indexOf(s) >= 0) { hit = RELATIVES[k]; break; }
    }
    if (!hit) {
      return { html: '<div class="kv"><span>查询结果</span><span>暂未收录「' + H.esc(s) + '」</span></div>' +
        '<div style="font-weight:700;margin:14px 0 6px">常见示例</div>' +
        H.kv(Object.keys(RELATIVES).slice(0,12).map(function (k) { return [H.esc(k), H.esc(RELATIVES[k])]; })),
        text: '未收录：' + s };
    }
    return { html: '<div style="text-align:center;padding:8px 0 16px"><div style="font-size:26px;font-weight:800;color:var(--primary)">' +
      H.esc(hit) + '</div><div style="font-size:12px;color:var(--on-surface-variant);margin-top:6px">' + H.esc(s) + '</div></div>' +
      '<div class="hint" style="margin:0 2px">不同地区称谓略有差异，请以家庭习惯为准。</div>', text: s + ' → ' + hit };
  }
});

T({ id: 'countdown', name: '纪念日倒数', cat: 'life', icon: '⏳', tint: '#FFDEE4',
  desc: '记录重要日子，计算已过或还剩天数', tags: '纪念日 倒数 倒计时 生日',
  fields: [
    { k: 'name', label: '事件名称', type: 'text', value: '新年' },
    { k: 'date', label: '目标日期', type: 'date', value: (new Date().getFullYear()+1) + '-01-01' },
    { k: 'repeat', label: '每年重复（按生日 / 节日计算）', type: 'switch', value: false }
  ],
  run: function (v) {
    var d = new Date(String(v.date).replace(/-/g,'/')+' 00:00:00');
    if (isNaN(d.getTime())) throw new Error('请选择有效日期');
    var today = new Date(); today.setHours(0,0,0,0);
    var target = new Date(d);
    if (v.repeat) {
      target.setFullYear(today.getFullYear());
      if (target < today) target.setFullYear(today.getFullYear()+1);
    }
    var diff = Math.round((target - today)/86400000);
    var weeks = Math.floor(Math.abs(diff)/7), rest = Math.abs(diff)%7;
    var passed = -diff;
    return { html: '<div style="text-align:center;padding:8px 0 16px"><div style="font-size:13px;color:var(--on-surface-variant)">' +
      H.esc(v.name || '目标日') + '</div><div style="font-size:38px;font-weight:800;color:var(--primary);margin:6px 0">' +
      (diff === 0 ? '就是今天' : diff > 0 ? diff : Math.abs(diff)) + '</div><div style="font-size:13px">' +
      (diff === 0 ? '' : diff > 0 ? '天之后' : '天前') + '</div></div>' + H.kv([
        ['目标日期', H.fmtDate(target, false)], ['今天', H.fmtDate(today, false)],
        ['折合', weeks + ' 周 ' + rest + ' 天'], ['星期', ['周日','周一','周二','周三','周四','周五','周六'][target.getDay()]],
        ['状态', diff > 0 ? '还有 ' + diff + ' 天' : diff < 0 ? '已过去 ' + passed + ' 天' : '就在今天']
      ]), text: (v.name||'目标日') + '：' + (diff > 0 ? '还有 ' + diff + ' 天' : diff < 0 ? '已过去 ' + (-diff) + ' 天' : '就是今天') };
  }
});

T({ id: 'decision', name: '帮我做决定', cat: 'life', icon: '🤔', tint: '#FFDEE4',
  desc: '在多个选项里随机抽一个', tags: '选择 决定 随机 转盘',
  custom: function (host, api) {
    host.innerHTML = '<div class="field"><label>候选选项（每行一个）</label>' +
      '<textarea class="input" id="ds-list" rows="5">吃火锅\n吃烤肉\n吃沙拉\n点外卖</textarea></div>' +
      '<div class="btn-row"><button class="btn full" data-go>帮我选</button></div>' +
      '<div class="result empty" id="ds-out" style="text-align:center;font-size:22px;font-weight:700">点上方按钮开始</div>';
    host.addEventListener('click', function (e) {
      if (!e.target.closest('[data-go]')) return;
      var list = host.querySelector('#ds-list').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
      if (!list.length) { api.toast('请至少输入一个选项'); return; }
      var out = host.querySelector('#ds-out'), ticks = 0;
      out.classList.remove('empty');
      var timer = setInterval(function () {
        out.textContent = list[Math.floor(Math.random()*list.length)];
        if (++ticks > 12) {
          clearInterval(timer);
          var pick = list[Math.floor(Math.random()*list.length)];
          out.innerHTML = '「' + H.esc(pick) + '」';
          api.toast('就选它了！');
        }
      }, 70);
    });
  }
});

T({ id: 'sleep', name: '睡眠时间计算', cat: 'life', icon: '😴', tint: '#FFDEE4',
  desc: '按 90 分钟睡眠周期推荐作息', tags: '睡眠 作息 起床 生物钟',
  note: '以 90 分钟为一个完整睡眠周期，加上约 15 分钟入睡时间；建议睡满 5~6 个周期。',
  fields: [
    { k: 'mode', label: '计算方式', type: 'select', options: [['wake','入睡时间 → 推荐起床'],['sleep','起床时间 → 建议入睡']] },
    { k: 'time', label: '时间 (HH:mm)', type: 'time', value: '23:00' }
  ],
  run: function (v) {
    var m = String(v.time || '').match(/^(\d{1,2}):(\d{2})$/);
    if (!m) throw new Error('请输入 HH:mm 格式的时间');
    var base = new Date(); base.setHours(+m[1], +m[2], 0, 0);
    var line = function (d) { return H.pad(d.getHours()) + ':' + H.pad(d.getMinutes()); };
    var rows = [], text = [];
    for (var c = 4; c <= 6; c++) {
      var d = new Date(base.getTime() + (v.mode === 'wake' ? 1 : -1) * (c*90 + 15)*60000);
      var label = line(d) + '（' + c + ' 个周期 / ' + (c*1.5).toFixed(1) + ' 小时）' + (c === 5 ? '（推荐）' : '');
      rows.push([c + ' 个周期', H.esc(label)]);
      text.push(label);
    }
    return { html: '<div style="font-weight:700;margin-bottom:8px">' + (v.mode === 'wake' ? '推荐起床时间' : '建议入睡时间') +
      '</div>' + H.kv(rows) + '<div class="hint" style="margin-top:12px">尽量避免在深睡期被闹钟叫醒，按完整周期起床更清醒。</div>',
      text: (v.mode === 'wake' ? '入睡 ' : '起床 ') + v.time + '\n' + text.join('\n') };
  }
});

var FORTUNES = [
  ['大吉','今天适合把拖了很久的事做完，会有意外的顺遂。'],
  ['中吉','稳扎稳打就好，别急着做决定，下午会有好消息。'],
  ['小吉','一点小惊喜在等你，记得抬头看看天。'],
  ['吉','适合与人合作，主动开口会比平时更顺利。'],
  ['末吉','慢一点没关系，把节奏交给自己。'],
  ['平','寻常的一天，好好吃饭、好好休息就是赚到。'],
  ['小凶','容易丢三落四，出门前检查一遍随身物品。'],
  ['中凶','别在情绪上头时回复消息，先缓一缓。'],
  ['大吉','宜尝试新东西，今天的灵感值得记下来。'],
  ['吉','旧人旧事会有回音，保持善意即可。']
];
T({ id: 'luck', name: '每日一签', cat: 'life', icon: '🎴', tint: '#FFDEE4',
  desc: '按日期生成当天签文，同一天结果一致', tags: '抽签 运势 每日 趣味',
  fields: [], auto: true,
  run: function () {
    var d = new Date(), seed = d.getFullYear()*10000 + (d.getMonth()+1)*100 + d.getDate();
    var f = FORTUNES[seed % FORTUNES.length];
    var stars = '★'.repeat(Math.max(1, 6 - FORTUNES.indexOf(f) % 5));
    return { html: '<div style="text-align:center;padding:10px 0 18px"><div style="font-size:13px;color:var(--on-surface-variant)">' +
      H.fmtDate(d, false) + ' · 今日签</div><div style="font-size:38px;font-weight:800;color:var(--primary);margin:12px 0">' + f[0] + '</div>' +
      '<div style="font-size:14px;letter-spacing:4px;color:var(--primary)">' + stars + '</div>' +
      '<div style="font-size:14px;line-height:1.9;margin-top:16px;padding:0 8px">' + f[1] + '</div></div>' +
      '<div class="hint" style="text-align:center;margin:0">纯属趣味，祝今天顺心</div>',
      text: H.fmtDate(d, false) + ' 今日签：' + f[0] + ' — ' + f[1] };
  }
});

/* 标准计算器 */
T({ id: 'calc', name: '计算器', cat: 'calc', icon: '🧮', tint: '#FFF0C7',
  desc: '带按键的标准计算器', tags: '计算器 加减乘除 计算',
  custom: function (host, api) {
    host.innerHTML = '<div class="calc-display" id="ca-d"><span style="font-size:14px;color:var(--on-surface-variant)" id="ca-expr">&nbsp;</span>' +
      '<span id="ca-val">0</span></div>' +
      '<div class="calc-pad" id="ca-pad">' +
      ['C','⌫','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','±','0','.','='].map(function (k) {
        var cls = ['÷','×','−','+','='].indexOf(k) >= 0 ? 'op' : /[C⌫%±]/.test(k) ? '' : '';
        if (k === '=') cls = 'eq';
        return '<button class="' + cls + '" data-k="' + k + '">' + k + '</button>';
      }).join('') + '</div>' +
      '<div class="hint" style="margin-top:14px">支持连续运算与百分比；点击结果可复制。</div>';
    var expr = '', val = '0', fresh = false;
    function update() {
      host.querySelector('#ca-expr').textContent = expr || ' ';
      host.querySelector('#ca-val').textContent = val;
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-k]');
      if (!b) {
        if (e.target.closest('#ca-val')) api.copy(val);
        return;
      }
      var k = b.getAttribute('data-k');
      if (k === 'C') { expr = ''; val = '0'; fresh = false; update(); return; }
      if (k === '⌫') { expr = expr.slice(0,-1); val = expr || '0'; update(); return; }
      if (k === '±') { if (val !== '0') { val = val[0] === '-' ? val.slice(1) : '-' + val; expr = val; } update(); return; }
      if (k === '=') {
        try {
          var r = H.evalExpr(expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-'));
          val = H.num(r, 10); expr = expr + ' ='; fresh = true;
        } catch (err) { api.toast(err.message); }
        update(); return;
      }
      if (k === '%') { try { val = H.num(parseFloat(val)/100, 10); expr = val; fresh = true; } catch (err) {} update(); return; }
      if (fresh && /[0-9.]/.test(k)) { expr = ''; fresh = false; }
      if (/[+\-×÷−]/.test(k) && fresh) { expr = val; fresh = false; }
      expr += k;
      try { val = H.num(H.evalExpr(expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/[+*/%-]+$/, '')), 10); } catch (err) {}
      update();
    });
    update();
  }
});

/* ==================== 玩机娱乐 ==================== */

T({ id: 'device', name: '设备信息', cat: 'fun', icon: '📲', tint: '#E2E6FF',
  desc: '查看本机型号、系统、屏幕与硬件信息', tags: '设备 信息 型号 安卓 硬件',
  fields: [], auto: true, copyable: false,
  run: function (v, api) {
    var extra = null;
    try { extra = JSON.parse(api.native.call('deviceInfo', '{}') || 'null'); } catch (e) {}
    var rows = [
      ['设备名称', extra && extra.device || navigator.userAgent.match(/\(([^)]*)\)/) && navigator.userAgent.match(/\(([^)]*)\)/)[1].split(';')[0] || '本机'],
      ['系统', extra && extra.system || navigator.platform || '—'],
      ['安卓版本', extra && extra.android || '由 App 提供'],
      ['CPU / 内核', extra && extra.cpu || '—'],
      ['运行内存', extra && extra.memory || '—'],
      ['存储空间', extra && extra.storage || '—'],
      ['屏幕分辨率', screen.width + ' × ' + screen.height + (extra && extra.screen ? '（原生 ' + extra.screen + '）' : '')],
      ['像素密度', (window.devicePixelRatio || 1) + 'x' + (extra && extra.density ? ' / ' + extra.density : '')],
      ['电池', extra && extra.battery || '由 App 提供'],
      ['网络类型', extra && extra.network || (navigator.onLine ? '已连接' : '离线')],
      ['浏览器内核', navigator.userAgent.match(/(Chrome|Firefox|Safari)\/[\d.]+/) ? navigator.userAgent.match(/(Chrome|Firefox|Safari)\/[\d.]+/)[0] : '—'],
      ['语言 / 地区', navigator.language || '—'],
      ['时区', Intl.DateTimeFormat().resolvedOptions().timeZone || '—'],
      ['应用版本', 'v' + (window.AK_VERSION || '1.5')]
    ];
    return { html: H.kv(rows.map(function (r) { return [r[0], H.esc(String(r[1]))]; }), '本机信息'),
      text: rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') };
  }
});

T({ id: 'torch', name: '手电筒', cat: 'fun', icon: '🔦', tint: '#E2E6FF',
  desc: '调用设备闪光灯常亮照明', tags: '手电筒 闪光灯 照明',
  note: '需要相机/闪光灯权限，仅在 Android App 内可用；浏览器中使用屏幕高亮作为替代。',
  custom: function (host, api) {
    host.innerHTML = '<div id="tc-stage" style="border-radius:var(--radius-m);height:220px;display:grid;place-items:center;background:var(--surface-container-high);transition:background .2s">' +
      '<div style="font-size:30px;font-weight:800;letter-spacing:2px" id="tc-ic">OFF</div></div>' +
      '<div class="btn-row" style="margin-top:14px"><button class="btn full" data-toggle>开启手电筒</button></div>' +
      '<div class="result empty" id="tc-out">状态会显示在这里</div>';
    var on = false;
    host.addEventListener('click', function (e) {
      if (!e.target.closest('[data-toggle]')) return;
      on = !on;
      var res = api.native.call('torch', on ? 'on' : 'off');
      host.querySelector('#tc-stage').style.background = on ? '#FFF8E1' : 'var(--surface-container-high)';
      host.querySelector('#tc-ic').textContent = on ? 'ON' : 'OFF';
      host.querySelector('[data-toggle]').textContent = on ? '关闭手电筒' : '开启手电筒';
      host.querySelector('#tc-out').classList.remove('empty');
      host.querySelector('#tc-out').textContent = on
        ? (res ? '已开启闪光灯' : '屏幕高亮模式已开启（浏览器环境）')
        : '已关闭';
      api.toast(on ? '手电筒已开启' : '手电筒已关闭');
    });
  }
});

T({ id: 'level', name: '水平仪', cat: 'fun', icon: '📐', tint: '#E2E6FF',
  desc: '用重力传感器测量水平（需设备支持）', tags: '水平仪 重力 传感器 测量',
  note: '需设备提供加速度/重力传感器；部分浏览器要求 HTTPS 与用户授权。',
  custom: function (host, api) {
    host.innerHTML = '<div class="result" style="text-align:center;font-size:22px;font-weight:700" id="lv-deg">等待传感器…</div>' +
      '<div id="lv-stage" style="height:250px;border-radius:var(--radius-m);background:var(--surface-container-high);position:relative;overflow:hidden;display:grid;place-items:center;margin-top:12px">' +
      '<div style="position:absolute;left:50%;top:50%;width:1px;height:100%;background:var(--outline-variant);transform:translate(-50%,-50%)"></div>' +
      '<div style="position:absolute;left:50%;top:50%;width:100%;height:1px;background:var(--outline-variant);transform:translate(-50%,-50%)"></div>' +
      '<div id="lv-bubble" style="width:56px;height:56px;border-radius:50%;background:var(--primary);box-shadow:0 4px 16px var(--shadow);transition:transform .12s linear"></div></div>' +
      '<div class="btn-row" style="margin-top:14px"><button class="btn tonal full" data-reset>重新校准</button></div>' +
      '<div class="hint" style="margin-top:8px">把手机平放在桌面上观察气泡位置；倾斜时气泡会偏移。</div>';
    var zero = null;
    function onMotion(e) {
      var a = e.accelerationIncludingGravity || e.acceleration; if (!a) return;
      var x = a.x || 0, y = a.y || 0;
      if (!zero) zero = { x:x, y:y };
      var dx = x - zero.x, dy = y - zero.y;
      var deg = Math.atan2(Math.sqrt(dx*dx + dy*dy), Math.abs(a.z || 9.8)) * 180/Math.PI;
      host.querySelector('#lv-deg').textContent = deg.toFixed(1) + '°';
      host.querySelector('#lv-bubble').style.transform = 'translate(' + Math.max(-100,Math.min(100,dx*9)) + 'px,' + Math.max(-100,Math.min(100,dy*9)) + 'px)';
    }
    window.addEventListener('devicemotion', onMotion);
    host.addEventListener('click', function (e) { if (e.target.closest('[data-reset]')) { zero = null; api.toast('已重置基准'); } });
    setTimeout(function () { if (!zero) host.querySelector('#lv-deg').textContent = '未检测到传感器数据'; }, 2500);
  }
});

T({ id: 'compass', name: '指南针', cat: 'fun', icon: '🧭', tint: '#E2E6FF',
  desc: '用方向传感器显示方位（需设备支持）', tags: '指南针 方向 传感器 方位',
  note: '需设备提供磁力计/方向传感器；使用时请远离磁性物体，并水平放置手机。',
  custom: function (host, api) {
    host.innerHTML = '<div class="result" style="text-align:center;font-size:24px;font-weight:700" id="cp-deg">等待传感器…</div>' +
      '<div style="height:250px;display:grid;place-items:center;margin-top:12px">' +
      '<div style="width:210px;height:210px;border-radius:50%;border:3px solid var(--outline-variant);position:relative;display:grid;place-items:center">' +
      '<span style="position:absolute;top:8px;font-weight:700;color:var(--error)">北</span>' +
      '<span style="position:absolute;bottom:8px;color:var(--on-surface-variant)">南</span>' +
      '<span style="position:absolute;left:10px;color:var(--on-surface-variant)">西</span>' +
      '<span style="position:absolute;right:10px;color:var(--on-surface-variant)">东</span>' +
      '<div id="cp-needle" style="width:14px;height:170px;transition:transform .15s linear;position:relative">' +
      '<div style="width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:88px solid var(--error);position:absolute;top:0"></div>' +
      '<div style="width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:88px solid var(--on-surface-variant);position:absolute;bottom:0"></div>' +
      '</div></div></div><div class="hint" style="margin-top:10px">若浏览器不支持方向传感器，可改用系统自带的指南针应用。</div>';
    var dirs = ['北','东北','东','东南','南','西南','西','西北'];
    function onOrient(e) {
      var a = e.alpha != null ? e.alpha : (e.webkitCompassHeading != null ? e.webkitCompassHeading : null);
      if (a == null) return;
      var deg = (a + 360) % 360;
      host.querySelector('#cp-deg').textContent = Math.round(deg) + '° · ' + dirs[Math.round(deg/45) % 8];
      host.querySelector('#cp-needle').style.transform = 'rotate(' + (-deg) + 'deg)';
    }
    window.addEventListener('deviceorientationabsolute', onOrient, true);
    window.addEventListener('deviceorientation', onOrient, true);
    setTimeout(function () { if (host.querySelector('#cp-deg').textContent.indexOf('等待') >= 0)
      host.querySelector('#cp-deg').textContent = '未检测到方向传感器'; }, 2500);
  }
});

T({ id: 'screen', name: '屏幕检测', cat: 'fun', icon: '🖼️', tint: '#E2E6FF',
  desc: '纯色 / 网格测试坏点与显示效果', tags: '屏幕 检测 坏点 纯色 分辨率',
  custom: function (host, api) {
    var colors = [['#FF0000','红'],['#00FF00','绿'],['#0000FF','蓝'],['#FFFFFF','白'],['#000000','黑'],['#808080','灰']];
    host.innerHTML = '<div class="chips" id="sc-colors">' + colors.map(function (c, i) {
      return '<button class="chip ' + (i === 0 ? 'on' : '') + '" data-c="' + c[0] + '" data-i="' + i + '">' + c[1] + '</button>';
    }).join('') + '<button class="chip" data-grid="1">网格</button></div>' +
      '<div id="sc-stage" style="height:300px;border-radius:var(--radius-m);background:#FF0000;margin-top:10px"></div>' +
      '<div class="btn-row" style="margin-top:14px"><button class="btn tonal full" data-zoom>放大检测区域</button></div>' +
      '<div class="result" style="font-family:inherit">' + H.kv([
        ['逻辑分辨率', innerWidth + ' × ' + innerHeight + ' px'], ['物理分辨率', screen.width + ' × ' + screen.height + ' px'],
        ['设备像素比', String(window.devicePixelRatio || 1)], ['色彩深度', screen.colorDepth + ' bit'],
        ['可用区域', screen.availWidth + ' × ' + screen.availHeight]
      ], '屏幕参数') + '</div>';
    host.addEventListener('click', function (e) {
      var c = e.target.closest('[data-c]');
      if (c) {
        host.querySelectorAll('#sc-colors .chip').forEach(function (x) { x.classList.remove('on'); });
        c.classList.add('on');
        host.querySelector('#sc-stage').style.background = c.getAttribute('data-c');
        host.querySelector('#sc-stage').style.backgroundImage = 'none';
        return;
      }
      if (e.target.closest('[data-grid]')) {
        host.querySelector('#sc-stage').style.background = '#fff';
        host.querySelector('#sc-stage').style.backgroundImage =
          'linear-gradient(var(--outline-variant) 1px,transparent 1px),linear-gradient(90deg,var(--outline-variant) 1px,transparent 1px)';
        host.querySelector('#sc-stage').style.backgroundSize = '20px 20px';
        return;
      }
      if (e.target.closest('[data-zoom]')) {
        var st = host.querySelector('#sc-stage'), btn = host.querySelector('[data-zoom]');
        var big = st.style.height === '70vh';
        st.style.height = big ? '300px' : '70vh';
        btn.textContent = big ? '放大检测区域' : '还原检测区域';
        api.toast(big ? '已还原检测区域' : '已在页面内放大检测区域');
      }
    });
  }
});

T({ id: 'led', name: 'LED 滚动字幕', cat: 'fun', icon: '📢', tint: '#E2E6FF',
  desc: '把手机变成滚动弹幕屏', tags: 'led 字幕 弹幕 滚动 应援',
  custom: function (host, api) {
    host.innerHTML = '<div class="field"><label>字幕内容</label><input class="input" type="text" id="ld-text" value="安空工具箱 · 欢迎使用"></div>' +
      '<div class="field-row"><div class="field"><label>文字颜色</label><input type="color" id="ld-color" value="#FF3B30"></div>' +
      '<div class="field"><label>字号 (px)</label><input class="input" type="number" id="ld-size" value="56"></div></div>' +
      '<div class="field"><label>滚动速度 <span id="ld-lab">8</span> 秒/屏</label><input type="range" id="ld-speed" min="2" max="20" value="8"></div>' +
      '<div class="switch-row"><div><div class="st">镜像翻转</div><div class="sd">隔玻璃展示时开启</div></div>' +
      '<button class="toggle" id="ld-mirror" type="button" role="switch"></button></div>' +
      '<div class="led-stage" id="ld-stage" style="position:relative"><div class="led-text" id="ld-run" style="position:absolute;white-space:nowrap;left:100%"><span id="ld-inner">安空工具箱 · 欢迎使用</span></div></div>' +
      '<div class="btn-row" style="margin-top:12px"><button class="btn full" data-zoom>放大字幕区域</button></div>';
    function apply() {
      var t = host.querySelector('#ld-text').value || ' ';
      var el = host.querySelector('#ld-run'), inner = host.querySelector('#ld-inner');
      inner.textContent = t;
      el.style.color = host.querySelector('#ld-color').value;
      el.style.fontSize = host.querySelector('#ld-size').value + 'px';
      inner.style.display = 'inline-block';
      inner.style.transform = host.querySelector('#ld-mirror').classList.contains('on') ? 'scaleX(-1)' : '';
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = 'ledScroll ' + host.querySelector('#ld-speed').value + 's linear infinite';
      host.querySelector('#ld-lab').textContent = host.querySelector('#ld-speed').value;
    }
    var st = document.createElement('style');
    st.textContent = '@keyframes ledScroll{from{left:100%}to{left:-100%}}';
    document.head.appendChild(st);
    host.addEventListener('input', apply);
    host.addEventListener('click', function (e) {
      if (e.target.closest('#ld-mirror')) { e.target.closest('#ld-mirror').classList.toggle('on'); apply(); }
      if (e.target.closest('[data-zoom]')) {
        var s = host.querySelector('#ld-stage'), btn = host.querySelector('[data-zoom]');
        var big = s.style.height === '68vh';
        s.style.height = big ? '' : '68vh';
        btn.textContent = big ? '放大字幕区域' : '还原字幕区域';
        api.toast(big ? '已还原字幕区域' : '已在页面内放大字幕区域');
      }
    });
    apply();
  }
});

T({ id: 'ruler', name: '屏幕尺子', cat: 'fun', icon: '📏', tint: '#E2E6FF',
  desc: '把屏幕当直尺用（可校准 PPI）', tags: '尺子 测量 厘米 屏幕',
  note: 'CSS 规范下 1 厘米约等于 37.8 个 CSS 像素，但各机型实际物理尺寸有差异。可用银行卡（宽 8.56cm）等实物比对面调整上方数值。',
  custom: function (host) {
    host.innerHTML = '<div class="field"><label>1 厘米对应像素数（可校准）</label><input class="input" type="number" id="ru-ppi" value="37.8" step="0.1"></div>' +
      '<div id="ru-strip" style="height:150px;border-radius:var(--radius-m);background:var(--surface-container-low);overflow:hidden;position:relative;border:1px solid var(--outline-variant)"></div>' +
      '<div class="hint" style="margin-top:8px">每一大格 = 1 cm，标注数字为厘米数。手机屏幕较小，测量结果仅供参考。</div>';
    function draw() {
      var pxPerCm = Math.max(10, Math.min(200, +host.querySelector('#ru-ppi').value || 37.8));
      var strip = host.querySelector('#ru-strip'), html = '';
      for (var i = 0; i < 40; i++) {
        var left = i * pxPerCm;
        if (left > 2000) break;
        html += '<div style="position:absolute;left:' + left + 'px;top:0;bottom:0;border-left:2px solid var(--primary)"></div>';
        html += '<div style="position:absolute;left:' + (left+4) + 'px;top:8px;font-size:11px;font-weight:700;color:var(--primary)">' + i + '</div>';
        for (var j = 1; j < 10; j++) html += '<div style="position:absolute;left:' + (left + j*pxPerCm/10) +
          'px;top:0;height:' + (j === 5 ? 26 : 14) + 'px;border-left:1px solid var(--outline)"></div>';
      }
      strip.innerHTML = html;
    }
    host.querySelector('#ru-ppi').addEventListener('input', draw);
    draw();
  }
});

T({ id: 'clean', name: '存储与清理', cat: 'fun', icon: '🧹', tint: '#E2E6FF',
  desc: '查看本应用缓存与存储占用说明', tags: '清理 垃圾 缓存 存储 加速',
  note: 'Android 出于隐私与安全限制，第三方应用无法清理其他 App 的缓存或「一键加速」；此处提供本应用的数据管理入口。',
  custom: function (host, api) {
    var used = 0;
    try { for (var k in localStorage) if (localStorage.hasOwnProperty(k)) used += (localStorage[k] || '').length; } catch (e) {}
    host.innerHTML = '<div class="note"><b>关于「垃圾清理」</b>现代 Android 已不允许第三方应用扫描或删除其他应用的数据，凡是宣称能一键加速、深度清理的工具，实际效果都很有限。建议通过「系统设置 → 存储」清理，或使用系统自带的存储管理器。</div>' +
      '<div class="result" style="font-family:inherit">' + H.kv([
        ['本应用本地数据', (used/1024).toFixed(2) + ' KB'], ['收藏工具数', String((window.AnkongApp && window.AnkongApp.state.fav.length) || 0)],
        ['使用记录数', String((window.AnkongApp && window.AnkongApp.state.history.length) || 0)],
        ['建议操作', '清理系统缓存、卸载不用的 App、转移照片到云端']
      ], '本机状态') + '</div>' +
      '<div class="btn-row" style="margin-top:14px"><button class="btn tonal full" data-clear>清空本应用记录</button></div>';
    host.addEventListener('click', function (e) {
      if (!e.target.closest('[data-clear]')) return;
      try { localStorage.clear(); } catch (err) {}
      api.toast('已清空，重启后生效');
    });
  }
});

/* 在线类功能：以合规说明占位，不实现第三方内容抓取 */
T({ id: 'video', name: '短视频解析', cat: 'query', icon: '🎬', tint: '#DCEBFF',
  desc: '在线视频解析功能说明', tags: '视频 解析 去水印 短视频',
  auto: true, copyable: false,
  run: function () {
    return { html: '<div class="note"><b>关于「短视频去水印解析」</b>各平台的服务条款与著作权保护规则不同，批量抓取、去除水印或分发他人作品可能构成侵权。本应用不内置对第三方平台的解析接口。</div>' +
      H.kv([
        ['合规做法 1', '使用平台官方提供的「保存 / 分享」功能'],
        ['合规做法 2', '取得作者授权后，通过官方开放接口获取'],
        ['合规做法 3', '仅保存自己创作或已获授权的内容'],
        ['如需接入', '由开发者自行对接有授权的内容服务，并在服务端完成鉴权'],
        ['本应用内', '可用「图片压缩 / 裁剪 / 格式转换」处理本地已有素材']
      ], '功能说明'), text: '短视频解析：需合规授权后接入' };
  }
});
T({ id: 'news', name: '时讯阅读', cat: 'query', icon: '📰', tint: '#DCEBFF',
  desc: '资讯阅读功能说明', tags: '新闻 资讯 阅读 时讯',
  auto: true, copyable: false,
  run: function () {
    return { html: '<div class="note"><b>关于「时讯阅读」</b>新闻资讯的转载需要相应授权，本应用不内置第三方资讯抓取。若需要此模块，可接入有授权的资讯 API（如官方开放平台），或使用 RSS 订阅自己有权访问的源。</div>' +
      H.kv([
        ['本应用已提供', '天气查询（Open-Meteo 开放数据）'],
        ['本应用已提供', '垃圾分类 / 节日 / 快递单号等本地查询'],
        ['接入方式', '在 App 内新增 WebView 页面或调用自有后端接口'],
        ['内容合规', '保留来源署名，遵守版权与信息服务相关规定']
      ], '功能说明'), text: '时讯阅读：需接入有授权的资讯源' };
  }
});
