// Sticky header
(function () {
    const header = document.getElementById('header');
    if (!header) return;
    const onScroll = () => {
        if (window.scrollY > 20) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// Mobile menu
(function () {
    const openBtn = document.getElementById('navToggle');
    const closeBtn = document.getElementById('closeMenuBtn');
    const menu = document.getElementById('mobileMenu');
    if (!openBtn || !menu) return;

    function open() {
        menu.classList.add('open');
        openBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function close() {
        menu.classList.remove('open');
        openBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
})();

// Reveal on scroll
(function () {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('active');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
})();

// Hero video: ensure autoplay resumes
(function () {
    const vid = document.querySelector('.hero-video-frame video');
    if (!vid) return;
    const tryPlay = () => { vid.play().catch(() => {}); };
    tryPlay();
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) tryPlay();
    });
})();
