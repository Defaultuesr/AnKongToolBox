/* ============================================================
   安空工具箱 — 内联 SVG 图标库
   纯矢量、不依赖 emoji 字体；圆形淡彩底 + 同色系深色线框图标
   ============================================================ */
var AK_ICONS = {
  /* --- 界面 --- */
  grid: '<rect x="3" y="3" width="5" height="5" rx="1.3" fill="currentColor" stroke="none"/><rect x="9.5" y="3" width="5" height="5" rx="1.3" fill="currentColor" stroke="none"/><rect x="16" y="3" width="5" height="5" rx="1.3" fill="currentColor" stroke="none"/><rect x="3" y="9.5" width="5" height="5" rx="1.3" fill="currentColor" stroke="none"/><rect x="9.5" y="9.5" width="5" height="5" rx="1.3" fill="currentColor" stroke="none"/><rect x="16" y="9.5" width="5" height="5" rx="1.3" fill="currentColor" stroke="none"/><rect x="3" y="16" width="5" height="5" rx="1.3" fill="currentColor" stroke="none"/><rect x="9.5" y="16" width="5" height="5" rx="1.3" fill="currentColor" stroke="none"/><rect x="16" y="16" width="5" height="5" rx="1.3" fill="currentColor" stroke="none"/>',
  toolbox: '<rect x="2.5" y="7" width="19" height="12" rx="2.5"/><path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7"/><path d="M2.5 12.5h19"/><rect x="10" y="11" width="4" height="3.5" rx="1" fill="currentColor" stroke="none"/>',
  info: '<circle cx="12" cy="12" r="9.2"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r="1.1" fill="currentColor" stroke="none"/>',
  home: '<path d="M3 10.6 12 3l9 7.6V20a1.4 1.4 0 0 1-1.4 1.4h-4.8V15H9.2v6.4H4.4A1.4 1.4 0 0 1 3 20z"/>',
  person: '<circle cx="12" cy="8" r="3.9"/><path d="M4.5 21c0-4.2 3.4-6.8 7.5-6.8s7.5 2.6 7.5 6.8"/>',
  star: '<path d="m12 3.2 2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17.5l-5.6 2.9 1.1-6.2L2.9 9.8l6.3-.9z" fill="currentColor" stroke="none"/>',
  starOutline: '<path d="m12 3.2 2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17.5l-5.6 2.9 1.1-6.2L2.9 9.8l6.3-.9z"/>',
  heart: '<path d="M12 20.5S3.5 15 3.5 9.2A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.5 2.7c0 5.8-8.5 11.3-8.5 11.3z"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.6"/><path d="m16 16 4.6 4.6"/>',
  back: '<path d="M20 12H4.5m0 0 6-6m-6 6 6 6"/>',
  arrow: '<path d="m9 5 7 7-7 7"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="m4.5 12.5 5 5 10-11"/>',
  plus: '<path d="M12 4v16M4 12h16"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 6.4"/><path d="M20 4.5V11h-6.5"/>',
  settings: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.2 7l1.9 1.1M17.9 15.9l1.9 1.1M4.2 17l1.9-1.1M17.9 8.1l1.9-1.1M2.5 12h2.2M19.3 12h2.2"/>',
  download: '<path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5"/><path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/>',

  /* --- 查询 / 信息 --- */
  book: '<path d="M4 4.6A2.6 2.6 0 0 1 6.6 2H19v17.5H6.6A2.6 2.6 0 0 0 4 22z"/><path d="M4 19.4A2.6 2.6 0 0 1 6.6 16.8H19"/><path d="M8 7h7M8 10.5h5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.9 5.7 3.9 9S14.6 18.4 12 21c-2.6-2.6-3.9-5.7-3.9-9S9.4 5.6 12 3z"/>',
  cloud: '<path d="M6.5 19h11a4 4 0 0 0 .4-8A6 6 0 0 0 6.3 9.7 4.7 4.7 0 0 0 6.5 19z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/><rect x="7" y="13" width="3" height="3" rx=".7" fill="currentColor" stroke="none"/><rect x="14" y="13" width="3" height="3" rx=".7" fill="currentColor" stroke="none"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6.6V12l3.8 2.4"/>',
  history: '<path d="M3.4 10a9 9 0 1 1 .8 6"/><path d="M3 4.5V10h5.5"/><path d="M12 7.5V12l3 1.8"/>',
  gift: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M3 13.5h18M12 9v12"/><path d="M12 9S10.5 3 7.8 3a2.6 2.6 0 0 0 0 6zM12 9s1.5-6 4.2-6a2.6 2.6 0 0 1 0 6z"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10.5 18.5h3"/>',
  idcard: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><circle cx="8.5" cy="11" r="2.3"/><path d="M5 16.2c.5-1.7 1.9-2.6 3.5-2.6s3 .9 3.5 2.6M14.5 10h4M14.5 13.5h4"/>',
  express: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/><rect x="9.5" y="5.5" width="5" height="3" rx=".6" fill="currentColor" stroke="none"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6 7l1 13.5h10L18 7M10 11v6M14 11v6"/>',
  traffic: '<rect x="8" y="2" width="8" height="20" rx="4"/><circle cx="12" cy="6.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="17.5" r="1.4" fill="currentColor" stroke="none"/>',
  speed: '<path d="M4 17a9 9 0 1 1 16 0"/><path d="m12 13 4.5-4.5"/><circle cx="12" cy="17" r="1.6" fill="currentColor" stroke="none"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M12 6.5v11M14.8 8.8c-.6-.8-1.6-1.2-2.8-1.2-1.8 0-3 1-3 2.4 0 3.3 6 1.4 6 4.5 0 1.5-1.4 2.5-3.2 2.5-1.3 0-2.4-.5-3-1.4"/>',
  quake: '<path d="M2 12h4l2.5-6 4 12 3-8 2 2h4.5"/>',
  blood: '<path d="M12 2.8c3.4 4.4 6.5 7.6 6.5 11a6.5 6.5 0 0 1-13 0c0-3.4 3.1-6.6 6.5-11z"/><path d="M9 14.5a3 3 0 0 0 3 3"/>',
  brain: '<path d="M12 5.5a3.2 3.2 0 0 0-6 1.4A3.1 3.1 0 0 0 4.4 12a3.2 3.2 0 0 0 1.5 4.4A3 3 0 0 0 12 18.5zM12 5.5a3.2 3.2 0 0 1 6 1.4A3.1 3.1 0 0 1 19.6 12a3.2 3.2 0 0 1-1.5 4.4A3 3 0 0 1 12 18.5z"/><path d="M12 5.5v13"/>',
  sparkle: '<path d="m12 2.5 1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6-5.6-1.9 5.6-1.9z"/><path d="m19 16 .8 2.2 2.2.8-2.2.8L19 22l-.8-2.2-2.2-.8 2.2-.8z"/>',
  zodiac: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/>',
  scope: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/><path d="M8 10.5h5M10.5 8v5"/>',

  /* --- 文本 / 编码 --- */
  doc: '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14 2.5V8h5.5M8 12.5h8M8 16h6"/>',
  text: '<path d="M4 6h16M4 10h16M4 14h11M4 18h14"/>',
  translate: '<path d="M3 5h9M7.5 3v2M9.5 8c-1.5 3.5-4 5.5-7 6.5M5.5 10c1 2 2.6 3.4 4.6 4"/><path d="m12.5 20 4-10 4 10M14 16.5h5"/>',
  hash: '<path d="M5 9h14M4 15h14M10 3 8 21M17 3l-2 18"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l2.6-2.6a4.5 4.5 0 0 0-6.4-6.4L11.2 6.4"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0L5 12.6a4.5 4.5 0 0 0 6.4 6.4l1.4-1.4"/>',
  code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/>',
  regex: '<circle cx="7" cy="12" r="1.5" fill="currentColor" stroke="none"/><path d="m11 8 6 8M17 8l-6 8M20 12h2"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  replace: '<path d="M4 7h9M16 7h4M4 17h4M11 17h9"/><path d="m14 4 3 3-3 3M8 14l3 3-3 3"/>',
  diff: '<rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="16" rx="1.5"/><path d="M6 9h1M6 12h1M17 9h1M17 12h1M17 15h1"/>',
  lock: '<rect x="4.5" y="10" width="15" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9 2 2-2.5 2.5L21 9l-2 2-2-1.5-2 2"/>',
  shield: '<path d="M12 2.5 20 6v6c0 5-3.4 8.3-8 9.5-4.6-1.2-8-4.5-8-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
  escape: '<path d="M5 5h14M5 19h14"/><path d="m9 9-3 3 3 3M15 9l3 3-3 3"/>',
  quote: '<path d="M9 6C6 7.5 4.5 10 4.5 13.5H8V18H4.5M19 6c-3 1.5-4.5 4-4.5 7.5H18V18h-3.5"/>',
  check2: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.8 2.8L16.5 9"/>',

  /* --- 图片 / 颜色 --- */
  image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m3.5 17 5-5 3.5 3.5 3-3 5.5 5.5"/>',
  palette: '<path d="M12 3a9 9 0 0 0 0 18c1.4 0 2-.9 2-1.8 0-1.4-1.2-1.9-1.2-3 0-.9.8-1.7 1.8-1.7h1.7A4.7 4.7 0 0 0 21 9.8C21 6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor" stroke="none"/><circle cx="10" cy="7" r="1.2" fill="currentColor" stroke="none"/><circle cx="15" cy="7.5" r="1.2" fill="currentColor" stroke="none"/>',
  drop: '<path d="M12 2.8c3.4 4.4 6.5 7.6 6.5 11a6.5 6.5 0 0 1-13 0c0-3.4 3.1-6.6 6.5-11z"/>',
  crop: '<path d="M6 2v15.5A1.5 1.5 0 0 0 7.5 19H22M2 6h15.5A1.5 1.5 0 0 1 19 7.5V22"/>',
  scissors: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8.2 7.6 20 18M8.2 16.4 20 6"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" stroke="none"/><rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="14" width="3" height="3" rx=".5" fill="currentColor" stroke="none"/><rect x="18" y="14" width="3" height="3" rx=".5" fill="currentColor" stroke="none"/><rect x="14" y="18" width="3" height="3" rx=".5" fill="currentColor" stroke="none"/><rect x="18" y="18" width="3" height="3" rx=".5" fill="currentColor" stroke="none"/>',
  barcode: '<rect x="2.5" y="5" width="2" height="14" rx=".4" fill="currentColor" stroke="none"/><rect x="6" y="5" width="1.2" height="14" rx=".4" fill="currentColor" stroke="none"/><rect x="8.7" y="5" width="3" height="14" rx=".4" fill="currentColor" stroke="none"/><rect x="13.2" y="5" width="1.5" height="14" rx=".4" fill="currentColor" stroke="none"/><rect x="16" y="5" width="2.5" height="14" rx=".4" fill="currentColor" stroke="none"/><rect x="20" y="5" width="1.5" height="14" rx=".4" fill="currentColor" stroke="none"/>',
  brush: '<path d="M14 3.5 20.5 10 11 19.5l-6.5-6.5z"/><path d="M4.5 13c-1.5 1.5-1.7 4.5-1.7 6.5 2 0 5-.2 6.5-1.7"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5"/>',

  /* --- 开发者 --- */
  terminal: '<rect x="2.5" y="4" width="19" height="16" rx="2.5"/><path d="m6 9 3 3-3 3M11.5 15h6"/>',
  database: '<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  network: '<circle cx="12" cy="4" r="2.2"/><circle cx="4.5" cy="19" r="2.2"/><circle cx="19.5" cy="19" r="2.2"/><path d="M12 6.2v5.3M10.8 13 6 17M13.2 13 18 17"/>',
  bug: '<rect x="7" y="8" width="10" height="12" rx="5"/><path d="M9 8V6a3 3 0 0 1 6 0v2M3 11h4M17 11h4M3 16h4M17 16h4M4 6l3.5 2.5M20 6l-3.5 2.5M4 21l3.5-2.5M20 21l-3.5-2.5"/>',
  wifi: '<path d="M2.5 8.5a15 15 0 0 1 19 0M5.5 12a10.5 10.5 0 0 1 13 0M8.7 15.4a5.8 5.8 0 0 1 6.6 0"/><circle cx="12" cy="19" r="1.3" fill="currentColor" stroke="none"/>',
  battery: '<rect x="2.5" y="7" width="17" height="10" rx="2.5"/><path d="M21.5 11v2"/><rect x="4.5" y="9" width="10" height="6" rx="1" fill="currentColor" stroke="none"/>',
  device: '<rect x="5" y="2" width="14" height="20" rx="2.5"/><path d="M10 18.5h4"/><path d="M9 6h6"/>',
  chart: '<path d="M3 20h18M6 17v-5M11 17V7M16 17v-8M20.5 17V4"/>',
  flask: '<path d="M9 3h6M10 3v6L4.5 18.5A1.8 1.8 0 0 0 6 21h12a1.8 1.8 0 0 0 1.5-2.5L14 9V3"/><path d="M7.2 15h9.6"/>',
  gear: '<circle cx="12" cy="12" r="3.3"/><path d="m10 2.5-.5 2.2-2 1-2-.9-2 3.4 1.7 1.4v2l-1.7 1.4 2 3.4 2-.9 2 1 .5 2.2h4l.5-2.2 2-1 2 .9 2-3.4-1.7-1.4v-2l1.7-1.4-2-3.4-2 .9-2-1-.5-2.2z"/>',
  cube: '<path d="m12 2.5 8.5 4.8v9.4L12 21.5 3.5 16.7V7.3z"/><path d="m3.5 7.3 8.5 4.8 8.5-4.8M12 12.1v9.4"/>',

  /* --- 计算 / 换算 --- */
  calc: '<rect x="4" y="2.5" width="16" height="19" rx="2.5"/><rect x="7" y="5.5" width="10" height="3.5" rx="1"/><circle cx="8.5" cy="12.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="12.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="17" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="17" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="17" r="1.1" fill="currentColor" stroke="none"/>',
  percent: '<circle cx="7.5" cy="7.5" r="2.8"/><circle cx="16.5" cy="16.5" r="2.8"/><path d="M19.5 4.5 4.5 19.5"/>',
  scale: '<path d="M12 3v18M5 7h14M5 7l-3 6h6zM19 7l-3 6h6z"/><path d="M8 21h8"/>',
  ruler: '<rect x="2.5" y="8" width="19" height="8" rx="1.5" transform="rotate(-30 12 12)"/><path d="M6 9.5v2M9 8v3M12 8v2M15 8v3M18 8v2"/>',
  home2: '<path d="M3 10.6 12 3l9 7.6V20a1.4 1.4 0 0 1-1.4 1.4H4.4A1.4 1.4 0 0 1 3 20z"/><path d="M9 21v-6h6v6"/>',
  receipt: '<path d="M5 2.5h14v19l-2.5-1.6-2.2 1.6-2.3-1.6-2.3 1.6-2.2-1.6L5 21.5z"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
  fuel: '<path d="M5 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16M4 21h11"/><path d="M5 10h9M14 8l3 2.5V16a1.8 1.8 0 0 0 3.6 0V9l-2.3-3"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h2.5l2.2 11h11.5l2-7.5H6"/>',

  /* --- 生活 / 玩机 --- */
  bulb: '<path d="M9 18h6M9.5 21h5"/><path d="M12 2.5a6.5 6.5 0 0 0-3.8 11.8c.6.5.9 1.2.9 2h5.8c0-.8.3-1.5.9-2A6.5 6.5 0 0 0 12 2.5z"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  level: '<rect x="2.5" y="9" width="19" height="6" rx="3"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><path d="M6 12h2M16 12h2"/>',
  dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.3" fill="currentColor" stroke="none"/>',
  game: '<path d="M7 8h10a5 5 0 0 1 5 5v1.5a3.5 3.5 0 0 1-6.2 2.2L14.5 15h-5l-1.3 1.7A3.5 3.5 0 0 1 2 14.5V13a5 5 0 0 1 5-5z"/><path d="M7 11.5v3M5.5 13h3"/><circle cx="16.5" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="18.5" cy="14.5" r="1.1" fill="currentColor" stroke="none"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  volume: '<path d="M4 9h3.5L12 5v14l-4.5-4H4z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4.5l3 1.8M9 2h6M12 5V2.5"/>',
  flag: '<path d="M5 21V3M5 4h13l-2.5 4L18 12H5"/>',
  eye: '<path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',
  list: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.2" fill="currentColor" stroke="none"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M3 15h18M9 4v16M15 4v16"/>',
  note: '<path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-1.5V3z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
  counter: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M12 7v10M7 12h10"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/>',
  hand: '<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11m0-1V4.5a1.5 1.5 0 0 1 3 0V11m0-1V6a1.5 1.5 0 0 1 3 0v6.5c0 4.5-2.8 8.5-7 8.5-3 0-4.6-1.6-6-4l-1.5-3a1.6 1.6 0 0 1 2.7-1.7L8 14"/>',
  /* --- 聚合资源 --- */
  film: '<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M2.5 9h19M2.5 15h19M7 4v16M17 4v16"/><path d="M10.5 10.5v3l3-1.5z" fill="currentColor" stroke="none"/>',
  smile: '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1.1" fill="currentColor" stroke="none"/><path d="M8 14a4.5 4.5 0 0 0 8 0"/>',
  dumbbell: '<path d="M2 10v4M5 8v8M19 8v8M22 10v4M5 12h14"/><rect x="1.5" y="9" width="3" height="6" rx="1"/><rect x="19.5" y="9" width="3" height="6" rx="1"/>',
  recipe: '<path d="M5 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5z"/><path d="M8 3v18M11 8h5M11 12h5M11 16h3"/>',
  wave: '<path d="M2 12c2 0 2-6 4-6s2 12 4 12 2-12 4-12 2 6 4 6 2-3 4-3"/>',
  radio: '<rect x="2.5" y="8" width="19" height="12" rx="2.5"/><path d="M6 8 17 3.5"/><circle cx="15.5" cy="14" r="3"/><path d="M6 12h4M6 16h4"/><circle cx="15.5" cy="14" r=".9" fill="currentColor" stroke="none"/>',
  magnet: '<path d="M5 4v8a7 7 0 0 0 14 0V4"/><path d="M5 4h4v8a3 3 0 0 0 6 0V4h4"/><path d="M5 8h4M15 8h4"/>',
  video: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m10.5 9.5 5 2.5-5 2.5z" fill="currentColor" stroke="none"/>',
  hub: '<circle cx="12" cy="12" r="2.4"/><circle cx="4.5" cy="5" r="2"/><circle cx="19.5" cy="5" r="2"/><circle cx="4.5" cy="19" r="2"/><circle cx="19.5" cy="19" r="2"/><path d="m6.2 6.3 4 4M17.8 6.3l-4 4M6.2 17.7l4-4M17.8 17.7l-4-4"/>'

};

/* 分类固定配色 */
var AK_CAT_COLORS = {
  query: { bg: '#EEE9D5', fg: '#6F5C0F' },
  text:  { bg: '#DCE9D3', fg: '#3E6B32' },
  image: { bg: '#D9E8F0', fg: '#2A5875' },
  dev:   { bg: '#D8EAE9', fg: '#2B5B5A' },
  calc:  { bg: '#F2E4C9', fg: '#7A5A16' },
  life:  { bg: '#ECD9E8', fg: '#6B2E63' },
  fun:   { bg: '#DDE6F3', fg: '#2F4A78' },
  game:  { bg: '#E6DEF2', fg: '#503A80' }
};

/* 工具圆形底的马卡龙配色池 */
var AK_PALETTE = [
  { bg: '#EEE9D5', fg: '#6F5C0F' },
  { bg: '#D8EAE9', fg: '#2B5B5A' },
  { bg: '#ECD9E8', fg: '#6B2E63' },
  { bg: '#D9E8F0', fg: '#2A5875' },
  { bg: '#E2EFD9', fg: '#3E6B32' },
  { bg: '#F2E4C9', fg: '#7A5A16' },
  { bg: '#F3DCDD', fg: '#7C3540' },
  { bg: '#E6DEF2', fg: '#503A80' },
  { bg: '#DCEFE7', fg: '#2E6B54' },
  { bg: '#F0E2B8', fg: '#6F5C0F' },
  { bg: '#E9E4D9', fg: '#5A5240' },
  { bg: '#DDE6F3', fg: '#2F4A78' }
];

/* 工具 id → 图标名（覆盖全部现有工具 + 新增工具） */
var AK_ICON_MAP = {
  /* 开发者 */
  json: 'code', xml: 'doc', timestamp: 'clock', uuid: 'hash', base: 'cube',
  jwt: 'key', urlparse: 'link', ua: 'device', ascii: 'text', cron: 'timer',
  minify: 'cube', ipcalc: 'network', sqlfmt: 'database', jsonpath: 'code',
  /* 计算换算 */
  unit: 'ruler', science: 'flask', bmi: 'scale', loan: 'home2', tax: 'receipt',
  percent: 'percent', datediff: 'calendar', unitprice: 'cart', calc: 'calc',
  compound: 'chart', fuel: 'fuel', split: 'receipt', week: 'calendar',
  /* 颜色图片 */
  color: 'drop', palette: 'palette', ninegrid: 'grid', colorpick: 'scope',
  img2base64: 'code', base642img: 'image', qrcode: 'qr', wallpaper: 'brush',
  avatar: 'person', imgcompress: 'image', imgcrop: 'crop', imgformat: 'image',
  resize: 'crop', sketch: 'brush', watermark: 'layers', barcode: 'barcode',
  /* 生活 */
  password: 'lock', randnum: 'dice', dice: 'dice', relative: 'heart',
  countdown: 'timer', decision: 'target', sleep: 'moon', luck: 'sparkle',
  notepad: 'note', pomodoro: 'timer', counter: 'counter',
  /* 玩机 / 设备 */
  device: 'device', torch: 'bulb', level: 'level', compass: 'compass',
  screen: 'eye', led: 'text', ruler: 'ruler', clean: 'trash',
  /* 查询 */
  video: 'game', news: 'book', garbage: 'trash', weather: 'cloud',
  express: 'express', phone: 'phone', idcard: 'idcard', dateinfo: 'calendar',
  holiday: 'gift', exchange: 'coin', netinfo: 'wifi',
  lunar: 'calendar', ganzhi: 'zodiac', history: 'history', mbti: 'brain',
  blood: 'blood', zodiac: 'zodiac', quake: 'quake', httpcode: 'globe',
  mimetype: 'doc',
  /* 文本 */
  base64: 'code', urlenc: 'link', unicode: 'translate', hash: 'hash',
  regex: 'regex', textcase: 'text', wordcount: 'list', replace: 'replace',
  diff: 'diff', morse: 'volume', escape: 'escape', caesar: 'translate',
  markdown: 'doc', cipher: 'lock', idiom: 'quote', simptrad: 'translate',
  textcheck: 'check2',
  /* 小游戏 */
  game2048: 'grid', tictactoe: 'table', reaction: 'target',
  metronome: 'music',
  /* 聚合资源 */
  hub_movie: 'film', hub_music: 'music', hub_imgsearch: 'search', hub_gallery: 'palette',
  hub_meme: 'smile', hub_fitness: 'dumbbell', hub_recipe: 'recipe', hub_tone: 'wave',
  hub_radio: 'radio', hub_blog: 'book', hub_rom: 'download', hub_syssettings: 'gear',
  hub_appsearch: 'search', hub_openapk: 'cube', hub_bili: 'video',
  hub_p1: 'link', hub_p2: 'link', hub_p3: 'image', hub_p4: 'link', hub_p5: 'text',
  hub_p6: 'magnet', hub_p7: 'video', hub_p8: 'list', hub_p9: 'code',
  hub_p10: 'qr', hub_p11: 'shield',
  /* 扩展工具图标映射（46 个） */
  textreverse: 'replace', textdedup: 'filter', textsort: 'list', textstat: 'chart',
  punct: 'text', num2cn: 'coin', slug: 'link',
  htmlenc: 'code', jsescape: 'escape', csvjson: 'table', envparse: 'list',
  httpheaders: 'globe', hexdump: 'cube', urlbuilder: 'link', jsonflat: 'code',
  romannum: 'book', fraction: 'percent', gpa: 'chart', discount: 'cart',
  bmr: 'flask', areacalc: 'ruler', timecalc: 'clock', pacecalc: 'speed', baby: 'heart',
  packing: 'express', water: 'drop', unitcook: 'scale', clothes: 'person',
  bill: 'receipt', passwdcheck: 'shield', periodic: 'calendar', petage: 'heart',
  battery: 'battery', storage: 'database', dpi: 'scope', netspeed: 'speed',
  countrycode: 'globe', keyboard: 'terminal', constants: 'flask',
  solarterm: 'sun', timezone: 'clock',
  guessnum: 'target', rps: 'hand', mentalmath: 'calc',
  gradient: 'palette', aspectratio: 'crop',
  /* v1.3 新增 50 个工具 */
  linenum: 'list', textchunk: 'scissors', affix: 'text', spaceclean: 'filter',
  tplfill: 'doc', colpick: 'table', rowfilter: 'filter', sqllist: 'database',
  namecase: 'code', json2ts: 'code', basen: 'hash', bitwise: 'terminal',
  curlgen: 'network', semver: 'cube', regexbuild: 'regex', gitignore: 'doc',
  salary: 'coin', stats: 'chart', triangle: 'ruler', prob: 'percent',
  invest: 'coin', workhours: 'clock', ratio: 'scale',
  coupon: 'cart', travel: 'traffic', budget: 'coin', lifedays: 'calendar',
  habit: 'check2', commute: 'traffic', subscription: 'receipt', electricity: 'bulb',
  wifichan: 'wifi', usbspec: 'cube', portlist: 'network', printsize: 'image',
  calorie: 'flask', papersize: 'doc',
  cssshadow: 'layers', mdtable: 'table', harmony: 'palette', cssunit: 'ruler',
  bezier: 'wave', lorem: 'text',
  batteryhealth: 'battery', contrast: 'eye', raidcalc: 'database', videobitrate: 'video',
  typingtest: 'timer', math24: 'calc', diceexpr: 'dice'
};

/* 分类 → 图标 */
var AK_CAT_ICON = {
  query: 'search', text: 'doc', image: 'palette', dev: 'terminal',
  calc: 'calc', life: 'heart', fun: 'device', game: 'game', hub: 'hub'
};

function akIcon(name, cls) {
  var d = AK_ICONS[name] || AK_ICONS.grid;
  return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
}

function akHash(s) {
  var h = 0;
  for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/* 工具图标：圆形淡彩底 + 线框图标 */
function akToolIcon(t, cls, fixedColor) {
  var col = fixedColor || AK_PALETTE[akHash(String(t.id)) % AK_PALETTE.length];
  var name = AK_ICON_MAP[t.id] || AK_CAT_ICON[t.cat] || 'grid';
  return '<span class="tool-ic ' + (cls || '') + '" style="--tint:' + col.bg + ';--ic:' + col.fg + '">' +
    akIcon(name) + '</span>';
}

/* 分类图标 */
function akCatIcon(cat, cls) {
  var col = AK_CAT_COLORS[cat] || AK_PALETTE[0];
  return '<span class="tool-ic ' + (cls || '') + '" style="--tint:' + col.bg + ';--ic:' + col.fg + '">' +
    akIcon(AK_CAT_ICON[cat] || 'grid') + '</span>';
}
