/* v2.4 新工具图标映射 */
(function () {
  var M = {
    lotteryGen: 'gift',
    surnames: 'book',
    brailleConv: 'text',
    plateLookup: 'traffic',
    bodyFat: 'dumbbell',
    periodicQuiz: 'brain'
  };
  var K = AK_ICON_MAP || (AK_ICON_MAP = {});
  for (var k in M) if (M.hasOwnProperty(k)) K[k] = M[k];
})();
