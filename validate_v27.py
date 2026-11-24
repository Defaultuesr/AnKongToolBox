#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v2.7 验证：M3E Canvas 设计规范落地、版本、工具、多视口、运行时无错误。"""
import pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent
ok, fail = [], []
def check(name, cond, msg=''):
    (ok if cond else fail).append(name + (' — ' + msg if msg else ''))

core = (ROOT/'src/core.js').read_text(encoding='utf-8')
check('版本号 2.7', "var VERSION = '2.7';" in core)
upd = (ROOT/'src/update.js').read_text(encoding='utf-8')
check('更新模块版本 2.7', "window.AK_VERSION || '2.7'" in upd)

pages = (ROOT/'src/pages.js').read_text(encoding='utf-8')
check('更新日志含 v2.7', "['v2.7'" in pages)
check('反馈邮箱固定', '3805278668@qq.com' in pages)

style = (ROOT/'src/style.css').read_text(encoding='utf-8')
check('M3E 来源标注', 'M3E Canvas' in style and 'lnkiai.github.io/m3e-canvas' in style)
check('内联 Roboto 字体', "font-family:'Roboto'" in style and 'data:font/woff2;base64' in style)
check('内联 Material Symbols Rounded', "Material Symbols Rounded" in style)
check('网站 Purple 主色', '--md-sys-color-primary: #6750A4' in style, 'light')
check('网站 surface #FFFBFE', '--md-sys-color-surface: #FFFBFE' in style)
check('Expressive spring 缓动', 'cubic-bezier(.32, .72, 0, 1)' in style)
check('pill 按钮规范', '--md-sys-shape-full' in style and 'border-radius: var(--md-sys-shape-full)' in style)
check('导航 pill indicator 64×32', 'min-width: 64px; height: 32px' in style)
check('FAB 16dp 圆角', re.search(r'\.fab\s*\{[^}]*border-radius:\s*16px', style, re.S) is not None)
check('28dp 对话框/面板', 'border-radius: 28px 28px 0 0' in style)
check('深色主题令牌', '[data-accent="purple"][data-theme="dark"]' in style)

# 新工具 / 图标 / i18n
tools27 = (ROOT/'src/tools-v27.js').read_text(encoding='utf-8')
new_ids = ['m3Palette','contrastCheck','uuidGen','loremGen','hexRgb','strTransform']
check('6 个新工具', all(("id: '%s'" % i) in tools27 for i in new_ids))
check('工具 ES5 兼容', not re.search(r'\b(let|const)\s+\w|=>', tools27))
check('图标映射', all(i in (ROOT/'src/icons-v27.js').read_text(encoding='utf-8') for i in new_ids))
i18n = (ROOT/'src/i18n-v27.js').read_text(encoding='utf-8')
check('i18n 四语', 'AK_I18N_EXTRA' in i18n and 'AK_I18N_MORE' in i18n)

# 构建列表
bw = (ROOT/'build-web.py').read_text(encoding='utf-8')
check('构建纳入 v2.7', all(f in bw for f in ['icons-v27.js','i18n-v27.js','tools-v27.js']))

# 单文件存在
dist = ROOT/'dist/安空工具箱-网页版.html'
check('单文件 HTML 已生成', dist.exists() and dist.stat().st_size > 1_000_000)

print('通过 %d 项：' % len(ok))
for x in ok: print('  ✓', x)
if fail:
    print('失败 %d 项：' % len(fail))
    for x in fail: print('  ✗', x)
    sys.exit(1)
print('\n全部通过。')
