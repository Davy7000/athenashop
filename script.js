/* =========================================================
   OrangeTech — script.js
   Slider auto, recherche instantanée, panier, menu mobile
   ========================================================= */

(() => {
  'use strict';

  /* ---------------------------------------------------------
     1. DONNÉES PRODUITS
     Modifiable facilement : ajouter/retirer un objet du tableau.
  --------------------------------------------------------- */
 const PRODUCTS = [
    {
      id: 'p1',
      title: 'Rolex pour homme en promotion',
      category: 'cuisine',
      categoryLabel: 'Montre',
      image: 'images/rolexhommejs.jpeg',
      price: 12000,
      oldPrice: 15000,
      rating: 4.5,
      reviews: 128,
      badge: 'Promo'
    },
    {
      id: 'p2',
      title: 'Robe pour femme',
      category: 'informatique',
      categoryLabel: 'Vêtements',
      image: 'images/robejs.jpeg',
      price: 5000,
      oldPrice: null,
      rating: 4.7,
      reviews: 342,
      badge: null
    },
    {
      id: 'p3',
      title: 'Couches pour bébé',
      category: 'gaming',
      categoryLabel: 'Couche',
      image: 'images/couche.jpeg',
      price: 5000,
      oldPrice: 7000,
      rating: 4.9,
      reviews: 587,
      badge: 'Promo'
    },
    {
      id: 'p4',
      title: 'Bague pour homme',
      category: 'accessoires',
      categoryLabel: 'Bagues',
      image: 'images/bague1.jpeg',
      price: 2000,
      oldPrice: null,
      rating: 4.4,
      reviews: 210,
      badge: null
    },
    {
      id: 'p5',
      title: 'Perruque de qualité supérieure pour femme',
      category: 'tv',
      categoryLabel: 'Perruques',
      image: 'images/perruquesjs.jpeg',
      price: 25000,
      oldPrice: 40000,
      rating: 4.3,
      reviews: 96,
      badge: 'Promo'
    },
    {
      id: 'p6',
      title: 'Montre pour femme',
      category: 'cuisine',
      categoryLabel: 'Montre',
      image: 'images/rolexjs.jpeg',
      price: 8000,
      oldPrice: 10000,
      rating: 4.6,
      reviews: 154,
      badge: 'Promo'
    },
    {
      id: 'p7',
      title: 'Bague de luxe homme et femme',
      category: 'accessoires',
      categoryLabel: 'Bagues',
      image: 'images/baguejs.jpeg',
      price: 2000,
      oldPrice: null,
      rating: 4.5,
      reviews: 178,
      badge: null
    },
    {
      id: 'p8',
      title: 'Robe de luxe femme',
      category: 'informatique',
      categoryLabel: 'Vêtements',
      image: 'images/robe1js.jpeg',
      price: 7000,
      oldPrice: 10000,
      rating: 4.8,
      reviews: 264,
      badge: 'Promo'
    }
  ];
  /* ---------------------------------------------------------
     2. ÉTAT GLOBAL
  --------------------------------------------------------- */
  const state = {
    cart: [],           // tableau d'objets { id, qty }
    currentSlide: 0,
    sliderTimer: null,
    activeFilter: 'all',
    searchTerm: ''
  };

  /* ---------------------------------------------------------
     3. UTILITAIRES
  --------------------------------------------------------- */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function buildStars(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let html = '';
    for (let i = 0; i < full; i++) html += '★';
    if (half) html += '☆';
    const empty = 5 - full - (half ? 1 : 0);
    for (let i = 0; i < empty; i++) html += '☆';
    return html;
  }

  function formatPrice(value) {
    return Math.round(value).toLocaleString('fr-FR') + ' FCFA';
  }

  function showToast(message, icon = 'fa-solid fa-circle-check') {
    const toast = $('#toast');
    toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  /* ---------------------------------------------------------
     4. RENDU DES CARTES PRODUITS
  --------------------------------------------------------- */
  function renderProducts() {
    const grid = $('#productsGrid');
    const noResults = $('#noResults');

    const term = state.searchTerm.trim().toLowerCase();
    const filtered = PRODUCTS.filter((p) => {
      const matchesFilter = state.activeFilter === 'all' || p.category === state.activeFilter;
      const matchesSearch = !term ||
        p.title.toLowerCase().includes(term) ||
        p.categoryLabel.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });

    grid.innerHTML = '';

    if (filtered.length === 0) {
      noResults.hidden = false;
    } else {
      noResults.hidden = true;
    }

    filtered.forEach((p, index) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.style.animationDelay = `${index * 0.05}s`;

      card.innerHTML = `
        <div class="card-image">
          ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
          <img src="${p.image}" alt="${p.title}" loading="lazy">
        </div>
        <div class="card-category">${p.categoryLabel}</div>
        <h3 class="card-title">${p.title}</h3>
        <div class="card-rating">
          <span class="stars">${buildStars(p.rating)}</span>
          <span>${p.rating.toFixed(1)} (${p.reviews} avis)</span>
        </div>
        <div class="card-footer">
          <div class="card-price">
            <span class="price-now">${formatPrice(p.price)}</span>
            ${p.oldPrice ? `<span class="price-old">${formatPrice(p.oldPrice)}</span>` : ''}
          </div>
          <button class="add-cart-btn" data-id="${p.id}" aria-label="Ajouter ${p.title} au panier">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  /* ---------------------------------------------------------
     5. PANIER
  --------------------------------------------------------- */
  function addToCart(button) {
    const productId = button.dataset.id;
    const existing = state.cart.find((item) => item.id === productId);
    if (existing) existing.qty += 1;
    else state.cart.push({ id: productId, qty: 1 });

    updateCartCount();
    renderCartDrawer();

    button.classList.add('added');
    button.innerHTML = '<i class="fa-solid fa-check"></i>';
    setTimeout(() => {
      button.classList.remove('added');
      button.innerHTML = '<i class="fa-solid fa-plus"></i>';
    }, 900);

    const product = PRODUCTS.find((p) => p.id === productId);
    showToast(`${product ? product.title : 'Produit'} ajouté au panier`, 'fa-solid fa-cart-shopping');
  }

  function updateCartCount() {
    const total = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const counter = $('#cartCount');
    counter.textContent = total;
    counter.classList.add('bump');
    setTimeout(() => counter.classList.remove('bump'), 250);
  }

  function renderCartDrawer() {
    const body = $('#cartDrawerBody');
    const totalEl = $('#cartTotal');

    if (state.cart.length === 0) {
      body.innerHTML = '<p class="cart-empty">Votre panier est vide</p>';
      totalEl.textContent = formatPrice(0);
      return;
    }

    let total = 0;
    body.innerHTML = state.cart.map((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (!product) return '';
      total += product.price * item.qty;
      return `
        <div class="cart-item">
          <img src="${product.image}" alt="${product.title}">
          <div class="cart-item-info">
            <h4>${product.title}</h4>
            <span>${formatPrice(product.price)}</span>
            <div class="cart-item-qty">
              <button data-id="${item.id}" data-action="dec">−</button>
              <span>${item.qty}</span>
              <button data-id="${item.id}" data-action="inc">+</button>
            </div>
          </div>
          <button class="cart-item-remove" data-id="${item.id}" data-action="remove" aria-label="Retirer">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
    }).join('');

    totalEl.textContent = formatPrice(total);
  }

  function initCartDrawer() {
    const drawer = $('#cartDrawer');
    const overlay = $('#cartOverlay');

    function openCart() {
      drawer.classList.add('open');
      overlay.classList.add('show');
    }
    function closeCart() {
      drawer.classList.remove('open');
      overlay.classList.remove('show');
    }

    $('#cartBtn').addEventListener('click', openCart);
    $('#cartCloseBtn').addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);

    $('#cartDrawerBody').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const item = state.cart.find((i) => i.id === btn.dataset.id);
      if (!item) return;

      if (btn.dataset.action === 'inc') item.qty += 1;
      if (btn.dataset.action === 'dec') item.qty -= 1;
      if (btn.dataset.action === 'remove' || item.qty <= 0) {
        state.cart = state.cart.filter((i) => i.id !== btn.dataset.id);
      }
      updateCartCount();
      renderCartDrawer();
    });

    $('#checkoutBtn').addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('Votre panier est vide', 'fa-solid fa-cart-shopping');
        return;
      }

      // ⚠️ Remplace par ton numéro WhatsApp — format international, SANS "+" ni "0" initial
      // Exemple Côte d'Ivoire : 07 00 00 00 00 → 2250700000000
      const numeroWhatsApp = '242053024629';

      let message = 'Bonjour, je souhaite passer la commande suivante :%0A%0A';
      let total = 0;

      state.cart.forEach((item) => {
        const product = PRODUCTS.find((p) => p.id === item.id);
        if (!product) return;
        const lineTotal = product.price * item.qty;
        total += lineTotal;
        message += `• ${product.title} x${item.qty} — ${formatPrice(lineTotal)}%0A`;
      });

      message += `%0ATotal : ${formatPrice(total)}`;

      const url = `https://wa.me/${numeroWhatsApp}?text=${message}`;
      window.open(url, '_blank');

      showToast('Redirection vers WhatsApp…', 'fa-brands fa-whatsapp');
    });
  }

  /* ---------------------------------------------------------
     6. SLIDER AUTOMATIQUE
  --------------------------------------------------------- */
  function initSlider() {
    const slides = $$('.slide');
    const dotsWrap = $('#sliderDots');

    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.addEventListener('click', () => goToSlide(i));
      dotsWrap.appendChild(dot);
    });

    function updateSlider() {
      slides.forEach((s, i) => s.classList.toggle('active', i === state.currentSlide));
      $$('.slider-dots span').forEach((d, i) => d.classList.toggle('active', i === state.currentSlide));
    }

    function goToSlide(index) {
      state.currentSlide = (index + slides.length) % slides.length;
      updateSlider();
      restartAutoplay();
    }

    function nextSlide() { goToSlide(state.currentSlide + 1); }
    function prevSlide() { goToSlide(state.currentSlide - 1); }

    function restartAutoplay() {
      clearInterval(state.sliderTimer);
      state.sliderTimer = setInterval(nextSlide, 5000);
    }

    $('#nextSlide').addEventListener('click', nextSlide);
    $('#prevSlide').addEventListener('click', prevSlide);

    updateSlider();
    restartAutoplay();
  }

  /* ---------------------------------------------------------
     7. RECHERCHE INSTANTANÉE
  --------------------------------------------------------- */
  function initSearch() {
    const input = $('#searchInput');
    const btn = $('#searchBtn');

    input.addEventListener('input', (e) => {
      state.searchTerm = e.target.value;
      renderProducts();
    });

    btn.addEventListener('click', () => {
      document.getElementById('produits').scrollIntoView({ behavior: 'smooth' });
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('produits').scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* ---------------------------------------------------------
     8. FILTRES PAR CATÉGORIE RAPIDE
  --------------------------------------------------------- */
  function initQuickCategories() {
    $$('.quick-cat').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = el.dataset.filter;
        state.activeFilter = state.activeFilter === filter ? 'all' : filter;
        renderProducts();
        document.getElementById('produits').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ---------------------------------------------------------
     9. MENU MOBILE
  --------------------------------------------------------- */
  function initMobileMenu() {
    const burger = $('#burgerBtn');
    const nav = $('#mainNav');

    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      nav.classList.toggle('open');
    });

    $$('.main-nav a').forEach((link) => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        nav.classList.remove('open');
      });
    });
  }

  /* ---------------------------------------------------------
     10. HEADER — OMBRE AU SCROLL
  --------------------------------------------------------- */
  function initHeaderScroll() {
    const header = $('#siteHeader');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     11. DÉLÉGATION CLIC "AJOUTER AU PANIER"
  --------------------------------------------------------- */
  function initCartDelegation() {
    $('#productsGrid').addEventListener('click', (e) => {
      const btn = e.target.closest('.add-cart-btn');
      if (btn) addToCart(btn);
    });

    $('#locationBtn').addEventListener('click', () => {
      showToast('Sélection de l\'adresse de livraison', 'fa-solid fa-location-dot');
    });

    $('#userBtn').addEventListener('click', () => {
      showToast('Connexion à votre compte', 'fa-solid fa-user');

      setTimeout(() => {
        if (localStorage.getItem('name')) {
          window.open('./rebour.html', '_blank');
        } else {
          window.open('./connexion.html', '_blank');
        }
            })
    },1000);
  }

  /* ---------------------------------------------------------
     12. INITIALISATION
  --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    initSlider();
    initSearch();
    initQuickCategories();
    initMobileMenu();
    initHeaderScroll();
    initCartDelegation();
    initCartDrawer();
    renderCartDrawer();
  });

})();
