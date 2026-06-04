// ═══════════════ SHARED JS (sidebar + footer auto-injection) ═══════════════

// --- Inject SIDEBAR (toggle button + overlay + nav) ---
(function injectSidebar() {
  const slot = document.getElementById('siteSidebar');
  if (!slot) return;

  // data-prefix="" for root pages, data-prefix="../" for blog/ pages
  const prefix = slot.getAttribute('data-prefix') || '';
  const blogPath = prefix ? '' : 'blog/';
  const shopPath = prefix + 'shop.html';
  const aboutPath = prefix + 'about.html';

  // Sidebar links — to add a new review, just add a line here
  const reviews = [
    { href: blogPath + 'bellroy-hide-seek-wallet-review.html', label: 'Bellroy Hide &amp; Seek Wallet' },
    { href: blogPath + 'yeti-rambler-20oz-review.html', label: 'YETI Rambler 20oz' },
    { href: blogPath + 'lego-porsche-911-review.html', label: 'LEGO Porsche 911' },
  ];
  const reviewsAll = prefix ? 'index.html' : 'blog/';
  const collections = [
    { hash: 'lego',           label: 'The Builders' },
    { hash: 'minecraft',      label: 'The Pixel Years' },
    { hash: 'good-life',      label: 'Quiet Upgrades' },
    { hash: 'slow-mornings',  label: 'Slow Mornings' },
  ];

  const reviewsLinks = reviews.map(r => `<a class="sidebar-link" href="${r.href}">${r.label}</a>`).join('');
  const collectionLinks = collections.map(c => `<a class="sidebar-link" href="${shopPath}?c=${c.hash}">${c.label}</a>`).join('');

  slot.innerHTML = `
    <button class="sidebar-toggle" id="sidebarToggle" aria-label="Menu">
      <svg viewBox="0 0 26 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true">
        <line x1="2" y1="2" x2="24" y2="2"/>
        <line x1="2" y1="11" x2="24" y2="11"/>
        <line x1="2" y1="20" x2="24" y2="20"/>
      </svg>
    </button>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-section">
        <button class="sidebar-parent" id="reviewsToggle">
          Reviews
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="sidebar-children" id="reviewsChildren">
          <div>
            ${reviewsLinks}
            <a class="sidebar-link" href="${reviewsAll}">All Reviews →</a>
          </div>
        </div>
      </div>
      <div class="sidebar-section">
        <button class="sidebar-parent" id="shopToggle">
          Shop
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="sidebar-children" id="shopChildren">
          <div>${collectionLinks}</div>
        </div>
      </div>
      <a class="sidebar-direct" href="${aboutPath}">About</a>
    </nav>
  `;

  // --- Now bind sidebar interactions (must run AFTER injection) ---
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const reviewsBtn = document.getElementById('reviewsToggle');
  const shopBtn = document.getElementById('shopToggle');
  const reviewsChildren = document.getElementById('reviewsChildren');
  const shopChildren = document.getElementById('shopChildren');

  function openSidebar() {
    toggle.classList.add('open');
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    toggle.classList.remove('open');
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  overlay.addEventListener('click', closeSidebar);

  reviewsBtn.addEventListener('click', () => {
    const isOpen = reviewsChildren.classList.contains('open');
    reviewsChildren.classList.toggle('open', !isOpen);
    reviewsBtn.classList.toggle('open', !isOpen);
    shopChildren.classList.remove('open');
    shopBtn.classList.remove('open');
  });
  shopBtn.addEventListener('click', () => {
    const isOpen = shopChildren.classList.contains('open');
    shopChildren.classList.toggle('open', !isOpen);
    shopBtn.classList.toggle('open', !isOpen);
    reviewsChildren.classList.remove('open');
    reviewsBtn.classList.remove('open');
  });
})();

// --- Inject FOOTER ---
(function injectFooter() {
  const slot = document.getElementById('siteFooter');
  if (!slot) return;
  const prefix = slot.getAttribute('data-prefix') || '';
  slot.innerHTML = `
    <div class="footer-mark">The Andy <em>Gifts</em></div>
    <div class="footer-rule">
      © ${new Date().getFullYear()} The Andy Gifts<br>
      <a href="${prefix}shop.html">Shop</a> &nbsp;·&nbsp;
      <a href="${prefix}blog/">Reviews</a> &nbsp;·&nbsp;
      <a href="${prefix}about.html">About</a> &nbsp;·&nbsp;
      <a href="https://www.pinterest.com/TheAndyGifts/" target="_blank" rel="noopener">Pinterest</a><br>
      As an Amazon Associate, I earn from qualifying purchases.
    </div>
  `;
})();
