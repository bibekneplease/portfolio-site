import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.querySelector("#particle-field");
const grid = document.querySelector("#notes-grid");
const searchInput = document.querySelector("#note-search");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
let activeFilter = "all";
let articles = [];

document.querySelector("#year").textContent = new Date().getFullYear();

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function cardTemplate(article) {
  const available = article.status === "published" && article.url;
  const statusText = article.status === "review" ? "In editorial review" : available ? "Read article" : "Coming soon";
  const statusClass = article.status === "review" ? "review" : "upcoming";
  const action = available
    ? `<a href="${escapeHTML(article.url)}">Read note ↗</a>`
    : `<span>${statusText}</span>`;
  return `<article class="note-card" data-tilt>
    <div class="card-top"><span class="category">${escapeHTML(article.categoryLabel)}</span><span class="status ${statusClass}">${statusText}</span></div>
    <div class="card-icon" aria-hidden="true">${escapeHTML(article.icon || "⌘")}</div>
    <h3>${escapeHTML(article.title)}</h3>
    <p>${escapeHTML(article.description)}</p>
    <div class="card-bottom"><span>${escapeHTML(article.readingTime || "Field note")}</span>${action}</div>
  </article>`;
}

function renderNotes() {
  const term = (searchInput.value || "").trim().toLowerCase();
  const visible = articles.filter(article => {
    const matchesCategory = activeFilter === "all" || article.category === activeFilter;
    const haystack = [article.title, article.description, article.categoryLabel, ...(article.tags || [])].join(" ").toLowerCase();
    return matchesCategory && haystack.includes(term);
  });
  grid.innerHTML = visible.length
    ? visible.map(cardTemplate).join("")
    : '<p class="empty-state">No notes match that search. Try another keyword or category.</p>';
  attachTilt();
}

function attachTilt() {
  if (reducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  grid.querySelectorAll("[data-tilt]").forEach(card => {
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--pointer-x", `${x * 100}%`);
      card.style.setProperty("--pointer-y", `${y * 100}%`);
      card.style.transform = `rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
      card.style.removeProperty("--pointer-x");
      card.style.removeProperty("--pointer-y");
    });
  });
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    renderNotes();
  });
});
searchInput.addEventListener("input", renderNotes);

fetch("../data/field-notes.json")
  .then(response => {
    if (!response.ok) throw new Error("The notes index could not be loaded.");
    return response.json();
  })
  .then(data => {
    articles = data.articles || [];
    renderNotes();
  })
  .catch(() => {
    grid.innerHTML = '<p class="empty-state">The notes library is temporarily unavailable. Please try again later.</p>';
  });

function startParticleField() {
  if (!canvas || reducedMotion || !window.matchMedia("(min-width: 681px)").matches) return;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (error) {
    return; // The page remains fully usable without WebGL.
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 18;

  const count = Math.min(950, Math.floor(window.innerWidth * 0.65));
  const positions = new Float32Array(count * 3);
  const basePositions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = basePositions[i3] = (Math.random() - 0.5) * 34;
    positions[i3 + 1] = basePositions[i3 + 1] = (Math.random() - 0.5) * 22;
    positions[i3 + 2] = basePositions[i3 + 2] = (Math.random() - 0.5) * 18;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0x55e0c2, size: 0.035, transparent: true, opacity: 0.7, depthWrite: false });
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const pointer = { x: 0, y: 0 };
  window.addEventListener("pointermove", event => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let frame;
  const clock = new THREE.Clock();
  function animate() {
    frame = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const attribute = geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      attribute.array[i3 + 1] = basePositions[i3 + 1] + Math.sin(t * 0.24 + basePositions[i3] * 0.16) * 0.22;
    }
    attribute.needsUpdate = true;
    particles.rotation.y += (pointer.x * 0.045 - particles.rotation.y) * 0.012;
    particles.rotation.x += (-pointer.y * 0.035 - particles.rotation.x) * 0.012;
    renderer.render(scene, camera);
  }
  animate();

  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  };
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else if (!document.hidden) animate();
  });
}
startParticleField();
