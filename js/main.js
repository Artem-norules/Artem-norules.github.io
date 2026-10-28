/* ===== NORULES Core Scripts ===== */

// Page transition fade-out on load / pageshow
window.addEventListener('pageshow', () => {
    const transitionEl = document.getElementById('pageTransition');
    if (!transitionEl) return;
    setTimeout(() => {
        transitionEl.classList.remove('opacity-100');
        transitionEl.classList.add('opacity-0');
    }, 100);
});

// Smooth internal navigation with transition
document.querySelectorAll('a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.target === '_blank') return;
        const href = this.getAttribute('href');
        if (!href) return;

        if (href.startsWith('#')) {
            const sideMenu = document.getElementById('sideMenu');
            if (sideMenu) sideMenu.classList.add('translate-x-full');
            return;
        }

        try {
            const targetUrl = new URL(this.href, window.location.href);
            if (targetUrl.origin !== window.location.origin) return;

            const currentPath = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
            const targetPath = targetUrl.pathname.replace(/index\.html$/, '').replace(/\/$/, '');

            if (currentPath === targetPath) {
                const sideMenu = document.getElementById('sideMenu');
                if (sideMenu) sideMenu.classList.add('translate-x-full');
                return;
            }

            e.preventDefault();
            const sideMenu = document.getElementById('sideMenu');
            if (sideMenu) sideMenu.classList.add('translate-x-full');

            const transitionEl = document.getElementById('pageTransition');
            if (transitionEl) {
                transitionEl.classList.remove('opacity-0');
                transitionEl.classList.add('opacity-100');
            }

            setTimeout(() => {
                window.location.href = this.href;
            }, 500);
        } catch (err) {}
    });
});

// Side menu toggle
const menuBtn = document.getElementById('menuBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const sideMenu = document.getElementById('sideMenu');

if (menuBtn && sideMenu) {
    menuBtn.addEventListener('click', () => sideMenu.classList.remove('translate-x-full'));
}
if (closeMenuBtn && sideMenu) {
    closeMenuBtn.addEventListener('click', () => sideMenu.classList.add('translate-x-full'));
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sideMenu) {
        sideMenu.classList.add('translate-x-full');
    }
});

function updateGlow(e, element) {
    if (window.innerWidth < 1025) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--x', `${e.clientX - rect.left}px`);
    element.style.setProperty('--y', `${e.clientY - rect.top}px`);
}

window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add('py-3', 'bg-[#0b090c]/80', 'backdrop-blur-xl', 'border-b', 'border-white/5');
    } else {
        header.classList.remove('py-3', 'bg-[#0b090c]/80', 'backdrop-blur-xl', 'border-b', 'border-white/5');
    }
}, { passive: true });

const revealElements = document.querySelectorAll('.reveal');
const revealOnScroll = () => {
    const threshold = window.innerHeight - 80;
    for (let i = 0; i < revealElements.length; i++) {
        if (revealElements[i].getBoundingClientRect().top < threshold) {
            revealElements[i].classList.add('active');
        }
    }
};
window.addEventListener('scroll', revealOnScroll, { passive: true });
document.addEventListener('DOMContentLoaded', () => setTimeout(revealOnScroll, 200));

// Particles: grid on home; per-section union box → soft horizontal expand
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let blocks = [];
    let isVisible = true;
    let measureTick = 0;

    // large soft zone so expand/contract isn't abrupt and doesn't
    // reverse while the block is still on screen
    const V_FALLOFF = 140;

    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        buildGrid();
        collectBlocks();
        snapAll();
    }

    function buildGrid() {
        const w = canvas.width;
        const h = canvas.height;
        const isMobile = w < 768;
        const isTiny = w < 480;

        const gapX = isTiny ? 56 : (isMobile ? 48 : 42);
        const gapY = isTiny ? 56 : (isMobile ? 48 : 42);
        const cols = Math.ceil(w / gapX) + 2;
        const rows = Math.ceil(h / gapY) + 2;
        const offsetX = (w - (cols - 1) * gapX) / 2;
        const offsetY = (h - (rows - 1) * gapY) / 2;

        particles = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const gx = offsetX + c * gapX;
                const gy = offsetY + r * gapY;
                particles.push({
                    gx, gy,
                    x: gx, y: gy,
                    size: isMobile ? 1.1 : 1.35,
                    alpha: 0.18 + Math.random() * 0.1
                });
            }
        }
    }

    // One bounding box per section (all cards inside merged)
    function collectBlocks() {
        blocks = [];
        const sectionIds = ['#skills', '#about', '#pricing', '#community'];
        // projects page
        const extra = document.querySelectorAll('main');

        const sections = [];
        sectionIds.forEach((sel) => {
            const el = document.querySelector(sel);
            if (el) sections.push(el);
        });
        extra.forEach((el) => {
            if (!el.closest('#home')) sections.push(el);
        });

        const seen = new Set();
        sections.forEach((sec) => {
            if (seen.has(sec)) return;
            seen.add(sec);
            if (sec.id === 'home') return;

            const cards = sec.querySelectorAll('.glass-panel, .rounded-3xl, .rounded-2xl');
            if (!cards.length) return;

            let left = Infinity;
            let right = -Infinity;
            let top = Infinity;
            let bottom = -Infinity;
            let count = 0;

            cards.forEach((el) => {
                const r = el.getBoundingClientRect();
                if (r.width < 40 || r.height < 40) return;
                if (r.width > window.innerWidth * 0.95) return;
                left = Math.min(left, r.left);
                right = Math.max(right, r.right);
                top = Math.min(top, r.top);
                bottom = Math.max(bottom, r.bottom);
                count++;
            });

            if (count === 0 || left >= Infinity) return;

            blocks.push({
                left,
                right,
                top,
                bottom,
                width: right - left,
                cx: (left + right) / 2
            });
        });
    }

    function clamp(v, a, b) {
        return Math.max(a, Math.min(b, v));
    }

    // 1 while row is inside the block; soft fade only outside (large radius)
    function verticalInfluence(y, top, bottom) {
        if (y >= top && y <= bottom) return 1;
        if (y < top) return clamp(1 - (top - y) / V_FALLOFF, 0, 1);
        return clamp(1 - (y - bottom) / V_FALLOFF, 0, 1);
    }

    function widthToSpread(contentW) {
        const vw = window.innerWidth || 1;
        const ratio = Math.min(1, Math.max(0.28, contentW / vw));
        // stronger, smoother range: ~0.75 … 1.55
        return 0.75 + (ratio - 0.28) * (0.80 / 0.72);
    }

    // Uniform horizontal expand from viewport center, strength from nearest section box
    function targetX(gx, gy) {
        let spread = 1;

        for (let i = 0; i < blocks.length; i++) {
            const b = blocks[i];
            const v = verticalInfluence(gy, b.top, b.bottom);
            if (v <= 0.001) continue;

            const s = widthToSpread(b.width);
            const local = 1 + (s - 1) * v;
            if (local > spread) spread = local;
        }

        const cx = canvas.width / 2;
        return cx + (gx - cx) * spread;
    }

    function snapAll() {
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x = targetX(p.gx, p.gy);
            p.y = p.gy;
        }
    }

    window.addEventListener('scroll', collectBlocks, { passive: true });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setCanvasSize, 120);
    }, { passive: true });

    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
    });

    function animate() {
        if (!isVisible) {
            requestAnimationFrame(animate);
            return;
        }

        measureTick++;
        if (measureTick % 4 === 0) {
            collectBlocks();
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            const tx = targetX(p.gx, p.gy);
            p.x += (tx - p.x) * 0.12;
            p.y += (p.gy - p.y) * 0.12;

            ctx.fillStyle = `rgba(120, 91, 218, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    setCanvasSize();
    animate();
})();
