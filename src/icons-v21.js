/* ============================================================
   安空工具箱 — v2.1 新工具图标映射（24 个）
   全部复用已有 SVG 图标名，无新增图标资源
   ============================================================ */
(function () {
  var M = {
    /* 位运算与数论 */
    graycode: 'code', bitcount: 'hash', hammingdist: 'diff', perfectnum: 'sparkle',
    narcissistic: 'sparkle', coprimeList: 'hash', sieveRange: 'hash',
    /* 代数与数列 */
    continuedFrac: 'calc', egyptianFraction: 'calc', quadraticSolve: 'calc',
    trigTable: 'chart', fibonacciIndex: 'chart', lucas: 'chart', catalan: 'calc',
    /* 几何与地理 */
    polarRect: 'compass', geoDistance: 'globe', bearingCalc: 'compass',
    /* 编码与语音 */
    soundex: 'text', metaphone: 'text', xorchecksum: 'code', paritybit: 'code',
    /* 财务与色彩 */
    vatsplit: 'receipt', percentchange: 'percent', rgbCmyk: 'palette'
  };
  if (typeof AK_ICON_MAP === 'object' && AK_ICON_MAP) {
    for (var k in M) if (Object.prototype.hasOwnProperty.call(M, k)) AK_ICON_MAP[k] = M[k];
  }
})();
