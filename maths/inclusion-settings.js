/* ks3-settings.js — inclusion settings for the KS3 Interactive Maths pages.
   Drop-in: <script src="ks3-settings.js" defer></script> before </body>.
   Adds a floating "Settings" button with four toggles:
     - Easy-read text   (?font=easy)    larger, high-legibility, more spacing
     - Calm mode        (?motion=low)   stops animations/transitions
     - One step at a time (?chunks=on)  shows one section at a time with Next/Back
     - Read aloud       (?audio=on)     speaker button per section (SpeechSynthesis)
   Settings come from the URL (so a teacher-made link carries them) and are
   remembered in this browser only (localStorage). No data leaves the page. */
(function () {
  'use strict';

  var KEY = 'ks3-settings';
  var defaults = { font: false, motion: false, chunks: false, audio: false };

  function load() {
    var s = Object.assign({}, defaults);
    try { Object.assign(s, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
    var q = new URLSearchParams(location.search);
    if (q.has('font'))   s.font   = q.get('font')   === 'easy';
    if (q.has('motion')) s.motion = q.get('motion') === 'low';
    if (q.has('chunks')) s.chunks = q.get('chunks') === 'on';
    if (q.has('audio'))  s.audio  = q.get('audio')  === 'on';
    return s;
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

  var css = [
    /* panel + button */
    '#ks3set-btn{position:fixed;bottom:16px;right:16px;z-index:9999;padding:10px 14px;',
    '  border-radius:999px;border:2px solid #1f4e79;background:#fff;color:#1f4e79;',
    '  font:600 16px/1 Arial,sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.2)}',
    '#ks3set-panel{position:fixed;bottom:64px;right:16px;z-index:9999;background:#fff;',
    '  border:2px solid #1f4e79;border-radius:12px;padding:14px 16px;box-shadow:0 4px 16px rgba(0,0,0,.25);',
    '  font:16px/1.5 Arial,sans-serif;color:#222;display:none;min-width:230px}',
    '#ks3set-panel.open{display:block}',
    '#ks3set-panel label{display:flex;gap:8px;align-items:center;padding:6px 0;cursor:pointer}',
    '#ks3set-panel input{width:20px;height:20px}',
    /* easy-read */
    'body.ks3-font, body.ks3-font p, body.ks3-font li, body.ks3-font label, body.ks3-font button{',
    '  font-family:Verdana,Arial,sans-serif!important;font-size:1.15em!important;',
    '  line-height:1.8!important;letter-spacing:.02em!important;word-spacing:.08em!important}',
    'body.ks3-font p, body.ks3-font li{max-width:34em}',
    /* calm mode */
    'body.ks3-calm *, body.ks3-calm *::before, body.ks3-calm *::after{',
    '  animation:none!important;transition:none!important;scroll-behavior:auto!important}',
    /* chunk mode */
    'body.ks3-chunks .ks3-chunk-hidden{display:none!important}',
    '.ks3-nav{display:flex;gap:10px;justify-content:space-between;margin:20px 0}',
    '.ks3-nav button{padding:10px 18px;font:600 16px Arial,sans-serif;border-radius:8px;',
    '  border:2px solid #1f4e79;background:#1f4e79;color:#fff;cursor:pointer}',
    '.ks3-nav button:disabled{opacity:.4;cursor:default}',
    '.ks3-progress{font:14px Arial,sans-serif;color:#555;align-self:center}',
    /* read aloud */
    '.ks3-speak{margin-left:8px;border:none;background:none;cursor:pointer;font-size:20px;vertical-align:middle}',
    'body:not(.ks3-audio) .ks3-speak{display:none}'
  ].join('\n');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var s = load();
  var sections = [];
  var current = 0;

  function sectionEls() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.step'));
    if (!els.length) els = Array.prototype.slice.call(document.querySelectorAll('main section'));
    if (!els.length) els = Array.prototype.slice.call(document.querySelectorAll('section'));
    if (!els.length) els = Array.prototype.slice.call(document.querySelectorAll('.card, .topic-block, article'));
    return els;
  }

  function applyChunks() {
    sections = sectionEls();
    var old = document.getElementById('ks3-nav');
    if (old) old.remove();
    sections.forEach(function (el) { el.classList.remove('ks3-chunk-hidden'); });
    if (!s.chunks || sections.length < 2) return;
    current = Math.min(current, sections.length - 1);
    sections.forEach(function (el, i) { if (i !== current) el.classList.add('ks3-chunk-hidden'); });
    var nav = document.createElement('div');
    nav.id = 'ks3-nav'; nav.className = 'ks3-nav';
    var back = document.createElement('button'); back.textContent = '← Back';
    var prog = document.createElement('span'); prog.className = 'ks3-progress';
    prog.textContent = 'Step ' + (current + 1) + ' of ' + sections.length;
    var next = document.createElement('button'); next.textContent = 'Next →';
    back.disabled = current === 0; next.disabled = current === sections.length - 1;
    back.onclick = function () { current--; applyChunks(); window.scrollTo(0, 0); };
    next.onclick = function () { current++; applyChunks(); window.scrollTo(0, 0); };
    nav.appendChild(back); nav.appendChild(prog); nav.appendChild(next);
    var parent = sections[0].parentNode;
    parent.appendChild(nav);
  }

  function applyAudio() {
    document.querySelectorAll('.ks3-speak').forEach(function (b) { b.remove(); });
    if (!s.audio || !('speechSynthesis' in window)) return;
    sectionEls().forEach(function (el) {
      var h = el.querySelector('h1,h2,h3') || el;
      var btn = document.createElement('button');
      btn.className = 'ks3-speak';
      btn.type = 'button';
      btn.title = 'Read this section aloud';
      btn.setAttribute('aria-label', 'Read this section aloud');
      btn.textContent = '🔊';
      btn.onclick = function () {
        speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(el.innerText.slice(0, 2500));
        u.rate = 0.95;
        var v = speechSynthesis.getVoices().filter(function (x) { return /en(-|_)GB/i.test(x.lang); })[0];
        if (v) u.voice = v;
        speechSynthesis.speak(u);
      };
      (h.tagName ? h : el).appendChild(btn);
    });
  }

  function apply() {
    document.body.classList.toggle('ks3-font', s.font);
    document.body.classList.toggle('ks3-calm', s.motion);
    document.body.classList.toggle('ks3-chunks', s.chunks);
    document.body.classList.toggle('ks3-audio', s.audio);
    applyChunks();
    applyAudio();
    save(s);
  }

  function buildUI() {
    var btn = document.createElement('button');
    btn.id = 'ks3set-btn'; btn.type = 'button';
    btn.textContent = '⚙ Settings';
    btn.setAttribute('aria-expanded', 'false');
    var panel = document.createElement('div');
    panel.id = 'ks3set-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Reading settings');
    var opts = [
      ['font',   'Easy-read text'],
      ['motion', 'Calm mode (no animations)'],
      ['chunks', 'One step at a time'],
      ['audio',  'Read aloud buttons']
    ];
    opts.forEach(function (o) {
      var lab = document.createElement('label');
      var cb = document.createElement('input');
      cb.type = 'checkbox'; cb.checked = s[o[0]];
      cb.onchange = function () { s[o[0]] = cb.checked; apply(); };
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(o[1]));
      panel.appendChild(lab);
    });
    btn.onclick = function () {
      var open = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    document.body.appendChild(btn);
    document.body.appendChild(panel);
  }

  function init() { buildUI(); apply(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
