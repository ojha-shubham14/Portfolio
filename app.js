/**
 * SHUBHAM OJHA PORTFOLIO - CELESTIAL ENGINE & APPLICATION LOGIC
 * Includes:
 * 1. Entrance animation driver (runs once, then cleans up)
 * 2. Planetary Switcher (Dual slot, zero-latency cut-out swap, video crossfade)
 * 3. Mobile Navigation Burger Controller
 * 4. Starfield Parallax Canvas (Restrained & lightweight)
 * 5. Dynamic Project Modal System
 * 6. Contact Email Clipboard Copy & Toast Feedback
 * 7. Active Scrollspy Landmark Observer
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. ENTRANCE ANIMATION DRIVER
     ========================================================================== */
  function initEntrance() {
    const root = document.documentElement;
    if (!root.classList.contains('anim')) return;

    let started = false;
    function startSequence() {
      if (started) return;
      started = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          root.classList.add('play');
          setTimeout(() => {
            root.classList.remove('anim', 'play');
          }, 2150);
        });
      });
    }

    // Font ready detection with 500ms safety guard
    if (document.fonts && document.fonts.ready) {
      const fontTimer = setTimeout(startSequence, 500);
      document.fonts.ready.then(() => {
        clearTimeout(fontTimer);
        startSequence();
      }).catch(startSequence);
    } else {
      setTimeout(startSequence, 100);
    }
  }

  /* ==========================================================================
     2. PLANETARY SWITCHER ENGINE
     ========================================================================== */
  const ORDER = ['earth', 'venus', 'mars'];

  const PLANET_DATA = {
    earth: {
      name: 'EARTH',
      eyebrow: 'BACKEND • AI INTEGRATION • FULL-STACK',
      lede: 'I build practical software systems, resilient backend APIs, and AI-powered applications.<br>Explore flagship project <strong>JANSAHAY</strong> or journey to planetary destinations.',
      still: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_508c64b8-a31e-4290-bdfc-1187df70e0a6.png',
      cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202005_3346cc4d-ec3b-44ab-825c-b18e49f5021a.png'
    },
    venus: {
      name: 'VENUS',
      eyebrow: 'DISTRIBUTED WORKFLOWS • EVENT BUSES',
      lede: 'High-throughput asynchronous job execution pipelines under continuous workload.<br>Architecting fault-tolerant message queues, rate limiters, and telemetry.',
      still: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_cf55d1d8-7b59-4a64-80da-d72052ae974e.png',
      cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202012_640b239a-d08a-4200-adb2-741bbe129ac8.png'
    },
    mars: {
      name: 'MARS',
      eyebrow: 'RAG PIPELINES • VECTOR RETRIEVAL • LLM',
      lede: 'Knowledge discovery engines with sub-second hybrid retrieval and verified citation grounding.<br>Transforming unstructured document corpora into actionable insights.',
      still: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202133_0ba6de7c-285d-43dc-b7ab-8c54c73707cb.png',
      cutout: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260827_202018_3d559490-f613-4ed7-a3bb-3b7e9fc90fb8.png'
    }
  };

  let currentPlanet = 'earth';
  const skyBackdrop = document.getElementById('sky-backdrop');
  const videos = Array.from(skyBackdrop.querySelectorAll('video'));
  const btnLeft = document.querySelector('.planet-l');
  const btnRight = document.querySelector('.planet-r');
  const labelLeft = document.getElementById('label-left');
  const labelRight = document.getElementById('label-right');
  const titleEl = document.getElementById('planet-title');
  const eyebrowEl = document.getElementById('hero-eyebrow');
  const ledeEl = document.getElementById('planet-lede');

  function warm(planetKey) {
    const video = videos.find(v => v.dataset.planet === planetKey);
    if (video && !video.getAttribute('src') && video.dataset.src) {
      video.setAttribute('preload', 'auto');
      video.src = video.dataset.src;
      video.load();
    }
  }

  function warmAllClips() {
    ORDER.forEach(p => warm(p));
  }

  function show(nextKey) {
    if (!PLANET_DATA[nextKey]) return;
    if (nextKey === currentPlanet && btnLeft.dataset.planet) return;

    currentPlanet = nextKey;
    const targetData = PLANET_DATA[nextKey];

    // 1. Crossfade Video Backdrops
    videos.forEach(v => {
      if (v.dataset.planet === nextKey) {
        if (!v.getAttribute('src') && v.dataset.src) {
          v.src = v.dataset.src;
        }
        v.classList.add('is-active');
        const playPromise = v.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } else {
        v.classList.remove('is-active');
        v.pause();
      }
    });

    // 2. Update Still Image for Fallback & prefers-reduced-motion
    skyBackdrop.style.backgroundImage = `url('${targetData.still}')`;

    // 3. Update Headline, Eyebrow & Lede
    if (titleEl) titleEl.textContent = targetData.name;
    if (eyebrowEl) eyebrowEl.textContent = targetData.eyebrow;
    if (ledeEl) ledeEl.innerHTML = targetData.lede;

    // 4. Update Left & Right Planet Slots (Instant Cut-out Swap)
    const rest = ORDER.filter(p => p !== nextKey);
    const leftKey = rest[0];
    const rightKey = rest[1];

    updateSlot(btnLeft, labelLeft, leftKey);
    updateSlot(btnRight, labelRight, rightKey);
  }

  function updateSlot(button, label, planetKey) {
    if (!button || !PLANET_DATA[planetKey]) return;
    button.dataset.planet = planetKey;
    button.setAttribute('aria-label', `Show ${PLANET_DATA[planetKey].name}`);

    // Toggle shown image without altering img.src to prevent download flash
    const imgs = button.querySelectorAll('img');
    imgs.forEach(img => {
      if (img.dataset.planet === planetKey) {
        img.classList.add('is-shown');
      } else {
        img.classList.remove('is-shown');
      }
    });

    if (label) {
      label.textContent = PLANET_DATA[planetKey].name;
    }
  }

  function initPlanetSwitcher() {
    [btnLeft, btnRight].forEach(btn => {
      if (!btn) return;
      btn.addEventListener('click', function () {
        const next = this.dataset.planet;
        if (next) {
          show(next);
          if (next === 'venus') {
            openVenusPopup();
          }
        }
      });
      btn.addEventListener('pointerenter', function () {
        const next = this.dataset.planet;
        if (next) warm(next);
      });
      btn.addEventListener('focus', function () {
        const next = this.dataset.planet;
        if (next) warm(next);
      });
    });

    // Also listen to any element with data-destination="venus"
    const venusTriggers = document.querySelectorAll('[data-destination="venus"]');
    venusTriggers.forEach(el => {
      el.addEventListener('click', (e) => {
        if (!e.target.closest('a') && !e.target.closest('button')) {
          openVenusPopup();
        }
      });
    });

    // Initialize with Earth
    show('earth');

    // Background warming of remaining planet videos
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(warmAllClips, { timeout: 4000 });
    } else {
      setTimeout(warmAllClips, 2500);
    }
  }

  /* ==========================================================================
     3. BURGER MENU CONTROLLER
     ========================================================================== */
  function initBurgerNav() {
    const navrow = document.querySelector('.navrow');
    const burger = document.querySelector('.burger');
    const siteNav = document.getElementById('site-nav');
    const navLinks = document.querySelectorAll('.nav-link, .links .enroll');

    if (!navrow || !burger) return;

    function setMenuOpen(open) {
      navrow.dataset.open = open ? 'true' : 'false';
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    }

    setMenuOpen(false);

    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navrow.dataset.open === 'true';
      setMenuOpen(!isOpen);
    });

    // Close on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        setMenuOpen(false);
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (navrow.dataset.open === 'true' && !siteNav.contains(e.target) && !burger.contains(e.target)) {
        setMenuOpen(false);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navrow.dataset.open === 'true') {
        setMenuOpen(false);
        burger.focus();
      }
    });

    // Sticky navbar blur on scroll
    const navbar = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ==========================================================================
     4. STARFIELD PARALLAX CANVAS
     ========================================================================== */
  function initStarfield() {
    const canvas = document.getElementById('starfield-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let width = 0;
    let height = 0;
    let stars = [];
    const STAR_COUNT = 140;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      createStars();
    }

    function createStars() {
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.2 + 0.3,
          alpha: Math.random() * 0.7 + 0.2,
          speed: Math.random() * 0.2 + 0.05,
          color: Math.random() > 0.85 ? '#79dce8' : (Math.random() > 0.75 ? '#ffeedd' : '#ffffff')
        });
      }
    }

    let scrollOffset = 0;
    window.addEventListener('scroll', () => {
      scrollOffset = window.scrollY * 0.15;
    }, { passive: true });

    function render() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const posY = (star.y - scrollOffset * star.speed) % height;
        const actualY = posY < 0 ? posY + height : posY;

        ctx.beginPath();
        ctx.arc(star.x, actualY, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.alpha;
        ctx.fill();
      }
      requestAnimationFrame(render);
    }

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(render);
  }

  /* ==========================================================================
     5. PROJECT DETAIL MODAL SYSTEM
     ========================================================================== */
  const PROJECTS_CONTENT = {
    jansahay: {
      title: 'JANSAHAY',
      subtitle: 'AI-Driven Welfare Scheme Matching Platform (Flagship)',
      problem: 'Citizens across varied socioeconomic backgrounds struggle to navigate thousands of fragmented government welfare schemes due to complex bureaucratic criteria, language barriers, and opaque documentation.',
      solution: 'Jansahay introduces an end-to-end intelligent recommendation pipeline. Users provide their profile or query in plain natural language (including multilingual support); our FastAPI backend leverages hybrid semantic retrieval (RAG) and structured eligibility logic to instantly identify applicable benefits.',
      features: [
        'Semantic Profile & Scheme Matching via Vector Embeddings',
        'Multi-attribute Eligibility Filtering (Age, Income, Occupation, Location)',
        'Conversational Q&A grounded with strict citation retrieval to prevent hallucinations',
        'High-performance FastAPI REST layer with optimized MySQL schema relational mapping',
        'Responsive, accessible user interface built in React'
      ],
      techStack: ['React', 'FastAPI', 'Python', 'LangChain', 'OpenAI / LLM APIs', 'ChromaDB', 'MySQL', 'Docker'],
      contribution: 'Designed and implemented the core FastAPI endpoints, RAG pipeline integration, document chunking and vector indexing algorithms, and MySQL relational queries.',
      github: 'https://github.com/ojha-shubham14/JanSahay',
      demo: 'https://ojha-shubham14.github.io/JanSahay/'
    },
    taskengine: {
      title: 'TASK ORCHESTRATOR',
      subtitle: 'High-Throughput Asynchronous Task & Event Pipeline',
      problem: 'External API calls and heavy data extraction processes often freeze user-facing web services or fail unexpectedly during bursts of traffic.',
      solution: 'Engineered a resilient distributed job pipeline using FastAPI and Redis Queues. Decouples request ingestion from job processing, provides automated rate-limiting to downstream vendors, and guarantees at-least-once task delivery.',
      features: [
        'Non-blocking async worker workers with Python AsyncIO and Redis',
        'Exponential backoff retry mechanisms with dead-letter queue isolation',
        'Structured telemetry logging and queue depth monitoring',
        'Secure token authentication and role-based endpoint isolation'
      ],
      techStack: ['FastAPI', 'Python', 'Redis', 'PostgreSQL', 'Docker', 'AsyncIO'],
      contribution: 'Architected queue topology, error recovery handlers, rate limiting middleware, and containerized deployment configuration.',
      github: 'https://github.com/ojha-shubham14',
      demo: '#'
    },
    docuquery: {
      title: 'DATA STRUCTURES & ALGORITHMS (DSA)',
      subtitle: 'Comprehensive Algorithmic Implementations & System Foundations',
      problem: 'Mastery of time & space complexity, advanced data structures, graph theory, and dynamic programming is fundamental to engineering reliable, low-latency software systems.',
      solution: 'A structured, production-tested repository of algorithmic implementations and problem solutions written in C++ and Python.',
      features: [
        'Advanced Data Structures (Segment Trees, Trie, Fenwick Trees, Disjoint Set Union)',
        'Graph Algorithms (Dijkstra, Bellman-Ford, Tarjan SCC, Topological Sort)',
        'Dynamic Programming & Optimization techniques',
        'Clean edge-case handling with verified test benchmarks'
      ],
      techStack: ['C++', 'Python', 'Data Structures', 'Algorithms', 'System Foundations'],
      contribution: 'Authored and documented categorized DSA solutions with time/space complexity derivations.',
      github: 'https://github.com/ojha-shubham14/DSA',
      demo: 'https://github.com/ojha-shubham14/DSA'
    }
  };

  function initProjectModal() {
    const modal = document.getElementById('project-modal');
    const modalContent = document.getElementById('modal-content');
    const closeBtn = document.getElementById('modal-close-btn');
    const openBtns = document.querySelectorAll('.open-modal-btn');
    let lastActiveElement = null;

    if (!modal || !modalContent || !closeBtn) return;

    function openModal(projectId) {
      const data = PROJECTS_CONTENT[projectId];
      if (!data) return;

      lastActiveElement = document.activeElement;

      const techBadgesHtml = data.techStack.map(t => `<span class="tech-tag">${t}</span>`).join(' ');
      const featuresHtml = data.features.map(f => `<li>${f}</li>`).join('');

      modalContent.innerHTML = `
        <span class="section-tag">PROJECT SPECIFICATION</span>
        <h3 id="modal-title">${data.title}</h3>
        <p class="modal-sub">${data.subtitle}</p>

        <div class="modal-section-title">The Challenge</div>
        <p>${data.problem}</p>

        <div class="modal-section-title">Engineering Solution</div>
        <p>${data.solution}</p>

        <div class="modal-section-title">Key Architectural Features</div>
        <ul>${featuresHtml}</ul>

        <div class="modal-section-title">My Contribution</div>
        <p>${data.contribution}</p>

        <div class="modal-section-title">Technology Stack</div>
        <div class="tech-stack-list" style="margin-bottom: 24px;">${techBadgesHtml}</div>

        <div class="card-actions" style="margin-top: 20px;">
          ${data.demo && data.demo !== '#' ? `<a href="${data.demo}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Live Demo &rarr;</a>` : ''}
          <a href="${data.github}" target="_blank" rel="noopener noreferrer" class="btn ${data.demo && data.demo !== '#' ? 'btn-outline' : 'btn-primary'}">
            View on GitHub &rarr;
          </a>
          <button type="button" class="btn btn-outline" id="modal-inner-close">Close</button>
        </div>
      `;

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      const innerClose = document.getElementById('modal-inner-close');
      if (innerClose) innerClose.addEventListener('click', closeModal);

      closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastActiveElement) lastActiveElement.focus();
    }

    openBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.project;
        if (id) openModal(id);
      });
    });

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  /* ==========================================================================
     6. EMAIL COPY & TOAST NOTIFICATION
     ========================================================================== */
  function initEmailCopy() {
    const copyBtn = document.getElementById('copy-email-btn');
    const toast = document.getElementById('toast');
    let toastTimeout = null;

    if (!copyBtn || !toast) return;

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add('show');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 2600);
    }

    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email || 'ojhashubhamprofessional@gmail.com';
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(email);
        } else {
          const textarea = document.createElement('textarea');
          textarea.value = email;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        showToast(`Email copied: ${email}`);
      } catch (err) {
        showToast(`Email: ${email}`);
      }
    });
  }

  /* ==========================================================================
     7. SCROLLSPY / ACTIVE NAV HIGHLIGHT
     ========================================================================== */
  function initScrollspy() {
    const sections = document.querySelectorAll('section[id], div[id="hero"]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.setAttribute('aria-current', 'page');
            } else {
              link.removeAttribute('aria-current');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px'
    });

    sections.forEach(sec => observer.observe(sec));
  }

  /* ==========================================================================
     8. VENUS SQUARE POPUP CONTROLLER
     ========================================================================== */
  function openVenusPopup() {
    const popup = document.getElementById('venus-popup');
    if (!popup) return;
    popup.classList.add('is-open');
    popup.setAttribute('aria-hidden', 'false');
    const closeBtn = document.getElementById('venus-close-btn');
    if (closeBtn) closeBtn.focus();
  }

  function closeVenusPopup() {
    const popup = document.getElementById('venus-popup');
    if (!popup) return;
    popup.classList.remove('is-open');
    popup.setAttribute('aria-hidden', 'true');
  }

  function initVenusPopup() {
    const popup = document.getElementById('venus-popup');
    const closeBtn = document.getElementById('venus-close-btn');
    if (!popup) return;

    if (closeBtn) {
      closeBtn.addEventListener('click', closeVenusPopup);
    }

    popup.addEventListener('click', (e) => {
      if (e.target === popup) closeVenusPopup();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popup.classList.contains('is-open')) {
        closeVenusPopup();
      }
    });
  }

  /* ==========================================================================
     INITIALIZATION ON DOM LOAD
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initEntrance();
    initPlanetSwitcher();
    initBurgerNav();
    initStarfield();
    initProjectModal();
    initVenusPopup();
    initEmailCopy();
    initScrollspy();
  });

})();
