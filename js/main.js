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

// Close menu on escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sideMenu) {
        sideMenu.classList.add('translate-x-full');
    }
});

// Card glow mouse tracking (desktop only)
function updateGlow(e, element) {
    if (window.innerWidth < 1025) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--x', `${e.clientX - rect.left}px`);
    element.style.setProperty('--y', `${e.clientY - rect.top}px`);
}

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (!header) return;
    if (window.scrollY > 50) {
        header.classList.add('py-3', 'bg-[#0b090c]/80', 'backdrop-blur-xl', 'border-b', 'border-white/5');
    } else {
        header.classList.remove('py-3', 'bg-[#0b090c]/80', 'backdrop-blur-xl', 'border-b', 'border-white/5');
    }
}, { passive: true });

// Reveal on scroll
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

// Particle background (optimized for mobile)
(function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let animationId = null;
    let isVisible = true;

    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    setCanvasSize();

    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setCanvasSize, 150);
    }, { passive: true });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.speedY = (Math.random() - 0.5) * 0.2;
            this.alpha = Math.random() * 0.4 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
            if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
        }
        draw() {
            ctx.fillStyle = `rgba(120, 91, 218, ${this.alpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Fewer particles on mobile / small screens
    const isMobile = window.innerWidth < 768;
    const isTiny = window.innerWidth < 480;
    const particleCount = isTiny ? 20 : (isMobile ? 35 : 80);

    for (let i = 0; i < particleCount; i++) {
        particlesArray.push(new Particle());
    }

    function animate() {
        if (!isVisible) {
            animationId = requestAnimationFrame(animate);
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        animationId = requestAnimationFrame(animate);
    }

    // Pause when tab is hidden (battery / performance)
    document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
    });

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return; // no particles
    }

    animate();
})();
