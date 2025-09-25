/* Full site JS - replace the existing JS with this block
   - Keeps redirect, menu, smooth scroll behaviors
   - Replaces & standardises gallery logic (colour-aware, per-gallery)
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

      // Find colour circles that are "related" to this gallery:
      const scope = productGallery.closest('.section1-content') || productGallery.closest('section') || document;
      const colourCircles = Array.from(scope.querySelectorAll('.available-colours .colour-circle'));

      // Build a mapping of colour -> array of images (in DOM order)
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
        colourMap,
        currentColour: null,
        currentIndex: 0,

        // Return array of images for currentColour (or all images if null)
        getActiveImages() {
          if (!this.currentColour) {
            // if no explicit colour, treat all images with display != 'none' as active
            return this.allImages.filter(img => img.style.display !== 'none');
          }
          return this.colourMap[this.currentColour] ? Array.from(this.colourMap[this.currentColour]) : [];
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

        // Display the image at index within the active images
        showImage(index) {
          const activeImages = this.getActiveImages();
          if (!activeImages || activeImages.length === 0) return;

          // wrap index
          if (index < 0) index = activeImages.length - 1;
          if (index >= activeImages.length) index = 0;

          // Remove 'active' from all images (keeps other colours unaffected)
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

        // Set/Change the active colour, show/hide images accordingly, rebuild dots
        setColour(colour) {
          this.currentColour = colour == null ? null : String(colour);

          if (this.currentColour === null) {
            // show all images
            this.allImages.forEach(img => {
              img.style.display = '';
              img.classList.remove('active');
            });
          } else {
            // show only the images matching the colour (rest hidden)
            this.allImages.forEach(img => {
              if (img.dataset.colour === this.currentColour) {
                img.style.display = '';
              } else {
                img.style.display = 'none';
              }
              img.classList.remove('active');
            });
          }

          // rebuild dots and reset to first image in set
          this.rebuildDots();
          this.currentIndex = 0;
          this.showImage(0);
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
                // mark selected visual state on circles (non-invasive)
                this.colourCircles.forEach(c => c.classList.toggle('selected', c === circle));
                const selectedColour = circle.dataset.colour || null;
                this.setColour(selectedColour);
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
            const activeCircle = this.colourCircles.find(c => c.classList.contains('active')) || this.colourCircles[0];
            if (activeCircle) defaultColour = activeCircle.dataset.colour;
          } else {
            const keys = Object.keys(this.colourMap);
            defaultColour = keys.length ? keys[0] : null;
          }

          // Apply initial state
          if (defaultColour === 'default' || defaultColour == null) {
            // If default or null, show all images
            this.setColour(defaultColour === 'default' ? null : null);
          } else {
            // select the default colour circle visually (if present)
            this.colourCircles.forEach(c => c.classList.toggle('selected', c.dataset.colour === defaultColour));
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
