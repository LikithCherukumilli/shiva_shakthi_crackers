// Shivashakti Crackers - Customer Storefront & Owner-Only Protected Admin Dashboard + GitHub Live Publisher
(function () {
  'use strict';

  const STORAGE_KEYS = {
    PRODUCTS: 'shivashakti_products_v1',
    SETTINGS: 'shivashakti_settings_v1',
    CART: 'shivashakti_cart_v1',
    ORDERS: 'shivashakti_orders_v1',
    ADMIN_SESSION: 'shivashakti_admin_auth_v1',
    GITHUB_CONFIG: 'shivashakti_gh_config_v1'
  };

  // Safe localStorage helpers
  function loadStorage(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return JSON.parse(JSON.stringify(fallback));
      return JSON.parse(raw);
    } catch (e) {
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  function saveStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Fallback for sandboxed storage restrictions
    }
  }

  // Application State
  const state = {
    isAdminAuthenticated: Boolean(window.FORCE_ADMIN_LOGIN_PROMPT ? false : loadStorage(STORAGE_KEYS.ADMIN_SESSION, false)),
    activeMainView: 'storefront', // 'storefront' | 'dashboard' (restricted to authenticated owner)
    storeViewMode: 'grid', // 'grid' | 'table'
    selectedCategory: 'All',
    searchQuery: '',
    sortBy: 'sno-asc',
    pageFilter: 'all', // 'all' | '1' | '2' | '3'
    dashboardTab: 'products', // 'products' | 'orders' | 'settings' | 'vscode'
    dashSearch: '',
    dashCategory: 'All',
    dashStockFilter: 'all', // 'all' | 'instock' | 'outofstock' | 'unpriced'
    editingProductId: null,
    deletingProductId: null,
    logoClickCount: 0,
    logoClickTimer: null,
    ghConfig: loadStorage(STORAGE_KEYS.GITHUB_CONFIG, {
      repo: '',
      branch: 'main',
      path: 'js/products.js',
      token: ''
    }),
    products: loadStorage(STORAGE_KEYS.PRODUCTS, window.INITIAL_PRODUCTS || []),
    settings: Object.assign({}, window.INITIAL_STORE_SETTINGS || {}, loadStorage(STORAGE_KEYS.SETTINGS, window.INITIAL_STORE_SETTINGS || {})),
    cart: loadStorage(STORAGE_KEYS.CART, {}),
    orders: loadStorage(STORAGE_KEYS.ORDERS, [
      {
        id: 'ORD-1001',
        customerName: 'Ramesh Kumar',
        phone: '9848012345',
        mode: 'Store Pickup (Chintal Basti)',
        date: '2026-11-02 14:30',
        status: 'Confirmed',
        items: [
          { sno: 7, name: '15 cm Colour Sparklers', qty: 4, price: 80 },
          { sno: 14, name: 'Ground Chakker', qty: 2, price: 120 },
          { sno: 20, name: 'Flower Pot Special Big', qty: 2, price: 160 },
          { sno: 65, name: '30 Shot Multi-Colour Sky Shot', qty: 1, price: 780 }
        ],
        total: 1660
      }
    ])
  };

  if (!state.settings.adminPin) {
    state.settings.adminPin = 'shiva2026';
  }

  const CATEGORIES = [
    'All',
    'Sparklers',
    'Chakkars',
    'Flower Pots',
    'Bombs',
    'Walas & Garlands',
    'Rockets',
    'Pencils & Novelties',
    'Sky Shots & Fancy'
  ];

  // Category Custom SVGs for rich visual cards
  function getCategorySvg(category) {
    switch (category) {
      case 'Sparklers':
        return `<svg viewBox="0 0 64 64" class="w-12 h-12" fill="none">
          <line x1="12" y1="52" x2="38" y2="26" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
          <circle cx="42" cy="22" r="5" fill="#fef08a"/>
          <path d="M42 6V14M42 30V38M26 22H34M50 22H58M31 11L36 16M48 28L53 33M53 11L48 16M36 28L31 33" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
        </svg>`;
      case 'Chakkars':
        return `<svg viewBox="0 0 64 64" class="w-12 h-12" fill="none">
          <circle cx="32" cy="32" r="22" stroke="#f59e0b" stroke-width="3" stroke-dasharray="6 4"/>
          <circle cx="32" cy="32" r="14" fill="#dc2626" stroke="#fde047" stroke-width="2.5"/>
          <circle cx="32" cy="32" r="5" fill="#fef08a"/>
          <path d="M32 10C44 10 54 20 54 32" stroke="#fde047" stroke-width="2.5" stroke-linecap="round"/>
        </svg>`;
      case 'Flower Pots':
        return `<svg viewBox="0 0 64 64" class="w-12 h-12" fill="none">
          <polygon points="20,54 44,54 38,30 26,30" fill="#dc2626" stroke="#fbbf24" stroke-width="2.5"/>
          <path d="M32 28C32 16 20 12 16 20M32 28C32 14 44 12 48 20M32 28V10" stroke="#fde047" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="32" cy="8" r="2.5" fill="#fef08a"/>
          <circle cx="16" cy="20" r="2.5" fill="#fbbf24"/>
          <circle cx="48" cy="20" r="2.5" fill="#fbbf24"/>
        </svg>`;
      case 'Bombs':
        return `<svg viewBox="0 0 64 64" class="w-12 h-12" fill="none">
          <rect x="18" y="24" width="28" height="28" rx="6" fill="#991b1b" stroke="#fbbf24" stroke-width="2.5"/>
          <path d="M18 34H46M18 42H46" stroke="#fde047" stroke-width="2"/>
          <path d="M32 24V16C32 12 38 10 42 14" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="44" cy="14" r="3.5" fill="#fef08a"/>
        </svg>`;
      case 'Walas & Garlands':
        return `<svg viewBox="0 0 64 64" class="w-12 h-12" fill="none">
          <path d="M32 10V54" stroke="#fbbf24" stroke-width="2.5"/>
          <rect x="16" y="16" width="12" height="6" rx="2" fill="#dc2626" stroke="#fde047" stroke-width="1.5"/>
          <rect x="36" y="20" width="12" height="6" rx="2" fill="#dc2626" stroke="#fde047" stroke-width="1.5"/>
          <rect x="16" y="28" width="12" height="6" rx="2" fill="#dc2626" stroke="#fde047" stroke-width="1.5"/>
          <rect x="36" y="32" width="12" height="6" rx="2" fill="#dc2626" stroke="#fde047" stroke-width="1.5"/>
          <rect x="16" y="40" width="12" height="6" rx="2" fill="#dc2626" stroke="#fde047" stroke-width="1.5"/>
          <circle cx="32" cy="8" r="3" fill="#fef08a"/>
        </svg>`;
      case 'Rockets':
        return `<svg viewBox="0 0 64 64" class="w-12 h-12" fill="none">
          <polygon points="32,8 22,24 42,24" fill="#fbbf24" stroke="#fef08a" stroke-width="2"/>
          <rect x="25" y="24" width="14" height="18" fill="#dc2626" stroke="#fbbf24" stroke-width="2"/>
          <line x1="32" y1="42" x2="32" y2="58" stroke="#fde047" stroke-width="2.5"/>
          <path d="M26 46L22 54M38 46L42 54" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
        </svg>`;
      case 'Sky Shots & Fancy':
        return `<svg viewBox="0 0 64 64" class="w-12 h-12" fill="none">
          <circle cx="32" cy="24" r="4" fill="#fef08a"/>
          <path d="M32 8V16M32 32V40M16 24H24M40 24H48M20 12L26 18M38 30L44 36M44 12L38 18M26 30L20 36" stroke="#fde047" stroke-width="2.5" stroke-linecap="round"/>
          <rect x="24" y="44" width="16" height="14" rx="2" fill="#7c2d12" stroke="#fbbf24" stroke-width="2"/>
        </svg>`;
      default:
        return `<svg viewBox="0 0 64 64" class="w-12 h-12" fill="none">
          <rect x="26" y="22" width="12" height="34" rx="3" fill="#0284c7" stroke="#fde047" stroke-width="2"/>
          <circle cx="32" cy="16" r="5" fill="#fef08a"/>
          <path d="M32 6V10M20 16H24M40 16H44M23 9L26 12M41 9L38 12" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
        </svg>`;
    }
  }

  // Compute Original MRP from Sale Price and Discount %
  function computeMrp(salePrice) {
    const p = Number(salePrice) || 0;
    if (p <= 0) return 0;
    const disc = Math.min(90, Math.max(0, Number(state.settings.discountPercent) || 70));
    if (disc === 0) return p;
    return Math.round(p / (1 - disc / 100));
  }

  // Toast Notification
  let toastTimer = null;
  function showToast(message, type) {
    const toast = document.getElementById('app-toast');
    const toastText = document.getElementById('app-toast-text');
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border transition-all duration-300 ' +
      (type === 'error'
        ? 'bg-red-950/95 border-red-400 text-red-100'
        : 'bg-amber-400 border-amber-200 text-slate-950 font-semibold');
    toast.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3200);
  }

  // Save products & refresh UI
  function persistProducts() {
    saveStorage(STORAGE_KEYS.PRODUCTS, state.products);
    renderAll();
  }

  function persistSettings() {
    saveStorage(STORAGE_KEYS.SETTINGS, state.settings);
    renderAll();
  }

  function persistCart() {
    saveStorage(STORAGE_KEYS.CART, state.cart);
    renderCartSummary();
  }

  function persistOrders() {
    saveStorage(STORAGE_KEYS.ORDERS, state.orders);
    renderDashboard();
  }

  // Owner Login / Logout functions
  function openAdminLoginModal() {
    if (state.isAdminAuthenticated) {
      state.activeMainView = 'dashboard';
      renderAll();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const modal = document.getElementById('admin-login-modal');
    const pinInput = document.getElementById('admin-login-password');
    const errEl = document.getElementById('admin-login-error');
    if (errEl) errEl.classList.add('hidden');
    if (pinInput) pinInput.value = '';
    if (modal) {
      modal.classList.remove('hidden');
      if (pinInput) setTimeout(() => pinInput.focus(), 50);
    }
  }

  function closeAdminLoginModal() {
    const modal = document.getElementById('admin-login-modal');
    if (modal) modal.classList.add('hidden');
  }

  function logoutAdmin() {
    state.isAdminAuthenticated = false;
    state.activeMainView = 'storefront';
    saveStorage(STORAGE_KEYS.ADMIN_SESSION, false);
    if (window.location.hash === '#admin') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    renderAll();
    showToast('Logged out of Owner Dashboard. Public view active.');
  }

  // Direct Browser-to-GitHub API Publisher (100% Free Dynamic Updates on GitHub Pages)
  async function publishToGitHubPages(e) {
    e.preventDefault();
    if (!state.isAdminAuthenticated) return;

    const repo = document.getElementById('gh-repo-input').value.trim();
    const branch = document.getElementById('gh-branch-input').value.trim() || 'main';
    const filePath = document.getElementById('gh-path-input').value.trim() || 'js/products.js';
    const token = document.getElementById('gh-token-input').value.trim();
    const statusEl = document.getElementById('gh-publish-status');

    state.ghConfig = { repo, branch, path: filePath, token };
    saveStorage(STORAGE_KEYS.GITHUB_CONFIG, state.ghConfig);

    if (!repo || !repo.includes('/') || !token) {
      if (statusEl) {
        statusEl.textContent = '⚠️ Please enter both your GitHub Repository (e.g. username/shivashakti-crackers) and Personal Access Token.';
        statusEl.className = 'text-xs font-semibold text-amber-300 mt-2';
      }
      showToast('Enter GitHub Repo & Token first', 'error');
      return;
    }

    if (statusEl) {
      statusEl.textContent = '⏳ Connecting to GitHub API and publishing updated products.js...';
      statusEl.className = 'text-xs font-semibold text-sky-300 mt-2';
    }

    const fileContent = `// Updated products.js published from Shivashakti Crackers Owner Dashboard\nwindow.INITIAL_STORE_SETTINGS = ${JSON.stringify(state.settings, null, 2)};\n\nwindow.INITIAL_PRODUCTS = ${JSON.stringify(state.products, null, 2)};\n`;
    const encodedContent = btoa(unescape(encodeURIComponent(fileContent)));
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;

    try {
      // Step 1: Get current file SHA if it exists
      let currentSha = null;
      const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(branch)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json'
        }
      });
      if (getRes.ok) {
        const getJson = await getRes.json();
        currentSha = getJson.sha;
      }

      // Step 2: PUT updated file content
      const bodyPayload = {
        message: `Update Diwali cracker prices & catalog (${new Date().toISOString().slice(0, 16)})`,
        content: encodedContent,
        branch: branch
      };
      if (currentSha) bodyPayload.sha = currentSha;

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!putRes.ok) {
        const errData = await putRes.json().catch(() => ({}));
        throw new Error(errData.message || `GitHub API returned ${putRes.status}`);
      }

      if (statusEl) {
        statusEl.textContent = `✅ Successfully published ${filePath} to ${repo} (${branch})! Your live GitHub Pages / Netlify / Vercel website will update for all customers within 30–60 seconds.`;
        statusEl.className = 'text-xs font-semibold text-emerald-400 mt-2';
      }
      showToast('Published live to GitHub repository!');
    } catch (err) {
      if (statusEl) {
        statusEl.textContent = `❌ GitHub Publish Error: ${err.message}. Verify your repo name, branch, and token permissions (Contents: Read & Write).`;
        statusEl.className = 'text-xs font-semibold text-red-400 mt-2';
      }
      showToast('GitHub publish failed — check status message', 'error');
    }
  }

  // Cart manipulation
  function setCartQty(productId, qty) {
    const prod = state.products.find(p => p.id === Number(productId));
    if (!prod) return;
    if (!prod.inStock || Number(prod.price) <= 0) {
      showToast('Please click Enquire Rate to confirm availability for this item.', 'error');
      return;
    }
    const cleanQty = Math.max(0, Math.min(999, parseInt(qty, 10) || 0));
    if (cleanQty <= 0) {
      delete state.cart[productId];
    } else {
      state.cart[productId] = cleanQty;
    }
    persistCart();
    renderStoreProducts();
  }

  function adjustCartQty(productId, delta) {
    const current = state.cart[productId] || 0;
    setCartQty(productId, current + delta);
  }

  function clearCart() {
    state.cart = {};
    persistCart();
    renderStoreProducts();
    showToast('Cart cleared');
  }

  function getCartDetails() {
    const items = [];
    let totalSale = 0;
    let totalMrp = 0;
    let totalCount = 0;

    Object.keys(state.cart).forEach(pid => {
      const qty = state.cart[pid];
      const prod = state.products.find(p => p.id === Number(pid));
      if (prod && qty > 0 && Number(prod.price) > 0) {
        const lineSale = Number(prod.price) * qty;
        const mrp = computeMrp(prod.price);
        const lineMrp = mrp * qty;
        totalSale += lineSale;
        totalMrp += lineMrp;
        totalCount += qty;
        items.push({
          id: prod.id,
          sno: prod.sno,
          name: prod.name,
          shortName: prod.shortName || prod.name,
          unit: prod.unit || 'Box',
          price: Number(prod.price),
          mrp: mrp,
          qty: qty,
          lineTotal: lineSale
        });
      }
    });

    items.sort((a, b) => a.sno - b.sno);
    return {
      items,
      totalSale,
      totalMrp,
      totalSavings: Math.max(0, totalMrp - totalSale),
      totalCount
    };
  }

  // Filtered Storefront Products
  function getFilteredStoreProducts() {
    const q = state.searchQuery.trim().toLowerCase();
    const list = state.products.filter(p => {
      if (state.selectedCategory !== 'All' && p.category !== state.selectedCategory) {
        return false;
      }
      if (state.pageFilter !== 'all' && String(p.page) !== String(state.pageFilter)) {
        return false;
      }
      if (q) {
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchShort = (p.shortName || '').toLowerCase().includes(q);
        const matchSno = String(p.sno) === q || ('#' + p.sno) === q;
        const matchCat = (p.category || '').toLowerCase().includes(q);
        if (!matchName && !matchShort && !matchSno && !matchCat) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      if (state.sortBy === 'sno-asc') return (a.sno || 0) - (b.sno || 0);
      if (state.sortBy === 'price-asc') {
        const pa = a.price > 0 ? a.price : 999999;
        const pb = b.price > 0 ? b.price : 999999;
        return pa - pb;
      }
      if (state.sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (state.sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    return list;
  }

  // Render Brand Header & Hero
  function renderBrandDetails() {
    const s = state.settings;
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setTxt('brand-title-main', s.storeName || 'SHIVASHAKTI CRACKERS');
    setTxt('brand-telugu-title', s.teluguName || 'శివశక్తి క్రాకర్స్');
    setTxt('brand-tagline', s.tagline || 'Celebrate with Safety... Celebrate with Shivasakthi Crackers!');
    setTxt('brand-subtagline', s.subTagline || 'Light Up Your Festivals • Safe, Brighter, Happier');
    setTxt('brand-discount-badge', (s.discountPercent || 70) + '%');
    setTxt('brand-phone1', s.phone1 || '9121859929');
    setTxt('brand-phone2', s.phone2 || '8179809363');
    setTxt('brand-location', s.location || 'Chintal Basti, Khairatabad, Hyderabad');
    setTxt('footer-phone1', s.phone1 || '9121859929');
    setTxt('footer-phone2', s.phone2 || '8179809363');
    setTxt('footer-location', s.location || 'Chintal Basti, Khairatabad, Hyderabad');
    setTxt('total-catalog-badge', state.products.length + ' Crackers');
  }

  // Render Category Pills
  function renderCategoryPills() {
    const container = document.getElementById('category-pills-container');
    if (!container) return;

    const counts = { All: state.products.length };
    CATEGORIES.slice(1).forEach(cat => {
      counts[cat] = state.products.filter(p => p.category === cat).length;
    });

    container.innerHTML = CATEGORIES.map(cat => {
      const active = state.selectedCategory === cat;
      return `<button type="button" data-action="select-category" data-category="${cat}"
        class="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
          active
            ? 'tab-btn-active'
            : 'bg-slate-900/90 text-slate-300 border border-amber-500/20 hover:border-amber-400/60 hover:text-amber-300'
        }">
        <span>${cat}</span>
        <span class="px-1.5 py-0.5 text-[11px] rounded-full ${
          active ? 'bg-slate-950/25 text-slate-950 font-bold' : 'bg-slate-800 text-amber-300'
        }">${counts[cat] || 0}</span>
      </button>`;
    }).join('');
  }

  // Render Storefront Products (Grid or Quick-Order Rate List Table)
  function renderStoreProducts() {
    const gridContainer = document.getElementById('store-products-grid');
    const tableContainer = document.getElementById('store-products-table-wrap');
    const tableBody = document.getElementById('store-products-tbody');
    const emptyState = document.getElementById('store-empty-state');
    const countLabel = document.getElementById('showing-count-label');

    if (!gridContainer || !tableContainer || !tableBody) return;

    const filtered = getFilteredStoreProducts();
    if (countLabel) {
      countLabel.textContent = `Showing ${filtered.length} of ${state.products.length} items`;
    }

    if (filtered.length === 0) {
      gridContainer.classList.add('hidden');
      tableContainer.classList.add('hidden');
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    if (state.storeViewMode === 'grid') {
      gridContainer.classList.remove('hidden');
      tableContainer.classList.add('hidden');

      gridContainer.innerHTML = filtered.map(prod => {
        const qty = state.cart[prod.id] || 0;
        const hasPrice = Number(prod.price) > 0;
        const mrp = computeMrp(prod.price);
        const canOrder = prod.inStock && hasPrice;

        return `<div class="gold-border-card rounded-2xl p-4 flex flex-col justify-between transition-all relative overflow-hidden">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
                S.No. ${prod.sno}
              </span>
              <div class="flex items-center gap-1.5">
                <span class="px-2 py-0.5 rounded text-[11px] bg-slate-800/90 text-slate-300 border border-slate-700">
                  Page ${prod.page || 1}
                </span>
                ${!prod.inStock ? `<span class="px-2 py-0.5 rounded text-[11px] bg-red-900/70 text-red-200 border border-red-500/40 font-semibold">Out of Stock</span>` : ''}
              </div>
            </div>

            <div class="flex items-center gap-3.5 my-2">
              <div class="w-14 h-14 rounded-xl bg-slate-900/90 border border-amber-500/20 flex items-center justify-center shrink-0">
                ${getCategorySvg(prod.category)}
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-[11px] uppercase tracking-wider text-amber-400/90 font-semibold truncate">${prod.category}</div>
                <h3 class="text-base font-bold text-white leading-snug truncate" title="${prod.name}">${prod.name}</h3>
                <div class="text-xs text-slate-400 mt-0.5">Rate List: <span class="text-slate-300 font-medium">${prod.shortName || prod.name}</span> • Per ${prod.unit || 'Box'}</div>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-end justify-between gap-2">
            <div>
              ${hasPrice ? `
                <div class="text-xs text-slate-400 line-through">MRP ₹${mrp}</div>
                <div class="text-xl font-extrabold text-amber-400">₹${prod.price} <span class="text-xs font-normal text-slate-400">/ ${prod.unit || 'Box'}</span></div>
              ` : `
                <div class="text-xs text-amber-300/80">Special Festival Pack</div>
                <div class="text-sm font-bold text-amber-400">Rate on Request</div>
              `}
            </div>

            <div class="flex items-center gap-1.5">
              ${canOrder ? (
                qty > 0 ? `
                  <div class="flex items-center bg-slate-900 border border-amber-400/50 rounded-xl overflow-hidden">
                    <button type="button" data-action="dec-qty" data-id="${prod.id}" class="px-3 py-1.5 text-amber-300 hover:bg-amber-500/20 font-bold text-sm">-</button>
                    <input type="number" min="0" max="999" value="${qty}" data-action="input-qty" data-id="${prod.id}" aria-label="Quantity for ${prod.name}" class="w-12 text-center bg-transparent text-white font-bold text-sm focus:outline-none"/>
                    <button type="button" data-action="inc-qty" data-id="${prod.id}" class="px-3 py-1.5 text-amber-300 hover:bg-amber-500/20 font-bold text-sm">+</button>
                  </div>
                ` : `
                  <button type="button" data-action="inc-qty" data-id="${prod.id}" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all">
                    + Add
                  </button>
                `
              ) : (
                prod.inStock ? `
                  <button type="button" data-action="enquire-item-rate" data-id="${prod.id}" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                    📞 Enquire Rate
                  </button>
                ` : `
                  <span class="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-500 border border-slate-800 text-xs font-semibold">
                    Unavailable
                  </span>
                `
              )}
            </div>
          </div>
        </div>`;
      }).join('');
    } else {
      // Quick Order Rate-List Table View
      gridContainer.classList.add('hidden');
      tableContainer.classList.remove('hidden');

      tableBody.innerHTML = filtered.map(prod => {
        const qty = state.cart[prod.id] || 0;
        const hasPrice = Number(prod.price) > 0;
        const mrp = computeMrp(prod.price);
        const lineTotal = hasPrice ? qty * Number(prod.price) : 0;
        const canOrder = prod.inStock && hasPrice;

        return `<tr class="border-b border-slate-800/80 hover:bg-slate-900/60 transition-colors ${qty > 0 ? 'bg-amber-500/10' : ''}">
          <td class="py-3 px-3 text-xs sm:text-sm font-bold text-amber-300">#${prod.sno}</td>
          <td class="py-3 px-3">
            <div class="font-semibold text-white text-xs sm:text-sm">${prod.name}</div>
            <div class="text-[11px] text-slate-400">${prod.category} • Page ${prod.page || 1}</div>
          </td>
          <td class="py-3 px-3 text-right text-xs text-slate-400 line-through">${hasPrice ? '₹' + mrp : '–'}</td>
          <td class="py-3 px-3 text-right font-bold text-amber-400 text-sm">${hasPrice ? '₹' + prod.price : 'On Request'}</td>
          <td class="py-3 px-3 text-center">
            ${canOrder ? `
              <div class="inline-flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                <button type="button" data-action="dec-qty" data-id="${prod.id}" class="px-2.5 py-1 text-amber-300 hover:bg-slate-800 font-bold">-</button>
                <input type="number" min="0" max="999" value="${qty}" data-action="input-qty" data-id="${prod.id}" aria-label="Quantity for ${prod.name}" class="w-12 text-center bg-transparent text-white text-xs sm:text-sm font-bold focus:outline-none"/>
                <button type="button" data-action="inc-qty" data-id="${prod.id}" class="px-2.5 py-1 text-amber-300 hover:bg-slate-800 font-bold">+</button>
              </div>
            ` : (
              prod.inStock ? `
                <button type="button" data-action="enquire-item-rate" data-id="${prod.id}" class="text-xs text-amber-300 underline hover:text-amber-200">
                  📞 Enquire Rate
                </button>
              ` : `<span class="text-xs text-red-400">Out of Stock</span>`
            )}
          </td>
          <td class="py-3 px-3 text-right font-bold text-emerald-400 text-xs sm:text-sm">
            ${lineTotal > 0 ? '₹' + lineTotal.toLocaleString('en-IN') : '₹0'}
          </td>
        </tr>`;
      }).join('');
    }
  }

  // Render Cart Bar & Modal Summary
  function renderCartSummary() {
    const details = getCartDetails();
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt('header-cart-count', details.totalCount);
    setTxt('header-cart-total', '₹' + details.totalSale.toLocaleString('en-IN'));
    setTxt('floating-cart-count', details.totalCount + (details.totalCount === 1 ? ' Item' : ' Items'));
    setTxt('floating-cart-total', '₹' + details.totalSale.toLocaleString('en-IN'));
    setTxt('floating-cart-savings', '₹' + details.totalSavings.toLocaleString('en-IN'));

    const floatingBar = document.getElementById('floating-cart-bar');
    if (floatingBar) {
      if (details.totalCount > 0 && state.activeMainView === 'storefront') {
        floatingBar.classList.remove('hidden');
      } else {
        floatingBar.classList.add('hidden');
      }
    }

    // Cart Modal Body
    const modalItemsEl = document.getElementById('cart-modal-items');
    const modalEmptyEl = document.getElementById('cart-modal-empty');
    const modalFooterEl = document.getElementById('cart-modal-footer');

    if (modalItemsEl && modalEmptyEl && modalFooterEl) {
      if (details.items.length === 0) {
        modalItemsEl.innerHTML = '';
        modalEmptyEl.classList.remove('hidden');
        modalFooterEl.classList.add('hidden');
      } else {
        modalEmptyEl.classList.add('hidden');
        modalFooterEl.classList.remove('hidden');
        modalItemsEl.innerHTML = details.items.map(item => `
          <div class="flex items-center justify-between gap-3 py-3 border-b border-slate-800">
            <div class="min-w-0 flex-1">
              <div class="text-xs text-amber-300 font-semibold">S.No. ${item.sno}</div>
              <div class="text-sm font-bold text-white truncate">${item.name}</div>
              <div class="text-xs text-slate-400">₹${item.price} × ${item.qty} ${item.unit}</div>
            </div>
            <div class="flex items-center gap-2">
              <div class="flex items-center bg-slate-900 border border-slate-700 rounded-lg">
                <button type="button" data-action="dec-qty" data-id="${item.id}" class="px-2.5 py-1 text-amber-300 font-bold">-</button>
                <span class="px-2 text-xs font-bold text-white">${item.qty}</span>
                <button type="button" data-action="inc-qty" data-id="${item.id}" class="px-2.5 py-1 text-amber-300 font-bold">+</button>
              </div>
              <div class="w-20 text-right font-bold text-amber-400 text-sm">₹${item.lineTotal.toLocaleString('en-IN')}</div>
            </div>
          </div>
        `).join('');

        setTxt('cart-modal-mrp', '₹' + details.totalMrp.toLocaleString('en-IN'));
        setTxt('cart-modal-savings', '-₹' + details.totalSavings.toLocaleString('en-IN'));
        setTxt('cart-modal-grand-total', '₹' + details.totalSale.toLocaleString('en-IN'));
      }
    }
  }

  // Render Owner-Only Admin Dashboard
  function renderDashboard() {
    if (!state.isAdminAuthenticated) return;

    // KPI metrics
    const totalProds = state.products.length;
    const inStockCount = state.products.filter(p => p.inStock).length;
    const unpricedCount = state.products.filter(p => Number(p.price) <= 0).length;
    const pricedProds = state.products.filter(p => Number(p.price) > 0);
    const avgPrice = pricedProds.length > 0
      ? Math.round(pricedProds.reduce((acc, p) => acc + Number(p.price), 0) / pricedProds.length)
      : 0;

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setTxt('kpi-total-products', totalProds);
    setTxt('kpi-instock-products', `${inStockCount} Active`);
    setTxt('kpi-unpriced-products', unpricedCount);
    setTxt('kpi-avg-price', '₹' + avgPrice);
    setTxt('kpi-total-orders', state.orders.length);

    // Dashboard sub-tab visibility
    ['products', 'orders', 'settings', 'vscode'].forEach(tab => {
      const panel = document.getElementById(`dash-panel-${tab}`);
      const btn = document.getElementById(`dash-tab-btn-${tab}`);
      if (panel) {
        panel.classList.toggle('hidden', state.dashboardTab !== tab);
      }
      if (btn) {
        if (state.dashboardTab === tab) {
          btn.className = 'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold tab-btn-active transition-all';
        } else {
          btn.className = 'px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-400/50 transition-all';
        }
      }
    });

    // Filter dashboard products
    const dq = state.dashSearch.trim().toLowerCase();
    const dashFiltered = state.products.filter(p => {
      if (state.dashCategory !== 'All' && p.category !== state.dashCategory) return false;
      if (state.dashStockFilter === 'instock' && !p.inStock) return false;
      if (state.dashStockFilter === 'outofstock' && p.inStock) return false;
      if (state.dashStockFilter === 'unpriced' && Number(p.price) > 0) return false;
      if (dq) {
        const mName = (p.name || '').toLowerCase().includes(dq);
        const mShort = (p.shortName || '').toLowerCase().includes(dq);
        const mSno = String(p.sno) === dq;
        if (!mName && !mShort && !mSno) return false;
      }
      return true;
    }).sort((a, b) => (a.sno || 0) - (b.sno || 0));

    const dashTbody = document.getElementById('dash-products-tbody');
    if (dashTbody) {
      dashTbody.innerHTML = dashFiltered.map(prod => `
        <tr class="border-b border-slate-800/80 hover:bg-slate-900/70 transition-colors">
          <td class="py-2.5 px-3 font-bold text-amber-300 text-xs sm:text-sm">#${prod.sno}</td>
          <td class="py-2.5 px-3">
            <input type="text" value="${(prod.name || '').replace(/"/g, '&quot;')}"
              data-action="inline-edit-name" data-id="${prod.id}" aria-label="Product name for S.No. ${prod.sno}"
              class="w-full min-w-[160px] bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-white font-medium focus:outline-none"/>
          </td>
          <td class="py-2.5 px-3">
            <select data-action="inline-edit-category" data-id="${prod.id}" aria-label="Category for S.No. ${prod.sno}"
              class="bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none">
              ${CATEGORIES.slice(1).map(cat => `<option value="${cat}" ${prod.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
            </select>
          </td>
          <td class="py-2.5 px-3">
            <div class="flex items-center gap-1 justify-end">
              <span class="text-xs text-amber-400 font-bold">₹</span>
              <input type="number" min="0" max="99999" value="${prod.price}"
                data-action="inline-edit-price" data-id="${prod.id}" aria-label="Price for S.No. ${prod.sno}"
                class="w-24 text-right bg-slate-900/90 border ${Number(prod.price) > 0 ? 'border-slate-700 text-amber-300' : 'border-amber-500/70 text-amber-200'} focus:border-amber-400 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-bold focus:outline-none"/>
            </div>
          </td>
          <td class="py-2.5 px-3 text-center">
            <button type="button" data-action="toggle-stock" data-id="${prod.id}"
              class="px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                prod.inStock
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
              }">
              ${prod.inStock ? 'In Stock' : 'Out of Stock'}
            </button>
          </td>
          <td class="py-2.5 px-3 text-right whitespace-nowrap">
            <button type="button" data-action="open-edit-modal" data-id="${prod.id}"
              class="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold mr-1">
              Edit Details
            </button>
            <button type="button" data-action="open-delete-modal" data-id="${prod.id}"
              class="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-semibold">
              Delete
            </button>
          </td>
        </tr>
      `).join('');
    }

    // Orders table
    const ordersContainer = document.getElementById('dash-orders-list');
    if (ordersContainer) {
      if (state.orders.length === 0) {
        ordersContainer.innerHTML = `<div class="text-center py-10 text-slate-400 text-sm">No customer orders recorded yet.</div>`;
      } else {
        ordersContainer.innerHTML = state.orders.map((ord, idx) => `
          <div class="gold-border-card rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2.5">
                <span class="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs">${ord.id}</span>
                <span class="font-bold text-white text-sm">${ord.customerName}</span>
                <span class="text-xs text-slate-400">• 📞 ${ord.phone}</span>
              </div>
              <div class="text-xs text-slate-400 mt-1">${ord.mode} • ${ord.date}</div>
              <div class="text-xs text-slate-300 mt-2">
                ${ord.items.map(i => `<span class="inline-block bg-slate-900 border border-slate-800 rounded px-2 py-0.5 mr-1.5 mb-1">#${i.sno} ${i.name} × ${i.qty}</span>`).join('')}
              </div>
            </div>
            <div class="flex items-center gap-3 self-end sm:self-center">
              <div class="text-right">
                <div class="text-xs text-slate-400">Order Total</div>
                <div class="text-lg font-extrabold text-amber-400">₹${Number(ord.total).toLocaleString('en-IN')}</div>
              </div>
              <select data-action="order-status-change" data-index="${idx}" aria-label="Order status for ${ord.id}"
                class="bg-slate-900 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-300">
                ${['Pending', 'Confirmed', 'Packed', 'Completed'].map(st => `<option value="${st}" ${ord.status === st ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
            </div>
          </div>
        `).join('');
      }
    }

    // Populate Store Settings inputs
    const s = state.settings;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && document.activeElement !== el) el.value = val;
    };
    setVal('setting-store-name', s.storeName || '');
    setVal('setting-telugu-name', s.teluguName || '');
    setVal('setting-tagline', s.tagline || '');
    setVal('setting-discount', s.discountPercent || 70);
    setVal('setting-phone1', s.phone1 || '');
    setVal('setting-phone2', s.phone2 || '');
    setVal('setting-whatsapp', s.whatsappNumber || '');
    setVal('setting-location', s.location || '');
    setVal('setting-admin-pin', s.adminPin || 'shiva2026');

    // Populate GitHub Publisher inputs
    setVal('gh-repo-input', state.ghConfig.repo || '');
    setVal('gh-branch-input', state.ghConfig.branch || 'main');
    setVal('gh-path-input', state.ghConfig.path || 'js/products.js');
    setVal('gh-token-input', state.ghConfig.token || '');

    // Populate VS Code export preview
    const exportArea = document.getElementById('vscode-export-textarea');
    if (exportArea) {
      exportArea.value = `// Updated products.js generated from Shivashakti Crackers Owner Dashboard\nwindow.INITIAL_STORE_SETTINGS = ${JSON.stringify(state.settings, null, 2)};\n\nwindow.INITIAL_PRODUCTS = ${JSON.stringify(state.products, null, 2)};\n`;
    }
  }

  function renderMainViewToggle() {
    if (!state.isAdminAuthenticated && state.activeMainView === 'dashboard') {
      state.activeMainView = 'storefront';
    }

    const storeSection = document.getElementById('view-storefront');
    const dashSection = document.getElementById('view-dashboard');
    const adminToolbar = document.getElementById('owner-admin-toolbar');
    const btnStore = document.getElementById('nav-btn-storefront');
    const btnDash = document.getElementById('nav-btn-dashboard');

    if (storeSection && dashSection) {
      storeSection.classList.toggle('hidden', state.activeMainView !== 'storefront');
      dashSection.classList.toggle('hidden', !(state.isAdminAuthenticated && state.activeMainView === 'dashboard'));
    }

    if (adminToolbar) {
      adminToolbar.classList.toggle('hidden', !state.isAdminAuthenticated);
    }

    if (btnStore && btnDash && state.isAdminAuthenticated) {
      if (state.activeMainView === 'storefront') {
        btnStore.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold tab-btn-active transition-all';
        btnDash.className = 'px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900 text-amber-300 border border-amber-500/40 hover:border-amber-400 transition-all';
      } else {
        btnDash.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold tab-btn-active transition-all';
        btnStore.className = 'px-3.5 py-1.5 rounded-xl text-xs font-medium bg-slate-900 text-slate-300 border border-amber-500/30 hover:border-amber-400 transition-all';
      }
    }
  }

  function renderAll() {
    renderBrandDetails();
    renderMainViewToggle();
    renderCategoryPills();
    renderStoreProducts();
    renderCartSummary();
    renderDashboard();
  }

  // Open Product Add/Edit Modal (Owner Only)
  function openProductModal(productId) {
    if (!state.isAdminAuthenticated) {
      openAdminLoginModal();
      return;
    }
    const modal = document.getElementById('product-form-modal');
    const titleEl = document.getElementById('product-modal-title');
    if (!modal || !titleEl) return;

    if (productId) {
      const prod = state.products.find(p => p.id === Number(productId));
      if (!prod) return;
      state.editingProductId = prod.id;
      titleEl.textContent = `Edit Product (S.No. ${prod.sno})`;
      document.getElementById('modal-prod-sno').value = prod.sno;
      document.getElementById('modal-prod-name').value = prod.name;
      document.getElementById('modal-prod-short').value = prod.shortName || prod.name;
      document.getElementById('modal-prod-category').value = prod.category;
      document.getElementById('modal-prod-price').value = prod.price;
      document.getElementById('modal-prod-unit').value = prod.unit || 'Box';
      document.getElementById('modal-prod-page').value = prod.page || 1;
      document.getElementById('modal-prod-instock').checked = Boolean(prod.inStock);
    } else {
      state.editingProductId = null;
      const nextSno = state.products.reduce((max, p) => Math.max(max, Number(p.sno) || 0), 0) + 1;
      titleEl.textContent = 'Add New Cracker Product';
      document.getElementById('modal-prod-sno').value = nextSno;
      document.getElementById('modal-prod-name').value = '';
      document.getElementById('modal-prod-short').value = '';
      document.getElementById('modal-prod-category').value = 'Sparklers';
      document.getElementById('modal-prod-price').value = '';
      document.getElementById('modal-prod-unit').value = 'Box';
      document.getElementById('modal-prod-page').value = 3;
      document.getElementById('modal-prod-instock').checked = true;
    }

    modal.classList.remove('hidden');
  }

  function closeProductModal() {
    const modal = document.getElementById('product-form-modal');
    if (modal) modal.classList.add('hidden');
    state.editingProductId = null;
  }

  function saveProductFromModal(e) {
    e.preventDefault();
    if (!state.isAdminAuthenticated) return;
    const sno = parseInt(document.getElementById('modal-prod-sno').value, 10) || 1;
    const name = document.getElementById('modal-prod-name').value.trim();
    const shortName = document.getElementById('modal-prod-short').value.trim() || name;
    const category = document.getElementById('modal-prod-category').value;
    const price = Math.max(0, parseFloat(document.getElementById('modal-prod-price').value) || 0);
    const unit = document.getElementById('modal-prod-unit').value.trim() || 'Box';
    const page = parseInt(document.getElementById('modal-prod-page').value, 10) || 1;
    const inStock = document.getElementById('modal-prod-instock').checked;

    if (!name) {
      showToast('Please enter a product name', 'error');
      return;
    }

    if (state.editingProductId) {
      const prod = state.products.find(p => p.id === Number(state.editingProductId));
      if (prod) {
        prod.sno = sno;
        prod.name = name;
        prod.shortName = shortName;
        prod.category = category;
        prod.price = price;
        prod.unit = unit;
        prod.page = page;
        prod.inStock = inStock;
        showToast(`Updated S.No. ${sno}: ${name}`);
      }
    } else {
      const newId = state.products.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1;
      state.products.push({
        id: newId,
        sno,
        name,
        shortName,
        category,
        price,
        unit,
        page,
        inStock,
        featured: false
      });
      showToast(`Added S.No. ${sno}: ${name}`);
    }

    closeProductModal();
    persistProducts();
  }

  // Format WhatsApp / Order text
  function buildOrderMessage(customerName, customerPhone, deliveryMode) {
    const details = getCartDetails();
    const lines = [
      `🎆 *${state.settings.storeName || 'SHIVASHAKTI CRACKERS'} - DIWALI ORDER* 🎆`,
      `📍 ${state.settings.location || 'Chintal Basti, Khairatabad'}`,
      `--------------------------------`,
      `👤 *Customer:* ${customerName || 'Walk-in Customer'}`,
      `📞 *Phone:* ${customerPhone || 'N/A'}`,
      `🛍️ *Mode:* ${deliveryMode || 'Store Pickup'}`,
      `--------------------------------`,
      `*Items Ordered:*`
    ];

    details.items.forEach(item => {
      lines.push(`${item.sno}. ${item.name} — ${item.qty} ${item.unit} × ₹${item.price} = *₹${item.lineTotal}*`);
    });

    lines.push(`--------------------------------`);
    lines.push(`💰 *Total MRP:* ₹${details.totalMrp}`);
    lines.push(`🎉 *Diwali Savings (${state.settings.discountPercent || 70}% OFF):* -₹${details.totalSavings}`);
    lines.push(`✅ *Net Payable Total:* *₹${details.totalSale}*`);
    lines.push(`--------------------------------`);
    lines.push(`📞 Store Enquiries: ${state.settings.phone1} | ${state.settings.phone2}`);
    return lines.join('\n');
  }

  // Copy text helper with fallback
  function copyTextToClipboard(text, successMsg) {
    const fallbackCopy = () => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast(successMsg || 'Copied to clipboard!');
      } catch (err) {
        showToast('Copy failed', 'error');
      }
      document.body.removeChild(ta);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg || 'Copied to clipboard!');
      }).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  }

  // Ambient Fireworks Canvas Animation
  function initFireworksCanvas() {
    const canvas = document.getElementById('hero-fireworks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    const particles = [];

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width || window.innerWidth;
      height = canvas.height = rect.height || 360;
    }

    resize();
    window.addEventListener('resize', resize);

    const colors = ['#fde047', '#fbbf24', '#f87171', '#38bdf8', '#c084fc', '#4ade80'];

    function spawnBurst() {
      const x = Math.random() * width;
      const y = 40 + Math.random() * (height * 0.55);
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 24; i++) {
        const angle = (Math.PI * 2 * i) / 24;
        const speed = 0.8 + Math.random() * 2.2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color,
          radius: 1.5 + Math.random() * 1.5
        });
      }
    }

    spawnBurst();
    spawnBurst();

    function animate() {
      ctx.clearRect(0, 0, width, height);
      if (Math.random() < 0.035 && particles.length < 180) {
        spawnBurst();
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.025;
        p.alpha -= 0.014;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  // Check URL hash for #admin owner entry
  function checkHashRoute() {
    if (window.location.hash === '#admin' || window.FORCE_ADMIN_LOGIN_PROMPT) {
      if (state.isAdminAuthenticated) {
        state.activeMainView = 'dashboard';
        renderAll();
      } else {
        openAdminLoginModal();
      }
    }
  }

  // Attach Event Listeners
  function bindEvents() {
    window.addEventListener('hashchange', checkHashRoute);

    // Secret Owner Trigger: 3 rapid clicks on the VM Creations badge opens Owner Login
    const logoBadge = document.getElementById('vm-logo-secret-trigger');
    if (logoBadge) {
      logoBadge.addEventListener('click', function () {
        state.logoClickCount += 1;
        if (state.logoClickTimer) clearTimeout(state.logoClickTimer);
        if (state.logoClickCount >= 3) {
          state.logoClickCount = 0;
          openAdminLoginModal();
        } else {
          state.logoClickTimer = setTimeout(() => {
            state.logoClickCount = 0;
          }, 1200);
        }
      });
    }

    // Delegated click listener
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');

      if (action === 'switch-main-view') {
        const targetView = btn.getAttribute('data-view');
        if (targetView === 'dashboard' && !state.isAdminAuthenticated) {
          openAdminLoginModal();
          return;
        }
        state.activeMainView = targetView;
        renderAll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (action === 'open-admin-login') {
        openAdminLoginModal();
      } else if (action === 'close-admin-login') {
        closeAdminLoginModal();
      } else if (action === 'admin-logout') {
        logoutAdmin();
      } else if (action === 'select-category') {
        state.selectedCategory = btn.getAttribute('data-category');
        renderCategoryPills();
        renderStoreProducts();
      } else if (action === 'set-store-view') {
        state.storeViewMode = btn.getAttribute('data-mode');
        const btnGrid = document.getElementById('btn-view-grid');
        const btnTable = document.getElementById('btn-view-table');
        if (btnGrid && btnTable) {
          btnGrid.className = state.storeViewMode === 'grid'
            ? 'px-3 py-1.5 rounded-lg text-xs font-bold tab-btn-active'
            : 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white';
          btnTable.className = state.storeViewMode === 'table'
            ? 'px-3 py-1.5 rounded-lg text-xs font-bold tab-btn-active'
            : 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white';
        }
        renderStoreProducts();
      } else if (action === 'inc-qty') {
        adjustCartQty(btn.getAttribute('data-id'), 1);
      } else if (action === 'dec-qty') {
        adjustCartQty(btn.getAttribute('data-id'), -1);
      } else if (action === 'enquire-item-rate') {
        const id = Number(btn.getAttribute('data-id'));
        const prod = state.products.find(p => p.id === id);
        if (prod) {
          const waNum = (state.settings.whatsappNumber || '919121859929').replace(/\D/g, '');
          const text = `Hi Shivashakti Crackers! Please share the Diwali rate and availability for S.No. ${prod.sno}: ${prod.name}.`;
          window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
        }
      } else if (action === 'clear-cart') {
        clearCart();
      } else if (action === 'open-cart-modal') {
        document.getElementById('cart-drawer-modal').classList.remove('hidden');
        renderCartSummary();
      } else if (action === 'close-cart-modal') {
        document.getElementById('cart-drawer-modal').classList.add('hidden');
      } else if (action === 'open-poster-modal') {
        document.getElementById('official-media-modal').classList.remove('hidden');
      } else if (action === 'close-poster-modal') {
        document.getElementById('official-media-modal').classList.add('hidden');
      } else if (action === 'switch-dash-tab') {
        if (!state.isAdminAuthenticated) return;
        state.dashboardTab = btn.getAttribute('data-tab');
        renderDashboard();
      } else if (action === 'open-add-modal') {
        openProductModal(null);
      } else if (action === 'open-edit-modal') {
        openProductModal(btn.getAttribute('data-id'));
      } else if (action === 'close-product-modal') {
        closeProductModal();
      } else if (action === 'toggle-stock') {
        if (!state.isAdminAuthenticated) return;
        const id = Number(btn.getAttribute('data-id'));
        const prod = state.products.find(p => p.id === id);
        if (prod) {
          prod.inStock = !prod.inStock;
          persistProducts();
          showToast(`${prod.name} marked as ${prod.inStock ? 'In Stock' : 'Out of Stock'}`);
        }
      } else if (action === 'open-delete-modal') {
        if (!state.isAdminAuthenticated) return;
        const id = Number(btn.getAttribute('data-id'));
        const prod = state.products.find(p => p.id === id);
        if (prod) {
          state.deletingProductId = id;
          document.getElementById('delete-prod-name').textContent = `S.No. ${prod.sno} - ${prod.name}`;
          document.getElementById('delete-confirm-modal').classList.remove('hidden');
        }
      } else if (action === 'close-delete-modal') {
        state.deletingProductId = null;
        document.getElementById('delete-confirm-modal').classList.add('hidden');
      } else if (action === 'confirm-delete-product') {
        if (!state.isAdminAuthenticated) return;
        if (state.deletingProductId !== null) {
          state.products = state.products.filter(p => p.id !== Number(state.deletingProductId));
          delete state.cart[state.deletingProductId];
          state.deletingProductId = null;
          document.getElementById('delete-confirm-modal').classList.add('hidden');
          persistProducts();
          persistCart();
          showToast('Product deleted from catalog');
        }
      } else if (action === 'reset-default-catalog') {
        if (!state.isAdminAuthenticated) return;
        state.products = JSON.parse(JSON.stringify(window.INITIAL_PRODUCTS || []));
        state.settings = JSON.parse(JSON.stringify(window.INITIAL_STORE_SETTINGS || {}));
        persistProducts();
        persistSettings();
        showToast('Restored all 68 official Shivashakti Crackers rate list items!');
      } else if (action === 'filter-unpriced-btn') {
        if (!state.isAdminAuthenticated) return;
        state.dashStockFilter = state.dashStockFilter === 'unpriced' ? 'all' : 'unpriced';
        const sel = document.getElementById('dash-stock-filter');
        if (sel) sel.value = state.dashStockFilter;
        renderDashboard();
      } else if (action === 'copy-vscode-js') {
        const ta = document.getElementById('vscode-export-textarea');
        if (ta) copyTextToClipboard(ta.value, 'Copied updated products.js code for VS Code!');
      } else if (action === 'download-products-json') {
        const content = document.getElementById('vscode-export-textarea').value;
        const blob = new Blob([content], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'products.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Downloaded updated products.js file!');
      } else if (action === 'send-whatsapp-order') {
        const details = getCartDetails();
        if (details.items.length === 0) {
          showToast('Your cart is empty', 'error');
          return;
        }
        const name = document.getElementById('cust-name-input').value.trim() || 'Diwali Customer';
        const phone = document.getElementById('cust-phone-input').value.trim() || 'Not provided';
        const mode = document.getElementById('cust-mode-select').value;
        const msg = buildOrderMessage(name, phone, mode);

        const newOrdId = 'ORD-' + (1001 + state.orders.length);
        state.orders.unshift({
          id: newOrdId,
          customerName: name,
          phone: phone,
          mode: mode,
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          status: 'Pending',
          items: details.items.map(i => ({ sno: i.sno, name: i.name, qty: i.qty, price: i.price })),
          total: details.totalSale
        });
        persistOrders();

        const waNum = (state.settings.whatsappNumber || '919121859929').replace(/\D/g, '');
        const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        showToast(`Order ${newOrdId} placed & opening WhatsApp!`);
      } else if (action === 'copy-order-bill') {
        const name = document.getElementById('cust-name-input').value.trim() || 'Diwali Customer';
        const phone = document.getElementById('cust-phone-input').value.trim() || 'Not provided';
        const mode = document.getElementById('cust-mode-select').value;
        const msg = buildOrderMessage(name, phone, mode);
        copyTextToClipboard(msg, 'Order estimate bill copied to clipboard!');
      } else if (action === 'save-order-to-dashboard') {
        const details = getCartDetails();
        if (details.items.length === 0) return;
        const name = document.getElementById('cust-name-input').value.trim() || 'Walk-in Customer';
        const phone = document.getElementById('cust-phone-input').value.trim() || 'N/A';
        const mode = document.getElementById('cust-mode-select').value;
        const newOrdId = 'ORD-' + (1001 + state.orders.length);
        state.orders.unshift({
          id: newOrdId,
          customerName: name,
          phone: phone,
          mode: mode,
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          status: 'Confirmed',
          items: details.items.map(i => ({ sno: i.sno, name: i.name, qty: i.qty, price: i.price })),
          total: details.totalSale
        });
        persistOrders();
        clearCart();
        document.getElementById('cart-drawer-modal').classList.add('hidden');
        showToast(`Thank you! Order ${newOrdId} has been submitted.`);
      } else if (action === 'reset-store-filters') {
        state.selectedCategory = 'All';
        state.searchQuery = '';
        state.pageFilter = 'all';
        state.sortBy = 'sno-asc';
        document.getElementById('store-search-input').value = '';
        document.getElementById('store-page-filter').value = 'all';
        document.getElementById('store-sort-select').value = 'sno-asc';
        renderAll();
      }
    });

    // Owner Login Form Submit
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const entered = document.getElementById('admin-login-password').value.trim();
        const validPin = state.settings.adminPin || 'shiva2026';
        const errEl = document.getElementById('admin-login-error');

        if (entered === validPin) {
          state.isAdminAuthenticated = true;
          state.activeMainView = 'dashboard';
          saveStorage(STORAGE_KEYS.ADMIN_SESSION, true);
          closeAdminLoginModal();
          renderAll();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showToast('Welcome, Store Owner! Admin Dashboard unlocked.');
        } else {
          if (errEl) errEl.classList.remove('hidden');
          showToast('Invalid Owner Password', 'error');
        }
      });
    }

    // GitHub Direct Cloud Publish Form
    const ghForm = document.getElementById('github-publish-form');
    if (ghForm) {
      ghForm.addEventListener('submit', publishToGitHubPages);
    }

    // Input & Change listeners
    document.addEventListener('input', function (e) {
      const t = e.target;
      if (t.id === 'store-search-input') {
        state.searchQuery = t.value;
        renderStoreProducts();
      } else if (t.id === 'dash-search-input') {
        state.dashSearch = t.value;
        renderDashboard();
      }
    });

    document.addEventListener('change', function (e) {
      const t = e.target;
      const action = t.getAttribute('data-action');

      if (t.id === 'store-sort-select') {
        state.sortBy = t.value;
        renderStoreProducts();
      } else if (t.id === 'store-page-filter') {
        state.pageFilter = t.value;
        renderStoreProducts();
      } else if (t.id === 'dash-category-filter') {
        state.dashCategory = t.value;
        renderDashboard();
      } else if (t.id === 'dash-stock-filter') {
        state.dashStockFilter = t.value;
        renderDashboard();
      } else if (action === 'input-qty') {
        setCartQty(t.getAttribute('data-id'), t.value);
      } else if (action === 'inline-edit-name') {
        if (!state.isAdminAuthenticated) return;
        const prod = state.products.find(p => p.id === Number(t.getAttribute('data-id')));
        if (prod && t.value.trim()) {
          prod.name = t.value.trim();
          persistProducts();
          showToast(`Updated name for S.No. ${prod.sno}`);
        }
      } else if (action === 'inline-edit-category') {
        if (!state.isAdminAuthenticated) return;
        const prod = state.products.find(p => p.id === Number(t.getAttribute('data-id')));
        if (prod) {
          prod.category = t.value;
          persistProducts();
          showToast(`Moved S.No. ${prod.sno} to ${t.value}`);
        }
      } else if (action === 'inline-edit-price') {
        if (!state.isAdminAuthenticated) return;
        const prod = state.products.find(p => p.id === Number(t.getAttribute('data-id')));
        if (prod) {
          prod.price = Math.max(0, parseFloat(t.value) || 0);
          persistProducts();
          showToast(`Updated S.No. ${prod.sno} price to ₹${prod.price}`);
        }
      } else if (action === 'order-status-change') {
        if (!state.isAdminAuthenticated) return;
        const idx = Number(t.getAttribute('data-index'));
        if (state.orders[idx]) {
          state.orders[idx].status = t.value;
          persistOrders();
          showToast(`Order ${state.orders[idx].id} marked as ${t.value}`);
        }
      }
    });

    // Product Add/Edit Form submit
    const prodForm = document.getElementById('product-modal-form');
    if (prodForm) {
      prodForm.addEventListener('submit', saveProductFromModal);
    }

    // Store Settings Form submit
    const settingsForm = document.getElementById('store-settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!state.isAdminAuthenticated) return;
        state.settings.storeName = document.getElementById('setting-store-name').value.trim() || 'SHIVASHAKTI CRACKERS';
        state.settings.teluguName = document.getElementById('setting-telugu-name').value.trim() || 'శివశక్తి క్రాకర్స్';
        state.settings.tagline = document.getElementById('setting-tagline').value.trim();
        state.settings.discountPercent = Math.min(90, Math.max(0, parseInt(document.getElementById('setting-discount').value, 10) || 70));
        state.settings.phone1 = document.getElementById('setting-phone1').value.trim();
        state.settings.phone2 = document.getElementById('setting-phone2').value.trim();
        state.settings.whatsappNumber = document.getElementById('setting-whatsapp').value.trim();
        state.settings.location = document.getElementById('setting-location').value.trim();
        const newPin = document.getElementById('setting-admin-pin').value.trim();
        if (newPin) state.settings.adminPin = newPin;
        persistSettings();
        showToast('Store settings & Owner Password saved!');
      });
    }

    // Bulk Price Adjustment Form
    const bulkForm = document.getElementById('bulk-price-form');
    if (bulkForm) {
      bulkForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!state.isAdminAuthenticated) return;
        const pct = parseFloat(document.getElementById('bulk-pct-input').value) || 0;
        if (pct === 0) {
          showToast('Enter a non-zero percentage (e.g. 10 or -10)', 'error');
          return;
        }
        state.products.forEach(p => {
          if (Number(p.price) > 0) {
            p.price = Math.max(5, Math.round(Number(p.price) * (1 + pct / 100)));
          }
        });
        document.getElementById('bulk-pct-input').value = '';
        persistProducts();
        showToast(`Adjusted all product prices by ${pct > 0 ? '+' : ''}${pct}%`);
      });
    }
  }

  window.addEventListener('DOMContentLoaded', function () {
    bindEvents();
    renderAll();
    initFireworksCanvas();
    checkHashRoute();
  });
})();
