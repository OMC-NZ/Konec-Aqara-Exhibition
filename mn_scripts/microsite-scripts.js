

// Hamburger Menu
function toggleMenu() {
    const menu = document.querySelector("nav ul");
    const hamburger = document.querySelector("#hamburger-menu");
    menu.classList.toggle("show");
    hamburger.classList.toggle("open");
}

// Close menu when a menu item is clicked
document.querySelectorAll("nav ul li a").forEach(link => {
    link.addEventListener("click", () => {
        const menu = document.querySelector("nav ul");
        const hamburger = document.querySelector("#hamburger-menu");
        menu.classList.remove("show");
        hamburger.classList.remove("open");
    });
});



// Smooth scrolling with header offset
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
        e.preventDefault();

        // Close the menu (in case of mobile view)
        const menu = document.querySelector("nav ul");
        menu.classList.remove("show");

        // Calculate offset position
        const targetId = this.getAttribute("href").substring(1);
        const targetSection = document.getElementById(targetId);
        const headerHeight = document.querySelector("header").offsetHeight;

        // Check if the screen is in mobile view
        const isMobile = window.innerWidth <= 768;

        // Calculate the target position, with offset unless on mobile and the target is 'home'
        let targetPosition = targetSection.offsetTop - headerHeight;
        if (isMobile && targetId === "home") {
            targetPosition = targetSection.offsetTop;
        }

        // Smooth scroll to the calculated position
        window.scrollTo({
            top: targetPosition,
            behavior: "smooth"
        });
    });
});

document.querySelectorAll('a[href="#top"]').forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault(); // Prevent default anchor behavior
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Smooth scroll effect
        });
    });
});

// Popup Box
document.addEventListener('DOMContentLoaded', () => {
    const triggerLink = document.getElementById('trigger-link');
    const popupBox = document.getElementById('popup-box');
  
    // Show the popup box
    triggerLink.addEventListener('click', (e) => {
      e.preventDefault();
      popupBox.classList.remove('hidden');
      popupBox.style.display = 'block';
    });
  
    // Hide the popup box when clicking anywhere
    document.addEventListener('click', (e) => {
      if (popupBox.style.display === 'block' && !popupBox.contains(e.target)) {
        popupBox.classList.add('hidden');
        popupBox.style.display = 'none';
      }
    });
  });

// JavaScript for accordion toggle
document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', function () {
        const content = this.nextElementSibling;
        const arrow = this.querySelector('.accordion-arrow');

        // Toggle content visibility and rotation of arrow
        content.classList.toggle('open');
        if (content.classList.contains('open')) {
            arrow.style.transform = 'rotate(180deg)'; // Rotate arrow
        } else {
            arrow.style.transform = 'rotate(0deg)'; // Reset arrow
        }
    });
});

       class BannerSlider {
            constructor() {
                this.currentSlide = 0;
                this.totalSlides = 5;
                this.autoSlideInterval = null;
                this.autoSlideDelay = 5000; // 5 seconds
                
                this.bannerContainer = document.getElementById('bannerContainer');
                this.prevBtn = document.getElementById('prevBtn');
                this.nextBtn = document.getElementById('nextBtn');
                this.dots = document.querySelectorAll('.banner-dot');
                
                this.init();
            }
            
            init() {
                // Add event listeners
                this.prevBtn.addEventListener('click', () => this.prevSlide());
                this.nextBtn.addEventListener('click', () => this.nextSlide());
                
                // Dot navigation
                this.dots.forEach((dot, index) => {
                    dot.addEventListener('click', () => this.goToSlide(index));
                });
                
                // Start auto-slide
                this.startAutoSlide();
                
                // Pause auto-slide on hover
                this.bannerContainer.addEventListener('mouseenter', () => this.pauseAutoSlide());
                this.bannerContainer.addEventListener('mouseleave', () => this.startAutoSlide());
                
                // Touch/swipe support for mobile
                this.addTouchSupport();
                
                // Handle window resize to ensure proper image display
                window.addEventListener('resize', () => this.handleResize());
            }
            
            goToSlide(slideIndex) {
                this.currentSlide = slideIndex;
                const translateX = -slideIndex * 20; // Each slide is 20% wide
                this.bannerContainer.style.transform = `translateX(${translateX}%)`;
                
                // Update active dot
                this.dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === slideIndex);
                });
            }
            
            nextSlide() {
                this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
                this.goToSlide(this.currentSlide);
            }
            
            prevSlide() {
                this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
                this.goToSlide(this.currentSlide);
            }
            
            startAutoSlide() {
                this.pauseAutoSlide(); // Clear any existing interval
                this.autoSlideInterval = setInterval(() => this.nextSlide(), this.autoSlideDelay);
            }
            
            pauseAutoSlide() {
                if (this.autoSlideInterval) {
                    clearInterval(this.autoSlideInterval);
                    this.autoSlideInterval = null;
                }
            }
            
            handleResize() {
                // Force a repaint to ensure proper image display after resize
                this.bannerContainer.style.transform = `translateX(${-this.currentSlide * 20}%)`;
            }
            
            addTouchSupport() {
                let startX = 0;
                let endX = 0;
                
                this.bannerContainer.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                    this.pauseAutoSlide();
                });
                
                this.bannerContainer.addEventListener('touchend', (e) => {
                    endX = e.changedTouches[0].clientX;
                    this.handleSwipe();
                    this.startAutoSlide();
                });
                
                this.handleSwipe = () => {
                    const swipeThreshold = 50;
                    const diff = startX - endX;
                    
                    if (Math.abs(diff) > swipeThreshold) {
                        if (diff > 0) {
                            this.nextSlide();
                        } else {
                            this.prevSlide();
                        }
                    }
                };
            }
        }
        
        // Initialize the slider when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            new BannerSlider();
        });