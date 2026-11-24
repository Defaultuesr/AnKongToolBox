/* ============================================================
   安空工具箱 — v1.8 工具包（三）
   大小写转换 · 文本清洗 · 亲戚称呼关系表扩充
   纯本地离线，ES5 兼容
   ============================================================ */
(function () {
'use strict';

function esc(s) { return H.esc(s == null ? '' : String(s)); }
function PRE(s) {
  return '<pre style="white-space:pre-wrap;word-break:break-all;font:12.5px/1.7 ui-monospace,Menlo,Consolas,monospace;margin:0;padding:8px 10px;background:var(--surface-container-low);border-radius:10px">' + esc(s) + '</pre>';
}
function SEC(t) { return '<div class="sec-label" style="margin-top:14px">' + esc(t) + '</div>'; }

/* ============================================================
   10. 大小写转换
   ============================================================ */
function splitWords(s) {
  return String(s).replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/).filter(function (x) { return x !== ''; });
}
function cap(w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); }

T({ id: 'caseconvert', name: '大小写转换', cat: 'text', icon: '🔠', tint: '#DCE9D3',
  desc: '全大写 / 全小写 / 句首 / 每词首字母 / 驼峰 / 下划线 / 连字符 / 大小写互换',
  tags: '大小写 大写 小写 驼峰 下划线 连字符 命名 转换 文本',
  note: '驼峰、下划线、连字符等命名转换主要针对英文与拼音；纯中文文本会原样保留。',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 5,
      value: 'hello world\nankong toolbox 2026' },
    { k: 'mode', label: '转换方式', type: 'select', value: 'upper', options: [
      ['upper', '全部大写 UPPER'], ['lower', '全部小写 lower'],
      ['sentence', '每行句首大写'], ['title', '每个单词首字母大写'],
      ['camel', '小驼峰 camelCase'], ['pascal', '大驼峰 PascalCase'],
      ['snake', '下划线 snake_case'], ['kebab', '连字符 kebab-case'],
      ['toggle', '大小写互换']
    ] }
  ],
  live: true,
  run: function (v) {
    var s = String(v.text == null ? '' : v.text), raw = s, out = '', m = v.mode;
    var lines = s.replace(/\r\n/g, '\n').split('\n');
    if (m === 'upper') out = s.toUpperCase();
    else if (m === 'lower') out = s.toLowerCase();
    else if (m === 'toggle') {
      out = s.replace(/[A-Za-z]/g, function (c) { return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase(); });
    } else if (m === 'sentence') {
      out = lines.map(function (l) { return l.charAt(0).toUpperCase() + l.slice(1); }).join('\n');
    } else if (m === 'title') {
      out = s.replace(/[A-Za-z]+/g, function (w) { return cap(w); });
    } else {
      var w = splitWords(s);
      if (!w.length) out = s;
      else if (m === 'camel') out = w[0].toLowerCase() + w.slice(1).map(cap).join('');
      else if (m === 'pascal') out = w.map(cap).join('');
      else if (m === 'snake') out = w.map(function (x) { return x.toLowerCase(); }).join('_');
      else if (m === 'kebab') out = w.map(function (x) { return x.toLowerCase(); }).join('-');
      else out = s;
    }
    var modeName = '';
    [['upper', '全部大写'], ['lower', '全部小写'], ['sentence', '每行句首大写'], ['title', '每词首字母大写'],
     ['camel', '小驼峰'], ['pascal', '大驼峰'], ['snake', '下划线'], ['kebab', '连字符'], ['toggle', '大小写互换']]
      .forEach(function (x) { if (x[0] === m) modeName = x[1]; });
    return {
      html: H.kv([['转换方式', esc(modeName)], ['原始字符数', String(raw.length)],
        ['结果字符数', String(out.length)], ['单词 / 分词数', String(splitWords(s).length)]], '转换信息') +
        SEC('转换结果') + PRE(out),
      text: out
    };
  }
});

/* ============================================================
   11. 文本清洗（组合式整理）
   ============================================================ */
T({ id: 'textclean', name: '文本清洗', cat: 'text', icon: '🧹', tint: '#DCE9D3',
  desc: '一键去空行、合并 / 去除换行、去除空白、去重行、统一空格与段落重排，可自由组合',
  tags: '文本 清洗 去空行 去除换行 去除空白 去重行 空格 排版 整理',
  note: '多个开关可同时开启，按预设顺序依次处理；「一键整理」会忽略其他开关，直接做一次成套整理。',
  fields: [
    { k: 'text', label: '原始文本', type: 'textarea', rows: 7,
      value: '  第一行文字　带全角空格  \n\n\n第二行文字\n第二行文字\n\n第三段\n被换行拆开\n的文字  ' },
    { k: 'fwspace', label: '全角空格转半角', type: 'switch', value: true },
    { k: 'trim', label: '去除每行首尾空格', type: 'switch', value: true },
    { k: 'space1', label: '合并连续空格', type: 'switch', value: true },
    { k: 'noempty', label: '删除空行', type: 'switch', value: true },
    { k: 'uniq', label: '删除重复行', type: 'switch', value: false },
    { k: 'merge', label: '合并段内换行', type: 'switch', value: false },
    { k: 'nonl', label: '去除所有换行（合成一段）', type: 'switch', value: false },
    { k: 'nospace', label: '去除所有空格 / 制表符', type: 'switch', value: false },
    { k: 'all', label: '一键整理（忽略以上开关）', type: 'switch', value: false }
  ],
  run: function (v) {
    var before = String(v.text == null ? '' : v.text), out = before, applied = [];
    var clean = window.AK_CLEAN_OP;
    if (!clean) throw new Error('文本整理模块未加载');
    if (v.all) { out = clean('all', out); applied.push('一键整理'); }
    else {
      var ops = [
        ['fwspace', '全角空格转半角'], ['trim', '去首尾空格'], ['space1', '合并连续空格'],
        ['noempty', '删除空行'], ['uniq', '删除重复行'], ['merge', '合并段内换行'],
        ['nonl', '去除所有换行'], ['nospace', '去除所有空白']
      ];
      ops.forEach(function (o) { if (v[o[0]]) { out = clean(o[0], out); applied.push(o[1]); } });
    }
    if (!applied.length) throw new Error('请至少开启一种整理操作');
    var bl = before ? before.split('\n').length : 0, al = out ? out.split('\n').length : 0;
    return {
      html: H.kv([
        ['已执行操作', esc(applied.join(' → '))],
        ['字符数', String(before.length) + ' → ' + String(out.length)],
        ['行数', String(bl) + ' → ' + String(al)],
        ['不含空白字符', String(before.replace(/\s/g, '').length) + ' → ' + String(out.replace(/\s/g, '').length)]
      ], '整理统计') + SEC('整理前') + PRE(before) + SEC('整理后') + PRE(out),
      text: out
    };
  }
});

/* ============================================================
   12. 亲戚称呼关系表扩充（增强既有 relative 工具）
   ============================================================ */
(function () {
  var MORE = {
    /* 直系与口语简称 */
    '爸爸': '父亲', '妈妈': '母亲', '爷爷': '祖父', '奶奶': '祖母',
    '外公': '外祖父 / 姥爷', '外婆': '外祖母 / 姥姥', '姥爷': '外祖父', '姥姥': '外祖母',
    '儿子': '儿子', '女儿': '女儿', '丈夫': '老公 / 配偶', '妻子': '老婆 / 配偶',
    /* 父系兄弟姐妹及其配偶 */
    '爸爸的哥哥': '伯父 / 大伯 / 大爷', '爸爸的弟弟': '叔叔', '爸爸的姐姐': '姑妈 / 姑姑', '爸爸的妹妹': '姑姑 / 小姑',
    '爸爸的哥哥的妻子': '伯母 / 大娘', '爸爸的弟弟的妻子': '婶婶 / 婶子',
    '爸爸的姐姐的丈夫': '姑父', '爸爸的妹妹的丈夫': '姑父',
    '伯父的儿子': '堂哥 / 堂弟', '伯父的女儿': '堂姐 / 堂妹',
    '叔叔的儿子': '堂哥 / 堂弟', '叔叔的女儿': '堂姐 / 堂妹',
    '姑妈的儿子': '表哥 / 表弟', '姑妈的女儿': '表姐 / 表妹',
    '姑姑的儿子': '表哥 / 表弟', '姑姑的女儿': '表姐 / 表妹',
    /* 母系兄弟姐妹及其配偶 */
    '妈妈的哥哥': '舅舅', '妈妈的弟弟': '舅舅 / 小舅', '妈妈的姐姐': '姨妈 / 姨', '妈妈的妹妹': '小姨 / 姨',
    '妈妈的哥哥的妻子': '舅妈 / 舅母', '妈妈的弟弟的妻子': '舅妈',
    '妈妈的姐姐的丈夫': '姨父', '妈妈的妹妹的丈夫': '姨父',
    '舅舅的儿子': '表哥 / 表弟', '舅舅的女儿': '表姐 / 表妹',
    '姨妈的儿子': '表哥 / 表弟', '姨妈的女儿': '表姐 / 表妹',
    '小姨的儿子': '表哥 / 表弟', '小姨的女儿': '表姐 / 表妹',
    /* 祖辈的兄弟姐妹 */
    '爷爷的哥哥': '伯祖父 / 大爷爷', '爷爷的弟弟': '叔祖父 / 小爷爷', '爷爷的姐姐': '姑祖母 / 姑奶奶', '爷爷的妹妹': '姑奶奶',
    '奶奶的哥哥': '舅祖父 / 舅爷爷', '奶奶的弟弟': '舅爷爷', '奶奶的姐妹': '姨祖母 / 姨奶奶',
    '外公的哥哥': '外伯祖父', '外公的弟弟': '外叔祖父', '外公的姐妹': '外姑祖母',
    '外婆的兄弟': '外舅祖父', '外婆的姐妹': '外姨祖母',
    '爷爷的爸爸': '曾祖父 / 太爷爷', '爷爷的妈妈': '曾祖母 / 太奶奶',
    '奶奶的爸爸': '曾外祖父', '奶奶的妈妈': '曾外祖母',
    '外公的爸爸': '外曾祖父', '外婆的妈妈': '外曾祖母',
    '曾祖父的爸爸': '高祖父', '曾祖父的妈妈': '高祖母',
    /* 平辈及其配偶与子女 */
    '哥哥': '哥哥 / 兄长', '姐姐': '姐姐', '弟弟': '弟弟', '妹妹': '妹妹',
    '哥哥的妻子': '嫂子 / 嫂嫂', '弟弟的妻子': '弟媳 / 弟妹',
    '姐姐的丈夫': '姐夫', '妹妹的丈夫': '妹夫',
    '哥哥的儿子': '侄子', '哥哥的女儿': '侄女',
    '弟弟的儿子': '侄子', '弟弟的女儿': '侄女',
    '姐姐的儿子': '外甥', '姐姐的女儿': '外甥女',
    '妹妹的儿子': '外甥', '妹妹的女儿': '外甥女',
    '堂哥': '堂兄', '堂弟': '堂弟', '堂姐': '堂姐', '堂妹': '堂妹',
    '表哥': '表兄', '表弟': '表弟', '表姐': '表姐', '表妹': '表妹',
    /* 配偶方 */
    '丈夫的爸爸': '公公 / 爸爸', '丈夫的妈妈': '婆婆 / 妈妈',
    '妻子的爸爸': '岳父 / 爸爸', '妻子的妈妈': '岳母 / 妈妈',
    '丈夫的哥哥': '大伯子', '丈夫的弟弟': '小叔子', '丈夫的姐姐': '大姑子', '丈夫的妹妹': '小姑子',
    '妻子的哥哥': '大舅子', '妻子的弟弟': '小舅子', '妻子的姐姐': '大姨子', '妻子的妹妹': '小姨子',
    '丈夫的哥哥的妻子': '妯娌', '丈夫的弟弟的妻子': '妯娌',
    '丈夫的姐妹的丈夫': '姑爷 / 连襟', '妻子的姐妹的丈夫': '连襟 / 襟兄弟',
    '大伯子的妻子': '妯娌', '小叔子的妻子': '妯娌',
    '妻子的兄弟的妻子': '舅嫂', '丈夫的姐妹': '大姑子 / 小姑子',
    /* 子辈与孙辈 */
    '儿子的妻子': '儿媳 / 儿媳妇', '女儿的丈夫': '女婿',
    '儿子的儿子': '孙子', '儿子的女儿': '孙女', '女儿的儿子': '外孙', '女儿的女儿': '外孙女',
    '儿媳的儿子': '孙子', '女婿的女儿': '外孙女',
    '孙子的儿子': '曾孙', '孙子的女儿': '曾孙女',
    '外孙的儿子': '外曾孙', '孙女的儿子': '曾外孙',
    '孙子的妻子': '孙媳妇', '孙女的丈夫': '孙女婿',
    /* 常见复合链 */
    '爸爸的儿子的妻子': '嫂子 / 弟媳 / 自己（若为本人）', '妈妈的女儿的丈夫': '姐夫 / 妹夫 / 自己（若为本人）',
    '爸爸的爸爸的哥哥': '伯祖父', '爸爸的妈妈的姐妹': '姨祖母',
    '妈妈的爸爸的兄弟': '外伯祖父 / 外叔祖父', '妈妈的妈妈的姐妹': '外姨祖母',
    '爷爷的儿子的爸爸': '爷爷', '奶奶的儿子的爸爸': '爷爷',
    '儿子的爸爸': '自己 / 丈夫', '女儿的妈妈': '自己 / 妻子',
    '爸爸的哥哥的儿子': '堂哥 / 堂弟', '妈妈的姐妹的女儿': '表姐 / 表妹',
    '伯父的妻子': '伯母', '叔叔的丈夫': '婶婶（通常为妻子）', '舅舅的妻子': '舅妈', '姨妈的丈夫': '姨父'
  };
  if (typeof RELATIVES === 'object' && RELATIVES) {
    for (var k in MORE) {
      if (Object.prototype.hasOwnProperty.call(MORE, k)) RELATIVES[k] = MORE[k];
    }
  }
})();

})();
