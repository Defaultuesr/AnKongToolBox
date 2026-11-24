/* ============================================================
   安空工具箱 — 新增交互组件 / 小游戏
   全部为 custom 组件，纯本地运行；离开页面时自行清理定时器
   ============================================================ */
function akAlive(host) { return document.body.contains(host); }
function akLS(k, d) {
  try { var v = localStorage.getItem('ak_' + k); return v == null ? d : JSON.parse(v); }
  catch (e) { return d; }
}
function akLSSet(k, v) { try { localStorage.setItem('ak_' + k, JSON.stringify(v)); } catch (e) {} }
function akBeep(freq, ms, type) {
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    var ctx = new AC(), o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq || 880;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (ms || 100) / 1000);
    o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime + (ms || 100) / 1000 + 0.02);
    setTimeout(function () { try { ctx.close(); } catch (e) {} }, (ms || 100) + 200);
  } catch (e) {}
}
function akCard(title, body) {
  return '<div style="background:var(--surface-container-low);border-radius:var(--radius-m);padding:16px;margin-bottom:14px">' +
    (title ? '<div style="font-weight:700;margin-bottom:12px">' + H.esc(title) + '</div>' : '') + body + '</div>';
}

/* ---------------- 1. MBTI 性格测试 ---------------- */
var AK_MBTI_Q = [
  ['聚会结束后，你通常', '精力充沛，还想续摊', '有点累，想安静待着', 'EI'],
  ['认识新朋友时，你', '主动搭话，很快熟络', '等对方先开口', 'EI'],
  ['周末安排，你更喜欢', '约人出门、满满行程', '独自看书或追剧', 'EI'],
  ['学新东西时，你更看重', '具体步骤和实际用途', '背后的原理和可能性', 'SN'],
  ['看一份说明书，你会', '照着步骤一步步来', '先跳过，靠直觉摸索', 'SN'],
  ['描述一件事，你倾向于', '讲事实和细节', '讲感受和整体印象', 'SN'],
  ['朋友做错决定，你会先', '指出逻辑上的问题', '照顾对方感受再开口', 'TF'],
  ['评价一部电影，你更在乎', '剧情是否严谨合理', '是否打动了我', 'TF'],
  ['团队讨论时，你通常', '直说看法，不怕争论', '尽量维持和气', 'TF'],
  ['出门旅行，你会', '提前排好每日行程', '随性走，走到哪算哪', 'JP'],
  ['面对截止日期，你', '早早规划、按时交付', '临近才进入状态', 'JP'],
  ['桌面和文件，你一般', '分类整齐、随时找得到', '有点乱但自己知道在哪', 'JP']
];
var AK_MBTI_DESC = {
  'INTJ': '建筑师 · 独立、战略性，喜欢把复杂问题拆成体系',
  'INTP': '逻辑学家 · 好奇、爱分析，享受推演与抽象思考',
  'ENTJ': '指挥官 · 果断、目标导向，擅长组织与推进',
  'ENTP': '辩论家 · 机敏、点子多，喜欢挑战既有结论',
  'INFJ': '提倡者 · 有洞察力，重视意义与长期价值',
  'INFP': '调停者 · 理想主义，敏感而忠于内心',
  'ENFJ': '主人公 · 热情、善于鼓舞他人，天然的组织者',
  'ENFP': '竞选者 · 充满活力，对人和可能性都好奇',
  'ISTJ': '物流师 · 踏实可靠，重视规则与细节',
  'ISFJ': '守卫者 · 细心温和，默默照顾身边的人',
  'ESTJ': '总经理 · 讲效率、重秩序，执行力强',
  'ESFJ': '执政官 · 热心合群，擅长维系关系',
  'ISTP': '鉴赏家 · 冷静动手派，喜欢拆解与实测',
  'ISFP': '探险家 · 随和、审美敏锐，活在当下',
  'ESTP': '企业家 · 行动快、适应力强，喜欢现场感',
  'ESFP': '表演者 · 外向热情，把气氛带起来的人'
};
T({ id: 'mbti', name: 'MBTI 性格测试', cat: 'query', icon: '格', tint: '#EEE9D5',
  desc: '12 题快速测出你的四字母类型', tags: 'MBTI 性格 测试 心理 16型 人格',
  note: '精简版趣味测试，仅按四个维度计分，结果仅供娱乐，不具心理学诊断效力。',
  custom: function (host) {
    var idx = 0, score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    host.innerHTML = akCard('', '<div id="mb-wrap"></div>');
    var wrap = host.querySelector('#mb-wrap');
    function draw() {
      if (idx >= AK_MBTI_Q.length) {
        var t = (score.E >= score.I ? 'E' : 'I') + (score.S >= score.N ? 'S' : 'N') +
          (score.T >= score.F ? 'T' : 'F') + (score.J >= score.P ? 'J' : 'P');
        var dims = [['外向 E', score.E, '内向 I', score.I], ['实感 S', score.S, '直觉 N', score.N],
          ['思考 T', score.T, '情感 F', score.F], ['判断 J', score.J, '感知 P', score.P]];
        var bars = dims.map(function (d) {
          var tot = d[1] + d[3] || 1, l = Math.round(d[1] / tot * 100);
          return '<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">' +
            '<span>' + d[0] + ' ' + d[1] + '</span><span>' + d[2] + ' ' + d[3] + '</span></div>' +
            '<div style="height:10px;border-radius:6px;background:var(--surface-container-high);overflow:hidden">' +
            '<div style="height:100%;width:' + l + '%;background:var(--primary);border-radius:6px"></div></div></div>';
        }).join('');
        wrap.innerHTML = '<div style="text-align:center;padding:10px 0 18px">' +
          '<div style="font-size:44px;font-weight:800;letter-spacing:3px;color:var(--primary)">' + t + '</div>' +
          '<div style="font-size:14px;margin-top:6px;font-weight:600">' + H.esc(AK_MBTI_DESC[t] || '') + '</div></div>' +
          akCard('四维得分', bars) +
          '<div class="btn-row"><button class="btn full" data-mb="again">重新测试</button></div>';
        return;
      }
      var q = AK_MBTI_Q[idx];
      wrap.innerHTML = '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--on-surface-variant);margin-bottom:8px">' +
        '<span>第 ' + (idx + 1) + ' / ' + AK_MBTI_Q.length + ' 题</span><span>' + Math.round(idx / AK_MBTI_Q.length * 100) + '%</span></div>' +
        '<div style="height:6px;border-radius:4px;background:var(--surface-container-high);margin-bottom:18px;overflow:hidden">' +
        '<div style="height:100%;width:' + (idx / AK_MBTI_Q.length * 100) + '%;background:var(--primary)"></div></div>' +
        '<div style="font-size:17px;font-weight:650;line-height:1.6;margin-bottom:18px">' + H.esc(q[0]) + '</div>' +
        '<button class="btn full" style="margin-bottom:10px;justify-content:flex-start;text-align:left" data-mb="0">' + H.esc(q[1]) + '</button>' +
        '<button class="btn tonal full" style="justify-content:flex-start;text-align:left" data-mb="1">' + H.esc(q[2]) + '</button>';
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mb]'); if (!b) return;
      var a = b.getAttribute('data-mb');
      if (a === 'again') { idx = 0; score = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }; draw(); return; }
      var q = AK_MBTI_Q[idx], dim = q[3];
      score[a === '0' ? dim.charAt(0) : dim.charAt(1)]++;
      idx++; draw();
    });
    draw();
  }
});

/* ---------------- 2. 条形码生成（Code 39） ---------------- */
var AK_C39 = {
  '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw', '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn', '9': 'nnwwnnwnn', 'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw',
  'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnnn', 'F': 'nnwnwwnnn',
  'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn', 'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn',
  'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnwn', 'N': 'nnnnwnnww',
  'O': 'wnnnwnnwn', 'P': 'nnwnwnnwn', 'Q': 'nnnnnnwww', 'R': 'wnnnnnwwn',
  'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn', 'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw',
  'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn', 'Z': 'nwwnwnnnn',
  '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '*': 'nwnnwnwnn',
  '$': 'nwnwnwnnn', '/': 'nwnwnnnwn', '+': 'nwnnnwnwn', '%': 'nnnwnwnwn'
};
T({ id: 'barcode', name: '条形码生成', cat: 'image', icon: '条', tint: '#D9E8F0',
  desc: 'Code 39 条形码，本地生成可保存', tags: '条形码 barcode Code39 生成 打印',
  note: 'Code 39 支持数字、大写英文字母与 - . 空格 $ / + %，小写字母会自动转大写。',
  custom: function (host, api) {
    host.innerHTML = akCard('', 
      '<div class="field"><label>编码内容</label><input class="input" id="bc-text" value="ANKONG 2026" maxlength="32"></div>' +
      '<div class="field"><label>条宽（px）</label><input type="range" id="bc-unit" min="1" max="6" step="1" value="2"></div>' +
      '<div class="btn-row"><button class="btn full" data-bc="gen">生成条形码</button></div>' +
      '<div class="preview-box" id="bc-out" style="background:#fff"><span style="color:var(--on-surface-variant);font-size:13px">条形码预览</span></div>' +
      '<div class="btn-row"><button class="btn tonal full" data-bc="save">保存 PNG</button></div>');
    var cv = null;
    function build() {
      var raw = String(host.querySelector('#bc-text').value || '').toUpperCase().replace(/[^0-9A-Z\-. $/+%]/g, '');
      if (!raw) { api.toast('请输入编码内容'); return; }
      var unit = Number(host.querySelector('#bc-unit').value) || 2;
      var seq = '*' + raw + '*', elems = [];
      for (var i = 0; i < seq.length; i++) {
        var p = AK_C39[seq.charAt(i)];
        if (!p) continue;
        for (var j = 0; j < 9; j++) elems.push({ bar: j % 2 === 0, wide: p.charAt(j) === 'w' });
        elems.push({ bar: false, wide: false });
      }
      var pad = 16, total = 0;
      elems.forEach(function (e) { total += (e.wide ? 3 : 1) * unit; });
      cv = document.createElement('canvas');
      cv.width = total + pad * 2; cv.height = 110;
      var c = cv.getContext('2d');
      c.fillStyle = '#ffffff'; c.fillRect(0, 0, cv.width, cv.height);
      var x = pad;
      c.fillStyle = '#2A2620';
      elems.forEach(function (e) {
        var w = (e.wide ? 3 : 1) * unit;
        if (e.bar) c.fillRect(x, 8, w, 72);
        x += w;
      });
      c.fillStyle = '#2A2620'; c.font = '600 15px monospace'; c.textAlign = 'center';
      c.fillText(raw, cv.width / 2, 100);
      cv.style.maxWidth = '100%'; cv.style.height = 'auto';
      var out = host.querySelector('#bc-out');
      out.innerHTML = ''; out.appendChild(cv);
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-bc]'); if (!b) return;
      if (b.getAttribute('data-bc') === 'gen') build();
      else {
        if (!cv) { api.toast('请先生成条形码'); return; }
        api.download(cv.toDataURL('image/png'), 'ankong-barcode.png');
      }
    });
    host.querySelector('#bc-unit').addEventListener('input', build);
    build();
  }
});

/* ---------------- 3. 随手便签 ---------------- */
T({ id: 'notepad', name: '随手便签', cat: 'life', icon: '记', tint: '#ECD9E8',
  desc: '本地保存的多条便签，自动存草稿', tags: '便签 记事 笔记 备忘录 草稿',
  note: '内容只保存在本机浏览器存储中，清空数据或卸载应用会一并删除。',
  custom: function (host, api) {
    var notes = akLS('notes', ['']);
    host.innerHTML = akCard('', '<div id="np-list"></div>' +
      '<div class="btn-row"><button class="btn tonal" data-np="add">+ 新建便签</button>' +
      '<button class="btn outline" data-np="clear">清空全部</button></div>' +
      '<div class="hint" id="np-count"></div>');
    function draw() {
      var box = host.querySelector('#np-list'); if (!box) return;
      box.innerHTML = notes.map(function (n, i) {
        return '<div style="margin-bottom:12px;border-radius:var(--radius-s);background:var(--surface-container-lowest);padding:10px;border:1px solid var(--outline-variant)">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
          '<b style="font-size:12px;color:var(--on-surface-variant)">便签 ' + (i + 1) + '</b>' +
          '<button class="btn sm outline" style="min-height:28px;padding:0 10px" data-np="del" data-i="' + i + '">删除</button></div>' +
          '<textarea class="input" data-np="ta" data-i="' + i + '" rows="4" placeholder="写点什么…">' + H.esc(n) + '</textarea></div>';
      }).join('');
      var chars = notes.join('').length;
      host.querySelector('#np-count').textContent = notes.length + ' 条便签 · 共 ' + chars + ' 字 · 自动保存';
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-np]'); if (!b || b.getAttribute('data-np') === 'ta') return;
      var a = b.getAttribute('data-np');
      if (a === 'add') { notes.unshift(''); akLSSet('notes', notes); draw(); }
      else if (a === 'del') { notes.splice(Number(b.getAttribute('data-i')), 1); if (!notes.length) notes = ['']; akLSSet('notes', notes); draw(); }
      else if (a === 'clear') { notes = ['']; akLSSet('notes', notes); draw(); api.toast('便签已清空'); }
    });
    host.addEventListener('input', function (e) {
      var ta = e.target;
      if (!ta.getAttribute || ta.getAttribute('data-np') !== 'ta') return;
      notes[Number(ta.getAttribute('data-i'))] = ta.value;
      akLSSet('notes', notes);
      var c = host.querySelector('#np-count');
      if (c) c.textContent = notes.length + ' 条便签 · 共 ' + notes.join('').length + ' 字 · 已自动保存';
    });
    draw();
  }
});

/* ---------------- 4. 番茄钟 ---------------- */
T({ id: 'pomodoro', name: '番茄钟', cat: 'life', icon: '茄', tint: '#ECD9E8',
  desc: '专注 / 休息倒计时，结束提示音', tags: '番茄钟 专注 计时 倒计时 工作法 Pomodoro',
  note: '离开页面会自动停止计时。声音由系统合成，需先点「开始」以激活音频。',
  custom: function (host, api) {
    host.innerHTML = akCard('',
      '<div style="text-align:center;padding:10px 0 6px"><div id="pd-state" style="font-size:13px;font-weight:700;color:var(--primary);letter-spacing:1px">专注时间</div>' +
      '<div id="pd-time" style="font-size:64px;font-weight:800;letter-spacing:2px;line-height:1.25;font-variant-numeric:tabular-nums">25:00</div>' +
      '<div id="pd-round" style="font-size:12px;color:var(--on-surface-variant)">第 1 个番茄</div></div>' +
      '<div class="field-row" style="margin-top:14px">' +
      '<div class="field"><label>专注（分钟）</label><input class="input" type="number" id="pd-work" value="25" min="1" max="120"></div>' +
      '<div class="field"><label>休息（分钟）</label><input class="input" type="number" id="pd-rest" value="5" min="1" max="60"></div></div>' +
      '<div class="btn-row"><button class="btn full" data-pd="start">开始</button>' +
      '<button class="btn tonal" data-pd="pause">暂停</button>' +
      '<button class="btn outline" data-pd="reset">重置</button></div>' +
      '<div style="height:8px;border-radius:5px;background:var(--surface-container-high);overflow:hidden">' +
      '<div id="pd-bar" style="height:100%;width:0%;background:var(--primary);transition:width .3s"></div></div>');
    var timer = null, remain = 25 * 60, total = 25 * 60, running = false, focus = true, round = 1;
    function fmt(s) { return H.pad(Math.floor(s / 60)) + ':' + H.pad(s % 60); }
    function draw() {
      var t = host.querySelector('#pd-time'); if (!t) return;
      t.textContent = fmt(remain);
      host.querySelector('#pd-state').textContent = focus ? '专注时间' : '短暂休息';
      host.querySelector('#pd-round').textContent = '第 ' + round + ' 个番茄';
      host.querySelector('#pd-bar').style.width = Math.max(0, Math.min(100, (1 - remain / total) * 100)) + '%';
      host.querySelector('[data-pd="start"]').textContent = running ? '进行中…' : (remain < total ? '继续' : '开始');
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } running = false; }
    function tick() {
      if (!akAlive(host)) { stop(); return; }
      remain--;
      if (remain <= 0) {
        stop(); akBeep(880, 260);
        api.toast(focus ? '专注完成，休息一下' : '休息结束，继续加油');
        focus = !focus;
        if (focus) round++;
        var mins = Math.max(1, Math.min(120, Number(host.querySelector(focus ? '#pd-work' : '#pd-rest').value) || (focus ? 25 : 5)));
        total = remain = mins * 60;
      }
      draw();
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pd]'); if (!b) return;
      var a = b.getAttribute('data-pd');
      if (a === 'start') {
        if (running) return;
        var mins = Math.max(1, Math.min(120, Number(host.querySelector('#pd-work').value) || 25));
        if (!timer) { total = remain = mins * 60; focus = true; }
        running = true; timer = setInterval(tick, 1000); draw();
      } else if (a === 'pause') { stop(); draw(); }
      else if (a === 'reset') { stop(); round = 1; focus = true; total = remain = (Number(host.querySelector('#pd-work').value) || 25) * 60; draw(); }
    });
    draw();
  }
});

/* ---------------- 5. 计数器 / 计分板 ---------------- */
T({ id: 'counter', name: '计数器 / 计分板', cat: 'life', icon: '计', tint: '#ECD9E8',
  desc: '多组计数，比赛、打卡都能用', tags: '计数器 计分 计分板 打卡 比赛 统计',
  custom: function (host) {
    var items = akLS('counter', [{ name: '计数组 1', val: 0 }, { name: '计数组 2', val: 0 }]);
    host.innerHTML = akCard('', '<div id="ct-list"></div>' +
      '<div class="btn-row"><button class="btn tonal" data-ct="add">+ 添加一组</button>' +
      '<button class="btn outline" data-ct="zero">全部归零</button></div>');
    function draw() {
      var box = host.querySelector('#ct-list'); if (!box) return;
      box.innerHTML = items.map(function (it, i) {
        return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;padding:12px;border-radius:var(--radius-s);background:var(--surface-container-lowest);border:1px solid var(--outline-variant)">' +
          '<input class="input" style="flex:1;min-width:0;padding:9px 10px" data-ct="name" data-i="' + i + '" value="' + H.esc(it.name) + '">' +
          '<button class="btn sm tonal" style="min-width:44px;padding:0" data-ct="minus" data-i="' + i + '">−</button>' +
          '<b style="min-width:52px;text-align:center;font-size:22px;font-variant-numeric:tabular-nums">' + it.val + '</b>' +
          '<button class="btn sm" style="min-width:44px;padding:0" data-ct="plus" data-i="' + i + '">+</button>' +
          '<button class="btn sm outline" style="min-width:36px;padding:0" data-ct="del" data-i="' + i + '">×</button></div>';
      }).join('');
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ct]'); if (!b || b.getAttribute('data-ct') === 'name') return;
      var a = b.getAttribute('data-ct'), i = Number(b.getAttribute('data-i'));
      if (a === 'add') items.push({ name: '计数组 ' + (items.length + 1), val: 0 });
      else if (a === 'zero') items.forEach(function (x) { x.val = 0; });
      else if (a === 'del') { items.splice(i, 1); if (!items.length) items = [{ name: '计数组 1', val: 0 }]; }
      else if (a === 'plus') items[i].val++;
      else if (a === 'minus') items[i].val--;
      akLSSet('counter', items); draw();
      if (a === 'plus' || a === 'minus') akBeep(a === 'plus' ? 660 : 440, 40);
    });
    host.addEventListener('input', function (e) {
      var el = e.target;
      if (!el.getAttribute || el.getAttribute('data-ct') !== 'name') return;
      items[Number(el.getAttribute('data-i'))].name = el.value;
      akLSSet('counter', items);
    });
    draw();
  }
});

/* ---------------- 6. 2048 ---------------- */
T({ id: 'game2048', name: '2048 小游戏', cat: 'game', icon: '游', tint: '#E6DEF2',
  desc: '方向键 / 滑动合并数字', tags: '2048 小游戏 数字 益智 休闲 game',
  note: '电脑用方向键或 WASD，手机在棋盘上滑动。最高分保存在本机。',
  custom: function (host, api) {
    var best = akLS('2048best', 0), grid, score, over;
    host.innerHTML = akCard('',
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
      '<div><div style="font-size:11px;color:var(--on-surface-variant)">分数</div><b id="g-score" style="font-size:24px">0</b></div>' +
      '<div style="text-align:right"><div style="font-size:11px;color:var(--on-surface-variant)">最高分</div><b id="g-best" style="font-size:24px">' + best + '</b></div></div>' +
      '<div id="g-board" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px;border-radius:var(--radius-m);background:var(--surface-container-high);touch-action:none"></div>' +
      '<div class="btn-row" style="margin-top:14px"><button class="btn full" data-g="new">重新开始</button></div>' +
      '<div class="hint">方向键 / WASD 移动；手机请在棋盘上滑动。</div>');
    var board = host.querySelector('#g-board');
    function init() {
      grid = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
      score = 0; over = false; add(); add(); draw();
    }
    function add() {
      var empty = [], r, c;
      for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) if (!grid[r][c]) empty.push([r, c]);
      if (!empty.length) return;
      var p = empty[Math.floor(Math.random() * empty.length)];
      grid[p[0]][p[1]] = Math.random() < 0.9 ? 2 : 4;
    }
    function colors(v) {
      var m = { 2: '#EFE7DC', 4: '#F2E4C9', 8: '#F6D9A8', 16: '#F3C98C', 32: '#EEB27A', 64: '#E89A6B',
        128: '#E7DC8F', 256: '#DCD08A', 512: '#C8D9A0', 1024: '#A9D3B2', 2048: '#8FC7A6' };
      return m[v] || '#8FC7A6';
    }
    function draw() {
      if (!akAlive(host)) return;
      var html = '';
      for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
        var v = grid[r][c];
        html += '<div style="aspect-ratio:1;display:grid;place-items:center;border-radius:12px;font-weight:800;' +
          'font-size:' + (v >= 1024 ? 20 : v >= 128 ? 24 : 28) + 'px;color:#3A3428;background:' + (v ? colors(v) : 'var(--surface-container-low)') + '">' +
          (v || '') + '</div>';
      }
      board.innerHTML = html;
      host.querySelector('#g-score').textContent = score;
      if (score > best) { best = score; akLSSet('2048best', best); }
      host.querySelector('#g-best').textContent = best;
      if (over) board.innerHTML += '<div style="grid-column:1/-1;grid-row:1/-1;display:grid;place-items:center;' +
        'background:rgba(255,248,238,.86);border-radius:var(--radius-m);font-size:22px;font-weight:800;color:var(--primary)">游戏结束 · 得分 ' + score + '</div>';
    }
    function move(dir) {
      if (over) return;
      var lines = [], r, c;
      if (dir === 'left' || dir === 'right') {
        for (r = 0; r < 4; r++) lines.push(dir === 'left' ? grid[r].slice() : grid[r].slice().reverse());
      } else {
        for (c = 0; c < 4; c++) {
          var col = [];
          for (r = 0; r < 4; r++) col.push(dir === 'up' ? grid[r][c] : grid[3 - r][c]);
          lines.push(col);
        }
      }
      var changed = false;
      var merged = lines.map(function (line) {
        var nz = line.filter(function (x) { return x; }), out = [];
        for (var i = 0; i < nz.length; i++) {
          if (nz[i] === nz[i + 1]) { out.push(nz[i] * 2); score += nz[i] * 2; i++; }
          else out.push(nz[i]);
        }
        while (out.length < 4) out.push(0);
        return out;
      });
      for (var i2 = 0; i2 < 4; i2++) {
        for (var j = 0; j < 4; j++) {
          var nv;
          if (dir === 'left') nv = merged[i2][j];
          else if (dir === 'right') nv = merged[i2][3 - j];
          else if (dir === 'up') nv = merged[j][i2];
          else nv = merged[3 - j][i2];
          if (grid[i2][j] !== nv) changed = true;
          grid[i2][j] = nv;
        }
      }
      if (!changed) return;
      add();
      // 结束判定
      var can = false;
      for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) {
        if (!grid[r][c]) can = true;
        if (c < 3 && grid[r][c] === grid[r][c + 1]) can = true;
        if (r < 3 && grid[r][c] === grid[r + 1][c]) can = true;
      }
      if (!can) { over = true; api.toast('游戏结束，得分 ' + score); }
      draw();
    }
    function onKey(e) {
      if (!akAlive(host)) { document.removeEventListener('keydown', onKey); return; }
      if (!host.contains(document.activeElement) && document.activeElement && document.activeElement.tagName === 'INPUT') return;
      var map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
        a: 'left', d: 'right', w: 'up', s: 'down', A: 'left', D: 'right', W: 'up', S: 'down' };
      var d = map[e.key];
      if (!d) return;
      e.preventDefault(); e.stopPropagation(); move(d);
    }
    document.addEventListener('keydown', onKey);
    var sx = 0, sy = 0;
    board.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    board.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    }, { passive: true });
    host.addEventListener('click', function (e) {
      if (e.target.closest('[data-g="new"]')) init();
    });
    init();
  }
});

/* ---------------- 7. 井字棋 ---------------- */
T({ id: 'tictactoe', name: '井字棋', cat: 'game', icon: '棋', tint: '#E6DEF2',
  desc: '和电脑对弈三连棋', tags: '井字棋 三连棋 小游戏 人机 tic tac toe',
  note: '你执 × 先手，电脑执 ○。电脑会优先取胜、封堵、占中心与角。',
  custom: function (host, api) {
    var b = [0,0,0,0,0,0,0,0,0], stat = akLS('ttt', { win: 0, lose: 0, draw: 0 }), done = false;
    var WIN = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    host.innerHTML = akCard('',
      '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:12px;color:var(--on-surface-variant)">' +
      '<span>你 ×</span><span id="tt-stat">胜 0 · 平 0 · 负 0</span><span>电脑 ○</span></div>' +
      '<div id="tt-board" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:320px;margin:0 auto"></div>' +
      '<div id="tt-msg" style="text-align:center;font-weight:700;margin-top:14px;min-height:22px;color:var(--primary)"></div>' +
      '<div class="btn-row"><button class="btn full" data-tt="new">再来一局</button></div>');
    var board = host.querySelector('#tt-board');
    function winner(p) {
      for (var i = 0; i < WIN.length; i++) {
        var w = WIN[i];
        if (b[w[0]] === p && b[w[1]] === p && b[w[2]] === p) return w;
      }
      return null;
    }
    function draw() {
      if (!akAlive(host)) return;
      board.innerHTML = b.map(function (x, i) {
        return '<button class="tt-cell" data-tt="c" data-i="' + i + '" style="aspect-ratio:1;border-radius:14px;' +
          'background:var(--surface-container-low);font-size:38px;font-weight:800;color:' +
          (x === 1 ? 'var(--primary)' : '#7C3540') + '">' + (x === 1 ? '×' : x === 2 ? '○' : '') + '</button>';
      }).join('');
      host.querySelector('#tt-stat').textContent = '胜 ' + stat.win + ' · 平 ' + stat.draw + ' · 负 ' + stat.lose;
    }
    function finish(msg, kind) {
      done = true;
      stat[kind]++; akLSSet('ttt', stat);
      host.querySelector('#tt-msg').textContent = msg;
      draw();
    }
    function ai() {
      var i, w;
      for (i = 0; i < 9; i++) if (!b[i]) { b[i] = 2; w = winner(2); b[i] = 0; if (w) return i; }
      for (i = 0; i < 9; i++) if (!b[i]) { b[i] = 1; w = winner(1); b[i] = 0; if (w) return i; }
      if (!b[4]) return 4;
      var corners = [0, 2, 6, 8].filter(function (x) { return !b[x]; });
      if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
      var rest = []; for (i = 0; i < 9; i++) if (!b[i]) rest.push(i);
      return rest.length ? rest[Math.floor(Math.random() * rest.length)] : -1;
    }
    host.addEventListener('click', function (e) {
      var el = e.target.closest('[data-tt]'); if (!el) return;
      if (el.getAttribute('data-tt') === 'new') {
        b = [0,0,0,0,0,0,0,0,0]; done = false;
        host.querySelector('#tt-msg').textContent = ''; draw(); return;
      }
      if (done) return;
      var i = Number(el.getAttribute('data-i'));
      if (b[i]) return;
      b[i] = 1;
      if (winner(1)) { finish('你赢了！', 'win'); return; }
      if (!b.filter(function (x) { return !x; }).length) { finish('平局', 'draw'); return; }
      var m = ai();
      if (m >= 0) b[m] = 2;
      if (winner(2)) { finish('电脑赢了，再来一局？', 'lose'); return; }
      if (!b.filter(function (x) { return !x; }).length) { finish('平局', 'draw'); return; }
      draw();
      host.querySelector('#tt-msg').textContent = '轮到你了';
    });
    draw();
    host.querySelector('#tt-msg').textContent = '轮到你了';
  }
});

/* ---------------- 8. 反应速度测试 ---------------- */
T({ id: 'reaction', name: '反应速度测试', cat: 'game', icon: '快', tint: '#E6DEF2',
  desc: '五轮测速，看看你有多快', tags: '反应 速度 测试 手速 小游戏 毫秒',
  note: '屏幕变绿后再点击；提前点击算抢跑，需要重来本轮。',
  custom: function (host) {
    var times = [], state = 'idle', t0 = 0, timer = null;
    host.innerHTML = akCard('',
      '<div id="rx-stage" style="height:210px;border-radius:var(--radius-m);display:grid;place-items:center;text-align:center;' +
      'background:var(--surface-container-high);color:var(--on-surface);font-size:19px;font-weight:700;user-select:none;cursor:pointer;padding:16px">' +
      '点击这里开始</div>' +
      '<div style="margin-top:14px" id="rx-info"></div>' +
      '<div class="btn-row"><button class="btn tonal full" data-rx="reset">重新测试</button></div>');
    var stage = host.querySelector('#rx-stage');
    function info() {
      var html = '<div class="kv"><span>已完成</span><span>' + times.length + ' / 5 次</span></div>';
      if (times.length) {
        var avg = times.reduce(function (a, b) { return a + b; }, 0) / times.length;
        html += '<div class="kv"><span>平均反应</span><span>' + Math.round(avg) + ' ms</span></div>';
        html += '<div class="kv"><span>最快</span><span>' + Math.min.apply(null, times) + ' ms</span></div>';
        html += '<div class="kv"><span>本次记录</span><span>' + times.join(' / ') + ' ms</span></div>';
        if (times.length === 5) {
          var level = avg < 200 ? '职业级，快得离谱' : avg < 280 ? '相当敏捷' : avg < 400 ? '正常水平' : '放松点，再试一次';
          html += '<div style="margin-top:12px;padding:12px;border-radius:14px;background:#C7ECCB;color:#2E6B3E;font-weight:700">' + level + '</div>';
        }
      }
      host.querySelector('#rx-info').innerHTML = html;
    }
    function idle(text, bg) {
      state = 'idle';
      stage.style.background = bg || 'var(--surface-container-high)';
      stage.style.color = bg ? '#fff' : 'var(--on-surface)';
      stage.innerHTML = text;
    }
    function startRound() {
      if (!akAlive(host)) { if (timer) clearTimeout(timer); return; }
      if (times.length >= 5) { idle('测试完成，点「重新测试」再来'); info(); return; }
      state = 'wait';
      stage.style.background = '#F3C98C'; stage.style.color = '#3A3428';
      stage.innerHTML = '等待变绿…<div style="font-size:12px;font-weight:400;margin-top:8px">千万别抢跑</div>';
      timer = setTimeout(function () {
        if (!akAlive(host)) return;
        if (state !== 'wait') return;
        state = 'go'; t0 = Date.now();
        stage.style.background = '#8FC7A6'; stage.style.color = '#fff';
        stage.innerHTML = '现在点！';
        akBeep(1000, 60);
      }, 900 + Math.random() * 2600);
    }
    stage.addEventListener('click', function () {
      if (times.length >= 5) return;
      if (state === 'idle') { startRound(); return; }
      if (state === 'wait') {
        clearTimeout(timer); state = 'idle';
        stage.style.background = '#F3DCDD'; stage.style.color = '#7C3540';
        stage.innerHTML = '抢跑了，点击重试';
        return;
      }
      if (state === 'go') {
        var ms = Date.now() - t0;
        times.push(ms);
        idle('很好，' + ms + ' ms<br><div style="font-size:13px;font-weight:400;margin-top:8px">点击开始下一轮</div>');
        info();
      }
    });
    host.addEventListener('click', function (e) {
      if (e.target.closest('[data-rx="reset"]')) {
        if (timer) clearTimeout(timer);
        times = []; idle('点击这里开始'); info();
      }
    });
    info();
  }
});

/* ---------------- 9. 节拍器 ---------------- */
T({ id: 'metronome', name: '节拍器', cat: 'game', icon: '拍', tint: '#E6DEF2',
  desc: '可调 BPM 与拍号的电子节拍器', tags: '节拍器 节拍 BPM 音乐 节奏 metronome',
  note: '声音由本机合成。离开页面会自动停止。',
  custom: function (host) {
    var timer = null, bpm = 100, beats = 4, count = 0;
    host.innerHTML = akCard('',
      '<div style="text-align:center;padding:8px 0 14px"><div id="mt-bpm" style="font-size:56px;font-weight:800;line-height:1.1">100</div>' +
      '<div style="font-size:12px;color:var(--on-surface-variant)">BPM · 每分钟拍数</div>' +
      '<div id="mt-dots" style="display:flex;justify-content:center;gap:10px;margin-top:16px"></div></div>' +
      '<div class="field"><label>速度</label><input type="range" id="mt-range" min="30" max="240" value="100">' +
      '<div class="hint" id="mt-label">100 BPM</div></div>' +
      '<div class="field"><label>拍号</label><select class="input" id="mt-beats">' +
      '<option value="2">2 / 4</option><option value="3">3 / 4</option><option value="4" selected>4 / 4</option><option value="6">6 / 8</option></select></div>' +
      '<div class="btn-row"><button class="btn full" data-mt="toggle">开始</button></div>');
    var range = host.querySelector('#mt-range');
    function drawDots() {
      var box = host.querySelector('#mt-dots'); if (!box) return;
      var h = '';
      for (var i = 0; i < beats; i++) {
        h += '<span style="width:16px;height:16px;border-radius:50%;background:' +
          (i === count % beats ? 'var(--primary)' : 'var(--surface-container-high)') + '"></span>';
      }
      box.innerHTML = h;
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      host.querySelector('[data-mt="toggle"]').textContent = '开始';
      count = 0; drawDots();
    }
    function start() {
      if (timer) return;
      host.querySelector('[data-mt="toggle"]').textContent = '停止';
      timer = setInterval(function () {
        if (!akAlive(host)) { stop(); return; }
        akBeep(count % beats === 0 ? 1200 : 800, 45, 'square');
        count++; drawDots();
      }, Math.round(60000 / bpm));
    }
    host.addEventListener('click', function (e) {
      if (!e.target.closest('[data-mt="toggle"]')) return;
      if (timer) stop(); else start();
    });
    range.addEventListener('input', function () {
      bpm = Number(range.value);
      host.querySelector('#mt-bpm').textContent = bpm;
      host.querySelector('#mt-label').textContent = bpm + ' BPM';
      if (timer) { clearInterval(timer); timer = null; start(); }
    });
    host.querySelector('#mt-beats').addEventListener('change', function (e) {
      beats = Number(e.target.value); count = 0; drawDots();
    });
    // 快捷微调
    host.querySelector('#mt-bpm').addEventListener('click', function () {
      bpm = Math.max(30, Math.min(240, bpm + 10));
      range.value = bpm; host.querySelector('#mt-bpm').textContent = bpm;
      host.querySelector('#mt-label').textContent = bpm + ' BPM';
    });
    drawDots();
  }
});
