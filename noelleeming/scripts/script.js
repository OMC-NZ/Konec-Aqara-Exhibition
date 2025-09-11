// Update header height variable dynamically
function updateHeaderHeightVar() {
  const header = document.querySelector('header');
  if(!header) return;
  const h = header.offsetHeight || 80;
  document.documentElement.style.setProperty('--header-h', h + 'px');
}
window.addEventListener('load', updateHeaderHeightVar);
window.addEventListener('resize', updateHeaderHeightVar);

// Accordion logic + dynamic product image with smooth transition and default reset
const productDisplay = document.getElementById('product-display');
const productAccordions = document.querySelectorAll('#products .accordion-header');
const defaultImage = '../Images/Scenes/Kitchen_2_scene.jpg';
let currentTimeout = null;

productAccordions.forEach(header => {
  header.addEventListener('click', () => {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.accordion-arrow');
    const newImage = header.getAttribute('data-image');

    const isOpen = content.classList.contains('open');

    // Toggle accordion content
    content.classList.toggle('open');
    arrow.style.transform = content.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0)';

    // Close other accordions if desired (optional)
    productAccordions.forEach(h => {
      if(h !== header) {
        h.nextElementSibling.classList.remove('open');
        h.querySelector('.accordion-arrow').style.transform = 'rotate(0)';
      }
    });

    // Clear previous timeout
    if (currentTimeout) clearTimeout(currentTimeout);

    // Determine the image to show
    let imageToShow;
    const openHeader = [...productAccordions].find(h => h.nextElementSibling.classList.contains('open'));
    imageToShow = openHeader ? openHeader.getAttribute('data-image') : defaultImage;

    // Smooth fade transition
    productDisplay.style.transition = 'opacity 0.3s ease';
    productDisplay.style.opacity = 0;

    currentTimeout = setTimeout(() => {
      productDisplay.src = imageToShow;
      productDisplay.style.opacity = 1;
    }, 300);
  });
});

// Logo click scroll
const logoLink = document.querySelector('.logo a');
if (logoLink) {
  logoLink.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector('#home');
    if (target) smoothScroll(target, 1200); 
  });
}

// Custom smooth scroll with easing
function smoothScroll(target, duration = 1200) {
  const headerHeight = document.querySelector('header').offsetHeight;
  const start = window.scrollY;
  const end = target.offsetTop - headerHeight - 10; 
  const distance = end - start;
  let startTime = null;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);
    window.scrollTo(0, start + distance * easedProgress);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  requestAnimationFrame(animation);
}

// Replace nav link click handling for smooth scroll
document.querySelectorAll('nav a, .mobile-nav-overlay a').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const mobileNav = document.querySelector('.mobile-nav-overlay');
      if (mobileNav && mobileNav.classList.contains('open')) mobileNav.classList.remove('open');
      const target = document.querySelector(href);
      if (target) smoothScroll(target, 1200);
    }
  });
});

// Fade-in sections on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {threshold: 0.2});

document.querySelectorAll('section').forEach(section => observer.observe(section));

// Mobile Menu Logic
const hambBtn = document.getElementById('hamb-btn');
const mobileNav = document.querySelector('.mobile-nav-overlay');
const mobileLinks = mobileNav.querySelectorAll('li');

function closeMobileMenu() {
  mobileNav.classList.remove('open');
  hambBtn.textContent = '☰';
  mobileLinks.forEach(link => {
    link.style.opacity = '';
    link.style.transform = '';
  });
}

hambBtn.addEventListener('click', () => {
  mobileNav.classList.toggle('open');
  hambBtn.textContent = mobileNav.classList.contains('open') ? '✕' : '☰';
  
  if(mobileNav.classList.contains('open')){
    mobileLinks.forEach((link, i) => {
      link.style.opacity = '0';
      link.style.transform = 'translateY(20px)';
      setTimeout(() => {
        link.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        link.style.opacity = '1';
        link.style.transform = 'translateY(0)';
      }, i * 80); 
    });
  }
});

document.addEventListener('click', (e) => {
  if(!mobileNav.contains(e.target) && !hambBtn.contains(e.target)) closeMobileMenu();
});

mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));
