/* ==========================================================
   NAVORI | A Little Taste of Happiness
   ========================================================== */

(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Header shadow after scrolling ---------- */

    var navbar = document.getElementById('navbar');

    function updateHeader() {
        navbar.classList.toggle('is-scrolled', window.scrollY > 20);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });


    /* ---------- Mobile menu ---------- */

    var menuToggle = document.getElementById('menuToggle');
    var navMenu = document.getElementById('navMenu');

    function setMenu(open) {
        navMenu.classList.toggle('active', open);
        menuToggle.textContent = open ? '✕' : '☰';
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    menuToggle.addEventListener('click', function () {
        setMenu(!navMenu.classList.contains('active'));
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            setMenu(false);
            menuToggle.focus();
        }
    });


    /* ---------- Highlight the nav link for the section in view ---------- */

    var navLinks = Array.from(navMenu.querySelectorAll('a'));
    var navSections = navLinks
        .map(function (link) { return document.querySelector(link.getAttribute('href')); })
        .filter(Boolean);

    if ('IntersectionObserver' in window) {
        var navObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                navLinks.forEach(function (link) {
                    link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        navSections.forEach(function (section) { navObserver.observe(section); });
    }


    /* ---------- Images that fail to load keep their soft placeholder ---------- */

    document.querySelectorAll('.photo img').forEach(function (img) {
        function markBroken() { img.classList.add('is-broken'); }
        img.addEventListener('error', markBroken);
        if (img.complete && img.naturalWidth === 0 && img.currentSrc) markBroken();
    });


    /* ---------- Gentle reveal on scroll ---------- */

    if ('IntersectionObserver' in window && !reduceMotion) {
        var revealItems = document.querySelectorAll('.story-content, .product-card, .dunk-content, .gallery-grid');

        revealItems.forEach(function (item, i) {
            item.classList.add('reveal');
            item.style.setProperty('--d', (i % 3) * 0.1 + 's');
        });

        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        revealItems.forEach(function (item) { revealObserver.observe(item); });
    }


    /* ---------- Gallery lightbox ---------- */

    var lightbox = document.getElementById('lightbox');
    var lbImg = document.getElementById('lbImg');
    var lbAlt = document.getElementById('lbAlt');
    var lbClose = document.getElementById('lbClose');
    var lbPrev = document.getElementById('lbPrev');
    var lbNext = document.getElementById('lbNext');

    var triggers = Array.from(document.querySelectorAll('[data-lightbox]'));
    var current = 0;
    var lastTrigger = null;

    function showPhoto(index) {
        current = (index + triggers.length) % triggers.length;
        var img = triggers[current].querySelector('img');
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lbAlt.textContent = img.alt;
    }

    function openLightbox(index) {
        lastTrigger = triggers[index];
        showPhoto(index);
        if (typeof lightbox.showModal === 'function') {
            lightbox.showModal();
        } else {
            lightbox.setAttribute('open', '');
        }
        lbClose.focus();
    }

    function closeLightbox() {
        if (typeof lightbox.close === 'function') {
            lightbox.close();
        } else {
            lightbox.removeAttribute('open');
        }
    }

    triggers.forEach(function (btn, i) {
        btn.addEventListener('click', function () { openLightbox(i); });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { showPhoto(current - 1); });
    lbNext.addEventListener('click', function () { showPhoto(current + 1); });

    // Click on the dark backdrop closes the viewer
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') showPhoto(current - 1);
        if (e.key === 'ArrowRight') showPhoto(current + 1);
    });

    // Return focus to the photo that was opened (also covers Esc)
    lightbox.addEventListener('close', function () {
        if (lastTrigger) lastTrigger.focus();
    });
})();
