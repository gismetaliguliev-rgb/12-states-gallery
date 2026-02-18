/**
 * Room - Creates the gallery room geometry
 */

import * as THREE from 'three';

export class Room {
  constructor(config, settings) {
    this.config = config;
    this.settings = settings;
    this.id = config.id;
    this.group = new THREE.Group();

    this.createRoom();
  }

  createRoom() {
    const { width, height, depth } = this.config.dimensions;
    const wallColor = new THREE.Color(this.settings.wallColor || '#f5f5f5');
    const floorColor = new THREE.Color(this.settings.floorColor || '#2a2a2a');

    // Materials
    this.wallMaterial = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.DoubleSide
    });

    // Marble floor - matte gray with subtle texture
    this.floorMaterial = new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: 0.7,   // Matte, no reflections
      metalness: 0.0    // No metallic sheen
    });

    // Add marble-like texture using procedural bump
    this.addMarbleTexture();

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(width, depth);
    const floor = new THREE.Mesh(floorGeometry, this.floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Ceiling
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.9,
      metalness: 0.0
    });
    const ceiling = new THREE.Mesh(floorGeometry.clone(), ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = height;
    this.group.add(ceiling);

    // Walls - using planes for each wall to allow for openings later
    this.createWalls(width, height, depth);

    // Add subtle baseboard
    this.createBaseboard(width, depth);
  }

  createWalls(width, height, depth) {
    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    // North wall (back)
    const northWall = this.createWallPlane(width, height);
    northWall.position.set(0, height / 2, -halfDepth);
    this.group.add(northWall);

    // South wall (front)
    const southWall = this.createWallPlane(width, height);
    southWall.position.set(0, height / 2, halfDepth);
    southWall.rotation.y = Math.PI;
    this.group.add(southWall);

    // East wall (right)
    const eastWall = this.createWallPlane(depth, height);
    eastWall.position.set(halfWidth, height / 2, 0);
    eastWall.rotation.y = -Math.PI / 2;
    this.group.add(eastWall);

    // West wall (left)
    const westWall = this.createWallPlane(depth, height);
    westWall.position.set(-halfWidth, height / 2, 0);
    westWall.rotation.y = Math.PI / 2;
    this.group.add(westWall);
  }

  createWallPlane(width, height) {
    const geometry = new THREE.PlaneGeometry(width, height);
    const wall = new THREE.Mesh(geometry, this.wallMaterial.clone());
    wall.receiveShadow = true;
    return wall;
  }

  createBaseboard(width, depth) {
    const baseboardHeight = 0.1;
    const baseboardDepth = 0.02;

    const baseboardMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.7,
      metalness: 0.1
    });

    const halfWidth = width / 2;
    const halfDepth = depth / 2;

    // Create baseboards along each wall
    const createBaseboard = (w, x, z, rotY) => {
      const geometry = new THREE.BoxGeometry(w, baseboardHeight, baseboardDepth);
      const baseboard = new THREE.Mesh(geometry, baseboardMaterial);
      baseboard.position.set(x, baseboardHeight / 2, z);
      baseboard.rotation.y = rotY;
      return baseboard;
    };

    // North
    this.group.add(createBaseboard(width, 0, -halfDepth + baseboardDepth / 2, 0));
    // South
    this.group.add(createBaseboard(width, 0, halfDepth - baseboardDepth / 2, 0));
    // East
    this.group.add(createBaseboard(depth, halfWidth - baseboardDepth / 2, 0, Math.PI / 2));
    // West
    this.group.add(createBaseboard(depth, -halfWidth + baseboardDepth / 2, 0, Math.PI / 2));
  }

  addMarbleTexture() {
    // Create a canvas-based marble texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base gray color
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(0, 0, 512, 512);

    // Add marble veins
    ctx.strokeStyle = 'rgba(80, 80, 80, 0.3)';
    ctx.lineWidth = 2;

    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = Math.random() * 512;
      ctx.moveTo(x, y);

      for (let j = 0; j < 5; j++) {
        x += (Math.random() - 0.5) * 100;
        y += (Math.random() - 0.5) * 100;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Add lighter veins
    ctx.strokeStyle = 'rgba(90, 90, 90, 0.4)';
    ctx.lineWidth = 1;

    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      let x = Math.random() * 512;
      let y = Math.random() * 512;
      ctx.moveTo(x, y);

      for (let j = 0; j < 3; j++) {
        x += (Math.random() - 0.5) * 60;
        y += (Math.random() - 0.5) * 60;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);

    this.floorMaterial.map = texture;
    this.floorMaterial.needsUpdate = true;
  }

  dispose() {
    this.group.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
