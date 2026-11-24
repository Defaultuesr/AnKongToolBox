#!/usr/bin/env python3
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

HTML = Path('dist/安空工具箱-网页版.html').resolve().as_uri()
LANGS = ['zh-CN','zh-TW','en','ja','fr','de','es','ko','ru','pt','it','nl','tr','vi','id']
ACCENTS = ['amber','mint','sakura','sky','lilac']
NEW = ['hashCrack','colorHarmony','cronExplain','baseNConvert','morseCode','textStats']

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width':412,'height':915})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(HTML, wait_until='domcontentloaded')
        await pg.wait_for_timeout(600)

        info = await pg.evaluate("""(ids) => {
          var ts = AnkongApp.tools()||[];
          var found = ids.map(function(id){return !!ts.filter(function(t){return t.id===id;})[0];});
          var idset={}, dups=[];
          ts.forEach(function(t){ if(idset[t.id]) dups.push(t.id); idset[t.id]=1; });
          var cs=getComputedStyle(document.documentElement);
          var m3count=0;
          try { for (var i=0;i<document.styleSheets[0].cssRules.length;i++){
            if (String(document.styleSheets[0].cssRules[i].cssText).indexOf('--md-sys-color-')>=0) m3count++;
          }} catch(e){}
          return { ver: window.AK_VERSION, tools: ts.length,
            pages: Object.keys(window.AK_PAGES||{}).length,
            found: found, dups: dups.slice(0,10), m3count: m3count,
            surface: cs.getPropertyValue('--md-sys-color-surface').trim() };
        }""", NEW)
        print('VERSION', info['ver'], '| TOOLS', info['tools'], '| PAGES', info['pages'])
        print('M3 TOKEN BLOCKS', info['m3count'], '| surface', info['surface'])
        print('NEW TOOLS:', all(info['found']), info['found'])
        print('DUPLICATES:', info['dups'])

        tests = {
          'hashCrack': {'h':'d41d8cd98f00b204e9800998ecf8427e'},
          'colorHarmony': {'hex':'#6F5C0F','mode':'analogous'},
          'cronExplain': {'expr':'0 9 * * 1-5'},
          'baseNConvert': {'num':'255','from':'10','to':'2'},
          'morseCode': {'mode':'encode','text':'SOS'},
          'textStats': {'text':'Hello world 你好 123'},
        }
        for tid, params in tests.items():
            r = await pg.evaluate("""(a)=>{
              var t=(AnkongApp.tools()||[]).filter(function(x){return x.id===a.id;})[0];
              try{ var o=t.run(a.p); return {ok:!!o.html, txt:(o.text||'').slice(0,55)}; }
              catch(e){ return {err:e.message}; }
            }""", {'id':tid,'p':params})
            print('RUN', tid, r)

        # accent 主题
        for acc in ACCENTS:
            await pg.evaluate("a => { localStorage.setItem('ak_accent', JSON.stringify(a)); localStorage.removeItem('ak_theme'); }", acc)
            await pg.reload(wait_until='domcontentloaded'); await pg.wait_for_timeout(120)
            tok = await pg.evaluate("""() => {var cs=getComputedStyle(document.documentElement);
              return cs.getPropertyValue('--md-sys-color-surface').trim(); }""")
            print('ACCENT', acc, 'surface', tok)

        # 深色
        await pg.evaluate("() => { localStorage.setItem('ak_accent', JSON.stringify('amber')); localStorage.setItem('ak_theme', JSON.stringify('dark')); }")
        await pg.reload(wait_until='domcontentloaded'); await pg.wait_for_timeout(150)
        dark = await pg.evaluate("""() => {var cs=getComputedStyle(document.documentElement);
          return cs.getPropertyValue('--md-sys-color-surface').trim(); }""")
        print('DARK surface', dark)

        # 15语言（新工具名翻译）
        await pg.evaluate("() => { localStorage.setItem('ak_theme', JSON.stringify('light')); }")
        bad = []
        for lg in LANGS:
            await pg.evaluate("l => { window.AKI18N.set(l); AnkongApp.go('tool:hashCrack'); }", lg)
            await pg.wait_for_timeout(25)
            title = await pg.evaluate("() => {var e=document.querySelector('#appbar .title'); return e?e.textContent.trim():'';}")
            if lg not in ('zh-CN','zh-TW') and title == '哈希类型识别': bad.append(lg)
        print('LANG untranslated', bad)

        # 视口
        overflow = []
        for w in [320,375,412,768,1024,1440]:
            await pg.set_viewport_size({'width':w,'height':800})
            await pg.evaluate("() => AnkongApp.go('home')"); await pg.wait_for_timeout(60)
            sw = await pg.evaluate("()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth})")
            if sw['sw'] > sw['cw'] + 2: overflow.append((w,sw['sw'],sw['cw']))
        print('OVERFLOW', overflow)
        print('PAGE ERRORS', errs)

        ok = (info['ver']=='2.6' and info['tools']>=489 and info['m3count']>=30
              and all(info['found']) and not info['dups'] and not bad and not overflow and not errs)
        print('RESULT:', 'PASS' if ok else 'CHECK')
        await b.close()

asyncio.run(main())
