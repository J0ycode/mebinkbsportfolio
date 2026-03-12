/**
 * Premium Portfolio — Smooth Scroll & Interactions
 * Inspired by Stripe, Linear, Apple product pages
 */

window.addEventListener('load', () => {

    // =========================================================================
    //  1. Initialize Lucide Icons
    // =========================================================================
    lucide.createIcons();

    // =========================================================================
    //  2. Lenis Smooth Scroll — buttery inertia-based scrolling
    // =========================================================================
    const lenis = new Lenis({
        duration: 1.2,               // scroll duration (higher = smoother)
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo decay
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
    });

    // RAF loop — keeps Lenis ticking at 60fps+
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // =========================================================================
    //  3. Set Current Year in Footer
    // =========================================================================
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // =========================================================================
    //  4. Sticky Header with Scroll-Aware Transitions
    // =========================================================================
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    let lastScrollY = 0;
    let ticking = false;

    const updateHeader = () => {
        const scrollY = window.scrollY;

        // Add/remove scrolled class
        if (scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Hide header on scroll down, show on scroll up (after 300px)
        if (scrollY > 300) {
            if (scrollY > lastScrollY && scrollY - lastScrollY > 5) {
                header.style.transform = 'translateY(-100%)';
            } else if (lastScrollY - scrollY > 5) {
                header.style.transform = 'translateY(0)';
            }
        } else {
            header.style.transform = 'translateY(0)';
        }

        // Active Navigation Link
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') && link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });

        lastScrollY = scrollY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });

    updateHeader(); // Initial check

    // =========================================================================
    //  5. Mobile Menu Toggle
    // =========================================================================
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = mobileMenu.classList.contains('active') ? 'x' : 'menu';
            mobileToggle.innerHTML = `<i data-lucide="${icon}"></i>`;
            lucide.createIcons();
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileToggle.innerHTML = `<i data-lucide="menu"></i>`;
                lucide.createIcons();
            });
        });
    }

    // =========================================================================
    //  6. Scroll Reveal — Staggered, GPU-accelerated animations
    // =========================================================================
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const revealCallback = (entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add stagger delay if not already set via inline style
                const existingDelay = entry.target.style.getPropertyValue('--delay');
                if (!existingDelay) {
                    // Find siblings with reveal classes to calculate stagger
                    const parent = entry.target.parentElement;
                    if (parent) {
                        const siblings = parent.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
                        const siblingIndex = Array.from(siblings).indexOf(entry.target);
                        if (siblingIndex > 0) {
                            entry.target.style.setProperty('--delay', `${siblingIndex * 0.08}s`);
                        }
                    }
                }

                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // =========================================================================
    //  7. Parallax-Lite — Subtle depth on hero elements
    // =========================================================================
    const heroVisual = document.querySelector('.hero-visual');
    const heroBadge = document.querySelector('.experience-badge');

    if (heroVisual) {
        lenis.on('scroll', ({ scroll }) => {
            const speed = 0.08;
            const offset = scroll * speed;
            heroVisual.style.transform = `translateY(${offset}px)`;

            if (heroBadge) {
                heroBadge.style.transform = `translateY(${offset * 0.5}px)`;
            }
        });
    }

    // =========================================================================
    //  8. Animated Counters — eased with cubic bezier
    // =========================================================================
    const counters = document.querySelectorAll('.counter');
    const counterSection = document.getElementById('counter-section');
    let countersAnimated = false;

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const animateCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2500;
            const startTime = performance.now();

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutExpo(progress);
                const current = Math.ceil(easedProgress * target);

                counter.innerText = current;

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target;
                }
            };
            requestAnimationFrame(updateCounter);
        });
    };

    if (counterSection && counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !countersAnimated) {
                animateCounters();
                countersAnimated = true;
                counterObserver.unobserve(counterSection);
            }
        }, { threshold: 0.3 });

        counterObserver.observe(counterSection);
    }

    // =========================================================================
    //  9. Smooth Anchor Scrolling — powered by Lenis
    // =========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, {
                    offset: -80,   // Account for fixed header
                    duration: 1.5, // Smooth glide duration
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                });
            }
        });
    });

    // =========================================================================
    //  10. Section Divider Lines — progressive reveal
    // =========================================================================
    const dividers = document.querySelectorAll('.divider');
    const dividerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                dividerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    dividers.forEach(d => dividerObserver.observe(d));

    // =========================================================================
    //  11. Prefers Reduced Motion — respect accessibility
    // =========================================================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
        lenis.destroy();
        // Make all reveals instant
        revealElements.forEach(el => {
            el.style.transition = 'none';
            el.classList.add('active');
        });
    }
});
