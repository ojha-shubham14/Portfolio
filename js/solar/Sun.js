/**
 * Realistic Central Star (The Sun)
 * Creates the luminous anchor of the solar system, central illumination, and delicate corona.
 * Not clickable as a project destination.
 */

import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

export class Sun {
  constructor(radius = 5.2) {
    this.radius = radius;
    this.group = new THREE.Group();
    this.group.name = 'sun_system';

    this.sunMesh = null;
    this.coronaMesh = null;
    this.light = null;

    this.init();
  }

  init() {
    // 1. Realistic Solar Surface (Convective plasma granules)
    const sunTex = TextureGenerator.createSunTexture(512, 256);
    const sunGeo = new THREE.SphereGeometry(this.radius, 48, 48);

    const sunMat = new THREE.MeshBasicMaterial({
      color: 0xffcc33,
      map: sunTex
    });

    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.group.add(this.sunMesh);

    // 2. Solar Corona (Realistic, soft outer atmospheric halo)
    const coronaTex = TextureGenerator.createSunCoronaTexture(512);
    const coronaGeo = new THREE.PlaneGeometry(this.radius * 5.8, this.radius * 5.8);
    const coronaMat = new THREE.MeshBasicMaterial({
      map: coronaTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    this.coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    this.group.add(this.coronaMesh);

    // 3. Central PointLight to illuminate the orbiting planets
    // distance = 0 & decay = 0 ensures light travels across all orbits without fading to black
    this.light = new THREE.PointLight(0xfff8ee, 3.5, 0, 0);
    this.light.position.set(0, 0, 0);
    this.group.add(this.light);
  }

  update(delta, time, camera) {
    // Subtle axial rotation of the solar surface
    if (this.sunMesh) {
      this.sunMesh.rotation.y += delta * 0.04;
    }

    // Billboard the corona plane towards the active camera
    if (this.coronaMesh && camera) {
      this.coronaMesh.quaternion.copy(camera.quaternion);

      // Subtle organic pulsing of the corona
      const pulse = 1.0 + Math.sin(time * 1.5) * 0.035;
      this.coronaMesh.scale.set(pulse, pulse, 1.0);
    }
  }
}
