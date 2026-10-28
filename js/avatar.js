/* ===== Avatar 3D tilt – desktop only ===== */
(function () {
    const container = document.querySelector('.avatar-container');
    const inner = document.querySelector('.avatar-inner');
    if (!container || !inner) return;

    const isDesktop = () => window.innerWidth >= 1025 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function onMouseMove(e) {
        if (!isDesktop()) return;

        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Normalize -1 .. 1
        const x = (e.clientX - centerX) / (rect.width / 2);
        const y = (e.clientY - centerY) / (rect.height / 2);

        // Clamp and scale rotation (max ~12 deg)
        targetX = Math.max(-1, Math.min(1, y)) * -12; // invert Y for natural feel
        targetY = Math.max(-1, Math.min(1, x)) * 12;
    }

    function onMouseLeave() {
        targetX = 0;
        targetY = 0;
    }

    function animate() {
        currentX = lerp(currentX, targetX, 0.12);
        currentY = lerp(currentY, targetY, 0.12);

        if (isDesktop()) {
            // translateZ keeps a dedicated compositor layer and prevents the diagonal AA seam
            inner.style.transform = `translateZ(0) rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
        } else {
            inner.style.transform = 'none';
        }

        rafId = requestAnimationFrame(animate);
    }

    // Only attach listeners on desktop-capable devices
    if (window.matchMedia('(pointer: fine)').matches) {
        container.addEventListener('mousemove', onMouseMove, { passive: true });
        container.addEventListener('mouseleave', onMouseLeave);
        animate();
    }

    // Reset on resize to mobile
    window.addEventListener('resize', () => {
        if (!isDesktop()) {
            targetX = 0;
            targetY = 0;
            currentX = 0;
            currentY = 0;
            inner.style.transform = 'none';
        }
    }, { passive: true });
})();
