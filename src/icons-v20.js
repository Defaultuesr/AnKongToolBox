/* ============================================================
   安空工具箱 — v2.0 新工具图标映射（24 个）
   全部复用已有 SVG 图标名，无新增图标资源
   ============================================================ */
(function () {
  var M = {
    /* 数论与计算 */
    numbase: 'calc', primfact: 'hash', mobius: 'hash', eulerphi: 'calc',
    matrixdet: 'table', fraccalc: 'percent', moneyupper2: 'receipt',
    resistorcolor: 'palette', timeconv: 'clock', timeago: 'clock',
    /* 校验与开发 */
    luhncheck: 'barcode', crc16: 'code', regexdetect: 'regex',
    /* 文本与编码 */
    base32: 'code', unicodeEscape: 'text', cipherplayfair: 'lock',
    emailvalidate: 'textcheck', fuzzysearch: 'diff', pinyinInitials: 'phonetic',
    snakekebab: 'code', substring: 'text',
    /* 生活与查询 */
    phonelookup: 'phone', idcardcheck: 'idcard', dateDiff: 'calendar'
  };
  if (typeof AK_ICON_MAP === 'object' && AK_ICON_MAP) {
    for (var k in M) if (Object.prototype.hasOwnProperty.call(M, k)) AK_ICON_MAP[k] = M[k];
  }
})();
