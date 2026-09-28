/**
 * CameraDirector
 * Manages cinematic camera perspectives, observatory drift, and smooth planet inspection zooms.
 */

import * as THREE from 'three';

export class CameraDirector {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Observatory baseline coordinates (elevated, majestic distance)
    this.defaultPos = new THREE.Vector3(0, 72, 115);
    this.defaultLookAt = new THREE.Vector3(0, 0, 0);

    // Current camera targets
    this.targetPos = this.defaultPos.clone();
    this.targetLookAt = this.defaultLookAt.clone();
    this.currentLookAt = this.defaultLookAt.clone();

    // Mode: 'observatory' | 'inspecting'
    this.mode = 'observatory';
    this.activePlanet = null;

    // Subtle observatory parallax/drift variables
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.driftAngle = 0;

    // Transition progress tracking
    this.transitionSpeed = 0.055;

    this.setupParallaxListeners();
  }

  setupParallaxListeners() {
    window.addEventListener('mousemove', (e) => {
      // Normalized screen space (-1 to +1)
      this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });
  }

  inspectPlanet(planet) {
    this.mode = 'inspecting';
    this.activePlanet = planet;
  }

  returnToObservatory() {
    this.mode = 'observatory';
    this.activePlanet = null;
    this.targetPos.copy(this.defaultPos);
    this.targetLookAt.copy(this.defaultLookAt);
  }

  update(delta, time) {
    // Smooth mouse lerp
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.04;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.04;

    if (this.mode === 'observatory') {
      // Calm, slow drift in observatory space
      this.driftAngle += delta * 0.035;

      const driftX = Math.sin(this.driftAngle) * 6 + this.mouseX * 8;
      const driftY = 72 + Math.cos(this.driftAngle * 0.7) * 3 + this.mouseY * 6;
      const driftZ = 115 + Math.cos(this.driftAngle) * 6;

      this.targetPos.set(driftX, driftY, driftZ);
      this.targetLookAt.set(this.mouseX * 3, 0, this.mouseY * 3);

    } else if (this.mode === 'inspecting' && this.activePlanet) {
      // Follow selected planet closely and offset so it remains visible alongside the project panel
      const pPos = this.activePlanet.getWorldPosition();
      const radius = this.activePlanet.radius;

      // Position camera slightly offset to the side/top of the planet
      const viewDistance = Math.max(radius * 4.2, 7.5);
      
      // Calculate a stable vantage point relative to planet position and Sun
      const dirFromSun = pPos.clone().normalize();
      const perp = new THREE.Vector3(-dirFromSun.z, 0, dirFromSun.x).normalize();

      const offset = dirFromSun.clone().multiplyScalar(viewDistance * 0.8)
        .add(perp.clone().multiplyScalar(viewDistance * 0.7))
        .add(new THREE.Vector3(0, viewDistance * 0.45, 0));

      this.targetPos.copy(pPos).add(offset);
      this.targetLookAt.copy(pPos);
    }

    // Smooth exponential damping / lerp towards target camera position & look-at
    this.camera.position.lerp(this.targetPos, this.transitionSpeed);
    this.currentLookAt.lerp(this.targetLookAt, this.transitionSpeed);
    this.camera.lookAt(this.currentLookAt);
  }
}
