/**
 * Element Landscaping Waikato - Main JavaScript
 * =============================================
 *
 * Handles:
 * - Logo animation (ELW → Element Landscaping Waikato)
 * - Header scroll effects
 * - Mobile navigation
 * - Portfolio slideshow (auto-advance with 1.5s cooldown)
 * - Lightbox
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
    },
    slideshow: {
        cooldown: 1500   // 1.5 seconds between transitions
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

    // Initialise the slideshow once the DOM is ready
    initSlideshow();
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

// ==================== SLIDESHOW ====================
function initSlideshow() {
    const slides       = document.querySelectorAll('.slideshow-slide');
    const dotsContainer = document.getElementById('slideshowDots');
    const prevBtn      = document.getElementById('slideshowPrev');
    const nextBtn      = document.getElementById('slideshowNext');
    const progressBar  = document.getElementById('slideshowProgressBar');

    if (!slides.length) return;

    let currentIndex = 0;
    let isTransitioning = false;
    let autoTimer = null;
    let progressTimer = null;

    // ── Build dot indicators ──
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('slideshow-dot');
        if (i === 0) dot.classList.add('active');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.slideshow-dot');

    // ── Navigate to a specific slide ──
    function goToSlide(nextIndex) {
        if (isTransitioning || nextIndex === currentIndex) return;
        isTransitioning = true;

        // Mark outgoing slide
        const outgoing = slides[currentIndex];
        outgoing.classList.remove('active');
        outgoing.classList.add('exiting');

        // Mark incoming slide
        const incoming = slides[nextIndex];
        incoming.classList.add('active');

        // Update dots
        dots[currentIndex].classList.remove('active');
        dots[nextIndex].classList.add('active');

        currentIndex = nextIndex;

        // Clean up exiting class after transition ends
        setTimeout(() => {
            outgoing.classList.remove('exiting');
            isTransitioning = false;
        }, 800); // matches CSS transition duration

        // Restart auto-advance timer
        resetAutoAdvance();
    }

    function nextSlide() {
        goToSlide((currentIndex + 1) % slides.length);
    }

    function prevSlide() {
        goToSlide((currentIndex - 1 + slides.length) % slides.length);
    }

    // ── Progress bar + auto-advance ──
    function startProgressBar() {
        // Reset bar instantly
        progressBar.classList.remove('animating');
        progressBar.style.width = '0%';

        // Force reflow so the reset takes effect before we animate
        void progressBar.offsetWidth;

        // Animate to 100% over the cooldown duration
        progressBar.classList.add('animating');
        // The CSS transition-duration for .animating is 1.5s (matches cooldown)
    }

    function resetAutoAdvance() {
        clearTimeout(autoTimer);
        startProgressBar();
        autoTimer = setTimeout(() => {
            nextSlide();
        }, CONFIG.slideshow.cooldown);
    }

    // ── Button listeners ──
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // ── Keyboard support ──
    document.addEventListener('keydown', (e) => {
        // Only respond if the slideshow section is roughly in view
        const rect = document.getElementById('slideshow').getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) return;

        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });

    // ── Touch / swipe support ──
    let touchStartX = 0;
    let touchEndX = 0;
    const viewport = document.querySelector('.slideshow-viewport');

    viewport.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    viewport.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? nextSlide() : prevSlide();
        }
    }, { passive: true });

    // ── Pause on hover (optional nicety) ──
    const slideshowEl = document.getElementById('slideshow');
    slideshowEl.addEventListener('mouseenter', () => {
        clearTimeout(autoTimer);
        progressBar.classList.remove('animating');
        // Freeze bar at current visual width
        const computed = getComputedStyle(progressBar).width;
        progressBar.style.width = computed;
    });

    slideshowEl.addEventListener('mouseleave', () => {
        resetAutoAdvance();
    });

    // ── Lightbox on slide click ──
    slides.forEach(slide => {
        slide.addEventListener('click', () => {
            const imgSrc = slide.querySelector('img').src;
            lightboxImg.src = imgSrc;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    // ── Start auto-advance ──
    resetAutoAdvance();
}

// ==================== LIGHTBOX ====================
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

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
