#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 src/i18n-v24.js：v2.4 新工具名，15 种语言。"""
from pathlib import Path

# zh, en, ja, fr, de, es, ko, ru, pt, it, nl, tr, vi, id
D = [
 ["彩票号码生成","Lottery Number Generator"," lottery 番号生成","Générateur de numéros de loterie","Lotteriezahlen-Generator","Generador de números de lotería","로또 번호 생성","Генератор номеров лотереи","Gerador de números da loteria","Generatore numeri lotteria","Loterijnummer generator","Piyango numarası üretici","Tạo số xổ số","Generator nomor lotre"],
 ["百家姓查询","Chinese Surname Lookup","百家姓検索","Recherche de noms de famille chinois","Chinesische Familiennamen Suche","Consulta de apellidos chinos","백가성 조회","Поиск китайских фамилий","Consulta de sobrenomes chineses","Ricerca cognomi cinesi","Chinese achternamen opzoeken","Çin soyadı sorgulama","Tra cứu họ Trung Hoa","Cek marga Tionghoa"],
 ["盲文转换","Braille Converter","点字変換","Convertisseur en braille","Braille-Konverter","Conversor a braille","점자 변환","Преобразование в шрифт Брайля","Conversor para braile","Convertitore in braille","Braille omzetting","Braille dönüştürücü","Chuyển đổi chữ nổi","Konversi huruf Braille"],
 ["车牌号归属地","License Plate Lookup","ナンバープレート照会","Recherche de plaque d'immatriculation","Kennzeichen-Abfrage","Consulta de matrículas","차량 번호판 조회","Поиск по номерному знаку","Consulta de placa","Ricerca targa","Kenteken opzoeken","Plaka sorgulama","Tra cứu biển số xe","Cek plat nomor"],
 ["体脂率计算","Body Fat Calculator","体脂肪率計算"," calculateur de graisse corporelle","Körperfettanteil berechnen","Calculadora de grasa corporal","체지방률 계산","Расчёт процента жира","Calculadora de gordura corporal","Calcola grasso corporeo","Lichaamsvetpercentage berekenen","Vücut yağ oranı hesaplayıcı","Tính tỷ lệ mỡ cơ thể","Kalkulator lemak tubuh"],
 ["元素周期表测验","Periodic Table Quiz","元素周期表クイズ","Quiz du tableau périodique","Periodensystem-Quiz","Cuestionario de tabla periódica","주기율표 퀴즈","Викторина по таблице Менделеева","Quiz da tabela periódica","Quiz della tavola periodica","Periodiek systeem quiz","Periyodik tablo testi","Trắc nghiệm bảng tuần hoàn","Kuis tabel periodik"],
]
# 修正首列里混入的英文占位
D[0][1]="Lottery Number Generator"; D[0][2]="宝くじ番号生成"; D[0][3]="Générateur de numéros de loterie"
D[4][3]="Calculateur de graisse corporelle"

def js_arr(row):
    return "[" + ", ".join('"%s"' % s.replace('\\','\\\\').replace('"','\\"') for s in row) + "]"

for r in D:
    assert len(r)==14, ("bad row len", len(r), r[0])

extra = [js_arr([r[0],r[1],r[2],r[3]]) for r in D]
more  = [js_arr([r[0]]+r[4:]) for r in D]

out = []
out.append("/* 安空工具箱 — v2.4 多语言词条（新工具）")
out.append("   AK_I18N_EXTRA：[简体, English, 日本語, Français]")
out.append("   AK_I18N_MORE ：[简体, de, es, ko, ru, pt, it, nl, tr, vi, id] */")
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

p = Path(__file__).resolve().parent / "i18n-v24.js"
p.write_text("\n".join(out)+"\n", encoding="utf-8")
print("wrote", p, "extra", len(extra), "more", len(more))
