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
          dataSuf: window.AK_TW23 ? window.AK_TW23.suffixes.length : -1,
          dataLibs: window.AK_TW23 ? window.AK_TW23.libs.length : -1,
          ids: ['whatToEat','domainSuffix','imperialUnits','openSourceLibs'].map(function(id){return !!(AnkongApp.tools()||[]).filter(function(t){return t.id===id;})[0];})
        })""")
        print('VERSION', info['ver'], '| TOOLS', info['tools'], '| PAGES', info['pages'])
        print('DATA suffixes/libs:', info['dataSuf'], info['dataLibs'])
        print('NEW TOOLS present:', info['ids'])

        # 今天吃什么
        await pg.evaluate("() => AnkongApp.go('tool:whatToEat')")
        await pg.wait_for_timeout(150)
        await pg.evaluate("() => { var b=document.querySelector('[data-eat=roll]'); if(b)b.click(); }")
        await pg.wait_for_timeout(80)
        eat = await pg.evaluate("() => (document.querySelector('#eat-result')||{}).textContent||''")
        print('EAT result:', eat[:40].replace('\n',' '))

        # 域名后缀 - 用 run 工具
        dom = await pg.evaluate("""() => {
          var t=(AnkongApp.tools()||[]).filter(function(x){return x.id==='domainSuffix';})[0];
          try{ var o=t.run({domain:'https://www.example.com.cn/path'}); return {ok:!!o.html, txt:(o.text||'').slice(0,90)}; }
          catch(e){ return {err:e.message}; }
        }""")
        print('DOMAIN:', dom)

        # 英制单位换算
        uni = await pg.evaluate("""() => {
          var t=(AnkongApp.tools()||[]).filter(function(x){return x.id==='imperialUnits';})[0];
          try{ var o=t.run({type:'mass',value:'1'}); return {ok:!!o.html, txt:(o.text||'').slice(0,90)}; }
          catch(e){ return {err:e.message}; }
        }""")
        print('UNITS:', uni)

        # 开源库
        await pg.evaluate("() => AnkongApp.go('tool:openSourceLibs')")
        await pg.wait_for_timeout(150)
        lib = await pg.evaluate("() => document.querySelectorAll('#lib-list [data-lib-open]').length")
        print('OPENSOURCE rows:', lib)

        # 15语言
        trans = {}
        for lg in LANGS:
            await pg.evaluate("l => { window.AKI18N.set(l); AnkongApp.go('tool:domainSuffix'); }", lg)
            await pg.wait_for_timeout(25)
            trans[lg] = await pg.evaluate("() => { var e=document.querySelector('#appbar .title'); return e?e.textContent:''; }")
        print('LANG:', ' | '.join(lg+'='+trans[lg] for lg in LANGS))

        # 视口溢出
        for w in [320, 375, 768, 1024, 1440]:
            await pg.set_viewport_size({'width': w, 'height': 800})
            await pg.evaluate("() => AnkongApp.go('tool:openSourceLibs')")
            await pg.wait_for_timeout(50)
            of = await pg.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
            print(f'VIEWPORT {w}: overflow={of}')

        print('PAGEERRORS', len(errs))
        for e in errs[:8]: print('  ERR', e)
        await b.close()

asyncio.run(main())
