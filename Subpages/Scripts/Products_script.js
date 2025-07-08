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

            // Script to handle category navigation highlighting
            document.addEventListener('DOMContentLoaded', function() {
                const categoryLinks = document.querySelectorAll('.category-nav a');
                
                // Add click event to each category link
                categoryLinks.forEach(link => {
                    link.addEventListener('click', function(e) {
                        // Remove active class from all links
                        categoryLinks.forEach(l => l.classList.remove('active'));
                        // Add active class to clicked link
                        this.classList.add('active');
                    });
                });
                
                // Handle scroll events to highlight active category
                window.addEventListener('scroll', function() {
                    let currentSection = '';
                    const sections = document.querySelectorAll('.category-section');
                    
                    sections.forEach(section => {
                        const sectionTop = section.offsetTop;
                        const sectionHeight = section.clientHeight;
                        if(window.pageYOffset >= (sectionTop - 200)) {
                            currentSection = section.getAttribute('id');
                        }
                    });
                    
                    categoryLinks.forEach(link => {
                        link.classList.remove('active');
                        if(link.getAttribute('href').substring(1) === currentSection) {
                            link.classList.add('active');
                        }
                    });
                });
            });
