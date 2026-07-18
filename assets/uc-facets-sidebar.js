/* ============================================================
   UrbanCare — koleksiyon filtrelerini masaüstünde kenar çubuğuna çevirir

   Tasarımda filtreler masaüstünde 240px'lik kalıcı bir sütun, mobilde
   ise çekmece. Beautify'ın <facet-filters> öğesi SideDrawer'dan türüyor
   ve her zaman diyalog: role="dialog", aria-modal="true", aria-hidden.

   Yerleşimi CSS hallediyor (custom.css, 13. bölüm). Buradaki iş yalnızca
   ERİŞİLEBİLİRLİK: sürekli görünen bir paneli aria-hidden="true" ve
   aria-modal ile bırakmak, ekran okuyucularda paneli tamamen yok eder ve
   klavye kullanıcısını olmayan bir modala hapseder. Masaüstünde diyalog
   semantiğini söküyor, mobile dönünce geri takıyoruz.

   layout/theme.liquid içinde yalnızca koleksiyon/arama sayfalarında yüklenir.
   ============================================================ */

(function () {
  'use strict';

  if (window.__ucFacetsSidebar) return;
  window.__ucFacetsSidebar = true;

  var DESKTOP = '(min-width: 1024px)';
  var ROLE_STORE = 'data-uc-saved-role';

  function isDesktop() {
    return window.matchMedia(DESKTOP).matches;
  }

  function toSidebar(el) {
    if (!el.hasAttribute(ROLE_STORE)) {
      el.setAttribute(ROLE_STORE, el.getAttribute('role') || 'dialog');
    }

    el.removeAttribute('role');
    el.removeAttribute('aria-modal');
    el.removeAttribute('tabindex');
    el.setAttribute('aria-hidden', 'false');
  }

  function toDrawer(el) {
    el.setAttribute('role', el.getAttribute(ROLE_STORE) || 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('tabindex', '-1');

    // Çekmece açıkken gizlemeyelim; kapalıysa tema zaten böyle bırakıyor.
    if (!el.classList.contains('is-open')) {
      el.setAttribute('aria-hidden', 'true');
    }
  }

  function apply() {
    var el = document.getElementById('facet-filters');
    if (!el) return;

    if (isDesktop()) {
      toSidebar(el);
    } else {
      toDrawer(el);
    }
  }

  function init() {
    apply();

    // Tema kırılma noktası değişiminde kendi olayını yayıyor; yine de
    // ona bağımlı kalmamak için matchMedia'yı da dinliyoruz.
    document.addEventListener('on:breakpoint-change', apply);

    var mq = window.matchMedia(DESKTOP);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', apply);
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(apply);
    }

    // Filtreleme sonuçları Section Rendering API ile yeniden basılıyor;
    // yeni gelen düğümde nitelikler baştan doğru olmalı.
    var results = document.getElementById('filter-results');
    if (results && 'MutationObserver' in window) {
      new MutationObserver(apply).observe(results, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
