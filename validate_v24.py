#!/usr/bin/env python3
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

HTML = Path('dist/安空工具箱-网页版.html').resolve().as_uri()
LANGS = ['zh-CN','zh-TW','en','ja','fr','de','es','ko','ru','pt','it','nl','tr','vi','id']

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        pg = await b.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(HTML, wait_until='domcontentloaded')
        await pg.wait_for_timeout(500)
        info = await pg.evaluate("""() => ({
          ver: window.AK_VERSION,
          tools: (AnkongApp.tools()||[]).length,
          pages: Object.keys(window.AK_PAGES||{}).length,
          ids: ['lotteryGen','surnames','brailleConv','plateLookup','bodyFat','periodicQuiz'].map(function(id){return !!(AnkongApp.tools()||[]).filter(function(t){return t.id===id;})[0];})
        })""")
        print('VERSION', info['ver'], '| TOOLS', info['tools'], '| PAGES', info['pages'])
        print('NEW TOOLS present:', info['ids'])

        # run 工具执行测试
        tests = {
          'lotteryGen': {'type':'ssq', 'sets':'5'},
          'surnames': {'q':'李'},
          'brailleConv': {'text':'HELLO 2026'},
          'plateLookup': {'plate':'粤B12345'},
          'bodyFat': {'method':'bmi','gender':'male','age':'30','height':'175','weight':'70','waist':'80','neck':'38','hip':'95'}
        }
        for tid, params in tests.items():
            r = await pg.evaluate("""(a)=>{
              var t=(AnkongApp.tools()||[]).filter(function(x){return x.id===a.id;})[0];
              try{ var o=t.run(a.p); return {ok:!!o.html, txt:(o.text||'').slice(0,70)}; }
              catch(e){ return {err:e.message}; }
            }""", {'id':tid,'p':params})
            print('RUN', tid, r)

        # 元素测验 custom
        await pg.evaluate("() => AnkongApp.go('tool:periodicQuiz')")
        await pg.wait_for_timeout(150)
        qz = await pg.evaluate("() => ({opts:document.querySelectorAll('#qz-box [data-qz-opt]').length, q:(document.querySelector('#qz-box')||{}).textContent.slice(0,40)})")
        print('QUIZ:', qz)

        # 15语言
        trans = {}
        for lg in LANGS:
            await pg.evaluate("l => { window.AKI18N.set(l); AnkongApp.go('tool:brailleConv'); }", lg)
            await pg.wait_for_timeout(25)
            trans[lg] = await pg.evaluate("() => { var e=document.querySelector('#appbar .title'); return e?e.textContent:''; }")
        print('LANG:', ' | '.join(lg+'='+trans[lg] for lg in LANGS))

        # 视口溢出
        for w in [320, 375, 768, 1024, 1440]:
            await pg.set_viewport_size({'width': w, 'height': 800})
            await pg.evaluate("() => AnkongApp.go('tool:surnames')")
            await pg.wait_for_timeout(50)
            of = await pg.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
            print(f'VIEWPORT {w}: overflow={of}')

        print('PAGEERRORS', len(errs))
        for e in errs[:8]: print('  ERR', e)
        await b.close()

asyncio.run(main())
