#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成 src/i18n-v22.js：v2.2 移植暮光数据资源的 3 个新工具名，15 种语言。
列顺序：EXTRA=[zh,en,ja,fr]  MORE=[zh,de,es,ko,ru,pt,it,nl,tr,vi,id]
"""
from pathlib import Path

# 每条: zh, en, ja, fr, de, es, ko, ru, pt, it, nl, tr, vi, id
D = [
 ["元素周期表","Periodic Table","元素周期表","Tableau périodique","Periodensystem der Elemente","Tabla periódica","원소 주기율표","Периодическая таблица","Tabela periódica","Tavola periodica","Periodiek systeem","Periyodik tablo","Bảng tuần hoàn","Tabel periodik"],
 ["猫品种图鉴","Cat Breed Guide","猫種図鑑","Guide des races de chats","Katzenrassen-Katalog","Guía de razas de gatos","고양이 품종 도감","Каталог пород кошек","Guia de raças de gatos","Guida alle razze di gatti","Kattenrassengids","Kedi ırkları rehberi","Cẩm nang giống mèo","Panduan ras kucing"],
 ["一笔画","One-Stroke Puzzle","一筆書き","Casse-tête en un trait","Ein-Strich-Rätsel","Acertijo de un trazo","한 획 그리기","Головоломка одной линией","Quebra-cabeça de um traço","Puzzle a un tratto","Eén-lijn-puzzel","Tek vuruş bulmacası","Câu đố một nét","Teka-teki satu goresan"],
]

def js_arr(row):
    return "[" + ", ".join('"%s"' % s.replace('\\','\\\\').replace('"','\\"') for s in row) + "]"

for r in D:
    assert len(r)==14, ("bad row len", len(r), r[0])

extra = [js_arr([r[0],r[1],r[2],r[3]]) for r in D]
more  = [js_arr([r[0]]+r[4:]) for r in D]

out = []
out.append("/* ============================================================")
out.append("   安空工具箱 — v2.2 多语言词条（移植暮光数据资源的新工具）")
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

p = Path(__file__).resolve().parent / "i18n-v22.js"
p.write_text("\n".join(out)+"\n", encoding="utf-8")
print("wrote", p, "extra", len(extra), "more", len(more))
