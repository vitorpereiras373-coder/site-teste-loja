(function () {
  'use strict';

  /* ===========================
     DYNAMIC OPEN/CLOSED BADGE
  =========================== */
  var heroBadge = document.querySelector('.hero-badge');
  if (heroBadge) {
    var now = new Date();
    var hour = now.getHours();
    // Open every day from 18:00 onwards
    var isOpen = hour >= 18;
    if (isOpen) {
      heroBadge.textContent = '🔥 Aberto agora • A partir das 18h';
    } else {
      heroBadge.textContent = '🕐 Fechado agora • Abrimos às 18h';
      heroBadge.style.background = 'rgba(100,100,100,0.2)';
      heroBadge.style.borderColor = 'rgba(150,150,150,0.4)';
    }
  }

  /* ===========================
     NAVBAR SCROLL EFFECT
  =========================== */
  var header = document.querySelector('.header');

  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ===========================
     FADE-IN ON SCROLL
  =========================== */
  var fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window && fadeEls.length > 0) {
    /* Trigger fade-in when at least 12% of the element is visible */
  var FADE_IN_THRESHOLD = 0.12;
  var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: FADE_IN_THRESHOLD });

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ===========================
     MOBILE MENU
  =========================== */
  var hamburgerBtn = document.getElementById('hamburgerBtn');
  var navLinks = document.getElementById('navLinks');

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      hamburgerBtn.classList.toggle('active', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburgerBtn.classList.remove('active');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ===========================
     CATEGORY FILTER
  =========================== */
  var filterButtons = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('.card');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var category = btn.getAttribute('data-category');

      // Update active button
      filterButtons.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Show/hide cards
      cards.forEach(function (card) {
        if (category === 'todos' || card.getAttribute('data-category') === category) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ===========================
     CART STATE
  =========================== */
  var cart = [];

  function findCartItem(name) {
    return cart.find(function (item) { return item.name === name; });
  }

  function updateCartCount() {
    var total = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    var countEl = document.getElementById('cartCount');
    if (countEl) {
      countEl.textContent = String(total);
      countEl.setAttribute('data-empty', total === 0 ? 'true' : 'false');
    }
  }

  function formatPrice(value) {
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  }

  /* ===========================
     RENDER CART
  =========================== */
  function renderCart() {
    var itemsContainer = document.getElementById('cartItems');
    var summaryEl = document.getElementById('cartSummary');
    if (!itemsContainer) return;

    if (cart.length === 0) {
      itemsContainer.innerHTML = '<p class="cart-empty">Seu carrinho está vazio 😕</p>';
      if (summaryEl) summaryEl.style.display = 'none';
      return;
    }

    var html = '';
    cart.forEach(function (item) {
      html += '<div class="cart-item" data-name="' + escapeAttr(item.name) + '">';
      html += '  <div class="cart-item-info">';
      html += '    <div class="cart-item-name">' + escapeHtml(item.name) + '</div>';
      html += '    <div class="cart-item-price">' + formatPrice(item.price * item.qty) + '</div>';
      html += '  </div>';
      html += '  <div class="cart-item-qty">';
      html += '    <button class="qty-btn qty-dec" aria-label="Diminuir quantidade de ' + escapeAttr(item.name) + '">−</button>';
      html += '    <span class="qty-value" aria-label="Quantidade">' + item.qty + '</span>';
      html += '    <button class="qty-btn qty-inc" aria-label="Aumentar quantidade de ' + escapeAttr(item.name) + '">+</button>';
      html += '  </div>';
      html += '  <button class="remove-btn" aria-label="Remover ' + escapeAttr(item.name) + ' do carrinho">🗑</button>';
      html += '</div>';
    });

    itemsContainer.innerHTML = html;

    if (summaryEl) {
      var totalEl = document.getElementById('cartTotal');
      var grandTotal = cart.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
      if (totalEl) totalEl.textContent = formatPrice(grandTotal);
      summaryEl.style.display = 'block';
    }

    // Bind quantity and remove buttons
    itemsContainer.querySelectorAll('.cart-item').forEach(function (row) {
      var name = row.getAttribute('data-name');

      row.querySelector('.qty-inc').addEventListener('click', function () {
        changeQty(name, 1);
      });
      row.querySelector('.qty-dec').addEventListener('click', function () {
        changeQty(name, -1);
      });
      row.querySelector('.remove-btn').addEventListener('click', function () {
        removeItem(name);
      });
    });
  }

  function changeQty(name, delta) {
    var item = findCartItem(name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(function (i) { return i.name !== name; });
    }
    updateCartCount();
    renderCart();
  }

  function removeItem(name) {
    cart = cart.filter(function (i) { return i.name !== name; });
    updateCartCount();
    renderCart();
  }

  /* ===========================
     ADD TO CART BUTTONS
  =========================== */
  document.querySelectorAll('.add-to-cart').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var name = btn.getAttribute('data-name');
      var price = parseFloat(btn.getAttribute('data-price'));
      if (!name || isNaN(price)) return;

      var existing = findCartItem(name);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ name: name, price: price, qty: 1 });
      }

      updateCartCount();

      // Visual feedback
      var original = btn.textContent;
      btn.textContent = '✓ Adicionado!';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
      }, 1200);
    });
  });

  /* ===========================
     CART OPEN / CLOSE
  =========================== */
  var cartFab = document.getElementById('cartFab');
  var cartOverlay = document.getElementById('cartOverlay');
  var cartClose = document.getElementById('cartClose');

  function openCart() {
    renderCart();
    cartOverlay.classList.add('open');
    cartOverlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartOverlay.classList.remove('open');
    cartOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (cartFab) cartFab.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);

  if (cartOverlay) {
    cartOverlay.addEventListener('click', function (e) {
      if (e.target === cartOverlay) closeCart();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && cartOverlay && cartOverlay.classList.contains('open')) {
      closeCart();
    }
  });

  /* ===========================
     CHECKOUT VIA WHATSAPP
  =========================== */
  var checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
      if (cart.length === 0) return;

      var lines = cart.map(function (item) {
        return '- ' + item.name + ' x' + item.qty + ' - ' + formatPrice(item.price * item.qty);
      });
      var total = cart.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);

      var message =
        'Olá! Gostaria de fazer um pedido:\n' +
        lines.join('\n') +
        '\nTotal: ' + formatPrice(total);

      var url = 'https://wa.me/5599724970?text=' + encodeURIComponent(message);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  /* ===========================
     SECURITY HELPERS
  =========================== */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ===========================
     INITIALISE
  =========================== */
  updateCartCount();
  cartOverlay && cartOverlay.setAttribute('aria-hidden', 'true');

})();
