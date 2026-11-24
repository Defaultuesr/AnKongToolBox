#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 src/i18n-v23.js：v2.3 新工具名，15 种语言。
列顺序：EXTRA=[zh,en,ja,fr]  MORE=[zh,de,es,ko,ru,pt,it,nl,tr,vi,id]
"""
from pathlib import Path

# 每条: zh, en, ja, fr, de, es, ko, ru, pt, it, nl, tr, vi, id
D = [
 ["今天吃什么","What to Eat","今日吃什么","Que manger aujourd'hui","Was essen heute","Qué comer hoy","오늘 뭐 먹지","Что съесть сегодня","O que comer hoje","Cosa mangiare oggi","Wat eten we vandaag","Ne yenir bugün","Hôm nay ăn gì","Makan apa hari ini"],
 ["域名后缀查询","Domain Suffix Lookup","ドメインサフィックス照会","Recherche de suffixe de domaine","Domain-Suffix-Abfrage","Consulta de sufijo de dominio","도메인 접미사 조회","Поиск суффикса домена","Consulta de sufixo de domínio","Ricerca suffisso di dominio","Domeinsuffix opzoeken","Alan adı eki sorgulama","Tra cứu hậu tố tên miền","Cek akhiran domain"],
 ["英制单位换算","Imperial Units Converter","英単位変換","Conversion unités impériales","Imperiale Einheiten Umrechnung","Conversión de unidades imperiales","제국 단위 변환","Перевод имперских единиц","Conversão de unidades imperiais","Conversione unità imperiali","Imperiale eenheden omzetting","İmperyal birim dönüştürücü","Chuyển đổi đơn vị Anh","Konversi satuan imperial"],
 ["开源库速查","Open-Source Library Lookup","オープンソースライブラリ検索","Recherche de bibliothèques open source","Open-Source-Bibliotheken Suche","Consulta de bibliotecas de código abierto","오픈소스 라이브러리 조회","Поиск библиотек с открытым кодом","Consulta de bibliotecas open-source","Ricerca librerie open-source","Open-source bibliotheken opzoeken","Açık kaynak kütüphane sorgulama","Tra cứu thư viện mã nguồn mở","Cek pustaka open-source"],
]

def js_arr(row):
    return "[" + ", ".join('"%s"' % s.replace('\\','\\\\').replace('"','\\"') for s in row) + "]"

for r in D:
    assert len(r)==14, ("bad row len", len(r), r[0])

extra = [js_arr([r[0],r[1],r[2],r[3]]) for r in D]
more  = [js_arr([r[0]]+r[4:]) for r in D]

out = []
out.append("/* 安空工具箱 — v2.3 多语言词条（新工具）")
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

p = Path(__file__).resolve().parent / "i18n-v23.js"
p.write_text("\n".join(out)+"\n", encoding="utf-8")
print("wrote", p, "extra", len(extra), "more", len(more))
