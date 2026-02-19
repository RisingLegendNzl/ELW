/**
 * Element Landscaping Waikato - Main JavaScript
 * =============================================
 *
 * Handles:
 * - Logo animation (ELW → Element Landscaping Waikato)
 * - Header scroll effects
 * - Mobile navigation
 * - Portfolio lightbox
 * - Section scroll animations
 * - Form handling (SendGrid via /api/sendQuote)
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
    animation: {
        initialDelay: 600,
        loaderFadeDelay: 2200,
        serviceTagsStartDelay: 3000,
        serviceTagsStagger: 150
    },
    scroll: {
        headerScrollThreshold: 50
    }
};

// ==================== LOGO ANIMATION ====================
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.getElementById('loader');
    const logoAnimation = document.getElementById('logoAnimation');

    setTimeout(() => {
        logoAnimation.classList.add('expanded');
    }, CONFIG.animation.initialDelay);

    setTimeout(() => {
        loader.classList.add('fade-out');
        animateServiceTags();
    }, CONFIG.animation.loaderFadeDelay);

    // ── Make the featured card visible immediately ──────────────────
    // The base .portfolio-item starts at opacity:0 so the JS observer
    // can animate cards in. The featured card overrides this in CSS
    // with !important, but we also add .visible here as a belt-and-
    // braces guarantee so no code path can leave it invisible.
    const featured = document.querySelector('.portfolio-item--featured');
    if (featured) {
        featured.classList.add('visible');
    }
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

window.addEventListener('scroll', () => {
    if (window.pageYOffset > CONFIG.scroll.headerScrollThreshold) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ==================== MOBILE NAVIGATION ====================
const mobileMenuBtn     = document.getElementById('mobileMenuBtn');
const mobileNav         = document.getElementById('mobileNav');
const mobileNavOverlay  = document.getElementById('mobileNavOverlay');
const mobileNavClose    = document.getElementById('mobileNavClose');
const mobileNavLinks    = document.querySelectorAll('.mobile-nav-links a');

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
mobileNavLinks.forEach(link => link.addEventListener('click', closeMobileNav));

// ==================== SCROLL ANIMATIONS ====================
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

// Section observer
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    sectionObserver.observe(section);
});

// Portfolio items — staggered fade-in
// The featured card already has .visible (added above) so adding it
// again here is harmless; it just won't re-trigger the transition.
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

// ── Fallback: if the observer hasn't fired after 4 s (e.g. JS disabled
//    scrolling quirks), force all portfolio items visible ──────────────
setTimeout(() => {
    document.querySelectorAll('.portfolio-item').forEach(item => {
        item.classList.add('visible');
    });
}, 4000);

// ==================== LIGHTBOX ====================
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.portfolio-item').forEach(item => {
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
    if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
});

// ==================== FORM HANDLING (SendGrid) ====================
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;

    const formData  = new FormData(contactForm);
    const data      = Object.fromEntries(formData);

    submitBtn.textContent = 'Sending…';
    submitBtn.disabled    = true;

    try {
        const response = await fetch('/api/sendQuote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            alert('Thank you for your message! We will be in touch soon.');
            contactForm.reset();
        } else {
            alert('Failed to send message: ' + (result.error || 'Please try again.'));
        }
    } catch (error) {
        alert('Failed to send message. Please try again later.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled    = false;
    }
});

// ==================== SMOOTH SCROLL ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset   = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition  = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    });
});
