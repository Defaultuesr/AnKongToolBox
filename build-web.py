#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 src/ 下的 CSS 与 JS 合并成单文件 index.html（离线可用）。"""
import pathlib
import re
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'
OUT = ROOT / 'app' / 'src' / 'main' / 'assets' / 'www' / 'index.html'
DIST = ROOT / 'dist' / '安空工具箱-网页版.html'

JS_FILES = [
    'vendor/qrcode.js',
    'tools.js',
    'icons.js',
    'i18n-s2t.js',
    'i18n-data.js',
    'i18n-extra.js',
    'i18n-v13.js',
    'i18n.js',
    'hubs.js',
    'pages.js',
    'tools-query.js',
    'tools-text.js',
    'tools-dev.js',
    'tools-image.js',
    'tools-life.js',
    'tools-extra.js',
    'tools-games.js',
    'tools-hub.js',
    'tools-more.js',
    'tools-v13.js',
    'core.js',
]

css = (SRC / 'style.css').read_text(encoding='utf-8')
js_parts = []
for name in JS_FILES:
    js_parts.append('/* ===== %s ===== */' % name)
    js_parts.append((SRC / name).read_text(encoding='utf-8'))
js = '\n'.join(js_parts)

# 防止 JS 字符串里的 </script> 提前结束脚本标签
if re.search(r'</script', js, re.I):
    js = re.sub(r'</script', r'<\\/script', js, flags=re.I)

# 语法校验
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
    f.write(js)
    tmp = f.name
chk = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
if chk.returncode != 0:
    print('JS 语法检查失败：')
    print(chk.stdout + chk.stderr)
    sys.exit(1)
pathlib.Path(tmp).unlink(missing_ok=True)

tpl = (SRC / 'index.template.html').read_text(encoding='utf-8')
html = tpl.replace('/*__CSS__*/', css).replace('/*__JS__*/', js)

OUT.parent.mkdir(parents=True, exist_ok=True)
DIST.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(html, encoding='utf-8')
DIST.write_text(html, encoding='utf-8')

count = len(re.findall(r'^T\(\{', js, re.M)) + len(re.findall(r'^  return T\(\{', js, re.M))
print('JS 语法检查通过')
print('工具注册调用数：%d' % js.count('T({'))
print('assets  → %s (%.1f KB)' % (OUT, OUT.stat().st_size / 1024))
print('网页版  → %s (%.1f KB)' % (DIST, DIST.stat().st_size / 1024))
