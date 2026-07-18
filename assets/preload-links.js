/**
 * Component for preloading links and swapping content via AJAX.
 */
if (!customElements.get('preload-links')) {
  class PreloadLinks extends HTMLElement {
    connectedCallback() {
      // Must be a standard page context
      if (this.closest('quick-add-drawer')) return;

      this.toggleAttribute('active', true);

      // Store cache on window for persistence
      if (!window.themePreloadLinksCache) window.themePreloadLinksCache = {};
      this.linksCache = window.themePreloadLinksCache;
      this.STATES = {
        FETCHING: 1,
        LOADWHENFETCHED: 2,
        FETCHED: 3
      };
      this.replacementTarget = '#main-content';
      this.cacheMax = 20;
      this.currentCacheIndex = 0;

      this.querySelectorAll('a').forEach((link) => {
        link.addEventListener('mouseenter', this.handleMouseEnter.bind(this), { once: true });
        link.addEventListener('focus', this.handleFocus.bind(this), { once: true });
        link.addEventListener('click', this.handleClick.bind(this), { once: true });
      });
    }

    /**
     * Handles the mouse enter event on a link.
     * @param {object} evt - Event object.
     */
    handleMouseEnter(evt) {
      this.preloadLink(evt.currentTarget.href);
    }

    /**
     * Handles the focus event on a link.
     * @param {object} evt - Event object.
     */
    handleFocus(evt) {
      this.preloadLink(evt.currentTarget.href);
    }

    /**
     * Handles the click event on a link.
     * @param {object} evt - Event object.
     */
    handleClick(evt) {
      evt.preventDefault();
      const link = evt.currentTarget;
      this.preloadLink(link.href);
      if (this.linksCache[link.href].state === this.STATES.FETCHED) {
        this.performLoad(link.href);
      } else {
        this.linksCache[link.href].state = this.STATES.LOADWHENFETCHED;
      }
    }

    /**
     * Fetch page from a link and cache it.
     * @param {string} linkUrl - link to preload.
     */
    preloadLink(linkUrl) {
      if (!this.linksCache[linkUrl]) {
        // Basic cache limit
        if (Object.keys(this.linksCache).length > this.cacheMax) {
          this.removeOldestCache();
        }

        this.linksCache[linkUrl] = {
          state: this.STATES.FETCHING,
          id: ++this.currentCacheIndex // eslint-disable-line no-plusplus
        };
        fetch(linkUrl, { method: 'GET', mode: 'no-cors' })
          .then((response) => response.text())
          .then((html) => {
            this.linksCache[linkUrl].html = html;
            if (this.linksCache[linkUrl].state === this.STATES.LOADWHENFETCHED) {
              this.performLoad(linkUrl);
            }
            this.linksCache[linkUrl].state = this.STATES.FETCHED;
          })
          .catch(() => {}); // Ignore errors
      }
    }

    /**
     * Replaces the main content of the page and updates history.
     * @param {string} linkUrl - Link to load - used as a cache index.
     */
    performLoad(linkUrl) {
      const activeElementId = document.activeElement.id;
      const { scrollY } = window;

      const target = document.querySelector(this.replacementTarget);
      let tmpl = document.createElement('div');
      tmpl.innerHTML = this.linksCache[linkUrl].html;
      tmpl = tmpl.querySelector(this.replacementTarget);

      // Modify content before display
      // Remove animations
      tmpl.querySelectorAll('[data-cc-animate]').forEach((el) => el.removeAttribute('data-cc-animate'));
      // Preserve input values
      tmpl.querySelectorAll('input[id], select[id], textarea[id]').forEach((el) => {
        const existing = document.querySelector(`[id="${el.id}"]`);
        if (existing) el.value = existing.value;
      });

      // Add before replacing HTML and reloading this section
      window.history.replaceState({}, '', linkUrl);

      target.replaceWith(tmpl);
      // Note: Scripts may not be run. This may be OK in practice.

      // Web components that need initialising again after changing document root
      document.querySelectorAll(`${this.replacementTarget} media-gallery`).forEach((e) => e.initGallery());

      window.scrollTo({ top: scrollY });
      document.getElementById(activeElementId)?.focus();
    }

    /**
     * Delete the oldest item in the cache.
     */
    removeOldestCache() {
      let oldestId = Number.MAX_SAFE_INTEGER;
      let oldestKey = null;
      for (const key in this.linksCache) {
        if (this.linksCache[key].id < oldestId) {
          oldestId = this.linksCache[key].id;
          oldestKey = key;
        }
      }
      if (oldestKey) delete this.linksCache[oldestKey];
    }
  }

  customElements.define('preload-links', PreloadLinks);
}
