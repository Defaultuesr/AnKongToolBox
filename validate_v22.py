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
          langs: 15,
          dataEls: window.AK_TWILIGHT ? window.AK_TWILIGHT.elements.length : -1,
          dataCats: window.AK_TWILIGHT ? window.AK_TWILIGHT.cats.length : -1,
          dataLevels: window.AK_TWILIGHT ? window.AK_TWILIGHT.onestroke.length : -1,
          hasPT: !!(AnkongApp.tools()||[]).filter(function(t){return t.id==='periodicTable';})[0],
          hasCat: !!(AnkongApp.tools()||[]).filter(function(t){return t.id==='catGuide';})[0],
          hasOne: !!(AnkongApp.tools()||[]).filter(function(t){return t.id==='oneStroke';})[0]
        })""")
        print('VERSION', info['ver'], '| TOOLS', info['tools'], '| PAGES', info['pages'])
        print('DATA elements/cats/levels:', info['dataEls'], info['dataCats'], info['dataLevels'])
        print('NEW TOOLS present:', info['hasPT'], info['hasCat'], info['hasOne'])

        # 元素周期表渲染
        await pg.evaluate("() => AnkongApp.go('tool:periodicTable')")
        await pg.wait_for_timeout(200)
        pt = await pg.evaluate("""() => ({
          cells: document.querySelectorAll('#pt-grid [data-pt-num]').length,
          filters: document.querySelectorAll('#pt-filter [data-pt-cat]').length
        })""")
        print('PERIODIC cells/filters:', pt['cells'], pt['filters'])
        # 点一个元素看详情
        await pg.evaluate("() => { var c=document.querySelector('#pt-grid [data-pt-num=\"79\"]'); if(c)c.click(); }")
        await pg.wait_for_timeout(100)
        det = await pg.evaluate("() => (document.querySelector('#pt-detail')||{}).textContent || ''")
        print('PERIODIC detail has 金/Au:', ('金' in det and 'Au' in det))

        # 猫图鉴渲染
        await pg.evaluate("() => AnkongApp.go('tool:catGuide')")
        await pg.wait_for_timeout(200)
        cat = await pg.evaluate("""() => ({
          items: document.querySelectorAll('#ck-list [data-ck-open]').length,
          filters: document.querySelectorAll('#ck-filter [data-ck-m]').length
        })""")
        print('CAT items/filters:', cat['items'], cat['filters'])

        # 一笔画渲染 + 交互（点起点后点一个相邻节点）
        await pg.evaluate("() => AnkongApp.go('tool:oneStroke')")
        await pg.wait_for_timeout(200)
        os1 = await pg.evaluate("""() => ({
          nodes: document.querySelectorAll('#os-svg [data-os-node]').length,
          label: (document.querySelector('#os-label')||{}).textContent||'',
          status: (document.querySelector('#os-status')||{}).textContent||''
        })""")
        print('ONESTROKE nodes:', os1['nodes'], '| label:', os1['label'], '| status:', os1['status'])
        # 按解法点击所有节点，验证过关
        solved = await pg.evaluate("""() => {
          var sol = window.AK_TWILIGHT.onestroke[0].sol || [];
          sol.forEach(function(n){
            var c=document.querySelector('#os-svg [data-os-node=\"'+n+'\"]');
            if(c) c.dispatchEvent(new MouseEvent('click',{bubbles:true}));
          });
          return (document.querySelector('#os-status')||{}).textContent||'';
        }""")
        print('ONESTROKE after solve:', solved)

        # 15语言切换：工具名翻译
        trans = {}
        for lg in LANGS:
            await pg.evaluate("l => { window.AKI18N.set(l); AnkongApp.go('tool:periodicTable'); }", lg)
            await pg.wait_for_timeout(30)
            trans[lg] = await pg.evaluate("() => { var e=document.querySelector('#appbar .title'); return e?e.textContent:''; }")
        print('LANG periodicTable titles:', ' | '.join(lg+'='+trans[lg] for lg in LANGS))

        # 视口溢出检查
        for w in [320, 375, 768, 1024, 1440]:
            await pg.set_viewport_size({'width': w, 'height': 800})
            await pg.evaluate("() => AnkongApp.go('tool:periodicTable')")
            await pg.wait_for_timeout(60)
            of = await pg.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
            print(f'VIEWPORT {w}: overflow={of}')

        print('PAGEERRORS', len(errs))
        for e in errs[:8]: print('  ERR', e)
        await b.close()

asyncio.run(main())
