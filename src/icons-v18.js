/* ============================================================
   安空工具箱 — v1.8 新增工具图标映射
   复用已有图标名（akToolIcon 只认 AK_ICON_MAP，不读 icon 字段）
   ============================================================ */
(function () {
  var M = {
    ocrtext: 'eye',
    imgrotate: 'refresh',
    imginfo: 'info',
    imghash: 'hash',
    touchtest: 'hand',
    graytest: 'gradient',
    stopwatch: 'timer',
    timer: 'countdown',
    browser: 'globe',
    caseconvert: 'translate',
    textclean: 'replace'
  };
  if (typeof AK_ICON_MAP === 'object' && AK_ICON_MAP) {
    for (var k in M) {
      if (Object.prototype.hasOwnProperty.call(M, k)) AK_ICON_MAP[k] = M[k];
    }
  }
})();
