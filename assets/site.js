// BeanWise — shared behaviour for the top-level pages.
(function () {
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  var toggle = document.querySelector('.menu-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
  }

  // Highlight the current page in the nav.
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a.link').forEach(function (a) {
    var href = a.getAttribute('href').split('#')[0];
    if (href === here || (here === 'index.html' && (href === './' || href === ''))) {
      a.setAttribute('aria-current', 'page');
    }
  });

  // Mark resource projects whose folder isn't published yet. Same-origin HEAD
  // request; GitHub Pages answers 404 for a repo that has no Pages site.
  // Projects hosted elsewhere (absolute URLs) are skipped: cross-origin.
  document.querySelectorAll('.card a.open').forEach(function (a) {
    var href = a.getAttribute('href');
    if (/^https?:/.test(href)) return;
    fetch(href, { method: 'HEAD' })
      .then(function (res) { if (!res.ok) a.closest('.card').classList.add('soon'); })
      .catch(function () { /* network error: leave the card as it is */ });
  });

  // Lesson videos: play only while on screen; show the still frame with
  // controls when the visitor prefers reduced motion.
  var videos = document.querySelectorAll('video.lesson-video');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still || !('IntersectionObserver' in window)) {
    videos.forEach(function (v) { v.controls = true; });
  } else {
    // Start a clip only after it has stayed on screen briefly, so scrolling
    // past (or a smooth-scroll jump) doesn't download every video on the way.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        clearTimeout(v._playTimer);
        if (e.isIntersecting) {
          v._playTimer = setTimeout(function () { var p = v.play(); if (p) p.catch(function () {}); }, 400);
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.5 });
    videos.forEach(function (v) { io.observe(v); });
  }
})();
