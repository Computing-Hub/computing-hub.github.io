/* OCR GCSE CS course — shared behaviour.
   - Settings (URL ⇄ localStorage): lang, easy, font, motion, chunks, audio, contrast, teacher
   - Course map renderer (index.html)
   - Lesson renderer (lesson.html?l=<id>) from content/<id>.json
   No data leaves the page. Settings are remembered in this browser only. */
(function () {
  'use strict';

  var KEY = 'ocr-cs-settings';
  var LANGS = { en: 'English', pt: 'Português', pl: 'Polski', ro: 'Română' };
  var SPEECH = { en: 'en-GB', pt: 'pt-PT', pl: 'pl-PL', ro: 'ro-RO' };
  var defaults = { lang: 'en', easy: false, font: false, motion: false, chunks: false, audio: false, contrast: false, teacher: false };

  function loadSettings() {
    var s = Object.assign({}, defaults);
    try { Object.assign(s, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
    var q = new URLSearchParams(location.search);
    ['easy', 'font', 'motion', 'chunks', 'audio', 'contrast', 'teacher'].forEach(function (k) {
      if (q.has(k)) s[k] = q.get(k) === '1' || q.get(k) === 'on' || q.get(k) === 'true';
    });
    if (q.has('lang') && LANGS[q.get('lang')]) s.lang = q.get('lang');
    return s;
  }
  function saveSettings(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function applySettings(s) {
    var b = document.body;
    b.classList.toggle('easy', !!s.font);
    b.classList.toggle('calm', !!s.motion);
    b.classList.toggle('chunks', !!s.chunks);
    b.classList.toggle('audio', !!s.audio);
    b.classList.toggle('contrast', !!s.contrast);
    b.classList.toggle('teacher', !!s.teacher);
    document.documentElement.lang = s.lang === 'en' ? 'en-GB' : s.lang;
  }
  function settingsUrl(s) {
    var u = new URL(location.href);
    Object.keys(defaults).forEach(function (k) {
      if (k === 'lang') { if (s.lang !== 'en') u.searchParams.set('lang', s.lang); else u.searchParams.delete('lang'); }
      else if (s[k]) u.searchParams.set(k, '1'); else u.searchParams.delete(k);
    });
    return u.toString();
  }

  var settings = loadSettings();
  var available = Object.keys(LANGS); // languages this page can show; lesson renderer narrows it

  function buildPanel(onChange) {
    var btn = document.createElement('button');
    btn.id = 'set-btn'; btn.className = 'btn'; btn.type = 'button'; btn.textContent = '⚙ Settings';
    var panel = document.createElement('div'); panel.id = 'set-panel';
    panel.innerHTML =
      '<h3>Settings</h3>' +
      '<div class="row"><span>Language</span><select id="s-lang"></select></div>' +
      '<label><input type="checkbox" id="s-easy"> Easier text (lower reading age)</label>' +
      '<label><input type="checkbox" id="s-font"> Readable font and spacing</label>' +
      '<label><input type="checkbox" id="s-motion"> Calm mode (no animation)</label>' +
      '<label><input type="checkbox" id="s-chunks"> One section at a time</label>' +
      '<label><input type="checkbox" id="s-audio"> Read aloud buttons</label>' +
      '<label><input type="checkbox" id="s-contrast"> High contrast</label>' +
      '<hr style="border:0;border-top:1px solid #e2e6ea;margin:.5rem 0">' +
      '<label><input type="checkbox" id="s-teacher"> Teacher view (notes, model answers)</label>' +
      '<button class="btn outline small copy" id="s-copy" type="button">Copy link with these settings</button>' +
      '<div class="hint">Settings travel in the link, so a teacher can set them once per student. Nothing is stored except in this browser.</div>';
    document.body.appendChild(btn); document.body.appendChild(panel);
    btn.addEventListener('click', function () { panel.classList.toggle('open'); });

    var sel = panel.querySelector('#s-lang');
    available.forEach(function (code) {
      var o = document.createElement('option'); o.value = code; o.textContent = LANGS[code]; sel.appendChild(o);
    });
    sel.value = available.indexOf(settings.lang) >= 0 ? settings.lang : 'en';
    ['easy', 'font', 'motion', 'chunks', 'audio', 'contrast', 'teacher'].forEach(function (k) {
      var cb = panel.querySelector('#s-' + k); cb.checked = !!settings[k];
      cb.addEventListener('change', function () { settings[k] = cb.checked; saveSettings(settings); applySettings(settings); onChange(k); });
    });
    sel.addEventListener('change', function () { settings.lang = sel.value; saveSettings(settings); applySettings(settings); onChange('lang'); });
    panel.querySelector('#s-copy').addEventListener('click', function () {
      var url = settingsUrl(settings);
      navigator.clipboard.writeText(url).then(function () {
        var b = panel.querySelector('#s-copy'); var t = b.textContent; b.textContent = 'Copied'; setTimeout(function () { b.textContent = t; }, 1400);
      });
    });
  }

  /* ---------- read aloud ---------- */
  function speakButton(getText) {
    var b = document.createElement('button');
    b.className = 'speak'; b.type = 'button'; b.title = 'Read aloud'; b.setAttribute('aria-label', 'Read this section aloud'); b.textContent = '🔊';
    b.addEventListener('click', function () {
      if (!('speechSynthesis' in window)) { alert('Read aloud is not available in this browser.'); return; }
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(getText());
      u.lang = SPEECH[settings.lang] || 'en-GB'; u.rate = 0.95;
      speechSynthesis.speak(u);
    });
    return b;
  }

  /* ---------- helpers ---------- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  // tiny inline markup: **bold**, `code`
  function inline(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>'); }
  function paras(arr) { return (arr || []).map(function (p) { return '<p>' + inline(p) + '</p>'; }).join(''); }
  function listHtml(arr, ordered) { if (!arr || !arr.length) return ''; return '<' + (ordered ? 'ol' : 'ul') + '>' + arr.map(function (i) { return '<li>' + inline(i) + '</li>'; }).join('') + '</' + (ordered ? 'ol' : 'ul') + '>'; }
  function codeHtml(c) { return c ? '<pre><code>' + esc(c) + '</code></pre>' : ''; }
  function sections(arr) {
    return (arr || []).map(function (sec) {
      return (sec.h ? '<h3>' + inline(sec.h) + '</h3>' : '') + paras(sec.p) + codeHtml(sec.code) + listHtml(sec.list) + paras(sec.after);
    }).join('');
  }
  function fetchJson(url) { return fetch(url, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status + ' ' + url); return r.json(); }); }

  /* ---------- course map ---------- */
  function renderIndex(root, course) {
    var ready = course.ready || [];
    course.units.forEach(function (u) {
      var d = el('details', 'unit');
      if (ready.some(function (id) { return id.indexOf(u.id + '-') === 0; })) d.open = true;
      var p = u.paper === 1 ? 'Paper 1' : u.paper === 2 ? 'Paper 2' : 'Both';
      var readyCount = u.lessons.filter(function (l) { return ready.indexOf(l.id) >= 0; }).length;
      d.innerHTML = '<summary><span class="paper p' + u.paper + '">' + p + '</span><span><b>' + esc(u.id.replace('-', '.')) + ' ' + esc(u.title) + '</b></span>' +
        '<span class="count">' + u.lessons.length + ' lessons · ' + readyCount + ' ready</span></summary>';
      var ol = el('ol');
      u.lessons.forEach(function (l, i) {
        var isReady = ready.indexOf(l.id) >= 0;
        var li = el('li', isReady ? 'ready' : 'planned');
        li.innerHTML = '<span class="n">' + (i + 1) + '</span><a href="lesson.html?l=' + encodeURIComponent(l.id) + '">' + esc(l.title) + '</a><span class="spec">' + esc(l.spec) + '</span>';
        ol.appendChild(li);
      });
      d.appendChild(ol);
      if (u.test && ready.indexOf(u.test) >= 0) {
        d.appendChild(el('div', 'test-link', '<a class="btn outline small" href="lesson.html?l=' + encodeURIComponent(u.test) + '">End-of-unit test →</a>'));
      }
      root.appendChild(d);
    });
  }

  /* ---------- lesson ---------- */
  function pickText(L) {
    // returns {title, hook, explain, keyterms, note} for the current language and reading level
    var lang = settings.lang, t = (L.i18n && L.i18n[lang]) || null;
    var out = { title: L.title, hook: L.hook, explain: settings.easy && L.simple ? L.simple : L.explain, keyterms: L.keyterms, note: '' };
    if (lang !== 'en') {
      if (t) {
        out.title = t.title || L.title; out.hook = t.hook || L.hook; out.keyterms = t.keyterms || L.keyterms;
        out.explain = settings.easy && t.simple ? t.simple : (t.explain || out.explain);
        out.note = { pt: 'Explicação em português. O código, as perguntas de exame e o questionário ficam em inglês, porque o exame é em inglês.',
                     pl: 'Wyjaśnienie po polsku. Kod, pytania egzaminacyjne i quiz pozostają po angielsku, ponieważ egzamin jest po angielsku.',
                     ro: 'Explicație în română. Codul, întrebările de examen și testul rămân în engleză, pentru că examenul este în engleză.' }[lang] || '';
      } else {
        out.note = LANGS[lang] + ' is not available for this lesson yet; showing English.';
      }
    }
    return out;
  }

  function renderLesson(root, course, L) {
    // which languages does this lesson have?
    available = ['en'].concat(Object.keys(L.i18n || {}).filter(function (k) { return LANGS[k]; }));
    var T = pickText(L);
    var unit = null, idx = -1, flat = [];
    course.units.forEach(function (u) { u.lessons.forEach(function (l) { flat.push({ u: u, l: l }); if (l.id === L.id) { unit = u; } }); if (u.test === L.id) unit = u; });
    flat.forEach(function (f, i) { if (f.l.id === L.id) idx = i; });
    var ready = course.ready || [];
    document.title = T.title + ' — OCR GCSE CS';
    document.getElementById('crumbs').innerHTML = '<a href="./">Course</a> › ' + (unit ? esc(unit.id.replace('-', '.') + ' ' + unit.title) : '');

    var head = el('div', 'lesson-head');
    head.innerHTML = '<h1>' + inline(T.title) + '</h1>' +
      '<div class="meta"><span>Spec <b>' + esc(L.spec) + '</b></span><span>Time <b>' + (L.duration || 60) + ' min</b></span>' + (unit ? '<span>Unit <b>' + esc(unit.id.replace('-', '.')) + '</b></span>' : '') + '</div>' +
      (T.note ? '<div class="lang-note">' + esc(T.note) + '</div>' : '');
    root.appendChild(head);

    var blocks = [];
    function block(cls, tag, title, time, html) {
      var b = el('section', 'block ' + cls);
      b.innerHTML = '<h2><span class="tag">' + tag + '</span>' + inline(title) + (time ? '<span class="time">' + time + '</span>' : '') + '</h2>' + html;
      var h2 = b.querySelector('h2');
      h2.appendChild(speakButton(function () { return b.innerText.replace(/🔊/g, ''); }));
      root.appendChild(b); blocks.push(b); return b;
    }

    if (L.specPoints) block('spec', 'Spec', 'What the specification says', '', listHtml(L.specPoints));
    if (T.hook) block('hook', 'Hook', 'Start here', '2–3 min', paras([].concat(T.hook)));

    // explain + video
    var vid = '';
    if (L.video) {
      vid = L.video.url
        ? '<iframe class="video-wrap" src="' + esc(L.video.url) + '" allowfullscreen title="' + esc(L.video.title || 'Explainer video') + '"></iframe>'
        : '<div class="video-ph"><b>▶ Explainer video: ' + esc(L.video.title || T.title) + '</b> — coming. The text below covers the same ground.' +
          '<div class="brief"><b>Brief for the recording (teacher view):</b> ' + inline(L.video.brief || '') + '</div></div>';
    }
    block('explain', 'Explain', settings.easy ? 'The idea, in plain words' : 'The idea', '5–10 min', vid + sections(T.explain));

    if (T.keyterms && T.keyterms.length) {
      block('keyterms', 'Key terms', 'Words you must use', '', '<dl class="keyterms">' + T.keyterms.map(function (k) { return '<dt>' + inline(k.term) + '</dt><dd>' + inline(k.def) + '</dd>'; }).join('') + '</dl>');
    }

    // try
    if (L.try && L.try.length) {
      var html = L.try.map(function (t) {
        if (t.type === 'embed') {
          return '<div class="task"><h4>' + inline(t.title) + '</h4>' + listHtml(t.instructions, true) + '</div>' +
            '<div class="embed"><iframe src="' + esc(t.url) + '" loading="lazy" title="' + esc(t.title) + '"></iframe><div class="open-new">Opens in its own tab: <a href="' + esc(t.url) + '" target="_blank" rel="noopener">' + esc(t.url) + '</a></div></div>';
        }
        return '<div class="task"><h4>' + inline(t.title) + '</h4>' + paras(t.p) + listHtml(t.steps, true) + codeHtml(t.code) + paras(t.after) + '</div>';
      }).join('');
      block('try', 'Try', 'Do it yourself', '15–25 min', html);
    }

    // check (quiz)
    if (L.check && L.check.length) {
      var qb = block('check quiz', 'Check', 'Quick check', '5 min', '');
      var score = 0, answered = 0;
      var scoreEl = el('div', 'score', '');
      L.check.forEach(function (q, qi) {
        var d = el('div', 'q'); d.innerHTML = '<p>' + (qi + 1) + '. ' + inline(q.q) + '</p>';
        var opts = el('div', 'opts'); var fb = el('div', 'fb');
        q.opts.forEach(function (o, oi) {
          var b = el('button', 'opt', inline(o)); b.type = 'button';
          b.addEventListener('click', function () {
            if (d.dataset.done) return; d.dataset.done = '1'; answered++;
            if (oi === q.a) { b.classList.add('right'); score++; fb.textContent = '✓ ' + (q.fb || 'Correct.'); }
            else { b.classList.add('wrong'); opts.children[q.a].classList.add('right'); fb.textContent = '✗ ' + (q.fb || ''); }
            if (answered === L.check.length) scoreEl.textContent = 'Score: ' + score + ' / ' + L.check.length + (score === L.check.length ? ' — all correct.' : ' — reread the sections for the ones you missed.');
          });
          opts.appendChild(b);
        });
        d.appendChild(opts); d.appendChild(fb); qb.appendChild(d);
      });
      qb.appendChild(scoreEl);
    }

    // exam
    if (L.exam && L.exam.length) {
      var ex = L.exam.map(function (e, i) {
        return '<div class="eq"><span class="marks">[' + e.marks + ']</span><p><b>' + (i + 1) + '.</b> ' + inline(e.q) + '</p>' + codeHtml(e.code) +
          '<textarea class="answer-box" placeholder="Write your answer here (it stays in this browser only)" data-k="' + esc(L.id + '-ex' + i) + '"></textarea>' +
          '<details><summary>Model answer and how the marks are given</summary><div class="model">' + paras([].concat(e.model)) + '</div>' +
          (e.commentary ? '<div class="commentary"><b>Examiner\'s note:</b> ' + inline(e.commentary) + '</div>' : '') + '</details></div>';
      }).join('');
      var eb = block('exam', 'Exam', 'Exam practice', '10 min', ex);
      eb.querySelectorAll('textarea').forEach(function (ta) {
        try { ta.value = localStorage.getItem('ocr-cs-ans-' + ta.dataset.k) || ''; } catch (e) {}
        ta.addEventListener('input', function () { try { localStorage.setItem('ocr-cs-ans-' + ta.dataset.k, ta.value); } catch (e) {} });
      });
    }

    if (L.home) block('home', 'Home', 'Homework', '', paras([].concat(L.home)));

    if (L.teacher) {
      var t = L.teacher;
      block('teacher', 'Teacher', 'Teacher notes', t.timing || '',
        (t.misconceptions ? '<h3>Common misconceptions</h3>' + listHtml(t.misconceptions) : '') +
        (t.say ? '<h3>What to say</h3>' + listHtml(t.say) : '') +
        (t.skip ? '<h3>If short of time</h3>' + paras([].concat(t.skip)) : '') +
        (t.differentiation ? '<h3>Support and stretch</h3>' + listHtml(t.differentiation) : ''));
    }

    // prev / next
    var nav = el('div', 'lesson-nav');
    var prev = idx > 0 ? flat[idx - 1] : null, next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;
    function navLink(f, label) {
      if (!f) return '<span></span>';
      var ok = ready.indexOf(f.l.id) >= 0;
      return ok ? '<a class="btn outline" href="lesson.html?l=' + encodeURIComponent(f.l.id) + '">' + label + '</a>' : '<span class="btn outline" style="opacity:.5">' + label + ' (planned)</span>';
    }
    nav.innerHTML = navLink(prev, '← Previous') + '<a class="btn outline" href="./">Course map</a>' + navLink(next, 'Next →');
    root.appendChild(nav);

    // chunk mode
    var cn = el('div', 'chunk-nav'); var cur = 0;
    cn.innerHTML = '<button class="btn outline" id="c-prev" type="button">← Back</button><span class="chunk-progress"></span><button class="btn" id="c-next" type="button">Next →</button>';
    root.insertBefore(cn, nav);
    function showChunk(i) {
      cur = Math.max(0, Math.min(blocks.length - 1, i));
      blocks.forEach(function (b, j) { b.classList.toggle('chunk-hidden', j !== cur); });
      cn.querySelector('.chunk-progress').textContent = (cur + 1) + ' of ' + blocks.length;
      cn.querySelector('#c-prev').disabled = cur === 0; cn.querySelector('#c-next').disabled = cur === blocks.length - 1;
    }
    cn.querySelector('#c-prev').addEventListener('click', function () { showChunk(cur - 1); window.scrollTo(0, 0); });
    cn.querySelector('#c-next').addEventListener('click', function () { showChunk(cur + 1); window.scrollTo(0, 0); });
    function applyChunks() { if (settings.chunks) showChunk(cur); else blocks.forEach(function (b) { b.classList.remove('chunk-hidden'); }); }
    applyChunks();
    return applyChunks;
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    applySettings(settings);
    var page = document.body.dataset.page;
    var base = document.body.dataset.base || './';
    fetchJson(base + 'course.json').then(function (course) {
      if (page === 'index') {
        renderIndex(document.getElementById('course'), course);
        buildPanel(function () {});
      } else if (page === 'lesson') {
        var id = new URLSearchParams(location.search).get('l') || '';
        if (!/^[\w-]+$/.test(id)) throw new Error('bad id');
        var root = document.getElementById('lesson');
        fetchJson(base + 'content/' + id + '.json').then(function (L) {
          var applyChunks = renderLesson(root, course, L);
          buildPanel(function (what) {
            if (what === 'lang' || what === 'easy') { root.innerHTML = ''; applyChunks = renderLesson(root, course, L); document.getElementById('s-lang') && (document.getElementById('s-lang').value = settings.lang); }
            else if (what === 'chunks') applyChunks();
          });
        }).catch(function () {
          root.innerHTML = '<div class="block"><h2>This lesson is planned, not written yet</h2><p>Lesson <code>' + esc(id) + '</code> has its place in the course map but no content yet. <a href="./">Back to the course map</a>.</p></div>';
          buildPanel(function () {});
        });
      }
    }).catch(function (e) {
      var r = document.getElementById(page === 'index' ? 'course' : 'lesson');
      if (r) r.innerHTML = '<div class="block"><p>Could not load the course data (' + esc(e.message) + ').</p></div>';
    });
  });
})();
