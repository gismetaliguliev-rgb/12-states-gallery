/**
 * Lighting - Gallery lighting setup
 */

import * as THREE from 'three';

export class Lighting {
  constructor(settings) {
    this.settings = settings;
    this.group = new THREE.Group();

    this.createLighting();
  }

  createLighting() {
    // Ambient light - strong overall illumination
    const ambientIntensity = this.settings.ambientLight || 0.8;
    const ambient = new THREE.AmbientLight(0xffffff, ambientIntensity);
    this.group.add(ambient);

    // Hemisphere light - natural sky/ground gradient
    const hemiLight = new THREE.HemisphereLight(
      0xffffff, // sky color
      0x888888, // ground color
      0.6
    );
    hemiLight.position.set(0, 10, 0);
    this.group.add(hemiLight);

    // Directional light for better visibility
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(5, 10, 5);
    this.group.add(dirLight);

    // Main ceiling lights (simulating track lighting)
    this.createTrackLights();
  }

  createTrackLights() {
    const intensity = this.settings.spotlightIntensity || 1.2;

    // Create a row of ceiling lights
    const lightPositions = [
      { x: -5, z: -3 },
      { x: 0, z: -3 },
      { x: 5, z: -3 },
      { x: -5, z: 3 },
      { x: 0, z: 3 },
      { x: 5, z: 3 },
    ];

    lightPositions.forEach(pos => {
      // Point light for general illumination (no shadows to save texture units)
      const pointLight = new THREE.PointLight(0xfffaf0, intensity * 0.5, 10);
      pointLight.position.set(pos.x, 3.5, pos.z);
      pointLight.castShadow = false; // Disabled to avoid WebGL texture limit
      this.group.add(pointLight);

      // Light fixture visual (simple geometry)
      const fixtureGeometry = new THREE.CylinderGeometry(0.05, 0.1, 0.15, 8);
      const fixtureMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.3,
        metalness: 0.7
      });
      const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
      fixture.position.set(pos.x, 3.92, pos.z);
      this.group.add(fixture);
    });
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
