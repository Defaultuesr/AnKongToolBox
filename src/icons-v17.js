/* ============================================================
   安空工具箱 — v1.7 新增 40 个工具的图标映射
   复用已有 SVG 图标库，不新增矢量资源
   ============================================================ */
(function () {
  var M = {
    /* 文本编码 9 */
    qpcode: 'htmlenc', uuencode: 'text', ascii85: 'code', rot47: 'lock',
    vigenere: 'key', baconcipher: 'lock', huffman: 'chart', rlecode: 'minify',
    textsim: 'diff',
    /* 开发者 9 */
    setcookie: 'httpheaders', datauri: 'img2base64', idparse: 'idcard',
    chmodcalc: 'terminal', html2md: 'markdown', glob2re: 'regex',
    diffformat: 'diff', cspgen: 'shield', regexexplain: 'regex',
    /* 计算换算 8 */
    primefact: 'calc', ieee754: 'code', modmath: 'calc', eqsolve: 'calc',
    seqcalc: 'chart', vectorcalc: 'scope', complexcalc: 'calc', sigfig: 'percent',
    /* 生活 5 */
    socialins: 'salary', creditcard: 'coin', laundry: 'list',
    nutrition: 'flask', baggage: 'packing',
    /* 媒体 3 */
    colorblind: 'eye', cssvar: 'palette', qrcap: 'qr',
    /* 设备测评 4 */
    chargeproto: 'battery', audiofmt: 'volume', frametime: 'timer', dbmcalc: 'wifi',
    /* 小游戏 2 */
    sudoku: 'grid', hanoi: 'layers'
  };
  if (typeof AK_ICON_MAP === 'object' && AK_ICON_MAP) {
    for (var k in M) if (Object.prototype.hasOwnProperty.call(M, k)) AK_ICON_MAP[k] = M[k];
  }
})();
