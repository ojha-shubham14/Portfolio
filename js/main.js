/**
 * Main Portfolio Coordinator
 * Handles 3D Solar System lifecycle, project modals, clipboard, navigation, and hero starfield.
 */

import { SolarEngine } from './solar/SolarEngine.js';
import { PLANETS_CONFIG } from './data/projects.js';

// ES Modules are always strict — no IIFE needed

let solarEngine = null;

/* ==========================================================================
   1. HERO 2D AMBIENT STARFIELD (SUBTLE COSMIC ATMOSPHERE — NO PLANETS IN HERO)
   ========================================================================== */
function initHeroStarfield() {
  const canvas = document.getElementById('hero-starfield');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const count = Math.min(220, Math.floor((width * height) / 8000));
  const stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.2 + 0.3,
    alpha: Math.random() * 0.7 + 0.2,
    speed: Math.random() * 0.04 + 0.01,
    twinkleSpeed: Math.random() * 0.02 + 0.005,
    twinklePhase: Math.random() * Math.PI * 2
  }));

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }, { passive: true });

  let scrollOffset = 0;
  window.addEventListener('scroll', () => {
    scrollOffset = window.scrollY * 0.12;
  }, { passive: true });

  let t = 0;
  function render() {
    ctx.clearRect(0, 0, width, height);
    t += 0.03;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const posY = ((s.y - scrollOffset * s.speed * 2) % height + height) % height;
      const a = Math.max(0.05, Math.min(1.0, s.alpha + Math.sin(t * s.twinkleSpeed * 60 + s.twinklePhase) * 0.25));
      ctx.beginPath();
      ctx.arc(s.x, posY, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(219, 232, 255, ${a})`;
      ctx.fill();
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/* ==========================================================================
   2. 3D SOLAR SYSTEM INITIALIZATION
   Deferred one rAF after load so CSS has painted and container has real dimensions.
   ========================================================================== */
function initSolarSystem() {
  // Defer so the browser has painted and the container has real pixel dimensions
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const container = document.getElementById('solar-canvas-container');
      const tooltip   = document.getElementById('planet-tooltip');

      if (!container) {
        console.warn('[SolarSystem] #solar-canvas-container not found.');
        return;
      }

      // Safety: give container an explicit minimum if clientHeight is 0
      const w = container.clientWidth  || window.innerWidth;
      const h = container.clientHeight || 640;
      if (h < 10) {
        console.warn('[SolarSystem] Container height is 0 — forcing min-height via style.');
        container.style.minHeight = '640px';
        container.style.height    = '100%';
      }

      console.log(`[SolarSystem] Mounting into container ${w}×${h}px`);

      try {
        solarEngine = new SolarEngine(container, tooltip, (project, planet) => {
          openProjectModal(project, planet);
        });
      } catch (e) {
        console.error('[SolarSystem] Failed to initialize SolarEngine:', e);
        container.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-family:monospace;text-align:center;padding:20px;">
            <div><h3 style="color:#d4af37;margin-bottom:8px;">3D Render Error</h3><p>${e.message}</p></div>
          </div>`;
      }

      renderProjectExplorerList();
    });
  });
}

function renderProjectExplorerList() {
  const listEl = document.getElementById('solar-planets-list');
  if (!listEl) return;

  listEl.innerHTML = '';
  PLANETS_CONFIG.forEach(cfg => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `solar-nav-btn ${cfg.project.type === 'active' ? 'is-active-project' : ''}`;
    item.dataset.planet = cfg.id;
    item.setAttribute('aria-label', `${cfg.name} — ${cfg.project.title}`);
    item.innerHTML = `
      <span class="planet-dot" style="background-color:${cfg.color};"></span>
      <span class="planet-nav-name">${cfg.name}</span>
      <span class="planet-nav-title">${cfg.project.type === 'active' ? cfg.project.title : 'Coming Soon'}</span>
    `;
    item.addEventListener('click', () => {
      if (solarEngine) solarEngine.selectPlanetById(cfg.id);
    });
    listEl.appendChild(item);
  });
}

/* ==========================================================================
   3. PROJECT CASE STUDY MODAL CONTROLLER
   ========================================================================== */
const modal          = document.getElementById('project-modal');
const modalBackdrop  = document.getElementById('modal-backdrop');
const modalContent   = document.getElementById('modal-content');
const modalCloseBtn  = document.getElementById('modal-close-btn');

function openProjectModal(project, planet) {
  if (!modal || !modalContent) return;

  const isReal = project.type === 'active';
  const techBadges = (project.technologies || [])
    .map(t => `<span class="tech-tag">${t}</span>`).join(' ');
  const featuresHtml = (project.features || [])
    .map(f => `<li><span class="bullet">&bull;</span><span>${f}</span></li>`).join('');

  modalContent.innerHTML = `
    <div class="modal-header-meta">
      <span class="modal-destination-tag">DESTINATION // ${planet.name.toUpperCase()}</span>
      <span class="modal-status-badge ${isReal ? 'status-live' : 'status-slot'}">${project.status}</span>
    </div>
    <h2 class="modal-title" id="modal-title">${project.title}</h2>
    <p class="modal-subtitle">${project.subtitle}</p>
    <div class="modal-rule"></div>
    <div class="modal-section">
      <h3 class="modal-section-title">Overview</h3>
      <p class="modal-desc">${project.description}</p>
    </div>
    <div class="modal-section">
      <h3 class="modal-section-title">Key Architectural Features</h3>
      <ul class="modal-features-list">${featuresHtml}</ul>
    </div>
    <div class="modal-section">
      <h3 class="modal-section-title">Technologies</h3>
      <div class="tech-stack-list">${techBadges}</div>
    </div>
    <div class="modal-actions">
      ${project.demo   ? `<a href="${project.demo}"   target="_blank" rel="noopener noreferrer" class="btn btn-primary">Live Demo &nearr;</a>` : ''}
      ${project.github ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
        GitHub Repository &nearr;
      </a>` : ''}
      <button type="button" class="btn btn-outline" id="modal-return-btn">&larr; Return to Solar System</button>
    </div>
  `;

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');

  const returnBtn = document.getElementById('modal-return-btn');
  if (returnBtn) returnBtn.addEventListener('click', closeProjectModal);

  // Focus the close button for accessibility
  modalCloseBtn && modalCloseBtn.focus();
}

function closeProjectModal() {
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  if (solarEngine) solarEngine.resetView();
}

if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProjectModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeProjectModal);
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) closeProjectModal();
});

/* ==========================================================================
   4. EMAIL CLIPBOARD & TOAST FEEDBACK
   ========================================================================== */
function initEmailClipboard() {
  const copyBtn = document.getElementById('copy-email-btn');
  const toast   = document.getElementById('toast');
  if (!copyBtn || !toast) return;

  let toastTimer;
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
  };

  copyBtn.addEventListener('click', async () => {
    const email = copyBtn.dataset.email || 'ojhashubhamprofessional@gmail.com';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const ta = Object.assign(document.createElement('textarea'), { value: email });
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast('Email address copied to clipboard!');
    } catch {
      showToast(`Email: ${email}`);
    }
  });
}

/* ==========================================================================
   5. MOBILE NAVIGATION MENU
   ========================================================================== */
function initMobileNav() {
  const burger   = document.querySelector('.nav-burger');
  const navLinks = document.getElementById('site-nav');
  if (!burger || !navLinks) return;

  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.classList.toggle('is-active', isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.classList.remove('is-active');
    });
  });
}

/* ==========================================================================
   6. SCROLLSPY NAVIGATION OBSERVER
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' }).observe;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(s => io.observe(s));
}

/* ==========================================================================
   7. BOOT — Run after DOM is ready
   ========================================================================== */
function boot() {
  initHeroStarfield();
  initSolarSystem();
  initEmailClipboard();
  initMobileNav();
  initScrollSpy();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
