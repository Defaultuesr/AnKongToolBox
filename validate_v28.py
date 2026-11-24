#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v2.8 验证：时间屏幕一比一复刻、版本、主题、工具、交互。"""
import pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parent
ok, fail = [], []
def check(name, cond, msg=''):
    (ok if cond else fail).append(name + (' — ' + msg if msg else ''))

check('版本 2.8', "var VERSION = '2.8';" in (ROOT/'src/core.js').read_text(encoding='utf-8'))
check('更新模块 2.8', "window.AK_VERSION || '2.8'" in (ROOT/'src/update.js').read_text(encoding='utf-8'))
pages=(ROOT/'src/pages.js').read_text(encoding='utf-8')
check('更新日志 v2.8', "['v2.8'" in pages)
check('8周年致敬文案', '为爱发电 · 持续更新' in pages and '八年' in pages)

tools=(ROOT/'src/tools-v28.js').read_text(encoding='utf-8')
check('时间屏幕工具', "id: 'timeScreen'" in tools)
check('10 款模板', all(("id: '%s'"%i) in tools for i in ['focus','poster','minimal','dial','dual','stack','orbit','bubble','mixed','ribbon']))
tpl_block = tools.split('AK_TSCREEN_TPLS = [')[1].split('];')[0]
check('模板数组长度 10', len(re.findall(r"id: '\w+'", tpl_block))==10)
check('3 种外观', all(x in tools for x in ["'theme'","'dark'","'soft'"]))
check('ES5 兼容', not re.search(r'\b(let|const)\s+\w|=>', tools))

style=(ROOT/'src/style.css').read_text(encoding='utf-8')
check('时间屏幕样式', '.ts-blob' in style and '.ts-panel' in style and '.ts-tpl-grid' in style)
check('SVG 花边 blob', 'ts-blob-morph' in style and 'data:image/svg+xml' in style)
check('青草绿主题令牌', '[data-accent="grass"][data-theme="light"]' in style and '--md-sys-color-primary: #2e6a44' in style)

bw=(ROOT/'build-web.py').read_text(encoding='utf-8')
check('构建纳入 v2.8 文件', all(f in bw for f in ['tools-v28.js','i18n-v28.js']))
check('单文件 HTML', (ROOT/'dist/安空工具箱-网页版.html').exists())

print('通过 %d 项：'%len(ok))
for x in ok: print('  ✓',x)
if fail:
    print('失败 %d 项：'%len(fail))
    for x in fail: print('  ✗',x)
    sys.exit(1)
print('\n全部通过。')
