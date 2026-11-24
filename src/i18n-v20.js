/* ============================================================
   安空工具箱 — v2.0 多语言词条（新工具 + 资讯页）
   AK_I18N_EXTRA：[简体, English, 日本語, Français]
   AK_I18N_MORE ：[简体, de, es, ko, ru, pt, it, nl, tr, vi, id]
   ============================================================ */
window.AK_I18N_EXTRA = (window.AK_I18N_EXTRA || []).concat([
  ["大数任意进制转换", "Big Integer Base Converter", "巨大整数の基数変換", "Conversion de base pour grands entiers"],
  ["Luhn 校验码计算", "Luhn Check Digit", "Luhn チェックデジット", "Calcul de clé de contrôle Luhn"],
  ["CRC16 校验计算", "CRC16 Calculator", "CRC16 計算", "Calculateur CRC16"],
  ["邮箱地址批量校验", "Email Validator", "メールアドレス検証", "Validation d'e-mails"],
  ["手机号段归属识别", "Phone Prefix Lookup", "電話番号の番号帯判定", "Identification du préfixe téléphonique"],
  ["身份证号校验", "ID Card Validator", "身分証番号検証", "Validation de carte d'identité"],
  ["Unicode 转义工具", "Unicode Escape Tool", "Unicode エスケープ", "Outil d'échappement Unicode"],
  ["Base32 编解码", "Base32 Codec", "Base32 エンコード/デコード", "Codec Base32"],
  ["凯撒密码", "Caesar Cipher", "シーザー暗号", "Chiffre de César"],
  ["莫比乌斯函数 μ(n)", "Möbius Function μ(n)", "メビウス関数 μ(n)", "Fonction de Möbius μ(n)"],
  ["欧拉函数 φ(n)", "Euler's Totient φ(n)", "オイラー関数 φ(n)", "Indicatrice d'Euler φ(n)"],
  ["矩阵行列式计算", "Matrix Determinant", "行列式の計算", "Déterminant de matrice"],
  ["时区时间换算", "Time Zone Converter", "タイムゾーン変換", "Conversion de fuseau horaire"],
  ["电阻色环计算器", "Resistor Color Code", "抵抗色環計算", "Code couleur des résistances"],
  ["质因数分解与质数表", "Prime Factorization", "素因数分解", "Factorisation en nombres premiers"],
  ["分数化简与运算", "Fraction Calculator", "分数の約分と計算", "Calcul de fractions"],
  ["日期差值计算器", "Date Difference", "日付の差計算", "Différence de dates"],
  ["文本相似度比较", "Text Similarity", "テキスト類似度", "Similarité de textes"],
  ["拼音首字母提取", "Pinyin Initials", "ピンイン頭文字抽出", "Initiales du pinyin"],
  ["命名风格转换器", "Naming Case Converter", "命名規則変換", "Convertisseur de casse"],
  ["字符位置与截取", "String Position & Slice", "文字位置と抽出", "Position et extraction de chaîne"],
  ["金额大写（增强版）", "Amount in Words Pro", "金額の漢字表記（強化版）", "Montant en lettres (Pro)"],
  ["时间戳与相对时间", "Timestamp & Relative Time", "タイムスタンプと相対時間", "Horodatage et temps relatif"],
  ["正则匹配测试", "Regex Tester", "正規表現テスター", "Testeur d'expressions régulières"],
  ["资讯", "News", "ニュース", "Actualités"],
  ["今日资讯", "Today's News", "今日のニュース", "Actualités du jour"],
  ["新闻 · 热榜 · 每日一言", "News · Trends · Daily Quote", "ニュース·ランキング·今日の一言", "Actualités · Tendances · Citation du jour"],
  ["今日新闻", "Today's Headlines", "今日ニュース", "À la une"],
  ["微博热搜", "Weibo Hot Search", "微博_hot検索", "Tendances Weibo"],
  ["知乎热榜", "Zhihu Hot List", "知乎_人気ランキング", "Tendances Zhihu"],
  ["抖音热榜", "Douyin Hot List", "抖音_人気ランキング", "Tendances Douyin"],
  ["百度热搜", "Baidu Hot Search", "百度_hot検索", "Tendances Baidu"],
  ["每日一言", "Daily Quote", "今日の一言", "Citation du jour"],
  ["官方新闻站点", "Official News Sites", "公式ニュースサイト", "Sites d'actualités officiels"]
]);
(function(){
  var D = window.AK_I18N_MORE = window.AK_I18N_MORE || {
    cols: ['de','es','ko','ru','pt','it','nl','tr','vi','id'],
    rows: [], patterns: [], words: []
  };
  D.rows = D.rows.concat([
  ["大数任意进制转换", "Big-Integer-Basenkonverter", "Conversor de base de enteros grandes", "큰 정수 진수 변환", "Перевод больших чисел между системами", "Conversor de base para inteiros grandes", "Convertitore di base per grandi interi", "Basenconversie voor grote getallen", "Büyük tamsayı taban dönüştürücü", "Chuyển đổi cơ số số nguyên lớn", "Konversi basis bilangan bulat besar"],
  ["Luhn 校验码计算", "Luhn-Prüfziffer berechnen", "Calcular dígito de control Luhn", "Luhn 검사숫자 계산", "Вычисление контрольной цифры Луна", "Calcular dígito de verificação Luhn", "Calcola cifra di controllo Luhn", "Luhn-controlecijfer berekenen", "Luhn kontrol hanesi hesapla", "Tính số kiểm tra Luhn", "Hitung digit cek Luhn"],
  ["CRC16 校验计算", "CRC16-Prüfsumme", "Calculadora CRC16", "CRC16 계산", "Калькулятор CRC16", "Calculadora CRC16", "Calcolatore CRC16", "CRC16-calculator", "CRC16 hesaplayıcı", "Máy tính CRC16", "Kalkulator CRC16"],
  ["邮箱地址批量校验", "E-Mail-Validierung", "Validador de correos", "이메일 주소 검증", "Проверка email-адресов", "Validador de e-mails", "Validatore email", "E-mailvalidatie", "E-posta doğrulayıcı", "Kiểm tra email hàng loạt", "Validasi email"],
  ["手机号段归属识别", "Telefonnummern-Präfix", "Identificación de prefijo telefónico", "휴대폰 번호대 조회", "Определение префикса номера", "Identificação de prefixo telefônico", "Identificazione prefisso telefonico", "Telefoonnummer-prefix opzoeken", "Telefon önek sorgulama", "Nhận diện đầu số điện thoại", "Cek prefiks nomor telepon"],
  ["身份证号校验", "Ausweisnummer prüfen", "Validador de DNI", "신분증 번호 검증", "Проверка номера удостоверения", "Validador de RG / CPF", "Validatore carta d'identità", "Identiteitskaart valideren", "Kimlik numarası doğrulama", "Kiểm tra số CCCD", "Validasi Kartu Identitas"],
  ["Unicode 转义工具", "Unicode-Escape-Werkzeug", "Herramienta de escape Unicode", "유니코드 이스케이프", "Unicode-экранирование", "Ferramenta de escape Unicode", "Strumento escape Unicode", "Unicode-escape tool", "Unicode kaçırma aracı", "Công cụ thoát Unicode", "Alat escape Unicode"],
  ["Base32 编解码", "Base32 Kodierung", "Codec Base32", "Base32 인코딩/디코딩", "Кодек Base32", "Codec Base32", "Codec Base32", "Base32 codec", "Base32 kod çözücü", "Mã hóa/giải mã Base32", "Kodek Base32"],
  ["凯撒密码", "Cäsar-Chiffre", "Cifrado César", "카이사르 암호", "Шифр Цезаря", "Cifra de César", "Cifro di Cesare", "Caesar-versleuteling", "Sezar şifresi", "Mã Caesar", "Sandi Caesar"],
  ["莫比乌斯函数 μ(n)", "Möbius-Funktion μ(n)", "Función de Möbius μ(n)", "뫼비우스 함수 μ(n)", "Функция Мёбиуса μ(n)", "Função de Möbius μ(n)", "Funzione di Möbius μ(n)", "Möbius-functie μ(n)", "Möbius fonksiyonu μ(n)", "Hàm Möbius μ(n)", "Fungsi Möbius μ(n)"],
  ["欧拉函数 φ(n)", "Eulersche φ-Funktion", "Función φ de Euler", "오일러 함수 φ(n)", "Функция Эйлера φ(n)", "Função totiente φ(n)", "Funzione totiente φ(n)", "Euler-functie φ(n)", "Euler phi fonksiyonu", "Hàm Euler φ(n)", "Fungsi Euler φ(n)"],
  ["矩阵行列式计算", "Matrixdeterminante", "Determinante de matriz", "행렬식 계산", "Определитель матрицы", "Determinante de matriz", "Determinante matrice", "Matrixdeterminant", "Matris determinantı", "Tính định thức ma trận", "Determinan matriks"],
  ["时区时间换算", "Zeitzonen-Umrechnung", "Conversor de zona horaria", "시간대 변환", "Преобразование часовых поясов", "Conversor de fuso horário", "Convertitore di fuso orario", "Tijdzoneconversie", "Saat dilimi dönüştürücü", "Chuyển đổi múi giờ", "Konversi zona waktu"],
  ["电阻色环计算器", "Widerstands-Farbcode", "Código de colores de resistencias", "저항 색상 코드", "Цветовой код резистора", "Código de cores de resistor", "Codice colori resistenza", "Weerstandskleurcode", "Direnç renk kodu", "Mã màu điện trở", "Kode warna resistor"],
  ["质因数分解与质数表", "Primfaktorzerlegung", "Factorización prima", "소인수 분해", "Разложение на простые множители", "Fatoração prima", "Scomposizione in primi", "Priemfactorisatie", "Asal çarpanlara ayırma", "Phân tích ra thừa số nguyên tố", "Faktorisasi prima"],
  ["分数化简与运算", "Bruchrechnung", "Calculadora de fracciones", "분수 약분·연산", "Дроби: упрощение и вычисления", "Calculadora de frações", "Calcolatore di frazioni", "Breuken vereenvoudigen", "Kesir hesaplayıcı", "Tính toán phân số", "Kalkulator pecahan"],
  ["日期差值计算器", "Datumsdifferenz", "Diferencia de fechas", "날짜 차이 계산", "Разница дат", "Diferença de datas", "Differenza di date", "Datumverschil", "Tarih farkı hesaplayıcı", "Tính hiệu số ngày", "Selisih tanggal"],
  ["文本相似度比较", "Textähnlichkeit", "Similitud de textos", "텍스트 유사도", "Сходство текстов", "Similaridade de textos", "Similarità di testi", "Tekstgelijkenis", "Metin benzerliği", "Độ tương đồng văn bản", "Kesamaan teks"],
  ["拼音首字母提取", "Pinyin-Anfangsbuchstaben", "Iniciales del pinyin", "병음 첫글자 추출", "Первые буквы пиньиня", "Iniciais do pinyin", "Iniziali del pinyin", "Pinyin-initialen", "Pinyin baş harfleri", "Trích xuất chữ cái đầu phiên âm", "Inisial Pinyin"],
  ["命名风格转换器", "Namenskonventionen-Konverter", "Convertidor de estilo de nombres", "명명 규칙 변환", "Преобразование регистра имён", "Conversor de estilo de nome", "Convertitore di stili di nomi", "Naamgeving converter", "Adlandırma stili dönüştürücü", "Chuyển đổi kiểu đặt tên", "Konverter gaya penamaan"],
  ["字符位置与截取", "Zeichenposition & Ausschnitt", "Posición y extracción de cadena", "문자 위치·추출", "Позиция и вырезание строки", "Posição e fatiamento de string", "Posizione e sottostringa", "Tekstpositie en -slice", "Karakter konumu ve dilimleme", "Vị trí và cắt chuỗi", "Posisi dan pemotongan string"],
  ["金额大写（增强版）", "Betrag in Worten (Pro)", "Monto en letras (Pro)", "금액 한자 표기 (강화판)", "Сумма словами (Pro)", "Valor por extenso (Pro)", "Importo in lettere (Pro)", "Bedrag in woorden (Pro)", "Tutarın yazıyla yazımı (Pro)", "Số tiền bằng chữ (Pro)", "Jumlah dalam huruf (Pro)"],
  ["时间戳与相对时间", "Zeitstempel & relative Zeit", "Marca de tiempo y tiempo relativo", "타임스탬프·상대 시간", "Метка времени и относительное время", "Timestamp e tempo relativo", "Timestamp e tempo relativo", "Tijdstempel & relatieve tijd", "Zaman damgası ve göreli zaman", "Dấu thời gian và thời gian tương đối", "Stempel waktu & waktu relatif"],
  ["正则匹配测试", "Regex-Tester", "Probador de regex", "정규식 테스터", "Тестер регулярных выражений", "Testador de regex", "Tester di regex", "Regex-tester", "Regex test edici", "Trình kiểm tra regex", "Penguji regex"],
  ["资讯", "Nachrichten", "Noticias", "뉴스", "Новости", "Notícias", "Notizie", "Nieuws", "Haberler", "Tin tức", "Berita"],
  ["今日资讯", "Heutige Nachrichten", "Noticias de hoy", "오늘의 뉴스", "Новости сегодня", "Notícias de hoje", "Notizie di oggi", "Nieuws van vandaag", "Günün haberleri", "Tin tức hôm nay", "Berita hari ini"],
  ["新闻 · 热榜 · 每日一言", "Nachrichten · Trends · Tageszitat", "Noticias · Tendencias · Cita diaria", "뉴스·실시간 차트·오늘의 명언", "Новости · Тренды · Цитата дня", "Notícias · Tendências · Citação do dia", "Notizie · Tendenze · Citazione del giorno", "Nieuws · Trends · Dagelijkse quote", "Haberler · Trendler · Günün sözü", "Tin tức · Xu hướng · Lời hay mỗi ngày", "Berita · Tren · Kutipan harian"],
  ["今日新闻", "Heutige Schlagzeilen", "Titulares de hoy", "오늘의 뉴스", "Главное за день", "Manchetes de hoje", "Titoli di oggi", "Kop van vandaag", "Günün manşetleri", "Tin nổi bật hôm nay", "Headline hari ini"],
  ["微博热搜", "Weibo-Trends", "Tendencias de Weibo", "위보 실시간 검색", "Поиск Weibo", "Tendências do Weibo", "Tendenze Weibo", "Weibo-trends", "Weibo gündem", "Xu hướng Weibo", "Tren Weibo"],
  ["知乎热榜", "Zhihu-Trends", "Tendencias de Zhihu", "지후 인기 차트", "Горячее на Zhihu", "Tendências do Zhihu", "Tendenze Zhihu", "Zhihu-trends", "Zhihu gündem", "Xu hướng Zhihu", "Tren Zhihu"],
  ["抖音热榜", "Douyin-Trends", "Tendencias de Douyin", "더우인 인기 차트", "Горячее в Douyin", "Tendências do Douyin", "Tendenze Douyin", "Douyin-trends", "Douyin gündem", "Xu hướng Douyin", "Tren Douyin"],
  ["百度热搜", "Baidu-Trends", "Tendencias de Baidu", "바이두 실시간 검색", "Поиск Baidu", "Tendências do Baidu", "Tendenze Baidu", "Baidu-trends", "Baidu gündem", "Xu hướng Baidu", "Tren Baidu"],
  ["每日一言", "Tageszitat", "Cita diaria", "오늘의 명언", "Цитата дня", "Citação do dia", "Citazione del giorno", "Dagelijkse quote", "Günün sözü", "Lời hay mỗi ngày", "Kutipan harian"],
  ["官方新闻站点", "Offizielle Nachrichtenseiten", "Sitios oficiales de noticias", "공식 뉴스 사이트", "Официальные новостные сайты", "Sites oficiais de notícias", "Siti di notizie ufficiali", "Officiële nieuwswebsites", "Resmî haber siteleri", "Trang tin chính thức", "Situs berita resmi"]
]);
})();
