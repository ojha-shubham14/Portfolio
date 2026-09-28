/**
 * CelestialBody Component
 * Represents a planet, moon, or planetary system (rings, clouds, atmosphere).
 * Handles axial rotation, orbital revolution, hitboxes, and hover states.
 */

import * as THREE from 'three';
import { TextureGenerator } from './TextureGenerator.js';

export class CelestialBody {
  constructor(config) {
    this.config = config;
    this.id = config.id;
    this.name = config.name;
    this.radius = config.radius;
    this.orbitRadius = config.orbitRadius;
    this.orbitSpeed = config.orbitSpeed;
    this.rotationSpeed = config.rotationSpeed;
    this.project = config.project;

    // Angle of orbit around the sun (randomized initial phase so planets don't line up in a line)
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.currentPosition = new THREE.Vector3();

    // Interaction states
    this.isHovered = false;
    this.isSelected = false;
    this.targetScale = 1.0;
    this.currentScale = 1.0;

    // Root container for this celestial body in world space
    this.group = new THREE.Group();
    this.group.name = `planet_${this.id}`;

    // Planet pivot for axial rotation
    this.planetMesh = null;
    this.cloudsMesh = null;
    this.ringsMesh = null;
    this.atmosphereMesh = null;
    this.moon = null;

    // Invisible expanded hit sphere for smooth, forgiving raycasting / touch interactions
    this.hitSphere = null;

    // Orbit path line
    this.orbitLine = null;

    this.init();
  }

  init() {
    // 1. Create realistic planet texture & material
    const texture = this.getPlanetTexture();
    const geometry = new THREE.SphereGeometry(this.radius, 48, 48);

    const material = new THREE.MeshStandardMaterial({
      color: this.config.color || 0xffffff,
      map: texture,
      roughness: this.id === 'earth' ? 0.45 : (this.id === 'venus' ? 0.75 : 0.8),
      metalness: 0.05,
      bumpScale: 0.05
    });

    this.planetMesh = new THREE.Mesh(geometry, material);
    this.planetMesh.castShadow = true;
    this.planetMesh.receiveShadow = true;
    this.group.add(this.planetMesh);

    // 2. Earth specific: Atmosphere clouds layer
    if (this.config.hasClouds) {
      const cloudTex = TextureGenerator.createEarthCloudsTexture(512, 256);
      const cloudGeo = new THREE.SphereGeometry(this.radius * 1.025, 48, 48);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.85,
        blending: THREE.NormalBlending,
        roughness: 0.9
      });
      this.cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
      this.group.add(this.cloudsMesh);
    }

    // 3. Subtle atmospheric rim glow
    if (this.config.hasAtmosphere) {
      const atmoGeo = new THREE.SphereGeometry(this.radius * 1.12, 32, 32);
      const atmoMat = new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          uniform vec3 color;
          void main() {
            float intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
            gl_FragColor = vec4(color, intensity * 0.45);
          }
        `,
        uniforms: {
          color: { value: new THREE.Color(this.config.atmosphereColor || this.config.color) }
        },
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true
      });
      this.atmosphereMesh = new THREE.Mesh(atmoGeo, atmoMat);
      this.group.add(this.atmosphereMesh);
    }

    // 4. Saturn Rings
    if (this.config.hasRings) {
      const inner = this.config.rings.innerRadius;
      const outer = this.config.rings.outerRadius;
      const ringGeo = new THREE.RingGeometry(inner, outer, 64);

      // Re-map RingGeometry UV coordinates for radial texture mapping
      const pos = ringGeo.attributes.position;
      const uvs = ringGeo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const dist = Math.sqrt(x * x + y * y);
        const u = (dist - inner) / (outer - inner);
        uvs.setXY(i, u, 0.5);
      }
      ringGeo.attributes.uv.needsUpdate = true;

      const ringTex = TextureGenerator.createSaturnRingTexture(512);
      const ringMat = new THREE.MeshStandardMaterial({
        map: ringTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        roughness: 0.6
      });

      this.ringsMesh = new THREE.Mesh(ringGeo, ringMat);
      // Tilt Saturn rings naturally (27 degrees tilt)
      this.ringsMesh.rotation.x = Math.PI * 0.5 + 0.42;
      this.ringsMesh.rotation.y = 0.15;
      this.group.add(this.ringsMesh);
    }

    // 5. Earth's Moon
    if (this.config.hasMoon && this.config.moon) {
      const moonCfg = this.config.moon;
      const moonTex = TextureGenerator.createMoonTexture(256, 128);
      const moonGeo = new THREE.SphereGeometry(moonCfg.radius, 24, 24);
      const moonMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        map: moonTex,
        roughness: 0.85,
        metalness: 0.05
      });

      this.moon = {
        mesh: new THREE.Mesh(moonGeo, moonMat),
        orbitRadius: moonCfg.orbitRadius,
        orbitSpeed: moonCfg.orbitSpeed,
        angle: Math.random() * Math.PI * 2
      };
      this.group.add(this.moon.mesh);
    }

    // 6. Invisible expanded hit sphere for smooth raycasting / tap responsiveness
    const hitRadius = Math.max(this.radius * 2.2, 3.2);
    const hitGeo = new THREE.SphereGeometry(hitRadius, 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({
      visible: false,
      transparent: true,
      opacity: 0.0
    });
    this.hitSphere = new THREE.Mesh(hitGeo, hitMat);
    this.hitSphere.userData = { planet: this };
    this.group.add(this.hitSphere);

    // 7. Orbit path visual line (subtle, low-opacity, realistic observatory aid)
    this.createOrbitLine();

    // Initial position update
    this.updatePosition();
  }

  getPlanetTexture() {
    switch (this.id) {
      case 'mercury': return TextureGenerator.createMercuryTexture();
      case 'venus': return TextureGenerator.createVenusTexture();
      case 'earth': return TextureGenerator.createEarthTexture();
      case 'mars': return TextureGenerator.createMarsTexture();
      case 'jupiter': return TextureGenerator.createJupiterTexture();
      case 'saturn': return TextureGenerator.createSaturnTexture();
      case 'uranus': return TextureGenerator.createUranusTexture();
      case 'neptune': return TextureGenerator.createNeptuneTexture();
      default: return TextureGenerator.createMercuryTexture();
    }
  }

  createOrbitLine() {
    const points = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(theta) * this.orbitRadius,
        0,
        Math.sin(theta) * this.orbitRadius
      ));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x7692b3,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    this.orbitLine = new THREE.Line(geometry, material);
    this.orbitLine.name = `orbit_${this.id}`;
  }

  setHover(hovered) {
    this.isHovered = hovered;
    this.targetScale = hovered ? 1.15 : (this.isSelected ? 1.1 : 1.0);

    if (this.orbitLine) {
      this.orbitLine.material.opacity = hovered ? 0.65 : (this.isSelected ? 0.45 : 0.25);
      this.orbitLine.material.color.setHex(hovered ? 0xd4af37 : (this.isSelected ? 0x64b5f6 : 0x7692b3));
    }

    if (this.planetMesh && this.planetMesh.material) {
      if (hovered) {
        this.planetMesh.material.emissive.setHex(0x33280c);
      } else {
        this.planetMesh.material.emissive.setHex(0x000000);
      }
    }
  }

  setSelected(selected) {
    this.isSelected = selected;
    this.setHover(this.isHovered);
  }

  update(delta, time, speedMultiplier = 1.0) {
    // 1. Orbital revolution around the sun
    this.orbitAngle += this.orbitSpeed * delta * speedMultiplier;
    this.updatePosition();

    // 2. Axial rotation
    if (this.planetMesh) {
      this.planetMesh.rotation.y += this.rotationSpeed * delta * 2.0;
    }

    // 3. Clouds movement on Earth
    if (this.cloudsMesh) {
      this.cloudsMesh.rotation.y += (this.rotationSpeed * 1.35) * delta * 2.0;
    }

    // 4. Moon orbit around Earth
    if (this.moon) {
      this.moon.angle += this.moon.orbitSpeed * delta * speedMultiplier;
      this.moon.mesh.position.set(
        Math.cos(this.moon.angle) * this.moon.orbitRadius,
        Math.sin(this.moon.angle * 0.5) * 0.35,
        Math.sin(this.moon.angle) * this.moon.orbitRadius
      );
      this.moon.mesh.rotation.y += 0.01;
    }

    // 5. Smooth scale lerp for hover
    this.currentScale += (this.targetScale - this.currentScale) * 0.1;
    this.planetMesh.scale.setScalar(this.currentScale);
    if (this.cloudsMesh) this.cloudsMesh.scale.setScalar(this.currentScale);
    if (this.atmosphereMesh) this.atmosphereMesh.scale.setScalar(this.currentScale);
  }

  updatePosition() {
    this.currentPosition.set(
      Math.cos(this.orbitAngle) * this.orbitRadius,
      0,
      Math.sin(this.orbitAngle) * this.orbitRadius
    );
    this.group.position.copy(this.currentPosition);
  }

  getWorldPosition() {
    const pos = new THREE.Vector3();
    this.planetMesh.getWorldPosition(pos);
    return pos;
  }
}
