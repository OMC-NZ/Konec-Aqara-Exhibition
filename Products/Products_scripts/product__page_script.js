// Logo Index URL - EDIT for customer
function redirectToIndex() {
    window.location.href = 'https://www.aqarahome.nz/Noel_Leeming/index.html'; //<<< note full absolute path to ensure integrity, aka aqarahome.nz/xxx/index.html
}

// Hamburger Menu
function toggleMenu() {
    const menu = document.querySelector("nav ul");
    const hamburger = document.querySelector("#hamburger-menu");
    menu.classList.toggle("show");
    hamburger.classList.toggle("open");
}

// Function to close menu
function closeMenu() {
    const menu = document.querySelector("nav ul");
    const hamburger = document.querySelector("#hamburger-menu");
    menu.classList.remove("show");
    hamburger.classList.remove("open");
}

// Close menu when clicking outside
document.addEventListener("click", function(event) {
    const menu = document.querySelector("nav ul");
    const hamburger = document.querySelector("#hamburger-menu");
    const mainMenu = document.querySelector("#main-menu");
    
    // Check if menu is open and click is outside the menu area
    if (menu.classList.contains("show")) {
        // If click is not on the hamburger button or inside the menu
        if (!hamburger.contains(event.target) && !menu.contains(event.target)) {
            closeMenu();
        }
    }
});

// Touch/swipe handling for mobile
let touchStartY = 0;
let touchStartX = 0;

document.addEventListener("touchstart", function(event) {
    touchStartY = event.touches[0].clientY;
    touchStartX = event.touches[0].clientX;
});

document.addEventListener("touchend", function(event) {
    const menu = document.querySelector("nav ul");
    
    if (!menu.classList.contains("show")) return;
    
    const touchEndY = event.changedTouches[0].clientY;
    const touchEndX = event.changedTouches[0].clientX;
    const diffY = touchStartY - touchEndY;
    const diffX = touchStartX - touchEndX;
    
    // Minimum swipe distance
    const minSwipeDistance = 50;
    
    // Close menu on upward swipe or significant horizontal swipe
    if (Math.abs(diffY) > minSwipeDistance || Math.abs(diffX) > minSwipeDistance) {
        // Check if the touch didn't start or end within the menu area
        const menuRect = menu.getBoundingClientRect();
        const touchStartInMenu = (
            touchStartX >= menuRect.left && 
            touchStartX <= menuRect.right && 
            touchStartY >= menuRect.top && 
            touchStartY <= menuRect.bottom
        );
        
        if (!touchStartInMenu) {
            closeMenu();
        }
    }
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

document.addEventListener('DOMContentLoaded', function() {
    // Gallery functionality
    const galleryDots = document.querySelectorAll('.gallery-dot');
    const galleryImages = document.querySelectorAll('.gallery-container img');
    
    galleryDots.forEach(dot => {
      dot.addEventListener('click', function() {
        const index = this.getAttribute('data-index');
        
        // Remove active class from all images and dots
        galleryImages.forEach(img => img.classList.remove('active'));
        galleryDots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to selected image and dot
        galleryImages[index].classList.add('active');
        this.classList.add('active');
      });
    });
  });

// Gallery functionality
let currentImageIndex = 0;
const totalImages = document.querySelectorAll('.gallery-container img').length;

// Function to show specific image
function showImage(index) {
    const images = document.querySelectorAll('.gallery-container img');
    const dots = document.querySelectorAll('.gallery-dot');
    
    // Remove active class from all images and dots
    images.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active class to current image and dot
    images[index].classList.add('active');
    dots[index].classList.add('active');
    
    currentImageIndex = index;
}

// Function to change image (for arrow navigation)
function changeImage(direction) {
    let newIndex = currentImageIndex + direction;
    
    // Loop around if at the end or beginning
    if (newIndex >= totalImages) {
        newIndex = 0;
    } else if (newIndex < 0) {
        newIndex = totalImages - 1;
    }
    
    showImage(newIndex);
}