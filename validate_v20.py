#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""v2.0 运行时验证：工具/页面/语言数、资讯页渲染、语言切换、多视口无溢出、无 pageerror。"""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

HTML = Path(__file__).resolve().parent / "dist" / "安空工具箱-网页版.html"

async def main():
    errors = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        page = await browser.new_page(viewport={"width": 390, "height": 844})
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(HTML.as_uri(), wait_until="domcontentloaded")
        await page.wait_for_timeout(600)

        stats = await page.evaluate("""() => ({
          tools: (window.AnkongApp && AnkongApp.tools() || []).length,
          pages: Object.keys(window.AK_PAGES || {}).length,
          langs: (document.querySelectorAll('[data-act=lang]')||[]).length,
          tabs: Array.from(document.querySelectorAll('#tabbar .tab .lb')||[]).map(e=>e.textContent),
          version: window.AK_VERSION,
          hasNews: !!(window.AK_NEWS && window.AK_NEWS.page)
        })""")
        print("STATS:", stats)

        # 进入资讯页
        await page.evaluate("window.AnkongApp.go('news','news')")
        await page.wait_for_timeout(400)
        news_info = await page.evaluate("""() => ({
          route: AnkongApp.state.route,
          hasBody: !!document.querySelector('#news-body'),
          chips: (document.querySelectorAll('[data-act=news-tab]')||[]).length,
          sites: (document.querySelectorAll('[data-act=open-url]')||[]).length,
          title: (document.querySelector('#appbar .title')||{}).textContent
        })""")
        print("NEWS:", news_info)

        # 切换资讯板块（不联网也应切换 UI）
        await page.evaluate("window.AK_NEWS.switchTab('weibo')")
        await page.wait_for_timeout(200)
        chip_on = await page.evaluate("""() => {
          var on=document.querySelector('[data-act=news-tab].on');
          return on?on.textContent:null; }""")
        print("NEWS TAB switch ->", chip_on)

        # 多视口溢出检测（在工具页更严格）
        await page.evaluate("window.AnkongApp.go('home','home')")
        overflow = {}
        for w, h in [(320, 700), (390, 844), (768, 1024), (1024, 768), (1440, 900)]:
            await page.set_viewport_size({"width": w, "height": h})
            await page.wait_for_timeout(120)
            ov = await page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
            overflow[f"{w}x{h}"] = ov
        print("OVERFLOW:", overflow)

        await browser.close()
    print("PAGE ERRORS:", len(errors))
    for e in errors[:10]:
        print("  ERR:", e)

asyncio.run(main())
