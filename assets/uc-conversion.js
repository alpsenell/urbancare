/* ============================================================
   UrbanCare — ürün sayfası dönüşüm iyileştirmeleri

   Üç iş yapar:
     1. Teslimat geri sayımı  (snippets/uc-delivery.liquid)
     2. Binlik ayraçlı sayı biçimlendirme (snippets/uc-social-proof.liquid)
     3. Sepete Ekle butonuna fiyat eklemek — "Sepete Ekle — ₺249,90"

   Hepsi eklentisel (progressive enhancement): beklediği düğüm yoksa
   sessizce çıkar, temanın kendi davranışına dokunmaz.

   layout/theme.liquid içinde yalnızca ürün sayfalarında yüklenir.
   ============================================================ */

(function () {
  'use strict';

  // Betik iki kez yüklenirse (ör. quick-add çekmecesi .cc-main-product
  // içindeki script'leri sayfaya taşır) ikinci kez çalışmasın.
  if (window.__ucConversion) return;
  window.__ucConversion = true;

  /* ---------- 1. Sayı biçimlendirme ------------------------- */

  function formatNumbers(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll('[data-uc-num]');

    for (var i = 0; i < nodes.length; i++) {
      var value = parseInt(nodes[i].getAttribute('data-uc-num'), 10);
      if (!isNaN(value)) nodes[i].textContent = value.toLocaleString('tr-TR');
    }
  }

  /* ---------- 2. Teslimat geri sayımı ----------------------- */

  // Mağazanın yerel saati. Ziyaretçinin cihaz saat dilimi ne olursa olsun
  // kargo kesintisi mağazanın gününe göre işler, o yüzden UTC'ye çevirip
  // mağazanın ofsetini ekliyoruz.
  function storeNow(tzOffsetHours) {
    var now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000 + tzOffsetHours * 3600000);
  }

  function renderDelivery(el) {
    var cutoffHour = parseInt(el.getAttribute('data-cutoff-hour'), 10);
    var tzOffset = parseInt(el.getAttribute('data-tz-offset'), 10);
    var lead = el.querySelector('[data-uc-delivery-lead]');
    var countdown = el.querySelector('[data-uc-delivery-countdown]');

    if (isNaN(cutoffHour) || isNaN(tzOffset) || !lead || !countdown) return;

    var now = storeNow(tzOffset);
    var cutoff = new Date(now.getTime());
    cutoff.setHours(cutoffHour, 0, 0, 0);

    var remaining = cutoff.getTime() - now.getTime();

    // Kesinti geçtiyse aciliyet uydurmuyoruz: sipariş yarın kargolanır,
    // dolayısıyla "yarın kapında" artık doğru değil.
    if (remaining <= 0) {
      lead.textContent = 'Kargo yarın çıkıyor.';
      countdown.hidden = true;
      return;
    }

    var hours = Math.floor(remaining / 3600000);
    var minutes = Math.floor((remaining % 3600000) / 60000);
    var parts = [];

    if (hours > 0) parts.push(hours + ' sa');
    parts.push(minutes + ' dk');

    lead.textContent = 'Yarın kapında.';
    countdown.textContent = parts.join(' ') + ' içinde sipariş verirsen.';
    countdown.hidden = false;
  }

  function tickDelivery() {
    var nodes = document.querySelectorAll('[data-uc-delivery]');
    for (var i = 0; i < nodes.length; i++) renderDelivery(nodes[i]);
  }

  /* ---------- 3. Sepete Ekle butonunda fiyat ---------------- */

  // Fiyatı varyant nesnesinden değil, sayfada zaten basılmış fiyat
  // bloğundan okuyoruz: para birimi biçimi Liquid'in `money` süzgeciyle
  // ayarlanmış oluyor, burada yeniden kurmaya çalışmıyoruz.
  //
  // Tema tutarı .js-value içine, ekran okuyucu etiketini ise
  // .visually-hidden.js-label içine ("Normal fiyat") koyuyor. Ham
  // textContent ikisini birden verir ve butona "Sepete ekle — Normal
  // fiyat 359,00TL" yazdırır; o yüzden önce tutar düğümünü arıyoruz.
  function currentPriceText(root) {
    var priceEl = root.querySelector('.product-info .price .price__current');
    if (!priceEl) return '';

    var value = priceEl.querySelector('.js-value');
    if (value) return value.textContent.replace(/\s+/g, ' ').trim();

    // .js-value yoksa (tema sürümü değişirse) gizli etiketleri ayıklayıp döneriz.
    var clone = priceEl.cloneNode(true);
    var hidden = clone.querySelectorAll('.visually-hidden');
    for (var i = 0; i < hidden.length; i++) hidden[i].parentNode.removeChild(hidden[i]);
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  function applyPriceToButton(button, price) {
    var suffix = button.querySelector('.uc-atc-price');

    // Tükenmiş varyantta buton "Tükendi" der; fiyat eklemek anlamsız.
    if (button.disabled || button.getAttribute('aria-disabled') === 'true') {
      if (suffix) suffix.parentNode.removeChild(suffix);
      return;
    }

    // variant-picker.js sepet butonunu komple yeniden basıyor; ekimiz
    // silinmişse yeniden ekliyoruz.
    if (!suffix) {
      suffix = document.createElement('span');
      suffix.className = 'uc-atc-price';
      button.appendChild(suffix);
    }

    suffix.textContent = ' — ' + price;
  }

  // Hem ana sepet butonu hem de mobil sabit çubuktaki buton. Sabit çubuk
  // masaüstünde fiyatı zaten .js-atc-price ile ayrı gösterdiğinden oradaki
  // ek CSS ile gizleniyor (custom.css, sabit çubuk bölümü).
  function syncAtcPrice(root) {
    var price = currentPriceText(root);
    if (!price) return;

    var buttons = root.querySelectorAll('.js-add-to-cart, .js-atc-button');
    for (var i = 0; i < buttons.length; i++) applyPriceToButton(buttons[i], price);
  }

  function syncAllAtcPrices() {
    var roots = document.querySelectorAll('.cc-main-product');
    for (var i = 0; i < roots.length; i++) syncAtcPrice(roots[i]);
  }

  /* ---------- Kurulum --------------------------------------- */

  function init() {
    formatNumbers();
    tickDelivery();
    syncAllAtcPrices();

    // Dakika başı yeterli — saniye göstermiyoruz.
    setInterval(tickDelivery, 30000);
  }

  // variant-picker.js önce [data-dynamic-variant-content] bölgelerini
  // değiştirip sonra olayı yayıyor. Yine de sıralamaya güvenmemek için
  // bir kare bekleyip öyle okuyoruz.
  document.addEventListener('on:variant:change', function () {
    requestAnimationFrame(function () {
      formatNumbers();
      tickDelivery();
      syncAllAtcPrices();
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
