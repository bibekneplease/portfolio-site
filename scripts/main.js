
/* =========================================================
   BIBEK CHAUDHARY — PORTFOLIO MAIN JS
   Responsive | Accessible | Performance Optimised
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const body = document.body;
    const themeButton = document.getElementById("theme-btn");
    const mobileToggle = document.getElementById("mobile-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    /* =====================================================
       THEME MANAGEMENT
       ===================================================== */

    function applyTheme(theme) {
        const isLight = theme === "light";

        body.classList.toggle("light", isLight);
        const themeMeta = document.querySelector('meta[name="theme-color"]');
        if (themeMeta) themeMeta.setAttribute("content", isLight ? "#f4f6f8" : "#0a0a0d");

        if (themeButton) {
            themeButton.textContent = isLight ? "🌙 dark" : "☀️ light";

            themeButton.setAttribute(
                "aria-label",
                isLight ? "Switch to dark theme" : "Switch to light theme"
            );

            themeButton.setAttribute("aria-pressed", String(!isLight));
        }

        try {
            localStorage.setItem("theme", theme);
        } catch (error) {
            // Theme still works if browser storage is unavailable.
        }
    }

    let savedTheme = "light";

    try {
        savedTheme = localStorage.getItem("theme") || "light";
    } catch (error) {
        savedTheme = "light";
    }

    applyTheme(savedTheme === "dark" ? "dark" : "light");

    window.toggleTheme = function () {
        const nextTheme = body.classList.contains("light")
            ? "dark"
            : "light";

        applyTheme(nextTheme);
    };

    /* =====================================================
       MOBILE NAVIGATION
       ===================================================== */

    function closeMobileMenu() {
        if (!mobileMenu) return;

        mobileMenu.classList.remove("open");

        if (mobileToggle) {
            mobileToggle.setAttribute("aria-expanded", "false");
        }
    }

    function toggleMobileMenu() {
        if (!mobileMenu) return;

        const isOpen = mobileMenu.classList.toggle("open");

        if (mobileToggle) {
            mobileToggle.setAttribute("aria-expanded", String(isOpen));
        }
    }

    if (mobileToggle) {
        mobileToggle.addEventListener("click", toggleMobileMenu);

        mobileToggle.setAttribute("aria-expanded", "false");
        mobileToggle.setAttribute("aria-controls", "mobile-menu");
    }

    /* =====================================================
       NAVIGATION AND SMOOTH SCROLL
       ===================================================== */

    document.querySelectorAll(
        'nav a[href^="#"], #mobile-menu a[href^="#"]'
    ).forEach(anchor => {
        anchor.addEventListener("click", event => {
            const targetId = anchor.getAttribute("href");
            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "start"
            });

            closeMobileMenu();

            if (history.replaceState) {
                history.replaceState(null, "", targetId);
            }
        });
    });

    document.addEventListener("click", event => {
        if (!mobileMenu || !mobileToggle) return;

        if (
            mobileMenu.classList.contains("open") &&
            !mobileMenu.contains(event.target) &&
            !mobileToggle.contains(event.target)
        ) {
            closeMobileMenu();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMobileMenu();
        }
    });

    /* =====================================================
       SCROLL REVEAL
       ===================================================== */

    const revealElements = document.querySelectorAll(
        ".reveal, .reveal-left, .reveal-right, .reveal-scale"
    );

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach(element => {
            element.classList.add("visible");
        });
    } else {
        const revealObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.10,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }

    /* =====================================================
       ANIMATED HERO STATISTICS
       ===================================================== */

    function animateCounter(element, target, suffix = "") {
        if (prefersReducedMotion) {
            element.textContent = target.toLocaleString() + suffix;
            return;
        }

        const duration = 1600;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            const eased = 1 - Math.pow(1 - progress, 4);

            const value = Math.floor(eased * target);

            element.textContent = value.toLocaleString() + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent =
                    target.toLocaleString() + suffix;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    const statsContainer = document.querySelector(".hero-stats");

    if (statsContainer) {
        const stats = statsContainer.querySelectorAll(".stat-val");

        const startStats = () => {
            if (stats[0]) animateCounter(stats[0], 4, "+");
            if (stats[1]) animateCounter(stats[1], 2000, "+");
            if (stats[2]) animateCounter(stats[2], 500, "+");
            if (stats[3]) animateCounter(stats[3], 98, "%");
        };

        if ("IntersectionObserver" in window && !prefersReducedMotion) {
            const statsObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startStats();
                        statsObserver.disconnect();
                    }
                });
            }, { threshold: 0.25 });

            statsObserver.observe(statsContainer);
        } else {
            startStats();
        }
    }


    /* CLIENT LOGO FALLBACK — keep the ticker legible if a remote SVG is unavailable */
    document.querySelectorAll(".client-logo-item img").forEach(image => {
        image.addEventListener("error", () => {
            image.closest(".client-logo-item")?.classList.add("logo-fallback");
        }, { once: true });
    });

    /* =====================================================
       DYNAMIC FOOTER YEAR
       ===================================================== */

    const yearElement = document.getElementById("year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    /* =====================================================
       HERO CANVAS — NETWORK ANIMATION
       ===================================================== */

    const canvas = document.getElementById("hero-canvas");

    if (
        canvas &&
        !prefersReducedMotion &&
        window.matchMedia("(min-width: 681px)").matches
    ) {
        const ctx = canvas.getContext("2d");

        if (ctx) {
            let width = 0;
            let height = 0;
            let nodes = [];
            let animationId;
            let lastFrame = 0;
            const frameInterval = 1000 / 30;

            const symbols =
