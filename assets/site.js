// SmartBeans — shared behaviour for the top-level pages.
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
})();
