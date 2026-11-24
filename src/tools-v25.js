/* ============================================================
   安空工具箱 v2.5 — 新增 6 个离线工具
   1. 逻辑门真值表  2. 编辑距离  3. 罗马数字转换
   4. 复数运算      5. 线性方程组  6. BMI 与基础代谢
   全部本地运行，无网络请求，ES5 兼容写法
   ============================================================ */

function v25Esc(s) { return H.esc(s == null ? '' : String(s)); }
function v25R(html, text) {
  return { html: html, text: text == null
    ? String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s{2,}/g, ' ').trim()
    : String(text) };
}
function v25KV(rows) {
  return '<div class="kv-box">' + rows.map(function (r) {
    if (r == null) return '';
    return '<div class="kv"><span>' + v25Esc(r[0]) + '</span><span>' + v25Esc(r[1]) + '</span></div>';
  }).join('') + '</div>';
}

/* ---------------- 1. 逻辑门真值表 ---------------- */
T({ id: 'logicTruthTable', name: '逻辑门真值表', cat: 'dev', tint: '#D8EAE9',
  desc: '与或非异或等逻辑门真值表', tags: '逻辑门 真值表 与 或 非 异或 布尔 数字电路',
  fields: [
    { k: 'gate', label: '逻辑门', type: 'select', value: 'AND', options: [
      ['AND','与 AND'],['OR','或 OR'],['NOT','非 NOT'],['NAND','与非 NAND'],
      ['NOR','或非 NOR'],['XOR','异或 XOR'],['XNOR','同或 XNOR'],['IMPLIES','蕴含 A→B'] ] }
  ],
  run: function (v) {
    var g = v.gate || 'AND';
    function bit(x) { return x ? 1 : 0; }
    function calc(g, a, b) {
      switch (g) {
        case 'AND': return a && b;
        case 'OR': return a || b;
        case 'NOT': return !a;
        case 'NAND': return !(a && b);
        case 'NOR': return !(a || b);
        case 'XOR': return a !== b;
        case 'XNOR': return a === b;
        case 'IMPLIES': return (!a) || b;
      }
      return false;
    }
    var oneInput = (g === 'NOT');
    var head = oneInput ? ['A', 'Y'] : ['A', 'B', 'Y'];
    var rows = [], i;
    if (oneInput) {
      for (i = 0; i <= 1; i++) rows.push([bit(i), bit(calc(g, !!i, false))]);
    } else {
      for (i = 0; i <= 1; i++) for (var j = 0; j <= 1; j++)
        rows.push([bit(i), bit(j), bit(calc(g, !!i, !!j))]);
    }
    var table = '<table class="tb"><thead><tr>' + head.map(function (h) {
      return '<th>' + v25Esc(h) + '</th>';
    }).join('') + '</tr></thead><tbody>' + rows.map(function (r) {
      return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody></table>';
    var expr = {
      AND: 'Y = A · B', OR: 'Y = A + B', NOT: 'Y = ¬A', NAND: 'Y = ¬(A · B)',
      NOR: 'Y = ¬(A + B)', XOR: 'Y = A ⊕ B', XNOR: 'Y = ¬(A ⊕ B)', IMPLIES: 'Y = A → B'
    }[g] || '';
    return v25R('<div style="font-size:13px;color:var(--on-surface-variant);margin-bottom:8px">' + v25Esc(expr) + '</div>' + table,
      g + ' 逻辑门真值表 ' + expr);
  }});

/* ---------------- 2. 编辑距离 ---------------- */
T({ id: 'levenshtein', name: '编辑距离', cat: 'text', tint: '#DCE9D3',
  desc: 'Levenshtein 距离与相似度', tags: '编辑距离 相似度 levenshtein 字符串 比较 拼写',
  fields: [
    { k: 'a', label: '字符串 A', type: 'text', value: 'kitten', placeholder: '输入第一个字符串' },
    { k: 'b', label: '字符串 B', type: 'text', value: 'sitting', placeholder: '输入第二个字符串' }
  ],
  run: function (v) {
    var a = String(v.a || ''), b = String(v.b || '');
    var n = a.length, m = b.length, i, j;
    var d = [];
    for (i = 0; i <= n; i++) { d.push([]); d[i][0] = i; }
    for (j = 0; j <= m; j++) d[0][j] = j;
    for (i = 1; i <= n; i++) for (j = 1; j <= m; j++) {
      var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
    var dist = d[n][m];
    var max = Math.max(n, m);
    var sim = max === 0 ? 100 : (1 - dist / max) * 100;
    return v25R(v25KV([
      ['字符串 A', a], ['字符串 B', b],
      ['编辑距离', dist], ['最大长度', max],
      ['相似度', sim.toFixed(2) + '%']
    ]), '编辑距离 ' + dist + '，相似度 ' + sim.toFixed(2) + '%');
  }});

/* ---------------- 3. 罗马数字转换 ---------------- */
var V25_ROMAN = [
  [1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],
  [50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']
];
var V25_RMAP = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
T({ id: 'romanNumeral', name: '罗马数字转换', cat: 'calc', tint: '#F2E4C9',
  desc: '阿拉伯数字与罗马数字互转', tags: '罗马数字 转换 数字 阿拉伯数字 roman',
  fields: [
    { k: 'mode', label: '方向', type: 'select', value: 'n2r', options: [['n2r','数字 → 罗马'],['r2n','罗马 → 数字']] },
    { k: 'val', label: '输入', type: 'text', value: '2026', placeholder: '数字或罗马数字' }
  ],
  run: function (v) {
    var s = String(v.val || '').trim();
    if (!s) throw new Error('请输入内容');
    if (v.mode === 'r2n') {
      var up = s.toUpperCase();
      var total = 0, prev = 0, k;
      for (k = up.length - 1; k >= 0; k--) {
        var cur = V25_RMAP[up.charAt(k)];
        if (!cur) throw new Error('无效的罗马数字字符：' + up.charAt(k));
        if (cur < prev) total -= cur; else total += cur;
        prev = cur;
      }
      return v25R(v25KV([['罗马数字', up], ['阿拉伯数字', total]]), up + ' = ' + total);
    }
    var num = parseInt(s, 10);
    if (!isFinite(num) || num < 1 || num > 3999) throw new Error('请输入 1~3999 的整数');
    var out = '', i = 0;
    while (num >= V25_ROMAN[i][0]) { out += V25_ROMAN[i][1]; num -= V25_ROMAN[i][0]; }
    return v25R(v25KV([['阿拉伯数字', s], ['罗马数字', out]]), s + ' = ' + out);
  }});

/* ---------------- 4. 复数运算 ---------------- */
T({ id: 'complexCalc', name: '复数运算', cat: 'calc', tint: '#F2E4C9',
  desc: '复数加减乘除、模与共轭', tags: '复数 运算 加减乘除 模 共轭 complex',
  fields: [
    { k: 'op', label: '运算', type: 'select', value: 'add', options: [
      ['add','加法 +'],['sub','减法 −'],['mul','乘法 ×'],['div','除法 ÷'],['mod','模 |z|'],['conj','共轭 z̄'] ] },
    { k: 'a', label: 'Z1 实部', type: 'number', value: '3' },
    { k: 'b', label: 'Z1 虚部', type: 'number', value: '4' },
    { k: 'c', label: 'Z2 实部', type: 'number', value: '1' },
    { k: 'd', label: 'Z2 虚部', type: 'number', value: '-2' }
  ],
  run: function (v) {
    var a = parseFloat(v.a) || 0, b = parseFloat(v.b) || 0;
    var c = parseFloat(v.c) || 0, d = parseFloat(v.d) || 0;
    function fmt(x) { return (Math.round(x * 1e6) / 1e6).toString(); }
    function z(x, y) { return fmt(x) + (y < 0 ? ' − ' : ' + ') + fmt(Math.abs(y)) + 'i'; }
    var rows = [['Z1', z(a,b)]], res = '';
    if (v.op === 'mod') { res = fmt(Math.sqrt(a*a + b*b)); rows.push(['|Z1|', res]); }
    else if (v.op === 'conj') { res = z(a,-b); rows.push(['Z1 共轭', res]); }
    else {
      rows.push(['Z2', z(c,d)]);
      var x, y;
      switch (v.op) {
        case 'add': x = a + c; y = b + d; rows.push(['运算','加法']); break;
        case 'sub': x = a - c; y = b - d; rows.push(['运算','减法']); break;
        case 'mul': x = a*c - b*d; y = a*d + b*c; rows.push(['运算','乘法']); break;
        case 'div':
          var den = c*c + d*d;
          if (den === 0) throw new Error('除数不能为 0');
          x = (a*c + b*d) / den; y = (b*c - a*d) / den; rows.push(['运算','除法']); break;
        default: throw new Error('未知运算');
      }
      res = z(x,y); rows.push(['结果', res]);
    }
    return v25R(v25KV(rows), '复数运算结果：' + res);
  }});

/* ---------------- 5. 线性方程组（二元一次） ---------------- */
T({ id: 'linearEq2', name: '二元一次方程组', cat: 'calc', tint: '#F2E4C9',
  desc: '求解二元一次方程组', tags: '方程 线性 方程组 二元一次 克拉默 求解',
  fields: [
    { k: 'a1', label: '方程1 · a', type: 'number', value: '2' },
    { k: 'b1', label: '方程1 · b', type: 'number', value: '1' },
    { k: 'c1', label: '方程1 · c', type: 'number', value: '5' },
    { k: 'a2', label: '方程2 · a', type: 'number', value: '1' },
    { k: 'b2', label: '方程2 · b', type: 'number', value: '-1' },
    { k: 'c2', label: '方程2 · c', type: 'number', value: '1' }
  ],
  hint: '求解 a₁x + b₁y = c₁ 与 a₂x + b₂y = c₂',
  run: function (v) {
    var a1 = parseFloat(v.a1)||0, b1 = parseFloat(v.b1)||0, c1 = parseFloat(v.c1)||0;
    var a2 = parseFloat(v.a2)||0, b2 = parseFloat(v.b2)||0, c2 = parseFloat(v.c2)||0;
    var D = a1*b2 - a2*b1;
    function fmt(x) { return (Math.round(x * 1e6) / 1e6).toString(); }
    if (D === 0) {
      var Dx = c1*b2 - c2*b1, Dy = a1*c2 - a2*c1;
      var msg = (Dx === 0 && Dy === 0) ? '方程组有无穷多解（两方程等价）' : '方程组无解（两直线平行）';
      return v25R(v25KV([['行列式 D', 0], ['判定', msg]]), msg);
    }
    var x = (c1*b2 - c2*b1) / D;
    var y = (a1*c2 - a2*c1) / D;
    return v25R(v25KV([
      ['方程 1', fmt(a1)+'x + ('+fmt(b1)+')y = '+fmt(c1)],
      ['方程 2', fmt(a2)+'x + ('+fmt(b2)+')y = '+fmt(c2)],
      ['x', fmt(x)], ['y', fmt(y)]
    ]), 'x = ' + fmt(x) + ', y = ' + fmt(y));
  }});

/* ---------------- 6. BMI 与基础代谢 ---------------- */
T({ id: 'bmiBmr', name: 'BMI 与基础代谢', cat: 'life', tint: '#ECD9E8',
  desc: 'BMI 体脂指数与 BMR 基础代谢', tags: 'BMI 基础代谢 BMR 体重 身高 健康 卡路里',
  fields: [
    { k: 'gender', label: '性别', type: 'select', value: 'm', options: [['m','男'],['f','女']] },
    { k: 'weight', label: '体重 (kg)', type: 'number', value: '65' },
    { k: 'height', label: '身高 (cm)', type: 'number', value: '170' },
    { k: 'age', label: '年龄', type: 'number', value: '25' }
  ],
  run: function (v) {
    var w = parseFloat(v.weight), h = parseFloat(v.height), age = parseFloat(v.age);
    if (!(w > 0 && h > 0 && age > 0)) throw new Error('请填写有效的体重、身高与年龄');
    var hm = h / 100;
    var bmi = w / (hm * hm);
    var level = bmi < 18.5 ? '偏瘦' : bmi < 24 ? '正常' : bmi < 28 ? '偏胖' : '肥胖';
    // Mifflin-St Jeor 公式
    var bmr = 10 * w + 6.25 * h - 5 * age + (v.gender === 'f' ? -161 : 5);
    return v25R(v25KV([
      ['BMI', bmi.toFixed(2)], ['体型判定', level],
      ['BMR 基础代谢', bmr.toFixed(0) + ' kcal/天'],
      ['久坐 TDEE', (bmr*1.2).toFixed(0) + ' kcal/天'],
      ['中度活动 TDEE', (bmr*1.55).toFixed(0) + ' kcal/天']
    ]), 'BMI ' + bmi.toFixed(2) + '（' + level + '），基础代谢 ' + bmr.toFixed(0) + ' kcal/天');
  }});
