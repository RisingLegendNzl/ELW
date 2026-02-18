/**
 * Element Landscaping Waikato - Main JavaScript
 * =============================================
 *
 * - Logo animation (ELW → Element Landscaping Waikato)
 * - Header scroll effects
 * - Mobile navigation
 * - Gallery grid with lightbox
 * - Section scroll animations
 * - Form handling
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

// ==================== SCROLL ANIMATIONS (Intersection Observer) ====================
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    sectionObserver.observe(section);
});

// ==================== GALLERY GRID — staggered entrance ====================
const galleryCells = document.querySelectorAll('.gallery-cell');

const galleryObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            // Stagger each cell by its index in the NodeList
            const idx = [...galleryCells].indexOf(entry.target);
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, idx * 70);
            galleryObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.05 });

galleryCells.forEach(cell => galleryObserver.observe(cell));

// ==================== GALLERY LIGHTBOX ====================
const lightbox        = document.getElementById('galleryLightbox');
const lbBackdrop      = document.getElementById('galleryLightboxBackdrop');
const lbImg           = document.getElementById('galleryLbImg');
const lbCaption       = document.getElementById('galleryLbCaption');
const lbCounter       = document.getElementById('galleryLbCounter');
const lbClose         = document.getElementById('galleryLbClose');
const lbPrev          = document.getElementById('galleryLbPrev');
const lbNext          = document.getElementById('galleryLbNext');

// Build ordered array from gallery cells
const galleryItems = [...galleryCells].map(cell => ({
    src:     cell.dataset.src,
    caption: cell.dataset.caption || ''
}));

let currentIndex = 0;

function openLightbox(index) {
    currentIndex = index;
    renderLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
}

function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    // Return focus to the triggering cell
    galleryCells[currentIndex].focus();
}

function renderLightbox() {
    const item = galleryItems[currentIndex];

    // Brief fade-out then swap src
    lbImg.style.opacity = '0';
    setTimeout(() => {
        lbImg.src    = item.src;
        lbImg.alt    = item.caption;
        lbImg.style.opacity = '1';
    }, 140);

    lbCaption.textContent = item.caption;
    lbCounter.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
}

function showPrev() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    renderLightbox();
}

function showNext() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    renderLightbox();
}

// Open on cell click
galleryCells.forEach((cell, idx) => {
    cell.addEventListener('click', () => openLightbox(idx));
});

// Controls
lbClose.addEventListener('click', closeLightbox);
lbBackdrop.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
lbNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showPrev();
    if (e.key === 'ArrowRight')  showNext();
});

// Touch/swipe support for lightbox
let touchStartX = 0;

lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) < 40) return;   // ignore tiny taps
    if (delta < 0) showNext();
    else           showPrev();
});

// Smooth img transition
lbImg.style.transition = 'opacity 0.14s ease';

// ==================== FORM HANDLING ====================
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    // To integrate with a real backend, replace this block with:
    // fetch('/api/sendQuote', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data)
    // })
    // .then(response => response.json())
    // .then(result => { /* handle success */ })
    // .catch(error => { /* handle error */ });

    alert('Thank you for your message! We will be in touch soon.');
    contactForm.reset();
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
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    });
});
