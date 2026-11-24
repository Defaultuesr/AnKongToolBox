#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 src/i18n-v21.js：v2.1 新工具名，15 种语言。
列顺序：EXTRA=[zh,en,ja,fr]  MORE=[zh,de,es,ko,ru,pt,it,nl,tr,vi,id]
"""
from pathlib import Path

# 每条: zh, en, ja, fr, de, es, ko, ru, pt, it, nl, tr, vi, id
D = [
 ["格雷码转换","Gray Code Converter","グレイコード変換","Conversion code Gray","Gray-Code-Konverter","Conversor de código Gray","그레이 코드 변환","Преобразование кода Грея","Conversor de código Gray","Convertitore codice Gray","Gray-code omzetting","Gray kodu dönüştürücü","Chuyển đổi mã Gray","Konversi kode Gray"],
 ["汉明重量（位计数）","Hamming Weight (Bit Count)","ハミング重み（ビット数）","Poids de Hamming (comptage de bits)","Hamming-Gewicht (Bitanzahl)","Peso de Hamming (conteo de bits)","해밍 웨이트(비트 수)","Вес Хемминга (число единиц)","Peso de Hamming (contagem de bits)","Peso di Hamming (conteggio bit)","Hamming-gewicht (bit telling)","Hamming ağırlığı (bit sayımı)","Trọng số Hamming (đếm bit)","Bobot Hamming (hitung bit)"],
 ["汉明距离计算","Hamming Distance","ハミング距離","Distance de Hamming","Hamming-Abstand","Distancia de Hamming","해밍 거리","Расстояние Хемминга","Distância de Hamming","Distanza di Hamming","Hamming-afstand","Hamming mesafesi","Khoảng cách Hamming","Jarak Hamming"],
 ["完全数与亲和数检测","Perfect & Amicable Numbers","完全数・友好数判定","Nombres parfaits et amicaux","Vollkommene & befreundete Zahlen","Números perfectos y amigables","완전수·친화수 판정","Совершенные и дружественные числа","Números perfeitos e amigáveis","Numeri perfetti e amichevoli","Volkomen & bevriende getallen","Mükemmel ve arkadaş sayılar","Số hoàn hảo & số thân thiện","Bilangan sempurna & bersahabat"],
 ["自恋数（水仙花数）检测","Narcissistic Numbers","ナルシシスト数（水仙数）判定","Nombres narcissiques","Narzisstische Zahlen","Números narcisistas","자기애수(수선화수) 판정","Числа Армстронга","Números narcísicos","Numeri narcisisti","Narcistische getallen","Narsistik (gül) sayılar","Số tự ái (hoa thủy tiên)","Bilangan narsistik"],
 ["互质判定与列表","Coprime Check & List","互いに素判定と一覧","Vérification et liste des nombres premiers entre eux","Teilerfremd-Prüfung & Liste","Comprobación y lista de coprimos","서로소 판정·목록","Проверка взаимной простоты","Verificação e lista de coprimos","Verifica coprimi ed elenco","Onderlinge priemheid & lijst","Aralarında asal kontrolü & liste","Kiểm tra & danh sách số nguyên tố cùng nhau","Cek & daftar koprime"],
 ["连分数展开","Continued Fraction","連分数展開","Développement en fraction continue","Kettenbruch-Entwicklung","Desarrollo en fracción continua","연분수 전개","Разложение в цепную дробь","Expansão em fração contínua","Sviluppo in frazione continua","Doorlopende breuk ontwikkeling","Sürekli kesir açılımı","Khai triển phân số liên tục","Ekspansi pecahan berlanjut"],
 ["埃及分数分解","Egyptian Fraction","エジプト分数分解","Décomposition en fractions égyptiennes","Ägyptische Bruchzerlegung","Descomposición en fracciones egipcias","이집트 분수 분해","Разложение на египетские дроби","Decomposição em frações egípcias","Scomposizione in frazioni egizie","Egyptische breuk ontleding","Mısır kesirleri ayrıştırma","Phân tích phân số Ai Cập","Dekomposisi pecahan Mesir"],
 ["一元二次方程求根","Quadratic Equation Solver","二次方程式の解","Résolution d'équation quadratique","Quadratische Gleichung lösen","Resolver ecuación cuadrática","이차방정식 근 구하기","Решение квадратного уравнения","Resolver equação quadrática","Risolvi equazione quadratica","Vierkantsvergelijking oplossen","İkinci derece denklem çözücü","Giải phương trình bậc hai","Penyelesaian persamaan kuadrat"],
 ["常用三角函数值表","Trigonometric Values Table","三角関数値一覧","Table de valeurs trigonométriques","Trigonometrische Werte Tabelle","Tabla de valores trigonométricos","삼각함수 값 표","Таблица тригонометрических значений","Tabela de valores trigonométricos","Tabella valori trigonometrici","Trigonometrische waarden tabel","Trigonometrik değerler tablosu","Bảng giá trị lượng giác","Tabel nilai trigonometri"],
 ["极坐标与直角坐标互转","Polar ↔ Rectangular","極座標と直交座標の変換","Conversion polaire ↔ rectangulaire","Polare ↔ kartesische Koordinaten","Conversión polar ↔ rectangular","극좌표·직교좌표 변환","Преобразование полярных координат","Conversão polar ↔ retangular","Conversione polare ↔ rettangolare","Polair ↔ rechthoekig","Kutupsal ↔ dikdörtgen koordinat","Chuyển đổi tọa độ cực ↔ vuông góc","Konversi polar ↔ kartesius"],
 ["经纬度距离计算","Geo Distance (Haversine)","緯度経度の距離計算","Distance géographique (Haversine)","Geografische Entfernung (Haversine)","Distancia geográfica (Haversine)","위경도 거리 계산","Географическое расстояние","Distância geográfica (Haversine)","Distanza geografica (Haversine)","Geografische afstand (Haversine)","Coğrafi mesafe (Haversine)","Khoảng cách kinh vĩ độ","Jarak geografis (Haversine)"],
 ["方位角计算","Bearing Calculator","方位角計算","Calcul de l'azimut","Peilwinkel berechnen","Calcular rumbo","방위각 계산","Расчёт азимута","Calcular rumo","Calcolo della direzione","Peilingshoek berekenen","Ker van hesaplama","Tính góc phương vị","Menghitung arah (bearing)"],
 ["Soundex 语音编码","Soundex Encoder","Soundex 音声符号","Encodage Soundex","Soundex-Kodierung","Codificación Soundex","사운덱스 인코딩","Кодирование Soundex","Codificação Soundex","Codifica Soundex","Soundex-codering","Soundex kodlama","Mã hóa Soundex","Pengkodean Soundex"],
 ["Metaphone 语音编码","Metaphone Encoder","Metaphone 音声符号","Encodage Metaphone","Metaphone-Kodierung","Codificación Metaphone","메타폰 인코딩","Кодирование Metaphone","Codificação Metaphone","Codifica Metaphone","Metaphone-codering","Metaphone kodlama","Mã hóa Metaphone","Pengkodean Metaphone"],
 ["异或校验和计算","XOR Checksum","XOR チェックサム","Somme de contrôle XOR","XOR-Prüfsumme","Suma de verificación XOR","XOR 체크섬","Контрольная сумма XOR","Soma de verificação XOR","Checksum XOR","XOR-controle som","XOR sağlama toplamı","Tổng kiểm tra XOR","Checksum XOR"],
 ["奇偶校验位计算","Parity Bit Calculator","パリティビット計算","Calcul du bit de parité","Paritätsbit berechnen","Calcular bit de paridad","패리티 비트 계산","Вычисление бита чётности","Calcular bit de paridade","Calcolo bit di parità","Pariteitsbit berekenen","Parite biti hesaplayıcı","Tính bit chẵn lẻ","Menghitung bit paritas"],
 ["增值税价税分离","VAT Price Splitter","消費税の税抜・税込分離","Séparation prix HT / TTC","Umsatzsteuer-Aufteilung","Separación de IVA del precio","부가세 가격 분리","Разделение цены и НДС","Separação de preço e imposto","Separazione prezzo e IVA","Prijs en btw splitsen","KDV fiyat ayrımı","Tách giá và thuế GTGT","Pisah harga & pajak (PPN)"],
 ["百分比变化计算","Percentage Change","パーセント変化計算","Variation en pourcentage","Prozentuale Änderung","Cambio porcentual","퍼센트 변화 계산","Процентное изменение","Variação percentual","Variazione percentuale","Percentage verandering","Yüzde değişim hesaplayıcı","Tính phần trăm thay đổi","Perubahan persentase"],
 ["RGB 与 CMYK 互转","RGB ↔ CMYK Converter","RGB・CMYK 変換","Conversion RGB ↔ CMYK","RGB ↔ CMYK Umrechnung","Conversión RGB ↔ CMYK","RGB↔CMYK 변환","Преобразование RGB ↔ CMYK","Conversão RGB ↔ CMYK","Conversione RGB ↔ CMYK","RGB ↔ CMYK omzetting","RGB ↔ CMYK dönüştürücü","Chuyển đổi RGB ↔ CMYK","Konversi RGB ↔ CMYK"],
 ["区间质数筛选","Prime Number Sieve","区間の素数ふるい","Crible des nombres premiers","Primzahlen-Sieb","Criba de números primos","구간 소수 체","Решето простых чисел","Crivo de números primos","Setacciamento dei primi","Priemgetallen zeef","Asal sayılar eleği","Sàng số nguyên tố","Ayakan bilangan prima"],
 ["斐波那契数列查询","Fibonacci Sequence","フィボナッチ数列","Suite de Fibonacci","Fibonacci-Folge","Secuencia de Fibonacci","피보나치 수열","Последовательность Фибоначчи","Sequência de Fibonacci","Successione di Fibonacci","Fibonacci-reeks","Fibonacci dizisi","Dãy Fibonacci","Deret Fibonacci"],
 ["卢卡斯数列","Lucas Numbers","ルカス数列","Nombres de Lucas","Lucas-Zahlen","Números de Lucas","루카스 수열","Числа Люка","Números de Lucas","Numeri di Lucas","Lucas-getallen","Lucas sayıları","Dãy Lucas","Bilangan Lucas"],
 ["卡特兰数计算","Catalan Number","カタラン数","Nombre de Catalan","Catalan-Zahl","Número de Catalán","카탈란 수","Число Каталана","Número de Catalan","Numero di Catalan","Catalan-getal","Katalan sayısı","Số Catalan","Bilangan Catalan"],
]

def js_arr(row):
    return "[" + ", ".join('"%s"' % s.replace('\\','\\\\').replace('"','\\"') for s in row) + "]"

for r in D:
    assert len(r)==14, ("bad row len", len(r), r[0])

extra = [js_arr([r[0],r[1],r[2],r[3]]) for r in D]
more  = [js_arr([r[0]]+r[4:]) for r in D]

out = []
out.append("/* ============================================================")
out.append("   安空工具箱 — v2.1 多语言词条（新工具）")
out.append("   AK_I18N_EXTRA：[简体, English, 日本語, Français]")
out.append("   AK_I18N_MORE ：[简体, de, es, ko, ru, pt, it, nl, tr, vi, id]")
out.append("   ============================================================ */")
out.append("window.AK_I18N_EXTRA = (window.AK_I18N_EXTRA || []).concat([")
out.append(",\n".join("  "+e for e in extra))
out.append("]);")
out.append("(function(){")
out.append("  var D = window.AK_I18N_MORE = window.AK_I18N_MORE || {")
out.append("    cols: ['de','es','ko','ru','pt','it','nl','tr','vi','id'],")
out.append("    rows: [], patterns: [], words: []")
out.append("  };")
out.append("  D.rows = D.rows.concat([")
out.append(",\n".join("  "+m for m in more))
out.append("]);")
out.append("})();")

p = Path(__file__).resolve().parent / "i18n-v21.js"
p.write_text("\n".join(out)+"\n", encoding="utf-8")
print("wrote", p, "extra", len(extra), "more", len(more))
