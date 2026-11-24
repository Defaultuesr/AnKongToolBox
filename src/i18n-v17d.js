/* ============================================================
   安空工具箱 — v1.7 新增 10 种语言词典（四）：v1.7 更新日志
   列顺序：[简体原文, de, es, ko, ru, pt, it, nl, tr, vi, id]
   ============================================================ */
(function () {
  var D = window.AK_I18N_MORE = window.AK_I18N_MORE || {
    cols: ['de', 'es', 'ko', 'ru', 'pt', 'it', 'nl', 'tr', 'vi', 'id'],
    rows: [], patterns: [], words: []
  };

  D.rows = D.rows.concat([
    ['新增 40 个实用工具，工具总数达到 365 个：Quoted-Printable / UUencode / Ascii85、ROT47 与维吉尼亚密码、哈夫曼编码、Set-Cookie 解析、ULID 解析、chmod 权限、HTML 转 Markdown、CSP 安全头、正则解释器、质因数分解、IEEE 754 位级解析、模逆元、向量与复数运算、社保公积金、信用卡循环利息、色觉模拟、dBm 换算、数独与汉诺塔等',
     '40 neue Tools, jetzt 365: Quoted-Printable, UUencode, Ascii85, ROT47, Vigenère, Huffman, Set-Cookie, ULID, chmod, HTML-zu-Markdown, CSP, Regex-Erklärung, Primfaktoren, IEEE 754, modulare Inverse, Vektoren, komplexe Zahlen, Sozialabgaben, Kreditkartenzinsen, Farbfehlsichtigkeit, dBm, Sudoku, Hanoi u. v. m.',
     '40 nuevas herramientas, 365 en total: Quoted-Printable, UUencode, Ascii85, ROT47, Vigenère, Huffman, Set-Cookie, ULID, chmod, HTML a Markdown, CSP, explicador de regex, factorización, IEEE 754, inverso modular, vectores, números complejos, seguridad social, intereses de tarjeta, daltonismo, dBm, Sudoku y Hanói.',
     '실용 도구 40개 추가, 총 365개: Quoted-Printable, UUencode, Ascii85, ROT47, 비주네르, 허프만, Set-Cookie, ULID, chmod, HTML→Markdown, CSP, 정규식 해석, 소인수분해, IEEE 754, 모듈러 역원, 벡터·복소수, 사회보험, 신용카드 이자, 색각 이상, dBm, 스도쿠·하노이 등',
     'Добавлено 40 инструментов, всего 365: Quoted-Printable, UUencode, Ascii85, ROT47, Виженер, Хаффман, Set-Cookie, ULID, chmod, HTML→Markdown, CSP, объяснение regex, разложение на множители, IEEE 754, обратный элемент, векторы, комплексные числа, соцвзносы, проценты по карте, дальтонизм, dBm, судоку, Ханойская башня.',
     '40 novas ferramentas, 365 no total: Quoted-Printable, UUencode, Ascii85, ROT47, Vigenère, Huffman, Set-Cookie, ULID, chmod, HTML→Markdown, CSP, explicador de regex, fatoração, IEEE 754, inverso modular, vetores, números complexos, encargos sociais, juros de cartão, daltonismo, dBm, Sudoku e Hanói.',
     '40 nuovi strumenti, 365 in totale: Quoted-Printable, UUencode, Ascii85, ROT47, Vigenère, Huffman, Set-Cookie, ULID, chmod, HTML→Markdown, CSP, spiegatore regex, fattorizzazione, IEEE 754, inverso modulare, vettori, numeri complessi, contributi, interessi carta, daltonismo, dBm, Sudoku e Hanoi.',
     '40 nieuwe tools, 365 in totaal: Quoted-Printable, UUencode, Ascii85, ROT47, Vigenère, Huffman, Set-Cookie, ULID, chmod, HTML→Markdown, CSP, regex-uitleg, priemfactoren, IEEE 754, modulaire inverse, vectoren, complexe getallen, sociale premies, creditcardrente, kleurenblindheid, dBm, sudoku, Hanoi e.a.',
     '40 yeni araç, toplam 365: Quoted-Printable, UUencode, Ascii85, ROT47, Vigenère, Huffman, Set-Cookie, ULID, chmod, HTML→Markdown, CSP, regex açıklayıcı, asal çarpanlar, IEEE 754, modüler ters, vektörler, karmaşık sayılar, sosyal güvenlik, kredi kartı faizi, renk körlüğü, dBm, Sudoku ve Hanoi.',
     'Thêm 40 công cụ, tổng 365: Quoted-Printable, UUencode, Ascii85, ROT47, Vigenère, Huffman, Set-Cookie, ULID, chmod, HTML→Markdown, CSP, giải thích regex, phân tích thừa số, IEEE 754, nghịch đảo modular, vector, số phức, bảo hiểm, lãi thẻ, mù màu, dBm, Sudoku và Tháp Hà Nội.',
     '40 alat baru, total 365: Quoted-Printable, UUencode, Ascii85, ROT47, Vigenère, Huffman, Set-Cookie, ULID, chmod, HTML→Markdown, CSP, penjelas regex, faktorisasi, IEEE 754, invers modular, vektor, bilangan kompleks, iuran sosial, bunga kartu, buta warna, dBm, Sudoku dan Hanoi.'],
    ['界面语言从 5 种扩展到 15 种：新增 Deutsch、Español、한국어、Русский、Português、Italiano、Nederlands、Türkçe、Tiếng Việt、Bahasa Indonesia',
     'Von 5 auf 15 Sprachen: neu Deutsch, Español, 한국어, Русский, Português, Italiano, Nederlands, Türkçe, Tiếng Việt, Bahasa Indonesia',
     'De 5 a 15 idiomas: nuevos Deutsch, Español, 한국어, Русский, Português, Italiano, Nederlands, Türkçe, Tiếng Việt, Bahasa Indonesia',
     '5개 → 15개 언어: Deutsch, Español, 한국어, Русский, Português, Italiano, Nederlands, Türkçe, Tiếng Việt, Bahasa Indonesia 추가',
     'С 5 до 15 языков: добавлены Deutsch, Español, 한국어, Русский, Português, Italiano, Nederlands, Türkçe, Tiếng Việt, Bahasa Indonesia',
     'De 5 para 15 idiomas: novos Deutsch, Español, 한국어, Русский, Português, Italiano, Nederlands, Türkçe, Tiếng Việt, Bahasa Indonesia',
     'Da 5 a 15 lingue: nuove Deutsch, Español, 한국어, Русский, Português, Italiano, Nederlands, Türkçe, Tiếng Việt, Bahasa Indonesia',
     'Van 5 naar 15 talen: nieuw Deutsch, Español, 한국어, Русский, Português, Italiano, Nederlands, Türkçe, Tiếng Việt, Bahasa Indonesia',
     '5 dilden 15 dile: yeni Deutsch, Español, 한국어, Русский, Português, Italiano, Nederlands, Türkçe, Tiếng Việt, Bahasa Indonesia',
     'Từ 5 lên 15 ngôn ngữ: thêm Deutsch, Español, 한국어, Русский, Português, Italiano, Nederlands, Türkçe, Tiếng Việt, Bahasa Indonesia',
     'Dari 5 menjadi 15 bahasa: baru Deutsch, Español, 한국어, Русский, Português, Italiano, Nederlands, Türkçe, Tiếng Việt, Bahasa Indonesia'],
    ['新增语言采用独立词典与英文兜底机制：界面框架、设置、分类、按钮、更新与表单标签完整本地化，未覆盖的长文本回退为完整译文，不会出现中英混杂的破碎文本',
     'Neue Sprachen nutzen ein eigenes Wörterbuch mit englischem Fallback: Oberfläche, Einstellungen, Kategorien, Buttons und Formularfelder sind vollständig übersetzt; übrige Texte fallen auf vollständige Übersetzungen zurück, nie auf gemischte Fragmente.',
     'Los idiomas nuevos usan diccionario propio con respaldo en inglés: interfaz, ajustes, categorías, botones y etiquetas están totalmente traducidos; el resto vuelve a traducciones completas, sin fragmentos mezclados.',
     '새 언어는 독립 사전과 영어 폴백을 씁니다: 화면·설정·분류·버튼·양식 라벨은 완전 번역, 나머지는 완전한 번역문으로 돌아가 중영 혼합 조각이 생기지 않습니다.',
     'Новые языки используют отдельный словарь с английским резервом: интерфейс, настройки, категории, кнопки и подписи переведены полностью; остальные тексты возвращаются к полным переводам без смешанных обрывков.',
     'Os novos idiomas usam dicionário próprio com fallback em inglês: interface, ajustes, categorias, botões e rótulos são totalmente traduzidos; os demais textos voltam a traduções completas, sem fragmentos misturados.',
     'Le nuove lingue usano un dizionario dedicato con fallback inglese: interfaccia, impostazioni, categorie, pulsanti ed etichette sono tradotti completamente; gli altri testi tornano a traduzioni complete, senza frammenti misti.',
     "Nieuwe talen gebruiken een eigen woordenboek met Engelse fallback: interface, instellingen, categorieën, knoppen en labels zijn volledig vertaald; overige teksten vallen terug op volledige vertalingen, nooit op gemengde fragmenten.",
     'Yeni diller ayrı sözlük ve İngilizce yedek kullanır: arayüz, ayarlar, kategoriler, düğmeler ve etiketler tamamen çevrili; kalan metinler karma parçalar yerine tam çevirilere döner.',
     'Ngôn ngữ mới dùng từ điển riêng và dự phòng tiếng Anh: giao diện, cài đặt, danh mục, nút, nhãn được dịch đầy đủ; văn bản khác dùng bản dịch hoàn chỉnh, không có đoạn lẫn ngôn ngữ.',
     'Bahasa baru memakai kamus tersendiri dengan cadangan Inggris: antarmuka, pengaturan, kategori, tombol dan label diterjemahkan penuh; teks lain kembali ke terjemahan lengkap, tanpa fragmen campuran.'],
    ['版本号升级至 1.7（versionCode 12），网页版与安卓安装包同步构建；自动检查更新已发布到 GitHub Releases',
     'Version 1.7 (versionCode 12); Web- und Android-Build gemeinsam erstellt; Updates auf GitHub Releases veröffentlicht.',
     'Versión 1.7 (versionCode 12); web y APK compiladas juntas; actualizaciones publicadas en GitHub Releases.',
     '버전 1.7(versionCode 12), 웹 버전·APK 동시 빌드; 업데이트는 GitHub Releases에 게시',
     'Версия 1.7 (versionCode 12); веб-версия и APK собраны вместе; обновления опубликованы в GitHub Releases.',
     'Versão 1.7 (versionCode 12); web e APK compilados juntos; atualizações publicadas no GitHub Releases.',
     'Versione 1.7 (versionCode 12); build web e APK insieme; aggiornamenti su GitHub Releases.',
     'Versie 1.7 (versionCode 12); webversie en APK samen gebouwd; updates op GitHub Releases.',
     'Sürüm 1.7 (versionCode 12); web ve APK birlikte derlendi; güncellemeler GitHub Releases üzerinde.',
     'Phiên bản 1.7 (versionCode 12); bản web và APK build cùng lúc; cập nhật đã đăng trên GitHub Releases.',
     'Versi 1.7 (versionCode 12); web dan APK dibangun bersama; pembaruan diterbitkan di GitHub Releases.']
  ]);
})();
