/* v2.2 移植暮光工具箱数据资源的新工具图标映射 */
(function () {
  var M = {
    periodicTable: 'table',
    catGuide: 'heart',
    oneStroke: 'brush'
  };
  var K = AK_ICON_MAP || (AK_ICON_MAP = {});
  for (var k in M) if (M.hasOwnProperty(k)) K[k] = M[k];
})();
