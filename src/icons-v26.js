/* v2.6 新工具图标映射 */
(function () {
  var M = {
    hashCrack: 'key',
    colorHarmony: 'palette',
    cronExplain: 'clock',
    baseNConvert: 'hash',
    morseCode: 'radio',
    textStats: 'chart'
  };
  var K = AK_ICON_MAP || (AK_ICON_MAP = {});
  for (var k in M) if (M.hasOwnProperty(k)) K[k] = M[k];
})();
