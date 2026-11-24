/* ============================================================
   安空工具箱 — v1.9 新工具图标映射（40 个）
   全部复用已有 SVG 图标名，无新增图标资源
   ============================================================ */
(function () {
  var M = {
    /* 数论与算法 */
    palnum: 'sparkle', kaprekar: 'calc', happynum: 'smile', primesieve: 'hash',
    gcdlcm: 'calc', radixconv: 'code', fracsimplify: 'percent', checkdigit: 'barcode',
    bigfact: 'calc', fibseq: 'chart', digitalroot: 'hash', permutation: 'percent',
    probcalc: 'scale', integration: 'chart',
    /* 文本处理与密码学 */
    textwrap: 'wraptext', indenttool: 'text', sortlines: 'sort', wordfreq: 'chart',
    ngram: 'text', readability: 'textcheck', hashviz: 'palette', bbcode: 'code',
    markdownesc: 'markdown', csvtomd: 'table', atbash: 'lock', affine: 'key',
    polybius: 'grid', morsetiming: 'radio',
    /* 开发运维与生活 */
    vercompare: 'gitcmd', cronexplain: 'clock', envmerge: 'code', jwtdecode: 'jwt',
    nanoid: 'key', colorharmony: 'palette', contrastcheck: 'eye', agecheck: 'calendar',
    timebudget: 'clock', batchconvert: 'unit', pomodoro2: 'timer', moneyupper: 'receipt'
  };
  if (typeof AK_ICON_MAP === 'object' && AK_ICON_MAP) {
    for (var k in M) if (Object.prototype.hasOwnProperty.call(M, k)) AK_ICON_MAP[k] = M[k];
  }
})();
