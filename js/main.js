/**
 * Element Landscaping Waikato - Main JavaScript
 * =============================================
 * 
 * This file contains all interactive functionality for the website:
 * - Logo animation (ELW → Element Landscaping Waikato)
 * - Header scroll effects
 * - Mobile navigation
 * - Portfolio lightbox
 * - Section scroll animations
 * - Form handling (with SendGrid integration)
 * 
 * To modify the animation timing, adjust the values in the CONFIG object below.
 */

// ==================== CONFIGURATION ====================
// Easy to maintain - change these values to adjust animation timing
const CONFIG = {
    animation: {
        initialDelay: 600,        // Delay before animation starts (ms)
        loaderFadeDelay: 2200,    // When loader starts fading out (ms)
        serviceTagsStartDelay: 3000, // When service tags start appearing (ms)
        serviceTagsStagger: 150   // Delay between each service tag (ms)
    },
    scroll: {
        headerScrollThreshold: 50 // Pixels scrolled before header changes
    }
};

// ==================== LOGO ANIMATION ====================
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const logoAnimation = document.getElementById('logoAnimation');
    
    // Start the expansion animation after initial delay
    // This triggers the CSS transitions for:
    // - Word gaps expanding (creating space between E, L, W)
    // - Hidden letter containers expanding (max-width animation)
    // - Individual letters fading in (with staggered delays defined in CSS)
    setTimeout(() => {
        logoAnimation.classList.add('expanded');
    }, CONFIG.animation.initialDelay);
    
    // Fade out loader after animation completes
    setTimeout(() => {
        loader.classList.add('fade-out');
        // Start service tags animation after loader fades
        animateServiceTags();
    }, CONFIG.animation.loaderFadeDelay);
});

// ==================== SERVICE TAGS ANIMATION ====================
function animateServiceTags() {
    const tags = document.querySelectorAll('.service-tag');
    tags.forEach((tag, index) => {
        setTimeout(() => {
            tag.classList.add('visible');
        }, CONFIG.animation.serviceTagsStartDelay + (index * CONFIG.animation.serviceTagsStagger));
    });
}

// ==================== HEADER SCROLL EFFECT ====================
const header = document.getElementById('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > CONFIG.scroll.headerScrollThreshold) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ==================== MOBILE NAVIGATION ====================
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');
const mobileNavOverlay = document.getElementById('mobileNavOverlay');
const mobileNavClose = document.getElementById('mobileNavClose');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');

function openMobileNav() {
    mobileNav.classList.add('active');
    mobileNavOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
    mobileNav.classList.remove('active');
    mobileNavOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

mobileMenuBtn.addEventListener('click', openMobileNav);
mobileNavClose.addEventListener('click', closeMobileNav);
mobileNavOverlay.addEventListener('click', closeMobileNav);
mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
});

// ==================== SCROLL ANIMATIONS (Intersection Observer) ====================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('.section').forEach(section => {
    sectionObserver.observe(section);
});

// Portfolio items animation with stagger
const portfolioObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.portfolio-item').forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.1}s`;
    portfolioObserver.observe(item);
});

// ==================== LIGHTBOX ====================
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const portfolioItems = document.querySelectorAll('.portfolio-item');

portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
        const imgSrc = item.querySelector('img').src;
        lightboxImg.src = imgSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
});

// ==================== FORM HANDLING (SendGrid Integration) ====================
const contactForm = document.getElementById('contactForm');
const submitBtn = contactForm.querySelector('.submit-btn');
const originalBtnText = submitBtn.textContent;

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message')
    };
    
    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    submitBtn.style.opacity = '0.7';
    
    try {
        // Send form data to serverless function
        const response = await fetch('/api/sendQuote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Success feedback
            submitBtn.textContent = 'Message Sent!';
            submitBtn.style.background = '#6b8f71';
            contactForm.reset();
            
            // Reset button after delay
            setTimeout(() => {
                submitBtn.textContent = originalBtnText;
                submitBtn.style.background = '';
                submitBtn.style.opacity = '';
                submitBtn.disabled = false;
            }, 3000);
        } else {
            // Error feedback
            throw new Error(result.error || 'Failed to send message');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        
        // Error feedback
        submitBtn.textContent = 'Error - Try Again';
        submitBtn.style.background = '#c45c5c';
        
        // Reset button after delay
        setTimeout(() => {
            submitBtn.textContent = originalBtnText;
            submitBtn.style.background = '';
            submitBtn.style.opacity = '';
            submitBtn.disabled = false;
        }, 3000);
    }
});

// ==================== SMOOTH SCROLL FOR ANCHOR LINKS ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});