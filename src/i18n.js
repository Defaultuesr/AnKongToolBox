/* ============================================================
   安空工具箱 — 多语言运行时（i18n）
   思路：不改动任何工具源码，渲染后对 DOM 文本节点与展示型属性
        做翻译；繁体走「词汇 + 单字」全量转换，日/法/英走
        「精确短语优先 + 通用词表兜底」一次扫描替换。
   支持：zh-CN / zh-TW / ja / fr / en
         + de / es / ko / ru / pt / it / nl / tr / vi / id（AK_I18N_MORE 层）
   扩展语言走「精确整句 → 动态模式 → 词表一次扫描 → 英文列兜底」，
   任一环节仍有中文残留时回退完整英文，绝不输出中英混杂的破碎文本。
   ============================================================ */
(function () {
  'use strict';

  var DATA = window.AK_I18N_DATA || { rows: [], words: [] };
  var S2T = window.AK_S2T_DATA || { a: '', b: '', words: {} };

  /* ---------------- 语言列表 ---------------- */
  var LANGS = [
    { id: 'zh-CN', name: '简体中文',      short: '简' },
    { id: 'zh-TW', name: '繁體中文',      short: '繁' },
    { id: 'en',    name: 'English',       short: 'EN' },
    { id: 'ja',    name: '日本語',        short: '日' },
    { id: 'fr',    name: 'Français',      short: 'FR' },
    { id: 'de',    name: 'Deutsch',       short: 'DE' },
    { id: 'es',    name: 'Español',       short: 'ES' },
    { id: 'ko',    name: '한국어',         short: '한' },
    { id: 'ru',    name: 'Русский',       short: 'RU' },
    { id: 'pt',    name: 'Português',     short: 'PT' },
    { id: 'it',    name: 'Italiano',      short: 'IT' },
    { id: 'nl',    name: 'Nederlands',    short: 'NL' },
    { id: 'tr',    name: 'Türkçe',        short: 'TR' },
    { id: 'vi',    name: 'Tiếng Việt',    short: 'VI' },
    { id: 'id',    name: 'Bahasa Indonesia', short: 'ID' }
  ];
  var IDX = { en: 1, ja: 2, fr: 3 };
  var VALID = {};
  LANGS.forEach(function (l) { VALID[l.id] = 1; });

  /* ---------------- 框架层整句（优先级高于词表） ---------------- */
  var UI_ROWS = [
    ['安空工具箱', 'AnKong Toolbox', '安空ツールボックス', 'AnKong Toolbox'],
    ['搜索工具，例如：JSON / 图片压缩 / 单位换算', 'Search tools, e.g. JSON / image / units', 'ツールを検索（例：JSON / 画像圧縮 / 単位換算）', 'Rechercher un outil, ex. JSON / image / unités'],
    ['试试输入「压缩」「换算」「JSON」「二维码」「农历」', 'Try "compress", "convert", "JSON", "QR" or "lunar"', '「圧縮」「換算」「JSON」「QR」「農暦」で試してみてください', 'Essayez « compresser », « convertir », « JSON », « QR » ou « lunaire »'],
    ['打开任意工具，点击右上角的星标即可收藏，下次一秒直达。', 'Open any tool and tap the star to add it to favorites.', 'ツールを開いて右上の星をタップするとお気に入りに登録されます。', 'Ouvrez un outil et touchez l’étoile pour l’ajouter aux favoris.'],
    ['所有数据仅保存在本机，无需登录，也不会同步到云端。', 'All data stays on your device. No login, no cloud sync.', 'すべてのデータは端末内にのみ保存され、ログインやクラウド同期はありません。', 'Toutes les données restent sur l’appareil. Sans compte ni synchronisation.'],
    ['换个关键词试试', 'Try another keyword', '別のキーワードをお試しください', 'Essayez un autre mot-clé'],
    ['结果会显示在这里', 'Results appear here', '結果はここに表示されます', 'Les résultats s’affichent ici'],
    ['组件加载失败：', 'Component failed to load: ', 'コンポーネントの読み込みに失敗：', 'Échec du chargement du composant : '],
    ['主导航', 'Main navigation', 'メインナビゲーション', 'Navigation principale'],
    ['当前：', 'Current: ', '現在：', 'Actuel : '],
    ['更多在「设置」中', 'More in Settings', '詳細は「設定」で', 'Plus dans les paramètres'],
    ['个常用工具', ' favorites', ' 件のお気に入り', ' favoris'],
    ['条记录', ' records', ' 件の履歴', ' entrées'],
    ['个', '', '', ''],
    ['条', '', '', ''],
    ['搜索工具、名称或关键词', 'Search tools, names or keywords', 'ツール名やキーワードで検索', 'Rechercher un outil ou un mot-clé'],
    ['没有找到「', 'No results for “', '「', 'Aucun résultat pour « '],
    ['」', '”', '」', ' »'],
    ['常用工具', 'Frequently Used', 'よく使うツール', 'Outils fréquents'],
    ['最近使用', 'Recently Used', '最近使ったツール', 'Utilisés récemment'],
    ['聚合资源', 'Resource Hubs', 'リソースハブ', 'Hubs de ressources'],
    ['影音资源', 'Media', '映像・音楽', 'Médias'],
    ['玩机', 'Device & ROM', '端末いじり', 'Appareil & ROM'],
    ['解析', 'Link Parsing', 'リンク解析', 'Analyse de liens'],
    ['关于应用', 'About', 'アプリについて', 'À propos'],
    ['外观与个性化', 'Appearance', '外観とカスタマイズ', 'Apparence'],
    ['数据与隐私', 'Data & Privacy', 'データとプライバシー', 'Données et confidentialité'],
    ['通用', 'General', '一般', 'Général'],
    ['支持与反馈', 'Support & Feedback', 'サポートとフィードバック', 'Assistance et retours'],
    ['语言 / Language', 'Language', '言語', 'Langue'],
    ['界面语言', 'Display language', '表示言語', 'Langue d’affichage'],
    ['跟随系统', 'Follow system', 'システムに従う', 'Suivre le système'],
    ['切换语言', 'Switch language', '言語を切り替える', 'Changer de langue'],
    ['语言已切换', 'Language changed', '言語を切り替えました', 'Langue modifiée'],
    ['捐赠支持', 'Support & Donations', '支援・寄付について', 'Soutien et dons'],
    ['侵权处理', 'Copyright Complaints', '著作権侵害の申し立て', 'Réclamations de droits d’auteur'],
    ['隐私政策', 'Privacy Policy', 'プライバシーポリシー', 'Politique de confidentialité'],
    ['用户协议', 'Terms of Use', '利用規約', 'Conditions d’utilisation'],
    ['权限说明', 'Permissions', '権限の説明', 'Autorisations'],
    ['Cookie 管理', 'Cookie Management', 'Cookie の管理', 'Gestion des cookies'],
    ['下载管理', 'Download Manager', 'ダウンロード管理', 'Gestion des téléchargements'],
    ['缓存管理', 'Cache Management', 'キャッシュ管理', 'Gestion du cache'],
    ['检查更新', 'Check for Updates', 'アップデートを確認', 'Vérifier les mises à jour'],
    ['反馈', 'Feedback', 'フィードバック', 'Retours'],
    ['帮助', 'Help', 'ヘルプ', 'Aide'],
    ['加入官群', 'Join the Group', '公式グループに参加', 'Rejoindre le groupe'],
    ['设置', 'Settings', '設定', 'Paramètres'],
    ['关于', 'About', 'アプリについて', 'À propos'],
    ['收件人：', 'To: ', '宛先：', 'Destinataire : '],
    ['邮件标题建议写成', 'Suggested email subject: ', 'メールの件名は', 'Objet conseillé : '],
    ['（本反馈文本在本机生成，未自动发送；请复制到邮件发往 ', '(This feedback is generated on your device and not sent automatically. Please email it to ', '（このフィードバックは端末内で生成され、自動送信されません。次の宛先へメールで送ってください：', '(Ce retour est généré localement et n’est pas envoyé automatiquement. Veuillez l’envoyer à '],
    ['需在安空工具箱安卓客户端中使用', 'Available in the AnKong Toolbox Android app', '安空ツールボックス Android アプリでご利用ください', 'Disponible dans l’application Android AnKong Toolbox'],
    ['核心工具完全离线，输入内容不会离开设备', 'Core tools work fully offline; your input never leaves the device', '主要ツールは完全オフラインで、入力内容は端末外に送信されません', 'Les outils principaux fonctionnent hors ligne ; vos données ne quittent pas l’appareil'],
    ['仅使用相机(闪光灯)、振动、图片保存权限', 'Only camera (flash), vibration and image-save permissions are used', '使用する権限はカメラ（フラッシュ）・振動・画像保存のみです', 'Seules les autorisations caméra (flash), vibration et enregistrement d’images sont utilisées'],
    ['便签 / 计分 / 游戏最高分保存在本机 localStorage', 'Notes, scores and high scores are stored in local storage on this device', 'メモ・スコア・ハイスコアは端末内の localStorage に保存されます', 'Notes, scores et records sont stockés localement sur cet appareil'],
    ['个离线小工具，推荐给你', ' handy offline tools — give it a try', ' 個のオフラインツールが揃っています', ' outils hors ligne à découvrir'],
    ['填写后点「生成反馈文本」', 'Fill in the form and tap "Generate feedback"', '入力後「フィードバック文を生成」をタップ', 'Remplissez le formulaire puis touchez « Générer le retour »'],
    ['内容投诉', 'Content complaint', 'コンテンツの申し立て', 'Signalement de contenu'],
    ['功能建议', 'Feature request', '機能の提案', 'Suggestion de fonctionnalité'],
    ['问题反馈', 'Bug report', '不具合の報告', 'Signalement de bug'],
    ['其他', 'Other', 'その他', 'Autre']
  ];

  /* 含动态数字的句子：用捕获组回填，避免词表把数字句切碎 */
  var PATTERNS = [
    [/^(\d+)\s*个工具，全部离线可用$/, '$1 tools, all offline', '$1 個のツール、すべてオフライン', '$1 outils, tous hors ligne'],
    [/^(\d+)\s*个工具 · (\d+)\s*个分类$/, '$1 tools · $2 categories', '$1 個のツール · $2 個の分類', '$1 outils · $2 catégories'],
    [/^(\d+)\s*个工具$/, '$1 tools', '$1 個のツール', '$1 outils'],
    [/^(\d+)\s*个常用工具$/, '$1 favorites', '$1 件のお気に入り', '$1 favoris'],
    [/^(\d+)\s*条记录$/, '$1 records', '$1 件の履歴', '$1 entrées'],
    [/^全部\s*(\d+)$/, 'All $1', 'すべて $1', 'Tout $1'],
    [/^(\d+)\s*个$/, '$1', '$1', '$1'],
    [/^已生成\s*(\d+)\s*个二维码$/, 'Generated $1 QR codes', '$1 個の QR コードを生成しました', '$1 codes QR générés'],
    [/^共\s*(\d+)\s*项$/, 'Total: $1', '合計 $1 件', 'Total : $1'],
    [/^当前版本 v(\S+)$/, 'Current version v$1', '現在のバージョン v$1', 'Version actuelle v$1'],
    /* v1.6 自动检查更新：含版本号 / 日期的动态状态句 */
    [/^当前版本 v(\S+) · 自动检查已开启$/, 'Current version v$1 · Auto-check on', '現在のバージョン v$1 · 自動確認オン', 'Version actuelle v$1 · Vérification auto activée'],
    [/^当前版本 v(\S+) · 自动检查已关闭$/, 'Current version v$1 · Auto-check off', '現在のバージョン v$1 · 自動確認オフ', 'Version actuelle v$1 · Vérification auto désactivée'],
    [/^发现新版本 v(\S+)，点击查看$/, 'New version available v$1, tap to view', '新しいバージョン v$1 が見つかりました、タップして表示', 'Nouvelle version v$1 disponible, toucher pour voir'],
    [/^发现新版本 v(\S+)$/, 'New version available v$1', '新しいバージョン v$1 が見つかりました', 'Nouvelle version v$1 disponible'],
    [/^当前版本 v(\S+) · 上次检查 刚刚$/, 'Current version v$1 · Last checked just now', '現在のバージョン v$1 · 最終確認 たった今', "Version actuelle v$1 · Dernière vérification à l'instant"],
    [/^当前版本 v(\S+) · 上次检查 (.+)$/, 'Current version v$1 · Last checked $2', '現在のバージョン v$1 · 最終確認 $2', 'Version actuelle v$1 · Dernière vérification $2'],
    [/^v(\S+) · 发布于 (.+)$/, 'v$1 · Published $2', 'v$1 · 公開日 $2', 'v$1 · Publié le $2'],
    [/^下载新版本（(.+)）$/, 'Download update ($1)', '新版をダウンロード（$1）', 'Télécharger la mise à jour ($1)'],
    [/^上次检查：(.+)$/, 'Last checked: $1', '最終確認：$1', 'Dernière vérification : $1']
  ];

  /* ---------------- 构建索引 ---------------- */
  var ALL = DATA.rows.concat(window.AK_I18N_EXTRA || []).concat(UI_ROWS).concat(DATA.words);
  var EXACT = {};
  var SEEN = {};
  var SUBS = [];
  ALL.forEach(function (e) {
    if (!e || !e[0]) return;
    var k = String(e[0]);
    if (!EXACT[k]) EXACT[k] = e;
    if (!SEEN[k]) { SEEN[k] = 1; SUBS.push(e); }
  });
  SUBS.sort(function (a, b) { return String(b[0]).length - String(a[0]).length; });

  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var SUB_RE = new RegExp(SUBS.map(function (e) { return escRe(String(e[0])); }).join('|'), 'g');
  var SUB_MAP = {};
  SUBS.forEach(function (e) { SUB_MAP[String(e[0])] = e; });

  /* ---------------- 扩展语言层（独立于四列主词典） ---------------- */
  var MORE = window.AK_I18N_MORE || null;
  var MORE_COLS = (MORE && MORE.cols) ? MORE.cols : [];
  var MORE_IDX = {};
  (function () {
    for (var i = 0; i < MORE_COLS.length; i++) MORE_IDX[MORE_COLS[i]] = i + 1;
  })();
  var M_EXACT = {}, M_SEEN = {}, M_SUBS = [], M_PATTERNS = [];
  if (MORE) {
    var mrows = (MORE.rows || []).concat(MORE.words || []);
    mrows.forEach(function (e) {
      if (!e || !e[0]) return;
      var k = String(e[0]);
      if (!M_EXACT[k]) M_EXACT[k] = e;
      if (!M_SEEN[k]) { M_SEEN[k] = 1; M_SUBS.push(e); }
    });
    M_SUBS.sort(function (a, b) { return String(b[0]).length - String(a[0]).length; });
    (MORE.patterns || []).forEach(function (p) {
      try { M_PATTERNS.push([new RegExp(p[0])].concat(p.slice(1))); } catch (err) {}
    });
  }
  var M_SUB_RE = M_SUBS.length
    ? new RegExp(M_SUBS.map(function (e) { return escRe(String(e[0])); }).join('|'), 'g')
    : null;
  var M_SUB_MAP = {};
  M_SUBS.forEach(function (e) { M_SUB_MAP[String(e[0])] = e; });

  /* 简繁映射 */
  var S2T_MAP = {};
  for (var i = 0; i < S2T.a.length; i++) S2T_MAP[S2T.a.charAt(i)] = S2T.b.charAt(i);
  var TW_WORDS = Object.keys(S2T.words || {}).sort(function (a, b) { return b.length - a.length; });

  function s2t(s) {
    var out = String(s);
    for (var i = 0; i < TW_WORDS.length; i++) {
      var k = TW_WORDS[i];
      if (out.indexOf(k) >= 0) out = out.split(k).join(S2T.words[k]);
    }
    var r = '';
    for (var j = 0; j < out.length; j++) {
      var c = out.charAt(j);
      r += S2T_MAP[c] || c;
    }
    return r;
  }

  /* ---------------- 当前语言 ---------------- */
  var cur = 'zh-CN';
  var NATIVE = window.AK_NATIVE_LOCALE || '';
  try {
    if (!NATIVE && window.Ankong && typeof window.Ankong.getLocale === 'function') {
      NATIVE = window.Ankong.getLocale();
    }
  } catch (e) {}

  function detect() {
    var saved = null;
    try { saved = localStorage.getItem('ak_lang'); } catch (e) {}
    if (saved && VALID[saved]) return saved;
    var l = String(NATIVE || navigator.language || navigator.userLanguage || 'zh-CN').toLowerCase().replace(/_/g, '-');
    if (l.indexOf('zh-tw') === 0 || l.indexOf('zh-hk') === 0 || l.indexOf('zh-mo') === 0 || l.indexOf('zh-hant') >= 0) return 'zh-TW';
    if (l.indexOf('zh') === 0) return 'zh-CN';
    if (l.indexOf('ja') === 0) return 'ja';
    if (l.indexOf('fr') === 0) return 'fr';
    if (l.indexOf('en') === 0) return 'en';
    /* 扩展语言：按 BCP-47 主标签识别（pt-BR → pt，id-ID → id） */
    var EXT = { de: 1, es: 1, ko: 1, ru: 1, pt: 1, it: 1, nl: 1, tr: 1, vi: 1, id: 1 };
    var head = l.split('-')[0];
    if (EXT[head] && VALID[head]) return head;
    return 'en';
  }

  /* ---------------- 翻译单个字符串 ---------------- */
  var CJK = /[\u4e00-\u9fff]/;

  /* 英文列兜底：复用主词典的英文译文（ix = 1） */
  function tEn(raw) {
    var key = raw.replace(/\s+/g, ' ').trim();
    var hit = EXACT[key];
    if (hit && hit[1]) return hit[1];
    for (var pi = 0; pi < PATTERNS.length; pi++) {
      var pt = PATTERNS[pi];
      if (pt[0].test(key)) return key.replace(pt[0], pt[1]);
    }
    var rep = raw.replace(SUB_RE, function (m) {
      var e = SUB_MAP[m];
      return (e && e[1]) ? e[1] : m;
    });
    if (!CJK.test(rep)) return rep;
    return raw;
  }

  /* 扩展语言：精确整句 → 动态模式 → 词表扫描 → 英文兜底 */
  function tMore(raw, ix) {
    var key = raw.replace(/\s+/g, ' ').trim();
    var hit = M_EXACT[key];
    if (hit && hit[ix]) return hit[ix];
    for (var pi = 0; pi < M_PATTERNS.length; pi++) {
      var pt = M_PATTERNS[pi];
      if (pt[0].test(key)) {
        var po = key.replace(pt[0], pt[ix]);
        if (po && !CJK.test(po)) return po;
      }
    }
    if (M_SUB_RE) {
      var rep = raw.replace(M_SUB_RE, function (m) {
        var e = M_SUB_MAP[m];
        if (!e) return m;
        var val = e[ix];
        return typeof val === 'string' ? val : m;
      });
      if (!CJK.test(rep)) return rep;
    }
    return tEn(raw);
  }

  function t(s, lang) {
    lang = lang || cur;
    if (s == null) return s;
    var raw = String(s);
    if (lang === 'zh-CN') return raw;
    if (lang === 'zh-TW') return s2t(raw);
    if (!CJK.test(raw)) return raw;
    if (MORE_IDX[lang]) return tMore(raw, MORE_IDX[lang]);
    var ix = IDX[lang] || 1;
    var key = raw.replace(/\s+/g, ' ').trim();
    var hit = EXACT[key];
    if (hit && hit[ix]) return hit[ix];
    for (var pi = 0; pi < PATTERNS.length; pi++) {
      var pt = PATTERNS[pi];
      if (pt[0].test(key)) return key.replace(pt[0], pt[ix]);
    }
    // 一次扫描替换，避免译文被二次匹配
    var rep = raw.replace(SUB_RE, function (m) {
      var e = SUB_MAP[m];
      return (e && e[ix]) ? e[ix] : m;
    });
    // 若仍残留中文，说明词表覆盖不全：宁可保留完整中文整句，
    // 也不要输出「Select会Save在On-device」这类破碎混杂文本。
    if (CJK.test(rep)) return raw;
    return rep;
  }

  /* ---------------- DOM 后处理 ---------------- */
  var CJK_RE = /[\u4e00-\u9fff]/;
  var SKIP_TAG = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, SVG: 1, TEMPLATE: 1 };
  var ATTRS = ['placeholder', 'title', 'alt', 'aria-label'];

  function inSkip(n) {
    var p = n.parentNode;
    while (p) {
      if (SKIP_TAG[p.nodeName]) return true;
      if (p.nodeType === 1 && (p.hasAttribute('data-no-i18n') || /(^|\s)notranslate(\s|$)/.test(p.className || ''))) return true;
      p = p.parentNode;
    }
    return false;
  }

  function xlateText(n) {
    if (n.nodeType !== 3) return;
    var orig = (n._akOrig != null) ? n._akOrig : n.nodeValue;
    n._akOrig = orig;
    if (!orig || !CJK_RE.test(orig)) return;
    if (n._akLang === cur && n.nodeValue === t(orig)) return;
    var out = t(orig);
    n._akLang = cur;
    if (out !== n.nodeValue) n.nodeValue = out;
  }

  function xlateAttr(el) {
    if (!el || el.nodeType !== 1) return;
    if (el.hasAttribute('data-no-i18n') || inSkip(el)) return;
    var store = el._akAttrOrig || (el._akAttrOrig = {});
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute(a);
      if (v == null) continue;
      var orig = (store[a] != null) ? store[a] : v;
      store[a] = orig;
      if (!CJK_RE.test(orig)) continue;
      var out = t(orig);
      if (out !== v) el.setAttribute(a, out);
    }
    el._akAttrLang = cur;
  }

  function scan(root) {
    var r = root || document.body;
    if (!r) return;
    if (r.nodeType === 3) { xlateText(r); return; }
    if (r.nodeType !== 1) return;
    var walker = document.createTreeWalker(r, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !CJK_RE.test(n._akOrig != null ? n._akOrig : n.nodeValue)) return NodeFilter.FILTER_REJECT;
        if (inSkip(n)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n, list = [];
    while ((n = walker.nextNode())) list.push(n);
    for (var i = 0; i < list.length; i++) xlateText(list[i]);

    var sel = r.querySelectorAll('[placeholder],[title],[alt],[aria-label]');
    for (var j = 0; j < sel.length; j++) xlateAttr(sel[j]);
    if (r.hasAttribute && r.hasAttribute('placeholder')) xlateAttr(r);
  }

  function xlateTitle() {
    var el = document.querySelector('title');
    if (!el) return;
    if (el._akOrig == null) el._akOrig = el.textContent;
    var out = t(el._akOrig);
    if (out !== el.textContent) el.textContent = out;
  }

  /* ---------------- 增量监听 ---------------- */
  var mo = null, busy = false;
  function observe() {
    if (mo || !window.MutationObserver || !document.body) return;
    mo = new MutationObserver(function (recs) {
      if (busy || cur === 'zh-CN') return;
      busy = true;
      mo.disconnect();
      try {
        for (var i = 0; i < recs.length; i++) {
          var r = recs[i];
          if (r.type === 'characterData') xlateText(r.target);
          else if (r.addedNodes && r.addedNodes.length) {
            for (var j = 0; j < r.addedNodes.length; j++) {
              var nd = r.addedNodes[j];
              if (nd.nodeType === 3) xlateText(nd);
              else if (nd.nodeType === 1) scan(nd);
            }
          } else if (r.type === 'attributes' && r.target) xlateAttr(r.target);
        }
        xlateTitle();
        mo.takeRecords();
      } catch (e) {}
      busy = false;
      mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  /* ---------------- 语言切换 ---------------- */
  function setLang(id) {
    if (!VALID[id]) return cur;
    cur = id;
    try { localStorage.setItem('ak_lang', id); } catch (e) {}
    try { document.documentElement.setAttribute('lang', id === 'zh-TW' ? 'zh-Hant' : id); } catch (e) {}
    if (id !== 'zh-CN') { scan(document.body); xlateTitle(); }
    else {
      // 简体：恢复所有已翻译节点的原文
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      var n;
      while ((n = w.nextNode())) {
        if (n._akOrig != null && n.nodeValue !== n._akOrig) n.nodeValue = n._akOrig;
        n._akLang = 'zh-CN';
      }
      var els = document.querySelectorAll('[placeholder],[title],[alt],[aria-label]');
      for (var i = 0; i < els.length; i++) {
        var el = els[i], st = el._akAttrOrig;
        if (!st) continue;
        ATTRS.forEach(function (a) { if (st[a] != null && el.getAttribute(a) !== st[a]) el.setAttribute(a, st[a]); });
      }
      xlateTitle();
    }
    try { if (window.Ankong && typeof window.Ankong.setLocale === 'function') window.Ankong.setLocale(id); } catch (e) {}
    if (typeof window.AK_ON_LANG_CHANGE === 'function') { try { window.AK_ON_LANG_CHANGE(id); } catch (e) {} }
    return id;
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    cur = detect();
    try { document.documentElement.setAttribute('lang', cur === 'zh-TW' ? 'zh-Hant' : cur); } catch (e) {}
    if (cur !== 'zh-CN') { scan(document.body); xlateTitle(); }
    observe();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* 对动态插入但未经 observer 覆盖的内容提供显式入口 */
  window.akT = t;
  window.AKI18N = {
    langs: LANGS,
    get: function () { return cur; },
    set: setLang,
    t: t,
    s2t: s2t,
    apply: function (root) { scan(root || document.body); xlateTitle(); },
    label: function (id) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i].id === id) return LANGS[i].name; return id; },
    boot: boot
  };
})();
