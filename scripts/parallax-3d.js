/* Accessible, lightweight 3D parallax enhancement.
   No framework or WebGL dependency; all portfolio content remains in the DOM. */
(() => {
  "use strict";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const sectionIds = ["about", "recommendations", "experience", "skills", "certifications", "featured", "projects", "notes", "contact"];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;

  const cardSelector = ".job, .cert, .skill-group, .case-study, .bento-card, .rec-card, .recommendation-card, .note-card, .project-card";
  const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"], #mobile-menu a[href^="#"], .spatial-nav a[href^="#"]'));
  const activeLinks = new Map();

  sections.forEach(section => {
    section.classList.add("parallax-section");
    const stage = document.createElement("div");
    stage.className = "parallax-stage";
    stage.dataset.tone = section.id === "recommendations" ? "reviews" :
      section.id === "featured" ? "work" : section.id;
    stage.setAttribute("aria-hidden", "true");
    // Keep the decorative spatial background, but do not render diagnostic HUD text.
    stage.innerHTML = '<span class="parallax-orb"></span><span class="parallax-ring"></span><span class="parallax-beam"></span>';
    section.prepend(stage);

    section.querySelectorAll(cardSelector).forEach(card => {
      card.classList.add("parallax-depth-card");
    });
    const matchingLinks = navLinks.filter(link => link.getAttribute("href") === "#" + section.id);
    if (matchingLinks.length) activeLinks.set(section.id, matchingLinks);
  });

  if (reducedMotion.matches) return;

  let scrollFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let pointerFrame = 0;
  const visible = new Set(sections);

  const updateScroll = () => {
    scrollFrame = 0;
    const viewportHeight = window.innerHeight || 1;
    visible.forEach(section => {
      const rect = section.getBoundingClientRect();
      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const centered = Math.max(-1, Math.min(1, (progress - 0.5) * 2));
      section.style.setProperty("--section-progress", centered.toFixed(3));
      const stage = section.querySelector(".parallax-stage");
      if (stage) stage.style.transform = "translate3d(0," + (centered * -22).toFixed(1) + "px,0)";
    });
  };
  const requestScroll = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      });
      requestScroll();
    }, { rootMargin: "15% 0px 15% 0px" });
    sections.forEach(section => observer.observe(section));
  }

  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll, { passive: true });
  requestScroll();

  if (finePointer.matches) {
    document.addEventListener("pointermove", event => {
      pointerX = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      pointerY = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        sections.forEach(section => {
          const rect = section.getBoundingClientRect();
          if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
          const stage = section.querySelector(".parallax-stage");
          if (!stage) return;
          stage.style.setProperty("--px", pointerX.toFixed(3));
          stage.style.setProperty("--py", pointerY.toFixed(3));
        });
      });
    }, { passive: true });

    document.querySelectorAll(".parallax-depth-card").forEach(card => {
      let frame = 0;
      card.addEventListener("pointermove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          card.style.setProperty("--tilt-x", (-y * 5).toFixed(2) + "deg");
          card.style.setProperty("--tilt-y", (x * 6).toFixed(2) + "deg");
        });
      });
      card.addEventListener("pointerleave", () => {
        if (frame) cancelAnimationFrame(frame);
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  if ("IntersectionObserver" in window && activeLinks.size) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const links = activeLinks.get(entry.target.id);
        if (links && entry.isIntersecting) {
          navLinks.forEach(item => item.classList.remove("parallax-active-link"));
          links.forEach(link => link.classList.add("parallax-active-link"));
        }
      });
    }, { rootMargin: "-25% 0px -60% 0px", threshold: 0 });
    sections.forEach(section => navObserver.observe(section));
  }

  reducedMotion.addEventListener?.("change", event => {
    if (event.matches) {
      sections.forEach(section => {
        const stage = section.querySelector(".parallax-stage");
        if (stage) stage.style.transform = "";
        section.querySelectorAll(".parallax-depth-card").forEach(card => {
          card.style.setProperty("--tilt-x", "0deg");
          card.style.setProperty("--tilt-y", "0deg");
        });
      });
    }
  });
})();
