/* Full site JS - replace the existing JS with this block
   - Keeps redirect, menu, smooth scroll behaviors
   - Replaces & standardises gallery logic (colour + configuration aware, per-gallery)
*/

(function () {
  // ---------- Utility / Site functions (exposed globally for HTML hooks) ----------

  window.toggleMenu = function () {
    const menu = document.querySelector('nav ul');
    const hamburger = document.querySelector('#hamburger-menu');
    if (menu) menu.classList.toggle('show');
    if (hamburger) hamburger.classList.toggle('open');
  };

  document.addEventListener('DOMContentLoaded', function () {
    // Close menu when a menu item is clicked
    document.querySelectorAll('nav ul li a').forEach(link => {
      link.addEventListener('click', () => {
        const menu = document.querySelector('nav ul');
        const hamburger = document.querySelector('#hamburger-menu');
        if (menu) menu.classList.remove('show');
        if (hamburger) hamburger.classList.remove('open');
      });
    });

    // Smooth scrolling with header offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Close the menu (in case of mobile view)
        const menu = document.querySelector('nav ul');
        if (menu) menu.classList.remove('show');

        const href = this.getAttribute('href');
        if (!href || href === '#') return;

        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);
        if (!targetSection) return;

        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;

        // Check if the screen is in mobile view
        const isMobile = window.innerWidth <= 768;

        // Calculate the target position
        let targetPosition = targetSection.offsetTop - headerHeight;
        if (isMobile && targetId === 'home') {
          targetPosition = targetSection.offsetTop;
        }

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });

    // Top link smooth scroll
    document.querySelectorAll('a[href="#top"]').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    });

    // ---------- Gallery Manager: supports multiple .product-gallery instances ----------
    const galleryManagers = [];

    document.querySelectorAll('.product-gallery').forEach((productGallery, galleryIndex) => {
      const galleryContainer = productGallery.querySelector('.gallery-container');
      if (!galleryContainer) return; // nothing to manage

      // find the nav container if present, otherwise it'll be created
      let galleryNav = productGallery.querySelector('.gallery-nav');

      // All images originally in the gallery container (keeps DOM order)
      const allImages = Array.from(galleryContainer.querySelectorAll('img'));

      // Find colour circles & configuration options that are "related" to this gallery:
      const scope =
        productGallery.closest('.section1-content') ||
        productGallery.closest('section') ||
        document;

      const colourCircles = Array.from(scope.querySelectorAll('.available-colours .colour-circle'));
      const configOptions = Array.from(scope.querySelectorAll('.available-configurations .config-option'));

      // Build a mapping of colour -> array of images (keeps DOM order)
      const colourMap = {};
      allImages.forEach(img => {
        const c = img.dataset.colour || 'default';
        if (!colourMap[c]) colourMap[c] = [];
        colourMap[c].push(img);
      });

      const manager = {
        galleryIndex,
        productGallery,
        galleryContainer,
        galleryNav,
        allImages,
        colourCircles,
        configOptions,
        colourMap,
        currentColour: null,
        currentConfig: null,
        currentIndex: 0,

        // Return array of images for currentColour/currentConfig combination
        getActiveImages() {
          const hasColour = !!this.currentColour;
          const hasConfig = !!this.currentConfig;

          let filtered = this.allImages.filter(img => {
            if (hasColour && img.dataset.colour !== this.currentColour) return false;
            if (hasConfig && img.dataset.config !== this.currentConfig) return false;
            return true;
          });

          // Fallbacks if no images match the strict combination
          if (!filtered.length) {
            if (hasColour && !hasConfig) {
              filtered = this.allImages.filter(img => img.dataset.colour === this.currentColour);
            } else if (hasConfig && !hasColour) {
              filtered = this.allImages.filter(img => img.dataset.config === this.currentConfig);
            } else {
              filtered = this.allImages;
            }
          }

          // If still nothing (no images at all) just return []
          return filtered;
        },

        // Rebuild the dot controls to match the active image set
        rebuildDots() {
          if (!this.galleryNav) {
            // Create a nav container (keeps class names for your existing CSS)
            this.galleryNav = document.createElement('div');
            this.galleryNav.className = 'gallery-nav';
            this.productGallery.appendChild(this.galleryNav);
          }
          const activeImages = this.getActiveImages();
          this.galleryNav.innerHTML = ''; // clear existing dots

          activeImages.forEach((img, idx) => {
            const dot = document.createElement('span');
            dot.className = 'gallery-dot';
            dot.dataset.index = idx;
            dot.setAttribute('role', 'button');
            dot.setAttribute('aria-label', `Show image ${idx + 1}`);
            dot.tabIndex = 0;
            if (idx === 0) dot.classList.add('active');

            // click + keyboard accessibility
            dot.addEventListener('click', () => this.showImage(idx));
            dot.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showImage(idx);
              }
            });

            this.galleryNav.appendChild(dot);
          });
        },

        // Centralised helper: apply currentColour/currentConfig to image visibility + dots
        updateVisibility() {
          const activeImages = this.getActiveImages();
          const activeSet = new Set(activeImages);

          this.allImages.forEach(img => {
            const visible = activeSet.has(img);
            img.style.display = visible ? '' : 'none';
            img.classList.remove('active');
          });

          this.rebuildDots();
          this.currentIndex = 0;
          this.showImage(0);
        },

        // Display the image at index within the active images
        showImage(index) {
          const activeImages = this.getActiveImages();
          if (!activeImages || activeImages.length === 0) return;

          // wrap index
          if (index < 0) index = activeImages.length - 1;
          if (index >= activeImages.length) index = 0;

          // Remove 'active' from all images (keeps other colours/configs unaffected)
          this.allImages.forEach(img => img.classList.remove('active'));

          // Set 'active' on the target image (visible)
          const target = activeImages[index];
          if (target) target.classList.add('active');

          // Update dots UI
          if (this.galleryNav) {
            const dots = Array.from(this.galleryNav.querySelectorAll('.gallery-dot'));
            dots.forEach((d, i) => d.classList.toggle('active', i === index));
          }

          this.currentIndex = index;
        },

        // Move by direction (-1 or 1)
        changeImage(direction) {
          const activeImages = this.getActiveImages();
          if (!activeImages || activeImages.length === 0) return;
          this.showImage(this.currentIndex + direction);
        },

        // Set/Change the active colour
        setColour(colour) {
          this.currentColour = (colour == null || colour === 'default') ? null : String(colour);

          // update visual state of colour circles
          if (this.colourCircles && this.colourCircles.length > 0) {
            this.colourCircles.forEach(c =>
              c.classList.toggle('selected', c.dataset.colour === this.currentColour)
            );
          }

          this.updateVisibility();
        },

        // Set/Change the active configuration
        setConfig(config) {
          this.currentConfig = config == null ? null : String(config);

          // update visual state of config options
          if (this.configOptions && this.configOptions.length > 0) {
            this.configOptions.forEach(o =>
              o.classList.toggle('active', o.dataset.config === this.currentConfig)
            );
          }

          this.updateVisibility();
        },

        // Initialise manager
        init() {
          // Attach arrow listeners (remove inline onclick to avoid duplicates if present)
          const prevBtn = this.galleryContainer.querySelector('.gallery-arrow.prev');
          const nextBtn = this.galleryContainer.querySelector('.gallery-arrow.next');

          if (prevBtn) {
            prevBtn.removeAttribute('onclick');
            prevBtn.addEventListener('click', (e) => {
              e.preventDefault();
              this.changeImage(-1);
            });
          }
          if (nextBtn) {
            nextBtn.removeAttribute('onclick');
            nextBtn.addEventListener('click', (e) => {
              e.preventDefault();
              this.changeImage(1);
            });
          }

          // Attach click handlers to local colour circles (if any)
          if (this.colourCircles && this.colourCircles.length > 0) {
            this.colourCircles.forEach(circle => {
              // preserve tooltip behaviour; add selection handling
              circle.addEventListener('click', () => {
                const selectedColour = circle.dataset.colour || null;
                this.setColour(selectedColour);
              });
            });
          }

          // Attach click handlers to configuration options (if any)
          if (this.configOptions && this.configOptions.length > 0) {
            this.configOptions.forEach(opt => {
              opt.addEventListener('click', () => {
                const selectedConfig = opt.dataset.config || null;
                this.setConfig(selectedConfig);
              });
            });
          }

          // Determine default colour:
          // 1) if any image already has class 'active' use that image's data-colour
          // 2) else if a colour circle has class 'active' or first circle -> use its colour
          // 3) else pick the first colour key available, or null to show all
          let defaultColour = null;
          const domActiveImage = this.allImages.find(img => img.classList.contains('active'));
          if (domActiveImage && domActiveImage.dataset.colour) {
            defaultColour = domActiveImage.dataset.colour;
          } else if (this.colourCircles.length > 0) {
            const activeCircle =
              this.colourCircles.find(c => c.classList.contains('active')) ||
              this.colourCircles[0];
            if (activeCircle) defaultColour = activeCircle.dataset.colour;
          } else {
            const keys = Object.keys(this.colourMap);
            defaultColour = keys.length ? keys[0] : null;
          }

          // Determine default configuration:
          // 1) if active image has data-config -> use that
          // 2) else if a config option has .active or first one -> use its config
          let defaultConfig = null;
          if (domActiveImage && domActiveImage.dataset.config) {
            defaultConfig = domActiveImage.dataset.config;
          } else if (this.configOptions && this.configOptions.length > 0) {
            const activeCfg =
              this.configOptions.find(o => o.classList.contains('active')) ||
              this.configOptions[0];
            if (activeCfg) defaultConfig = activeCfg.dataset.config;
          }

          this.currentConfig = defaultConfig || null;

          // Apply initial config visual state
          if (this.currentConfig && this.configOptions && this.configOptions.length > 0) {
            this.configOptions.forEach(o =>
              o.classList.toggle('active', o.dataset.config === this.currentConfig)
            );
          }

          // Apply initial colour/config state
          if (defaultColour === 'default' || defaultColour == null) {
            this.setColour(null);
          } else {
            this.setColour(defaultColour);
          }
        }
      }; // end manager

      // Initialize, store manager
      manager.init();
      galleryManagers.push(manager);
    }); // end forEach product-gallery

    // Backwards-compatible global helpers (map to first gallery if present)
    window._galleryManagers = galleryManagers;
    window.showImage = function (index, galleryIdx = 0) {
      const mgr = window._galleryManagers && window._galleryManagers[galleryIdx];
      if (mgr) mgr.showImage(Number(index) || 0);
    };
    window.changeImage = function (direction, galleryIdx = 0) {
      const mgr = window._galleryManagers && window._galleryManagers[galleryIdx];
      if (mgr) mgr.changeImage(Number(direction) || 0);
    };

    // If you previously had dot click logic bound to static .gallery-dot, this script rebuilds dots
    // and binds clicks so you don't need the old event listeners.

  }); // end DOMContentLoaded
})();
