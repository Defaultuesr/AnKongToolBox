/* ============================================================
   安空工具箱 v2.8 — 一比一复刻暮光 4.0.6 的 MD3「时间屏幕」桌面钟
   素材与布局来源：B站视频 BV1NVbJ6TE4T（风风green_official）逐帧 + 封面
   · 薰衣草背景 + 波浪花边(blob)时钟 + 粉色模板面板
   · 10 个模板（焦点/海报/极简/表盘/双块/堆叠/轨道/气泡/混合/丝带）
   · 外观：主题 / 暗色 / 柔和；实时时钟
   全部本地运行，ES5 兼容
   ============================================================ */

var AK_TSCREEN_TPLS = [
  { id: 'focus',   name: '焦点',   sub: '醒目 DOI',   demo: 'focus' },
  { id: 'poster',  name: '海报',   sub: '信息分区',   demo: 'poster' },
  { id: 'minimal', name: '极简',   sub: '低干扰',     demo: 'minimal' },
  { id: 'dial',    name: '表盘',   sub: '模拟时针',   demo: 'dial' },
  { id: 'dual',    name: '双块',   sub: '时分双块',   demo: 'dual' },
  { id: 'stack',   name: '堆叠',   sub: '纵向排版',   demo: 'stack' },
  { id: 'orbit',   name: '轨道',   sub: '环形节点',   demo: 'orbit' },
  { id: 'bubble',  name: '气泡',   sub: '形状组合',   demo: 'bubble' },
  { id: 'mixed',   name: '混合',   sub: '数据同屏',   demo: 'mixed' },
  { id: 'ribbon',  name: '丝带',   sub: '横向条纹',   demo: 'ribbon' }
];

T({ id: 'timeScreen', name: '时间屏幕', cat: 'life', icon: '钟', tint: '#DCD6F7',
  desc: 'MD3 桌面钟 · 10 款模板一比一复刻', tags: '时间 桌面钟 时钟 屏幕 MD3 暮光 花钟',
  note: '界面一比一复刻暮光工具箱 4.0.6 的「时间屏幕」（见 B 站官方宣传视频）。模板与外观均可实时切换。',
  custom: function (host) {
    var sel = 'bubble', look = 'theme', timer = null;

    function p2(n) { return n < 10 ? '0' + n : String(n); }
    function now() {
      var d = new Date();
      return { h: p2(d.getHours()), m: p2(d.getMinutes()), s: p2(d.getSeconds()) };
    }

    // 模板小示意图（复刻面板里的紫色缩略图）
    function demo(kind) {
      var b = 'var(--ts-accent)';
      var m = {
        focus:   '<span style="width:26px;height:14px;background:' + b + ';border-radius:5px;display:inline-block"></span><span style="width:6px;height:6px;background:' + b + ';opacity:.45;border-radius:50%;display:inline-block;margin-left:3px"></span>',
        poster:  '<span style="width:22px;height:14px;background:' + b + ';border-radius:4px;display:inline-block"></span><span style="width:10px;height:14px;background:' + b + ';opacity:.3;border-radius:4px;display:inline-block;margin-left:2px"></span>',
        minimal: '<span style="width:28px;height:3px;background:' + b + ';border-radius:2px;display:inline-block"></span>',
        dial:    '<span style="width:14px;height:14px;border:2px solid ' + b + ';border-radius:50%;display:inline-block;position:relative"></span><span style="position:absolute;width:6px;height:2px;background:' + b + ';transform:rotate(-35deg)"></span>',
        dual:    '<span style="width:12px;height:14px;background:' + b + ';border-radius:4px;display:inline-block"></span><span style="width:12px;height:14px;background:' + b + ';opacity:.55;border-radius:4px;display:inline-block;margin-left:2px"></span>',
        stack:   '<span style="width:26px;height:5px;background:' + b + ';border-radius:3px;display:inline-block;margin-bottom:3px"></span><span style="width:18px;height:5px;background:' + b + ';opacity:.5;border-radius:3px;display:inline-block"></span>',
        orbit:   '<span style="width:15px;height:15px;border:2px solid ' + b + ';border-radius:50%;display:inline-block;position:relative"></span><span style="position:absolute;width:5px;height:5px;background:' + b + ';border-radius:50%;top:-2px;right:-1px"></span>',
        bubble:  '<span style="width:16px;height:16px;background:' + b + ';border-radius:50%;display:inline-block"></span><span style="width:8px;height:8px;background:' + b + ';opacity:.4;border-radius:50%;display:inline-block;margin-left:2px"></span>',
        mixed:   '<span style="width:9px;height:9px;background:' + b + ';opacity:.5;border-radius:50%;display:inline-block"></span><span style="width:16px;height:9px;background:' + b + ';border-radius:4px;display:inline-block;margin-left:2px"></span>',
        ribbon:  '<span style="width:28px;height:9px;background:' + b + ';border-radius:5px;display:inline-block"></span><span style="width:18px;height:4px;background:' + b + ';opacity:.5;border-radius:3px;display:inline-block;margin-left:2px"></span>'
      };
      return m[kind] || m.bubble;
    }

    // 根据模板生成大时钟主体
    function clockHtml(t) {
      if (sel === 'minimal') {
        return '<div class="ts-clock ts-minimal"><span>' + t.h + '</span><em>' + t.m + '</em><small>' + t.s + '</small></div>';
      }
      if (sel === 'dial') {
        return '<div class="ts-clock ts-dial"><div class="ts-dialface"><i></i><b>' + t.h + ':' + t.m + '</b></div></div>';
      }
      if (sel === 'dual') {
        return '<div class="ts-clock ts-dual"><div>' + t.h + '</div><div>' + t.m + '</div><small>' + t.s + '</small></div>';
      }
      if (sel === 'stack') {
        return '<div class="ts-clock ts-stack"><b>' + t.h + '</b><b>' + t.m + '</b><b>' + t.s + '</b></div>';
      }
      if (sel === 'orbit') {
        return '<div class="ts-clock ts-orbit"><div class="ts-orbit-ring"><span>' + t.h + ':' + t.m + '</span></div><div class="ts-orbit-sec">' + t.s + '</div></div>';
      }
      if (sel === 'ribbon') {
        return '<div class="ts-clock ts-ribbon"><div class="ts-ribbon-a">' + t.h + '</div><div class="ts-ribbon-b">' + t.m + ':' + t.s + '</div></div>';
      }
      if (sel === 'mixed') {
        return '<div class="ts-clock ts-mixed"><div class="ts-mix-bubble">' + t.h + '</div><div class="ts-mix-num">' + t.m + '</div><div class="ts-mix-sec">' + t.s + '</div></div>';
      }
      if (sel === 'poster') {
        return '<div class="ts-clock ts-poster"><div class="ts-poster-h">' + t.h + '</div><div class="ts-poster-m">' + t.m + '</div><div class="ts-poster-s">' + t.s + '</div><div class="ts-poster-cap">FOCUS · TIME</div></div>';
      }
      if (sel === 'focus') {
        return '<div class="ts-clock ts-focus"><div class="ts-focus-tag">FOCUS</div><div class="ts-focus-n">' + t.h + ':' + t.m + '</div><div class="ts-focus-s">:' + t.s + '</div></div>';
      }
      // bubble（封面默认）：左侧圆角块 05，中间花边 blob 57，右侧圆 45
      return '<div class="ts-clock ts-bubble">' +
        '<div class="ts-blk ts-blk-l">' + t.h + '</div>' +
        '<div class="ts-blob">' + t.m + '</div>' +
        '<div class="ts-blk ts-blk-r">' + t.s + '</div>' +
        '</div>';
    }

    function build() {
      var tpls = AK_TSCREEN_TPLS.map(function (x) {
        var on = x.id === sel ? ' on' : '';
        return '<button class="ts-tpl' + on + '" data-ts-tpl="' + x.id + '">' +
          '<span class="ts-tpl-demo">' + demo(x.demo) + '</span>' +
          '<b>' + x.name + '</b><small>' + x.sub + '</small></button>';
      }).join('');
      var looks = [['theme','主题'],['dark','暗色'],['soft','柔和']].map(function (x) {
        return '<button class="ts-look' + (look === x[0] ? ' on' : '') + '" data-ts-look="' + x[0] + '">' + x[1] + '</button>';
      }).join('');
      host.innerHTML =
        '<div class="ts-app" data-look="' + look + '">' +
          '<div class="ts-stage" id="ts-stage">' + clockHtml(now()) + '</div>' +
          '<div class="ts-panel">' +
            '<div class="ts-panel-head"><span class="ts-back">←</span><b>时间屏幕</b>' +
              '<span class="ts-timer">10 分钟后启用</span><span class="ts-x">×</span></div>' +
            '<div class="ts-panel-body">' +
              '<div class="ts-sec"><div class="ts-sec-title"><span class="ts-ic-clock">◷</span> 模板</div>' +
                '<div class="ts-tpl-grid">' + tpls + '</div></div>' +
              '<div class="ts-sec ts-sec-appear"><div class="ts-sec-title"><span class="ts-ic-palette">✿</span> 外观</div>' +
                '<div class="ts-looks"><span class="ts-look-label">◉ 主题</span>' + looks + '</div></div>' +
            '</div>' +
          '</div>' +
        '</div>' + akCard('说明',
          '<p class="pp">一比一复刻暮光工具箱 4.0.6「时间屏幕」的 Material Design 3 桌面钟：薰衣草背景、波浪花边时钟、粉色模板面板，10 款模板与 3 种外观均可实时切换，时钟每秒走动。</p>');

      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        var stage = host.querySelector('#ts-stage');
        if (stage) stage.innerHTML = clockHtml(now());
      }, 1000);
    }

    host.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ts-tpl]');
      if (b) { sel = b.getAttribute('data-ts-tpl'); build(); return; }
      var l = e.target.closest('[data-ts-look]');
      if (l) { look = l.getAttribute('data-ts-look'); build(); }
    });
    build();
  }
});
