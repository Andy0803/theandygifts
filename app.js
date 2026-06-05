// CATEGORIES are loaded from products-him.json and products-her.json
let CATEGORIES = [];

// ═══════════════ LOAD DATA FROM JSON ═══════════════
async function loadData() {
  try {
    const [res1, res2] = await Promise.all([
      fetch('products-him.json'),
      fetch('products-her.json')
    ]);
    if (!res1.ok || !res2.ok) throw new Error('Failed to load product JSON files');
    const data1 = await res1.json();
    const data2 = await res2.json();
    CATEGORIES = [
      ...(data1.categories || []),
      ...(data2.categories || [])
    ];
    initApp();
  } catch (err) {
    console.error(err);
    document.getElementById('loading').textContent = 'Could not load products. Please refresh.';
  }
}

// ═══════════════ INIT ═══════════════
function initApp() {
  // update trust numbers
  document.getElementById('trust-collections').innerHTML = `<i>${String(CATEGORIES.length).padStart(2, '0')}</i>`;
  const total = CATEGORIES.reduce((sum, c) => sum + c.products.length, 0);
  document.getElementById('trust-products').innerHTML = `<i>${total}</i>`;

  renderHome();

  // route from URL
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('c');
  if (cat) {
    document.getElementById('home-page').style.display = 'block';
    showCategory(cat);
  } else {
    document.getElementById('home-page').style.display = 'block';
  }

  // hide loading
  setTimeout(() => {
    document.getElementById('loading').classList.add('fade');
    setTimeout(() => document.getElementById('loading').style.display = 'none', 500);
  }, 100);
}

// ═══════════════ RENDER HOME ═══════════════
function renderHome() {
  const wrap = document.getElementById('collections-list');
  wrap.innerHTML = CATEGORIES.map((c, i) => `
    <div class="collection-row fade-in" onclick="showCategory('${c.id}')" style="animation-delay:${0.1 + i * 0.12}s">
      <div class="col-index">No. ${String(i + 1).padStart(2, '0')}</div>
      <div class="col-content">
        <div class="col-title">${escapeHtml(c.title)}</div>
        <div class="col-blurb">${escapeHtml(c.blurb)}</div>
      </div>
      <div class="col-right">
        <div class="col-count">${c.products.length} items</div>
        <div class="col-arrow">→</div>
      </div>
    </div>
  `).join('');
}

// ═══════════════ SHOW CATEGORY ═══════════════
function showCategory(id) {
  const cat = CATEGORIES.find(c => c.id === id);
  if (!cat) return;

  if (typeof gtag === 'function') {
    gtag('event', 'view_collection', {
      collection_name: cat.label,
      collection_title: cat.title
    });
  }

  document.getElementById('home-page').style.display = 'none';
  document.getElementById('product-page').style.display = 'block';

  document.getElementById('page-tag').textContent = cat.label;
  document.getElementById('page-chapter').textContent = `— ${cat.label} —`;
  document.getElementById('page-title').innerHTML = escapeHtml(cat.title);
  document.getElementById('page-dek').textContent = cat.blurb;
  document.getElementById('page-aside').textContent = cat.aside;

  const pick = cat.products.find(p => p.editorsPick);
  const quickPickHtml = pick ? `
    <div class="quick-pick">
      <span class="quick-pick-label">If choosing just one —</span>
      <a class="quick-pick-name" href="${escapeAttr(pick.link)}" target="_blank" rel="noopener"
         onclick="trackAffiliateClick('${escapeAttr(cat.label)}', '${escapeAttr(pick.name)}')">
        ${escapeHtml(pick.name)} →
      </a>
    </div>` : '';

  document.getElementById('quick-pick-slot').innerHTML = quickPickHtml;

  const list = document.getElementById('products-list');
  list.innerHTML = cat.products.map((p, i) => {
    const imageHtml = p.image
      ? `<img class="prod-image" src="${escapeAttr(p.image)}" alt="${escapeAttr(p.name)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'prod-image-placeholder\\'>No image</div>'">`
      : `<div class="prod-image-placeholder">No image</div>`;
    const whyHtml = p.why
      ? `<div class="prod-why">${escapeHtml(p.why)}</div>`
      : '';
    const priceHtml = p.price
      ? `<div class="prod-price">${escapeHtml(p.price)}</div>`
      : '';
    const reviewHtml = p.review
      ? `<a class="prod-review-link" href="${escapeAttr(p.review)}">Read our review →</a>`
      : '';
    const epBadge = p.editorsPick ? `<span class="ep-badge">Pick</span>` : '';
    return `
    <div class="product-row${p.editorsPick ? ' is-editors-pick' : ''} fade-in"
       style="animation-delay:${i * 0.04}s">
      <div class="prod-image-wrap">${imageHtml}</div>
      <div class="prod-text">
        <div class="prod-name">${escapeHtml(p.name)}</div>
        ${whyHtml}
        ${priceHtml}
        ${reviewHtml}
      </div>
      <a class="prod-cta"
         href="${escapeAttr(p.link)}"
         target="_blank"
         rel="noopener"
         onclick="trackAffiliateClick('${escapeAttr(cat.label)}', '${escapeAttr(p.name)}')">
        ${epBadge}
        See on Amazon
        <svg width="13" height="13" viewBox="0 0 11 11" fill="none">
          <path d="M2 9L9 2M9 2H3M9 2V8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
      </a>
    </div>`;
  }).join('');

  const others = CATEGORIES.filter(c => c.id !== id);
  document.getElementById('other-cols').innerHTML = others.map(c => `
    <a class="keep-going-link" onclick="showCategory('${c.id}')">${escapeHtml(c.title)}</a>
  `).join('');

  window.scrollTo({ top: 0, behavior: 'smooth' });
  try { history.pushState({}, '', `?c=${id}`); } catch(e) {}
}

// ═══════════════ SHOW HOME ═══════════════
function showHome() {
  document.getElementById('product-page').style.display = 'none';
  document.getElementById('home-page').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  try { history.pushState({}, '', window.location.pathname); } catch(e) {}
}

// ═══════════════ TRACKING ═══════════════
function trackAffiliateClick(category, productName) {
  if (typeof gtag === 'function') {
    gtag('event', 'affiliate_click', {
      product_name: productName,
      collection: category,
      event_category: 'Affiliate',
      event_label: productName
    });
  }
}

// ═══════════════ UTILITIES ═══════════════
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ═══════════════ BACK BUTTON ═══════════════
window.addEventListener('popstate', () => {
  const p = new URLSearchParams(window.location.search);
  const c = p.get('c');
  if (c) showCategory(c);
  else showHome();
});

// ═══════════════ START ═══════════════
loadData();
