/* global Swiper */
(() => {
  const themeCreateProductSwiper = () => {
    if (!customElements.get('product-swiper')) {
      class ProductSwiper extends HTMLElement {
        connectedCallback() {
          const fullWidth = this.dataset.fullWidth === 'true';
          this.swiper = new Swiper(`#${CSS.escape(this.id)} .swiper`, {
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 1,
            spaceBetween: this.dataset.effect === 'coverflow' ? 50 : 24,
            breakpoints: {
              // when window width is >= 768px
              768: {
                slidesPerView: 3,
                spaceBetween: this.dataset.effect === 'coverflow' ? 80 : 40
              },
              1120: {
                slidesPerView: 4
              },
              1400: {
                slidesPerView: 5
              }
            },
            loop: true,
            loopAdditionalSlides: 5,
            effect: this.dataset.effect,
            coverflowEffect: {
              rotate: 0,
              stretch: 0,
              depth: 200,
              scale: 1,
              modifier: 1,
              slideShadows: false
            },
            navigation: {
              nextEl: `#${CSS.escape(this.id)} .slider-nav__btn[name=next]`,
              prevEl: `#${CSS.escape(this.id)} .slider-nav__btn[name=prev]`
            },
            a11y: {
              slideRole: null
            },
            on: {
              init: fullWidth ? null : this.updateEdgeSlideVisibility,
              slideChange: fullWidth ? null : this.updateEdgeSlideVisibility
            }
          });

          this.swiper.on('init', this.updateSlideTabIndex.bind(this));
          this.swiper.on('slideChange', this.updateSlideTabIndex.bind(this));
        }

        updateSlideTabIndex() {
          this.swiper.slides.forEach((slide, index) => {
            const focusableElements = slide.querySelectorAll(
              'product-card, a, button, input, textarea, select, [tabindex]'
            );
            if (index === this.swiper.activeIndex) {
              slide.removeAttribute('tabindex');
              focusableElements.forEach((el) => el.removeAttribute('tabindex'));
            } else {
              slide.setAttribute('tabindex', '-1');
              focusableElements.forEach((el) => el.setAttribute('tabindex', '-1'));
            }
          });
        }

        updateEdgeSlideVisibility() {
          this.slides.forEach((slide) => slide.classList.remove('is-visible'));

          const { activeIndex } = this;
          const { slidesPerView } = this.params;
          let range;
          if (slidesPerView <= 1) {
            range = 0;
          } else if (slidesPerView <= 3) {
            range = 1;
          } else if (slidesPerView <= 4) {
            range = 2;
          } else {
            range = 3;
          }

          for (let i = -range; i <= range; i += 1) {
            const index = (activeIndex + i + this.slides.length) % this.slides.length;
            this.slides[index].classList.add('is-visible');
          }
        }
      }

      customElements.define('product-swiper', ProductSwiper);
    }
  };

  if (theme.Swiper) {
    themeCreateProductSwiper();
  } else {
    document.addEventListener('swiper-loaded', themeCreateProductSwiper);
  }
})();
