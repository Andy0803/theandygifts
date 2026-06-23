/* ═══════════════════════════════════════════════════════════════
   MOTION ENGINE — The Andy Gifts
   Auto-initialises a cinematic motion layer on any page that loads
   it. Path-agnostic, progressive-enhancement, reduced-motion aware.
   No dependencies. Safe to load after shared.js.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var html   = document.documentElement;

  // Signal CSS that JS is alive (enables pre-reveal hidden states).
  html.classList.add('m-ready');

  /* ── Selectors auto-tagged for scroll-reveal ──────────────────
     We skip .fade-in elements (app.js animates those itself). */
  var REVEAL = [
    '.hero-eyebrow', '.hero-deck', '.hero-trust', '.occasions',
    '.feed-label', '.post-featured', '.post-card', '.gf-card',
    '.gf-head', '.gf-controls',
    '.manifesto-eyebrow', '.manifesto-quote', '.manifesto-author',
    '.guides-eyebrow', '.guides-title', '.guide-card',
    '.browse-strip', '.keep-going',
    '.page-chapter', '.page-dek', '.page-aside',
    '.about-eyebrow', '.about-lede', '.about > p', '.about > h2',
    '.trust-card', '.cta-row',
    '.blog-eyebrow', '.blog-header p',
    '.article-tag', '.article-lede', '.article > p', '.article > h2',
    '.disclosure-bar', '.toc', '.verdict-box', '.specs', '.compare-wrap',
    '.proscons', '.sources', '.closing', '.related-post', '.browse-all'
  ].join(',');

  /* Headlines get the per-word clip reveal instead of a block reveal. */
  var HEADLINES = [
    '.hero-headline', '.page-title', '.about h1',
    '.blog-header h1', '.guides-title', '.article h1', '.closing'
  ].join(',');

  /* Elements that get magnetic pull. */
  var MAGNETIC = [
    '.cta-primary', '.cta-secondary', '.browse-strip a', '.prod-cta',
    '.gift-cta', '.browse-all a', '.occasion-chip', '.back-btn'
  ].join(',');

  /* Cards that tilt in 3D. */
  var TILT = '.post-card, .guide-card, .trust-card, .post-featured, .gf-card';

  /* ── Helpers ──────────────────────────────────────────────── */
  function each(root, sel, fn) {
    var list = (root || document).querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) fn(list[i], i);
  }
  function done(el, key) {
    if (el.dataset['m' + key]) return true;
    el.dataset['m' + key] = '1';
    return false;
  }
  // True if the element is already (mostly) within the viewport.
  function inView(el) {
    var r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false; // hidden / not laid out
    return r.top < window.innerHeight * 0.92 && r.bottom > 0;
  }

  /* ════════════════ 1. SCROLL PROGRESS BAR ════════════════ */
  (function () {
    var bar = document.createElement('div');
    bar.id = 'm-progress';
    document.body.appendChild(bar);
    function upd() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (window.scrollY / h) * 100 : 0;
      bar.style.width = p + '%';
    }
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd, { passive: true });
    upd();
  })();

  /* ════════════════ 2. AMBIENT LIGHT LAYER ════════════════ */
  if (!REDUCE) {
    var amb = document.createElement('div');
    amb.id = 'm-ambient';
    amb.innerHTML = '<div class="m-blob b1"></div><div class="m-blob b2"></div><div class="m-blob b3"></div>';
    document.body.insertBefore(amb, document.body.firstChild);
  }

  /* ════════════════ 3. NAV STATE ON SCROLL ════════════════ */
  (function () {
    var nav = document.querySelector('nav');
    if (!nav) return;
    function upd() { nav.classList.toggle('m-scrolled', window.scrollY > 40); }
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  })();

  /* ════════════════ 4. BACK-TO-TOP BUTTON ════════════════ */
  (function () {
    var btn = document.createElement('button');
    btn.id = 'm-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none">' +
      '<path d="M8 13V3M8 3L3 8M8 3l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    document.body.appendChild(btn);
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: REDUCE ? 'auto' : 'smooth' });
    });
    window.addEventListener('scroll', function () {
      btn.classList.toggle('m-show', window.scrollY > window.innerHeight * 0.6);
    }, { passive: true });
  })();

  /* ════════════════ 5. REVEAL OBSERVER ════════════════ */
  var revealIO = null;
  if ('IntersectionObserver' in window) {
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('m-in');
          revealIO.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  }

  function applyReveal(root) {
    each(root, REVEAL, function (el) {
      if (done(el, 'Reveal')) return;
      // skip elements app.js already animates, or nested inside a reveal target
      if (el.classList.contains('fade-in')) return;
      if (el.closest('.m-split')) return;
      var variant = el.getAttribute('data-m-reveal') || pickVariant(el);
      el.setAttribute('data-m-reveal', variant);
      if (!revealIO || REDUCE) { el.classList.add('m-in'); return; }
      // Already on screen → reveal now (don't wait on the observer).
      if (inView(el)) { requestAnimationFrame(function () { el.classList.add('m-in'); }); return; }
      revealIO.observe(el);
    });
    // stagger siblings that share a grid/flow
    stagger(root, '.posts-grid', '.post-card');
    stagger(root, '.gf-results', '.gf-card');
    stagger(root, '.guides-list', '.guide-card');
    stagger(root, '.trust-grid', '.trust-card');
    stagger(root, '.hero-trust', '.trust-item');
  }

  function pickVariant(el) {
    if (el.matches('.post-card, .guide-card, .trust-card')) return 'blur';
    if (el.matches('.post-featured, .verdict-box, .closing')) return 'scale';
    return 'up';
  }

  function stagger(root, wrapSel, childSel) {
    each(root, wrapSel, function (wrap) {
      each(wrap, childSel, function (child, i) {
        child.style.setProperty('--m-delay', (i % 12) * 0.08 + 's');
      });
    });
  }

  /* ════════════════ 6. SPLIT-TEXT HEADLINES ════════════════ */
  var splitIO = null;
  if ('IntersectionObserver' in window) {
    splitIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('m-in');
          splitIO.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
  }

  function splitNode(node, ctx) {
    // ctx.w = running word index (object so it's shared by reference)
    if (node.nodeType === 3) { // text
      var parts = node.textContent.split(/(\s+)/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (part) {
        if (part === '') return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var outer = document.createElement('span');
        outer.className = 'm-word';
        var inner = document.createElement('span');
        inner.className = 'm-word-i';
        inner.style.setProperty('--wi', ctx.w++);
        inner.textContent = part;
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      return frag;
    }
    if (node.nodeName === 'BR') return node.cloneNode();
    // element (e.g. <i> accent) — keep wrapper, recurse into it
    var clone = node.cloneNode(false);
    var kids = Array.prototype.slice.call(node.childNodes);
    kids.forEach(function (k) { clone.appendChild(splitNode(k, ctx)); });
    return clone;
  }

  function applySplit(root) {
    each(root, HEADLINES, function (el) {
      if (done(el, 'Split')) return;
      try {
        var ctx = { w: 0 };
        var kids = Array.prototype.slice.call(el.childNodes);
        var frag = document.createDocumentFragment();
        kids.forEach(function (k) { frag.appendChild(splitNode(k, ctx)); });
        el.innerHTML = '';
        el.appendChild(frag);
        el.classList.add('m-split');
        if (!splitIO || REDUCE) { el.classList.add('m-in'); return; }
        if (inView(el)) { requestAnimationFrame(function () { el.classList.add('m-in'); }); return; }
        splitIO.observe(el);
      } catch (err) {
        el.classList.add('m-in'); // fail safe: just show it
      }
    });
  }

  /* ════════════════ 7. COUNT-UP NUMBERS ════════════════ */
  var countIO = null;
  if ('IntersectionObserver' in window) {
    countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); countIO.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
  }

  function runCount(el) {
    var raw = (el.textContent || '').trim();
    var m = raw.match(/^(\D*)(\d[\d,]*)(\D*)$/);
    if (!m) return;
    var pre = m[1], digits = m[2].replace(/,/g, ''), suf = m[3];
    var target = parseInt(digits, 10);
    if (!isFinite(target)) return;
    var pad = m[2].length;                     // preserve leading zeros (e.g. 02)
    var grouped = /,/.test(m[2]);
    var holder = el.querySelector('i') || el;  // keep accent <i> styling if present
    if (REDUCE) { return; }
    var dur = 1300, t0 = null;
    function fmt(n) {
      var s = String(n);
      if (pad > String(target).length) while (s.length < pad) s = '0' + s;
      if (grouped) s = Number(n).toLocaleString('en-US');
      return pre + s + suf;
    }
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      holder.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
      else holder.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }

  function applyCount(root) {
    each(root, '.trust-num, [data-m-count]', function (el) {
      if (el.dataset.mCount) return;
      // Wait until the value is actually populated (shop sets it async).
      if (!/\d/.test(el.textContent || '')) return;
      el.dataset.mCount = '1';
      if (!countIO || REDUCE) return;
      if (inView(el)) { runCount(el); return; }
      countIO.observe(el);
    });
  }

  /* ════════════════ 8. MAGNETIC BUTTONS ════════════════ */
  function applyMagnetic(root) {
    if (!FINE || REDUCE) return;
    each(root, MAGNETIC, function (el) {
      if (done(el, 'Mag')) return;
      el.classList.add('m-magnetic');
      var strength = 0.35;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + x * strength + 'px,' + y * strength + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ════════════════ 9. 3D TILT CARDS ════════════════ */
  function applyTilt(root) {
    if (!FINE || REDUCE) return;
    each(root, TILT, function (el) {
      if (done(el, 'Tilt')) return;
      el.classList.add('m-tilt');
      var sheen = document.createElement('span');
      sheen.className = 'm-sheen';
      el.appendChild(sheen);
      var MAX = 7;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        var rx = (0.5 - py) * MAX * 2;
        var ry = (px - 0.5) * MAX * 2;
        el.classList.add('m-tilting');
        el.style.transform =
          'perspective(900px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-6px)';
        el.style.setProperty('--mx', px * 100 + '%');
        el.style.setProperty('--my', py * 100 + '%');
      });
      el.addEventListener('mouseleave', function () {
        el.classList.remove('m-tilting');
        el.style.transform = '';
      });
    });
  }

  /* ════════════════ MASTER ENHANCE + RE-SCAN ════════════════ */
  function enhance(root) {
    applySplit(root);   // split first so reveal can skip headline internals
    applyReveal(root);
    applyCount(root);
    applyMagnetic(root);
    applyTilt(root);
  }

  function boot() {
    enhance(document);
    // Re-scan for content injected later (index/blog cards, shop rows,
    // shared.js footer/sidebar, app.js trust numbers).
    if ('MutationObserver' in window) {
      var pending = false;
      var mo = new MutationObserver(function () {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () { pending = false; enhance(document); });
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
