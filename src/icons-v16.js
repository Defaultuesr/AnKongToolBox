/* ============================================================
   安空工具箱 — v1.6 新增 50 个工具的图标映射
   在 icons.js 之后加载，合并进 AK_ICON_MAP
   ============================================================ */
(function () {
  var M = {
    /* 文本效率 */
    fullhalf: 'translate', markdowntoc: 'list', textsplit: 'scissors',
    emojicode: 'smile', cjkpunct: 'quote', stringesc: 'code',
    csvclean: 'table', repeatfind: 'search',
    /* 开发者 */
    urlparams: 'link', regexbatch: 'regex', sqlparams: 'database',
    htmlattr: 'code', uuidbatch: 'hash', checksum: 'hash',
    base58: 'cube', codepoints: 'text', jsonstat: 'chart', cronnext: 'clock',
    /* 计算换算 */
    unitflow: 'speed', tempconv: 'flask', angleconv: 'compass',
    powercalc: 'battery', loancompare: 'home2', margin: 'coin',
    agecalc: 'calendar', matrix: 'grid',
    /* 生活 */
    seatgroup: 'person', drawlots: 'dice', sleepcycle: 'moon',
    debtsimplify: 'receipt', rentutil: 'cart', movingbox: 'cube', studyplan: 'book',
    /* 查询速查 */
    httpmethod: 'globe', keycode: 'device', dynasty: 'history',
    siprefix: 'ruler', magicnum: 'doc', emergency: 'phone', colorname: 'palette',
    /* 媒体 / 前端 */
    cssclip: 'crop', wavegen: 'wave', asciiart: 'text',
    htmltable: 'table', spritepos: 'image',
    /* 设备测评 */
    ipv6tool: 'network', dnsref: 'wifi', batterytime: 'battery',
    /* 互动 */
    wordchain: 'quote', diceprob: 'chart'
  };
  if (typeof AK_ICON_MAP === 'object' && AK_ICON_MAP) {
    for (var k in M) if (Object.prototype.hasOwnProperty.call(M, k)) AK_ICON_MAP[k] = M[k];
  }
})();
