// ═══════════════ SHARED JS (sidebar + footer injection) ═══════════════

// --- Auto-inject footer ---
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

// --- Sidebar logic ---
(function() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const reviewsBtn = document.getElementById('reviewsToggle');
  const shopBtn = document.getElementById('shopToggle');
  const reviewsChildren = document.getElementById('reviewsChildren');
  const shopChildren = document.getElementById('shopChildren');

  if (!toggle || !sidebar) return;

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

  if (reviewsBtn && reviewsChildren) {
    reviewsBtn.addEventListener('click', () => {
      const isOpen = reviewsChildren.classList.contains('open');
      reviewsChildren.classList.toggle('open', !isOpen);
      reviewsBtn.classList.toggle('open', !isOpen);
      if (shopChildren) shopChildren.classList.remove('open');
      if (shopBtn) shopBtn.classList.remove('open');
    });
  }
  if (shopBtn && shopChildren) {
    shopBtn.addEventListener('click', () => {
      const isOpen = shopChildren.classList.contains('open');
      shopChildren.classList.toggle('open', !isOpen);
      shopBtn.classList.toggle('open', !isOpen);
      if (reviewsChildren) reviewsChildren.classList.remove('open');
      if (reviewsBtn) reviewsBtn.classList.remove('open');
    });
  }
})();
