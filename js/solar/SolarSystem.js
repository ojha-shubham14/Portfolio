/**
 * SolarSystem Manager
 * Creates and updates the Sun, all 8 planets, Earth's Moon, Saturn's rings, and orbit lines.
 */

import * as THREE from 'three';
import { Sun } from './Sun.js';
import { CelestialBody } from './CelestialBody.js';
import { PLANETS_CONFIG } from '../data/projects.js';

export class SolarSystem {
  constructor(scene) {
    this.scene = scene;
    this.sun = null;
    this.planets = [];
    this.orbitLinesGroup = new THREE.Group();
    this.orbitLinesGroup.name = 'orbit_lines';
    this.planetsGroup = new THREE.Group();
    this.planetsGroup.name = 'planets_system';

    this.init();
  }

  init() {
    this.scene.add(this.orbitLinesGroup);
    this.scene.add(this.planetsGroup);

    // 1. Create Central Star (The Sun)
    this.sun = new Sun(5.2);
    this.scene.add(this.sun.group);

    // 2. Ambient starlight illumination (clean, neutral white fill light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    this.scene.add(ambientLight);

    // 3. Directional observatory fill light to illuminate front faces
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.45);
    dirLight.position.set(0, 80, 120);
    this.scene.add(dirLight);

    // 4. Create all 8 planets with their individual orbital configurations
    PLANETS_CONFIG.forEach(cfg => {
      const body = new CelestialBody(cfg);
      this.planets.push(body);
      this.planetsGroup.add(body.group);

      if (body.orbitLine) {
        this.orbitLinesGroup.add(body.orbitLine);
      }
    });
  }

  getPlanets() {
    return this.planets;
  }

  getPlanetById(id) {
    return this.planets.find(p => p.id === id);
  }

  getHitSpheres() {
    return this.planets.map(p => p.hitSphere).filter(Boolean);
  }

  update(delta, time, camera, speedMultiplier = 1.0) {
    // Update Sun surface rotation and corona billboard
    if (this.sun) {
      this.sun.update(delta, time, camera);
    }

    // Update all planets
    for (let i = 0; i < this.planets.length; i++) {
      this.planets[i].update(delta, time, speedMultiplier);
    }
  }
}
