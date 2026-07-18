/**
 * URBAN Care — Saç Testi v2
 * 8 soru · Cinsiyet bazlı ürün seçimi · Çift çapraz satış bloğu
 * Mantık kaynağı: urban-care-sac-testi-mantik-dokumani.docx
 */

/* ─────────────────────────────────────────────
   1. SORU TANIMI
   ───────────────────────────────────────────── */
const QUESTIONS = [
  {
    id: 'gender',
    q: 'Cinsiyetin nedir?',
    hint: '',
    type: 'single',
    opts: [
      { label: 'Kadın',                  val: 'female' },
      { label: 'Erkek',                  val: 'male'   },
      { label: 'Belirtmek istemiyorum',  val: 'other'  },
    ],
  },
  {
    id: 'hair_type',
    q: 'Saç tipini tanımla',
    hint: '',
    type: 'single',
    opts: [
      { label: 'Düz',                    val: 'straight'  },
      { label: 'Dalgalı',                val: 'wavy'      },
      { label: 'Kıvırcık',               val: 'curly'     },
      { label: 'Sıkı Kıvırcık / Afro',   val: 'coily'     },
    ],
  },
  {
    id: 'hair_strand',
    q: 'Saç telinin yapısı nasıl?',
    hint: '',
    type: 'single',
    opts: [
      { label: 'İnce & Zayıf',           val: 'fine'    },
      { label: 'Normal',                 val: 'normal'  },
      { label: 'Kalın & Gür',            val: 'thick'   },
    ],
  },
  {
    id: 'hair_process',
    q: 'Saçına işlem uyguluyor musun?',
    hint: '',
    type: 'single',
    opts: [
      { label: 'Doğal',                           val: 'natural'   },
      { label: 'Boyalı',                           val: 'colored'   },
      { label: 'Çok İşlem Görmüş / Boyalı',       val: 'bleached'  },
      { label: 'Brezilya Keratin Fönü',            val: 'keratin'   },
    ],
  },
  {
    id: 'scalp',
    q: 'Saç derinini en iyi hangisi tanımlıyor?',
    hint: '',
    type: 'single',
    opts: [
      { label: 'Yağlı',           val: 'oily'       },
      { label: 'Normal',          val: 'normal'     },
      { label: 'Kuru & Hassas',   val: 'dry'        },
      { label: 'Kepekli',         val: 'dandruff'   },
    ],
  },
  {
    id: 'problems',
    q: 'Saçının problemleri veya hedeflerin neler? (En fazla 3 seçebilirsin)',
    hint: 'En fazla 3 seçim',
    type: 'multi',
    max: 3,
    opts: [
      { label: 'Dökülme & İncelme',        val: 'shedding'    },
      { label: 'Mat & Cansız',              val: 'dull'        },
      { label: 'Yıpranmış & Kırık Uçlar',  val: 'damaged'     },
      { label: 'Kuruluk & Nem İhtiyacı',   val: 'dry'         },
      { label: 'Hacimsizlik',              val: 'volume'      },
      { label: 'Kepek',                    val: 'dandruff'    },
      { label: 'Yavaş Uzama',              val: 'growth'      },
      { label: 'Boya Koruma',              val: 'color_care'  },
    ],
  },
  {
    id: 'sun_protection',
    q: 'Saçın için güneşten korunma istiyor musun?',
    hint: '',
    type: 'single',
    opts: [
      { label: 'Evet', val: 'yes' },
      { label: 'Hayır', val: 'no' },
    ],
  },
  {
    id: 'routine_size',
    q: 'Nasıl bir bakım rutini istersin?',
    hint: '',
    type: 'single',
    opts: [
      { label: 'Temel — 2 ürün',          val: 'basic'    },
      { label: 'Rutin — 3 ürün',          val: 'routine'  },
      { label: 'Komple — 4+ ürün',        val: 'complete' },
    ],
  },
];

/* ─────────────────────────────────────────────
   2. HANDLE'LAR: seri adı → Shopify collection handle
   ───────────────────────────────────────────── */
const SERIES_HANDLE = {
  expert_biotin:   'expert-biotin-caffeine',
  rosemary:        'rosemary-clove',
  glycolic:        'glycolic-retinol',
  argan:           'argan-oil-keratin',
  intense:         'intense-keratin',
  hyaluronic:      'hyaluronic-collagen',
  hibiscus:        'hibiscus-shea-butter',
  style_guide:     'style-guide',
  mor:             'turunculasma-karsiti',
  bond_plex:       'bond-plex',
  apple_cider:     'apple-cider',
  brezilya:        'brezilya-keratin',
  perfecting:      'perfecting',
  shake_n:         'shake-n-repair',
  kind_rituals:    'kind-rituals',
};

/* ─────────────────────────────────────────────
   3. ÜRÜN TİPİ TESPİTİ
   Shopify'daki product.type veya title anahtar kelimelere bakarak
   hangi slot'a ait olduğunu döner.
   ───────────────────────────────────────────── */
function detectProductSlot(p) {
  const t = (p.title + ' ' + (p.type || '')).toLowerCase();
  if (/sache|pre.?hair|pre.?wash/.test(t))                    return 'pre_mask';
  if (/peeling/.test(t))                                       return 'peeling_shampoo';
  if (/kuru şampuan|dry shampoo/.test(t))                      return 'dry_shampoo';
  if (/şampuan|shampoo/.test(t))                               return 'shampoo';
  if (/kavanoz maske|yoğun.*maske|intense.*mask/.test(t))      return 'mask';
  if (/sıvı.*krem|bonding milk|bakım sütü|bakım suyu/.test(t)) return 'liquid_cream';
  if (/krem/.test(t))                                          return 'cream';
  if (/serum/.test(t))                                         return 'serum';
  if (/yağ|oil(?!.*kuru)/.test(t))                             return 'oil';
  if (/tonik|tonic/.test(t))                                   return 'tonic';
  if (/köpük|mousse/.test(t))                                  return 'mousse';
  if (/sprey.*heat|heat.*spray/.test(t))                       return 'heat_spray';
  if (/sprey|spray/.test(t))                                   return 'spray';
  if (/jöle|jel/.test(t))                                      return 'jel';
  if (/wax|vaks/.test(t))                                      return 'wax';
  return 'other';
}

/* ─────────────────────────────────────────────
   4. KARAR MANTIĞI — decideSeries()
   Döner: { primary: string, secondary: string|null }
   ───────────────────────────────────────────── */
function decideSeries(ans) {
  const problems   = ans.problems || [];
  const hairType   = ans.hair_type;
  const process    = ans.hair_process;
  const sun        = ans.sun_protection === 'yes';

  let primary   = null;
  let secondary = null;

  // ① Brezilya Keratin fönü — her şeyi ezer
  if (process === 'keratin') {
    primary = 'brezilya';
    // ikincil seri kuralları ileriye taşınır
  }

  // ② Dökülme + Hacimsizlik + Yavaş Uzama üçü birden
  else if (
    problems.includes('shedding') &&
    problems.includes('volume')   &&
    problems.includes('growth')
  ) {
    primary = 'expert_biotin';
  }

  // ③ Öncelik sırası
  else {
    const priorityMap = [
      ['shedding',    'expert_biotin'],
      ['color_care',  'mor'],
      ['dandruff',    'apple_cider'],
      ['dry',         'hyaluronic'],
      ['damaged',     'intense'],
      ['dull',        'argan'],
      ['volume',      'hyaluronic'],
      ['growth',      'rosemary'],
    ];
    for (const [prob, serie] of priorityMap) {
      if (problems.includes(prob)) { primary = serie; break; }
    }
    if (!primary) primary = 'argan'; // varsayılan
  }

  // ④ Kıvırcık / Afro → Hibiscus öne çıkar; bir önceki primary ikincil olur
  if ((hairType === 'curly' || hairType === 'coily') && primary !== 'hibiscus') {
    secondary = primary;
    primary   = 'hibiscus';
  }

  // ⑤ İkincil seri kuralları (hibiscus override sonrası)
  if (!secondary) {
    if (problems.includes('damaged') && primary !== 'bond_plex') {
      secondary = 'bond_plex';
    } else if (problems.includes('dull') && sun && primary !== 'perfecting') {
      secondary = 'perfecting';
    } else if (problems.includes('dandruff') && primary !== 'apple_cider') {
      secondary = 'apple_cider';
    } else if (problems.includes('color_care') && primary !== 'mor') {
      secondary = 'mor';
    }
  }

  return { primary, secondary };
}

/* ─────────────────────────────────────────────
   5. RUTİN OLUŞTURMA — buildRoutine()
   Döner: { mainProducts[], extrasProducts[], stylingProducts[] }
   ───────────────────────────────────────────── */
function buildRoutine(ans, catalog) {
  const { primary, secondary } = decideSeries(ans);
  const size        = ans.routine_size;            // basic | routine | complete
  const gender      = ans.gender;                  // female | male | other
  const sun         = ans.sun_protection === 'yes';
  const hairType    = ans.hair_type;

  // Yardımcı: bir handle'dan belirli slotu bul
  function get(handle, slot) {
    const list = catalog[SERIES_HANDLE[handle]] || [];
    return list.find(p => detectProductSlot(p) === slot && p.avail !== false) || null;
  }

  // Yardımcı: bir handle'dan birden fazla slotu dene
  function getFirst(handle, slots) {
    for (const slot of slots) {
      const p = get(handle, slot);
      if (p) return p;
    }
    return null;
  }

  const mainProducts = [];

  // — ŞAMPUAN (her zaman ana seriden)
  const shampoo = get(primary, 'shampoo');
  if (shampoo) mainProducts.push(shampoo);

  // — 2. ÜRÜN (Krem / Sıvı Krem / Tonik — cinsiyete + güneşe göre)
  if (size === 'basic') {
    if (gender === 'male') {
      // Erkek: varsa tonik, yoksa krem/sıvı krem
      // Not: aktif stokta sadece expert_biotin'de tonik var
      const tonic = get(primary, 'tonic');
      const cream = sun ? get(primary, 'liquid_cream') || get(primary, 'cream')
                        : get(primary, 'cream') || get(primary, 'liquid_cream');
      if (tonic) mainProducts.push(tonic);
      else if (cream) mainProducts.push(cream);
    } else {
      // Kadın / Belirtmek istemiyorum
      const cream = sun ? get(primary, 'liquid_cream') || get(primary, 'cream')
                        : get(primary, 'cream') || get(primary, 'liquid_cream');
      if (cream) mainProducts.push(cream);
    }
  }

  // — RUTIN (3 ürün)
  else if (size === 'routine') {
    // Biotin & Caffeine istisnası: şampuan + tonik + serum (cinsiyetten bağımsız)
    if (primary === 'expert_biotin') {
      const tonic = get('expert_biotin', 'tonic');
      const serum = get('expert_biotin', 'serum');
      if (tonic) mainProducts.push(tonic);
      if (serum) mainProducts.push(serum);
    } else if (gender === 'male') {
      // Erkek: şampuan + krem + tonik (yoksa maske)
      const cream = sun ? get(primary, 'liquid_cream') || get(primary, 'cream')
                        : get(primary, 'cream') || get(primary, 'liquid_cream');
      const tonic = get(primary, 'tonic');
      if (cream) mainProducts.push(cream);
      if (tonic) mainProducts.push(tonic);
      else {
        const mask = get(primary, 'mask');
        if (mask) mainProducts.push(mask);
      }
    } else {
      // Kadın: şampuan + krem + maske
      const cream = sun ? get(primary, 'liquid_cream') || get(primary, 'cream')
                        : get(primary, 'cream') || get(primary, 'liquid_cream');
      const mask  = get(primary, 'mask');
      if (cream) mainProducts.push(cream);
      if (mask)  mainProducts.push(mask);
    }
  }

  // — KOMPLE (4+ ürün)
  else if (size === 'complete') {
    const cream = sun ? get(primary, 'liquid_cream') || get(primary, 'cream')
                      : get(primary, 'cream') || get(primary, 'liquid_cream');
    const mask  = get(primary, 'mask');
    const extra = get(primary, 'oil') || get(primary, 'serum') || get(primary, 'tonic');
    if (cream) mainProducts.push(cream);
    if (mask)  mainProducts.push(mask);
    if (extra) mainProducts.push(extra);

    // Kıvırcık + Komple: Bond Plex veya Perfecting yağı ZORUNLU
    if ((hairType === 'curly' || hairType === 'coily')) {
      const hasOil = mainProducts.some(p => detectProductSlot(p) === 'oil');
      if (!hasOil) {
        const bondOil = get('bond_plex', 'oil') || get('perfecting', 'oil');
        if (bondOil) {
          // son (şampuan olmayan) ürünü değiştir
          const lastNonShampoo = [...mainProducts].reverse()
            .findIndex(p => detectProductSlot(p) !== 'shampoo');
          if (lastNonShampoo >= 0) {
            mainProducts.splice(mainProducts.length - 1 - lastNonShampoo, 1, bondOil);
          } else {
            mainProducts.push(bondOil);
          }
        }
      }
    }
  }

  // — İKİNCİL SERİ: 3+ üründe ana serinin son (şampuan olmayan) ürünü ikincil seri ile değişebilir
  if (secondary && mainProducts.length >= 3) {
    const lastIdx = [...mainProducts].map((p, i) => ({ p, i }))
      .reverse()
      .find(({ p }) => detectProductSlot(p) !== 'shampoo');

    if (lastIdx) {
      const slot        = detectProductSlot(lastIdx.p);
      const replacement = get(secondary, slot);
      if (replacement) {
        mainProducts.splice(lastIdx.i, 1, replacement);
      }
    }
  }

  /* ── EKSTRALAR: Rutinini Tamamla ──
     Perfecting ve/veya Shake N Repair'den, ana rutine dahil olmayan ürünler */
  const mainIds   = new Set(mainProducts.map(p => p.id));
  const extraPool = [
    ...(catalog[SERIES_HANDLE['perfecting']] || []),
    ...(catalog[SERIES_HANDLE['shake_n']]    || []),
  ].filter(p => !mainIds.has(p.id) && p.avail !== false);

  // Max 2 ekstra
  const extrasProducts = extraPool.slice(0, 2);

  /* ── STYLİNG: Saç Şekillendirmeni Tamamla ──
     Style Guide'dan 2 ürün; kıvırcık → Jel/Köpük, düz/dalgalı → Wax/Sprey */
  const sgList   = catalog[SERIES_HANDLE['style_guide']] || [];
  const isCurly  = hairType === 'curly' || hairType === 'coily';
  const curlySlots   = ['jel', 'mousse'];
  const straightSlots = ['wax', 'spray', 'heat_spray'];

  const stylingProducts = sgList
    .filter(p => {
      const slot = detectProductSlot(p);
      return isCurly
        ? curlySlots.includes(slot)
        : straightSlots.includes(slot);
    })
    .filter(p => p.avail !== false)
    .slice(0, 2);

  // Eğer saç tipine özel bulunamazsa genel Style Guide öneri
  if (stylingProducts.length === 0) {
    sgList.filter(p => p.avail !== false).slice(0, 2).forEach(p => stylingProducts.push(p));
  }

  return { mainProducts, extrasProducts, stylingProducts, primary, secondary };
}

/* ─────────────────────────────────────────────
   6. UI MOTORU
   ───────────────────────────────────────────── */
(function () {
  const section = document.querySelector('[data-quiz]');
  if (!section) return;

  // Ürün kataloğunu parse et
  let catalog = {};
  try {
    catalog = JSON.parse(section.querySelector('[data-products]').textContent);
  } catch (e) {
    console.error('Saç testi: ürün verisi parse hatası', e);
  }

  // Ekran referansları
  const screens = {
    intro:  section.querySelector('[data-screen="intro"]'),
    step:   section.querySelector('[data-screen="step"]'),
    result: section.querySelector('[data-screen="result"]'),
  };

  const bar       = section.querySelector('[data-bar]');
  const stepNo    = section.querySelector('[data-step-no]');
  const stepTotal = section.querySelector('[data-step-total]');
  const qEl       = section.querySelector('[data-q]');
  const hintEl    = section.querySelector('[data-hint]');
  const optsEl    = section.querySelector('[data-opts]');
  const backBtn   = section.querySelector('[data-back]');

  stepTotal.textContent = QUESTIONS.length;

  let currentStep = 0;
  const answers   = {};

  function showScreen(name) {
    Object.entries(screens).forEach(([k, el]) => {
      if (el) el.hidden = k !== name;
    });
  }

  function setProgress(step) {
    const pct = Math.round((step / QUESTIONS.length) * 100);
    bar.style.width = pct + '%';
  }

  function renderStep(idx) {
    const q      = QUESTIONS[idx];
    const isMulti = q.type === 'multi';
    const prev   = answers[q.id] || (isMulti ? [] : null);

    stepNo.textContent = idx + 1;
    qEl.textContent    = q.q;
    hintEl.textContent = q.hint || '';
    hintEl.hidden      = !q.hint;
    optsEl.innerHTML   = '';
    backBtn.hidden     = idx === 0;
    setProgress(idx);

    q.opts.forEach(opt => {
      const btn = document.createElement('button');
      btn.className  = 'hquiz__opt';
      btn.textContent = opt.label;
      btn.dataset.val = opt.val;

      if (isMulti && prev.includes(opt.val)) btn.classList.add('is-active');
      if (!isMulti && prev === opt.val)       btn.classList.add('is-active');

      btn.addEventListener('click', () => {
        if (isMulti) {
          handleMulti(q, opt.val, btn);
        } else {
          answers[q.id] = opt.val;
          advance(idx);
        }
      });

      optsEl.appendChild(btn);
    });

    showScreen('step');
  }

  function handleMulti(q, val, btn) {
    if (!answers[q.id]) answers[q.id] = [];
    const list = answers[q.id];
    const idx  = list.indexOf(val);

    if (idx >= 0) {
      list.splice(idx, 1);
      btn.classList.remove('is-active');
    } else {
      if (list.length >= (q.max || 99)) return; // max sınırı
      list.push(val);
      btn.classList.add('is-active');
    }

    // Çoklu seçimde devam butonu — section scope'dan ara, DOM'da bir kez oluştur
    let continueBtn = section.querySelector('.hquiz__continue');
    if (!continueBtn) {
      continueBtn = document.createElement('button');
      continueBtn.className   = 'btn btn--brand hquiz__continue';
      continueBtn.textContent = 'Devam →';
      continueBtn.addEventListener('click', () => {
        if ((answers[q.id] || []).length > 0) advance(currentStep);
      });
      optsEl.after(continueBtn);
    }
    continueBtn.style.display = list.length > 0 ? '' : 'none';
  }

  function advance(idx) {
    if (idx + 1 < QUESTIONS.length) {
      currentStep = idx + 1;
      renderStep(currentStep);
    } else {
      setProgress(QUESTIONS.length);
      renderResult();
    }
  }

  /* ── Sonuç ekranı ── */
  function renderResult() {
    const { mainProducts, extrasProducts, stylingProducts, primary } = buildRoutine(answers, catalog);

    // Seri ismi çeviri
    const SERIES_LABELS = {
      expert_biotin: 'Expert Biotin & Caffeine',
      rosemary:      'Rosemary & Clove',
      glycolic:      'Glycolic Retinol',
      argan:         'Argan Oil & Keratin',
      intense:       'Intense Keratin',
      hyaluronic:    'Hyaluronic Acid & Collagen',
      hibiscus:      'Hibiscus & Shea Butter',
      mor:           'Mor Seri',
      bond_plex:     'Bond Plex',
      apple_cider:   'Apple Cider',
      brezilya:      'Brazilian Keratin',
      perfecting:    'Perfecting',
    };

    // Alt başlık
    const sub = section.querySelector('[data-result-sub]');
    if (sub) sub.textContent = `${SERIES_LABELS[primary] || ''} serisine göre kişisel rutin`;

    // Ana kartlar
    const cardsEl = section.querySelector('[data-cards]');
    cardsEl.innerHTML = '';
    mainProducts.forEach(p => cardsEl.appendChild(buildCard(p)));

    // "Tüm rutini sepete ekle"
    section.querySelector('[data-add-all]').onclick = () => addToCart(mainProducts);
    section.querySelector('[data-restart]').onclick  = restartQuiz;

    // Ekstralar
    const extrasSection = section.querySelector('[data-extras]');
    const extraCards    = section.querySelector('[data-extra-cards]');
    if (extrasProducts.length > 0) {
      extraCards.innerHTML = '';
      extrasProducts.forEach(p => extraCards.appendChild(buildCard(p)));
      section.querySelector('[data-add-all-extras]').onclick = () => addToCart(extrasProducts);
      extrasSection.hidden = false;
    } else {
      extrasSection.hidden = true;
    }

    // Style Guide blok
    const stylingSection = section.querySelector('[data-styling]');
    const stylingCards   = section.querySelector('[data-styling-cards]');
    if (stylingProducts.length > 0) {
      stylingCards.innerHTML = '';
      stylingProducts.forEach(p => stylingCards.appendChild(buildCard(p)));
      section.querySelector('[data-add-all-styling]').onclick = () => addToCart(stylingProducts);
      stylingSection.hidden = false;
    } else {
      stylingSection.hidden = true;
    }

    showScreen('result');
  }

  /* ── Kart oluştur ── */
  function buildCard(p) {
    const a   = document.createElement('a');
    a.href    = p.url;
    a.className = 'hquiz__card';
    a.innerHTML = `
      <div class="hquiz__card-img">
        <img src="${p.img || ''}" alt="${p.title}" loading="lazy" width="200" height="200">
      </div>
      <div class="hquiz__card-body">
        <p class="hquiz__card-title">${p.title}</p>
        ${p.ki ? `<p class="hquiz__card-ki">${p.ki}</p>` : ''}
        <p class="hquiz__card-price">${p.price}</p>
      </div>
      <button class="hquiz__card-add btn btn--brand btn--sm"
              data-id="${p.id}" aria-label="${p.title} sepete ekle">
        Sepete Ekle
      </button>`;

    a.querySelector('[data-id]').addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      addToCart([p]);
    });

    return a;
  }

  /* ── Shopify sepet ekleme ── */
  async function addToCart(products) {
    const items = products
      .filter(p => p.id)
      .map(p => ({ id: p.id, quantity: 1 }));
    if (!items.length) return;

    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error('Cart error');
      window.location.href = '/cart';
    } catch (err) {
      console.error('Sepete eklenemedi:', err);
    }
  }

  /* ── Olaylar ── */
  section.querySelector('[data-start]').addEventListener('click', () => {
    currentStep = 0;
    renderStep(0);
  });

  section.addEventListener('click', e => {
    if (e.target.matches('[data-back]')) {
      if (currentStep > 0) {
        currentStep--;
        renderStep(currentStep);
      }
    }
  });

  function restartQuiz() {
    Object.keys(answers).forEach(k => delete answers[k]);
    currentStep = 0;
    setProgress(0);
    showScreen('intro');
  }

})();