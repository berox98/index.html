// Animate elements on scroll
function animateOnScroll() {
    const features = document.querySelectorAll('.feature');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    features.forEach(feature => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(50px)';
        feature.style.transition = 'all 0.6s ease-out';
        observer.observe(feature);
    });
}

// Animate hero section on load
function animateHero() {
    gsap.from('.hero h1', {
        duration: 1.2,
        y: 100,
        opacity: 0,
        ease: 'power4.out',
        delay: 0.5
    });

    gsap.from('.hero p', {
        duration: 1.2,
        y: 50,
        opacity: 0,
        ease: 'power4.out',
        delay: 0.8
    });

    gsap.from('.cta-buttons', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power4.out',
        delay: 1.1
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Add animation for exchange cards
function animateExchangeCards() {
    const cards = document.querySelectorAll('.exchange-card');
    const goal = document.querySelector('.raydium-goal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });

    goal.style.opacity = '0';
    goal.style.transform = 'translateY(50px)';
    goal.style.transition = 'all 0.8s ease-out';
    observer.observe(goal);
}

// Enhance mobile navigation behavior
function initMobileNav() {
    const nav = document.querySelector('nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Add scrolled class for background
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Auto-hide nav on scroll down, show on scroll up
        if (currentScroll > lastScroll && currentScroll > 100) {
            nav.style.transform = 'translateY(-100%)';
        } else {
            nav.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
}

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    animateHero();
    animateOnScroll();
    animateExchangeCards();
    initMobileNav();
    
    const tokenAddress = document.querySelector('.token-address');
    
    tokenAddress.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(tokenAddress.textContent);
            
            // Visual feedback
            tokenAddress.style.backgroundColor = 'rgba(0, 255, 136, 0.2)';
            setTimeout(() => {
                tokenAddress.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            }, 200);
            
            // Show "Copied!" message
            tokenAddress.setAttribute('data-original', tokenAddress.textContent);
            tokenAddress.textContent = 'Copied!';
            setTimeout(() => {
                tokenAddress.textContent = tokenAddress.getAttribute('data-original');
            }, 1000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
    const scroll = window.pageYOffset;
    const header = document.querySelector('header');
    header.style.backgroundPosition = `center ${scroll * 0.5}px`;
});

// Animate pizza logo
const pizzaLogo = document.querySelector('.pizza-logo');
gsap.to(pizzaLogo, {
    scale: 1.1,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut'
});