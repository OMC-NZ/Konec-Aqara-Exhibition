// Logo Index URL - EDIT for customer
function redirectToIndex() {
    window.location.href = 'https://www.aqarahome.nz/jbhifi/index.html'; //<<< note full absolute path to ensure integrity, aka aqarahome.nz/xxx/index.html
}

// Buy Now URL - EDIT for customer
function redirectToStore() {
    window.open('https://www.jbhifi.co.nz/collections/connected-home/aqara', '_blank'); //<<< note full absolute path to ensure integrity.
}


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
