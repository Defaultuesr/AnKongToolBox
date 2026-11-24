/* v2.5 新工具图标映射 */
(function () {
  var M = {
    logicTruthTable: 'code',
    levenshtein: 'diff',
    romanNumeral: 'hash',
    complexCalc: 'calc',
    linearEq2: 'scale',
    bmiBmr: 'heart'
  };
  var K = AK_ICON_MAP || (AK_ICON_MAP = {});
  for (var k in M) if (M.hasOwnProperty(k)) K[k] = M[k];
})();
