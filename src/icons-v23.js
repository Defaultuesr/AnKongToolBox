/* v2.3 新工具图标映射 */
(function () {
  var M = {
    whatToEat: 'recipe',
    domainSuffix: 'network',
    imperialUnits: 'scale',
    openSourceLibs: 'code'
  };
  var K = AK_ICON_MAP || (AK_ICON_MAP = {});
  for (var k in M) if (M.hasOwnProperty(k)) K[k] = M[k];
})();
