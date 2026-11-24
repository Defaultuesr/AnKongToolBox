#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""生成应用图标：浅黄渐变底 + 深橄榄黄 3x3 工具网格，与浅黄色主题一致。"""
import pathlib
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent
SIZES = {
    'mipmap-mdpi': 48, 'mipmap-hdpi': 72, 'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144, 'mipmap-xxxhdpi': 192,
}


def make(size):
    S = 1024
    img = Image.new('RGB', (S, S), '#FFF8EE')
    px = img.load()
    # 浅黄 → 芥末黄 竖向渐变
    for y in range(S):
        t = y / S
        r = int(0xFA + (0xE3 - 0xFA) * t)
        g = int(0xE1 + (0xBE - 0xE1) * t)
        b = int(0x85 + (0x4E - 0x85) * t)
        for x in range(S):
            px[x, y] = (r, g, b)
    mask = Image.new('L', (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, S - 1, S - 1), radius=220, fill=255)
    base = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    base.paste(img, (0, 0), mask)
    d = ImageDraw.Draw(base)
    # 3x3 工具网格，深橄榄黄实心
    cell, gap, left, top = 176, 40, 200, 200
    ink = (111, 92, 15, 255)
    for row in range(3):
        for col in range(3):
            x0 = left + col * (cell + gap)
            y0 = top + row * (cell + gap)
            d.rounded_rectangle((x0, y0, x0 + cell, y0 + cell), radius=44, fill=ink)
    return base.resize((size, size), Image.LANCZOS)


for folder, size in SIZES.items():
    out = ROOT / 'app' / 'src' / 'main' / 'res' / folder / 'ic_launcher.png'
    out.parent.mkdir(parents=True, exist_ok=True)
    make(size).save(out)
    print(out, size)

web = ROOT / 'app' / 'src' / 'main' / 'assets' / 'www' / 'icon.png'
web.parent.mkdir(parents=True, exist_ok=True)
make(192).save(web)
print(web, 192)
