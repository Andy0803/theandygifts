/* ═══════════════════════════════════════════════════════════════
   GIFT FINDER — homepage interactive gift matcher
   Pulls real products (with affiliate links) from the shop data so a
   visitor can find a hand-reviewed gift the moment they land.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var resultsEl = document.getElementById('gf-results');
  if (!resultsEl) return; // not on this page

  var countEl = document.getElementById('gf-count');
  var emptyEl = document.getElementById('gf-empty');
  var MAX_SHOWN = 12;

  var ALL = [];
  var filters = { recipient: 'any', budget: 'any' };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function escJs(s) { return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }

  // "~$170" -> 170
  function priceNum(p) {
    var m = String(p || '').match(/(\d[\d,]*)/);
    return m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
  }

  function load(file, recipient) {
    return fetch(file)
      .then(function (r) { return r.ok ? r.json() : { categories: [] }; })
      .then(function (data) {
        (data.categories || []).forEach(function (c) {
          (c.products || []).forEach(function (p) {
            ALL.push({
              name: p.name, why: p.why, price: p.price,
              priceNum: priceNum(p.price),
              link: p.link, image: p.image, review: p.review,
              pick: !!p.editorsPick,
              catLabel: c.label || c.title || '',
              recipient: recipient
            });
          });
        });
      })
      .catch(function () {});
  }

  function inBudget(p) {
    if (filters.budget === 'any') return true;
    if (p.priceNum == null) return false;
    var parts = filters.budget.split('-');
    return p.priceNum >= +parts[0] && p.priceNum <= +parts[1];
  }

  function matches(p) {
    if (filters.recipient !== 'any' && p.recipient !== filters.recipient) return false;
    return inBudget(p);
  }

  // best first: editor's picks, then those with a written review, then cheapest
  function rank(a, b) {
    if (a.pick !== b.pick) return a.pick ? -1 : 1;
    var ar = a.review ? 1 : 0, br = b.review ? 1 : 0;
    if (ar !== br) return br - ar;
    return (a.priceNum || 1e9) - (b.priceNum || 1e9);
  }

  function cardHtml(p) {
    var imgInner = p.image
      ? '<img src="' + esc(p.image) + '" alt="' + esc(p.name) + '" loading="lazy" ' +
        'onerror="this.parentElement.innerHTML=\'<span class=&quot;gf-card-ph&quot;>No image</span>\'">'
      : '<span class="gf-card-ph">No image</span>';
    var pickTag = p.pick ? ' · <span class="gf-pick">Editor’s Pick</span>' : '';
    var reviewLink = p.review
      ? '<a class="gf-card-review" href="' + esc(p.review) + '">Read our honest review →</a>'
      : '';
    return '' +
      '<div class="gf-card">' +
        '<a class="gf-card-link" href="' + esc(p.link) + '" target="_blank" rel="noopener sponsored" ' +
           'onclick="gfTrack(\'' + escJs(p.catLabel) + '\',\'' + escJs(p.name) + '\')">' +
          '<div class="gf-card-img">' + imgInner + '</div>' +
          '<div class="gf-card-body">' +
            '<div class="gf-card-cat">' + esc(p.catLabel) + pickTag + '</div>' +
            '<h3 class="gf-card-name">' + esc(p.name) + '</h3>' +
            '<p class="gf-card-why">' + esc(p.why) + '</p>' +
            '<div class="gf-card-foot">' +
              '<span class="gf-card-price">' + esc(p.price || '') + '</span>' +
              '<span class="gf-card-cta">See on Amazon →</span>' +
            '</div>' +
          '</div>' +
        '</a>' +
        reviewLink +
      '</div>';
  }

  function render() {
    var hits = ALL.filter(matches).sort(rank);
    if (countEl) countEl.textContent = hits.length;
    if (emptyEl) emptyEl.hidden = hits.length !== 0;
    resultsEl.innerHTML = hits.slice(0, MAX_SHOWN).map(cardHtml).join('');
  }

  function bindChips() {
    var groups = document.querySelectorAll('.gf-chips');
    for (var i = 0; i < groups.length; i++) {
      (function (group) {
        var key = group.getAttribute('data-filter');
        group.addEventListener('click', function (e) {
          var btn = e.target.closest('.gf-chip');
          if (!btn) return;
          var sibs = group.querySelectorAll('.gf-chip');
          for (var j = 0; j < sibs.length; j++) sibs[j].classList.remove('is-active');
          btn.classList.add('is-active');
          filters[key] = btn.getAttribute('data-value');
          render();
        });
      })(groups[i]);
    }
  }

  // affiliate click tracking (mirrors shop's app.js)
  window.gfTrack = function (cat, name) {
    if (typeof gtag === 'function') {
      gtag('event', 'affiliate_click', {
        product_name: name, collection: cat,
        event_category: 'Affiliate', event_label: name, source: 'gift_finder'
      });
    }
  };

  bindChips();
  Promise.all([
    load('products-him.json', 'him'),
    load('products-her.json', 'her')
  ]).then(render);
})();
