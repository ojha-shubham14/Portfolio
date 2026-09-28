/**
 * SolarEngine
 * WebGL Scene Manager, Camera Controller, Starfield, Raycaster, and Interaction Dispatcher.
 */

import * as THREE from 'three';
import { SolarSystem } from './SolarSystem.js';
import { CameraDirector } from './CameraDirector.js';

export class SolarEngine {
  constructor(containerElement, tooltipElement, onPlanetSelect) {
    this.container = containerElement;
    this.tooltip = tooltipElement;
    this.onPlanetSelect = onPlanetSelect;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.solarSystem = null;
    this.cameraDirector = null;
    this.stars = null;

    // Raycaster & Pointers
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredPlanet = null;
    this.selectedPlanet = null;

    // Animation & Performance
    this.clock = new THREE.Clock();
    this.animationFrameId = null;
    this.orbitSpeedMultiplier = 1.0;

    // Reduced motion detection
    this.reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  init() {
    if (!this.isWebGLAvailable()) {
      this.container.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #94a3b8; font-family: monospace; text-align: center; padding: 20px;">
          <div>
            <h3 style="color: #d4af37; margin-bottom: 8px;">WebGL Hardware Acceleration Unavailable</h3>
            <p>Please enable hardware acceleration in your browser settings to explore the 3D Solar System.</p>
          </div>
        </div>
      `;
      return;
    }

    const width = Math.max(this.container.clientWidth || window.innerWidth || 800, 320);
    const height = Math.max(this.container.clientHeight || window.innerHeight || 600, 480);

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x02050b, 0.002);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    this.camera.position.set(0, 72, 115);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.domElement.id = 'solar-webgl-canvas';
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';

    this.container.appendChild(this.renderer.domElement);

    // 4. Background Starfield
    this.createStarfield();

    // 5. Solar System (Sun, 8 Planets, Moon, Rings, Orbit lines)
    this.solarSystem = new SolarSystem(this.scene);

    // 6. Camera Director
    this.cameraDirector = new CameraDirector(this.camera, this.renderer.domElement);

    // 7. Event Listeners
    this.setupListeners();

    // 8. Start Continuous Animation Loop
    this.animate();
  }

  createStarfield() {
    const starCount = 1800;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xdceaff),
      new THREE.Color(0xfff1dc),
      new THREE.Color(0x9fc5e8)
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 260 + Math.random() * 220;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.3,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  setupListeners() {
    window.addEventListener('resize', () => this.onResize(), { passive: true });

    // Pointer move for raycasting
    this.container.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: true });
    this.container.addEventListener('pointerleave', () => this.onPointerLeave(), { passive: true });

    // Click / Tap for planet selection
    this.container.addEventListener('click', (e) => this.onClick(e));
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = Math.max(this.container.clientWidth || window.innerWidth, 320);
    const height = Math.max(this.container.clientHeight || window.innerHeight, 480);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  }

  onPointerMove(e) {
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    this.mouse.x = (x / rect.width) * 2 - 1;
    this.mouse.y = -(y / rect.height) * 2 + 1;

    this.checkHover();
  }

  onPointerLeave() {
    this.mouse.set(-999, -999);
    if (this.hoveredPlanet) {
      this.hoveredPlanet.setHover(false);
      this.hoveredPlanet = null;
    }
    this.hideTooltip();
    this.container.style.cursor = 'default';
  }

  checkHover() {
    if (!this.solarSystem) return;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hitSpheres = this.solarSystem.getHitSpheres();
    const intersects = this.raycaster.intersectObjects(hitSpheres, false);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const planet = hit.object.userData.planet;

      if (this.hoveredPlanet !== planet) {
        if (this.hoveredPlanet) {
          this.hoveredPlanet.setHover(false);
        }
        this.hoveredPlanet = planet;
        this.hoveredPlanet.setHover(true);
        this.container.style.cursor = 'pointer';
      }

      this.showTooltip(planet);
    } else {
      if (this.hoveredPlanet) {
        this.hoveredPlanet.setHover(false);
        this.hoveredPlanet = null;
      }
      this.hideTooltip();
      this.container.style.cursor = 'default';
    }
  }

  onClick(e) {
    if (this.hoveredPlanet) {
      this.selectPlanet(this.hoveredPlanet);
    }
  }

  selectPlanetById(planetId) {
    if (!this.solarSystem) return;
    const planet = this.solarSystem.getPlanetById(planetId);
    if (planet) {
      this.selectPlanet(planet);
    }
  }

  selectPlanet(planet) {
    if (this.selectedPlanet) {
      this.selectedPlanet.setSelected(false);
    }

    this.selectedPlanet = planet;
    planet.setSelected(true);
    this.orbitSpeedMultiplier = 0.2; // Gracefully slow down orbits during inspection

    this.cameraDirector.inspectPlanet(planet);
    this.hideTooltip();

    if (this.onPlanetSelect) {
      this.onPlanetSelect(planet.project, planet);
    }
  }

  resetView() {
    if (this.selectedPlanet) {
      this.selectedPlanet.setSelected(false);
      this.selectedPlanet = null;
    }
    this.orbitSpeedMultiplier = 1.0;
    this.cameraDirector.returnToObservatory();
  }

  showTooltip(planet) {
    if (!this.tooltip) return;

    // Convert 3D world position to 2D screen coordinate
    const worldPos = planet.getWorldPosition();
    const screenPos = worldPos.clone().project(this.camera);

    const rect = this.container.getBoundingClientRect();
    const x = (screenPos.x * 0.5 + 0.5) * rect.width;
    const y = (-screenPos.y * 0.5 + 0.5) * rect.height;

    // If point is behind camera, don't show
    if (screenPos.z > 1.0) {
      this.hideTooltip();
      return;
    }

    const prj = planet.project;
    this.tooltip.innerHTML = `
      <div class="tooltip-badge">${planet.name.toUpperCase()}</div>
      <div class="tooltip-title">${prj.title}</div>
      <div class="tooltip-status ${prj.type === 'active' ? 'status-active' : 'status-slot'}">
        ${prj.status}
      </div>
      <div class="tooltip-action">Click to Explore &rarr;</div>
    `;

    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y - 18}px`;
    this.tooltip.classList.add('is-visible');
  }

  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.classList.remove('is-visible');
    }
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // 1. Update Celestial Bodies
    if (this.solarSystem) {
      const speed = this.reducedMotion ? 0.05 : this.orbitSpeedMultiplier;
      this.solarSystem.update(delta, time, this.camera, speed);
    }

    // 2. Update Camera Transitions
    if (this.cameraDirector) {
      this.cameraDirector.update(delta, time);
    }

    // 3. Keep Tooltip pinned if hovered planet moves
    if (this.hoveredPlanet && this.tooltip && this.tooltip.classList.contains('is-visible')) {
      this.showTooltip(this.hoveredPlanet);
    }

    // 4. Render Scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
