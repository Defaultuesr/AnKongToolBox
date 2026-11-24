/* v2.7 新工具图标映射 */
(function () {
  var M = {
    m3Palette: 'palette',
    contrastCheck: 'contrast',
    uuidGen: 'key',
    loremGen: 'text',
    hexRgb: 'palette',
    strTransform: 'text'
  };
  var K = AK_ICON_MAP || (AK_ICON_MAP = {});
  for (var k in M) if (M.hasOwnProperty(k)) K[k] = M[k];
})();
