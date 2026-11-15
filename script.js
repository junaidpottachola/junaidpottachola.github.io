// Theme toggle (remembered), copy-email, current-section highlight. Vanilla JS, no dependencies.
// The page is complete without JavaScript; this only adds small conveniences.
(function () {
  'use strict';
  var root = document.documentElement;

  /* ---------- Theme ---------- */
  var themeBtn = document.querySelector('.theme-toggle');
  var mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return mql && mql.matches ? 'dark' : 'light';
  }
  function syncThemeButton() {
    if (!themeBtn) return;
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    themeBtn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncThemeButton();
    });
  }
  if (mql && mql.addEventListener) mql.addEventListener('change', syncThemeButton);
  syncThemeButton();

  /* ---------- Copy email ---------- */
  var toast = null, toastTimer = null;
  function showToast(msg) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var label = btn.querySelector('.btn-copy-label');
      var original = label ? label.textContent : '';
      function done(ok) {
        showToast(ok ? 'Email address copied' : 'Copy failed: ' + text);
        if (!ok) return;
        btn.classList.add('copied');
        if (label) label.textContent = 'copied';
        setTimeout(function () { btn.classList.remove('copied'); if (label) label.textContent = original; }, 2000);
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      } else {
        done(fallbackCopy(text));
      }
    });
  });

  /* ---------- Current section in the nav ---------- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);
  if (!sections.length) return;

  function updateActive() {
    var line = window.innerHeight * 0.35;
    var current = '';
    sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) current = s.id; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = sections[sections.length - 1].id;
    }
    navAnchors.forEach(function (a) {
      if (a.getAttribute('href') === '#' + current) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { updateActive(); ticking = false; });
  }, { passive: true });
  updateActive();
})();
