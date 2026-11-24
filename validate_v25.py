#!/usr/bin/env python3
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

HTML = Path('dist/安空工具箱-网页版.html').resolve().as_uri()
LANGS = ['zh-CN','zh-TW','en','ja','fr','de','es','ko','ru','pt','it','nl','tr','vi','id']
NEW = ['logicTruthTable','levenshtein','romanNumeral','complexCalc','linearEq2','bmiBmr']

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width':390,'height':844})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(HTML, wait_until='domcontentloaded')
        await pg.wait_for_timeout(600)
        info = await pg.evaluate("""(ids) => {
          var ts = AnkongApp.tools()||[];
          var found = ids.map(function(id){return !!ts.filter(function(t){return t.id===id;})[0];});
          var idset = {}, namedup = {}, dups=[];
          ts.forEach(function(t){ if(idset[t.id]) dups.push(t.id); idset[t.id]=1; });
          return { ver: window.AK_VERSION, tools: ts.length,
            pages: Object.keys(window.AK_PAGES||{}).length,
            found: found, dups: dups.slice(0,10),
            langs: 0 };
        }""", NEW)
        print('VERSION', info['ver'], '| TOOLS', info['tools'], '| PAGES', info['pages'])
        print('NEW TOOLS present:', info['found'], 'ALL=', all(info['found']))
        print('DUPLICATE IDs:', info['dups'])

        tests = {
          'logicTruthTable': {'gate':'XOR'},
          'levenshtein': {'a':'kitten','b':'sitting'},
          'romanNumeral': {'mode':'n2r','val':'2026'},
          'complexCalc': {'op':'mul','a':'3','b':'4','c':'1','d':'-2'},
          'linearEq2': {'a1':'2','b1':'1','c1':'5','a2':'1','b2':'-1','c2':'1'},
          'bmiBmr': {'gender':'m','weight':'65','height':'170','age':'25'},
        }
        for tid, params in tests.items():
            r = await pg.evaluate("""(a)=>{
              var t=(AnkongApp.tools()||[]).filter(function(x){return x.id===a.id;})[0];
              try{ var o=t.run(a.p); return {ok:!!o.html, txt:(o.text||'').slice(0,60)}; }
              catch(e){ return {err:e.message}; }
            }""", {'id':tid,'p':params})
            print('RUN', tid, r)

        # 15语言标题翻译
        bad = []
        for lg in LANGS:
            await pg.evaluate("l => { window.AKI18N.set(l); AnkongApp.go('tool:levenshtein'); }", lg)
            await pg.wait_for_timeout(30)
            title = await pg.evaluate("() => { var e=document.querySelector('#appbar .title'); return e?e.textContent.trim():''; }")
            zh = '编辑距离'
            if lg not in ('zh-CN','zh-TW') and title == zh:
                bad.append(lg)
        print('LANG untranslated:', bad)

        # 视口溢出
        overflow = []
        for w in [320, 375, 768, 1024, 1440]:
            await pg.set_viewport_size({'width': w, 'height': 800})
            await pg.evaluate("() => AnkongApp.go('tool:levenshtein')")
            await pg.wait_for_timeout(60)
            sw = await pg.evaluate("() => ({sw:document.documentElement.scrollWidth, cw:document.documentElement.clientWidth})")
            if sw['sw'] > sw['cw'] + 2:
                overflow.append((w, sw['sw'], sw['cw']))
        print('OVERFLOW:', overflow)
        print('PAGE ERRORS:', errs)

        ok = (info['ver']=='2.5' and info['tools']>=483 and all(info['found'])
              and not info['dups'] and not bad and not overflow and not errs)
        print('RESULT:', 'PASS' if ok else 'CHECK')
        await b.close()

asyncio.run(main())
